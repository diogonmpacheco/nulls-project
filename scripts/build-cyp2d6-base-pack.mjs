import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = "2026-06-29";

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const [baseModel, substrates, cyp2d6Ingest, nullVariants, atlas] = await Promise.all([
  readJson("data/cyp2d6-base-model.json"),
  readJson("data/cyp2d6-substrates.json"),
  readJson("data/cyp2d6-null-ingest.json"),
  readJson("data/null-variants.json"),
  readJson("data/nulls-atlas.json")
]);

const gene = atlas.genes.find(record => record.id === "CYP2D6");
if (!gene) throw new Error("CYP2D6 missing from atlas.");

const variantRecords = (nullVariants.records || []).filter(record => record.gene === "CYP2D6");
const strictRecords = variantRecords.filter(record => record.strictNull);
const reviewRecords = variantRecords.filter(record => !record.strictNull);

const cyp2d6Variants = {
  schema: "nulls-project.cyp2d6-variants.v0",
  generated,
  sourceFeed: {
    schema: nullVariants.schema,
    generated: nullVariants.generated
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
  referenceStates: baseModel.stateModel.map(state => ({
    id: state.id,
    label: state.label,
    strictNull: state.strictNull,
    includeInCore: state.includeInCore
  })),
  records: variantRecords
};

const substrateCounts = substrates.rows.reduce((counts, row) => {
  counts[row.category] = (counts[row.category] || 0) + 1;
  return counts;
}, {});

const basePack = {
  schema: "nulls-project.cyp2d6-base-pack.v0",
  generated,
  boundary: "Educational research reference only. This base pack is not diagnostic interpretation and not medication advice.",
  gene: {
    symbol: gene.symbol,
    name: gene.name,
    tier: gene.tier,
    whyStrong: gene.whyStrong
  },
  endpoints: {
    baseModel: "data/cyp2d6-base-model.json",
    substrates: "data/cyp2d6-substrates.json",
    variants: "data/cyp2d6-variants.json",
    nullIngest: "data/cyp2d6-null-ingest.json"
  },
  baseModel,
  substrates: {
    schema: substrates.schema,
    generated: substrates.generated,
    counts: {
      rows: substrates.rows.length,
      byCategory: substrateCounts
    },
    rows: substrates.rows
  },
  variants: {
    schema: cyp2d6Variants.schema,
    generated: cyp2d6Variants.generated,
    counts: cyp2d6Variants.counts,
    records: cyp2d6Variants.records
  },
  templateRule: "Future deep dossiers should copy the CYP2D6 split: state model, variant strictness, substrate map, tissue map, evidence ladder, and explicit non-diagnostic boundary."
};

await mkdir("api", { recursive: true });
await writeJson("data/cyp2d6-variants.json", cyp2d6Variants);
await writeJson("api/cyp2d6-base.json", basePack);

console.log(`Built CYP2D6 base pack with ${variantRecords.length} variant rows and ${substrates.rows.length} substrate rows.`);
