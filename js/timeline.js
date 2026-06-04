/* ============================================
   MW4 LAUNCH HUB — Interactive Timeline
   ============================================ */

const Timeline = {
  events: [],

  /**
   * Initialize the timeline
   */
  async init() {
    await this.loadEvents();
    this.render();
  },

  /**
   * Load timeline events from JSON
   */
  async loadEvents() {
    try {
      const response = await fetch('./data/timeline.json');
      const data = await response.json();
      this.events = data.events;
    } catch (error) {
      console.error('Failed to load timeline events:', error);
      this.events = [];
    }
  },

  /**
   * Render the timeline
   */
  render() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = this.events.map((event, index) => {
      const dotClass = event.status === 'past' ? 'timeline__dot--past' 
                      : event.status === 'rumoured' ? 'timeline__dot--rumoured'
                      : 'timeline__dot--upcoming';

      const statusClass = event.status === 'past' ? 'timeline__status--confirmed'
                        : event.status === 'rumoured' ? 'timeline__status--rumoured'
                        : 'timeline__status--upcoming';

      const statusLabel = event.status === 'past' ? '✅ Confirmed'
                        : event.status === 'rumoured' ? '⚠️ Rumoured'
                        : '📅 Upcoming';

      return `
        <div class="timeline__item" style="transition-delay: ${index * 100}ms;">
          <div class="timeline__dot ${dotClass}"></div>
          <div class="timeline__content">
            <span class="timeline__date">${event.icon} ${event.date}</span>
            <h3 class="timeline__title">${event.title}</h3>
            <p class="timeline__description">${event.description}</p>
            <span class="timeline__status ${statusClass}">${statusLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  }
};
