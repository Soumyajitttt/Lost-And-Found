import { apiFetch, showError, showSuccess, requireAuth, renderNav, API_BASE } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    requireAuth();
    const itemsListDiv = document.getElementById("items-list");

    async function loadAllItems() 
    {
        if (!itemsListDiv) return; 
        try {
            const items = await apiFetch("/api/items/admin/all");
            itemsListDiv.innerHTML = "";
            if (!items || items.length === 0) {
                itemsListDiv.innerHTML = "<p>No items have been submitted yet.</p>";
                return; 
            }
            items.forEach(item => {
                const el = document.createElement("div");
                el.className = `item-card ${item.status === 'resolved' ? 'resolved' : ''}`;
                el.setAttribute('data-item-id', item._id);

                const hasPhoto = Array.isArray(item.photos) && item.photos.length > 0;
                let imageUrl = '';
                if (hasPhoto) {
                    const normalizedPath = item.photos[0].replace(/\\/g, '/');
                    imageUrl = `${API_BASE}/${normalizedPath}`;
                }

                el.innerHTML = `
                    <div class="item-card-top-content">
                        <h3>${item.title} (${item.type})</h3>
                        <p><strong>Submitted By:</strong> ${item.owner?.name || 'N/A'}</p>
                        
                        ${item.type === 'found' ? `<p><strong>Verification:</strong> <span class="status-${item.verificationStatus}">${item.verificationStatus}</span></p>` : ''}
                        
                        ${hasPhoto ? `<img src="${imageUrl}" class="item-preview-image" alt="Preview">` : ''}
                    </div>
                    <hr>
                    <div class="item-card-bottom-content">
                        <p><strong>Description:</strong> ${item.description || "N/A"}</p>
                        <p><strong>Location:</strong> ${item.location || "N/A"}</p>
                        <p><strong>Contact:</strong> ${item.contact || "N/A"}</p>
                        <div class="item-actions">
                            <button class="btn-resolve" title="Resolve"><i class="ri-check-line"></i>Resolve</button>
                            <button class="btn-delete" title="Delete"><i class="ri-delete-bin-line"></i>Delete</button>
                        </div>
                    </div>
                `;
                itemsListDiv.appendChild(el);
            });
        } catch (err) { showError("Failed to load items: " + err.message); }
    }

    if (itemsListDiv) {
        itemsListDiv.addEventListener('click', async (e) => {
            const card = e.target.closest('.item-card');
            if (!card) return;
            const itemId = card.dataset.itemId;
            const resolveButton = e.target.closest('.btn-resolve');
            const deleteButton = e.target.closest('.btn-delete');
            if (resolveButton) {
                if (confirm('Mark this item as resolved?')) {
                    try {
                        await apiFetch(`/api/items/${itemId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) });
                        showSuccess('Item resolved!');
                        card.classList.add('resolved');
                        const statusEl = card.querySelector('.status-active, .status-resolved');
                        if(statusEl) { statusEl.textContent = 'resolved'; statusEl.className = 'status-resolved'; }
                    } catch (err) { showError(`Error: ${err.message}`); }
                }
            }
            if (deleteButton) {
                if (confirm('Permanently delete this item?')) {
                    try {
                        await apiFetch(`/api/items/${itemId}`, { method: 'DELETE' });
                        showSuccess('Item deleted!');
                        card.remove();
                    } catch (err) { showError(`Error: ${err.message}`); }
                }
            }
        });
    }

    loadAllItems();
});