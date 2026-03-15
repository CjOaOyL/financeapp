/* ============================================
   Charts — All Chart.js chart rendering
   ============================================ */

const Charts = (() => {
  // Color palette
  const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
    '#e11d48', '#0ea5e9', '#84cc16', '#d946ef', '#64748b',
    '#fb923c', '#22d3ee'
  ];

  const chartInstances = {};

  /* ---- Helpers ---- */
  /** Simple rolling average; returns array of same length with nulls for positions without full window */
  function rollingAverage(arr, windowSize) {
    if (!Array.isArray(arr) || windowSize <= 1) return arr.map(v => v == null ? null : v);
    const out = new Array(arr.length).fill(null);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = typeof arr[i] === 'number' ? arr[i] : 0;
      sum += v;
      if (i >= windowSize) sum -= (typeof arr[i - windowSize] === 'number' ? arr[i - windowSize] : 0);
      if (i >= windowSize - 1) {
        out[i] = sum / windowSize;
      }
    }
    return out;
  }

  /**
   * Render a line chart from filtered transactions grouped by date.
   * Shows daily expense total as a line and income as a separate line.
   */
  function renderImportLine(transactions) {
    if (!transactions || transactions.length === 0) {
      const el = document.getElementById('chart-import-line');
      if (el) { const parent = el.parentElement; if (chartInstances['chart-import-line']) { chartInstances['chart-import-line'].destroy(); delete chartInstances['chart-import-line']; } }
      return;
    }

    // Group by date
    const expenseByDate = {};
    const incomeByDate = {};
    for (const tx of transactions) {
      const d = tx.date;
      if (tx.category === 'Income' || tx._isIncome) {
        incomeByDate[d] = (incomeByDate[d] || 0) + tx.amount;
      } else {
        expenseByDate[d] = (expenseByDate[d] || 0) + tx.amount;
      }
    }

    // Merge and sort all dates
    const allDates = [...new Set([...Object.keys(expenseByDate), ...Object.keys(incomeByDate)])].sort();

    // Build cumulative running total and daily series
    let cumExpense = 0;
    const expenseDaily = allDates.map(d => expenseByDate[d] || 0);
    const expenseData = expenseDaily.map(v => { cumExpense += v; return cumExpense; });
    let cumIncome = 0;
    const incomeDaily = allDates.map(d => incomeByDate[d] || 0);
    const incomeData = incomeDaily.map(v => { cumIncome += v; return cumIncome; });

    // Format date labels
    const labels = allDates.map(d => {
      const parts = d.split('-');
      return `${parts[1]}/${parts[2]}`;
    });

    const datasets = [
      {
        label: 'Cumulative Expenses',
        data: expenseData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ];

    if (cumIncome > 0) {
      datasets.push({
        label: 'Cumulative Income',
        data: incomeData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6
      });
    }

    // Add rolling average of expenses (30-day default)
    try {
      const rollDays = 30;
      const expenseRoll = rollingAverage(expenseDaily, rollDays);
      // Only include rolling series if there's enough data
      if (expenseRoll.some(v => v != null)) {
        datasets.push({
          label: `${rollDays}-day Rolling Avg (Expenses)`,
          data: expenseRoll,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.06)',
          fill: false,
          tension: 0.3,
          borderDash: [4,3],
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: undefined
        });
      }
    } catch (e) { /* non-fatal */ }

    getOrCreate('chart-import-line', {
      type: 'line',
      data: { labels, datasets },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          legend: { labels: { color: '#e4e6ef', font: { size: 11 } } },
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: { label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}` }
          }
        }
      }
    });
  }

  function getOrCreate(canvasId, config) {
    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    chartInstances[canvasId] = new Chart(ctx, config);
    return chartInstances[canvasId];
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: '#e4e6ef', font: { size: 11 } } },
      tooltip: { backgroundColor: '#1a1d27', borderColor: '#2d3244', borderWidth: 1 }
    },
    scales: {
      x: { ticks: { color: '#8b8fa3' }, grid: { color: '#2d3244' } },
      y: { ticks: { color: '#8b8fa3', callback: v => '$' + v.toLocaleString() }, grid: { color: '#2d3244' } }
    }
  };

  function pieOptions() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'right', labels: { color: '#e4e6ef', font: { size: 11 }, padding: 12 } },
        tooltip: {
          backgroundColor: '#1a1d27', borderColor: '#2d3244', borderWidth: 1,
          callbacks: { label: ctx => `${ctx.label}: $${ctx.parsed.toFixed(2)} (${((ctx.parsed / ctx.dataset.data.reduce((a,b)=>a+b,0)) * 100).toFixed(1)}%)` }
        }
      }
    };
  }

  /* ---- Overview Charts ---- */

  function renderOverviewBar(monthlyData) {
    const labels = monthlyData.map(d => d.month);
    getOrCreate('chart-overview-bar', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Spending',
            data: monthlyData.map(d => d.expenses),
            backgroundColor: '#ef4444cc',
            borderColor: '#ef4444',
            borderWidth: 1
          },
          {
            label: 'Income',
            data: monthlyData.map(d => d.income),
            backgroundColor: '#10b981cc',
            borderColor: '#10b981',
            borderWidth: 1
          }
        ]
      },
      options: { ...defaultOptions }
    });
  }

  function renderOverviewPie(categoryTotals) {
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    getOrCreate('chart-overview-pie', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: PALETTE.slice(0, labels.length), borderWidth: 0 }]
      },
      options: pieOptions()
    });
  }

  /* ---- Category Charts ---- */

  function renderCategoryPie(categoryTotals) {
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    getOrCreate('chart-cat-pie', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: PALETTE.slice(0, labels.length), borderWidth: 0 }]
      },
      options: pieOptions()
    });
  }

  function renderCategoryBar(categoryTotals) {
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    getOrCreate('chart-cat-bar', {
      type: 'bar',
      data: {
        labels: sorted.map(s => s[0]),
        datasets: [{
          label: 'Total Spent',
          data: sorted.map(s => s[1]),
          backgroundColor: PALETTE,
          borderWidth: 0
        }]
      },
      options: {
        ...defaultOptions,
        indexAxis: 'y',
        plugins: { ...defaultOptions.plugins, legend: { display: false } }
      }
    });
  }

  /* ---- Trend Charts ---- */

  function renderTrendsLine(monthlyData) {
    const labels = monthlyData.map(d => d.month);
    const spending = monthlyData.map(d => d.expenses);

    const datasets = [
      {
        label: 'Monthly Spending',
        data: spending,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,.15)',
        fill: true,
        tension: .3,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ];

    try {
      const rollWindow = 3; // 3-month rolling average
      const roll = rollingAverage(spending, rollWindow);
      if (roll.some(v => v != null)) {
        datasets.push({
          type: 'line',
          label: `${rollWindow}-mo Rolling Avg (Spending)`,
          data: roll,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.06)',
          borderDash: [4,2],
          fill: false,
          tension: .3,
          pointRadius: 0,
          spanGaps: true
        });
      }
    } catch (e) { /* non-fatal */ }

    getOrCreate('chart-trends-line', {
      type: 'line',
      data: { labels, datasets },
      options: defaultOptions
    });
  }

  function renderTrendsStacked(months, categoryMonthlyData) {
    const datasets = [];
    let colorIdx = 0;
    for (const [cat, values] of Object.entries(categoryMonthlyData)) {
      datasets.push({
        label: cat,
        data: values,
        backgroundColor: PALETTE[colorIdx % PALETTE.length] + 'cc',
        borderWidth: 0
      });
      colorIdx++;
    }

    getOrCreate('chart-trends-stacked', {
      type: 'bar',
      data: { labels: months, datasets },
      options: {
        ...defaultOptions,
        scales: {
          ...defaultOptions.scales,
          x: { ...defaultOptions.scales.x, stacked: true },
          y: { ...defaultOptions.scales.y, stacked: true }
        }
      }
    });
  }

  function renderTrendsDelta(monthlyData) {
    const deltas = [];
    const labels = [];
    for (let i = 1; i < monthlyData.length; i++) {
      labels.push(monthlyData[i].month);
      deltas.push(monthlyData[i].expenses - monthlyData[i-1].expenses);
    }

    getOrCreate('chart-trends-delta', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Month-over-Month Change',
          data: deltas,
          backgroundColor: deltas.map(d => d > 0 ? '#ef4444cc' : '#10b981cc'),
          borderWidth: 0
        }]
      },
      options: { ...defaultOptions, plugins: { ...defaultOptions.plugins, legend: { display: false } } }
    });
  }

  /* ---- Merchant Chart ---- */

  function renderMerchantBar(merchantData) {
    const top = merchantData.slice(0, 15);
    getOrCreate('chart-merchants-bar', {
      type: 'bar',
      data: {
        labels: top.map(m => m.name),
        datasets: [{
          label: 'Total Spent',
          data: top.map(m => m.total),
          backgroundColor: PALETTE,
          borderWidth: 0
        }]
      },
      options: {
        ...defaultOptions,
        indexAxis: 'y',
        plugins: { ...defaultOptions.plugins, legend: { display: false } }
      }
    });
  }

  /* ---- Savings Waterfall ---- */

  function renderSavingsWaterfall(categories, currentAmounts, savingsAmounts) {
    getOrCreate('chart-savings-waterfall', {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Current Avg/Month',
            data: currentAmounts,
            backgroundColor: '#ef4444cc',
            borderWidth: 0
          },
          {
            label: 'Potential Savings',
            data: savingsAmounts,
            backgroundColor: '#10b981cc',
            borderWidth: 0
          }
        ]
      },
      options: defaultOptions
    });
  }

  /* ---- Budget Comparison ---- */

  function renderBudgetComparison(categories, budgetAmounts, actualAmounts) {
    getOrCreate('chart-budget-comparison', {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Budget',
            data: budgetAmounts,
            backgroundColor: '#6366f1cc',
            borderWidth: 0
          },
          {
            label: 'Actual',
            data: actualAmounts,
            backgroundColor: actualAmounts.map((a, i) => a > budgetAmounts[i] ? '#ef4444cc' : '#10b981cc'),
            borderWidth: 0
          }
        ]
      },
      options: {
        ...defaultOptions,
        indexAxis: 'y'
      }
    });
  }

  /* ---- Financial Planner Charts ---- */

  /**
   * Savings projection: cumulative savings line + monthly net bars
   */
  function renderPlannerSavings(labels, cumulativeData, netData) {
    getOrCreate('chart-planner-savings', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Cumulative Savings',
            data: cumulativeData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,.12)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 7,
            yAxisID: 'y'
          },
          {
            type: 'bar',
            label: 'Monthly Net',
            data: netData,
            backgroundColor: netData.map(v => v >= 0 ? 'rgba(16,185,129,.5)' : 'rgba(239,68,68,.5)'),
            borderWidth: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...defaultOptions,
        scales: {
          x: { ...defaultOptions.scales.x },
          y: {
            type: 'linear',
            position: 'left',
            ticks: { color: '#8b8fa3', callback: v => '$' + v.toLocaleString() },
            grid: { color: '#2d3244' },
            title: { display: true, text: 'Cumulative Balance', color: '#8b8fa3' }
          },
          y1: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#8b8fa3', callback: v => '$' + v.toLocaleString() },
            grid: { drawOnChartArea: false },
            title: { display: true, text: 'Monthly Net', color: '#8b8fa3' }
          }
        },
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: { label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}` }
          }
        }
      }
    });
  }

  /**
   * Income comparison: historical (bar) + projected (line)
   */
  function renderPlannerIncomeComparison(comparison) {
    const { histMonths = [], histIncome = [], projMonths = [], projIncome = [] } = comparison || {};

    // Merge all month labels in order
    const allMonths = [...new Set([...(histMonths || []), ...(projMonths || [])])].sort();
    const histMap = {};
    (histMonths || []).forEach((m, i) => histMap[m] = histIncome[i]);
    const projMap = {};
    (projMonths || []).forEach((m, i) => projMap[m] = projIncome[i]);

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const labels = allMonths.map(ym => {
      const [y, m] = ym.split('-');
      return MONTH_NAMES[parseInt(m, 10) - 1] + ' ' + y;
    });

    // compute 3-month rolling average for historical income
    let rollMapped = [];
    try {
      const rollWindow = 3;
      const rollHist = rollingAverage(histIncome || [], rollWindow);
      rollMapped = allMonths.map(m => {
        const idx = (histMonths || []).indexOf(m);
        return idx >= 0 ? rollHist[idx] : null;
      });
    } catch (e) { rollMapped = []; }

    const datasets = [
      {
        label: 'Historical Income',
        data: allMonths.map(m => histMap[m] ?? null),
        backgroundColor: '#6366f1cc',
        borderWidth: 0
      },
      {
        type: 'line',
        label: 'Projected Income',
        data: allMonths.map(m => projMap[m] ?? null),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,.08)',
        borderDash: [6, 3],
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        spanGaps: true
      }
    ];

    if (rollMapped && rollMapped.some(v => v != null)) {
      datasets.push({
        type: 'line',
        label: `3-mo Rolling Avg (Historical)`,
        data: rollMapped,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,.06)',
        borderDash: [4,2],
        fill: false,
        tension: 0.3,
        pointRadius: 3,
        spanGaps: true
      });
    }

    getOrCreate('chart-planner-income-compare', {
      type: 'bar',
      data: { labels, datasets },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: { label: ctx => ctx.parsed && ctx.parsed.y != null ? `${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}` : '' }
          }
        }
      }
    });
  }

  /**
   * Monthly breakdown: stacked bar with income, budget expenses, scenario expenses
   */
  function renderPlannerBreakdown(labels, incomeData, budgetData, scenarioData) {
    const datasets = [
      {
        label: 'Income',
        data: incomeData || [],
        backgroundColor: '#10b981cc',
        borderWidth: 0
      },
      {
        label: 'Budgeted Expenses',
        data: budgetData || [],
        backgroundColor: '#6366f1cc',
        borderWidth: 0
      },
      {
        label: 'Scenario Expenses',
        data: scenarioData || [],
        backgroundColor: '#ef4444cc',
        borderWidth: 0
      }
    ];

    getOrCreate('chart-planner-breakdown', {
      type: 'bar',
      data: { labels: labels || [], datasets },
      options: {
        ...defaultOptions,
        scales: {
          ...defaultOptions.scales,
          x: { ...defaultOptions.scales.x, stacked: true },
          y: { ...defaultOptions.scales.y, stacked: true }
        }
      }
    });
  }

  /**
   * Render a multi-line cumulative savings comparison chart.
   * @param {Array<{label: string, projection: Array}>} results
   */
  function renderScenarioComparison(results) {
    const canvas = document.getElementById('chart-scenario-compare');
    if (!canvas || !results || results.length === 0) return;

    const colors = [
      '#6c8cff', '#ff6b6b', '#4bd48a', '#ffd166',
      '#a78bfa', '#f97316', '#22d3ee', '#f43f5e'
    ];

    // All projections should share the same month labels (use longest)
    const longestIdx = results.reduce((best, r, i) => r.projection.length > results[best].projection.length ? i : best, 0);
    const labels = results[longestIdx].projection.map(p => {
      if (!p.monthLabel) return '';
      const [y, m] = p.monthLabel.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(m,10)-1]} ${y}`;
    });

    const datasets = results.map((r, i) => ({
      label: r.label,
      data: r.projection.map(p => p.cumulativeSavings),
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length] + '22',
      fill: false,
      tension: 0.35,
      pointRadius: 3,
      pointHoverRadius: 6
    }));

    getOrCreate('chart-scenario-compare', {
      type: 'line',
      data: { labels, datasets },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toFixed(2)}`
            }
          }
        },
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            ticks: {
              callback: v => '$' + v.toLocaleString()
            }
          }
        }
      }
    });
  }

  return {
    renderImportLine,
    renderOverviewBar, renderOverviewPie,
    renderCategoryPie, renderCategoryBar,
    renderTrendsLine, renderTrendsStacked, renderTrendsDelta,
    renderMerchantBar,
    renderSavingsWaterfall,
    renderBudgetComparison,
    renderPlannerSavings,
    renderPlannerIncomeComparison,
    renderPlannerBreakdown,
    renderScenarioComparison,
    PALETTE
  };
})();
