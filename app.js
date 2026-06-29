const state = {
  atlas: null,
  variants: null,
  ingestMap: null,
  confidenceMap: null,
  cyp2d6BaseModel: null,
  cyp2d6Substrates: null,
  query: "",
  tier: "all",
  domain: "all",
  flag: "all",
  activeFacets: new Set(),
  selectedGeneId: "CYP2D6"
};

const DATA_URL = "data/nulls-atlas.json";
const VARIANTS_URL = "data/null-variants.json";
const INGEST_MAP_URL = "data/null-ingest-map.json";
const CONFIDENCE_MAP_URL = "data/source-confidence-map.json";
const CYP2D6_BASE_MODEL_URL = "data/cyp2d6-base-model.json";
const CYP2D6_SUBSTRATES_URL = "data/cyp2d6-substrates.json";

const els = {
  metrics: document.querySelector("#metrics"),
  flagshipPanel: document.querySelector("#flagship-panel"),
  cyp2d6BasePack: document.querySelector("#cyp2d6-base-pack"),
  compartmentMap: document.querySelector("#compartment-map"),
  pathwayMap: document.querySelector("#pathway-map"),
  sourceConfidenceStrip: document.querySelector("#source-confidence-strip"),
  domainCloud: document.querySelector("#domain-cloud"),
  variantSnapshot: document.querySelector("#variant-snapshot"),
  search: document.querySelector("#search"),
  tierFilter: document.querySelector("#tier-filter"),
  domainFilter: document.querySelector("#domain-filter"),
  flagFilter: document.querySelector("#flag-filter"),
  facetFilters: document.querySelectorAll("input[name='facet']"),
  tierList: document.querySelector("#tier-list"),
  matrix: document.querySelector("#evidence-matrix"),
  cards: document.querySelector("#gene-cards"),
  table: document.querySelector("#gene-table"),
  resultCount: document.querySelector("#result-count"),
  dossier: document.querySelector("#gene-dossier"),
  phaseTwo: document.querySelector("#phase-two")
};

init();

async function init() {
  const [atlasResponse, variantsResponse, ingestMapResponse, confidenceMapResponse, cyp2d6BaseResponse, cyp2d6SubstratesResponse] = await Promise.all([
    fetch(DATA_URL, { cache: "no-cache" }),
    fetch(VARIANTS_URL, { cache: "no-cache" }),
    fetch(INGEST_MAP_URL, { cache: "no-cache" }),
    fetch(CONFIDENCE_MAP_URL, { cache: "no-cache" }),
    fetch(CYP2D6_BASE_MODEL_URL, { cache: "no-cache" }),
    fetch(CYP2D6_SUBSTRATES_URL, { cache: "no-cache" })
  ]);
  if (!atlasResponse.ok) throw new Error(`Could not load atlas data: ${atlasResponse.status}`);
  if (!variantsResponse.ok) throw new Error(`Could not load variant data: ${variantsResponse.status}`);
  if (!ingestMapResponse.ok) throw new Error(`Could not load ingest map: ${ingestMapResponse.status}`);
  if (!confidenceMapResponse.ok) throw new Error(`Could not load confidence map: ${confidenceMapResponse.status}`);
  if (!cyp2d6BaseResponse.ok) throw new Error(`Could not load CYP2D6 base model: ${cyp2d6BaseResponse.status}`);
  if (!cyp2d6SubstratesResponse.ok) throw new Error(`Could not load CYP2D6 substrates: ${cyp2d6SubstratesResponse.status}`);

  state.atlas = await atlasResponse.json();
  state.variants = await variantsResponse.json();
  state.ingestMap = await ingestMapResponse.json();
  state.confidenceMap = await confidenceMapResponse.json();
  state.cyp2d6BaseModel = await cyp2d6BaseResponse.json();
  state.cyp2d6Substrates = await cyp2d6SubstratesResponse.json();

  const params = new URLSearchParams(window.location.search);
  const gene = params.get("gene");
  if (gene && state.atlas.genes.some(row => row.id === gene.toUpperCase())) {
    state.selectedGeneId = gene.toUpperCase();
  }

  hydrateControls();
  renderAll();
  attachEvents();
}

function attachEvents() {
  els.search.addEventListener("input", event => {
    state.query = event.target.value.trim().toLowerCase();
    renderAtlas();
  });

  els.tierFilter.addEventListener("change", event => {
    state.tier = event.target.value;
    renderAtlas();
  });

  els.domainFilter.addEventListener("change", event => {
    state.domain = event.target.value;
    renderAtlas();
  });

  els.flagFilter.addEventListener("change", event => {
    state.flag = event.target.value;
    renderAtlas();
  });

  for (const checkbox of els.facetFilters) {
    checkbox.addEventListener("change", () => {
      state.activeFacets = new Set([...els.facetFilters].filter(input => input.checked).map(input => input.value));
      renderAtlas();
    });
  }
}

function hydrateControls() {
  const domains = uniqueFlat(state.atlas.genes.map(gene => gene.domains || []));
  const flags = uniqueFlat(state.atlas.genes.map(gene => gene.flags || []));

  for (const domain of domains) {
    els.domainFilter.insertAdjacentHTML("beforeend", `<option value="${escapeAttr(domain)}">${escapeHtml(domain)}</option>`);
  }

  for (const flag of flags) {
    els.flagFilter.insertAdjacentHTML("beforeend", `<option value="${escapeAttr(flag)}">${escapeHtml(flag)}</option>`);
  }
}

function renderAll() {
  renderMetrics();
  renderFlagshipPanel();
  renderCyp2d6BasePack();
  renderCompartmentMap();
  renderPathwayMap();
  renderTierList();
  renderSourceConfidenceStrip();
  renderDomainCloud();
  renderVariantSnapshot();
  renderAtlas();
  renderPhaseTwo();
}

function renderMetrics() {
  const { metadata } = state.atlas;
  els.metrics.innerHTML = `
    <div><dt>Genes</dt><dd>${metadata.counts.genes}</dd></div>
    <div><dt>Source-linked</dt><dd>${metadata.counts.sourceLinkedGenes}</dd></div>
    <div><dt>Diognosis Seed</dt><dd>${metadata.counts.diognosisSeededGenes}</dd></div>
    <div><dt>Release</dt><dd>${escapeHtml(metadata.version)}</dd></div>
  `;
}

function renderFlagshipPanel() {
  const gene = state.atlas.genes.find(row => row.atlasRole === "flagship") || state.atlas.genes[0];
  const evidencePoints = [
    gene.nullEvidence?.[0],
    gene.nullEvidence?.find(point => point.toLowerCase().includes("inhibitor")),
    gene.nullEvidence?.find(point => point.toLowerCase().includes("brain")),
    gene.exposureCaseModel?.summary
  ].filter(Boolean);

  els.flagshipPanel.innerHTML = `
    <p class="eyebrow">Flagship case</p>
    <h2>CYP2D6 shows why null biology needs a systems view.</h2>
    <p>${escapeHtml(gene.whyStrong)}</p>
    <div class="flagship-points">
      ${evidencePoints.map(point => `<span>${escapeHtml(compactText(point, 178))}</span>`).join("")}
    </div>
  `;
}

function renderCyp2d6BasePack() {
  const base = state.cyp2d6BaseModel;
  const substrates = state.cyp2d6Substrates;
  if (!base || !substrates) return;

  const definitionStates = base.stateModel || [];
  const substrateRows = substrates.rows || [];
  const categoryCounts = substrateRows.reduce((counts, row) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
    return counts;
  }, {});
  const categoryCards = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count]) => `
      <span class="domain-score">
        <strong>${count}</strong>
        ${escapeHtml(category)}
      </span>
    `).join("");

  els.cyp2d6BasePack.innerHTML = `
    <div class="base-pack-grid">
      <article class="base-model-panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">State model</p>
            <h2>Null states stay separate from poor-metabolizer labels.</h2>
          </div>
          <a href="docs/cyp2d6-null-definition.md">Definition</a>
        </div>
        <p>${escapeHtml(base.coreThesis)}</p>
        <div class="base-state-list">
          ${definitionStates.map(row => `
            <article class="base-state-card">
              <span class="flag">${row.strictNull ? "strict-null" : row.includeInCore ? "review" : "boundary"}</span>
              <h3>${escapeHtml(row.label)}</h3>
              <p>${escapeHtml(compactText(row.definition, 150))}</p>
              <p><strong>Question:</strong> ${escapeHtml(compactText(row.mainQuestion, 150))}</p>
            </article>
          `).join("")}
        </div>
      </article>

      <article class="base-model-panel substrate-model-panel">
        <div class="panel-heading compact">
          <div>
            <p class="eyebrow">Substrate map</p>
            <h2>Endogenous, exposure, medication, and inhibitor rows stay separate.</h2>
          </div>
          <a href="data/cyp2d6-substrates.json">JSON</a>
        </div>
        <div class="domain-cloud">${categoryCards}</div>
        <div class="substrate-card-grid">
          ${substrateRows.map(row => `
            <article class="substrate-card">
              <span class="tier-badge ${row.evidenceTier}">${escapeHtml(tierLabel(row.evidenceTier))}</span>
              <h3>${escapeHtml(row.label)}</h3>
              <p>${escapeHtml(compactText(row.cyp2d6Role, 125))}</p>
              <p><strong>True null:</strong> ${escapeHtml(compactText(row.trueNullEffect, 130))}</p>
              <div class="stack">${chips([row.category, row.substrateType, row.status], "domain")}</div>
            </article>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

function renderCompartmentMap() {
  const gene = selectedGene("CYP2D6");
  const priority = ["Liver / systemic circulation", "Brain / CNS local enzyme", "Blood-brain barrier / CNS entry", "Kidney / urine biomarkers", "Cardiovascular target effects", "Adipose / lipid reservoirs"];
  const rows = priority
    .map(name => gene.compartmentModel?.find(row => row.compartment === name))
    .filter(Boolean);

  els.compartmentMap.innerHTML = rows.map(row => `
    <article class="compartment-card">
      <h3>
        <span>${escapeHtml(row.compartment)}</span>
        <span class="tier-badge ${row.evidence}">${escapeHtml(tierLabel(row.evidence))}</span>
      </h3>
      <div class="comparison-line">
        <div>
          <strong>Inherited</strong>
          <p>${escapeHtml(compactText(row.inheritedNull, 138))}</p>
        </div>
        <div>
          <strong>Induced</strong>
          <p>${escapeHtml(compactText(row.medicallyInducedNull, 138))}</p>
        </div>
      </div>
      <p>${escapeHtml(compactText(row.whyItDiffers, 150))}</p>
    </article>
  `).join("");
}

function renderPathwayMap() {
  const model = selectedGene("CYP2D6").endogenousModel;
  els.pathwayMap.innerHTML = (model?.rows || []).map(row => `
    <article class="pathway-card">
      <span class="tier-badge ${row.evidence}">${escapeHtml(tierLabel(row.evidence))}</span>
      <h3>${escapeHtml(row.substrate)}</h3>
      <p>${escapeHtml(compactText(row.route, 165))}</p>
      <p><strong>Null question:</strong> ${escapeHtml(compactText(row.nullQuestion, 180))}</p>
      <p><strong>Evidence:</strong> ${escapeHtml(compactText(row.evidenceBase, 145))}</p>
    </article>
  `).join("");
}

function renderTierList() {
  els.tierList.innerHTML = state.atlas.evidenceTiers.map(tier => `
    <article class="tier-item">
      <span class="tier-badge ${tier.id}">${escapeHtml(tier.label)}</span>
      <div>
        <strong>${escapeHtml(tier.name)}</strong>
        <p>${escapeHtml(tier.definition)}</p>
      </div>
    </article>
  `).join("");
}

function renderSourceConfidenceStrip() {
  const labelCounts = new Map();
  for (const profile of Object.values(state.confidenceMap.genes || {})) {
    for (const label of profile.labels || []) {
      labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
    }
  }

  els.sourceConfidenceStrip.innerHTML = [...labelCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([label, count]) => `
      <span class="confidence-pill" title="${escapeAttr(state.confidenceMap.labelDefinitions?.[label] || "")}">
        <strong>${count}</strong>
        ${escapeHtml(label)}
      </span>
    `).join("");
}

function renderDomainCloud() {
  const domainCounts = new Map();
  for (const gene of state.atlas.genes) {
    for (const domain of gene.domains || []) {
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
  }

  els.domainCloud.innerHTML = [...domainCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 16)
    .map(([domain, count]) => `
      <span class="domain-score">
        <strong>${count}</strong>
        ${escapeHtml(domain)}
      </span>
    `).join("");
}

function renderVariantSnapshot() {
  const records = state.variants.records || [];
  const strict = records.filter(row => row.strictNull).length;
  const review = records.length - strict;
  const cyp2d6 = records.filter(row => row.gene === "CYP2D6").length;
  const genes = new Set(records.map(row => row.gene)).size;
  const sourceLayers = new Set(records.map(row => row.sourceLayer).filter(Boolean)).size;
  const confidenceLabels = new Set(records.flatMap(row => row.confidenceLabels || [])).size;

  els.variantSnapshot.innerHTML = [
    variantStat(records.length, "variant and marker rows in the generated feed"),
    variantStat(strict, "strict-null rows kept by conservative filters"),
    variantStat(review, "review rows kept separate from true null calls"),
    variantStat(cyp2d6, "CYP2D6 rows, including structural and named allele context"),
    variantStat(genes, "genes represented in the variant feed"),
    variantStat(confidenceLabels, "source-confidence label types attached to rows"),
    variantStat(sourceLayers, "source layers represented for provenance")
  ].join("");
}

function variantStat(value, label) {
  return `
    <article class="variant-stat">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </article>
  `;
}

function renderAtlas() {
  const rows = filteredGenes();
  renderMatrix(rows);
  renderGeneCards(rows);
  renderTable(rows);
  renderDossier(selectedGene());
}

function filteredGenes() {
  return state.atlas.genes.filter(gene => {
    const haystack = [
      gene.symbol,
      gene.name,
      gene.axis,
      gene.nullStateLabel,
      gene.oneLine,
      gene.whyStrong,
      ...(gene.domains || []),
      ...(gene.flags || []),
      ...(gene.phenotypes || []).map(row => `${row.label} ${row.system} ${row.direction} ${row.note}`),
      ...((gene.endogenousModel?.rows || []).map(row => `${row.substrate} ${row.route} ${row.nullQuestion} ${row.evidenceBase}`)),
      ...(gene.id === "CYP2D6" ? (state.cyp2d6BaseModel?.stateModel || []).map(row => `${row.label} ${row.definition} ${row.mainQuestion}`) : []),
      ...(gene.id === "CYP2D6" ? (state.cyp2d6Substrates?.rows || []).map(row => `${row.label} ${row.category} ${row.substrateType} ${row.cyp2d6Role} ${row.trueNullEffect}`) : []),
      ...(state.ingestMap?.genes?.[gene.id]?.includeMechanisms || []),
      ...(state.ingestMap?.genes?.[gene.id]?.reviewMechanisms || []),
      ...(state.ingestMap?.genes?.[gene.id]?.curationTags || []),
      ...(state.ingestMap?.genes?.[gene.id]?.nullModes || []),
      ...(state.confidenceMap?.genes?.[gene.id]?.labels || []),
      state.confidenceMap?.genes?.[gene.id]?.summary || "",
      ...(gene.markers || []).map(row => `${row.label} ${row.dbsnp || ""} ${row.interpretation}`)
    ].join(" ").toLowerCase();

    const facets = geneFacets(gene);
    return (!state.query || haystack.includes(state.query))
      && (state.tier === "all" || gene.tier === state.tier)
      && (state.domain === "all" || (gene.domains || []).includes(state.domain))
      && (state.flag === "all" || (gene.flags || []).includes(state.flag))
      && [...state.activeFacets].every(facet => facets[facet]);
  });
}

function geneFacets(gene) {
  const profile = state.ingestMap?.genes?.[gene.id] || {};
  const domains = gene.domains || [];
  const flags = gene.flags || [];
  const nullModes = profile.nullModes || [];
  return {
    strictNull: Boolean(profile.strictNull),
    reviewLowFunction: !profile.strictNull || Boolean(profile.reviewMechanisms?.length),
    protective: flags.includes("protective"),
    induced: nullModes.some(mode => mode.includes("induced")),
    systemic: flags.includes("tissue-resolved") || domains.includes("tissue-resolved biology"),
    pgx: domains.includes("pharmacogenomics")
  };
}

function renderMatrix(rows) {
  const tiers = state.atlas.evidenceTiers;
  const counts = Object.fromEntries(tiers.map(tier => [tier.id, rows.filter(gene => gene.tier === tier.id).length]));
  const highValue = rows.filter(gene => (gene.flags || []).includes("diognosis-seeded")).length;
  const protective = rows.filter(gene => (gene.flags || []).includes("protective")).length;
  const systemic = rows.filter(gene => (gene.flags || []).includes("tissue-resolved") || (gene.domains || []).includes("tissue-resolved biology")).length;

  els.matrix.innerHTML = [
    matrixCell("Tier 1", counts["tier-1"] || 0, "strong human function evidence", "tier-1"),
    matrixCell("Systemic", systemic, "tissue-resolved null candidates", "tier-2"),
    matrixCell("Diognosis", highValue, "seeded medication bridge records", "tier-3"),
    matrixCell("Protective", protective, "non-pathology null examples", "tier-4")
  ].join("");
}

function matrixCell(label, count, note, tierClass) {
  return `
    <div class="matrix-cell ${tierClass}">
      <strong>${count}</strong>
      <span>${escapeHtml(label)}: ${escapeHtml(note)}</span>
    </div>
  `;
}

function renderGeneCards(rows) {
  if (!rows.length) {
    els.cards.innerHTML = `<p class="empty">No matching records.</p>`;
    return;
  }

  els.cards.innerHTML = rows.map(gene => `
    <article class="gene-card" tabindex="0" aria-selected="${gene.id === state.selectedGeneId}" data-gene-id="${escapeAttr(gene.id)}">
      <div class="gene-card-head">
        <div>
          <span class="gene-symbol">${escapeHtml(gene.symbol)}</span>
          <span class="gene-name">${escapeHtml(gene.name)}</span>
        </div>
        <span class="tier-badge ${gene.tier}">${escapeHtml(tierLabel(gene.tier))}</span>
      </div>
      <p>${escapeHtml(gene.oneLine)}</p>
      <div class="stack">${chips([...gene.flags.slice(0, 3), ...facetLabels(gene).slice(0, 2)], "flag")}</div>
    </article>
  `).join("");

  attachGeneSelectionEvents(els.cards.querySelectorAll("[data-gene-id]"));
}

function renderTable(rows) {
  els.resultCount.textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;
  if (!rows.length) {
    els.table.innerHTML = `<tr><td class="empty" colspan="6">No matching records.</td></tr>`;
    return;
  }

  els.table.innerHTML = rows.map(gene => `
    <tr tabindex="0" aria-selected="${gene.id === state.selectedGeneId}" data-gene-id="${escapeAttr(gene.id)}">
      <td>
        <span class="gene-symbol">${escapeHtml(gene.symbol)}</span>
        <span class="gene-name">${escapeHtml(gene.name)}</span>
      </td>
      <td><span class="tier-badge ${gene.tier}">${escapeHtml(tierLabel(gene.tier))}</span></td>
      <td>${escapeHtml(gene.nullStateLabel)}</td>
      <td><span class="stack">${chips(gene.domains, "domain")}</span></td>
      <td class="signal">${escapeHtml(gene.oneLine)}</td>
      <td><span class="stack">${chips([...gene.flags, ...facetLabels(gene)], "flag")}</span></td>
    </tr>
  `).join("");

  attachGeneSelectionEvents(els.table.querySelectorAll("[data-gene-id]"));
}

function attachGeneSelectionEvents(nodes) {
  for (const row of nodes) {
    row.addEventListener("click", () => selectGene(row.dataset.geneId));
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectGene(row.dataset.geneId);
      }
    });
  }
}

function facetLabels(gene) {
  const facets = geneFacets(gene);
  return Object.entries({
    strictNull: "strict-null",
    reviewLowFunction: "review-low-function",
    protective: "protective-lof",
    induced: "induced-null",
    systemic: "systemic-candidate",
    pgx: "pgx-null"
  })
    .filter(([key]) => facets[key])
    .map(([, label]) => label);
}

function selectGene(geneId) {
  state.selectedGeneId = geneId;
  const url = new URL(window.location);
  url.searchParams.set("gene", geneId);
  history.replaceState(null, "", url);
  renderAtlas();
  document.querySelector("#dossier").scrollIntoView({ block: "start" });
}

function selectedGene(geneId = state.selectedGeneId) {
  return state.atlas.genes.find(gene => gene.id === geneId) || state.atlas.genes[0];
}

function renderDossier(gene) {
  const sourceMap = new Map(state.atlas.sources.map(source => [source.id, source]));
  const ingestProfile = state.ingestMap?.genes?.[gene.id];
  const confidenceProfile = state.confidenceMap?.genes?.[gene.id];
  const deepDive = gene.deepDive ? renderDeepDive(gene) : "";
  const markers = gene.markers?.length ? renderMarkerTable(gene.markers) : "<p>No v0 marker rows. This record is framed from published null biology rather than Diognosis PGx seed markers.</p>";

  els.dossier.innerHTML = `
    <div class="dossier-header">
      <div>
        <p class="eyebrow">Gene dossier</p>
        <div class="dossier-title">
          <h2>${escapeHtml(gene.symbol)}</h2>
          <span class="tier-badge ${gene.tier}">${escapeHtml(tierLabel(gene.tier))}</span>
          ${gene.atlasRole === "flagship" ? `<span class="flag">flagship</span>` : ""}
        </div>
        <p class="dossier-summary">${escapeHtml(gene.whyStrong)}</p>
      </div>
      <div class="stack">${chips(gene.flags, "flag")}</div>
    </div>

    <div class="section-grid">
      <section class="section-block">
        <h3>Null Model</h3>
        <p>${escapeHtml(gene.nullStateLabel)}</p>
        <p class="small-gap">${escapeHtml(gene.axis)}</p>
      </section>

      <section class="section-block">
        <h3>Domains</h3>
        <div class="stack">${chips(gene.domains, "domain")}</div>
      </section>

      <section class="section-block wide">
        <h3>Null Evidence</h3>
        ${list(gene.nullEvidence)}
      </section>

      ${gene.id === "CYP2D6" ? renderCyp2d6BaseDossier() : ""}

      ${ingestProfile ? renderNullIngestProfile(ingestProfile) : ""}

      ${confidenceProfile ? renderSourceConfidenceProfile(confidenceProfile) : ""}

      ${gene.compartmentModel ? renderCompartmentModel(gene.compartmentModel) : ""}

      ${gene.endogenousModel ? renderEndogenousModel(gene.endogenousModel) : ""}

      ${gene.exposureCaseModel ? renderExposureCaseModel(gene.exposureCaseModel) : ""}

      <section class="section-block wide">
        <h3>Phenotype Associations</h3>
        ${renderPhenotypeTable(gene.phenotypes || [])}
      </section>

      <section class="section-block wide">
        <h3>Markers And Function Rows</h3>
        ${markers}
      </section>

      ${deepDive}

      <section class="section-block">
        <h3>Caveats</h3>
        ${list(gene.caveats)}
      </section>

      <section class="section-block">
        <h3>Sources</h3>
        <div class="source-grid">
          ${(gene.sources || []).map(sourceId => sourceLink(sourceMap.get(sourceId))).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderCyp2d6BaseDossier() {
  const base = state.cyp2d6BaseModel;
  const substrates = state.cyp2d6Substrates;
  if (!base || !substrates) return "";
  const strictStates = (base.stateModel || []).filter(row => row.strictNull).length;
  const reviewStates = (base.stateModel || []).filter(row => row.includeInCore && !row.strictNull).length;
  const substrateRows = substrates.rows || [];

  return `
    <section class="section-block wide">
      <h3>CYP2D6 Base Model</h3>
      <p>${escapeHtml(base.purpose)}</p>
      <div class="base-metric-row">
        ${variantStat(strictStates, "strict definition states")}
        ${variantStat(reviewStates, "review/comparator states")}
        ${variantStat(substrateRows.length, "substrate and pathway rows")}
        ${variantStat((base.evidenceLadder || []).length, "evidence ladder levels")}
      </div>
      <div class="small-gap stack">
        <a class="source-link compact-link" href="data/cyp2d6-base-model.json">Base model JSON</a>
        <a class="source-link compact-link" href="data/cyp2d6-substrates.json">Substrate JSON</a>
        <a class="source-link compact-link" href="data/cyp2d6-variants.json">Variant JSON</a>
        <a class="source-link compact-link" href="api/cyp2d6-base.json">Bundled API</a>
      </div>
    </section>
  `;
}

function renderSourceConfidenceProfile(profile) {
  return `
    <section class="section-block wide">
      <h3>Source Confidence</h3>
      <p>${escapeHtml(profile.summary)}</p>
      <div class="table-wrap case-table">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            ${(profile.labels || []).map(label => `
              <tr>
                <td><span class="flag">${escapeHtml(label)}</span></td>
                <td>${escapeHtml(state.confidenceMap?.labelDefinitions?.[label] || "No definition in v0.")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderNullIngestProfile(profile) {
  return `
    <section class="section-block wide">
      <h3>Null-Only Ingest Profile</h3>
      <p><strong>Strict null:</strong> ${profile.strictNull ? "yes" : "review / low-function only"}</p>
      <div class="small-gap stack">${chips(profile.nullModes, "domain")}</div>
      <div class="table-wrap case-table">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Keep</th>
              <th>Review</th>
              <th>Exclude</th>
              <th>Preferred Sources</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${list(profile.includeMechanisms)}</td>
              <td>${list(profile.reviewMechanisms)}</td>
              <td>${list(profile.excludeMechanisms)}</td>
              <td>${list(profile.preferredSources)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="case-table">
        <h4>Gene Rules</h4>
        ${list(profile.geneSpecificRules)}
      </div>
      ${profile.curationTags?.length ? `<div class="small-gap stack">${chips(profile.curationTags, "flag")}</div>` : ""}
    </section>
  `;
}

function renderPhenotypeTable(rows) {
  if (!rows.length) return "<p>No phenotype rows in v0.</p>";
  return `
    <div class="table-wrap">
      <table class="mini-table">
        <thead>
          <tr>
            <th>Phenotype</th>
            <th>System</th>
            <th>Direction</th>
            <th>Evidence</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${escapeHtml(row.system)}</td>
              <td>${escapeHtml(row.direction)}</td>
              <td><span class="tier-badge ${row.evidence}">${escapeHtml(tierLabel(row.evidence))}</span></td>
              <td>${escapeHtml(row.note)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCompartmentModel(rows) {
  return `
    <section class="section-block wide">
      <h3>Tissue-Resolved Null Map</h3>
      <div class="table-wrap">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Compartment</th>
              <th>Inherited Null</th>
              <th>Medically Induced Null</th>
              <th>Why It Differs</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                <td>${escapeHtml(row.compartment)}</td>
                <td>${escapeHtml(row.inheritedNull)}</td>
                <td>${escapeHtml(row.medicallyInducedNull)}</td>
                <td>${escapeHtml(row.whyItDiffers)}</td>
                <td><span class="tier-badge ${row.evidence}">${escapeHtml(tierLabel(row.evidence))}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderEndogenousModel(model) {
  return `
    <section class="section-block wide">
      <h3>${escapeHtml(model.label)}</h3>
      <p>${escapeHtml(model.summary)}</p>
      ${model.interpretationRules?.length ? `<div class="small-gap">${list(model.interpretationRules)}</div>` : ""}
      <div class="table-wrap case-table">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Substrate / Route</th>
              <th>CYP2D6 Role</th>
              <th>Null Question</th>
              <th>Evidence Base</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${(model.rows || []).map(row => `
              <tr>
                <td>${escapeHtml(row.substrate)}</td>
                <td>${escapeHtml(row.route)}</td>
                <td>${escapeHtml(row.nullQuestion)}</td>
                <td>${escapeHtml(row.evidenceBase)}</td>
                <td><span class="tier-badge ${row.evidence}">${escapeHtml(tierLabel(row.evidence))}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderExposureCaseModel(caseModel) {
  return `
    <section class="section-block wide">
      <h3>${escapeHtml(caseModel.label)}</h3>
      <p>${escapeHtml(caseModel.summary)}</p>
      <p class="small-gap"><strong>Status:</strong> ${escapeHtml(caseModel.status)}</p>
      <div class="table-wrap case-table">
        <table class="mini-table">
          <thead>
            <tr>
              <th>State</th>
              <th>Model</th>
              <th>Accumulation</th>
              <th>Boundary</th>
            </tr>
          </thead>
          <tbody>
            ${(caseModel.accumulationStates || []).map(row => `
              <tr>
                <td>${escapeHtml(row.state)}</td>
                <td>${escapeHtml(row.model)}</td>
                <td>${escapeHtml(row.accumulation)}</td>
                <td>${escapeHtml(row.boundary)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="table-wrap case-table">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Compartment</th>
              <th>Main Question</th>
              <th>Null Difference</th>
              <th>Accumulation Concern</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            ${(caseModel.bodyPartMap || []).map(row => `
              <tr>
                <td>${escapeHtml(row.compartment)}</td>
                <td>${escapeHtml(row.mainQuestion)}</td>
                <td>${escapeHtml(row.nullDifference)}</td>
                <td>${escapeHtml(row.accumulationConcern)}</td>
                <td><span class="tier-badge ${row.evidence}">${escapeHtml(tierLabel(row.evidence))}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderMarkerTable(rows) {
  return `
    <div class="table-wrap">
      <table class="mini-table">
        <thead>
          <tr>
            <th>Marker</th>
            <th>System</th>
            <th>dbSNP</th>
            <th>Interpretation</th>
            <th>Seed</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${escapeHtml(row.label)}</td>
              <td>${escapeHtml(row.system)}</td>
              <td>${escapeHtml(row.dbsnp || "")}</td>
              <td>${escapeHtml(row.interpretation)}</td>
              <td>${escapeHtml(row.seed || "")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDeepDive(gene) {
  const deep = gene.deepDive;
  return `
    <section class="section-block wide">
      <h3>CYP2D6 Deep Model</h3>
      ${list(deep.coreModel)}
    </section>

    <section class="section-block wide">
      <h3>Diognosis Bridge Examples</h3>
      <div class="table-wrap">
        <table class="mini-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>What changes</th>
              <th>Diognosis</th>
            </tr>
          </thead>
          <tbody>
            ${deep.diognosisBridgeExamples.map(row => `
              <tr>
                <td>${escapeHtml(row.label)}</td>
                <td>${escapeHtml(row.whatChanges)}</td>
                <td><a href="${escapeAttr(row.diognosisUrl)}">Open</a></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="section-block wide">
      <h3>Open Questions</h3>
      ${list(deep.openQuestions)}
    </section>
  `;
}

function renderPhaseTwo() {
  els.phaseTwo.innerHTML = `
    <div class="phase-list">
      ${state.atlas.phaseTwoCandidates.map(row => `
        <article class="phase-item">
          <strong>${escapeHtml(row.symbol)}</strong>
          <p>${escapeHtml(row.reason)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function sourceLink(source) {
  if (!source) return "";
  return `
    <a class="source-link" href="${escapeAttr(source.url)}">
      <span>${escapeHtml(source.label)}</span>
      <small>${escapeHtml(source.type)}</small>
    </a>
  `;
}

function chips(values = [], className) {
  return values.map(value => `<span class="${className}">${escapeHtml(value)}</span>`).join("");
}

function list(values = []) {
  if (!values.length) return "<p>No rows in v0.</p>";
  return `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function uniqueFlat(groups) {
  return [...new Set(groups.flat().filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function tierLabel(id) {
  return state.atlas.evidenceTiers.find(tier => tier.id === id)?.label || id;
}

function compactText(value, maxLength = 160) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : sliced.length).trim()}...`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
