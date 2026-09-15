const modules = [
  {
    group: "IESVE",
    source: "IES Data → IES Loads",
    summary: "Import, normalize, export, and review the IESVE space and room-load datasets used by the design workbook.",
    items: [
      ["IES Tabular Space Data Output", "IES Data", "Review imported tabular space data before it enters the calculation model."],
      ["IES Tabular Space Data Export", "IES Data", "Prepare the normalized tabular space dataset used by downstream calculations."],
      ["IES Room/Zone Loads Report", "IES Loads", "Review room and zone heating and cooling load results from the IES export."],
    ],
  },
  {
    group: "Space Calculations",
    source: "Inputs → IES Loads → Calc",
    summary: "Review space conditions, loads, zoning, ventilation, air balance, latent performance, baseline systems, and monitoring criteria.",
    items: [
      ["Space Condition Setpoints", "Inputs → Calc", "Define occupied heating, cooling, humidity, and setback criteria for each space condition."],
      ["Internal Gains", "Calc", "Calculate people, lighting, equipment, and process gains by space."],
      ["Room Loads", "IES Loads → Calc", "Consolidate the sensible and latent room load components used for system sizing."],
      ["Equipment Zoning", "Calc", "Assign spaces to equipment zones and evaluate shared operating criteria."],
      ["Heating Load", "IES Loads → Calc", "Calculate design heating requirements while preserving workbook sizing and rounding rules."],
      ["Cooling Load", "IES Loads → Calc", "Calculate design sensible, latent, and total cooling requirements."],
      ["Required Ventilation and Exhaust Rates", "Calc → Exhaust", "Determine required outdoor air and exhaust quantities for each applicable space."],
      ["Pressurization", "Calc", "Evaluate supply, return, exhaust, and transfer relationships for space pressure intent."],
      ["Non-Peak Air Balance", "Calc", "Review airflow balance away from coincident peak load conditions."],
      ["Latent Load Calculations", "Calc", "Trace latent gains and moisture loads through the space calculation path."],
      ["Space Condition Type and Baseline System", "Inputs → Calc", "Map space condition types to the workbook baseline system logic."],
      ["CO₂ Monitoring", "Calc", "Identify spaces subject to carbon dioxide monitoring criteria."],
    ],
  },
  {
    group: "Selected Space Requirements",
    source: "Lighting → Misc → Exhaust → Transfer",
    summary: "Manage supplemental fixture, equipment, exhaust, and transfer-air requirements for the selected spaces that need added detail.",
    items: [
      ["Lighting Loads", "Lighting", "Add detailed lighting loads for selected spaces where fixture-level inputs are required."],
      ["Miscellaneous Sensible Loads", "Misc", "Add detailed plug, process, and equipment sensible loads for selected spaces."],
      ["General Exhaust Requirements", "Exhaust", "Apply general exhaust criteria to selected spaces."],
      ["Exhaust Equipment Requirements", "Exhaust", "Define equipment-specific exhaust demands and operating relationships."],
      ["Transfer Air", "Transfer", "Define transfer-air paths and quantities for selected spaces."],
    ],
  },
  {
    group: "Airside Equipment",
    source: "Airside → Psych",
    summary: "Review airside design settings, coil duties, and psychrometric processes for the project systems.",
    items: [
      ["Settings", "Airside", "Configure shared airside design conditions and equipment assumptions."],
      ["Preheat Coils", "Airside", "Size and review preheat coil performance at workbook design conditions."],
      ["Cooling Coils", "Airside", "Size and review cooling coil sensible, latent, and total performance."],
      ["Reheat / Heating Coils", "Airside", "Size and review reheat and heating coil performance."],
      ["Psychrometric Charts", "Psych", "Visualize air-state processes used in the airside calculations."],
    ],
  },
  {
    group: "Plantside Equipment",
    source: "Plantside",
    summary: "Review the calculated cooling and heating plant design duties and equipment selections.",
    items: [
      ["Cooling Plant Equipment", "Plantside", "Review cooling plant equipment selections and calculated design duties."],
      ["Heating Plant Equipment", "Plantside", "Review heating plant equipment selections and calculated design duties."],
    ],
  },
  {
    group: "Energy",
    source: "Energy",
    summary: "Compare proposed energy performance with the four baseline building rotations used by the workbook.",
    items: [
      ["Proposed", "Energy", "Review the proposed building energy-model results."],
      ["Baseline 000deg", "Energy", "Review the baseline energy-model results at the 000-degree rotation."],
      ["Baseline 090deg", "Energy", "Review the baseline energy-model results at the 090-degree rotation."],
      ["Baseline 180deg", "Energy", "Review the baseline energy-model results at the 180-degree rotation."],
      ["Baseline 270deg", "Energy", "Review the baseline energy-model results at the 270-degree rotation."],
    ],
  },
  {
    group: "Input Tables",
    source: "Inputs → ASHRAE → Water",
    summary: "Manage shared project inputs, standards reference data, and engineering lookup tables used throughout the workbook.",
    items: [],
  },
];

const tree = document.querySelector("#project-tree");
const search = document.querySelector("#browser-search");
const browser = document.querySelector("#project-browser");
const scrim = document.querySelector("#drawer-scrim");
const moduleContent = document.querySelector("#module-content");
const summaryLinks = document.querySelector("#summary-links");

const slugify = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function renderTree(query = "") {
  const normalized = query.trim().toLowerCase();
  tree.innerHTML = "";
  let resultCount = 0;

  modules.forEach((section) => {
    const groupMatch = section.group.toLowerCase().includes(normalized);
    const visibleItems = section.items.filter((item) => !normalized || groupMatch || item[0].toLowerCase().includes(normalized));
    if (normalized && !groupMatch && !visibleItems.length) return;
    resultCount += visibleItems.length + 1;

    const wrapper = document.createElement("section");
    wrapper.className = "tree-group";

    const row = document.createElement("div");
    row.className = "group-row";

    if (section.items.length) {
      const expander = document.createElement("button");
      expander.className = "group-expander";
      expander.type = "button";
      expander.setAttribute("aria-label", `Collapse ${section.group}`);
      expander.setAttribute("aria-expanded", "true");
      expander.innerHTML = '<span class="chevron" aria-hidden="true">›</span>';
      expander.addEventListener("click", () => {
        wrapper.classList.toggle("collapsed");
        const expanded = !wrapper.classList.contains("collapsed");
        expander.setAttribute("aria-expanded", String(expanded));
        expander.setAttribute("aria-label", `${expanded ? "Collapse" : "Expand"} ${section.group}`);
      });
      row.appendChild(expander);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "group-spacer";
      row.appendChild(spacer);
    }

    const groupLink = document.createElement("button");
    groupLink.className = "group-link";
    groupLink.type = "button";
    groupLink.dataset.id = `section-${slugify(section.group)}`;
    groupLink.dataset.title = section.group;
    groupLink.dataset.group = "Project Browser";
    groupLink.dataset.source = section.source;
    groupLink.dataset.description = section.summary;
    groupLink.dataset.summary = "true";
    groupLink.textContent = section.group;
    groupLink.addEventListener("click", () => selectModule(groupLink));
    row.appendChild(groupLink);

    if (section.items.length) {
      const count = document.createElement("span");
      count.className = "item-count";
      count.textContent = String(section.items.length);
      row.appendChild(count);
    }

    wrapper.appendChild(row);

    if (visibleItems.length) {
      const children = document.createElement("div");
      children.className = "tree-children";
      visibleItems.forEach((item) => children.appendChild(createLeaf(item, section.group)));
      wrapper.appendChild(children);
    }
    tree.appendChild(wrapper);
  });

  if (!resultCount) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No calculations match this search.";
    tree.appendChild(empty);
  }

  syncActiveState();
}

function createLeaf(item, group) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tree-leaf";
  button.dataset.id = slugify(item[0]);
  button.dataset.title = item[0];
  button.dataset.group = group;
  button.dataset.source = item[1];
  button.dataset.description = item[2];
  button.textContent = item[0];
  button.addEventListener("click", () => selectModule(button));
  return button;
}

function selectModule(button) {
  history.replaceState(null, "", `#${button.dataset.id}`);
  updateWorkspace(button.dataset);
  syncActiveState();
  closeBrowser();
}

function updateWorkspace(data) {
  const isSummary = data.summary === "true";
  document.querySelector("#crumb-group").textContent = data.group;
  document.querySelector("#crumb-page").textContent = data.title;
  document.querySelector("#page-kicker").textContent = isSummary ? "SECTION SUMMARY" : data.group.toUpperCase();
  document.querySelector("#page-title").textContent = data.title;
  document.querySelector("#page-description").textContent = data.description;
  document.querySelector("#source-sheet").textContent = data.source;
  document.querySelector("#module-heading").textContent = isSummary ? "Section overview" : data.title;
  document.querySelector("#empty-title").textContent = isSummary ? `${data.title} summary` : "Ready for workbook logic";
  document.querySelector("#empty-copy").textContent = isSummary
    ? data.description
    : "The navigation and source mapping are in place. Inputs, equations, units, validation, and Excel parity tests will be added in the next migration increment.";
  moduleContent.classList.toggle("is-summary", isSummary);
  renderSummaryLinks(isSummary ? data.title : null);
  document.title = `${data.title} · HVAC Design Workbook`;
}

function renderSummaryLinks(groupName) {
  summaryLinks.innerHTML = "";
  summaryLinks.hidden = !groupName;
  if (!groupName) return;

  const section = modules.find((candidate) => candidate.group === groupName);
  if (!section || !section.items.length) {
    const note = document.createElement("span");
    note.className = "summary-note";
    note.textContent = "Reference tables will be added as their calculation dependencies are migrated.";
    summaryLinks.appendChild(note);
    return;
  }

  section.items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item[0];
    button.addEventListener("click", () => {
      search.value = "";
      renderTree();
      const target = document.querySelector(`[data-id="${CSS.escape(slugify(item[0]))}"]`);
      if (target) selectModule(target);
    });
    summaryLinks.appendChild(button);
  });
}

function syncActiveState() {
  const id = location.hash.slice(1) || "space-condition-setpoints";
  document.querySelectorAll("[data-id]").forEach((button) => button.classList.toggle("active", button.dataset.id === id));
  const active = document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if (active) updateWorkspace(active.dataset);
}

function openBrowser() {
  browser.classList.add("open");
  scrim.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeBrowser() {
  browser.classList.remove("open");
  scrim.classList.remove("open");
  document.body.style.overflow = "";
}

function initializeProjectFields() {
  document.querySelectorAll("[data-project-field]").forEach((input) => {
    const key = `hvac-project-${input.dataset.projectField}`;
    const saved = localStorage.getItem(key);
    if (saved !== null) input.value = saved;
    input.addEventListener("input", () => localStorage.setItem(key, input.value));
  });
}

search.addEventListener("input", (event) => renderTree(event.target.value));
document.querySelector("#open-browser").addEventListener("click", openBrowser);
document.querySelector("#close-browser").addEventListener("click", closeBrowser);
scrim.addEventListener("click", closeBrowser);
window.addEventListener("hashchange", syncActiveState);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeBrowser();
});

initializeProjectFields();
renderTree();

let loadedVersion = null;
async function checkForUpdates() {
  if (document.visibilityState !== "visible") return;
  try {
    const isLocal = location.hostname === "127.0.0.1" || location.hostname === "localhost";
    const versionUrl = isLocal ? `/version?t=${Date.now()}` : `./version.json?t=${Date.now()}`;
    const response = await fetch(versionUrl, { cache: "no-store" });
    if (!response.ok) return;
    const { version } = await response.json();
    if (loadedVersion !== null && version !== loadedVersion) location.reload();
    loadedVersion = version;
  } catch {
    // The local server may be restarting; the next poll will reconnect.
  }
}

checkForUpdates();
setInterval(checkForUpdates, 1200);
