/* ============================================
   Financial Planner — Income Scenarios, Expense
   Modeling & Savings Projections
   ============================================ */

const Planner = (() => {
  'use strict';

  const INCOME_KEY   = 'finance_dashboard_planner_income';
  const EXPENSE_KEY  = 'finance_dashboard_planner_expenses';
  const SETTINGS_KEY = 'finance_dashboard_planner_settings';

  /* ---- Persistence ---- */

  function getIncomeSources() {
    try { return JSON.parse(localStorage.getItem(INCOME_KEY) || '[]'); } catch { return []; }
  }
  function saveIncomeSources(sources) {
    localStorage.setItem(INCOME_KEY, JSON.stringify(sources));
    window.dispatchEvent(new CustomEvent('planner-updated'));
  }

  function getScenarioExpenses() {
    try { return JSON.parse(localStorage.getItem(EXPENSE_KEY) || '[]'); } catch { return []; }
  }
  function saveScenarioExpenses(expenses) {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(new CustomEvent('planner-updated'));
  }

  function getSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    } catch { return {}; }
  }
  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  /* ---- Income Source CRUD ---- */

  function addIncomeSource(source) {
    const sources = getIncomeSources();
    source.id = source.id || uid();
    source.enabled = source.enabled !== false;
    sources.push(source);
    saveIncomeSources(sources);
    return source;
  }

  function updateIncomeSource(id, fields) {
    const sources = getIncomeSources();
    const idx = sources.findIndex(s => s.id === id);
    if (idx === -1) return false;
    sources[idx] = { ...sources[idx], ...fields };
    saveIncomeSources(sources);
    return true;
  }

  function removeIncomeSource(id) {
    saveIncomeSources(getIncomeSources().filter(s => s.id !== id));
  }

  /* ---- Scenario Expense CRUD ---- */

  function addScenarioExpense(expense) {
    const expenses = getScenarioExpenses();
    expense.id = expense.id || uid();
    expense.enabled = expense.enabled !== false;
    expenses.push(expense);
    saveScenarioExpenses(expenses);
    return expense;
  }

  function updateScenarioExpense(id, fields) {
    const expenses = getScenarioExpenses();
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) return false;
    expenses[idx] = { ...expenses[idx], ...fields };
    saveScenarioExpenses(expenses);
    return true;
  }

  function removeScenarioExpense(id) {
    saveScenarioExpenses(getScenarioExpenses().filter(e => e.id !== id));
  }

  /* ---- Monthly Income Calculation ---- */

  /**
   * Calculate expected monthly income from a single source for a given month index
   * (0 = current month, 1 = next month, etc.) and calendar month (0-11).
   */
  function monthlyIncomeForSource(source, calendarMonth) {
    if (!source.enabled) return 0;

    switch (source.type) {
      case 'salary': {
        const amt = parseFloat(source.amount) || 0;
        const freq = source.frequency || 'monthly';
        if (freq === 'weekly') return amt * 52 / 12;
        if (freq === 'biweekly') return amt * 26 / 12;
        return amt; // monthly
      }

      case 'hourly': {
        const rate = parseFloat(source.hourlyRate) || 0;
        const hours = parseFloat(source.hoursPerWeek) || 0;
        const netFactor = parseFloat(source.netFactor != null ? source.netFactor : 1);
        return rate * hours * (52 / 12) * netFactor;
      }

      case 'contract': {
        const avg = parseFloat(source.avgAmount) || 0;
        const occ = parseFloat(source.monthlyOccurrences) || 0;
        return avg * occ;
      }

      case 'tips': {
        const minShift = parseFloat(source.minPerShift) || 0;
        const maxShift = parseFloat(source.maxPerShift) || 0;
        const shifts = parseFloat(source.shiftsPerMonth) || 0;
        const avgPerShift = (minShift + maxShift) / 2;
        let monthlyBase = avgPerShift * shifts;

        // Apply peak season multiplier
        const peakMonths = source.peakMonths || [];
        const peakMult = parseFloat(source.peakMultiplier) || 1;
        if (peakMonths.includes(calendarMonth)) {
          monthlyBase *= peakMult;
        }
        return monthlyBase;
      }

      default:
        return parseFloat(source.amount) || 0;
    }
  }

  /**
   * Total projected monthly income across all enabled sources for a calendar month.
   */
  function totalMonthlyIncome(calendarMonth) {
    const sources = getIncomeSources().filter(s => s.enabled);
    return sources.reduce((sum, s) => sum + monthlyIncomeForSource(s, calendarMonth), 0);
  }

  /* ---- Historical Income from Transactions ---- */

  /**
   * Get historical monthly income from actual transactions.
   * Returns array of { month: 'YYYY-MM', income: number }
   */
  function getHistoricalIncome() {
    const all = DataManager.getAll();
    const byMonth = {};

    for (const tx of all) {
      const month = tx.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = 0;
      if (tx.category === 'Income' || tx.amount < 0) {
        byMonth[month] += Math.abs(tx.amount);
      }
    }

    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, income]) => ({ month, income }));
  }

  /**
   * Get historical monthly expenses from actual transactions (budget-relevant only).
   * Returns array of { month: 'YYYY-MM', expenses: number }
   */
  function getHistoricalExpenses() {
    const all = DataManager.getAll();
    const byMonth = {};

    for (const tx of all) {
      const month = tx.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = 0;
      if (tx.amount > 0 && tx.category !== 'Income' && tx.category !== 'Transfer') {
        byMonth[month] += tx.amount;
      }
    }

    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, expenses]) => ({ month, expenses }));
  }

  /* ---- Monthly Budget Baseline ---- */

  /**
   * Get the full per-category budget breakdown.
   * Returns { categories: [{category, target, avgSpend}], total, source } where
   * source is 'budget' if targets exist, or 'historical' as fallback.
   */
  function getBudgetBreakdown() {
    const budget = DataManager.getBudget();
    const entries = Object.entries(budget);

    if (entries.length > 0 && entries.some(([, b]) => (b.target || 0) > 0)) {
      const categories = entries
        .filter(([cat]) => cat !== 'Income' && cat !== 'Transfer')
        .map(([category, b]) => ({
          category,
          target: b.target || 0,
          avgSpend: b.avgSpend || 0
        }))
        .sort((a, b) => b.target - a.target);
      const total = categories.reduce((sum, c) => sum + c.target, 0);
      return { categories, total, source: 'budget' };
    }

    // Fallback: derive from historical spending averages
    const hist = getHistoricalExpenses();
    if (hist.length === 0) return { categories: [], total: 0, source: 'none' };

    // Use Analysis if available for per-category breakdown
    if (typeof Analysis !== 'undefined' && Analysis.getCategoryBreakdown) {
      const breakdown = Analysis.getCategoryBreakdown();
      const categories = breakdown
        .filter(c => c.category !== 'Income' && c.category !== 'Transfer')
        .map(c => ({
          category: c.category,
          target: Math.round(c.avgPerMonth * 100) / 100,
          avgSpend: Math.round(c.avgPerMonth * 100) / 100
        }));
      const total = categories.reduce((s, c) => s + c.target, 0);
      return { categories, total, source: 'historical' };
    }

    const avgTotal = hist.reduce((s, h) => s + h.expenses, 0) / hist.length;
    return { categories: [{ category: 'All Expenses', target: avgTotal, avgSpend: avgTotal }], total: avgTotal, source: 'historical' };
  }

  /**
   * Total monthly budget from budget targets, or average historical spending
   * as fallback.
   */
  function getMonthlyBudgetTotal() {
    return getBudgetBreakdown().total;
  }

  /* ---- Scenario Expense for a Month ---- */

  /**
   * Total scenario expenses active in a given month offset (0 = this month).
   */
  function getScenarioExpenseForMonth(monthOffset) {
    return getScenarioExpenses()
      .filter(e => e.enabled)
      .filter(e => {
        const start = parseInt(e.startMonth) || 0;
        const end = e.endMonth != null ? parseInt(e.endMonth) : Infinity;
        return monthOffset >= start && monthOffset <= end;
      })
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }

  /* ---- Full Projection ---- */

  /**
   * Project savings over N months.
   * Returns array of:
   *   { monthLabel, calendarMonth, income, budgetExpenses, scenarioExpenses, totalExpenses, netSavings, cumulativeSavings }
   */
  function projectSavings(months = 12, startingBalance = 0) {
    const now = new Date();
    const startYear = now.getFullYear();
    const startMonth = now.getMonth(); // 0-11

    const budgetBase = getMonthlyBudgetTotal();
    const projection = [];
    let cumulative = startingBalance;

    for (let i = 0; i < months; i++) {
      const calMonth = (startMonth + i) % 12;
      const year = startYear + Math.floor((startMonth + i) / 12);
      const monthLabel = `${year}-${String(calMonth + 1).padStart(2, '0')}`;

      const income = totalMonthlyIncome(calMonth);
      const scenarioExp = getScenarioExpenseForMonth(i);
      const totalExpenses = budgetBase + scenarioExp;
      const net = income - totalExpenses;
      cumulative += net;

      projection.push({
        monthLabel,
        monthOffset: i,
        calendarMonth: calMonth,
        income: Math.round(income * 100) / 100,
        budgetExpenses: Math.round(budgetBase * 100) / 100,
        scenarioExpenses: Math.round(scenarioExp * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netSavings: Math.round(net * 100) / 100,
        cumulativeSavings: Math.round(cumulative * 100) / 100
      });
    }

    return projection;
  }

  /**
   * Build comparison data: historical income vs projected income assumption.
   * Returns { historicalMonths, historicalIncome, projectedMonths, projectedIncome }
   */
  function getIncomeComparison() {
    const historical = getHistoricalIncome();
    const histMonths = historical.map(h => h.month);
    const histIncome = historical.map(h => h.income);

    // Project forward 12 months for comparison
    const now = new Date();
    const projMonths = [];
    const projIncome = [];
    for (let i = 0; i < 12; i++) {
      const calMonth = (now.getMonth() + i) % 12;
      const year = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
      const label = `${year}-${String(calMonth + 1).padStart(2, '0')}`;
      projMonths.push(label);
      projIncome.push(Math.round(totalMonthlyIncome(calMonth) * 100) / 100);
    }

    return { histMonths, histIncome, projMonths, projIncome };
  }

  /**
   * Income breakdown by source for a given calendar month.
   */
  function getIncomeBreakdown(calendarMonth) {
    const sources = getIncomeSources().filter(s => s.enabled);
    return sources.map(s => ({
      name: s.name,
      type: s.type,
      amount: Math.round(monthlyIncomeForSource(s, calendarMonth) * 100) / 100
    }));
  }

  /**
   * Affordability check: given the scenario, what's the max extra
   * monthly expense that still leaves positive savings?
   */
  function maxAffordableExpense() {
    const now = new Date();
    const calMonth = now.getMonth();
    const income = totalMonthlyIncome(calMonth);
    const budgetBase = getMonthlyBudgetTotal();
    const currentScenario = getScenarioExpenseForMonth(0);
    return Math.max(0, income - budgetBase - currentScenario);
  }

  /* ---- Helpers ---- */

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function formatMonthLabel(ym) {
    const [y, m] = ym.split('-');
    return MONTH_NAMES[parseInt(m) - 1] + ' ' + y;
  }

  const INCOME_TYPE_LABELS = {
    salary: '💼 Salary / Paycheck',
    hourly: '⏱ Hourly Wage',
    contract: '📝 Contract Work',
    tips: '💵 Tips / Variable'
  };

  /* ---- Render: Income Sources Table ---- */

  function renderIncomeSources() {
    const sources = getIncomeSources();
    const tbody = document.getElementById('planner-income-tbody');
    if (!tbody) return;

    if (sources.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--clr-text-muted);padding:2rem">No income sources yet. Add one above to start planning.</td></tr>';
      return;
    }

    const now = new Date();
    const calMonth = now.getMonth();

    tbody.innerHTML = sources.map(s => {
      const monthly = monthlyIncomeForSource(s, calMonth);
      const ICONS = { salary: '💼', hourly: '⏱', contract: '📝', tips: '💵' };
      const LABELS = { salary: 'Salary', hourly: 'Hourly', contract: 'Contract', tips: 'Tips' };
      const typeIcon = ICONS[s.type] || '💰';
      const typeLabel = LABELS[s.type] || s.type;
      const detailParts = [];

      if (s.type === 'salary') {
        detailParts.push(`$${parseFloat(s.amount).toFixed(2)} / ${s.frequency}`);
      } else if (s.type === 'hourly') {
        detailParts.push(`$${parseFloat(s.hourlyRate || 0).toFixed(2)}/hr`);
        detailParts.push(`${s.hoursPerWeek || 0} hrs/wk`);
        const nf = parseFloat(s.netFactor != null ? s.netFactor : 1);
        if (nf < 0.999) detailParts.push(`Net ${(nf * 100).toFixed(0)}%`);
      } else if (s.type === 'contract') {
        detailParts.push(`$${parseFloat(s.avgAmount).toFixed(2)} × ${s.monthlyOccurrences}/mo`);
      } else if (s.type === 'tips') {
        detailParts.push(`$${parseFloat(s.minPerShift).toFixed(0)}–$${parseFloat(s.maxPerShift).toFixed(0)}/shift`);
        detailParts.push(`${s.shiftsPerMonth} shifts/mo`);
        if (s.peakMonths && s.peakMonths.length > 0) {
          detailParts.push(`Peak: ${s.peakMonths.map(m => MONTH_NAMES[m]).join(', ')} (${s.peakMultiplier}×)`);
        }
      }

      const notesTrim = s.notes ? s.notes.trim() : '';
      const notesCell = notesTrim
        ? `<span class="planner-notes" title="${escHtml(notesTrim)}">${escHtml(notesTrim.length > 40 ? notesTrim.slice(0, 38) + '…' : notesTrim)}</span>`
        : `<span style="color:var(--clr-text-muted);font-size:.8rem">—</span>`;

      return `<tr class="${s.enabled ? '' : 'income-disabled'}">
        <td>
          <label class="toggle-label" style="gap:.3rem">
            <input type="checkbox" class="income-toggle" data-id="${s.id}" ${s.enabled ? 'checked' : ''} />
          </label>
        </td>
        <td><strong>${escHtml(s.name)}</strong></td>
        <td>${typeIcon} ${typeLabel}</td>
        <td style="font-size:.82rem;color:var(--clr-text-muted)">${detailParts.join(' · ')}</td>
        <td class="amount-positive" style="font-weight:600">$${monthly.toFixed(2)}</td>
        <td style="font-size:.82rem;max-width:160px">${notesCell}</td>
        <td>
          <button class="btn btn-sm btn-secondary income-edit" data-id="${s.id}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger income-delete" data-id="${s.id}" title="Delete">✕</button>
        </td>
      </tr>`;
    }).join('');

    // Total row
    const totalMonthly = sources.filter(s => s.enabled).reduce((sum, s) => sum + monthlyIncomeForSource(s, calMonth), 0);
    tbody.innerHTML += `<tr class="budget-total-row">
      <td></td>
      <td><strong>Total Monthly Income</strong></td>
      <td></td>
      <td></td>
      <td class="amount-positive" style="font-weight:700;font-size:1.1rem">$${totalMonthly.toFixed(2)}</td>
      <td></td>
      <td></td>
    </tr>`;

    // Bind events
    tbody.querySelectorAll('.income-toggle').forEach(cb => {
      cb.addEventListener('change', () => {
        updateIncomeSource(cb.dataset.id, { enabled: cb.checked });
        renderIncomeSources();
        renderProjection();
      });
    });
    tbody.querySelectorAll('.income-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Remove this income source?')) {
          removeIncomeSource(btn.dataset.id);
          renderIncomeSources();
          renderProjection();
        }
      });
    });
    tbody.querySelectorAll('.income-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const source = getIncomeSources().find(s => s.id === btn.dataset.id);
        if (source) openIncomeForm(source);
      });
    });
  }

  /* ---- Render: Budget Baseline ---- */

  function renderBudgetBaseline() {
    const container = document.getElementById('planner-budget-baseline');
    if (!container) return;

    const bb = getBudgetBreakdown();

    if (bb.source === 'none') {
      container.innerHTML = `
        <div class="planner-budget-empty">
          <p>⚠️ No budget set and no transaction history found.</p>
          <p>Go to the <a href="#" class="planner-goto-budget">🎯 Budget tab</a> to set monthly spending targets, or import transactions first.</p>
        </div>`;
      bindBudgetLink(container);
      return;
    }

    const sourceLabel = bb.source === 'budget'
      ? '✅ Using your budget targets'
      : '⚠️ No budget set — using historical averages as fallback';
    const sourceClass = bb.source === 'budget' ? 'budget-source-ok' : 'budget-source-warn';

    let html = `
      <div class="planner-budget-header">
        <span class="${sourceClass}">${sourceLabel}</span>
        <a href="#" class="planner-goto-budget btn btn-sm btn-secondary">🎯 Edit Budget</a>
      </div>
      <div class="planner-budget-categories">`;

    for (const cat of bb.categories) {
      if (cat.target <= 0) continue;
      const pct = bb.total > 0 ? ((cat.target / bb.total) * 100).toFixed(0) : 0;
      html += `
        <div class="planner-budget-cat-row">
          <span class="planner-budget-cat-name">${escHtml(cat.category)}</span>
          <div class="planner-budget-cat-bar-wrap">
            <div class="planner-budget-cat-bar" style="width:${pct}%"></div>
          </div>
          <span class="planner-budget-cat-amt">$${cat.target.toFixed(2)}</span>
        </div>`;
    }

    html += `
      </div>
      <div class="planner-budget-total">
        <strong>Total Monthly Budget Expenses:</strong>
        <span class="amount-negative" style="font-weight:700;font-size:1.1rem">$${bb.total.toFixed(2)}</span>
      </div>`;

    container.innerHTML = html;
    bindBudgetLink(container);
  }

  function bindBudgetLink(container) {
    container.querySelectorAll('.planner-goto-budget').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Navigate to budget tab
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const budgetBtn = document.querySelector('.nav-btn[data-tab="budget"]');
        if (budgetBtn) budgetBtn.classList.add('active');
        document.getElementById('tab-budget').classList.add('active');
        // Trigger budget refresh
        Budget.renderBudgetTable();
        Budget.renderBudgetChart();
      });
    });
  }

  /* ---- Render: Scenario Expenses Table ---- */

  function renderScenarioExpenses() {
    const expenses = getScenarioExpenses();
    const tbody = document.getElementById('planner-expense-tbody');
    if (!tbody) return;

    if (expenses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--clr-text-muted);padding:2rem">No scenario expenses. Add things like car payments, rent increases, etc. to model.</td></tr>';
      return;
    }

    tbody.innerHTML = expenses.map(e => {
      const startLabel = e.startMonth === 0 ? 'Now' : `Month ${e.startMonth}`;
      const endLabel = e.endMonth == null ? 'Ongoing' : `Month ${e.endMonth}`;
      const notesTrim = e.notes ? e.notes.trim() : '';
      const notesCell = notesTrim
        ? `<span class="planner-notes" title="${escHtml(notesTrim)}">${escHtml(notesTrim.length > 40 ? notesTrim.slice(0, 38) + '…' : notesTrim)}</span>`
        : `<span style="color:var(--clr-text-muted);font-size:.8rem">—</span>`;
      return `<tr class="${e.enabled ? '' : 'income-disabled'}">
        <td>
          <label class="toggle-label" style="gap:.3rem">
            <input type="checkbox" class="expense-toggle" data-id="${e.id}" ${e.enabled ? 'checked' : ''} />
          </label>
        </td>
        <td><strong>${escHtml(e.name)}</strong></td>
        <td>${e.category || 'Other'}</td>
        <td class="amount-negative" style="font-weight:600">$${parseFloat(e.amount).toFixed(2)}</td>
        <td>${startLabel}</td>
        <td>${endLabel}</td>
        <td style="font-size:.82rem;max-width:160px">${notesCell}</td>
        <td>
          <button class="btn btn-sm btn-secondary expense-edit" data-id="${e.id}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger expense-delete" data-id="${e.id}" title="Delete">✕</button>
        </td>
      </tr>`;
    }).join('');

    // Total active scenario expenses
    const totalActive = expenses.filter(e => e.enabled).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    tbody.innerHTML += `<tr class="budget-total-row">
      <td></td>
      <td><strong>Total Scenario Expenses</strong></td>
      <td></td>
      <td class="amount-negative" style="font-weight:700;font-size:1.1rem">$${totalActive.toFixed(2)}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>`;

    // Bind events
    tbody.querySelectorAll('.expense-toggle').forEach(cb => {
      cb.addEventListener('change', () => {
        updateScenarioExpense(cb.dataset.id, { enabled: cb.checked });
        renderScenarioExpenses();
        renderProjection();
      });
    });
    tbody.querySelectorAll('.expense-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Remove this scenario expense?')) {
          removeScenarioExpense(btn.dataset.id);
          renderScenarioExpenses();
          renderProjection();
        }
      });
    });
    tbody.querySelectorAll('.expense-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const expense = getScenarioExpenses().find(e => e.id === btn.dataset.id);
        if (expense) openExpenseForm(expense);
      });
    });
  }

  /* ---- Render: Projection Summary & Chart ---- */

  function renderProjection() {
    const horizonSelect = document.getElementById('planner-horizon');
    const balanceInput = document.getElementById('planner-starting-balance');
    const months = parseInt(horizonSelect?.value) || 12;
    const startingBalance = parseFloat(balanceInput?.value) || 0;

    const projection = projectSavings(months, startingBalance);
    const comparison = getIncomeComparison();

    // Update KPIs
    const affordableEl = document.getElementById('planner-kpi-affordable');
    const totalIncomeEl = document.getElementById('planner-kpi-income');
    const totalExpenseEl = document.getElementById('planner-kpi-expenses');
    const netEl = document.getElementById('planner-kpi-net');
    const endBalanceEl = document.getElementById('planner-kpi-end-balance');

    if (projection.length > 0) {
      const firstMonth = projection[0];
      const lastMonth = projection[projection.length - 1];
      const avgIncome = projection.reduce((s, p) => s + p.income, 0) / projection.length;
      const avgExpense = projection.reduce((s, p) => s + p.totalExpenses, 0) / projection.length;
      const avgNet = avgIncome - avgExpense;

      if (affordableEl) affordableEl.textContent = '$' + maxAffordableExpense().toFixed(2);
      if (totalIncomeEl) totalIncomeEl.textContent = '$' + avgIncome.toFixed(2);
      if (totalExpenseEl) totalExpenseEl.textContent = '$' + avgExpense.toFixed(2);
      if (netEl) {
        netEl.textContent = '$' + avgNet.toFixed(2);
        netEl.className = 'kpi-value ' + (avgNet >= 0 ? 'amount-positive' : 'amount-negative');
      }
      if (endBalanceEl) {
        endBalanceEl.textContent = '$' + lastMonth.cumulativeSavings.toFixed(2);
        endBalanceEl.className = 'kpi-value ' + (lastMonth.cumulativeSavings >= 0 ? 'amount-positive' : 'amount-negative');
      }
    }

    // Render projection table
    renderProjectionTable(projection);

    // Render charts
    renderSavingsProjectionChart(projection);
    renderIncomeComparisonChart(comparison);
    renderMonthlyBreakdownChart(projection);
  }

  function renderProjectionTable(projection) {
    const tbody = document.getElementById('planner-projection-tbody');
    if (!tbody) return;

    tbody.innerHTML = projection.map(p => {
      const netClass = p.netSavings >= 0 ? 'amount-positive' : 'amount-negative';
      const cumClass = p.cumulativeSavings >= 0 ? 'amount-positive' : 'amount-negative';
      return `<tr>
        <td>${formatMonthLabel(p.monthLabel)}</td>
        <td class="amount-positive">$${p.income.toFixed(2)}</td>
        <td class="amount-negative">$${p.budgetExpenses.toFixed(2)}</td>
        <td class="amount-negative">${p.scenarioExpenses > 0 ? '$' + p.scenarioExpenses.toFixed(2) : '—'}</td>
        <td class="${netClass}" style="font-weight:600">$${p.netSavings.toFixed(2)}</td>
        <td class="${cumClass}" style="font-weight:600">$${p.cumulativeSavings.toFixed(2)}</td>
      </tr>`;
    }).join('');
  }

  /* ---- Charts ---- */

  function renderSavingsProjectionChart(projection) {
    const canvas = document.getElementById('chart-planner-savings');
    if (!canvas) return;

    const labels = projection.map(p => formatMonthLabel(p.monthLabel));
    const cumData = projection.map(p => p.cumulativeSavings);
    const netData = projection.map(p => p.netSavings);

    Charts.renderPlannerSavings(labels, cumData, netData);
  }

  function renderIncomeComparisonChart(comparison) {
    const canvas = document.getElementById('chart-planner-income-compare');
    if (!canvas) return;
    Charts.renderPlannerIncomeComparison(comparison);
  }

  function renderMonthlyBreakdownChart(projection) {
    const canvas = document.getElementById('chart-planner-breakdown');
    if (!canvas) return;

    const labels = projection.map(p => formatMonthLabel(p.monthLabel));
    const incomeData = projection.map(p => p.income);
    const budgetData = projection.map(p => p.budgetExpenses);
    const scenarioData = projection.map(p => p.scenarioExpenses);

    Charts.renderPlannerBreakdown(labels, incomeData, budgetData, scenarioData);
  }

  /* ---- Income Form Helpers ---- */

  function openIncomeForm(source) {
    const form = document.getElementById('planner-income-form');
    if (!form) return;

    form.dataset.editId = source ? source.id : '';
    document.getElementById('income-name').value = source ? source.name : '';
    document.getElementById('income-type').value = source ? source.type : 'salary';
    document.getElementById('income-notes').value = source ? (source.notes || '') : '';

    updateIncomeFormFields(source?.type || 'salary', source);
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateIncomeFormFields(type, source) {
    document.getElementById('income-salary-fields').classList.toggle('hidden', type !== 'salary');
    document.getElementById('income-hourly-fields').classList.toggle('hidden', type !== 'hourly');
    document.getElementById('income-contract-fields').classList.toggle('hidden', type !== 'contract');
    document.getElementById('income-tips-fields').classList.toggle('hidden', type !== 'tips');

    if (source) {
      if (type === 'salary') {
        document.getElementById('income-salary-amount').value = source.amount || '';
        document.getElementById('income-salary-frequency').value = source.frequency || 'biweekly';
      } else if (type === 'hourly') {
        document.getElementById('income-hourly-rate').value = source.hourlyRate || '';
        document.getElementById('income-hourly-hours').value = source.hoursPerWeek || '';
        const nf = source.netFactor != null ? source.netFactor : 1;
        document.getElementById('income-hourly-net-factor').value = nf;
        document.getElementById('income-hourly-net-factor').dispatchEvent(new Event('input'));
      } else if (type === 'contract') {
        document.getElementById('income-contract-amount').value = source.avgAmount || '';
        document.getElementById('income-contract-frequency').value = source.monthlyOccurrences || '';
      } else if (type === 'tips') {
        document.getElementById('income-tips-min').value = source.minPerShift || '';
        document.getElementById('income-tips-max').value = source.maxPerShift || '';
        document.getElementById('income-tips-shifts').value = source.shiftsPerMonth || '';
        document.getElementById('income-tips-peak-multiplier').value = source.peakMultiplier || 1.5;
        // Set peak month checkboxes
        document.querySelectorAll('.peak-month-cb').forEach(cb => {
          cb.checked = (source.peakMonths || []).includes(parseInt(cb.value));
        });
      }
    }
  }

  function saveIncomeFromForm() {
    const form = document.getElementById('planner-income-form');
    const editId = form.dataset.editId;
    const name = document.getElementById('income-name').value.trim();
    const type = document.getElementById('income-type').value;

    if (!name) { alert('Please enter a name for this income source.'); return; }

    const source = { name, type };
    source.notes = (document.getElementById('income-notes')?.value || '').trim();

    if (type === 'salary') {
      source.amount = parseFloat(document.getElementById('income-salary-amount').value) || 0;
      source.frequency = document.getElementById('income-salary-frequency').value;
    } else if (type === 'hourly') {
      source.hourlyRate = parseFloat(document.getElementById('income-hourly-rate').value) || 0;
      source.hoursPerWeek = parseFloat(document.getElementById('income-hourly-hours').value) || 0;
      source.netFactor = parseFloat(document.getElementById('income-hourly-net-factor').value);
      if (isNaN(source.netFactor) || source.netFactor <= 0) source.netFactor = 1;
    } else if (type === 'contract') {
      source.avgAmount = parseFloat(document.getElementById('income-contract-amount').value) || 0;
      source.monthlyOccurrences = parseFloat(document.getElementById('income-contract-frequency').value) || 0;
    } else if (type === 'tips') {
      source.minPerShift = parseFloat(document.getElementById('income-tips-min').value) || 0;
      source.maxPerShift = parseFloat(document.getElementById('income-tips-max').value) || 0;
      source.shiftsPerMonth = parseFloat(document.getElementById('income-tips-shifts').value) || 0;
      source.peakMultiplier = parseFloat(document.getElementById('income-tips-peak-multiplier').value) || 1;
      source.peakMonths = [];
      document.querySelectorAll('.peak-month-cb:checked').forEach(cb => {
        source.peakMonths.push(parseInt(cb.value));
      });
    }

    if (editId) {
      updateIncomeSource(editId, source);
    } else {
      addIncomeSource(source);
    }

    form.classList.add('hidden');
    form.dataset.editId = '';
    renderIncomeSources();
    renderProjection();
  }

  /* ---- Expense Form Helpers ---- */

  function openExpenseForm(expense) {
    const form = document.getElementById('planner-expense-form');
    if (!form) return;

    form.dataset.editId = expense ? expense.id : '';
    document.getElementById('expense-name').value = expense ? expense.name : '';
    document.getElementById('expense-amount').value = expense ? expense.amount : '';
    document.getElementById('expense-category').value = expense ? (expense.category || 'Other') : 'Other';
    document.getElementById('expense-start').value = expense ? (expense.startMonth || 0) : 0;
    document.getElementById('expense-end').value = expense ? (expense.endMonth != null ? expense.endMonth : '') : '';
    document.getElementById('expense-notes').value = expense ? (expense.notes || '') : '';

    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function saveExpenseFromForm() {
    const form = document.getElementById('planner-expense-form');
    const editId = form.dataset.editId;
    const name = document.getElementById('expense-name').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
    const category = document.getElementById('expense-category').value;
    const startMonth = parseInt(document.getElementById('expense-start').value) || 0;
    const endVal = document.getElementById('expense-end').value;
    const endMonth = endVal !== '' ? parseInt(endVal) : null;

    if (!name) { alert('Please enter a name for this expense.'); return; }
    if (amount <= 0) { alert('Please enter a positive monthly amount.'); return; }

    const notes = (document.getElementById('expense-notes')?.value || '').trim();
    const expense = { name, amount, category, startMonth, endMonth, notes };

    if (editId) {
      updateScenarioExpense(editId, expense);
    } else {
      addScenarioExpense(expense);
    }

    form.classList.add('hidden');
    form.dataset.editId = '';
    renderScenarioExpenses();
    renderProjection();
  }

  /* ---- Wage Scenario Calculator ---- */

  /**
   * Given a known current situation and a proposed new rate/hours,
   * compute the projected net monthly income.
   * @param {number} currentRate  - current hourly rate
   * @param {number} currentHours - current hours per week
   * @param {number} knownNetMonthly - actual known net monthly income (take-home)
   * @param {number} newRate  - proposed new hourly rate
   * @param {number} newHours - proposed new hours per week
   */
  function computeWageScenario(currentRate, currentHours, knownNetMonthly, newRate, newHours) {
    const WEEKLY_TO_MONTHLY = 52 / 12;
    const currentGrossMonthly = currentRate * currentHours * WEEKLY_TO_MONTHLY;
    const impliedNetFactor = currentGrossMonthly > 0 ? (knownNetMonthly / currentGrossMonthly) : 1;
    const capped = Math.min(Math.max(impliedNetFactor, 0.01), 1.5); // sanity-cap
    const newGrossMonthly = newRate * newHours * WEEKLY_TO_MONTHLY;
    const newNetMonthly = newGrossMonthly * capped;
    const annualGross = newGrossMonthly * 12;
    const annualNet = newNetMonthly * 12;
    const monthlyDiff = newNetMonthly - (knownNetMonthly || 0);
    const annualDiff = monthlyDiff * 12;
    return {
      currentGrossMonthly,
      currentNetMonthly: knownNetMonthly,
      impliedNetFactor: capped,
      newGrossMonthly,
      newNetMonthly,
      annualGross,
      annualNet,
      monthlyDiff,
      annualDiff
    };
  }

  function renderWageCalculator() {
    const el = document.getElementById('wage-calc-result');
    if (!el) return;

    const curRate  = parseFloat(document.getElementById('wage-current-rate')?.value) || 0;
    const curHours = parseFloat(document.getElementById('wage-current-hours')?.value) || 0;
    const curNet   = parseFloat(document.getElementById('wage-current-net')?.value) || 0;
    const newRate  = parseFloat(document.getElementById('wage-new-rate')?.value) || curRate;
    const newHours = parseFloat(document.getElementById('wage-new-hours')?.value) || curHours;

    if (curRate <= 0 || curHours <= 0) {
      el.innerHTML = '<p style="color:var(--clr-text-muted)">Enter your current rate and hours to see projections.</p>';
      return;
    }

    const r = computeWageScenario(curRate, curHours, curNet, newRate || curRate, newHours || curHours);
    const pctChange = r.currentNetMonthly > 0 ? ((r.monthlyDiff / r.currentNetMonthly) * 100) : 0;
    const arrow = r.monthlyDiff >= 0 ? '▲' : '▼';
    const diffColor = r.monthlyDiff >= 0 ? 'var(--clr-income)' : 'var(--clr-expense)';

    el.innerHTML = `
      <div class="wage-scenario-grid">
        <div class="wage-scenario-card">
          <div class="wage-label">Current Net/Month</div>
          <div class="wage-value">${fmt(r.currentNetMonthly)}</div>
          <div class="wage-sub">Gross: ${fmt(r.currentGrossMonthly)} · Net factor: ${(r.impliedNetFactor * 100).toFixed(1)}%</div>
        </div>
        <div class="wage-scenario-card wage-scenario-new">
          <div class="wage-label">Projected Net/Month at new rate</div>
          <div class="wage-value">${fmt(r.newNetMonthly)}</div>
          <div class="wage-sub">Gross: ${fmt(r.newGrossMonthly)} · Annual net: ${fmt(r.annualNet)}</div>
        </div>
        <div class="wage-scenario-card wage-scenario-diff" style="border-color:${diffColor}">
          <div class="wage-label">Monthly Difference</div>
          <div class="wage-value" style="color:${diffColor}">${arrow} ${fmt(Math.abs(r.monthlyDiff))}</div>
          <div class="wage-sub">Annual: ${arrow} ${fmt(Math.abs(r.annualDiff))} (${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%)</div>
        </div>
      </div>`;
  }

  function fmt(v) { return '$' + (v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---- Full Tab Render ---- */

  function render() {
    renderBudgetBaseline();
    renderIncomeSources();
    renderScenarioExpenses();
    renderProjection();
  }

  /* ---- Escape HTML (use shared if available) ---- */
  function escHtml(str) {
    if (typeof window.escHtml === 'function') return window.escHtml(str);
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  return {
    // Data access
    getIncomeSources, saveIncomeSources,
    getScenarioExpenses, saveScenarioExpenses,
    getSettings, saveSettings,
    // CRUD
    addIncomeSource, updateIncomeSource, removeIncomeSource,
    addScenarioExpense, updateScenarioExpense, removeScenarioExpense,
    // Calculations
    monthlyIncomeForSource, totalMonthlyIncome,
    getHistoricalIncome, getHistoricalExpenses,
    getMonthlyBudgetTotal, getScenarioExpenseForMonth,
    projectSavings, getIncomeComparison, getIncomeBreakdown,
    maxAffordableExpense,
    computeWageScenario,
    // Rendering
    render, renderBudgetBaseline, renderIncomeSources, renderScenarioExpenses, renderProjection,
    openIncomeForm, saveIncomeFromForm, updateIncomeFormFields,
    openExpenseForm, saveExpenseFromForm,
    renderWageCalculator,
    // Constants
    INCOME_TYPE_LABELS, MONTH_NAMES, formatMonthLabel
  };
})();
