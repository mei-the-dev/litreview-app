# Color Harmonization Plan

## Current Issues
1. Inconsistent use of color variables vs direct colors
2. Mixed usage of sunset palette colors without clear hierarchy
3. Some hardcoded colors bypass the theme system
4. Text contrast varies across components

## Color Hierarchy & Usage

### Primary Colors (Golden Accent)
- **primary (#C18F32)**: Main accent, CTAs, important elements
- **primary-light (#D4A449)**: Hover states, highlights
- **primary-dark (#A67828)**: Active states, emphasis

### Secondary Colors (Light Pastel Gold)
- **secondary (#F4E7C3)**: Backgrounds, soft accents
- **secondary-light (#FEF6E4)**: Light backgrounds, cards
- **secondary-dark (#E8D9A8)**: Borders, subtle emphasis

### Sunset Palette (Atmospheric Effects)
- **sunset-amber (#FF9D5C)**: Warm highlights
- **sunset-gold (#FFB84D)**: Golden hour effects
- **sunset-peach (#FFCF9F)**: Soft warmth
- **sunset-coral (#FF8A5B)**: Energetic accents
- **sunset-rose (#F4A5B9)**: Delicate touches
- **sunset-violet (#A17FB5)**: Twilight depth

### Dark Theme
- **twilight-navy (#3D3066)**: Base dark color
- **twilight-indigo (#6B5B95)**: Medium dark
- **midnight (#0A0E1A)**: Deepest dark
- **horizon-cream (#FFEFD5)**: Light text on dark

### Status Colors
- **success (#8BC34A)**: Green for completed/success
- **warning (#FFB74D)**: Amber for warnings
- **danger (#FF7043)**: Orange-red for errors
- **info (#64B5F6)**: Blue for information

## Standardized Patterns

### Glass Morphism Cards
**Dark Mode:**
```
bg-gradient-to-br from-white/8 via-white/5 to-white/3
border-white/10
```

**Light Mode:**
```
bg-gradient-to-br from-white/70 via-white/60 to-white/50
border-secondary/30
```

### Text Colors
**Dark Mode:**
- Primary text: `text-horizon-cream` or `text-gray-200`
- Secondary text: `text-gray-300`
- Muted text: `text-gray-400`

**Light Mode:**
- Primary text: `text-twilight-navy` or `text-gray-900`
- Secondary text: `text-gray-700`
- Muted text: `text-gray-600`

### Interactive Elements (Buttons, Inputs)
**Dark Mode Primary:**
```
bg-gradient-to-r from-sunset-amber/35 to-sunset-gold/30
border-sunset-gold/40
text-horizon-cream
hover:from-sunset-amber/45 hover:to-sunset-gold/40
```

**Light Mode Primary:**
```
bg-gradient-to-r from-sunset-peach/50 to-sunset-gold/30
border-sunset-coral/40
text-twilight-navy
hover:from-sunset-peach/60 hover:to-sunset-gold/40
```

### Gradient Text (Titles)
**Dark Mode:**
```
bg-gradient-to-r from-sunset-gold via-horizon-cream to-sunset-amber
bg-clip-text text-transparent
```

**Light Mode:**
```
bg-gradient-to-r from-twilight-navy via-sunset-coral to-sunset-amber
bg-clip-text text-transparent
```

## Implementation Strategy

1. **Create theme utility functions** for consistent color application
2. **Standardize all card backgrounds** using glass morphism pattern
3. **Unify text colors** across all components
4. **Harmonize interactive elements** (buttons, inputs, links)
5. **Ensure proper contrast ratios** for accessibility
6. **Use sunset palette consistently** for atmospheric effects only

## Files to Update
- [x] App.tsx (background gradients)
- [ ] Header.tsx
- [ ] QueryInput.tsx
- [ ] StatsFooter.tsx
- [ ] StageBentoCard.tsx
- [ ] StageDataPreview.tsx
- [ ] All results components
- [ ] index.css (add utility classes)
