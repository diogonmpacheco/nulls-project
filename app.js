const state = {
  atlas: null,
  query: "",
  tier: "all",
  domain: "all",
  flag: "all",
  selectedGeneId: "CYP2D6"
};

const DATA_URL = "data/nulls-atlas.json";

const els = {
  metrics: document.querySelector("#metrics"),
  search: document.querySelector("#search"),
  tierFilter: document.querySelector("#tier-filter"),
  domainFilter: document.querySelector("#domain-filter"),
  flagFilter: document.querySelector("#flag-filter"),
  tierList: document.querySelector("#tier-list"),
  matrix: document.querySelector("#evidence-matrix"),
  table: document.querySelector("#gene-table"),
  resultCount: document.querySelector("#result-count"),
  dossier: document.querySelector("#gene-dossier"),
  phaseTwo: document.querySelector("#phase-two")
};

init();

async function init() {
  const response = await fetch(DATA_URL, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load atlas data: ${response.status}`);
  state.atlas = await response.json();

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
  renderTierList();
  renderAtlas();
  renderPhaseTwo();
}

function renderMetrics() {
  const { metadata } = state.atlas;
  els.metrics.innerHTML = `
    <div><dt>Genes</dt><dd>${metadata.counts.genes}</dd></div>
    <div><dt>Flagship</dt><dd>CYP2D6</dd></div>
    <div><dt>Diognosis Seed</dt><dd>${metadata.counts.diognosisSeededGenes}</dd></div>
    <div><dt>Release</dt><dd>${escapeHtml(metadata.version)}</dd></div>
  `;
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

function renderAtlas() {
  const rows = filteredGenes();
  renderMatrix(rows);
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
      ...(gene.markers || []).map(row => `${row.label} ${row.dbsnp || ""} ${row.interpretation}`)
    ].join(" ").toLowerCase();

    return (!state.query || haystack.includes(state.query))
      && (state.tier === "all" || gene.tier === state.tier)
      && (state.domain === "all" || (gene.domains || []).includes(state.domain))
      && (state.flag === "all" || (gene.flags || []).includes(state.flag));
  });
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
      <td><span class="stack">${chips(gene.flags, "flag")}</span></td>
    </tr>
  `).join("");

  for (const row of els.table.querySelectorAll("tr[data-gene-id]")) {
    row.addEventListener("click", () => selectGene(row.dataset.geneId));
    row.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectGene(row.dataset.geneId);
      }
    });
  }
}

function selectGene(geneId) {
  state.selectedGeneId = geneId;
  const url = new URL(window.location);
  url.searchParams.set("gene", geneId);
  history.replaceState(null, "", url);
  renderAtlas();
  document.querySelector("#dossier").scrollIntoView({ block: "start" });
}

function selectedGene() {
  return state.atlas.genes.find(gene => gene.id === state.selectedGeneId) || state.atlas.genes[0];
}

function renderDossier(gene) {
  const sourceMap = new Map(state.atlas.sources.map(source => [source.id, source]));
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
