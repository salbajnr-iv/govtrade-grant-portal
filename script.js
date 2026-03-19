const STORAGE_KEYS = {
  session: 'govtrade.session',
  preferences: 'govtrade.preferences',
  handoff: 'govtrade.accountStatusHandoff',
};

const API_PATHS = {
  application: '/api/applications',
  contact: '/api/contact',
  login: '/api/auth/login',
};

const APP = {
  chatOpen: false,
  fontSizeLevel: 0,
  baseFontSize: 16,
  minFontSizeLevel: -2,
  maxFontSizeLevel: 3,
  user: null,
  toastTimerId: null,
  lastFocusedElement: null,
  focusCleanup: null,
  accountReason: null,
};

const SESSION_STATES = Object.freeze({
  active: 'active',
  expired: 'expired',
  revoked: 'revoked',
  restored: 'restored',
  unauthenticated: 'unauthenticated',
});

const HANDOFF_TTL_MS = 10 * 60 * 1000;

const API_BASE_URL = (() => {
  const configured = window.GOVTRADE_API_BASE_URL || document.body?.dataset?.apiBaseUrl || '';
  return configured.replace(/\/$/, '');
})();

const MOCK_MODE = (() => {
  const query = new URLSearchParams(window.location.search);
  return query.get('mockApi') === '1' || window.GOVTRADE_USE_MOCK_API === true || !API_BASE_URL;
})();

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function byId(id) {
  return document.getElementById(id);
}

function setHidden(el, hidden) {
  if (el) {
    el.setAttribute('aria-hidden', String(Boolean(hidden)));
  }
}

function setExpanded(el, expanded) {
  if (el) {
    el.setAttribute('aria-expanded', String(Boolean(expanded)));
  }
}

function announceLive(message) {
  const liveRegion = byId('live-region');
  if (!liveRegion) {
    return;
  }

  liveRegion.textContent = '';
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 40);
}

function escapeHtml(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    const hiddenByLayout =
      element.offsetParent === null && getComputedStyle(element).position !== 'fixed';
    return !hiddenByLayout;
  });
}

function trapFocus(modal) {
  if (!modal) {
    return;
  }

  releaseFocusTrap();

  const onKeyDown = (event) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(modal);
    const first = focusable[0] || modal;
    const last = focusable[focusable.length - 1] || modal;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  modal.addEventListener('keydown', onKeyDown);
  APP.focusCleanup = () => modal.removeEventListener('keydown', onKeyDown);

  const first = getFocusableElements(modal)[0] || modal;
  window.setTimeout(() => first.focus(), 0);
}

function releaseFocusTrap() {
  if (APP.focusCleanup) {
    APP.focusCleanup();
    APP.focusCleanup = null;
  }
}

function restoreFocus() {
  if (APP.lastFocusedElement && typeof APP.lastFocusedElement.focus === 'function') {
    APP.lastFocusedElement.focus();
  }
  APP.lastFocusedElement = null;
}

function persistPreferences() {
  const prefs = {
    highContrast: document.body.classList.contains('high-contrast'),
    fontSizeLevel: APP.fontSizeLevel,
  };
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
}

function loadSavedPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.preferences);
    if (!raw) {
      return;
    }

    const prefs = JSON.parse(raw);
    if (prefs.highContrast) {
      document.body.classList.add('high-contrast');
    }

    if (typeof prefs.fontSizeLevel === 'number') {
      APP.fontSizeLevel = Math.max(
        APP.minFontSizeLevel,
        Math.min(APP.maxFontSizeLevel, prefs.fontSizeLevel)
      );
      document.documentElement.style.fontSize = `${APP.baseFontSize + APP.fontSizeLevel}px`;
    }
  } catch {
    // Ignore malformed localStorage data.
  }
}

function renderAuthState() {
  const authButtons = byId('auth-buttons');
  const userProfile = byId('user-profile');
  const userName = byId('user-name');

  if (userName) {
    userName.textContent = APP.user?.name || '';
  }
  if (authButtons) {
    authButtons.classList.toggle('hidden', Boolean(APP.user));
    authButtons.classList.toggle('flex', !APP.user);
  }
  if (userProfile) {
    userProfile.classList.toggle('hidden', !APP.user);
    userProfile.classList.toggle('flex', Boolean(APP.user));
  }
}

function getSessionState(rawSession) {
  if (!rawSession) {
    return SESSION_STATES.unauthenticated;
  }

  const now = Date.now();
  const expiresAt = Number(rawSession.expiresAt || 0);
  if (rawSession.revokedAt) {
    return SESSION_STATES.revoked;
  }
  if (expiresAt && expiresAt < now) {
    return SESSION_STATES.expired;
  }
  if (rawSession.state === SESSION_STATES.restored) {
    return SESSION_STATES.restored;
  }
  return SESSION_STATES.active;
}

function isAuthenticatedState(state) {
  return state === SESSION_STATES.active || state === SESSION_STATES.restored;
}

function checkAuthStatus() {
  const raw = localStorage.getItem(STORAGE_KEYS.session);
  if (!raw) {
    APP.user = null;
    renderAuthState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const sessionState = getSessionState(parsed);
    APP.user = isAuthenticatedState(sessionState) ? parsed : null;
    APP.accountReason = sessionState;
    if (!isAuthenticatedState(sessionState)) {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
  } catch {
    APP.user = null;
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  renderAuthState();
}

function setCurrentUser(user) {
  APP.user = {
    name: user?.name || 'Applicant',
    email: user?.email || '',
    state: SESSION_STATES.active,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 30 * 60 * 1000,
  };
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(APP.user));
  APP.accountReason = SESSION_STATES.active;
  renderAuthState();
}

function clearCurrentUser(reason = SESSION_STATES.unauthenticated) {
  const raw = localStorage.getItem(STORAGE_KEYS.session);
  let parsed = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  if ((reason === SESSION_STATES.expired || reason === SESSION_STATES.revoked) && parsed) {
    localStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({
        ...parsed,
        state: reason,
        revokedAt: reason === SESSION_STATES.revoked ? new Date().toISOString() : undefined,
        expiresAt: Date.now() - 1000,
      })
    );
  } else {
    localStorage.removeItem(STORAGE_KEYS.session);
  }
  APP.user = null;
  APP.accountReason = reason;
  renderAuthState();
}

function syncA11yState() {
  const menu = byId('mobile-menu');
  const menuToggle = byId('mobile-menu-toggle');
  const chatWindow = byId('chat-window');
  const chatButton = byId('chat-button');
  const applyModal = byId('apply-modal');
  const loginModal = byId('login-modal');
  const toast = byId('notification-toast');

  setExpanded(menuToggle, menu ? !menu.classList.contains('hidden') : false);
  setHidden(menu, menu ? menu.classList.contains('hidden') : true);
  setExpanded(chatButton, chatWindow ? !chatWindow.classList.contains('hidden') : false);
  setHidden(chatWindow, chatWindow ? chatWindow.classList.contains('hidden') : true);
  setHidden(applyModal, applyModal ? applyModal.classList.contains('hidden') : true);
  setHidden(loginModal, loginModal ? loginModal.classList.contains('hidden') : true);
  setHidden(toast, toast ? toast.classList.contains('translate-x-full') : true);
}

function toggleMobileMenu() {
  const menu = byId('mobile-menu');
  const icon = byId('menu-icon');
  const toggle = byId('mobile-menu-toggle');

  if (!menu) {
    return;
  }

  const open = menu.classList.toggle('hidden') === false;
  setExpanded(toggle, open);
  setHidden(menu, !open);

  if (icon) {
    icon.setAttribute('data-lucide', open ? 'x' : 'menu');
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }
}

function openApplyModal() {
  const modal = byId('apply-modal');
  if (!modal) {
    return;
  }

  APP.lastFocusedElement = document.activeElement;
  modal.classList.remove('hidden');
  setHidden(modal, false);
  trapFocus(modal);
}

function closeApplyModal() {
  const modal = byId('apply-modal');
  if (!modal || modal.classList.contains('hidden')) {
    return;
  }

  modal.classList.add('hidden');
  setHidden(modal, true);
  releaseFocusTrap();
  restoreFocus();
}

function openLoginModal() {
  const modal = byId('login-modal');
  if (!modal) {
    return;
  }

  APP.lastFocusedElement = document.activeElement;
  modal.classList.remove('hidden');
  setHidden(modal, false);
  trapFocus(modal);
}

function closeLoginModal() {
  const modal = byId('login-modal');
  if (!modal || modal.classList.contains('hidden')) {
    return;
  }

  modal.classList.add('hidden');
  setHidden(modal, true);
  releaseFocusTrap();
  restoreFocus();
}

function showToast(title, message, type = 'success') {
  const toast = byId('notification-toast');
  const toastTitle = byId('toast-title');
  const toastMessage = byId('toast-message');
  if (!toast || !toastTitle || !toastMessage) {
    return;
  }

  const borderClass =
    {
      success: 'border-green-500',
      error: 'border-red-500',
      info: 'border-blue-500',
    }[type] || 'border-green-500';

  toast.classList.remove(
    'hidden',
    'border-green-500',
    'border-red-500',
    'border-blue-500',
    'translate-x-full'
  );
  toast.classList.add(borderClass);

  toastTitle.textContent = title;
  toastMessage.textContent = message;
  setHidden(toast, false);

  if (APP.toastTimerId) {
    window.clearTimeout(APP.toastTimerId);
  }
  APP.toastTimerId = window.setTimeout(hideToast, 4000);
}

function hideToast() {
  const toast = byId('notification-toast');
  if (!toast) {
    return;
  }

  toast.classList.add('translate-x-full');
  setHidden(toast, true);
  window.setTimeout(() => toast.classList.add('hidden'), 280);
}

function toggleContrast() {
  document.body.classList.toggle('high-contrast');
  persistPreferences();
  announceLive(
    `High contrast mode ${document.body.classList.contains('high-contrast') ? 'enabled' : 'disabled'}.`
  );
}

function adjustFontSize(delta) {
  APP.fontSizeLevel = Math.max(
    APP.minFontSizeLevel,
    Math.min(APP.maxFontSizeLevel, APP.fontSizeLevel + Number(delta || 0))
  );
  document.documentElement.style.fontSize = `${APP.baseFontSize + APP.fontSizeLevel}px`;
  persistPreferences();
  announceLive(`Font size set to ${APP.baseFontSize + APP.fontSizeLevel} pixels.`);
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

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function mockPost(path, payload) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (path === API_PATHS.login) {
        resolve({
          ok: true,
          data: {
            user: {
              name: payload.email
                .split('@')[0]
                .replace(/[._-]/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase()),
              email: payload.email,
            },
          },
        });
        return;
      }

      resolve({ ok: true, data: { received: true } });
    }, 350);
  });
}

async function postJson(path, payload) {
  if (MOCK_MODE) {
    return mockPost(path, payload);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await safeJson(response);
  return {
    ok: response.ok,
    data,
    error: data?.error || data?.message,
  };
}

async function withLoadingState(button, callback, label) {
  if (!button) {
    await callback();
    return;
  }

  const originalText = button.textContent;
  const wasDisabled = button.disabled;
  button.disabled = true;
  button.textContent = label;

  try {
    await callback();
  } catch (error) {
    showToast('Request failed', error.message || 'Unexpected network error.', 'error');
  } finally {
    button.disabled = wasDisabled;
    button.textContent = originalText;
  }
}

function hydrateInputFormatters() {
  const phoneInput = byId('app-phone');
  const ssnInput = byId('app-ssn');

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
      if (digits.length <= 3) {
        ssnInput.value = digits;
      } else if (digits.length <= 5) {
        ssnInput.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        ssnInput.value = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
      }
    });
  }
}

function getSafeReturnPath(value) {
  if (!value || typeof value !== 'string') {
    return '/account';
  }
  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/account';
  }
  return value;
}

function navigateWithReason(path, reason, returnTo) {
  const params = new URLSearchParams();
  if (reason) {
    params.set('reason', reason);
  }
  if (returnTo) {
    params.set('returnTo', getSafeReturnPath(returnTo));
  }
  const query = params.toString();
  window.location.href = query ? `${path}?${query}` : path;
}

function normalizeReasonToSessionState(reason) {
  const map = {
    logout: SESSION_STATES.unauthenticated,
    unauthorized: SESSION_STATES.revoked,
    expiry: SESSION_STATES.expired,
    restored: SESSION_STATES.restored,
    post_login: SESSION_STATES.active,
  };
  return map[reason] || SESSION_STATES.unauthenticated;
}

function renderAccountSessionState() {
  const label = byId('account-session-state-label');
  const message = byId('account-state-message');
  const loginSection = byId('login-modal');
  const authSection = byId('account-authenticated-panel');
  if (!label || !message || !loginSection || !authSection) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  const state = APP.user ? getSessionState(APP.user) : normalizeReasonToSessionState(reason);
  const labelMap = {
    [SESSION_STATES.active]: 'Active',
    [SESSION_STATES.restored]: 'Restored',
    [SESSION_STATES.expired]: 'Expired',
    [SESSION_STATES.revoked]: 'Revoked',
    [SESSION_STATES.unauthenticated]: 'Unauthenticated',
  };
  const messageMap = {
    [SESSION_STATES.active]: 'Your session is active.',
    [SESSION_STATES.restored]:
      'Your session was restored after re-authentication. Continue where you left off.',
    [SESSION_STATES.expired]: 'Your session expired. Please sign in again to continue.',
    [SESSION_STATES.revoked]:
      'Your session is no longer authorized. Please re-authenticate to proceed.',
    [SESSION_STATES.unauthenticated]: 'Sign in to continue to your account-specific status.',
  };

  label.textContent = labelMap[state] || labelMap[SESSION_STATES.unauthenticated];
  message.textContent = messageMap[state] || messageMap[SESSION_STATES.unauthenticated];

  const authenticated = isAuthenticatedState(state) && Boolean(APP.user);
  loginSection.classList.toggle('hidden', authenticated);
  authSection.classList.toggle('hidden', !authenticated);
}

function buildStatusHandoff(user) {
  if (!user) {
    return null;
  }
  const issuedAt = Date.now();
  return {
    payload: {
      accountHint: user.email || 'unknown-account',
      sessionState: getSessionState(user),
      source: '/account',
    },
    identifiers: {
      handoffId: `handoff_${Math.random().toString(36).slice(2, 10)}`,
      correlationId: `corr_${issuedAt}`,
    },
    freshness: {
      issuedAt,
      expiresAt: issuedAt + HANDOFF_TTL_MS,
      ttlMs: HANDOFF_TTL_MS,
    },
    fallback: {
      onMissingState: '/account?reason=unauthorized&returnTo=%2Fstatus',
      onExpiredState: '/account?reason=expiry&returnTo=%2Fstatus',
    },
  };
}

function goToStatusFromAccount() {
  if (!APP.user) {
    navigateWithReason('/account', 'unauthorized', '/status');
    return;
  }
  const handoff = buildStatusHandoff(APP.user);
  if (!handoff) {
    navigateWithReason('/account', 'unauthorized', '/status');
    return;
  }
  sessionStorage.setItem(STORAGE_KEYS.handoff, JSON.stringify(handoff));
  window.location.href = `/status?handoff=${encodeURIComponent(
    handoff.identifiers.handoffId
  )}&issuedAt=${handoff.freshness.issuedAt}`;
}

function renderStatusHandoffState() {
  const summary = byId('status-handoff-summary');
  const details = byId('status-handoff-details');
  const reauthLink = byId('status-reauth-link');
  if (!summary || !details || !reauthLink) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const handoffId = params.get('handoff');
  const rawHandoff = sessionStorage.getItem(STORAGE_KEYS.handoff);
  let handoff = null;
  if (rawHandoff) {
    try {
      handoff = JSON.parse(rawHandoff);
    } catch {
      handoff = null;
    }
  }
  const now = Date.now();
  const isMissing = !handoff || !handoffId;
  const isMismatch = Boolean(handoff && handoffId && handoff.identifiers.handoffId !== handoffId);
  const isExpired = Boolean(
    handoff && handoff.freshness?.expiresAt && handoff.freshness.expiresAt < now
  );
  const hasAuth = Boolean(APP.user);

  reauthLink.href = `/account?reason=unauthorized&returnTo=${encodeURIComponent(
    window.location.pathname
  )}`;

  if (hasAuth && handoff && !isMismatch && !isExpired) {
    summary.textContent = 'Handoff verified. Account-specific status is available.';
    details.classList.remove('hidden');
    details.innerHTML = `
      <p><strong>Handoff ID:</strong> ${escapeHtml(handoff.identifiers.handoffId)}</p>
      <p><strong>Correlation ID:</strong> ${escapeHtml(handoff.identifiers.correlationId)}</p>
      <p><strong>Fresh until:</strong> ${new Date(handoff.freshness.expiresAt).toLocaleString()}</p>
      <p><strong>Account:</strong> ${escapeHtml(handoff.payload.accountHint)}</p>
    `;
    return;
  }

  details.classList.add('hidden');
  if (!hasAuth) {
    summary.textContent =
      'You are currently unauthenticated. Sign in to recover account-specific status.';
    return;
  }
  if (isMissing) {
    summary.textContent = 'We could not find transfer state after refresh or deep-link navigation.';
    return;
  }
  if (isMismatch) {
    summary.textContent =
      'The handoff token does not match current browser state. Start again from Account.';
    return;
  }
  if (isExpired) {
    summary.textContent =
      'The handoff token is stale. Re-authenticate to generate a fresh handoff.';
    reauthLink.href = '/account?reason=expiry&returnTo=%2Fstatus';
  }
}

async function handleApplicationSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const firstName = byId('app-firstname')?.value.trim() || '';
  const lastName = byId('app-lastname')?.value.trim() || '';
  const email = byId('app-email')?.value.trim() || '';
  const phoneRaw = byId('app-phone')?.value.trim() || '';
  const ssnRaw = byId('app-ssn')?.value.trim() || '';
  const amount = byId('app-amount')?.value || '';
  const plan = byId('app-plan')?.value.trim() || '';
  const termsAccepted = Boolean(byId('app-terms')?.checked ?? true);

  if (!isValidEmail(email)) {
    showToast('Validation error', 'Please enter a valid email address.', 'error');
    return;
  }

  const normalizedPhone = normalizePhone(phoneRaw);
  if (!normalizedPhone) {
    showToast('Validation error', 'Please enter a valid phone number with 10-15 digits.', 'error');
    return;
  }

  if (!termsAccepted || !firstName || !lastName || !amount || !plan) {
    showToast(
      'Validation error',
      'Please complete all required fields before submitting.',
      'error'
    );
    return;
  }

  let ssnToken = null;
  if (byId('app-ssn')) {
    ssnToken = tokenizeSsn(ssnRaw);
    if (!ssnToken) {
      showToast('Validation error', 'Please enter a valid SSN using 9 digits.', 'error');
      return;
    }
  }

  const payload = {
    firstName,
    lastName,
    email,
    phone: normalizedPhone,
    ssnToken,
    requestedAmountBracket: amount,
    plan,
    acceptedTerms: termsAccepted,
  };

  const submitButton = form.querySelector('button[type="submit"]');
  await withLoadingState(
    submitButton,
    async () => {
      const response = await postJson(API_PATHS.application, payload);
      if (!response.ok) {
        throw new Error(response.error || 'Unable to submit your application right now.');
      }

      form.reset();
      showToast(
        'Application submitted',
        'Your grant application has been received successfully.',
        'success'
      );
      closeApplyModal();
    },
    'Submitting...'
  );
}

async function handleContactSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const name = byId('contact-name')?.value.trim() || '';
  const email = byId('contact-email')?.value.trim() || '';
  const subject = byId('contact-subject')?.value || 'general';
  const message = byId('contact-message')?.value.trim() || '';

  if (!name || !message) {
    showToast('Validation error', 'Please provide your name and message.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showToast('Validation error', 'Please provide a valid email for follow-up.', 'error');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  await withLoadingState(
    submitButton,
    async () => {
      const response = await postJson(API_PATHS.contact, { name, email, subject, message });
      if (!response.ok) {
        throw new Error(response.error || 'Unable to send your message right now.');
      }

      form.reset();
      showToast('Message sent', 'Thanks for contacting us. We will reply shortly.', 'success');
    },
    'Sending...'
  );
}

async function handleLogin(event) {
  event.preventDefault();

  const email = byId('login-email')?.value.trim() || '';
  const password = byId('login-password')?.value || '';
  const form = event.target;

  if (!isValidEmail(email) || !password) {
    showToast('Sign in failed', 'Please enter a valid email and password.', 'error');
    return;
  }

  const submitButton = form?.querySelector?.('button[type="submit"]');
  await withLoadingState(
    submitButton,
    async () => {
      const response = await postJson(API_PATHS.login, { email, password });
      if (!response.ok) {
        throw new Error(response.error || 'Unable to sign in right now.');
      }

      const user = response.data?.user || {
        name: email.split('@')[0],
        email,
      };
      setCurrentUser(user);
      const params = new URLSearchParams(window.location.search);
      const returnTo = getSafeReturnPath(params.get('returnTo') || '/account');
      const fromReason = params.get('reason');
      const restoredFlow = fromReason === 'expiry' || fromReason === 'unauthorized';
      if (restoredFlow) {
        APP.user.state = SESSION_STATES.restored;
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(APP.user));
      }
      closeLoginModal();
      showToast('Welcome back', `Signed in as ${user.name}.`, 'success');
      if (returnTo === '/status') {
        goToStatusFromAccount();
      } else {
        navigateWithReason('/account', restoredFlow ? 'restored' : 'post_login', returnTo);
      }
    },
    'Signing in...'
  );
}

function logout() {
  clearCurrentUser(SESSION_STATES.unauthenticated);
  showToast('Signed out', 'You have been logged out successfully.', 'info');
  navigateWithReason('/account', 'logout', '/account');
}

function toggleChat() {
  const chatWindow = byId('chat-window');
  const chatButton = byId('chat-button');
  const chatLabel = byId('chat-button-label');

  if (!chatWindow) {
    return;
  }

  APP.chatOpen = !APP.chatOpen;
  chatWindow.classList.toggle('hidden', !APP.chatOpen);
  setHidden(chatWindow, !APP.chatOpen);
  setExpanded(chatButton, APP.chatOpen);

  if (chatLabel) {
    chatLabel.textContent = APP.chatOpen ? 'Close Chat' : 'Live Support';
  }

  if (APP.chatOpen) {
    byId('chat-input')?.focus();
    announceLive('Live chat opened.');
  } else {
    chatButton?.focus();
    announceLive('Live chat closed.');
  }
}

function sendChatMessage(event) {
  event.preventDefault();

  const input = byId('chat-input');
  const messages = byId('chat-messages');
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

  window.setTimeout(() => {
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-message bg-white border border-slate-200 rounded-lg p-3 mr-10';
    botBubble.innerHTML =
      '<p class="text-sm text-slate-700">Thanks for your message. A grants specialist will follow up shortly.</p>';
    messages.appendChild(botBubble);
    messages.scrollTop = messages.scrollHeight;
  }, 350);

  input.value = '';
  messages.scrollTop = messages.scrollHeight;
}

function switchToRegister() {
  showToast(
    'Registration unavailable',
    'Self-service registration is not available yet. Please contact support.',
    'info'
  );
}

function initializeApp() {
  checkAuthStatus();
  loadSavedPreferences();
  hydrateInputFormatters();
  syncA11yState();
  const path = window.location.pathname;

  if (path === '/account' || path.endsWith('/account.html')) {
    renderAccountSessionState();
  }
  if (path === '/status' || path.endsWith('/status.html')) {
    renderStatusHandoffState();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    const applyModalOpen = !byId('apply-modal')?.classList.contains('hidden');
    const loginModalOpen = !byId('login-modal')?.classList.contains('hidden');

    if (applyModalOpen) {
      closeApplyModal();
      return;
    }

    if (loginModalOpen) {
      closeLoginModal();
      return;
    }

    if (APP.chatOpen) {
      toggleChat();
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeApp);
