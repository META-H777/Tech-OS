---
version: alpha
name: Tech OS — Linkeo Cockpit
description: Système de design du Cockpit Linkeo de Romain Patry. Dashboard commercial React/Firebase, dark mode professionnel avec accents bleu nuit et cyan. Orienté données et KPIs.
colors:
  background: "#05080f"
  background-2: "#0a0f1a"
  surface: "#0d1520"
  surface-raised: "#111827"
  border: "#0077aa"
  border-subtle: "rgba(0,119,170,0.3)"
  primary: "#00aaff"
  primary-glow: "rgba(0,170,255,0.15)"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
  text-full: "#ffffff"
  text-mid: "rgba(255,255,255,0.7)"
  text-dim: "rgba(255,255,255,0.4)"
typography:
  headline:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: "700"
    letterSpacing: -0.01em
  subheadline:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
  body:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 1.5
  data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: "400"
  kpi:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: "700"
  label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: "500"
    letterSpacing: 0.05em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  kpi-card:
    background: "{colors.surface}"
    border: "1px solid {colors.border-subtle}"
    borderRadius: "{rounded.lg}"
    padding: "{spacing.md}"
  table-row:
    borderBottom: "1px solid rgba(255,255,255,0.05)"
    padding: "10px {spacing.md}"
  badge-success:
    background: "rgba(16,185,129,0.15)"
    color: "{colors.success}"
    borderRadius: "{rounded.sm}"
    padding: "2px 8px"
  badge-warning:
    background: "rgba(245,158,11,0.15)"
    color: "{colors.warning}"
    borderRadius: "{rounded.sm}"
    padding: "2px 8px"
  badge-danger:
    background: "rgba(239,68,68,0.15)"
    color: "{colors.danger}"
    borderRadius: "{rounded.sm}"
    padding: "2px 8px"
---

## Vue d'ensemble

Le Cockpit Linkeo est un **dashboard commercial** interne pour suivre les KPIs de performance de Romain en tant que technico-commercial. Built en React + Firebase. Le design est **professionnel dark**, orienté données : lisibilité maximale des chiffres, hiérarchie visuelle claire, densité d'information élevée.

L'esthétique s'inspire des dashboards SaaS pro (Linear, Vercel, Raycast) : fond très sombre, accents bleu-cyan froids, typographie Inter clean, monospace pour les données.

## Couleurs

- **Bleu-cyan (#00aaff)** : couleur d'accentuation principale — liens, KPIs clés, éléments interactifs.
- **Vert (#10b981)** : succès, objectifs atteints, tendances positives.
- **Orange/Ambre (#f59e0b)** : alertes modérées, objectifs en approche.
- **Rouge (#ef4444)** : alertes critiques, objectifs manqués.
- Les fonds restent dans la gamme #05→#15 pour maximiser le contraste des données.

## Typographie

- **Inter** — typo principale. Utilisée pour tout texte UI : labels, descriptions, navigation. Claire, neutre, professionnelle.
- **JetBrains Mono** — exclusivement pour les valeurs numériques (CA, scores, ratios, pourcentages). Alignement parfait des colonnes de données.

## Composants

### KPI Cards
Bordure subtile bleu-cyan (30% opacité). Background légèrement surélevé par rapport au fond. La valeur principale en JetBrains Mono 24px bold. Le label en Inter 11px semi-transparent.

### Tableaux
Rows séparées par des bordures très subtiles (5% blanc). Pas de fond alterné — trop lourd visuellement. Hover possible avec un fond légèrement surélevé.

### Badges de statut
Fond coloré à 15% d'opacité + texte plein coloré. Coins légèrement arrondis (4px). Compact (padding 2px 8px).

### Navigation
Latérale sur desktop, bottom bar sur mobile. Couleur active = primary (#00aaff). Sous-texte en Inter 12px.

## Règles d'usage pour les agents IA

1. Toutes les valeurs numériques (CA, scores, pourcentages, rangs) en JetBrains Mono.
2. Statuts : success/warning/danger uniquement — pas d'autres couleurs pour les badges.
3. Ne pas utiliser de fond blanc ou lumineux — le dashboard reste toujours dark.
4. La hiérarchie : KPI en grand → Label en petit → Détail en micro.
5. Pas d'animations complexes sur les données — la clarté prime sur l'effet.
6. Les graphiques : fond transparent, grilles subtiles (5% blanc), valeurs en mono.
7. Firebase = source de vérité pour toutes les données — pas de mocks statiques.
