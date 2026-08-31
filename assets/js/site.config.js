/* ==========================================================================
   SITE CONFIG — single source of truth for volatile content.

   Header and footer markup is duplicated across pages (no build step, and
   fetch() of partials fails under file://). To stop that duplication from
   drifting, everything that CHANGES lives here instead of in the markup.

   Change a phone number once and it updates on every page, because ui.js
   stamps these values into every [data-contact] slot.

   >>> ITEMS MARKED todo:true RENDER A VISIBLE PLACEHOLDER. <<<
   See docs/CONTENT-TODO.md. Do not invent values — set todo:false only
   once the real value is confirmed by the client.
   ========================================================================== */

window.PK = window.PK || {};

window.PK.config = {
  company: {
    name: 'Panwar Knitwear',
    /* Verified from panwarknitwear.com */
    city: 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    locality: 'Ludhiana, Punjab, India',

    /* TODO: no street address is published on the reference site. */
    street: { value: '', todo: true, note: 'Full street address + PIN code' }
  },

  /* All three numbers are verified from panwarknitwear.com. */
  phones: [
    { display: '+91 98760 45457', dial: '+919876045457', primary: true },
    { display: '+91 98157 03769', dial: '+919815703769' },
    { display: '+91 99999 82998', dial: '+919999982998' }
  ],

  /* TODO: which number is WhatsApp-enabled is unconfirmed. Defaulting to
     the primary line; correct this before launch. */
  whatsapp: {
    dial: '919876045457',
    todo: true,
    note: 'Confirm which number receives WhatsApp enquiries'
  },

  /* TODO: the reference site shows the literal placeholder
     "email@example.com" — we must not publish that as if it were real. */
  email: {
    value: '',
    todo: true,
    note: 'Real business email address'
  },

  /* Verified external presence. */
  links: {
    zonixa:    'https://zonixa.com',
    mspSports: 'https://mspsports.in',
    instagram: 'https://www.instagram.com/panwarknitwear',
    indiamart: 'https://www.indiamart.com/panwar-knitwear',
    justdial:  'https://jsdl.in/DT-40JPFSTDR23',
    maps:      'https://maps.app.goo.gl/rrg4VPdpZcRvZTQZ6',
    linkedin:  'https://www.linkedin.com/posts/a-rohitash-panwar-7b3684114_panwarknitwear-zonixa-mspsports-activity-7218811071321497600-Dvj6',
    quora:     'https://www.quora.com/What-are-some-good-manufacturers-of-clothing/answer/A-Rohitash-Panwar-3'
  },

  brands: {
    zonixa: {
      name: 'ZONIXA',
      segment: 'Topwear',
      categories: ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Winter Wear']
    },
    msp: {
      name: 'MSP Sports',
      segment: 'Bottomwear',
      categories: ['Track Pants', 'Lowers', 'Shorts', 'Nikkar', 'Capri', 'Sportswear']
    }
  },

  /* Verified fabric list, quoted from the reference site. */
  fabrics: [
    'Spun Fleece', 'Dry Fit', 'Honeycomb Lycra', '100% Cotton',
    'Cotton Lycra', 'NS Bonded', 'Russian Fleece', 'Sherpa'
  ],

  /* Verified leadership, quoted from the reference site. */
  leadership: [
    { name: 'Mohar Singh Panwar', role: 'Founder' },
    { name: 'Prabhu Panwar',      role: 'Co-Founder & CEO' },
    { name: 'Bhala Ram Panwar',   role: 'Co-Founder & CEO' },
    { name: 'Rohitash Panwar',    role: 'Online Presence' }
  ]
};
