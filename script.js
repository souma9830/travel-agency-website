document.addEventListener("DOMContentLoaded", function () {

    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");
    const navLinkItems = document.querySelectorAll(".nav-links a");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Toggle hamburger menu + prevent background scroll
    hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        body.classList.toggle("no-scroll");
    });

    // Close menu when a link is clicked
    navLinkItems.forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            body.classList.remove("no-scroll");
        });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
        const isClickInsideMenu = navLinks.contains(event.target);
        const isClickHamburger = hamburger.contains(event.target);

        if (!isClickInsideMenu && !isClickHamburger) {
            navLinks.classList.remove("active");
            body.classList.remove("no-scroll");
        }
    });

    // Close menu on window resize
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            navLinks.classList.remove("active");
            body.classList.remove("no-scroll");
        }
    });

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark");
        themeToggle.textContent = "☀️";
    }

    // Toggle theme
    themeToggle.addEventListener("click", function () {
        body.classList.toggle("dark");

        if (body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "☀️";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙";
        }
    });

    // --- AUTH INTEGRATION ---

    const API_URL = "http://localhost:3000/api/auth";

    // Helper for Toast Notifications
    function showToast(message, type = "success") {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: type === "success" ? "#2E7D32" : "#D32F2F",
            close: true
        }).showToast();
    }

    // Google OAuth Callback Parsing
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL Params parsed:", window.location.search);

    const oauthToken = urlParams.get('token');
    const oauthUser = urlParams.get('user');

    console.log("Extracted token:", oauthToken ? "Yes (hidden)" : "No");
    console.log("Extracted user string:", oauthUser);

    if (oauthToken) {
        localStorage.setItem('token', oauthToken);
        if (oauthUser) {
            try {
                // Ensure it's valid JSON before saving
                const parsed = JSON.parse(oauthUser);
                console.log("Successfully parsed user object:", parsed);
                localStorage.setItem('user', oauthUser);
            } catch (e) {
                console.error("Failed to parse oauthUser from URL:", e);
                console.error("Raw oauthUser string was:", oauthUser);
            }
        } else {
            console.warn("oauthToken found, but oauthUser is null or missing in URL");
        }

        // Clear token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast("Successfully logged in with Google!");
        // Redirect to home if on auth pages
        if (window.location.pathname.includes("login.html") || window.location.pathname.includes("signup.html")) {
            setTimeout(() => { window.location.href = "index.html"; }, 1500);
        } else {
            updateNavForUser();
        }
    }

    const oauthError = urlParams.get('error');
    if (oauthError) {
        showToast(`Google login failed: ${oauthError}`, "error");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // UI State Management - Unified
    function updateNavForUser() {
        const authBtn = document.getElementById("auth-btn");
        const signupBtn = document.getElementById("signup-btn");
        const profileCont = document.getElementById("profile-trigger");

        const token = localStorage.getItem("token");
        let user = null;
        try {
            const userStr = localStorage.getItem("user");
            if (userStr && userStr !== "undefined") {
                user = JSON.parse(userStr);
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            localStorage.removeItem("user"); // clear corrupted data
        }

        if (token && user) {
            // Logged in state: Hide signup button, update authBtn to Logout, show profile
            if (signupBtn) signupBtn.style.display = "none";

            if (authBtn) {
                authBtn.style.display = "inline-block";
                authBtn.textContent = "Logout";
                authBtn.href = "#";
                authBtn.classList.remove("btn-login");
                authBtn.classList.add("btn-logout");
                authBtn.style.padding = "8px 18px";
                authBtn.style.backgroundColor = "#D32F2F";
                authBtn.style.color = "#fff";
                authBtn.style.border = "none";

                authBtn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    showToast("Logged out successfully");
                    setTimeout(() => { window.location.reload(); }, 1500);
                };
            }

            if (profileCont) {
                profileCont.style.display = "inline-block";
                const avatarImg = profileCont.querySelector(".profile-avatar");
                if (avatarImg) {
                    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
                }
            }

            const profileName = document.querySelector(".profile-left h2");
            if (profileName && user.name) profileName.textContent = user.name;

        } else {
            // Logged out state
            if (authBtn) {
                authBtn.style.display = "inline-block";
                authBtn.textContent = "Login";
                authBtn.href = "login.html";
                authBtn.classList.add("btn-login");
                authBtn.classList.remove("btn-logout");
                authBtn.style.backgroundColor = "";
                authBtn.style.color = "";
                authBtn.style.border = "";
                authBtn.onclick = null;
            }
            if (signupBtn) signupBtn.style.display = "inline-block";
            if (profileCont) profileCont.style.display = "none";
        }
    }

    // Initialize UI on page load
    updateNavForUser();

    // Sign Up Logic
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("signupName").value;
            const email = document.getElementById("signupEmail").value;
            const password = document.getElementById("signupPassword").value;
            const confirmPassword = document.getElementById("signupConfirmPassword").value;

            if (password !== confirmPassword) {
                showToast("Passwords do not match!", "error");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    showToast(data.message);
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    showToast(data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong!", "error");
            }
        });
    }

    // Login Logic
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    showToast(data.message);
                    localStorage.setItem("token", data.token);
                    if (data.userData) {
                        localStorage.setItem("user", JSON.stringify(data.userData));
                    }
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2000);
                } else {
                    showToast(data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong!", "error");
            }
        });
    }

    // Forgot Password Logic
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("forgotPassEmail").value;

            try {
                const response = await fetch(`${API_URL}/send-reset-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.success) {
                    showToast(data.message);
                    localStorage.setItem("resetEmail", email);
                    setTimeout(() => {
                        window.location.href = "reset-password.html";
                    }, 2000);
                } else {
                    showToast(data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong!", "error");
            }
        });
    }

    // Reset Password Logic
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const otp = document.getElementById("resetOtp").value;
            const newPassword = document.getElementById("resetNewPassword").value;
            const confirmPassword = document.getElementById("resetConfirmPassword").value;
            const email = localStorage.getItem("resetEmail");

            if (!email) {
                showToast("Email session expired. Start again.", "error");
                return;
            }

            if (newPassword !== confirmPassword) {
                showToast("Passwords do not match!", "error");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp, newPassword })
                });

                const data = await response.json();

                if (data.success) {
                    showToast(data.message);
                    localStorage.removeItem("resetEmail");
                    setTimeout(() => {
                        window.location.href = "reset-success.html";
                    }, 2000);
                } else {
                    showToast(data.message, "error");
                }
            } catch (error) {
                showToast("Something went wrong!", "error");
            }
        });
    }

    const profileTrigger = document.getElementById("profile-trigger");
    const profileDropdown = document.getElementById("profile-dropdown");

    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener("click", function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle("active");
        });

        document.addEventListener("click", function (e) {
            if (!profileTrigger.contains(e.target)) {
                profileDropdown.classList.remove("active");
            }
        });

        const logoutBtn = profileDropdown.querySelector("a[href='#']");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                showToast("Logged out successfully!");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            });
        }
    }
    // (Old checkAuth function removed. Handled by updateNavForUser)


});