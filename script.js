/**
 * ============================================
 * NAVBAR INJECTION - MINIMAL IMPLEMENTATION
 * ============================================
 */

// Load navbar.html and inject into page
async function loadNavbarComponent() {
    try {
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/');

        // --- INLINED NAVBAR HTML ---
        const navbarHTML = `
        <nav class="navbar" id="main-navbar">
            <div class="nav-left">
                <a href="index.html" class="logo-link">
                    <img src="assets/light_logo.png" id="logo" class="logo" alt="Ruler Tours Logo">
                    <h2>Ruler Tours</h2>
                </a>
            </div>

            <ul class="nav-links" id="nav-links">
                <li><a href="index.html" data-page="index.html">Home</a></li>
                <li><a href="tours.html" data-page="tours.html">Tours</a></li>
                <li><a href="rentals.html" data-page="rentals.html">Rentals</a></li>
                <li><a href="html/about.html" data-page="about.html">About</a></li>
                <li><a href="html/contact.html" data-page="contact.html">Contact</a></li>
            </ul>

            <div class="nav-right">
                <button id="theme-toggle">🌙</button>

                <!-- Auth Buttons -->
                <a href="login.html" id="auth-btn" class="btn-login">Login</a>
                <a href="signup.html" id="signup-btn" class="btn-primary" style="padding: 8px 20px; font-size: 0.9rem;">Sign Up</a>

                <!-- Profile (Hidden by default) -->
                <div class="profile-container" id="profile-trigger">
                    <img src="" class="profile-avatar" alt="User">
                    <div class="profile-dropdown" id="profile-dropdown">
                        <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
                        <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>

                <div class="hamburger" id="hamburger">☰</div>
            </div>
        </nav>
        `;

        // Insert navbar at top of body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);

        // --- DYNAMIC LINK FIXING ---
        const prefix = isInHtmlFolder ? '../' : '';
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Fix all <a> links in navbar
            const links = navbar.querySelectorAll('a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#')) {
                    const isTargetInHtmlFolder = href.startsWith('html/');
                    const cleanHref = isTargetInHtmlFolder ? href.replace('html/', '') : href;

                    if (isInHtmlFolder) {
                        // We are in /html/ folder
                        if (isTargetInHtmlFolder) {
                            link.setAttribute('href', cleanHref);
                        } else {
                            link.setAttribute('href', '../' + cleanHref);
                        }
                    } else {
                        // We are in root folder
                        if (isTargetInHtmlFolder) {
                            link.setAttribute('href', 'html/' + cleanHref);
                        } else {
                            link.setAttribute('href', cleanHref);
                        }
                    }
                }
            });

            // Fix Logo Path
            const logo = navbar.querySelector('#logo');
            if (logo) {
                logo.src = prefix + 'assets/light_logo.png';
            }
        }

        console.log('✅ Navbar injected locally and links adjusted');
        return true;
    } catch (error) {
        console.error('❌ Navbar injection failed:', error.message);
        return false;
    }
}

// Update logo based on theme
function updateLogoForTheme() {
    const logoImg = document.getElementById('logo');
    if (!logoImg) return;

    const isLight = window.location.pathname.includes('/html/');
    const darkThemeActive = document.body.classList.contains('dark');

    if (isLight) {
        // Pages in /html folder
        logoImg.src = darkThemeActive ? '../assets/dark_logo.png' : '../assets/light_logo.png';
    } else {
        // Root level pages
        logoImg.src = darkThemeActive ? 'assets/dark_logo.png' : 'assets/light_logo.png';
    }
}

// Highlight current page link in navbar
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const dataPage = link.getAttribute('data-page');
        if (dataPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// ========================================
// MAIN: Initialize on page load
document.addEventListener("DOMContentLoaded", async function () {

    // Load navbar
    const navbarLoaded = await loadNavbarComponent();

    if (!navbarLoaded) {
        console.warn('⚠️ Could not load navbar, continuing with auth setup...');
    }

    // Setup navbar interactions
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links a');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Hamburger menu toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            body.classList.toggle('no-scroll');
        });

        navLinkItems.forEach(link => {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                body.classList.remove('no-scroll');
            });
        });

        document.addEventListener('click', function (event) {
            if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
                navLinks.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('active');
                body.classList.remove('no-scroll');
            }
        });
    }

    // Theme toggle
    if (themeToggle) {
        // Apply saved theme on page load
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark');
            themeToggle.textContent = '☀️';
        }
        updateLogoForTheme();

        themeToggle.addEventListener('click', function () {
            body.classList.toggle('dark');
            if (body.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.textContent = '☀️';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.textContent = '🌙';
            }
            updateLogoForTheme();
        });
    }

    // Highlight active page
    highlightActivePage();

    // ========== EXISTING AUTH & FORM CODE CONTINUES BELOW ===========

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
                authBtn.style.display = "none";
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

    // --- PROFILE DROPDOWN logic ---
    function setupProfileDropdown() {
        const profileTrigger = document.getElementById('profile-trigger');
        const profileDropdown = document.getElementById('profile-dropdown');
        const logoutBtn = document.getElementById('logout-btn');

        if (profileTrigger && profileDropdown) {
            // Toggle dropdown on click
            profileTrigger.addEventListener('click', function (e) {
                e.stopPropagation();
                profileDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking elsewhere
            document.addEventListener('click', function (e) {
                if (!profileTrigger.contains(e.target)) {
                    profileDropdown.classList.remove('active');
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                showToast("Logged out successfully");

                // Redirect to home and refresh
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            });
        }
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

    // Initialize UI on page load
    updateNavForUser();
    setupProfileDropdown();
    // --- PROFILE MANAGEMENT (profile.html) ---
    if (window.location.pathname.includes('profile.html')) {
        const displaySection = document.getElementById('profile-display');
        const editForm = document.getElementById('profile-edit-form');
        const editBtn = document.getElementById('edit-profile-btn');
        const cancelBtn = document.getElementById('cancel-edit');
        const displayActions = document.getElementById('display-actions');

        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`${API_URL}/get-profile`, {
                    method: 'GET',
                    headers: { 'token': token }
                });
                const data = await response.json();

                if (data.success) {
                    const user = data.user;
                    // Update Display
                    document.getElementById('display-name').textContent = user.name || 'Not set';
                    document.getElementById('display-email').textContent = user.email || 'Not set';
                    document.getElementById('display-phone').textContent = user.phone || 'Not set';
                    document.getElementById('display-address').textContent = user.address || 'Not set';
                    document.getElementById('display-bio').textContent = user.bio || 'No bio added';

                    const interestsCont = document.getElementById('display-interests');
                    interestsCont.innerHTML = '';
                    if (user.interests && user.interests.length > 0) {
                        user.interests.forEach(interest => {
                            const span = document.createElement('span');
                            span.className = 'interest-tag';
                            span.textContent = interest;
                            interestsCont.appendChild(span);
                        });
                    } else {
                        interestsCont.innerHTML = '<span style="color: #888;">No interests added</span>';
                    }

                    // Pre-fill Edit Form
                    document.getElementById('edit-name').value = user.name || '';
                    document.getElementById('edit-phone').value = user.phone || '';
                    document.getElementById('edit-address').value = user.address || '';
                    document.getElementById('edit-bio').value = user.bio || '';
                    document.getElementById('edit-interests').value = user.interests ? user.interests.join(', ') : '';

                    // Update Avatar
                    const avatarImg = document.querySelector('.profile-img-large');
                    if (avatarImg) {
                        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff&size=150`;
                    }
                    const profileLeftName = document.querySelector('.profile-left h2');
                    if (profileLeftName) profileLeftName.textContent = user.name;
                    const profileLeftBio = document.querySelector('.profile-left p');
                    if (profileLeftBio) profileLeftBio.textContent = user.bio || 'Adventure Enthusiast';

                } else {
                    showToast(data.message, 'error');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        // Initial fetch
        fetchProfile();

        // Toggle Edit Mode
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                displaySection.style.display = 'none';
                displayActions.style.display = 'none';
                editForm.style.display = 'block';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                editForm.style.display = 'none';
                displaySection.style.display = 'grid';
                displayActions.style.display = 'block';
            });
        }

        // Handle Form Submission
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');

                const updatedData = {
                    name: document.getElementById('edit-name').value,
                    phone: document.getElementById('edit-phone').value,
                    address: document.getElementById('edit-address').value,
                    bio: document.getElementById('edit-bio').value,
                    interests: document.getElementById('edit-interests').value
                };

                try {
                    const response = await fetch(`${API_URL}/update-profile`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'token': token
                        },
                        body: JSON.stringify(updatedData)
                    });
                    const data = await response.json();

                    if (data.success) {
                        showToast('Profile updated successfully!');
                        // Update localStorage name if changed
                        const localUser = JSON.parse(localStorage.getItem('user'));
                        localUser.name = updatedData.name;
                        localStorage.setItem('user', JSON.stringify(localUser));

                        // Switch back to display mode
                        editForm.style.display = 'none';
                        displaySection.style.display = 'grid';
                        displayActions.style.display = 'block';

                        // Re-fetch to update display
                        fetchProfile();
                        updateNavForUser(); // Update navbar avatar name
                    } else {
                        showToast(data.message, 'error');
                    }
                } catch (error) {
                    showToast('Failed to update profile', 'error');
                }
            });
        }
    }

});

/* ==============================
   PASSWORD SHOW / HIDE TOGGLE
============================== */

const passwordToggles = document.querySelectorAll(".toggle-password");

passwordToggles.forEach(icon => {
    icon.addEventListener("click", function () {

        const input = document.getElementById(this.dataset.target);

        if (!input) return;

        if (input.type === "password") {
            input.type = "text";
            this.classList.remove("fa-eye");
            this.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            this.classList.remove("fa-eye-slash");
            this.classList.add("fa-eye");
        }
    });
});

/* ===============================
   SCROLL REVEAL ANIMATION
================================ */

const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < windowHeight - 100) {
            el.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();