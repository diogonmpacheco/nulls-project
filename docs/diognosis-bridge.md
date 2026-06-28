# Diognosis Bridge

The Nulls Project is separate from Diognosis.

Diognosis is medication-first. The Nulls Project is gene-first.

## What Was Reused In v0

This draft uses selected seed rows from the local Diognosis clinical standards bridge:

```text
/Users/diogopacheco/Documents/GitHub/medcheck/src/data/clinicalStandards.js
```

Diognosis version label:

```text
2026-06-21-batch31-high-impact-standards
```

Seeded rows include:

- PGx marker labels;
- selected dbSNP identifiers;
- star-allele or phenotype wording;
- conservative review framing for medication-relevant genes.

## Genes Seeded From Diognosis

- `CYP2D6`
- `CYP2C19`
- `DPYD`
- `TPMT`
- `NUDT15`
- `G6PD`
- `BCHE`
- `UGT1A1`

## Genes Added As Atlas-First Records

- `PCSK9`
- `ANGPTL3`

These are not primarily Diognosis records. They exist to keep the Nulls Project from becoming only a pharmacogenomics panel. They show protective and target-validation null biology.

## Future Integration Back To Diognosis

The safest future Diognosis integration is a dedicated **Nulls Lens**:

- show only medication-relevant null or low-function contexts;
- preserve the Diognosis evidence and safety boundary;
- avoid turning Diognosis into a general genetics atlas;
- link outward to The Nulls Project for broader gene context.

Candidate Diognosis integrations:

- CYP2D6 deep model for prodrugs, parent exposure, active metabolites, and phenoconversion;
- DPYD fluoropyrimidine toxicity context;
- TPMT and NUDT15 thiopurine context;
- G6PD oxidative drug context;
- BCHE anesthesia context;
- UGT1A1 SN-38 and bilirubin context.

## Shared Data Shape

The two projects should eventually share:

- gene symbol;
- stable marker labels;
- source identifiers;
- evidence tier;
- caveats;
- null mechanism;
- phenotype direction;
- clinical boundary text.

They should not share:

- full application state;
- personal user data;
- raw DNA upload handling;
- clinical recommendation wording.

