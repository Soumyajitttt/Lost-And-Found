import { apiFetch, showError, showSuccess, requireAuth, renderNav, API_BASE } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    requireAuth();

    const itemsListDiv = document.getElementById("pending-items-list");

    async function loadPendingItems() {
        if (!itemsListDiv) return;
        try {
            itemsListDiv.innerHTML = '<p>Loading pending items...</p>';
            const items = await apiFetch("/api/items/admin/pending");
            renderPendingItems(items);
        } catch (err) {
            showError("Failed to load pending items: " + err.message);
            itemsListDiv.innerHTML = '<p class="error-msg">Could not load items.</p>';
        }
    }

    function renderPendingItems(items) {
        itemsListDiv.innerHTML = "";
        if (items.length === 0) {
            itemsListDiv.innerHTML = "<p>There are no pending items to verify.</p>";
            return;
        }

        items.forEach(item => {
            const el = document.createElement("div");
            el.className = "item-card";
            el.setAttribute('data-item-id', item._id);

            const hasPhoto = Array.isArray(item.photos) && item.photos.length > 0;
            let imageUrl = '';
            if (hasPhoto) {
                const normalizedPath = item.photos[0].replace(/\\/g, '/');
                imageUrl = `${API_BASE}/${normalizedPath}`;
            }

            el.innerHTML = `
                <div class="item-card-top-content">
                    <h3>${item.title}</h3>
                    <p><strong>Reported by:</strong> ${item.owner?.name || 'N/A'}</p>
                    <p><strong>Category:</strong> ${item.category}</p>
                    ${hasPhoto ? `<img src="${imageUrl}" class="item-preview-image" alt="Preview">` : ''}
                </div>
                <hr>
                <div class="item-card-bottom-content">
                    <p><strong>Description:</strong> ${item.description}</p>
                    <div class="item-actions">
                        <button class="btn-approve" title="Approve"><i class="ri-check-line"></i> Approve</button>
                        <button class="btn-reject" title="Reject"><i class="ri-delete-bin-line"></i> Reject</button>
                    </div>
                </div>
            `;
            itemsListDiv.appendChild(el);
        });
    }

    itemsListDiv.addEventListener('click', async (e) => {
        const card = e.target.closest('.item-card');
        if (!card) return;
        const itemId = card.dataset.itemId;
        
        const approveButton = e.target.closest('.btn-approve');
        const rejectButton = e.target.closest('.btn-reject');

        if (approveButton) {
            if (confirm('Are you sure you have received this item and want to approve it? This will trigger matching.')) {
                try {
                    await apiFetch(`/api/items/admin/approve/${itemId}`, { method: 'PUT' });
                    showSuccess('Item approved successfully!');
                    card.remove();
                    updatePendingCount(); // Update the nav bubble
                } catch (err) {
                    showError(`Approval failed: ${err.message}`);
                }
            }
        }

        if (rejectButton) {
            if (confirm('Are you sure you want to reject and delete this submission? This cannot be undone.')) {
                try {
                    await apiFetch(`/api/items/${itemId}`, { method: 'DELETE' });
                    showSuccess('Submission rejected and deleted.');
                    card.remove();
                    updatePendingCount(); // Update the nav bubble
                } catch (err) {
                    showError(`Rejection failed: ${err.message}`);
                }
            }
        }
    });

    async function updatePendingCount() {
        try {
            const items = await apiFetch("/api/items/admin/pending");
            const count = items.length;
            const navLink = document.querySelector('a[href="admin-verify.html"] .pending-count');
            if (navLink) {
                navLink.textContent = count;
                navLink.style.display = count > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error("Could not update pending count", error);
        }
    }

    loadPendingItems();
});