/* ═══════════════════════════════════════════
   THE ORACLE — v2 Scripts
   Ticker, signal feed, form, scroll reveals
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initTicker();
  initHeroCanvas();
  initSignalFeed();
  initWaitlistForm();
  initScrollReveals();
  initLiveCounter();
});

/* ─── TICKER ─── */
function initTicker() {
  const data = [
    { label: 'oracle', value: 'listening · pod-3' },
    { label: 'sentiment', value: '$USDC bullish' },
    { label: 'arc', value: 'blk 1,245,202' },
    { label: 'signal', value: 'discord α 87%' },
    { label: 'cycle', value: '#4,291 complete' },
    { label: 'x-feed', value: '142 KOLs tracked' },
    { label: 'latency', value: '0.38s settlement' },
    { label: 'conviction', value: 'score 94.2' },
    { label: 'usyc', value: '4.8% APY — stable' },
    { label: 'mode', value: 'sovereign reasoning' },
  ];

  const el = document.getElementById('ticker-content');
  const items = [...data, ...data]; // duplicate for loop
  el.innerHTML = items.map(d =>
    `<span class="ticker-item"><span class="ticker-dot"></span><span class="ticker-label">${d.label}:</span> ${d.value}</span>`
  ).join('');
}

/* ─── HERO CANVAS — Minimal dot field ─── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, dots;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    createDots();
  }

  function createDots() {
    const count = Math.min(50, Math.floor(w * h / 25000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.2 + 0.3,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // subtle central gradient
    const g = ctx.createRadialGradient(w * 0.35, h * 0.5, 0, w * 0.35, h * 0.5, h * 0.6);
    g.addColorStop(0, 'rgba(109, 40, 217, 0.02)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = w;
      if (d.x > w) d.x = 0;
      if (d.y < 0) d.y = h;
      if (d.y > h) d.y = 0;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
    });

    // sparse connection lines
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.015 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}

/* ─── SIGNAL FEED (Terminal-style) ─── */
function initSignalFeed() {
  const feed = document.getElementById('signal-feed');
  if (!feed) return;

  const signals = [
    { src: 'discord', msg: 'pod-3 mentions $ARC spiking — bullish cluster forming' },
    { src: 'x', msg: '@vitalik.eth thread on agent economies gaining traction' },
    { src: 'telegram', msg: 'whale wallet 0x7f2... moved 840k USDC to arc bridge' },
    { src: 'discord', msg: 'sentiment shift detected in #alpha-calls (confidence: 91%)' },
    { src: 'x', msg: 'canteen DAO proposal #47 passed — new liquidity pools incoming' },
    { src: 'oracle', msg: 'deliberation cycle complete. conviction: HOLD. score: 94.2' },
    { src: 'arc', msg: 'block 1,245,203 finalized. 847 txns. 0.31s settlement.' },
    { src: 'telegram', msg: 'new builder joined the agora. total: 2,341 participants' },
    { src: 'discord', msg: 'alpha leak in pod-7 — cross-referencing with X sentiment' },
    { src: 'x', msg: 'circle announces USYC yield increase to 4.8% APY' },
    { src: 'oracle', msg: 'new pattern detected. recalibrating conviction model...' },
    { src: 'arc', msg: 'gas fees remain < $0.001. throughput nominal.' },
  ];

  const maxLines = 8;
  let idx = 0;

  function addLine() {
    const s = signals[idx % signals.length];
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    const line = document.createElement('div');
    line.className = 'feed-line';
    line.innerHTML = `<span class="fl-time">${time}</span><span class="fl-src">${s.src}</span><span class="fl-msg">${s.msg}</span>`;

    feed.prepend(line);

    // Remove excess
    while (feed.children.length > maxLines) {
      feed.removeChild(feed.lastChild);
    }

    idx++;
  }

  // Initial fill
  for (let i = 0; i < 5; i++) {
    addLine();
  }

  // Drip new lines
  setInterval(addLine, 4000);
}

/* ─── FORM ─── */
function initWaitlistForm() {
  const form = document.getElementById('waitlist-form');
  const input = document.getElementById('waitlist-input');
  const success = document.getElementById('success-state');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isArc = val.endsWith('.arc');

    if (!isEmail && !isArc) {
      input.value = '';
      input.placeholder = 'enter a valid email or .arc address';
      input.style.color = '#ef4444';
      setTimeout(() => {
        input.placeholder = 'your@email.com or name.arc';
        input.style.color = '';
      }, 2000);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: val }),
      });

      if (response.ok) {
        form.hidden = true;
        success.hidden = false;
      } else {
        console.error('Signup failed');
      }
    } catch (err) {
      console.error('Error submitting signup:', err);
    }
  });
}

/* ─── SCROLL REVEALS ─── */
function initScrollReveals() {
  const targets = document.querySelectorAll('.process-step, .infra-card, .timeline-item');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const parent = entry.target.parentElement;
        const siblings = parent.querySelectorAll('.process-step, .infra-card');
        const idx = Array.from(siblings).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  targets.forEach(t => obs.observe(t));
}

/* ─── LIVE COUNTER ─── */
function initLiveCounter() {
  const el = document.getElementById('stat-signals');
  if (!el) return;
  let n = 12847;
  setInterval(() => {
    n += Math.floor(Math.random() * 4) + 1;
    el.textContent = n.toLocaleString();
  }, 3500);
}

/* ─── SMOOTH SCROLL ─── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  e.preventDefault();
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (link.getAttribute('href') === '#hero') {
      setTimeout(() => document.getElementById('waitlist-input')?.focus(), 500);
    }
  }
});
