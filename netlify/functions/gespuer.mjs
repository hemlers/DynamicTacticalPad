// Gemeinsames Gespür für das Dynamische Taktikboard.
// Jede Tafel schickt ihre gelernten Versätze (pro Rolle und Situation) und bekommt die Summe aller Trainer zurück.
// Gespeichert wird in Netlify Blobs: "c/<id>" = Beitrag einer Tafel, "summe" = zusammengezählter Stand,
// "sicherung/<datum>" = Sicherungen. Szenen, Namen oder Texte kommen hier nie an.
import { getStore } from "@netlify/blobs";

export const config = { path: "/api/gespuer" };

const MAX_SCHLUESSEL = 4000;      // Einträge pro Tafel
const MAX_METER = 15;             // größter mittlerer Versatz pro Eintrag
const MAX_GEWICHT = 50;           // so viele Korrekturen zählt eine Tafel pro Eintrag höchstens

const antwort = (daten, status = 200) => new Response(JSON.stringify(daten), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function pruefen(L) {
  const raus = {};
  if (!L || typeof L !== "object" || Array.isArray(L)) return raus;
  let n = 0;
  for (const [k, v] of Object.entries(L)) {
    if (n >= MAX_SCHLUESSEL) break;
    if (typeof k !== "string" || k.length > 120 || !/^[a-z0-9äöüß|. _-]+$/i.test(k)) continue;
    if (!Array.isArray(v) || v.length !== 3) continue;
    const [x, z, c] = v.map(Number);
    if (![x, z, c].every(Number.isFinite) || c < 1 || c > 100000) continue;
    if (Math.abs(x / c) > MAX_METER || Math.abs(z / c) > MAX_METER) continue;
    raus[k] = [Math.round(x * 100) / 100, Math.round(z * 100) / 100, Math.round(c)];
    n++;
  }
  return raus;
}

async function alleBeitraege(store) {
  const { blobs } = await store.list({ prefix: "c/" });
  const alle = {};
  for (const b of blobs) {
    const d = await store.get(b.key, { type: "json" });
    if (d && d.L) alle[b.key] = d;
  }
  return alle;
}

async function summeBilden(store) {
  const alle = await alleBeitraege(store);
  const L = {};
  let trainer = 0, korrekturen = 0;
  for (const d of Object.values(alle)) {
    trainer++;
    for (const [k, v] of Object.entries(d.L)) {
      const f = Math.min(1, MAX_GEWICHT / v[2]);          // niemand dominiert mit sehr vielen Korrekturen
      const a = L[k] || (L[k] = [0, 0, 0]);
      a[0] += v[0] * f; a[1] += v[1] * f; a[2] += v[2] * f;
      if (k.startsWith("r|")) korrekturen += v[2];
    }
  }
  for (const v of Object.values(L)) { v[0] = Math.round(v[0] * 100) / 100; v[1] = Math.round(v[1] * 100) / 100; v[2] = Math.round(v[2] * 100) / 100; }
  const summe = { L, trainer, korrekturen, zeit: Date.now() };
  await store.setJSON("summe", summe);
  return summe;
}

async function sichern(store) {
  const alle = await alleBeitraege(store);
  const name = "sicherung/" + new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  await store.setJSON(name, alle);
  return { name, trainer: Object.keys(alle).length };
}

async function verwalten(store, url) {
  const schluessel = url.searchParams.get("schluessel");
  if (!process.env.ADMIN_SCHLUESSEL || schluessel !== process.env.ADMIN_SCHLUESSEL) return antwort({ fehler: "Kein Zugriff. Stimmt der Schlüssel?" }, 403);
  const aktion = url.searchParams.get("aktion");
  if (aktion === "stand") {
    const s = (await store.get("summe", { type: "json" })) || (await summeBilden(store));
    return antwort({ trainer: s.trainer, korrekturen: s.korrekturen, eintraege: Object.keys(s.L).length, zeit: new Date(s.zeit).toISOString() });
  }
  if (aktion === "sichern") return antwort({ ok: true, ...(await sichern(store)) });
  if (aktion === "sicherungen") {
    const { blobs } = await store.list({ prefix: "sicherung/" });
    return antwort({ sicherungen: blobs.map(b => b.key).sort().reverse() });
  }
  if (aktion === "leeren") {
    const s = await sichern(store);
    const { blobs } = await store.list({ prefix: "c/" });
    for (const b of blobs) await store.delete(b.key);
    await summeBilden(store);
    return antwort({ ok: true, geleert: blobs.length, vorherGesichert: s.name });
  }
  if (aktion === "zurueck") {
    const { blobs: sb } = await store.list({ prefix: "sicherung/" });
    const name = url.searchParams.get("name") || sb.map(b => b.key).sort().pop();
    if (!name) return antwort({ fehler: "Keine Sicherung vorhanden." }, 404);
    const alle = await store.get(name, { type: "json" });
    if (!alle) return antwort({ fehler: "Sicherung nicht gefunden: " + name }, 404);
    const { blobs } = await store.list({ prefix: "c/" });
    for (const b of blobs) await store.delete(b.key);
    for (const [k, d] of Object.entries(alle)) await store.setJSON(k, d);
    await summeBilden(store);
    return antwort({ ok: true, zurueckAuf: name, trainer: Object.keys(alle).length });
  }
  return antwort({ fehler: "Unbekannte Aktion. Möglich: stand, sichern, sicherungen, leeren, zurueck" }, 400);
}

export default async (req) => {
  const store = getStore("gespuer");
  const url = new URL(req.url);
  try {
    if (url.searchParams.has("aktion")) return await verwalten(store, url);
    if (req.method === "GET") {
      const s = (await store.get("summe", { type: "json" })) || (await summeBilden(store));
      return antwort(s);
    }
    if (req.method === "POST") {
      const text = await req.text();
      if (text.length > 400000) return antwort({ fehler: "Zu groß" }, 413);
      let b; try { b = JSON.parse(text); } catch { return antwort({ fehler: "Ungültige Daten" }, 400); }
      const id = String(b && b.id || "");
      if (!/^[a-z0-9]{8,40}$/.test(id)) return antwort({ fehler: "Ungültige Kennung" }, 400);
      await store.setJSON("c/" + id, { L: pruefen(b.L), zeit: Date.now() });
      return antwort(await summeBilden(store));
    }
    return antwort({ fehler: "Nur GET und POST" }, 405);
  } catch (e) {
    return antwort({ fehler: "Serverfehler", info: String(e && e.message || e) }, 500);
  }
};
