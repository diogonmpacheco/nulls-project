# CYP2D6 Null Definition

This is a reader guide for the CYP2D6 pilot model. It is not the source of truth.

Canonical rows live in:

- `models/genes/CYP2D6/null-states.json`
- `models/genes/CYP2D6/variants.json`
- `models/genes/CYP2D6/substrates.json`
- `models/genes/CYP2D6/compartments.json`
- `models/genes/CYP2D6/exposures.json`

Generated public bundles live in:

- <https://diogonmpacheco.github.io/nulls-project/api/genes/CYP2D6.json>
- <https://diogonmpacheco.github.io/nulls-project/api/graph.json>

## Working Definition

The project object is not simply:

> poor metabolizer

The project object is:

> missing, severely reduced, or medically unavailable CYP2D6 function, separated by mechanism and compartment.

## State Classes

The canonical model keeps these states separate:

- true inherited null;
- whole-gene deletion;
- named no-function star allele;
- residual or decreased function;
- clinical poor-metabolizer label;
- medically induced functional null;
- tissue-local or barrier-dependent null question;
- opposite states excluded.

## Boundary

Do not collapse these into one label.

`CYP2D6*5`, `CYP2D6*4`, `CYP2D6*10`, a poor-metabolizer phenotype bucket, and strong-inhibitor phenoconversion can all point toward reduced CYP2D6 function, but they are not the same biological state.

This project is an educational research reference. It is not personal genotyping, diagnosis, medication advice, or dosing guidance.
