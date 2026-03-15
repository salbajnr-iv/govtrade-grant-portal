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
