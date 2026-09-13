---
paths:
  - "src/**/*.tsx"
  - "src/components/**"
  - "src/hooks/**"
---

# Frontend conventions

## shadcn/ui here is base-ui, NOT Radix

`components.json` style is `base-nova`; the primitive layer is `@base-ui/react`. Radix prop names from memory will be wrong, and mostly wrong *silently*:

1. **No `asChild`.** Use `render={<Element ... />}` — e.g. `<DialogTrigger render={<Button>Open</Button>} />`.
2. **`DropdownMenuItem` has no `onSelect`.** It renders a `<div>`, so `onSelect` type-checks as a plain DOM prop and then never fires. **Always `onClick`.**
3. **`DropdownMenuLabel` needs a `DropdownMenuGroup` ancestor** or it throws `Base UI: MenuGroupContext is missing` at runtime.
4. **`Button` defaults to `nativeButton={true}`**, asserting the render target is a real `<button>`. Rendering it as a `Link`/`<a>` needs `nativeButton={false}` or it logs a runtime error.
5. **`Select`'s `onValueChange` is `(value: string | null, ...) => void`** — guard the null: `onValueChange={(v) => setX(v ?? "all")}`.

Before adding a new interactive component, read the actual source in `src/components/ui/` or the `.d.ts` in `node_modules/@base-ui/react/`. #2 and #4 compile clean, so **a green build is not proof the UI works — click-test it.**

## No business logic in components

Form state and display formatting only. Anything deciding "is this allowed" or "what happens next" belongs in a server service function (`src/server/services/`), so it's testable without a browser and enforced where a user can't bypass it. A disabled button is a courtesy, never a control.

## UI-first workflow

A new module's screens are built with static mock data first — no database, no service calls — demoed to DORA, and confirmed **over official email** (Section 6.5) before any backend work. Don't let a mockup's invented field list quietly become the schema; re-read the module's proposal section for the fields DORA actually asked for.

## Outreach UI expectations (Section 2.4)

The donor email UI must visually distinguish `DRAFT` / `PENDING_APPROVAL` / `APPROVED` / `REJECTED` / `SENT`, and a "Send"/"Approve" affordance may only appear for a `DEAN_APPROVER` acting on a `PENDING_APPROVAL` email. This is so the UI doesn't mislead a non-approver — the real enforcement is server-side and is not optional because the button is hidden.

## Debugging

Next 16 forwards browser console errors into the dev server's own log: `.next/dev/logs/next-development.log`, JSON lines tagged `"source":"Browser"`. Reproduce, then grep for `"level":"ERROR"` — this is how the `onSelect` and `nativeButton` bugs above were found without a browser session. Faster than headless Chromium (no sudo here, so `playwright install --with-deps` fails).
