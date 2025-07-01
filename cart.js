// Lumi Cart - Cart Page
// Redirect to login if not logged in
if (localStorage.getItem('lumi_logged_in') !== '1') {
    window.location.href = 'login.html';
}
// Redirect to login if not logged in
if (localStorage.getItem('lumi_logged_in') !== '1') {
    window.location.href = 'login.html';
}
// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('lumi_cart') || '[]');
}
function setCart(cart) {
    localStorage.setItem('lumi_cart', JSON.stringify(cart));
}
function renderCart() {
    const cart = getCart();
    const cartList = document.getElementById('cart-list');
    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="text-gray-400 text-center py-8">Your cart is empty 🛒</div>
            <div class="flex justify-center mt-4">
                <button id="go-purchase" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-full shadow transition">Start Shopping</button>
            </div>
        `;
        const btn = document.getElementById('go-purchase');
        btn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
        return;
    }
    let html = '<div class="font-bold text-2xl mb-4 text-indigo-700">Your Cart</div>';
    html += '<ul class="divide-y divide-gray-100 mb-2">';
    cart.forEach((item, idx) => {
        html += `<li class="flex items-center py-4">
            <img src="${item.product["Image"]}" alt="${item.product["Item Name"]}" class="w-14 h-14 rounded-lg mr-4 border border-indigo-100">
            <div class="flex-1">
                <div class="font-semibold text-gray-800">${item.product["Item Name"]}</div>
                <div class="text-gray-500">Quantity: <span class="font-bold">${item.qty}</span></div>
                <div class="text-indigo-600 font-bold">₹${(parseFloat(item.product["Price of the product (Price in lumi cart  after applying coin)"]) * item.qty).toFixed(2)}</div>
            </div>
            <button class="remove-btn bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2 ml-4" data-idx="${idx}">Remove</button>
        </li>`;
    });
    html += '</ul>';
    const total = cart.reduce((sum, item) => sum + parseFloat(item.product["Price of the product (Price in lumi cart  after applying coin)"]) * item.qty, 0);
    html += `<div class="flex justify-between font-semibold text-indigo-700 mt-4 text-lg"><span>Total:</span><span>₹${total.toFixed(2)}</span></div>`;
    html += `<div class="flex justify-end mt-6"><button id="confirm-order-btn" class="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2 rounded-full shadow transition text-lg">Confirm Order</button></div>`;
    cartList.innerHTML = html;
    document.getElementById('confirm-order-btn').addEventListener('click', function() {
        const phone = '919746577467';
        let msg = 'Order%20Details%3A%0A';
        cart.forEach(item => {
            msg += `•%20${encodeURIComponent(item.product["Item Name"])}%20-%20₹${parseFloat(item.product["Price of the product (Price in lumi cart  after applying coin)"]).toFixed(2)}%0A`;
        });
        const total = cart.reduce((sum, item) => sum + parseFloat(item.product["Price of the product (Price in lumi cart  after applying coin)"]) * item.qty, 0);
        msg += `%0ATotal%3A%20₹${total.toFixed(2)}`;
        window.open(`https://wa.me/${phone}?text=${msg}`,'_blank');
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    document.getElementById('cart-list').addEventListener('click', function(e) {
        const btn = e.target.closest('.remove-btn');
        if (btn) {
            const idx = parseInt(btn.getAttribute('data-idx'));
            let cart = getCart();
            cart.splice(idx, 1);
            setCart(cart);
            renderCart();
        }
    });
});
