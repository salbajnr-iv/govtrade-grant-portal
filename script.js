let currentUser = null;
let chatOpen = false;
let fontSizeLevel = 0;
const baseFontSize = 16;

const faqItems = [
    {
        question: 'Who is eligible for the GovTrade grant?',
        answer: 'Applicants must be at least 18 years old, provide valid identity information, and complete the onboarding questionnaire.'
    },
    {
        question: 'How quickly are applications reviewed?',
        answer: 'Most applications are reviewed in 7-14 business days depending on submission quality and verification checks.'
    },
    {
        question: 'Can I withdraw funds immediately?',
        answer: 'No. Participants must complete onboarding and generate verified trading performance before withdrawal requests are enabled.'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadSavedPreferences();
    renderFaqIfPresent();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeApplyModal();
            closeLoginModal();
        }
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.classList.toggle('hidden');
}

function toggleContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

function adjustFontSize(direction) {
    fontSizeLevel = Math.max(-2, Math.min(3, fontSizeLevel + direction));
    document.documentElement.style.fontSize = `${baseFontSize + fontSizeLevel}px`;
    localStorage.setItem('fontSizeLevel', fontSizeLevel);
}

function loadSavedPreferences() {
    const highContrast = localStorage.getItem('highContrast') === 'true';
    fontSizeLevel = Number(localStorage.getItem('fontSizeLevel') || 0);

    if (highContrast) {
        document.body.classList.add('high-contrast');
    }

    document.documentElement.style.fontSize = `${baseFontSize + fontSizeLevel}px`;
}

function openApplyModal() {
    const modal = document.getElementById('apply-modal');
    if (!modal) {
        window.location.href = 'apply.html';
        return;
    }
    modal.classList.remove('hidden');
}

function closeApplyModal() {
    const modal = document.getElementById('apply-modal');
    if (modal) modal.classList.add('hidden');
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) {
        window.location.href = 'account.html';
        return;
    }
    modal.classList.remove('hidden');
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.classList.add('hidden');
}

function handleApplicationSubmit(event) {
    event.preventDefault();
    showToast('Application Submitted', 'Your application was received and is now under review.');
    closeApplyModal();
    const form = event.target;
    if (form && form.reset) form.reset();
}

function handleContactSubmit(event) {
    event.preventDefault();
    showToast('Message Sent', 'Our support team will reply within 1-2 business days.');
    const form = event.target;
    if (form && form.reset) form.reset();
}

function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('login-email');
    const email = emailInput ? emailInput.value : 'applicant@example.gov';
    currentUser = { name: email.split('@')[0], email };
    localStorage.setItem('govtradeUser', JSON.stringify(currentUser));
    checkAuthStatus();
    showToast('Signed In', `Welcome back, ${currentUser.name}.`);
    closeLoginModal();
}

function checkAuthStatus() {
    const cached = localStorage.getItem('govtradeUser');
    currentUser = cached ? JSON.parse(cached) : null;

    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');

    if (!authButtons || !userProfile) return;

    if (currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.classList.add('flex');
        if (userName) userName.textContent = `Hello, ${currentUser.name}`;
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userProfile.classList.remove('flex');
    }
}

function logout() {
    localStorage.removeItem('govtradeUser');
    currentUser = null;
    checkAuthStatus();
    showToast('Signed Out', 'You have been signed out successfully.');
}

function renderFaqIfPresent() {
    const container = document.getElementById('faq-container');
    if (!container) return;

    container.innerHTML = faqItems.map((item, index) => `
        <details class="bg-white rounded-xl border border-slate-200 p-5" ${index === 0 ? 'open' : ''}>
            <summary class="font-semibold text-slate-900 cursor-pointer">${item.question}</summary>
            <p class="text-slate-600 mt-3">${item.answer}</p>
        </details>
    `).join('');
}

function showToast(title, message) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    const titleElement = document.getElementById('toast-title');
    const messageElement = document.getElementById('toast-message');
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;

    toast.classList.remove('translate-x-full');
    setTimeout(() => toast.classList.add('translate-x-full'), 3000);
}
