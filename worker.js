// BOLO helper (Cloudflare Worker). Keeps keys secret, shares one YouTube quota between all users,
// and keeps the last good answer for 30 days so the catalogue still loads if the daily quota runs out.
export default {
  async fetch(req, env, ctx) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : "null",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    const json = (body, status) => new Response(body, { status, headers: { ...cors, "Content-Type": "application/json" } });
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (!ok) return new Response("Forbidden", { status: 403, headers: cors });
    const url = new URL(req.url);

    // ---- YouTube Data API proxy with cache: GET /yt/<playlistItems|videos|search>?... ----
    if (req.method === "GET" && url.pathname.startsWith("/yt/")) {
      const ep = url.pathname.slice(4);
      if (!["playlistItems", "videos", "search"].includes(ep)) return new Response("Not found", { status: 404, headers: cors });
      const q = new URLSearchParams(url.search); q.delete("key");
      const norm = q.toString();
      const fresh = new Request("https://cache.bolo/yt/" + ep + "?" + norm);
      const stale = new Request("https://cache.bolo/yt-stale/" + ep + "?" + norm);
      const cache = caches.default;
      const hit = await cache.match(fresh);
      if (hit) return json(await hit.text(), 200);
      q.set("key", env.YT_API_KEY);
      const r = await fetch("https://www.googleapis.com/youtube/v3/" + ep + "?" + q.toString());
      if (r.ok) {
        const body = await r.text();
        const ttl = ep === "search" ? 3600 : 21600;
        ctx.waitUntil(Promise.all([
          cache.put(fresh, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=" + ttl } })),
          cache.put(stale, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=2592000" } }))
        ]));
        return json(body, 200);
      }
      const old = await cache.match(stale);          // quota used up or YouTube down: serve last good copy
      if (old) return json(await old.text(), 200);
      return json(await r.text(), r.status);
    }

    // ---- BOLO Insider (Groq) ----
    if (req.method !== "POST") return new Response("Forbidden", { status: 403, headers: cors });
    let body;
    try { body = await req.json(); } catch (e) { return new Response("Bad request", { status: 400, headers: cors }); }
    const last = (body.messages || []).filter(m => m.role === "user").pop();
    const text = String((last && last.content) || "").slice(0, 500);
    if (!text) return new Response("Bad request", { status: 400, headers: cors });
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + env.GROQ_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are BOLO INSIDER, a cinema expert. Keep responses concise (max 150 words)." },
          { role: "user", content: text }
        ],
        max_tokens: 400, temperature: 0.7
      })
    });
    return new Response(r.body, { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
