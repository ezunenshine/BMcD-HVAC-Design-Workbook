import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { filterRows, parseValue, recalculate } from "../static/model.js";


test("equipment heat gain matches the Excel equation", () => {
  const table = { id: "equipment-schedule" };
  const rows = [["Motor", 100, 2, 0.8, null, null]];
  const result = recalculate(table, rows, {});
  assert.ok(Math.abs(result[0][4] - 1464.8568) < 1e-9);
});

test("grouped equipment looks up and sums heat gain", () => {
  const table = { id: "grouped-equipment-schedule" };
  const rows = [["Desk", 2, "Monitor", null, null], ["Desk", 1, "Laptop", null, null]];
  const sources = { "equipment-schedule": [["Monitor", null, null, null, 200], ["Laptop", null, null, null, 100]] };
  const result = recalculate(table, rows, sources);
  assert.deepEqual(result.map((row) => row.slice(3)), [[400, 500], [100, 500]]);
});

test("baseline system label preserves the workbook concatenation", () => {
  const table = { id: "baseline-systems" };
  const result = recalculate(table, [["System 1", "PTAC", null]], {});
  assert.equal(result[0][2], "System 1 - PTAC");
});

test("percent editing accepts workbook decimals and displayed percentages", () => {
  assert.equal(parseValue("80%", "percent"), 0.8);
  assert.equal(parseValue("0.8", "percent"), 0.8);
});

test("table search returns original row indexes", () => {
  assert.deepEqual(filterRows([["Alpha", 1], ["Beta", 2]], "beta").map((entry) => entry.index), [1]);
});

test("migrated calculations match cached workbook outputs", async () => {
  const data = JSON.parse(await readFile(new URL("../static/workbook-data.json", import.meta.url), "utf8"));
  const byId = Object.fromEntries(data.tables.map((table) => [table.id, table]));
  const sourceRows = Object.fromEntries(data.tables.map((table) => [table.id, table.rows]));

  const equipmentExpected = byId["equipment-schedule"].rows.map((row) => row[4]);
  const equipmentActual = recalculate(byId["equipment-schedule"], byId["equipment-schedule"].rows, sourceRows);
  equipmentActual.forEach((row, index) => assert.ok(Math.abs(row[4] - equipmentExpected[index]) < 1e-6));

  const groupedExpected = byId["grouped-equipment-schedule"].rows.map((row) => row.slice(3));
  const groupedActual = recalculate(byId["grouped-equipment-schedule"], byId["grouped-equipment-schedule"].rows, sourceRows);
  groupedActual.forEach((row, index) => {
    assert.ok(Math.abs(row[3] - groupedExpected[index][0]) < 1e-6);
    assert.ok(Math.abs(row[4] - groupedExpected[index][1]) < 1e-6);
  });
});
