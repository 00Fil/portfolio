# Portfolio

Next.js, next-intl (IT/EN), GSAP, Lenis. L'interfaccia riprende il design system di Relay: token Canone, controlli di vetro Goccia, barra delle schede con le stesse molle.

## Sviluppo

```
npm install
npm run dev
```

## Da completare

Tutti i dati personali stanno in `src/content/profile.ts` (nome, email, LinkedIn, CV, dominio). I progetti in `src/content/projects.ts`, i testi dell'interfaccia in `messages/`.

## Deploy (Dokploy)

Applicazione da Dockerfile, porta 3000.

Il pannello su `/login` salva tutto in `/app/data` (variabile `DATA_DIR`): in Dokploy, Advanced > Volumes, aggiungi un **Volume Mount** con mount path `/app/data`. Nel pannello compare "Dati su volume" (verde) se la cartella è davvero su un volume, "Dati non persistenti" (rosso) altrimenti.

## Biglietto da visita (`/it/biglietto`)

Il tasto Wallet compare solo se le chiavi sono nell'ambiente (Dokploy), mai nel repository.

- Apple Wallet: `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, `APPLE_PASS_CERT` (certificato Pass Type ID in PEM), `APPLE_PASS_KEY` (chiave privata PEM), `APPLE_WWDR` (certificato intermedio WWDR in PEM), opzionale `APPLE_PASS_KEY_PASSPHRASE`. I PEM si possono dare in base64.
- Google Wallet: `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SA_EMAIL`, `GOOGLE_WALLET_SA_KEY` (chiave privata dell'account di servizio, con `\n` al posto degli a capo), opzionale `GOOGLE_WALLET_CLASS`. La classe del pass viene creata al primo uso.
- `SITE_URL` (opzionale): dominio pubblico usato nei link del pass.
