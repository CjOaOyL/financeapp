/* ============================================
   Data Manager — localStorage CRUD for transactions
   ============================================ */

const DataManager = (() => {
  const STORAGE_KEY = 'finance_dashboard_transactions';
  const BUDGET_KEY  = 'finance_dashboard_budget';

  // Default spending categories with keywords for auto-categorization
  const CATEGORY_KEYWORDS = {
    'Housing':          ['rent', 'mortgage', 'hoa', 'property tax', 'apartment', 'lease', 'landlord', 'condo', 'townhome', 'real estate', 'zillow', 'redfin', 'trulia', 'home equity'],
    'Utilities':        ['electric', 'gas bill', 'water bill', 'internet', 'phone bill', 'cable', 'utility', 'comcast', 'verizon', 'at&t', 'spectrum', 'xfinity', 'power', 'sewer', 't-mobile', 'tmobile', 'sprint', 'cricket', 'boost mobile', 'mint mobile', 'visible', 'cox', 'optimum', 'frontier', 'centurylink', 'dominion energy', 'duke energy', 'peco', 'pepco', 'con edison', 'pg&e', 'southern california edison', 'waste management'],
    'Groceries':        ['grocery', 'groceries', 'walmart', 'costco', 'trader joe', 'whole foods', 'kroger', 'aldi', 'safeway', 'publix', 'heb', 'h-e-b', 'wegmans', 'market', 'food lion', 'stop & shop', 'giant', 'winn-dixie', 'piggly wiggly', 'sprouts', 'harris teeter', 'meijer', 'fresh market', 'smart & final', 'grocery outlet', 'food depot', 'save-a-lot', 'lidl', 'shoprite', 'food bazaar', 'key food', 'c-town', 'farm fresh', 'bi-lo', 'ingles', 'commissary', 'sam\'s club', 'bj\'s wholesale'],
    'Dining':           ['restaurant', 'mcdonald', 'starbucks', 'chipotle', 'subway', 'doordash', 'uber eats', 'grubhub', 'pizza', 'cafe', 'coffee', 'bar ', 'grill', 'kitchen', 'taco', 'burger', 'wendy', 'chick-fil', 'panera', 'dunkin', 'wine', 'pub', 'tavern', 'brewery', 'bistro', 'eatery', 'diner', 'steakhouse', 'sushi', 'ramen', 'pho', 'thai', 'chinese', 'mexican', 'italian', 'hibachi', 'bbq', 'barbecue', 'wingstop', 'buffalo wild wings', 'applebee', 'olive garden', 'red lobster', 'outback', 'longhorn', 'texas roadhouse', 'ihop', 'waffle house', 'denny', 'cracker barrel', 'five guys', 'shake shack', 'in-n-out', 'raising cane', 'popeyes', 'kfc', 'jack in the box', 'sonic', 'arby', 'dairy queen', 'panda express', 'noodles', 'jimmy john', 'jersey mike', 'firehouse subs', 'wawa', 'sheetz', 'smoothie', 'juice', 'boba', 'bakery', 'pastry', 'donut', 'doughnut', 'bagel', 'brunch', 'cantina', 'trattoria', 'chophouse', 'taphouse', 'tap house', 'wing', 'crab', 'oyster', 'seafood', 'crawfish', 'smokehouse', 'pizzeria', 'gelateria', 'creperie', 'patisserie', 'food truck', 'catering', 'postmates', 'seamless', 'caviar', 'instacart', 'gopuff', 'toast tab', 'square meal'],
    'Transportation':   ['gas station', 'shell', 'chevron', 'bp ', 'exxon', 'uber', 'lyft', 'parking', 'toll', 'transit', 'metro', 'fuel', 'car wash', 'auto', 'sunoco', 'citgo', 'marathon', 'valero', 'speedway', 'racetrac', 'quiktrip', 'qt ', 'wawa fuel', 'sheetz fuel', 'circle k', 'murphy', 'sam\'s fuel', 'costco gas', 'buc-ee', 'ez pass', 'sunpass', 'i-pass', 'turnpike', 'expressway', 'jiffy lube', 'midas', 'firestone', 'goodyear', 'pep boys', 'autozone', 'advance auto', 'o\'reilly', 'napa auto', 'car repair', 'mechanic', 'tire', 'oil change', 'emission', 'smog', 'carfax', 'geico', 'dmv', 'registration'],
    'Healthcare':       ['doctor', 'pharmacy', 'medical', 'hospital', 'dental', 'cvs', 'walgreens', 'health', 'vision', 'urgent care', 'lab ', 'prescription', 'optometrist', 'ophthalmol', 'dermatol', 'pediatr', 'orthopedic', 'chiropract', 'physical therapy', 'mental health', 'counseling', 'therapy', 'psychiatr', 'psycholog', 'clinic', 'kaiser', 'cigna', 'aetna', 'united health', 'anthem', 'humana', 'blue cross', 'copay', 'labcorp', 'quest diagnostic', 'imaging', 'radiology', 'rite aid', 'minute clinic', 'teladoc', 'zoc doc', 'zocdoc', 'lenscrafters', 'pearle vision'],
    'Entertainment':    ['netflix', 'hulu', 'disney', 'spotify', 'apple music', 'movie', 'theater', 'concert', 'game', 'steam', 'playstation', 'xbox', 'youtube', 'twitch', 'amc', 'hbo', 'max ', 'paramount', 'peacock', 'tubi', 'crunchyroll', 'funimation', 'audible', 'kindle', 'book', 'museum', 'zoo', 'aquarium', 'theme park', 'amusement', 'bowling', 'mini golf', 'arcade', 'escape room', 'cinema', 'regal', 'cinemark', 'imax', 'fandango', 'ticketmaster', 'stubhub', 'vivid seats', 'seatgeek', 'livenation', 'live nation', 'eventbrite', 'topgolf', 'dave & buster', 'dave and buster', 'main event', 'comedy club', 'karaoke', 'nightclub', 'lounge', 'billiard', 'pool hall', 'laser tag', 'trampoline', 'go kart', 'paintball', 'axe throw', 'apple tv', 'amazon prime video', 'vudu', 'redbox', 'nintendo', 'epic games', 'roblox', 'ea ', 'blizzard'],
    'Shopping':         ['amazon', 'target', 'best buy', 'ebay', 'etsy', 'nike', 'clothing', 'shoes', 'store', 'mall', 'shop', 'home depot', 'lowes', 'lowe\'s', 'ikea', 'nordstrom', 'tjmaxx', 'ross', 'marshalls', 'burlington', 'old navy', 'gap ', 'banana republic', 'h&m', 'zara', 'forever 21', 'uniqlo', 'primark', 'shein', 'temu', 'wish', 'fashion nova', 'asos', 'macy', 'jcpenney', 'kohl', 'sears', 'dillard', 'bed bath', 'wayfair', 'overstock', 'pottery barn', 'restoration hardware', 'crate & barrel', 'west elm', 'pier 1', 'world market', 'five below', 'dollar tree', 'dollar general', 'family dollar', '99 cent', 'big lot', 'tuesday morning', 'hobby lobby', 'michael\'s', 'joann', 'craft', 'ace hardware', 'menards', 'tractor supply', 'bath & body', 'sephora', 'ulta', 'apple store', 'apple.com', 'microsoft store', 'newegg', 'micro center', 'gamestop', 'footlocker', 'foot locker', 'finish line', 'adidas', 'puma', 'new balance', 'under armour', 'lululemon', 'rei ', 'dick\'s sporting', 'academy sport', 'bass pro', 'cabela'],
    'Subscriptions':    ['subscription', 'membership', 'annual fee', 'monthly fee', 'gym', 'fitness', 'patreon', 'adobe', 'microsoft 365', 'icloud', 'dropbox', 'google storage', 'google one', 'amazon prime', 'costco member', 'sam\'s member', 'planet fitness', 'la fitness', 'equinox', 'orangetheory', 'crossfit', 'peloton', 'ymca', 'ywca', 'classpass', 'chatgpt', 'openai', 'midjourney', 'notion', 'canva', 'grammarly', 'nordvpn', 'expressvpn', 'lastpass', '1password', 'dashlane', 'linkedin premium', 'github', 'slack', 'zoom', 'aws', 'hosting', 'domain', 'godaddy', 'namecheap', 'squarespace', 'wix', 'wordpress', 'cloudflare', 'apple one', 'apple arcade', 'google play'],
    'Insurance':        ['insurance', 'geico', 'progressive', 'state farm', 'allstate', 'liberty mutual', 'premium', 'usaa', 'navy federal insurance', 'farmers', 'nationwide', 'travelers', 'hartford', 'metlife', 'prudential', 'aflac', 'lemonade', 'root insurance', 'erie insurance'],
    'Education':        ['tuition', 'school', 'university', 'course', 'udemy', 'coursera', 'textbook', 'student loan', 'college', 'chegg', 'quizlet', 'khan academy', 'skillshare', 'masterclass', 'linkedin learning', 'pluralsight', 'codecademy', 'bootcamp', 'seminar', 'workshop', 'certification', 'exam fee', 'sat ', 'gre ', 'gmat', 'mcat', 'lsat', 'bar exam', 'pearson', 'mcgraw', 'elsevier', 'wiley', 'scholastic'],
    'Personal Care':    ['salon', 'barber', 'spa', 'nail', 'beauty', 'cosmetic', 'haircut', 'hair cut', 'wax', 'massage', 'facial', 'manicure', 'pedicure', 'tattoo', 'piercing', 'tanning', 'laser', 'botox', 'grooming', 'supercuts', 'great clips', 'sport clips', 'fantastic sam', 'floyd\'s 99'],
    'Gifts & Donations':['gift', 'donation', 'charity', 'church', 'tithe', 'giving', 'gofundme', 'fundrais', 'nonprofit', 'red cross', 'salvation army', 'goodwill', 'unicef', 'habitat for humanity', 'world vision', 'st. jude', 'make a wish', 'united way', 'aclu', 'planned parenthood', 'nature conserv', 'registry', 'wedding gift', 'baby shower', 'birthday gift', 'holiday gift', 'greeting card', 'hallmark', 'flower', 'florist', '1-800-flowers', 'edible arrangement', 'gift card'],
    'Travel':           ['airline', 'hotel', 'airbnb', 'flight', 'booking', 'expedia', 'kayak', 'vacation', 'resort', 'vrbo', 'trivago', 'hotwire', 'priceline', 'hotels.com', 'marriott', 'hilton', 'hyatt', 'wyndham', 'best western', 'holiday inn', 'ihg', 'motel', 'hampton', 'courtyard', 'sheraton', 'westin', 'embassy suite', 'residence inn', 'springhill', 'comfort inn', 'la quinta', 'southwest', 'delta air', 'american air', 'united air', 'jetblue', 'frontier air', 'spirit air', 'alaska air', 'hawaiian air', 'allegiant', 'breeze', 'sun country', 'amtrak', 'greyhound', 'megabus', 'hertz', 'avis', 'budget rental', 'enterprise', 'national car', 'turo', 'sixt', 'cruise', 'carnival', 'royal caribbean', 'norwegian cruise', 'disney cruise', 'tsa', 'global entry', 'passport', 'luggage', 'samsonite', 'trip', 'tour', 'sightseeing', 'excursion'],
    'Income':           ['payroll', 'direct deposit', 'salary', 'wage', 'interest paid', 'dividend', 'refund', 'reimbursement', 'venmo received', 'zelle received', 'tax refund', 'irs refund', 'cashback', 'cash back', 'royalt', 'commission', 'bonus', 'stipend', 'freelance', 'invoice paid', 'settlement', 'inheritance', 'pension', 'social security', 'ssi ', 'ssdi', 'unemployment', 'disability', 'annuity'],
    'Transfer':         ['transfer', 'zelle', 'venmo', 'paypal', 'cash app', 'wire', 'ach transfer', 'bank transfer', 'internal transfer', 'external transfer', 'self transfer', 'own account']
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

  /* ================================================
     Transfer Pair Detection
     ================================================ */

  const TRANSFER_DATE_WINDOW = 3; // days tolerance for date matching

  /**
   * Detect potential transfer pairs across different accounts.
   * A transfer pair: two transactions from different accounts where
   * amounts match (one expense, one income) within a date window.
   * Returns array of { tx1, tx2, confidence, reason } sorted by confidence desc.
   */
  function detectTransferPairs() {
    const all = getAll();
    const pairs = [];
    const seen = new Set();

    // Separate expenses and income
    const expenses = all.filter(t => t.amount > 0);
    const incomes  = all.filter(t => t.amount < 0);

    for (const exp of expenses) {
      for (const inc of incomes) {
        // Skip if same account
        if (exp.account === inc.account) continue;
        // Skip if already paired
        if (seen.has(exp.id) || seen.has(inc.id)) continue;

        // Amount must match exactly (absolute value)
        if (Math.abs(Math.abs(exp.amount) - Math.abs(inc.amount)) > 0.01) continue;

        // Date proximity check
        const daysDiff = dateDiffDays(exp.date, inc.date);
        if (daysDiff > TRANSFER_DATE_WINDOW) continue;

        // Calculate confidence score
        let confidence = 50; // base score for amount + date match
        const reasons = [];

        // Closer dates = higher confidence
        if (daysDiff === 0) { confidence += 20; reasons.push('same date'); }
        else if (daysDiff === 1) { confidence += 15; reasons.push('1 day apart'); }
        else if (daysDiff === 2) { confidence += 10; reasons.push('2 days apart'); }
        else { confidence += 5; reasons.push(`${daysDiff} days apart`); }

        // Transfer-like keywords boost confidence
        const transferKeywords = ['transfer', 'payment', 'ach', 'wire', 'zelle', 'venmo', 'paypal', 'cash app',
                                  'autopay', 'auto pay', 'bill pay', 'direct pay', 'online payment'];
        const expDesc = (exp.description || '').toLowerCase();
        const incDesc = (inc.description || '').toLowerCase();
        const expOriginal = (exp._originalDesc || '').toLowerCase();
        const incOriginal = (inc._originalDesc || '').toLowerCase();

        const matchedKw = transferKeywords.filter(kw =>
          expDesc.includes(kw) || incDesc.includes(kw) || expOriginal.includes(kw) || incOriginal.includes(kw)
        );
        if (matchedKw.length > 0) {
          confidence += 15;
          reasons.push('keyword: ' + matchedKw[0]);
        }

        // Already categorized as Transfer = very high confidence
        if (exp.category === 'Transfer' || inc.category === 'Transfer') {
          confidence += 10;
          reasons.push('already categorized as Transfer');
        }

        // Cap at 100
        confidence = Math.min(100, confidence);

        pairs.push({
          tx1: exp,
          tx2: inc,
          confidence,
          reason: reasons.join(', '),
          amount: Math.abs(exp.amount)
        });

        seen.add(exp.id);
        seen.add(inc.id);
      }
    }

    // Sort by confidence descending
    pairs.sort((a, b) => b.confidence - a.confidence);
    return pairs;
  }

  /** Mark a pair of transactions as transfers and link them */
  function markTransferPair(id1, id2) {
    const linkId = uid();
    const all = getAll();
    let changed = false;
    for (const t of all) {
      if (t.id === id1 || t.id === id2) {
        t.category = 'Transfer';
        t.transferPairId = linkId;
        changed = true;
      }
    }
    if (changed) saveAll(all);
    return linkId;
  }

  /** Unmark a transfer pair — set both back to auto-category and remove link */
  function unmarkTransferPair(linkId) {
    const all = getAll();
    for (const t of all) {
      if (t.transferPairId === linkId) {
        t.category = autoCategory(t.description);
        delete t.transferPairId;
      }
    }
    saveAll(all);
  }

  /** Get all confirmed transfer pairs (already linked) */
  function getConfirmedTransfers() {
    const all = getAll();
    const byLink = {};
    for (const t of all) {
      if (t.transferPairId) {
        if (!byLink[t.transferPairId]) byLink[t.transferPairId] = [];
        byLink[t.transferPairId].push(t);
      }
    }
    return Object.entries(byLink)
      .filter(([, txs]) => txs.length === 2)
      .map(([linkId, txs]) => ({
        linkId,
        tx1: txs[0],
        tx2: txs[1],
        amount: Math.abs(txs[0].amount)
      }));
  }

  /** Date difference in days (absolute) */
  function dateDiffDays(d1, d2) {
    const a = new Date(d1);
    const b = new Date(d2);
    return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
  }

  return {
    getAll, saveAll, add, update, remove, clearAll,
    autoCategory, recategorize,
    getAccounts, getUsedCategories, getMonths, filter,
    getExpenses, getIncome,
    getBudget, saveBudget,
    detectTransferPairs, markTransferPair, unmarkTransferPair, getConfirmedTransfers,
    CATEGORIES, CATEGORY_KEYWORDS, uid
  };
})();
