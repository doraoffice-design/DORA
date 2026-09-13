---
name: db-migration-checklist
description: Use whenever you're about to add or change a Prisma model in prisma/schema.prisma and create a migration, to do it safely and consistently.
---

# Safe Prisma migrations for DRMP

1. **Confirm this isn't Phase II/III.** Check the `.claude/CLAUDE.md` module list. If the model you're adding isn't one of User/Role, Donor, PipelineOpportunity, Proposal, or DonorEmail, stop and confirm scope before writing any schema.

2. **Confirm UI sign-off exists** for the module this model belongs to (an email from DORA, referenced in a PR or issue). No sign-off, no schema yet.

3. **Edit `prisma/schema.prisma` directly** — don't generate it from a tool that writes something you haven't read. Use enums for any status/lifecycle field (see `src/lib/donor-email.ts` for the pattern already used for donor email status). Add `createdAt`/`updatedAt` to every new model.

4. **Generate the migration against your own local database only:**
   ```
   npx prisma migrate dev --name <short_description>
   ```
   Never run this (or `prisma db push`) against a shared, staging, or production `DATABASE_URL`.

5. **Read the generated SQL** in `prisma/migrations/<timestamp>_<name>/migration.sql` before committing. Confirm it does what you expect — especially for any column you expected to be `NOT NULL` or any foreign key you expected to cascade.

6. **Regenerate the client** (`npx prisma generate`) and fix any resulting TypeScript errors (`npx tsc --noEmit`) before opening the PR — a schema change that doesn't compile downstream isn't done.

7. **Open the PR** with both the schema diff and the migration folder committed together, and ask for the `schema-reviewer` subagent's pass before requesting human review.
