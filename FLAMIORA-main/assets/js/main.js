const FLM_DEFAULT_WHATSAPP = '212711088984';

const STORE = {
  name: 'FLAMIORA',
  whatsappNumber: FLM_DEFAULT_WHATSAPP,
  phoneDisplay: '+212 711-088984',
  email: 'flamiora.accessoires@gmail.com',
};

function sanitizeWhatsappNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 9 ? digits : FLM_DEFAULT_WHATSAPP;
}

if (window.FLM_SETTINGS_READY) {
  window.FLM_SETTINGS_READY.then((settings) => {
    STORE.name = settings.brand_name || STORE.name;
    STORE.whatsappNumber = sanitizeWhatsappNumber(settings.whatsapp_number);
    STORE.phoneDisplay = settings.phone_display || STORE.phoneDisplay;
    STORE.email = settings.email || STORE.email;
  });
}

function formatPrice(amount) {
  const locale = getLocale();
  const value = Number(amount).toFixed(2);
  return locale === 'ar' ? `${value} د.م.` : `${value} DH`;
}

function validateMoroccanPhone(value) {
  const digits = String(value || '').replace(/[\s.\-()]/g, '');
  return /^(0|\+212|00212)[5-7]\d{8}$/.test(digits);
}

function stockBadge(product) {
  if (product.stock <= 0) return `<span class="stock-badge out">${t('product.outOfStock')}</span>`;
  if (product.stock <= 5) return `<span class="stock-badge low">${t('product.lowStock')}</span>`;
  return `<span class="stock-badge ok">${t('product.inStock')}</span>`;
}

function stockBadge(product) {
  if (product.stock <= 0) return `<span class="stock-badge out">${t('product.outOfStock')}</span>`;
  if (product.stock <= 5) return `<span class="stock-badge low">${t('product.lowStock')}</span>`;
  return `<span class="stock-badge ok">${t('product.inStock')}</span>`;
}

const CART_KEY = 'flm_cart';

// Cart lines can hold either a product or an ensemble: { id, qty, type }.
// type defaults to 'product' so carts saved before ensembles existed keep working.
function lineType(line) {
  return line && line.type === 'ensemble' ? 'ensemble' : 'product';
}

function getCartItem(line) {
  if (!line) return null;
  if (lineType(line) === 'ensemble') {
    const e = getEnsembleById(line.id);
    // Ensembles are made-to-order sets with no per-unit stock tracking.
    return e ? { ...e, stock: 99 } : null;
  }
  return getProductById(line.id);
}

function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter((line) => line && typeof line.id === 'string' && Number.isFinite(line.qty) && line.qty > 0 && getCartItem(line));
  } catch {
    return [];
  }
}

function saveCart(lines) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  updateCartBadge();
}

function trackStoreEvent(name, data = {}) {
  if (window.FLM_ANALYTICS) window.FLM_ANALYTICS.track(name, data);
}

function addToCart(itemId, qty = 1, type = 'product') {
  const item = type === 'ensemble' ? getEnsembleById(itemId) : getProductById(itemId);
  if (!item) return false;
  const maxQty = type === 'ensemble' ? 99 : item.stock;
  if (type === 'product' && item.stock <= 0) return false;
  const lines = getCart();
  const existing = lines.find((l) => l.id === itemId && lineType(l) === type);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, maxQty);
  } else {
    const initialQty = Math.max(1, Math.min(qty, maxQty));
    lines.push({ id: itemId, qty: initialQty, type });
  }
  saveCart(lines);
  trackStoreEvent('add_to_cart', { product_id: item.id, product_name: item.name_fr || item.name_ar, quantity: qty, value: item.price * qty, cart_count: cartCount() });
  return true;
}

function updateCartQty(itemId, qty, type = 'product') {
  const item = type === 'ensemble' ? getEnsembleById(itemId) : getProductById(itemId);
  if (!item) return;
  const maxQty = type === 'ensemble' ? 99 : item.stock;
  let lines = getCart();
  const clamped = Math.max(1, Math.min(qty, maxQty));
  lines = lines.map((l) => (l.id === itemId && lineType(l) === type ? { ...l, qty: clamped } : l));
  saveCart(lines);
}

function removeFromCart(itemId, type = 'product') {
  const item = type === 'ensemble' ? getEnsembleById(itemId) : getProductById(itemId);
  const old = getCart().find((l) => l.id === itemId && lineType(l) === type);
  const lines = getCart().filter((l) => !(l.id === itemId && lineType(l) === type));
  saveCart(lines);
  if (item) trackStoreEvent('remove_from_cart', { product_id: item.id, product_name: item.name_fr || item.name_ar, quantity: old ? old.qty : 1, value: old ? item.price * old.qty : item.price, cart_count: cartCount() });
}

function cartCount() {
  return getCart().reduce((sum, l) => sum + l.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((sum, l) => {
    const item = getCartItem(l);
    return item ? sum + item.price * l.qty : sum;
  }, 0);
}

function updateCartBadge() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
}

/* ==========================================================================
   Wishlist (localStorage)
   ========================================================================== */
const RECENT_KEY = 'flm_recent_products';
function getRecentProductIds() { try { const a=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]'); return Array.isArray(a)?a.filter(x=>typeof x==='string'):[]; } catch { return []; } }
function rememberProduct(productId) { const ids=getRecentProductIds().filter(id=>id!==productId); ids.unshift(productId); localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0,8))); }
function getRecentProducts(limit=4) { return getRecentProductIds().map(getProductById).filter(Boolean).slice(0,limit); }

const WISHLIST_KEY = 'flm_wishlist';

function getWishlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  updateWishlistBadges();
}

function isFavorite(productId) {
  return getWishlist().includes(productId);
}

function toggleWishlist(productId) {
  const ids = getWishlist();
  const idx = ids.indexOf(productId);
  if (idx === -1) {
    ids.push(productId);
  } else {
    ids.splice(idx, 1);
  }
  saveWishlist(ids);
  const product = getProductById(productId);
  trackStoreEvent(idx === -1 ? 'wishlist_add' : 'wishlist_remove', { product_id: productId, product_name: product ? (product.name_fr || product.name_ar) : '' });
  return ids.includes(productId);
}

function wishlistCount() {
  return getWishlist().length;
}

function updateWishlistBadges() {
  const count = wishlistCount();
  document.querySelectorAll('.wishlist-count').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
  document.querySelectorAll('[data-wish]').forEach((btn) => {
    const active = isFavorite(btn.dataset.wish);
    btn.classList.toggle('is-active', active);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-solid', active);
      icon.classList.toggle('fa-regular', !active);
    }
    btn.setAttribute('aria-label', active ? (getLocale() === 'ar' ? 'إزالة من المفضلة' : 'Retirer des favoris') : (getLocale() === 'ar' ? 'إضافة إلى المفضلة' : 'Ajouter aux favoris'));
  });
}

function wireWishlistButtons(root = document) {
  root.querySelectorAll('[data-wish]').forEach((btn) => {
    if (!btn.querySelector('i')) btn.insertAdjacentHTML('afterbegin', '<i class="fa-regular fa-heart" aria-hidden="true"></i>');
    if (btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.classList.toggle('is-active', isFavorite(btn.dataset.wish));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const active = toggleWishlist(btn.dataset.wish);
      updateWishlistBadges();
      showToast(active ? (getLocale() === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Ajouté aux favoris') : (getLocale() === 'ar' ? 'تمت الإزالة من المفضلة' : 'Retiré des favoris'), active ? 'heart' : '');
    });
  });
}

function showToast(message, type = '') {
  let toast = document.getElementById('flm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'flm-toast';
    toast.className = 'flm-toast';
    document.body.appendChild(toast);
  }
  toast.className = `flm-toast ${type}`;
  toast.innerHTML = type === 'heart' ? '<i class="fa-solid fa-heart" aria-hidden="true"></i>' : '<i class="fa-solid fa-check" aria-hidden="true"></i>';
  toast.append(document.createTextNode(` ${message}`));
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(window.__flmToastTimer);
  window.__flmToastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ==========================================================================
   Global search
   ========================================================================== */
function normalizeSearch(str) {
  return String(str || '').toLowerCase().trim();
}

function searchProducts(query, limit = 8) {
  const q = normalizeSearch(query);
  if (!q) return [];
  const matches = (window.PRODUCTS || []).filter((p) => {
    const category = getCategoryById(p.category_id);
    const haystack = [
      p.name_ar, p.name_fr, p.short_ar, p.short_fr, p.desc_ar, p.desc_fr,
      p.sku, p.slug, category ? category.name_ar : '', category ? category.name_fr : '',
      ...(Array.isArray(p.keywords) ? p.keywords : []),
    ].map(normalizeSearch).join(' ');
    return haystack.includes(q);
  });
  return limit ? matches.slice(0, limit) : matches;
}

function renderSearchResultItem(p) {
  return `<a class="search-item" href="produit.html?slug=${p.slug}">
    <span class="search-placeholder" aria-hidden="true"><i class="fa-solid fa-gem"></i></span>
    <div class="info">
      <span class="name">${localized(p, 'name')}</span>
      <span class="price">${formatPrice(p.price)}</span>
    </div>
  </a>`;
}

function wireGlobalSearch() {
  document.querySelectorAll('.search-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const header = document.querySelector('.site-header');
      header.classList.toggle('search-open');
      if (header.classList.contains('search-open')) {
        header.querySelector('#global-search')?.focus();
      }
    });
  });

  document.querySelectorAll('#global-search').forEach((input) => {
    const results = input.closest('.search-box')?.querySelector('#search-results');
    if (!results) return;

    const render = () => {
      const q = input.value.trim();
      if (q.length < 2) {
        results.hidden = true;
        results.innerHTML = '';
        return;
      }
      const matches = searchProducts(q);
      if (matches.length === 0) {
        const noResultsText = getLocale() === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat';
        results.innerHTML = `<div class="no-results">${noResultsText}</div>`;
      } else {
        results.innerHTML = matches.map(renderSearchResultItem).join('');
      }
      results.hidden = false;
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', () => { if (input.value.trim().length >= 2) render(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = input.value.trim();
        if (q) window.location.href = `produits.html?q=${encodeURIComponent(q)}`;
      }
      if (e.key === 'Escape') {
        results.hidden = true;
        input.blur();
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.closest('.search-box').contains(e.target)) {
        results.hidden = true;
      }
    });
  });
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function genericWhatsAppUrl() {
  const locale = getLocale();
  const msg = locale === 'ar'
    ? 'مرحبًا FLAMIORA، أريد الاستفسار عن أحد المنتجات.'
    : 'Bonjour FLAMIORA, je souhaite avoir des informations sur un produit.';
  return buildWhatsAppUrl(msg);
}

function buildOrderMessage({ name, phone, cityId, address, notes }) {
  const locale = getLocale();
  const city = getCityById(cityId);
  const lines = getCart();
  const shipping = city ? city.price : 0;
  const subtotal = cartSubtotal();
  const total = subtotal + shipping;

  const itemLines = lines.map((l) => {
    const p = getCartItem(l);
    const suffix = lineType(l) === 'ensemble' ? ` (${getLocale() === 'ar' ? 'طقم' : 'ensemble'})` : '';
    return `- ${localized(p, 'name')}${suffix} x${l.qty} = ${formatPrice(p.price * l.qty)}`;
  }).join('\n');

  if (locale === 'ar') {
    return [
      `طلب جديد من موقع FLAMIORA`,
      ``,
      `الاسم: ${name}`,
      `الهاتف: ${phone}`,
      `المدينة: ${city ? localized(city, 'name') : ''}`,
      `العنوان: ${address}`,
      notes ? `ملاحظات: ${notes}` : null,
      ``,
      `المنتجات:`,
      itemLines,
      ``,
      `المجموع الفرعي: ${formatPrice(subtotal)}`,
      `التوصيل: ${formatPrice(shipping)}`,
      `المجموع الكلي: ${formatPrice(total)}`,
      `طريقة الدفع: عند الاستلام`,
    ].filter(Boolean).join('\n');
  }

  return [
    `Nouvelle commande FLAMIORA`,
    ``,
    `Nom : ${name}`,
    `Téléphone : ${phone}`,
    `Ville : ${city ? localized(city, 'name') : ''}`,
    `Adresse : ${address}`,
    notes ? `Remarques : ${notes}` : null,
    ``,
    `Produits :`,
    itemLines,
    ``,
    `Sous-total : ${formatPrice(subtotal)}`,
    `Livraison : ${formatPrice(shipping)}`,
    `Total : ${formatPrice(total)}`,
    `Paiement : à la livraison`,
  ].filter(Boolean).join('\n');
}

function setActiveMainNav() {
  const page = document.body.dataset.page || '';
  document.querySelectorAll('.main-nav a[data-page-target]').forEach((link) => {
    link.classList.toggle('active', link.dataset.pageTarget === page);
  });
}

function closeMobileDrawer() {
  const drawer = document.querySelector('.mobile-drawer');
  if (!drawer) return;
  drawer.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  const update = () => btn.classList.toggle('visible', window.scrollY > 420);
  window.addEventListener('scroll', update, { passive: true });
  update();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function wireSharedChrome() {
  document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.addEventListener('click', () => setLocale(btn.dataset.lang));
  });

  const toggle = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (toggle && drawer) {
    const open = () => {
      drawer.classList.add('open');
      document.body.classList.add('no-scroll');
    };
    const close = () => {
      drawer.classList.remove('open');
      document.body.classList.remove('no-scroll');
    };
    toggle.addEventListener('click', open);
    drawer.querySelector('.backdrop')?.addEventListener('click', close);
    drawer.querySelector('.close-btn')?.addEventListener('click', close);
    document.querySelectorAll('[data-open-menu]').forEach((btn) => btn.addEventListener('click', open));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  const wireContactLinks = () => {
    document.querySelectorAll('.js-whatsapp-generic').forEach((el) => {
      el.setAttribute('href', genericWhatsAppUrl());
      if (!el.dataset.analyticsWired) {
        el.dataset.analyticsWired = '1';
        el.addEventListener('click', () => trackStoreEvent('whatsapp_click', { target: 'whatsapp' }));
      }
    });
    document.querySelectorAll('#product-whatsapp-btn').forEach((el) => {
      if (!el.dataset.analyticsWired) { el.dataset.analyticsWired = '1'; el.addEventListener('click', () => trackStoreEvent('whatsapp_click', { target: 'product_inquiry' })); }
    });
  };
  if (window.FLM_SETTINGS_READY) window.FLM_SETTINGS_READY.then(wireContactLinks); else wireContactLinks();

  updateCartBadge();
  updateWishlistBadges();
  wireWishlistButtons();
  wireGlobalSearch();
  setActiveMainNav();
  initBackToTop();

  document.querySelectorAll('.bottom-nav a, .bottom-nav button').forEach((el) => {
      if (el.dataset.page && el.dataset.page === document.body.dataset.page) {
      el.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyLocale();
  wireSharedChrome();
});
