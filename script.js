/**
 * MYMO DRINK SUSU KURMA - INTERACTIVE D2C ENGINE
 * Bespoke Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Set Current Year in Footer
  const yearElem = document.getElementById('currentYear');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // -------------------------------------------------------------
  // 3. State Management: Size Selection & Cart
  // -------------------------------------------------------------
  let currentSelectedSize = '250'; // '250' or '150'
  let cart = []; // Array of { id, name, size, price, qty, img }

  const btnSize250 = document.getElementById('btnSize250');
  const btnSize150 = document.getElementById('btnSize150');
  const productCards = document.querySelectorAll('.product-card');

  // Format IDR Currency
  function formatIDR(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  // Update Products Display based on selected size
  function updateProductSizes(size) {
    currentSelectedSize = size;
    
    // Toggle active class on buttons
    if (size === '250') {
      btnSize250.classList.add('active');
      btnSize150.classList.remove('active');
    } else {
      btnSize150.classList.add('active');
      btnSize250.classList.remove('active');
    }

    productCards.forEach(card => {
      const priceElem = card.querySelector('.current-price');
      const origPriceElem = card.querySelector('.original-price');
      const imgElem = card.querySelector('.variant-img');

      if (priceElem) {
        const newPrice = priceElem.getAttribute(`data-price-${size}`);
        if (newPrice) priceElem.textContent = formatIDR(parseInt(newPrice, 10));
      }

      if (origPriceElem) {
        const newOrigPrice = origPriceElem.getAttribute(`data-orig-${size}`);
        if (newOrigPrice) origPriceElem.textContent = formatIDR(parseInt(newOrigPrice, 10));
      }

      if (imgElem) {
        const newImg = imgElem.getAttribute(`data-img-${size}`);
        if (newImg) {
          imgElem.src = newImg;
        }
      }
    });
  }

  if (btnSize250 && btnSize150) {
    btnSize250.addEventListener('click', () => updateProductSizes('250'));
    btnSize150.addEventListener('click', () => updateProductSizes('150'));
  }

  // -------------------------------------------------------------
  // 4. Cart Drawer Mechanics & WhatsApp Checkout
  // -------------------------------------------------------------
  const cartOpenBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const btnCheckoutWA = document.getElementById('btnCheckoutWA');
  const custNameInput = document.getElementById('custName');
  const custAddressInput = document.getElementById('custAddress');

  function openCart() {
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  
  if (cartOverlay) {
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) closeCart();
    });
  }

  // Show Toast
  const toastNotice = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotice) return;
    toastMsg.textContent = message;
    toastNotice.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  // Add Item to Cart
  function addToCart(item) {
    const existingIndex = cart.findIndex(c => c.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    renderCart();
    showToast(`${item.name} ditambahkan ke keranjang!`);
  }

  // Update Cart Render
  function renderCart() {
    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <i data-lucide="shopping-bag" style="width:48px; height:48px; margin:0 auto 1rem; opacity:0.3;"></i>
          <p>Keranjang MyMo Anda masih kosong.</p>
          <small>Pilih varian rasa segar atau paket hemat favorit Anda!</small>
        </div>
      `;
      cartTotalPrice.textContent = 'Rp 0';
      cartCountBadge.textContent = '0';
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let total = 0;
    let totalItems = 0;
    cartItemsList.innerHTML = '';

    cart.forEach((item, index) => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      totalItems += item.qty;

      const itemCard = document.createElement('div');
      itemCard.className = 'cart-item';
      itemCard.innerHTML = `
        <img src="${item.img || 'assets/mymo-logo.jpg'}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='assets/mymo-logo.jpg'">
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">${formatIDR(item.price)}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
        </div>
      `;
      cartItemsList.appendChild(itemCard);
    });

    cartTotalPrice.textContent = formatIDR(total);
    cartCountBadge.textContent = totalItems;

    // Attach event listeners for qty buttons
    cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        if (action === 'increase') {
          cart[index].qty += 1;
        } else if (action === 'decrease') {
          cart[index].qty -= 1;
          if (cart[index].qty <= 0) {
            cart.splice(index, 1);
          }
        }
        renderCart();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Hook Add-to-cart on Direct Product Cards (250ml & 150ml)
  document.querySelectorAll('.btn-add-direct').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10);
      const img = btn.getAttribute('data-img') || 'assets/mymo-hero.jpg';

      addToCart({
        id: name,
        name: name,
        size: name.includes('250ml') ? '250ml' : '150ml',
        price: price,
        img: img
      });

      // Pulse animation on badge
      cartCountBadge.style.transform = 'scale(1.4)';
      setTimeout(() => cartCountBadge.style.transform = '', 300);
    });
  });

  // Hook Add-to-cart on Product Cards (if any)
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      const rawName = btn.getAttribute('data-name');
      const sizeLabel = currentSelectedSize === '250' ? '250ml' : '150ml';
      const fullName = `${rawName} (${sizeLabel})`;
      const priceElem = card.querySelector('.current-price');
      const price = parseInt(priceElem.getAttribute(`data-price-${currentSelectedSize}`), 10);
      const imgElem = card.querySelector('.variant-img');
      const img = imgElem ? imgElem.src : 'assets/mymo-logo.jpg';

      addToCart({
        id: `${rawName}-${sizeLabel}`,
        name: fullName,
        size: sizeLabel,
        price: price,
        img: img
      });

      // Pulse animation on badge
      cartCountBadge.style.transform = 'scale(1.4)';
      setTimeout(() => cartCountBadge.style.transform = '', 300);
    });
  });

  // Hook Add-to-cart on Bundles & Reseller
  document.querySelectorAll('.btn-add-bundle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'), 10);

      addToCart({
        id: name,
        name: name,
        size: 'Paket Bundling',
        price: price,
        img: 'assets/mymo-hero.jpg'
      });

      openCart();
    });
  });

  // WhatsApp Direct Order Generator (Target WA: 0857-7024-5967)
  if (btnCheckoutWA) {
    btnCheckoutWA.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Pilih produk MyMo terlebih dahulu!');
        return;
      }

      const custName = custNameInput ? custNameInput.value.trim() : '';
      const custAddress = custAddressInput ? custAddressInput.value.trim() : '';

      if (!custName) {
        alert('Mohon isi Nama Pemesan terlebih dahulu.');
        custNameInput.focus();
        return;
      }

      let total = 0;
      let orderListText = '';

      cart.forEach((item, i) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        orderListText += `${i + 1}. ${item.name} (${item.qty}x) = ${formatIDR(subtotal)}\n`;
      });

      const message = 
`Halo MyMo Drink! Saya mau memesan Susu Kurma Premium:

📋 *DETAIL PESANAN:*
${orderListText}
*TOTAL: ${formatIDR(total)}*

👤 *DATA PENGIRIMAN:*
Nama: ${custName}
Alamat / Wilayah: ${custAddress || 'BSD / Tangsel / Jabodetabek'}

Catatan: No Added Sugar and Water (Sajikan Dingin)
Mohon info ketersediaan & no rekening untuk pembayarannya ya. Terima kasih!`;

      // Official WhatsApp Number from MyMo Label: 0857-7024-5967
      const waUrl = `https://wa.me/6285770245967?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');
    });
  }

  // -------------------------------------------------------------
  // 5. Video Reel Modal
  // -------------------------------------------------------------
  const videoModal = document.getElementById('videoModal');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const videoCloseBtn = document.getElementById('videoCloseBtn');

  function openVideoModal(url) {
    if (!videoModal || !modalVideoPlayer) return;
    modalVideoPlayer.src = url;
    videoModal.classList.add('open');
    modalVideoPlayer.play().catch(e => console.log('Autoplay blocked:', e));
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    if (!videoModal || !modalVideoPlayer) return;
    modalVideoPlayer.pause();
    modalVideoPlayer.src = '';
    videoModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.reel-card').forEach(card => {
    card.addEventListener('click', () => {
      const videoUrl = card.getAttribute('data-video-url');
      if (videoUrl) {
        openVideoModal(videoUrl);
      }
    });
  });

  if (videoCloseBtn) videoCloseBtn.addEventListener('click', closeVideoModal);
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // -------------------------------------------------------------
  // 6. FAQ Accordion Mechanics
  // -------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');

    if (trigger && panel) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other FAQs
        faqItems.forEach(other => {
          other.classList.remove('active');
          const otherPanel = other.querySelector('.faq-panel');
          if (otherPanel) otherPanel.style.maxHeight = null;
        });

        // Toggle current FAQ
        if (!isActive) {
          item.classList.add('active');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          panel.style.maxHeight = null;
        }
      });
    }
  });

  // -------------------------------------------------------------
  // 7. Mobile Menu Toggle
  // -------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        const isOpen = navLinks.style.display === 'flex';
        navLinks.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
          navLinks.style.flexDirection = 'column';
          navLinks.style.position = 'absolute';
          navLinks.style.top = '80px';
          navLinks.style.left = '0';
          navLinks.style.right = '0';
          navLinks.style.background = 'white';
          navLinks.style.padding = '1.5rem';
          navLinks.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        }
      }
    });
  }

  // Initial cart render
  renderCart();
});
