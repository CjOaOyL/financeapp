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

    // Build cumulative running total
    let cumExpense = 0;
    const expenseData = allDates.map(d => { cumExpense += (expenseByDate[d] || 0); return cumExpense; });
    let cumIncome = 0;
    const incomeData = allDates.map(d => { cumIncome += (incomeByDate[d] || 0); return cumIncome; });

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
    getOrCreate('chart-trends-line', {
      type: 'line',
      data: {
        labels: monthlyData.map(d => d.month),
        datasets: [{
          label: 'Monthly Spending',
          data: monthlyData.map(d => d.expenses),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,.15)',
          fill: true,
          tension: .3,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
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

  return {
    renderImportLine,
    renderOverviewBar, renderOverviewPie,
    renderCategoryPie, renderCategoryBar,
    renderTrendsLine, renderTrendsStacked, renderTrendsDelta,
    renderMerchantBar,
    renderSavingsWaterfall,
    renderBudgetComparison,
    PALETTE
  };
})();
