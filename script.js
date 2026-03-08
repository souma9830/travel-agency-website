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
                        if (href.startsWith('html/')) {
                            newHref = href.replace('html/', '');
                        } else {
                            newHref = '../' + href;
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

    // UI State Management - Unified
    function updateNavForUser() {
        const authBtn = document.getElementById("auth-btn");
        const signupBtn = document.getElementById("signup-btn");
        const profileCont = document.getElementById("profile-trigger");

        // Token is now handled via httpOnly cookies, check user data for auth state
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

        if (user) {
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

    // Sign Up Logic - form submission
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    // Login Logic - form submission
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    // Forgot Password Logic - form submission
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    // Reset Password Logic - form submission
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            location.reload();
        });
    }

    // Initialize UI on page load
    updateNavForUser();
    setupProfileDropdown();

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