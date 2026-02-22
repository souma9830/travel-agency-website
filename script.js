const { createClient } = supabase;
const supabaseClient = createClient(
    "https://okvnakjduwhlyzskynhp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdm5ha2pkdXdobHl6c2t5bmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDIyMDcsImV4cCI6MjA4NjAxODIwN30.3ashHYpyAMUeelrhGGgbk07ZZyd5aahCpdFUYIFy8uY"
);

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

    // Google Auth Logic
    const googleBtn = document.getElementById("googleBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.href // Redirect back to current page
                }
            });
            if (error) showToast(error.message, "error");
        });
    }

    // Handle Supabase Auth state change
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            // Only trigger if we don't have a backend token or it's a social login
            if (!localStorage.getItem("token")) {
                try {
                    const response = await fetch(`${API_URL}/google-auth`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token: session.access_token })
                    });
                    const data = await response.json();
                    if (data.success) {
                        showToast(data.message);
                        localStorage.setItem("token", data.token);
                        localStorage.setItem("user", JSON.stringify(data.userData));
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 1500);
                    } else {
                        showToast(data.message, "error");
                    }
                } catch (err) {
                    showToast("Backend connection failed", "error");
                }
            }
        }
    });

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
                    localStorage.setItem("user", JSON.stringify(data.userData));
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
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem("user"));
        const loginBtn = document.querySelector(".btn-login");
        const profileCont = document.getElementById("profile-trigger");

        if (user) {
            if (loginBtn) loginBtn.style.display = "none";
            if (profileCont) {
                profileCont.style.display = "block";
                const avatarImg = profileCont.querySelector(".profile-avatar");
                if (avatarImg) {
                    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
                }
            }


            const profileName = document.querySelector(".profile-left h2");
            const profileFullName = document.querySelector(".profile-info-group p"); // First P in info group
            if (profileName && user.name) profileName.textContent = user.name;

        } else {
            if (loginBtn) loginBtn.style.display = "block";
            if (profileCont) profileCont.style.display = "none";
        }
    }

    checkAuth();

});