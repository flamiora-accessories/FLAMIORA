/* FLAMIORA anonymous shopping analytics.
 * No names, phone numbers, addresses, cookies or advertising IDs are stored here.
 * The session id is a random per-tab identifier used only to aggregate shopping flow.
 */
(function () {
  const SESSION_KEY = 'flm_analytics_session';
  const sessionId = sessionStorage.getItem(SESSION_KEY) || (() => {
    const id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  })();

  const allowed = new Set([
    'page_view','product_view','category_view','search','add_to_cart','remove_from_cart',
    'cart_view','checkout_open','checkout_submit','checkout_success','wishlist_add',
    'wishlist_remove','whatsapp_click','contact_click','share_product'
  ]);

  function safeText(value, max = 120) {
    return String(value == null ? '' : value).trim().slice(0, max);
  }

  async function track(eventName, data = {}) {
    if (!window.db || !allowed.has(eventName)) return;
    const payload = {
      event_name: eventName,
      session_id: sessionId,
      page: safeText(location.pathname.split('/').pop() || 'index.html', 120),
      locale: safeText(document.documentElement.lang || 'ar', 8),
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
    };
    ['product_id','product_name','category_id','query','target','order_id'].forEach((key) => {
      if (data[key] != null && data[key] !== '') payload[key] = safeText(data[key], key === 'query' ? 80 : 120);
    });
    ['quantity','value','cart_count'].forEach((key) => {
      if (data[key] != null && Number.isFinite(Number(data[key]))) payload[key] = Number(data[key]);
    });
    try {
      await db.collection('analytics_events').add(payload);
    } catch (e) {
      // Analytics must never interrupt shopping.
      console.debug('FLAMIORA analytics skipped', e);
    }
  }

  window.FLM_ANALYTICS = { track, sessionId };
  window.trackEvent = track;

  document.addEventListener('DOMContentLoaded', () => {
    track('page_view');
  });
})();

/* Lightweight engagement signals: no PII, no advertising identifiers. */
(function () {
  let maxDepth = 0;
  let lastSent = 0;
  function depth() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    return Math.min(100, Math.round((window.scrollY / max) * 100));
  }
  function sendDepth() {
    const d = depth();
    if (d < 25 || d <= maxDepth || d === lastSent) return;
    maxDepth = d;
    if ([25,50,75,90].some(x => d >= x && lastSent < x)) {
      const threshold = [25,50,75,90].find(x => d >= x && lastSent < x);
      lastSent = threshold;
      if (window.trackEvent) window.trackEvent('page_view', { target: `scroll_${threshold}` });
    }
  }
  window.addEventListener('scroll', sendDepth, { passive: true });
})();
