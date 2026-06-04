/* ============================================
   MW4 LAUNCH HUB — Main Application Controller
   ============================================ */

const App = {
  gameInfo: [],

  /**
   * Initialize the entire application
   */
  async init() {
    console.log('%c🎮 MW4 Launch Hub', 'font-size: 24px; font-weight: bold; color: #ff6b35;');
    console.log('%cFan-made community project', 'color: #6a737d;');

    // Initialize systems in order
    Navigation.init();
    Particles.init();
    Countdown.init();

    // Load data-driven sections
    await Promise.all([
      NewsHub.init(),
      Timeline.init(),
      this.loadGameInfo(),
    ]);

    // Set up scroll reveal animations
    Utils.initRevealObserver();

    // Newsletter form
    this.initNewsletter();

    // Notification permission
    this.initNotifications();
  },

  /**
   * Load and render game info cards
   */
  async loadGameInfo() {
    try {
      const response = await fetch('./data/game-info.json');
      const data = await response.json();
      this.gameInfo = data.items;
      this.renderGameInfo();
    } catch (error) {
      console.error('Failed to load game info:', error);
    }
  },

  /**
   * Render game info cards
   */
  renderGameInfo() {
    const container = document.getElementById('info-grid');
    if (!container) return;

    container.innerHTML = this.gameInfo.map(item => `
      <div class="info-card reveal">
        <span class="info-card__icon">${item.icon}</span>
        <span class="info-card__label">${item.label}</span>
        <div class="info-card__value">${item.value}</div>
        <p class="info-card__detail">${item.detail}</p>
        <span class="info-card__status info-card__status--${item.confirmed ? 'confirmed' : 'unconfirmed'}">
          ${item.confirmed ? '✅ Confirmed' : '⚠️ Unconfirmed'}
          ${item.source ? ` — ${item.source}` : ''}
        </span>
      </div>
    `).join('');
  },

  /**
   * Initialize newsletter form
   */
  initNewsletter() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value;
      if (email) {
        Utils.showToast('Thanks for subscribing! You\'ll receive MW4 updates. 📧', 'success');
        form.reset();
      }
    });
  },

  /**
   * Initialize browser notification opt-in
   */
  initNotifications() {
    const notifBtn = document.getElementById('enable-notifications');
    if (!notifBtn) return;

    // Hide if notifications not supported
    if (!('Notification' in window)) {
      notifBtn.style.display = 'none';
      return;
    }

    if (Notification.permission === 'granted') {
      notifBtn.textContent = '🔔 Notifications Enabled';
      notifBtn.disabled = true;
      notifBtn.style.opacity = '0.6';
    }

    notifBtn.addEventListener('click', async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        notifBtn.textContent = '🔔 Notifications Enabled';
        notifBtn.disabled = true;
        notifBtn.style.opacity = '0.6';
        new Notification('MW4 Launch Hub', {
          body: 'You\'ll now receive MW4 news and countdown alerts!',
          icon: './assets/images/mw4-logo.png'
        });
        Utils.showToast('Notifications enabled! 🔔', 'success');
      }
    });
  }
};

// Boot the application
document.addEventListener('DOMContentLoaded', () => App.init());
