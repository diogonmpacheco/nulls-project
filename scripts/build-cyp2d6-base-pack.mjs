import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = "2026-06-29";

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const [geneModel, nullStates, substrates, variants, cyp2d6Ingest, atlas] = await Promise.all([
  readJson("models/genes/CYP2D6/gene.json"),
  readJson("models/genes/CYP2D6/null-states.json"),
  readJson("models/genes/CYP2D6/substrates.json"),
  readJson("models/genes/CYP2D6/variants.json"),
  readJson("data/cyp2d6-null-ingest.json"),
  readJson("data/nulls-atlas.json")
]);

const gene = atlas.genes.find(record => record.id === "CYP2D6");
if (!gene) throw new Error("CYP2D6 missing from atlas.");

const baseModel = {
  schema: "nulls-project.cyp2d6-base-model.v0",
  generated,
  gene: {
    symbol: geneModel.symbol,
    name: geneModel.name,
    role: "Reference model for systemic functional-null biology"
  },
  purpose: "Define CYP2D6 as a systemic functional-null reference model with null states, evidence ladder, substrate maps, tissue maps, and interpretation boundaries kept separate.",
  coreThesis: "CYP2D6 null biology is not only a pharmacogenomic drug-response label. A true inherited null can mean missing CYP2D6 enzyme function wherever CYP2D6 is normally active, while a medically induced functional null may only suppress selected compartments.",
  stateModel: nullStates.rows,
  evidenceLadder: [
    { id: "human-null-phenotype", label: "Human null phenotype" },
    { id: "human-drug-response", label: "Human drug response" },
    { id: "human-brain-function", label: "Human brain function" },
    { id: "human-expression", label: "Human expression" },
    { id: "animal-brain-in-vivo", label: "Animal brain in vivo" },
    { id: "in-vitro-biochemistry", label: "In vitro biochemistry" },
    { id: "hypothesis-only", label: "Hypothesis only" }
  ],
  requiredSectionsForFutureGenes: [
    "null-state model",
    "strict/review variant split",
    "substrate and pathway map",
    "tissue or compartment map",
    "inherited-null versus medically-induced-null comparison",
    "source confidence labels",
    "non-diagnostic boundary",
    "static API feed"
  ],
  basePackFiles: [
    "models/genes/CYP2D6/gene.json",
    "models/genes/CYP2D6/null-states.json",
    "models/genes/CYP2D6/substrates.json",
    "models/genes/CYP2D6/variants.json",
    "models/genes/CYP2D6/compartments.json",
    "models/genes/CYP2D6/exposures.json",
    "models/genes/CYP2D6/caveats.json",
    "api/genes/CYP2D6.json",
    "api/graph.json"
  ]
};

const substrateMap = {
  schema: "nulls-project.cyp2d6-substrates.v0",
  generated,
  gene: substrates.gene,
  purpose: "Map CYP2D6 substrates, exposure markers, inhibitors, and pathway-capacity questions without collapsing evidence and hypotheses.",
  boundary: substrates.boundary,
  sources: substrates.sources,
  rows: substrates.rows
};

const variantRecords = variants.rows;
const strictRecords = variantRecords.filter(record => record.strictNull);
const reviewRecords = variantRecords.filter(record => !record.strictNull);

const cyp2d6Variants = {
  schema: "nulls-project.cyp2d6-variants.v0",
  generated,
  sourceFeed: {
    schema: variants.schema,
    generated: variants.generated
  },
  boundary: "CYP2D6 variant rows are an ingestion/reference layer, not personal interpretation. CYP2D6 requires copy-number, deletion, hybrid, and phasing-aware calling.",
  counts: {
    records: variantRecords.length,
    strictNull: strictRecords.length,
    review: reviewRecords.length,
    cpicNoFunctionAlleles: cyp2d6Ingest.noFunctionAlleles?.length || 0,
    seedRows: cyp2d6Ingest.records?.length || 0
  },
  filterHints: {
    strictNullOnly: "records.filter(row => row.strictNull)",
    reviewRows: "records.filter(row => !row.strictNull)",
    structuralRows: "records.filter(row => `${row.mechanism} ${row.label}`.toLowerCase().includes('deletion'))",
    cpicNoFunctionRows: "records.filter(row => row.sourceLayer === 'cpic-no-function-allele')"
  },
  referenceStates: nullStates.rows.map(state => ({
    id: state.id,
    label: state.label,
    strictNull: state.strictNull,
    includeInCore: state.includeInCore,
    claimType: state.claimType,
    strictNullRelevance: state.strictNullRelevance
  })),
  records: variantRecords
};

const substrateCounts = substrateMap.rows.reduce((counts, row) => {
  counts[row.category] = (counts[row.category] || 0) + 1;
  return counts;
}, {});

const basePack = {
  schema: "nulls-project.cyp2d6-base-pack.v0",
  generated,
  boundary: "Educational research reference only. This CYP2D6 model is not diagnostic interpretation and not medication advice.",
  gene: {
    symbol: gene.symbol,
    name: gene.name,
    tier: gene.tier,
    whyStrong: gene.whyStrong
  },
  endpoints: {
    graph: "api/graph.json",
    geneGraph: "api/genes/CYP2D6.json",
    baseModel: "data/cyp2d6-base-model.json",
    substrates: "data/cyp2d6-substrates.json",
    variants: "data/cyp2d6-variants.json",
    nullIngest: "data/cyp2d6-null-ingest.json"
  },
  baseModel,
  substrates: {
    schema: substrateMap.schema,
    generated: substrateMap.generated,
    counts: {
      rows: substrateMap.rows.length,
      byCategory: substrateCounts
    },
    rows: substrateMap.rows
  },
  variants: {
    schema: cyp2d6Variants.schema,
    generated: cyp2d6Variants.generated,
    counts: cyp2d6Variants.counts,
    records: cyp2d6Variants.records
  },
  modelRule: "Keep CYP2D6 state model, variant strictness, substrate map, tissue map, evidence ladder, and explicit non-diagnostic boundary separate."
};

await mkdir("api", { recursive: true });
await writeJson("data/cyp2d6-base-model.json", baseModel);
await writeJson("data/cyp2d6-substrates.json", substrateMap);
await writeJson("data/cyp2d6-variants.json", cyp2d6Variants);
await writeJson("api/cyp2d6-base.json", basePack);

console.log(`Built CYP2D6 model with ${variantRecords.length} variant rows and ${substrateMap.rows.length} substrate rows.`);
