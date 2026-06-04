/* ============================================
   MW4 LAUNCH HUB — Navigation System
   ============================================ */

const Navigation = {
  nav: null,
  scrollProgress: null,
  mobileMenu: null,
  hamburger: null,
  lastScrollY: 0,

  /**
   * Initialize navigation
   */
  init() {
    this.nav = document.getElementById('main-nav');
    this.scrollProgress = document.getElementById('scroll-progress');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.hamburger = document.getElementById('hamburger-btn');

    this.bindEvents();
    this.updateScroll();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Scroll events
    window.addEventListener('scroll', Utils.throttle(() => this.updateScroll(), 16));

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
          const y = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: 'smooth' });
          this.closeMobileMenu();
        }
      });
    });

    // Mobile menu
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('mw4-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  /**
   * Update scroll-based UI
   */
  updateScroll() {
    const scrollY = window.scrollY;

    // Nav background
    if (this.nav) {
      this.nav.classList.toggle('nav--scrolled', scrollY > 50);
    }

    // Scroll progress bar
    if (this.scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      this.scrollProgress.style.width = `${progress}%`;
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    
    sections.forEach(section => {
      const top = section.offsetTop - navHeight - 100;
      const bottom = top + section.offsetHeight;
      const link = document.querySelector(`.nav__link[href="#${section.id}"]`);
      
      if (link) {
        link.classList.toggle('nav__link--active', scrollY >= top && scrollY < bottom);
      }
    });

    this.lastScrollY = scrollY;
  },

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const isOpen = this.mobileMenu?.classList.toggle('active');
    this.hamburger?.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  },

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.mobileMenu?.classList.remove('active');
    this.hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  },

  /**
   * Toggle dark/light theme
   */
  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mw4-theme', next);
    this.updateThemeIcon(next);
  },

  /**
   * Update theme toggle icon
   */
  updateThemeIcon(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  }
};
