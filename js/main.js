/* ==========================================================================
   PECK Fitness — Site interactions
   ========================================================================== */

/**
 * Lead capture config.
 * Set SIGNUP_ENDPOINT to a form backend (Formspree, Netlify Forms, Supabase
 * edge function, etc.) to POST signups. If left empty, the form falls back to
 * opening a pre-filled email to CONTACT_EMAIL.
 */
const SIGNUP_ENDPOINT = '';
const CONTACT_EMAIL = 'hello@peckfitness.example';

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const setMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('menu-open', open);
  };
  setMenu(false);
  menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  // If the menu is open and the viewport grows past the mobile breakpoint,
  // the toggle disappears — close the menu so scrolling isn't left locked.
  window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = $$('.nav-links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((link) => {
    const target = $(link.getAttribute('href'));
    if (target) sectionObserver.observe(target);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal, .reveal-stagger');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- App preview: tabs ---------- */
  const tabs = $$('[data-tab]');
  const panels = $$('[data-panel]');
  const activateTab = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      activateTab(next);
    });
  });

  /* ---------- App preview: session timer ---------- */
  const TOTAL = 300;
  let remaining = TOTAL;
  let timerId;
  const timerLabel = $('#session-time');
  const startButton = $('#start-session');
  const bar = $('#session-bar');
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  startButton.addEventListener('click', () => {
    if (remaining === 0) {
      remaining = TOTAL;
      timerLabel.textContent = fmt(remaining);
      bar.style.width = '0%';
    }
    if (timerId) {
      clearInterval(timerId);
      timerId = undefined;
      startButton.textContent = 'Resume session';
      return;
    }
    startButton.textContent = 'Pause session';
    timerId = setInterval(() => {
      remaining = Math.max(remaining - 1, 0);
      timerLabel.textContent = fmt(remaining);
      bar.style.width = `${((TOTAL - remaining) / TOTAL) * 100}%`;
      if (remaining === 0) {
        clearInterval(timerId);
        timerId = undefined;
        startButton.textContent = 'Restart session';
      }
    }, 1000);
  });

  /* ---------- App preview: breathing mode ---------- */
  const breathPanel = $('#breath-panel');
  const breathToggle = $('#open-breath');
  const orb = $('#breath-orb');
  let breathId;
  breathToggle.addEventListener('click', () => {
    breathPanel.hidden = !breathPanel.hidden;
    breathToggle.setAttribute('aria-expanded', String(!breathPanel.hidden));
    breathToggle.textContent = breathPanel.hidden ? 'Breathing mode' : 'Close breathing';
    clearInterval(breathId);
    if (!breathPanel.hidden) {
      orb.textContent = 'IN';
      breathId = setInterval(() => { orb.textContent = orb.textContent === 'IN' ? 'OUT' : 'IN'; }, 4000);
      breathPanel.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    }
  });

  /* ---------- Assistant chat (scripted demo) ---------- */
  const chatBody = $('#chat-body');
  const chatInput = $('#chat-input');
  const responses = [
    { match: /session|start|begin|beginner|workout/i, answer: 'Start with Calf + Ankle Flow: five minutes, two simple movements, and a clear pace for getting familiar with the board.' },
    { match: /adjust|angle|degree|incline|set ?up|setup/i, answer: 'Place the board on a stable surface, set the incline that matches your session (anywhere from 10° to 50°), and confirm the support is locked before stepping on.' },
    { match: /spec|weight|capacity|size|dimension|material|steel|lb/i, answer: 'Each board is 14 × 7.5 × 1.25 in and about 7 lb. Heavy-duty steel construction, 10°–50° incline, 700 lb capacity, non-slip grip surface, and an independent dual-board design.' },
    { match: /store|storage|fold|carry|travel/i, answer: 'Both boards fold flat for storage, so they tuck away easily when the session is done.' },
    { match: /price|cost|buy|order|launch|available/i, answer: 'PECK is launching soon. Drop your email in the early-access form below and the team will send pricing and launch details.' },
    { match: /pain|injur|hurt|knee|achilles|doctor|medical/i, answer: 'I can not give medical advice. If you have pain or an injury, please check with a qualified professional before training. I can connect you with the PECK team for product questions.' }
  ];
  const fallback = 'I can help with product specs, setup, or finding a suitable training session. For anything outside approved PECK information, I can route you to the team.';

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function answerQuestion(question) {
    addMessage(question, 'user');
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = '<i></i><i></i><i></i>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    const hit = responses.find((r) => r.match.test(question));
    setTimeout(() => {
      typing.remove();
      addMessage(hit ? hit.answer : fallback, 'bot');
    }, 650);
  }
  $$('[data-question]').forEach((btn) => btn.addEventListener('click', () => answerQuestion(btn.dataset.question)));
  $('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;
    answerQuestion(q);
    chatInput.value = '';
  });

  /* ---------- Early access signup ---------- */
  const signupForm = $('#signup-form');
  const emailInput = $('#signup-email');
  const note = $('#signup-note');
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = 'Please enter a valid email address.';
      emailInput.focus();
      return;
    }
    if (SIGNUP_ENDPOINT) {
      try {
        note.textContent = 'Sending…';
        const res = await fetch(SIGNUP_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email, source: 'peck-landing' })
        });
        if (!res.ok) throw new Error(res.statusText);
        note.textContent = "You're on the list. We'll be in touch before launch.";
        signupForm.reset();
      } catch {
        note.textContent = 'Something went wrong. Please try again in a moment.';
      }
      return;
    }
    const subject = encodeURIComponent('PECK Fitness product information');
    const body = encodeURIComponent(`Hi PECK team,\n\nPlease send me product information and early access details.\n\nEmail: ${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    note.textContent = 'Opening your email app to send the request…';
  });
})();
