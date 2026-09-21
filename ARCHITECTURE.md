# Code Architecture

How this app is put together, and where your code goes.

**New here? Read §1-§4, then the worked example in §16.** That is enough to build
your first screen. The rest is reference - come back to it when you hit the thing
it describes.

The onboarding flow is the reference implementation. When in doubt, copy it.

---

## 1. The shape of the app

| Component | Runs on | Responsibility |
|---|---|---|
| Next.js 15 (App Router) | Vercel | PWA, all business logic |
| Supabase | Supabase | Postgres, auth, storage, realtime |

One app, one database. Four top-level folders inside `apps/web`, and the whole
architecture is the rule about what goes in each:

```
app/        SCREENS AND ENDPOINTS    routing, forms, HTTP. Thin.
modules/    DOMAIN LOGIC             one folder per business capability
infra/      TECHNICAL PLUMBING       Supabase, providers, config, logging
shared/     GENERIC BUILDING BLOCKS  UI primitives, Result type, browser hooks
```

> **`app/` is screens. `modules/` is logic. `infra/` is plumbing.**
> Everything else in this document follows from that.

The arrow only points one way:

```
app/  ──▶  modules/  ──▶  infra/ | shared/
```

`modules/` may never import from `app/`. If you find yourself wanting to, the
logic is in the wrong place.

### The full tree

```
apps/web/
  middleware.ts                   session refresh only

  app/
    (auth)/onboarding/            age gate -> phone -> verify -> profile -> consent -> done
    (app)/home/                   the screen after onboarding
    api/
      webhooks/<provider>/        external callers only
      cron/<job>/
    layout.tsx

  modules/
    auth/                         session, OTP send/verify
    accounts/                     the account record
    consent/                      policy capture and versioning
    onboarding/                   the step machine   <- reference implementation
    payouts/                      cash-out          <- reference port/adapter

  infra/
    supabase/                     client.ts / server.ts / admin.ts
    providers/                    third-party adapters
    config/                       env.ts (public) / serverEnv.ts (secrets)
    observability/                logger.ts

  shared/
    ui/                           Button, Field, FormMessage, PointsBadge
    result.ts                     Result type, AppError
    hooks/                        browser-only hooks

  e2e/                            Playwright
```

`(auth)` and `(app)` are route groups - they share chrome without adding a URL
segment, so `app/(app)/home/page.tsx` serves `/home`.

Adding a capability means a folder under `modules/`, a migration in
`supabase/migrations/`, and a test beside the code. Nothing else in the tree moves.

---

## 2. How a request flows

Two entry paths into your logic, and one for outsiders.

```
                            BROWSER
                               │
            ┌──────────────────┴──────────────────┐
            │ navigate                            │ submit a form
            ▼                                     ▼
    app/(app)/home/page.tsx            _components/PayoutForm.tsx  "use client"
    Server Component                             │  useActionState
            │                                     ▼
            │                          app/(app)/payouts/actions.ts  "use server"
            │                                     │
            │ read                                │ write
            ▼                                     ▼
    modules/<d>/queries.ts                modules/<d>/service.ts
            │        │                            │        │
            │        └──▶ modules/<d>/rules.ts ◀──┘        └──▶ modules/<d>/port.ts
            │              pure decisions                            │
            ▼                                     ▼                  ▼
       infra/supabase/                     infra/supabase/    infra/providers/<vendor>/
            │                                     │                  │
            ▼                                     ▼                  ▼
         Supabase                             Supabase          Aeropay, Twilio...


    EXTERNAL SYSTEM (no browser, no session)
    Aeropay ──POST──▶ app/api/webhooks/aeropay/route.ts ──▶ modules/<d>/service.ts
```

Three things to take from this:

- **Reads need no endpoint.** A Server Component calls `queries.ts` directly.
  There is no `/api/balance` and no fetch.
- **Writes go through a Server Action.** It is the endpoint, and Next.js builds
  the network call for you.
- **The same service serves both doors.** That is why business logic lives in
  `modules/` and not inside `actions.ts`.

---

## 3. Where does my code go?

Find your case, use that layer.

| What you're building | Where it goes |
|---|---|
| Reading data for a screen | Server Component calls `modules/<d>/queries.ts` |
| A form in our own UI that writes | **Server Action** in `app/<route>/actions.ts` |
| An external system calling us | **Route Handler** in `app/api/<name>/route.ts` |
| A scheduled job | Route Handler in `app/api/cron/<name>/` |
| A rule that needs no database | Pure function in `modules/<d>/rules.ts` |
| A call to a third party | A port in `modules/<d>/port.ts`, adapter in `infra/providers/` |
| Something drawn on screen | `app/<route>/_components/`, or `shared/ui/` if reused |

**Server Actions are the default for writes.** Route Handlers exist for callers we
do not control: provider webhooks, third-party callbacks, cron. If our own React
form is the caller, use an Action - there is no URL to secure, no fetch to write,
and no JSON contract to keep in sync.

---

## 4. Anatomy of a module

Every module uses the same file names. Open any two and they look alike.

```
modules/<domain>/
  index.ts      the public surface - the only file other modules may import
  types.ts      the nouns.          no infrastructure imports
  rules.ts      the decisions.      pure, no I/O, highest coverage bar
  schema.ts     zod contracts for anything entering the domain
  queries.ts    reads.              <- touches Supabase
  service.ts    writes.             <- touches Supabase and/or a provider
  port.ts       what a third-party provider must do, in our words
  rules.test.ts tests sit beside the code they cover
```

Not every module needs every file - but when a file exists it has that name and
that job. Do not invent `helpers.ts`, `utils.ts` or `manager.ts`; if something
does not fit one of these, it usually belongs in a different module.

### Reads vs writes - and why the split is not cosmetic

| | `queries.ts` | `service.ts` |
|---|---|---|
| SQL | `SELECT` | `INSERT` / `UPDATE` / `DELETE` |
| Supabase client | `server.ts` - anon + session | `admin.ts` - service role |
| RLS | **enforced**, scopes results for you | **bypassed**, you type the filter |
| Calling it twice | harmless | may double-pay |
| Makes decisions? | No - fetches and maps | Yes, but needs the DB to decide |
| Coverage bar | low | medium, with a stub client |

A write in `queries.ts` would use the wrong client, under the wrong security
model, in a file whose name tells callers it is safe to repeat. The file boundary
is how you tell at a glance which of those you are in.

**`service.ts` calling `queries.ts` is normal** - that is the "read, decide,
refuse, write" shape. The reverse never happens.

### `rules.ts` is where judgement lives

`rules.ts` has no I/O, no `async`, and imports only its own `types.ts`. Give it
values, get an answer.

```ts
// modules/payouts/rules.ts
export function payoutRefusal(availableCents: number, amountCents: number): PayoutRefusal | null {
  if (amountCents <= 0) return "not_positive";
  if (amountCents < MINIMUM_PAYOUT_CENTS) return "below_minimum";
  if (amountCents > availableCents) return "insufficient_balance";
  return null;
}
```

> **Push every judgement down into a pure function, and keep the I/O layer thin
> and dumb.** `getConsents` should never grow an `if` about what counts as valid
> consent - that belongs in `rules.ts`, where it is tested against an array
> instead of a database.

### The barrel rule

Cross-module imports go through `index.ts`:

```ts
import { getConsents } from "@/modules/consent";           // ✅ public surface
import { getConsents } from "@/modules/consent/queries";   // ❌ reaching inside
import { nextStep } from "./rules";                        // ✅ within a module
```

If it is not exported from `index.ts`, it is internal. This is what stops one
module's refactor from breaking four others.

### The client-as-parameter rule

Functions in `queries.ts` and `service.ts` take the Supabase client as their
**first argument** instead of importing one. Providers arrive the same way.

```ts
// modules/consent/queries.ts
export async function getConsents(supabase: SupabaseClient, accountId: string): Promise<Consent[]>

// modules/payouts/service.ts
export async function requestPayout(provider: PayoutProvider, input: RequestPayoutInput)
```

Two reasons. Tests pass a stub instead of mocking module imports. And the caller
has to choose which client - which means choosing a security model on purpose
rather than by accident.

Queries return **domain types, never raw rows**. `snake_case` stops at the query
layer; map it there.

---

## 5. Who may import whom

| From | May import | Must not |
|---|---|---|
| `app/**` | any `modules/*` barrel, `shared/ui`, `infra/supabase` | another route's `_components/` |
| `modules/<d>/types.ts` | other modules' types | anything infrastructural |
| `modules/<d>/rules.ts` | own `./types` **only** | Supabase, `next/*`, anything async |
| `modules/<d>/port.ts` | own `./types`, `shared/result` | any vendor SDK |
| `modules/<d>/queries.ts` | `SupabaseClient` type, own types | another module's internals |
| `modules/<d>/service.ts` | own files, other modules' barrels | `app/**`, vendor SDKs |
| `modules/**` | - | **`app/**`, ever. Any JSX.** |
| `shared/ui/**` | nothing domain-specific | any `modules/*`, Supabase |
| `infra/providers/<v>/` | its module's `port.ts` + `types.ts`, the vendor SDK | that module's `service.ts` |
| `infra/**` (all else) | `shared/*` | any `modules/*` |

The provider row is the **one** permitted inversion: an adapter imports the port
it implements. That is the point of a port, and being the sole exception keeps it
easy to police.

**Modules may use `next/*`.** `onboarding/guard.ts` calls `redirect()`;
`onboarding/queries.ts` calls `cookies()`. The ban is on importing `app/`, not on
touching the framework. Only `rules.ts` is strictly framework-free.

---

## 6. Reading data

Every `page.tsx` is a **Server Component**. Never put `"use client"` at the top of
a page. A page's job is: guard, fetch, decide, hand down props.

```tsx
// app/(app)/home/page.tsx - Server Component, no directive
export default async function HomePage() {
  const account = await requireSessionAccount();                   // 1. who is asking
  const supabase = await createClient();
  const consents = await getConsents(supabase, account.accountId); // 2. fetch
  const settled = hasRequiredConsents(consents);                   // 3. decide - pure function

  return <HomeScreen settled={settled} />;                         // 4. plain props down
}
```

The page holds no business rules, writes no queries inline, and names no Supabase
tables. It orchestrates. If a page grows an `if` about what something *means*,
that `if` belongs in `modules/`.

### If you're coming from a React SPA

In a client-side app the chain is `Component → useAuth() → repository → fetch()
→ server → DB`. Every link exists because **the browser cannot reach the
database**, so you need an HTTP hop and a hook to manage the loading/error/data
states that hop creates.

Here the page already runs on the server. The hop is gone, and most of the chain
goes with it.

| What you'd write in an SPA | Here |
|---|---|
| `useAuth()` hook | `requireSessionAccount()`, called in the page |
| Repository / service class | `modules/<d>/queries.ts`, runs on the server |
| `fetch("/api/balance")` | Nothing. The page calls the function directly |
| An `/api/balance` route | Only if an external system calls it |
| `useState` for loading | None. The page awaits before any HTML is sent |
| `useEffect(fetchOnMount)` | Delete it. Fetch in the server page |
| Global auth context | The session cookie, read per request |

**Do not build a data-fetching hook.** Your instinct that screens should be pure
UI fed by something else is right - the feeder is just a Server Component now.

---

## 7. Changing data

A Server Action is the endpoint. Four steps, every time:

```ts
// app/(auth)/onboarding/actions.ts
"use server";

export async function createProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();                                    // 1. who is calling

  const parsed = CreateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: firstError(parsed.error) };  // 2. validate

  await createAccount(createAdminClient(), user.userId, parsed.data);     // 3. hand off

  redirect("/onboarding/consent");                                        // 4. tell the UI
}
```

The client side is a form and a hook React gives you:

```tsx
// app/(auth)/onboarding/_components/ProfileForm.tsx
"use client";

export function ProfileForm() {
  const [state, action, pending] = useActionState(createProfileAction, idleState);

  return (
    <form action={action}>
      <Field id="displayName" name="displayName" label="Your name" required />
      <Button disabled={pending}>Continue</Button>
      <FormMessage status={state.status} message={state.message} />
    </form>
  );
}
```

No `fetch`, no URL, no JSON contract, no `useEffect`. The function is imported and
called; Next.js handles the network.

Rules for actions:

- **Identity comes from the session, never from the form.** A user can put any
  UUID in a hidden field; they cannot forge a session cookie.
- **Never wrap the body in `try/catch`.** `redirect()` works by throwing, so a
  catch-all swallows the navigation and leaves the user on a dead form.
- **Translate, do not leak.** The action turns a `Result` error code into copy.
  `service.ts` never knows about forms, and the UI never sees a domain error code.
- **`FormState` lives outside the action file** (`formState.ts`), because a
  `"use server"` file may only export async functions.

---

## 8. External callers

Route Handlers are for callers we do not control. **If our own React form is the
caller, write a Server Action instead.**

```ts
// app/api/webhooks/aeropay/route.ts
export async function POST(request: Request) {
  // 1. authenticate the CALLER - there is no browser session here
  if (!verifyAeropaySignature(request)) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  // 2. parse, and translate the vendor payload into our vocabulary
  const settlement = parseAeropaySettlement(await request.json());
  if (!settlement.ok) {
    return Response.json({ error: "invalid payload" }, { status: 400 });
  }

  // 3. delegate - no business logic in this file
  const result = await settlePayout(createAdminClient(), settlement.data);

  // 4. map the result to a status code, and acknowledge fast
  return Response.json({ ok: result.ok }, { status: result.ok ? 200 : 409 });
}
```

| | Server Action | Route Handler |
|---|---|---|
| Caller | our own form | systems we do not control |
| Identity | session cookie | **none** - verify a signature |
| Input | `FormData` | JSON body |
| Returns | `FormState` | `Response` + status code |
| Idempotency | usually moot | **required** |

- **A Route Handler has no session.** Middleware protects browser navigation, not
  machine callers.
- **Webhooks must be idempotent.** Providers retry. Key the write on something
  stable from the payload and check for the prior write before applying it - in
  the service, not the caller.
- **Never import one route handler from another.** Shared behaviour goes in
  `modules/`.

---

## 9. Which Supabase client - and the one that can hurt you

Three clients. Picking wrong is the most expensive mistake available here.

| File | Key | Runs | RLS |
|---|---|---|---|
| `infra/supabase/client.ts` | anon | Browser | **Enforced** |
| `infra/supabase/server.ts` | anon + session cookie | Server, as the user | **Enforced** |
| `infra/supabase/admin.ts` | service role | Server only | **Bypassed entirely** |

Reads on behalf of a signed-in user use `server.ts`, where RLS scopes the result
automatically.

**Writes have to use `admin.ts`**, because the schema defines no customer-facing
INSERT or UPDATE policy - every write through the anon key is rejected. That is
deliberate: Next.js is the single writer.

> On the admin client, **RLS is not protecting you.** A query without an explicit
> `.eq("account_id", accountId)` returns every user's rows. The filter you type is
> the only boundary there is.

And resolve the account from the **session**, never from a form field.

`admin.ts` starts with `import "server-only"`, so importing it from a client
component fails the build instead of shipping the key to a browser.

`server.ts` is a **function, not a module constant** - a shared instance would
serve one user's session to another request.

---

## 10. Third-party providers: ports and adapters

Aeropay today, something else later. Same for SMS and ID verification. The pattern
keeps a vendor swap from touching business logic.

**The module declares what it needs. The vendor conforms.**

```ts
// modules/payouts/port.ts - OUR vocabulary, not theirs
export interface PayoutProvider {
  initiatePayout(input: {
    idempotencyKey: string;    // providers retry; without this a retry pays twice
    accountId: string;
    amountCents: number;       // integer cents - money is never a float
  }): Promise<Result<{ providerRef: string; status: PayoutStatus }, PayoutProviderError>>;
}

export type PayoutProviderError =
  | "provider_unavailable" | "rejected" | "insufficient_funds" | "invalid_destination";
```

> The test of a good port: **this file would look identical if we had never heard
> of Aeropay.** No vendor name, no vendor field names, no vendor status strings.

The adapter translates, and is the only thing that knows the vendor exists:

```ts
// infra/providers/payouts/aeropay.ts
export class AeropayPayoutProvider implements PayoutProvider {
  async initiatePayout(input: InitiatePayoutInput) {
    const response = await this.request("POST", "/transfers", TransferResponseSchema, {
      headers: { "idempotency-key": input.idempotencyKey },
      body: { user_uuid: input.accountId, amount: input.amountCents / 100, transfer_type: "PUSH" },
    });

    switch (response.status) {                          // their words -> ours
      case "COMPLETED":                    return ok({ providerRef: ..., status: "paid" });
      case "DECLINED_INSUFFICIENT_FUNDS":  return fail("insufficient_funds");
      default:                             return fail("rejected");
    }
  }
}
```

Selection reuses client-as-parameter, so there is no DI container:

```ts
// modules/payouts/service.ts
export async function requestPayout(provider: PayoutProvider, input: RequestPayoutInput) { ... }

// infra/providers/payouts/index.ts - the only file that names a vendor
export function getPayoutProvider(): PayoutProvider {
  switch (serverEnv.PAYOUT_PROVIDER) {
    case "aeropay": return createAeropayProvider();
    case "stub":    return stubPayoutProvider;
  }
}
```

Three rules, and skipping any of them is why most vendor abstractions fail:

1. **The port speaks our nouns.** Vendor vocabulary in `port.ts` means you renamed
   the SDK rather than decoupled from it.
2. **The error union is ours and finite.** Mapping vendor errors is the adapter's
   main job. If `"DECLINED_INSUFFICIENT_FUNDS"` ever reaches `service.ts`, the
   business logic is coupled to Aeropay however clean the interface looked.
3. **Idempotency is in the signature.** A timeout does not mean it did not happen -
   so a retry must reuse the key, never mint a new one.

**A stub adapter is part of the pattern**, not an afterthought. It is why the whole
payout flow is developable and testable with no vendor account, no key and no
network - `PAYOUT_PROVIDER` defaults to `stub`.

**What does not get a port:** Supabase. It is the system of record, the swap will
never happen, and client-as-parameter already gives tests their seam.

---

## 11. Validation

Parse at the boundary, then trust the value.

```ts
// modules/auth/schema.ts
export const OtpSchema = z.object({
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "Include your country code."),
  token: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code."),
});
export type OtpInput = z.infer<typeof OtpSchema>;
```

Every boundary gets parsed - a form, a webhook payload, **and a provider's
response**. Messages are written as user-facing copy, because that is where they
end up.

Services take typed input. A signature containing `FormData`, `unknown` or `any`
below the action layer means validation leaked downward.

Shape and range belong in the schema. Rules that need the database - *has this
person already consented?* - belong in `service.ts`.

`tsconfig` sets `noUncheckedIndexedAccess`, so `error.issues[0]` is possibly
undefined. Use the `firstError` helper in `actions.ts` rather than a non-null
assertion.

---

## 12. Errors

Expected failures are **return values**. Unexpected failures **throw**.

```ts
// shared/result.ts
export type Result<T, E extends string = string> =
  | { ok: true; data: T }
  | { ok: false; error: E; message?: string };
```

"Below the minimum" is a normal outcome the UI must render. A Postgres connection
failure is an exception - let it throw and hit the error boundary.

**Always inspect a `Result`.** `if (!result.ok) return fail(result.error)` - a
discarded `Result` is a silently swallowed failure, and never swallow an error to
return a falsy value.

---

## 13. Components and the UI

### Two places, and one rule about props

| Where | When | Example |
|---|---|---|
| `app/<route>/_components/` | used by exactly **one** route - most components | `AgeGateForm` |
| `shared/ui/` | used by **2+** routes | `Button`, `Field`, `PointsBadge` |

A folder prefixed `_` is private - Next.js does not turn it into a route. Start
route-local and promote on the **second** consumer, not in anticipation of one.
There is deliberately no third, domain-owned tier: `modules/` holds no JSX.

> **Components take primitives and view props, never domain entities.** The page
> maps domain to props.

That is what keeps `shared/ui/` honest. `<PointsBadge points={1250} />` is a
primitive; `<PointsBadge account={account} />` would drag the domain into the UI.

### When a component needs `"use client"`

Only when it needs one of: a hook, an event handler, a browser API, a Realtime
subscription, or a library that uses hooks internally.

**Push it as far down the tree as you can.** `"use client"` is contagious
downward: everything it imports ships to the browser. One interactive button does
not make the page interactive - extract the button.

| | Server Component (default) | Client Component |
|---|---|---|
| Can be `async` / await | Yes | No |
| Can call `modules/` queries | Yes | **No** |
| Can use hooks and handlers | No | Yes |
| Ships JavaScript | No | Yes |
| Can read secrets | Yes | **Never** |

A client component that needs data gets it as **props from a server parent**, or
uses a Server Action to write. It does not fetch on mount.

### Which hooks survive

Three kinds, all genuinely browser-side:

1. **Form state** - `useActionState` for pending and errors.
2. **Realtime** - `useEffect` to open and tear down a Supabase subscription.
3. **Device APIs** - camera, geolocation, install prompt, anything behind
   `navigator`. These live in `shared/hooks/`.

None of them fetch domain data. The one exception is a genuinely client-driven
view such as infinite scroll: the server renders page 1, and "load more" calls a
**Server Action** that returns page N. Still no API route, still no fetching hook.

---

## 14. Testing

Tests sit beside the code they cover: `modules/payouts/rules.test.ts`.

| Layer | Tested? |
|---|---|
| Pure logic (`modules/**/rules.ts`) | **Yes - the 90% bar applies** |
| `service.ts` | Yes, with a stub client or stub provider |
| Provider adapters | Yes - translation is their whole job |
| `queries.ts` | Only if it holds real mapping logic |
| Pages, actions, components | No - E2E covers the critical journeys |

Thresholds live in `apps/web/vitest.config.ts` and CI enforces them. Write the
test in the same PR as the logic.

**There is no mocking library, on purpose.** The house style is a fixture builder
with overrides, plus dependency injection:

```ts
const input = (overrides: Partial<RequestPayoutInput> = {}): RequestPayoutInput => ({
  accountId: "acc_123", amountCents: 5_000, availableCents: 10_000,
  idempotencyKey: "req_abc", ...overrides,
});

it("refuses on our own rules WITHOUT calling the provider", async () => {
  const provider = new StubPayoutProvider();
  const result = await requestPayout(provider, input({ amountCents: 1 }));

  expect(result).toMatchObject({ ok: false, error: "below_minimum" });
  expect(provider.calls).toHaveLength(0);
});
```

That is what client-as-parameter buys: real money logic tested with no network and
no `vi.mock`. Inject time the same way - `isOldEnough(dob, now)`.

E2E (Playwright) is reserved for the few journeys that genuinely matter.

---

## 15. Conventions

- **Files**: components `PascalCase.tsx`; everything else `camelCase.ts`.
- **Imports** use the `@/` alias (`@/modules/onboarding`), never `../../..`.
- **Named exports only.** No default exports outside `page.tsx` / `layout.tsx`.
- **Naming**: actions end in `Action`; schemas are `PascalCaseSchema` with an
  `Input` type; queries are `find*` / `get*`; guards are `require*`; rules read as
  questions - `isOldEnough`, `hasRequiredConsents`, `canAccessStep`.
- **Domain types** are hand-written per module in `types.ts`. **Generated Supabase
  types live in `infra/supabase/database.types.ts`** and never leave `queries.ts`.
  A service signature containing `Database["public"]["Tables"][...]["Row"]` means
  your column names have become your domain vocabulary, and every migration is now
  a refactor.
- **Money is not a float.** Currency is `numeric(10,2)` in Postgres and integer
  cents in TypeScript; counters are integers.
- **One door per value-bearing table.** If a table records money or points,
  exactly one service writes to it and every other module calls that service. Make
  it append-only and correct by writing compensating rows, not by editing history.
- **Logging**: `logger.info("snake_case_event", { field: scalar })` - an event
  name, never prose, never PII. `console` is banned outside `logger.ts`.
- **Env**: `NEXT_PUBLIC_*` in `infra/config/env.ts`; secrets in `serverEnv.ts`
  behind `server-only`, validated at boot so a bad deploy fails immediately.
- **Every schema change is a new migration.** Never edit one already applied.

---

## 16. Worked example: onboarding, end to end

Six steps - age gate, phone, verify, profile, consent, done - touching every
layer. Read in this order:

| # | Read this | To see |
|---|---|---|
| 1 | `app/(auth)/onboarding/page.tsx` | **Start here.** The shape every page follows |
| 2 | `modules/onboarding/rules.ts` | Pure logic - the whole flow in four booleans |
| 3 | `modules/onboarding/rules.test.ts` | What pure logic costs to test: no mocks, no DB |
| 4 | `modules/onboarding/queries.ts` | The only place the flow touches the outside world |
| 5 | `modules/onboarding/guard.ts` | One line per page, no branching duplicated |
| 6 | `app/(auth)/onboarding/actions.ts` | Every mutation, all the same four steps |
| 7 | `_components/AgeGateForm.tsx` | The client island - `useActionState`, no fetching |
| 8 | `onboarding/consent/page.tsx` | A form with **no** client component at all |
| 9 | `modules/accounts/service.ts` | The write, and why it is idempotent |

Following one step all the way through:

```
1. GET /onboarding
   app/(auth)/onboarding/page.tsx          Server Component
     └─ requireStep("age-gate")            modules/onboarding/guard.ts
          ├─ getOnboardingState()          modules/onboarding/queries.ts
          │    ├─ cookies()                the age-gate cookie
          │    ├─ getSessionUser()         modules/auth
          │    ├─ findAccountByUserId()    modules/accounts   (via its barrel)
          │    └─ getConsents()            modules/consent    (via its barrel)
          └─ canAccessStep(state, step)    modules/onboarding/rules.ts   PURE
     └─ renders <AgeGateForm />            _components/, "use client"

2. User submits the form
   AgeGateForm                             useActionState(confirmAgeAction, idleState)
     └─ confirmAgeAction(prev, formData)   app/.../actions.ts   "use server"
          ├─ AgeGateSchema.safeParse()     modules/onboarding/schema.ts
          ├─ isOldEnough(dob)              modules/onboarding/rules.ts    PURE
          │                                  `now` defaults to new Date(); tests pass a fixed one
          ├─ cookies().set(AGE_GATE_COOKIE) only the ANSWER is stored, never the date of birth
          └─ redirect("/onboarding/phone")
```

> The thing to take from it: **`rules.ts` decides, everything else obeys.** The
> pages contain no routing logic - they call `requireStep()`, which asks one
> tested function. Adding a step means editing `types.ts` and `rules.ts`, not five
> pages.

For the port/adapter pattern, the equivalent tour is `modules/payouts/port.ts` →
`service.ts` → `service.test.ts` → `infra/providers/payouts/stub.ts` →
`aeropay.ts`.

Supporting cast: `modules/auth/session.ts` (who is asking),
`infra/supabase/admin.ts` (the service-role rules), `infra/config/serverEnv.ts`
(fail at boot, not at 3am), `shared/result.ts` (the `Result` type),
`middleware.ts` (session refresh).
