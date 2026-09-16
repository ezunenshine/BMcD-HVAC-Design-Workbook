export function cloneRows(rows) {
  return rows.map((row) => row.slice());
}

export function blankRow(table) {
  return table.headers.map((_, index) => table.computed.includes(index) ? 0 : null);
}

function numeric(value) {
  if (value === null || value === undefined || value === "" || value === "-") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function recalculate(table, rows, tableRowsById) {
  const next = cloneRows(rows);

  if (table.id === "equipment-schedule") {
    next.forEach((row) => {
      row[4] = numeric(row[1]) + numeric(row[2]) * (1 - numeric(row[3])) * 3412.142;
    });
  }

  if (table.id === "grouped-equipment-schedule") {
    const equipmentRows = tableRowsById["equipment-schedule"] || [];
    const heatByEquipment = new Map(equipmentRows.map((row) => [String(row[0] || ""), numeric(row[4])]));
    next.forEach((row) => {
      row[3] = row[0] ? numeric(row[1]) * (heatByEquipment.get(String(row[2] || "")) || 0) : 0;
    });
    next.forEach((row) => {
      const group = String(row[0] || "");
      row[4] = group ? next.reduce((sum, candidate) => sum + (String(candidate[0] || "") === group ? numeric(candidate[3]) : 0), 0) : 0;
    });
  }

  if (table.id === "baseline-systems") {
    next.forEach((row) => {
      row[2] = row[0] ? `${row[0]} - ${row[1] || ""}` : "";
    });
  }

  return next;
}

export function formatValue(value, type) {
  if (value === null || value === undefined || value === "") return "";
  if (value === "-") return value;
  if (type === "percent" && Number.isFinite(Number(value))) return `${(Number(value) * 100).toFixed(1)}%`;
  if (type === "number" && Number.isFinite(Number(value))) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(Number(value));
  }
  return String(value);
}

export function parseValue(value, type) {
  if (value.trim() === "") return null;
  if (value.trim() === "-") return "-";
  if (type === "percent") {
    const cleaned = value.replace("%", "").trim();
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return value;
    return value.includes("%") || parsed > 1 ? parsed / 100 : parsed;
  }
  if (type === "number") {
    const parsed = Number(value.replaceAll(",", ""));
    return Number.isFinite(parsed) ? parsed : value;
  }
  return value;
}

export function filterRows(rows, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return rows.map((row, index) => ({ row, index }));
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.some((cell) => String(cell ?? "").toLocaleLowerCase().includes(needle)));
}
