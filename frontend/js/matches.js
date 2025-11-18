// frontend/js/matches.js
import { apiFetch, showError, renderNav } from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
  renderNav();

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  const lostItemDiv = document.getElementById("lost-item");
  const matchesListDiv = document.getElementById("matches-list");

  if (!itemId) {
    showError("No item ID provided in the URL.");
    return;
  }

  async function loadMatches() {
    try {
      lostItemDiv.innerHTML = "<p>Loading match details...</p>";

      const data = await apiFetch(`/api/items/${itemId}/matches`);

      // Render the main lost item's details
      renderLostItem(data.lostItem);

      // Render the list of potential matches
      renderMatches(data.matches);

    } catch (err) {
      showError(`Failed to load matches: ${err.message}`);
      lostItemDiv.innerHTML = "";
      matchesListDiv.innerHTML = "<p class='error-msg'>Could not load match data.</p>";
    }
  }

  function renderLostItem(item) {
    if (!item) return;
    lostItemDiv.innerHTML = `
      <p><strong>Title:</strong> ${item.title}</p>
      <p><strong>Category:</strong> ${item.category}</p>
      <p><strong>Description:</strong> ${item.description}</p>
      <p><strong>Location:</strong> ${item.location}</p>
    `;
  }

  function renderMatches(matches) {
    matchesListDiv.innerHTML = "";

    if (!matches || matches.length === 0) {
      matchesListDiv.innerHTML = "<p>No potential matches found for this item.</p>";
      return;
    }

    matches.forEach(match => {
      const foundItem = match.item;
      const score = (match.score * 100).toFixed(1);
      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="match-header">
          <h3>${foundItem.title}</h3>
        </div>
        <p><strong>Match Score:</strong> ${score}%</p>
        <p><strong>Category:</strong> ${foundItem.category}</p>
        <p><strong>Description:</strong> ${foundItem.description}</p>
        <p><strong>Location:</strong> ${foundItem.location}</p>
        <p><strong>Submitted by:</strong> ${foundItem.owner?.name || 'Unknown'} [${foundItem.owner?.email || 'N/A'}]</p>
      `;
      matchesListDiv.appendChild(card);
    });
  }

  // Initial load
  loadMatches();
});