import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = new Date().toISOString();
const atlas = JSON.parse(await readFile("data/nulls-atlas.json", "utf8"));
const genes = atlas.genes.map(gene => gene.symbol);

async function fetchGene(symbol) {
  const url = `https://rest.ensembl.org/lookup/symbol/homo_sapiens/${encodeURIComponent(symbol)}?content-type=application/json`;
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "nulls-project-ensembl-lookup/0.1"
      }
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        symbol,
        ok: false,
        status: response.status,
        url,
        elapsedMs: Date.now() - startedAt,
        error: text.slice(0, 240)
      };
    }
    const payload = JSON.parse(text);
    return {
      symbol,
      ok: true,
      status: response.status,
      url,
      elapsedMs: Date.now() - startedAt,
      ensemblGeneId: payload.id,
      displayName: payload.display_name,
      description: payload.description,
      biotype: payload.biotype,
      assembly: payload.assembly_name,
      seqRegionName: payload.seq_region_name,
      start: payload.start,
      end: payload.end,
      strand: payload.strand,
      canonicalTranscript: payload.canonical_transcript,
      version: payload.version
    };
  } catch (error) {
    return {
      symbol,
      ok: false,
      url,
      elapsedMs: Date.now() - startedAt,
      error: error.message
    };
  }
}

const records = [];
for (const symbol of genes) {
  records.push(await fetchGene(symbol));
}

const output = {
  schema: "nulls-project.ensembl-gene-lookups.v0",
  generated,
  source: "https://rest.ensembl.org/lookup/symbol/homo_sapiens/:symbol",
  sourceAtlas: {
    schema: atlas.schema,
    version: atlas.metadata.version,
    released: atlas.metadata.released
  },
  records
};

await mkdir("data/imports", { recursive: true });
await writeFile("data/imports/ensembl-gene-lookups.json", `${JSON.stringify(output, null, 2)}\n`);

const okCount = records.filter(record => record.ok).length;
console.log(`Wrote data/imports/ensembl-gene-lookups.json (${okCount}/${records.length} genes found).`);
