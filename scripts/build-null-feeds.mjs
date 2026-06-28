import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = "2026-06-28";

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
};

const atlas = await readJson("data/nulls-atlas.json");
const ingestMap = await readJson("data/null-ingest-map.json");
const sourceCatalog = await readJson("data/ingest-sources.json");
const confidenceMap = await readJson("data/source-confidence-map.json");

const sourceById = new Map(sourceCatalog.sources.map(source => [source.id, source]));
const missingProfiles = atlas.genes
  .map(gene => gene.id)
  .filter(geneId => !ingestMap.genes[geneId]);

if (missingProfiles.length) {
  throw new Error(`Missing null-ingest profiles for: ${missingProfiles.join(", ")}`);
}

const records = atlas.genes.map(gene => {
  const profile = ingestMap.genes[gene.id];
  const confidenceProfile = confidenceMap.genes[gene.id];
  const sourceLabels = profile.preferredSources.map(sourceId => {
    const source = sourceById.get(sourceId);
    if (!source) throw new Error(`Unknown ingest source ${sourceId} for ${gene.id}`);
    return {
      id: source.id,
      label: source.label,
      category: source.category,
      docsUrl: source.docsUrl
    };
  });

  return {
    id: gene.id,
    symbol: gene.symbol,
    name: gene.name,
    tier: gene.tier,
    strictNull: profile.strictNull,
    nullModes: profile.nullModes,
    nullStateLabel: gene.nullStateLabel,
    oneLine: gene.oneLine,
    domains: gene.domains || [],
    flags: gene.flags || [],
    includeMechanisms: profile.includeMechanisms,
    reviewMechanisms: profile.reviewMechanisms,
    excludeMechanisms: profile.excludeMechanisms,
    seedMarkers: profile.seedMarkers,
    curationTags: profile.curationTags,
    geneSpecificRules: profile.geneSpecificRules,
    preferredSources: sourceLabels,
    confidenceLabels: confidenceProfile?.labels || [],
    confidenceSummary: confidenceProfile?.summary || "No confidence profile in v0.",
    projectSources: gene.sources || [],
    facets: {
      strict: profile.strictNull ? "strict-null" : "review-null-or-low-function",
      protective: (gene.flags || []).includes("protective"),
      pharmacogenomics: (gene.domains || []).includes("pharmacogenomics"),
      systemicCandidate: (gene.flags || []).includes("tissue-resolved") || (gene.domains || []).includes("tissue-resolved biology"),
      inducedNull: profile.nullModes.some(mode => mode.includes("induced")),
      structuralVariantSensitive: profile.curationTags.includes("copy-number-required") || profile.includeMechanisms.some(item => item.toLowerCase().includes("deletion"))
    }
  };
});

const facetCounts = {
  records: records.length,
  strictNull: records.filter(record => record.strictNull).length,
  reviewNullOrLowFunction: records.filter(record => !record.strictNull).length,
  protective: records.filter(record => record.facets.protective).length,
  pharmacogenomics: records.filter(record => record.facets.pharmacogenomics).length,
  systemicCandidate: records.filter(record => record.facets.systemicCandidate).length,
  inducedNull: records.filter(record => record.facets.inducedNull).length
};

const nullsOnlyFeed = {
  schema: "nulls-project.nulls-only.v0",
  generated,
  sourceAtlas: {
    schema: atlas.schema,
    version: atlas.metadata.version,
    released: atlas.metadata.released
  },
  boundary: "Educational research reference only. This feed is not diagnostic interpretation, not medical advice, and not a replacement for clinical genetics or pharmacogenomic review.",
  filters: {
    default: ingestMap.defaultFilter,
    examples: [
      { label: "Strict inherited/protective nulls", predicate: "record.strictNull === true" },
      { label: "Medication-relevant nulls", predicate: "record.facets.pharmacogenomics === true" },
      { label: "Systemic candidates", predicate: "record.facets.systemicCandidate === true" },
      { label: "Protective nulls", predicate: "record.facets.protective === true" },
      { label: "Induced functional nulls", predicate: "record.facets.inducedNull === true" }
    ]
  },
  confidenceLabelDefinitions: confidenceMap.labelDefinitions,
  facetCounts,
  records
};

const apiIndex = {
  schema: "nulls-project.static-api-index.v0",
  generated,
  baseUrl: "https://diogonmpacheco.github.io/nulls-project/",
  endpoints: [
    {
      path: "data/nulls-atlas.json",
      label: "Full curated atlas",
      use: "Human-readable project data with source links, dossiers, endogenous maps, and exposure cases."
    },
    {
      path: "data/nulls-only.json",
      label: "Null-only feed",
      use: "Normalized feed for filtering strict nulls, low-function review records, protective LoF, systemic candidates, and PGx nulls."
    },
    {
      path: "api/nulls.json",
      label: "Static null API alias",
      use: "Same records as data/nulls-only.json, placed under api/ for consumers that expect API-like paths."
    },
    {
      path: "data/null-variants.json",
      label: "Null variant feed",
      use: "Normalized allele, marker, and gene-level LoF rows with strict/review status."
    },
    {
      path: "api/null-variants.json",
      label: "Static null variant API alias",
      use: "Same records as data/null-variants.json, placed under api/ for consumers that expect API-like paths."
    },
    {
      path: "data/null-ingest-map.json",
      label: "Gene-specific ingest rules",
      use: "Per-gene source priorities, include/review/exclude mechanisms, and null-only curation rules."
    },
    {
      path: "data/ingest-sources.json",
      label: "External source catalog",
      use: "Public data sources and filters used to enrich null records."
    },
    {
      path: "data/source-confidence-map.json",
      label: "Source confidence map",
      use: "Evidence-type vocabulary for human null phenotype, enzyme, expression, animal, in vitro, and computational labels."
    }
  ],
  queryPattern: "This is a static GitHub Pages API. Fetch JSON and filter client-side.",
  examples: [
    "records.filter(record => record.strictNull)",
    "records.filter(record => record.facets.systemicCandidate)",
    "records.filter(record => record.symbol === 'CYP2D6')",
    "records.filter(record => record.nullModes.includes('protective-loss-of-function'))"
  ]
};

await mkdir("api", { recursive: true });
await writeJson("data/nulls-only.json", nullsOnlyFeed);
await writeJson("api/nulls.json", nullsOnlyFeed);
await writeJson("api/index.json", apiIndex);

console.log(`Built ${records.length} null-feed records.`);
