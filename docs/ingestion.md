# Null-Only Ingestion

The Nulls Project now exposes a first static API layer.

This is not a live server API yet. It is a GitHub Pages JSON API: fetch the JSON files and filter client-side.

## API Index

Use the API index as the endpoint catalog:

<https://diogonmpacheco.github.io/nulls-project/api/index.json>

Most consumers should start with:

- `api/nulls.json` for gene-level records;
- `api/null-variants.json` for variant/feed rows;
- `api/genes/CYP2D6.json` for the graph-backed CYP2D6 pilot;
- `api/graph.json` for the full static property graph.

## Filter Examples

```js
const response = await fetch("https://diogonmpacheco.github.io/nulls-project/api/nulls.json");
const feed = await response.json();

const strictNulls = feed.records.filter(record => record.strictNull);
const systemic = feed.records.filter(record => record.facets.systemicCandidate);
const protective = feed.records.filter(record => record.facets.protective);
const induced = feed.records.filter(record => record.facets.inducedNull);
const cyp2d6 = feed.records.find(record => record.symbol === "CYP2D6");

const cyp2d6Base = await fetch("https://diogonmpacheco.github.io/nulls-project/api/cyp2d6-base.json").then(r => r.json());
const cyp2d6StrictVariants = cyp2d6Base.variants.records.filter(record => record.strictNull);
const cyp2d6MedicationRows = cyp2d6Base.substrates.rows.filter(row => row.category === "medication");

const graph = await fetch("https://diogonmpacheco.github.io/nulls-project/api/graph.json").then(r => r.json());
const cyp2d6VariantNodes = graph.nodes.filter(node => node.type === "Variant" && node.id.startsWith("variant:CYP2D6:"));
const cyp2d6StrictVariantNodes = cyp2d6VariantNodes.filter(node => node.properties.strictNull);
const solanidineEdges = graph.edges.filter(edge => edge.from.includes("solanidine") || edge.to.includes("solanidine"));
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
node scripts/build-null-variants.mjs
node scripts/build-null-feeds.mjs
node scripts/build-cyp2d6-base-pack.mjs
node scripts/build-graph-db.mjs
```

Generated outputs are distribution files. Curate `models/`, `evidence/`, and the atlas/ingest inputs; then rebuild the generated feeds and APIs.

## Boundary

This is an educational research feed. It is not diagnostic interpretation, not medical advice, and not a replacement for clinical genetics or pharmacogenomic review.
