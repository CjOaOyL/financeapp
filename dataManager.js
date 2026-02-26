/* ============================================
   Data Manager — localStorage CRUD for transactions
   ============================================ */

const DataManager = (() => {
  const STORAGE_KEY = 'finance_dashboard_transactions';
  const BUDGET_KEY  = 'finance_dashboard_budget';

  // Default spending categories with keywords for auto-categorization
  const CATEGORY_KEYWORDS = {
    'Housing':          ['rent', 'mortgage', 'hoa', 'property tax', 'apartment'],
    'Utilities':        ['electric', 'gas bill', 'water bill', 'internet', 'phone bill', 'cable', 'utility', 'comcast', 'verizon', 'at&t', 'spectrum', 'xfinity', 'power', 'sewer'],
    'Groceries':        ['grocery', 'groceries', 'walmart', 'costco', 'trader joe', 'whole foods', 'kroger', 'aldi', 'safeway', 'publix', 'heb', 'wegmans', 'market', 'food lion', 'stop & shop', 'giant'],
    'Dining':           ['restaurant', 'mcdonald', 'starbucks', 'chipotle', 'subway', 'doordash', 'uber eats', 'grubhub', 'pizza', 'cafe', 'coffee', 'bar ', 'grill', 'kitchen', 'taco', 'burger', 'wendy', 'chick-fil', 'panera', 'dunkin'],
    'Transportation':   ['gas station', 'shell', 'chevron', 'bp ', 'exxon', 'uber', 'lyft', 'parking', 'toll', 'transit', 'metro', 'fuel', 'car wash', 'auto'],
    'Healthcare':       ['doctor', 'pharmacy', 'medical', 'hospital', 'dental', 'cvs', 'walgreens', 'health', 'vision', 'urgent care', 'lab ', 'prescription'],
    'Entertainment':    ['netflix', 'hulu', 'disney', 'spotify', 'apple music', 'movie', 'theater', 'concert', 'game', 'steam', 'playstation', 'xbox', 'youtube', 'twitch', 'amc'],
    'Shopping':         ['amazon', 'target', 'best buy', 'ebay', 'etsy', 'nike', 'clothing', 'shoes', 'store', 'mall', 'shop', 'home depot', 'lowes', 'ikea', 'nordstrom', 'tjmaxx', 'ross'],
    'Subscriptions':    ['subscription', 'membership', 'annual fee', 'monthly fee', 'gym', 'fitness', 'patreon', 'adobe', 'microsoft', 'icloud', 'dropbox'],
    'Insurance':        ['insurance', 'geico', 'progressive', 'state farm', 'allstate', 'liberty mutual', 'premium'],
    'Education':        ['tuition', 'school', 'university', 'course', 'udemy', 'coursera', 'textbook', 'student loan'],
    'Personal Care':    ['salon', 'barber', 'spa', 'nail', 'beauty', 'cosmetic', 'haircut'],
    'Gifts & Donations':['gift', 'donation', 'charity', 'church', 'tithe', 'giving'],
    'Travel':           ['airline', 'hotel', 'airbnb', 'flight', 'booking', 'expedia', 'kayak', 'vacation', 'resort'],
    'Income':           ['payroll', 'direct deposit', 'salary', 'wage', 'interest paid', 'dividend', 'refund', 'reimbursement', 'venmo received', 'zelle received'],
    'Transfer':         ['transfer', 'zelle', 'venmo', 'paypal', 'cash app', 'wire']
  };

  const CATEGORIES = Object.keys(CATEGORY_KEYWORDS);

  /** Generate a unique ID */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** Get all transactions from storage */
  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  /** Save all transactions */
  function saveAll(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    window.dispatchEvent(new CustomEvent('transactions-updated'));
  }

  /** Add one or more transactions */
  function add(txArray) {
    if (!Array.isArray(txArray)) txArray = [txArray];
    const existing = getAll();
    const newTx = txArray.map(tx => ({
      id: tx.id || uid(),
      date: tx.date,                          // "YYYY-MM-DD"
      description: (tx.description || '').trim(),
      amount: parseFloat(tx.amount) || 0,      // positive = expense, negative = income (or use sign convention)
      category: tx.category || autoCategory(tx.description),
      account: tx.account || 'Unknown',
      cardholder: tx.cardholder || 'Unknown',
    }));
    saveAll([...existing, ...newTx]);
    return newTx;
  }

  /** Update a transaction by ID */
  function update(id, fields) {
    const all = getAll();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return false;
    all[idx] = { ...all[idx], ...fields };
    saveAll(all);
    return true;
  }

  /** Delete a transaction by ID */
  function remove(id) {
    const all = getAll().filter(t => t.id !== id);
    saveAll(all);
  }

  /** Clear all data */
  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BUDGET_KEY);
    window.dispatchEvent(new CustomEvent('transactions-updated'));
  }

  /** Auto-categorize based on description keywords */
  function autoCategory(description) {
    const desc = (description || '').toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (desc.includes(kw.toLowerCase())) return cat;
      }
    }
    return 'Other';
  }

  /** Re-categorize a description (useful after import) */
  function recategorize(description, currentCategory) {
    if (currentCategory && currentCategory !== 'Other') return currentCategory;
    return autoCategory(description);
  }

  /** Get unique account names */
  function getAccounts() {
    const all = getAll();
    return [...new Set(all.map(t => t.account))].sort();
  }

  /** Get unique categories in use */
  function getUsedCategories() {
    const all = getAll();
    return [...new Set(all.map(t => t.category))].sort();
  }

  /** Get unique months (YYYY-MM) present in data */
  function getMonths() {
    const all = getAll();
    return [...new Set(all.map(t => t.date.slice(0, 7)))].sort();
  }

  /** Filter transactions by criteria */
  function filter({ account, cardholder, category, month, search } = {}) {
    let txs = getAll();
    if (account && account !== 'all') txs = txs.filter(t => t.account === account);
    if (cardholder && cardholder !== 'all') txs = txs.filter(t => (t.cardholder || 'Unknown') === cardholder);
    if (category && category !== 'all') txs = txs.filter(t => t.category === category);
    if (month && month !== 'all') txs = txs.filter(t => t.date.startsWith(month));
    if (search) {
      const s = search.toLowerCase();
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(s) ||
        (t._originalDesc && t._originalDesc.toLowerCase().includes(s)) ||
        (t._merchant && t._merchant.toLowerCase().includes(s))
      );
    }
    return txs;
  }

  /** Get expenses only (amount > 0) */
  function getExpenses() {
    return getAll().filter(t => t.amount > 0 && t.category !== 'Income' && t.category !== 'Transfer');
  }

  /** Get income only */
  function getIncome() {
    return getAll().filter(t => t.amount < 0 || t.category === 'Income');
  }

  // Budget helpers
  function getBudget() {
    try { return JSON.parse(localStorage.getItem(BUDGET_KEY) || '{}'); } catch { return {}; }
  }
  function saveBudget(budget) {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
    window.dispatchEvent(new CustomEvent('budget-updated'));
  }

  return {
    getAll, saveAll, add, update, remove, clearAll,
    autoCategory, recategorize,
    getAccounts, getUsedCategories, getMonths, filter,
    getExpenses, getIncome,
    getBudget, saveBudget,
    CATEGORIES, CATEGORY_KEYWORDS, uid
  };
})();
