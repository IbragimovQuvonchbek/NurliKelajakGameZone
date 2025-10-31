// Theme Switcher - Handles dark mode toggle and theme persistence

(function() {
    'use strict';

    const THEME_KEY = 'nurli_theme_mode';
    const CONTRAST_KEY = 'nurli_high_contrast';

    // Initialize theme on page load
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'auto';
        const savedContrast = localStorage.getItem(CONTRAST_KEY) === 'true';

        applyTheme(savedTheme);
        if (savedContrast) {
            enableHighContrast();
        }

        // Update theme toggle button if it exists
        updateThemeButtons(savedTheme, savedContrast);
    }

    // Apply theme to the document
    function applyTheme(theme) {
        const html = document.documentElement;
        const body = document.body;

        // Remove existing theme classes
        body.classList.remove('theme-dark', 'theme-light');

        if (theme === 'auto') {
            // Use system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('theme-dark');
            } else {
                body.classList.add('theme-light');
            }
        } else if (theme === 'dark') {
            body.classList.add('theme-dark');
        } else if (theme === 'light') {
            body.classList.add('theme-light');
        }

        localStorage.setItem(THEME_KEY, theme);
    }

    // Enable high contrast mode
    function enableHighContrast() {
        document.body.classList.add('high-contrast');
        localStorage.setItem(CONTRAST_KEY, 'true');
    }

    // Disable high contrast mode
    function disableHighContrast() {
        document.body.classList.remove('high-contrast');
        localStorage.setItem(CONTRAST_KEY, 'false');
    }

    // Toggle high contrast
    function toggleHighContrast() {
        if (document.body.classList.contains('high-contrast')) {
            disableHighContrast();
        } else {
            enableHighContrast();
        }
    }

    // Update theme buttons in UI
    function updateThemeButtons(theme, contrast) {
        // Update theme radio buttons if they exist
        const themeRadios = document.querySelectorAll('input[name="theme_mode"]');
        if (themeRadios.length) {
            themeRadios.forEach(radio => {
                radio.checked = radio.value === theme;
            });
        }

        // Update contrast checkbox if it exists
        const contrastCheckbox = document.getElementById('high_contrast_checkbox');
        if (contrastCheckbox) {
            contrastCheckbox.checked = contrast;
        }
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem(THEME_KEY) === 'auto') {
                applyTheme('auto');
            }
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Theme toggle buttons
        const themeRadios = document.querySelectorAll('input[name="theme_mode"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                applyTheme(e.target.value);
                syncSettingsToServer('theme_mode', e.target.value);
            });
        });

        // High contrast toggle
        const contrastCheckbox = document.getElementById('high_contrast_checkbox');
        if (contrastCheckbox) {
            contrastCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    enableHighContrast();
                } else {
                    disableHighContrast();
                }
                syncSettingsToServer('high_contrast_enabled', e.target.checked);
            });
        }

        // Theme toggle button in navbar (if exists)
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentTheme = localStorage.getItem(THEME_KEY) || 'auto';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme);
                syncSettingsToServer('theme_mode', newTheme);
                updateThemeIcon(newTheme);
            });
            updateThemeIcon(localStorage.getItem(THEME_KEY) || 'auto');
        }
    }

    // Update theme icon in navbar
    function updateThemeIcon(theme) {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (!themeToggleBtn) return;

        const icon = themeToggleBtn.querySelector('i');
        if (!icon) return;

        // Remove existing icon classes
        icon.className = 'fas';

        if (theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            icon.classList.add('fa-sun');
        } else {
            icon.classList.add('fa-moon');
        }
    }

    // Sync settings to server
    function syncSettingsToServer(key, value) {
        if (!window.fetch) {
            return; // Fallback for older browsers
        }

        const formData = new FormData();
        formData.append(key, value);
        formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

        fetch('/accounts/api/users/settings/', {
            method: 'POST',
            body: formData
        }).catch((error) => {
            console.warn('Failed to sync settings to server:', error);
        });
    }

    // Get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
        document.addEventListener('DOMContentLoaded', setupEventListeners);
    } else {
        initTheme();
        setupEventListeners();
    }

    // Expose functions globally for external use
    window.ThemeSwitcher = {
        apply: applyTheme,
        toggleContrast: toggleHighContrast,
        enableContrast: enableHighContrast,
        disableContrast: disableHighContrast
    };
})();
