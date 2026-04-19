# 🚀 TECH OS — LINKEO COCKPIT 2026

Tableau de bord commercial intelligent pour technico-commercial Linkeo. Stocké dans Firebase Firestore pour synchro multi-appareils (PC pro ↔ Mac).

## Structure du projet

```
cockpit/
├── App.jsx             # Code source React (single-file)
├── index.html          # Point d'entrée HTML (React + Babel + Firebase via CDN)
├── firebase-config.js  # Config Firebase + shim window.storage → Firestore
├── MIGRATION_LOG.md    # Historique de la migration depuis l'artifact Claude
└── README.md           # Ce fichier
```

## Les 6 sections de l'app

| Onglet | Description |
|--------|-------------|
| 📊 **Dashboard** | Rappels auto, Goals 2026, Plan d'action, Challenge T2, Mois référence, Hexagone performance, Mois en cours éditable, To Do, Pipelines VA/Renouvs/Impayés |
| 👤 **RDV du mois** | Suivi des visites avec calcul prime automatique par palier (15/20/25€), répartition par motif |
| 📋 **Prépa RDV** | Fiches clients par semaine (S01→S52), trajets, 12 champs + Plans A/B/C, coller-parser depuis Claude |
| 📅 **Annuel** | 12 mois en accordéon déroulable avec résumé quand fermé |
| 📌 **Cadre** | Rappel (cadre pro/perso, missions, priorités, KPIs), Primes (avenant 11 sources), Feedback (Sam + Arthur), Vision IA |
| 🔮 **Améliorations** | Roadmap produit : notifications, carte Google Maps, wiki produits, prépas auto, assistant IA 24/7 |

## Stockage — Firestore

Collection `cockpit`, 3 documents :
- `linkeo_cockpit_2026` — Données mensuelles (12 mois × 9 champs)
- `linkeo_prepa_2026` — Prépas RDV par semaine (trajets + fiches)
- `linkeo_v2_2026` — Todos, pipelines VA/Renouvs/Impayés, notifications, RDVs

## Lancer en local

```bash
cd cockpit/
python3 -m http.server 8910
```
Puis ouvrir `http://localhost:8910/` dans le navigateur.

> ⚠️ Ne pas ouvrir `index.html` directement (protocole `file://` → CORS bloque le chargement de `App.jsx`).

## Dépendances (toutes via CDN)

- React 18.x + React DOM 18.x
- Babel Standalone (JSX en ligne)
- Firebase App Compat 10.x + Firestore Compat 10.x

## Déploiement

Hébergé sur GitHub Pages, branche `main`, racine du repo.

## Sécurité — TODO avant usage en production

- [ ] Passer les règles Firestore du mode test à des règles nominatives (auth Google + restriction par UID)
- [ ] Restreindre la clé API par domaine (Google Cloud Console → Identifiants → Restrictions de référents HTTP)
- [ ] App Check pour bloquer les requêtes hors app autorisée

## Design

- Style futuriste noir/bleu néon
- Fonts : Orbitron, Rajdhani, JetBrains Mono (via Google Fonts CDN)
- Responsive mobile-first
