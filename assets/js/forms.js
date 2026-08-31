/* ==========================================================================
   FORMS — bulk enquiry validation and handoff.

   There is no backend, so a validated submission is handed off to WhatsApp
   (prefilled deep link) with a mailto: fallback. Both are pure client-side
   and work on any static host.

   TO SWITCH TO A REAL ENDPOINT LATER: give the <form> an action= and
   method="post" and delete the handoff branch in submit(). The validation
   layer below is endpoint-agnostic and can stay as-is.
   ========================================================================== */

(function () {
  'use strict';

  window.PK = window.PK || {};

  var RULES = {
    name:    { required: true,  label: 'Your name' },
    company: { required: true,  label: 'Company name' },
    phone:   { required: true,  label: 'Phone number', pattern: /^[\d\s+()-]{7,20}$/,
               message: 'Enter a valid phone number.' },
    email:   { required: false, label: 'Email',
               pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
               message: 'Enter a valid email address.' },
    brand:   { required: true,  label: 'Product interest' },
    quantity:{ required: false, label: 'Approximate quantity' },
    message: { required: true,  label: 'Enquiry details' }
  };

  function init() {
    var form = document.querySelector('[data-enquiry-form]');
    if (!form) return;

    var summary = form.querySelector('[data-error-summary]');
    var status = form.querySelector('[data-form-status]');

    /* Let our own messages run instead of the browser's native bubbles,
       while keeping the required attributes for no-JS submission. */
    form.setAttribute('novalidate', '');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submit(form, summary, status);
    });

    /* Clear a field's error as soon as the visitor fixes it. */
    Object.keys(RULES).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(form, name);
        }
      });
      field.addEventListener('blur', function () {
        if (field.value.trim()) validateField(form, name);
      });
    });
  }

  /* --------------------------------------------------------------------
     Validation
     -------------------------------------------------------------------- */
  function validateField(form, name) {
    var rule = RULES[name];
    var field = form.elements[name];
    if (!rule || !field) return null;

    var value = (field.value || '').trim();
    var error = null;

    if (rule.required && !value) {
      error = rule.label + ' is required.';
    } else if (value && rule.pattern && !rule.pattern.test(value)) {
      error = rule.message || ('Enter a valid ' + rule.label.toLowerCase() + '.');
    }

    setFieldError(form, name, error);
    return error;
  }

  function setFieldError(form, name, error) {
    var field = form.elements[name];
    var errorEl = form.querySelector('[data-error-for="' + name + '"]');

    /* validateField guards this too; repeat it here because setFieldError is
       independently reachable and must not throw on a renamed field. */
    if (!field) return;

    if (error) {
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = error;
    } else {
      field.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateAll(form) {
    var errors = [];
    Object.keys(RULES).forEach(function (name) {
      var error = validateField(form, name);
      if (error) errors.push({ name: name, message: error });
    });
    return errors;
  }

  /* --------------------------------------------------------------------
     Submit
     -------------------------------------------------------------------- */
  function submit(form, summary, status) {
    /* Honeypot: a real visitor never sees this field, so a filled value
       means a bot. Fail silently rather than telling it why. */
    var honey = form.elements.website;
    if (honey && honey.value) return;

    var errors = validateAll(form);

    if (errors.length) {
      showSummary(summary, errors, form);
      return;
    }

    if (summary) {
      summary.hidden = true;
      summary.innerHTML = '';
    }

    var data = collect(form);
    var config = window.PK.config;

    var text = buildMessage(data);
    var waUrl = 'https://wa.me/' + config.whatsapp.dial +
                '?text=' + encodeURIComponent(text);

    window.open(waUrl, '_blank', 'noopener');

    if (status) {
      status.innerHTML = '';

      var p = document.createElement('p');
      p.textContent = 'Thanks, ' + data.name + '. Your enquiry has been prepared ' +
                      'in WhatsApp — press send there to deliver it. ' +
                      'If WhatsApp did not open, use the button below.';
      status.appendChild(p);

      var retry = document.createElement('a');
      retry.className = 'btn btn--whatsapp u-mt-4';
      retry.href = waUrl;
      retry.target = '_blank';
      retry.rel = 'noopener';
      retry.textContent = 'Open WhatsApp enquiry';
      status.appendChild(retry);

      /* Email fallback only once a real address exists. */
      if (config.email && !config.email.todo && config.email.value) {
        var mail = document.createElement('a');
        mail.className = 'btn btn--secondary u-mt-4';
        mail.href = 'mailto:' + config.email.value +
                    '?subject=' + encodeURIComponent('Bulk enquiry — ' + data.company) +
                    '&body=' + encodeURIComponent(text);
        mail.textContent = 'Send by email instead';
        status.appendChild(mail);
      }

      /* Deliberately NOT focused: it is an aria-live region, so updating it
         is already announced. Focusing as well would announce it twice. */
    }
  }

  function collect(form) {
    var data = {};
    Object.keys(RULES).forEach(function (name) {
      var field = form.elements[name];
      data[name] = field ? (field.value || '').trim() : '';
    });
    return data;
  }

  function buildMessage(data) {
    var lines = [
      'Bulk enquiry — Panwar Knitwear',
      '',
      'Name: ' + data.name,
      'Company: ' + data.company,
      'Phone: ' + data.phone
    ];

    if (data.email)    lines.push('Email: ' + data.email);
    lines.push('Interested in: ' + data.brand);
    if (data.quantity) lines.push('Approx. quantity: ' + data.quantity);

    lines.push('', 'Details:', data.message);

    return lines.join('\n');
  }

  function showSummary(summary, errors, form) {
    if (!summary) return;

    summary.innerHTML = '';

    /* The container is aria-labelledby this id, so it must exist before the
       container receives focus below. */
    var title = document.createElement('p');
    title.className = 'form-error-summary__title';
    title.id = 'error-summary-title';
    title.textContent = errors.length === 1
      ? 'There is 1 problem with this form:'
      : 'There are ' + errors.length + ' problems with this form:';
    summary.appendChild(title);

    var list = document.createElement('ul');
    errors.forEach(function (error) {
      var field = form.elements[error.name];
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + ((field && field.id) || error.name);
      link.textContent = error.message;
      link.addEventListener('click', function (event) {
        event.preventDefault();
        if (field) field.focus();
      });
      li.appendChild(link);
      list.appendChild(li);
    });
    summary.appendChild(list);

    summary.hidden = false;
    summary.focus();
  }

  window.PK.forms = { init: init };
})();
