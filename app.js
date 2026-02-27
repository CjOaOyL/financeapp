/* ============================================
   App Controller — Wires UI to modules
   ============================================ */

(function () {
  'use strict';

  const ROWS_PER_PAGE = 50;
  let currentPage = 1;
  let sortField = 'date';
  let sortDir = -1; // -1 = desc
  let filteredTransactions = [];

  /* ---- Navigation ---- */
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      refreshTab(btn.dataset.tab);
    });
  });

  /* ---- Import: PDF ---- */
  document.getElementById('pdf-upload').addEventListener('change', (e) => {
    if (e.target.files.length) Importer.handlePDFUpload(e.target.files);
  });
  document.getElementById('btn-pdf-accept').addEventListener('click', () => Importer.acceptPdfTransactions());
  document.getElementById('btn-pdf-reject').addEventListener('click', () => Importer.rejectPdfTransactions());

  /* ---- Import: CSV ---- */
  document.getElementById('csv-upload').addEventListener('change', (e) => {
    if (e.target.files.length) Importer.handleCSVUpload(e.target.files);
  });
  document.getElementById('btn-csv-import').addEventListener('click', () => Importer.importCSVData());

  /* ---- Import: JSON ---- */
  document.getElementById('json-upload').addEventListener('change', (e) => {
    if (e.target.files.length) Importer.handleJSONUpload(e.target.files);
  });
  document.getElementById('btn-json-accept').addEventListener('click', () => Importer.acceptJsonTransactions());
  document.getElementById('btn-json-reject').addEventListener('click', () => Importer.rejectJsonTransactions());

  /* ---- Import: Manual ---- */
  document.getElementById('manual-form').addEventListener('submit', (e) => {
    e.preventDefault();
    Importer.handleManualEntry({
      date: document.getElementById('manual-date').value,
      description: document.getElementById('manual-desc').value,
      amount: document.getElementById('manual-amount').value,
      category: document.getElementById('manual-category').value,
      account: document.getElementById('manual-account').value
    });
    e.target.reset();
  });

  /* ---- Header Actions ---- */
  document.getElementById('btn-export-report').addEventListener('click', () => Exporter.exportPDFReport());
  document.getElementById('btn-export-csv').addEventListener('click', () => Exporter.exportCSV());
  document.getElementById('btn-clear-data').addEventListener('click', () => {
    if (confirm('Delete all transaction data and budget targets? This cannot be undone.')) {
      DataManager.clearAll();
    }
  });

  /* ---- Budget Actions ---- */
  document.getElementById('btn-auto-budget').addEventListener('click', () => {
    Budget.autoGenerate(10);
    Budget.renderBudgetTable();
    Budget.renderBudgetChart();
  });
  document.getElementById('btn-save-budget').addEventListener('click', () => {
    Budget.saveFromInputs();
    alert('Budget saved!');
  });

  /* ---- Transfer Detection ---- */
  let detectedPairs = [];

  document.getElementById('btn-scan-transfers').addEventListener('click', () => {
    detectedPairs = DataManager.detectTransferPairs()
      .filter(p => !p.tx1.transferPairId && !p.tx2.transferPairId); // exclude already confirmed
    renderDetectedPairs();
    renderConfirmedTransfers();
  });

  document.getElementById('btn-confirm-all-transfers').addEventListener('click', () => {
    for (const pair of detectedPairs) {
      DataManager.markTransferPair(pair.tx1.id, pair.tx2.id);
    }
    detectedPairs = [];
    renderDetectedPairs();
    renderConfirmedTransfers();
  });

  document.getElementById('btn-dismiss-all-transfers').addEventListener('click', () => {
    detectedPairs = [];
    renderDetectedPairs();
  });

  function renderDetectedPairs() {
    const container = document.getElementById('transfer-pairs-list');
    const section = document.getElementById('transfer-detected');
    document.getElementById('transfer-detected-count').textContent = detectedPairs.length;

    if (detectedPairs.length === 0) {
      section.classList.add('hidden');
      container.innerHTML = '';
      return;
    }
    section.classList.remove('hidden');

    container.innerHTML = detectedPairs.map((pair, i) => `
      <div class="transfer-pair-card" data-idx="${i}">
        <div class="transfer-pair-header">
          <span class="transfer-amount">$${pair.amount.toFixed(2)}</span>
          <span class="transfer-confidence confidence-${pair.confidence >= 75 ? 'high' : pair.confidence >= 50 ? 'med' : 'low'}">${pair.confidence}% match</span>
        </div>
        <div class="transfer-pair-details">
          <div class="transfer-side expense-side">
            <span class="transfer-label">Expense</span>
            <span class="transfer-desc">${escHtml(pair.tx1.description)}</span>
            <span class="transfer-meta">${pair.tx1.date} · ${escHtml(pair.tx1.account)}</span>
          </div>
          <span class="transfer-arrow">⇄</span>
          <div class="transfer-side income-side">
            <span class="transfer-label">Income</span>
            <span class="transfer-desc">${escHtml(pair.tx2.description)}</span>
            <span class="transfer-meta">${pair.tx2.date} · ${escHtml(pair.tx2.account)}</span>
          </div>
        </div>
        <div class="transfer-reason">${escHtml(pair.reason)}</div>
        <div class="transfer-pair-actions">
          <button class="btn btn-sm btn-primary confirm-pair" data-idx="${i}">✓ Confirm</button>
          <button class="btn btn-sm btn-secondary dismiss-pair" data-idx="${i}">✕ Dismiss</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.confirm-pair').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const pair = detectedPairs[idx];
        DataManager.markTransferPair(pair.tx1.id, pair.tx2.id);
        detectedPairs.splice(idx, 1);
        renderDetectedPairs();
        renderConfirmedTransfers();
      });
    });

    container.querySelectorAll('.dismiss-pair').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        detectedPairs.splice(idx, 1);
        renderDetectedPairs();
      });
    });
  }

  function renderConfirmedTransfers() {
    const confirmed = DataManager.getConfirmedTransfers();
    const container = document.getElementById('transfer-confirmed-list');
    const noneMsg = document.getElementById('transfer-none-msg');
    document.getElementById('transfer-confirmed-count').textContent = confirmed.length;

    if (confirmed.length === 0) {
      container.innerHTML = '';
      noneMsg.classList.remove('hidden');
      return;
    }
    noneMsg.classList.add('hidden');

    container.innerHTML = confirmed.map(pair => `
      <div class="transfer-pair-card confirmed">
        <div class="transfer-pair-header">
          <span class="transfer-amount">$${pair.amount.toFixed(2)}</span>
          <span class="transfer-confirmed-badge">✓ Confirmed</span>
        </div>
        <div class="transfer-pair-details">
          <div class="transfer-side expense-side">
            <span class="transfer-desc">${escHtml(pair.tx1.description)}</span>
            <span class="transfer-meta">${pair.tx1.date} · ${escHtml(pair.tx1.account)}</span>
          </div>
          <span class="transfer-arrow">⇄</span>
          <div class="transfer-side income-side">
            <span class="transfer-desc">${escHtml(pair.tx2.description)}</span>
            <span class="transfer-meta">${pair.tx2.date} · ${escHtml(pair.tx2.account)}</span>
          </div>
        </div>
        <div class="transfer-pair-actions">
          <button class="btn btn-sm btn-danger undo-pair" data-link="${pair.linkId}">↩ Undo</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.undo-pair').forEach(btn => {
      btn.addEventListener('click', () => {
        DataManager.unmarkTransferPair(btn.dataset.link);
        renderConfirmedTransfers();
      });
    });
  }

  // Initialize confirmed transfers on load
  renderConfirmedTransfers();

  /* ---- Filters ---- */
  const filterEls = ['filter-account', 'filter-cardholder', 'filter-category', 'filter-month', 'filter-search'];
  filterEls.forEach(id => {
    document.getElementById(id).addEventListener(id === 'filter-search' ? 'input' : 'change', () => {
      currentPage = 1;
      refreshTransactionTable();
    });
  });

  /* ---- Sorting ---- */
  document.querySelectorAll('#tx-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) sortDir *= -1;
      else { sortField = field; sortDir = field === 'date' ? -1 : 1; }
      refreshTransactionTable();
    });
  });

  /* ---- Global data update listener ---- */
  window.addEventListener('transactions-updated', () => {
    refreshFilters();
    refreshTransactionTable();
    // If on a chart tab, refresh it
    const activeTab = document.querySelector('.nav-btn.active');
    if (activeTab) refreshTab(activeTab.dataset.tab);
  });

  /* ---- Refresh Filters ---- */
  function refreshFilters() {
    const accounts = DataManager.getAccounts();
    const cardholders = [...new Set(DataManager.getAll().map(t => t.cardholder || 'Unknown'))].sort();
    const categories = DataManager.getUsedCategories();
    const months = DataManager.getMonths();

    populateSelect('filter-account', accounts, 'All');
    populateSelect('filter-cardholder', cardholders, 'All');
    populateSelect('filter-category', categories, 'All');
    populateSelect('filter-month', months.map(m => ({ value: m, label: formatMonth(m) })), 'All');
  }

  function populateSelect(id, items, allLabel) {
    const sel = document.getElementById(id);
    const current = sel.value;
    sel.innerHTML = `<option value="all">${allLabel}</option>`;
    for (const item of items) {
      const opt = document.createElement('option');
      if (typeof item === 'object') { opt.value = item.value; opt.textContent = item.label; }
      else { opt.value = item; opt.textContent = item; }
      sel.appendChild(opt);
    }
    sel.value = current || 'all';
  }

  function formatMonth(ym) {
    const [y, m] = ym.split('-');
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return names[parseInt(m) - 1] + ' ' + y;
  }

  /* ---- Transaction Table ---- */
  function refreshTransactionTable() {
    const filters = {
      account: document.getElementById('filter-account').value,
      cardholder: document.getElementById('filter-cardholder').value,
      category: document.getElementById('filter-category').value,
      month: document.getElementById('filter-month').value,
      search: document.getElementById('filter-search').value
    };

    filteredTransactions = DataManager.filter(filters);

    // Sort
    filteredTransactions.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'amount') { va = parseFloat(va); vb = parseFloat(vb); }
      if (sortField === 'date') { va = va || ''; vb = vb || ''; }
      if (va < vb) return -sortDir;
      if (va > vb) return sortDir;
      return 0;
    });

    document.getElementById('tx-count').textContent = filteredTransactions.length;

    // Paginate
    const totalPages = Math.ceil(filteredTransactions.length / ROWS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const pageTxs = filteredTransactions.slice(start, start + ROWS_PER_PAGE);

    const tbody = document.getElementById('tx-tbody');
    tbody.innerHTML = pageTxs.map(tx => {
      const hasOriginal = tx._originalDesc && tx._originalDesc !== tx.description;
      const tooltipAttr = hasOriginal ? ` title="Original: ${escHtml(tx._originalDesc)}" style="cursor:help"` : '';
      const txTypeBadge = tx._txType ? `<span style="font-size:.65rem;background:rgba(99,102,241,.15);color:var(--clr-primary);padding:.1rem .3rem;border-radius:3px;margin-left:.4rem">${escHtml(tx._txType)}</span>` : '';
      const isTransfer = tx.transferPairId || tx.category === 'Transfer';
      const transferBadge = isTransfer ? '<span style="font-size:.65rem;background:rgba(99,102,241,.15);color:var(--clr-primary);padding:.1rem .3rem;border-radius:3px;margin-left:.4rem">🔄 Transfer</span>' : '';
      return `
      <tr class="${isTransfer ? 'transfer-row' : ''}">
        <td>${tx.date}</td>
        <td><span${tooltipAttr}>${escHtml(tx.description)}</span>${txTypeBadge}${transferBadge}</td>
        <td class="${tx.category === 'Income' ? 'amount-positive' : 'amount-negative'}">$${Math.abs(tx.amount).toFixed(2)}</td>
        <td>
          <select class="cat-select" data-id="${tx.id}" style="width:auto;margin:0;padding:.2rem .4rem;font-size:.8rem;">
            ${DataManager.CATEGORIES.map(c => `<option value="${c}" ${c === tx.category ? 'selected' : ''}>${c}</option>`).join('')}
            <option value="Other" ${tx.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </td>
        <td>${escHtml(tx.account)}</td>
        <td>${escHtml(tx.cardholder || 'Unknown')}</td>
        <td><button class="btn btn-sm btn-danger delete-tx" data-id="${tx.id}">✕</button></td>
      </tr>`;
    }).join('');

    // Category change handlers
    tbody.querySelectorAll('.cat-select').forEach(sel => {
      sel.addEventListener('change', () => {
        DataManager.update(sel.dataset.id, { category: sel.value });
      });
    });

    // Delete handlers
    tbody.querySelectorAll('.delete-tx').forEach(btn => {
      btn.addEventListener('click', () => {
        DataManager.remove(btn.dataset.id);
      });
    });

    // Pagination
    renderPagination(totalPages);

    // Update filtered data line chart
    Charts.renderImportLine(filteredTransactions);
  }

  function renderPagination(totalPages) {
    const container = document.getElementById('tx-pagination');
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    const showPages = getPageRange(currentPage, totalPages);
    
    html += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;
    for (const p of showPages) {
      if (p === '...') html += '<span style="padding:.3rem .4rem;color:#8b8fa3">…</span>';
      else html += `<button class="${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;

    container.innerHTML = html;
    container.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page);
        refreshTransactionTable();
      });
    });
  }

  function getPageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push('...');
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  /* ---- Tab Refresh ---- */
  function refreshTab(tab) {
    const txs = DataManager.getAll();
    if (txs.length === 0 && tab !== 'import' && tab !== 'classify') return;

    switch (tab) {
      case 'overview':
        refreshOverview();
        break;
      case 'categories':
        refreshCategories();
        break;
      case 'trends':
        refreshTrends();
        break;
      case 'merchants':
        refreshMerchants();
        break;
      case 'savings':
        refreshSavings();
        break;
      case 'budget':
        refreshBudget();
        break;
      case 'classify':
        refreshClassify();
        break;
    }
  }

  function refreshOverview() {
    const kpis = Analysis.getKPIs();
    const monthlyData = Analysis.getMonthlyBreakdown();
    const catTotals = Analysis.getCategoryTotals();

    document.getElementById('kpi-total').textContent = '$' + kpis.totalExpenses.toFixed(2);
    document.getElementById('kpi-avg').textContent = '$' + kpis.avgMonthly.toFixed(2);
    document.getElementById('kpi-high-month').textContent = kpis.highMonth ? formatMonth(kpis.highMonth) : '—';
    document.getElementById('kpi-high-amount').textContent = '$' + kpis.highAmount.toFixed(2);
    document.getElementById('kpi-low-month').textContent = kpis.lowMonth ? formatMonth(kpis.lowMonth) : '—';
    document.getElementById('kpi-low-amount').textContent = '$' + kpis.lowAmount.toFixed(2);
    document.getElementById('kpi-income').textContent = '$' + kpis.totalIncome.toFixed(2);
    const netEl = document.getElementById('kpi-net');
    netEl.textContent = '$' + kpis.netCashFlow.toFixed(2);
    netEl.className = 'kpi-value ' + (kpis.netCashFlow >= 0 ? 'amount-positive' : 'amount-negative');

    Charts.renderOverviewBar(monthlyData);
    Charts.renderOverviewPie(catTotals);
  }

  function refreshCategories() {
    const catTotals = Analysis.getCategoryTotals();
    const breakdown = Analysis.getCategoryBreakdown();

    Charts.renderCategoryPie(catTotals);
    Charts.renderCategoryBar(catTotals);

    const tbody = document.getElementById('cat-tbody');
    tbody.innerHTML = breakdown.map(c => `
      <tr>
        <td>${c.category}</td>
        <td>$${c.total.toFixed(2)}</td>
        <td>${c.percent.toFixed(1)}%</td>
        <td>$${c.avgPerMonth.toFixed(2)}</td>
        <td>${c.count}</td>
      </tr>
    `).join('');
  }

  function refreshTrends() {
    const monthlyData = Analysis.getMonthlyBreakdown();
    const { months, data: categoryMonthly } = Analysis.getCategoryMonthlyData();

    Charts.renderTrendsLine(monthlyData);
    Charts.renderTrendsStacked(months, categoryMonthly);
    Charts.renderTrendsDelta(monthlyData);
  }

  function refreshMerchants() {
    const merchants = Analysis.getMerchantBreakdown();

    Charts.renderMerchantBar(merchants);

    const tbody = document.getElementById('merchant-tbody');
    tbody.innerHTML = merchants.slice(0, 50).map(m => `
      <tr>
        <td>${escHtml(m.name)}</td>
        <td>$${m.total.toFixed(2)}</td>
        <td>${m.count}</td>
        <td>$${m.avgPerTx.toFixed(2)}</td>
        <td>${m.category}</td>
      </tr>
    `).join('');
  }

  function refreshSavings() {
    const recommendations = Analysis.getSavingsRecommendations();
    const container = document.getElementById('savings-recommendations');

    if (recommendations.length === 0) {
      container.innerHTML = '<p style="color:var(--clr-text-muted)">Import transactions to see personalized savings recommendations.</p>';
      return;
    }

    container.innerHTML = recommendations.map(r => `
      <div class="savings-card">
        <div class="icon">${r.icon}</div>
        <div class="content">
          <div class="title">${r.title} <span class="savings-priority priority-${r.priority}">${r.priority}</span></div>
          <div class="desc">${r.description}</div>
        </div>
        <div class="amount">$${r.potentialSavings.toFixed(0)}/mo</div>
      </div>
    `).join('');

    const totalSavings = recommendations.reduce((s, r) => s + r.potentialSavings, 0);
    document.getElementById('kpi-savings').textContent = '$' + totalSavings.toFixed(2);
    document.getElementById('kpi-savings-annual').textContent = '$' + (totalSavings * 12).toFixed(2);

    const wfData = Analysis.getSavingsWaterfallData(recommendations);
    Charts.renderSavingsWaterfall(wfData.categories, wfData.currentAmounts, wfData.savingsAmounts);
  }

  function refreshBudget() {
    Budget.renderBudgetTable();
    Budget.renderBudgetChart();
  }

  /* ============================================
     CLASSIFY TAB — Drag-and-Drop Classification
     ============================================ */

  let classifyAnalysis = []; // results from Classifier.analyzeUnclassified()
  let draggedTxId = null;

  // Reclassify button — re-run auto-categorizer with expanded keywords
  document.getElementById('btn-reclassify').addEventListener('click', () => {
    const count = Classifier.reclassifyAll();
    const statusEl = document.getElementById('reclassify-status');
    statusEl.textContent = count > 0
      ? `✅ Reclassified ${count} transaction${count > 1 ? 's' : ''} with updated keywords!`
      : 'No new classifications found. Try "Analyze Unclassified" for deeper analysis.';
    statusEl.className = 'status-text ' + (count > 0 ? 'success' : '');
    refreshClassify();
  });

  // Analyze button — run the smart analyzer
  document.getElementById('btn-analyze').addEventListener('click', () => {
    classifyAnalysis = Classifier.analyzeUnclassified();
    renderClassifyBoard();
  });

  // Vendor Match button — apply known vendor categories to unclassified siblings
  document.getElementById('btn-vendor-match').addEventListener('click', () => {
    const statusEl = document.getElementById('vendor-match-status');
    const actionable = Classifier.getActionableVendorGroups();

    if (actionable.length === 0) {
      statusEl.textContent = 'No vendor matches found. Classify at least one transaction from a vendor first, then other instances will be auto-matched.';
      statusEl.className = 'status-text';
      return;
    }

    // Show preview before applying
    const previewHtml = actionable.map(g =>
      `<div class="vendor-match-row">
        <span class="vendor-match-name">${escHtml(g.name)}</span>
        <span class="vendor-match-count">${g.unclassifiedCount} unclassified</span>
        <span class="vendor-match-arrow">→</span>
        <span class="vendor-match-cat">${getCategoryIcon(g.dominantCategory)} ${g.dominantCategory}</span>
        <button class="btn btn-sm btn-accent vendor-apply-one" data-vendor-key="${escHtml(g.vendorKey)}" data-cat="${escHtml(g.dominantCategory)}">✓ Apply</button>
        <button class="btn btn-sm btn-secondary vendor-skip-one" data-vendor-key="${escHtml(g.vendorKey)}">✕ Skip</button>
      </div>`
    ).join('');

    const totalCount = actionable.reduce((s, g) => s + g.unclassifiedCount, 0);
    statusEl.innerHTML = `
      <div class="vendor-match-preview">
        <div class="vendor-match-header">
          <strong>🏪 Found ${actionable.length} vendor${actionable.length > 1 ? 's' : ''} with ${totalCount} unclassified transaction${totalCount > 1 ? 's' : ''}</strong>
          <button id="btn-vendor-apply-all" class="btn btn-sm btn-accent">✓ Apply All</button>
        </div>
        <div class="vendor-match-list">${previewHtml}</div>
      </div>`;
    statusEl.className = 'status-text';

    // Apply All button
    document.getElementById('btn-vendor-apply-all').addEventListener('click', () => {
      const result = Classifier.applyAllVendorCategories();
      statusEl.innerHTML = `✅ Applied vendor categories: ${result.totalUpdated} transaction${result.totalUpdated > 1 ? 's' : ''} across ${result.groupsApplied} vendor${result.groupsApplied > 1 ? 's' : ''} updated.`;
      statusEl.className = 'status-text success';
      refreshClassify();
    });

    // Individual Apply buttons
    statusEl.querySelectorAll('.vendor-apply-one').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.vendorKey;
        const cat = btn.dataset.cat;
        const count = Classifier.applyVendorCategory(key, cat);
        btn.closest('.vendor-match-row').innerHTML = `<span class="vendor-match-done">✅ Applied ${cat} to ${count} transaction${count > 1 ? 's' : ''}</span>`;
        refreshClassify();
      });
    });

    // Skip buttons
    statusEl.querySelectorAll('.vendor-skip-one').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.vendor-match-row').remove();
      });
    });
  });

  // Auto-Search Addresses button
  document.getElementById('btn-auto-search').addEventListener('click', async () => {
    const btn = document.getElementById('btn-auto-search');
    const statusEl = document.getElementById('auto-search-status');
    const progressWrap = document.getElementById('auto-search-progress');
    const progressFill = document.getElementById('search-progress-fill');
    const progressText = document.getElementById('search-progress-text');

    btn.disabled = true;
    btn.textContent = '⏳ Searching...';
    statusEl.textContent = 'Scanning for transactions with addresses...';
    statusEl.className = 'status-text';
    progressWrap.classList.remove('hidden');
    progressFill.style.width = '0%';

    try {
      const result = await Classifier.autoSearchAndClassify((current, total, desc) => {
        const pct = Math.round((current / total) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = `Searching ${current}/${total}: ${desc.slice(0, 40)}...`;
      });

      progressWrap.classList.add('hidden');

      if (result.searched === 0) {
        statusEl.textContent = 'No unclassified transactions with addresses found.';
        statusEl.className = 'status-text';
      } else {
        statusEl.textContent = `✅ Searched ${result.searched} transactions with addresses. Auto-classified ${result.classified}. ${result.searched - result.classified} still need manual review.`;
        statusEl.className = 'status-text success';

        // Show details of what was found
        if (result.results.length > 0) {
          const detailsHtml = result.results.map(r => {
            const icon = r.appliedCategory ? '✅' : '❓';
            const cat = r.appliedCategory || 'Unknown';
            const summary = (r.searchResult.summary || '').slice(0, 100);
            return `<div class="auto-search-result">
              <span class="auto-search-icon">${icon}</span>
              <span class="auto-search-desc">${escHtml(r.tx.description)}</span>
              <span class="auto-search-addr">${escHtml(r.addressText)}</span>
              <span class="auto-search-cat">${cat}</span>
              ${summary ? `<span class="auto-search-summary">${escHtml(summary)}</span>` : ''}
            </div>`;
          }).join('');
          statusEl.innerHTML += `<div class="auto-search-results-list" style="margin-top:.6rem">${detailsHtml}</div>`;
        }
      }

      refreshClassify();
    } catch (err) {
      progressWrap.classList.add('hidden');
      statusEl.textContent = '❌ Error during web search: ' + err.message;
      statusEl.className = 'status-text error';
    }

    btn.disabled = false;
    btn.textContent = '🌐 Auto-Search Addresses';
  });

  // Close context panel
  document.getElementById('btn-close-context').addEventListener('click', () => {
    document.getElementById('context-panel').classList.add('hidden');
  });

  function refreshClassify() {
    classifyAnalysis = Classifier.analyzeUnclassified();
    renderClassifyBoard();
  }

  function renderClassifyBoard() {
    const all = DataManager.getAll();
    const totalCount = all.length;
    const unclassifiedAll = all.filter(t => t.category === 'Other');
    const withSuggestions = classifyAnalysis.filter(a => a.suggestedCategory);
    const unknown = classifyAnalysis.filter(a => !a.suggestedCategory);

    // Update stats
    // Vendor match stat
    const vendorMatchCount = Classifier.getActionableVendorGroups()
      .reduce((s, g) => s + g.unclassifiedCount, 0);

    document.getElementById('stat-total').textContent = totalCount;
    document.getElementById('stat-unclassified').textContent = unclassifiedAll.length;
    document.getElementById('stat-suggested').textContent = withSuggestions.length;
    document.getElementById('stat-unknown').textContent = unknown.length;
    document.getElementById('stat-vendor-matches').textContent = vendorMatchCount;

    // Render unclassified column
    const unclassifiedEl = document.getElementById('unclassified-items');
    document.getElementById('badge-unclassified').textContent = classifyAnalysis.length;

    if (classifyAnalysis.length === 0) {
      unclassifiedEl.innerHTML = '<p class="empty-message">No unclassified transactions! 🎉</p>';
    } else {
      unclassifiedEl.innerHTML = classifyAnalysis.map(a => renderTxCard(a)).join('');
      attachCardHandlers(unclassifiedEl);
      makeDraggable(unclassifiedEl);
    }

    // Render category columns
    const catContainer = document.getElementById('classify-categories');
    const usedCategories = DataManager.CATEGORIES.filter(c => c !== 'Other');

    // Group suggestions by category
    const suggestedByCat = {};
    for (const a of withSuggestions) {
      if (!suggestedByCat[a.suggestedCategory]) suggestedByCat[a.suggestedCategory] = [];
      suggestedByCat[a.suggestedCategory].push(a);
    }

    // Sort: categories with suggestions first, then alphabetical
    const sortedCats = [...usedCategories].sort((a, b) => {
      const aHas = suggestedByCat[a] ? 1 : 0;
      const bHas = suggestedByCat[b] ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas;
      return a.localeCompare(b);
    });

    catContainer.innerHTML = sortedCats.map(cat => {
      const suggestions = suggestedByCat[cat] || [];
      const catIcon = getCategoryIcon(cat);
      return `
        <div class="classify-column cat-column" data-category="${cat}">
          <div class="classify-col-header">
            <h3>${catIcon} ${cat} <span class="badge">${suggestions.length}</span></h3>
          </div>
          <div class="classify-col-body drop-zone" data-category="${cat}">
            ${suggestions.length === 0
              ? '<p class="empty-message drop-hint">Drop transactions here</p>'
              : suggestions.map(a => renderSuggestionCard(a)).join('')
            }
          </div>
        </div>
      `;
    }).join('');

    // Attach drag-and-drop to all drop zones
    catContainer.querySelectorAll('.drop-zone').forEach(zone => {
      makeDropZone(zone);
      attachCardHandlers(zone);
      makeDraggable(zone);
    });

    // Also make the unclassified column a drop zone (for dragging back)
    makeDropZone(unclassifiedEl);
  }

  function renderTxCard(analysis) {
    const tx = analysis.tx;
    const amt = Math.abs(tx.amount);
    const hasSuggestion = !!analysis.suggestedCategory;
    const confClass = analysis.confidence >= 60 ? 'high' : analysis.confidence >= 30 ? 'med' : 'low';

    return `
      <div class="classify-card ${hasSuggestion ? 'has-suggestion' : ''}" draggable="true" data-tx-id="${tx.id}" data-suggested="${analysis.suggestedCategory || ''}">
        <div class="classify-card-top">
          <span class="classify-card-amount">$${amt.toFixed(2)}</span>
          <span class="classify-card-date">${tx.date}</span>
        </div>
        <div class="classify-card-desc" title="${escHtml(tx._originalDesc || tx.description)}">${escHtml(tx.description)}</div>
        <div class="classify-card-meta">${escHtml(tx.account)}${tx.cardholder && tx.cardholder !== 'Unknown' ? ' · ' + escHtml(tx.cardholder) : ''}</div>
        ${hasSuggestion ? `
          <div class="classify-card-suggestion">
            <span class="confidence-badge confidence-${confClass}">${analysis.confidence}%</span>
            Suggested: <strong>${analysis.suggestedCategory}</strong>
          </div>
          <div class="classify-card-reason">${analysis.reasons.slice(0, 2).join('; ')}</div>
        ` : ''}
        <div class="classify-card-actions">
          ${hasSuggestion ? `<button class="btn btn-sm btn-accent accept-suggestion" data-tx-id="${tx.id}" data-cat="${analysis.suggestedCategory}">✓ Accept</button>` : ''}
          <button class="btn btn-sm btn-secondary more-info" data-tx-id="${tx.id}">🔍 More Info</button>
        </div>
      </div>
    `;
  }

  function renderSuggestionCard(analysis) {
    const tx = analysis.tx;
    const amt = Math.abs(tx.amount);
    const confClass = analysis.confidence >= 60 ? 'high' : analysis.confidence >= 30 ? 'med' : 'low';

    return `
      <div class="classify-card has-suggestion in-bucket" draggable="true" data-tx-id="${tx.id}" data-suggested="${analysis.suggestedCategory}">
        <div class="classify-card-top">
          <span class="classify-card-amount">$${amt.toFixed(2)}</span>
          <span class="confidence-badge confidence-${confClass}">${analysis.confidence}%</span>
        </div>
        <div class="classify-card-desc" title="${escHtml(tx._originalDesc || tx.description)}">${escHtml(tx.description)}</div>
        <div class="classify-card-meta">${tx.date} · ${escHtml(tx.account)}</div>
        <div class="classify-card-actions">
          <button class="btn btn-sm btn-accent accept-suggestion" data-tx-id="${tx.id}" data-cat="${analysis.suggestedCategory}">✓ Accept</button>
          <button class="btn btn-sm btn-secondary more-info" data-tx-id="${tx.id}">🔍 More Info</button>
        </div>
      </div>
    `;
  }

  function attachCardHandlers(container) {
    // Accept suggestion buttons
    container.querySelectorAll('.accept-suggestion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const txId = btn.dataset.txId;
        const cat = btn.dataset.cat;
        DataManager.update(txId, { category: cat });
        promptVendorSiblings(txId, cat);
        refreshClassify();
      });
    });

    // More Info buttons
    container.querySelectorAll('.more-info').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const txId = btn.dataset.txId;
        const tx = DataManager.getAll().find(t => t.id === txId);
        if (!tx) return;
        await showContextPanel(tx);
      });
    });
  }

  function makeDraggable(container) {
    container.querySelectorAll('.classify-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedTxId = card.dataset.txId;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedTxId);
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedTxId = null;
        // Remove all drag-over highlights
        document.querySelectorAll('.drop-zone.drag-over').forEach(z => z.classList.remove('drag-over'));
      });
    });
  }

  function makeDropZone(zone) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', (e) => {
      // Only remove class if we actually left the zone
      if (!zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
      }
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const txId = e.dataTransfer.getData('text/plain') || draggedTxId;
      if (!txId) return;

      const targetCategory = zone.dataset.category;
      if (targetCategory === 'Other') {
        // Dragging back to unclassified — don't change, just leave as Other
        return;
      }

      // Update this transaction's category (mark as manual since user dragged it)
      DataManager.update(txId, { category: targetCategory, _manualOverride: true });
      promptVendorSiblings(txId, targetCategory);
      refreshClassify();
    });
  }

  /* ---- Vendor Sibling Auto-Prompt ---- */

  /**
   * After classifying a transaction, check if the same vendor has other
   * unclassified transactions and offer to apply the same category.
   */
  function promptVendorSiblings(txId, category) {
    const result = Classifier.findVendorSiblings(txId);
    if (!result || result.siblings.length === 0) return;

    const { vendorName, siblings, vendorKey } = result;
    const count = siblings.length;

    // Show a toast notification offering to apply to siblings
    showVendorToast(vendorName, category, count, vendorKey);
  }

  function showVendorToast(vendorName, category, count, vendorKey) {
    // Remove any existing toast
    const existing = document.getElementById('vendor-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'vendor-toast';
    toast.className = 'vendor-toast';
    toast.innerHTML = `
      <div class="vendor-toast-content">
        <span class="vendor-toast-icon">🏪</span>
        <span class="vendor-toast-text">
          <strong>${count}</strong> more transaction${count > 1 ? 's' : ''} from <strong>${escHtml(vendorName)}</strong> ${count > 1 ? 'are' : 'is'} unclassified.
          Apply <strong>${category}</strong> to all?
        </span>
      </div>
      <div class="vendor-toast-actions">
        <button class="btn btn-sm btn-accent" id="vendor-toast-apply">✓ Apply to All ${count}</button>
        <button class="btn btn-sm btn-secondary" id="vendor-toast-dismiss">✕ No Thanks</button>
      </div>
    `;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('visible'));

    // Apply button
    document.getElementById('vendor-toast-apply').addEventListener('click', () => {
      const updated = Classifier.applyVendorCategory(vendorKey, category);
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
      refreshClassify();
      // Brief success feedback
      const statusEl = document.getElementById('vendor-match-status');
      statusEl.textContent = `✅ Applied ${category} to ${updated} transaction${updated > 1 ? 's' : ''} from ${vendorName}.`;
      statusEl.className = 'status-text success';
    });

    // Dismiss button
    document.getElementById('vendor-toast-dismiss').addEventListener('click', () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    });

    // Auto-dismiss after 12 seconds
    setTimeout(() => {
      if (document.getElementById('vendor-toast')) {
        toast.classList.remove('visible');
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
      }
    }, 12000);
  }

  /* ---- Context / Info Panel ---- */

  async function showContextPanel(tx) {
    const panel = document.getElementById('context-panel');
    const body = document.getElementById('context-body');
    const title = document.getElementById('context-title');

    panel.classList.remove('hidden');
    title.textContent = tx.description;
    body.innerHTML = '<p class="info-text">Loading context...</p>';

    // Get local context first
    const ctx = Classifier.getTransactionContext(tx);

    // Build context HTML
    let html = '';

    // Clues section
    html += '<div class="context-section"><h4>📋 Transaction Clues</h4><ul>';
    for (const clue of ctx.clues) {
      html += `<li>${escHtml(clue)}</li>`;
    }
    html += '</ul></div>';

    // Nearby transactions
    if (ctx.nearby.length > 0) {
      html += '<div class="context-section"><h4>📍 Nearby Transactions (±1 day)</h4>';
      html += '<div class="context-nearby">';
      for (const n of ctx.nearby) {
        html += `<div class="context-nearby-tx">
          <span class="context-nearby-desc">${escHtml(n.description)}</span>
          <span class="context-nearby-cat">${n.category}</span>
          <span class="context-nearby-amt">$${Math.abs(n.amount).toFixed(2)}</span>
        </div>`;
      }
      html += '</div></div>';
    }

    // Quick-assign buttons
    html += '<div class="context-section"><h4>⚡ Quick Assign Category</h4>';
    html += '<div class="context-quick-cats">';
    const topCats = ['Dining', 'Shopping', 'Entertainment', 'Transportation', 'Groceries', 'Healthcare', 'Travel', 'Subscriptions', 'Personal Care', 'Utilities', 'Gifts & Donations', 'Housing', 'Education', 'Insurance'];
    for (const cat of topCats) {
      html += `<button class="btn btn-sm btn-secondary quick-cat-btn" data-tx-id="${tx.id}" data-cat="${cat}">${getCategoryIcon(cat)} ${cat}</button>`;
    }
    html += '</div></div>';

    // Web search section (loading)
    html += '<div class="context-section" id="context-search-section"><h4>🌐 Web Search Results</h4>';
    html += '<p class="info-text">Searching...</p></div>';

    body.innerHTML = html;

    // Attach quick-cat handlers
    body.querySelectorAll('.quick-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const txId = btn.dataset.txId;
        const cat = btn.dataset.cat;
        DataManager.update(txId, { category: cat, _manualOverride: true });
        panel.classList.add('hidden');
        promptVendorSiblings(txId, cat);
        refreshClassify();
      });
    });

    // Now do the web search asynchronously
    try {
      const searchResult = await Classifier.searchForContext(tx);
      const searchSection = document.getElementById('context-search-section');
      if (!searchSection) return;

      let searchHtml = '<h4>🌐 Web Search Results</h4>';

      if (searchResult.summary && searchResult.summary !== 'No instant answer found. Click "Search Web" for full results.') {
        searchHtml += `<div class="context-search-summary">`;
        if (searchResult.businessType) {
          searchHtml += `<strong>${escHtml(searchResult.businessType)}</strong><br>`;
        }
        searchHtml += `<p>${escHtml(searchResult.summary)}</p>`;
        if (searchResult.suggestedCategory) {
          searchHtml += `<div class="context-search-suggestion">
            Based on search results, this might be: <strong>${searchResult.suggestedCategory}</strong>
            <button class="btn btn-sm btn-accent apply-search-cat" data-tx-id="${tx.id}" data-cat="${searchResult.suggestedCategory}">✓ Apply</button>
          </div>`;
        }
        searchHtml += '</div>';
      }

      if (searchResult.results.length > 0) {
        searchHtml += '<div class="context-search-results">';
        for (const r of searchResult.results) {
          searchHtml += `<div class="context-search-result">${escHtml(r)}</div>`;
        }
        searchHtml += '</div>';
      }

      searchHtml += `<a href="${searchResult.searchUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="margin-top:.5rem">🔎 Search Web for "${escHtml(searchResult.query)}"</a>`;

      searchSection.innerHTML = searchHtml;

      // Attach apply button
      searchSection.querySelectorAll('.apply-search-cat').forEach(btn => {
        btn.addEventListener('click', () => {
          const txId = btn.dataset.txId;
          const cat = btn.dataset.cat;
          DataManager.update(txId, { category: cat });
          panel.classList.add('hidden');
          promptVendorSiblings(txId, cat);
          refreshClassify();
        });
      });
    } catch (err) {
      const searchSection = document.getElementById('context-search-section');
      if (searchSection) {
        searchSection.innerHTML = `<h4>🌐 Web Search</h4><p class="info-text">Search unavailable. <a href="https://duckduckgo.com/?q=${encodeURIComponent(tx.description + ' business')}" target="_blank">Search manually</a></p>`;
      }
    }
  }

  function getCategoryIcon(cat) {
    const icons = {
      'Housing': '🏠', 'Utilities': '💡', 'Groceries': '🛒', 'Dining': '🍽',
      'Transportation': '🚗', 'Healthcare': '🏥', 'Entertainment': '🎬',
      'Shopping': '🛍', 'Subscriptions': '📱', 'Insurance': '🛡',
      'Education': '📚', 'Personal Care': '💅', 'Gifts & Donations': '🎁',
      'Travel': '✈️', 'Income': '💰', 'Transfer': '🔄', 'Other': '❓'
    };
    return icons[cat] || '📦';
  }

  /* ---- Utility ---- */
  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  /* ---- Init ---- */
  refreshFilters();
  refreshTransactionTable();

})();
