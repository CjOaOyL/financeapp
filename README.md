# Personal Finance Dashboard

A comprehensive web-based personal finance dashboard for analyzing and managing your finances with support for multiple import formats, automatic categorization, and detailed financial analytics.

## Features

- **Multi-Format Import**: Import financial data from:
  - PDF bank statements (Apple Card, Navy Federal, and standard bank formats)
  - CSV files
  - JSON format
  - Manual transaction entry

- **Smart Data Processing**:
  - Automatic transaction categorization (16+ categories)
  - Merchant name normalization and deduplication
  - Description cleaning with 80+ pattern rules
  - Duplicate detection and prevention

- **Dashboard Analytics** (7 interactive tabs):
  1. **Import** - Upload and preview financial data with real-time line charts
  2. **Overview** - Summary statistics and recent transactions
  3. **Categories** - Pie chart breakdown of spending by category
  4. **Trends** - Monthly spending patterns and comparisons
  5. **Merchants** - Top merchants and spending distribution
  6. **Savings** - Monthly savings analysis and goals
  7. **Budget** - Budget planning and variance tracking

- **Visualizations**:
  - Real-time line charts (income vs. expenses)
  - Interactive category pie charts
  - Monthly trend analysis
  - Merchant spending breakdown
  - Savings progress tracking

- **Data Management**:
  - Client-side data storage (localStorage)
  - CSV export for reporting
  - Standalone HTML report generation
  - Transaction filtering and search
  - Bulk categorization updates

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charting**: Chart.js 4.4.1 (CDN)
- **PDF Processing**: 
  - Client-side: pdf.js 3.11.174 (spatial column matching)
  - Server-side: PyMuPDF (fitz) for initial extraction
- **Data Storage**: localStorage (browser-based)
- **Server**: Python HTTP server

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/CjOaOyL/financeapp.git
cd financeapp
```

### 2. Start the Python Server
```bash
python -m http.server 8765
```

The server will start on `http://localhost:8765`

### 3. Open in Browser
Navigate to `http://localhost:8765` in your web browser.

## Usage Guide

### Importing Transactions

**PDF Bank Statements:**
1. Click the **Import** tab
2. Select your PDF statement file
3. The dashboard will automatically detect:
   - Column positions (date, description, amount)
   - Transaction direction (income/expense)
   - Account type
4. Review the preview and click **Accept** to import

**CSV Files:**
1. Prepare CSV with columns: Date, Description, Amount, Account
2. Click **Import** → select file
3. Preview and confirm import

**JSON Format (Apple Card & Pre-extracted Data):**
1. Export extracted transactions as JSON from another source
2. Upload via the JSON import box in the **Import** tab
3. Transactions auto-categorize based on merchant/keywords

**Apple Card Example:**
- The repository includes `apple_card_august_2025.json` with 50 real transactions
- Sample payments (8) and charges (14) from Jermel Levons + Janesha Levons accounts
- To use: Click **Import** tab → **JSON Import** → select `apple_card_august_2025.json` → Preview → Accept
- Automatically separates payments (income/credits) from charges (expenses)

**Manual Entry:**
1. Use the "Add New Transaction" form
2. Enter date, description, amount, account, category
3. Click "Add Transaction" to save

### Analyzing Your Data

- **Categorize**: Click any transaction row to change its category
- **Filter**: Use dropdown filters (Account, Category, Month, Search)
- **Sort**: Click column headers to sort
- **Export**: Download CSV or generate standalone HTML report

## Project Structure

```
financeapp/
├── index.html                      # Main dashboard UI
├── app.js                          # Core application logic
├── importer.js                     # PDF/CSV/JSON import handlers
├── charts.js                       # Chart rendering functions
├── dataManager.js                  # Transaction data CRUD
├── analysis.js                     # Financial analysis utilities
├── budget.js                       # Budget planning & tracking
├── exporter.js                     # CSV/HTML export functions
├── descriptionCleaner.js           # Merchant name normalization
├── styles.css                      # Global styles
├── extracted_transactions.json     # Sample data (Navy Federal extract)
├── apple_card_august_2025.json     # Sample data (Apple Card transactions)
├── extract_pdf.py                  # Server-side PDF extraction (Navy Federal)
└── extract_apple_card.py           # Server-side PDF extraction (Apple Card)
```

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| PDF Parsing | pdf.js 3.11.174 | Client-side text extraction with spatial analysis |
| PDF Analysis | PyMuPDF (fitz) | Server-side structure analysis |
| Charting | Chart.js 4.4.1 | Interactive financial visualizations |
| Data Store | localStorage | Client-side persistence (no server DB needed) |
| Server | Python http.server | Development server |

## PDF Statement Support

### Browser-Side Extraction (Automatic)
The dashboard supports PDF extraction for bank statements using spatial column detection. It works with statements containing:
- Date
- Description/Merchant
- Amount
- (Optional) Balance

Supported formats:
- **Navy Federal Credit Union** - Full support with column detection
- **Standard bank statements** - Works with any statement using fixed-width columns

### Server-Side Extraction (Apple Card)
For Apple Card statements, use the included extraction script to pre-process PDFs:

```bash
python extract_apple_card.py <path_to_pdf>
```

This generates a JSON file that you can import via the **JSON Import** feature. The script handles:
- Multiple cardholders
- Separate payment and transaction sections
- Daily cash percentages and balances
- Proper income/expense classification

**Or** use the pre-extracted August 2025 example:
1. Click **Import** tab → **JSON Import**
2. Select `apple_card_august_2025.json`
3. Review and accept to load 50 sample transactions

The spatial column detection algorithm automatically identifies column X-positions and extracts transactions with high accuracy.

## Data Privacy

- **All data is stored locally** in your browser's localStorage
- **No data is sent to any server** (Python server only serves static files)
- **No accounts or logins** required
- Your financial data never leaves your device

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Multi-account reconciliation
- [ ] Recurring transaction detection
- [ ] Advanced forecasting
- [ ] Mobile app version
- [ ] Database backend for cloud sync
- [ ] Transaction tagging system
- [ ] Bill reminders
- [ ] Net worth tracking

## Troubleshooting

**PDF not importing?**
- Ensure PDF is a bank statement with date/description/amount columns
- Try CSV export from your bank instead
- Use the JSON import with pre-extracted data

**Charts not updating?**
- Clear browser cache and reload
- Check that localStorage is enabled
- Verify transactions have valid dates

**Port 8765 already in use?**
- Change port: `python -m http.server 9000`
- Update browser URL to match

## Contributing

Feel free to fork, enhance, and submit pull requests! Current priorities:
- Additional bank format support
- Mobile UI optimization
- Advanced filtering options
- New chart types

## License

MIT License - feel free to use for personal or commercial purposes

## Support

For issues or feature requests, please open an issue on the [GitHub repository](https://github.com/CjOaOyL/financeapp).

---

**Live Demo**: [GitHub Pages](https://cjoaoyL.github.io/financeapp/) (after deployment)

**Repository**: [github.com/CjOaOyL/financeapp](https://github.com/CjOaOyL/financeapp)

Built with ❤️ for personal finance management
