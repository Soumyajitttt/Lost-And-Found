// js/utils.js
export const API_BASE = "https://lost-and-found-sn72.onrender.com";

export function getToken() {
  return localStorage.getItem("token");
}

export function showError(message) {
  const errorDiv = document.getElementById("error-msg");
  if (errorDiv) errorDiv.textContent = message;
}

export function showSuccess(message) {
  const successDiv = document.getElementById("success-msg");
  if (successDiv) successDiv.textContent = message;
}

// --- MODIFIED renderNav to include Verification Link and Bubble ---
export async function renderNav() {
  const navLinksDiv = document.getElementById("nav-links");
  if (!navLinksDiv) return;

  const token = getToken();
  let user = null;
  try {
      const storedUser = localStorage.getItem("user");
      if(storedUser) user = JSON.parse(storedUser);
  } catch(e) {
      console.error("Error parsing user from localStorage", e);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
  }

  if (token && user) {
    if (user.role === "admin") {
      // Fetch pending count for the notification bubble
      let pendingCount = 0;
      try {
        const pendingItems = await apiFetch("/api/items/admin/pending");
        pendingCount = pendingItems.length;
      } catch (error) {
        console.error("Could not fetch pending count for nav");
      }
      
      navLinksDiv.innerHTML = `
        <a href="admin-verify.html" class="nav-link-with-bubble">
            Verify Items
            <span class="pending-count" style="display: ${pendingCount > 0 ? 'flex' : 'none'}">${pendingCount}</span>
        </a> 
        <a href="#" id="logout-btn">Logout</a>
      `;
    } else {
      navLinksDiv.innerHTML = `
        <a href="profile.html">Profile</a> 
        <a href="create-item.html">Create Item</a> 
        <a href="my-items.html">My Items</a> 
        <a href="#" id="logout-btn">Logout</a>
      `;
    }

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  } else {
    navLinksDiv.innerHTML = `
      <a href="index.html">Home</a> 
      <a href="register.html">Register</a> 
      <a href="login.html">Login</a>
    `;
  }
}

// Call renderNav on initial load
document.addEventListener('DOMContentLoaded', renderNav);


export function requireAuth() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
  }

  const response = await fetch(API_BASE + endpoint, {
      ...options,
      headers
  });

  if (!response.ok) {
    let errorMsg = "Server error";
    try {
      const data = await response.json();
      if (data.message) errorMsg = data.message;
    } catch {}
    throw new Error(errorMsg);
  }
  
  if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
  }

  return response.json();
}
