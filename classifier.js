/* ============================================
   Smart Classifier — AI-like classification engine
   Uses keyword matching, contextual clues, web search,
   and surrounding transaction analysis to suggest categories.
   ============================================ */

const Classifier = (() => {
  'use strict';

  const SEARCH_CACHE_KEY = 'finance_dashboard_search_cache';

  /* ---- Contextual signals for enhanced classification ---- */

  // Time-based hints: lunch spots more likely mid-day on weekdays
  const TIME_PATTERNS = {
    'Dining': {
      hint: 'Transaction date/amount suggests a meal',
      amountRange: [5, 80] // typical meal range
    },
    'Groceries': {
      hint: 'Amount typical of grocery shopping',
      amountRange: [20, 300]
    },
    'Transportation': {
      hint: 'Amount typical of fuel or ride-share',
      amountRange: [3, 80]
    }
  };

  // Description patterns beyond simple keyword matching — regex-based
  const PATTERN_RULES = [
    // Dining patterns
    { pattern: /\bwine\b/i, category: 'Dining', reason: '"wine" in name — likely a wine bar or restaurant' },
    { pattern: /\bpub\b/i, category: 'Dining', reason: '"pub" in name — a bar/pub establishment' },
    { pattern: /\btavern\b/i, category: 'Dining', reason: '"tavern" — a dining/drinking establishment' },
    { pattern: /\bbrewery?\b/i, category: 'Dining', reason: 'brewery — craft beer establishment' },
    { pattern: /\bbistro\b/i, category: 'Dining', reason: '"bistro" — a casual restaurant' },
    { pattern: /\bcantina\b/i, category: 'Dining', reason: '"cantina" — a restaurant' },
    { pattern: /\btrattoria\b/i, category: 'Dining', reason: '"trattoria" — Italian restaurant' },
    { pattern: /\bosteria\b/i, category: 'Dining', reason: '"osteria" — Italian restaurant' },
    { pattern: /\bbrasserie\b/i, category: 'Dining', reason: '"brasserie" — French restaurant' },
    { pattern: /\btapas\b/i, category: 'Dining', reason: '"tapas" — Spanish restaurant/bar' },
    { pattern: /\bramen\b/i, category: 'Dining', reason: '"ramen" — noodle restaurant' },
    { pattern: /\bpho\b/i, category: 'Dining', reason: '"pho" — Vietnamese restaurant' },
    { pattern: /\bsushi\b/i, category: 'Dining', reason: '"sushi" — Japanese restaurant' },
    { pattern: /\bbbq\b/i, category: 'Dining', reason: '"BBQ" — barbecue restaurant' },
    { pattern: /\bwaffles?\b/i, category: 'Dining', reason: 'breakfast/waffle establishment' },
    { pattern: /\bpancake\b/i, category: 'Dining', reason: 'breakfast establishment' },
    { pattern: /\bsteakhouse\b/i, category: 'Dining', reason: 'steakhouse restaurant' },
    { pattern: /\bchophouse\b/i, category: 'Dining', reason: 'chophouse restaurant' },
    { pattern: /\bseafood\b/i, category: 'Dining', reason: 'seafood restaurant' },
    { pattern: /\bcrab\b/i, category: 'Dining', reason: 'likely a crab/seafood restaurant' },
    { pattern: /\boyster\b/i, category: 'Dining', reason: 'oyster bar/restaurant' },
    { pattern: /\btap\s*house\b/i, category: 'Dining', reason: 'taphouse — bar/restaurant' },
    { pattern: /\bale\s*house\b/i, category: 'Dining', reason: 'ale house — bar/restaurant' },
    { pattern: /\bsmokehouse\b/i, category: 'Dining', reason: 'smokehouse — BBQ restaurant' },
    { pattern: /\bpizzeria\b/i, category: 'Dining', reason: 'pizzeria — pizza restaurant' },
    { pattern: /\bcafe|café\b/i, category: 'Dining', reason: 'café — restaurant/coffee shop' },
    { pattern: /\bfood\s*(hall|court)\b/i, category: 'Dining', reason: 'food hall/court' },
    { pattern: /\beat(s|ery)?\b/i, category: 'Dining', reason: '"eats/eatery" in name — restaurant' },
    { pattern: /\bburrito\b/i, category: 'Dining', reason: 'burrito — Mexican food' },
    { pattern: /\bbowl\b/i, category: 'Dining', reason: 'bowl — likely a bowl restaurant' },
    { pattern: /\bcurry\b/i, category: 'Dining', reason: 'curry — likely restaurant' },
    { pattern: /\bdeli\b/i, category: 'Dining', reason: 'deli — delicatessen' },

    // Gas station / convenience patterns
    { pattern: /\bgas\b/i, category: 'Transportation', reason: 'gas — fuel purchase' },
    { pattern: /\bfuel\b/i, category: 'Transportation', reason: 'fuel purchase' },
    { pattern: /\bpetro(leum)?\b/i, category: 'Transportation', reason: 'petroleum — fuel purchase' },

    // Shopping patterns
    { pattern: /\bmart\b/i, category: 'Shopping', reason: '"mart" — retail store' },
    { pattern: /\bsupply\b/i, category: 'Shopping', reason: 'supply store' },
    { pattern: /\boutlet\b/i, category: 'Shopping', reason: 'outlet store' },
    { pattern: /\bboutique\b/i, category: 'Shopping', reason: 'boutique — retail shop' },
    { pattern: /\bgallery\b/i, category: 'Shopping', reason: 'gallery — retail' },
    { pattern: /\bjewel(ry|ers?)?\b/i, category: 'Shopping', reason: 'jewelry store' },
    { pattern: /\belectronic/i, category: 'Shopping', reason: 'electronics store' },
    { pattern: /\bfurniture\b/i, category: 'Shopping', reason: 'furniture store' },
    { pattern: /\bappliance\b/i, category: 'Shopping', reason: 'appliance store' },
    { pattern: /\bliquor\b/i, category: 'Shopping', reason: 'liquor store' },

    // Travel patterns
    { pattern: /\binn\b/i, category: 'Travel', reason: '"inn" — hotel/lodging' },
    { pattern: /\blodge\b/i, category: 'Travel', reason: '"lodge" — lodging' },
    { pattern: /\bsuites?\b/i, category: 'Travel', reason: '"suites" — hotel' },
    { pattern: /\bresort\b/i, category: 'Travel', reason: 'resort — travel lodging' },
    { pattern: /\bairport\b/i, category: 'Travel', reason: 'airport — travel expense' },
    { pattern: /\bcar\s*rental\b/i, category: 'Travel', reason: 'car rental' },

    // Entertainment patterns
    { pattern: /\bevent\b/i, category: 'Entertainment', reason: 'event — entertainment' },
    { pattern: /\bticket\b/i, category: 'Entertainment', reason: 'ticket purchase — entertainment' },
    { pattern: /\bgaming\b/i, category: 'Entertainment', reason: 'gaming — entertainment' },

    // Healthcare patterns
    { pattern: /\bdr\.?\s/i, category: 'Healthcare', reason: '"Dr." prefix — medical' },
    { pattern: /\bmd\b/i, category: 'Healthcare', reason: '"MD" — medical' },
    { pattern: /\bdds\b/i, category: 'Healthcare', reason: '"DDS" — dental' },
    { pattern: /\bortho/i, category: 'Healthcare', reason: 'ortho — medical' },
    { pattern: /\bderm/i, category: 'Healthcare', reason: 'derm — dermatology' },

    // Subscription patterns
    { pattern: /monthly|annual|yearly|recurring/i, category: 'Subscriptions', reason: 'recurring payment pattern' },
    { pattern: /\bpro\s*plan\b/i, category: 'Subscriptions', reason: 'pro plan — subscription' },
    { pattern: /\bpremium\b/i, category: 'Subscriptions', reason: 'premium — subscription' },

    // Personal care patterns
    { pattern: /\bhair\b/i, category: 'Personal Care', reason: '"hair" — personal care' },
    { pattern: /\bnails?\b/i, category: 'Personal Care', reason: 'nail — personal care' },
    { pattern: /\bbeauty\b/i, category: 'Personal Care', reason: 'beauty — personal care' },
  ];

  /**
   * Run the smart classifier on all unclassified ("Other") transactions.
   * Returns an array of { tx, suggestedCategory, confidence, reasons[] }
   */
  function analyzeUnclassified() {
    const all = DataManager.getAll();
    const results = [];

    const otherTxs = all.filter(t => t.category === 'Other');
    for (const tx of otherTxs) {
      const analysis = classifyTransaction(tx, all);
      results.push(analysis);
    }

    // Sort: those with suggestions first, then by confidence
    results.sort((a, b) => {
      if (a.suggestedCategory && !b.suggestedCategory) return -1;
      if (!a.suggestedCategory && b.suggestedCategory) return 1;
      return b.confidence - a.confidence;
    });

    return results;
  }

  /**
   * Classify a single transaction using multiple signals
   */
  function classifyTransaction(tx, allTxs) {
    const desc = (tx.description || '').toLowerCase();
    const originalDesc = (tx._originalDesc || tx.description || '').toLowerCase();
    const reasons = [];
    const scores = {}; // category -> score

    // 1) Pattern-based matching
    for (const rule of PATTERN_RULES) {
      if (rule.pattern.test(desc) || rule.pattern.test(originalDesc)) {
        scores[rule.category] = (scores[rule.category] || 0) + 30;
        reasons.push(rule.reason);
      }
    }

    // 2) Keyword matching (partial — catches things autoCategory might miss due to word boundaries)
    for (const [cat, keywords] of Object.entries(DataManager.CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        // More lenient matching: try with/without spaces
        const kwLower = kw.toLowerCase().trim();
        if (desc.includes(kwLower) || originalDesc.includes(kwLower)) {
          scores[cat] = (scores[cat] || 0) + 20;
          reasons.push(`keyword "${kw}" matches → ${cat}`);
          break; // One keyword per category is enough
        }
      }
    }

    // 3) Amount-based heuristics
    const amt = Math.abs(tx.amount);
    if (amt >= 5 && amt <= 25) {
      scores['Dining'] = (scores['Dining'] || 0) + 5;
      // Don't add to reasons unless it tips the balance
    }
    if (amt >= 25 && amt <= 75 && !desc.includes('gas') && !desc.includes('fuel')) {
      scores['Dining'] = (scores['Dining'] || 0) + 3;
    }

    // 4) Contextual: check nearby transactions (within 1 day) for travel clustering
    if (allTxs) {
      const nearbyTxs = allTxs.filter(t =>
        t.id !== tx.id &&
        Math.abs(new Date(t.date) - new Date(tx.date)) <= 2 * 86400000 // 2 days
      );
      const travelNearby = nearbyTxs.filter(t => t.category === 'Travel').length;
      if (travelNearby >= 2) {
        scores['Travel'] = (scores['Travel'] || 0) + 15;
        reasons.push(`${travelNearby} nearby travel transactions — could be part of a trip`);
      }
      const diningNearby = nearbyTxs.filter(t => t.category === 'Dining').length;
      if (diningNearby >= 2 && amt >= 5 && amt <= 80) {
        scores['Dining'] = (scores['Dining'] || 0) + 8;
        reasons.push(`${diningNearby} nearby dining transactions — possible meal`);
      }
    }

    // 5) Check learned categories (same description previously categorized)
    if (allTxs) {
      const similar = allTxs.filter(t =>
        t.id !== tx.id &&
        t.category !== 'Other' &&
        t.description &&
        normForComparison(t.description) === normForComparison(tx.description)
      );
      if (similar.length > 0) {
        const learnedCat = similar[0].category;
        scores[learnedCat] = (scores[learnedCat] || 0) + 40;
        reasons.push(`Learned: "${tx.description}" was previously categorized as ${learnedCat}`);
      }
    }

    // Find the top scoring category
    let bestCat = null;
    let bestScore = 0;
    for (const [cat, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestCat = cat;
      }
    }

    // Confidence scale: 0-100
    const confidence = Math.min(100, bestScore);

    return {
      tx,
      suggestedCategory: bestCat,
      confidence,
      reasons,
      allScores: scores
    };
  }

  function normForComparison(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /* ---- Vendor Normalization & Grouping ---- */

  /**
   * Normalize a transaction to a canonical vendor key.
   * Uses resolved _merchant when available, otherwise strips
   * addresses, store numbers, and noise from the cleaned description.
   */
  function normalizeVendorKey(tx) {
    // 1) If DescriptionCleaner already resolved a merchant name, use it
    if (tx._merchant) {
      return tx._merchant.toLowerCase().trim();
    }

    let name = (tx.description || tx._originalDesc || '').trim();
    if (!name) return '';

    // 2) Strip store/location numbers: #1234, Store 456, Ste 12, Unit 3
    name = name.replace(/\s*#\d+/g, '');
    name = name.replace(/\b(?:store|ste|suite|unit|loc|location)\s*#?\d+/gi, '');

    // 3) Strip address components: street numbers, City ST, zip codes
    name = name.replace(/\s+\d{1,5}\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Cir|Circle|Pkwy|Parkway|Hwy|Highway|Pike|Ter|Terrace|Trail|Trl)\b.*/i, '');
    name = name.replace(new RegExp(',?\\s*(?:' + US_STATES + ')(?:\\s+\\d{5}(?:-\\d{4})?)?\\s*$', 'i'), '');
    name = name.replace(/\s+\d{5}(-\d{4})?\s*$/, ''); // trailing zip

    // 4) Strip trailing digits/codes (6+ digits)
    name = name.replace(/\s+\d{6,}\s*$/, '');

    // 5) Collapse whitespace and lowercase
    name = name.replace(/\s{2,}/g, ' ').trim().toLowerCase();

    // 6) Try matching against the merchant lookup for further normalization
    if (typeof DescriptionCleaner !== 'undefined' && DescriptionCleaner.MERCHANT_LOOKUP) {
      const lookup = DescriptionCleaner.MERCHANT_LOOKUP;
      for (const [key, resolved] of Object.entries(lookup)) {
        if (name.startsWith(key) || name.includes(key)) {
          return resolved.toLowerCase();
        }
      }
    }

    return name;
  }

  /**
   * Group ALL transactions by normalized vendor key.
   * Returns an object: { vendorKey: { name, transactions[], classified[], unclassified[], dominantCategory } }
   */
  function getVendorGroups() {
    const all = DataManager.getAll();
    const groups = {};

    for (const tx of all) {
      const key = normalizeVendorKey(tx);
      if (!key || key.length < 2) continue; // skip empty/tiny keys

      if (!groups[key]) {
        groups[key] = {
          name: tx._merchant || tx.description,
          transactions: [],
          classified: [],
          unclassified: []
        };
      }
      groups[key].transactions.push(tx);
      if (tx.category === 'Other') {
        groups[key].unclassified.push(tx);
      } else {
        groups[key].classified.push(tx);
      }
    }

    // Determine dominant category for each group (most common non-Other category)
    for (const group of Object.values(groups)) {
      if (group.classified.length > 0) {
        const catCounts = {};
        for (const tx of group.classified) {
          catCounts[tx.category] = (catCounts[tx.category] || 0) + 1;
        }
        group.dominantCategory = Object.entries(catCounts)
          .sort((a, b) => b[1] - a[1])[0][0];
      } else {
        group.dominantCategory = null;
      }
    }

    return groups;
  }

  /**
   * Get vendor groups that have actionable matches:
   * groups where at least one tx is classified AND at least one is unclassified.
   * Returns sorted array of { vendorKey, name, dominantCategory, classifiedCount, unclassifiedCount, unclassifiedTxs }
   */
  function getActionableVendorGroups() {
    const groups = getVendorGroups();
    const actionable = [];

    for (const [key, group] of Object.entries(groups)) {
      if (group.classified.length > 0 && group.unclassified.length > 0) {
        actionable.push({
          vendorKey: key,
          name: group.name,
          dominantCategory: group.dominantCategory,
          classifiedCount: group.classified.length,
          unclassifiedCount: group.unclassified.length,
          unclassifiedTxs: group.unclassified
        });
      }
    }

    // Sort by unclassified count descending
    actionable.sort((a, b) => b.unclassifiedCount - a.unclassifiedCount);
    return actionable;
  }

  /**
   * Apply a category to all unclassified transactions matching a vendor key.
   * Skips transactions with _manualOverride = true.
   * Returns count of transactions updated.
   */
  function applyVendorCategory(vendorKey, category) {
    const all = DataManager.getAll();
    let count = 0;

    for (const tx of all) {
      if (tx.category !== 'Other') continue;
      if (tx._manualOverride) continue;
      const key = normalizeVendorKey(tx);
      if (key === vendorKey) {
        tx.category = category;
        count++;
      }
    }

    if (count > 0) DataManager.saveAll(all);
    return count;
  }

  /**
   * Apply vendor categories for ALL actionable vendor groups at once.
   * Returns { totalUpdated, groupsApplied, details[] }
   */
  function applyAllVendorCategories() {
    const actionable = getActionableVendorGroups();
    const all = DataManager.getAll();
    let totalUpdated = 0;
    const details = [];

    for (const group of actionable) {
      let groupCount = 0;
      for (const tx of all) {
        if (tx.category !== 'Other') continue;
        if (tx._manualOverride) continue;
        const key = normalizeVendorKey(tx);
        if (key === group.vendorKey) {
          tx.category = group.dominantCategory;
          groupCount++;
        }
      }
      if (groupCount > 0) {
        details.push({ name: group.name, category: group.dominantCategory, count: groupCount });
        totalUpdated += groupCount;
      }
    }

    if (totalUpdated > 0) DataManager.saveAll(all);
    return { totalUpdated, groupsApplied: details.length, details };
  }

  /**
   * Find sibling unclassified transactions for the same vendor as a given tx.
   * Returns { vendorKey, vendorName, siblings[] } or null if no siblings.
   */
  function findVendorSiblings(txId) {
    const all = DataManager.getAll();
    const tx = all.find(t => t.id === txId);
    if (!tx) return null;

    const key = normalizeVendorKey(tx);
    if (!key || key.length < 2) return null;

    const siblings = all.filter(t =>
      t.id !== txId &&
      t.category === 'Other' &&
      !t._manualOverride &&
      normalizeVendorKey(t) === key
    );

    if (siblings.length === 0) return null;

    return {
      vendorKey: key,
      vendorName: tx._merchant || tx.description,
      siblings
    };
  }

  /* ---- Address Detection ---- */

  // US state abbreviations
  const US_STATES = 'AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC';

  // Patterns that indicate a street address is present
  const ADDRESS_PATTERNS = [
    // "123 Main St" / "456 N Broadway Ave" etc.
    /\b\d{1,5}\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Cir|Circle|Pkwy|Parkway|Hwy|Highway|Pike|Ter|Terrace|Trail|Trl)\b/i,
    // "City, ST" or "City, State" patterns (e.g., "Norfolk, VA" or "VIRGINIA BEACH VA")
    new RegExp('\\b[A-Z][a-zA-Z\\s]{2,20},?\\s*(?:' + US_STATES + ')\\b', 'i'),
    // Zip codes
    /\b\d{5}(?:-\d{4})?\b/,
    // "#123" or "Suite 456" unit numbers paired with street context
    /(?:Suite|Ste|Apt|Unit|#)\s*\d+/i,
  ];

  /**
   * Detect if a transaction description contains an address.
   * Returns { hasAddress, addressText, businessName } or null.
   */
  function detectAddress(tx) {
    const desc = tx._originalDesc || tx.description || '';
    const cleaned = tx.description || '';
    const combined = desc + ' ' + cleaned;

    let matched = false;
    let matchedParts = [];

    for (const pat of ADDRESS_PATTERNS) {
      const m = combined.match(pat);
      if (m) {
        matched = true;
        matchedParts.push(m[0].trim());
      }
    }

    const fullAddressPattern = new RegExp(
      '\\b\\d{1,6}\\s+[A-Za-z0-9\\.' + "'" + '\\-\\s]{2,70}\\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Cir|Circle|Pkwy|Parkway|Hwy|Highway|Pike|Ter|Terrace|Trail|Trl)\\b(?:[^\\n]{0,60})?(?:\\b(?:' + US_STATES + ')\\b)?(?:\\s+\\d{5}(?:-\\d{4})?)?',
      'i'
    );
    const fullAddressMatch = combined.replace(/\s{2,}/g, ' ').trim().match(fullAddressPattern);
    if (fullAddressMatch) {
      matched = true;
      matchedParts.unshift(fullAddressMatch[0].trim());
    }

    matchedParts = [...new Set(matchedParts.map(p => p.replace(/\s{2,}/g, ' ').trim()).filter(Boolean))];

    if (!matched) return null;

    // Try to extract the business name (part before the address)
    // Apple Card format often: "Business Name  City  ST"
    // Bank format often: "BUSINESS NAME 123 MAIN ST CITY VA 12345"
    const statePattern = new RegExp(',?\\s*(?:' + US_STATES + ')(?:\\s+\\d{5})?\\s*$', 'i');
    const streetPattern = /\s+\d{1,5}\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Cir|Circle|Pkwy|Parkway|Hwy|Highway|Pike|Ter|Terrace|Trail|Trl)\b.*/i;

    let businessName = cleaned || desc;
    // Strip address portions to isolate business name
    businessName = businessName.replace(streetPattern, '').trim();
    businessName = businessName.replace(statePattern, '').trim();
    businessName = businessName.replace(/\s+\d{5}(-\d{4})?\s*$/, '').trim(); // trailing zip
    businessName = businessName.replace(/\s{2,}/g, ' ').trim();

    // If businessName is empty or too short, use the full description
    if (businessName.length < 2) businessName = cleaned || desc;

    // Build the most complete address text we can
    const addressText = matchedParts.slice(0, 3).join(', ');

    return { hasAddress: true, addressText, businessName };
  }

  /**
   * Auto-search and classify all unclassified transactions that contain addresses.
   * Searches the web for "businessName + addressText" and categorizes based on results.
   * Returns { classified, searched, results[] } where results has per-tx details.
   * Calls progressCallback(current, total, txDesc) if provided.
   */
  async function autoSearchAndClassify(progressCallback) {
    const all = DataManager.getAll();
    const unclassified = all.filter(t => t.category === 'Other');
    const withAddresses = [];

    for (const tx of unclassified) {
      const addr = detectAddress(tx);
      if (addr) {
        withAddresses.push({ tx, ...addr });
      }
    }

    const results = [];
    let classified = 0;

    for (let i = 0; i < withAddresses.length; i++) {
      const { tx, businessName, addressText } = withAddresses[i];
      if (progressCallback) progressCallback(i + 1, withAddresses.length, tx.description);

      // Build search query: use full original description (what user would copy-paste)
      const fullDesc = (tx._originalDesc || tx.description || '').trim();
      const searchQuery = fullDesc || `${businessName} ${addressText}`.trim();
      const cacheKey = `addr_v3_${normForComparison(searchQuery)}`;

      // Check cache
      const cache = getSearchCache();
      let searchResult = cache[cacheKey];

      if (!searchResult) {
        searchResult = await webSearchForBusiness(searchQuery, businessName, addressText);
        // Cache it
        cache[cacheKey] = searchResult;
        setSearchCache(cache);

        // Small delay to be nice to APIs
        await new Promise(r => setTimeout(r, 400));
      }

      const entry = {
        tx,
        businessName,
        addressText,
        searchResult,
        appliedCategory: null
      };

      if (searchResult.suggestedCategory) {
        // Auto-apply the category
        const txInAll = all.find(t => t.id === tx.id);
        if (txInAll) {
          txInAll.category = searchResult.suggestedCategory;
          entry.appliedCategory = searchResult.suggestedCategory;
          classified++;
        }
      }

      results.push(entry);
    }

    if (classified > 0) {
      DataManager.saveAll(all);
    }

    return { classified, searched: withAddresses.length, results };
  }

  /**
   * Search for a business by name + address using multiple real search engines.
   * Priority: Google scrape → DDG Lite → DDG HTML → DDG Instant → OSM → Wiki → keywords → TransactionLookup
   */
  async function webSearchForBusiness(query, businessName, addressText = '') {
    let summary = '';
    let businessType = '';
    let suggestedCategory = null;
    let results = [];
    const queryCandidates = buildSearchQueryCandidates(query, businessName, addressText);
    const activeQuery = queryCandidates[0] || query || businessName || addressText;
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(activeQuery)}`;

    // Helper: attempt a search engine and absorb results
    async function trySearchEngine(name, searchFn, candidates) {
      if (suggestedCategory) return;
      for (const q of candidates) {
        try {
          const r = await searchFn(q);
          if (!r) continue;
          if (!summary && r.summary) summary = r.summary;
          if (!businessType && r.businessType) businessType = r.businessType;
          if (r.results && r.results.length > 0) {
            results = [...results, ...r.results].slice(0, 10);
          }
          if (!suggestedCategory && r.suggestedCategory) {
            suggestedCategory = r.suggestedCategory;
          }
          if (!suggestedCategory && (summary || results.length > 0)) {
            suggestedCategory = inferCategoryFromText(`${summary} ${results.join(' ')}`);
          }
          if (suggestedCategory) {
            console.log(`Classifier [${name}]: found category "${suggestedCategory}" for "${q}"`);
            return;
          }
          if (summary) return; // got info even if no category yet, move on
        } catch (e) { console.log(`Classifier [${name}] error for "${q}":`, e.message); }
      }
    }

    // 1) Google search scrape — most similar to manual user search
    await trySearchEngine('Google', googleSearchScrape, queryCandidates.slice(0, 3));

    // 2) DuckDuckGo Lite — simpler HTML, more parseable
    await trySearchEngine('DDG-Lite', duckDuckGoLiteSearch, queryCandidates.slice(0, 3));

    // 3) DuckDuckGo full HTML
    await trySearchEngine('DDG-HTML', duckDuckGoHtmlSearch, queryCandidates.slice(0, 2));

    // 4) OpenStreetMap (good for address-based lookups)
    if (addressText) {
      await trySearchEngine('OSM', openStreetMapLookup, queryCandidates.slice(0, 2));
    }

    // 5) DuckDuckGo Instant Answer API (good for well-known chains)
    if (!suggestedCategory) {
      for (const q of queryCandidates.slice(0, 2)) {
        try {
          const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
          const result = await proxyFetch(apiUrl, 6000);
          if (!result) continue;
          const data = JSON.parse(result.text);
          if (!summary) {
            if (data.Abstract) summary = data.Abstract;
            else if (data.AbstractText) summary = data.AbstractText;
          }
          if (!businessType && data.Heading) businessType = data.Heading;
          if (data.RelatedTopics) {
            const topicText = data.RelatedTopics.filter(t => t.Text).slice(0, 5).map(t => t.Text);
            results = [...results, ...topicText].slice(0, 10);
          }
          if (!suggestedCategory && (summary || results.length > 0)) {
            suggestedCategory = inferCategoryFromText(`${summary} ${results.join(' ')}`);
          }
          if (summary || suggestedCategory) break;
        } catch (e) { console.log('Classifier: DDG API failed for', q, e.message); }
      }
    }

    // 6) Wikipedia fallback
    if (!summary && !suggestedCategory) {
      try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(businessName)}`;
        const wikiResp = await fetch(wikiUrl, { signal: AbortSignal.timeout(5000) });
        if (wikiResp.ok) {
          const data = await wikiResp.json();
          if (data.extract) {
            summary = data.extract;
            businessType = data.title || '';
            suggestedCategory = inferCategoryFromText(summary);
          }
        }
      } catch (e) { console.log('Classifier: Wiki failed for', businessName, e.message); }
    }

    // 7) Pattern rules on business name
    if (!suggestedCategory) {
      const desc = businessName.toLowerCase();
      for (const rule of PATTERN_RULES) {
        if (rule.pattern.test(desc)) {
          suggestedCategory = rule.category;
          summary = summary || rule.reason;
          break;
        }
      }
    }

    // 8) Keyword match on business name
    if (!suggestedCategory) {
      for (const [cat, keywords] of Object.entries(DataManager.CATEGORY_KEYWORDS)) {
        for (const kw of keywords) {
          if (businessName.toLowerCase().includes(kw.toLowerCase().trim())) {
            suggestedCategory = cat;
            summary = summary || `Keyword "${kw}" matches category ${cat}`;
            break;
          }
        }
        if (suggestedCategory) break;
      }
    }

    // 9) TransactionLookup.com fallback
    if (!suggestedCategory) {
      try {
        const lookupUrl = `https://www.transactionlookup.com/search?q=${encodeURIComponent(businessName)}`;
        const result = await proxyFetch(lookupUrl, 8000);
        if (result && result.text) {
          const html = result.text;
          const rowMatch = html.match(/<tr[^>]*>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>/i);
          if (rowMatch) {
            const merchant = stripHtml(rowMatch[2]);
            const category = stripHtml(rowMatch[3]);
            if (category && category.length > 2 && category.toLowerCase() !== 'unknown') {
              const mappedCategory = inferCategoryFromText(`${merchant} ${category}`);
              suggestedCategory = mappedCategory || category;
              summary = `TransactionLookup.com: ${merchant} → ${category}`;
            }
          }
        }
      } catch (e) { console.log('Classifier: TransactionLookup.com failed for', businessName, e.message); }
    }

    return {
      query,
      summary: summary || 'No information found for this business.',
      businessType,
      suggestedCategory,
      results,
      searchUrl
    };
  }

  function buildSearchQueryCandidates(query, businessName, addressText) {
    const normalizedBusiness = (businessName || '').replace(/\s{2,}/g, ' ').trim();
    const normalizedAddress = (addressText || '').replace(/\s{2,}/g, ' ').trim();
    const normalizedQuery = (query || '').replace(/\s{2,}/g, ' ').trim();

    const candidates = [];

    // 1. Full original description (exactly what the user would copy-paste)
    if (normalizedQuery && normalizedQuery.length > 5) {
      candidates.push(normalizedQuery);
    }

    // 2. Business name + full address (natural search)
    if (normalizedBusiness && normalizedAddress) {
      candidates.push(`${normalizedBusiness} ${normalizedAddress}`);
    }

    // 3. Just the address (often enough to find the business at that location)
    if (normalizedAddress && normalizedAddress.length > 8) {
      candidates.push(normalizedAddress);
    }

    // 4. Business name alone
    if (normalizedBusiness && normalizedBusiness.length > 2) {
      candidates.push(normalizedBusiness);
    }

    // 5. Business name + "store" or "business" for better search results
    if (normalizedBusiness && normalizedBusiness.length > 2) {
      candidates.push(`${normalizedBusiness} store business`);
    }

    return [...new Set(candidates.map(c => c.trim()).filter(c => c.length > 2))].slice(0, 6);
  }

  /* ---- Multi-Proxy Fetch ---- */

  const CORS_PROXIES = [
    url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  /**
   * Fetch a URL through multiple CORS proxies until one works.
   * Returns { text, json?, ok } or null.
   * @param {string} url — target URL
   * @param {number} timeoutMs — per-proxy timeout
   * @param {function} [validator] — optional fn(textContent) => bool; if it returns false the proxy is skipped
   */
  async function proxyFetch(url, timeoutMs = 8000, validator = null) {
    for (const makeProxy of CORS_PROXIES) {
      try {
        const proxyUrl = makeProxy(url);
        const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(timeoutMs) });
        if (!resp.ok) continue;

        const contentType = resp.headers.get('content-type') || '';
        const text = await resp.text();
        if (!text || text.length < 5) continue;

        let body = text;
        let jsonData = undefined;
        // allorigins returns JSON wrapper; codetabs/corsproxy return raw
        if (contentType.includes('application/json') || text.startsWith('{')) {
          try {
            const json = JSON.parse(text);
            // allorigins wraps: { contents: "...", status: {...} }
            if (json.contents !== undefined) {
              body = json.contents;
            } else {
              body = JSON.stringify(json);
              jsonData = json;
            }
          } catch { /* not JSON, treat as raw */ }
        }

        // If caller gave a validator, check the unwrapped body
        if (validator && !validator(body)) {
          console.log(`Classifier: proxy content rejected by validator for ${url}`);
          continue;
        }

        return { text: body, json: jsonData, ok: true };
      } catch (e) {
        console.log(`Classifier: proxy failed for ${url}:`, e.message);
      }
    }
    return null;
  }

  /* ---- Search Engine Implementations ---- */

  function stripHtml(str) {
    return (str || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
      .replace(/\s{2,}/g, ' ').trim();
  }

  /**
   * Google search scrape — closest to what the user does manually.
   * Extracts titles + snippets from Google search results HTML.
   */
  async function googleSearchScrape(query) {
    try {
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5&hl=en`;
      // Validator: Google must return real results (h3 tags or BNeawe blocks), not a CAPTCHA
      const validator = html => /<h3[^>]*>/i.test(html) || /BNeawe/i.test(html) || /result__a/i.test(html);
      const result = await proxyFetch(googleUrl, 10000, validator);
      if (!result || !result.text) return null;

      const html = result.text;
      const snippets = [];
      const titles = [];

      // Extract titles from <h3> tags (Google search result headings)
      for (const m of html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)) {
        const t = stripHtml(m[1]);
        if (t.length > 3) titles.push(t);
        if (titles.length >= 6) break;
      }

      // Extract visible text snippets near result divs
      // Google uses <span> blocks inside result containers
      for (const m of html.matchAll(/<span[^>]*>([^<]{30,300})<\/span>/gi)) {
        const t = stripHtml(m[1]);
        if (t.length > 20 && !t.includes('document.') && !t.includes('function(')) {
          snippets.push(t);
        }
        if (snippets.length >= 8) break;
      }

      // Also try extracting from <div class="BNeawe"> (Google lite result blocks)
      for (const m of html.matchAll(/class="BNeawe[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)) {
        const t = stripHtml(m[1]);
        if (t.length > 15 && t.length < 500) snippets.push(t);
        if (snippets.length >= 10) break;
      }

      const combined = [...new Set([...titles, ...snippets])].slice(0, 8);
      if (combined.length === 0) return null;

      return {
        summary: snippets[0] || titles[0] || '',
        results: combined
      };
    } catch (e) {
      console.log('Classifier: Google scrape failed for', query, e.message);
      return null;
    }
  }

  /**
   * DuckDuckGo Lite — simpler HTML than full DDG, easier to parse.
   */
  async function duckDuckGoLiteSearch(query) {
    try {
      const ddgUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
      // Validator: DDG Lite must have result links or snippet cells
      const validator = html => /result-link|result-snippet|class="result"/i.test(html);
      const result = await proxyFetch(ddgUrl, 8000, validator);
      if (!result || !result.text) return null;

      const html = result.text;
      const snippets = [];
      const titles = [];

      // DDG Lite uses <a> for titles and <td> for snippets in a table layout
      // Handle single-quote, double-quote, or no-quote HTML attributes
      for (const m of html.matchAll(/<a[^>]+class=["']?result-link["']?[^>]*>([\s\S]*?)<\/a>/gi)) {
        const t = stripHtml(m[1]);
        if (t.length > 3) titles.push(t);
        if (titles.length >= 5) break;
      }

      // Also try generic <a rel="nofollow"> links (DDG lite result format)
      if (titles.length === 0) {
        for (const m of html.matchAll(/<a[^>]+rel=["']?nofollow["']?[^>]*>([\s\S]*?)<\/a>/gi)) {
          const t = stripHtml(m[1]);
          if (t.length > 5 && !t.startsWith('http')) titles.push(t);
          if (titles.length >= 5) break;
        }
      }

      // Snippet text is in <td> cells with class "result-snippet"
      for (const m of html.matchAll(/class=["']?result-snippet["']?[^>]*>([\s\S]*?)<\/td>/gi)) {
        const t = stripHtml(m[1]);
        if (t.length > 10) snippets.push(t);
        if (snippets.length >= 5) break;
      }

      // Fallback: extract visible <td> content that looks like snippets
      if (snippets.length === 0) {
        for (const m of html.matchAll(/<td[^>]*>([^<]{25,400})<\/td>/gi)) {
          const t = stripHtml(m[1]);
          if (t.length > 20) snippets.push(t);
          if (snippets.length >= 5) break;
        }
      }

      const combined = [...new Set([...titles, ...snippets])].slice(0, 6);
      if (combined.length === 0) return null;

      return {
        summary: snippets[0] || titles[0] || '',
        results: combined
      };
    } catch (e) {
      console.log('Classifier: DDG Lite failed for', query, e.message);
      return null;
    }
  }

  /**
   * DuckDuckGo HTML (full version) — fallback if Lite doesn't work.
   */
  async function duckDuckGoHtmlSearch(query) {
    try {
      const ddgHtmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      // Validator: DDG HTML must have result links or snippet blocks
      const validator = html => /result__a|result__snippet|result-link/i.test(html);
      const result = await proxyFetch(ddgHtmlUrl, 8000, validator);
      if (!result || !result.text) return null;

      const html = result.text;
      const snippets = [];
      const titles = [];

      for (const match of html.matchAll(/result__snippet[^>]*>([\s\S]*?)<\/(?:a|div|span)>/gi)) {
        const text = stripHtml(match[1]);
        if (text.length > 8) snippets.push(text);
        if (snippets.length >= 5) break;
      }

      for (const match of html.matchAll(/result__a[^>]*>([\s\S]*?)<\/a>/gi)) {
        const text = stripHtml(match[1]);
        if (text.length > 2) titles.push(text);
        if (titles.length >= 5) break;
      }

      // Additional: extract from result__url links for site identification
      for (const match of html.matchAll(/result__url[^>]*>([\s\S]*?)<\/a>/gi)) {
        const text = stripHtml(match[1]);
        if (text.length > 5) snippets.push(`Site: ${text}`);
        if (snippets.length >= 8) break;
      }

      const combined = [...new Set([...titles, ...snippets])].slice(0, 6);
      if (combined.length === 0) return null;

      return {
        summary: snippets[0] || titles[0] || '',
        results: combined
      };
    } catch (e) {
      console.log('Classifier: DDG HTML failed for', query, e.message);
      return null;
    }
  }

  /**
   * OpenStreetMap Nominatim geocoding — good for known places.
   */
  async function openStreetMapLookup(query) {
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&addressdetails=1&extratags=1&q=${encodeURIComponent(query)}`;
      const result = await proxyFetch(osmUrl, 7000);
      if (!result || !result.text) return null;

      const data = JSON.parse(result.text);
      if (!Array.isArray(data) || data.length === 0) return null;

      const top = data[0];
      const tags = top.extratags || {};
      const textParts = [
        top.display_name, top.type, top.class, top.category,
        tags.cuisine, tags.shop, tags.amenity, tags.tourism,
        tags.healthcare, tags.office, tags.leisure, tags.craft,
        tags.brand, tags.operator, tags.description
      ].filter(Boolean);
      const textForInference = textParts.join(' ');
      const inferred = inferCategoryFromText(textForInference);

      return {
        summary: `OpenStreetMap: ${top.display_name || query}${tags.cuisine ? ' (cuisine: ' + tags.cuisine + ')' : ''}${tags.shop ? ' (shop: ' + tags.shop + ')' : ''}`,
        businessType: [top.type, top.class, tags.cuisine, tags.shop].filter(Boolean).join(' / '),
        suggestedCategory: inferred,
        results: [textForInference].filter(Boolean)
      };
    } catch (e) {
      console.log('Classifier: OSM failed for', query, e.message);
      return null;
    }
  }

  /* ---- Web Search for Context ---- */

  function getSearchCache() {
    try { return JSON.parse(localStorage.getItem(SEARCH_CACHE_KEY) || '{}'); } catch { return {}; }
  }
  function setSearchCache(cache) {
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
  }

  /**
   * Search for a transaction description online to get more context.
   * Uses multiple real search engines (Google scrape, DDG Lite, DDG HTML,
   * OpenStreetMap) via multi-proxy fallback, then DDG Instant Answer and
   * Wikipedia as last resorts.
   */
  async function searchForContext(tx) {
    const rawDesc = tx._originalDesc || tx.description || '';
    const cacheKey = 'ctx_v3_' + normForComparison(rawDesc);

    // Check cache first
    const cache = getSearchCache();
    if (cache[cacheKey]) return cache[cacheKey];

    const query = rawDesc.replace(/[^a-zA-Z0-9\s&'#.,/-]/g, '').trim();
    if (!query) return { summary: 'No searchable description', results: [], searchUrl: '' };

    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' business')}`;

    let summary = '';
    let businessType = '';
    let suggestedCategory = null;
    let results = [];

    // Helper: try a search engine and collect text
    // Search functions return { summary, results, businessType?, suggestedCategory? }
    async function tryEngine(label, fn) {
      try {
        const r = await fn();
        if (!r) return false;
        // Collect results from { summary, results } format
        const items = r.results || r.snippets || [];
        const allText = [r.summary || '', ...items].join(' ').trim();
        if (allText.length < 5) return false;

        if (!summary && allText.length > 20) {
          summary = allText.substring(0, 500);
        }
        if (items.length > 0) {
          results = results.concat(items.slice(0, 5));
        }
        if (r.businessType) businessType = businessType || r.businessType;
        if (r.suggestedCategory) suggestedCategory = suggestedCategory || r.suggestedCategory;
        if (!suggestedCategory) {
          const cat = inferCategoryFromText(allText);
          if (cat) suggestedCategory = cat;
        }
        console.log(`Classifier: ${label} returned ${items.length} items, cat=${suggestedCategory||'none'}`);
        return true;
      } catch (e) {
        console.log(`Classifier: ${label} failed:`, e.message);
      }
      return false;
    }

    // --- Step 1: Real search engines with full description ---
    await tryEngine('Google', () => googleSearchScrape(query));

    if (!suggestedCategory) {
      await tryEngine('DDG-Lite', () => duckDuckGoLiteSearch(query));
    }

    if (!suggestedCategory) {
      await tryEngine('DDG-HTML', () => duckDuckGoHtmlSearch(query));
    }

    // --- Step 2: OpenStreetMap for address-bearing descriptions ---
    if (!suggestedCategory) {
      const osmResult = await openStreetMapLookup(query);
      if (osmResult && osmResult.summary) {
        summary = summary || osmResult.summary;
        businessType = businessType || osmResult.businessType || '';
        suggestedCategory = suggestedCategory || osmResult.suggestedCategory;
        if (osmResult.results) results = results.concat(osmResult.results);
      }
    }

    // --- Step 3: DDG Instant Answer API (Wikipedia-style) ---
    if (!suggestedCategory) {
      try {
        const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
        const proxyResult = await proxyFetch(apiUrl, 8000);
        if (proxyResult && proxyResult.text) {
          const data = JSON.parse(proxyResult.text);
          if (data.Abstract || data.AbstractText) {
            const abs = data.Abstract || data.AbstractText;
            summary = summary || abs;
            businessType = businessType || data.Heading || '';
            suggestedCategory = suggestedCategory || inferCategoryFromText(abs);
          }
          if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            results = results.concat(
              data.RelatedTopics.filter(t => t.Text).slice(0, 3).map(t => t.Text)
            );
          }
        }
      } catch (e) {
        console.log('Classifier: DDG Instant Answer failed', e.message);
      }
    }

    // --- Step 4: Wikipedia direct API ---
    if (!summary) {
      try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const wikiResp = await fetch(wikiUrl, { signal: AbortSignal.timeout(5000) });
        if (wikiResp.ok) {
          const wikiData = await wikiResp.json();
          if (wikiData.extract) {
            summary = wikiData.extract;
            businessType = businessType || wikiData.title || '';
            suggestedCategory = suggestedCategory || inferCategoryFromText(summary);
          }
        }
      } catch (e) {
        console.log('Classifier: Wikipedia lookup failed', e.message);
      }
    }

    // --- Step 5: TransactionLookup.com ---
    if (!suggestedCategory) {
      try {
        const lookupUrl = `https://www.transactionlookup.com/search?q=${encodeURIComponent(query)}`;
        const html = await proxyFetch(lookupUrl, 8000);
        if (html) {
          const rowMatch = html.match(/<tr[^>]*>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>/i);
          if (rowMatch) {
            const merchant = rowMatch[2].replace(/<[^>]+>/g, '').trim();
            const category = rowMatch[3].replace(/<[^>]+>/g, '').trim();
            if (category && category.length > 2 && category.toLowerCase() !== 'unknown') {
              suggestedCategory = suggestedCategory || category;
              summary = summary || `TransactionLookup.com: ${merchant} → ${category}`;
            }
          }
        }
      } catch (e) { console.log('Classifier: TransactionLookup.com failed', e.message); }
    }

    const result = {
      query,
      summary: summary || 'No instant answer found. Click "Search Web" for full results.',
      businessType,
      suggestedCategory,
      results: [...new Set(results)].slice(0, 8),
      searchUrl
    };

    // Cache the result
    cache[cacheKey] = result;
    setSearchCache(cache);

    return result;
  }

  /**
   * Infer a category from descriptive text (e.g., search result summary)
   */
  function inferCategoryFromText(text) {
    const t = text.toLowerCase();

    const textSignals = [
      { words: ['restaurant', 'food', 'dining', 'cuisine', 'eatery', 'chef', 'menu', 'meal', 'brunch', 'breakfast', 'lunch', 'dinner', 'fast food', 'pizza', 'burger', 'sushi', 'wine bar', 'cocktail', 'pub', 'tavern', 'café', 'cafe', 'coffee shop', 'bakery', 'ice cream', 'barbecue', 'bbq', 'deli', 'catering', 'bistro', 'grill', 'wings', 'steak', 'seafood', 'noodle', 'ramen', 'taco', 'burrito', 'sandwich', 'donut', 'doughnut', 'bagel', 'waffle', 'pancake', 'buffet', 'bar and grill', 'tapas', 'hibachi', 'teriyaki', 'poke', 'gelato', 'frozen yogurt', 'smoothie', 'juice bar', 'food truck', 'carry out', 'takeout', 'delivery', 'order online', 'drive thru', 'dine in'], category: 'Dining' },
      { words: ['grocery', 'supermarket', 'food store', 'produce', 'meat market', 'farmer market', 'organic', 'health food', 'bulk food', 'wholesale club'], category: 'Groceries' },
      { words: ['gasoline', 'fuel', 'gas station', 'petroleum', 'car wash', 'auto repair', 'mechanic', 'tire', 'automotive', 'parking', 'ride-hailing', 'rideshare', 'taxi', 'cab', 'oil change', 'auto parts', 'car rental', 'car service', 'body shop', 'transmission', 'brake', 'muffler', 'garage', 'towing'], category: 'Transportation' },
      { words: ['hotel', 'motel', 'resort', 'airline', 'travel', 'tourism', 'flight', 'cruise', 'vacation', 'lodging', 'accommodation', 'bed and breakfast', 'inn', 'hostel', 'airbnb', 'booking', 'check-in'], category: 'Travel' },
      { words: ['retail', 'clothing', 'apparel', 'fashion', 'shoes', 'electronics', 'hardware', 'home improvement', 'department store', 'discount store', 'furniture', 'jewelry', 'eyewear', 'optical', 'thrift', 'consignment', 'boutique', 'gift shop', 'souvenir', 'toy', 'pet store', 'pet supply', 'craft store', 'hobby', 'sporting goods', 'outdoor', 'garden center', 'nursery', 'florist', 'flower shop', 'mattress', 'appliance', 'smoke shop', 'vape', 'liquor store', 'wine shop', 'beer store', 'convenience store', 'dollar store', 'variety store'], category: 'Shopping' },
      { words: ['entertainment', 'cinema', 'movie', 'theater', 'concert', 'music', 'gaming', 'amusement', 'theme park', 'streaming', 'sports', 'bowling', 'arcade', 'mini golf', 'go kart', 'escape room', 'trampoline', 'laser tag', 'karaoke', 'billiard', 'pool hall', 'comedy club', 'nightclub', 'lounge', 'club'], category: 'Entertainment' },
      { words: ['medical', 'health', 'hospital', 'doctor', 'pharmacy', 'dental', 'clinic', 'healthcare', 'wellness', 'therapeutic', 'pharmaceutical', 'urgent care', 'optometrist', 'chiropract', 'physical therapy', 'lab ', 'imaging', 'radiology', 'dermatol', 'pediatr', 'veterinar', 'vet clinic', 'animal hospital', 'mental health', 'counseling', 'therapy'], category: 'Healthcare' },
      { words: ['subscription', 'software', 'saas', 'platform', 'digital service', 'cloud', 'streaming service', 'membership', 'monthly plan', 'annual plan'], category: 'Subscriptions' },
      { words: ['insurance', 'insurer', 'coverage', 'policy', 'underwriting', 'premium', 'deductible'], category: 'Insurance' },
      { words: ['school', 'college', 'university', 'education', 'learning', 'tuition', 'academic', 'training', 'daycare', 'preschool', 'childcare', 'tutoring', 'lesson'], category: 'Education' },
      { words: ['salon', 'barber', 'beauty', 'spa', 'wellness', 'grooming', 'cosmetic', 'skincare', 'nail', 'hair', 'waxing', 'threading', 'facial', 'massage', 'tanning', 'tattoo', 'piercing', 'lash', 'brow'], category: 'Personal Care' },
      { words: ['charity', 'nonprofit', 'donation', 'foundation', 'church', 'religious', 'temple', 'mosque', 'synagogue', 'ministry', 'tithe', 'offering'], category: 'Gifts & Donations' },
      { words: ['rent', 'mortgage', 'property', 'real estate', 'leasing', 'landlord', 'hoa', 'condo', 'apartment', 'townhouse'], category: 'Housing' },
      { words: ['utility', 'electric', 'water', 'gas ', 'internet', 'telecommunications', 'telecom', 'phone', 'wireless', 'broadband', 'cable', 'power', 'sewer', 'trash', 'waste management'], category: 'Utilities' },
    ];

    let bestCat = null;
    let bestCount = 0;
    for (const { words, category } of textSignals) {
      const count = words.filter(w => t.includes(w)).length;
      if (count > bestCount) {
        bestCount = count;
        bestCat = category;
      }
    }
    return bestCat;
  }

  /**
   * Build context summary for a transaction: nearby transactions, time analysis, etc.
   */
  function getTransactionContext(tx) {
    const all = DataManager.getAll();
    const txDate = new Date(tx.date);
    const dayOfWeek = txDate.getDay(); // 0=Sun...6=Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Nearby transactions (same day or +/- 1 day)
    const nearby = all.filter(t =>
      t.id !== tx.id &&
      Math.abs(new Date(t.date) - txDate) <= 86400000
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Category distribution of nearby
    const nearbyCats = {};
    for (const n of nearby) {
      if (n.category !== 'Other') {
        nearbyCats[n.category] = (nearbyCats[n.category] || 0) + 1;
      }
    }

    // Is this a weekday?
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const amt = Math.abs(tx.amount);

    const clues = [];
    clues.push(`Transaction on ${dayNames[dayOfWeek]} (${tx.date})`);
    clues.push(`Amount: $${amt.toFixed(2)}`);

    if (isWeekday && amt >= 8 && amt <= 25) {
      clues.push('Weekday + typical lunch amount — could be a dining expense');
    }
    if (!isWeekday && amt >= 30 && amt <= 100) {
      clues.push('Weekend + moderate amount — could be dining or entertainment');
    }

    if (nearbyCats['Travel'] >= 2) {
      clues.push(`${nearbyCats['Travel']} travel transactions nearby — possibly part of a trip`);
    }
    if (nearbyCats['Dining'] >= 2) {
      clues.push(`${nearbyCats['Dining']} dining transactions nearby — pattern of eating out`);
    }

    const topNearbyCat = Object.entries(nearbyCats).sort((a, b) => b[1] - a[1])[0];

    return {
      dayOfWeek: dayNames[dayOfWeek],
      isWeekday,
      amount: amt,
      nearby: nearby.slice(0, 6),
      nearbyCats,
      topNearbyCat: topNearbyCat ? topNearbyCat[0] : null,
      clues
    };
  }

  /**
   * Re-run auto-classification on all "Other" transactions and update them
   * Returns count of newly classified transactions
   */
  function reclassifyAll() {
    const all = DataManager.getAll();
    let count = 0;
    for (const tx of all) {
      if (tx.category === 'Other') {
        const newCat = DataManager.autoCategory(tx.description);
        if (newCat !== 'Other') {
          tx.category = newCat;
          count++;
        } else if (tx._originalDesc) {
          const origCat = DataManager.autoCategory(tx._originalDesc);
          if (origCat !== 'Other') {
            tx.category = origCat;
            count++;
          }
        }
      }
    }
    if (count > 0) DataManager.saveAll(all);
    return count;
  }

  return {
    analyzeUnclassified,
    classifyTransaction,
    searchForContext,
    getTransactionContext,
    inferCategoryFromText,
    reclassifyAll,
    detectAddress,
    autoSearchAndClassify,
    normalizeVendorKey,
    getVendorGroups,
    getActionableVendorGroups,
    applyVendorCategory,
    applyAllVendorCategories,
    findVendorSiblings,
    PATTERN_RULES
  };
})();
