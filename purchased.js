// Lumi Cart - Purchased Items Page
if (localStorage.getItem('lumi_logged_in') !== '1') {
    window.location.href = 'login.html';
}


const purchasedGrid = document.getElementById('purchased-grid');

function renderPurchased(products) {
    purchasedGrid.innerHTML = '';
    if (!products || products.length === 0) {
        purchasedGrid.innerHTML = '<div class="text-gray-400 text-center py-8">No purchased items found.</div>';
        return;
    }
    products.forEach((product) => {
        const div = document.createElement('div');
        div.className = "relative bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center transition-transform transform hover:-translate-y-2 hover:shadow-2xl group overflow-hidden";
        const price = product["Price in lumi cart before applying coin"] || "N/A";
        div.innerHTML = `
            <div class='relative w-full flex justify-center'>
                <img src="${product["Image"] || 'https://placehold.co/160x160?text=No+Image'}" alt="${product["Item Name"]}" class="w-32 h-32 object-cover rounded-xl mb-4 border-4 border-indigo-100 group-hover:border-indigo-300 transition">
                <div class="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow">Purchased</div>
            </div>
            <h2 class="text-lg font-bold mb-1 text-gray-800 group-hover:text-indigo-600 transition">${product["Item Name"]}</h2>
            <p class="text-xl text-indigo-600 font-extrabold mb-1">₹${price}</p>

        `;
        purchasedGrid.appendChild(div);
    });
}

async function fetchUserProductStatus() {
    const lumiId = localStorage.getItem('lumi_id');
    if (!lumiId) return null;
    const apiUrl = `https://script.google.com/macros/s/AKfycbxL-8OP4-zkJ187IMhnrvBk7_vrF0hfkX3K8YkmMcqefN0hjt8L-wgJUktRjerO4LBD/exec?lumiID=${encodeURIComponent(lumiId)}`;
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        return data;
    } catch (err) {
        return null;
    }
}

async function fetchAndRenderPurchased() {
    const loading = document.getElementById('purchased-loading');
    const grid = document.getElementById('purchased-grid');
    if (loading) loading.classList.remove('hidden');
    if (grid) grid.classList.add('hidden');
    try {
        const userStatus = await fetchUserProductStatus();
        window.lumiUserProductStatus = userStatus;
        if (!userStatus || !userStatus.products) {
            if (loading) loading.classList.add('hidden');
            if (grid) grid.classList.remove('hidden');
            renderPurchased([]);
            return;
        }
        // Fetch all products from the main product API to get full details
        const res = await fetch('https://script.google.com/macros/s/AKfycbydpawmC87SxZnDd_laS5sfhU0q6POq8UtLHW5fKV7Duvj1nY9DyShz4nABJBuMpLj3/exec');
        const allProducts = await res.json();
        // Filter purchased
        const purchasedNames = userStatus.products.filter(p => p.status === 'purchased').map(p => (p.name || '').trim().toLowerCase());
        const purchasedProducts = allProducts.filter(prod => purchasedNames.includes((prod["Item Name"] || '').trim().toLowerCase()));
        if (loading) loading.classList.add('hidden');
        if (grid) grid.classList.remove('hidden');
        renderPurchased(purchasedProducts);
    } catch (e) {
        if (loading) loading.classList.add('hidden');
        if (grid) grid.classList.remove('hidden');
        renderPurchased([]);
    }
}

fetchAndRenderPurchased();

document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
        profileIcon.style.cursor = 'pointer';
        profileIcon.onclick = showProfileModal;
    }
});

// --- Profile Modal Functionality (copied from script.js for this page) ---
function showProfileModal() {
    // Remove existing modal if present
    const oldModal = document.getElementById('profile-modal');
    if (oldModal) oldModal.parentNode.removeChild(oldModal);
    const user = window.lumiUserProductStatus || {};
    const name = user.studentName || '-';
    const lumiId = user.lumiID || '-';
    const totalPoints = typeof user.totalPoints !== 'undefined' ? user.totalPoints : '-';
    const remainingCoins = typeof user.remainingCoins !== 'undefined' ? user.remainingCoins : '-';
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
        <svg class="w-14 h-14 mx-auto mb-2 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
        <div class="font-bold text-2xl text-indigo-700 mb-0.5">${name}</div>
        <div class="text-gray-500 text-base mb-2">Lumi ID: <span class="font-bold text-indigo-600">${lumiId}</span></div>
        <div class="flex justify-center gap-4 mb-3">
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
