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
