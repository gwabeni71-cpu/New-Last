/* BOLO settings: the only file you need to edit. */
window.BOLO_CONFIG = {
  // Your Cloudflare Worker address (see README). Leave '' until the worker is ready.
  YT_PROXY_URL: '',    // e.g. 'https://bolo-insider.YOURNAME.workers.dev/yt'
  GROQ_PROXY_URL: '',  // e.g. 'https://bolo-insider.YOURNAME.workers.dev'

  ADS: {
    // Tap-to-open partner links (shown as clearly labelled "Sponsored")
    links: [
      'https://omg10.com/4/11060984',
      'https://everybodycollecteagle.com/tmadq5gn43?key=2a459c79c0aa475c4f8ce86259a42b61'
    ],
    // Monetag zone scripts: loaded ONLY on the News and Dreams tabs (never next to a YouTube player)
    tags: [
      { src: 'https://nap5k.com/tag.min.js', zone: '11152512' },
      { src: 'https://quge5.com/88/tag.min.js', zone: '231248' }
    ],
    // Paste Adsterra banner/native script addresses here, e.g. '//pl123.example.com/abc/invoke.js'
    scripts: []
  }
};
