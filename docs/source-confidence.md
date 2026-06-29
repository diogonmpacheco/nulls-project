# Source Confidence Labels

This is a glossary for evidence-lane labels. The machine-readable map is:

<https://diogonmpacheco.github.io/nulls-project/data/source-confidence-map.json>

Evidence tiers answer:

> How strong is this record?

Source confidence labels answer:

> What kind of evidence supports this row?

Common labels include:

- `human-null-phenotype`
- `human-drug-response`
- `clinical-guideline`
- `human-enzyme-activity`
- `human-expression`
- `human-brain-function`
- `animal-brain-in-vivo`
- `in-vitro-biochemistry`
- `external-exposure-biomarker`
- `population-lof`
- `gene-level-target-validation`
- `dosage-curation`
- `computational-consequence`
- `hypothesis-only`

Rows can have more than one label, but labels must stay attached to the correct row type. Variant rows should not inherit broad gene-level CNS or endogenous-pathway labels unless the variant row itself is supported by that evidence.
