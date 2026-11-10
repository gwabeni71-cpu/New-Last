/* BOLO ads helper. Labelled, user-initiated placements only; no overlays on video players. */
(function () {
  var C = window.BOLO_CONFIG || {}, A = C.ADS || {}, links = (A.links || []).filter(Boolean), n = 0;
  window.BoloAds = { open: function () { if (!links.length) return; window.open(links[n++ % links.length], '_blank', 'noopener'); } };
  if (document.documentElement.getAttribute('data-ads') !== 'full') return; // banner + zone scripts only on non-YouTube tabs
  function add(src, zone) { var s = document.createElement('script'); if (zone) s.setAttribute('data-zone', zone); s.setAttribute('data-cfasync', 'false'); s.async = true; s.src = src; document.body.appendChild(s); }
  function banner() {
    if (!links.length) return;
    var b = document.createElement('div');
    b.setAttribute('role', 'complementary'); b.setAttribute('aria-label', 'Sponsored');
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:5000;display:flex;align-items:center;gap:10px;padding:8px 12px calc(8px + env(safe-area-inset-bottom,0px));background:#0a0a0a;border-top:2px solid #ffcc00;font-family:Helvetica Neue,Helvetica,Arial,sans-serif';
    b.innerHTML = '<span style="background:#ffcc00;color:#000;font-weight:900;font-size:9px;letter-spacing:.8px;padding:4px 7px;border-radius:4px;text-transform:uppercase">Sponsored</span>' +
      '<span style="flex:1;min-width:0;color:#ddd;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Partner offer · tap to view</span>' +
      '<button type="button" data-o style="background:#ffcc00;color:#000;border:0;border-radius:30px;padding:8px 16px;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer">Open</button>' +
      '<button type="button" data-x aria-label="Close" style="background:0;border:0;color:#888;font-size:18px;cursor:pointer">✕</button>';
    document.body.appendChild(b); document.body.style.paddingBottom = '72px';
    b.querySelector('[data-o]').onclick = window.BoloAds.open;
    b.querySelector('[data-x]').onclick = function () { b.style.display = 'none'; setTimeout(function () { b.style.display = 'flex'; }, 120000); };
  }
  function go() { banner(); (A.tags || []).forEach(function (t) { add(t.src, t.zone); }); (A.scripts || []).forEach(function (u) { add(u); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
