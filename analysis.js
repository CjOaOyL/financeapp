/* ============================================
   Analysis — Spending analytics & savings recommendations
   ============================================ */

const Analysis = (() => {

  /** Compute monthly aggregates (expenses + income) */
  function getMonthlyBreakdown() {
    const all = DataManager.getAll();
    const byMonth = {};

    for (const tx of all) {
      const month = tx.date.slice(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { expenses: 0, income: 0, count: 0 };

      if (tx.category === 'Income' || tx.amount < 0) {
        byMonth[month].income += Math.abs(tx.amount);
      } else if (tx.category !== 'Transfer') {
        byMonth[month].expenses += tx.amount;
        byMonth[month].count++;
      }
    }

    return Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({ month, ...data }));
  }

  /** Compute spending by category (excluding Income & Transfer) */
  function getCategoryTotals() {
    const expenses = DataManager.getExpenses();
    const totals = {};
    for (const tx of expenses) {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    }
    return totals;
  }

  /** Category breakdown with metrics */
  function getCategoryBreakdown() {
    const expenses = DataManager.getExpenses();
    const months = DataManager.getMonths();
    const numMonths = months.length || 1;
    const totalSpend = expenses.reduce((s, t) => s + t.amount, 0);

    const byCategory = {};
    for (const tx of expenses) {
      if (!byCategory[tx.category]) byCategory[tx.category] = { total: 0, count: 0 };
      byCategory[tx.category].total += tx.amount;
      byCategory[tx.category].count++;
    }

    return Object.entries(byCategory)
      .map(([cat, d]) => ({
        category: cat,
        total: d.total,
        percent: totalSpend > 0 ? (d.total / totalSpend) * 100 : 0,
        avgPerMonth: d.total / numMonths,
        count: d.count
      }))
      .sort((a, b) => b.total - a.total);
  }

  /** Category spending per month (for stacked chart) */
  function getCategoryMonthlyData() {
    const expenses = DataManager.getExpenses();
    const months = [...new Set(expenses.map(t => t.date.slice(0, 7)))].sort();
    const categories = [...new Set(expenses.map(t => t.category))].sort();

    const data = {};
    for (const cat of categories) {
      data[cat] = months.map(() => 0);
    }

    for (const tx of expenses) {
      const mi = months.indexOf(tx.date.slice(0, 7));
      if (mi >= 0 && data[tx.category]) {
        data[tx.category][mi] += tx.amount;
      }
    }

    return { months, data };
  }

  /** Top merchants / payees */
  function getMerchantBreakdown() {
    const expenses = DataManager.getExpenses();
    const byMerchant = {};

    for (const tx of expenses) {
      const name = normalizeMerchant(tx.description);
      if (!byMerchant[name]) byMerchant[name] = { total: 0, count: 0, category: tx.category };
      byMerchant[name].total += tx.amount;
      byMerchant[name].count++;
    }

    return Object.entries(byMerchant)
      .map(([name, d]) => ({
        name,
        total: d.total,
        count: d.count,
        avgPerTx: d.total / d.count,
        category: d.category
      }))
      .sort((a, b) => b.total - a.total);
  }

  /** Simplify merchant names by removing common suffixes/numbers */
  function normalizeMerchant(desc) {
    let name = desc
      .replace(/\s*#\d+/g, '')
      .replace(/\s*\d{4,}/g, '')
      .replace(/\s*(LLC|INC|CORP|LTD|CO)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    // Capitalize
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  /** KPI summary statistics */
  function getKPIs() {
    const monthly = getMonthlyBreakdown();
    const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
    const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
    const numMonths = monthly.length || 1;
    const avgMonthly = totalExpenses / numMonths;

    let highMonth = { month: '—', expenses: 0 };
    let lowMonth = { month: '—', expenses: Infinity };
    for (const m of monthly) {
      if (m.expenses > highMonth.expenses) highMonth = m;
      if (m.expenses < lowMonth.expenses && m.expenses > 0) lowMonth = m;
    }
    if (lowMonth.expenses === Infinity) lowMonth = { month: '—', expenses: 0 };

    return {
      totalExpenses,
      totalIncome,
      avgMonthly,
      highMonth: highMonth.month,
      highAmount: highMonth.expenses,
      lowMonth: lowMonth.month,
      lowAmount: lowMonth.expenses,
      netCashFlow: totalIncome - totalExpenses,
      numMonths
    };
  }

  /** Generate savings recommendations based on spending patterns */
  function getSavingsRecommendations() {
    const breakdown = getCategoryBreakdown();
    const kpis = getKPIs();
    const merchants = getMerchantBreakdown();
    const recommendations = [];

    // Thresholds as percentage of total spending
    const DINING_THRESHOLD = 15;
    const ENTERTAINMENT_THRESHOLD = 10;
    const SHOPPING_THRESHOLD = 20;
    const SUBSCRIPTION_AVG_THRESHOLD = 100; // per month

    for (const cat of breakdown) {
      // Dining out recommendations
      if (cat.category === 'Dining' && cat.percent > DINING_THRESHOLD) {
        const savingsTarget = cat.avgPerMonth * 0.30;
        recommendations.push({
          icon: '🍽',
          title: `Reduce Dining Expenses`,
          description: `Dining is ${cat.percent.toFixed(1)}% of spending ($${cat.avgPerMonth.toFixed(0)}/mo). Consider meal prepping 2-3 times/week and limiting eating out. A 30% reduction saves ~$${savingsTarget.toFixed(0)}/mo.`,
          potentialSavings: savingsTarget,
          priority: 'high',
          category: 'Dining'
        });
      }

      // Entertainment
      if (cat.category === 'Entertainment' && cat.percent > ENTERTAINMENT_THRESHOLD) {
        const savingsTarget = cat.avgPerMonth * 0.25;
        recommendations.push({
          icon: '🎬',
          title: `Cut Entertainment Costs`,
          description: `Entertainment spending is ${cat.percent.toFixed(1)}% of your budget ($${cat.avgPerMonth.toFixed(0)}/mo). Look for free alternatives or consolidate streaming services. A 25% reduction saves ~$${savingsTarget.toFixed(0)}/mo.`,
          potentialSavings: savingsTarget,
          priority: 'medium',
          category: 'Entertainment'
        });
      }

      // Shopping
      if (cat.category === 'Shopping' && cat.percent > SHOPPING_THRESHOLD) {
        const savingsTarget = cat.avgPerMonth * 0.25;
        recommendations.push({
          icon: '🛍',
          title: `Reduce Discretionary Shopping`,
          description: `Shopping accounts for ${cat.percent.toFixed(1)}% of spending ($${cat.avgPerMonth.toFixed(0)}/mo). Implement a 48-hour rule for non-essential purchases. A 25% reduction saves ~$${savingsTarget.toFixed(0)}/mo.`,
          potentialSavings: savingsTarget,
          priority: 'high',
          category: 'Shopping'
        });
      }

      // Subscriptions
      if (cat.category === 'Subscriptions' && cat.avgPerMonth > SUBSCRIPTION_AVG_THRESHOLD) {
        const savingsTarget = cat.avgPerMonth * 0.30;
        recommendations.push({
          icon: '📱',
          title: `Audit Subscriptions`,
          description: `You're spending $${cat.avgPerMonth.toFixed(0)}/mo on subscriptions. Review and cancel unused services, share family plans, or switch to annual billing for discounts. Target ~$${savingsTarget.toFixed(0)}/mo in savings.`,
          potentialSavings: savingsTarget,
          priority: 'medium',
          category: 'Subscriptions'
        });
      }

      // Transportation
      if (cat.category === 'Transportation' && cat.percent > 15) {
        const savingsTarget = cat.avgPerMonth * 0.20;
        recommendations.push({
          icon: '🚗',
          title: `Optimize Transportation Costs`,
          description: `Transportation is ${cat.percent.toFixed(1)}% of spending ($${cat.avgPerMonth.toFixed(0)}/mo). Consider carpooling, public transit, or consolidating trips. Potential savings: ~$${savingsTarget.toFixed(0)}/mo.`,
          potentialSavings: savingsTarget,
          priority: 'medium',
          category: 'Transportation'
        });
      }

      // Groceries — usually not cut-worthy, but if very high
      if (cat.category === 'Groceries' && cat.avgPerMonth > 800) {
        const savingsTarget = cat.avgPerMonth * 0.15;
        recommendations.push({
          icon: '🛒',
          title: `Optimize Grocery Spending`,
          description: `Grocery spending is $${cat.avgPerMonth.toFixed(0)}/mo. Try meal planning, using coupons/cashback apps, buying store brands, and shopping at discount grocers. Potential savings: ~$${savingsTarget.toFixed(0)}/mo.`,
          potentialSavings: savingsTarget,
          priority: 'low',
          category: 'Groceries'
        });
      }
    }

    // Check for frequent small transactions (coffee/fast food habit)
    const frequentSmall = merchants.filter(m => m.count >= 10 && m.avgPerTx < 15 && m.total > 50);
    if (frequentSmall.length > 0) {
      const topHabit = frequentSmall[0];
      const savings = topHabit.total / (kpis.numMonths || 1) * 0.5;
      recommendations.push({
        icon: '☕',
        title: `Reduce Frequent Small Purchases`,
        description: `You visited "${topHabit.name}" ${topHabit.count} times (avg $${topHabit.avgPerTx.toFixed(2)}/visit). Cutting frequency by 50% saves ~$${savings.toFixed(0)}/mo. Consider making coffee at home.`,
        potentialSavings: savings,
        priority: 'low',
        category: topHabit.category
      });
    }

    // General — if no specific recommendations
    if (recommendations.length === 0 && kpis.totalExpenses > 0) {
      recommendations.push({
        icon: '💡',
        title: `General Savings Tip`,
        description: `Your spending looks balanced! To save more, try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Target saving $${(kpis.avgMonthly * 0.10).toFixed(0)}/mo (10% reduction).`,
        potentialSavings: kpis.avgMonthly * 0.10,
        priority: 'low',
        category: 'General'
      });
    }

    // Sort by potential savings descending
    recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);

    return recommendations;
  }

  /** Get totals for savings waterfall chart */
  function getSavingsWaterfallData(recommendations) {
    const categories = recommendations.map(r => r.category || r.title);
    const currentAmounts = [];
    const savingsAmounts = [];
    const catBreakdown = getCategoryBreakdown();

    for (const rec of recommendations) {
      const catData = catBreakdown.find(c => c.category === rec.category);
      currentAmounts.push(catData ? catData.avgPerMonth : 0);
      savingsAmounts.push(rec.potentialSavings);
    }

    return { categories, currentAmounts, savingsAmounts };
  }

  return {
    getMonthlyBreakdown,
    getCategoryTotals,
    getCategoryBreakdown,
    getCategoryMonthlyData,
    getMerchantBreakdown,
    getKPIs,
    getSavingsRecommendations,
    getSavingsWaterfallData
  };
})();
