// State Management
let currentUser = null;
let chatOpen = false;
let fontSizeLevel = 0;
const baseFontSize = 16;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadSavedPreferences();
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeApplyModal();
            closeLoginModal();
            if (chatOpen) toggleChat();
        }
    });
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.get