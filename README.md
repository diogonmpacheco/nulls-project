# The Nulls Project

Human loss-of-function gene and phenotype atlas.

**The Nulls Project** is an open-source, source-linked atlas for understanding what happens when a human gene is naturally missing, reduced, silenced, or made functionally unavailable.

The core use case is to become a reference for **functional null states**:

- inherited no-function biology;
- severe low-function biology that approximates a null;
- medically induced nulls, such as enzyme inhibition / phenoconversion;
- protective loss-of-function states that explain why "less function" is not automatically bad.

The important layer is tissue resolution. A true inherited null can remove a function wherever that gene is normally active. A medication-induced functional null may only imitate part of that loss, depending on inhibitor distribution, barriers, tissue expression, and local regulation.

The first draft focuses on ten strong null / low-function cases:

- `CYP2D6` as the flagship deep dossier
- `CYP2C19`
- `DPYD`
- `TPMT`
- `NUDT15`
- `G6PD`
- `BCHE`
- `UGT1A1`
- `PCSK9`
- `ANGPTL3`

The project is educational and exploratory. It is not a diagnostic tool, not medical advice, and not a replacement for a qualified clinician, pharmacist, laboratory, or genetic counselor.

## Live Page

After GitHub Pages is enabled:

<https://diogonmpacheco.github.io/nulls-project/>

## Project Stance

Most genetics products explain variants as risk, identity, or optimization.

The Nulls Project asks a narrower question:

> What does human biology reveal when a gene's function is absent, severely reduced, or contextually switched off?

That makes null biology useful for:

- pharmacogenomics;
- medically induced functional nulls;
- tissue-resolved biology beyond liver metabolism;
- protective human knockouts;
- phenotype-negative observations;
- gene function discovery;
- outlier investigation;
- source-linked genetic education.

## Relationship To Diognosis

This repository is separate from Diognosis on purpose.

Diognosis is a medication intelligence platform. The Nulls Project is a gene-first atlas. Some PGx markers and action summaries in this first draft are seeded from the local Diognosis clinical standards bridge, especially for:

- CYP2D6
- CYP2C19
- DPYD
- TPMT
- NUDT15
- G6PD
- BCHE
- UGT1A1

The intended future bridge is:

- **The Nulls Project** maintains the gene-first evidence model.
- **Diognosis** may later import a conservative medication-focused "Nulls Lens."

## Files

- `index.html` - static GitHub Pages app.
- `styles.css` - responsive dense atlas UI.
- `app.js` - client-side search, filters, evidence matrix, and gene dossier rendering.
- `data/nulls-atlas.json` - first structured data draft.
- `docs/methods.md` - evidence tiers, inclusion rules, and boundaries.
- `docs/diognosis-bridge.md` - how Diognosis data was used and how future integration should work.
- `docs/product-notes.md` - neurodivergent product, IA, and genetics reviewer notes.

## Local Preview

```bash
python3 -m http.server 4179 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4179/
```

## Data Boundary

The first draft is deliberately small and curated. It should not ingest raw DNA files, make personal predictions, or produce clinical recommendations.

Every future gene record should keep:

- a source trail;
- evidence tier;
- caveats;
- distinction between genotype, phenotype, and diagnosis;
- explicit uncertainty;
- a no-medical-advice boundary.

## License

MIT for code and project text unless a future data source requires more specific attribution.
