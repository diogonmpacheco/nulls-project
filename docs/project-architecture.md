# Project Architecture

The Nulls Project should be structured as a curation-grade static data site backed by a property graph.

The core architecture problem is not missing data. It is separation of responsibility. The repository started by mixing public copy, scientific claims, hand-curated models, imported source snapshots, generated feeds, and API outputs in ways that would become hard to audit as CYP2D6 deepens.

The target database shape is a graph because the product needs to connect genes, null states, variants, substrates, exposure cases, compartments, evidence lanes, claims, caveats, and sources without flattening them into one table.

## Target Layers

### 1. Product Copy

Purpose: explain the project to readers.

Rules:

- no unique scientific facts;
- no hidden source of truth;
- no diagnosis, dosing, or treatment advice;
- summarize curated model rows only.

Candidate location:

```text
content/public/
content/glossary/
```

### 2. Evidence Registry

Purpose: store source-linked claims and evidence vocabulary.

Rules:

- every claim has a source trail;
- every claim has a lane: `evidence`, `hypothesis`, `product_framing`, or `boundary`;
- every scientific row has source confidence labels;
- hypotheses are first-class rows, not hidden in prose.

Candidate location:

```text
evidence/sources.json
evidence/claims.json
evidence/confidence-labels.json
evidence/tiers.json
```

### 3. Curated Gene Models

Purpose: store hand-curated model data by gene.

Rules:

- each gene has a local source of truth;
- null states, variants, compartments, substrates, and exposures are separate files;
- decreased function and poor-metabolizer labels do not collapse into strict nulls;
- callability caveats live beside variant data.

Candidate location:

```text
models/genes/CYP2D6/gene.json
models/genes/CYP2D6/null-states.json
models/genes/CYP2D6/variants.json
models/genes/CYP2D6/substrates.json
models/genes/CYP2D6/compartments.json
models/genes/CYP2D6/exposures.json
models/genes/CYP2D6/caveats.json
```

### 4. Imported Source Snapshots

Purpose: preserve upstream fetches exactly enough for reproducibility.

Rules:

- timestamped;
- not manually normalized in place;
- source license and URL preserved where needed;
- fetch scripts write here.

Current location already matches this direction:

```text
data/imports/
```

### 5. Generated Feeds

Purpose: expose normalized records for the app and external users.

Rules:

- never hand-edit generated feeds;
- include schema, generated date, source snapshot references, and counts;
- fail validation when generated outputs drift from curated inputs;
- keep public API aliases stable even if internal model files move.

Candidate location:

```text
data/generated/nulls-only.json
data/generated/null-variants.json
data/generated/genes/CYP2D6.json
data/generated/genes/CYP2D6-variants.json
```

### 6. Static API

Purpose: stable GitHub Pages paths for consumers.

Rules:

- treat `api/` as a distribution layer;
- allow aliases to generated data;
- version schema changes explicitly;
- document filters and boundaries.

Candidate location:

```text
api/index.json
api/nulls.json
api/null-variants.json
api/genes/CYP2D6.json
```

### 7. Graph Database Export

Purpose: connect the project entities as nodes and edges.

Rules:

- generated only from canonical source models;
- every scientific node keeps `claimType`, `strictNullRelevance`, evidence lane, and source edges;
- compatible with static use today and graph databases later;
- no personal genotype interpretation.

Current generated endpoints:

```text
data/generated/nulls-graph.json
data/generated/genes/CYP2D6.json
api/graph.json
api/genes/CYP2D6.json
```

## Proposed Repo Shape

```text
assets/
content/
  public/
  glossary/
evidence/
  claims.json
  confidence-labels.json
  sources.json
  tiers.json
models/
  genes/
    CYP2D6/
      gene.json
      null-states.json
      variants.json
      substrates.json
      compartments.json
      exposures.json
      caveats.json
data/
  imports/
  generated/
    nulls-graph.json
    genes/
      CYP2D6.json
api/
  graph.json
  genes/
    CYP2D6.json
docs/
scripts/
```

## Current To Target Mapping

| Current file | Target role |
| --- | --- |
| `data/nulls-atlas.json` | split into gene summaries, curated gene models, and generated atlas output |
| `data/cyp2d6-base-model.json` | `models/genes/CYP2D6/null-states.json` plus `gene.json` |
| `data/cyp2d6-substrates.json` | `models/genes/CYP2D6/substrates.json` |
| `data/cyp2d6-variants.json` | generated from `models/genes/CYP2D6/variants.json` and imports |
| `data/null-variants.json` | generated aggregate variant feed |
| `data/source-confidence-map.json` | `evidence/confidence-labels.json` plus gene evidence profile |
| `data/ingest-sources.json` | `evidence/sources.json` |
| `docs/*.md` | methods, narrative explanation, roadmap, and public reasoning |
| `api/*.json` | stable distribution aliases |
| `api/graph.json` | generated property graph distribution endpoint |
| `api/genes/CYP2D6.json` | generated graph-backed CYP2D6 bundle |

## CYP2D6 Pilot Structure

The CYP2D6 model should become the first fully separated dossier.

### `gene.json`

Identity, purpose, review status, public summary, and global caveats.

### `null-states.json`

Rows for:

- true inherited null;
- whole-gene deletion;
- named no-function star alleles;
- decreased or residual function;
- clinical poor-metabolizer label;
- medically induced functional null;
- tissue-local null question;
- opposite states excluded.

### `variants.json`

Rows for named alleles and structural patterns.

Required fields:

- `strictNull`;
- `reviewStatus`;
- `mechanism`;
- `functionAssignment`;
- `callabilityCaveats`;
- `sourceIds`;
- `evidenceLane`.

### `substrates.json`

Rows for endogenous, exposure, medication, probe, and inhibitor contexts.

Required fields:

- `category`;
- `substrateType`;
- `trueNullEffect`;
- `residualFunctionEffect`;
- `inducedNullEffect`;
- `compartmentFocus`;
- `evidenceLane`;
- `sourceIds`;
- `clinicalBoundary`.

### `compartments.json`

Rows for liver, brain/CNS, barrier, gut, cardiovascular, kidney, adipose, endocrine/reproductive, immune, and unresolved peripheral contexts.

Each row should state whether the evidence is expression, functional metabolism, phenotype, biomarker, or hypothesis.

### `exposures.json`

Start with solanidine.

Rows should separate:

- exposure source;
- biomarker;
- accumulation claim;
- toxicity boundary;
- tissue-specific uncertainty;
- true null vs decreased function vs induced null.

## Minimum Schema Rule

Every scientific row should carry:

```json
{
  "id": "...",
  "gene": "CYP2D6",
  "claimType": "evidence | hypothesis | product_framing | boundary",
  "evidenceLane": "...",
  "sourceIds": [],
  "strictNullRelevance": "strict | review | excluded | comparator",
  "clinicalBoundary": "..."
}
```

## Two-Week Structural Plan

### Week 1

- Freeze the CYP2D6 null-state taxonomy.
- Create canonical `models/genes/CYP2D6/` files.
- Move CYP2D6 curated rows out of mixed `data/` files.
- Convert current CYP2D6 prose claims into source-linked claim rows.
- Add validation for required fields, generated counts, and stale API outputs.

### Week 2

- Generate `api/genes/CYP2D6.json`.
- Generate aggregate `api/nulls.json` and `api/null-variants.json` from canonical models.
- Add a browser variant table with strict/review/source filters.
- Add source snapshot dates and checksums to generated feeds.
- Publish a CYP2D6 v0.2 dossier where every visible claim is traceable to a curated row.

## Structural Risks

1. **Source-of-truth drift.**
   CYP2D6 facts are currently spread across README, docs, atlas JSON, base-model JSON, substrate JSON, and API output.

2. **Claim-lane drift.**
   Conservative prose exists, but schemas do not yet force the distinction between evidence, hypothesis, framing, and boundary.

3. **Generated-data ambiguity.**
   `data/` contains both curated inputs and generated outputs.

4. **Tier inflation.**
   The first ten genes share high-level status, but only CYP2D6 has deep modeling.

5. **CYP2D6 callability risk.**
   CYP2D6 true-null interpretation needs copy-number, deletion, hybrid-allele, and phasing-aware caveats. A static variant feed must not imply that SNP-only data can safely call true null status.

## Next Architectural Move

Do not add more genes yet.

Make CYP2D6 structurally clean first. Once CYP2D6 has canonical model files, generated feeds, validation, and a stable `api/genes/CYP2D6.json`, the next gene should test whether the architecture generalizes.
