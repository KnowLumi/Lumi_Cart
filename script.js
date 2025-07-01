// Lumi Cart basic product rendering

// Profile Modal Popup
function showProfileModal() {
    // Remove existing modal if present
    const oldModal = document.getElementById('profile-modal');
    if (oldModal) oldModal.parentNode.removeChild(oldModal);
    const user = window.lumiUserProductStatus || {};
    const name = user.studentName || '-';
    const lumiId = user.lumiID || '-';
    const totalPoints = typeof user.totalPoints !== 'undefined' ? user.totalPoints : '-';
    const remainingCoins = typeof user.remainingCoins !== 'undefined' ? user.remainingCoins : '-';
    const purchased = (user.purchasedItems && user.purchasedItems.length) ? user.purchasedItems : [];
    let purchasedHTML = purchased.length ? `<ul class='list-disc ml-6 text-left text-sm text-gray-700'>${purchased.map(p => `<li>${p}</li>`).join('')}</ul>` : '<div class="text-gray-400 text-sm">None</div>';
    let modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
      <div style="background:white;padding:2.2rem 2.5rem;border-radius:1.25rem;box-shadow:0 6px 32px rgba(0,0,0,0.15);text-align:center;min-width:320px;max-width:95vw;position:relative;">
        <svg class="w-14 h-14 mx-auto mb-2 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
        <div class="text-xl font-bold text-indigo-700 mb-1">${name}</div>
        <div class="text-sm text-gray-500 mb-2">Lumi ID: <span class="font-mono font-semibold text-indigo-600">${lumiId}</span></div>
        <div class="flex justify-between gap-4 mb-2 text-sm">
          <div class="bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 font-semibold">Total Points: ${totalPoints}</div>
          <div class="bg-yellow-50 px-3 py-1 rounded-full text-yellow-700 font-semibold">Coins: ${remainingCoins}</div>
        </div>
        <button id="profile-purchased-btn" class="w-full text-base font-semibold text-indigo-700 mt-3 mb-1 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition">Purchased Products</button>
        <button id="profile-logout-btn" class="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold shadow">Logout</button>
        <button id="profile-modal-close" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">&times;</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('profile-logout-btn').onclick = function() {
        localStorage.removeItem('lumi_logged_in');
        localStorage.removeItem('lumi_id');
        window.location.href = 'login.html';
    };
    document.getElementById('profile-modal-close').onclick = function() {
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    };
    const purchasedBtn = document.getElementById('profile-purchased-btn');
    if (purchasedBtn) {
        purchasedBtn.onclick = function() {
            window.location.href = 'purchased.html';
        };
    }
    // Close modal on outside click
    modal.onclick = function(e) {
        if (e.target === modal) {
            if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
        profileIcon.style.cursor = 'pointer';
        profileIcon.onclick = showProfileModal;
    }
});
// Redirect to login if not logged in
if (localStorage.getItem('lumi_logged_in') !== '1') {
    window.location.href = 'login.html';
}
// Redirect to login if not logged in
if (localStorage.getItem('lumi_logged_in') !== '1') {
    window.location.href = 'login.html';
}
const PRODUCT_API_URL = 'https://script.google.com/macros/s/AKfycbydpawmC87SxZnDd_laS5sfhU0q6POq8UtLHW5fKV7Duvj1nY9DyShz4nABJBuMpLj3/exec';

const grid = document.getElementById('product-grid');



function showProductLoadingSpinner() {
    let spinner = document.getElementById('product-loading');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'product-loading';
        spinner.className = 'flex flex-col items-center justify-center py-12';
        spinner.innerHTML = `
          <svg class="animate-spin h-10 w-10 text-indigo-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <div class="text-indigo-600 font-semibold">Loading products...</div>
        `;
        if (grid) grid.innerHTML = '';
        grid?.parentNode?.insertBefore(spinner, grid);
    }
    spinner.classList.remove('hidden');
}
function hideProductLoadingSpinner() {
    const spinner = document.getElementById('product-loading');
    if (spinner) spinner.classList.add('hidden');
}

let fetchedProducts = [];
// Fetch user-specific product status
async function fetchUserProductStatus() {
    const lumiId = localStorage.getItem('lumi_id');
    if (!lumiId) return null;
    const apiUrl = `https://script.google.com/macros/s/AKfycbxL-8OP4-zkJ187IMhnrvBk7_vrF0hfkX3K8YkmMcqefN0hjt8L-wgJUktRjerO4LBD/exec?lumiID=${encodeURIComponent(lumiId)}`;
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        window.lumiUserProductStatus = data;
        return data;
    } catch (err) {
        window.lumiUserProductStatus = null;
        return null;
    }
}

async function fetchProductsAndRender() {
    showProductLoadingSpinner();
    let products = [];
    try {
        await fetchUserProductStatus(); // Wait for user status before rendering
        const res = await fetch(PRODUCT_API_URL);
        products = await res.json();
    } catch (e) {
        hideProductLoadingSpinner();
        if (grid) grid.innerHTML = '<div class="text-red-500 text-center py-8">Failed to load products.</div>';
        return;
    }
    hideProductLoadingSpinner();
    fetchedProducts = products;
    renderProducts(products);
}

function renderProducts(products) {
    if (!grid) return;
    grid.innerHTML = '';
    // Map product names to status if available
    let apiProductsMap = {};
    let totalPoints = 0;
    if (window.lumiUserProductStatus && window.lumiUserProductStatus.student) {
        totalPoints = parseFloat(window.lumiUserProductStatus.student.totalPoints) || 0;
    }
    if (window.lumiUserProductStatus && window.lumiUserProductStatus.products) {
        window.lumiUserProductStatus.products.forEach(p => {
            apiProductsMap[(p.name || '').trim().toLowerCase()] = p;
        });
    }
    products.forEach((product, idx) => {
        const prodName = (product["Item Name"] || '').trim().toLowerCase();
        let status = 'locked';
        let requiredPoints = 0;
        if (apiProductsMap[prodName]) {
            status = apiProductsMap[prodName].status;
            requiredPoints = parseFloat(apiProductsMap[prodName].requiredPoints) || 0;
        } else {
            requiredPoints = parseFloat(product["Total Lumi Points Need to purchase this item"]) || 0;
            if (totalPoints >= requiredPoints) status = 'eligible';
        }
        // Skip rendering purchased products
        if (status === 'purchased') return;
        const div = document.createElement('div');
        div.className = "relative bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center transition-transform transform hover:-translate-y-2 hover:shadow-2xl group overflow-hidden";
        let overlay = '';
        let purchasedBadge = '';
        let addToCartBtn = `<button class=\"add-to-cart bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-pink-500 hover:to-indigo-500 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300\" data-id=\"${idx}\">\n                <span class=\"inline-block align-middle\">Add to Cart</span>\n                <svg class=\"w-5 h-5 inline-block ml-2 align-middle\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M10 21a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z\"/></svg>\n            </button>`;
        let redeemBtn = `<button class=\"redeem-lumi-coin mt-2 border border-blue-500 text-blue-600 px-6 py-2 rounded-full font-semibold shadow-sm hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full\" data-id=\"${idx}\">\n                Redeem Lumi Coin\n            </button>`;
        if (status === 'purchased') {
            purchasedBadge = `<div class=\"absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow\">Purchased</div>`;
            addToCartBtn = '';
            redeemBtn = '';
        }
        if (status === 'locked') {
            overlay = `<div class=\"absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-10 rounded-3xl\"><svg class=\"w-10 h-10 text-gray-400 mb-2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 17v.01M17 8V7a5 5 0 10-10 0v1M5 8h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z\"/></svg><span class=\"text-gray-500 text-xs font-semibold\">Locked</span></div>`;
            addToCartBtn = `<button class=\"add-to-cart bg-gray-300 text-gray-400 px-6 py-2 rounded-full font-semibold cursor-not-allowed w-full\" data-id=\"${idx}\" disabled>Locked</button>`;
            redeemBtn = `<button class=\"redeem-lumi-coin mt-2 border border-gray-300 text-gray-400 px-6 py-2 rounded-full font-semibold cursor-not-allowed w-full\" data-id=\"${idx}\" disabled>Redeem Lumi Coin</button>`;
        }
        div.innerHTML = `
            <div class='relative w-full flex justify-center'>
                <img src="${product["Image"]}" alt="${product["Item Name"]}" class="w-32 h-32 object-cover rounded-xl mb-4 border-4 border-indigo-100 group-hover:border-indigo-300 transition">
                ${purchasedBadge}
                ${overlay}
            </div>
            <h2 class="text-lg font-bold mb-1 text-gray-800 group-hover:text-indigo-600 transition">${product["Item Name"]}</h2>
            <p class="text-xl text-indigo-600 font-extrabold mb-1 price-display">₹${product["Price in lumi cart before applying coin"]}</p>
            <p class="text-xs text-gray-400 mb-4">Lumi Points required to unlock: <span class="font-bold text-pink-500 text-sm">${product["Total Lumi Points Need to purchase this item"]}</span></p>
            ${addToCartBtn}
            ${redeemBtn}
        `;
        // Add redeem logic
        setTimeout(() => {
            const redeemBtn = div.querySelector('.redeem-lumi-coin');
            const priceDisplay = div.querySelector('.price-display');
            let redeemed = false;
            if (redeemBtn && priceDisplay) {
                redeemBtn.addEventListener('click', function() {
                    if (redeemed) return;
                    // Calculate redeemable coins
                    const before = parseFloat(product["Price in lumi cart before applying coin"]);
                    const after = parseFloat(product["Price of the product (Price in lumi cart  after applying coin)"]);
                    const maxCoins = parseFloat(product["Total Lumi Points Need to purchase this item"]) || 0;
                    let discount = maxCoins * 10;
                    let newPrice = before - discount;
                    let coinsUsed = maxCoins;
                    if (newPrice < after) {
                        coinsUsed = (before - after) / 10;
                        newPrice = after;
                    }
                    // Check if user has enough Lumi Coins
                    let remainingCoins = 0;
                    if (window.lumiUserProductStatus && typeof window.lumiUserProductStatus.remainingCoins !== 'undefined') {
                        remainingCoins = parseFloat(window.lumiUserProductStatus.remainingCoins) || 0;
                    }
                    if (remainingCoins < coinsUsed) {
                        // Show not enough coins popup
                        let modal = document.createElement('div');
                        modal.style.position = 'fixed';
                        modal.style.top = '0';
                        modal.style.left = '0';
                        modal.style.width = '100vw';
                        modal.style.height = '100vh';
                        modal.style.background = 'rgba(0,0,0,0.4)';
                        modal.style.display = 'flex';
                        modal.style.alignItems = 'center';
                        modal.style.justifyContent = 'center';
                        modal.style.zIndex = '9999';
                        modal.innerHTML = `
                          <div style="background:white;padding:2rem 2.5rem;border-radius:1rem;box-shadow:0 6px 32px rgba(0,0,0,0.15);text-align:center;max-width:90vw;">
                            <div class="text-red-600 font-semibold mb-2">You do not have the required Lumi Coins to redeem this product.</div>
                            <button id="modal-not-enough-coins-btn" class="mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition-all duration-200">OK</button>
                          </div>
                        `;
                        document.body.appendChild(modal);
                        document.getElementById('modal-not-enough-coins-btn').onclick = function() {
                            document.body.removeChild(modal);
                        };
                        return;
                    }
                    // Show popup/modal
                    let modal = document.createElement('div');
                    modal.style.position = 'fixed';
                    modal.style.top = '0';
                    modal.style.left = '0';
                    modal.style.width = '100vw';
                    modal.style.height = '100vh';
                    modal.style.background = 'rgba(0,0,0,0.4)';
                    modal.style.display = 'flex';
                    modal.style.alignItems = 'center';
                    modal.style.justifyContent = 'center';
                    modal.style.zIndex = '9999';
                    modal.innerHTML = `
                      <div style="background:white;padding:2rem 2.5rem;border-radius:1rem;box-shadow:0 6px 32px rgba(0,0,0,0.15);text-align:center;max-width:90vw;">
                        <div class="text-blue-600 font-semibold mb-2">You are only able to redeem <span class='font-bold'>${coinsUsed} Lumi Coin${coinsUsed!==1?'s':''}</span> on this product.</div>
                        <button id="modal-redeem-btn" class="mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition-all duration-200">Redeem</button>
                        <button id="modal-cancel-btn" class="ml-3 mt-4 border border-gray-300 text-gray-600 px-6 py-2 rounded-full font-semibold shadow-sm hover:bg-gray-100 transition-all duration-200">Cancel</button>
                      </div>
                    `;
                    document.body.appendChild(modal);
                    document.getElementById('modal-cancel-btn').onclick = function() {
                        document.body.removeChild(modal);
                    };
                    document.getElementById('modal-redeem-btn').onclick = function() {
                        priceDisplay.textContent = `₹${newPrice.toFixed(2)}`;
                        redeemBtn.textContent = 'Redeemed!';
                        redeemBtn.classList.add('bg-blue-200','text-blue-400','border-blue-200','cursor-not-allowed');
                        redeemBtn.disabled = true;
                        redeemed = true;
                        // Show only redeemed message
                        let msg = document.createElement('div');
                        msg.className = 'text-xs text-green-600 mt-2 font-semibold';
                        msg.textContent = `You redeemed ${coinsUsed} Lumi Coin${coinsUsed !== 1 ? 's' : ''} for this product.`;
                        redeemBtn.parentNode.insertBefore(msg, redeemBtn.nextSibling);
                        // Add Cancel Redeem button
                        let cancelBtn = document.createElement('button');
                        cancelBtn.textContent = 'Cancel Redeem';
                        cancelBtn.className = 'mt-2 border border-red-400 text-red-600 px-4 py-1 rounded-full font-semibold shadow-sm hover:bg-red-50 transition-all duration-200 ml-2';
                        redeemBtn.parentNode.insertBefore(cancelBtn, msg.nextSibling);
                        cancelBtn.onclick = function() {
                            priceDisplay.textContent = `₹${before.toFixed(2)}`;
                            redeemBtn.textContent = 'Redeem Lumi Coin';
                            redeemBtn.classList.remove('bg-blue-200','text-blue-400','border-blue-200','cursor-not-allowed');
                            redeemBtn.disabled = false;
                            redeemed = false;
                            if (msg && msg.parentNode) msg.parentNode.removeChild(msg);
                            if (cancelBtn && cancelBtn.parentNode) cancelBtn.parentNode.removeChild(cancelBtn);
                        };
                        document.body.removeChild(modal);
                    };
                });
            }
        }, 0);
        grid.appendChild(div);
    });
}

fetchProductsAndRender();

// Toast notification function
function showToast(message) {
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-pink-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-center transition-opacity duration-300';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 2000);
}

// (Removed hardcoded rendering, replaced by fetchProductsAndRender above)

// Cart logic
let cart = JSON.parse(localStorage.getItem('lumi_cart') || '[]');
function saveCart() {
    localStorage.setItem('lumi_cart', JSON.stringify(cart));
}
function updateCartCount() {
    const badge = document.getElementById('cart-count');
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
    badge.style.animation = 'none';
    void badge.offsetWidth;
    badge.style.animation = null;
}

function updateCartDropdown() {
    let dropdown = document.getElementById('cart-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'cart-dropdown';
        dropdown.className = 'absolute right-0 top-20 w-80 bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50 p-4 animate-fade-in';
        dropdown.style.display = 'none';
        document.querySelector('.cart-glass').appendChild(dropdown);
    }
    if (cart.length === 0) {
        dropdown.innerHTML = '<div class="text-gray-400 text-center py-8">Your cart is empty 🛒</div>';
        return;
    }
    let html = '<div class="font-bold text-lg mb-2 text-indigo-700">Your Cart</div>';
    html += '<ul class="divide-y divide-gray-100 mb-2">';
    cart.forEach(item => {
        html += `<li class="flex items-center py-2">
            <img src="${item.product.image}" alt="${item.product.name}" class="w-10 h-10 rounded-lg mr-3 border border-indigo-100">
            <span class="flex-1">${item.product.name}</span>
            <span class="mx-2 text-gray-500">x${item.qty}</span>
            <span class="font-bold text-indigo-600">$${(item.product.price * item.qty).toFixed(2)}</span>
        </li>`;
    });
    html += '</ul>';
    const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    html += `<div class="flex justify-between font-semibold text-indigo-700 mt-4"><span>Total:</span><span>$${total.toFixed(2)}</span></div>`;
    dropdown.innerHTML = html;
}

grid.addEventListener('click', function(e) {
    const btn = e.target.closest('.add-to-cart');
    if (btn) {
        const idx = parseInt(btn.getAttribute('data-id'));
        const product = fetchedProducts[idx];
        if (!product) return;
        let cartItem = cart.find(item => item.product["Item Name"] === product["Item Name"]);
        if (!cartItem) {
            cart.push({ product, qty: 1 });
        } else {
            showToast('You can only purchase one of each product.');
            return;
        }
        updateCartCount();
        saveCart();
        updateCartDropdown();
        // Simple animation for cart icon
        const cartBtn = document.getElementById('cart-btn');
        cartBtn.classList.add('scale-110');
        setTimeout(() => cartBtn.classList.remove('scale-110'), 150);
    }
});

// Cart icon click: go to cart.html
const cartBtn = document.getElementById('cart-btn');
cartBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'cart.html';
});
// Initial render
updateCartCount();
