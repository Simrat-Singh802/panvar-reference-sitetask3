/* ==========================================================================
   UI — contact stamping, accordion, product filter, year stamp.

   The contact stamper is what makes duplicated header/footer markup safe:
   the HTML declares intent ([data-contact="phone"]) and the values come from
   site.config.js, so a phone number is edited in exactly one place.
   ========================================================================== */

(function () {
  'use strict';

  window.PK = window.PK || {};

  var cfg = function () { return (window.PK && window.PK.config) || null; };

  /* --------------------------------------------------------------------
     Contact stamping
     -------------------------------------------------------------------- */
  function stampContacts() {
    var config = cfg();
    if (!config) return;

    /* The markup already carries a real tel: link as its fallback, so if the
       config is missing we leave that markup alone rather than blanking it. */
    var phones = config.phones || [];
    var primary = phones.filter(function (p) { return p.primary; })[0] || phones[0];

    /* Phone: tel: link + display text */
    if (primary) {
      each('[data-contact="phone"]', function (el) {
        el.textContent = primary.display;
        if (el.tagName === 'A') el.setAttribute('href', 'tel:' + primary.dial);
      });

      each('[data-contact="phone-link"]', function (el) {
        el.setAttribute('href', 'tel:' + primary.dial);
      });
    }

    /* Every phone number, rendered as a list */
    if (phones.length) each('[data-contact="phone-list"]', function (el) {
      el.innerHTML = '';
      phones.forEach(function (phone) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = 'tel:' + phone.dial;
        a.textContent = phone.display;
        a.className = 'contact-tile__value';
        li.appendChild(a);
        el.appendChild(li);
      });
    });

    /* WhatsApp */
    var whatsapp = config.whatsapp || {};
    if (whatsapp.dial) each('[data-contact="whatsapp"]', function (el) {
      el.setAttribute('href', 'https://wa.me/' + whatsapp.dial);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    /* Email — renders a TODO chip while unconfirmed rather than a fake
       address. The reference site publishes "email@example.com"; we will
       not repeat that.
       A missing config key is treated as "not confirmed", never as a crash:
       stampContacts runs first in init(), so an exception here would also
       cost us the year stamp, accordion and filter. */
    var email = config.email || {};
    each('[data-contact="email"]', function (el) {
      if (email.todo || !email.value) {
        el.replaceWith(todoChip('Email address to be confirmed'));
      } else {
        el.textContent = email.value;
        if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + email.value);
      }
    });

    /* Address — city/state are verified; street is not. */
    var company = config.company || {};
    var street = company.street || {};

    each('[data-contact="locality"]', function (el) {
      if (company.locality) el.textContent = company.locality;
    });

    each('[data-contact="street"]', function (el) {
      if (street.todo || !street.value) {
        el.replaceWith(todoChip('Street address to be confirmed'));
      } else {
        el.textContent = street.value;
      }
    });

    /* External links.
       The real URL is already in the markup so these work with JS disabled;
       this re-stamps them so site.config.js stays the single place to edit
       a URL. */
    var links = config.links || {};
    each('[data-link]', function (el) {
      var url = links[el.getAttribute('data-link')];
      if (url) {
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    });
  }

  function todoChip(label) {
    var span = document.createElement('span');
    span.className = 'badge badge--todo';
    span.textContent = label;
    return span;
  }

  /* --------------------------------------------------------------------
     Year stamp — keeps the footer copyright current forever
     -------------------------------------------------------------------- */
  function stampYear() {
    var year = String(new Date().getFullYear());
    each('[data-year]', function (el) { el.textContent = year; });
  }

  /* --------------------------------------------------------------------
     Accordion
     -------------------------------------------------------------------- */
  function initAccordion() {
    each('[data-accordion-trigger]', function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;

      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', function () {
        var open = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (open) {
          panel.removeAttribute('data-open');
        } else {
          panel.setAttribute('data-open', '');
        }
      });
    });
  }

  /* --------------------------------------------------------------------
     Helpers
     -------------------------------------------------------------------- */
  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  function init() {
    stampContacts();
    stampYear();
    initAccordion();
  }

  window.PK.ui = { init: init };
})();
