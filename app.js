import { blankRow, cloneRows, filterRows, formatValue, parseValue, recalculate } from "./model.js";

const STORAGE_PREFIX = "iesve-independent-v1:";
const PROJECT_KEY = `${STORAGE_PREFIX}project`;
const state = { data: null, activeId: null, rows: {}, query: "", saveTimer: null };

const elements = {
  groups: document.querySelector("#independentGroups"),
  heading: document.querySelector(".nav-section-heading"),
  independentToggle: document.querySelector("#independentToggle"),
  navAdd: document.querySelector("#navAdd"),
  title: document.querySelector("#tableTitle"),
  description: document.querySelector("#tableDescription"),
  sheet: document.querySelector("#sheetName"),
  source: document.querySelector("#sourceRange"),
  breadcrumb: document.querySelector("#breadcrumbTable"),
  table: document.querySelector("#dataTable"),
  search: document.querySelector("#tableSearch"),
  rowSummary: document.querySelector("#rowSummary"),
  empty: document.querySelector("#emptyState"),
  addRow: document.querySelector("#addRow"),
  resetTable: document.querySelector("#resetTable"),
  exportAll: document.querySelector("#exportAll"),
  importAll: document.querySelector("#importAll"),
  resetAll: document.querySelector("#resetAll"),
  projectName: document.querySelector("#projectName"),
  projectNumber: document.querySelector("#projectNumber"),
  submittal: document.querySelector("#submittal"),
  submittalDate: document.querySelector("#submittalDate"),
  saveText: document.querySelector("#saveText"),
  toast: document.querySelector("#toast"),
};

function activeTable() {
  return state.data.tables.find((table) => table.id === state.activeId);
}

function storageKey(id) {
  return `${STORAGE_PREFIX}table:${id}`;
}

function readRows(table) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(table.id)) || "null");
    if (Array.isArray(saved) && saved.every((row) => Array.isArray(row) && row.length === table.headers.length)) return saved;
  } catch (_) {}
  return cloneRows(table.rows);
}

function saveRows(table) {
  localStorage.setItem(storageKey(table.id), JSON.stringify(state.rows[table.id]));
  elements.saveText.textContent = "Saved locally";
}

function scheduleSave(table) {
  elements.saveText.textContent = "Saving...";
  window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(() => saveRows(table), 180);
}

function recalculateTable(table) {
  state.rows[table.id] = recalculate(table, state.rows[table.id], state.rows);
  if (table.id === "equipment-schedule" && state.rows["grouped-equipment-schedule"]) {
    const grouped = state.data.tables.find((item) => item.id === "grouped-equipment-schedule");
    state.rows[grouped.id] = recalculate(grouped, state.rows[grouped.id], state.rows);
    saveRows(grouped);
  }
}

function renderNavigation() {
  const groups = [...new Set(state.data.tables.map((table) => table.group))];
  elements.groups.replaceChildren(...groups.map((group) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-group";
    const button = document.createElement("button");
    button.className = "group-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "true");
    button.innerHTML = `<span>${group}</span><span class="nav-count">${state.data.tables.filter((table) => table.group === group).length}</span><span class="chevron down"></span>`;
    const links = document.createElement("div");
    links.className = "group-links";
    state.data.tables.filter((table) => table.group === group).forEach((table) => {
      const link = document.createElement("a");
      link.className = "table-link";
      link.href = `#${table.id}`;
      link.dataset.tableId = table.id;
      link.textContent = table.title;
      links.append(link);
    });
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
    });
    wrapper.append(button, links);
    return wrapper;
  }));
}

function cellEditor(table, row, rowIndex, columnIndex) {
  const cell = document.createElement("td");
  const type = table.columnTypes[columnIndex] || "text";
  if (table.computed.includes(columnIndex)) {
    cell.className = "computed-cell";
    const value = document.createElement("span");
    value.className = "computed-value";
    value.textContent = formatValue(row[columnIndex], type);
    value.title = "Calculated by the source workbook logic";
    cell.append(value);
    return cell;
  }

  let editor;
  if (type.startsWith("lookup:")) {
    editor = document.createElement("select");
    editor.className = "cell-select";
    const sourceId = type.split(":")[1];
    const options = [...new Set((state.rows[sourceId] || []).map((candidate) => candidate[0]).filter(Boolean))];
    editor.append(new Option("", ""), ...options.map((option) => new Option(option, option)));
    editor.value = row[columnIndex] ?? "";
  } else {
    editor = document.createElement("input");
    editor.className = "cell-input";
    editor.type = "text";
    editor.inputMode = ["number", "percent"].includes(type) ? "decimal" : "text";
    editor.value = formatValue(row[columnIndex], type);
  }
  editor.setAttribute("aria-label", String(table.headers[columnIndex]));
  editor.addEventListener("change", () => {
    state.rows[table.id][rowIndex][columnIndex] = parseValue(editor.value, type);
    recalculateTable(table);
    scheduleSave(table);
    renderTable();
  });
  cell.append(editor);
  return cell;
}

function renderTable() {
  const table = activeTable();
  const rows = state.rows[table.id];
  const visibleRows = filterRows(rows, state.query);
  const headRow = document.createElement("tr");
  table.headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = String(header ?? "");
    if (table.computed.includes(index)) th.className = "computed-header";
    headRow.append(th);
  });
  const actionHeader = document.createElement("th");
  actionHeader.setAttribute("aria-label", "Row actions");
  headRow.append(actionHeader);
  elements.table.tHead.replaceChildren(headRow);

  const bodyRows = visibleRows.map(({ row, index: rowIndex }) => {
    const tr = document.createElement("tr");
    row.forEach((_, columnIndex) => tr.append(cellEditor(table, row, rowIndex, columnIndex)));
    const actionCell = document.createElement("td");
    actionCell.className = "delete-cell";
    const remove = document.createElement("button");
    remove.className = "delete-row";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "Delete row";
    remove.setAttribute("aria-label", `Delete row ${rowIndex + 1}`);
    remove.addEventListener("click", () => {
      state.rows[table.id].splice(rowIndex, 1);
      recalculateTable(table);
      saveRows(table);
      renderTable();
    });
    actionCell.append(remove);
    tr.append(actionCell);
    return tr;
  });
  elements.table.tBodies[0].replaceChildren(...bodyRows);
  elements.empty.hidden = visibleRows.length > 0;
  elements.table.hidden = visibleRows.length === 0;
  elements.rowSummary.textContent = state.query ? `${visibleRows.length} of ${rows.length} rows` : `${rows.length} rows`;
}

function openTable(id, updateHash = true) {
  const table = state.data.tables.find((candidate) => candidate.id === id) || state.data.tables[0];
  state.activeId = table.id;
  state.query = "";
  elements.search.value = "";
  elements.title.textContent = table.title;
  elements.description.textContent = table.description;
  elements.sheet.textContent = `${table.group} / Independent table`;
  elements.source.textContent = `${table.source.sheet} · ${table.source.range}`;
  elements.breadcrumb.textContent = table.title;
  document.querySelectorAll(".table-link").forEach((link) => link.classList.toggle("active", link.dataset.tableId === table.id));
  if (updateHash) history.replaceState(null, "", `#${table.id}`);
  recalculateTable(table);
  renderTable();
  document.body.classList.remove("nav-open");
}

function addRow() {
  const table = activeTable();
  state.rows[table.id].push(blankRow(table));
  recalculateTable(table);
  saveRows(table);
  state.query = "";
  elements.search.value = "";
  renderTable();
  requestAnimationFrame(() => {
    document.querySelector("#tableScroller").scrollTop = document.querySelector("#tableScroller").scrollHeight;
    const inputs = elements.table.querySelectorAll("tbody tr:last-child input, tbody tr:last-child select");
    inputs[0]?.focus();
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.setTimeout(() => elements.toast.classList.remove("visible"), 2200);
}

function projectMetadata() {
  return {
    projectName: elements.projectName.value,
    projectNumber: elements.projectNumber.value,
    submittal: elements.submittal.value,
    submittalDate: elements.submittalDate.value,
  };
}

function saveProjectMetadata() {
  localStorage.setItem(PROJECT_KEY, JSON.stringify(projectMetadata()));
}

function restoreProjectMetadata() {
  try {
    const project = JSON.parse(localStorage.getItem(PROJECT_KEY) || "null");
    if (!project) return;
    Object.entries(project).forEach(([key, value]) => { if (elements[key]) elements[key].value = value || ""; });
  } catch (_) {}
}

function exportProject() {
  const payload = { version: 1, workbook: state.data.workbook, project: projectMetadata(), tables: state.rows };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${elements.projectNumber.value || "project"}-independent-tables.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProject(file) {
  const payload = JSON.parse(await file.text());
  if (!payload || typeof payload.tables !== "object") throw new Error("This file does not contain independent table data.");
  state.data.tables.forEach((table) => {
    const rows = payload.tables[table.id];
    if (Array.isArray(rows) && rows.every((row) => Array.isArray(row) && row.length === table.headers.length)) {
      state.rows[table.id] = rows;
      saveRows(table);
    }
  });
  if (payload.project) {
    Object.entries(payload.project).forEach(([key, value]) => { if (elements[key]) elements[key].value = value || ""; });
    saveProjectMetadata();
  }
  openTable(state.activeId, false);
  showToast("Project data imported");
}

function bindEvents() {
  elements.groups.addEventListener("click", (event) => {
    const link = event.target.closest("[data-table-id]");
    if (link) {
      event.preventDefault();
      openTable(link.dataset.tableId);
    }
  });
  elements.search.addEventListener("input", () => { state.query = elements.search.value; renderTable(); });
  elements.addRow.addEventListener("click", addRow);
  elements.navAdd.addEventListener("click", addRow);
  elements.resetTable.addEventListener("click", () => {
    const table = activeTable();
    if (!window.confirm(`Reset ${table.title} to the original Excel values?`)) return;
    state.rows[table.id] = cloneRows(table.rows);
    saveRows(table);
    recalculateTable(table);
    renderTable();
    showToast(`${table.title} reset`);
  });
  elements.independentToggle.addEventListener("click", () => {
    const collapsed = elements.heading.classList.toggle("collapsed");
    elements.independentToggle.setAttribute("aria-expanded", String(!collapsed));
    elements.independentToggle.setAttribute("aria-label", collapsed ? "Expand independent tables" : "Collapse independent tables");
  });
  document.querySelector("#menuButton").addEventListener("click", () => document.body.classList.add("nav-open"));
  document.querySelector("#sidebarClose").addEventListener("click", () => document.body.classList.remove("nav-open"));
  elements.exportAll.addEventListener("click", exportProject);
  elements.importAll.addEventListener("change", async () => {
    try { await importProject(elements.importAll.files[0]); } catch (error) { showToast(error.message); }
    elements.importAll.value = "";
  });
  elements.resetAll.addEventListener("click", () => {
    if (!window.confirm("Reset all independent tables to the original Excel values?")) return;
    state.data.tables.forEach((table) => {
      state.rows[table.id] = cloneRows(table.rows);
      localStorage.removeItem(storageKey(table.id));
    });
    openTable(state.activeId, false);
    showToast("All independent tables reset");
  });
  [elements.projectName, elements.projectNumber, elements.submittal, elements.submittalDate].forEach((input) => input.addEventListener("change", saveProjectMetadata));
  window.addEventListener("hashchange", () => openTable(location.hash.slice(1), false));
}

async function init() {
  const response = await fetch(new URL("./workbook-data.json", import.meta.url));
  if (!response.ok) throw new Error("Workbook table data could not be loaded.");
  state.data = await response.json();
  state.data.tables.forEach((table) => { state.rows[table.id] = readRows(table); });
  document.querySelector("#tableCount").textContent = state.data.tables.length;
  document.querySelector("#engineeringNotice").textContent = state.data.notice;
  restoreProjectMetadata();
  renderNavigation();
  bindEvents();
  openTable(location.hash.slice(1) || state.data.tables[0].id, false);
}

init().catch((error) => {
  elements.title.textContent = "Unable to load the workbook tables";
  elements.description.textContent = error.message;
});
