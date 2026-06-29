# Solanidine Accumulation Case

This case is the first concrete stress test for The Nulls Project.

It starts from a simple but important distinction:

- `alpha-solanine` and `alpha-chaconine` are major potato glycoalkaloids and belong primarily to food-exposure toxicology.
- `solanidine` is the aglycone and a diet-derived CYP2D6 activity signal.
- A high solanidine signal can show reduced CYP2D6 activity, but it is not automatically a potato-toxicity threshold.

## Why This Belongs In Nulls

The project is not trying to catalog every metabolizer phenotype. It is trying to understand what changes when a function is actually absent, severely reduced, or switched off.

Solanidine is useful because CYP2D6 activity strongly changes the parent-to-metabolite pattern:

- a true inherited CYP2D6 null should produce the strongest parent-solanidine accumulation pattern in compartments where CYP2D6 is normally active;
- a clinical poor metabolizer label can be a useful comparator, but it may hide whether the person is a true no-function/null case, a residual-function case, or a partial genotyping case;
- an induced functional null from a strong inhibitor can reproduce part of the null state, especially liver/systemic activity, but may not reproduce the whole-body true-null state.

The 2024 CYP2D6 biomarker study reported plasma solanidine about 1887% higher in genetic poor metabolizers than in genetic normal metabolizers, and about 74% higher in intermediate metabolizers. The Nulls interpretation is not "poor equals null." The interpretation is: accumulation is large enough that true nulls, residual poor labels, and medically induced nulls must be modeled separately.

## True Null Versus Poor Versus Induced Null

### True Inherited CYP2D6 Null

This is the core Nulls object.

If CYP2D6 is absent or nonfunctional by inherited biology, the missing function may matter wherever CYP2D6 is normally expressed. For solanidine, the expected pattern is high parent solanidine and low CYP2D6-derived metabolites such as 4-OH-solanidine and SSDA.

The open question is tissue distribution. Human plasma evidence is strong. Human brain, adipose, endocrine, reproductive, and other tissue-level solanidine mapping is still not mature enough for strong claims.

### Clinical Poor Metabolizer Label

This is a comparator, not the reference object.

"Poor metabolizer" can mean no-function genotype, incomplete variant coverage, activity-score assumptions, or a clinical phenotype bucket. It may approximate a null in some contexts, but it is not automatically a whole-body true null.

For Nulls, poor metabolizer rows should be used to quantify direction and scale, not to collapse the biology.

### Residual Low-Function / Intermediate

Residual function can change accumulation qualitatively.

An intermediate or reduced-function case may show higher parent solanidine, but some CYP2D6 oxidation remains. This is different from a null-like state where the parent rises and CYP2D6-derived metabolites nearly disappear.

### Medically Induced Functional Null

A strong CYP2D6 inhibitor can create a liver/systemic functional null while the inhibitor is present. That is not necessarily the same as inherited absence across all relevant compartments.

For each tissue, the project should ask:

- does the inhibitor reach this compartment?
- does it reach enough local concentration?
- is CYP2D6 normally expressed there?
- is the phenotype driven by local metabolism or systemic exposure?

## Body-Compartment Model

The case should not stop at liver.

### Gut Lumen And Intestinal Wall

Question: how much alpha-solanine and alpha-chaconine entered from food?

Null difference: CYP2D6 is not the main acute-toxicity driver here. Greening, sprouting, cultivar, storage, peel, dose, membrane effects, and cholinesterase-related toxicology remain the main frame.

### Portal Blood And Liver

Question: how much solanidine reaches hepatic CYP2D6 and CYP3A4/5?

Null difference: true inherited null and strong hepatic inhibition can both raise parent solanidine and lower CYP2D6 metabolites.

### Plasma / Blood

Question: what does the measured solanidine and metabolite ratio show?

Null difference: this is currently the best-supported human compartment for the genotype/activity signal. It should be treated as a biomarker layer, not a direct toxicity threshold.

### Adipose / Lipid Stores

Question: can glycoalkaloids or aglycones persist or release slowly?

Null difference: a true null may raise parent exposure before storage or release, while an induced null depends on inhibitor timing and persistence. Direct human tissue evidence is limited.

### Brain / CNS

Question: does local brain CYP2D6 matter for solanidine or related xenobiotic handling?

Null difference: a true null could remove local CYP2D6 where it is normally expressed. A liver phenoconversion label may not reproduce that CNS state.

### Heart / Autonomic Target Effects

Question: are cardiovascular symptoms exposure-driven, local-tissue-driven, or secondary to GI toxicity?

Null difference: systemic accumulation can affect target exposure, but local cardiac CYP2D6 loss is not established as the key mechanism.

### Kidney And Urine

Question: what metabolites are excreted and measurable?

Null difference: SSDA and other metabolites are useful activity biomarkers. True or induced nulls should lower CYP2D6-derived metabolites while the null state exists.

### Immune / Mast-Cell / Histamine Layer

Question: could chronic glycoalkaloid or solanidine burden influence histamine-like symptoms?

Null difference: this is hypothesis territory. It should be tracked only as exploratory until direct evidence exists.

### Endocrine / Reproductive Tissues

Question: do animal tissue accumulation reports matter biologically in humans?

Null difference: true-null versus induced-null differences are not mapped well enough for strong claims.

### Other Peripheral Tissues

Question: is there direct local measurement, or only a plasma/systemic inference?

Null difference: skin, muscle, lung, spleen, connective tissue, and other remaining compartments should stay unresolved until tissue-specific evidence exists.

## Interpretation Boundary

This case should never be presented as:

> CYP2D6 null means potatoes are unsafe.

It should be presented as:

> Solanidine exposes the difference between inherited absence, residual poor labels, and inhibitor-induced functional nulls, especially when parent accumulation and tissue distribution are separated.

That is the Nulls opportunity.

## Sources

- Solanidine CYP2D6 biomarker study: <https://pubmed.ncbi.nlm.nih.gov/38303026/>
- Solanidine poor metabolizer prediction study: <https://pubmed.ncbi.nlm.nih.gov/36806969/>
- Solanidine metabolites and tamoxifen CYP2D6 activity: <https://pubmed.ncbi.nlm.nih.gov/39039708/>
- SSDA as a urinary CYP2D6 activity biomarker: <https://pmc.ncbi.nlm.nih.gov/articles/PMC9513856/>
- EFSA potato glycoalkaloid risk assessment: <https://efsa.onlinelibrary.wiley.com/doi/abs/10.2903/j.efsa.2020.6222>
- Human alpha-solanine and alpha-chaconine pharmacokinetics: <https://pubmed.ncbi.nlm.nih.gov/15649828/>
- NTP background on alpha-solanine and alpha-chaconine: <https://ntp.niehs.nih.gov/sites/default/files/ntp/htdocs/chem_background/exsumpdf/chaconinesolanine_508.pdf>
