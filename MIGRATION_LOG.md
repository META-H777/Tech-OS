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

## Étape 2 — Init Git ✅

- `git init` dans `~/OS-Central/tech-os/cockpit/`
- `.gitignore` : node_modules, .env, .DS_Store, *.log (firebase-config.js **inclus** dans le repo car public par conception)
- Commit initial `a9d2ca6` : import Cockpit depuis artifact Claude

## Étape 3 — Firebase ✅

- Projet créé : **"Lien du cockpit"** (projectId : `cockpit-linkeo`)
- Firestore activé, région **`eur3` (multi-régions Europe)**, règles mode test (30 jours)
- App Web enregistrée sous le surnom `cockpit`

## Étape 4 — Intégration Firebase ✅

- `firebase-config.js` créé avec la config + shim `window.storage` → Firestore
  - Mapping : chaque clé `linkeo_*` → document dans collection `cockpit`
  - Permet de préserver **tous** les `window.storage.get/set` de App.jsx sans les réécrire
- `index.html` : ajout des scripts CDN `firebase-app-compat` et `firebase-firestore-compat` + chargement de `firebase-config.js`
- `App.jsx` conversions :
  - Ligne 1 : `import { useState... } from "react"` → `const {...} = React;`
  - Ligne 71 : `export default function App` → `function App`

## Étape 5 — Test local ✅

- Serveur local `python3 -m http.server 8910` dans `~/OS-Central/tech-os/cockpit/`
- App chargée via Chrome sur `http://localhost:8910/`
- Firebase initialisé sans erreur console
- Écriture vérifiée : collection `cockpit` créée dans Firestore avec les 3 documents `linkeo_cockpit_2026`, `linkeo_prepa_2026`, `linkeo_v2_2026`
- Timestamp `updatedAt` fonctionnel

## Étape 6 — Préparation déploiement GitHub Pages (à faire)

## TODO sécurité (avant déploiement public)

- Règles Firestore : passer du mode test à des règles nominatives avant 30 jours (limiter à l'app autorisée via auth anonyme ou email).
- Restriction de domaine sur la clé API (Google Cloud Console) une fois le domaine GitHub Pages connu.
