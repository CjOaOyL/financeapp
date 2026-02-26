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
  document.getElementById('btn-export-report').addEventListener('click', () => Exporter.exportReport());
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

  /* ---- Filters ---- */
  const filterEls = ['filter-account', 'filter-category', 'filter-month', 'filter-search'];
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
    const categories = DataManager.getUsedCategories();
    const months = DataManager.getMonths();

    populateSelect('filter-account', accounts, 'All');
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
      return `
      <tr>
        <td>${tx.date}</td>
        <td><span${tooltipAttr}>${escHtml(tx.description)}</span>${txTypeBadge}</td>
        <td class="${tx.category === 'Income' ? 'amount-positive' : 'amount-negative'}">$${Math.abs(tx.amount).toFixed(2)}</td>
        <td>
          <select class="cat-select" data-id="${tx.id}" style="width:auto;margin:0;padding:.2rem .4rem;font-size:.8rem;">
            ${DataManager.CATEGORIES.map(c => `<option value="${c}" ${c === tx.category ? 'selected' : ''}>${c}</option>`).join('')}
            <option value="Other" ${tx.category === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </td>
        <td>${escHtml(tx.account)}</td>
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
    if (txs.length === 0 && tab !== 'import') return;

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
