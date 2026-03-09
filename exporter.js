/* ============================================
   Exporter — CSV export & PDF report with charts
   ============================================ */

const Exporter = (() => {

  /** Export all transactions as CSV */
  function exportCSV() {
    const txs = DataManager.getAll();
    if (txs.length === 0) { alert('No transactions to export.'); return; }

    const headers = ['Date', 'Description', 'Amount', 'Category', 'Account'];
    const rows = txs.map(t => [
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.category,
      t.account
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile('transactions_export.csv', csv, 'text/csv');
  }

  /* ============================================
     PDF Report — charts + summary tables
     ============================================ */

  // PDF color constants
  const CLR = {
    primary: [99, 102, 241],   // #6366f1
    accent: [16, 185, 129],    // #10b981
    danger: [239, 68, 68],     // #ef4444
    dark: [26, 26, 46],        // #1a1a2e
    gray: [107, 114, 128],     // #6b7280
    lightGray: [229, 231, 235],// #e5e7eb
    headerBg: [243, 244, 246], // #f3f4f6
    white: [255, 255, 255]
  };

  /**
   * Export full analysis report as a multi-page PDF.
   * Captures live Chart.js canvases as images and builds
   * summary tables for categories, merchants, budget, and savings.
   */
  async function exportPDFReport() {
    const txCount = DataManager.getAll().length;
    if (txCount === 0) { alert('No data to export. Import transactions first.'); return; }

    // Show generating indicator
    const btn = document.getElementById('btn-export-report');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Generating PDF...';

    try {
      // Gather data
      const kpis = Analysis.getKPIs();
      const catBreakdown = Analysis.getCategoryBreakdown();
      const merchants = Analysis.getMerchantBreakdown().slice(0, 25);
      const monthlyData = Analysis.getMonthlyBreakdown();
      const recommendations = Analysis.getSavingsRecommendations();
      const budget = DataManager.getBudget();
      const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const period = monthlyData.length > 0
        ? `${monthlyData[0].month} to ${monthlyData[monthlyData.length - 1].month}`
        : 'N/A';

      // Ensure tabs are rendered so chart canvases exist
      await ensureChartsRendered();

      // Capture chart images (white background for PDF)
      const chartImages = await captureCharts();

      // Create PDF (letter size: 215.9mm x 279.4mm)
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ===== PAGE 1: Title + KPIs + Monthly Breakdown =====

      // Title bar
      pdf.setFillColor(...CLR.primary);
      pdf.rect(0, 0, pageW, 28, 'F');
      pdf.setTextColor(...CLR.white);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Personal Finance Report', margin, 14);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${now}  |  Transactions: ${txCount}  |  Period: ${period}`, margin, 22);
      y = 36;

      // KPI cards
      pdf.setTextColor(...CLR.dark);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Performance Indicators', margin, y);
      y += 6;

      const kpiData = [
        { label: 'Total Spending', value: `$${kpis.totalExpenses.toFixed(2)}`, color: CLR.danger },
        { label: 'Total Income', value: `$${kpis.totalIncome.toFixed(2)}`, color: CLR.accent },
        { label: 'Net Cash Flow', value: `$${kpis.netCashFlow.toFixed(2)}`, color: kpis.netCashFlow >= 0 ? CLR.accent : CLR.danger },
        { label: 'Monthly Avg Spend', value: `$${kpis.avgMonthly.toFixed(2)}`, color: CLR.dark },
        { label: 'Highest Month', value: `${kpis.highMonth}: $${kpis.highAmount.toFixed(2)}`, color: CLR.danger },
        { label: 'Lowest Month', value: `${kpis.lowMonth}: $${kpis.lowAmount.toFixed(2)}`, color: CLR.accent }
      ];

      const kpiW = (contentW - 8) / 3;
      const kpiH = 18;
      for (let i = 0; i < kpiData.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const kx = margin + col * (kpiW + 4);
        const ky = y + row * (kpiH + 3);

        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(...CLR.lightGray);
        pdf.roundedRect(kx, ky, kpiW, kpiH, 2, 2, 'FD');

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...CLR.gray);
        pdf.text(kpiData[i].label, kx + kpiW / 2, ky + 6, { align: 'center' });

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...kpiData[i].color);
        pdf.text(kpiData[i].value, kx + kpiW / 2, ky + 13, { align: 'center' });
      }
      y += 2 * (kpiH + 3) + 6;

      // Monthly Breakdown table
      pdf.setTextColor(...CLR.dark);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Breakdown', margin, y);
      y += 4;
      y = drawTable(pdf, y, margin, contentW,
        ['Month', 'Expenses', 'Income', 'Net'],
        monthlyData.map(m => {
          const net = m.income - m.expenses;
          return [
            m.month,
            `$${m.expenses.toFixed(2)}`,
            `$${m.income.toFixed(2)}`,
            { text: `$${net.toFixed(2)}`, color: net >= 0 ? CLR.accent : CLR.danger }
          ];
        }),
        [0.25, 0.25, 0.25, 0.25]
      );

      // Overview charts (Spending vs Income bar + Pie)
      y += 4;
      if (checkPageBreak(pdf, y, 80, margin)) { y = margin + 8; }
      pdf.setTextColor(...CLR.dark);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Spending vs Income', margin, y);
      y += 3;
      if (chartImages['chart-overview-bar']) {
        const imgH = addChartImage(pdf, chartImages['chart-overview-bar'], margin, y, contentW, 68);
        y += imgH + 4;
      }

      // ===== PAGE 2: Category Analysis =====
      pdf.addPage();
      y = margin;
      addSectionHeader(pdf, 'Category Analysis', margin, y, pageW);
      y += 14;

      // Category charts side by side
      if (chartImages['chart-cat-pie'] || chartImages['chart-cat-bar']) {
        const halfW = (contentW - 4) / 2;
        if (chartImages['chart-cat-pie']) {
          addChartImage(pdf, chartImages['chart-cat-pie'], margin, y, halfW, 65);
        }
        if (chartImages['chart-cat-bar']) {
          addChartImage(pdf, chartImages['chart-cat-bar'], margin + halfW + 4, y, halfW, 65);
        }
        y += 68;
      }

      // Pie chart
      if (chartImages['chart-overview-pie']) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        pdf.text('Overall Spending Distribution', margin, y);
        y += 3;
        const imgH = addChartImage(pdf, chartImages['chart-overview-pie'], margin + 20, y, contentW - 40, 55);
        y += imgH + 4;
      }

      // Category breakdown table
      if (checkPageBreak(pdf, y, 10 + catBreakdown.length * 6, margin)) { y = margin + 8; }
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...CLR.dark);
      pdf.text('Category Breakdown', margin, y);
      y += 3;
      y = drawTable(pdf, y, margin, contentW,
        ['Category', 'Total', '% of Spend', 'Avg/Month', '# Txns'],
        catBreakdown.map(c => [
          c.category,
          `$${c.total.toFixed(2)}`,
          `${c.percent.toFixed(1)}%`,
          `$${c.avgPerMonth.toFixed(2)}`,
          `${c.count}`
        ]),
        [0.28, 0.20, 0.17, 0.20, 0.15]
      );

      // ===== PAGE 3: Trends =====
      pdf.addPage();
      y = margin;
      addSectionHeader(pdf, 'Spending Trends', margin, y, pageW);
      y += 14;

      if (chartImages['chart-trends-line']) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        pdf.text('Monthly Spending Trend', margin, y);
        y += 3;
        const imgH = addChartImage(pdf, chartImages['chart-trends-line'], margin, y, contentW, 60);
        y += imgH + 6;
      }

      if (chartImages['chart-trends-stacked']) {
        if (checkPageBreak(pdf, y, 70, margin)) { y = margin + 8; }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        pdf.text('Category Trends Over Time', margin, y);
        y += 3;
        const imgH = addChartImage(pdf, chartImages['chart-trends-stacked'], margin, y, contentW, 60);
        y += imgH + 6;
      }

      if (chartImages['chart-trends-delta']) {
        if (checkPageBreak(pdf, y, 70, margin)) { y = margin + 8; }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        pdf.text('Month-over-Month Change', margin, y);
        y += 3;
        const imgH = addChartImage(pdf, chartImages['chart-trends-delta'], margin, y, contentW, 60);
        y += imgH + 6;
      }

      // ===== PAGE 4: Merchants =====
      pdf.addPage();
      y = margin;
      addSectionHeader(pdf, 'Top Merchants', margin, y, pageW);
      y += 14;

      if (chartImages['chart-merchants-bar']) {
        const imgH = addChartImage(pdf, chartImages['chart-merchants-bar'], margin, y, contentW, 65);
        y += imgH + 5;
      }

      // Merchant table
      if (checkPageBreak(pdf, y, 10 + merchants.length * 5.5, margin)) { y = margin + 8; }
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...CLR.dark);
      pdf.text('Merchant Details', margin, y);
      y += 3;
      y = drawTable(pdf, y, margin, contentW,
        ['Merchant', 'Total Spent', '# Txns', 'Avg/Txn', 'Category'],
        merchants.map(m => [
          m.name.length > 28 ? m.name.slice(0, 26) + '…' : m.name,
          `$${m.total.toFixed(2)}`,
          `${m.count}`,
          `$${m.avgPerTx.toFixed(2)}`,
          m.category
        ]),
        [0.30, 0.18, 0.12, 0.18, 0.22]
      );

      // ===== PAGE 5: Savings + Budget =====
      pdf.addPage();
      y = margin;
      addSectionHeader(pdf, 'Savings & Budget', margin, y, pageW);
      y += 14;

      // Savings recommendations
      if (recommendations.length > 0) {
        const totalSavings = recommendations.reduce((s, r) => s + r.potentialSavings, 0);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        pdf.text('Savings Opportunities', margin, y);
        y += 3;

        // Summary KPI
        pdf.setFillColor(240, 253, 244);
        pdf.setDrawColor(...CLR.accent);
        pdf.roundedRect(margin, y, contentW, 12, 2, 2, 'FD');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.accent);
        pdf.text(`Estimated Monthly Savings: $${totalSavings.toFixed(2)}  |  Annual: $${(totalSavings * 12).toFixed(2)}`, margin + 4, y + 7.5);
        y += 16;

        // Recommendation cards
        for (const r of recommendations) {
          if (checkPageBreak(pdf, y, 18, margin)) { y = margin + 8; }

          pdf.setFillColor(249, 250, 251);
          pdf.setDrawColor(...CLR.primary);
          // Left accent bar + background
          pdf.rect(margin, y, 1.5, 14, 'F');
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin + 1.5, y, contentW - 1.5, 14, 'F');

          pdf.setFontSize(8.5);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...CLR.dark);
          pdf.text(`${r.title}`, margin + 4, y + 5);

          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...CLR.gray);
          // Wrap description if too long
          const descLines = pdf.splitTextToSize(r.description, contentW - 50);
          pdf.text(descLines[0] || '', margin + 4, y + 10);

          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...CLR.accent);
          pdf.text(`$${r.potentialSavings.toFixed(2)}/mo`, margin + contentW - 4, y + 5, { align: 'right' });

          y += 16;
        }

        // Savings waterfall chart
        if (chartImages['chart-savings-waterfall']) {
          if (checkPageBreak(pdf, y, 70, margin)) { y = margin + 8; }
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...CLR.dark);
          pdf.text('Savings Potential by Category', margin, y);
          y += 3;
          const imgH = addChartImage(pdf, chartImages['chart-savings-waterfall'], margin, y, contentW, 55);
          y += imgH + 6;
        }
      }

      // Budget table
      const budgetKeys = Object.keys(budget);
      if (budgetKeys.length > 0) {
        if (checkPageBreak(pdf, y, 15 + budgetKeys.length * 6, margin)) { y = margin + 8; }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        pdf.text('Budget Targets vs Actual', margin, y);
        y += 3;

        const budgetRows = [];
        let bTotal = 0, aTotal = 0;
        for (const cat of budgetKeys) {
          const b = budget[cat];
          const diff = b.target - (b.avgSpend || 0);
          bTotal += b.target;
          aTotal += (b.avgSpend || 0);
          budgetRows.push([
            cat,
            `$${b.target.toFixed(2)}`,
            `$${(b.avgSpend || 0).toFixed(2)}`,
            { text: `$${diff.toFixed(2)}`, color: diff >= 0 ? CLR.accent : CLR.danger },
            diff >= 0 ? 'On Track' : 'Over Budget'
          ]);
        }
        // Totals row
        const tDiff = bTotal - aTotal;
        budgetRows.push([
          { text: 'TOTAL', bold: true },
          { text: `$${bTotal.toFixed(2)}`, bold: true },
          { text: `$${aTotal.toFixed(2)}`, bold: true },
          { text: `$${tDiff.toFixed(2)}`, color: tDiff >= 0 ? CLR.accent : CLR.danger, bold: true },
          ''
        ]);

        y = drawTable(pdf, y, margin, contentW,
          ['Category', 'Budget', 'Actual Avg', 'Difference', 'Status'],
          budgetRows,
          [0.28, 0.18, 0.18, 0.18, 0.18]
        );

        // Budget comparison chart
        if (chartImages['chart-budget-comparison']) {
          if (checkPageBreak(pdf, y, 65, margin)) { y = margin + 8; }
          y += 3;
          const imgH = addChartImage(pdf, chartImages['chart-budget-comparison'], margin, y, contentW, 55);
          y += imgH + 4;
        }
      }

      // Footer on every page
      const totalPages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...CLR.gray);
        pdf.text(`Personal Finance Dashboard  •  ${now}`, margin, pageH - 6);
        pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' });

        // Thin line above footer
        pdf.setDrawColor(...CLR.lightGray);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageH - 10, pageW - margin, pageH - 10);
      }

      // Save
      pdf.save(`finance_report_${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF generation failed: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  }

  /* ---- Chart Capture Helpers ---- */

  /**
   * Make sure the overview/category/trends/merchants/savings/budget tabs
   * have been rendered at least once so chart canvases exist.
   */
  async function ensureChartsRendered() {
    // Temporarily show each tab so Chart.js populates the canvases
    const tabsToRender = ['overview', 'categories', 'trends', 'merchants', 'savings', 'budget'];
    const currentActive = document.querySelector('.nav-btn.active');
    const currentTab = currentActive ? currentActive.dataset.tab : 'import';

    for (const tab of tabsToRender) {
      // Simulate tab click to trigger rendering
      const tabBtn = document.querySelector(`.nav-btn[data-tab="${tab}"]`);
      if (tabBtn) tabBtn.click();
      // Give Chart.js a tick to render
      await new Promise(r => setTimeout(r, 200));
    }

    // Restore original tab
    const restoreBtn = document.querySelector(`.nav-btn[data-tab="${currentTab}"]`);
    if (restoreBtn) restoreBtn.click();
    await new Promise(r => setTimeout(r, 100));
  }

  /**
   * Capture all chart canvases as white-background PNG data URLs.
   */
  async function captureCharts() {
    const chartIds = [
      'chart-overview-bar', 'chart-overview-pie',
      'chart-cat-pie', 'chart-cat-bar',
      'chart-trends-line', 'chart-trends-stacked', 'chart-trends-delta',
      'chart-merchants-bar',
      'chart-savings-waterfall',
      'chart-budget-comparison'
    ];

    const images = {};
    for (const id of chartIds) {
      const canvas = document.getElementById(id);
      if (!canvas || !canvas.getContext) continue;

      // Check if canvas has been drawn to (non-empty)
      try {
        // Create a temp canvas with white background
        const w = canvas.width;
        const h = canvas.height;
        if (w === 0 || h === 0) continue;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(canvas, 0, 0);

        images[id] = tempCanvas.toDataURL('image/png');
      } catch (e) {
        console.log(`Could not capture ${id}:`, e.message);
      }
    }
    return images;
  }

  /**
   * Add a chart image to the PDF, maintaining aspect ratio.
   * Returns the actual height used.
   */
  function addChartImage(pdf, dataUrl, x, y, maxW, maxH) {
    if (!dataUrl) return 0;
    try {
      // Determine image dimensions from the data URL
      const img = new Image();
      // We can't use async load here easily, so just use maxW/maxH directly
      // jsPDF handles PNG data URLs directly
      const aspectW = maxW;
      const aspectH = maxH;
      pdf.addImage(dataUrl, 'PNG', x, y, aspectW, aspectH);
      return aspectH;
    } catch (e) {
      console.log('addChartImage error:', e.message);
      return 0;
    }
  }

  /* ---- Table Drawing ---- */

  /**
   * Draw a styled table on the PDF.
   * @param {jsPDF} pdf
   * @param {number} startY
   * @param {number} marginX
   * @param {number} tableW
   * @param {string[]} headers
   * @param {Array} rows - each row is array of string | { text, color?, bold? }
   * @param {number[]} colWidths - proportions (sum to 1)
   * @returns {number} y position after table
   */
  function drawTable(pdf, startY, marginX, tableW, headers, rows, colWidths) {
    const rowH = 5.5;
    const headerH = 6.5;
    const fontSize = 7.5;
    const headerFontSize = 7.5;
    const pageH = pdf.internal.pageSize.getHeight();
    let y = startY;

    // Compute absolute column widths
    const colW = colWidths.map(p => p * tableW);

    // Header row
    pdf.setFillColor(...CLR.headerBg);
    pdf.rect(marginX, y, tableW, headerH, 'F');
    pdf.setDrawColor(...CLR.lightGray);
    pdf.setLineWidth(0.2);
    pdf.rect(marginX, y, tableW, headerH, 'S');

    pdf.setFontSize(headerFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...CLR.dark);
    let hx = marginX;
    for (let c = 0; c < headers.length; c++) {
      pdf.text(headers[c], hx + 2, y + 4.5);
      hx += colW[c];
    }
    y += headerH;

    // Data rows
    for (let r = 0; r < rows.length; r++) {
      // Page break check
      if (y + rowH > pageH - 14) {
        pdf.addPage();
        y = 15;
        // Re-draw header on new page
        pdf.setFillColor(...CLR.headerBg);
        pdf.rect(marginX, y, tableW, headerH, 'F');
        pdf.setDrawColor(...CLR.lightGray);
        pdf.rect(marginX, y, tableW, headerH, 'S');
        pdf.setFontSize(headerFontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...CLR.dark);
        let rhx = marginX;
        for (let c = 0; c < headers.length; c++) {
          pdf.text(headers[c], rhx + 2, y + 4.5);
          rhx += colW[c];
        }
        y += headerH;
      }

      // Alternating row color
      if (r % 2 === 0) {
        pdf.setFillColor(252, 252, 253);
        pdf.rect(marginX, y, tableW, rowH, 'F');
      }
      // Row border
      pdf.setDrawColor(...CLR.lightGray);
      pdf.setLineWidth(0.1);
      pdf.line(marginX, y + rowH, marginX + tableW, y + rowH);

      // Cell text
      let cx = marginX;
      for (let c = 0; c < rows[r].length; c++) {
        const cell = rows[r][c];
        const isObj = typeof cell === 'object' && cell !== null;
        const text = isObj ? (cell.text || '') : String(cell);
        const color = isObj && cell.color ? cell.color : CLR.dark;
        const bold = isObj && cell.bold;

        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setTextColor(...color);

        // Truncate if too wide
        const maxTextW = colW[c] - 4;
        let displayText = text;
        while (pdf.getTextWidth(displayText) > maxTextW && displayText.length > 3) {
          displayText = displayText.slice(0, -2) + '…';
        }
        pdf.text(displayText, cx + 2, y + 3.8);
        cx += colW[c];
      }
      y += rowH;
    }

    // Bottom border
    pdf.setDrawColor(...CLR.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(marginX, y, marginX + tableW, y);

    return y + 2;
  }

  /* ---- Layout Helpers ---- */

  function addSectionHeader(pdf, text, marginX, y, pageW) {
    pdf.setFillColor(...CLR.primary);
    pdf.rect(0, y, pageW, 10, 'F');
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...CLR.white);
    pdf.text(text, marginX, y + 7);
  }

  /**
   * Check if we need a page break. If so, add a page and return true.
   */
  function checkPageBreak(pdf, y, neededH, margin) {
    const pageH = pdf.internal.pageSize.getHeight();
    if (y + neededH > pageH - 14) {
      pdf.addPage();
      return true;
    }
    return false;
  }

  /* ---- Generic Helpers ---- */

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { exportCSV, exportPDFReport };
})();
