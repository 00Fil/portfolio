// Uso: node scripts/hash-password.mjs "password"  →  stampa l'hash da mettere in CLIENT_USERS
import { scryptSync, randomBytes } from "node:crypto";
const pw = process.argv[2];
if (!pw) {
  console.error('Uso: node scripts/hash-password.mjs "password"');
  process.exit(1);
}
const salt = randomBytes(16);
console.log(`scrypt:${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`);
