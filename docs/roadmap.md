# Public Roadmap

This roadmap is written as issue-ready work packages. Each item should preserve the project boundary: educational research reference, not diagnosis or medical advice.

## Issue 1 - Fetch CPIC Allele Function For All Current Genes

Goal: extend the current CYP2D6 CPIC pull to all pharmacogenes in the atlas.

Scope:

- CYP2D6
- CYP2C19
- DPYD
- TPMT
- NUDT15
- G6PD
- BCHE
- UGT1A1

Deliverables:

- generated CPIC allele-function snapshots;
- strict/review mapping for no-function and decreased-function alleles;
- source confidence labels per row;
- regression check that increased/ultrarapid alleles stay out of strict-null filters.

## Issue 2 - Fetch PharmVar Named No-Function Alleles

Goal: add source-specific PharmVar import for star alleles and structural allele context.

Deliverables:

- PharmVar download/API fetch script;
- normalized star-allele rows;
- no-function vs decreased/uncertain function split;
- CYP2D6 copy-number and hybrid-allele caveat preserved.

## Issue 3 - ClinVar Loss-Of-Function Import

Goal: import ClinVar records where clinical assertion and mechanism support null or deficiency interpretation.

Deliverables:

- ClinVar E-utilities fetch script;
- high-impact LoF and deficiency filters;
- conflict/VUS exclusion by default;
- ClinVar source-confidence labels.

## Issue 4 - gnomAD pLoF And Constraint Import

Goal: add population pLoF context for null tolerance, homozygous/hemizygous observations, and protective-null expansion.

Deliverables:

- gnomAD metadata/download fetch script;
- pLoF/high-confidence LoF filter;
- gene-level constraint fields where available;
- special handling for PCSK9 and ANGPTL3.

## Issue 5 - CYP2D6 Tissue Evidence Expansion

Goal: strengthen the body map with source-linked tissue evidence.

Deliverables:

- brain-region evidence rows;
- BBB/barrier rows;
- gut and first-pass rows;
- kidney/urine biomarker rows;
- adipose/distribution rows;
- endocrine/reproductive and immune hypothesis rows labeled with evidence boundaries.

## Issue 6 - CYP2D6 Endogenous Substrate Expansion

Goal: expand the endogenous CNS substrate map beyond the first four rows.

Deliverables:

- serotonin-regeneration route review;
- tyramine-to-dopamine route review;
- anandamide/endocannabinoid route review;
- external CNS-active substrate competition map;
- null-vs-induced-vs-residual-function comparison.

## Issue 7 - Variant Feed UI

Goal: make `data/null-variants.json` usable in the browser.

Deliverables:

- variant table view;
- strict/review filter;
- source confidence filter;
- gene filter;
- mechanism filter;
- source-layer filter.

## Issue 8 - Release Versioning And Provenance

Goal: make each generated feed auditable.

Deliverables:

- generated timestamp policy;
- source snapshot version display;
- feed checksums;
- reproducible build command;
- changelog for feed schema changes.

## Issue 9 - Diognosis Nulls Lens Contract

Goal: define a conservative import contract from The Nulls Project into Diognosis.

Deliverables:

- JSON contract for medication-focused null rows;
- exclusion of exploratory tissue/endogenous rows from medication recommendations;
- explicit clinical boundary text;
- source links back to Nulls Project dossier sections.

## Issue 10 - Add More Systemic Null Candidates

Goal: expand beyond the first ten genes while keeping the project distinct from generic PGx or risk panels.

Candidate genes:

- CYP2C9
- CYP3A5
- NAT2
- SLCO1B1
- APOC3
- APOE loss-of-function contexts
- HBB/HBA deficiency contexts where educational framing is safe

Deliverables:

- inclusion rule review;
- strict-null vs low-function split;
- source confidence labels;
- no-diagnosis boundaries.
