# ECC Prototype — Style Guide

Epic Cricket Comp (ECC) mobile app. Vite + React + TypeScript. Mobile-first, 393px target width. Australian English throughout.

---

## Colour Palette

All colours live in the `t` (theme) object in `react/src/App.tsx`.

| Token | Value | Usage |
|-------|-------|-------|
| `t.bg` | `#f5f5f0` | App background (cream) |
| `t.surface` / `t.card` | `#ffffff` | Cards, batting section, scoring controls |
| `t.cardAlt` | `#f0efe8` | Bowling section bg, dot ball buttons, muted elements |
| `t.border` | `#ddd8cc` | Default borders |
| `t.borderLight` | `#c8c2b4` | Lighter borders (e.g. upcoming ball indicators) |
| `t.text` | `#1a1a18` | Primary text |
| `t.textDim` | `#6b6860` | Secondary / label text |
| `t.textMuted` | `#9e9a90` | Placeholder, inactive states |
| `t.accent` | `#2d7a4f` | Green — batting, primary actions, selection, 4s/6s |
| `t.accentDim` | `#1e6340` | Darker green hover/active |
| `t.amber` | `#E5A820` | Gold — bowling, extras (wides/no balls), over badges |
| `t.amberDim` | `#C88E10` | Darker gold hover/active |
| `t.red` | `#c43030` | Wickets, dismissals, life hearts |
| `t.redDim` | `#a82020` | Darker red hover/active |
| `t.blue` | `#2563eb` | Byes / leg byes (legal extras) |

### Colour Semantics

- **Green** — batting team, primary CTA, active selection, 4s, 6s, boundary highlights
- **Gold** — bowling team, over badges, rotation strip accents, wides, no balls, extras button
- **Red** — wickets button (solid fill), dismissal panels, life hearts (outline + fill)
- **Blue** — byes and leg byes only (legal extras — no one's fault)
- **Muted/cardAlt** — dot balls, inactive states, neutral elements

---

## Typography

| Token | Value | Use |
|-------|-------|-----|
| `t.font` | `'Source Code Pro', 'Menlo', monospace` | Scores, numbers, mono data |
| `t.fontSans` | `'Source Sans 3', 'Helvetica Neue', sans-serif` | UI labels, body copy, buttons |

### Type Scale (common patterns)

| Size | Usage |
|------|-------|
| 40px mono bold | Main score display (runs/wickets) |
| 18px sans bold | Team name in batting header |
| 16px sans bold | Batter runs, bowling team name |
| 14px sans | General body, card content |
| 13px sans | Pill labels, badges |
| 12px sans bold | Bowling rotation team names |
| 11px sans | Bowling rotation status labels |

---

## Spacing & Layout

- **Card padding:** `t.cardPadding = 16px`
- **Border width:** `1.5px` throughout — no exceptions
- **Border radius:** `t.radius = 8px` (standard), `t.radiusLg = 12px` (larger cards)
- **Button radius:** `t.btnRadius = 10px`
- **Button height:** `t.btnHeight = 54px` (large tap targets for outdoor use)
- **Box shadow:** `0 1px 4px rgba(0,0,0,0.06)` on cards

---

## Component Patterns

### Cards

Standard card — white surface, border, shadow:

```js
{
  background: t.card,
  border: `1.5px solid ${t.border}`,
  borderRadius: t.radius,
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  padding: t.cardPadding,
}
```

Active / selected card — colour tint + coloured border:

```js
{
  background: `${t.accent}12`,   // ~7% opacity tint
  border: `1.5px solid ${t.accent}`,
}
```

Dashed card (e.g. "Add Team", "Custom Format"):

```js
{
  border: `1.5px dashed ${t.border}`,
  borderRadius: t.radius,
}
```

### Buttons

**Primary (green):**
```js
{
  background: `linear-gradient(135deg, ${t.accent}, ${t.accentDim})`,
  color: "#fff",
  borderRadius: t.btnRadius,
  height: t.btnHeight,
  border: "none",
}
```

**Next (wizard):**
```js
{
  background: `${t.accent}12`,
  border: `1.5px solid ${t.accent}`,
  color: t.accent,
}
```

**Back (wizard):**
```js
{
  background: t.card,
  border: `1.5px solid ${t.border}`,
  color: t.textDim,
}
```

**Wicket (solid red):**
```js
{
  background: t.red,
  color: "#fff",
  border: "none",
}
```

**Extras (gold outline):**
```js
{
  background: "transparent",
  border: `1.5px solid ${t.amber}`,
  color: t.amber,
}
```

**Dot ball (muted):**
```js
{
  background: t.cardAlt,
  border: `1.5px solid ${t.border}`,
  color: t.textMuted,
}
```

**Run button (4/6 — green tint):**
```js
{
  background: `${t.accent}12`,
  border: `1.5px solid ${t.accent}`,
  color: t.accent,
}
```

### Pill (`<Pill>` component)

```js
{
  background: active ? `${color}1a` : "transparent",
  border: `1.5px solid ${active ? color : t.border}`,
  color: active ? color : t.textDim,
  borderRadius: t.radius,
  padding: "6px 14px",
  fontSize: 13,
  fontFamily: t.fontSans,
  fontWeight: 700,
}
```

### Section Layout Pattern

Every major section (batting, bowling) follows:

```
Header row (label + team name + score/badge)
─────────────────────────────────────────── (full-width divider, 1.5px)
Content
```

---

## Ball Indicator Colours (This Over)

36×36 rounded square chips:

| Delivery | Bg | Text |
|----------|----|------|
| Dot (0) | `t.cardAlt` | `t.textMuted` |
| 1–3 runs | `t.surface` | `t.text` |
| 4 | `${t.accent}20` | `t.accent` |
| 6 | `${t.accent}30` | `t.accent` |
| W (wicket) | `${t.red}20` | `t.red` |
| Wd / Nb | `${t.amber}20` | `t.amber` |
| B / Lb | `${t.blue}15` | `t.blue` |
| Upcoming | dashed `t.borderLight`, `Minus` icon | — |

Wides do not count as legal deliveries (no ball indicator consumed).

---

## Life Hearts

- Always red outline (`t.red`), `Heart` icon from Lucide
- Filled red = life remaining
- Empty red outline = life lost
- Never use any other colour for hearts

---

## Bowling Rotation Strip

Chronological left-to-right: done → now → next

| State | Style |
|-------|-------|
| `done` | Faded opacity, muted colours |
| `now` | Gold highlight (`t.amber` tint + border) |
| `next` | Plain card style, shows over range in gold badge |

Over badges: gold bg tint (`${t.amber}20`), `t.amber` text, 11–13px sans bold.

---

## Icons

Lucide React icons throughout. Key usages:

| Icon | Context |
|------|---------|
| `CircleDot` | Active striker / current bowler indicator |
| `Heart` | Batter lives |
| `TrendingUp` | Strike rate |
| `GripVertical` | Drag handles (setup order lists) |
| `RotateCcw` | Undo button |
| `Trophy`, `Crown`, `Medal` | Match summary awards |
| `Shield` | Batting section emoji label |
| `Target` / `Crosshair` | Bowling section emoji label |
| `Settings` | Custom format button |
| `Save` | Save format |
| `Check` | Completed step indicator |

Preset card icons use `fill` prop: `fill={isActive ? t.accent : t.textMuted}`.

---

## Setup Wizard

### Step Indicator

Four steps: Format → Teams → Batting → Bowling

- Circles with icons + connecting lines
- Completed = green checkmark (`t.accent`)
- Active = green filled circle
- Inactive = muted circle (`t.textMuted`)
- Tappable to jump between steps

### Navigation Buttons

Inline at the bottom of content (not fixed/floating). Users must scroll through content to reach them.

- Back: card style (white bg, `t.border`)
- Next: green tint bg + green border + green text
- "Start Match": filled green gradient, white text — only appears on final step

### Custom Format (hidden step)

- Step indicator is hidden; replaced with back arrow + "Custom Format" heading
- Compact preset grid: 4 columns, icon + name only
- Config rows: 4 preset chips + optional `+` button for custom numeric input
- Zero values display as `N/A`
- Rule toggles below config (boolean on/off)
- "Save as new format" card appears only when no preset is active

---

## Pairs Cricket Defaults

```js
{
  overs: 6,
  ballsPerOver: 6,
  wickets: 3,           // lives per batter
  catchBonus: 5,
  playersPerTeam: 2,
  teamsPerGame: 4,
  retireAt: 0,          // 0 = N/A
  maxOversPerBowler: 0, // 0 = N/A
  cantOutFirstBall: false,
  nickAndRun: true,
  lastManStands: true,
  oneHandOneBounce: false,
  freeHits: true,
}
```

---

## Scoring Rules Reference

| Rule | Notes |
|------|-------|
| Wides / No balls | Illegal — bowler's fault. Gold colour. Do not consume a legal delivery slot. |
| Byes / Leg byes | Legal — no one's fault. Blue colour. Consume a legal delivery slot. |
| Can't get out first ball | Batter is safe on the first ball they face |
| Nick & run | Running off an edge |
| Last man stands | Final batter can bat solo |
| One hand one bounce (OHOB) | Catch off one bounce with one hand is out |
| Free hits | A no ball results in a free hit next delivery |
| Catch bonus | Fielding team earns bonus points per catch |

---

## Accessibility & Outdoor UX

- All interactive tap targets minimum `54px` height (`t.btnHeight`)
- High contrast maintained throughout — light cream bg, dark text
- No dark mode — single light theme optimised for outdoor sunlight readability
- `1.5px` borders throughout for visibility in bright light
- Avoid small touch targets; prefer large grid buttons over dropdowns
