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
const CONTACT_EMAIL = 'hello@peckfitness.ai';

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
  let isScrolled = false;
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY;
    if (!isScrolled && y > 35) {
      isScrolled = true;
      header.classList.add('scrolled');
    } else if (isScrolled && y < 15) {
      isScrolled = false;
      header.classList.remove('scrolled');
    }
  };
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
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === `#${entry.target.id}` || href === `/#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      try {
        const target = $(href);
        if (target) sectionObserver.observe(target);
      } catch {
        // ignore invalid selectors
      }
    }
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

  if (startButton && timerLabel && bar) {
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
  }

  /* ---------- App preview: breathing mode ---------- */
  const breathPanel = $('#breath-panel');
  const breathToggle = $('#open-breath');
  const orb = $('#breath-orb');
  let breathId;
  if (breathToggle && breathPanel && orb) {
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
  }

  /* ---------- Assistant chat (scripted demo) ----------
   * Knowledge base sourced from "PECK Fitness Product and Customer Support
   * Guidance" (draft, 8 Oct 2026). Rules are checked IN ORDER and the first
   * match wins, so safety / medical / escalation rules must stay at the top.
   * Items marked TBD in the guidance (shipping, returns, warranty, pricing,
   * load limit, dimensions, app access) deliberately route to the team
   * instead of stating unconfirmed facts.
   */
  const chatBody = $('#chat-body');
  const chatInput = $('#chat-input');
  const SUPPORT = `the PECK support team (${CONTACT_EMAIL})`;
  const MEDICAL = "I can explain the product and its general fitness routines, but I can't assess an injury or recommend treatment. Please ask a qualified healthcare professional whether this exercise is suitable for you.";
  const PRICE = 'Please check the product page for current pricing, availability and delivery estimates.';
  const responses = [
    /* --- 1. Safety & escalation (always first) --- */
    { match: /\b(broke|broken|crack|fail|collaps|snap|loose|wobbl|bent|peel|moves? unexpected)/i,
      answer: `Please stop using the board right away. Don't keep training on it or try to repair load-bearing parts yourself. Contact ${SUPPORT} with your order number and photos so a person can review it.` },
    { match: /\b(damag|arrived|dent|missing part|sharp edge)/i,
      answer: `If a board arrived damaged, please don't use it. Contact the support channel for where you ordered (Amazon order page or ${SUPPORT}) with your order number and photos of the damage.` },
    { match: /\b(exceed|over ?load|more than the (limit|max)|modif|hack|bypass|remove the lock|lock pin|drill)/i,
      answer: "I can't recommend exceeding the load limit or modifying the boards, locks or supports. Please use them only as designed and within the confirmed load limit, including any external weights." },
    { match: /\b(push through|keep going.*pain|through the pain|numb|dizz|tingl)/i,
      answer: 'Please stop the exercise. Pain, numbness, dizziness or instability are signs to stop, not push through. If it continues, check in with a qualified healthcare professional.' },

    /* --- 2. Medical boundaries --- */
    { match: /\b(surgery|post-?op|rehab|physio|physical therap|medication|medicine|treatment|plantar|fasciitis|tendon|sprain|arthritis|diagnos|condition|cure\b|heal(s|ing|ed)?\b|fix my)/i,
      answer: `${MEDICAL} The boards are designed for general fitness stretching, mobility and strength work, not as a replacement for professional care.` },
    { match: /\b(pain|injur|hurt|sore|knee|achilles|ankle problem|back problem|doctor|medical|symptom)/i, answer: MEDICAL },
    { match: /\b(guarantee|results? in|how (long|fast|soon).*(result|flexib|muscle)|will i (get|see|be))/i,
      answer: 'Results vary from person to person, so no specific outcome or timeline is guaranteed. Consistent practice at your own pace, starting at the lowest comfortable angle, is the best way to build a routine.' },

    /* --- 3. Commercial items (TBD in guidance → no invented commitments) --- */
    { match: /\b(refund|return|exchange|send (it )?back)/i,
      answer: `For Amazon orders, please use the return options shown on your Amazon order. For website orders, the return policy is being finalized; please contact ${SUPPORT} and a person will help.` },
    { match: /\b(warranty|guarantee.*(defect|board)|replacement part|spare part|replace (the|a) (pad|grip|hinge|part))/i,
      answer: `Warranty and replacement-part details are being finalized. Please contact ${SUPPORT}. Floor pads and grip replacements may be available; hinges, supports and locks should always be reviewed by our team rather than self-repaired.` },
    { match: /\b(ship|deliver|tracking|track my|duties|customs|import|canada|usa|united states|arrive)/i,
      answer: `Shipping options and delivery estimates are shown at checkout. For Amazon orders, check your Amazon order page. For anything else about delivery or tracking, contact ${SUPPORT}.` },
    { match: /\b(price|cost|how much|buy|purchase|order|launch|available|in stock|stock|discount|promo|coupon|links?\b|amazon|asin)/i,
      answer: `${PRICE} Before launch, you can drop your email in the early-access form below and the team will share details.` },
    { match: /\b(apps?\b|download|program|subscription|membership)/i,
      answer: `The PECK training app pairs the boards with guided sessions. Access terms (included, free or subscription) are being confirmed, so please check the product page or contact ${SUPPORT}.` },

    /* --- 4. Product, setup, care --- */
    { match: /\b(weights|dumbbell|kettlebell|barbell|weighted|vest)/i,
      answer: 'Weights are only for approved exercises, within the confirmed load limit and with stable foot placement. Start without added weight until you are comfortable on the boards.' },
    { match: /\b(handle|band|anchor|hold on|balance)/i,
      answer: 'The handle on the high end is for stretching, mobility movements and band anchoring (approved for the revised design). Please don\'t use it as a standing balance support; keep a wall or fixed support nearby instead.' },
    { match: /\b(clean|wash|wipe|soap|sanitiz|disinfect|bleach|dishwasher)/i,
      answer: 'Wipe the aluminum with a soft cloth lightly dampened with water and mild soap, then dry thoroughly. Clean the grip gently without soaking it. Avoid abrasive pads, bleach, strong acidic or alkaline cleaners, solvents, pressure washing and the dishwasher.' },
    { match: /\b(inspect|maintain|maintenance|tighten|lubric|oil|grease)/i,
      answer: 'Before each use, check the supports, hinges, fasteners, grip surface and floor pads. Stop if anything loosens, cracks, peels or moves unexpectedly. Don\'t modify the boards or lubricate the grip; follow manufacturer-approved instructions for any tightening or parts.' },
    { match: /\b(store|storage|fold|carry|travel|put away)/i,
      answer: 'Remove all weight before folding and keep fingers clear of the hinges and moving supports. Store the boards folded in a dry indoor place, secured so they can\'t open or fall.' },
    { match: /\b(unbox|unpack|in the box|package|packaging|what comes|included|contents)/i,
      answer: 'The set includes a pair of PECK Fitness adjustable slant boards. When unpacking, remove all packaging and check both boards for shipping damage, loose parts, sharp edges or damaged grip. Don\'t use a damaged board.' },
    { match: /\b(both boards|pair|two boards|stance|foot position|toes|heels|which way|orientation)/i,
      answer: 'For two-board exercises, set a comfortable stance width and use matching angles unless the exercise says otherwise, keeping each foot fully supported. Follow the demo: toes toward the high end for calf stretches, heels toward the high end for squat exercises.' },
    { match: /\b(adjust|angle|degree|incline|set ?up|setup|setting|steep)/i,
      answer: 'Place the boards on a firm, level, dry surface. Adjust each board while it is unloaded and make sure the support is fully engaged before stepping on. Never change the angle while standing on it. Inclines run 10° to 50°; start at the lowest comfortable setting and increase gradually.' },
    { match: /\b(capacity|max(imum)? (load|weight)|how much weight|weight limit|hold|support (my|up to))/i,
      answer: `The tested load limit is being confirmed (including whether it applies per board or per set), so I can't quote a number yet. Please check the product page or contact ${SUPPORT}.` },
    { match: /\b(spec|size|dimension|how big|weigh|material|aluminum|aluminium|steel|metal|made of)/i,
      answer: 'The PECK Dual Slant Board Set is two adjustable aluminum boards with incline settings from 10° to 50° and a textured grip surface. Final dimensions and weight are being verified, so please check the product page for confirmed specs.' },
    { match: /\b(made in|manufactur|where.*(made|from)|origin|china|canad)/i,
      answer: 'PECK Fitness boards are manufactured in China.' },
    { match: /\b(slip|grip|outdoor|outside|wet|carpet|floor)/i,
      answer: 'The boards have a textured grip surface and protective floor pads. Use them on a firm, level, dry surface with a wall or fixed support nearby when needed. Indoor/outdoor suitability is still being confirmed.' },
    { match: /\b(kids?\b|child|children|ages?\b|teen)/i,
      answer: 'Please keep children away from the adjustment mechanisms. The intended user age is being confirmed; for now, children should not use the boards unsupervised.' },
    { match: /\b(jump|bounce|plyo|stack|step|elevat)/i,
      answer: "Please don't jump, bounce, stack the boards or use them on elevated surfaces. Controlled movements on a stable floor only." },
    { match: /\b(beginner|new to|never used|first time|easy)/i,
      answer: 'Beginners are welcome. Start at the lowest comfortable angle with the beginner routines, use a wall or fixed support where instructed, and progress gradually. A steeper incline isn\'t required to make progress.' },
    { match: /\b(session|start|begin|workout|routine|exercise|stretch|mobility|strength|squat|calf)/i,
      answer: 'Start with Calf + Ankle Flow: five minutes, two simple movements, and a clear pace for getting familiar with the boards. The set is designed for general fitness stretching, mobility work and selected strength exercises.' },
    { match: /\b(who\b|about|brand|company|story|peck)/i,
      answer: 'PECK Fitness creates practical fitness equipment for stretching, mobility and strength training, with an emphasis on straightforward use and progressive exercise.' },
    { match: /\b(human|person|agent|contact|support|help|email|talk)/i,
      answer: `You can reach ${SUPPORT}. Include your order number if your question is about an order.` }
  ];
  const fallback = `I can help with setup, care, safety, product details or finding a session. For anything outside approved PECK information, please contact ${SUPPORT}.`;

  function formatMarkdown(rawText) {
    if (!rawText) return '';
    let text = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Separate inline list items ('1. ', '2. ') preceded by colon or punctuation
    text = text.replace(/([:.\?!])\s+(\d+\.\s+)/g, '$1\n$2');
    // Separate trailing bold warnings into distinct blocks
    text = text.replace(/([a-zA-Z\)])[.?!]\s+(\*\*[^*]+\*\*)/g, '$1.\n\n$2');

    // Inline formatting
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    text = text.replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
    text = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');

    const lines = text.split(/\r?\n/);
    const blocks = [];
    let currentList = null;

    function flushList() {
      if (currentList) {
        const itemsHtml = currentList.items.map((it) => `<li>${it}</li>`).join('');
        blocks.push(`<${currentList.type}>${itemsHtml}</${currentList.type}>`);
        currentList = null;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        flushList();
        continue;
      }
      const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
      const ulMatch = line.match(/^[-*•]\s+(.+)$/);

      if (olMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(olMatch[2]);
      } else if (ulMatch) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(ulMatch[1]);
      } else {
        flushList();
        blocks.push(`<p>${line}</p>`);
      }
    }
    flushList();
    return blocks.length ? blocks.join('') : `<p>${text}</p>`;
  }

  const floatingDrawer = $('#chat-floating-drawer');
  const floatingTrigger = $('#chat-widget-trigger');
  const floatingClose = $('#chat-widget-close');
  const floatingBody = $('#chat-floating-body');
  const floatingForm = $('#chat-floating-form');
  const floatingInput = $('#chat-floating-input');

  function addMessage(text, type) {
    const targets = [chatBody, floatingBody].filter(Boolean);
    targets.forEach((container) => {
      const msg = document.createElement('div');
      msg.className = `chat-message ${type}`;
      if (type === 'bot') {
        msg.innerHTML = formatMarkdown(text);
      } else {
        msg.textContent = text;
      }
      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;
    });
  }
  const chatHistory = [];

  async function getAssistantReply(question) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: chatHistory }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) return data.reply;
      }
    } catch {
      // Serverless endpoint not present or network error: fall back smoothly
    }
    const hit = responses.find((r) => r.match.test(question));
    return hit ? hit.answer : fallback;
  }

  // Developer/testing reset hook: visit ?reset=1 or run window.resetPeckFitness()
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reset')) {
      localStorage.removeItem('peck_verified_email');
      localStorage.removeItem('peck_verified_token');
      localStorage.removeItem('peck_chat_count');
      urlParams.delete('reset');
      const newSearch = urlParams.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
  } catch {}

  window.resetPeckFitness = () => {
    localStorage.removeItem('peck_verified_email');
    localStorage.removeItem('peck_verified_token');
    localStorage.removeItem('peck_chat_count');
    window.location.reload();
  };

  const FREE_CHAT_LIMIT = 3;
  let authPendingToken = null;
  let authPendingEmail = null;

  function isVerified() {
    return Boolean(localStorage.getItem('peck_verified_email'));
  }

  function getChatCount() {
    return parseInt(localStorage.getItem('peck_chat_count') || '0', 10);
  }

  function incrementChatCount() {
    const next = getChatCount() + 1;
    localStorage.setItem('peck_chat_count', String(next));
    return next;
  }

  function setVerified(email, token) {
    localStorage.setItem('peck_verified_email', email);
    if (token) localStorage.setItem('peck_verified_token', token);
    $$('.chat-unlock-card').forEach((el) => el.remove());

    const targets = [chatBody, floatingBody].filter(Boolean);
    targets.forEach((container) => {
      const banner = document.createElement('div');
      banner.className = 'chat-verified-banner';
      banner.innerHTML = `✓ Email confirmed (${email}). Unlimited assistant chat unlocked! <button type="button" class="chat-reset-test-btn" style="float:right; background:rgba(0,0,0,0.3); border:1px solid #7d8572; color:#dce4c9; font-size:.65rem; padding:2px 7px; cursor:pointer; border-radius:3px;">Reset test</button>`;
      const resetBtn = banner.querySelector('.chat-reset-test-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          localStorage.removeItem('peck_verified_email');
          localStorage.removeItem('peck_verified_token');
          localStorage.removeItem('peck_chat_count');
          window.location.reload();
        });
      }
      container.appendChild(banner);
      container.scrollTop = container.scrollHeight;
    });

    if (chatInput) {
      chatInput.disabled = false;
      chatInput.placeholder = 'Ask anything about the board or training...';
    }
    if ($('#chat-form button')) $('#chat-form button').disabled = false;
    if (floatingInput) {
      floatingInput.disabled = false;
      floatingInput.placeholder = 'Ask PECK Assistant...';
    }
    if (floatingForm && floatingForm.querySelector('button')) {
      floatingForm.querySelector('button').disabled = false;
    }

    const note = $('#signup-note');
    if (note) {
      note.textContent = `✓ ${email} is confirmed and registered for early launch access!`;
    }
  }

  function showUnlockCard(prefillEmail = '') {
    if (isVerified()) return;

    if (chatInput) {
      chatInput.disabled = true;
      chatInput.placeholder = 'Sign up with email to unlock unlimited questions...';
    }
    if ($('#chat-form button')) $('#chat-form button').disabled = true;
    if (floatingInput) {
      floatingInput.disabled = true;
      floatingInput.placeholder = 'Verify email to unlock...';
    }
    if (floatingForm && floatingForm.querySelector('button')) {
      floatingForm.querySelector('button').disabled = true;
    }

    const targets = [chatBody, floatingBody].filter(Boolean);
    targets.forEach((container) => {
      if (container.querySelector('.chat-unlock-card')) return;
      const card = document.createElement('div');
      card.className = 'chat-unlock-card';
      card.innerHTML = `
        <div class="chat-unlock-head">
          <span class="chat-unlock-badge">Preview Limit (${FREE_CHAT_LIMIT}/${FREE_CHAT_LIMIT} Free Questions)</span>
          <strong>Unlock Unlimited PECK Assistant</strong>
          <p>Confirm your email to keep chatting without limits, get early launch pricing, and receive product updates.</p>
        </div>
        <div class="chat-unlock-step step-email">
          <div class="chat-unlock-input-row">
            <input type="email" class="unlock-email" placeholder="you@email.com" value="${prefillEmail || ''}" aria-label="Your email" />
            <button type="button" class="unlock-send-btn">Get Code</button>
          </div>
          <p class="chat-unlock-status status-email"></p>
        </div>
        <div class="chat-unlock-step step-otp" style="display:none;">
          <p class="chat-unlock-sent-text sent-label">Verification code sent! Enter the 6-digit code:</p>
          <div class="chat-unlock-input-row">
            <input type="text" class="unlock-code" placeholder="6-digit code" maxlength="6" inputmode="numeric" aria-label="6-digit verification code" />
            <button type="button" class="unlock-verify-btn">Verify</button>
          </div>
          <p class="chat-unlock-status status-otp"></p>
          <button type="button" class="chat-unlock-resend">Didn't receive it? Resend code</button>
        </div>
      `;

      container.appendChild(card);
      container.scrollTop = container.scrollHeight;

      const emailField = card.querySelector('.unlock-email');
      const sendBtn = card.querySelector('.unlock-send-btn');
      const statusMsg = card.querySelector('.status-email');
      const stepEmail = card.querySelector('.step-email');
      const stepOtp = card.querySelector('.step-otp');
      const codeField = card.querySelector('.unlock-code');
      const verifyBtn = card.querySelector('.unlock-verify-btn');
      const otpStatus = card.querySelector('.status-otp');
      const resendBtn = card.querySelector('.chat-unlock-resend');

      async function sendCode() {
        const email = emailField.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          statusMsg.className = 'chat-unlock-status error';
          statusMsg.textContent = 'Please enter a valid email address.';
          return;
        }

        sendBtn.disabled = true;
        statusMsg.className = 'chat-unlock-status';
        statusMsg.textContent = 'Sending verification code…';

        try {
          const res = await fetch('/api/auth/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send-code', email })
          });
          const data = await res.json();
          if (res.ok && data.ok) {
            authPendingToken = data.token;
            authPendingEmail = email;
            stepEmail.style.display = 'none';
            stepOtp.style.display = 'block';
            card.querySelector('.sent-label').textContent = `Code sent to ${email}! Enter the 6-digit code below:`;
            codeField.focus();
          } else {
            statusMsg.className = 'chat-unlock-status error';
            statusMsg.textContent = data.error || 'Failed to send verification code.';
            sendBtn.disabled = false;
          }
        } catch {
          statusMsg.className = 'chat-unlock-status error';
          statusMsg.textContent = 'Network error connecting to verification service.';
          sendBtn.disabled = false;
        }
      }

      sendBtn.addEventListener('click', sendCode);
      emailField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          sendCode();
        }
      });

      async function verifyCode() {
        const code = codeField.value.trim();
        if (!code || code.length < 6) {
          otpStatus.className = 'chat-unlock-status error';
          otpStatus.textContent = 'Please enter the 6-digit code.';
          return;
        }

        verifyBtn.disabled = true;
        otpStatus.className = 'chat-unlock-status';
        otpStatus.textContent = 'Verifying…';

        try {
          const res = await fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'verify-code',
              email: authPendingEmail,
              code,
              token: authPendingToken
            })
          });
          const data = await res.json();
          if (res.ok && data.ok) {
            setVerified(authPendingEmail, data.verifiedToken);
          } else {
            otpStatus.className = 'chat-unlock-status error';
            otpStatus.textContent = data.error || 'Incorrect code. Please try again.';
            verifyBtn.disabled = false;
          }
        } catch {
          otpStatus.className = 'chat-unlock-status error';
          otpStatus.textContent = 'Network error verifying code.';
          verifyBtn.disabled = false;
        }
      }

      verifyBtn.addEventListener('click', verifyCode);
      codeField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          verifyCode();
        }
      });

      resendBtn.addEventListener('click', () => {
        stepOtp.style.display = 'none';
        stepEmail.style.display = 'block';
        sendBtn.disabled = false;
        statusMsg.textContent = '';
        emailField.focus();
      });
    });
  }

  // Check limit on initialization
  if (!isVerified() && getChatCount() >= FREE_CHAT_LIMIT) {
    showUnlockCard();
  }

  async function answerQuestion(question) {
    if (!isVerified() && getChatCount() >= FREE_CHAT_LIMIT) {
      showUnlockCard();
      return;
    }

    addMessage(question, 'user');
    chatHistory.push({ role: 'user', text: question });

    const typingIndicators = [];
    [chatBody, floatingBody].filter(Boolean).forEach((container) => {
      const typing = document.createElement('div');
      typing.className = 'chat-typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      container.appendChild(typing);
      container.scrollTop = container.scrollHeight;
      typingIndicators.push(typing);
    });

    const reply = await getAssistantReply(question);
    typingIndicators.forEach((t) => t.remove());
    addMessage(reply, 'bot');
    chatHistory.push({ role: 'model', text: reply });

    if (!isVerified()) {
      const current = incrementChatCount();
      if (current >= FREE_CHAT_LIMIT) {
        setTimeout(() => showUnlockCard(), 400);
      }
    }
  }

  $$('[data-question]').forEach((btn) => btn.addEventListener('click', () => answerQuestion(btn.dataset.question)));
  if ($('#chat-form')) {
    $('#chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!chatInput) return;
      const q = chatInput.value.trim();
      if (!q) return;
      answerQuestion(q);
      chatInput.value = '';
    });
  }

  /* ---------- Floating Widget Trigger & Drawer ---------- */
  if (floatingTrigger && floatingDrawer) {
    floatingTrigger.addEventListener('click', () => {
      const isHidden = floatingDrawer.hasAttribute('hidden');
      if (isHidden) {
        floatingDrawer.removeAttribute('hidden');
        floatingTrigger.setAttribute('aria-expanded', 'true');
        if (floatingInput && !floatingInput.disabled) floatingInput.focus();
        if (floatingBody) floatingBody.scrollTop = floatingBody.scrollHeight;
      } else {
        floatingDrawer.setAttribute('hidden', '');
        floatingTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
  if (floatingClose && floatingDrawer) {
    floatingClose.addEventListener('click', () => {
      floatingDrawer.setAttribute('hidden', '');
      if (floatingTrigger) floatingTrigger.setAttribute('aria-expanded', 'false');
    });
  }
  if (floatingForm && floatingInput) {
    floatingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = floatingInput.value.trim();
      if (!q) return;
      answerQuestion(q);
      floatingInput.value = '';
    });
  }
  $$('[data-floating-q]').forEach((btn) => {
    btn.addEventListener('click', () => answerQuestion(btn.dataset.floatingQ));
  });

  const launchFloatingBtn = $('#launch-floating-chat');
  if (launchFloatingBtn && floatingDrawer && floatingTrigger) {
    launchFloatingBtn.addEventListener('click', () => {
      floatingDrawer.removeAttribute('hidden');
      floatingTrigger.setAttribute('aria-expanded', 'true');
      if (floatingInput && !floatingInput.disabled) floatingInput.focus();
      if (floatingBody) floatingBody.scrollTop = floatingBody.scrollHeight;
    });
  }

  /* ---------- Early access signup ---------- */
  const signupForm = $('#signup-form');
  const emailInput = $('#signup-email');
  const note = $('#signup-note');

  if (isVerified()) {
    const saved = localStorage.getItem('peck_verified_email');
    if (saved && note) {
      note.textContent = `✓ ${saved} is confirmed and registered for early launch access!`;
    }
  }

  if (signupForm && emailInput) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (note) note.textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }

      if (isVerified() && localStorage.getItem('peck_verified_email') === email) {
        if (note) note.textContent = `✓ You are already confirmed on the early-access list!`;
        return;
      }

      // Scroll to assistant and trigger the verification card with their email prefilled
      const assistantSec = $('#assistant');
      if (assistantSec) assistantSec.scrollIntoView({ behavior: 'smooth' });
      showUnlockCard(email);
      if (note) note.textContent = `Verification requested for ${email}. Check the assistant box to confirm your code!`;
    });
  }
})();
