# CYP2D6 Null Definition

This is the base definition for the CYP2D6 flagship model.

The project object is not simply:

> poor metabolizer

The project object is:

> missing, severely reduced, or medically unavailable CYP2D6 function, separated by mechanism and compartment.

## Core States

### True Inherited Null

Inherited absence or nonfunction of CYP2D6 activity from no-function alleles, biallelic no-function combinations, or equivalent genetic loss.

This is the central Nulls Project state.

Question:

> What does the body miss when CYP2D6 function is absent across expression compartments?

Boundary:

Not every downstream phenotype is known. Each substrate and tissue requires evidence.

### Whole-Gene Deletion

`CYP2D6*5` is the clean structural example: the CYP2D6 gene is deleted.

Question:

> Does structural loss remove enzyme capacity in every CYP2D6-expressing compartment?

Boundary:

Consumer SNP files can miss deletion, duplication, hybrid alleles, gene conversions, and phasing.

### Named No-Function Star Alleles

These are PharmVar/CPIC-compatible alleles assigned no function, such as `CYP2D6*4` and other CPIC no-function rows.

Question:

> Which named alleles are strict nulls, and which only reduce activity?

Boundary:

The star allele label needs copy-number, phasing, and structural context.

### Residual Or Decreased Function

Examples include `CYP2D6*10` and `CYP2D6*41`.

These can approximate null behavior for some substrates but are not true inherited absence.

Question:

> When does residual activity meaningfully change accumulation or metabolite formation compared with true null?

Boundary:

Do not collapse decreased function into true null.

### Clinical Poor Metabolizer Label

Poor metabolizer is a phenotype translation bucket. It can represent true no-function diplotypes, incomplete testing, or activity-score assumptions.

Question:

> Does the label map to actual missing CYP2D6 function, or only a report-level category?

Boundary:

Use poor metabolizer labels as comparators, not as the core Nulls object.

### Medically Induced Functional Null

Strong CYP2D6 inhibitors can suppress CYP2D6 activity while present.

Question:

> Which compartments are actually silenced by the inhibitor?

Boundary:

Liver/systemic phenoconversion may not reproduce inherited brain, barrier, adipose, or other tissue-local absence.

### Tissue-Local Null Question

Some claims are compartment-specific. Local CYP2D6 expression, substrate access, and inhibitor penetration all matter.

Question:

> Is the observed effect driven by local CYP2D6 absence or systemic exposure reaching a target tissue?

Boundary:

Each compartment needs its own evidence tier.

### Opposite States Excluded

Ultrarapid, increased-function, and duplication states belong only as directionality contrast.

They do not belong in strict-null filters.

## Evidence Ladder

The CYP2D6 model uses this order:

1. Human inherited null or deletion phenotype.
2. Human medication, xenobiotic, or biomarker response.
3. Human brain functional evidence.
4. Human tissue expression evidence.
5. Animal brain in vivo pathway evidence.
6. Human enzyme or cell-system biochemistry.
7. Hypothesis-only mechanism.

## Required Separation For Future Genes

Every future deep null dossier should preserve this split:

- null-state model;
- strict/review variant split;
- substrate and pathway map;
- tissue or compartment map;
- inherited-null versus medically-induced-null comparison;
- source confidence labels;
- non-diagnostic boundary;
- static API feed.

## Static Data

- Base model: <https://diogonmpacheco.github.io/nulls-project/data/cyp2d6-base-model.json>
- Substrates: <https://diogonmpacheco.github.io/nulls-project/data/cyp2d6-substrates.json>
- CYP2D6 variants: <https://diogonmpacheco.github.io/nulls-project/data/cyp2d6-variants.json>
- Bundled API: <https://diogonmpacheco.github.io/nulls-project/api/cyp2d6-base.json>
