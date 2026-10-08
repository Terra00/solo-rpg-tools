# Solo RPG Tools

Strumenti per giochi di ruolo in solitaria: lanci di dadi e pesca di carte (poker e tarocchi). Realizzato con Svelte 5, TypeScript e Vite.

## Funzionalità

- **Dadi**: d4, d6, d8, d10, d12, d20, d100 + dado custom (2–1000 facce), numero dadi (1–100), modificatore, storico con persistenza in `localStorage`.
- **Carte**: poker (con/senza joker), tarocchi maggiori e completi. Pesca, rimescola carte rimaste, storico pescaggi.
- **Extra**: tab con shortcut `1`/`2`, statistiche di sessione, layout responsive, accessibilità (ruoli tab, `aria-live`, focus visibile).

## Struttura

```text
src/
  data/         # mazzi JSON (poker, arcana)
  lib/
    types.ts    # tipi condivisi
    random.ts   # rng, uid, shuffle, clamp
    dice.ts     # logica dadi (pura, testata)
    decks.ts    # costruzione mazzi (pura, testata)
    format.ts   # formattazione ora
    Dice.svelte # UI dadi
    Card.svelte # UI carte
  App.svelte    # shell, tab, statistiche
  app.css       # variabili + stili globali
```

La logica pura è separata dai componenti per renderla testabile e riusabile.

## Sviluppo

```sh
npm install
npm run dev      # server di sviluppo
npm test         # test unitari (Vitest)
npm run check    # typecheck Svelte + TS
npm run lint     # controllo Prettier
npm run format   # formatta tutto
npm run build    # build di produzione
npm run preview  # anteprima build
```

## Convenzioni

- Componenti Svelte 5 con runes (`$state`, `$props`, `$effect`).
- Props tipizzate tramite `interface Props` e callback (`onRoll`, `onDraw`, `onDeckChange`).
- Niente `alert()`: statistiche in `<dialog>`.
- Niente `any`: tipi espliciti, `clampInt` per validare gli input numerici.
- Storico dadi limitato a 100 voci.

## Docker

Build multi-stage: `deps` → `build` → `production` (nginx), più target
`development` per il dev server con HMR.

```sh
docker compose up --build        # produzione su http://localhost:8080
docker compose --profile dev up --build dev   # sviluppo su http://localhost:5173
docker compose down
```

Dettagli:

- `Dockerfile`: stage `production` (default) con `nginx:stable-alpine`,
  healthcheck e fallback SPA; stage `development` con Vite `--host`.
- `docker/nginx.conf`: gzip, header di sicurezza, cache immutabile per
  `/assets/` (file con hash di Vite), `try_files` verso `index.html`.
- `docker-compose.yml`: `web` (prod, `8080:80`, restart automatico),
  `dev` (solo profilo `dev`, bind mount + `CHOKIDAR_USEPOLLING` per il
  watching su Windows/macOS).
