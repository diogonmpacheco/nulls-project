import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = new Date().toISOString();

const endpoints = [
  {
    id: "ensembl-rest",
    label: "Ensembl REST",
    url: "https://rest.ensembl.org/info/ping?content-type=application/json",
    parser: payload => ({ ping: payload.ping })
  },
  {
    id: "cpic-api",
    label: "CPIC PostgREST API",
    url: "https://api.cpicpgx.org/v1/",
    parser: payload => ({
      title: payload.info?.title,
      version: payload.info?.version,
      pathCount: Object.keys(payload.paths || {}).length,
      relevantPaths: Object.keys(payload.paths || {})
        .filter(path => /allele|gene|diplotype|phenotype|guideline|recommendation/i.test(path))
        .slice(0, 40)
    })
  },
  {
    id: "clinpgx-api",
    label: "ClinPGx REST API",
    url: "https://api.clinpgx.org/openapi.json",
    parser: payload => ({
      title: payload.info?.title,
      version: payload.info?.version,
      pathCount: Object.keys(payload.paths || {}).length,
      relevantPaths: Object.keys(payload.paths || {})
        .filter(path => /gene|variant|chemical|clinical|annotation|pathway/i.test(path))
        .slice(0, 40)
    })
  },
  {
    id: "clinvar-eutils",
    label: "ClinVar E-utilities",
    url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi?db=clinvar&retmode=json",
    parser: payload => {
      const info = payload.einforesult?.dbinfo?.[0] || {};
      return {
        dbname: info.dbname,
        dbbuild: info.dbbuild,
        count: info.count,
        lastupdate: info.lastupdate
      };
    }
  }
];

const pageChecks = [
  {
    id: "pharmvar-download",
    label: "PharmVar download page",
    url: "https://www.pharmvar.org/download"
  },
  {
    id: "clingen-downloads",
    label: "ClinGen downloads page",
    url: "https://search.clinicalgenome.org/kb/downloads"
  },
  {
    id: "gnomad-downloads",
    label: "gnomAD downloads page",
    url: "https://gnomad.broadinstitute.org/downloads"
  },
  {
    id: "open-targets-docs",
    label: "Open Targets docs",
    url: "https://platform-docs.opentargets.org/"
  }
];

async function fetchJson(endpoint) {
  const startedAt = Date.now();
  try {
    const response = await fetch(endpoint.url, {
      headers: {
        accept: "application/json",
        "user-agent": "nulls-project-source-snapshot/0.1"
      }
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        id: endpoint.id,
        label: endpoint.label,
        url: endpoint.url,
        ok: false,
        status: response.status,
        elapsedMs: Date.now() - startedAt,
        error: text.slice(0, 240)
      };
    }
    const payload = JSON.parse(text);
    return {
      id: endpoint.id,
      label: endpoint.label,
      url: endpoint.url,
      ok: true,
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      summary: endpoint.parser(payload)
    };
  } catch (error) {
    return {
      id: endpoint.id,
      label: endpoint.label,
      url: endpoint.url,
      ok: false,
      elapsedMs: Date.now() - startedAt,
      error: error.message
    };
  }
}

async function checkPage(endpoint) {
  const startedAt = Date.now();
  try {
    const response = await fetch(endpoint.url, {
      headers: {
        accept: "text/html,application/json",
        "user-agent": "nulls-project-source-snapshot/0.1"
      }
    });
    const text = await response.text();
    return {
      id: endpoint.id,
      label: endpoint.label,
      url: endpoint.url,
      ok: response.ok,
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      contentType: response.headers.get("content-type"),
      contentLength: Number(response.headers.get("content-length")) || text.length,
      title: text.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() || null
    };
  } catch (error) {
    return {
      id: endpoint.id,
      label: endpoint.label,
      url: endpoint.url,
      ok: false,
      elapsedMs: Date.now() - startedAt,
      error: error.message
    };
  }
}

const [jsonSources, htmlSources] = await Promise.all([
  Promise.all(endpoints.map(fetchJson)),
  Promise.all(pageChecks.map(checkPage))
]);

const ingestSources = JSON.parse(await readFile("data/ingest-sources.json", "utf8"));
const snapshot = {
  schema: "nulls-project.source-snapshot.v0",
  generated,
  boundary: "Status and metadata snapshot only. This file is not a full mirror of any upstream dataset.",
  catalogSourceCount: ingestSources.sources.length,
  sources: [...jsonSources, ...htmlSources]
};

await mkdir("data/imports", { recursive: true });
await writeFile("data/imports/source-snapshot.json", `${JSON.stringify(snapshot, null, 2)}\n`);

const okCount = snapshot.sources.filter(source => source.ok).length;
console.log(`Wrote data/imports/source-snapshot.json (${okCount}/${snapshot.sources.length} sources reachable).`);
