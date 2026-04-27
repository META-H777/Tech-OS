---
version: 1.0
name: Tech OS — Linkeo Cockpit 2026
description: Design system clair-dominant + accents néon bleu royal. Inspiré Linear / Vercel / Stripe / Apple Vision OS, avec rigueur d'outil terrain. Hero sombre + canvas clair, accent unique, glows maîtrisés.
colors:
  ink: "#0A0A0F"
  ink-2: "#14141C"
  ink-3: "#1F1F2A"
  paper: "#FAFAFB"
  paper-2: "#F2F3F5"
  paper-3: "#E7E8EC"
  line: "#DCDDE3"
  line-strong: "#C2C4CD"
  muted: "#6B6F7B"
  muted-2: "#9498A3"
  blue: "#3B82F6"
  blue-deep: "#1D4ED8"
  blue-soft: "#EFF4FF"
  blue-glow-rgb: "59 130 246"
  green: "#10A777"
  amber: "#D97706"
  red: "#DC2626"
typography:
  font-sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif"
  font-mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace"
  font-serif: "'Instrument Serif', Georgia, serif"
  display:
    fontSize: "96-128px"
    fontWeight: "800"
    letterSpacing: "-0.06em"
  h1:
    fontSize: "32-44px"
    fontWeight: "700"
    letterSpacing: "-0.035em"
    lineHeight: "1.05"
  card-title:
    fontSize: "13-14px"
    fontWeight: "600"
  body:
    fontSize: "14px"
    lineHeight: "1.5"
  label-mono:
    fontSize: "10-11px"
    fontWeight: "500"
    letterSpacing: "0.18em"
    textTransform: "uppercase"
  kpi:
    fontSize: "36-44px"
    fontWeight: "700-800"
    letterSpacing: "-0.03em"
    fontVariantNumeric: "tabular-nums"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
shadows:
  sh-1: "0 1px 2px rgba(10,10,15,.04), 0 1px 1px rgba(10,10,15,.03)"
  sh-2: "0 4px 12px rgba(10,10,15,.06), 0 2px 4px rgba(10,10,15,.03)"
  sh-3: "0 12px 32px rgba(10,10,15,.08), 0 4px 8px rgba(10,10,15,.04)"
---

## Vue d'ensemble

Le Cockpit Linkeo est un **dashboard commercial** B2B pour le suivi des KPIs de Romain. Build React + Firebase. Esthétique **minimaliste, ultra-moderne, com digitale 2026** : clair dominant, accents néon bleus, micro-textures et glows maîtrisés. Inspiration : Linear, Vercel, Stripe Dashboard, Apple Vision OS — avec rigueur d'un outil terrain.

## Principes (immuables)

1. **Une seule couleur d'accent** : bleu royal (`#3B82F6`). Jamais de rainbow.
2. **Beaucoup d'air** + hiérarchie typographique forte.
3. **Néons réservés** aux KPIs critiques et aux états vivants (live, actif).
4. **Contraste sombre vs clair** (hero noir profond, dashboard clair). Pas via la couleur.
5. **Aucune décoration gratuite** : chaque élément a une fonction.

## Patterns signature (à appliquer)

| Pattern | Quand | Classes |
|---|---|---|
| **Hero sombre** | Top du dashboard, 1 fois max par page | `.hero` + radial gradients bleu + grille |
| **KPI néon** | Le KPI critique du moment (1-2 max) | `.kpi--neon` |
| **Live dot pulsé** | Donnée temps-réel ou état actif | `.live-dot` + ring animé |
| **Card hover spotlight** | Toutes les KPI cards | `.kpi` + spotlight bleu radial qui suit la souris |
| **Topbar frostée** | Navigation principale | `.topbar` + backdrop-filter blur |
| **Tabs pill** | Switch d'onglets | `.topbar__nav` + `.tab` |
| **Aurore ambiante** | Fond global discret | `.app::before` + animation 24s |
| **Animation rise** | Entrée des sections au montage | `@keyframes rise` 0.6s |
| **Italique serif** | 1 mot d'accent dans le titre principal (jamais ailleurs) | `font-family: var(--font-serif)` italique |

## Règles d'usage composants

| Composant | Règle |
|---|---|
| Hero | Une seule fois par page, en haut. Toujours sombre. |
| KPI carte | Max 4 par ligne. Une seule peut être en `--neon` (KPI critique). |
| Bouton bleu | Réservé à l'action principale d'un écran (1 par vue). |
| Bouton ink (noir) | Action secondaire affirmée. |
| Chip bleu | Période active, statut "en cours", tag néon. |
| Live dot | Uniquement quand la donnée est temps-réel. |
| Italique serif | 1 mot/locution par titre principal, jamais ailleurs. |
| Glow néon | KPI phare, état actif. **Jamais sur du texte courant.** |

## À ne PAS faire (rappels)

- ❌ Arc-en-ciel multicolore (l'ancien TECH OS en avait, c'était trop)
- ❌ Gradients agressifs sur fonds de carte
- ❌ Emojis dans l'UI (à terme : icônes lucide-style 1.6px stroke — *transition tolérée pour cette première passe*)
- ❌ Border-radius supérieur à 24px sur cards
- ❌ Shadows plus marquées que `--sh-3`
- ❌ Glow néon sur texte courant — uniquement chiffres KPI et états
- ❌ Plus d'une couleur d'accent (le bleu, point)
- ❌ Couleurs bannies : doré (`#ffd700`), violet (`#aa66ff`), cyan saturé (`#00b4ff`)
- ❌ Fonts bannies : Orbitron, Rajdhani

## Iconographie (futur)

Style **Lucide / Heroicons outline** : stroke 1.6px, line-cap round, line-join round, viewBox 24×24. Couleur héritée de `currentColor`. Taille 14–16px UI, 12px chips. *Pour cette refonte v1, on garde temporairement les emojis existants.*

## Responsive

- Desktop ≥ 1100px : layout pleine grille
- Tablet 720–1099 : grilles 2 colonnes, hero stacké
- Mobile < 720 : 1 colonne, hero KPI à 56px, padding réduit

## Accessibilité

- Contraste minimum AA partout (texte sur fond clair : `--ink` sur `--paper` = 18:1)
- Focus visible : `outline: 2px solid var(--blue); outline-offset: 2px;`
- `prefers-reduced-motion` : couper aurora, ring, shimmer

## Implémentation

- **`tech-os.css`** : tokens + composants (fusion stylée de styles.css + wow.css du handoff)
- **`index.html`** : charge Inter + JetBrains Mono + Instrument Serif + tech-os.css
- **`App.jsx`** : utilise les tokens via inline styles ou classes signatures du CSS
