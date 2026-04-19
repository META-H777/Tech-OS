# 🚀 TECH OS — LINKEO COCKPIT 2026

Tableau de bord commercial intelligent pour technico-commercial Linkeo.

## Structure du projet

```
cockpit/
├── App.jsx          # Code source React (single-file, ~450 lignes)
├── index.html       # Point d'entrée HTML (React + Babel via CDN)
└── README.md        # Ce fichier
```

## Lancer en local

1. Ouvrir un terminal dans le dossier `cockpit/`
2. Lancer un serveur local :
   ```bash
   # Avec Python
   python3 -m http.server 8080

   # Ou avec Node
   npx serve .
   ```
3. Ouvrir `http://localhost:8080` dans le navigateur

> ⚠️ Le fichier JSX ne peut pas être ouvert directement en double-cliquant sur index.html (CORS). Il faut un serveur local.

## Les 6 sections de l'app

| Onglet | Description |
|--------|-------------|
| 📊 **Dashboard** | Rappels auto, Goals 2026, Plan d'action, Challenge T2, Mois référence, Hexagone performance, Mois en cours éditable, To Do, Pipelines VA/Renouvs/Impayés |
| 👤 **RDV du mois** | Suivi des visites avec calcul prime automatique par palier (15/20/25€), répartition par motif |
| 📋 **Prépa RDV** | Fiches clients par semaine (S01→S52), trajets, 12 champs + Plans A/B/C, coller-parser depuis Claude |
| 📅 **Annuel** | 12 mois en accordéon déroulable avec résumé quand fermé |
| 📌 **Cadre** | Rappel (cadre pro/perso, missions, priorités, KPIs), Primes (avenant 11 sources), Feedback (Sam + Arthur), Vision IA |
| 🔮 **Améliorations** | Roadmap produit : notifications, carte Google Maps, wiki produits, prépas auto, assistant IA 24/7 |

## Stockage actuel

3 clés `localStorage` :
- `linkeo_cockpit_2026` — Données mensuelles (12 mois × 9 champs)
- `linkeo_prepa_2026` — Prépas RDV par semaine (trajets + fiches)
- `linkeo_v2_2026` — Todos, pipelines VA/Renouvs/Impayés, notifications, RDVs

## Dépendances

- React 18.x (via CDN)
- React DOM 18.x (via CDN)
- Babel Standalone (via CDN, pour compilation JSX en ligne)
- Aucune autre librairie

## Migration prévue

- [ ] Remplacer `window.storage` (Claude) par `localStorage` (navigateur)
- [ ] Intégrer Firebase Firestore pour synchro cloud PC ↔ téléphone
- [ ] Déployer sur GitHub Pages
- [ ] Auth Google pour sécuriser les données

## Design

- Style futuriste noir/bleu néon
- Fonts : Orbitron, Rajdhani, JetBrains Mono (via Google Fonts CDN)
- Responsive mobile-first
