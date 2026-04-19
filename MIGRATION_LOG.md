# MIGRATION LOG — Cockpit Linkeo

## Étape 1 — Import depuis artifact Claude (19 avril 2026)

**Source :** `~/Downloads/files (3).zip`

**Fichiers extraits et renommés :**
- `LINKEO_COCKPIT_2026.jsx` → `App.jsx` (66 970 o)
- `cockpit_index.html` → `index.html` (1 078 o, wrapper React/Babel via CDN)
- `cockpit_README.md` → `README.md` (2 397 o)

**Conversions identifiées dans App.jsx :**
- Ligne 1 : `import { useState... } from "react"` → `const {...} = React;`
- Ligne 71 : `export default function App` → `function App`
- Clés `window.storage` à migrer vers Firestore :
  - `linkeo_cockpit_2026` (données tableau mensuel)
  - `linkeo_prepa_2026` (prépas RDV)
  - `linkeo_v2_2026` (todos, pipes VA/Renouv/Impayés, notifs, rdvs)

## Étape 2 — Init Git (à venir)

## Étape 3 — Firebase (en attente, à créer par Romain)

## Étape 4 — Intégration Firebase

## Étape 5 — Test local

## Étape 6 — Préparation déploiement GitHub Pages
