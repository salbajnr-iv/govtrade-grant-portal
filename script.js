// State Management
let currentUser = null;
let chatOpen = false;
let fontSizeLevel = 0;
const baseFontSize = 16;
const SESSION_STORAGE_KEY = 'govtrade.sessionMeta';
const PREF_STORAGE_KEY = 'govtrade.preferences';

const API_CONTRACT = {
    applications: {
        method: 'POST',
        path: '/api/applications',
        description: 'Submit a grant application payload with tokenized SSN and normalized phone.',
    },
    contact: {
        method: 'POST',
        path: '/api/contact',
        description: 'Send a contact inquiry from the public contact form.',
    },
    authLogin: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate a user with email/password and receive a server session.',
    },
    authLogout: {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Optional endpoint to terminate a user session.',
    },
};

const API_BASE_URL = (() => {
    const configured = window.GOVTRADE_API_BASE_URL || document.body?.dataset?.apiBaseUrl || '';
    return configured.replace(/\/$/, '');
})();

const MOCK_MODE = (() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('mockApi') === '1') {
        return true;
    }
    if (window.GOVTRADE_USE_MOCK_API === true) {
        return true;
    }
    return !API_BASE_URL;
})();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadSavedPreferences();
    hydrateInputFormatters();

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeApplyModal();
            closeLoginModal();
            if (chatOpen) {
                toggleChat();
            }
        }
    });
});

function hydrateInputFormatters() {
    const phoneInput = document.getElementById('app-phone');
    const ssnInput = document.getElementById('app-ssn');

    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            const normalized = normalizePhone(phoneInput.value);
            if (normalized) {
                phoneInput.value = formatPhone(normalized);
            }
        });
    }

    if (ssnInput) {
        ssnInput.addEventListener('input', () => {
            const digits = ssnInput.value.replace(/\D/g, '').slice(0, 9);
            if (!digits) {
                ssnInput.value = '';
                return;
            }
            const parts = [];
            if (digits.length <= 3) {
                parts.push(digits);
            } else if (digits.length <= 5) {
                parts.push(digits.slice(0, 3), digits.slice(3));
            } else {
                parts.push(digits.slice(0, 3), digits.slice(3, 5), digits.slice(5));
            }
            ssnInput.value = parts.join('-');
        });
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    if (!menu || !icon) {
        return;
    }

    menu.classList.toggle('hidden');
    icon.setAttribute('data-lucide', menu.classList.contains('hidden') ? 'menu' : 'x');
    if (window.lucide?.createIcons) {
        window.lucide.createIcons();
    }
}

function openApplyModal() {
    document.getElementById('apply-modal')?.classList.remove('hidden');
}

function closeApplyModal() {
    document.getElementById('apply-modal')?.classList.add('hidden');
}

function openLoginModal() {
    document.getElementById('login-modal')?.classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal')?.classList.add('hidden');
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatLabel = document.getElementById('chat-button-label');
    if (!chatWindow) {
        return;
    }

    chatOpen = !chatOpen;
    chatWindow.classList.toggle('hidden', !chatOpen);
    if (chatLabel) {
        chatLabel.textContent = chatOpen ? 'Close Chat' : 'Live Support';
    }
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input || !messages) {
        return;
    }

    const text = input.value.trim();
    if (!text) {
        return;
    }

    const userBubble = document.createElement('div');
    userBubble.className = 'chat-message bg-blue-700 text-white rounded-lg p-3 ml-10';
    userBubble.innerHTML = `<p class="text-sm">${escapeHtml(text)}</p>`;
    messages.appendChild(userBubble);

    const botBubble = document.createElement('div');
    botBubble.className = 'chat-message bg-white border border-slate-200 rounded-lg p-3 mr-10';
    botBubble.innerHTML = '<p class="text-sm text-slate-700">Thanks for your message. A grants specialist will follow up shortly.</p>';

    setTimeout(() => {
        messages.appendChild(botBubble);
        messages.scrollTop = messages.scrollHeight;
    }, 350);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;
}

function toggleContrast() {
    document.body.classList.toggle('high-contrast');
    persistPreferences();
}

function adjustFontSize(delta) {
    fontSizeLevel = Math.max(-2, Math.min(3, fontSizeLevel + delta));
    document.documentElement.style.fontSize = `${baseFontSize + fontSizeLevel}px`;
    persistPreferences();
}

function loadSavedPreferences() {
    try {
        const raw = localStorage.getItem(PREF_STORAGE_KEY);
        if (!raw) {
            return;
        }
        const prefs = JSON.parse(raw);
        if (prefs.highContrast) {
            document.body.classList.add('high-contrast');
        }
        if (typeof prefs.fontSizeLevel === 'number') {
            fontSizeLevel = Math.max(-2, Math.min(3, prefs.fontSizeLevel));
            document.documentElement.style.fontSize = `${baseFontSize + fontSizeLevel}px`;
        }
    } catch {
        // Ignore malformed preference data.
    }
}

function persistPreferences() {
    const payload = {
        highContrast: document.body.classList.contains('high-contrast'),
        fontSizeLevel,
    };
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(payload));
}

async function handleApplicationSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const firstName = document.getElementById('app-firstname')?.value.trim() || '';
    const lastName = document.getElementById('app-lastname')?.value.trim() || '';
    const email = document.getElementById('app-email')?.value.trim() || '';
    const phoneRaw = document.getElementById('app-phone')?.value.trim() || '';
    const ssnRaw = document.getElementById('app-ssn')?.value.trim() || '';
    const amount = document.getElementById('app-amount')?.value || '';
    const plan = document.getElementById('app-plan')?.value.trim() || '';
    const termsAccepted = Boolean(document.getElementById('app-terms')?.checked);

    if (!isValidEmail(email)) {
        showToast('Validation error', 'Please enter a valid email address.', 'error');
        return;
    }

    const normalizedPhone = normalizePhone(phoneRaw);
    if (!normalizedPhone) {
        showToast('Validation error', 'Please enter a valid phone number with 10-15 digits.', 'error');
        return;
    }

    const ssnToken = tokenizeSsn(ssnRaw);
    if (!ssnToken) {
        showToast('Validation error', 'Please enter a valid SSN using 9 digits.', 'error');
        return;
    }

    if (!termsAccepted || !firstName || !lastName || !amount || !plan) {
        showToast('Validation error', 'Please complete all required fields before submitting.', 'error');
        return;
    }

    const payload = {
        firstName,
        lastName,
        email,
        phone: normalizedPhone,
        ssnToken,
        requestedAmountBracket: amount,
        plan,
        acceptedTerms: true,
    };

    const submitButton = form.querySelector('button[type="submit"]');
    await withLoadingState(submitButton, async () => {
        const response = await postJson(API_CONTRACT.applications.path, payload);
        if (!response.ok) {
            throw new Error(response.error || 'Unable to submit your application right now.');
        }

        form.reset();
        showToast('Application submitted', 'Your grant application has been received successfully.', 'success');
        closeApplyModal();
    }, 'Submitting...');
}

async function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const subject = document.getElementById('contact-subject')?.value || 'general';
    const message = document.getElementById('contact-message')?.value.trim() || '';

    if (!name || !message) {
        showToast('Validation error', 'Please provide your name and message.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Validation error', 'Please provide a valid email for follow-up.', 'error');
        return;
    }

    const payload = { name, email, subject, message };
    const submitButton = form.querySelector('button[type="submit"]');

    await withLoadingState(submitButton, async () => {
        const response = await postJson(API_CONTRACT.contact.path, payload);
        if (!response.ok) {
            throw new Error(response.error || 'Unable to send your message right now.');
        }
        form.reset();
        showToast('Message sent', 'Thanks for contacting us. We will reply shortly.', 'success');
    }, 'Sending...');
}

async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = document.getElementById('login-email')?.value.trim() || '';
    const password = document.getElementById('login-password')?.value || '';

    if (!isValidEmail(email)) {
        showToast('Validation error', 'Please enter a valid login email address.', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Validation error', 'Password must contain at least 8 characters.', 'error');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    await withLoadingState(submitButton, async () => {
        const response = await postJson(API_CONTRACT.authLogin.path, { email, password });
        if (!response.ok || !response.data?.user) {
            throw new Error(response.error || 'Sign-in failed. Please verify your credentials.');
        }

        setCurrentUser(response.data.user);
        closeLoginModal();
        form.reset();
        showToast('Signed in', 'You are now signed in to your GovTrade account.', 'success');
    }, 'Signing in...');
}

async function logout() {
    try {
        await postJson(API_CONTRACT.authLogout.path, {});
    } catch {
        // Logout endpoint is optional. Continue local logout regardless.
    }
    clearCurrentUser();
    showToast('Signed out', 'Your session has been closed.', 'success');
}

function switchToRegister() {
    showToast('Registration', 'Account registration is not yet available in this preview.', 'info');
}

function checkAuthStatus() {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) {
            renderAuthState();
            return;
        }

        const sessionMeta = JSON.parse(raw);
        if (sessionMeta?.name) {
            currentUser = {
                name: sessionMeta.name,
                email: sessionMeta.email || '',
            };
        }
    } catch {
        currentUser = null;
    }
    renderAuthState();
}

function setCurrentUser(user) {
    currentUser = {
        name: user.name || 'GovTrade User',
        email: user.email || '',
    };

    // Persist only non-sensitive display metadata.
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        name: currentUser.name,
        email: currentUser.email,
    }));

    renderAuthState();
}

function clearCurrentUser() {
    currentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    renderAuthState();
}

function renderAuthState() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');

    if (!authButtons || !userProfile || !userName) {
        return;
    }

    if (currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.classList.add('flex');
        userName.textContent = currentUser.name;
    } else {
        authButtons.classList.remove('hidden');
        authButtons.classList.add('flex');
        userProfile.classList.add('hidden');
        userProfile.classList.remove('flex');
        userName.textContent = '';
    }
}

async function postJson(path, payload) {
    if (MOCK_MODE) {
        return mockPost(path, payload);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    const body = await safeJson(response);
    return {
        ok: response.ok,
        data: body,
        error: body?.error || body?.message,
    };
}

function mockPost(path, payload) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (path === API_CONTRACT.authLogin.path) {
                resolve({
                    ok: true,
                    data: {
                        user: {
                            name: payload.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                            email: payload.email,
                        },
                    },
                });
                return;
            }

            resolve({ ok: true, data: { received: true } });
        }, 500);
    });
}

async function withLoadingState(button, callback, loadingLabel) {
    if (!button) {
        await callback();
        return;
    }

    const originalText = button.textContent;
    const wasDisabled = button.disabled;
    button.disabled = true;
    button.textContent = loadingLabel;

    try {
        await callback();
    } catch (error) {
        showToast('Request failed', error.message || 'Unexpected network error.', 'error');
    } finally {
        button.disabled = wasDisabled;
        button.textContent = originalText;
    }
}

function showToast(title, message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastTitle || !toastMessage) {
        return;
    }

    const borderClass = {
        success: 'border-green-500',
        error: 'border-red-500',
        info: 'border-blue-500',
    }[type] || 'border-green-500';

    toast.classList.remove('border-green-500', 'border-red-500', 'border-blue-500');
    toast.classList.add(borderClass);

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toast.classList.remove('translate-x-full');

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(hideToast, 4000);
}

function hideToast() {
    document.getElementById('notification-toast')?.classList.add('translate-x-full');
}

function normalizePhone(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
        return null;
    }

    if (digits.length === 10) {
        return `+1${digits}`;
    }

    if (!value.trim().startsWith('+')) {
        return `+${digits}`;
    }

    return `+${digits}`;
}

function formatPhone(normalized) {
    const digits = normalized.replace(/\D/g, '');
    const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    if (local.length === 10) {
        return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
    }
    return normalized;
}

function tokenizeSsn(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 9) {
        return null;
    }
    // Demo-only tokenization placeholder for static preview.
    const reversed = digits.split('').reverse().join('');
    return `tok_ssn_${btoa(reversed).replace(/=/g, '')}`;
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}
