/* ============================================
   MW4 LAUNCH HUB — Particle Background Effect
   ============================================ */

const Particles = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  mouseX: 0,
  mouseY: 0,

  /**
   * Initialize the particle system
   */
  init() {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', Utils.debounce(() => this.resize(), 250));
    window.addEventListener('mousemove', Utils.throttle((e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, 50));
  },

  /**
   * Resize canvas to window
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Recreate particles on resize
    if (this.particles.length > 0) {
      this.createParticles();
    }
  },

  /**
   * Create particle objects
   */
  createParticles() {
    const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 15000), 80);
    this.particles = [];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.1, // slight upward drift
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        // Ember colors: orange, red-orange, warm yellow
        color: this.getParticleColor(),
        life: Math.random() * 200 + 100,
        maxLife: 300,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }
  },

  /**
   * Get a random ember/military particle color
   */
  getParticleColor() {
    const colors = [
      { r: 255, g: 107, b: 53 },   // orange accent
      { r: 255, g: 140, b: 66 },   // orange glow
      { r: 200, g: 80, b: 40 },    // deep ember
      { r: 150, g: 160, b: 170 },  // gunmetal spark
      { r: 74, g: 124, b: 89 },    // military green
      { r: 180, g: 120, b: 50 },   // warm amber
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  /**
   * Animation loop
   */
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.pulse += p.pulseSpeed;

      // Pulsing opacity
      const pulseOp = Math.sin(p.pulse) * 0.2 + 0.8;
      const lifeRatio = p.life / p.maxLife;
      const alpha = p.opacity * pulseOp * (lifeRatio < 0.3 ? lifeRatio / 0.3 : 1);

      // Wrap around screen
      if (p.x < -10) p.x = this.canvas.width + 10;
      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.canvas.height + 10;
      if (p.y > this.canvas.height + 10) p.y = -10;

      // Reset dead particles
      if (p.life <= 0) {
        p.x = Math.random() * this.canvas.width;
        p.y = this.canvas.height + 10;
        p.life = p.maxLife;
        p.vy = -(Math.random() * 0.5 + 0.1);
        p.vx = (Math.random() - 0.5) * 0.3;
        p.color = this.getParticleColor();
      }

      // Draw particle with glow
      this.ctx.save();
      this.ctx.globalAlpha = alpha;

      // Glow effect
      this.ctx.shadowBlur = p.size * 4;
      this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;

      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });

    // Draw connection lines between nearby particles (sparse)
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const lineAlpha = (1 - dist / 120) * 0.08;
          this.ctx.strokeStyle = `rgba(255, 107, 53, ${lineAlpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
};
