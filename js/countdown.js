/* ============================================
   MW4 LAUNCH HUB — Smart Countdown System
   ============================================ */

const Countdown = {
  // Release date: Oct 24, 2026 at 12:00 AM ET (midnight Eastern)
  RELEASE_DATE_UTC: '2026-10-24T04:00:00Z',
  
  currentTimezone: null,
  intervalId: null,
  previousValues: { days: -1, hours: -1, minutes: -1, seconds: -1 },

  /**
   * Initialize the countdown system
   */
  init() {
    this.currentTimezone = Utils.detectTimezone();
    this.renderTimezoneDropdown();
    this.updateTimezoneDisplay();
    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);

    // Share button
    const shareBtn = document.getElementById('countdown-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => this.shareCountdown());
    }
  },

  /**
   * Render timezone dropdown
   */
  renderTimezoneDropdown() {
    const select = document.getElementById('timezone-select');
    if (!select) return;

    const timezones = Utils.getTimezoneList();
    select.innerHTML = '';

    timezones.forEach(tz => {
      const option = document.createElement('option');
      option.value = tz.value;
      option.textContent = tz.label;
      if (tz.value === this.currentTimezone) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    // Check if user's timezone is in the list, if not add it
    if (!timezones.find(tz => tz.value === this.currentTimezone)) {
      const option = document.createElement('option');
      option.value = this.currentTimezone;
      option.textContent = `📍 ${Utils.getTimezoneName(this.currentTimezone)} (Detected)`;
      option.selected = true;
      select.insertBefore(option, select.firstChild);
    }

    select.addEventListener('change', (e) => {
      this.currentTimezone = e.target.value;
      this.updateTimezoneDisplay();
      this.update();
    });
  },

  /**
   * Update timezone info display
   */
  updateTimezoneDisplay() {
    const releaseDate = document.getElementById('release-date');
    const releaseTime = document.getElementById('release-time');
    const currentTz = document.getElementById('current-timezone');

    if (releaseDate) {
      releaseDate.textContent = Utils.formatDate(this.RELEASE_DATE_UTC, this.currentTimezone);
    }
    if (releaseTime) {
      releaseTime.textContent = Utils.formatTime(this.RELEASE_DATE_UTC, this.currentTimezone);
    }
    if (currentTz) {
      currentTz.textContent = Utils.getTimezoneName(this.currentTimezone);
    }
  },

  /**
   * Update countdown values
   */
  update() {
    const now = new Date();
    const release = new Date(this.RELEASE_DATE_UTC);
    const diff = release - now;

    if (diff <= 0) {
      this.renderLaunched();
      clearInterval(this.intervalId);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.setValue('days', days);
    this.setValue('hours', hours);
    this.setValue('minutes', minutes);
    this.setValue('seconds', seconds);
  },

  /**
   * Set a countdown value with animation
   */
  setValue(unit, value) {
    const el = document.getElementById(`countdown-${unit}`);
    if (!el) return;

    const formatted = String(value).padStart(unit === 'days' ? 3 : 2, '0');
    
    if (this.previousValues[unit] !== value) {
      el.textContent = formatted;
      el.classList.add('updated');
      setTimeout(() => el.classList.remove('updated'), 300);
      this.previousValues[unit] = value;
    }
  },

  /**
   * Show launched state
   */
  renderLaunched() {
    const timer = document.querySelector('.countdown__timer');
    if (timer) {
      timer.innerHTML = `
        <div style="text-align: center;">
          <div style="font-family: var(--font-display); font-size: var(--fs-h1); font-weight: 900; color: var(--orange-accent); text-transform: uppercase; letter-spacing: 0.1em; animation: pulseGlowText 2s ease-in-out infinite;">
            🎮 MW4 IS LIVE 🎮
          </div>
          <p style="color: var(--text-secondary); margin-top: 1rem;">The wait is over. Drop in, soldier.</p>
        </div>
      `;
    }
  },

  /**
   * Share countdown to clipboard
   */
  async shareCountdown() {
    const now = new Date();
    const release = new Date(this.RELEASE_DATE_UTC);
    const diff = release - now;
    
    if (diff <= 0) {
      Utils.showToast('MW4 has already launched! 🎮');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const text = `🎮 Call of Duty: Modern Warfare 4 launches in ${days} days and ${hours} hours!\n\n📅 ${Utils.formatDate(this.RELEASE_DATE_UTC, this.currentTimezone)}\n⏰ ${Utils.formatTime(this.RELEASE_DATE_UTC, this.currentTimezone)} (${Utils.getTimezoneName(this.currentTimezone)})\n\n🔗 Track the countdown: ${window.location.href}\n\n#MW4 #ModernWarfare4 #CallOfDuty`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'MW4 Countdown', text });
        return;
      } catch { /* fallback to clipboard */ }
    }

    const success = await Utils.copyToClipboard(text);
    Utils.showToast(success ? 'Countdown copied to clipboard! 📋' : 'Failed to copy', success ? 'success' : 'error');
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
};
