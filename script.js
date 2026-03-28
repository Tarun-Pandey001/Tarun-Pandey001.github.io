/* ═══════════════════════════════════════════════════
   TARUN PANDEY — PORTFOLIO  |  script.js
   Handles: Custom cursor · Nav scroll · Smooth scroll ·
            Hero canvas · Scroll reveal · Skill bars ·
            Mobile menu · Active nav links
═══════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. HERO CANVAS — Animated Blueprint Grid
   Draws drifting nodes + connecting lines
   to create a live engineering-grid effect
───────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, nodes, animId;

  const ACCENT      = '#2563EB';
  const NODE_COUNT  = 55;
  const LINE_DIST   = 140;
  const NODE_SPEED  = 0.35;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * NODE_SPEED,
      vy: (Math.random() - 0.5) * NODE_SPEED,
      r: Math.random() * 1.5 + 0.5
    };
  }

  function initNodes() {
    nodes = Array.from({ length: NODE_COUNT }, createNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update positions — bounce off edges
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw connecting lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINE_DIST) {
          const alpha = (1 - dist / LINE_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.6)';
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  function start() {
    cancelAnimationFrame(animId);
    resize();
    initNodes();
    draw();
  }

  start();

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas.parentElement);

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });
})();


/* ─────────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  // Hide on touch devices
  if ('ontouchstart' in window) {
    dot.style.display = ring.style.display = 'none';
    return;
  }

  let mx = 0, my = 0;   // mouse
  let rx = 0, ry = 0;   // ring (lagged)

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  // Smooth ring follow
  (function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Expand ring on interactive elements
  const interactives = document.querySelectorAll('a, button, .project-card, .stat-card, .stack-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '52px';
      ring.style.height = '52px';
      ring.style.borderColor = 'rgba(37, 99, 235, 0.8)';
      dot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(37, 99, 235, 0.5)';
      dot.style.opacity = '1';
    });
  });
})();


/* ─────────────────────────────────────────
   3. NAVIGATION — Scroll + Active States
───────────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const links  = document.querySelectorAll('.nav__link');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  if (!nav) return;

  // Scrolled class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile burger
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active section highlighting
  const sections = Array.from(
    document.querySelectorAll('section[id], .section[id]')
  );

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ─────────────────────────────────────────
   4. SMOOTH SCROLL — for #hash links
───────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;          // CV download placeholder
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h')) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────
   5. SCROLL REVEAL — IntersectionObserver
───────────────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.scroll-reveal, .reveal-up');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  revealEls.forEach(el => observer.observe(el));

  // Immediately reveal anything already in view on load
  setTimeout(() => {
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('visible');
        observer.unobserve(el);
      }
    });
  }, 100);
})();


/* ─────────────────────────────────────────
   6. SKILL BARS — animate width on reveal
───────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill  = entry.target.querySelector('.skill-bar__fill');
        const width = entry.target.dataset.width || '70';
        if (fill) {
          // Slight delay so card animation plays first
          setTimeout(() => {
            fill.style.width = width + '%';
          }, 300);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ─────────────────────────────────────────
   7. HERO NAME — stagger letter reveal
───────────────────────────────────────── */
(function initHeroReveal() {
  // Trigger hero animations on load
  window.addEventListener('load', () => {
    document.querySelectorAll('.reveal-up').forEach(el => {
      const delay = parseFloat(el.style.getPropertyValue('--delay') || '0');
      setTimeout(() => {
        el.classList.add('visible');
      }, delay * 1000 + 150);
    });
  });
})();


/* ─────────────────────────────────────────
   8. NAV CV BUTTON — CV download link
   Replace '#' with your actual CV URL
───────────────────────────────────────── */



/* ─────────────────────────────────────────
   9. STAT COUNTER — animated number count
───────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-card__num');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();
      const num = parseFloat(raw);
      const suffix = raw.replace(/[\d.]/g, '');
      if (isNaN(num)) return;

      let start = 0;
      const duration = 1000;
      const step     = 16;
      const steps    = duration / step;
      const inc      = num / steps;

      const timer = setInterval(() => {
        start = Math.min(start + inc, num);
        el.textContent = (Number.isInteger(num)
          ? Math.round(start)
          : start.toFixed(1)) + suffix;
        if (start >= num) clearInterval(timer);
      }, step);

      observer.unobserve(el);
    });
  }, { threshold: 0.8 });

  counters.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────
   10. TILT EFFECT — subtle card tilt
    on mouse move (desktop only)
───────────────────────────────────────── */
(function initTilt() {
  if ('ontouchstart' in window) return;

  const cards = document.querySelectorAll('.project-card, .stack-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -5;
      const tiltY = dx *  5;
      card.style.transform =
        `translateY(-4px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─────────────────────────────────────────
   11. FOOTER YEAR — auto-update
───────────────────────────────────────── */
(function initFooterYear() {
  const el = document.querySelector('.footer__copy');
  if (el) {
    el.textContent = el.textContent.replace(
      /\d{4}/,
      new Date().getFullYear()
    );
  }
})();
