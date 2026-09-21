# Coding Standards

How to write the code once you know where it goes.

| Question | Doc |
|---|---|
| Which folder? Which Supabase client? | `ARCHITECTURE.md` |
| How do I name and shape the file? | **this doc** |
| Commit format, branches, releases | `CONTRIBUTING.md`, `BRANCHING.md` |

---

## 1. Naming

Copy the patterns already in the codebase.

| Kind | Pattern | Examples |
|---|---|---|
| Component file | `PascalCase.tsx` | `AgeGateForm.tsx` |
| Every other file | `camelCase.ts` | `serverEnv.ts` |
| Server Action | `<verb>Action` | `confirmAgeAction` |
| Zod schema | `<Noun>Schema` | `OtpSchema` |
| Read (`queries.ts`) | `find*` / `get*` / `list*` | `findAccountByUserId` |
| Write (`service.ts`) | a verb | `createAccount` |
| Rule (`rules.ts`) | reads as a question | `isOldEnough`, `hasRequiredConsents` |
| Guard | `require*` | `requireStep` |
| Constant | `SCREAMING_SNAKE` | `MINIMUM_PAYOUT_CENTS` |

Three habits that prevent most naming review comments:

- **Booleans are questions**: `hasAccount`, `isComplete`. Not `flag` or `status`.
- **Units in the name**: `amountCents`, `timeoutMs`. A bare `amount` is how
  dollars end up in a cents column.
- **No filler nouns**: `data`, `info`, `temp`, `handler`, `manager`. If that is
  the best name you have, the function does too much.

---

## 2. Writing a function

**Handle the exits first, then the happy path.**

```ts
export function payoutRefusal(availableCents: number, amountCents: number): PayoutRefusal | null {
  if (amountCents <= 0) return "not_positive";
  if (amountCents < MINIMUM_PAYOUT_CENTS) return "below_minimum";
  if (amountCents > availableCents) return "insufficient_balance";
  return null;
}
```

Three levels of indentation means something in there wants to be its own function.

**Return the reason, not just `false`.** A boolean makes the caller work out why
again. Return the reason, or `null` when there isn't one.

**Services go: read, decide, refuse, write.** `modules/accounts/service.ts` is the
model. Never write before you have decided.

**Keep `queries.ts` and `service.ts` dumb.** The moment one grows an `if` about
what something *means*, that `if` belongs in `rules.ts` - where it is tested
against values instead of a database.

**Pass in what varies** - the Supabase client, the provider, the current time.
`isOldEnough(dob, now = new Date())` is testable at any date.

**Size:** no line limit. If you can't name it without "and", it's two functions.

---

## 3. TypeScript

- **No `any`** - it's a lint error. Use `unknown` and parse it with Zod.
- **No `!`** outside tests. It's a promise to the compiler you can't keep.
- **No `as` casts** to silence an error - narrow it or fix the type.
- **Named exports only**, except `page.tsx` / `layout.tsx` / `manifest.ts`.

---

## 4. Tests

Tests sit next to the code: `modules/payouts/rules.test.ts`.

- **Name the behaviour**: `"refuses an amount larger than the balance"`. Read
  `it(...)` as a sentence.
- **Every new rule gets a test in the same PR.**
- **Use a fixture builder** so each test shows only the field it cares about.
- **No mocking library** - pass a stub in. That's what the client and provider
  parameters are for.
- **Assert the negative too.** `expect(provider.calls).toHaveLength(0)` proves you
  refused before spending a network call.

---

## 5. Logging and secrets

```ts
logger.info("otp_send_failed", { status: 429 });   // ✅ event name + scalars
logger.info(`OTP failed for ${phone}`);            // ❌ prose, and it leaks
```

Never log a phone number, date of birth, token, whole row, or provider response
body. `console` is a lint error - `logger` is the one caller.

Secrets go in `serverEnv.ts`. Anything in `env.ts` ships to the browser.

---

## 6. Traps in this codebase

- **Check every `Result`.** Two calls in `actions.ts` currently ignore `.ok` -
  safe only because those services declare `E = never`. Copy that onto a service
  with real errors and you drop failures silently.
- **Never `try/catch` a Server Action body.** `redirect()` throws by design; a
  catch-all swallows the navigation and the user sits on a dead form.
- **Two `createClient` exports.** `infra/supabase/client.ts` is the browser one,
  `server.ts` is the session one. The wrong import silently loses the session.
- **`admin.ts` bypasses RLS.** No `.eq("account_id", accountId)` means you get
  every user's rows - and that id comes from the session, never from a form.
- **`Button` concatenates `className`, it doesn't merge.** Passing `bg-white`
  gives two conflicting backgrounds.
- **No data-fetching hooks.** No `useAccount()`. The Server Component fetches -
  `ARCHITECTURE.md` §6.

---

## 7. Before you open a PR

1. `pnpm lint && pnpm typecheck && pnpm test:coverage` - green locally.
2. **Read your own diff.** Most review comments are things you'd have caught.
3. New rule? It has a test.
4. No `console`, commented-out code, or secrets - fixtures included.
5. One thing per PR. A rename plus a behaviour change is unreviewable.

---

## 8. What a good PR looks like

The title is a Conventional Commit - squash merges make it the permanent commit
message, so it has to stand alone:

```
feat(payouts): refuse cash-out below the minimum
fix(auth): handle expired OTP codes
```

The description says **why**, and how you know it works:

```markdown
## What & why
Cash-out let users request any amount, so a 5c payout cost us more in provider
fees than it moved. Adds a minimum and refuses below it.

## How it works
The rule is in `modules/payouts/rules.ts` so it is testable without a provider.
The action maps the refusal to copy.

## Testing
- Unit tests cover all three refusal reasons.
- Manually: requested $0.05 and saw the error, $15.00 went through.
```

Keep it small. If the diff is over ~400 lines, ask whether it's really one thing.

**Reviewing one?** Don't comment on anything the linter enforces. Check the
things tools can't: is it in the right layer, is the name honest, is the failure
path handled. Mark a nit as **nit:** and mean it. Approving means you think it's
correct, not that you skimmed it.
