# HVAC Design Workbook Prototype

This local prototype exposes the workbook's independent lookup and schedule tables as searchable, editable web tables. The source workbook remains unchanged.

## Run on Windows

Extract the full ZIP before running it. Double-click `start.bat`; it starts the local server first and then opens `http://127.0.0.1:8000` in your browser.

Keep the server window open while using the app. Close that window when you are finished.

## Run from a terminal

```text
python app.py
```

## Included behavior

- 16 tables sourced from Lighting, Misc, Exhaust, ASHRAE, and Water
- Search, add, edit, and delete rows independently in each table
- Browser-local persistence with per-table or full reset to the Excel snapshot
- Project JSON import/export
- Locked formula columns for schedule outputs
- Live Excel-equivalent calculations for equipment heat gain, grouped equipment heat gain, and baseline system labels
- Read-only preservation of workbook-calculated Lighting and Exhaust quantities until their upstream space tables are migrated

This prototype is an engineering aid. Results require review and acceptance by a qualified HVAC professional.
