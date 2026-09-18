import { getStore } from "@netlify/blobs";

const KEY = process.env.ADMIN_KEY || "";

export default async (req) => {
  const store = getStore("aguassica");
  const cors = {
    "content-type": "application/json",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-aguassica-key",
  };

  if (req.method === "OPTIONS") return new Response("", { headers: cors });

  if (req.method === "GET") {
    const data = await store.get("data", { type: "json" });
    return new Response(JSON.stringify(data || {}), { headers: cors });
  }

  if (req.method === "POST") {
    if (!KEY || req.headers.get("x-aguassica-key") !== KEY)
      return new Response(JSON.stringify({ error: "no autorizado" }), { status: 401, headers: cors });
    let body;
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "json inválido" }), { status: 400, headers: cors }); }
    if (!body || !Array.isArray(body.products))
      return new Response(JSON.stringify({ error: "faltan productos" }), { status: 400, headers: cors });
    await store.setJSON("data", body);
    return new Response(JSON.stringify({ ok: true }), { headers: cors });
  }

  return new Response(JSON.stringify({ error: "método no permitido" }), { status: 405, headers: cors });
};

export const config = { path: "/api/content" };
