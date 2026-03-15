// State Management
let chatOpen = false;
let fontSizeLevel = 0;
const baseFontSize = 16;
const SESSION_STORAGE_KEY = 'govtrade.sessionMeta';
const PREF_STORAGE_KEY = 'govtrade.preferences';
let lastFocusedElement = null;

const modalFocusState = {
    activeModal: null,
    cleanup: null,
};

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

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadSavedPreferences();
    hydrateInputFormatters();
    syncA11yState();

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        const applyModalOpen = !document.getElementById('apply-modal')?.classList.contains('hidden');
        const loginModalOpen = !document.getElementById('login-modal')?.classList.contains('hidden');

        if (applyModalOpen) {
            closeApplyModal();
            return;
        }

        if (loginModalOpen) {
            closeLoginModal();
            return;
        }

        if (chatOpen) {
            toggleChat();
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

function syncA11yState() {
    const menu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-button');
    const applyModal = document.getElementById('apply-modal');
    const loginModal = document.getElementById('login-modal');
    const toast = document.getElementById('notification-toast');

    setExpanded(menuToggle, menu && !menu.classList.contains('hidden'));
    setHidden(menu, menu ? menu.classList.contains('hidden') : true);
    setExpanded(chatButton, chatWindow && !chatWindow.classList.contains('hidden'));
    setHidden(chatWindow, chatWindow ? chatWindow.classList.contains('hidden') : true);
    setHidden(applyModal, applyModal ? applyModal.classList.contains('hidden') : true);
    setHidden(loginModal, loginModal ? loginModal.classList.contains('hidden') : true);
    setHidden(toast, toast ? toast.classList.contains('translate-x-full') : true);
}

function setExpanded(el, expanded) {
    if (el) {
        el.setAttribute('aria-expanded', String(Boolean(expanded)));
    }
}

function setHidden(el, hidden) {
    if (el) {
        el.setAttribute('aria-hidden', String(Boolean(hidden)));
    }
}

function announceLive(message) {
    const liveRegion = document.getElementById('live-region');
    if (!liveRegion) {
        return;
    }

    liveRegion.textContent = '';
    window.setTimeout(() => {
        liveRegion.textContent = message;
    }, 40);
}

function getFocusableElements(container) {
    if (!container) {
        return [];
    }

    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
        const isHidden = element.offsetParent === null && getComputedStyle(element).position !== 'fixed';
        return !isHidden;
    });
}

function trapFocus(modal) {
    if (!modal) {
        return;
    }

    releaseFocusTrap();
    modalFocusState.activeModal = modal;

    const focusable = getFocusableElements(modal);
    const firstElement = focusable[0] || modal;
    const lastElement = focusable[focusable.length - 1] || modal;

    const onKeyDown = (event) => {
        if (event.key !== 'Tab') {
            return;
        }

        const currentFocusable = getFocusableElements(modal);
        const first = currentFocusable[0] || firstElement;
        const last = currentFocusable[currentFocusable.length - 1] || lastElement;

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    modal.addEventListener('keydown', onKeyDown);
    modalFocusState.cleanup = () => modal.removeEventListener('keydown', onKeyDown);

    window.setTimeout(() => {
        firstElement.focus();
    }, 0);
}

function releaseFocusTrap() {
    if (modalFocusState.cleanup) {
        modalFocusState.cleanup();
    }
    modalFocusState.activeModal = null;
    modalFocusState.cleanup = null;
}

function restoreFocus() {
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
    lastFocusedElement = null;
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    const toggle = document.getElementById('mobile-menu-toggle');
    if (!menu || !icon) {
        return;
    }

    const expanded = menu.classList.toggle('hidden') === false;
    icon.setAttribute('data-lucide', expanded ? 'x' : 'menu');
    setExpanded(toggle, expanded);
    setHidden(menu, !expanded);

    if (window.lucide?.createIcons) {
        window.lucide.createIcons();
    }
}

function openApplyModal() {
    const modal = document.getElementById('apply-modal');
    if (!modal) {
        return;
    }

    lastFocusedElement = document.activeElement;
    modal.classList.remove('hidden');
    setHidden(modal, false);
    trapFocus(modal);
}

function closeApplyModal() {
    const modal = document.getElementById('apply-modal');
    if (!modal || modal.classList.contains('hidden')) {
        return;
    }

    modal.classList.add('hidden');
    setHidden(modal, true);
    releaseFocusTrap();
    restoreFocus();
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal) {
        return;
    }

    lastFocusedElement = document.activeElement;
    modal.classList.remove('hidden');
    setHidden(modal, false);
    trapFocus(modal);
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (!modal || modal.classList.contains('hidden')) {
        return;
    }

    modal.classList.add('hidden');
    setHidden(modal, true);
    releaseFocusTrap();
    restoreFocus();
}

function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-button');
    const chatLabel = document.getElementById('chat-button-label');

    if (!chatWindow) {
        return;
    }

    chatOpen = !chatOpen;
    chatWindow.classList.toggle('hidden', !chatOpen);
    setHidden(chatWindow, !chatOpen);
    setExpanded(chatButton, chatOpen);

    if (chatLabel) {
        chatLabel.textContent = chatOpen ? 'Close Chat' : 'Live Support';
    }

    if (chatOpen) {
        document.getElementById('chat-input')?.focus();
        announceLive('Live chat opened.');
    } else {
        chatButton?.focus();
        announceLive('Live chat closed.');
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

    window.setTimeout(() => {
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
        window.setTimeout(() => {
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

    toast.classList.remove('border-green-500', 'border-red-500', 'border-blue-500', 'translate-x-full');
    toast.classList.add(borderClass);

    toastTitle.textContent = title;
    toastMessage.textContent = message;
    setHidden(toast, false);
    announceLive(`${title}. ${message}`);

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(hideToast, 4000);
}

function hideToast() {
    const toast = document.getElementById('notification-toast');
    if (!toast) {
        return;
    }

    toast.classList.add('translate-x-full');
    setHidden(toast, true);
}

function normalizePhone(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
        return null;
    }

    if (digits.length === 10) {
        return `+1${digits}`;
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
    const expanded = menu.classList.toggle('hidden') === false;

    icon.setAttribute('data-lucide', expanded ? 'x' : 'menu');
    setExpanded(document.getElementById('mobile-menu-toggle'), expanded);
    setHidden(menu, !expanded);

    if (window.lucide) lucide.createIcons();
}

// Accessibility Controls
function toggleContrast() {
    document.body.classList.toggle('high-contrast');
    const enabled = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', enabled ? '1' : '0');
    announceLive(`High contrast mode ${enabled ? 'enabled' : 'disabled'}.`);
}

function adjustFontSize(direction) {
    fontSizeLevel = Math.max(-2, Math.min(3, fontSizeLevel + direction));
    const newSize = baseFontSize + fontSizeLevel;
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('fontSizeLevel', String(fontSizeLevel));
    announceLive(`Font size set to ${newSize} pixels.`);
}

function loadSavedPreferences() {
    const highContrastEnabled = localStorage.getItem('highContrast') === '1';
    if (highContrastEnabled) document.body.classList.add('high-contrast');

    fontSizeLevel = Number(localStorage.getItem('fontSizeLevel') || 0);
    if (!Number.isNaN(fontSizeLevel)) {
        document.documentElement.style.fontSize = `${baseFontSize + fontSizeLevel}px`;
    }
}

// Modal Controls with Focus Trap
function openApplyModal() {
    const modal = document.getElementById('apply-modal');
    lastFocusedElement = document.activeElement;
    modal.classList.remove('hidden');
    setHidden(modal, false);
    trapFocus(modal);
}

function closeApplyModal() {
    const modal = document.getElementById('apply-modal');
    if (modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    setHidden(modal, true);
    releaseFocusTrap();
    restoreFocus();
}

function openLoginModal() {
    const modal = document.getElementById('login-modal');
    lastFocusedElement = document.activeElement;
    modal.classList.remove('hidden');
    setHidden(modal, false);
    trapFocus(modal);
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal.classList.contains('hidden')) return;
    modal.classList.add('hidden');
    setHidden(modal, true);
    releaseFocusTrap();
    restoreFocus();
}

// Form Handlers
function handleApplicationSubmit(event) {
    event.preventDefault();
    closeApplyModal();
    showToast('Application Submitted', 'Your application has been submitted for review.');
    event.target.reset();
}

function handleContactSubmit(event) {
    event.preventDefault();
    showToast('Message Sent', 'Thank you for contacting us. We will respond shortly.');
    event.target.reset();
}

// Toast
function showToast(title, message) {
    const toast = document.getElementById('notification-toast');
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-message').textContent = message;

    toast.classList.remove('hidden', 'translate-x-full');
    setHidden(toast, false);
    announceLive(`${title}. ${message}`);

    clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(hideToast, 3500);
}

function hideToast() {
    const toast = document.getElementById('notification-toast');
    toast.classList.add('translate-x-full');
    setHidden(toast, true);
    window.setTimeout(() => toast.classList.add('hidden'), 300);
}

// Chat
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-button');
    chatOpen = chatWindow.classList.toggle('hidden') === false;

    setExpanded(chatButton, chatOpen);
    setHidden(chatWindow, !chatOpen);

    if (chatOpen) {
        document.getElementById('chat-input').focus();
        announceLive('Live chat opened.');
    } else {
        chatButton.focus();
        announceLive('Live chat closed.');
    }
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    const messages = document.getElementById('chat-messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'flex justify-end chat-message';
    userMessage.innerHTML = `
        <div class="bg-blue-700 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
            <p class="text-sm">${escapeHtml(message)}</p>
        </div>
    `;
    messages.appendChild(userMessage);
    messages.scrollTop = messages.scrollHeight;

    input.value = '';
    announceLive(`You sent: ${message}`);

    window.setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'flex gap-3 chat-message';
        botMessage.innerHTML = `
            <div class="bg-blue-100 p-2 rounded-lg">
                <i data-lucide="bot" class="w-5 h-5 text-blue-700"></i>
            </div>
            <div class="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-slate-200 max-w-[80%]">
                <p class="text-sm text-slate-700">Thanks for your question. A support specialist will respond shortly.</p>
            </div>
        `;
        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;
        if (window.lucide) lucide.createIcons();
        announceLive('Support replied in live chat.');
    }, 700);
}

function escapeHtml(unsafe) {
    return unsafe
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
// Centralized App State
const STORAGE_KEYS = {
  FONT_SIZE_LEVEL: 'govtrade.fontSizeLevel',
  HIGH_CONTRAST: 'govtrade.highContrast',
};

const appState = {
  currentUser: null,
  chatOpen: false,
  fontSizeLevel: 0,
  baseFontSize: 16,
  minFontSizeLevel: -2,
  maxFontSizeLevel: 4,
  highContrast: false,
  toastTimerId: null,
};

function safeGetElementById(id) {
  return document.getElementById(id);
}

function persistPreferences() {
  localStorage.setItem(STORAGE_KEYS.FONT_SIZE_LEVEL, String(appState.fontSizeLevel));
  localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, String(appState.highContrast));
}

function applyFontSize() {
  const htmlElement = document.documentElement;
  if (!htmlElement) {
    return;
  }

  const nextSize = appState.baseFontSize + appState.fontSizeLevel;
  htmlElement.style.fontSize = `${nextSize}px`;
}

function applyContrastMode() {
  const body = safeGetElementById('main-body') || document.body;
  if (!body) {
    return;
  }

  body.classList.toggle('high-contrast', appState.highContrast);
}

function showToast(title, message, isError = false) {
  const toast = safeGetElementById('notification-toast');
  const toastTitle = safeGetElementById('toast-title');
  const toastMessage = safeGetElementById('toast-message');

  if (!toast || !toastTitle || !toastMessage) {
    return;
  }

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.remove('translate-x-full');
  toast.classList.add('translate-x-0');
  toast.classList.toggle('border-red-500', isError);
  toast.classList.toggle('border-green-500', !isError);

  if (appState.toastTimerId) {
    window.clearTimeout(appState.toastTimerId);
  }

  appState.toastTimerId = window.setTimeout(() => {
    hideToast();
  }, 3500);
}

function hideToast() {
  const toast = safeGetElementById('notification-toast');
  if (!toast) {
    return;
  }

  toast.classList.remove('translate-x-0');
  toast.classList.add('translate-x-full');
}

function lockBodyScroll(shouldLock) {
  if (!document.body) {
    return;
  }

  document.body.style.overflow = shouldLock ? 'hidden' : '';
}

function renderAuthState() {
  const authButtons = safeGetElementById('auth-buttons');
  const userProfile = safeGetElementById('user-profile');
  const userName = safeGetElementById('user-name');

  if (userName) {
    userName.textContent = appState.currentUser?.name || '';
  }

  if (authButtons) {
    authButtons.classList.toggle('hidden', Boolean(appState.currentUser));
    authButtons.classList.toggle('flex', !appState.currentUser);
  }

  if (userProfile) {
    userProfile.classList.toggle('hidden', !appState.currentUser);
    userProfile.classList.toggle('flex', Boolean(appState.currentUser));
  }
}

function setCurrentUser(user) {
  appState.currentUser = {
    name: user?.name || 'Applicant',
    email: user?.email || '',
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(appState.currentUser));
  renderAuthState();
}

function clearCurrentUser() {
  appState.currentUser = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  renderAuthState();
}

function setModalVisibility(modalId, isOpen) {
  const modal = safeGetElementById(modalId);
  if (!modal) {
    return;
  }

  modal.classList.toggle('hidden', !isOpen);
  modal.setAttribute('aria-hidden', String(!isOpen));
}

function addChatMessage(content, sender = 'user') {
  const chatMessages = safeGetElementById('chat-messages');
  if (!chatMessages) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

  const bubble = document.createElement('div');
  bubble.className = sender === 'user'
    ? 'bg-blue-700 text-white rounded-xl rounded-br-sm px-3 py-2 max-w-[80%] text-sm'
    : 'bg-white text-slate-700 rounded-xl rounded-bl-sm border border-slate-200 px-3 py-2 max-w-[80%] text-sm';
  bubble.textContent = content;

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getChatReply(message) {
  const value = message.toLowerCase();
  if (value.includes('apply') || value.includes('application')) {
    return 'You can submit an application by clicking "Apply for Grant". Make sure your plan section is detailed and at least 100 words.';
  }
  if (value.includes('eligib')) {
    return 'Eligibility depends on your residency and business intent. Please review the Program Details and FAQ sections for requirements.';
  }
  if (value.includes('login') || value.includes('account')) {
    return 'Use the Sign In button at the top right to access your account and track application status.';
  }
  return 'Thanks for contacting GovTrade support. We received your message and our team can follow up via the contact form if needed.';
}

function toggleMobileMenu() {
  const menu = safeGetElementById('mobile-menu');
  const icon = safeGetElementById('menu-icon');

  if (!menu) {
    return;
  }

  const isHidden = menu.classList.contains('hidden');
  menu.classList.toggle('hidden', !isHidden);

  if (icon) {
    icon.setAttribute('data-lucide', isHidden ? 'x' : 'menu');
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }
}

function toggleContrast() {
  appState.highContrast = !appState.highContrast;
  applyContrastMode();
  persistPreferences();
  showToast('Display Updated', appState.highContrast ? 'High contrast mode enabled.' : 'High contrast mode disabled.');
}

function adjustFontSize(delta) {
  const parsedDelta = Number(delta) || 0;
  const nextLevel = appState.fontSizeLevel + parsedDelta;
  appState.fontSizeLevel = Math.max(appState.minFontSizeLevel, Math.min(appState.maxFontSizeLevel, nextLevel));

  applyFontSize();
  persistPreferences();
  showToast('Display Updated', `Font size changed to ${appState.baseFontSize + appState.fontSizeLevel}px.`);
}

function checkAuthStatus() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);

  if (storedSession) {
    try {
      appState.currentUser = JSON.parse(storedSession);
    } catch (_error) {
      clearCurrentUser();
      return;
    }
  } else {
    appState.currentUser = null;
  }

  renderAuthState();
}

function loadSavedPreferences() {
  const savedLevel = Number(localStorage.getItem(STORAGE_KEYS.FONT_SIZE_LEVEL));
  if (!Number.isNaN(savedLevel)) {
    appState.fontSizeLevel = Math.max(appState.minFontSizeLevel, Math.min(appState.maxFontSizeLevel, savedLevel));
  }

  appState.highContrast = localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';

  applyFontSize();
  applyContrastMode();
}

function openApplyModal() {
  setModalVisibility('apply-modal', true);
  lockBodyScroll(true);
}

function closeApplyModal() {
  setModalVisibility('apply-modal', false);
  const loginModal = safeGetElementById('login-modal');
  if (!loginModal || loginModal.classList.contains('hidden')) {
    lockBodyScroll(false);
  }
}

function openLoginModal() {
  setModalVisibility('login-modal', true);
  lockBodyScroll(true);
}

function closeLoginModal() {
  setModalVisibility('login-modal', false);
  const applyModal = safeGetElementById('apply-modal');
  if (!applyModal || applyModal.classList.contains('hidden')) {
    lockBodyScroll(false);
  }
}

function handleApplicationSubmit(event) {
  event?.preventDefault?.();

  const form = safeGetElementById('grant-application-form');
  if (!form) {
    return;
  }

  const planValue = safeGetElementById('app-plan')?.value?.trim() || '';
  if (planValue.split(/\s+/).filter(Boolean).length < 20) {
    showToast('Application Incomplete', 'Please provide a more detailed trading/marketing plan before submitting.', true);
    return;
  }

  form.reset();
  closeApplyModal();
  showToast('Application Submitted', 'Your grant application has been received for review.');
}

function handleLogin(event) {
  event?.preventDefault?.();

  const email = safeGetElementById('login-email')?.value?.trim() || '';
  const password = safeGetElementById('login-password')?.value || '';

  if (!email || !password) {
    showToast('Sign In Failed', 'Please enter both email and password.', true);
    return;
  }

  const defaultName = email.split('@')[0] || 'Applicant';
  setCurrentUser({ name: defaultName, email });

  closeLoginModal();
  showToast('Welcome Back', `Signed in as ${appState.currentUser.name}.`);
}

function logout() {
  clearCurrentUser();
  showToast('Signed Out', 'You have been logged out successfully.');
}

function toggleChat() {
  const chatWindow = safeGetElementById('chat-window');
  const chatButton = safeGetElementById('chat-button');

  if (!chatWindow) {
    return;
  }

  appState.chatOpen = !appState.chatOpen;
  chatWindow.classList.toggle('hidden', !appState.chatOpen);

  if (chatButton) {
    chatButton.setAttribute('aria-label', appState.chatOpen ? 'Close live chat' : 'Open live chat');
  }
}

function sendChatMessage(event) {
  event?.preventDefault?.();

  const input = safeGetElementById('chat-input');
  if (!input) {
    return;
  }

  const message = input.value.trim();
  if (!message) {
    return;
  }

  addChatMessage(message, 'user');
  input.value = '';

  window.setTimeout(() => {
    addChatMessage(getChatReply(message), 'assistant');
  }, 300);
}

function handleContactSubmit(event) {
  event?.preventDefault?.();

  const form = safeGetElementById('contact-form');
  if (!form) {
    return;
  }

  form.reset();
  showToast('Message Sent', 'Thank you for contacting us. Our team will reply shortly.');
}

function switchToRegister() {
  showToast('Registration', 'Account registration will be available soon. Please contact support for immediate assistance.');
}

function initializeApp() {
  checkAuthStatus();
  loadSavedPreferences();

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    closeApplyModal();
    closeLoginModal();

    if (appState.chatOpen) {
      toggleChat();
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeApp);
