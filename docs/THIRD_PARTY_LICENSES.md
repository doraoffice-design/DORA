# Third-Party Components and Licenses

Required by proposal Section 8.2. Update this whenever a non-trivial dependency is added to any `apps/*` or `packages/*` package.json. Before adding anything with a copyleft (GPL/AGPL) or non-commercial license, ask the team lead — don't assume it's fine because it's free to use.

**Not yet verified.** `node_modules` is not installed, so no license file has been read. Fill the License column from each package's own `LICENSE`/`package.json` after `npm install`, and re-verify at handover — Section 8.2 makes this inventory a Phase I deliverable and the trigger for copyleft review.

| Component | Version | License | Used in | Notes |
|---|---|---|---|---|
| Next.js | 16.3.1 | | app | frontend + server layer |
| React | 19.2.8 | | app | |
| Tailwind CSS | ^4 | | app | |
| shadcn/ui | — | | app | components are copied into the repo, not installed as a dependency |
| @base-ui/react | ^1.7.0 | | app | primitive layer under shadcn/ui |
| lucide-react | ^1.33.0 | | app | icons |
| sonner | ^2.0.8 | | app | toasts |
| next-themes | ^0.4.6 | | app | |
| clsx / tailwind-merge / class-variance-authority | — | | app | className utilities |
| Prisma | — | | `prisma/` | not yet installed — added when the first module's schema lands |
