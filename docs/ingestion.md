# Null-Only Ingestion

The Nulls Project now exposes a first static API layer.

This is not a live server API yet. It is a GitHub Pages JSON API: fetch the JSON files and filter client-side.

## Static Endpoints

- Full atlas: <https://diogonmpacheco.github.io/nulls-project/data/nulls-atlas.json>
- Null-only feed: <https://diogonmpacheco.github.io/nulls-project/data/nulls-only.json>
- API alias: <https://diogonmpacheco.github.io/nulls-project/api/nulls.json>
- API index: <https://diogonmpacheco.github.io/nulls-project/api/index.json>
- Gene ingest map: <https://diogonmpacheco.github.io/nulls-project/data/null-ingest-map.json>
- External source catalog: <https://diogonmpacheco.github.io/nulls-project/data/ingest-sources.json>
- CYP2D6 base model: <https://diogonmpacheco.github.io/nulls-project/data/cyp2d6-base-model.json>
- CYP2D6 substrate map: <https://diogonmpacheco.github.io/nulls-project/data/cyp2d6-substrates.json>
- CYP2D6 variant slice: <https://diogonmpacheco.github.io/nulls-project/data/cyp2d6-variants.json>
- CYP2D6 bundled API: <https://diogonmpacheco.github.io/nulls-project/api/cyp2d6-base.json>

## Filter Examples

```js
const response = await fetch("https://diogonmpacheco.github.io/nulls-project/data/nulls-only.json");
const feed = await response.json();

const strictNulls = feed.records.filter(record => record.strictNull);
const systemic = feed.records.filter(record => record.facets.systemicCandidate);
const protective = feed.records.filter(record => record.facets.protective);
const induced = feed.records.filter(record => record.facets.inducedNull);
const cyp2d6 = feed.records.find(record => record.symbol === "CYP2D6");

const cyp2d6Base = await fetch("https://diogonmpacheco.github.io/nulls-project/api/cyp2d6-base.json").then(r => r.json());
const cyp2d6StrictVariants = cyp2d6Base.variants.records.filter(record => record.strictNull);
const cyp2d6MedicationRows = cyp2d6Base.substrates.rows.filter(row => row.category === "medication");
```

## What The Feed Keeps

The default null-only model keeps:

- nonsense / stop-gained variants;
- frameshift variants;
- canonical splice loss;
- start loss;
- transcript ablation;
- whole-gene deletion;
- exon deletion;
- biallelic or hemizygous deficiency;
- named no-function alleles;
- protective loss-of-function;
- medically induced functional nulls when clearly labeled.

The feed also keeps severe low-function or deficiency-like records when they are already part of the curated atlas, but labels them as review when they are not strict true nulls.

## What The Feed Excludes By Default

- normal function;
- increased function;
- ultrarapid / duplication states;
- generic risk alleles;
- association-only records;
- missense records without curated functional loss;
- benign / likely benign assertions;
- synonymous-only records.

## External Sources To Eat

The first enrichment catalog maps the project to:

- Ensembl VEP / REST for consequence normalization;
- ClinVar for clinical assertions;
- gnomAD for population pLoF and constraint;
- ClinGen Dosage Sensitivity for haploinsufficiency context;
- PharmVar for named pharmacogene alleles;
- CPIC API for allele function and phenotype translation;
- PharmGKB API for pharmacogene curation;
- NCBI Gene / MedGen / Bookshelf for readable clinical context;
- Open Targets for target-validation and protective-null context.

## Rebuild

```bash
node scripts/build-null-feeds.mjs
node scripts/build-null-variants.mjs
node scripts/build-cyp2d6-base-pack.mjs
```

The generator reads:

- `data/nulls-atlas.json`
- `data/null-ingest-map.json`
- `data/ingest-sources.json`

and writes:

- `data/nulls-only.json`
- `api/nulls.json`
- `api/index.json`
- `data/cyp2d6-variants.json`
- `api/cyp2d6-base.json`

## Boundary

This is an educational research feed. It is not diagnostic interpretation, not medical advice, and not a replacement for clinical genetics or pharmacogenomic review.
