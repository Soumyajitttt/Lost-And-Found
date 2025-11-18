// frontend/js/items.js
import { apiFetch, showError, showSuccess, requireAuth, renderNav, API_BASE } from "./utils.js";

renderNav();
requireAuth();

const createItemForm = document.getElementById("create-item-form");
if (createItemForm) {
  createItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(createItemForm);
    try {
      await apiFetch("/api/items", { method: "POST", body: formData });
      showSuccess("Item created successfully!");
      createItemForm.reset();
      window.location.href = "my-items.html";
      if (document.getElementById("items-list")) {
        loadMyItems();
      }
    } catch (error) {
      showError(error.message);
    }
  });
}

async function loadMyItems() {
  try {
    const items = await apiFetch("/api/items/me");
    const listDiv = document.getElementById("items-list");
    if (!listDiv) return;
    listDiv.innerHTML = "";
    const activeItems = items.filter(item => item.status === 'active');

    if (activeItems.length === 0) {
      listDiv.innerHTML = `<div class="empty-state"><p>You have no active items.</p><a href="create-item.html" class="btn btn-primary"><i class="ri-add-line"></i> Create an Item</a></div>`;
      return;
    }

    activeItems.forEach(item => {
      const el = document.createElement("div");
      el.className = "item-card";
      el.setAttribute('data-item-id', item._id);

      const hasPhoto = Array.isArray(item.photos) && item.photos.length > 0;
      let imageUrl = '';
      if (hasPhoto) {
          const normalizedPath = item.photos[0].replace(/\\/g, '/');
          imageUrl = `${API_BASE}/${normalizedPath}`;
      }

      // Inside the activeItems.forEach loop in items.js, find and REPLACE the el.innerHTML block

      el.innerHTML = `
        <div class="item-card-top-content">
            <h3>${item.title} (${item.type})</h3>
            <p><strong>Category:</strong> ${item.category || "N/A"}</p>
            
            ${item.type === 'found' ? `<p><strong>Verification:</strong> <span class="status-${item.verificationStatus}">${item.verificationStatus}</span></p>` : ''}
            
            ${hasPhoto ? `<img src="${imageUrl}" class="item-preview-image" alt="Preview">` : ''}
        </div>
        <hr>
        <div class="item-card-bottom-content">
            <p><strong>Description:</strong> ${item.description || "N/A"}</p>
            <p><strong>Location:</strong> ${item.location || "N/A"}</p>
            <p><strong>Contact:</strong> ${item.contact || "N/A"}</p>
            <div class="item-actions">
                <button class="btn-resolve" title="Mark as Resolved">
                    <i class="ri-check-line"></i> Resolve
                </button>
                <button class="btn-delete" title="Delete Item Permanently">
                    <i class="ri-delete-bin-line"></i> Delete
                </button>
            </div>
        </div>
      `;
      listDiv.appendChild(el);
    });
  } catch (err) {
    showError(err.message);
  }
}

const itemsListDiv = document.getElementById("items-list");
if (itemsListDiv) {
  itemsListDiv.addEventListener('click', async (e) => {
    const card = e.target.closest('.item-card');
    if (!card) return;
    const itemId = card.dataset.itemId;
    const resolveButton = e.target.closest('.btn-resolve');
    const deleteButton = e.target.closest('.btn-delete');

    if (resolveButton) {
      if (confirm('Are you sure you want to mark this item as resolved?')) {
        try {
          await apiFetch(`/api/items/${itemId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) });
          showSuccess('Item marked as resolved!');
          card.style.display = 'none';
        } catch (err) { showError(`Error: ${err.message}`); }
      }
    }

    if (deleteButton) {
      if (confirm('Are you sure you want to permanently delete this item?')) {
        try {
          await apiFetch(`/api/items/${itemId}`, { method: 'DELETE' });
          showSuccess('Item deleted successfully!');
          card.style.display = 'none';
        } catch (err) { showError(`Error: ${err.message}`); }
      }
    }
  });
}

if (document.getElementById("items-list")) {
  loadMyItems();
}