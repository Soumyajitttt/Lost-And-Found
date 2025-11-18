// js/lost-items.js
import { apiFetch, showError, renderNav, API_BASE } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const itemsContainer = document.getElementById('items-list');

  async function fetchAndRenderItems() {
    try {
      itemsContainer.innerHTML = '<p>Loading items...</p>';
      const searchTerm = searchInput.value.trim();
      const category = categorySelect.value;
      let endpoint = `/api/items/admin/all?type=lost`;
      if (searchTerm) endpoint += `&search=${encodeURIComponent(searchTerm)}`;
      if (category !== 'all') endpoint += `&category=${encodeURIComponent(category)}`;
      const items = await apiFetch(endpoint);
      renderItems(items);
    } catch (err) {
      showError(`Failed to load items: ${err.message}`);
      itemsContainer.innerHTML = `<p class="error-msg">Could not load items.</p>`;
    }
  }

  function renderItems(items) {
    itemsContainer.innerHTML = '';
    if (!items || items.length === 0) {
      itemsContainer.innerHTML = '<p>No lost items found matching your criteria.</p>';
      return;
    }
    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "item-card";

      const hasPhoto = Array.isArray(item.photos) && item.photos.length > 0;
      let imageUrl = '';
      if (hasPhoto) {
          const normalizedPath = item.photos[0].replace(/\\/g, '/');
          imageUrl = `${API_BASE}/${normalizedPath}`;
      }

      card.innerHTML = `
        <div class="item-card-top-content">
            <h3>${item.title}</h3>
            <p><strong>Category:</strong> ${item.category}</p>
            ${hasPhoto ? `<img src="${imageUrl}" class="item-preview-image" alt="Preview">` : ''}
        </div>
        <hr>
        <div class="item-card-bottom-content">
            <p><strong>Description:</strong> ${item.description}</p>
            <p><strong>Location:</strong> ${item.location || "N/A"}</p>
            <p><strong>Contact:</strong> ${item.contact || "N/A"}</p>
            <button class="btn" data-id="${item._id}">View Matches</button>
        </div>
      `;
      itemsContainer.appendChild(card);
    });
  }

  searchForm.addEventListener('submit', (e) => { e.preventDefault(); fetchAndRenderItems(); });
  categorySelect.addEventListener('change', fetchAndRenderItems);
  itemsContainer.addEventListener('click', (e) => {
    if (e.target?.matches('button[data-id]')) {
      window.location.href = `matches.html?id=${e.target.dataset.id}`;
    }
  });

  fetchAndRenderItems();
});