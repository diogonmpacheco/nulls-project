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

- show only medication-relevant inherited null, low-function, or medically induced functional-null contexts;
- preserve the Diognosis evidence and safety boundary;
- avoid turning Diognosis into a general genetics atlas;
- link outward to The Nulls Project for broader gene context.

Candidate Diognosis integrations:

- CYP2D6 deep model for prodrugs, parent exposure, active metabolites, phenoconversion, and tissue-resolved null differences;
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

## Translation Rule

Diognosis can use pharmacogenomic labels such as `poor_metabolizer`, `intermediate_metabolizer`, or `ultrarapid_metabolizer`.

The Nulls Project should translate those labels into mechanism:

- no function;
- minimal function;
- reduced function;
- medically inhibited function;
- opposite-state contrast.

Only the first four belong in the atlas core.

## Tissue-Resolved Bridge Rule

Diognosis often needs to answer medication-stack questions quickly:

- Is the parent drug rising?
- Is the active metabolite falling?
- Is the toxic metabolite accumulating?
- Is a strong inhibitor creating functional poor metabolism?

The Nulls Project should answer the deeper reference question:

> Is the medically induced state actually the same as the inherited null, or only a partial imitation in selected compartments?

It should also preserve a question that Diognosis should not try to answer inside medication review:

> Is this true inherited null a systemic missing-function state that deserves serious study beyond pharmacogenomics?

For CYP2D6, this means Diognosis can model hepatic/systemic phenoconversion for medication review, while The Nulls Project keeps a separate map of:

- hepatic/systemic CYP2D6;
- brain/CNS local CYP2D6;
- blood-brain barrier and CNS-entry caveats;
- cardiovascular target-exposure effects;
- source confidence for each compartment.

This distinction is the reason the projects should remain separate but interoperable.
