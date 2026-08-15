document.addEventListener('DOMContentLoaded', function () {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  const PRODUCT = {
    name: 'Satin Cowl-Neck Midi Dress',
    price: 168
  };

  const VARIANTS = {
    Champagne: [
      { src: 'assets/champagne-main.png', alt: 'Champagne satin midi dress, front view' },
      { src: 'assets/champagne-side.png', alt: 'Champagne satin midi dress, back and side view' },
      { src: 'assets/champagne-detail.png', alt: 'Champagne satin midi dress, close-up detail view' }
    ],
    Black: [
      { src: 'assets/black-main.png', alt: 'Black satin midi dress, front view' },
      { src: 'assets/black-side.png', alt: 'Black satin midi dress, back and side view' },
      { src: 'assets/black-detail.png', alt: 'Black satin midi dress, close-up detail view' }
    ],
    Sage: [
      { src: 'assets/sage-main.png', alt: 'Sage satin midi dress, front view' },
      { src: 'assets/sage-side.png', alt: 'Sage satin midi dress, back and side view' },
      { src: 'assets/sage-detail.png', alt: 'Sage satin midi dress, close-up detail view' }
    ]
  };

  const state = {
    color: 'Champagne',
    size: 'M',
    quantity: 1,
    galleryIndex: 0,
    wishlist: false,
    cart: JSON.parse(localStorage.getItem('maisonEliseCart') || '[]')
  };

  const mainImage = $('#main-product-image');
  const thumbnails = $$('.thumbnail');
  const colorLabel = $('[data-color-label]');
  const variantLabel = $('[data-selected-variant]');
  const qtyDisplay = $('[data-qty]');
  const bagCount = $('[data-bag-count]');
  const toast = $('[data-toast]');
  const overlay = $('[data-overlay]');
  const cartDrawer = $('[data-cart-drawer]');
  const cartContent = $('[data-cart-content]');
  const cartFooter = $('[data-cart-footer]');
  const subtotalEl = $('[data-cart-subtotal]');
  const searchPanel = $('[data-search-panel]');
  const sizeGuide = $('[data-size-guide]');
  const zoomModal = $('[data-zoom-modal]');
  const zoomImage = $('[data-zoom-image]');
  const quickViewModal = $('[data-quick-view-modal]');

  function money(value) {
    return '$' + value.toFixed(0) + ' CAD';
  }

  function persistCart() {
    localStorage.setItem('maisonEliseCart', JSON.stringify(state.cart));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function updateVariantLabel() {
    variantLabel.textContent = state.color + ' / ' + state.size;
  }

  function renderGallery() {
    const images = VARIANTS[state.color];
    state.galleryIndex = Math.min(state.galleryIndex, images.length - 1);

    thumbnails.forEach((button, index) => {
      const image = images[index];
      const thumbImg = button.querySelector('img');
      thumbImg.src = image.src;
      button.classList.toggle('is-active', index === state.galleryIndex);
    });

    mainImage.src = images[state.galleryIndex].src;
    mainImage.alt = images[state.galleryIndex].alt;
  }

  function selectGalleryImage(index) {
    state.galleryIndex = index;
    renderGallery();
  }

  thumbnails.forEach((button, index) => {
    button.addEventListener('click', () => selectGalleryImage(index));
  });

  $$('.swatch').forEach(button => {
    button.addEventListener('click', function () {
      $$('.swatch').forEach(item => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      state.color = button.dataset.color;
      state.galleryIndex = 0;
      colorLabel.textContent = state.color;
      updateVariantLabel();
      renderGallery();
    });
  });

  $$('[data-size]').forEach(button => {
    button.addEventListener('click', function () {
      $$('[data-size]').forEach(item => item.classList.remove('is-selected'));
      button.classList.add('is-selected');
      state.size = button.dataset.size;
      updateVariantLabel();
    });
  });

  $('[data-qty-minus]').addEventListener('click', () => {
    state.quantity = Math.max(1, state.quantity - 1);
    qtyDisplay.textContent = state.quantity;
  });

  $('[data-qty-plus]').addEventListener('click', () => {
    state.quantity += 1;
    qtyDisplay.textContent = state.quantity;
  });

  function openOverlayUI(element) {
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    element.classList.add('is-open');
    element.setAttribute('aria-hidden', 'false');
  }

  function closeOverlayUI(element) {
    element.classList.remove('is-open');
    element.setAttribute('aria-hidden', 'true');

    const anyOpen = [cartDrawer, searchPanel, sizeGuide, zoomModal, quickViewModal]
      .some(el => el.classList.contains('is-open'));

    if (!anyOpen) {
      overlay.hidden = true;
      document.body.classList.remove('no-scroll');
    }
  }

  function addMainProductToCart() {
    const image = VARIANTS[state.color][0].src;

    const existing = state.cart.find(item =>
      item.name === PRODUCT.name &&
      item.color === state.color &&
      item.size === state.size
    );

    if (existing) {
      existing.quantity += state.quantity;
    } else {
      state.cart.push({
        name: PRODUCT.name,
        price: PRODUCT.price,
        image,
        color: state.color,
        size: state.size,
        quantity: state.quantity
      });
    }

    persistCart();
    renderCart();
    showToast(state.quantity + (state.quantity === 1 ? ' item added to bag' : ' items added to bag'));
  }

  $('[data-add-to-bag]').addEventListener('click', addMainProductToCart);

  $('[data-buy-now]').addEventListener('click', function () {
    addMainProductToCart();
    openOverlayUI(cartDrawer);
  });

  function addRelatedProduct(card) {
    const name = card.dataset.miniProduct;
    const price = Number(card.dataset.miniPrice);
    const image = card.dataset.miniImage;
    const existing = state.cart.find(item => item.name === name);

    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        name,
        price,
        image,
        color: 'Featured',
        size: 'M',
        quantity: 1
      });
    }

    persistCart();
    renderCart();
    showToast(name + ' added to bag');
  }

  $$('.quick-add').forEach(button => {
    button.addEventListener('click', function () {
      addRelatedProduct(button.closest('.mini-product'));
    });
  });

  function renderCart() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    bagCount.textContent = totalQty;
    subtotalEl.textContent = money(subtotal);

    if (state.cart.length === 0) {
      cartContent.innerHTML = `
        <div class="empty-cart">
          <p>Your bag is currently empty.</p>
          <button type="button" class="secondary-btn" data-empty-cart-close>Continue shopping</button>
        </div>`;
      cartFooter.hidden = true;
      const button = $('[data-empty-cart-close]');
      if (button) button.addEventListener('click', () => closeOverlayUI(cartDrawer));
      return;
    }

    cartFooter.hidden = false;

    cartContent.innerHTML = state.cart.map((item, index) => `
      <article class="cart-line">
        <img src="${item.image}" alt="">
        <div>
          <h3>${item.name}</h3>
          <div class="cart-meta">${item.color} / ${item.size}<br>${money(item.price)}</div>
          <div class="cart-controls">
            <button type="button" data-cart-minus="${index}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-plus="${index}">+</button>
            <button class="remove-btn" type="button" data-cart-remove="${index}">Remove</button>
          </div>
        </div>
      </article>
    `).join('');

    $$('[data-cart-minus]').forEach(button => {
      button.addEventListener('click', function () {
        const i = Number(button.dataset.cartMinus);
        state.cart[i].quantity -= 1;
        if (state.cart[i].quantity <= 0) state.cart.splice(i, 1);
        persistCart();
        renderCart();
      });
    });

    $$('[data-cart-plus]').forEach(button => {
      button.addEventListener('click', function () {
        state.cart[Number(button.dataset.cartPlus)].quantity += 1;
        persistCart();
        renderCart();
      });
    });

    $$('[data-cart-remove]').forEach(button => {
      button.addEventListener('click', function () {
        state.cart.splice(Number(button.dataset.cartRemove), 1);
        persistCart();
        renderCart();
      });
    });
  }

  $('[data-cart-open]').addEventListener('click', () => openOverlayUI(cartDrawer));
  $$('[data-cart-close]').forEach(button => button.addEventListener('click', () => closeOverlayUI(cartDrawer)));

  $('[data-checkout]').addEventListener('click', function () {
    showToast('Demo checkout — no payment will be processed');
  });

  $$('[data-wishlist]').forEach(button => {
    button.addEventListener('click', function () {
      state.wishlist = !state.wishlist;

      $$('[data-wishlist]').forEach(item => {
        item.classList.toggle('is-active', state.wishlist);
        item.textContent = state.wishlist ? '♥' : '♡';
      });

      showToast(state.wishlist ? 'Added to wishlist' : 'Removed from wishlist');
    });
  });

  $$('.accordion > button').forEach(button => {
    button.addEventListener('click', function () {
      const article = button.closest('.accordion');
      const panel = article.querySelector('.accordion-panel');
      const isOpen = article.classList.contains('is-open');

      article.classList.toggle('is-open', !isOpen);
      button.setAttribute('aria-expanded', String(!isOpen));
      button.lastElementChild.textContent = isOpen ? '+' : '−';
      panel.hidden = isOpen;
    });
  });

  const menuToggle = $('[data-menu-toggle]');
  const nav = $('[data-nav]');

  menuToggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  $('[data-search-open]').addEventListener('click', () => openOverlayUI(searchPanel));
  $('[data-search-close]').addEventListener('click', () => closeOverlayUI(searchPanel));

  const searchInput = $('[data-search-input]');
  const searchResults = $('[data-search-results]');

  const searchData = [
    ['Satin Cowl-Neck Midi Dress', 'Satin · Midi · Occasion'],
    ['Asymmetric Midi Dress', 'Wedding · Evening'],
    ['Draped Evening Dress', 'Draped · Evening'],
    ['Soft Tailored Midi', 'Tailored · Midi']
  ];

  searchInput.addEventListener('input', function () {
    const term = searchInput.value.trim().toLowerCase();

    if (!term) {
      searchResults.innerHTML = '<p class="muted">Try “satin”, “midi”, or “wedding”.</p>';
      return;
    }

    const results = searchData.filter(item =>
      item.join(' ').toLowerCase().includes(term)
    );

    searchResults.innerHTML = results.length
      ? results.map(item => `<div class="search-result-item"><strong>${item[0]}</strong><span>${item[1]}</span></div>`).join('')
      : '<p class="muted">No demo products matched your search.</p>';
  });

  $('[data-size-guide-open]').addEventListener('click', () => openOverlayUI(sizeGuide));
  $('[data-size-guide-close]').addEventListener('click', () => closeOverlayUI(sizeGuide));

  $('[data-zoom-open]').addEventListener('click', function () {
    zoomImage.src = mainImage.src;
    zoomImage.alt = mainImage.alt;
    openOverlayUI(zoomModal);
  });

  $('[data-zoom-close]').addEventListener('click', () => closeOverlayUI(zoomModal));

  $('[data-scroll-reviews]').addEventListener('click', function () {
    $('#reviews').scrollIntoView({ behavior: 'smooth' });
  });

  let quickViewCard = null;

  $$('[data-quick-view]').forEach(button => {
    button.addEventListener('click', function () {
      quickViewCard = button.closest('.mini-product');

      $('[data-quick-view-image]').src = quickViewCard.dataset.miniImage;
      $('[data-quick-view-image]').alt = quickViewCard.dataset.miniProduct;
      $('[data-quick-view-title]').textContent = quickViewCard.dataset.miniProduct;
      $('[data-quick-view-price]').textContent = money(Number(quickViewCard.dataset.miniPrice));

      openOverlayUI(quickViewModal);
    });
  });

  $('[data-quick-view-close]').addEventListener('click', () => closeOverlayUI(quickViewModal));

  $('[data-quick-view-add]').addEventListener('click', function () {
    if (quickViewCard) {
      addRelatedProduct(quickViewCard);
      closeOverlayUI(quickViewModal);
      openOverlayUI(cartDrawer);
    }
  });

  overlay.addEventListener('click', function () {
    [cartDrawer, searchPanel, sizeGuide, zoomModal, quickViewModal].forEach(closeOverlayUI);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      [cartDrawer, searchPanel, sizeGuide, zoomModal, quickViewModal].forEach(closeOverlayUI);
    }
  });

  renderGallery();
  updateVariantLabel();
  renderCart();
});
