/* ============================================
   Data Manager — localStorage CRUD for transactions
   ============================================ */

const DataManager = (() => {
  const STORAGE_KEY = 'finance_dashboard_transactions';
  const BUDGET_KEY  = 'finance_dashboard_budget';

  // Categories that belong to the STR business context (auto-assigned on import)
  const BUSINESS_CATEGORIES = new Set([
    'STR Income', 'Rental Utilities', 'Rental Maintenance', 'Rental Supplies'
  ]);

  /** Determine context from category: 'business' or 'personal' */
  function autoContext(category) {
    return BUSINESS_CATEGORIES.has(category) ? 'business' : 'personal';
  }

  // Default spending categories with keywords for auto-categorization
  const CATEGORY_KEYWORDS = {
    'Housing':          ['rent', 'mortgage', 'hoa', 'property tax', 'apartment', 'lease', 'landlord', 'condo', 'townhome', 'real estate', 'zillow', 'redfin', 'trulia', 'home equity'],
    'Rental Utilities': ['long energy', 'ngrid', 'national grid', 'heating oil', 'fuel oil', 'oil delivery', 'propane delivery', 'oil heat'],
    'Rental Maintenance':['arthur white', 'white and son', 'naturesway', 'natures way pest', 'wwp*natures', 'pest control', 'pest cont', 'handyman', 'contractor', 'plumb', 'locksmith', 'renovation', 'exterminator', 'fumigat'],
    'Rental Supplies':  ['cleaning supply', 'cleaning supplies', 'janitorial', 'linen', 'towel', 'bedding', 'toiletry', 'amenity', 'welcome kit'],
    'STR Income':       ['airbnb', 'vrbo', 'str payout', 'rental payout', 'booking.com payout', 'hipcamp', 'vacasa'],
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
    'Travel':           ['airline', 'hotel', 'flight', 'booking', 'expedia', 'kayak', 'vacation', 'resort', 'trivago', 'hotwire', 'priceline', 'hotels.com', 'marriott', 'hilton', 'hyatt', 'wyndham', 'best western', 'holiday inn', 'ihg', 'motel', 'hampton', 'courtyard', 'sheraton', 'westin', 'embassy suite', 'residence inn', 'springhill', 'comfort inn', 'la quinta', 'southwest', 'delta air', 'american air', 'united air', 'jetblue', 'frontier air', 'spirit air', 'alaska air', 'hawaiian air', 'allegiant', 'breeze', 'sun country', 'amtrak', 'greyhound', 'megabus', 'hertz', 'avis', 'budget rental', 'enterprise', 'national car', 'turo', 'sixt', 'cruise', 'carnival', 'royal caribbean', 'norwegian cruise', 'disney cruise', 'tsa', 'global entry', 'passport', 'luggage', 'samsonite', 'trip', 'tour', 'sightseeing', 'excursion'],
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
    const newTx = txArray.map(tx => {
      const category = tx.category || autoCategory(tx.description);
      return {
        id: tx.id || uid(),
        date: tx.date,
        description: (tx.description || '').trim(),
        amount: parseFloat(tx.amount) || 0,
        category,
        context: tx.context || autoContext(category),
        account: tx.account || 'Unknown',
        cardholder: tx.cardholder || 'Unknown',
      };
    });
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

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('finance_dashboard_')) {
        localStorage.removeItem(key);
      }
    }

    window.dispatchEvent(new CustomEvent('data-cleared'));
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
  function filter({ account, cardholder, category, month, search, context } = {}) {
    let txs = getAll();
    if (context && context !== 'all') txs = txs.filter(t => (t.context || 'personal') === context);
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

  // Active context for analysis — set by app.js when user switches the toggle
  let _activeContext = 'personal';
  function setActiveContext(ctx) { _activeContext = ctx; }
  function getActiveContext() { return _activeContext; }

  function _contextFilter(txs) {
    if (_activeContext === 'all') return txs;
    return txs.filter(t => (t.context || 'personal') === _activeContext);
  }

  /** Get expenses only (amount > 0), scoped to active context */
  function getExpenses() {
    return _contextFilter(getAll().filter(t => t.amount > 0 && t.category !== 'Income' && t.category !== 'Transfer'));
  }

  /** Get income only, scoped to active context */
  function getIncome() {
    return _contextFilter(getAll().filter(t => t.amount < 0 || t.category === 'Income'));
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

  /* ================================================
     Duplicate Detection
     ================================================ */

  /**
   * Normalize a description for duplicate comparison.
   * Lowercases, trims, collapses whitespace, strips non-alphanumeric chars.
   */
  function normalizeForComparison(desc) {
    return (desc || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Find duplicates between an array of incoming transactions and existing stored transactions.
   * A duplicate matches on: date + amount (within 1 cent).
   * Description is used as a soft check — if normalized descriptions share significant overlap,
   * it's a duplicate. This handles cases where the description cleaner produces slightly
   * different results, or where tags/categories differ between imports.
   *
   * Returns:
   *   {
   *     duplicates: [{ existing, incoming, keepExisting }],
   *     nonDuplicates: [ incoming tx objects that have no match ]
   *   }
   *
   * `keepExisting` is true when the existing transaction has a user-selected (non-"Other")
   * category, meaning we should keep the existing version. If the incoming transaction has
   * a better category (non-"Other") and the existing is "Other", we flag keepExisting=false
   * so the caller can update the existing record's category.
   */
  function findDuplicates(newTransactions) {
    const existing = getAll();
    const duplicates = [];
    const nonDuplicates = [];
    const usedExistingIds = new Set();

    console.log(`[DuplicateCheck] Comparing ${newTransactions.length} incoming against ${existing.length} existing transactions`);

    // Also detect duplicates WITHIN the incoming batch itself
    const seenInBatch = []; // track non-duplicate incoming txs we've already accepted

    for (const newTx of newTransactions) {
      const newNorm = normalizeForComparison(newTx.description);
      const newAmt = Math.abs(parseFloat(newTx.amount) || 0);

      // 1) Check against existing stored transactions
      const existingMatch = existing.find(ex => {
        if (usedExistingIds.has(ex.id)) return false;
        return isDuplicate(ex, newTx, newNorm, newAmt);
      });

      if (existingMatch) {
        usedExistingIds.add(existingMatch.id);
        const existingHasCategory = existingMatch.category && existingMatch.category !== 'Other';
        const incomingHasCategory = newTx.category && newTx.category !== 'Other';

        console.log(`[DuplicateCheck] DUPLICATE (vs existing): "${newTx.description}" ${newTx.date} $${newAmt} ↔ "${existingMatch.description}" ${existingMatch.date} $${Math.abs(existingMatch.amount)}`);

        duplicates.push({
          existing: existingMatch,
          incoming: newTx,
          keepExisting: existingHasCategory || !incomingHasCategory
        });
        continue;
      }

      // 2) Check against other transactions within THIS incoming batch
      const batchMatch = seenInBatch.find(seen => {
        return isDuplicate(seen, newTx, newNorm, newAmt);
      });

      if (batchMatch) {
        console.log(`[DuplicateCheck] DUPLICATE (within batch): "${newTx.description}" ${newTx.date} $${newAmt} ↔ "${batchMatch.description}" ${batchMatch.date} $${Math.abs(batchMatch.amount)}`);
        // Treat the first one seen as "existing" and this one as the duplicate incoming
        const batchHasCategory = batchMatch.category && batchMatch.category !== 'Other';
        const incomingHasCategory = newTx.category && newTx.category !== 'Other';
        duplicates.push({
          existing: batchMatch,
          incoming: newTx,
          keepExisting: batchHasCategory || !incomingHasCategory,
          _intraBatch: true
        });
        continue;
      }

      // No match — it's new
      seenInBatch.push(newTx);
      nonDuplicates.push(newTx);
    }

    console.log(`[DuplicateCheck] Result: ${duplicates.length} duplicates, ${nonDuplicates.length} new`);
    if (duplicates.length === 0 && existing.length > 0) {
      // Log some samples for debugging why nothing matched
      const sample = newTransactions.slice(0, 3);
      for (const s of sample) {
        const sNorm = normalizeForComparison(s.description);
        const sAmt = Math.abs(parseFloat(s.amount) || 0);
        const candidates = existing.filter(e => e.date === s.date);
        console.log(`[DuplicateCheck] Sample incoming: date="${s.date}" amt=${sAmt} desc="${sNorm}"`);
        console.log(`[DuplicateCheck]   ${candidates.length} existing with same date`);
        for (const c of candidates.slice(0, 3)) {
          const cAmt = Math.abs(parseFloat(c.amount) || 0);
          const cNorm = normalizeForComparison(c.description);
          console.log(`[DuplicateCheck]   candidate: amt=${cAmt} desc="${cNorm}" amtMatch=${Math.abs(cAmt - sAmt) < 0.015} descMatch=${cNorm === sNorm}`);
        }
      }
    }
    return { duplicates, nonDuplicates };
  }

  /**
   * Check if two transactions are duplicates.
   * Matches on: same date + same amount + similar description.
   */
  function isDuplicate(txA, txB, bNorm, bAmt) {
    // Must match on date
    if (txA.date !== txB.date) return false;

    // Must match on amount (within 1.5 cents)
    const aAmt = Math.abs(parseFloat(txA.amount) || 0);
    if (typeof bAmt === 'undefined') bAmt = Math.abs(parseFloat(txB.amount) || 0);
    if (Math.abs(aAmt - bAmt) >= 0.015) return false;

    // Description check: exact normalized match, OR significant word overlap
    const aNorm = normalizeForComparison(txA.description);
    if (typeof bNorm === 'undefined') bNorm = normalizeForComparison(txB.description);
    if (aNorm === bNorm) return true;

    // Fuzzy: check if descriptions share enough words
    const aWords = new Set(aNorm.split(' ').filter(w => w.length > 2));
    const bWords = new Set(bNorm.split(' ').filter(w => w.length > 2));
    if (aWords.size === 0 && bWords.size === 0) return true;

    const intersection = [...aWords].filter(w => bWords.has(w));
    const union = new Set([...aWords, ...bWords]);
    const similarity = union.size > 0 ? intersection.length / union.size : 0;

    // Also check if one description contains the other
    const containsMatch = (aNorm.length > 3 && bNorm.length > 3) &&
      (aNorm.includes(bNorm) || bNorm.includes(aNorm));

    return similarity >= 0.5 || containsMatch;
  }

  /**
   * Import transactions with duplicate resolution already applied.
   * - `nonDuplicates` are added as new transactions.
   * - For duplicates where the incoming had a better category, update the existing record.
   */
  function addWithDuplicateResolution(duplicates, nonDuplicates) {
    const all = getAll();

    // For duplicates where incoming had a better category, update existing
    for (const dup of duplicates) {
      if (!dup.keepExisting) {
        const idx = all.findIndex(t => t.id === dup.existing.id);
        if (idx !== -1) {
          all[idx].category = dup.incoming.category;
        }
      }
    }

    // Add non-duplicates
    const newTx = nonDuplicates.map(tx => {
      const category = tx.category || autoCategory(tx.description);
      return {
        id: tx.id || uid(),
        date: tx.date,
        description: (tx.description || '').trim(),
        amount: parseFloat(tx.amount) || 0,
        category,
        context: tx.context || autoContext(category),
        account: tx.account || 'Unknown',
        cardholder: tx.cardholder || 'Unknown',
        _originalDesc: tx._originalDesc,
        _txType: tx._txType,
        _merchant: tx._merchant,
        _isIncome: tx._isIncome,
        _raw: tx._raw,
      };
    });

    saveAll([...all, ...newTx]);
    return newTx;
  }

  return {
    getAll, saveAll, add, update, remove, clearAll,
    autoCategory, recategorize,
    getAccounts, getUsedCategories, getMonths, filter,
    getExpenses, getIncome,
    getBudget, saveBudget,
    detectTransferPairs, markTransferPair, unmarkTransferPair, getConfirmedTransfers,
    findDuplicates, addWithDuplicateResolution,
    CATEGORIES, CATEGORY_KEYWORDS, BUSINESS_CATEGORIES, autoContext,
    setActiveContext, getActiveContext, uid
  };
})();
