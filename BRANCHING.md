# Branching & Release Strategy

Full rationale is in the TDD, section 3.2. This doc is the operational how-to.

## Branches

| Branch | Purpose | Lifetime | Cut from |
|---|---|---|---|
| `main` | Production. Always deployable. | Permanent | - |
| `staging` | Pre-prod / client UAT. | Permanent | - |
| `qa` | Internal QA / regression sign-off. | Permanent | - |
| `develop` | Integration branch for in-flight work. | Permanent | - |
| `feature/*` | New work. | Short-lived | `develop` |
| `fix/<date>/<ticket>` | Ordinary bug fix, ships with the next release. | Short-lived | `develop` |
| `release/x.y.z` | A frozen candidate promoted through qa and staging to production. | Per release | `develop` |
| `hotfix/<date>/<ticket>` | Production emergency only. | Per incident | `main` |

### Naming convention for `fix/*` and `hotfix/*`

`fix/<date>/<ticket>` and `hotfix/<date>/<ticket>` — e.g. `fix/2026-09-09/GB-42`,
`hotfix/2026-09-09/GB-42`. The date is when the branch was cut, the ticket is the Jira
issue it fixes. Both are already per-ticket, so this gives faster traceability back to
Jira than a free-text description, and the branch name no longer has to guess the
eventual version bump - a hotfix's version is decided at tag time
(`git tag -a v1.1.1 ...`), not when the branch is cut.

`release/*` keeps `release/x.y.z` (e.g. `release/1.1.0`). A release isn't tied to a
single ticket - it bundles everything merged into `develop` since the last cut - and
the version number is the identity the rest of this doc, the promotion PR titles and
the eventual tag are all built around. Swapping it for a date/ticket would remove the
one piece of information that actually matters for a release branch.

```
                        ┌── feature/* ──┐
                        │               ↓
  develop ──────────────┴──────────────────────────────────────────
     │                                          ↑ back-merge
     └── release/1.1.0 ──┬──→ qa                │  (QA + UAT fixes)
                         │                      │
                         ├──→ staging           │
                         │                      │
                         └──→ main  ────────────┘
                              │
                              └── tag v1.1.0
```

`qa`, `staging` and `main` are **all fed from the release branch**, in that order, each
promotion gated on the previous environment going green. They are never merged into each
other - they are disposable environment branches that accumulate demo merges and debug
tweaks over time, and none of that belongs in production. Promoting the release branch
to `main` ships exactly the ref that passed QA and UAT.

`qa` and `staging` differ only in audience and gate: `qa` is the internal QA team's
functional and regression pass, `staging` is the client's UAT. Nothing reaches `staging`
until QA has signed off, so the client never sees a build QA has not cleared. Keeping
the audiences apart is the entire point of the second environment - collapse them and
you have one branch with two owners and no gate.

## Merge methods

One rule, and it matters:

| Moving from | Into | Method |
|---|---|---|
| `feature/*`, `fix/*` | `develop` | **Squash** |
| `fix/*` | `release/x.y.z` | **Squash** |
| `release/*`, `hotfix/*` | `qa`, `staging`, `main`, `develop` | **Merge commit** |

Squashing a long-lived branch into another long-lived branch creates a commit that
shares no ancestry with the source. Git's merge base for the *next* promotion is then
still the point where the two branches last diverged, so every subsequent promotion PR
tries to re-apply the whole previous release on top of content that already has it -
conflicts on every file, on every release, forever. Merge commits keep the ancestry
intact and the problem never arises.

This is why `Require linear history` is **off** on `main`, `staging`, `qa` and
`develop`, and why `Merge commit` is an allowed merge method on all four.

## Repository rulesets (one-time, repo admin)

Configured under **Settings → Rules → Rulesets**. Three rulesets cover everything.
Rulesets stack: if a branch matches two, it gets the union and the stricter value wins.

- `release-branches` - targets `main`, `staging` and `qa`
- `integration-branch` - targets `develop`
- `version-tags` - targets tag pattern `v*`

| Rule | `main` + `staging` + `qa` | `develop` |
|---|---|---|
| Restrict creations | off | off |
| Restrict updates | **off** | **off** |
| Restrict deletions | on | on |
| Require linear history | off | off |
| Require deployments to succeed | off | off |
| Require signed commits | on | on |
| Require a pull request before merging | on | on |
| → Required approvals | 1 | 1 |
| → Dismiss stale approvals | on | on |
| → Require review from specific teams | off | off |
| → Require review from Code Owners | off *(see below)* | off |
| → Approval of most recent reviewable push | on | off |
| → Require conversation resolution | on | on |
| → Copilot unattributed approval | off | off |
| → Allowed merge methods | Squash + Merge commit | Squash + Merge commit |
| Require status checks to pass | on | on |
| → `web / lint, typecheck, test` | required | required |
| → `Build` | required | required |
| → Require branches to be up to date | on *(see below)* | off |
| Block force pushes | on | on |
| Require code scanning results | off | off |
| Require code quality results | off | off |
| Restrict code coverage | off | off |

`version-tags` needs only three: **Restrict creations off** (you have to be able to cut
a tag), **Restrict updates on**, **Restrict deletions on**. A published tag can then
never be moved or deleted, which is what makes `v1.1.0` mean something.

### Notes on specific rules

**`Restrict updates` must stay off on branches.** Merging a PR is an update to the
target ref, so enabling it blocks every merge for anyone not on the bypass list. It is
a tag rule, not a branch rule.

**`Require approval of the most recent reviewable push`** is stricter than
dismiss-stale. Dismiss-stale forces re-approval after any new push; this rule
additionally requires the approval come from someone other than whoever pushed last. It
stops a reviewer pushing a fix into someone else's PR and then approving their own
code. On `develop` the friction outweighs the benefit.

**`Require branches to be up to date`** is off on `develop` because every merge would
invalidate every other open PR and re-run the full `web-checks → build` chain.
On `main` and `staging`, where merges are rare and deliberate, it is free. `qa` sees
more traffic than either during a stabilisation cycle - if re-promotion after every QA
fix starts costing more than it catches, `qa` is the one branch to pull out of
`release-branches` into its own ruleset with this rule off.

**`Require signed commits`** mostly catches direct pushes, which the PR rule already
blocks - squash and merge commits created in the GitHub UI are signed by GitHub's own
key. Keep it on anyway; it is also why `Rebase merge` is not an allowed method, since a
rebase replays your original commits and unsigned ones would be rejected.

**Code Owners is off for now.** `.github/CODEOWNERS` currently names a single owner for
`*`, which would deadlock that person's own PRs - GitHub does not let an author satisfy
their own code-owner review - and auto-requests them on every change. Trim it to the
security-sensitive paths with at least two owners each before turning the rule on.

**Status check names must exactly match the job `name:` fields in
`.github/workflows/ci.yml`.** If a job name changes, update the ruleset too, or the
required check shows as "Expected" forever and blocks every PR. The ruleset picker also
only lists checks GitHub has actually seen run, so open one PR into `develop` before
creating the ruleset and let CI report once.

**Bypass lists are empty.** See [Break-glass](#break-glass) below.

## Daily flow: feature → develop

```bash
git checkout develop && git pull
git checkout -b feature/receipt-capture
# ... work ...
git commit -m "feat(receipts): add capture screen"
git push -u origin feature/receipt-capture
gh pr create --base develop --fill
```

`feature/*` and `fix/*` have no ruleset - force-push, rebase and amend freely while the
branch is yours. On the PR: both checks, a Vercel preview, one approval, all
conversations resolved. Then **Squash and merge** and delete the branch.

GitHub uses the **PR title** as the squash commit message. The husky `commit-msg` hook
lints local commits via commitlint, but nothing lints PR titles - keep them
conventional (`feat(scope): ...`) or `develop` ends up with non-conforming history.

Merging to `develop` triggers CI again. The Playwright E2E job that would also run here
(TDD section 4.1 - on merges into `develop`, `qa` and `staging`, never on PRs) is
currently removed from `ci.yml` - see [Known gaps](#known-gaps).

## Release flow

### 1. Cut the release

```bash
git checkout develop && git pull
git checkout -b release/1.1.0
git push -u origin release/1.1.0
```

`develop` is now free to carry on with 1.2.0 work. The release branch is frozen except
for QA and UAT fixes.

### 2. Promote to qa for internal QA

```bash
gh pr create --base qa --head release/1.1.0 --title "chore: promote 1.1.0 to qa"
```

Merge commit. The push to `qa` deploys to the QA Vercel environment, where the QA team
runs its functional and regression pass against QA data - not against the client's UAT
data. Automated E2E is meant to run here too and is the first thing to restore once the
Playwright job is fixed; until then this gate is entirely manual.

### 3. QA and UAT bugs

Fixes go on the **release branch** - never on `qa`, never on `staging`, never on
`develop`. The rule is the same wherever the bug was found.

```bash
git checkout release/1.1.0 && git pull
git checkout -b fix/2026-09-09/GB-42
# ... fix ...
git push -u origin fix/2026-09-09/GB-42
gh pr create --base release/1.1.0 --fill
```

Squash into the release branch, then re-promote and re-test. Repeat until the gate is
clean. A fix found during UAT re-promotes to `qa` first and then `staging`, so the two
environments never drift apart on which ref they are showing.

Why not fix on `qa` or `staging`: `main` is fed from the release branch, so a fix
committed to an environment branch would never reach production - you would ship the bug
with a green sign-off behind it.

Why not fix on `develop`: by now `develop` contains 1.2.0 work, and merging it into the
release would drag unfinished features into a build the client already signed off on.

The version stays **1.1.0** through QA and UAT both. Pre-release bugs are caught before
the release ships, so nothing is patched - 1.1.0 simply never reached production until
it was correct.

### 4. Promote to staging for UAT

Only once QA has signed off.

```bash
gh pr create --base staging --head release/1.1.0 --title "chore: promote 1.1.0 to staging"
```

Merge commit, and the same ref that passed QA. Deploys to the staging Vercel environment
for client sign-off. UAT bugs go back through step 3.

### 5. Ship and tag

```bash
gh pr create --base main --head release/1.1.0 --title "chore: release 1.1.0"
# after merge:
git checkout main && git pull
git tag -a v1.1.0 -m "Release 1.1.0"
git push origin v1.1.0
```

### 6. Back-merge, then delete the release branch

Required whenever QA or UAT fixes were made:

```bash
gh pr create --base develop --head release/1.1.0 --title "chore: back-merge 1.1.0 fixes"
```

Merge commit. Skip this and the next release silently reintroduces every bug you just
fixed.

This does **not** overwrite the 1.2.0 work already on `develop`. Git merges the changes
each side made since the common ancestor, not whole snapshots - files the release
branch never touched contribute nothing. To see exactly what a back-merge would change
before opening the PR:

```bash
git checkout develop && git pull
git merge --no-commit --no-ff release/1.1.0
git diff --cached --stat
git merge --abort
```

A conflict only arises if both sides changed the same lines, in which case a human
decides whether the fix still applies to the refactored code.

## Hotfix flow

For a bug **already in production** that cannot wait for the next release: money moving
wrong, data leaking, a security hole, or the app down. Everything else is a `fix/*`
branch off `develop` that ships with the next release.

Cut from `main`, because `develop` contains unshipped work.

```bash
git checkout main && git pull
git checkout -b hotfix/2026-09-09/GB-42
# ... fix ...
git push -u origin hotfix/2026-09-09/GB-42

gh pr create --base qa   --head hotfix/2026-09-09/GB-42 --fill   # verify
gh pr create --base main --head hotfix/2026-09-09/GB-42 --fill   # ship
```

Same pattern as a release: every target fed from the hotfix branch, never
`qa → staging → main`.

Verify through `qa` rather than `staging` when you can afford the ten minutes - it does
not put a half-verified incident fix in front of the client mid-UAT. With the E2E job
currently out of `ci.yml`, *every* route to `main` ships on unit tests and a build with
no browser coverage at all, so that manual pass carries more weight than it used to. If
production is actively bleeding, go direct and accept that.

Then tag and fan out to **every** live line:

```bash
git checkout main && git pull
git tag -a v1.1.1 -m "Hotfix 1.1.1" && git push origin v1.1.1

gh pr create --base develop --head hotfix/2026-09-09/GB-42 --fill
gh pr create --base qa      --head hotfix/2026-09-09/GB-42 --fill   # if skipped earlier
gh pr create --base staging --head hotfix/2026-09-09/GB-42 --fill
```

Three environment branches now, not two. Miss `qa` and the QA team re-reports the bug on
the next release; miss `staging` and the client does.

If a `release/*` branch is open in QA or UAT at the time, **merge the hotfix into it
too**.
Merging that release into `main` later will not silently revert the fix - git keeps
main's side of the change - but until you do, the client is signing off on a build that
does not contain it.

## Versioning

| Situation | Version |
|---|---|
| New features from `develop` | minor bump - `1.1.0` → `1.2.0` |
| Bug found in QA or UAT, before release | no bump - still `1.1.0` |
| Bug found in production | patch bump - `1.1.0` → `1.1.1` |

Tags are created on `main` only, after the merge, and are immutable under the
`version-tags` ruleset.

## Break-glass

Bypass lists are empty on all rulesets. During a production incident that means a
hotfix to `main` still needs three green checks plus an approval from someone other
than the pusher.

With three people that is usually fine. If an incident ever stalls on it, the fix is to
add the repo admin as a bypass actor on `release-branches` - but note that bypass is
per-ruleset and all-or-nothing: it lifts *every* rule for that actor, not just
approvals. Every use is logged under **Settings → Rules → Rule insights**, so the
discipline is to bypass, ship, then open a retro PR for the review that did not happen.

## Team responsibilities

| Who | Works in | Merges to |
|---|---|---|
| Junior | `feature/*`, `fix/*` | `develop` only |
| QA | the `qa` environment - no commits | nothing |
| Lead / architect | all | `develop`, `release/*`, `qa`, `staging`, `main`, tags |

Release cuts, promotion PRs, tags and hotfixes stay with the lead and architect. The
approval rules enforce this in practice: nobody can approve their own PR, and on
`main`/`staging` nobody can approve a PR they were the last to push to.

## Required repo secrets/vars

Set at the repo or environment level (Settings → Secrets and variables → Actions):

| Name | Scope | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Repo | build job - optional, falls back to a placeholder |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Repo | build job - optional, falls back to a placeholder |
| `PREVIEW_URL` (var, not secret) | Repo | not yet - see Known gaps |
| `SONAR_TOKEN` | Repo | not yet - see Known gaps |

**No Supabase value is required for CI to pass.** `next build` evaluates every page
module, and both `lib/config/env.ts` and `lib/config/serverEnv.ts` validate at
module load, so the variables have to *exist* - but the build never connects,
because every route is dynamic. `ci.yml` falls back to placeholders when the
secrets are unset, and `SUPABASE_SERVICE_ROLE_KEY` is always a placeholder:
putting a real service-role key in CI would expose it to every workflow run,
including PR builds, for no benefit. Real values come from the runtime
environment (Vercel), not from CI.

When this does go wrong it fails badly. Next reports `Failed to collect page data
for <some page>` and **the page it names varies between runs**, so it is not a
clue. The real reason is on the `[cause]` line immediately above it in the log.

Production-only secrets (service role key, wallet certs, payout keys) should go in a
GitHub **Environment** named `production` scoped to `main`, not repo-level, so a PR
from a fork can never read them - see TDD section 6.3.

## Vercel

`apps/web` deploys via Vercel's native GitHub integration (not a GitHub Actions
step) - connect the repo in the Vercel dashboard, set the root directory to
`apps/web`, and Vercel will auto-preview every PR and promote on merge to
`qa`/`staging`/`main`. Vercel's own build still respects the required-status-checks
gate on the branch, so a failed quality gate blocks the merge that would trigger the
Vercel deploy in the first place.

`qa` needs its own branch deployment with its own environment variables, pointed at a
QA Supabase project. Sharing staging's project would put QA's destructive test data in
front of the client mid-UAT, which is the one thing a separate QA environment exists to
prevent.

## Known gaps

- **SonarCloud is not wired up.** The `quality-gate` job has been removed from
  `ci.yml` until a SonarCloud organization exists; `Build` currently runs straight off
  `web-checks`. The restore checklist is in the comment above the `build` job, and
  `sonar-project.properties` is kept in the repo ready for it. Until then there are two
  required status checks, not three.