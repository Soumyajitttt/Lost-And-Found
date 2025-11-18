import { apiFetch, showError, renderNav, requireAuth } from "./utils.js";

requireAuth();
renderNav();

async function loadProfile() {
  try {
    const user = await apiFetch("/api/auth/me");
    document.getElementById("name").textContent = user.name;
    document.getElementById("email").textContent = user.email;
    document.getElementById("role").textContent = user.role;
  } catch (error) {
    showError(error.message);
  }
}

loadProfile();
