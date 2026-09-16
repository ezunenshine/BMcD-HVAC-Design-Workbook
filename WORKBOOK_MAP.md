# Independent Table Workbook Map

The source is `01-185021-IESVE-ENERGY-MODEL-CALCULATIONS.xlsm`. The workbook remains authoritative and is not modified by this prototype.

| App table | Excel source | Behavior |
| --- | --- | --- |
| Light Schedule | `Lighting!O13:Q62` / `lighting_schedule` | Light and wattage editable; Quantity retained as workbook-calculated output |
| Equipment Schedule | `Misc!T9:Y56` / `equipment_schedule` | Heat Gain recalculates as `Sens Heat Gain + Power * (1 - Efficiency) * 3412.142`; Quantity retained from workbook |
| Grouped Equipment Schedule | `Misc!AA9:AE11` / `workstation_schedule` | Equipment lookup, row heat gain, and group sum recalculate in the browser |
| Exhaust Equipment | `Exhaust!AV9:BE40` / `fixture_schedule` | Requirement inputs editable; Quantity retained as workbook-calculated output |
| Ventilation Rates | `ASHRAE!B4:E83` | Independent reference data |
| Baseline Lighting | `ASHRAE!G4:H108` | Independent reference data |
| Proposed Lighting | `ASHRAE!J4:K103` | Independent reference data |
| People Heat Gain | `ASHRAE!M4:O17` | Independent reference data |
| Pressurization | `ASHRAE!Q4:R9` | Independent reference data |
| Baseline Systems | `ASHRAE!AL4:AR18` | System List recalculates from Number and System |
| FEMP Hot Water Use | `ASHRAE!AT4:AU11` | Independent reference data |
| Ethylene Glycol Density | `Water!B9:L38` | Independent reference data |
| Propylene Glycol Density | `Water!O9:Y38` | Independent reference data |
| Ethylene Glycol Specific Heat | `Water!B44:L73` | Independent reference data |
| Propylene Glycol Specific Heat | `Water!O44:Y73` | Independent reference data |
| Water Properties | `Water!B89:O113` | Independent reference data |

## Known gaps

- Lighting Quantity depends on `space_lght_breakdown`, and Exhaust Quantity depends on `space_exh_breakdown` and `space_exh_breakdown2`. The current app retains the workbook's cached values because those upstream space tables are outside this increment.
- Equipment Quantity depends on `space_misc_breakdown` and is likewise retained from the workbook snapshot.
- Browser edits do not write back to the macro-enabled workbook. Project JSON is the reversible interchange format for this prototype.
