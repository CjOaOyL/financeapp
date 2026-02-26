/* ============================================
   Importer — PDF extraction + CSV parsing + JSON import
   ============================================ */

const Importer = (() => {
  /* ---- PDF Import ---- */

  let pendingPdfTransactions = [];

  /**
   * Extract transactions from a PDF using spatial coordinate matching.
   * Uses pdf.js text item positions to identify columns (date, description, amount).
   * Falls back to line-by-line heuristic parsing if spatial method yields nothing.
   */
  async function parsePDF(file) {
    console.log(`[PDF Parser] Starting PDF import for: ${file.name}`);
    const arrayBuf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
    console.log(`[PDF Parser] PDF loaded, ${pdf.numPages} pages`);

    // Try Apple Card format first (MM/DD/YYYY dates with cardholder sections)
    console.log(`[PDF Parser] Attempting Apple Card parser...`);
    const appleCardTxs = await parseAppleCardPDF(pdf, file.name);
    console.log(`[PDF Parser] Apple Card parser returned ${appleCardTxs.length} transactions`);
    if (appleCardTxs.length > 0) {
      console.log(`[PDF Parser] Using Apple Card results`);
      return appleCardTxs;
    }

    // Try spatial (coordinate-based) extraction for Navy Federal format
    console.log(`[PDF Parser] Attempting spatial (Navy Federal) parser...`);
    const spatialTxs = await parsePDFSpatial(pdf, file.name);
    console.log(`[PDF Parser] Spatial parser returned ${spatialTxs.length} transactions`);
    if (spatialTxs.length > 0) {
      console.log(`[PDF Parser] Using spatial results`);
      return spatialTxs;
    }

    // Fall back to line-by-line heuristic
    console.log(`[PDF Parser] Attempting fallback heuristic parser...`);
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n';
    }
    const heuristicTxs = extractTransactionsFromText(fullText, file.name);
    console.log(`[PDF Parser] Heuristic parser returned ${heuristicTxs.length} transactions`);
    return heuristicTxs;
  }

  /**
   * Apple Card PDF parser — detects Apple Card statement layout
   * (MM/DD/YYYY dates, separate Payments and Transactions sections, Daily Cash)
   */
  async function parseAppleCardPDF(pdf, sourceName) {
    console.log(`[Apple Card Parser] Started parsing`);
    // Extract all text to detect if this is an Apple Card statement
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n';
    }

    // Check if this looks like an Apple Card statement
    const hasAppleCard = fullText.includes('Apple Card');
    const hasGoldmanSachs = fullText.includes('Goldman Sachs');
    const hasPayments = fullText.includes('Payments');
    const hasTransactions = fullText.includes('Transactions');
    const hasDailyCash = fullText.includes('Daily Cash');
    
    console.log(`[Apple Card Parser] Detection check:`);
    console.log(`  - Apple Card: ${hasAppleCard}`);
    console.log(`  - Goldman Sachs: ${hasGoldmanSachs}`);
    console.log(`  - Payments: ${hasPayments}`);
    console.log(`  - Transactions: ${hasTransactions}`);
    console.log(`  - Daily Cash: ${hasDailyCash}`);
    
    if (!hasAppleCard && !hasGoldmanSachs && 
        !(hasPayments && hasTransactions && hasDailyCash)) {
      console.log(`[Apple Card Parser] Not detected as Apple Card - returning empty`);
      return [];
    }
    
    console.log(`[Apple Card Parser] Detected as Apple Card - proceeding with extraction`);

    // Collect all text items with coordinates from every page
    const allItems = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      for (const item of content.items) {
        const text = item.str.trim();
        if (!text) continue;
        const x = Math.round(item.transform[4] * 10) / 10;
        const y = Math.round(item.transform[5] * 10) / 10;
        allItems.push({ x, y, text, page: i, width: item.width });
      }
    }
    
    console.log(`[Apple Card Parser] Collected ${allItems.length} text items total`);

    // Find date column (MM/DD/YYYY format at left)
    const mmddyyyyPattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    const dateItems = allItems.filter(it => mmddyyyyPattern.test(it.text));
    console.log(`[Apple Card Parser] Found ${dateItems.length} MM/DD/YYYY dates`);
    if (dateItems.length === 0) {
      console.log(`[Apple Card Parser] No dates found - returning empty`);
      return [];
    }
    
    console.log(`[Apple Card Parser] Found ${dateItems.length} date items`);
    console.log(`[Apple Card Parser] Sample dates:`, dateItems.slice(0, 3).map(d => `${d.text} (x=${d.x})`));
    // Find the most common X position for dates
    const dateXCounts = {};
    for (const it of dateItems) {
      const xr = Math.round(it.x);
      dateXCounts[xr] = (dateXCounts[xr] || 0) + 1;
    }
    const dateX = parseInt(Object.entries(dateXCounts).sort((a, b) => b[1] - a[1])[0][0]);
    console.log(`[Apple Card Parser] Date column X: ${dateX}`);

    // Find amount items using increasingly lenient pattern matching
    // Pattern 1: Standard currency format
    const amountPattern = /^\d{1,3}(,\d{3})*\.\d{2}$/;
    let amountItemsToUse = allItems.filter(it => amountPattern.test(it.text) && it.x > dateX + 200);
    console.log(`[Apple Card Parser] Pattern 1 found: ${amountItemsToUse.length} amounts`);

    // Pattern 2: If not enough, try with optional minus/dollar
    if (amountItemsToUse.length < 30) {
      const betterAmountPattern = /^\$?-?\d{1,3}(,\d{3})*(\.\d{2})?$/;
      amountItemsToUse = allItems.filter(it => 
        betterAmountPattern.test(it.text) && it.x > dateX + 200
      );
      console.log(`[Apple Card Parser] Pattern 2 found: ${amountItemsToUse.length} amounts`);
    }
    
    // Pattern 3: If still not enough, try very lenient (just numbers)
    if (amountItemsToUse.length < 30) {
      const basicNumPattern = /^-?\d{1,3}(,\d{3})*(\.\d{2})?$/;
      amountItemsToUse = allItems.filter(it => 
        basicNumPattern.test(it.text) && it.x > dateX + 150
      );
      console.log(`[Apple Card Parser] Pattern 3 found: ${amountItemsToUse.length} amounts`);
    }
    
    // Debug: Show all numeric-looking items and their positions
    const allNumeric = allItems.filter(it => /^\$?-?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(it.text));
    console.log(`[Apple Card Parser] Total numeric items: ${allNumeric.length}`);
    console.log(`[Apple Card Parser] Numeric X-positions:`, 
      [...new Set(allNumeric.map(it => Math.round(it.x / 10) * 10))].slice(0, 10).sort((a,b) => a-b));
    console.log(`[Apple Card Parser] Sample numeric items:`, allNumeric.slice(0, 5).map(it => `"${it.text}" (x=${it.x})`));
    
    if (amountItemsToUse.length === 0) {
      console.log(`[Apple Card Parser] NO AMOUNTS FOUND - trying fallback`);
      return [];
    }

    // Find amount column X
    const amountXCounts = {};
    for (const it of amountItemsToUse) {
      const xr = Math.round(it.x / 10) * 10;
      amountXCounts[xr] = (amountXCounts[xr] || 0) + 1;
    }
    const amountXClusters = Object.entries(amountXCounts)
      .map(([x, c]) => ({ x: parseInt(x), count: c }))
      .sort((a, b) => a.x - b.x);
    
    if (amountXClusters.length === 0) return [];
    const amountX = amountXClusters[0].x;

    // Collect description items (between date and amount columns)
    // Exclude percentage items (e.g., "2%", "1%") which are Daily Cash indicators
    const descItems = allItems.filter(it => 
      it.x > dateX + 30 && it.x < amountX - 20 && 
      it.text.length > 1 && 
      !/%$/.test(it.text) &&  // Exclude percentages
      !it.text.match(/^[\d.]+$/)  // Exclude pure numbers (Daily Cash amounts)
    );

    // Detect section headers to determine transaction type more accurately
    // Look for "Payments made by" and "Transactions by" sections
    let currentCardholder = null;
    let currentSectionType = null;
    const sectionBoundaries = []; // { page, y, type: 'Payments'|'Transactions', cardholder }
    
    for (const item of allItems) {
      const lower = item.text.toLowerCase();
      const paymentsMatch = item.text.match(/payments\s+made\s+by\s+(\w+\s+\w+)/i);
      const transactionsMatch = item.text.match(/transactions\s+by\s+(\w+\s+\w+)/i);
      
      if (paymentsMatch) {
        currentSectionType = 'Payments';
        currentCardholder = paymentsMatch[1];
        sectionBoundaries.push({ page: item.page, y: item.y, type: 'Payments', cardholder: currentCardholder });
      } else if (transactionsMatch) {
        currentSectionType = 'Transactions';
        currentCardholder = transactionsMatch[1];
        sectionBoundaries.push({ page: item.page, y: item.y, type: 'Transactions', cardholder: currentCardholder });
      }
    }

    // Build transactions per page
    const transactions = [];
    const pagesWithDates = [...new Set(dateItems.map(d => d.page))];

    for (const pg of pagesWithDates) {
      const pgDates = dateItems.filter(d => d.page === pg).sort((a, b) => b.y - a.y);
      const pgDescs = descItems.filter(d => d.page === pg).sort((a, b) => b.y - a.y);
      const pgAmounts = amountItemsToUse.filter(d => d.page === pg).sort((a, b) => b.y - a.y);

      // Build description rows
      const descRows = [];
      for (const dateItem of pgDates) {
        const nearDescs = pgDescs.filter(d => Math.abs(d.y - dateItem.y) < 6);
        if (nearDescs.length === 0) continue;
        const descText = nearDescs.map(d => d.text).join(' ');

        // Skip headers and non-transaction text
        const lower = descText.toLowerCase();
        if (lower.includes('date') || lower.includes('description') || lower.includes('daily cash') ||
            lower.includes('total') || lower.includes('amount') || 
            lower === 'for jermel levons' || lower === 'for janesha levons') continue;

        descRows.push({ y: dateItem.y, date: dateItem.text, desc: descText });
      }

      // Append continuation lines to descriptions
      for (const descItem of pgDescs) {
        const hasDate = pgDates.some(d => Math.abs(d.y - descItem.y) < 6);
        if (hasDate) continue;

        // Skip section headers and non-transaction items
        const lower = descItem.text.toLowerCase();
        if (lower.includes('payments') || lower.includes('transactions') || lower.includes('total')) continue;

        // Find closest preceding row
        let closest = null;
        let closestDist = Infinity;
        for (const dr of descRows) {
          const dist = dr.y - descItem.y;
          if (dist > 0 && dist < closestDist && dist < 20) {
            closestDist = dist;
            closest = dr;
          }
        }
        if (closest) closest.desc += ' ' + descItem.text;
      }

      // Match amounts to descriptions by Y-position proximity
      for (const dr of descRows) {
        // Find amount closest in Y to this description
        const closestAmount = pgAmounts.reduce((closest, amt) => {
          const dist = Math.abs(amt.y - dr.y);
          const closestDist = Math.abs(closest.y - dr.y);
          return dist < closestDist ? amt : closest;
        });

        const dateStr = dr.date;
        const rawDesc = dr.desc;

        // Determine transaction type based on section type and description hints
        // Default: check section type, then fall back to keywords
        let isIncome = false;
        
        // Find which section this row belongs to (by page and Y position)
        const rowSection = sectionBoundaries
          .filter(s => s.page === pg)
          .sort((a, b) => a.y - b.y)
          .reverse()
          .find(s => s.y > dr.y);
        
        if (rowSection) {
          isIncome = (rowSection.type === 'Payments'); // Payments = income/credits
        } else {
          // Fallback: use keywords
          const lower = rawDesc.toLowerCase();
          isIncome = lower.includes('ach') || 
                     lower.includes('internet transfer') ||
                     lower.includes('payment');
        }

        const cleanResult = DescriptionCleaner.clean(rawDesc);
        const cleanedDesc = cleanResult.cleaned;
        const amount = Math.abs(parseFloat(closestAmount.text.replace(/,/g, '')));

        transactions.push({
          date: dateStr,
          description: cleanedDesc,
          amount,
          category: isIncome ? 'Income' : DataManager.autoCategory(cleanedDesc),
          account: 'Apple Card',
          _raw: rawDesc,
          _originalDesc: cleanResult.original,
          _txType: cleanResult.txType,
          _merchant: cleanResult.merchant,
          _isIncome: isIncome
        });
      }
    }

    console.log(`[Apple Card Parser] Final result: ${transactions.length} transactions extracted`);
    if (transactions.length > 0) {
      console.log(`[Apple Card Parser] Sample:`, transactions[0]);
    }
    return transactions;
  }

  /**
   * Spatial PDF parser — uses text item X/Y coordinates to match
   * date, description, and amount columns. Works for bank statements
   * where columns are at fixed X positions (e.g. Navy Federal, Chase).
   */
  async function parsePDFSpatial(pdf, sourceName) {
    // Phase 1: Collect all text items with positions from every page
    const allItems = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      for (const item of content.items) {
        const text = item.str.trim();
        if (!text) continue;
        // pdf.js transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
        const x = Math.round(item.transform[4] * 10) / 10;
        const y = Math.round(item.transform[5] * 10) / 10;
        allItems.push({ x, y, text, page: i, width: item.width });
      }
    }
    if (allItems.length === 0) return [];

    // Phase 2: Detect column layout by X-position clustering
    // Find the statement year from header text like "11/15/25 - 12/14/25"
    let statementYear = new Date().getFullYear();
    const yearPattern = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*[-–]\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
    for (const item of allItems) {
      const ym = item.text.match(yearPattern);
      if (ym) {
        let yr = parseInt(ym[6]);
        if (yr < 100) yr += 2000;
        statementYear = yr;
        break;
      }
    }

    // Phase 3: Detect column boundaries by finding where dates, descriptions, and amounts live
    // Date items: short text matching MM-DD at leftmost x
    const dateItems = [];
    const descItems = [];
    const amountItems = [];
    const minusItems = [];

    // Find the date column X — items with MM-DD text at very left side
    const mmddPattern = /^\d{1,2}-\d{1,2}$/;
    const mmddItems = allItems.filter(it => mmddPattern.test(it.text));
    if (mmddItems.length === 0) return []; // Not a supported format

    // Date column X is the most common x value for MM-DD items
    const dateXCounts = {};
    for (const it of mmddItems) {
      const xr = Math.round(it.x);
      dateXCounts[xr] = (dateXCounts[xr] || 0) + 1;
    }
    const dateX = parseInt(Object.entries(dateXCounts).sort((a, b) => b[1] - a[1])[0][0]);

    // Amount items: numeric text (with optional commas) to the right of description
    // Find numeric items far to the right (x > dateX + 300)
    const numericPattern = /^\d{1,3}(,\d{3})*\.\d{2}$/;
    const numericRight = allItems.filter(it => numericPattern.test(it.text) && it.x > dateX + 300);
    if (numericRight.length === 0) return [];

    // Cluster numeric right items by X to find amount column vs balance column
    const numXCounts = {};
    for (const it of numericRight) {
      const xr = Math.round(it.x / 10) * 10; // round to nearest 10
      numXCounts[xr] = (numXCounts[xr] || 0) + 1;
    }
    const numXClusters = Object.entries(numXCounts).map(([x, c]) => ({ x: parseInt(x), count: c })).sort((a, b) => a.x - b.x);

    // The leftmost numeric cluster is amounts, the rightmost is balances
    let amountXCenter, balanceXCenter;
    if (numXClusters.length >= 2) {
      amountXCenter = numXClusters[0].x;
      balanceXCenter = numXClusters[numXClusters.length - 1].x;
    } else {
      // Only one cluster — might be a simple format
      amountXCenter = numXClusters[0].x;
      balanceXCenter = amountXCenter + 100;
    }

    // Separate all items into columns
    for (const it of allItems) {
      const xr = Math.round(it.x);
      if (Math.abs(xr - dateX) <= 5 && mmddPattern.test(it.text)) {
        dateItems.push(it);
      } else if (xr > dateX + 15 && xr < amountXCenter - 50) {
        descItems.push(it);
      } else if (numericPattern.test(it.text) && Math.abs(xr - amountXCenter) <= 30) {
        amountItems.push(it);
      } else if (it.text === '-' && xr > amountXCenter + 20 && xr < amountXCenter + 60) {
        minusItems.push(it);
      }
    }

    // Phase 4: Build transaction rows per page using sequential matching
    // pdf.js Y-axis is inverted (0 at bottom), so we sort by -y (descending y = top of page)
    const pagesWithDates = [...new Set(dateItems.map(d => d.page))];
    const transactions = [];

    for (const pg of pagesWithDates) {
      // Dates on this page, sorted top-to-bottom (highest y first in pdf.js)
      const pgDates = dateItems.filter(d => d.page === pg).sort((a, b) => b.y - a.y);
      const pgDescs = descItems.filter(d => d.page === pg).sort((a, b) => b.y - a.y);
      const pgAmounts = amountItems.filter(d => d.page === pg).sort((a, b) => b.y - a.y);
      const pgMinus = minusItems.filter(d => d.page === pg);

      // Build description rows: match each date with nearby description text
      const descRows = [];
      for (const dateItem of pgDates) {
        // Find description items at same Y (within tolerance)
        const nearDescs = pgDescs.filter(d => Math.abs(d.y - dateItem.y) < 3);
        if (nearDescs.length === 0) continue;
        const descText = nearDescs.map(d => d.text).join(' ');

        // Skip header/non-transaction text
        const lower = descText.toLowerCase();
        if (lower.includes('beginning balance') || lower.includes('ending balance') ||
            lower === 'transaction detail' || lower === 'date') continue;

        descRows.push({ y: dateItem.y, date: dateItem.text, desc: descText });
      }

      // Append continuation lines (description items with no date at that Y)
      for (const descItem of pgDescs) {
        const hasDate = pgDates.some(d => Math.abs(d.y - descItem.y) < 3);
        if (hasDate) continue;
        // Skip non-transaction text
        if (['for janesha levons', 'joint owner(s):', 'none', '(continued from previous page)']
            .includes(descItem.text.toLowerCase())) continue;
        if (descItem.text.match(/^(statement|checking|everyday|access no|page \d)/i)) continue;

        // Find the closest preceding desc_row (higher Y = above in pdf.js inverted coords)
        let closest = null;
        let closestDist = Infinity;
        for (const dr of descRows) {
          const dist = dr.y - descItem.y; // positive means dr is above (pdf.js: higher Y = higher on page)
          if (dist > 0 && dist < closestDist && dist < 25) {
            closestDist = dist;
            closest = dr;
          }
        }
        if (closest) closest.desc += ' ' + descItem.text;
      }

      // Build amount rows with minus-sign detection
      const amtRows = [];
      for (const amtItem of pgAmounts) {
        const hasMinus = pgMinus.some(m => Math.abs(m.y - amtItem.y) < 3);
        amtRows.push({ y: amtItem.y, amount: parseFloat(amtItem.text.replace(/,/g, '')), hasMinus });
      }

      // Sequential matching: descRows[i] ↔ amtRows[i]
      const n = Math.min(descRows.length, amtRows.length);
      for (let i = 0; i < n; i++) {
        const dr = descRows[i];
        const ar = amtRows[i];

        const dm = dr.date.match(/^(\d{1,2})-(\d{1,2})$/);
        if (!dm) continue;
        const month = parseInt(dm[1]);
        const day = parseInt(dm[2]);
        const fullDate = `${statementYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const isIncome = !ar.hasMinus;
        const rawDesc = dr.desc;

        // Clean description
        const cleanResult = DescriptionCleaner.clean(rawDesc);
        const cleanedDesc = cleanResult.cleaned;
        const category = isIncome ? 'Income' : DataManager.autoCategory(cleanedDesc);

        transactions.push({
          date: fullDate,
          description: cleanedDesc,
          amount: ar.amount,
          category,
          account: sourceName.replace(/\.pdf$/i, ''),
          _raw: rawDesc,
          _originalDesc: cleanResult.original,
          _txType: cleanResult.txType,
          _merchant: cleanResult.merchant,
          _isIncome: isIncome
        });
      }
    }

    return transactions;
  }

  /**
   * Fallback heuristic parser — tries to find date + description + amount patterns
   * on each line of extracted text. Works for simpler PDF formats.
   */
  function extractTransactionsFromText(text, sourceName) {
    const lines = text.split('\n');
    const transactions = [];

    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{2,4})/i
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 10) continue;

      let dateStr = null;
      for (const dp of datePatterns) {
        const dateMatch = trimmed.match(dp);
        if (dateMatch) { dateStr = dateMatch[1]; break; }
      }
      if (!dateStr) continue;

      const amounts = [];
      let m;
      const amtRegex = /(-?\$?\d{1,3}(?:,\d{3})*\.\d{2})/g;
      while ((m = amtRegex.exec(trimmed)) !== null) amounts.push(m[1]);
      if (amounts.length === 0) continue;

      const dateEnd = trimmed.indexOf(dateStr) + dateStr.length;
      const amtStart = trimmed.indexOf(amounts[0]);
      let description = trimmed.slice(dateEnd, amtStart).trim();
      description = description.replace(/^\s*[-–—]\s*/, '').replace(/\s+/g, ' ').trim();
      if (description.length < 2) description = 'Unknown Transaction';

      const rawAmt = amounts[0].replace(/[$,]/g, '');
      const amount = parseFloat(rawAmt);
      if (isNaN(amount) || amount === 0) continue;

      const parsedDate = normalizeDate(dateStr);
      if (!parsedDate) continue;

      const cleanResult = DescriptionCleaner.clean(description);
      const cleanedDesc = cleanResult.cleaned;

      transactions.push({
        date: parsedDate,
        description: cleanedDesc,
        amount: Math.abs(amount),
        category: DataManager.autoCategory(cleanedDesc),
        account: sourceName.replace(/\.pdf$/i, ''),
        _raw: trimmed,
        _originalDesc: cleanResult.original,
        _txType: cleanResult.txType,
        _merchant: cleanResult.merchant
      });
    }

    return transactions;
  }

  /** Normalize various date formats to YYYY-MM-DD */
  function normalizeDate(dateStr) {
    // Try YYYY-MM-DD first
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    // MM/DD/YYYY or MM-DD-YYYY
    let m = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      let year = parseInt(m[3]);
      if (year < 100) year += 2000;
      return `${year}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    }

    // Month name formats
    const months = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12 };
    m = dateStr.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{2,4})$/);
    if (m) {
      const mo = months[m[1].toLowerCase().slice(0,3)];
      if (!mo) return null;
      let year = parseInt(m[3]);
      if (year < 100) year += 2000;
      return `${year}-${String(mo).padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    }

    return null;
  }

  /** Process uploaded PDF files */
  async function handlePDFUpload(files) {
    const statusEl = document.getElementById('pdf-status');
    const previewArea = document.getElementById('pdf-preview-area');
    pendingPdfTransactions = [];

    statusEl.textContent = `Processing ${files.length} file(s)...`;
    statusEl.className = 'status-text';

    for (const file of files) {
      try {
        const txs = await parsePDF(file);
        pendingPdfTransactions.push(...txs);
        statusEl.textContent = `Extracted ${pendingPdfTransactions.length} transactions from ${files.length} file(s).`;
        statusEl.className = 'status-text success';
      } catch (err) {
        statusEl.textContent = `Error processing ${file.name}: ${err.message}`;
        statusEl.className = 'status-text error';
      }
    }

    if (pendingPdfTransactions.length > 0) {
      renderPdfPreview(pendingPdfTransactions);
      previewArea.classList.remove('hidden');
    } else {
      statusEl.textContent = 'No transactions could be extracted. Try CSV import or manual entry instead.';
      statusEl.className = 'status-text error';
    }
  }

  function renderPdfPreview(txs) {
    const wrap = document.getElementById('pdf-preview-table-wrap');
    const preview = txs.slice(0, 20); // Show first 20

    let html = `<p style="margin-bottom:.5rem;font-size:.8rem;color:var(--clr-text-muted)">Showing ${Math.min(20, txs.length)} of ${txs.length} extracted transactions. Review and accept to import.</p>`;
    html += '<table><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th><th>Category</th></tr></thead><tbody>';
    for (const tx of preview) {
      const hasOriginal = tx._originalDesc && tx._originalDesc !== tx.description;
      const tooltipAttr = hasOriginal ? ` title="Original: ${escapeHtml(tx._originalDesc)}" style="cursor:help;border-bottom:1px dotted var(--clr-text-muted)"` : '';
      const merchantBadge = tx._merchant ? `<span style="font-size:.7rem;background:rgba(99,102,241,.2);color:var(--clr-primary);padding:.1rem .3rem;border-radius:3px;margin-left:.4rem">✓ resolved</span>` : '';
      html += `<tr>
        <td>${tx.date}</td>
        <td><span${tooltipAttr}>${escapeHtml(tx.description)}</span>${merchantBadge}</td>
        <td style="font-size:.75rem;color:var(--clr-text-muted)">${tx._txType || '—'}</td>
        <td>$${tx.amount.toFixed(2)}</td>
        <td>${tx.category}</td>
      </tr>`;
    }
    html += '</tbody></table>';
    if (txs.length > 20) html += `<p style="font-size:.8rem;color:var(--clr-text-muted);margin-top:.5rem">...and ${txs.length - 20} more</p>`;
    wrap.innerHTML = html;
  }

  function acceptPdfTransactions() {
    if (pendingPdfTransactions.length > 0) {
      DataManager.add(pendingPdfTransactions);
      document.getElementById('pdf-status').textContent = `✓ Imported ${pendingPdfTransactions.length} transactions.`;
      document.getElementById('pdf-status').className = 'status-text success';
      document.getElementById('pdf-preview-area').classList.add('hidden');
      pendingPdfTransactions = [];
    }
  }

  function rejectPdfTransactions() {
    pendingPdfTransactions = [];
    document.getElementById('pdf-preview-area').classList.add('hidden');
    document.getElementById('pdf-status').textContent = 'Discarded extracted transactions.';
  }

  /* ---- CSV Import ---- */

  let csvRawData = null;
  let csvHeaders = [];

  function handleCSVUpload(files) {
    const statusEl = document.getElementById('csv-status');
    const mappingArea = document.getElementById('csv-mapping-area');

    const file = files[0]; // Process first file
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const { headers, rows } = parseCSVText(text);
        csvHeaders = headers;
        csvRawData = rows;

        statusEl.textContent = `Read ${rows.length} rows with ${headers.length} columns.`;
        statusEl.className = 'status-text success';

        // Populate column mapping dropdowns
        populateColumnSelects(headers);
        mappingArea.classList.remove('hidden');
      } catch (err) {
        statusEl.textContent = `Error: ${err.message}`;
        statusEl.className = 'status-text error';
      }
    };
    reader.readAsText(file);
  }

  /** Simple CSV parser that handles quoted fields */
  function parseCSVText(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

    const headers = parseCSVLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = parseCSVLine(lines[i]);
      if (vals.length >= headers.length - 1) { // Allow off-by-one
        const obj = {};
        headers.forEach((h, idx) => obj[h] = (vals[idx] || '').trim());
        rows.push(obj);
      }
    }
    return { headers, rows };
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { result.push(current); current = ''; }
        else current += ch;
      }
    }
    result.push(current);
    return result;
  }

  function populateColumnSelects(headers) {
    const selects = ['csv-col-date', 'csv-col-desc', 'csv-col-amount', 'csv-col-category'];
    for (const id of selects) {
      const sel = document.getElementById(id);
      // Keep the "None" option for category
      const keepFirst = (id === 'csv-col-category');
      sel.innerHTML = keepFirst ? '<option value="">— None —</option>' : '';
      for (const h of headers) {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        // Auto-select likely columns
        const hLow = h.toLowerCase();
        if (id === 'csv-col-date' && (hLow.includes('date') || hLow.includes('posted'))) opt.selected = true;
        if (id === 'csv-col-desc' && (hLow.includes('desc') || hLow.includes('memo') || hLow.includes('merchant') || hLow.includes('name'))) opt.selected = true;
        if (id === 'csv-col-amount' && (hLow.includes('amount') || hLow.includes('debit') || hLow.includes('total'))) opt.selected = true;
        if (id === 'csv-col-category' && hLow.includes('categ')) opt.selected = true;
        sel.appendChild(opt);
      }
    }
  }

  function importCSVData() {
    if (!csvRawData || csvRawData.length === 0) return;

    const dateCol = document.getElementById('csv-col-date').value;
    const descCol = document.getElementById('csv-col-desc').value;
    const amtCol  = document.getElementById('csv-col-amount').value;
    const catCol  = document.getElementById('csv-col-category').value;
    const account = document.getElementById('csv-account-name').value || 'CSV Import';

    if (!dateCol || !descCol || !amtCol) {
      document.getElementById('csv-status').textContent = 'Please map Date, Description, and Amount columns.';
      document.getElementById('csv-status').className = 'status-text error';
      return;
    }

    const transactions = [];
    let skipped = 0;

    for (const row of csvRawData) {
      const rawDate = row[dateCol];
      const desc = row[descCol] || '';
      const rawAmt = (row[amtCol] || '').replace(/[$,]/g, '');
      const amount = parseFloat(rawAmt);

      const date = normalizeDate(rawDate);
      if (!date || isNaN(amount)) { skipped++; continue; }

      // Clean CSV descriptions the same way as PDF
      const cleanResult = DescriptionCleaner.clean(desc);
      const cleanedDesc = cleanResult.cleaned;
      const category = catCol ? (row[catCol] || DataManager.autoCategory(cleanedDesc)) : DataManager.autoCategory(cleanedDesc);

      transactions.push({
        date,
        description: cleanedDesc,
        amount: Math.abs(amount),
        category: DataManager.recategorize(cleanedDesc, category),
        account,
        _originalDesc: cleanResult.original,
        _txType: cleanResult.txType
      });
    }

    DataManager.add(transactions);
    const statusEl = document.getElementById('csv-status');
    statusEl.textContent = `✓ Imported ${transactions.length} transactions.${skipped ? ` Skipped ${skipped} invalid rows.` : ''}`;
    statusEl.className = 'status-text success';
    document.getElementById('csv-mapping-area').classList.add('hidden');
    csvRawData = null;
  }

  /* ---- Manual Entry ---- */

  function handleManualEntry(formData) {
    DataManager.add({
      date: formData.date,
      description: formData.description,
      amount: Math.abs(parseFloat(formData.amount)),
      category: formData.category,
      account: formData.account || 'Manual'
    });
  }

  /* ---- JSON Import (pre-extracted data) ---- */

  let pendingJsonTransactions = [];

  function handleJSONUpload(files) {
    const statusEl = document.getElementById('json-status');
    const previewArea = document.getElementById('json-preview-area');
    pendingJsonTransactions = [];

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const arr = Array.isArray(data) ? data : [data];
        const transactions = [];

        for (const item of arr) {
          if (!item.date || item.amount === undefined) continue;
          const desc = item.description || 'Unknown';
          const isIncome = item.is_income || false;
          const cleanResult = DescriptionCleaner.clean(desc);
          const cleanedDesc = cleanResult.cleaned;

          transactions.push({
            date: item.date,
            description: cleanedDesc,
            amount: Math.abs(item.amount),
            category: isIncome ? 'Income' : DataManager.autoCategory(cleanedDesc),
            account: item.account || file.name.replace(/\.json$/i, ''),
            _raw: desc,
            _originalDesc: cleanResult.original,
            _txType: cleanResult.txType,
            _merchant: cleanResult.merchant,
            _isIncome: isIncome
          });
        }

        pendingJsonTransactions = transactions;
        statusEl.textContent = `Read ${transactions.length} transactions from JSON.`;
        statusEl.className = 'status-text success';

        if (transactions.length > 0) {
          renderJsonPreview(transactions);
          previewArea.classList.remove('hidden');
        }
      } catch (err) {
        statusEl.textContent = `Error parsing JSON: ${err.message}`;
        statusEl.className = 'status-text error';
      }
    };
    reader.readAsText(file);
  }

  function renderJsonPreview(txs) {
    const wrap = document.getElementById('json-preview-table-wrap');
    const preview = txs.slice(0, 20);
    let html = `<p style="margin-bottom:.5rem;font-size:.8rem;color:var(--clr-text-muted)">Showing ${Math.min(20, txs.length)} of ${txs.length} transactions.</p>`;
    html += '<table><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Category</th></tr></thead><tbody>';
    for (const tx of preview) {
      const sign = tx._isIncome ? '+' : '-';
      html += `<tr><td>${tx.date}</td><td>${escapeHtml(tx.description)}</td><td>${sign}$${tx.amount.toFixed(2)}</td><td>${tx.category}</td></tr>`;
    }
    html += '</tbody></table>';
    if (txs.length > 20) html += `<p style="font-size:.8rem;color:var(--clr-text-muted);margin-top:.5rem">...and ${txs.length - 20} more</p>`;
    wrap.innerHTML = html;
  }

  function acceptJsonTransactions() {
    if (pendingJsonTransactions.length > 0) {
      DataManager.add(pendingJsonTransactions);
      document.getElementById('json-status').textContent = `✓ Imported ${pendingJsonTransactions.length} transactions.`;
      document.getElementById('json-status').className = 'status-text success';
      document.getElementById('json-preview-area').classList.add('hidden');
      pendingJsonTransactions = [];
    }
  }

  function rejectJsonTransactions() {
    pendingJsonTransactions = [];
    document.getElementById('json-preview-area').classList.add('hidden');
    document.getElementById('json-status').textContent = 'Discarded JSON transactions.';
  }

  /* ---- Utility ---- */

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    handlePDFUpload,
    acceptPdfTransactions,
    rejectPdfTransactions,
    handleCSVUpload,
    importCSVData,
    handleJSONUpload,
    acceptJsonTransactions,
    rejectJsonTransactions,
    handleManualEntry,
    normalizeDate,
    escapeHtml
  };
})();
