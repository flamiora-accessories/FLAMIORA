/* FLAMIORA SEO + accessibility enhancements. */
(function () {
  const BASE = 'https://flamiora-accessories.github.io/FLAMIORA/';
  function setMeta(selector, attr, value) {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  }
  function safe(v){ return String(v ?? '').replace(/[<>]/g,'').trim(); }
  function productSchema(p) {
    if (!p) return null;
    const locale = document.documentElement.lang === 'fr' ? 'fr' : 'ar';
    const name = safe(locale === 'fr' ? (p.name_fr || p.name_ar) : (p.name_ar || p.name_fr));
    const description = safe(locale === 'fr' ? (p.desc_fr || p.short_fr || p.desc_ar) : (p.desc_ar || p.short_ar || p.desc_fr));
    const url = `${BASE}produit.html?slug=${encodeURIComponent(p.slug || p.id)}`;
    const image = p.image ? new URL(p.image, BASE).href : `${BASE}images/logo.png`;
    return {
      '@context':'https://schema.org','@type':'Product','name':name,'description':description,'image':[image],
      'sku':safe(p.sku || p.id),'category':safe(p.category_id || 'Jewelry'),
      'brand':{'@type':'Brand','name':'FLAMIORA'},'url':url,
      'offers':{'@type':'Offer','url':url,'priceCurrency':'MAD','price':Number(p.price || 0).toFixed(2),'availability':Number(p.stock || 0)>0?'https://schema.org/InStock':'https://schema.org/OutOfStock','itemCondition':'https://schema.org/NewCondition'}
    };
  }
  window.FLM_SEO = { productSchema };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
      if (!img.hasAttribute('width') && !img.closest('.hero-media')) img.setAttribute('width', '450');
      if (!img.hasAttribute('height') && !img.closest('.hero-media')) img.setAttribute('height', '450');
    });
    const page = document.body?.dataset.page;
    if (page === 'home') document.documentElement.classList.add('seo-home');
  });
})();
