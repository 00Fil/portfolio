import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PKPass } from "passkit-generator";
import { importPKCS8, SignJWT } from "jose";
import { vcard } from "@/content/vcard";

const pem = (v?: string) => (v ? (v.trim().startsWith("-----") ? v.trim() : Buffer.from(v, "base64").toString("utf8")) : "");

export const appleReady = () => !!(process.env.APPLE_PASS_TYPE_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_PASS_CERT && process.env.APPLE_PASS_KEY && process.env.APPLE_WWDR);
export const googleReady = () => !!(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SA_EMAIL && process.env.GOOGLE_WALLET_SA_KEY);

export const cardUrl = (origin: string, locale = "it") => `${origin}/${locale}/biglietto`;

export function originOf(req: Request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? new URL(req.url).host;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Pass per Apple Wallet (.pkpass), firmato con il certificato Pass Type ID. */
export async function applePass(origin: string) {
  const dir = path.join(process.cwd(), "public/card/wallet");
  const files: Record<string, Buffer> = {};
  for (const n of fs.readdirSync(dir)) files[n] = fs.readFileSync(path.join(dir, n));
  const pass = new PKPass(
    files,
    {
      wwdr: pem(process.env.APPLE_WWDR),
      signerCert: pem(process.env.APPLE_PASS_CERT),
      signerKey: pem(process.env.APPLE_PASS_KEY),
      signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    },
    {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID!,
      teamIdentifier: process.env.APPLE_TEAM_ID!,
      serialNumber: "filippo-corsini-biglietto",
      organizationName: vcard.name,
      description: `Biglietto da visita di ${vcard.name}`,
      logoText: vcard.name,
      backgroundColor: "rgb(11, 26, 34)",
      foregroundColor: "rgb(243, 248, 251)",
      labelColor: "rgb(94, 196, 255)",
    },
  );
  pass.type = "generic";
  pass.primaryFields.push({ key: "name", label: "", value: vcard.name });
  pass.secondaryFields.push({ key: "role", label: "RUOLO", value: vcard.role }, { key: "city", label: "CITTA", value: vcard.city });
  pass.auxiliaryFields.push({ key: "tag", label: "", value: vcard.tagline });
  pass.backFields.push({ key: "web", label: "Biglietto", value: cardUrl(origin), dataDetectorTypes: ["PKDataDetectorTypeLink"] }, { key: "gh", label: "GitHub", value: vcard.github, dataDetectorTypes: ["PKDataDetectorTypeLink"] });
  pass.setBarcodes({ format: "PKBarcodeFormatQR", message: cardUrl(origin), messageEncoding: "iso-8859-1" });
  return pass.getAsBuffer();
}

const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
let classReady = false;

async function saKey() {
  return importPKCS8(process.env.GOOGLE_WALLET_SA_KEY!.replace(/\\n/g, "\n"), "RS256");
}

/** Crea la classe del pass al primo utilizzo (se esiste gia' Google risponde 409, va bene). */
async function ensureClass(classId: string) {
  if (classReady) return;
  const email = process.env.GOOGLE_WALLET_SA_EMAIL!;
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(await saKey());
  const t = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }) });
  if (!t.ok) throw new Error(`token ${t.status}`);
  const { access_token } = (await t.json()) as { access_token: string };
  const r = await fetch("https://walletobjects.googleapis.com/walletobjects/v1/genericClass", { method: "POST", headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: classId }) });
  if (!r.ok && r.status !== 409) throw new Error(`class ${r.status}`);
  classReady = true;
}

/** Link "Aggiungi a Google Wallet": JWT firmato con l'account di servizio. */
export async function googleSaveUrl(origin: string) {
  const issuer = process.env.GOOGLE_WALLET_ISSUER_ID!;
  const classId = `${issuer}.${process.env.GOOGLE_WALLET_CLASS || "biglietto"}`;
  await ensureClass(classId);
  const text = (value: string) => ({ defaultValue: { language: "it", value } });
  const object = {
    id: `${issuer}.filippo-corsini-biglietto`,
    classId,
    state: "ACTIVE",
    hexBackgroundColor: vcard.bg,
    cardTitle: text(vcard.name),
    header: text(vcard.name),
    subheader: text(vcard.role),
    logo: { sourceUri: { uri: `${origin}/card/wallet-logo.png` }, contentDescription: text(vcard.name) },
    heroImage: { sourceUri: { uri: `${origin}/card/wallet-hero.png` }, contentDescription: text(vcard.name) },
    textModulesData: [
      { id: "tag", header: "COSA FACCIO", body: vcard.tagline },
      { id: "city", header: "CITTA", body: vcard.city },
    ],
    linksModuleData: { uris: [{ id: "site", uri: cardUrl(origin), description: "Biglietto" }, { id: "gh", uri: vcard.github, description: "GitHub" }] },
    barcode: { type: "QR_CODE", value: cardUrl(origin), alternateText: "" },
  };
  const jwt = await new SignJWT({ typ: "savetowallet", origins: [origin], payload: { genericObjects: [object] } })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(process.env.GOOGLE_WALLET_SA_EMAIL!)
    .setAudience("google")
    .setIssuedAt()
    .sign(await saKey());
  return `https://pay.google.com/gp/save/${jwt}`;
}

/** vCard 3.0: nessuna email. */
export function vcf(origin: string) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${vcard.last};${vcard.first};;;`,
    `FN:${vcard.name}`,
    `TITLE:${vcard.role}`,
    vcard.phone && `TEL;TYPE=CELL:${vcard.phone}`,
    `ADR;TYPE=WORK:;;;${vcard.city};;;${vcard.country}`,
    `URL:${cardUrl(origin)}`,
    `URL:${vcard.github}`,
    `NOTE:${vcard.tagline}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}
