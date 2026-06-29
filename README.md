# The Nulls Project

Open-source atlas for human functional-null biology.

The project tracks what changes when a gene function is absent, severely reduced, protective, or temporarily unavailable. It separates true inherited nulls, low-function review rows, induced functional nulls, tissue context, evidence strength, and caveats.

Boundary: educational research reference only. This is not a diagnostic tool, not medical advice, and not a replacement for clinical genetics or pharmacogenomic review.

Live site:

<https://diogonmpacheco.github.io/nulls-project/>

API index:

<https://diogonmpacheco.github.io/nulls-project/api/index.json>

## Current Product Shape

- `CYP2D6` is the deep pilot model.
- The other nine genes are atlas summaries until they are migrated into the same model structure.
- The database spine is a generated static property graph.
- Curated source-of-truth files live under `models/` and `evidence/`.
- Generated distribution files live under `data/generated/` and `api/`.

Key public endpoints:

- `api/nulls.json`
- `api/null-variants.json`
- `api/genes/CYP2D6.json`
- `api/graph.json`

## Repo Map

- `index.html`, `styles.css`, `app.js` - static GitHub Pages atlas app.
- `models/genes/CYP2D6/` - canonical CYP2D6 graph-ready model files.
- `evidence/` - source registry and atomic claim rows.
- `data/imports/` - upstream snapshots.
- `data/generated/` - generated graph exports.
- `data/*.json` - current compatibility feeds used by the app.
- `api/` - public static API aliases and bundles.
- `docs/methods.md` - public rules, evidence boundaries, and non-diagnostic framing.
- `docs/ingestion.md` - developer ingestion notes.
- `docs/project-architecture.md` - maintainer architecture notes.
- `scripts/` - import, normalization, feed, and graph builders.

## Rebuild

Run the pipeline after changing curated model, evidence, atlas, or ingest files:

```bash
node scripts/build-null-variants.mjs
node scripts/build-null-feeds.mjs
node scripts/build-cyp2d6-base-pack.mjs
node scripts/build-graph-db.mjs
```

## Source-Of-Truth Rule

Do not hand-edit generated API output.

Use:

- `models/genes/CYP2D6/*` for CYP2D6 model rows;
- `evidence/sources.json` for source identity;
- `evidence/claims.json` for atomic claims;
- `docs/methods.md` for public interpretation rules;
- `api/index.json` for the public endpoint catalog.

## License

MIT for code and project text unless a future data source requires more specific attribution.
