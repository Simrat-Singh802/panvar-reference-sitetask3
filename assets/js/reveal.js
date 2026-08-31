/* ==========================================================================
   REVEAL — one shared IntersectionObserver for all scroll animations.

   Bails out completely (revealing everything at once) when the visitor has
   asked for reduced motion, or when IntersectionObserver is unavailable.
   Elements are unobserved after their first reveal so the observer's work
   shrinks to nothing as the page is read.
   ========================================================================== */

(function () {
  'use strict';

  window.PK = window.PK || {};

  function revealAll(nodes) {
    Array.prototype.forEach.call(nodes, function (node) {
      node.setAttribute('data-revealed', '');
    });
  }

  function init() {
    var nodes = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    if (!nodes.length) return;

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      revealAll(nodes);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      });
    }, {
      /* Trigger slightly before the element reaches the viewport so the
         motion finishes as it arrives rather than starting late. */
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    Array.prototype.forEach.call(nodes, function (node) {
      observer.observe(node);
    });
  }

  window.PK.reveal = { init: init };
})();
