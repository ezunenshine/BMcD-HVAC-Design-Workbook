# HVAC Calculation Studio

Local web-app shell for migrating `01-185021-IESVE-ENERGY-MODEL-CALCULATIONS.xlsm`.

## Run on Windows

Double-click `start.bat`.

## Run from a terminal

```bash
python app.py
```

Open <http://127.0.0.1:8000>.

Keep the browser tab open during development. The page checks the local source files and refreshes automatically when the interface changes.

This increment establishes the project-browser information architecture and source-sheet traceability. Calculation forms and parity-tested formula modules are not implemented yet. Treat future calculated results as an engineering aid until reviewed and accepted by a qualified HVAC professional.

See `WORKBOOK_MAP.md` for the source inventory and current navigation mapping.
