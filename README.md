# Horizon Q

`horizonqltd.com` — AI, quantum, materials, energy, cyber.

Phase 0 scaffold. The document renderer works today; the orbital world works
today; the landscape world has its mapping written and a stub scene.

---

## The one rule

**Content never stores coordinates.**

```
content → abstract spatial properties → world mapping → geometry
```

Every item carries `magnitude`, `depth`, `connections`, `anchor`. Each world
turns those into its own idiom. Content has no idea whether it is a star or a
tower.

This is what makes two worlds affordable and a third one cheap. Break this rule
and you have two sites to maintain forever.

---

## Getting it live

### 1. Repo and Pages

1. Create a **public** repo named exactly `stuartokin.github.io`.
2. Upload the *contents* of this folder (not the folder itself).
   Make hidden files visible first — `.github` and `.gitignore` start with a
   dot and most file managers hide them. Without `.github`, nothing builds and
   there is no error message to tell you why.
3. Settings → Pages → Source: **GitHub Actions**.
4. Check the **Actions** tab for a green tick, then visit
   `https://stuartokin.github.io` before touching DNS.

### 2. GoDaddy DNS

In GoDaddy → My Products → `horizonqltd.com` → DNS → Manage Zones.

Delete GoDaddy's parked-page records first, then add:

| Type  | Name  | Value                     | TTL    |
| ----- | ----- | ------------------------- | ------ |
| A     | `@`   | `185.199.108.153`         | 1 hour |
| A     | `@`   | `185.199.109.153`         | 1 hour |
| A     | `@`   | `185.199.110.153`         | 1 hour |
| A     | `@`   | `185.199.111.153`         | 1 hour |
| CNAME | `www` | `stuartokin.github.io.` | 1 hour |

Then GitHub → Settings → Pages → Custom domain → `horizonqltd.com` → Save.
Wait for the DNS check to pass, then tick **Enforce HTTPS**.

GitHub creates the `CNAME` file in the repo automatically when you save the custom domain, so the domain survives every deploy. You do not need to create it by hand.
Propagation is usually minutes, occasionally a few hours.

### 3. Local development (optional)

```bash
npm install
npm run dev
```

You do not need this. GitHub Actions builds everything. But it is much faster
to iterate on the 3D locally if you ever want to.

---

## Layout

```
content/
  schema/item.schema.json   the contract. Change carefully.
  items/*.md                the content graph. Hand-editable in GitHub's web editor.
  site.json                 title, tagline, byline, disclaimer
src/
  content/                  loader + types. PROTECTED — no agent writes here.
  worlds/
    types.ts                World interface, Placement, spectral palette
    orbital/                mapping + scene
    landscape/              mapping + stub scene (Phase 5)
    index.ts                registry — add a world with one line
  renderers/document/       PROTECTED — the permanent readable route
  components/               SpectralIndex (signature), RendererToggle
  capability.ts             input class, quality tier, fold posture
scripts/
  validate-content.mjs      Gate 1 — schema
  check-budget.mjs          Gate 2 — performance
  check-scope.mjs           Gate 3 — agent write scope
```

## Adding a world

1. `src/worlds/<name>/index.ts` — implement `World`
2. `src/worlds/<name>/Scene.tsx` — the R3F scene
3. One line in `src/worlds/index.ts`

No content changes. Ever. If a new world needs a content change, the
abstraction has sprung a leak — fix the abstraction, not the content.

## Adding an agent (Phase 4)

```
agents/<name>/
  agent.json    schedule, model, write_scope, output, enabled
  prompt.md     the system prompt
```

`write_scope` is enforced by `check-scope.mjs` on every agent PR. Scout can only
create files in an inbox; the redesign agent can only create new world folders.
`src/renderers/document/`, `src/content/`, `content/schema/`, `scripts/` and
`.github/` are forbidden to every agent regardless of scope.

---

## The three gates

Every change — yours or an agent's — passes the same checks:

1. **Schema.** Front matter validates; ids unique; connections resolve.
2. **Budget.** Entry JS under 180 KB, world chunk under 900 KB, CSS under 40 KB.
   Three.js must not leak into the initial bundle: the document route has to
   paint without downloading a 3D engine.
3. **Scope.** Agent PRs only. Declared paths, protected paths, locked fields.

Broken output fails CI instead of reaching the site. That is what makes it safe
to leave agents running while you are at work.

---

## Design language

The palette is derived rather than picked. Each pillar is a real emission line,
and the five appear in wavelength order everywhere:

| Pillar    | Line          | nm    |
| --------- | ------------- | ----- |
| Cyber     | Hg            | 435.8 |
| Materials | H-beta        | 486.1 |
| Quantum   | O III         | 500.7 |
| AI        | Na D          | 589.0 |
| Energy    | H-alpha       | 656.3 |

The **spectral index** is the signature element: those five lines on a
continuum, acting as the filter in the document renderer and the legend in every
world. Same object, two contexts.

Type is Archivo (display, expanded), Newsreader (body), IBM Plex Mono (data and
labels).

---

## Phase roadmap

| Phase | Status | What |
| ----- | ------ | ---- |
| 0 | **this** | Domain, repo, stack, CI, three gates, deployable skeleton |
| 1 | partly done | Content graph, schema, document renderer |
| 2 | started | Orbital world, control matrix, measured quality tiers |
| 3 | next | Decision queue, on-site console, mobile chat client |
| 4 | | Agent runner, Scout + Liveness, canary window, one-tap rollback |
| 5 | | Landscape world — proves the abstraction |
| 6 | | Editor, redesigner, test agents |
| 7 | | PWA, offline, installable |

## Known gaps in Phase 0

- Dependency versions are pinned to a known-good React 18 / R3F 8 / drei 9 set
  and have not been installed and resolved here. First `npm install` may want a
  bump.
- Article bodies are not rendered yet — only titles and summaries. Markdown
  rendering lands in Phase 1.
- No routing. One page, two renderers. Per-item URLs land in Phase 1.
- Landscape scene is deliberately a stub.
