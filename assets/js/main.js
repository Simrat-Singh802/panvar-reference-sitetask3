/* ==========================================================================
   MAIN — bootstrap.

   Each module is initialised inside its own try/catch so a failure in one
   can never prevent the others from running. A broken accordion must not
   take the navigation down with it.
   ========================================================================== */

(function () {
  'use strict';

  function run(name, fn) {
    if (typeof fn !== 'function') return;
    try {
      fn();
    } catch (error) {
      /* Surfaced for developers; never blocks the rest of the page. */
      if (window.console && console.error) {
        console.error('[PK] ' + name + ' failed to initialise:', error);
      }
    }
  }

  function boot() {
    var PK = window.PK || {};

    run('nav',    PK.nav    && PK.nav.init);
    run('ui',     PK.ui     && PK.ui.init);
    run('reveal', PK.reveal && PK.reveal.init);
    run('forms',  PK.forms  && PK.forms.init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
