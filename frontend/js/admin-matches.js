// Fetch LOST items that have matches (Admin only)
fetch("http://localhost:4000/api/items/admin/lost-matches", {
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
  }
})
.then(res => res.json())
.then(data => {
  const lostItemsWithMatches = data.filter(entry => entry.item.type === "lost" && entry.matchCount > 0);
  const container = document.getElementById("lost-list");
  container.innerHTML = "";

  if (lostItemsWithMatches.length === 0) {
    container.innerHTML = "<p>No lost items with matches found.</p>";
    return;
  }

  lostItemsWithMatches.forEach(entry => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>${entry.item.title}</h3>
      <p><strong>Description:</strong> ${entry.item.description || "N/A"}</p>
      <p><strong>Location:</strong> ${entry.item.location || "N/A"}</p>
      <p><strong>Category:</strong> ${entry.item.category || "N/A"}</p>
      <p><strong>Contact:</strong> ${entry.item.contact || "N/A"}</p>
      <p><strong>Matches Found:</strong> ${entry.matchCount}</p>
    `;
    container.appendChild(card);
  });
})
.catch(err => {
  console.error("Error fetching lost items:", err);
  document.getElementById("error-msg").textContent = "Failed to load lost items with matches.";
});
