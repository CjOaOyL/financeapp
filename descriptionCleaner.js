/* ============================================
   Description Cleaner — Normalizes bank transaction descriptions
   Strips POS/debit/credit prefixes, resolves truncated merchant
   codes, removes reference numbers and noise.
   ============================================ */

const DescriptionCleaner = (() => {

  /* ---- Transaction type prefixes to strip ---- */
  // Order matters: longer/more-specific first so they match before shorter ones
  const TX_TYPE_PREFIXES = [
    // Debit variants
    /^POS\s+DEBIT\s+VISA\s+DDA\s*/i,
    /^POS\s+DEBIT\s+VISA\s*/i,
    /^POS\s+DEBIT\s+MC\s+DDA\s*/i,
    /^POS\s+DEBIT\s+MC\s*/i,
    /^POS\s+DEBIT\s*/i,
    /^POS\s+PURCHASE\s*/i,
    /^POS\s+WITHDRAWAL\s*/i,
    /^POS\s+REFUND\s*/i,
    /^POS\s+RETURN\s*/i,
    /^POS\s*/i,
    /^DEBIT\s+CARD\s+PURCHASE\s*/i,
    /^DEBIT\s+CARD\s+REFUND\s*/i,
    /^DEBIT\s+PURCHASE\s*/i,
    /^DEBIT\s*/i,
    /^CHECK\s+CARD\s+PURCHASE\s*/i,
    /^CHECK\s+CARD\s*/i,
    /^CHECKCARD\s*/i,
    /^CHK\s+CRD\s*/i,

    // ACH variants
    /^ACH\s+DEBIT\s*/i,
    /^ACH\s+CREDIT\s*/i,
    /^ACH\s+PAYMENT\s*/i,
    /^ACH\s+DEPOSIT\s*/i,
    /^ACH\s+WITHDRAWAL\s*/i,
    /^ACH\s+TRANSACTION\s*/i,
    /^ACH\s*/i,
    /^ELECTRONIC\s+ACH\s*/i,

    // Recurring / auto-pay
    /^RECURRING\s+DEBIT\s*/i,
    /^RECURRING\s+PAYMENT\s*/i,
    /^RECURRING\s+CHECK\s+CARD\s*/i,
    /^RECURRING\s*/i,
    /^AUTO\s+PAY\s*/i,
    /^AUTOPAY\s*/i,
    /^AUTOMATIC\s+PAYMENT\s*/i,

    // Credit / deposit
    /^CREDIT\s+CARD\s+CREDIT\s*/i,
    /^CREDIT\s+MEMO\s*/i,
    /^CREDIT\s*/i,
    /^DEPOSIT\s*/i,
    /^DIRECT\s+DEPOSIT\s*/i,

    // Wire / EFT
    /^WIRE\s+TRANSFER\s*/i,
    /^WIRE\s+IN\s*/i,
    /^WIRE\s+OUT\s*/i,
    /^EFT\s+DEBIT\s*/i,
    /^EFT\s+CREDIT\s*/i,
    /^EFT\s*/i,
    /^ELECTRONIC\s+PAYMENT\s*/i,
    /^ELECTRONIC\s+DEBIT\s*/i,
    /^E-PAYMENT\s*/i,

    // Visa/MC/Discover prefix
    /^VISA\s+DDA\s+PUR\s*/i,
    /^VISA\s+DDA\s*/i,
    /^VISA\s+CHECK\s+CARD\s*/i,
    /^VISA\s*/i,
    /^MASTERCARD\s*/i,
    /^DISCOVER\s*/i,
    /^AMEX\s*/i,

    // Purchase / payment generic
    /^PURCHASE\s+AUTHORIZED\s+ON\s+\d{2}\/\d{2}\s*/i,
    /^PURCHASE\s+AUTHORIZED\s+ON\s*/i,
    /^PURCHASE\s*/i,
    /^PAYMENT\s+TO\s*/i,
    /^PAYMENT\s+SENT\s*/i,
    /^PAYMENT\s*/i,
    /^ONLINE\s+PAYMENT\s*/i,
    /^ONLINE\s+PURCHASE\s*/i,
    /^ONLINE\s+TRANSFER\s*/i,
    /^BILL\s+PAYMENT\s*/i,
    /^BILLPAY\s*/i,

    // Withdrawal / ATM
    /^ATM\s+WITHDRAWAL\s*/i,
    /^ATM\s+DEPOSIT\s*/i,
    /^ATM\s*/i,
    /^WITHDRAWAL\s*/i,
    /^CASH\s+WITHDRAWAL\s*/i,

    // Misc
    /^POINT\s+OF\s+SALE\s*/i,
    /^PENDING\s*/i,
    /^PRE-?AUTHORIZED\s*/i,
    /^PREAUTH\s*/i,
    /^INSTANT\s+TRANSFER\s*/i,
    /^MOBILE\s+PAYMENT\s*/i,
    /^CONTACTLESS\s+PAYMENT\s*/i,
    /^TAP\s+TO\s+PAY\s*/i,
    /^EXTERNAL\s+WITHDRAWAL\s*/i,
    /^EXTERNAL\s+DEPOSIT\s*/i,
  ];

  /* ---- Trailing noise patterns to strip ---- */
  const TRAILING_NOISE = [
    /\s+\d{10,}$/,                              // Long reference numbers at end
    /\s+REF\s*#?\s*\d+$/i,                      // REF #123456
    /\s+TRACE\s*#?\s*\d+$/i,                    // TRACE #123456
    /\s+CONF\s*#?\s*\d+$/i,                     // CONF #123456
    /\s+AUTH\s*#?\s*\d+$/i,                      // AUTH #123456
    /\s+SEQ\s*#?\s*\d+$/i,                       // SEQ #123456
    /\s+TXN\s*#?\s*\d+$/i,                       // TXN #123456
    /\s+CARD\s+\d{4}$/i,                         // CARD 1234
    /\s+XXXX\d{4}$/i,                            // XXXX1234
    /\s+X{1,4}\d{4}$/i,                          // X1234
    /\s+\*{1,4}\d{4}$/i,                         // ****1234
    /\s+\d{2}\/\d{2}\s*$/,                       // trailing date MM/DD
    /\s+\d{6,8}\s*$/,                            // trailing 6-8 digit codes
    /\s+DDA\s+\d+$/i,                            // DDA account numbers
    /\s+CKCD\s+\d+$/i,                           // CKCD numbers
  ];

  /* ---- Inline noise patterns to strip ---- */
  const INLINE_NOISE = [
    /\b\d{3}-\d{3}-\d{4}\b/g,                   // Phone numbers (800-123-4567)
    /\b\d{10,}\b/g,                              // Long digit strings (reference numbers)
    /\bCARD\s*\d{4}\b/gi,                        // CARD 1234
    /\bXXXX\d{4}\b/gi,                           // XXXX1234
    /\bX{2,}\d{4}\b/gi,                          // XX1234
    /\*{2,}\d{4}/g,                              // ****1234
    /\bDDA\s*PUR\b/gi,                           // DDA PUR
    /\bDDA\b/gi,                                 // standalone DDA
    /\bCKCD\b/gi,                                // CKCD
    /\bVISA\b/gi,                                // standalone VISA in middle
    /\bMC\b/g,                                   // standalone MC (uppercase only)
    /\bPUR\b/gi,                                 // standalone PUR
    /\bP\.O\.S\.\s*/gi,                          // P.O.S.
    /\bDES:\s*/gi,                               // DES: prefix
    /\bINDN:\s*/gi,                              // INDN: prefix
    /\bCO ID:\s*\S+/gi,                          // CO ID: prefix
    /\bSEC:\s*\S+/gi,                            // SEC: prefix
    /\bPPD\s+ID:\s*\S+/gi,                       // PPD ID: prefix
    /\bWEB\s+ID:\s*\S+/gi,                       // WEB ID: prefix
    /\bTEL\s+ID:\s*\S+/gi,                       // TEL ID: prefix
    /\bID:\s*\d+/gi,                             // ID: 123456
  ];

  /* ---- Merchant lookup: truncated bank codes → real names ---- */
  // Covers 200+ common truncated merchant names seen on bank statements
  const MERCHANT_LOOKUP = {
    // Amazon family
    'amzn mktp us':         'Amazon',
    'amzn mktp':            'Amazon',
    'amazon mktp':          'Amazon',
    'amzn.com':             'Amazon',
    'amzn digital':         'Amazon Digital',
    'amazon.com':           'Amazon',
    'amazon prime':         'Amazon Prime',
    'amzn prime':           'Amazon Prime',
    'prime video':          'Amazon Prime Video',
    'amzn web services':    'Amazon Web Services (AWS)',
    'amazon web serv':      'Amazon Web Services (AWS)',
    'amznprime':            'Amazon Prime',
    'amazon tips':          'Amazon Tips',
    'amzn mktp us*':        'Amazon',
    'whole foods':          'Whole Foods Market',
    'wholefds':             'Whole Foods Market',
    'wfm':                  'Whole Foods Market',

    // Apple
    'apple.com/bill':       'Apple Services',
    'apple.com':            'Apple',
    'apple store':          'Apple Store',
    'itunes':               'Apple iTunes',
    'itunes.com':           'Apple iTunes',
    'apple cash':           'Apple Cash',
    'apple pay':            'Apple Pay',

    // Google
    'google *':             'Google Services',
    'google play':          'Google Play',
    'google storage':       'Google One Storage',
    'google one':           'Google One',
    'google *youtu':        'YouTube Premium',
    'youtube premium':      'YouTube Premium',
    'youtube music':        'YouTube Music',
    'google cloud':         'Google Cloud',
    'google ads':           'Google Ads',
    'google fi':            'Google Fi',

    // Streaming / Entertainment
    'netflix':              'Netflix',
    'netflix.com':          'Netflix',
    'hulu':                 'Hulu',
    'disney plus':          'Disney+',
    'disneyplus':           'Disney+',
    'disney+':              'Disney+',
    'hbo max':              'HBO Max',
    'hbomax':               'HBO Max',
    'max.com':              'HBO Max',
    'spotify':              'Spotify',
    'spotify usa':          'Spotify',
    'paramount+':           'Paramount+',
    'paramnt+':             'Paramount+',
    'peacock':              'Peacock',
    'peacocktv':            'Peacock',
    'crunchyroll':          'Crunchyroll',
    'crunchy':              'Crunchyroll',
    'audible':              'Audible',
    'kindle':               'Amazon Kindle',

    // Walmart family
    'wal-mart':             'Walmart',
    'walmart':              'Walmart',
    'wm supercenter':       'Walmart',
    'wal mart':             'Walmart',
    'walmart.com':          'Walmart',
    'walmrt':               'Walmart',
    'murphy':               'Murphy USA (Walmart Gas)',
    'sams club':            'Sam\'s Club',
    'sam\'s club':          'Sam\'s Club',

    // Target
    'target':               'Target',
    'target.com':           'Target',
    'tgt':                  'Target',

    // Costco
    'costco whse':          'Costco',
    'costco':               'Costco',
    'costco gas':           'Costco Gas',

    // Groceries
    'kroger':               'Kroger',
    'trader joe':           'Trader Joe\'s',
    'aldi':                 'Aldi',
    'publix':               'Publix',
    'safeway':              'Safeway',
    'heb':                  'H-E-B',
    'h-e-b':                'H-E-B',
    'wegmans':              'Wegmans',
    'food lion':            'Food Lion',
    'stop & shop':          'Stop & Shop',
    'giant food':           'Giant Food',
    'harris teeter':        'Harris Teeter',
    'sprouts':              'Sprouts Farmers Market',
    'winco':                'WinCo Foods',
    'food4less':            'Food 4 Less',
    'meijer':               'Meijer',
    'piggly wiggly':        'Piggly Wiggly',
    'winn-dixie':           'Winn-Dixie',
    'hy-vee':               'Hy-Vee',
    'albertsons':           'Albertsons',
    'food city':            'Food City',
    'fresh market':         'The Fresh Market',

    // Fast food / Dining
    'mcdonald':             'McDonald\'s',
    'mcdonalds':            'McDonald\'s',
    'starbucks':            'Starbucks',
    'sbux':                 'Starbucks',
    'chipotle':             'Chipotle',
    'chick-fil-a':          'Chick-fil-A',
    'chickfila':            'Chick-fil-A',
    'chick fil a':          'Chick-fil-A',
    'chik-fil':             'Chick-fil-A',
    'taco bell':            'Taco Bell',
    'tacobell':             'Taco Bell',
    'wendys':               'Wendy\'s',
    'wendy\'s':             'Wendy\'s',
    'burger king':          'Burger King',
    'five guys':            'Five Guys',
    'in-n-out':             'In-N-Out Burger',
    'panera':               'Panera Bread',
    'panerabread':          'Panera Bread',
    'popeyes':              'Popeyes',
    'dunkin':               'Dunkin\' Donuts',
    'dd donut':             'Dunkin\' Donuts',
    'sonic drive':          'Sonic Drive-In',
    'jack in the box':      'Jack in the Box',
    'whataburger':          'Whataburger',
    'wingstop':             'Wingstop',
    'domino':               'Domino\'s Pizza',
    'papa john':            'Papa John\'s',
    'little caesars':       'Little Caesars',
    'pizza hut':            'Pizza Hut',
    'panda express':        'Panda Express',
    'mod pizza':            'MOD Pizza',
    'sweetgreen':           'Sweetgreen',
    'noodles & co':         'Noodles & Company',
    'ihop':                 'IHOP',
    'dennys':               'Denny\'s',
    'denny\'s':             'Denny\'s',
    'cracker barrel':       'Cracker Barrel',
    'applebees':            'Applebee\'s',
    'applebee':             'Applebee\'s',
    'chilis':               'Chili\'s',
    'olive garden':         'Olive Garden',
    'red lobster':          'Red Lobster',
    'outback':              'Outback Steakhouse',
    'texas roadhouse':      'Texas Roadhouse',
    'longhorn':             'Longhorn Steakhouse',

    // Ride-share / Transportation
    'uber trip':            'Uber (Ride)',
    'uber':                 'Uber',
    'uber eats':            'Uber Eats',
    'uber *eats':           'Uber Eats',
    'uber* eats':           'Uber Eats',
    'lyft':                 'Lyft',
    'lyft *ride':           'Lyft',
    'doordash':             'DoorDash',
    'dd *doordash':         'DoorDash',
    'grubhub':              'Grubhub',
    'instacart':            'Instacart',
    'postmates':            'Postmates',

    // Gas stations
    'shell oil':            'Shell',
    'shell service':        'Shell',
    'chevron':              'Chevron',
    'exxonmobil':           'ExxonMobil',
    'exxon':                'ExxonMobil',
    'mobil':                'Mobil',
    'bp#':                  'BP',
    'bp ':                  'BP',
    'sunoco':               'Sunoco',
    'circle k':             'Circle K',
    'racetrac':             'RaceTrac',
    'qt ':                  'QuikTrip',
    'quiktrip':             'QuikTrip',
    'wawa':                 'Wawa',
    'pilot travel':         'Pilot Travel Center',
    'loves travel':         'Love\'s Travel Stop',
    'speedway':             'Speedway',
    'valero':               'Valero',
    'marathon petro':       'Marathon',
    'phillips 66':          'Phillips 66',
    'casey\'s':             'Casey\'s General Store',

    // Shopping / Retail
    'best buy':             'Best Buy',
    'bestbuy':              'Best Buy',
    'home depot':           'The Home Depot',
    'homedepot':            'The Home Depot',
    'lowes':                'Lowe\'s',
    'lowe\'s':              'Lowe\'s',
    'ikea':                 'IKEA',
    'nordstrom':            'Nordstrom',
    'nordstrm':             'Nordstrom',
    'macys':                'Macy\'s',
    'macy\'s':              'Macy\'s',
    'tjx':                  'TJ Maxx',
    'tjmaxx':               'TJ Maxx',
    'marshalls':            'Marshalls',
    'ross stores':          'Ross',
    'ross dress':           'Ross',
    'old navy':             'Old Navy',
    'gap':                  'Gap',
    'gap.com':              'Gap',
    'nike':                 'Nike',
    'nike.com':             'Nike',
    'adidas':               'Adidas',
    'foot locker':          'Foot Locker',
    'bath body':            'Bath & Body Works',
    'bath & body':          'Bath & Body Works',
    'ulta':                 'Ulta Beauty',
    'sephora':              'Sephora',
    'michaels':             'Michaels',
    'hobby lobby':          'Hobby Lobby',
    'joann':                'JOANN Fabrics',
    'bed bath':             'Bed Bath & Beyond',
    'pottery barn':         'Pottery Barn',
    'pier 1':               'Pier 1 Imports',
    'dollar tree':          'Dollar Tree',
    'dollar gen':           'Dollar General',
    'five below':           'Five Below',
    'big lots':             'Big Lots',
    'etsy':                 'Etsy',
    'etsy.com':             'Etsy',
    'ebay':                 'eBay',
    'ebay.com':             'eBay',
    'wayfair':              'Wayfair',
    'overstock':            'Overstock',

    // Pharmacy / Health
    'cvs/pharm':            'CVS Pharmacy',
    'cvs pharmacy':         'CVS Pharmacy',
    'cvs':                  'CVS Pharmacy',
    'walgreens':            'Walgreens',
    'walgreen':             'Walgreens',
    'rite aid':             'Rite Aid',
    'express scripts':      'Express Scripts',
    'optumrx':              'OptumRx',
    'labcorp':              'LabCorp',
    'quest diag':           'Quest Diagnostics',

    // Tech / Software
    'adobe':                'Adobe',
    'adobe *':              'Adobe',
    'microsoft':            'Microsoft',
    'msft':                 'Microsoft',
    'microsoft *':          'Microsoft',
    'zoom.us':              'Zoom',
    'zoom video':           'Zoom',
    'dropbox':              'Dropbox',
    'slack':                'Slack',
    'openai':               'OpenAI',
    'chatgpt':              'OpenAI ChatGPT',
    'github':               'GitHub',
    'digitalocean':         'DigitalOcean',
    'godaddy':              'GoDaddy',
    'squarespace':          'Squarespace',
    'wix':                  'Wix',
    'shopify':              'Shopify',
    'canva':                'Canva',

    // Payment platforms
    'paypal':               'PayPal',
    'paypal *':             'PayPal',
    'venmo':                'Venmo',
    'cashapp':              'Cash App',
    'cash app':             'Cash App',
    'sq *':                 'Square',
    'square':               'Square',
    'zelle':                'Zelle',
    'stripe':               'Stripe',

    // Insurance
    'geico':                'GEICO',
    'progressive':          'Progressive',
    'state farm':           'State Farm',
    'allstate':             'Allstate',
    'liberty mutual':       'Liberty Mutual',
    'usaa':                 'USAA',
    'nationwide':           'Nationwide',
    'farmers ins':          'Farmers Insurance',

    // Telecom / Internet
    'comcast':              'Comcast / Xfinity',
    'xfinity':              'Xfinity',
    'verizon':              'Verizon',
    'vzw':                  'Verizon Wireless',
    'att':                  'AT&T',
    'at&t':                 'AT&T',
    't-mobile':             'T-Mobile',
    'tmobile':              'T-Mobile',
    'spectrum':             'Spectrum',
    'cox comm':             'Cox Communications',
    'centurylink':          'CenturyLink',
    'frontier comm':        'Frontier Communications',
    'sprint':               'Sprint',
    'mint mobile':          'Mint Mobile',

    // Fitness / Gym
    'planet fitness':       'Planet Fitness',
    'la fitness':           'LA Fitness',
    'equinox':              'Equinox',
    '24 hour fit':          '24 Hour Fitness',
    'orangetheory':         'Orangetheory Fitness',
    'anytime fit':          'Anytime Fitness',
    'ymca':                 'YMCA',
    'peloton':              'Peloton',

    // Travel / Hotels
    'airbnb':               'Airbnb',
    'vrbo':                 'VRBO',
    'marriott':             'Marriott',
    'hilton':               'Hilton',
    'hyatt':                'Hyatt',
    'ihg':                  'IHG Hotels',
    'holiday inn':          'Holiday Inn',
    'best western':         'Best Western',
    'wyndham':              'Wyndham',
    'expedia':              'Expedia',
    'booking.com':          'Booking.com',
    'southwest air':        'Southwest Airlines',
    'southwest airl':       'Southwest Airlines',
    'united air':           'United Airlines',
    'delta air':            'Delta Air Lines',
    'american air':         'American Airlines',
    'jetblue':              'JetBlue',
    'spirit air':           'Spirit Airlines',
    'frontier air':         'Frontier Airlines',
    'allegiant':            'Allegiant Air',
    'alaska air':           'Alaska Airlines',

    // Home services
    'comcast cable':        'Comcast Cable',
    'duke energy':          'Duke Energy',
    'fpl ':                 'Florida Power & Light',
    'pge ':                 'PG&E',
    'pg&e':                 'PG&E',
    'sce ':                 'Southern California Edison',
    'water utility':        'Water Utility',
  };

  // Build sorted keys for matching (longer first for precedence)
  const MERCHANT_KEYS = Object.keys(MERCHANT_LOOKUP).sort((a, b) => b.length - a.length);

  /* ---- Extract transaction type from the raw description ---- */
  function extractTransactionType(desc) {
    const upper = desc.toUpperCase().trim();
    if (/^POS\b|^POINT\s+OF\s+SALE/i.test(upper))      return 'POS';
    if (/^DEBIT|^CHK?\s*CRD|^CHECK\s*CARD/i.test(upper)) return 'Debit';
    if (/^CREDIT/i.test(upper))                           return 'Credit';
    if (/^ACH/i.test(upper))                              return 'ACH';
    if (/^ATM/i.test(upper))                              return 'ATM';
    if (/^WIRE/i.test(upper))                             return 'Wire';
    if (/^EFT|^ELECTRONIC/i.test(upper))                  return 'EFT';
    if (/^RECURRING|^AUTO\s*PAY|^AUTOPAY/i.test(upper))   return 'Recurring';
    if (/^BILL\s*PAY/i.test(upper))                       return 'Bill Pay';
    if (/^MOBILE\s+PAY|^CONTACTLESS|^TAP\s+TO/i.test(upper)) return 'Mobile Pay';
    if (/^ONLINE/i.test(upper))                           return 'Online';
    if (/^DEPOSIT|^DIRECT\s+DEPOSIT/i.test(upper))        return 'Deposit';
    if (/^WITHDRAWAL/i.test(upper))                       return 'Withdrawal';
    return '';
  }

  /* ---- Main cleaning pipeline ---- */
  function clean(rawDescription) {
    if (!rawDescription) return { cleaned: 'Unknown Transaction', merchant: '', txType: '', original: '' };

    const original = rawDescription.trim();
    let desc = original;

    // 1. Extract transaction type before stripping
    const txType = extractTransactionType(desc);

    // 2. Strip transaction type prefixes
    for (const prefix of TX_TYPE_PREFIXES) {
      desc = desc.replace(prefix, '');
    }

    // 3. Remove inline noise (reference numbers, phone numbers, card numbers, etc.)
    for (const pattern of INLINE_NOISE) {
      desc = desc.replace(pattern, ' ');
    }

    // 4. Remove trailing noise
    for (const pattern of TRAILING_NOISE) {
      desc = desc.replace(pattern, '');
    }

    // 5. Clean up common separator junk
    desc = desc
      .replace(/[*#]+\s*/g, ' ')         // asterisks and hash marks
      .replace(/\s*-\s*$/g, '')           // trailing dashes
      .replace(/^\s*[-–—]\s*/, '')        // leading dashes
      .replace(/\s{2,}/g, ' ')           // collapse multiple spaces
      .trim();

    // 6. Remove trailing city/state patterns (e.g., "HOUSTON TX", "NEW YORK NY 10001")
    desc = desc.replace(/\s+[A-Z]{2}\s+\d{5}(-\d{4})?$/i, '');  // STATE ZIP
    // Only strip short 2-letter state + optional zip at end if preceded by clear city name
    desc = desc.replace(/\s+\b[A-Z][a-zA-Z\s]{2,20}\s+[A-Z]{2}$/i, (match) => {
      // Only strip if it looks like "CITY ST" pattern (not part of merchant name)
      if (/\d/.test(match)) return ''; // has numbers, likely address
      // Check if match is a common state abbreviation pattern
      const parts = match.trim().split(/\s+/);
      if (parts.length >= 2 && parts[parts.length - 1].length === 2) {
        return ''; // Likely city + state
      }
      return match;
    });

    // 7. Resolve truncated merchant names
    const merchant = resolveMerchant(desc);

    // 8. If merchant found, use it; otherwise title-case the cleaned desc
    const cleaned = merchant || titleCase(desc);

    return {
      cleaned: cleaned || 'Unknown Transaction',
      merchant,
      txType,
      original
    };
  }

  /* ---- Merchant resolution ---- */
  function resolveMerchant(desc) {
    const lower = desc.toLowerCase().trim();

    // Try exact prefix match against lookup (longer keys first)
    for (const key of MERCHANT_KEYS) {
      if (lower.startsWith(key) || lower.includes(key)) {
        return MERCHANT_LOOKUP[key];
      }
    }
    return '';
  }

  /* ---- Title case helper ---- */
  function titleCase(str) {
    if (!str) return str;
    // Don't title-case if it looks like a proper name already
    if (/[a-z]/.test(str) && /[A-Z]/.test(str)) return str.trim();
    // Convert ALL CAPS to Title Case
    return str
      .toLowerCase()
      .replace(/(?:^|\s|[-/])\S/g, c => c.toUpperCase())
      .trim();
  }

  /* ---- Batch clean an array of transaction objects ---- */
  function cleanTransactions(transactions) {
    return transactions.map(tx => {
      const result = clean(tx.description);
      return {
        ...tx,
        description: result.cleaned,
        _originalDesc: result.original,
        _txType: result.txType,
        _merchant: result.merchant,
        // Re-categorize using the cleaned name (better keyword matching)
        category: tx.category === 'Other' ? DataManager.autoCategory(result.cleaned) : tx.category
      };
    });
  }

  return {
    clean,
    cleanTransactions,
    resolveMerchant,
    extractTransactionType,
    titleCase,
    MERCHANT_LOOKUP
  };
})();
