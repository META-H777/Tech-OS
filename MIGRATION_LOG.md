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

## Étape 6 — Déploiement GitHub Pages ✅

- Repo créé : **https://github.com/META-H777/Tech-OS** (public)
- Push initial vers `main` (4 commits)
- GitHub Pages activé sur `main` / `/`
- URL live : **https://meta-h777.github.io/Tech-OS/**

## Sécurité — Niveau 1 ✅ (19 avril 2026)

- Clé API Firebase restreinte par référent HTTP dans Google Cloud Console :
  - `https://meta-h777.github.io/*`
  - `http://localhost:8910/*`
- Empêche l'utilisation de la clé depuis un autre site que les 2 autorisés.

## Sécurité — Niveaux suivants (à faire avant présentation PDG)

- [ ] **Auth Google** dans l'app (login obligatoire au chargement)
- [ ] **Règles Firestore nominatives** : autoriser read/write uniquement pour l'UID de Romain
- [ ] **App Check** (optionnel) pour bloquer les requêtes hors app autorisée
- [ ] Règles Firestore en mode test expirent le **19 mai 2026**
