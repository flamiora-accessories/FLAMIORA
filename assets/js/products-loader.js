const SEED_CATEGORIES = [
  { id: 'earrings', slug: 'earrings', name_ar: 'الأقراط', name_fr: "Boucles d'oreilles", active: true, display_order: 1 },
  { id: 'necklaces', slug: 'necklaces', name_ar: 'السلاسل', name_fr: 'Colliers', active: true, display_order: 2 },
  { id: 'rings', slug: 'rings', name_ar: 'الخواتم', name_fr: 'Bagues', active: true, display_order: 3 },
  { id: 'bracelets', slug: 'bracelets', name_ar: 'الأساور', name_fr: 'Bracelets', active: true, display_order: 4 },
];

const SEED_PRODUCTS = [
  { id: 'prod_001', slug: 'bague-rose-de-luxe', category_id: 'rings', name_ar: 'خاتم زهري فاخر', name_fr: 'Bague Rose de Luxe', short_ar: 'خاتم فاخر بحجر لامع', short_fr: 'Bague luxueuse à pierre étincelante', desc_ar: 'خاتم أنيق مرصع بحجر مركزي لامع، مثالي للمناسبات الخاصة.', desc_fr: "Bague élégante ornée d'une pierre centrale étincelante, parfaite pour les occasions spéciales.", price: 2299, compare_at: null, stock: 15, featured: true, active: true, display_order: 1 },
  { id: 'prod_002', slug: 'collier-elegant', category_id: 'necklaces', name_ar: 'سلسلة أنيقة', name_fr: 'Collier Élégant', short_ar: 'سلسلة ذهبية أنيقة', short_fr: 'Collier doré élégant', desc_ar: 'سلسلة ذهبية ناعمة بتصميم بسيط وأنيق يناسب الإطلالة اليومية والمناسبات.', desc_fr: 'Collier doré au design sobre et élégant, adapté au quotidien comme aux occasions.', price: 1999, compare_at: null, stock: 20, featured: true, active: true, display_order: 2 },
  { id: 'prod_003', slug: 'boucles-doreilles-perle', category_id: 'earrings', name_ar: 'أقراط لؤلؤ', name_fr: "Boucles d'Oreilles Perle", short_ar: 'أقراط لؤلؤ راقية', short_fr: "Boucles d'oreilles perlées raffinées", desc_ar: 'أقراط مرصعة بلآلئ ناعمة تضفي لمسة رقيقة وفاخرة.', desc_fr: "Boucles d'oreilles ornées de perles douces apportant une touche raffinée.", price: 2499, compare_at: null, stock: 10, featured: true, active: true, display_order: 3 },
  { id: 'prod_004', slug: 'bague-classique', category_id: 'rings', name_ar: 'خاتم كلاسيكي', name_fr: 'Bague Classique', short_ar: 'خاتم بتصميم كلاسيكي', short_fr: 'Bague au design classique', desc_ar: 'خاتم بتصميم كلاسيكي أنيق يناسب جميع الإطلالات.', desc_fr: 'Bague au design classique et intemporel, adaptée à toutes les tenues.', price: 1799, compare_at: 2099, stock: 12, featured: false, active: true, display_order: 4 },
  { id: 'prod_005', slug: 'bague-royale', category_id: 'rings', name_ar: 'خاتم ملكي', name_fr: 'Bague Royale', short_ar: 'خاتم فخم بتصميم ملكي', short_fr: 'Bague luxueuse au design royal', desc_ar: 'خاتم فخم مستوحى من التصاميم الملكية، بحجر مركزي بارز.', desc_fr: "Bague luxueuse inspirée des créations royales, avec une pierre centrale imposante.", price: 2899, compare_at: null, stock: 6, featured: true, active: true, display_order: 5 },
  { id: 'prod_006', slug: 'boucles-zircon', category_id: 'earrings', name_ar: 'أقراط زركون', name_fr: 'Boucles Zircon', short_ar: 'أقراط بأحجار زركون لامعة', short_fr: 'Boucles ornées de zircons scintillants', desc_ar: 'أقراط أنيقة مرصعة بأحجار زركون لامعة تمنحك إطلالة متألقة.', desc_fr: 'Boucles élégantes serties de zircons scintillants pour un éclat remarquable.', price: 1599, compare_at: null, stock: 18, featured: false, active: true, display_order: 6 },
  { id: 'prod_007', slug: 'bracelet-infinity', category_id: 'bracelets', name_ar: 'سوار إنفينيتي', name_fr: 'Bracelet Infinity', short_ar: 'سوار برمز اللانهاية', short_fr: "Bracelet symbole de l'infini", desc_ar: 'سوار أنيق برمز اللانهاية، هدية مثالية تعبر عن الحب الأبدي.', desc_fr: "Bracelet élégant orné du symbole infini, cadeau parfait symbolisant un amour éternel.", price: 1399, compare_at: null, stock: 3, featured: false, active: true, display_order: 7 },
  { id: 'prod_008', slug: 'collier-coeur', category_id: 'necklaces', name_ar: 'سلسلة قلب', name_fr: 'Collier Cœur', short_ar: 'سلسلة بدلاية قلب', short_fr: 'Collier avec pendentif cœur', desc_ar: 'سلسلة رقيقة بدلاية على شكل قلب، رمز للحب والعاطفة.', desc_fr: "Collier délicat avec pendentif en forme de cœur, symbole d'amour.", price: 1699, compare_at: null, stock: 0, featured: false, active: true, display_order: 8 },
];

const SEED_CITIES = [
  { id: 'marrakech', name_ar: 'مراكش', name_fr: 'Marrakech', price: 20 },
  { id: 'casablanca', name_ar: 'الدار البيضاء', name_fr: 'Casablanca', price: 35 },
  { id: 'rabat', name_ar: 'الرباط', name_fr: 'Rabat', price: 35 },
  { id: 'fes', name_ar: 'فاس', name_fr: 'Fès', price: 35 },
  { id: 'tangier', name_ar: 'طنجة', name_fr: 'Tanger', price: 35 },
  { id: 'agadir', name_ar: 'أكادير', name_fr: 'Agadir', price: 35 },
  { id: 'meknes', name_ar: 'مكناس', name_fr: 'Meknès', price: 35 },
  { id: 'oujda', name_ar: 'وجدة', name_fr: 'Oujda', price: 35 },
  { id: 'kenitra', name_ar: 'القنيطرة', name_fr: 'Kénitra', price: 35 },
  { id: 'tetouan', name_ar: 'تطوان', name_fr: 'Tétouan', price: 35 },
  { id: 'safi', name_ar: 'آسفي', name_fr: 'Safi', price: 35 },
  { id: 'el-jadida', name_ar: 'الجديدة', name_fr: 'El Jadida', price: 35 },
  { id: 'essaouira', name_ar: 'الصويرة', name_fr: 'Essaouira', price: 35 },
  { id: 'beni-mellal', name_ar: 'بني ملال', name_fr: 'Béni Mellal', price: 35 },
  { id: 'ouarzazate', name_ar: 'ورزازات', name_fr: 'Ouarzazate', price: 35 },
  { id: 'nador', name_ar: 'الناظور', name_fr: 'Nador', price: 35 },
  { id: 'autre', name_ar: 'مدينة أخرى', name_fr: 'Autre ville', price: 35 },
];

window.PRODUCTS = SEED_PRODUCTS.slice();
window.CATEGORIES = SEED_CATEGORIES.slice();
window.CITIES = SEED_CITIES.slice();

const SEED_ENSEMBLES = [
  { id: 'ens_001', slug: 'ensemble-eclat-rose', name_ar: 'طقم إكلات الوردي', name_fr: 'Ensemble Éclat Rose', desc_ar: 'طقم من 3 قطع (سلسلة، خاتم، أقراط) بتصميم متناسق لإطلالة متكاملة.', desc_fr: '3 pièces assorties (collier, bague, boucles) pour une allure complète et raffinée.', price: 1899, compare_at: 2699, active: true, display_order: 1 },
  { id: 'ens_002', slug: 'ensemble-lumiere-doree', name_ar: 'طقم لوميير الذهبي', name_fr: 'Ensemble Lumière Dorée', desc_ar: 'طقم فاخر من قطعتين (سوار وأقراط) بلمسة ذهبية دافئة، هدية مثالية.', desc_fr: 'Duo luxueux (bracelet et boucles) à la teinte dorée chaleureuse, cadeau idéal.', price: 1499, compare_at: 1999, active: true, display_order: 2 },
];

window.ENSEMBLES = SEED_ENSEMBLES.slice();

window.FLM_DATA_READY = (async function loadStoreData() {
  try {
    const catSnap = await db.collection('categories').where('active', '==', true).orderBy('display_order').get();
    if (!catSnap.empty) {
      window.CATEGORIES = catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
  } catch (e) {
    console.error('FLAMIORA: échec du chargement des catégories depuis Firestore, utilisation des données de secours.', e);
  }

  try {
    const prodSnap = await db.collection('products').where('active', '==', true).orderBy('display_order').get();
    if (!prodSnap.empty) {
      window.PRODUCTS = prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
  } catch (e) {
    console.error('FLAMIORA: échec du chargement des produits depuis Firestore, utilisation des données de secours.', e);
  }

  try {
    const ensSnap = await db.collection('ensembles').where('active', '==', true).orderBy('display_order').get();
    if (!ensSnap.empty) {
      window.ENSEMBLES = ensSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
  } catch (e) {
    console.error('FLAMIORA: échec du chargement des ensembles depuis Firestore, utilisation des données de secours.', e);
  }

  return { products: window.PRODUCTS, categories: window.CATEGORIES, ensembles: window.ENSEMBLES };
})();

function getProductById(id) {
  return window.PRODUCTS.find((p) => p.id === id);
}

function getProductBySlug(slug) {
  return window.PRODUCTS.find((p) => p.slug === slug);
}

function getCategoryById(id) {
  return window.CATEGORIES.find((c) => c.id === id);
}

function getCityById(id) {
  return window.CITIES.find((c) => c.id === id);
}

function getEnsembleById(id) {
  return (window.ENSEMBLES || []).find((e) => e.id === id);
}
