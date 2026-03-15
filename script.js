// State Management
let currentUser = null;
let chatOpen = false;
let fontSizeLevel = 0;
const baseFontSize = 16;
let lastFocusedElement = null;
const modalFocusState = {
    activeModal: null,
    cleanup: null
};
let toastTimeout;

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
    '[tabindex]:not([tabindex="-1"])'
].join(',');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadSavedPreferences();
    syncA11yState();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!document.getElementById('apply-modal').classList.contains('hidden')) {
                closeApplyModal();
                return;
            }
            if (!document.getElementById('login-modal').classList.contains('hidden')) {
                closeLoginModal();
                return;
            }
            if (chatOpen) {
                toggleChat();
            }
        }
    });
});

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
    setHidden(toast, toast ? toast.classList.contains('hidden') : true);
}

function setExpanded(el, expanded) {
    if (el) el.setAttribute('aria-expanded', String(Boolean(expanded)));
}

function setHidden(el, hidden) {
    if (el) el.setAttribute('aria-hidden', String(Boolean(hidden)));
}

function announceLive(message) {
    const liveRegion = document.getElementById('live-region');
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.setTimeout(() => {
        liveRegion.textContent = message;
    }, 40);
}

function getFocusableElements(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
        const isHidden = element.offsetParent === null && getComputedStyle(element).position !== 'fixed';
        return !isHidden;
    });
}

function trapFocus(modal) {
    if (!modal) return;

    releaseFocusTrap();
    modalFocusState.activeModal = modal;
    const focusable = getFocusableElements(modal);
    const firstElement = focusable[0] || modal;
    const lastElement = focusable[focusable.length - 1] || modal;

    const onKeyDown = (event) => {
        if (event.key !== 'Tab') return;

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

// Auth
function checkAuthStatus() {
    const saved = localStorage.getItem('govtradeUser');
    if (!saved) return;

    try {
        currentUser = JSON.parse(saved);
        updateAuthUI();
    } catch {
        localStorage.removeItem('govtradeUser');
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');

    if (currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userProfile.classList.add('flex');
        userName.textContent = `Welcome, ${currentUser.name}`;
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
        userProfile.classList.remove('flex');
        userName.textContent = '';
    }
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const user = {
        name: email.split('@')[0] || 'Citizen',
        email
    };
    currentUser = user;
    localStorage.setItem('govtradeUser', JSON.stringify(user));
    updateAuthUI();
    closeLoginModal();
    showToast('Signed In', 'You have successfully signed in to your account.');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('govtradeUser');
    updateAuthUI();
    showToast('Signed Out', 'You have been logged out.');
}

function switchToRegister() {
    showToast('Registration', 'Registration is coming soon. Please check back later.');
    return false;
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
  USER: 'govtrade.user',
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

function setAuthUI() {
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
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (storedUser) {
    try {
      appState.currentUser = JSON.parse(storedUser);
    } catch (_error) {
      appState.currentUser = null;
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  setAuthUI();
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
  appState.currentUser = { name: defaultName, email };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(appState.currentUser));

  setAuthUI();
  closeLoginModal();
  showToast('Welcome Back', `Signed in as ${appState.currentUser.name}.`);
}

function logout() {
  appState.currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.USER);
  setAuthUI();
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
