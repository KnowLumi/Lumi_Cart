// Lumi Cart - Checkout Page
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
    const lumiId = localStorage.getItem('lumi_id');
    if (!lumiId) return [];
    return JSON.parse(localStorage.getItem('lumi_cart_' + lumiId) || '[]');
}

function renderCheckout() {
    const cart = getCart();
    const checkoutList = document.getElementById('checkout-list');
    if (cart.length === 0) {
        checkoutList.innerHTML = '<div class="text-gray-400 text-center py-8">Your cart is empty 🛒<br><a href="index.html" class="inline-block mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-full shadow transition">Start Shopping</a></div>';
        return;
    }
    let html = '<div class="font-bold text-2xl mb-4 text-indigo-700">Order Summary</div>';
    html += '<ul class="divide-y divide-gray-100 mb-2">';
    cart.forEach(item => {
        html += `<li class="flex items-center py-4">
            <img src="${item.product.image}" alt="${item.product.name}" class="w-14 h-14 rounded-lg mr-4 border border-indigo-100">
            <div class="flex-1">
                <div class="font-semibold text-gray-800">${item.product.name}</div>
                <div class="text-gray-500">Quantity: <span class="font-bold">${item.qty}</span></div>
                <div class="text-indigo-600 font-bold">$${(item.product.price * item.qty).toFixed(2)}</div>
            </div>
        </li>`;
    });
    html += '</ul>';
    const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    html += `<div class="flex justify-between font-semibold text-indigo-700 mt-4 text-lg"><span>Total:</span><span>$${total.toFixed(2)}</span></div>`;
    checkoutList.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
    renderCheckout();
});
