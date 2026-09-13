# Server layer conventions

Loaded unconditionally, not path-scoped: none of the files it governs (`src/server/**`, `prisma/**`, route handlers) exist yet, and a path-scoped rule first fires only after someone has already written the file. Add `paths:` frontmatter once the server layer is real.

Every mutation and every privileged read goes through a service function in `src/server/services/<module>.ts`. Server Actions and route handlers are thin wrappers: parse input, call the service, shape the response. No business logic in the wrapper.

## Authorization

- One enforcement point: a `requireRole(...)`-style guard, called by the service. A handler must never do an ad-hoc `if (user.role === ...)`.
- Only `FUNDRAISING_OFFICER` and `DEAN_APPROVER` carry real permission logic in Phase I. The other five roles exist in the enum but gate nothing yet.
- A maker is never the checker on the same record. Compare actor identity, not just role.
- `AUDITOR` is read-only everywhere, with no create/edit/approve path anywhere in the system.

## Validation

Every service validates its input with a zod schema before touching the database. User input never reaches Prisma unparsed.

## The donor-email approval gate (Section 2.4 — hard constraint)

The send path must, in this order and inside one transaction, before anything leaves the system:

1. Confirm the caller is a `DEAN_APPROVER`.
2. Re-read the `DonorEmail` and confirm its status is exactly `PENDING_APPROVAL` — not "not rejected", not a flag read earlier in the request.
3. Record who approved and when, as a row, not a boolean flip.

If any of the three feels awkward to fit, stop and ask rather than dropping one. Only the transitions in the shared status table are legal — `DRAFT → PENDING_APPROVAL → APPROVED → SENT`, with `PENDING_APPROVAL → REJECTED → DRAFT`. Reaching `SENT` from anywhere but `APPROVED` must be impossible.

Never call an LLM from inside the approve or send path. Drafting assistance, if it is ever approved (it is not currently in scope), is a separate function returning a draft for a human to edit.

## Access logging (Section 9.2)

Every read or write touching a `Donor` or `DonorEmail` record calls the access-log helper, in addition to normal request logging. Login attempts are logged too. This is separate from any action-level audit trail.

## Schema discipline

- No model for a module until DORA has signed off on that module's UI, in writing. `User` + `Role` are shared infra and may exist first.
- No Phase II models (`EndowmentFund`, `CSRGrant`, `GrantMilestone`, `ScholarshipScheme`, `Disbursement`, `AuditLog`) — not commissioned.
- Lifecycle fields are enums with explicit states, never a boolean or free text. `DonorEmail.status` is `DRAFT | PENDING_APPROVAL | APPROVED | REJECTED | SENT` — never an `approved: boolean`.
- Status history is recorded, not overwritten in place: Section 2.4 requires the full communication trail to survive.
- Every model gets `createdAt` (`@default(now())`) and `updatedAt` (`@updatedAt`).
- Approval and execution are separate states with separate actor columns. Never collapse them into one flag.

## Migrations

Created with `npx prisma migrate dev --name <description>` against **your own local database only**. Never `prisma db push` anywhere but a throwaway local db; never any migration command against a shared, staging, or production `DATABASE_URL`. Read the generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql` before committing — check nullability and cascade behaviour. Commit the schema diff and the migration folder together.
