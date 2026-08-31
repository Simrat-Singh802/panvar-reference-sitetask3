/* ==========================================================================
   NAV — mobile drawer, active-link marking, sticky-header state.

   The active link is derived from location.pathname, so no page ever carries
   a hand-maintained class="active". That is the usual source of drift in
   hand-built static sites, and it is eliminated here.
   ========================================================================== */

(function () {
  'use strict';

  window.PK = window.PK || {};

  var FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  /* !! MUST MATCH the mobile-drawer media query in 04-components.css !!
     CSS says @media (max-width: 63.9375rem); if you change one, change both.
     They cannot be shared: custom properties do not work inside @media, and
     there is no build step to inject a value into both. */
  var MOBILE_MQ = '(max-width: 63.9375rem)';

  var drawer, toggle, scrim, lastFocused;

  /* --- Active link ------------------------------------------------------ */
  function markActive() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    /* Opening the folder itself resolves to index. */
    if (path === '' || path === '/') path = 'index.html';

    var links = document.querySelectorAll('[data-nav]');
    Array.prototype.forEach.call(links, function (link) {
      var target = link.getAttribute('href');
      if (!target) return;
      /* Compare filenames only; ignore hashes and query strings. */
      var file = target.split('/').pop().split('#')[0].split('?')[0];
      if (file === path) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* --- Drawer ----------------------------------------------------------- */
  function isOpen() {
    return drawer && drawer.hasAttribute('data-open');
  }

  function openDrawer() {
    /* Guard BOTH refs: init() can return early having assigned drawer but
       not toggle, and these are module-scoped. */
    if (!drawer || !toggle || isOpen()) return;
    lastFocused = document.activeElement;

    drawer.setAttribute('data-open', '');
    drawer.removeAttribute('inert');
    if (scrim) scrim.setAttribute('data-open', '');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.setAttribute('data-scroll-locked', '');

    var first = drawer.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function closeDrawer(returnFocus) {
    if (!drawer || !toggle || !isOpen()) return;

    drawer.removeAttribute('data-open');
    if (scrim) scrim.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.removeAttribute('data-scroll-locked');

    /* Only inert the drawer while it is the off-canvas panel. Above 64rem
       it is the desktop nav and must stay reachable. */
    if (isMobileLayout()) drawer.setAttribute('inert', '');

    if (returnFocus !== false && lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  function isMobileLayout() {
    return window.matchMedia(MOBILE_MQ).matches;
  }

  function trapFocus(event) {
    if (event.key !== 'Tab' || !isOpen()) return;

    /* The toggle sits OUTSIDE the drawer but shows the visible close (X)
       icon while open, so it must be inside the loop — otherwise a keyboard
       user can see the close button but can never reach it. */
    var nodes = Array.prototype.slice.call(drawer.querySelectorAll(FOCUSABLE));
    if (toggle) nodes.unshift(toggle);
    if (!nodes.length) return;

    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* --- Sticky header state ---------------------------------------------
     A sentinel + IntersectionObserver rather than a scroll listener: no
     per-frame work, and nothing to throttle.                              */
  function initStickyState() {
    var header = document.querySelector('[data-header]');
    var sentinel = document.querySelector('[data-header-sentinel]');
    if (!header || !sentinel || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          header.removeAttribute('data-stuck');
        } else {
          header.setAttribute('data-stuck', '');
        }
      });
    }).observe(sentinel);
  }

  /* --- Init ------------------------------------------------------------- */
  function init() {
    markActive();
    initStickyState();

    toggle = document.querySelector('[data-nav-toggle]');
    drawer = document.querySelector('[data-nav-drawer]');
    scrim = document.querySelector('[data-nav-scrim]');

    if (!toggle || !drawer) return;

    /* Start closed and inert on mobile. */
    if (isMobileLayout()) drawer.setAttribute('inert', '');
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', function () {
      if (isOpen()) closeDrawer(); else openDrawer();
    });

    if (scrim) {
      scrim.addEventListener('click', function () { closeDrawer(); });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        closeDrawer();
      }
      trapFocus(event);
    });

    /* Tapping a link navigates; close so the drawer isn't open on return
       via the back button. */
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeDrawer(false);
    });

    /* Crossing the desktop breakpoint must clear mobile-only state. */
    var mq = window.matchMedia(MOBILE_MQ);
    var onChange = function (event) {
      if (event.matches) {
        if (!isOpen()) drawer.setAttribute('inert', '');
      } else {
        closeDrawer(false);
        drawer.removeAttribute('inert');
        document.body.removeAttribute('data-scroll-locked');
      }
    };

    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else if (mq.addListener) {
      mq.addListener(onChange);
    }
  }

  window.PK.nav = { init: init };
})();
