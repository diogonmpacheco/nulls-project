# Product Notes

These notes summarize the first specialist passes used to shape the v0 draft.

## Neurodivergent Product Pass

The product should help people explore genetics without turning curiosity into a verdict.

Requirements:

- start with scope and consent;
- use layered disclosure;
- label certainty explicitly;
- separate trait, risk, and diagnosis;
- normalize null, unknown, and ambiguous results;
- provide low-stimulation and summary-first reading modes later;
- let people pause, bookmark, and return;
- use emotionally safe copy near sensitive topics;
- keep medical action boundaries clear;
- make data provenance visible.

Do not:

- rank people;
- score genetic worth;
- use deterministic language;
- gamify sensitive results;
- hide uncertainty;
- imply neurodivergence needs fixing;
- make privacy controls obscure.

Tone target:

> Careful map, not a verdict.

## Information Architecture Pass

The homepage should open as an atlas, not a brochure.

First-page priorities:

- dataset summary;
- global search;
- evidence filters;
- evidence matrix;
- sortable/scannable gene index;
- immediate gene dossier;
- methods and source access.

The table is the center of gravity.

## Genetics Pass

The first ten genes:

- `CYP2D6`
- `CYP2C19`
- `DPYD`
- `TPMT`
- `NUDT15`
- `G6PD`
- `BCHE`
- `UGT1A1`
- `PCSK9`
- `ANGPTL3`

Rationale:

- `CYP2D6` is the flagship because it combines true no-function alleles, copy number, hybrid alleles, medically induced functional nulls, and phenoconversion.
- `DPYD`, `TPMT`, `NUDT15`, `G6PD`, `BCHE`, `CYP2C19`, and `UGT1A1` provide high-value PGx and safety contexts.
- `PCSK9` and `ANGPTL3` prevent the project from being only about danger by showing protective null biology.

## Product Thesis Update

The project should become the reference layer for tissue-resolved functional nulls.

The stronger thesis is that some nulls may be systemic missing-function states that current products under-describe. A true null can mean a person lacks an enzyme or function across the body wherever the gene is normally active. The product should show that seriousness without converting uncertainty into diagnosis.

The important distinction is not only "normal versus poor metabolizer." The important distinction is:

- inherited null across expression compartments;
- low-function genotype that approximates some null behavior;
- medically induced null that may silence liver/systemic function but not every tissue;
- barriers and local regulation that make brain, heart, gut, blood, or target tissue behavior diverge.

For CYP2D6, a true null may remove non-hepatic enzyme biology in a way that a liver-centered PGx label or a medication inhibitor does not fully capture.

The endogenous substrate layer should be visible as pathway load, not as a symptom verdict. For CYP2D6, serotonin-regeneration, tyramine-to-dopamine, and anandamide rows should help users see that a null may remove local routes and force compensation through other pathways, while the UI still labels uncertainty and evidence type.

Phase-two candidates:

- `SLCO1B1`
- `CYP2C9`
- `CYP3A5`
- `NAT2`
- `APOC3`
