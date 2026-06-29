# The Nulls Project

Human loss-of-function gene and phenotype atlas.

**The Nulls Project** is an open-source, source-linked atlas for understanding what happens when a human gene is naturally missing, reduced, silenced, or made functionally unavailable.

The larger thesis is that some nulls may be more serious than current product labels suggest. A true null can be a body-level missing enzyme or missing function, not merely a pharmacogenomic note. `CYP2D6` is the flagship because it shows how a gene commonly treated as a medication-response label may need a tissue-resolved systemic-null model.

The next evidence layer is endogenous metabolism. For `CYP2D6`, the first mapped routes include 5-methoxytryptamine to serotonin, tyramine to dopamine, and anandamide/endocannabinoid metabolism. The project treats these as missing-route and pathway-load questions, not as deterministic neurotransmitter or diagnosis claims.

The first data-product layer is a static null-only feed that other projects can ingest and filter client-side:

- `data/nulls-only.json`
- `api/nulls.json`
- `api/index.json`

The CYP2D6 model is the first deep reference layer:

- `data/cyp2d6-base-model.json`
- `data/cyp2d6-substrates.json`
- `data/cyp2d6-variants.json`
- `api/cyp2d6-base.json`

The core use case is to become a reference for **functional null states**:

- inherited no-function biology;
- severe low-function biology that approximates a null;
- medically induced nulls, such as enzyme inhibition / phenoconversion;
- protective loss-of-function states that explain why "less function" is not automatically bad.

The important layer is tissue resolution. A true inherited null can remove a function wherever that gene is normally active. A medication-induced functional null may only imitate part of that loss, depending on inhibitor distribution, barriers, tissue expression, and local regulation.

The first exposure case is solanidine / potato glycoalkaloids for `CYP2D6`. It is included because it shows the difference between true inherited nulls, clinical poor-metabolizer labels, residual function, and medically induced functional nulls in an accumulation model. The case treats plasma solanidine as a strong CYP2D6 activity biomarker, not as a direct food-toxicity threshold.

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
- systemic enzyme/function deficiency framing;
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
- `styles.css` - responsive explanatory atlas UI.
- `app.js` - client-side search, filters, evidence visuals, variant snapshot, and gene dossier rendering.
- `assets/null-systems-map.png` - generated systems-map hero illustration.
- `data/nulls-atlas.json` - first structured data draft.
- `data/nulls-only.json` - generated null-only feed for client-side filtering.
- `data/null-variants.json` - generated allele/marker/gene-level null variant feed.
- `data/null-ingest-map.json` - per-gene null-ingest rules for the current ten records.
- `data/ingest-sources.json` - external API/source catalog.
- `data/source-confidence-map.json` - source confidence labels and per-gene evidence-type profile.
- `data/cyp2d6-base-model.json` - reusable CYP2D6 null-state model and evidence ladder.
- `data/cyp2d6-substrates.json` - CYP2D6 endogenous, exposure, medication, probe, and induced-null substrate rows.
- `data/cyp2d6-variants.json` - generated CYP2D6-only variant slice.
- `api/nulls.json` - static API alias for the null-only feed.
- `api/null-variants.json` - static API alias for the variant feed.
- `api/cyp2d6-base.json` - bundled CYP2D6 base-pack API.
- `api/index.json` - static API endpoint index.
- `scripts/build-null-feeds.mjs` - regenerates the static API feeds.
- `scripts/build-null-variants.mjs` - regenerates variant rows.
- `scripts/build-cyp2d6-base-pack.mjs` - regenerates CYP2D6 variant slice and bundled base API.
- `docs/methods.md` - evidence tiers, inclusion rules, and boundaries.
- `docs/ingestion.md` - how to consume and rebuild the null-only feed.
- `docs/source-confidence.md` - evidence-type labels for null rows.
- `docs/roadmap.md` - public issue-ready roadmap.
- `docs/project-architecture.md` - target source-of-truth structure for product, evidence, models, generated feeds, and APIs.
- `docs/nulls-systems-curator-agent.md` - hybrid product/genetics/research/data agent mandate.
- `docs/systemic-null-framing.md` - project doctrine for serious body-level null interpretation.
- `docs/cyp2d6-null-definition.md` - CYP2D6 state model and working null definition.
- `docs/cyp2d6-body-map.md` - tissue/body-compartment map for CYP2D6 systemic-null framing.
- `docs/cyp2d6-endogenous-map.md` - first endogenous CNS substrate source map for CYP2D6.
- `docs/solanidine-case.md` - first exposure/accumulation case for CYP2D6 null modeling.
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

Regenerate the static feeds after atlas or ingest-map edits:

```bash
node scripts/build-null-feeds.mjs
```

Regenerate CYP2D6-specific feeds after variant or substrate edits:

```bash
node scripts/build-cyp2d6-base-pack.mjs
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
