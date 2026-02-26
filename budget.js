/* ============================================
   Budget — Target setting & tracking
   ============================================ */

const Budget = (() => {

  /** Auto-generate budget from average spending with a default reduction */
  function autoGenerate(reductionPercent = 10) {
    const breakdown = Analysis.getCategoryBreakdown();
    const budget = {};

    for (const cat of breakdown) {
      if (cat.category === 'Income' || cat.category === 'Transfer') continue;
      const target = cat.avgPerMonth * (1 - reductionPercent / 100);
      budget[cat.category] = {
        target: Math.round(target * 100) / 100,
        avgSpend: Math.round(cat.avgPerMonth * 100) / 100
      };
    }

    DataManager.saveBudget(budget);
    return budget;
  }

  /** Render budget table */
  function renderBudgetTable() {
    const budget = DataManager.getBudget();
    const breakdown = Analysis.getCategoryBreakdown();
    const tbody = document.getElementById('budget-tbody');
    const categories = breakdown.filter(c => c.category !== 'Income' && c.category !== 'Transfer');

    let html = '';
    let totalAvg = 0, totalTarget = 0, totalDiff = 0;

    for (const cat of categories) {
      const budgetEntry = budget[cat.category] || { target: 0, avgSpend: cat.avgPerMonth };
      const target = budgetEntry.target || 0;
      const diff = target - cat.avgPerMonth;
      const status = target > 0 ? (cat.avgPerMonth <= target ? '✅ On Track' : '⚠️ Over Budget') : '—';
      const statusClass = cat.avgPerMonth <= target ? 'budget-under' : 'budget-over';

      totalAvg += cat.avgPerMonth;
      totalTarget += target;
      totalDiff += diff;

      html += `<tr>
        <td>${cat.category}</td>
        <td>$${cat.avgPerMonth.toFixed(2)}</td>
        <td><input type="number" step="0.01" min="0" class="budget-input" data-category="${cat.category}" value="${target.toFixed(2)}" /></td>
        <td class="${statusClass}">$${diff.toFixed(2)}</td>
        <td class="${statusClass}">${status}</td>
      </tr>`;
    }

    tbody.innerHTML = html;

    // Totals
    document.getElementById('budget-total-avg').textContent = `$${totalAvg.toFixed(2)}`;
    document.getElementById('budget-total-target').textContent = `$${totalTarget.toFixed(2)}`;
    document.getElementById('budget-total-diff').textContent = `$${totalDiff.toFixed(2)}`;
    document.getElementById('budget-total-diff').className = totalDiff >= 0 ? 'budget-under' : 'budget-over';

    // Add input listeners
    tbody.querySelectorAll('.budget-input').forEach(input => {
      input.addEventListener('change', () => {
        const cat = input.dataset.category;
        const val = parseFloat(input.value) || 0;
        const currentBudget = DataManager.getBudget();
        const existing = currentBudget[cat] || {};
        currentBudget[cat] = { ...existing, target: val };
        DataManager.saveBudget(currentBudget);
        renderBudgetTable(); // Re-render to update diffs
      });
    });
  }

  /** Save all budget inputs */
  function saveFromInputs() {
    const inputs = document.querySelectorAll('.budget-input');
    const budget = DataManager.getBudget();
    inputs.forEach(input => {
      const cat = input.dataset.category;
      const val = parseFloat(input.value) || 0;
      const existing = budget[cat] || {};
      budget[cat] = { ...existing, target: val };
    });
    DataManager.saveBudget(budget);
  }

  /** Render budget comparison chart (most recent month) */
  function renderBudgetChart() {
    const budget = DataManager.getBudget();
    const months = DataManager.getMonths();
    if (months.length === 0) return;

    const latestMonth = months[months.length - 1];
    const txs = DataManager.filter({ month: latestMonth });
    const expenses = txs.filter(t => t.amount > 0 && t.category !== 'Income' && t.category !== 'Transfer');

    // Sum by category for latest month
    const actuals = {};
    for (const tx of expenses) {
      actuals[tx.category] = (actuals[tx.category] || 0) + tx.amount;
    }

    const categories = Object.keys(budget).filter(c => budget[c].target > 0);
    const budgetAmounts = categories.map(c => budget[c].target);
    const actualAmounts = categories.map(c => actuals[c] || 0);

    Charts.renderBudgetComparison(categories, budgetAmounts, actualAmounts);
  }

  return {
    autoGenerate,
    renderBudgetTable,
    saveFromInputs,
    renderBudgetChart
  };
})();
