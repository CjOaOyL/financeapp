/* ============================================
   Merchant Rules — persistent merchant -> category memory
   Once a transaction's category is corrected by hand, the same
   merchant is auto-categorized correctly on every future import.
   ============================================ */

const MerchantRules = (() => {
  const KEY = 'finance_dashboard_merchant_rules';

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  }

  function saveAll(rules) {
    localStorage.setItem(KEY, JSON.stringify(rules));
    window.dispatchEvent(new CustomEvent('merchant-rules-updated'));
  }

  /** Normalize a merchant name or description into a lookup key. */
  function normalize(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Derive the rule key for a transaction (prefers resolved merchant over raw description). */
  function keyFor(tx) {
    if (!tx) return '';
    return normalize(tx._merchant || tx.description);
  }

  /** Look up a rule for a transaction object (or a bare merchant/description string). */
  function get(txOrText) {
    const key = typeof txOrText === 'string' ? normalize(txOrText) : keyFor(txOrText);
    if (!key) return null;
    return getAll()[key] || null;
  }

  /** Look up a rule by explicit merchant + description hint (used at parse time, before a tx object exists). */
  function getByHint(merchant, description) {
    const key = normalize(merchant || description);
    if (!key) return null;
    return getAll()[key] || null;
  }

  /** Save/overwrite the rule for a transaction's merchant. */
  function set(tx, category, context) {
    const key = keyFor(tx);
    if (!key) return;
    const rules = getAll();
    rules[key] = {
      category,
      context: context || (typeof DataManager !== 'undefined' ? DataManager.autoContext(category) : 'personal'),
      merchant: tx._merchant || tx.description || key,
      updatedAt: new Date().toISOString(),
    };
    saveAll(rules);
  }

  function remove(key) {
    const rules = getAll();
    delete rules[key];
    saveAll(rules);
  }

  /** List all rules, newest first, for a management UI. */
  function list() {
    return Object.entries(getAll())
      .map(([key, rule]) => ({ key, ...rule }))
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }

  return { get, getByHint, set, remove, list, keyFor, normalize };
})();
