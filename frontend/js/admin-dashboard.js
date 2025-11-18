// js/admin-dashboard.js
import { apiFetch, renderNav, showError } from "./utils.js";

// This is the main function that loads all data for the dashboard
async function loadAdminData() {
  try {
    // Fetch all items to populate the top statistics
    const allItems = await apiFetch("/api/items/admin/all");
    populateStats(allItems);
    renderItemsPreview(allItems, document.getElementById("recent-items-list"));

    // Fetch the specific list of lost items that have matches
    const matchingItems = await apiFetch("/api/items/admin/lost-matches");

    // Update the "Items with Matches" stat card
    const matchesStatEl = document.getElementById("matches-stat");
    if (matchesStatEl) {
        // Use a defensive check to ensure matchingItems is an array
        matchesStatEl.textContent = Array.isArray(matchingItems) ? matchingItems.length : 0;
    }

    // Render the preview panel for these matching items
    renderMatchesPreview(matchingItems, document.getElementById("matching-items-list"));

  } catch (err) {
    showError("Failed to load dashboard data: " + err.message);
    console.error("Dashboard load error:", err); // Keep console log for detail
  }
}

// Helper to populate the top statistics cards
function populateStats(items) {
  const totalItems = items?.length || 0;
  const lostItems = items?.filter(i => i.type === 'lost').length || 0;
  const foundItems = totalItems - lostItems;

  const totalEl = document.getElementById("total-items-stat");
  const lostEl = document.getElementById("lost-items-stat");
  const foundEl = document.getElementById("found-items-stat");

  if (totalEl) totalEl.textContent = totalItems;
  if (lostEl) lostEl.textContent = lostItems;
  if (foundEl) foundEl.textContent = foundItems;
}

// Helper to render the "Recent Submissions" panel
function renderItemsPreview(data, container) {
  if (!container) return;
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p class='empty-message'>No items submitted yet.</p>";
    return;
  }

  const recentItems = data.slice(0, 3);
  container.innerHTML = recentItems.map(item => `
    <div class="dashboard-item-card">
        <div class="item-info">
            <h3 class="item-title">${item?.title || 'Untitled Item'}</h3>
            <p class="item-meta"><strong>Type:</strong> ${item?.type || 'N/A'} | <strong>Category:</strong> ${item?.category || 'N/A'}</p>
        </div>
        <span class="item-owner">${item?.owner?.name || 'Unknown'}</span>
    </div>
  `).join("");
}

// Helper to render the "Lost Items with Matches" panel (BULLETPROOF VERSION)
function renderMatchesPreview(data, container) {
    if (!container) return;
    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p class='empty-message'>No active lost items with matches found.</p>";
        return;
    }

    const recentMatches = data.slice(0, 3);
    container.innerHTML = recentMatches.map(entry => {
        // Use optional chaining (?.) everywhere to prevent crashes
        const title = entry?.item?.title || 'Untitled Item';
        const matchCount = entry?.matchCount || 0;
        const itemId = entry?.item?._id;
        let description = entry?.item?.description || 'No description available.';
        if (description.length > 60) {
            description = description.substring(0, 60) + '...';
        }
        // Only render the "View" button if we have an ID
        const viewButton = itemId ? `<a href="matches.html?id=${itemId}" class="btn btn-sm">View</a>` : '';

        return `
        <div class="dashboard-item-card">
            <div class="item-info">
                <h3 class="item-title">${title}</h3>
                <p class="item-meta">Description: <strong>${description}</strong></p>
                <p class="item-meta">Possible Matches: <strong>${matchCount}</strong></p>
            </div>
           
        </div>
        `;
    }).join("");
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    loadAdminData();
});


