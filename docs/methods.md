# Methods

The Nulls Project is a gene-first atlas for human loss-of-function, low-function, deficiency, protective-null, and medically induced functional-null biology.

It is not a clinical decision system.

## Inclusion Rules

The first public draft includes genes that satisfy at least one of these conditions:

- credible human no-function or low-function alleles exist;
- medications, inhibitors, exposures, or acquired states can make the gene behave as a functional null;
- reduced function has a meaningful drug, phenotype, exposure, or protective-biology signal;
- the gene helps teach an important null-biology pattern;
- source-linked evidence can be summarized without pretending to diagnose a person.

## v0 Evidence Tiers

### Tier 1 - Strong Human Function Evidence

Human low-function or null biology is clinically or biologically meaningful, source-linked, and repeatedly useful for interpretation.

Examples in v0:

- `CYP2D6`
- `DPYD`
- `G6PD`
- `PCSK9`

### Tier 2 - Moderate Human Function Evidence

Human evidence is meaningful but narrower, context-dependent, or dependent on specific drug, assay, ancestry, or phenotype framing.

### Tier 3 - Emerging Or Limited Null Evidence

Candidate null observations or mechanism exist, but phenotype mapping needs more replication or curation.

### Tier 4 - Unresolved, Conflicting, Or Phenotype-Negative

Null observations are unclear, conflicting, privacy-limited, or currently phenotype-negative.

## Flags Are Separate From Tiers

Flags describe the kind of record. They do not replace evidence quality.

Current flag examples:

- `deep-dossier`
- `diognosis-seeded`
- `copy-number-sensitive`
- `phenoconversion`
- `protective`
- `clinician-review-needed`
- `ancestry-equity`

## What Counts As A Null

The project uses "null" broadly but labels mechanisms explicitly:

- true no-function allele;
- whole-gene deletion;
- biallelic loss of function;
- hemizygous deficiency;
- reduced enzyme activity;
- promoter or expression reduction;
- functional null caused by inhibitor-driven phenoconversion;
- protective loss of function.

These mechanisms should not be collapsed. The app should show them as different ways function can become unavailable.

## What Does Not Count As A Null

Broad pharmacogenomic phenotype buckets are not the project object.

- "Poor metabolizer" is a clinical translation label. It belongs in the atlas only when it points to no-function, minimal-function, or clinically null-like biology.
- "Ultrarapid metabolizer" is not a null state. It can be shown only as an opposite-state contrast when needed to explain directionality.
- "Risk allele" is not automatically a null. It needs a mechanism.

The main reference problem is functional loss:

> What risks appear when a pathway is genetically absent, genetically weak, or medically switched off?

## Systemic Null Framing

Some nulls may need to be considered more seriously than current genetics and pharmacogenomics products imply.

A true inherited null can be a systemic missing-function state: the body may lack an enzyme or function wherever the gene is normally active. This is not the same as a medication-only pharmacogenomic label, and it is not the same as a temporary inhibitor effect.

The atlas should separate three claims:

- **systemic deficiency candidate** - a true null may remove a function across expression compartments;
- **formal disease claim** - clinical consensus and phenotype mapping support a diagnosis;
- **medication-response claim** - drug exposure, activation, or toxicity changes in a specific treatment context.

The first claim can be important before the second claim is settled. The Nulls Project should preserve that serious biological possibility without turning it into personal diagnosis or treatment advice.

## Tissue-Resolved Nulls

The Nulls Project should not reduce genes to liver or pharmacogenomics labels.

For many genes, the central question is compartment-specific:

- where is this gene or enzyme normally active?
- what happens when inherited biology removes it everywhere it is normally expressed?
- what happens when a drug suppresses only some compartments?
- does the inhibitor cross the relevant barrier?
- does local regulation differ from liver regulation?
- is the phenotype driven by local tissue biology or by systemic exposure reaching a target tissue?

This is especially important for `CYP2D6`.

An inherited CYP2D6 null can mean the enzyme is absent or nonfunctional in compartments where CYP2D6 would normally be expressed, including non-hepatic contexts such as brain/CNS. A medication-induced CYP2D6 null may imitate hepatic/systemic poor function but may not fully imitate brain or barrier-level loss. Brain penetration, transporter behavior, tissue-specific expression, and local regulation matter.

Therefore each mature gene record should eventually separate:

- inherited null;
- medically induced functional null;
- tissue / compartment;
- local expression evidence;
- barrier and distribution caveats;
- phenotype mechanism.

## Exposure And Accumulation Cases

Some null questions only become clear when a substrate, food exposure, metabolite, toxin, or endogenous molecule is followed through the body.

The solanidine case is the first v0 pattern:

- separate the exposure source from the metabolite or biomarker;
- separate acute toxicity from null-state accumulation;
- distinguish true inherited null from clinical poor-metabolizer labels;
- distinguish residual low function from actual missing function;
- distinguish medically induced functional null from inherited absence;
- map parent compound, downstream metabolites, and measurable ratios;
- map gut, liver, plasma, brain, barrier, heart, adipose, kidney/urine, endocrine/reproductive, immune, and unresolved peripheral compartments;
- label every tissue inference by evidence tier;
- avoid turning a biomarker signal into a personal clinical instruction.

For `CYP2D6` and solanidine, plasma biomarker evidence is strong. Tissue-specific human accumulation evidence is not yet strong enough to claim that every body part follows the plasma fold-change. The atlas should preserve that uncertainty instead of flattening it.

## Endogenous And External Substrate Maps

Some missing-function states matter because the gene handles endogenous molecules, external substances, or both.

For `CYP2D6`, v0 begins with candidate endogenous CNS routes:

- 5-methoxytryptamine to serotonin;
- tyramine to dopamine;
- anandamide / endocannabinoid metabolism.

These rows should be interpreted as pathway-capacity questions:

> If CYP2D6 is truly absent, which local routes disappear, and which other synthesis, transport, clearance, or degradation pathways carry the remaining load?

They should not be interpreted as deterministic neurotransmitter claims:

> CYP2D6 null means globally low serotonin or dopamine.

Every endogenous row should label whether the evidence is human enzyme evidence, animal brain evidence, human brain expression/function evidence, human phenotype evidence, or null-specific evidence. External substrates should be mapped beside endogenous substrates because the same missing enzyme can change parent accumulation, active metabolite formation, inactive metabolite formation, and pathway competition.

## Neurodivergent Product Boundary

The atlas should feel like a careful map, not a verdict.

Product rules:

- no genetic risk scores;
- no destiny language;
- no ranking of people;
- no fear-based alerts;
- no medical action prompts;
- no default raw-DNA upload;
- no burying uncertainty in footnotes;
- no treating inconclusive evidence as failure.

## Clinical Boundary

The Nulls Project can say:

> This gene has source-linked evidence that reduced function can matter in this context.

The Nulls Project should not say:

> You personally have this risk, diagnosis, or treatment instruction.

When a context may be medically relevant, wording should direct users toward qualified review without creating false urgency.
