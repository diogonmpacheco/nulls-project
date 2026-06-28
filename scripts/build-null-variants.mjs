import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = "2026-06-28";
const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const atlas = await readJson("data/nulls-atlas.json");
const ingestMap = await readJson("data/null-ingest-map.json");
const cyp2d6 = await readJson("data/cyp2d6-null-ingest.json");
const confidenceMap = await readJson("data/source-confidence-map.json");

function markerStrictness(gene, marker, profile) {
  const text = `${marker.label} ${marker.interpretation || ""} ${gene.nullStateLabel || ""}`.toLowerCase();
  if (text.includes("increased-function") || text.includes("increased function")) return false;
  if (text.includes("decreased-function") || text.includes("decreased/no-function") || text.includes("reduced")) return false;
  if (text.includes("no-function") || text.includes("whole-gene deletion") || text.includes("deficient phenotype")) return true;
  if ((gene.flags || []).includes("protective")) return true;
  return Boolean(profile?.strictNull && !text.includes("low-function"));
}

function confidenceFromEvidence(gene, strictNull) {
  if (gene.tier === "tier-1" && strictNull) return "high";
  if (gene.tier === "tier-1") return "moderate";
  if (gene.tier === "tier-2") return "moderate";
  return "review";
}

function markerMechanism(marker, strictNull) {
  const text = `${marker.label} ${marker.interpretation || ""}`.toLowerCase();
  if (text.includes("whole-gene deletion")) return "whole-gene deletion";
  if (text.includes("deficient phenotype")) return "deficiency phenotype";
  if (text.includes("no-function")) return "named no-function allele";
  if (text.includes("decreased")) return "decreased-function review";
  if (text.includes("increased")) return "opposite-state contrast";
  return strictNull ? "loss-of-function candidate" : "review";
}

const records = [];

for (const gene of atlas.genes) {
  const profile = ingestMap.genes[gene.id];
  for (const marker of gene.markers || []) {
    const strictNull = markerStrictness(gene, marker, profile);
    const confidenceProfile = confidenceMap.genes[gene.id];
    records.push({
      id: `${gene.id}:${marker.label.replaceAll(" ", "_").replaceAll("/", "_")}`,
      gene: gene.id,
      symbol: gene.symbol,
      label: marker.label,
      system: marker.system,
      dbsnp: marker.dbsnp || null,
      allele: marker.label.includes("*") ? marker.label : null,
      mechanism: markerMechanism(marker, strictNull),
      strictNull,
      reviewStatus: strictNull ? "strict-null" : "review",
      sourceLayer: "atlas-marker",
      source: marker.seed || "atlas",
      confidence: confidenceFromEvidence(gene, strictNull),
      confidenceLabels: confidenceProfile?.labels || [],
      confidenceSummary: confidenceProfile?.summary || "No confidence profile in v0.",
      nullModes: profile?.nullModes || [],
      curationTags: profile?.curationTags || [],
      caveats: [
        ...(marker.interpretation ? [marker.interpretation] : []),
        ...(strictNull ? [] : ["Not kept by strict true-null filters unless reviewed."])
      ]
    });
  }

  if (!(gene.markers || []).length && (gene.flags || []).includes("protective")) {
    const confidenceProfile = confidenceMap.genes[gene.id];
    records.push({
      id: `${gene.id}:gene_level_protective_lof`,
      gene: gene.id,
      symbol: gene.symbol,
      label: `${gene.symbol} gene-level protective loss-of-function`,
      system: "gene-level LoF",
      dbsnp: null,
      allele: null,
      mechanism: "protective loss-of-function",
      strictNull: true,
      reviewStatus: "strict-null",
      sourceLayer: "atlas-gene-level",
      source: (gene.sources || [])[0] || "atlas",
      confidence: confidenceFromEvidence(gene, true),
      confidenceLabels: confidenceProfile?.labels || [],
      confidenceSummary: confidenceProfile?.summary || "No confidence profile in v0.",
      nullModes: profile?.nullModes || [],
      curationTags: profile?.curationTags || [],
      caveats: ["Gene-level row until specific LoF variants are imported from ClinVar/gnomAD/Open Targets."]
    });
  }
}

const existingIds = new Set(records.map(record => record.id));
for (const row of cyp2d6.noFunctionAlleles || []) {
  const id = `CYP2D6:${row.alleleName.replaceAll("*", "star")}`;
  if (existingIds.has(id) || row.alleleName === "*4" || row.alleleName === "*5") continue;
  records.push({
    id,
    gene: "CYP2D6",
    symbol: "CYP2D6",
    label: row.allele,
    system: "CPIC allele",
    dbsnp: null,
    allele: row.allele,
    mechanism: row.mechanism,
    strictNull: true,
    reviewStatus: "strict-null",
    sourceLayer: "cpic-no-function-allele",
    source: "cpic-api",
    confidence: row.strength === "Strong" || row.strength === "Definitve" ? "high" : "moderate",
    confidenceLabels: confidenceMap.genes.CYP2D6?.labels || [],
    confidenceSummary: confidenceMap.genes.CYP2D6?.summary || "No confidence profile in v0.",
    nullModes: cyp2d6.profile.nullModes,
    curationTags: cyp2d6.profile.curationTags,
    caveats: [
      `CPIC clinical functional status: ${row.clinicalFunctionalStatus}.`,
      `Activity value: ${row.activityValue}.`,
      row.strength ? `CPIC strength: ${row.strength}.` : "CPIC strength not returned."
    ]
  });
}

const output = {
  schema: "nulls-project.null-variants.v0",
  generated,
  boundary: "Variant rows are a curation and ingestion layer, not personal interpretation. Consumer DNA files may miss structural variants, phasing, and copy number.",
  sourceAtlas: {
    schema: atlas.schema,
    version: atlas.metadata.version,
    released: atlas.metadata.released
  },
  counts: {
    records: records.length,
    strictNull: records.filter(record => record.strictNull).length,
    review: records.filter(record => !record.strictNull).length,
    cyp2d6: records.filter(record => record.gene === "CYP2D6").length,
    geneLevel: records.filter(record => record.sourceLayer === "atlas-gene-level").length
  },
  records
};

await mkdir("api", { recursive: true });
await writeJson("data/null-variants.json", output);
await writeJson("api/null-variants.json", output);

console.log(`Built ${records.length} null-variant rows.`);
