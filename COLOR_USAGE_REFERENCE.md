# Color Usage Reference Guide

## Quick Reference for Developers

### Text Colors

#### Primary Text (Main Headings, Important Content)
```jsx
// Dark mode
className="text-horizon-cream"  // or use gradient-title-dark for titles

// Light mode  
className="text-twilight-navy"  // or use gradient-title-light for titles
```

#### Secondary Text (Body Text, Descriptions)
```jsx
// Dark mode
className="text-gray-300"  // or text-secondary-theme-dark

// Light mode
className="text-gray-700"  // or text-secondary-theme-light
```

#### Muted Text (Labels, Helper Text, Timestamps)
```jsx
// Dark mode
className="text-gray-400"  // or text-muted-dark

// Light mode
className="text-gray-600"  // or text-muted-light
```

### Gradient Titles
```jsx
<h1 className={isDark ? 'gradient-title-dark' : 'gradient-title-light'}>
  Beautiful Title
</h1>
```

### Glass Morphism Cards
```jsx
<div className={`
  glass-artistic rounded-3xl p-6 border shadow-2xl
  ${isDark 
    ? 'bg-gradient-to-br from-white/8 via-white/5 to-white/3 border-white/10' 
    : 'bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-secondary/30'
  }
`}>
  Card Content
</div>
```

### Interactive Buttons
```jsx
<button className={`
  px-6 py-3 rounded-xl font-semibold backdrop-blur-md border
  ${isDark
    ? 'bg-gradient-to-r from-sunset-amber/35 to-sunset-gold/30 border-sunset-gold/40 text-horizon-cream'
    : 'bg-gradient-to-r from-sunset-peach/50 to-sunset-gold/30 border-sunset-coral/40 text-twilight-navy'
  }
`}>
  Button Text
</button>
```

### Input Fields
```jsx
<input className={`
  px-4 py-3 rounded-xl border backdrop-blur-md
  focus:outline-none focus:ring-2 transition-all
  ${isDark
    ? 'bg-white/8 border-white/15 text-white placeholder-gray-400 focus:ring-primary/50'
    : 'bg-white/90 border-secondary/40 text-gray-900 placeholder-gray-500 focus:ring-primary/40'
  }
`} />
```

### Status Colors
```jsx
// Success (completed, positive)
className="text-success"  // #8BC34A

// Warning (caution, attention needed)
className="text-warning"  // #FFB74D

// Danger (error, critical)
className="text-danger"  // #FF7043

// Info (information, neutral)
className="text-info"  // #64B5F6
```

### Icon Colors
```jsx
// Themed icons
<Icon className={isDark ? 'text-secondary' : 'text-primary'} />

// Status icons
<CheckIcon className="text-success" />
<AlertIcon className="text-danger" />
<InfoIcon className="text-info" />
```

## Color Palette

### Primary Colors
| Variable | Hex | Use Case |
|----------|-----|----------|
| `primary` | #C18F32 | Main accent, CTAs, important elements |
| `primary-light` | #D4A449 | Hover states, highlights |
| `primary-dark` | #A67828 | Active states, emphasis |

### Secondary Colors
| Variable | Hex | Use Case |
|----------|-----|----------|
| `secondary` | #F4E7C3 | Backgrounds, soft accents |
| `secondary-light` | #FEF6E4 | Light backgrounds, cards |
| `secondary-dark` | #E8D9A8 | Borders, subtle emphasis |

### Sunset Palette (Atmospheric Effects)
| Variable | Hex | Use Case |
|----------|-----|----------|
| `sunset-amber` | #FF9D5C | Warm highlights, progress |
| `sunset-gold` | #FFB84D | Golden hour effects, accents |
| `sunset-peach` | #FFCF9F | Soft warmth, backgrounds |
| `sunset-coral` | #FF8A5B | Energetic accents, badges |
| `sunset-rose` | #F4A5B9 | Delicate touches, overlays |
| `sunset-violet` | #A17FB5 | Twilight depth, shadows |

### Dark Theme
| Variable | Hex | Use Case |
|----------|-----|----------|
| `twilight-navy` | #3D3066 | Base dark color |
| `twilight-indigo` | #6B5B95 | Medium dark, overlays |
| `midnight` | #0A0E1A | Deepest dark, shadows |
| `horizon-cream` | #FFEFD5 | Light text on dark |

### Status Colors
| Variable | Hex | Use Case |
|----------|-----|----------|
| `success` | #8BC34A | Completed, positive actions |
| `warning` | #FFB74D | Warnings, caution |
| `danger` | #FF7043 | Errors, critical alerts |
| `info` | #64B5F6 | Information, neutral states |

## Best Practices

1. **Always use theme-aware colors**: Check `isDark` prop and provide both dark/light variants
2. **Use utility classes**: Prefer `.gradient-title-dark` over repeating gradient code
3. **Maintain contrast**: Ensure text is readable on all backgrounds
4. **Be consistent**: Use the same patterns for similar UI elements
5. **Leverage the sunset palette**: Use for atmospheric effects, not primary UI elements
6. **Test both themes**: Always verify your UI in both dark and light modes

## Common Patterns

### Card with Title and Description
```jsx
<div className={`
  rounded-3xl p-6 border
  ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-secondary/30'}
`}>
  <h3 className={isDark ? 'gradient-title-dark' : 'gradient-title-light'}>
    Card Title
  </h3>
  <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
    Description text
  </p>
</div>
```

### Progress Indicator
```jsx
<div className={`h-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
  <div className="h-full bg-gradient-to-r from-sunset-coral via-sunset-gold to-sunset-amber" 
       style={{ width: `${progress}%` }} />
</div>
```

### Badge/Tag
```jsx
<span className={`
  px-3 py-1 rounded-full text-sm font-semibold
  ${isDark 
    ? 'bg-gradient-to-r from-sunset-amber/35 to-sunset-gold/30 text-horizon-cream' 
    : 'bg-gradient-to-r from-sunset-peach/50 to-sunset-gold/30 text-twilight-navy'
  }
`}>
  Badge
</span>
```

---

**Last Updated**: 2025-11-03
**Version**: 1.0
**Status**: Active Reference
