import { apiFetch, showError, showSuccess, renderNav } from "./utils.js";

renderNav();

// const regex = /^[a-z]+(?:\.[a-z]+)\.[a-z]{2,10}\d{2}@heritageit\.edu(?:\.in)?$/i;

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      // Save token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      showSuccess("Login successful!");

      // Redirect based on role
      if (data.user?.role === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        window.location.href = "profile.html";
      }
    } catch (error) {
      showError(error.message);
    }
  });
}


const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const role = registerForm.role.value;

    
    // if (!regex.test(email)) {
    //   showError("Please enter a valid Heritage email (e.g. name.surname.branch25@heritageit.edu.in)");
    //   return;
    // }

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });

      showSuccess("Registration successful!");
      registerForm.reset();
      window.location.href = "login.html";
    } catch (error) {
      showError(error.message);
    }
  });
}