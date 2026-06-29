import { mkdir, readFile, writeFile } from "node:fs/promises";

const generated = "2026-06-29";
const geneId = "CYP2D6";

const readJson = async path => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const [
  sources,
  claims,
  gene,
  nullStates,
  variants,
  substrates,
  compartments,
  exposures,
  caveats
] = await Promise.all([
  readJson("evidence/sources.json"),
  readJson("evidence/claims.json"),
  readJson("models/genes/CYP2D6/gene.json"),
  readJson("models/genes/CYP2D6/null-states.json"),
  readJson("models/genes/CYP2D6/variants.json"),
  readJson("models/genes/CYP2D6/substrates.json"),
  readJson("models/genes/CYP2D6/compartments.json"),
  readJson("models/genes/CYP2D6/exposures.json"),
  readJson("models/genes/CYP2D6/caveats.json")
]);

const sourceIds = new Set(sources.sources.map(source => source.id));
const allowedClaimTypes = new Set(["evidence", "hypothesis", "product_framing", "boundary"]);
const allowedStrictness = new Set(["strict", "review", "excluded", "comparator"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertArray(value, label) {
  assert(Array.isArray(value) && value.length > 0, `${label} must be a non-empty array.`);
}

function validateRowSet(label, rows, requiredFields) {
  assertArray(rows, label);
  rows.forEach((row, index) => {
    for (const field of requiredFields) {
      const value = row[field];
      assert(value !== undefined && value !== null && value !== "", `${label}[${index}] missing ${field}.`);
    }
    assert(allowedClaimTypes.has(row.claimType), `${label}[${index}] has invalid claimType ${row.claimType}.`);
    assert(allowedStrictness.has(row.strictNullRelevance), `${label}[${index}] has invalid strictNullRelevance ${row.strictNullRelevance}.`);
    if (row.sourceIds) {
      assertArray(row.sourceIds, `${label}[${index}].sourceIds`);
      for (const sourceId of row.sourceIds) {
        assert(sourceIds.has(sourceId), `${label}[${index}] references unknown source ${sourceId}.`);
      }
    }
    if (row.evidenceLane) assertArray(row.evidenceLane, `${label}[${index}].evidenceLane`);
  });
}

validateRowSet("nullStates.rows", nullStates.rows, ["id", "claimType", "strictNullRelevance", "stateClass", "sourceIds", "boundary"]);
validateRowSet("variants.rows", variants.rows, ["id", "claimType", "strictNullRelevance", "sourceIds", "evidenceLane", "clinicalBoundary"]);
validateRowSet("substrates.rows", substrates.rows, ["id", "claimType", "strictNullRelevance", "sourceIds", "evidenceLane", "clinicalBoundary"]);
validateRowSet("compartments.rows", compartments.rows, ["id", "claimType", "strictNullRelevance", "sourceIds", "evidenceLane", "boundary"]);
validateRowSet("exposures.rows", exposures.rows, ["id", "claimType", "strictNullRelevance", "sourceIds", "toxicityBoundary"]);
validateRowSet("caveats.rows", caveats.rows, ["id", "claimType", "strictNullRelevance", "boundary"]);
validateRowSet("claims.claims", claims.claims, ["id", "claimType", "strictNullRelevance", "subjectId", "sourceIds", "boundary"]);

const nodes = [];
const edges = [];
const nodeIds = new Set();
const edgeIds = new Set();

function addNode(id, type, label, properties = {}) {
  if (nodeIds.has(id)) return id;
  nodeIds.add(id);
  nodes.push({
    id,
    type,
    label,
    properties
  });
  return id;
}

function addEdge(from, to, type, properties = {}) {
  assert(nodeIds.has(from), `Edge ${type} has unknown from node ${from}.`);
  assert(nodeIds.has(to), `Edge ${type} has unknown to node ${to}.`);
  const id = `${from}|${type}|${to}|${properties.role || properties.field || ""}`;
  if (edgeIds.has(id)) return id;
  edgeIds.add(id);
  edges.push({
    id,
    from,
    to,
    type,
    properties
  });
  return id;
}

const geneNodeId = addNode(`gene:${geneId}`, "Gene", gene.symbol, {
  symbol: gene.symbol,
  name: gene.name,
  modelVersion: gene.modelVersion,
  reviewStatus: gene.reviewStatus,
  tier: gene.tier,
  atlasRole: gene.atlasRole,
  publicSummary: gene.publicSummary,
  globalBoundaries: gene.globalBoundaries
});

for (const source of sources.sources) {
  addNode(`source:${source.id}`, "Source", source.label, {
    sourceId: source.id,
    type: source.type,
    url: source.url,
    note: source.note
  });
}

const laneIds = new Set();
function addEvidenceLane(lane) {
  const id = `evidence-lane:${lane}`;
  if (!laneIds.has(lane)) {
    laneIds.add(lane);
    addNode(id, "EvidenceLane", lane, { lane });
  }
  return id;
}

function connectEvidence(entityNodeId, row) {
  for (const lane of row.evidenceLane || []) {
    addEdge(entityNodeId, addEvidenceLane(lane), "HAS_EVIDENCE_LANE");
  }
  for (const sourceId of row.sourceIds || []) {
    addEdge(entityNodeId, `source:${sourceId}`, "SUPPORTED_BY");
  }
}

function stateNodeId(row) {
  return `null-state:${geneId}:${row.id}`;
}

for (const row of nullStates.rows) {
  const id = addNode(stateNodeId(row), "NullState", row.label, {
    ...row,
    sourceIds: undefined
  });
  addEdge(geneNodeId, id, "HAS_NULL_STATE");
  connectEvidence(id, row);
}

const stateClassMap = new Map([
  ["whole-gene-deletion", "whole-gene-deletion"],
  ["named-no-function-allele", "named-no-function-star-alleles"],
  ["decreased-residual-function", "residual-decreased-function"]
]);

for (const row of variants.rows) {
  const id = addNode(`variant:${row.id}`, "Variant", row.label, {
    allele: row.allele,
    mechanism: row.mechanism,
    strictNull: row.strictNull,
    strictNullRelevance: row.strictNullRelevance,
    reviewStatus: row.reviewStatus,
    stateClass: row.stateClass,
    functionAssignment: row.functionAssignment,
    activityValue: row.activityValue,
    sourceLayer: row.sourceLayer,
    dbsnp: row.dbsnp,
    callabilityCaveats: row.callabilityCaveats,
    clinicalBoundary: row.clinicalBoundary
  });
  addEdge(geneNodeId, id, "HAS_VARIANT");
  connectEvidence(id, row);

  const mappedState = nullStates.rows.find(state => state.id === stateClassMap.get(row.stateClass));
  if (mappedState) addEdge(id, stateNodeId(mappedState), "MAPS_TO_NULL_STATE");
}

const focusAliases = new Map([
  ["brain/CNS", "brain-cns-local-enzyme"],
  ["other CYP2D6-expressing tissues", "lung-skin-other-peripheral-tissues"],
  ["gut and diet-derived trace amine context", "gut-first-pass-entry"],
  ["peripheral CYP2D6-expressing tissues", "lung-skin-other-peripheral-tissues"],
  ["plasma", "plasma-blood"],
  ["liver/systemic", "liver-systemic-circulation"],
  ["urine biomarkers", "kidney-urine-biomarkers"],
  ["unresolved tissues", "lung-skin-other-peripheral-tissues"],
  ["CNS target exposure", "brain-cns-local-enzyme"],
  ["cardiovascular target", "cardiovascular-target-effects"]
]);
const compartmentIds = new Set(compartments.rows.map(row => row.id));

for (const row of compartments.rows) {
  const id = addNode(`compartment:${geneId}:${row.id}`, "Compartment", row.compartment, {
    claimType: row.claimType,
    strictNullRelevance: row.strictNullRelevance,
    evidenceKind: row.evidenceKind,
    inheritedNullClaim: row.inheritedNullClaim,
    inducedNullClaim: row.inducedNullClaim,
    localVsSystemic: row.localVsSystemic,
    evidenceTier: row.evidenceTier,
    boundary: row.boundary
  });
  addEdge(geneNodeId, id, "HAS_COMPARTMENT");
  connectEvidence(id, row);
}

function addCompartmentFocus(focus) {
  const alias = focusAliases.get(focus);
  if (alias && compartmentIds.has(alias)) return `compartment:${geneId}:${alias}`;
  return addNode(`compartment-focus:${geneId}:${slug(focus)}`, "CompartmentFocus", focus, { focus });
}

for (const row of substrates.rows) {
  const id = addNode(`substrate:${geneId}:${row.id}`, "Substrate", row.label, {
    category: row.category,
    substrateType: row.substrateType,
    cyp2d6Role: row.cyp2d6Role,
    trueNullEffect: row.trueNullEffect,
    residualFunctionEffect: row.residualFunctionEffect,
    inducedNullEffect: row.inducedNullEffect,
    status: row.status,
    claimType: row.claimType,
    strictNullRelevance: row.strictNullRelevance,
    evidenceTier: row.evidenceTier,
    clinicalBoundary: row.clinicalBoundary
  });
  addEdge(geneNodeId, id, "HAS_SUBSTRATE");
  connectEvidence(id, row);
  for (const focus of row.compartmentFocus || []) {
    const focusNode = addCompartmentFocus(focus);
    addEdge(id, focusNode, "FOCUSES_ON_COMPARTMENT");
  }
}

for (const exposure of exposures.rows) {
  const id = addNode(`exposure:${geneId}:${exposure.id}`, "ExposureCase", exposure.label, {
    claimType: exposure.claimType,
    strictNullRelevance: exposure.strictNullRelevance,
    exposureSource: exposure.exposureSource,
    biomarker: exposure.biomarker,
    status: exposure.status,
    summary: exposure.summary,
    toxicityBoundary: exposure.toxicityBoundary,
    tissueUncertainty: exposure.tissueUncertainty
  });
  addEdge(geneNodeId, id, "HAS_EXPOSURE_CASE");
  connectEvidence(id, { ...exposure, evidenceLane: ["external-exposure-biomarker", "human-enzyme-activity"] });

  for (const state of exposure.accumulationStates || []) {
    const stateId = addNode(`exposure-state:${geneId}:${exposure.id}:${state.id}`, "ExposureState", state.state, state);
    addEdge(id, stateId, "HAS_ACCUMULATION_STATE");
  }
  for (const bodyPart of exposure.bodyPartMap || []) {
    const bodyPartId = addNode(`exposure-compartment:${geneId}:${exposure.id}:${bodyPart.id}`, "ExposureCompartment", bodyPart.compartment, bodyPart);
    addEdge(id, bodyPartId, "MAPS_BODY_PART");
    if (bodyPart.evidenceLane) {
      for (const lane of bodyPart.evidenceLane) addEdge(bodyPartId, addEvidenceLane(lane), "HAS_EVIDENCE_LANE");
    }
  }
}

for (const row of caveats.rows) {
  const id = addNode(`caveat:${geneId}:${row.id}`, "Caveat", row.boundary, {
    appliesTo: row.appliesTo,
    claimType: row.claimType,
    strictNullRelevance: row.strictNullRelevance,
    userMisreadRisk: row.userMisreadRisk,
    requiredDisplay: row.requiredDisplay
  });
  addEdge(geneNodeId, id, "HAS_CAVEAT");
  for (const scope of row.appliesTo || []) {
    const scopeId = addNode(`caveat-scope:${scope}`, "CaveatScope", scope, { scope });
    addEdge(id, scopeId, "APPLIES_TO_SCOPE");
  }
}

for (const claim of claims.claims) {
  const id = addNode(claim.id, "Claim", compact(claim.statement, 96), {
    ...claim,
    sourceIds: undefined
  });
  addEdge(geneNodeId, id, "HAS_CLAIM");
  if (nodeIds.has(claim.subjectId)) addEdge(id, claim.subjectId, "ABOUT");
  connectEvidence(id, claim);
}

for (const sourceId of gene.sourceIds || []) {
  if (sourceIds.has(sourceId)) addEdge(geneNodeId, `source:${sourceId}`, "SUPPORTED_BY");
}

const nodeTypeCounts = countBy(nodes, node => node.type);
const edgeTypeCounts = countBy(edges, edge => edge.type);

const graph = {
  schema: "nulls-project.property-graph.v0",
  generated,
  graphModel: "static-property-graph",
  boundary: "Graph database export for research navigation only. It is not diagnostic interpretation, not medical advice, and not a personal genotype caller.",
  compatibility: {
    importTargets: ["Neo4j", "Kuzu", "ArangoDB", "Memgraph", "Cytoscape", "browser graph viewers"],
    idPolicy: "Stable string ids with typed prefixes.",
    edgePolicy: "Directed relationship edges with properties."
  },
  counts: {
    nodes: nodes.length,
    edges: edges.length,
    nodeTypes: nodeTypeCounts,
    edgeTypes: edgeTypeCounts
  },
  indexes: {
    gene: geneNodeId,
    strictVariants: variants.rows.filter(row => row.strictNull).map(row => `variant:${row.id}`),
    reviewVariants: variants.rows.filter(row => !row.strictNull).map(row => `variant:${row.id}`),
    hypothesisClaims: nodes.filter(node => node.type === "Claim" && node.properties.claimType === "hypothesis").map(node => node.id),
    boundaryClaims: nodes.filter(node => node.type === "Claim" && node.properties.claimType === "boundary").map(node => node.id)
  },
  nodes: nodes.sort((a, b) => a.id.localeCompare(b.id)),
  edges: edges.sort((a, b) => a.id.localeCompare(b.id))
};

const geneGraph = {
  schema: "nulls-project.gene-graph-bundle.v0",
  generated,
  gene: geneId,
  boundary: graph.boundary,
  sourceOfTruth: {
    gene: "models/genes/CYP2D6/gene.json",
    nullStates: "models/genes/CYP2D6/null-states.json",
    variants: "models/genes/CYP2D6/variants.json",
    substrates: "models/genes/CYP2D6/substrates.json",
    compartments: "models/genes/CYP2D6/compartments.json",
    exposures: "models/genes/CYP2D6/exposures.json",
    caveats: "models/genes/CYP2D6/caveats.json",
    claims: "evidence/claims.json",
    sources: "evidence/sources.json"
  },
  endpoints: {
    graph: "api/graph.json",
    gene: "api/genes/CYP2D6.json",
    legacyBundle: "api/cyp2d6-base.json"
  },
  model: {
    gene,
    nullStates,
    variants,
    substrates,
    compartments,
    exposures,
    caveats,
    claims: {
      schema: claims.schema,
      generated: claims.generated,
      claims: claims.claims.filter(claim => claim.gene === geneId)
    }
  },
  graph: {
    counts: graph.counts,
    nodes: graph.nodes,
    edges: graph.edges
  }
};

await mkdir("data/generated/genes", { recursive: true });
await mkdir("api/genes", { recursive: true });
await writeJson("data/generated/nulls-graph.json", graph);
await writeJson("data/generated/genes/CYP2D6.json", geneGraph);
await writeJson("api/graph.json", graph);
await writeJson("api/genes/CYP2D6.json", geneGraph);

console.log(`Built graph database with ${nodes.length} nodes and ${edges.length} edges.`);

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function compact(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function countBy(values, getKey) {
  return values.reduce((counts, value) => {
    const key = getKey(value);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}
