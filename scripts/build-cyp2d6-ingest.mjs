import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = new Date().toISOString();
const seedAlleles = ["*4", "*5", "*10", "*41"];
const strongInhibitors = ["bupropion", "fluoxetine", "paroxetine", "quinidine", "terbinafine"];

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const atlas = await readJson("data/nulls-atlas.json");
const ingestMap = await readJson("data/null-ingest-map.json");
const ensemblLookups = await readJson("data/imports/ensembl-gene-lookups.json");
const gene = atlas.genes.find(record => record.id === "CYP2D6");
const profile = ingestMap.genes.CYP2D6;
const ensembl = ensemblLookups.records.find(record => record.symbol === "CYP2D6");

if (!gene || !profile || !ensembl?.ok) {
  throw new Error("Missing CYP2D6 atlas, ingest profile, or Ensembl lookup.");
}

async function fetchCpicAlleles(url, label) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "nulls-project-cyp2d6-ingest/0.1"
    }
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`CPIC ${label} failed ${response.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

const select = "genesymbol,name,clinicalfunctionalstatus,activityvalue,strength,findings";
const encodedSeedNames = seedAlleles.map(allele => `%22${allele}%22`).join(",");
const [seedRows, noFunctionRows] = await Promise.all([
  fetchCpicAlleles(
    `https://api.cpicpgx.org/v1/allele?select=${select}&genesymbol=eq.CYP2D6&name=in.(${encodedSeedNames})&order=name`,
    "seed alleles"
  ),
  fetchCpicAlleles(
    `https://api.cpicpgx.org/v1/allele?select=${select}&genesymbol=eq.CYP2D6&clinicalfunctionalstatus=eq.No%20function&order=name`,
    "no-function alleles"
  )
]);

const cpicByName = new Map([...noFunctionRows, ...seedRows].map(row => [row.name, row]));

function strictFromCpic(row) {
  return row?.clinicalfunctionalstatus === "No function" && row?.activityvalue === "0.0";
}

function mechanismForAllele(name, row) {
  if (name === "*5") return "whole-gene deletion";
  if (row?.clinicalfunctionalstatus === "No function") return "named no-function allele";
  return "decreased-function review allele";
}

const alleleRecords = seedAlleles.map(name => {
  const row = cpicByName.get(name);
  const strictNull = strictFromCpic(row);
  return {
    gene: "CYP2D6",
    allele: `CYP2D6${name}`,
    alleleName: name,
    source: "cpic-api",
    sourceUrl: `https://api.cpicpgx.org/v1/allele?genesymbol=eq.CYP2D6&name=eq.${encodeURIComponent(name)}`,
    strictNull,
    reviewStatus: strictNull ? "strict-null" : "review-low-function",
    mechanism: mechanismForAllele(name, row),
    clinicalFunctionalStatus: row?.clinicalfunctionalstatus || "not returned",
    activityValue: row?.activityvalue || null,
    strength: row?.strength || null,
    evidenceSummary: row?.findings || "No CPIC findings returned for this allele.",
    nullsInterpretation: strictNull
      ? "Keep in strict CYP2D6 null filters."
      : "Keep as reduced-function comparator/review row; do not collapse into true null.",
    sourceTags: ["cpic-api", "pharmvar-compatible-star-allele", strictNull ? "strict-null" : "review"]
  };
});

const noFunctionAlleles = noFunctionRows.map(row => ({
  gene: "CYP2D6",
  allele: `CYP2D6${row.name}`,
  alleleName: row.name,
  strictNull: true,
  mechanism: row.name === "*5" ? "whole-gene deletion" : "named no-function allele",
  clinicalFunctionalStatus: row.clinicalfunctionalstatus,
  activityValue: row.activityvalue,
  strength: row.strength,
  source: "cpic-api",
  sourceTags: ["cpic-api", "strict-null"]
}));

const phenoconversionRecord = {
  gene: "CYP2D6",
  mode: "medically-induced-functional-null",
  strictNull: false,
  reviewStatus: "induced-functional-null",
  mechanism: "strong inhibitor phenoconversion",
  inhibitors: strongInhibitors,
  source: "nulls-project-curation",
  sourceTags: ["phenoconversion", "functional-null", "requires-current-medication-context"],
  nullsInterpretation: "Can suppress CYP2D6 activity while present, especially liver/systemic activity, but may not reproduce inherited whole-body absence."
};

const output = {
  schema: "nulls-project.cyp2d6-ingest.v0",
  generated,
  gene: {
    symbol: "CYP2D6",
    ensemblGeneId: ensembl.ensemblGeneId,
    canonicalTranscript: ensembl.canonicalTranscript,
    assembly: ensembl.assembly,
    location: {
      seqRegionName: ensembl.seqRegionName,
      start: ensembl.start,
      end: ensembl.end,
      strand: ensembl.strand
    }
  },
  profile: {
    strictNull: profile.strictNull,
    nullModes: profile.nullModes,
    curationTags: profile.curationTags,
    rules: profile.geneSpecificRules
  },
  sourcePulls: {
    cpicSeedAlleles: seedRows.length,
    cpicNoFunctionAlleles: noFunctionRows.length,
    seedAlleles
  },
  records: alleleRecords,
  noFunctionAlleles,
  phenoconversion: phenoconversionRecord
};

await mkdir("data/imports", { recursive: true });
await writeJson("data/imports/cpic-cyp2d6-alleles.json", {
  schema: "nulls-project.cpic-cyp2d6-alleles.v0",
  generated,
  source: "https://api.cpicpgx.org/v1/allele",
  seedRows,
  noFunctionRows
});
await writeJson("data/cyp2d6-null-ingest.json", output);

console.log(`Wrote CYP2D6 ingest with ${alleleRecords.length} seed records and ${noFunctionAlleles.length} CPIC no-function alleles.`);
