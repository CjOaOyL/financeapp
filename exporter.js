/* ============================================
   Exporter — CSV export & full HTML report
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

  /** Export full analysis report as HTML */
  function exportReport() {
    const kpis = Analysis.getKPIs();
    const catBreakdown = Analysis.getCategoryBreakdown();
    const merchants = Analysis.getMerchantBreakdown().slice(0, 20);
    const monthlyData = Analysis.getMonthlyBreakdown();
    const recommendations = Analysis.getSavingsRecommendations();
    const budget = DataManager.getBudget();
    const txCount = DataManager.getAll().length;

    if (txCount === 0) { alert('No data to export. Import transactions first.'); return; }

    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Finance Report — ${now}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #1a1a2e; line-height: 1.6; }
  h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: .5rem; }
  h2 { color: #374151; margin-top: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: .25rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: .9rem; }
  th, td { padding: .5rem .75rem; border: 1px solid #e5e7eb; text-align: left; }
  th { background: #f3f4f6; font-weight: 600; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
  .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center; }
  .kpi .label { font-size: .8rem; color: #6b7280; }
  .kpi .value { font-size: 1.4rem; font-weight: 700; }
  .positive { color: #10b981; }
  .negative { color: #ef4444; }
  .rec-card { background: #f9fafb; border-left: 4px solid #6366f1; padding: 1rem; margin: .75rem 0; border-radius: 4px; }
  .rec-card .title { font-weight: 600; }
  .rec-card .savings { color: #10b981; font-weight: 600; }
  @media print { body { max-width: 100%; } }
</style></head><body>
<h1>Personal Finance Report</h1>
<p>Generated: ${now} | Transactions: ${txCount} | Period: ${monthlyData.length > 0 ? monthlyData[0].month + ' to ' + monthlyData[monthlyData.length - 1].month : 'N/A'}</p>

<h2>Key Performance Indicators</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="label">Total Spending</div><div class="value negative">$${kpis.totalExpenses.toFixed(2)}</div></div>
  <div class="kpi"><div class="label">Total Income</div><div class="value positive">$${kpis.totalIncome.toFixed(2)}</div></div>
  <div class="kpi"><div class="label">Net Cash Flow</div><div class="value ${kpis.netCashFlow >= 0 ? 'positive' : 'negative'}">$${kpis.netCashFlow.toFixed(2)}</div></div>
  <div class="kpi"><div class="label">Monthly Average Spend</div><div class="value">$${kpis.avgMonthly.toFixed(2)}</div></div>
  <div class="kpi"><div class="label">Highest Month</div><div class="value">${kpis.highMonth}<br>$${kpis.highAmount.toFixed(2)}</div></div>
  <div class="kpi"><div class="label">Lowest Month</div><div class="value">${kpis.lowMonth}<br>$${kpis.lowAmount.toFixed(2)}</div></div>
</div>

<h2>Monthly Breakdown</h2>
<table><thead><tr><th>Month</th><th>Expenses</th><th>Income</th><th>Net</th></tr></thead><tbody>`;

    for (const m of monthlyData) {
      const net = m.income - m.expenses;
      html += `<tr><td>${m.month}</td><td>$${m.expenses.toFixed(2)}</td><td>$${m.income.toFixed(2)}</td><td class="${net >= 0 ? 'positive' : 'negative'}">$${net.toFixed(2)}</td></tr>`;
    }

    html += `</tbody></table>

<h2>Spending by Category</h2>
<table><thead><tr><th>Category</th><th>Total</th><th>% of Spending</th><th>Avg/Month</th><th># Transactions</th></tr></thead><tbody>`;

    for (const c of catBreakdown) {
      html += `<tr><td>${c.category}</td><td>$${c.total.toFixed(2)}</td><td>${c.percent.toFixed(1)}%</td><td>$${c.avgPerMonth.toFixed(2)}</td><td>${c.count}</td></tr>`;
    }

    html += `</tbody></table>

<h2>Top 20 Merchants</h2>
<table><thead><tr><th>Merchant</th><th>Total Spent</th><th># Transactions</th><th>Avg/Transaction</th><th>Category</th></tr></thead><tbody>`;

    for (const m of merchants) {
      html += `<tr><td>${escHtml(m.name)}</td><td>$${m.total.toFixed(2)}</td><td>${m.count}</td><td>$${m.avgPerTx.toFixed(2)}</td><td>${m.category}</td></tr>`;
    }

    html += `</tbody></table>

<h2>Savings Recommendations</h2>`;

    const totalSavings = recommendations.reduce((s, r) => s + r.potentialSavings, 0);
    html += `<p><strong>Total potential monthly savings: <span class="positive">$${totalSavings.toFixed(2)}</span></strong> (annual: $${(totalSavings * 12).toFixed(2)})</p>`;

    for (const r of recommendations) {
      html += `<div class="rec-card">
        <div class="title">${r.icon} ${r.title}</div>
        <p>${r.description}</p>
        <div class="savings">Potential savings: $${r.potentialSavings.toFixed(2)}/month</div>
      </div>`;
    }

    // Budget section
    const budgetKeys = Object.keys(budget);
    if (budgetKeys.length > 0) {
      html += `<h2>Budget Targets</h2>
<table><thead><tr><th>Category</th><th>Budget Target</th><th>Avg Actual</th><th>Difference</th></tr></thead><tbody>`;
      let bTotal = 0, aTotal = 0;
      for (const cat of budgetKeys) {
        const b = budget[cat];
        const diff = b.target - (b.avgSpend || 0);
        bTotal += b.target;
        aTotal += (b.avgSpend || 0);
        html += `<tr><td>${cat}</td><td>$${b.target.toFixed(2)}</td><td>$${(b.avgSpend || 0).toFixed(2)}</td><td class="${diff >= 0 ? 'positive' : 'negative'}">$${diff.toFixed(2)}</td></tr>`;
      }
      html += `<tr style="font-weight:700"><td>Total</td><td>$${bTotal.toFixed(2)}</td><td>$${aTotal.toFixed(2)}</td><td class="${bTotal-aTotal >= 0 ? 'positive' : 'negative'}">$${(bTotal-aTotal).toFixed(2)}</td></tr>`;
      html += `</tbody></table>`;
    }

    html += `
<hr style="margin-top:2rem">
<p style="font-size:.8rem;color:#6b7280;text-align:center">Generated by Personal Finance Dashboard</p>
</body></html>`;

    downloadFile('finance_report.html', html, 'text/html');
  }

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

  return { exportCSV, exportReport };
})();
