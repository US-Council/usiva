# USIVA — U.S. Immigration and Visa Association

USIVA is the US Council's informational planning and official-source navigation space for people and organizations working through U.S. immigration and visa questions. Its content is designed to help readers organize records, understand which public authority owns the next step, and prepare a responsible handoff. USIVA is not a law firm: it does not provide legal advice or representation, make eligibility determinations, submit applications, or guarantee admission, employment, funding, visa issuance, or government approval.

Source of truth: [US-Council/usiva on GitHub](https://github.com/US-Council/usiva). `release/live` is the only branch that publishes the public site; `main` is the integration branch. The current public release is live on GitHub Pages at [usiva.org](https://usiva.org/), with the internal preview kept at the GitLab Pages URL documented below.

## Branch and deployment model

| Branch | Role | Deployment |
| --- | --- | --- |
| `main` | Integration branch: Astro source, content, configuration, and tests | Runs the build and release quality gates on every push; never publishes. Not a GitLab Pages artifact |
| `release/live` | Approved production source | The GitHub Actions workflow builds it, runs the gates, and publishes `gh-pages` |
| `demo` | Reviewed Astro source for internal preview | GitLab Pages only, with access control enabled by the project administrator |
| `gh-pages` | Generated static artifact | The only public GitHub Pages source, published from `/(root)` |

The GitLab pipeline runs only for `demo`; `main` is never treated as the GitLab demo artifact. The GitHub Actions workflow runs from `main` (gates only) and `release/live` (gates, then publish); it builds the Astro site, writes `CNAME` and `.nojekyll`, verifies that assets are under `assets/` rather than `_astro/`, and replaces `gh-pages` with only `dist/`. Legacy HTML, PHP, assets, and mirror branches are not inputs to either deployment.

See the [deployment runbook](docs/deployment/README.md) for the exact artifact contract, rollback procedure, and DNS checklist.

## Astro development

Use Node.js 22.13.0, pnpm 11.22.0, and the committed pnpm lockfile. From a clean checkout:

```bash
corepack pnpm --version
corepack pnpm install --frozen-lockfile --config.allowBuilds.esbuild=true
corepack pnpm run dev
corepack pnpm run check
corepack pnpm run build
corepack pnpm run preview
```

`pnpm run build` must produce a static `dist/` directory. Before merging deployment changes, confirm that `dist/index.html` exists, `dist/assets/` exists, and `dist/_astro/` does not. Do not run an unfrozen install for routine setup because it can rewrite the lockfile.

## Authoring routes and content

- Add file-based routes under `src/pages/`. The file path is the URL contract; preserve the existing trailing-slash and canonical URL policy. Dynamic routes such as `src/pages/articles/[slug].astro` must enumerate every publishable entry with `getStaticPaths()` and exclude drafts.
- Add editorial entries under the appropriate `src/content/` collection. Keep collection schemas and required metadata in `src/content.config.ts`; use validated fields for title, description, publication state, dates, authors, relationships, canonical URLs, and image alt text.
- Put processable editorial media in `src/assets/` and use Astro's asset pipeline. Use `public/` only for exact-copy files such as favicons, manifests, verification files, or downloads. The Astro configuration must keep generated assets in `assets/`, not the underscore-prefixed `_astro/` directory.
- Keep page files thin: select typed content and compose existing layouts/components. Add a component only when the semantic pattern is reused; add client hydration only when a real interaction requires it.
- For every new route or collection entry, run `pnpm run check`, `pnpm run build`, and the relevant route/accessibility tests. Inspect the built route rather than relying only on source compilation.

The visa directory is generated from the typed catalog in `src/data/visa-categories.ts`. It intentionally covers principal nonimmigrant and immigrant families plus the published subcategories, while each route sends readers to the controlling USCIS, Department of State, DHS, SEVP, or employer resource. The directory is an orientation index—not an eligibility engine.

The official tools surface is static-safe by design. USCIS Case Status API credentials require an approved application and a server-side token exchange; no secret, receipt number, or user account data belongs in this repository or the browser bundle. Until an approved backend is provisioned, the site provides official Case Status and MyUSCIS handoffs and documents the API contract without pretending to offer live lookup.

Do not put secrets, tokens, private URLs, or DNS credentials in content, source, workflow files, or documentation.

## Publishing and promotion

Pushes to `main` build and gate the site but do **not** publish it. Only a push to `release/live` replaces `gh-pages`, so unapproved content on `main` can never reach usiva.org by accident.

To promote `main` to production, after the owner approves the content:

1. Open a merge request on GitLab with source `main` and target `release/live`, review the diff, and wait for the pipeline gates to pass.
2. Merge it. The mirror delivers `release/live` to GitHub and the public workflow builds, gates, and publishes `gh-pages`.

For a dependency or security hotfix that must go live without the content waiting on `main`, branch from `release/live`, fix, and merge the MR into `release/live`; then merge the same fix into `main` so the branches do not drift.

## Rollback and DNS

To roll back a public change, revert the approved bad commit on `release/live` (never rewrite history) and let the public workflow rebuild `gh-pages`:

```bash
git switch release/live
git pull --ff-only https://git.developerdojo.org/US-Council/usiva.git release/live
git revert <bad-commit>
git push https://git.developerdojo.org/US-Council/usiva.git release/live
```

Do not restore legacy files or manually edit `gh-pages`. GitHub Pages deploys `gh-pages` from the repository root at `usiva.org`; use the DNS provider targets shown by GitHub for the apex domain and point any `www` CNAME directly to the organization's GitHub Pages host. Keep the internal GitLab Pages URL out of public DNS. See the [deployment runbook](docs/deployment/README.md) for the release checks and current deployment model.
