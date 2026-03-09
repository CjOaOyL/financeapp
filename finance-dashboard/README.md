# Personal Finance Dashboard

A comprehensive web-based financial analysis tool for tracking expenditures, categorizing transactions, and visualizing spending patterns. Supports multiple import formats including PDF bank statements, CSV files, and JSON pre-extracted data.

## Quick Start

### 1. Start the Server
```bash
python -m http.server 8765
```

### 2. Open in Browser
Navigate to `http://localhost:8765`

### 3. Import Data
Click the **Import** tab and choose your import method:
- **PDF**: Bank statements (Navy Federal, Apple Card, standard formats)
- **CSV**: Spreadsheet export from your bank
- **JSON**: Pre-extracted transaction files (like `apple_card_august_2025.json`)
- **Manual**: Add transactions one by one

## Features

### 📊 7-Tab Dashboard
1. **Import** - Upload and preview financial data with line charts
2. **Overview** - Summary statistics and recent transactions
3. **Categories** - Pie chart of spending by category
4. **Trends** - Monthly spending patterns and comparisons
5. **Merchants** - Top merchants and spending analysis
6. **Savings** - Monthly savings tracking and goals
7. **Budget** - Budget planning and variance tracking

### 🤖 Smart Details
- Automatic transaction categorization (16+ categories)
- Merchant name normalization (80+ pattern rules)
- Income/expense classification
- Duplicate detection
- Real-time chart updates on filter changes

### 💾 Data Management
- **Client-side only**: All data stored in browser localStorage
- **No cloud sync**: Data never leaves your device
- **CSV Export**: Download transaction reports
- **HTML Reports**: Generate standalone offline reports
- **Bulk Edit**: Change categories for multiple transactions

## File Structure

```
├── index.html                    # Dashboard UI (7 tabs)
├── app.js                        # Main controller
├── importer.js                   # PDF/CSV/JSON/Manual imports
├── charts.js                     # Chart rendering (Chart.js)
├── dataManager.js               # Transaction storage/retrieval
├── analysis.js                  # Financial calculations
├── budget.js                    # Budget planning
├── exporter.js                  # CSV/HTML export
├── descriptionCleaner.js        # Merchant normalization
├── styles.css                   # Styling
├── extracted_transactions.json  # Sample data (Navy Federal)
├── apple_card_august_2025.json  # Sample data (Apple Card)
├── extract_pdf.py               # Extract Navy Federal PDFs
└── extract_apple_card.py        # Extract Apple Card PDFs
```

## Import Methods

### PDF Bank Statements
The dashboard automatically detects and imports columns from bank statement PDFs:

**Supported Formats:**
- **Apple Card** ✅ Direct browser import with section detection
- **Navy Federal** ✅ MM-DD format with spatial column matching  
- **Standard bank statements** ✅ Fixed-width columns with date/description/amount

**How to Import:**
1. Click **Import** tab → **PDF Import**
2. Select your bank statement PDF
3. Dashboard automatically detects format:
   - **Apple Card**: Detects payment vs transaction sections
   - **Navy Federal**: Finds MM-DD dates and column positions
   - **Other banks**: Matches numeric patterns for amounts
4. Preview extracted transactions
5. Click **Accept** to import

The parser uses:
- **pdf.js** (browser-side) for spatial coordinate matching of columns
- Section header detection for Apple Card (Payments vs Transactions)
- Multi-line description handling
- Smart amount detection with Daily Cash filtering

### CSV Files
1. Export your bank statement as CSV
2. Upload to **Import** tab → **CSV Import**
3. Map columns: Date, Description, Amount, Category
4. Preview and accept

### JSON Pre-Extracted Data (Optional)
For advanced users who can pre-extract data:
```bash
python extract_apple_card.py "August 2025.pdf" > apple_card.json
```

Then upload via **Import** tab → **JSON Import**.

### Example: Apple Card August 2025
The repo includes a sample `apple_card_august_2025.json` with 50 real transactions from August 2025:
- 12 payments (income/credits): $1,456.99
- 38 charges (expenses): $28.22 in daily cash
- 2 cardholders: Jermel Levons + Janesha Levons

**To test PDF import directly:**
1. Download the original Apple Card PDF (if you have it)
2. Click **Import** tab → **PDF Import**
3. Select the PDF
4. Dashboard extracts all transactions automatically
5. Preview → Accept to import

Or use the pre-extracted JSON:
1. Click **Import** tab → **JSON Import**
2. Select `apple_card_august_2025.json`
3. Review and accept

## Extraction Scripts (Optional)
- Preserves cardholder info for multi-account cards
- Handles daily cash percentages and balances

### For Navy Federal PDFs
```bash
python extract_pdf.py "/path/to/statement.pdf"
```

Outputs structured transaction JSON ready for import.

## Technologies

| Component | Tech | Version |
|-----------|------|---------|
| Frontend | HTML5/CSS3 | - |
| Charts | Chart.js | 4.4.1 (CDN) |
| PDF (Browser) | pdf.js | 3.11.174 (CDN) |
| PDF (Server) | PyMuPDF (fitz) | Latest |
| Data Store | localStorage | Native |
| Server | Python http.server | 3.8+ |

## Data Storage & Privacy

✅ **All data stored locally** in your browser's localStorage  
✅ **Zero cloud connectivity** - server only serves static files  
✅ **No login required**  
✅ **No tracking** - financial data never leaves your device  

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Click date header | Sort by date ascending/descending |
| Click description header | Sort by merchant name A-Z |
| Click category cell | Edit category for that transaction |
| Ctrl+A (in filter) | Select all visible transactions |

## Troubleshooting

**PDF extraction returns no transactions?**
- Ensure PDF has visible columns for Date/Description/Amount
- Try CSV export from your bank instead
- Use JSON import with pre-extracted data

**Charts not updating?**
- Refresh browser (Ctrl+F5 for hard refresh)
- Check localStorage is enabled in browser settings
- Verify transactions have valid dates (YYYY-MM-DD or MM/DD/YYYY)

**JSON import says "No transactions found"?**
- Verify JSON has `date`, `amount`, `description` fields
- Check date format: YYYY-MM-DD or MM/DD/YYYY
- Amount should be positive number (is_income flag controls income vs expense)

**Bank data won't categorize correctly?**
- Edit categories after import (click category cell to change)
- Add merchants to descriptionCleaner.js if needed
- Use filters to group similar transactions

## Architecture

### Data Flow
1. **Import** (PDF/CSV/JSON) → Importer.js
2. **Clean** (normalize descriptions) → DescriptionCleaner.js
3. **Categorize** (auto-assign categories) → DataManager.js
4. **Store** (save to localStorage) → Native localStorage
5. **Analyze** (calculate totals, trends) → Analysis.js
6. **Visualize** (render charts) → Charts.js / Chart.js

### Module Dependencies
```
app.js (main controller)
├── importer.js (all imports)
├── descriptionCleaner.js (normalize merchants)
├── dataManager.js (CRUD + localStorage)
├── charts.js (visualizations)
├── analysis.js (metrics)
├── budget.js (budget tracking)
└── exporter.js (CSV/HTML export)
```

## Future Enhancements

- [ ] Recurring transaction detection
- [ ] Advanced forecasting & budgets
- [ ] Mobile responsive UI
- [ ] Cloud sync (optional)
- [ ] Transaction tagging
- [ ] Bill reminders
- [ ] Net worth tracking
- [ ] Multi-user support

## Contributing

Want to add support for another bank? Create a new extraction script:
1. Analyze PDF structure with PyMuPDF
2. Extract columns using coordinate matching or regex
3. Output JSON matching the app's format
4. Test via JSON Import tab

## License

MIT - Free for personal and commercial use

---

**Repository**: [github.com/CjOaOyL/financeapp](https://github.com/CjOaOyL/financeapp)  
**Live Demo**: [GitHub Pages](https://cjoaoyL.github.io/financeapp) (when deployed)
