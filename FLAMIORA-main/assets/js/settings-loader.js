/* Public storefront settings. Sensitive admin credentials never live here. */
const FLM_DEFAULT_SETTINGS = {
  brand_name: 'FLAMIORA',
  whatsapp_number: '212711088984',
  phone_display: '+212 711-088984',
  email: 'flamiora.accessoires@gmail.com',
  instagram_url: 'https://www.instagram.com/flamiora_officiel/',
  free_shipping_threshold: 0,
  hero_image_1: 'images/banners/banner-2.jpg',
  hero_image_2: 'images/banners/banner-2.jpg',
};
window.FLM_SETTINGS = { ...FLM_DEFAULT_SETTINGS };
window.FLM_SETTINGS_READY = (async function () {
  try {
    const snap = await db.collection('settings').doc('store').get();
    if (snap.exists) window.FLM_SETTINGS = { ...FLM_DEFAULT_SETTINGS, ...snap.data() };
  } catch (e) {
    console.debug('FLAMIORA: using default store settings', e);
  }
  return window.FLM_SETTINGS;
})();
