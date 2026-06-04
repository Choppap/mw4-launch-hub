/* ============================================
   MW4 LAUNCH HUB — Utility Functions
   ============================================ */

const Utils = {
  /**
   * Detect user's timezone automatically
   */
  detectTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  },

  /**
   * Get friendly timezone display name
   */
  getTimezoneName(tz) {
    const tzNames = {
      'America/New_York': 'Eastern Time (ET)',
      'America/Chicago': 'Central Time (CT)',
      'America/Denver': 'Mountain Time (MT)',
      'America/Los_Angeles': 'Pacific Time (PT)',
      'America/Anchorage': 'Alaska Time (AKT)',
      'Pacific/Honolulu': 'Hawaii Time (HT)',
      'Europe/London': 'GMT / BST',
      'Europe/Paris': 'Central European (CET)',
      'Europe/Berlin': 'Central European (CET)',
      'Europe/Moscow': 'Moscow Time (MSK)',
      'Asia/Tokyo': 'Japan Standard (JST)',
      'Asia/Seoul': 'Korea Standard (KST)',
      'Asia/Shanghai': 'China Standard (CST)',
      'Asia/Kolkata': 'India Standard (IST)',
      'Asia/Dubai': 'Gulf Standard (GST)',
      'Asia/Singapore': 'Singapore (SGT)',
      'Australia/Sydney': 'Australian Eastern (AEST)',
      'Australia/Perth': 'Australian Western (AWST)',
      'Australia/Adelaide': 'Australian Central (ACST)',
      'Australia/Brisbane': 'Australian Eastern (AEST)',
      'Pacific/Auckland': 'New Zealand (NZST)',
      'Africa/Johannesburg': 'South Africa (SAST)',
      'America/Sao_Paulo': 'Brasilia (BRT)',
      'America/Toronto': 'Eastern Time (ET)',
      'America/Vancouver': 'Pacific Time (PT)',
    };
    return tzNames[tz] || tz.replace(/_/g, ' ').split('/').pop();
  },

  /**
   * Get list of common timezones for dropdown
   */
  getTimezoneList() {
    return [
      { value: 'Pacific/Auckland', label: '🇳🇿 New Zealand (NZST)' },
      { value: 'Australia/Sydney', label: '🇦🇺 Sydney (AEST/AEDT)' },
      { value: 'Australia/Adelaide', label: '🇦🇺 Adelaide (ACST)' },
      { value: 'Australia/Perth', label: '🇦🇺 Perth (AWST)' },
      { value: 'Asia/Tokyo', label: '🇯🇵 Tokyo (JST)' },
      { value: 'Asia/Seoul', label: '🇰🇷 Seoul (KST)' },
      { value: 'Asia/Shanghai', label: '🇨🇳 Shanghai (CST)' },
      { value: 'Asia/Singapore', label: '🇸🇬 Singapore (SGT)' },
      { value: 'Asia/Kolkata', label: '🇮🇳 India (IST)' },
      { value: 'Asia/Dubai', label: '🇦🇪 Dubai (GST)' },
      { value: 'Europe/Moscow', label: '🇷🇺 Moscow (MSK)' },
      { value: 'Africa/Johannesburg', label: '🇿🇦 Johannesburg (SAST)' },
      { value: 'Europe/Berlin', label: '🇩🇪 Berlin (CET)' },
      { value: 'Europe/Paris', label: '🇫🇷 Paris (CET)' },
      { value: 'Europe/London', label: '🇬🇧 London (GMT/BST)' },
      { value: 'America/Sao_Paulo', label: '🇧🇷 São Paulo (BRT)' },
      { value: 'America/New_York', label: '🇺🇸 New York (ET)' },
      { value: 'America/Toronto', label: '🇨🇦 Toronto (ET)' },
      { value: 'America/Chicago', label: '🇺🇸 Chicago (CT)' },
      { value: 'America/Denver', label: '🇺🇸 Denver (MT)' },
      { value: 'America/Los_Angeles', label: '🇺🇸 Los Angeles (PT)' },
      { value: 'America/Vancouver', label: '🇨🇦 Vancouver (PT)' },
      { value: 'America/Anchorage', label: '🇺🇸 Anchorage (AKT)' },
      { value: 'Pacific/Honolulu', label: '🇺🇸 Honolulu (HT)' },
      { value: 'UTC', label: '🌐 UTC' },
    ];
  },

  /**
   * Format date for display
   */
  formatDate(dateStr, tz) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: tz
    });
  },

  /**
   * Format time for display
   */
  formatTime(dateStr, tz) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: tz,
      hour12: true
    });
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  /**
   * Set up Intersection Observer for scroll reveal animations
   */
  initRevealObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Don't unobserve — keep for re-entry if needed
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal, .stagger-children, .timeline__item').forEach(el => {
      observer.observe(el);
    });

    return observer;
  },

  /**
   * Debounce function
   */
  debounce(fn, delay = 250) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /**
   * Throttle function
   */
  throttle(fn, limit = 100) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textarea);
      return result;
    }
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast__message">${message}</span>
    `;
    
    // Add styles inline since this is dynamic
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'rgba(10, 10, 20, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
      color: '#f0f0f0',
      zIndex: '9999',
      animation: 'fadeInUp 0.3s ease-out',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
    });

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};
