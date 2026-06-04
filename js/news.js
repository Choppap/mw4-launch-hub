/* ============================================
   MW4 LAUNCH HUB — News Hub System
   ============================================ */

const NewsHub = {
  articles: [],
  filteredArticles: [],
  activeFilter: 'all',
  searchQuery: '',

  /**
   * Initialize the news hub
   */
  async init() {
    await this.loadArticles();
    this.renderFilters();
    this.renderArticles();
    this.bindEvents();
  },

  /**
   * Load articles from JSON data
   */
  async loadArticles() {
    try {
      const response = await fetch('./data/news.json');
      const data = await response.json();
      this.articles = data.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      this.filteredArticles = [...this.articles];
    } catch (error) {
      console.error('Failed to load news articles:', error);
      this.articles = [];
      this.filteredArticles = [];
    }
  },

  /**
   * Render filter buttons
   */
  renderFilters() {
    const container = document.getElementById('news-filters');
    if (!container) return;

    const filters = [
      { key: 'all', label: 'All Intel', icon: '📡' },
      { key: 'official', label: 'Official', icon: '✅' },
      { key: 'news', label: 'News', icon: '📰' },
      { key: 'analysis', label: 'Analysis', icon: '🔍' },
      { key: 'rumour', label: 'Rumour', icon: '⚠️' },
      { key: 'leak', label: 'Leak', icon: '🚨' },
    ];

    container.innerHTML = `
      <span class="filter-bar__label">Filter:</span>
      ${filters.map(f => `
        <button class="filter-btn ${f.key === 'all' ? 'active' : ''}" 
                data-filter="${f.key}" 
                id="filter-${f.key}">
          ${f.icon} ${f.label}
        </button>
      `).join('')}
    `;
  },

  /**
   * Render articles to grid
   */
  renderArticles() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    if (this.filteredArticles.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔇</div>
          <h3 style="font-family: var(--font-display); margin-bottom: 0.5rem;">No Intel Found</h3>
          <p style="color: var(--text-muted);">No articles match your current filters. Try adjusting your search.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredArticles.map((article, index) => 
      this.renderCard(article, index === 0 && this.activeFilter === 'all' && article.featured)
    ).join('');
  },

  /**
   * Render a single news card
   */
  renderCard(article, isFeatured = false) {
    const classificationConfig = {
      official: { icon: '✅', label: 'Official Source', class: 'official' },
      news: { icon: '📰', label: 'News Report', class: 'news' },
      analysis: { icon: '🔍', label: 'Analysis', class: 'analysis' },
      rumour: { icon: '⚠️', label: 'Rumour', class: 'rumour' },
      leak: { icon: '🚨', label: 'Leak', class: 'leak' },
    };

    const confidenceConfig = {
      high: { label: 'High Confidence', class: 'high' },
      medium: { label: 'Medium Confidence', class: 'medium' },
      low: { label: 'Low Confidence', class: 'low' },
    };

    const classification = classificationConfig[article.classification] || classificationConfig.news;
    const confidence = confidenceConfig[article.confidence] || confidenceConfig.medium;

    const warningIcon = (article.classification === 'rumour' || article.classification === 'leak') 
      ? `<span style="color: ${article.classification === 'leak' ? 'var(--badge-leak)' : 'var(--badge-rumour)'}" title="Unverified information">⚠️</span>` 
      : '';

    const statusBadge = article.debunked 
      ? '<span class="badge badge--leak" style="font-size: 0.65rem;">❌ DEBUNKED</span>'
      : article.confirmed 
        ? '<span class="badge badge--official" style="font-size: 0.65rem;">✅ CONFIRMED</span>'
        : '';

    const pinnedClass = article.pinned ? 'news-card--pinned' : '';
    const featuredClass = isFeatured ? 'news-card--featured' : '';

    return `
      <article class="news-card ${pinnedClass} ${featuredClass}" data-id="${article.id}">
        <div class="news-card__image-wrap">
          <img class="news-card__image" 
               src="${article.imageUrl}" 
               alt="${article.title}"
               loading="lazy"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 225%22><rect fill=%22%231a1a2e%22 width=%22400%22 height=%22225%22/><text x=%22200%22 y=%22112%22 fill=%22%236a737d%22 font-size=%2216%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-family=%22sans-serif%22>MW4 Intel</text></svg>'">
          <div class="news-card__badges">
            <span class="badge badge--${classification.class}">${classification.icon} ${classification.label}</span>
            <span class="badge badge--confidence-${confidence.class}">${confidence.label}</span>
            ${statusBadge}
          </div>
        </div>
        <div class="news-card__body">
          <div class="news-card__meta">
            <span class="news-card__source">${article.source.name}</span>
            <span style="color: var(--text-muted);">•</span>
            <span class="news-card__date">${Utils.formatRelativeDate(article.publishedAt)}</span>
            ${warningIcon}
          </div>
          <h3 class="news-card__title">${article.title}</h3>
          <p class="news-card__summary">${article.summary}</p>
          <div class="news-card__footer">
            <a href="${article.sourceUrl}" target="_blank" rel="noopener noreferrer" class="news-card__read-more">
              Read Full Article <span>→</span>
            </a>
            <span style="font-size: var(--fs-xs); color: var(--text-muted);">
              ${new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Filter articles
   */
  applyFilters() {
    this.filteredArticles = this.articles.filter(article => {
      const matchesFilter = this.activeFilter === 'all' || article.classification === this.activeFilter;
      const matchesSearch = !this.searchQuery || 
        article.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        article.source.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    // Pinned articles first
    this.filteredArticles.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    this.renderArticles();
  },

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter buttons
    document.getElementById('news-filters')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.activeFilter = btn.dataset.filter;
      this.applyFilters();
    });

    // Search input
    const searchInput = document.getElementById('news-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.searchQuery = e.target.value;
        this.applyFilters();
      }, 300));
    }
  }
};
