# Source Confidence Labels

The Nulls Project separates evidence type from evidence strength.

An evidence tier answers:

> How strong is this gene or row in the atlas?

A source confidence label answers:

> What kind of evidence is this?

## Current Labels

- `human-null-phenotype` - human phenotype evidence tied to inherited null, biallelic deficiency, hemizygous deficiency, or enzyme absence.
- `human-drug-response` - human medication or external-substrate response evidence.
- `clinical-guideline` - CPIC, FDA, PharmGKB, ClinGen, or similar curated clinical guidance context.
- `human-enzyme-activity` - human enzyme activity, activity score, metabolite ratio, or functional assay evidence.
- `phenotype-assay` - measured phenotype such as enzyme activity, metabolite ratio, or functional deficiency assay.
- `human-expression` - human tissue expression evidence.
- `human-brain-function` - human brain functional evidence rather than only expression.
- `animal-brain-in-vivo` - animal brain in vivo evidence supporting local pathway plausibility.
- `in-vitro-biochemistry` - biochemical or cell-system evidence, not direct human phenotype.
- `external-exposure-biomarker` - food, xenobiotic, medication, or exposure biomarker evidence.
- `population-lof` - population human loss-of-function association, including protective LoF.
- `gene-level-target-validation` - human genetics used for therapeutic target validation.
- `dosage-curation` - haploinsufficiency or dosage-sensitivity curation.
- `computational-consequence` - consequence annotation such as VEP high-impact terms; requires curation before interpretation.
- `hypothesis-only` - plausible or exploratory mechanism without enough direct human evidence.

## CYP2D6 Example

`CYP2D6` has multiple confidence labels because the evidence is mixed by layer:

- clinical drug-response evidence is strong;
- human enzyme/activity evidence is strong;
- human brain expression and function are source-linked;
- serotonin/dopamine/anandamide routes include biochemical and animal-brain evidence;
- solanidine is a strong exposure biomarker but not a direct toxicity threshold.

This avoids flattening CYP2D6 into either "just pharmacogenomics" or "all CNS effects proven."

## Static Data

The machine-readable map lives at:

<https://diogonmpacheco.github.io/nulls-project/data/source-confidence-map.json>
