# HVAC Design Workbook

Local web-app shell for migrating `01-185021-IESVE-ENERGY-MODEL-CALCULATIONS.xlsm`.

## Run on Windows

Double-click `start.bat`.

## Run from a terminal

```bash
python app.py
```

Open <http://127.0.0.1:8000>.

Keep the browser tab open during development. The page checks the local source files and refreshes automatically when the interface changes.

Project Number, Project Name, Submittal, and Submittal Date are editable in the project browser and persist in that browser. Section headings open summary pages; their chevrons expand and collapse the calculation links.

## GitHub Pages

The included GitHub Actions workflow publishes the contents of `static/` whenever `main` changes. In the repository, open **Settings → Pages** and select **GitHub Actions** as the publishing source once. Future pushes deploy automatically.

### One-file publishing

After the initial repository upload, replace the root-level `site.zip` file for each approved release. The Pages workflow automatically extracts that archive and publishes it. This allows releases prepared in the HVAC Workbook Migrator chat to be deployed through one GitHub file upload even when the chat's GitHub integration is disabled.

This increment establishes the project-browser information architecture and source-sheet traceability. Calculation forms and parity-tested formula modules are not implemented yet. Treat future calculated results as an engineering aid until reviewed and accepted by a qualified HVAC professional.

See `WORKBOOK_MAP.md` for the source inventory and current navigation mapping.
