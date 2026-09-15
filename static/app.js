const modules = [
  {
    group: "IESVE",
    items: [
      ["IES Tabular Space Data Output", "IES Data", "Review imported tabular space data before it enters the calculation model."],
      ["IES Tabular Space Data Export", "IES Data", "Prepare the normalized tabular space dataset used by downstream calculations."],
      ["IES Room/Zone Loads Report", "IES Loads", "Review room and zone heating and cooling load results from the IES export."],
    ],
  },
  {
    group: "Space Calculations",
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
    items: [
      ["Cooling Plant Equipment", "Plantside", "Review cooling plant equipment selections and calculated design duties."],
      ["Heating Plant Equipment", "Plantside", "Review heating plant equipment selections and calculated design duties."],
    ],
  },
  { group: null, items: [["Energy", "Energy", "Review modeled energy inputs, outputs, and calculation summaries."]] },
  { group: null, items: [["Input Tables", "Inputs → ASHRAE → Water", "Manage shared project inputs, reference data, and engineering lookup tables."]] },
];

const tree = document.querySelector("#project-tree");
const search = document.querySelector("#browser-search");
const browser = document.querySelector("#project-browser");
const scrim = document.querySelector("#drawer-scrim");

const slugify = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function renderTree(query = "") {
  const normalized = query.trim().toLowerCase();
  tree.innerHTML = "";
  let count = 0;

  modules.forEach((section, sectionIndex) => {
    const groupMatch = section.group?.toLowerCase().includes(normalized);
    const visibleItems = section.items.filter((item) => !normalized || groupMatch || item[0].toLowerCase().includes(normalized));
    if (!visibleItems.length) return;
    count += visibleItems.length;

    if (!section.group) {
      visibleItems.forEach((item) => tree.appendChild(createLeaf(item, null, true)));
      return;
    }

    const wrapper = document.createElement("section");
    wrapper.className = "tree-group";
    const toggle = document.createElement("button");
    toggle.className = "group-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = `<span class="chevron" aria-hidden="true">›</span><span>${section.group}</span><span class="item-count">${visibleItems.length}</span>`;
    toggle.addEventListener("click", () => {
      wrapper.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", String(!wrapper.classList.contains("collapsed")));
    });

    const children = document.createElement("div");
    children.className = "tree-children";
    visibleItems.forEach((item) => children.appendChild(createLeaf(item, section.group, false)));
    wrapper.append(toggle, children);
    tree.appendChild(wrapper);
  });

  if (!count) {
    const empty = document.createElement("p");
    empty.className = "no-results";
    empty.textContent = "No calculations match this search.";
    tree.appendChild(empty);
  }

  syncActiveState();
}

function createLeaf(item, group, root) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = root ? "root-leaf" : "tree-leaf";
  button.dataset.id = slugify(item[0]);
  button.dataset.title = item[0];
  button.dataset.group = group || item[0];
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
  document.querySelector("#crumb-group").textContent = data.group;
  document.querySelector("#crumb-page").textContent = data.title;
  document.querySelector("#page-kicker").textContent = data.group.toUpperCase();
  document.querySelector("#page-title").textContent = data.title;
  document.querySelector("#page-description").textContent = data.description;
  document.querySelector("#source-sheet").textContent = data.source;
  document.querySelector("#module-heading").textContent = data.title;
  document.title = `${data.title} · HVAC Calculation Studio`;
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

search.addEventListener("input", (event) => renderTree(event.target.value));
document.querySelector("#open-browser").addEventListener("click", openBrowser);
document.querySelector("#close-browser").addEventListener("click", closeBrowser);
scrim.addEventListener("click", closeBrowser);
window.addEventListener("hashchange", syncActiveState);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeBrowser();
});

renderTree();

let loadedVersion = null;
async function checkForUpdates() {
  if (document.visibilityState !== "visible") return;
  try {
    const response = await fetch(`/version?t=${Date.now()}`, { cache: "no-store" });
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
