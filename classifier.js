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

  /* ---- Web Search for Context ---- */

  function getSearchCache() {
    try { return JSON.parse(localStorage.getItem(SEARCH_CACHE_KEY) || '{}'); } catch { return {}; }
  }
  function setSearchCache(cache) {
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
  }

  /**
   * Search for a transaction description online to get more context.
   * Uses DuckDuckGo Instant Answer API via a CORS proxy, or falls back
   * to returning a search URL the user can open manually.
   */
  async function searchForContext(tx) {
    const desc = tx.description || tx._originalDesc || '';
    const cacheKey = normForComparison(desc);

    // Check cache first
    const cache = getSearchCache();
    if (cache[cacheKey]) return cache[cacheKey];

    const query = desc.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
    if (!query) return { summary: 'No searchable description', results: [], searchUrl: '' };

    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query + ' business')}`;

    // Try DuckDuckGo Instant Answer API via allorigins proxy
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

    let summary = '';
    let businessType = '';
    let suggestedCategory = null;
    let results = [];

    try {
      const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (resp.ok) {
        const proxyData = await resp.json();
        const data = JSON.parse(proxyData.contents);

        // Extract useful info
        if (data.Abstract) {
          summary = data.Abstract;
        } else if (data.AbstractText) {
          summary = data.AbstractText;
        }

        if (data.Heading) {
          businessType = data.Heading;
        }

        // Check related topics for clues
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          results = data.RelatedTopics
            .filter(t => t.Text)
            .slice(0, 5)
            .map(t => t.Text);
        }

        // Try to infer category from the summary
        if (summary) {
          suggestedCategory = inferCategoryFromText(summary);
        }
      }
    } catch (e) {
      console.log('Classifier: search API unavailable, providing search link', e.message);
    }

    // If API didn't give us much, try a Wikipedia-style lookup
    if (!summary) {
      try {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const wikiResp = await fetch(wikiUrl, { signal: AbortSignal.timeout(5000) });
        if (wikiResp.ok) {
          const wikiData = await wikiResp.json();
          if (wikiData.extract) {
            summary = wikiData.extract;
            businessType = wikiData.title || '';
            suggestedCategory = inferCategoryFromText(summary);
          }
        }
      } catch (e) {
        console.log('Classifier: Wikipedia lookup failed', e.message);
      }
    }

    const result = {
      query,
      summary: summary || 'No instant answer found. Click "Search Web" for full results.',
      businessType,
      suggestedCategory,
      results,
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
      { words: ['restaurant', 'food', 'dining', 'cuisine', 'eatery', 'chef', 'menu', 'meal', 'brunch', 'breakfast', 'lunch', 'dinner', 'fast food', 'pizza', 'burger', 'sushi', 'wine bar', 'cocktail', 'pub', 'tavern', 'café', 'cafe', 'coffee shop', 'bakery', 'ice cream', 'barbecue', 'bbq', 'deli', 'catering', 'bistro'], category: 'Dining' },
      { words: ['grocery', 'supermarket', 'food store', 'produce', 'meat market'], category: 'Groceries' },
      { words: ['gasoline', 'fuel', 'gas station', 'petroleum', 'car wash', 'auto repair', 'mechanic', 'tire', 'automotive', 'parking', 'ride-hailing', 'rideshare', 'taxi', 'cab'], category: 'Transportation' },
      { words: ['hotel', 'motel', 'resort', 'airline', 'travel', 'tourism', 'flight', 'cruise', 'vacation', 'lodging', 'accommodation'], category: 'Travel' },
      { words: ['retail', 'clothing', 'apparel', 'fashion', 'shoes', 'electronics', 'hardware', 'home improvement', 'department store', 'discount store', 'furniture', 'jewelry', 'eyewear', 'optical'], category: 'Shopping' },
      { words: ['entertainment', 'cinema', 'movie', 'theater', 'concert', 'music', 'gaming', 'amusement', 'theme park', 'streaming', 'sports'], category: 'Entertainment' },
      { words: ['medical', 'health', 'hospital', 'doctor', 'pharmacy', 'dental', 'clinic', 'healthcare', 'wellness', 'therapeutic', 'pharmaceutical'], category: 'Healthcare' },
      { words: ['subscription', 'software', 'saas', 'platform', 'digital service', 'cloud', 'streaming service', 'membership'], category: 'Subscriptions' },
      { words: ['insurance', 'insurer', 'coverage', 'policy', 'underwriting'], category: 'Insurance' },
      { words: ['school', 'college', 'university', 'education', 'learning', 'tuition', 'academic', 'training'], category: 'Education' },
      { words: ['salon', 'barber', 'beauty', 'spa', 'wellness', 'grooming', 'cosmetic', 'skincare', 'nail'], category: 'Personal Care' },
      { words: ['charity', 'nonprofit', 'donation', 'foundation', 'church', 'religious'], category: 'Gifts & Donations' },
      { words: ['rent', 'mortgage', 'property', 'real estate', 'leasing', 'landlord'], category: 'Housing' },
      { words: ['utility', 'electric', 'water', 'gas ', 'internet', 'telecommunications', 'telecom', 'phone', 'wireless', 'broadband', 'cable'], category: 'Utilities' },
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
    PATTERN_RULES
  };
})();
