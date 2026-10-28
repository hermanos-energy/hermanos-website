// Mobile menu toggle
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');

toggle.addEventListener('click', () => {
  const open = header.dataset.menu !== 'open';
  header.dataset.menu = open ? 'open' : 'closed';
  toggle.setAttribute('aria-expanded', String(open));
  // Labels come from the translation files via data attributes on the header
  toggle.setAttribute('aria-label', open ? header.dataset.closeLabel : header.dataset.openLabel);
});

// FAQ: each question opens and closes independently
document.querySelectorAll('.faq-item__question').forEach((question) => {
  question.addEventListener('click', () => {
    const open = question.parentElement.classList.toggle('is-open');
    question.setAttribute('aria-expanded', String(open));
  });
});

// Tabs: each button shows its own panel (aria-controls) and hides the others in the same tab group
document.querySelectorAll('.tabs').forEach((tabs) => {
  const buttons = tabs.querySelectorAll('.tabs__button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((other) => {
        const selected = other === button;
        other.setAttribute('aria-selected', String(selected));
        document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
      });
    });
  });
});

// Slider — port of the AutoPauseSlider Framer component: autoplay (data-interval in ms), loop, arrows, dots,
// keyboard arrows. Autoplay pauses while any of these is true: hovered, pressed/touched/focused inside,
// a <video> in it is playing, or the page/window is hidden or not focused (which also covers clicking into a
// YouTube iframe, since that moves focus out of the window).
document.querySelectorAll('.slider').forEach((slider) => {
  const track = slider.querySelector('.slider__track');
  const slides = track.children;
  const dots = slider.querySelector('.slider__dots');
  const interval = Number(slider.dataset.interval) || 8000;
  const reasons = { hover: false, interaction: false, video: false, visibility: false };
  let current = 0;
  let timer = null;

  for (let i = 0; i < slides.length; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider__dot';
    dot.setAttribute('aria-label', `${slider.dataset.dotLabel} ${i + 1}`);
    dot.addEventListener('click', () => show(i));
    dots.append(dot);
  }

  function show(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(${-100 * current}%)`;
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    restartTimer();
  }

  // Autoplay runs only while nothing is pausing it; any slide change restarts the countdown.
  function restartTimer() {
    clearInterval(timer);
    timer = null;
    const paused = Object.values(reasons).some(Boolean);
    slider.setAttribute('aria-live', paused ? 'polite' : 'off');
    if (!paused && slides.length > 1) timer = setInterval(() => show(current + 1), interval);
  }

  function setReason(reason, value) {
    if (reasons[reason] === value) return;
    reasons[reason] = value;
    restartTimer();
  }

  // Arrows and keyboard
  slider.querySelector('.slider__button--prev').addEventListener('click', () => show(current - 1));
  slider.querySelector('.slider__button--next').addEventListener('click', () => show(current + 1));
  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(current + 1);
    if (event.key === 'ArrowLeft') show(current - 1);
  });

  // Hover
  slider.addEventListener('mouseenter', () => setReason('hover', true));
  slider.addEventListener('mouseleave', () => setReason('hover', false));

  // Interaction: press, focus and touch (with a short delay so a tap can become a click)
  let activeTouches = 0;
  let touchTimeout = null;
  const resumeIfIdle = () => { if (activeTouches === 0) setReason('interaction', false); };
  slider.addEventListener('pointerdown', () => setReason('interaction', true));
  slider.addEventListener('pointerup', () => setReason('interaction', false));
  slider.addEventListener('pointercancel', () => setReason('interaction', false));
  slider.addEventListener('focusin', () => setReason('interaction', true));
  slider.addEventListener('focusout', () => setReason('interaction', false));
  slider.addEventListener('touchstart', () => {
    activeTouches += 1;
    setReason('interaction', true);
    clearTimeout(touchTimeout);
  }, { passive: true });
  slider.addEventListener('touchend', () => {
    activeTouches = Math.max(0, activeTouches - 1);
    touchTimeout = setTimeout(resumeIfIdle, 120);
  });
  slider.addEventListener('touchcancel', () => {
    activeTouches = 0;
    touchTimeout = setTimeout(resumeIfIdle, 120);
  });

  // Videos: muted by default; playing pauses the slider
  slider.querySelectorAll('video').forEach((video) => {
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('play', () => setReason('video', true));
    video.addEventListener('pause', () => setReason('video', false));
    video.addEventListener('ended', () => setReason('video', false));
  });

  // Page visibility and window focus (incl. iOS pageshow/pagehide)
  document.addEventListener('visibilitychange', () => setReason('visibility', document.hidden));
  window.addEventListener('blur', () => setReason('visibility', true));
  window.addEventListener('focus', () => setReason('visibility', false));
  window.addEventListener('pagehide', () => setReason('visibility', true));
  window.addEventListener('pageshow', () => setReason('visibility', false));

  show(0);
});

// YouTube click-to-play: swap the thumbnail button for the (privacy-enhanced) player and start it
document.querySelectorAll('.video-facade').forEach((facade) => {
  facade.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.className = facade.className.replace('video-facade', '').trim();
    iframe.src = `https://www.youtube-nocookie.com/embed/${facade.dataset.youtube}?autoplay=1`;
    iframe.title = facade.dataset.title;
    iframe.width = '768';
    iframe.height = '400';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    facade.replaceWith(iframe);
    iframe.focus();
  });
});

// Appear animation: reveal a block once its top passes 60% of the viewport height
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }
}, { rootMargin: '0px 0px -40% 0px' });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
