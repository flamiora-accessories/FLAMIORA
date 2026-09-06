const ADMIN_EMAIL = 'flamiora.accessoires@gmail.com';
const NORMALIZED_ADMIN_EMAIL = ADMIN_EMAIL.trim().toLowerCase();

let adminProducts = [];
let adminCategories = [];
let adminEnsembles = [];
let adminOrders = [];
let adminEvents = [];
let currentOrderFilter = '';
let currentOrderSearch = '';

const ANALYTICS_EVENT_KEYS = {
  page_view: 'admin.event.pageView',
  product_view: 'admin.event.productView',
  category_view: 'admin.event.categoryView',
  search: 'admin.event.search',
  add_to_cart: 'admin.event.addToCart',
  remove_from_cart: 'admin.event.removeFromCart',
  cart_view: 'admin.event.cartView',
  checkout_open: 'admin.event.checkoutOpen',
  checkout_submit: 'admin.event.checkoutSubmit',
  checkout_success: 'admin.event.checkoutSuccess',
  wishlist_add: 'admin.event.wishlistAdd',
  wishlist_remove: 'admin.event.wishlistRemove',
  whatsapp_click: 'admin.event.whatsappClick',
  contact_click: 'admin.event.contactClick',
  share_product: 'admin.event.shareProduct'
};

function analyticsEventLabel(eventName) {
  const key = ANALYTICS_EVENT_KEYS[eventName];
  return key ? t(key) : (eventName || '');
}

function escapeHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function localeCode() {
  return getLocale() === 'ar' ? 'ar-MA' : 'fr-MA';
}

function formatOrderDate(o) {
  const d =
    o.created_at &&
    typeof o.created_at.toDate === 'function'
      ? o.created_at.toDate()
      : null;

  return d
    ? d.toLocaleString(localeCode(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';
}

function formatDay(d) {
  return d.toLocaleDateString(localeCode(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function showLogin() {
  const loginScreen = document.getElementById('login-screen');
  const adminShell = document.getElementById('admin-shell');

  if (loginScreen) {
    loginScreen.style.display = 'grid';
  }

  if (adminShell) {
    adminShell.classList.remove('active');
  }
}

function showShell() {
  const loginScreen = document.getElementById('login-screen');
  const adminShell = document.getElementById('admin-shell');

  if (loginScreen) {
    loginScreen.style.display = 'none';
  }

  if (adminShell) {
    adminShell.classList.add('active');
  }
}

function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

function renderAdminForCurrentView() {
  const activeView =
    document
      .querySelector('.adm-view.active')
      ?.id
      ?.replace('view-', '') || 'dashboard';

  if (activeView === 'dashboard') loadDashboard();
  else if (activeView === 'analytics') loadAnalytics();
  else if (activeView === 'products') renderProductsTable();
  else if (activeView === 'ensembles') renderEnsemblesTable();
  else if (activeView === 'categories') renderCategoriesTable();
  else if (activeView === 'orders') {
    renderOrderFilters();
    renderOrdersTable();
  }

  const categorySelect = document.getElementById('p-category');
  if (categorySelect) {
    categorySelect.innerHTML = categoryOptionsHtml();
  }
}

function switchView(view) {
  document
    .querySelectorAll('.adm-view')
    .forEach(x => x.classList.remove('active'));

  document
    .getElementById(`view-${view}`)
    ?.classList.add('active');

  document
    .querySelectorAll('.adm-nav-link[data-view]')
    .forEach(x =>
      x.classList.toggle(
        'active',
        x.dataset.view === view
      )
    );

  const heading = document.querySelector(
    `[data-view="${view}"] span`
  );

  const viewHeading = document.getElementById(
    'view-heading'
  );

  if (viewHeading) {
    viewHeading.textContent =
      heading?.textContent || view;
  }

  location.hash = view;

  if (view === 'analytics') {
    loadAnalytics();
  }

  if (view === 'dashboard') {
    loadDashboard();
  }
}

function categoryOptionsHtml() {
  return adminCategories
    .map(
      c =>
        `<option value="${escapeHtml(c.id)}">${escapeHtml(
          c.name_fr || c.name_ar
        )}</option>`
    )
    .join('');
}

function productMatches(p) {
  const q =
    document
      .getElementById('product-search')
      ?.value
      ?.toLowerCase()
      .trim() || '';

  const filter =
    document.getElementById('product-filter-stock')?.value ||
    'all';

  if (
    q &&
    !`${p.name_fr || ''} ${p.name_ar || ''} ${p.slug || ''}`
      .toLowerCase()
      .includes(q)
  ) {
    return false;
  }

  if (
    filter === 'low' &&
    !(p.stock > 0 && p.stock <= 5)
  ) {
    return false;
  }

  if (filter === 'out' && p.stock !== 0) {
    return false;
  }

  if (filter === 'inactive' && p.active) {
    return false;
  }

  return true;
}

function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');

  if (!tbody) return;

  const list = adminProducts.filter(productMatches);

  tbody.innerHTML =
    list
      .map(p => {
        const c = adminCategories.find(
          x => x.id === p.category_id
        );

        return `
          <tr>
            <td>
              <img
                src="${escapeHtml(
                  p.image || 'images/favicon.png'
                )}"
                alt=""
              >
            </td>

            <td>
              <strong>
                ${escapeHtml(p.name_fr || p.name_ar)}
              </strong>

              <small
                style="display:block;color:var(--adm-muted)"
              >
                ${escapeHtml(p.slug || '')}
              </small>
            </td>

            <td>
              ${escapeHtml(
                c?.name_fr || p.category_id || '—'
              )}
            </td>

            <td>
              ${Number(p.price || 0).toFixed(2)} DH
            </td>

            <td>
              <span
                class="adm-badge ${
                  p.stock <= 0
                    ? 'off'
                    : p.stock <= 5
                    ? 'status-pending'
                    : 'on'
                }"
              >
                ${Number(p.stock || 0)}
              </span>
            </td>

            <td>
              <span
                class="adm-badge ${
                  p.active ? 'on' : 'off'
                }"
              >
                ${
                  p.active
                    ? t('admin.form.active')
                    : t('admin.products.inactive')
                }
              </span>
            </td>

            <td class="row-actions">
              <button
                class="adm-btn adm-btn-outline"
                data-edit-product="${escapeHtml(p.id)}"
              >
                ${t('admin.form.edit')}
              </button>

              <button
                class="adm-btn adm-btn-danger"
                data-delete-product="${escapeHtml(p.id)}"
              >
                ${t('admin.form.delete')}
              </button>
            </td>
          </tr>
        `;
      })
      .join('') ||
    `
      <tr>
        <td colspan="7" class="adm-empty">
          ${t('admin.products.noResults')}
        </td>
      </tr>
    `;

  tbody
    .querySelectorAll('[data-edit-product]')
    .forEach(
      b =>
        (b.onclick = () =>
          openProductModal(b.dataset.editProduct))
    );

  tbody
    .querySelectorAll('[data-delete-product]')
    .forEach(
      b =>
        (b.onclick = () =>
          deleteProduct(b.dataset.deleteProduct))
    );
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categories-tbody');

  if (!tbody) return;

  tbody.innerHTML = adminCategories
    .map(
      c => `
        <tr>
          <td>
            <img
              src="${escapeHtml(
                c.image || 'images/favicon.png'
              )}"
              alt=""
            >
          </td>

          <td>
            <strong>
              ${escapeHtml(c.name_fr || c.name_ar)}
            </strong>

            <small
              style="display:block;color:var(--adm-muted)"
            >
              ${escapeHtml(c.name_ar || '')}
            </small>
          </td>

          <td>
            ${escapeHtml(
              String(c.display_order ?? 0)
            )}
          </td>

          <td>
            <span
              class="adm-badge ${
                c.active ? 'on' : 'off'
              }"
            >
              ${
                c.active
                  ? t('admin.form.active')
                  : t('admin.products.inactive')
              }
            </span>
          </td>

          <td class="row-actions">
            <button
              class="adm-btn adm-btn-outline"
              data-edit-category="${escapeHtml(c.id)}"
            >
              ${t('admin.form.edit')}
            </button>

            <button
              class="adm-btn adm-btn-danger"
              data-delete-category="${escapeHtml(c.id)}"
            >
              ${t('admin.form.delete')}
            </button>
          </td>
        </tr>
      `
    )
    .join('');

  tbody
    .querySelectorAll('[data-edit-category]')
    .forEach(
      b =>
        (b.onclick = () =>
          openCategoryModal(b.dataset.editCategory))
    );

  tbody
    .querySelectorAll('[data-delete-category]')
    .forEach(
      b =>
        (b.onclick = () =>
          deleteCategory(b.dataset.deleteCategory))
    );
}

function renderEnsemblesTable() {
  const tbody = document.getElementById('ensembles-tbody');

  if (!tbody) return;

  tbody.innerHTML =
    adminEnsembles
      .map(
        en => `
          <tr>
            <td>
              <img
                src="${escapeHtml(
                  en.image || 'images/favicon.png'
                )}"
                alt=""
              >
            </td>

            <td>
              <strong>
                ${escapeHtml(
                  en.name_fr || en.name_ar
                )}
              </strong>

              <small
                style="display:block;color:var(--adm-muted)"
              >
                ${escapeHtml(en.name_ar || '')}
              </small>
            </td>

            <td>
              ${Number(en.price || 0).toFixed(2)} DH
            </td>

            <td>
              ${
                en.compare_at
                  ? Number(en.compare_at).toFixed(2) +
                    ' DH'
                  : '—'
              }
            </td>

            <td>
              <span
                class="adm-badge ${
                  en.active ? 'on' : 'off'
                }"
              >
                ${
                  en.active
                    ? t('admin.form.active')
                    : t('admin.products.inactive')
                }
              </span>
            </td>

            <td class="row-actions">
              <button
                class="adm-btn adm-btn-outline"
                data-edit-ensemble="${escapeHtml(en.id)}"
              >
                ${t('admin.form.edit')}
              </button>

              <button
                class="adm-btn adm-btn-danger"
                data-delete-ensemble="${escapeHtml(en.id)}"
              >
                ${t('admin.form.delete')}
              </button>
            </td>
          </tr>
        `
      )
      .join('') ||
    `
      <tr>
        <td colspan="6" class="adm-empty">
          ${t('admin.ensembles.noResults')}
        </td>
      </tr>
    `;

  tbody
    .querySelectorAll('[data-edit-ensemble]')
    .forEach(
      b =>
        (b.onclick = () =>
          openEnsembleModal(
            b.dataset.editEnsemble
          ))
    );

  tbody
    .querySelectorAll('[data-delete-ensemble]')
    .forEach(
      b =>
        (b.onclick = () =>
          deleteEnsemble(
            b.dataset.deleteEnsemble
          ))
    );
}

function orderStatusLabel(s) {
  return t(`order.status.${s}`) || s;
}

function renderOrderFilters() {
  const bar = document.getElementById(
    'orders-filters'
  );

  if (!bar) return;

  const statuses = [
    '',
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled'
  ];

  bar.innerHTML = statuses
    .map(
      s => `
        <button
          class="adm-filter-chip ${
            currentOrderFilter === s
              ? 'active'
              : ''
          }"
          data-status-filter="${escapeHtml(s)}"
        >
          ${
            s
              ? orderStatusLabel(s)
              : t('admin.orders.filterAll')
          }
        </button>
      `
    )
    .join('');

  bar
    .querySelectorAll('[data-status-filter]')
    .forEach(
      b =>
        (b.onclick = () => {
          currentOrderFilter =
            b.dataset.statusFilter;

          renderOrderFilters();
          renderOrdersTable();
        })
    );
}

function renderOrdersTable() {
  const q = currentOrderSearch.toLowerCase();

  const list = adminOrders.filter(
    o =>
      (!currentOrderFilter ||
        o.status === currentOrderFilter) &&
      (!q ||
        `${o.customer_name || ''} ${
          o.customer_phone || ''
        } ${o.city_name || ''}`
          .toLowerCase()
          .includes(q))
  );

  const tbody =
    document.getElementById('orders-tbody');

  const table =
    document.getElementById('orders-table');

  const empty =
    document.getElementById('orders-empty');

  if (!tbody || !table || !empty) return;

  if (!list.length) {
    table.hidden = true;
    empty.hidden = false;
    tbody.innerHTML = '';
    return;
  }

  table.hidden = false;
  empty.hidden = true;

  tbody.innerHTML = list
    .map(
      o => `
        <tr>
          <td>${escapeHtml(
            o.customer_name || ''
          )}</td>

          <td>${escapeHtml(
            o.customer_phone || ''
          )}</td>

          <td>${escapeHtml(
            o.city_name || o.city_id || ''
          )}</td>

          <td>${formatOrderDate(o)}</td>

          <td>
            <strong>
              ${Number(o.total || 0).toFixed(2)} DH
            </strong>
          </td>

          <td>
            <span
              class="adm-badge status-${escapeHtml(
                o.status || 'pending'
              )}"
            >
              ${orderStatusLabel(o.status || 'pending')}
            </span>
          </td>

          <td>
            <button
              class="adm-btn adm-btn-outline"
              data-view-order="${escapeHtml(o.id)}"
            >
              ${t('admin.orders.viewDetails')}
            </button>
          </td>
        </tr>
      `
    )
    .join('');

  tbody
    .querySelectorAll('[data-view-order]')
    .forEach(
      b =>
        (b.onclick = () =>
          openOrderModal(
            b.dataset.viewOrder
          ))
    );
}

async function loadOrders() {
  try {
    const snap = await db
      .collection('orders')
      .orderBy('created_at', 'desc')
      .limit(500)
      .get();

    adminOrders = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (e) {
    console.error(
      'FLAMIORA orders loading error:',
      e
    );

    adminOrders = [];
  }

  renderOrderFilters();
  renderOrdersTable();
}

async function loadAdminData() {
  const [
    catSnap,
    prodSnap,
    ensSnap
  ] = await Promise.all([
    db
      .collection('categories')
      .orderBy('display_order')
      .get(),

    db
      .collection('products')
      .orderBy('display_order')
      .get(),

    db
      .collection('ensembles')
      .orderBy('display_order')
      .get()
  ]);

  adminCategories = catSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  adminProducts = prodSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  adminEnsembles = ensSnap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  const categorySelect =
    document.getElementById('p-category');

  if (categorySelect) {
    categorySelect.innerHTML =
      categoryOptionsHtml();
  }

  renderProductsTable();
  renderCategoriesTable();
  renderEnsemblesTable();

  await loadOrders();
  await loadSettings();
  await loadDashboard();
}

function openOrderModal(id) {
  const o = adminOrders.find(
    x => x.id === id
  );

  if (!o) return;

  const orderId = document.getElementById('order-id');
  const orderStatus = document.getElementById(
    'order-status-select'
  );
  const orderBody = document.getElementById(
    'order-detail-body'
  );

  if (orderId) {
    orderId.value = o.id;
  }

  if (orderStatus) {
    orderStatus.value = o.status || 'pending';
  }

  const items = (o.items || [])
    .map(
      i => `
        <li>
          <span>
            ${escapeHtml(
              getLocale() === 'ar'
                ? i.name_ar || i.name_fr
                : i.name_fr || i.name_ar
            )}
            × ${Number(i.qty) || 0}
          </span>

          <strong>
            ${(
              Number(i.price || 0) *
              Number(i.qty || 0)
            ).toFixed(2)} DH
          </strong>
        </li>
      `
    )
    .join('');

  if (orderBody) {
    orderBody.innerHTML = `
      <div class="row">
        <span>${t('admin.orders.customer')}</span>
        <span>${escapeHtml(
          o.customer_name || ''
        )}</span>
      </div>

      <div class="row">
        <span>${t('admin.orders.phone')}</span>
        <span>${escapeHtml(
          o.customer_phone || ''
        )}</span>
      </div>

      <div class="row">
        <span>${t('admin.orders.city')}</span>
        <span>${escapeHtml(
          o.city_name || o.city_id || ''
        )}</span>
      </div>

      <div class="row">
        <span>${t('admin.orders.address')}</span>
        <span>${escapeHtml(
          o.address || ''
        )}</span>
      </div>

      ${
        o.notes
          ? `
            <div class="row">
              <span>${t(
                'admin.orders.notes'
              )}</span>
              <span>${escapeHtml(
                o.notes
              )}</span>
            </div>
          `
          : ''
      }

      <div class="row">
        <span>${t('admin.orders.date')}</span>
        <span>${formatOrderDate(o)}</span>
      </div>

      <div>
        <div class="row">
          <span>${t(
            'admin.orders.items'
          )}</span>
        </div>

        <ul class="items-list">
          ${items || '<li>—</li>'}
        </ul>
      </div>

      <div class="row">
        <strong>${t(
          'admin.orders.total'
        )}</strong>

        <strong>
          ${Number(o.total || 0).toFixed(2)} DH
        </strong>
      </div>
    `;
  }

  openModal('order-modal');
}

async function saveOrderStatus() {
  const id =
    document.getElementById(
      'order-id'
    )?.value;

  if (!id) return;

  try {
    await db
      .collection('orders')
      .doc(id)
      .update({
        status:
          document.getElementById(
            'order-status-select'
          )?.value || 'pending'
      });

    closeModal('order-modal');

    await loadOrders();
    await loadDashboard();
  } catch (e) {
    console.error(
      'FLAMIORA order status update error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to update the order.'
    );
  }
}

async function deleteOrder() {
  if (
    !confirm(
      t('admin.orders.confirmDelete')
    )
  ) {
    return;
  }

  const id =
    document.getElementById(
      'order-id'
    )?.value;

  if (!id) return;

  try {
    await db
      .collection('orders')
      .doc(id)
      .delete();

    closeModal('order-modal');

    await loadOrders();
    await loadDashboard();
  } catch (e) {
    console.error(
      'FLAMIORA order delete error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to delete the order.'
    );
  }
}

function openProductModal(id) {
  const f =
    document.getElementById(
      'product-form'
    );

  if (!f) return;

  f.reset();

  document.getElementById(
    'p-category'
  ).innerHTML = categoryOptionsHtml();

  if (id) {
    const p = adminProducts.find(
      x => x.id === id
    );

    if (!p) return;

    document.getElementById(
      'product-modal-title'
    ).textContent = t(
      'admin.form.edit'
    );

    document.getElementById(
      'product-id'
    ).value = p.id;

    document.getElementById(
      'p-name-ar'
    ).value = p.name_ar || '';

    document.getElementById(
      'p-name-fr'
    ).value = p.name_fr || '';

    document.getElementById(
      'p-short-ar'
    ).value = p.short_ar || '';

    document.getElementById(
      'p-short-fr'
    ).value = p.short_fr || '';

    document.getElementById(
      'p-desc-ar'
    ).value = p.desc_ar || '';

    document.getElementById(
      'p-desc-fr'
    ).value = p.desc_fr || '';

    document.getElementById(
      'p-price'
    ).value = p.price ?? '';

    document.getElementById(
      'p-compare-at'
    ).value = p.compare_at ?? '';

    document.getElementById(
      'p-category'
    ).value = p.category_id || '';

    document.getElementById(
      'p-stock'
    ).value = p.stock ?? 0;

    document.getElementById(
      'p-image'
    ).value = p.image || '';

    document.getElementById(
      'p-slug'
    ).value = p.slug || '';

    document.getElementById(
      'p-display-order'
    ).value = p.display_order ?? 0;

    document.getElementById(
      'p-featured'
    ).checked = !!p.featured;

    document.getElementById(
      'p-active'
    ).checked = !!p.active;

    updateHeroPreview(
      'p-image',
      'p-image-preview'
    );
  } else {
    document.getElementById(
      'product-modal-title'
    ).textContent = t(
      'admin.products.add'
    );

    document.getElementById(
      'product-id'
    ).value = '';

    document.getElementById(
      'p-active'
    ).checked = true;

    updateHeroPreview(
      'p-image',
      'p-image-preview'
    );
  }

  openModal('product-modal');
}

function openCategoryModal(id) {
  const f =
    document.getElementById(
      'category-form'
    );

  if (!f) return;

  f.reset();

  if (id) {
    const c = adminCategories.find(
      x => x.id === id
    );

    if (!c) return;

    document.getElementById(
      'category-modal-title'
    ).textContent = t(
      'admin.form.edit'
    );

    document.getElementById(
      'category-id'
    ).value = c.id;

    document.getElementById(
      'c-name-ar'
    ).value = c.name_ar || '';

    document.getElementById(
      'c-name-fr'
    ).value = c.name_fr || '';

    document.getElementById(
      'c-image'
    ).value = c.image || '';

    document.getElementById(
      'c-slug'
    ).value = c.slug || '';

    document.getElementById(
      'c-display-order'
    ).value = c.display_order ?? 0;

    document.getElementById(
      'c-active'
    ).checked = !!c.active;

    updateHeroPreview(
      'c-image',
      'c-image-preview'
    );
  } else {
    document.getElementById(
      'category-modal-title'
    ).textContent = t(
      'admin.categories.add'
    );

    document.getElementById(
      'category-id'
    ).value = '';

    document.getElementById(
      'c-active'
    ).checked = true;

    updateHeroPreview(
      'c-image',
      'c-image-preview'
    );
  }

  openModal('category-modal');
}

async function saveProduct(e) {
  e.preventDefault();

  try {
    const id =
      document.getElementById(
        'product-id'
      ).value;

    const data = {
      name_ar:
        document.getElementById(
          'p-name-ar'
        ).value.trim(),

      name_fr:
        document.getElementById(
          'p-name-fr'
        ).value.trim(),

      short_ar:
        document.getElementById(
          'p-short-ar'
        ).value.trim(),

      short_fr:
        document.getElementById(
          'p-short-fr'
        ).value.trim(),

      desc_ar:
        document.getElementById(
          'p-desc-ar'
        ).value.trim(),

      desc_fr:
        document.getElementById(
          'p-desc-fr'
        ).value.trim(),

      price:
        parseFloat(
          document.getElementById(
            'p-price'
          ).value
        ) || 0,

      compare_at:
        document.getElementById(
          'p-compare-at'
        ).value
          ? parseFloat(
              document.getElementById(
                'p-compare-at'
              ).value
            )
          : null,

      category_id:
        document.getElementById(
          'p-category'
        ).value,

      stock:
        parseInt(
          document.getElementById(
            'p-stock'
          ).value,
          10
        ) || 0,

      image:
        document.getElementById(
          'p-image'
        ).value.trim(),

      slug:
        document.getElementById(
          'p-slug'
        ).value.trim(),

      display_order:
        parseInt(
          document.getElementById(
            'p-display-order'
          ).value,
          10
        ) || 0,

      featured:
        document.getElementById(
          'p-featured'
        ).checked,

      active:
        document.getElementById(
          'p-active'
        ).checked
    };

    if (id) {
      await db
        .collection('products')
        .doc(id)
        .update(data);
    } else {
      await db
        .collection('products')
        .add(data);
    }

    closeModal('product-modal');

    await loadAdminData();
  } catch (e) {
    console.error(
      'FLAMIORA save product error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to save the product.'
    );
  }
}

async function saveCategory(e) {
  e.preventDefault();

  try {
    const id =
      document.getElementById(
        'category-id'
      ).value;

    const data = {
      name_ar:
        document.getElementById(
          'c-name-ar'
        ).value.trim(),

      name_fr:
        document.getElementById(
          'c-name-fr'
        ).value.trim(),

      image:
        document.getElementById(
          'c-image'
        ).value.trim(),

      slug:
        document.getElementById(
          'c-slug'
        ).value.trim(),

      display_order:
        parseInt(
          document.getElementById(
            'c-display-order'
          ).value,
          10
        ) || 0,

      active:
        document.getElementById(
          'c-active'
        ).checked
    };

    if (id) {
      await db
        .collection('categories')
        .doc(id)
        .update(data);
    } else {
      await db
        .collection('categories')
        .add(data);
    }

    closeModal('category-modal');

    await loadAdminData();
  } catch (e) {
    console.error(
      'FLAMIORA save category error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to save the category.'
    );
  }
}

async function deleteProduct(id) {
  if (
    !confirm(
      t('admin.form.confirmDelete')
    )
  ) {
    return;
  }

  try {
    await db
      .collection('products')
      .doc(id)
      .delete();

    await loadAdminData();
  } catch (e) {
    console.error(
      'FLAMIORA delete product error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to delete the product.'
    );
  }
}

async function deleteCategory(id) {
  if (
    !confirm(
      t('admin.form.confirmDelete')
    )
  ) {
    return;
  }

  try {
    await db
      .collection('categories')
      .doc(id)
      .delete();

    await loadAdminData();
  } catch (e) {
    console.error(
      'FLAMIORA delete category error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to delete the category.'
    );
  }
}

function openEnsembleModal(id) {
  const f =
    document.getElementById(
      'ensemble-form'
    );

  if (!f) return;

  f.reset();

  if (id) {
    const en = adminEnsembles.find(
      x => x.id === id
    );

    if (!en) return;

    document.getElementById(
      'ensemble-modal-title'
    ).textContent = t(
      'admin.form.edit'
    );

    document.getElementById(
      'ensemble-id'
    ).value = en.id;

    document.getElementById(
      'en-name-ar'
    ).value = en.name_ar || '';

    document.getElementById(
      'en-name-fr'
    ).value = en.name_fr || '';

    document.getElementById(
      'en-desc-ar'
    ).value = en.desc_ar || '';

    document.getElementById(
      'en-desc-fr'
    ).value = en.desc_fr || '';

    document.getElementById(
      'en-price'
    ).value = en.price ?? '';

    document.getElementById(
      'en-compare-at'
    ).value = en.compare_at ?? '';

    document.getElementById(
      'en-image'
    ).value = en.image || '';

    document.getElementById(
      'en-slug'
    ).value = en.slug || '';

    document.getElementById(
      'en-display-order'
    ).value = en.display_order ?? 0;

    document.getElementById(
      'en-active'
    ).checked = !!en.active;

    updateHeroPreview(
      'en-image',
      'en-image-preview'
    );
  } else {
    document.getElementById(
      'ensemble-modal-title'
    ).textContent = t(
      'admin.ensembles.add'
    );

    document.getElementById(
      'ensemble-id'
    ).value = '';

    document.getElementById(
      'en-active'
    ).checked = true;

    updateHeroPreview(
      'en-image',
      'en-image-preview'
    );
  }

  openModal('ensemble-modal');
}

async function saveEnsemble(e) {
  e.preventDefault();

  try {
    const id =
      document.getElementById(
        'ensemble-id'
      ).value;

    const data = {
      name_ar:
        document.getElementById(
          'en-name-ar'
        ).value.trim(),

      name_fr:
        document.getElementById(
          'en-name-fr'
        ).value.trim(),

      desc_ar:
        document.getElementById(
          'en-desc-ar'
        ).value.trim(),

      desc_fr:
        document.getElementById(
          'en-desc-fr'
        ).value.trim(),

      price:
        Number(
          document.getElementById(
            'en-price'
          ).value
        ) || 0,

      compare_at:
        document.getElementById(
          'en-compare-at'
        ).value
          ? Number(
              document.getElementById(
                'en-compare-at'
              ).value
            )
          : null,

      image:
        document.getElementById(
          'en-image'
        ).value.trim(),

      slug:
        document.getElementById(
          'en-slug'
        ).value.trim(),

      display_order:
        parseInt(
          document.getElementById(
            'en-display-order'
          ).value,
          10
        ) || 0,

      active:
        document.getElementById(
          'en-active'
        ).checked
    };

    if (id) {
      await db
        .collection('ensembles')
        .doc(id)
        .update(data);
    } else {
      await db
        .collection('ensembles')
        .add(data);
    }

    closeModal('ensemble-modal');

    await loadAdminData();
  } catch (e) {
    console.error(
      'FLAMIORA save ensemble error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to save the ensemble.'
    );
  }
}

async function deleteEnsemble(id) {
  if (
    !confirm(
      t('admin.form.confirmDelete')
    )
  ) {
    return;
  }

  try {
    await db
      .collection('ensembles')
      .doc(id)
      .delete();

    await loadAdminData();
  } catch (e) {
    console.error(
      'FLAMIORA delete ensemble error:',
      e
    );

    alert(
      t('admin.login.error') ||
        'Unable to delete the ensemble.'
    );
  }
}

function dateRange(mode) {
  const end = new Date();

  end.setHours(
    23,
    59,
    59,
    999
  );

  const start = new Date(end);

  if (mode === 'today') {
    start.setHours(
      0,
      0,
      0,
      0
    );
  } else {
    start.setDate(
      start.getDate() -
        Number(mode) +
        1
    );

    start.setHours(
      0,
      0,
      0,
      0
    );
  }

  return {
    start,
    end
  };
}

async function loadAnalytics() {
  const range =
    document.getElementById(
      'analytics-range'
    );

  if (!range) return;

  const mode = range.value;

  const {
    start,
    end
  } = dateRange(mode);

  try {
    const snap = await db
      .collection('analytics_events')
      .where(
        'created_at',
        '>=',
        firebase.firestore.Timestamp.fromDate(
          start
        )
      )
      .where(
        'created_at',
        '<=',
        firebase.firestore.Timestamp.fromDate(
          end
        )
      )
      .orderBy(
        'created_at',
        'desc'
      )
      .limit(5000)
      .get();

    adminEvents = snap.docs.map(
      d => ({
        id: d.id,
        ...d.data()
      })
    );

    renderAnalytics();
  } catch (e) {
    console.error(
      'FLAMIORA analytics error:',
      e
    );

    adminEvents = [];

    renderAnalytics();
  }
}

function countEvent(name) {
  return adminEvents.filter(
    e => e.event_name === name
  ).length;
}

function uniqueSessions() {
  return new Set(
    adminEvents
      .map(e => e.session_id)
      .filter(Boolean)
  ).size;
}

function topByProduct() {
  const map = {};

  adminEvents
    .filter(e => e.product_id)
    .forEach(e => {
      const id = e.product_id;

      if (!map[id]) {
        map[id] = {
          id,
          name:
            e.product_name || id,
          views: 0,
          adds: 0,
          success: 0
        };
      }

      if (
        e.event_name ===
        'product_view'
      ) {
        map[id].views++;
      }

      if (
        e.event_name ===
        'add_to_cart'
      ) {
        map[id].adds++;
      }

      if (
        e.event_name ===
        'checkout_success'
      ) {
        map[id].success++;
      }
    });

  return Object.values(map)
    .sort(
      (a, b) =>
        b.views +
        b.adds * 2 -
        (a.views + a.adds * 2)
    )
    .slice(0, 10);
}

function topSearches() {
  const map = {};

  adminEvents
    .filter(
      e =>
        e.event_name ===
          'search' &&
        e.query
    )
    .forEach(e => {
      const q =
        String(e.query).toLowerCase();

      map[q] =
        (map[q] || 0) + 1;
    });

  return Object.entries(map)
    .sort(
      (a, b) => b[1] - a[1]
    )
    .slice(0, 10);
}

function kpi(
  label,
  value,
  icon,
  note = '',
  variant = 'gold'
) {
  return `
    <div class="adm-kpi adm-kpi-${escapeHtml(variant)}">
      <div class="adm-kpi-top">
        <span>${escapeHtml(label)}</span>

        <span class="adm-kpi-icon">
          <i class="fa-solid ${escapeHtml(icon)}"></i>
        </span>
      </div>

      <div class="adm-kpi-value">
        ${escapeHtml(value)}
      </div>

      <div class="adm-kpi-note">
        ${escapeHtml(note)}
      </div>
    </div>
  `;
}

function renderAnalytics() {
  const views =
    countEvent('page_view');

  const sessions =
    uniqueSessions();

  const adds =
    countEvent('add_to_cart');

  const starts =
    countEvent('checkout_open');

  const success =
    countEvent(
      'checkout_success'
    );

  const searches =
    countEvent('search');

  const whatsapp =
    countEvent('whatsapp_click');

  const rate = views
    ? (
        (success /
          Math.max(
            sessions,
            1
          )) *
        100
      ).toFixed(1)
    : '0.0';

  const analyticsKpis =
    document.getElementById(
      'analytics-kpis'
    );

  if (analyticsKpis) {
    analyticsKpis.innerHTML = [
      kpi(
        t(
          'admin.analytics.sessions'
        ),
        sessions,
        'fa-users',
        t(
          'admin.analytics.uniqueTabs'
        ),
        'purple'
      ),

      kpi(
        t(
          'admin.analytics.pageViews'
        ),
        views,
        'fa-eye',
        '',
        'blue'
      ),

      kpi(
        t(
          'admin.analytics.productViews'
        ),
        countEvent(
          'product_view'
        ),
        'fa-gem',
        '',
        'gold'
      ),

      kpi(
        t(
          'admin.analytics.searchCount'
        ),
        searches,
        'fa-magnifying-glass',
        '',
        'teal'
      ),

      kpi(
        t(
          'admin.analytics.adds'
        ),
        adds,
        'fa-cart-plus',
        '',
        'orange'
      ),

      kpi(
        t(
          'admin.analytics.checkout'
        ),
        starts,
        'fa-credit-card',
        '',
        'blue'
      ),

      kpi(
        t(
          'admin.analytics.orders'
        ),
        success,
        'fa-bag-shopping',
        `${rate}% ${t(
          'admin.analytics.conversion'
        )}`,
        'green'
      ),

      kpi(
        t(
          'admin.analytics.whatsapp'
        ),
        whatsapp,
        'fa-whatsapp',
        '',
        'green'
      )
    ].join('');
  }

  const funnel =
    document.getElementById(
      'analytics-funnel'
    );

  if (funnel) {
    funnel.innerHTML = [
      [
        'sessions',
        sessions
      ],
      [
        'product_view',
        countEvent(
          'product_view'
        )
      ],
      [
        'add_to_cart',
        adds
      ],
      [
        'checkout_open',
        starts
      ],
      [
        'checkout_success',
        success
      ]
    ]
      .map(
        (x, i) => `
          <div class="adm-funnel-step">
            <span>
              ${
                [
                  t(
                    'admin.analytics.sessions'
                  ),
                  t(
                    'admin.analytics.productViews'
                  ),
                  t(
                    'admin.analytics.adds'
                  ),
                  t(
                    'admin.analytics.checkout'
                  ),
                  t(
                    'admin.analytics.orders'
                  )
                ][i]
              }
            </span>

            <strong>
              ${x[1]}
            </strong>

            <div class="adm-rate">
              ${
                sessions
                  ? (
                      (x[1] /
                        sessions) *
                      100
                    ).toFixed(0)
                  : 0
              }%
            </div>
          </div>
        `
      )
      .join('');
  }

  const products =
    topByProduct();

  const analyticsProducts =
    document.getElementById(
      'analytics-products'
    );

  if (analyticsProducts) {
    analyticsProducts.innerHTML = `
      <table class="adm-mini-table">
        <thead>
          <tr>
            <th>${t(
              'admin.analytics.product'
            )}</th>

            <th>${t(
              'admin.analytics.views'
            )}</th>

            <th>${t(
              'admin.analytics.adds'
            )}</th>

            <th>${t(
              'admin.analytics.orders'
            )}</th>
          </tr>
        </thead>

        <tbody>
          ${
            products
              .map(
                p => `
                  <tr>
                    <td>
                      ${escapeHtml(
                        p.name
                      )}
                    </td>

                    <td>
                      ${p.views}
                    </td>

                    <td>
                      ${p.adds}
                    </td>

                    <td>
                      ${p.success}
                    </td>
                  </tr>
                `
              )
              .join('') ||
            `
              <tr>
                <td colspan="4">
                  ${t(
                    'admin.analytics.noData'
                  )}
                </td>
              </tr>
            `
          }
        </tbody>
      </table>
    `;
  }

  const analyticsSearches =
    document.getElementById(
      'analytics-searches'
    );

  if (analyticsSearches) {
    analyticsSearches.innerHTML = `
      <table class="adm-mini-table">
        <thead>
          <tr>
            <th>${t(
              'admin.analytics.query'
            )}</th>

            <th>${t(
              'admin.analytics.count'
            )}</th>
          </tr>
        </thead>

        <tbody>
          ${
            topSearches()
              .map(
                x => `
                  <tr>
                    <td>
                      ${escapeHtml(
                        x[0]
                      )}
                    </td>

                    <td>
                      ${x[1]}
                    </td>
                  </tr>
                `
              )
              .join('') ||
            `
              <tr>
                <td colspan="2">
                  ${t(
                    'admin.analytics.noData'
                  )}
                </td>
              </tr>
            `
          }
        </tbody>
      </table>
    `;
  }

  const eventCount =
    document.getElementById(
      'analytics-event-count'
    );

  if (eventCount) {
    eventCount.textContent =
      `${adminEvents.length} ${t(
        'admin.analytics.eventsCount'
      )}`;
  }

  const recent =
    adminEvents.slice(0, 30);

  const analyticsEvents =
    document.getElementById(
      'analytics-events'
    );

  if (analyticsEvents) {
    analyticsEvents.innerHTML =
      recent
        .map(
          e => `
            <div class="adm-event">
              <div>
                <strong>
                  ${escapeHtml(
                    analyticsEventLabel(
                      e.event_name
                    )
                  )}
                </strong>

                <small>
                  · ${escapeHtml(
                    e.product_name ||
                      e.query ||
                      e.page ||
                      ''
                  )}
                </small>
              </div>

              <small>
                ${
                  e.created_at &&
                  typeof e.created_at
                    .toDate ===
                    'function'
                    ? e.created_at
                        .toDate()
                        .toLocaleString(
                          localeCode()
                        )
                    : '—'
                }
              </small>
            </div>
          `
        )
        .join('') ||
      `
        <div class="adm-empty">
          ${t(
            'admin.analytics.noData'
          )}
        </div>
      `;
  }
}

async function loadDashboard() {
  const today =
    dateRange('today');

  try {
    const snap = await db
      .collection(
        'analytics_events'
      )
      .where(
        'created_at',
        '>=',
        firebase.firestore.Timestamp.fromDate(
          today.start
        )
      )
      .where(
        'created_at',
        '<=',
        firebase.firestore.Timestamp.fromDate(
          today.end
        )
      )
      .orderBy(
        'created_at',
        'desc'
      )
      .limit(2000)
      .get();

    const ev = snap.docs.map(
      d => d.data()
    );

    const dashboardKpis =
      document.getElementById(
        'dashboard-kpis'
      );

    if (dashboardKpis) {
      const k = [
        kpi(
          t(
            'admin.dashboard.visitors'
          ),
          new Set(
            ev
              .map(
                e =>
                  e.session_id
              )
              .filter(Boolean)
          ).size,
          'fa-users',
          '',
          'purple'
        ),

        kpi(
          t(
            'admin.dashboard.views'
          ),
          ev.filter(
            e =>
              e.event_name ===
              'page_view'
          ).length,
          'fa-eye',
          '',
          'blue'
        ),

        kpi(
          t(
            'admin.dashboard.cartAdds'
          ),
          ev.filter(
            e =>
              e.event_name ===
              'add_to_cart'
          ).length,
          'fa-cart-plus',
          '',
          'orange'
        ),

        kpi(
          t(
            'admin.dashboard.orders'
          ),
          ev.filter(
            e =>
              e.event_name ===
              'checkout_success'
          ).length,
          'fa-bag-shopping',
          '',
          'green'
        )
      ];

      dashboardKpis.innerHTML =
        k.join('');
    }

    const orders =
      adminOrders.filter(o => {
        const d =
          o.created_at?.toDate?.();

        return (
          d &&
          d >= today.start &&
          d <= today.end
        );
      });

    const dashOrderTotal =
      document.getElementById(
        'dash-order-total'
      );

    if (dashOrderTotal) {
      dashOrderTotal.textContent =
        `${orders
          .reduce(
            (s, o) =>
              s +
              Number(
                o.total || 0
              ),
            0
          )
          .toFixed(2)} DH`;
    }

    const dashOrdersList =
      document.getElementById(
        'dash-orders-list'
      );

    if (dashOrdersList) {
      dashOrdersList.innerHTML =
        orders
          .slice(0, 6)
          .map(
            o => `
              <div class="adm-list-row">
                <span class="adm-rank">
                  <i class="fa-solid fa-bag-shopping"></i>
                </span>

                <div class="adm-list-main">
                  <strong>
                    ${escapeHtml(
                      o.customer_name || ''
                    )}
                  </strong>

                  <small>
                    ${escapeHtml(
                      o.city_name ||
                        o.city_id ||
                        ''
                    )}
                    ·
                    ${Number(
                      o.total || 0
                    ).toFixed(2)}
                    DH
                  </small>
                </div>

                <span class="adm-list-value">
                  ${orderStatusLabel(
                    o.status || 'pending'
                  )}
                </span>
              </div>
            `
          )
          .join('') ||
        `
          <div class="adm-empty">
            ${t(
              'admin.dashboard.noOrders'
            )}
          </div>
        `;
    }

    const recent7 =
      new Date();

    recent7.setDate(
      recent7.getDate() - 6
    );

    recent7.setHours(
      0,
      0,
      0,
      0
    );

    const ps = await db
      .collection(
        'analytics_events'
      )
      .where(
        'created_at',
        '>=',
        firebase.firestore.Timestamp.fromDate(
          recent7
        )
      )
      .where(
        'created_at',
        '<=',
        firebase.firestore.Timestamp.fromDate(
          new Date()
        )
      )
      .orderBy(
        'created_at',
        'desc'
      )
      .limit(5000)
      .get();

    const map = {};

    ps.docs
      .map(d => d.data())
      .filter(
        e =>
          e.event_name ===
            'product_view' &&
          e.product_id
      )
      .forEach(e => {
        if (!map[e.product_id]) {
          map[e.product_id] = {
            name:
              e.product_name ||
              e.product_id,
            count: 0
          };
        }

        map[e.product_id].count++;
      });

    const dashTopProducts =
      document.getElementById(
        'dash-top-products'
      );

    if (dashTopProducts) {
      dashTopProducts.innerHTML =
        Object.values(map)
          .sort(
            (a, b) =>
              b.count - a.count
          )
          .slice(0, 6)
          .map(
            (p, i) => `
              <div class="adm-list-row">
                <span class="adm-rank">
                  ${i + 1}
                </span>

                <div class="adm-list-main">
                  <strong>
                    ${escapeHtml(
                      p.name
                    )}
                  </strong>

                  <small>
                    ${t(
                      'admin.analytics.productViews'
                    )}
                  </small>
                </div>

                <span class="adm-list-value">
                  ${p.count}
                </span>
              </div>
            `
          )
          .join('') ||
        `
          <div class="adm-empty">
            ${t(
              'admin.analytics.noData'
            )}
          </div>
        `;
    }
  } catch (e) {
    console.error(
      'FLAMIORA dashboard error:',
      e
    );
  }
}

function loadSettings() {
  const defaults = {
    brand_name: 'FLAMIORA',
    whatsapp_number: '212711088984',
    phone_display: '+212 711-088984',
    email:
      'flamiora.accessoires@gmail.com',
    instagram_url:
      'https://www.instagram.com/flamiora_officiel/',
    free_shipping_threshold: 0,
    hero_image_1: '',
    hero_image_2: ''
  };

  return db
    .collection('settings')
    .doc('store')
    .get()
    .then(doc => {
      const d = doc.exists
        ? {
            ...defaults,
            ...doc.data()
          }
        : defaults;

      const brand = document.getElementById(
        's-brand'
      );
      const whatsapp = document.getElementById(
        's-whatsapp'
      );
      const phone = document.getElementById(
        's-phone'
      );
      const email = document.getElementById(
        's-email'
      );
      const instagram = document.getElementById(
        's-instagram'
      );
      const shipping = document.getElementById(
        's-free-shipping'
      );
      const hero1 = document.getElementById(
        's-hero-1'
      );
      const hero2 = document.getElementById(
        's-hero-2'
      );

      if (brand) {
        brand.value = d.brand_name || '';
      }

      if (whatsapp) {
        whatsapp.value =
          d.whatsapp_number || '';
      }

      if (phone) {
        phone.value =
          d.phone_display || '';
      }

      if (email) {
        email.value =
          d.email || '';
      }

      if (instagram) {
        instagram.value =
          d.instagram_url || '';
      }

      if (shipping) {
        shipping.value =
          d.free_shipping_threshold || 0;
      }

      if (hero1) {
        hero1.value =
          d.hero_image_1 || '';
      }

      if (hero2) {
        hero2.value =
          d.hero_image_2 || '';
      }

      updateHeroPreview(
        's-hero-1',
        's-hero-1-preview'
      );

      updateHeroPreview(
        's-hero-2',
        's-hero-2-preview'
      );
    });
}

function updateHeroPreview(
  inputId,
  previewId
) {
  const input =
    document.getElementById(
      inputId
    );

  const preview =
    document.getElementById(
      previewId
    );

  if (!input || !preview) {
    return;
  }

  const url =
    input.value.trim();

  if (url) {
    preview.src = url;
    preview.hidden = false;
  } else {
    preview.hidden = true;
    preview.removeAttribute(
      'src'
    );
  }
}

function exportAnalytics() {
  const rows = [
    [
      'event_name',
      'session_id',
      'page',
      'product_id',
      'product_name',
      'query',
      'created_at',
      'quantity',
      'value'
    ],

    ...adminEvents.map(e => [
      e.event_name || '',
      e.session_id || '',
      e.page || '',
      e.product_id || '',
      e.product_name || '',
      e.query || '',
      e.created_at
        ?.toDate?.()
        ?.toISOString() || '',
      e.quantity ?? '',
      e.value ?? ''
    ])
  ];

  const csv = rows
    .map(
      r =>
        r
          .map(
            v =>
              `"${String(v).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(',')
    )
    .join('\n');

  const blob = new Blob(
    [csv],
    {
      type:
        'text/csv;charset=utf-8'
    }
  );

  const a =
    document.createElement(
      'a'
    );

  a.href =
    URL.createObjectURL(
      blob
    );

  a.download = `flamiora-analytics-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 100);
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    /*
     * ============================
     * FLAMIORA ADMIN INITIALIZATION
     * ============================
     */

    try {
      applyLocale();
    } catch (e) {
      console.error(
        'FLAMIORA locale initialization error:',
        e
      );
    }

    document
      .querySelectorAll('.lang-switch button')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          setLocale(btn.dataset.lang);
          renderAdminForCurrentView();
        });
      });

    const loginForm =
      document.getElementById(
        'login-form'
      );

    if (loginForm) {
      loginForm.onsubmit =
        async e => {
          e.preventDefault();

          const loginError =
            document.getElementById(
              'login-error'
            );

          if (loginError) {
            loginError.textContent = '';
          }

          const emailInput =
            document.getElementById(
              'login-email'
            );

          const passwordInput =
            document.getElementById(
              'login-password'
            );

          const email =
            emailInput?.value.trim() || '';

          const password =
            passwordInput?.value || '';

          if (!email || !password) {
            if (loginError) {
              loginError.textContent =
                t(
                  'admin.login.error'
                );
            }

            return;
          }

          try {
            await auth.signInWithEmailAndPassword(
              email,
              password
            );
          } catch (err) {
            console.error(
              'FLAMIORA admin login error:',
              err.code,
              err.message
            );

            let msg =
              t(
                'admin.login.error'
              );

            if (
              err.code ===
              'auth/unauthorized-domain'
            ) {
              msg = t(
                'admin.login.errorDomain'
              );
            } else if (
              err.code ===
              'auth/user-not-found'
            ) {
              msg = t(
                'admin.login.errorNoUser'
              );
            } else if (
              err.code ===
                'auth/wrong-password' ||
              err.code ===
                'auth/invalid-credential'
            ) {
              msg = t(
                'admin.login.error'
              );
            } else if (
              err.code ===
              'auth/too-many-requests'
            ) {
              msg = t(
                'admin.login.errorTooMany'
              );
            } else if (
              err.code ===
              'auth/invalid-email'
            ) {
              msg = t(
                'admin.login.error'
              );
            }

            if (loginError) {
              loginError.textContent = msg;
            }
          }
        };
    }

    const logoutBtn =
      document.getElementById(
        'logout-btn'
      );

    if (logoutBtn) {
      logoutBtn.onclick =
        async () => {
          try {
            await auth.signOut();
          } catch (e) {
            console.error(
              'FLAMIORA logout error:',
              e
            );
          }
        };
    }

    document
      .querySelectorAll(
        '.adm-nav-link[data-view]'
      )
      .forEach(
        b =>
          (b.onclick = e => {
            e.preventDefault();

            switchView(
              b.dataset.view
            );
          })
      );

    document
      .querySelectorAll(
        '[data-go-view]'
      )
      .forEach(
        b =>
          (b.onclick = () =>
            switchView(
              b.dataset.goView
            ))
      );

    const addProductBtn =
      document.getElementById(
        'add-product-btn'
      );

    if (addProductBtn) {
      addProductBtn.onclick =
        () => openProductModal();
    }

    const addCategoryBtn =
      document.getElementById(
        'add-category-btn'
      );

    if (addCategoryBtn) {
      addCategoryBtn.onclick =
        () => openCategoryModal();
    }

    const addEnsembleBtn =
      document.getElementById(
        'add-ensemble-btn'
      );

    if (addEnsembleBtn) {
      addEnsembleBtn.onclick =
        () => openEnsembleModal();
    }

    document
      .querySelectorAll(
        '[data-close-modal]'
      )
      .forEach(
        b =>
          (b.onclick = () =>
            closeModal(
              b.dataset.closeModal
            ))
      );

    document
      .querySelectorAll(
        '.adm-modal-backdrop'
      )
      .forEach(m =>
        m.addEventListener(
          'click',
          e => {
            if (
              e.target === m
            ) {
              closeModal(
                m.id
              );
            }
          }
        )
      );

    const productForm =
      document.getElementById(
        'product-form'
      );

    if (productForm) {
      productForm.onsubmit =
        saveProduct;
    }

    const categoryForm =
      document.getElementById(
        'category-form'
      );

    if (categoryForm) {
      categoryForm.onsubmit =
        saveCategory;
    }

    const ensembleForm =
      document.getElementById(
        'ensemble-form'
      );

    if (ensembleForm) {
      ensembleForm.onsubmit =
        saveEnsemble;
    }

    const orderSaveBtn =
      document.getElementById(
        'order-save-btn'
      );

    if (orderSaveBtn) {
      orderSaveBtn.onclick =
        saveOrderStatus;
    }

    const orderDeleteBtn =
      document.getElementById(
        'order-delete-btn'
      );

    if (orderDeleteBtn) {
      orderDeleteBtn.onclick =
        deleteOrder;
    }

    const productSearch =
      document.getElementById(
        'product-search'
      );

    if (productSearch) {
      productSearch.oninput =
        renderProductsTable;
    }

    const productFilter =
      document.getElementById(
        'product-filter-stock'
      );

    if (productFilter) {
      productFilter.onchange =
        renderProductsTable;
    }

    const orderSearch =
      document.getElementById(
        'order-search'
      );

    if (orderSearch) {
      orderSearch.oninput =
        e => {
          currentOrderSearch =
            e.target.value;

          renderOrdersTable();
        };
    }

    const analyticsRange =
      document.getElementById(
        'analytics-range'
      );

    if (analyticsRange) {
      analyticsRange.onchange =
        loadAnalytics;
    }

    const exportAnalyticsBtn =
      document.getElementById(
        'export-analytics'
      );

    if (exportAnalyticsBtn) {
      exportAnalyticsBtn.onclick =
        exportAnalytics;
    }

    const refreshAdmin =
      document.getElementById(
        'refresh-admin'
      );

    if (refreshAdmin) {
      refreshAdmin.onclick =
        async () => {
          try {
            await loadAdminData();
          } catch (e) {
            console.error(
              'FLAMIORA admin refresh error:',
              e
            );
          }
        };
    }

    const settingsForm =
      document.getElementById(
        'settings-form'
      );

    if (settingsForm) {
      settingsForm.onsubmit =
        async e => {
          e.preventDefault();

          try {
            await db
              .collection(
                'settings'
              )
              .doc('store')
              .set(
                {
                  brand_name:
                    document
                      .getElementById(
                        's-brand'
                      )
                      .value.trim(),

                  whatsapp_number:
                    document
                      .getElementById(
                        's-whatsapp'
                      )
                      .value.trim(),

                  phone_display:
                    document
                      .getElementById(
                        's-phone'
                      )
                      .value.trim(),

                  email:
                    document
                      .getElementById(
                        's-email'
                      )
                      .value.trim(),

                  instagram_url:
                    document
                      .getElementById(
                        's-instagram'
                      )
                      .value.trim(),

                  free_shipping_threshold:
                    Number(
                      document
                        .getElementById(
                          's-free-shipping'
                        )
                        .value
                    ) || 0,

                  hero_image_1:
                    document
                      .getElementById(
                        's-hero-1'
                      )
                      .value.trim(),

                  hero_image_2:
                    document
                      .getElementById(
                        's-hero-2'
                      )
                      .value.trim()
                },
                {
                  merge: true
                }
              );

            alert(
              t(
                'admin.settings.saved'
              )
            );
          } catch (e) {
            console.error(
              'FLAMIORA settings save error:',
              e
            );

            alert(
              t('admin.login.error') ||
                'Unable to save settings.'
            );
          }
        };
    }

    const hero1 =
      document.getElementById(
        's-hero-1'
      );

    if (hero1) {
      hero1.oninput =
        () =>
          updateHeroPreview(
            's-hero-1',
            's-hero-1-preview'
          );
    }

    const hero2 =
      document.getElementById(
        's-hero-2'
      );

    if (hero2) {
      hero2.oninput =
        () =>
          updateHeroPreview(
            's-hero-2',
            's-hero-2-preview'
          );
    }

    const productImage =
      document.getElementById(
        'p-image'
      );

    if (productImage) {
      productImage.oninput =
        () =>
          updateHeroPreview(
            'p-image',
            'p-image-preview'
          );
    }

    const categoryImage =
      document.getElementById(
        'c-image'
      );

    if (categoryImage) {
      categoryImage.oninput =
        () =>
          updateHeroPreview(
            'c-image',
            'c-image-preview'
          );
    }

    const ensembleImage =
      document.getElementById(
        'en-image'
      );

    if (ensembleImage) {
      ensembleImage.oninput =
        () =>
          updateHeroPreview(
            'en-image',
            'en-image-preview'
          );
    }

    const adminDate =
      document.getElementById(
        'admin-date'
      );

    if (adminDate) {
      adminDate.textContent =
        formatDay(
          new Date()
        );
    }

    /*
     * ============================
     * FLAMIORA ADMIN AUTH
     * ============================
     *
     * مهم:
     * Firestore Rules ما زالت هي الحماية الحقيقية.
     * البريد المسموح به هنا يجب أن يطابق البريد الموجود
     * في قواعد Firestore.
     */

    auth.onAuthStateChanged(
      async user => {
        const loginError =
          document.getElementById(
            'login-error'
          );

        /*
         * لا يوجد مستخدم
         */
        if (!user) {
          showLogin();

          if (loginError) {
            loginError.textContent = '';
          }

          return;
        }

        /*
         * تطبيع البريد لمنع مشكلة اختلاف حالة الأحرف
         * أو وجود مسافات زائدة.
         */
        const userEmail =
          String(
            user.email || ''
          )
            .trim()
            .toLowerCase();

        /*
         * الحساب ليس حساب الإدارة
         */
        if (
          userEmail !==
          NORMALIZED_ADMIN_EMAIL
        ) {
          console.error(
            'FLAMIORA: unauthorized admin account',
            user.email
          );

          try {
            await auth.signOut();
          } catch (signOutError) {
            console.error(
              'FLAMIORA unauthorized account sign-out error:',
              signOutError
            );
          }

          showLogin();

          if (loginError) {
            loginError.textContent =
              t(
                'admin.login.accessDenied'
              );
          }

          return;
        }

        /*
         * الحساب صحيح (نفس البريد المسموح به).
         * نفتح لوحة الإدارة ونحمّل البيانات مباشرة،
         * بدون اشتراط email_verified (نفس منطق Touba).
         */
        try {
          showShell();

          if (loginError) {
            loginError.textContent = '';
          }

          await loadAdminData();

          const hash =
            location.hash.replace(
              '#',
              ''
            );

          if (
            hash &&
            document.getElementById(
              `view-${hash}`
            )
          ) {
            switchView(hash);
          }
        } catch (err) {
          console.error(
            'FLAMIORA admin data loading error:',
            err
          );

          /*
           * لا نعمل signOut هنا.
           * الحساب صحيح، وقد يكون الخطأ بسبب Firestore
           * أو Index أو Rules أو استعلام معين.
           */
          showShell();

          if (loginError) {
            loginError.textContent =
              t(
                'admin.login.error'
              );
          }
        }
      }
    );
  }
);
