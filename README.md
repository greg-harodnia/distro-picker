# Linux Distribution Picker

A modern Linux distribution picker built with SvelteKit to help users find the perfect Linux distribution for their needs based on gaming, development, user-friendliness, and other criteria.

![Linux Distro Picker](https://img.shields.io/badge/Svelte-5.50.1-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

### Install dependencies

```bash
bun install
```

### Start development server

```bash
bun run dev
```

### Create production build

```bash
bun run build
```

### Preview production build

```bash
bun run preview
```

## 📁 Project Structure

```
distro-picker/
├── docs/
│   ├── SEO.png
│   └── SEO_mobile.png
├── src/
│   ├── app.css
│   ├── app.html
│   ├── lib/
│   │   ├── components/
│   │   │   ├── DistroGrid.svelte
│   │   │   ├── DistroGridSkeleton.svelte
│   │   │   ├── DistroModal.svelte
│   │   │   ├── ErrorDisplay.svelte
│   │   │   ├── GalleryModal.svelte
│   │   │   ├── InfoModal.svelte
│   │   │   ├── LanguageToggle.svelte
│   │   │   ├── LoadingSpinner.svelte
│   │   │   ├── OptimizedImage.svelte
│   │   │   ├── QuickTestModal.svelte
│   │   │   ├── TagFilter.svelte
│   │   │   ├── TagSkeleton.svelte
│   │   │   └── ThemeToggle.svelte
│   │   ├── i18n/
│   │   │   ├── locale.ts
│   │   │   └── translations.ts
│   │   ├── locales/
│   │   │   ├── types.ts      # Type definitions
│   │   │   ├── en.json       # English (bundled, used for SSR)
│   │   │   └── en_old.json
│   │   ├── stores/
│   │   │   ├── index.ts
│   │   │   └── theme.ts
│   │   ├── types/
│   │   │   └── quiz.ts
│   │   ├── utils/
│   │   │   ├── body.ts
│   │   │   ├── data.ts
│   │   │   ├── imageObserver.ts
│   │   │   ├── index.ts
│   │   │   ├── storage.ts
│   │   │   └── validation.ts
│   │   ├── distros.json
│   │   ├── supabase.ts
│   │   ├── tags.json
│   │   └── types.ts
│   └── routes/
│       ├── +layout.server.js
│       ├── +layout.svelte
│       ├── +page.server.ts
│       └── +page.svelte
├── static/
│   ├── locales/              # Translation files loaded via fetch
│   ├── screenshots/          # Distro screenshots
│   ├── _headers
│   ├── .nojekyll
│   ├── robots.txt
│   ├── sitemap.xml
│   └── *.webp/*.svg          # Distro logo images
├── package.json
├── svelte.config.js
├── tsconfig.json
└── README.md
```

## 🗄️ Database Structure (Supabase)

### 'distros' table

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (same as 'id' in distros.json) |
| likes | int2 | Number of likes |

Row Level Security (RLS) is enabled with public SELECT and UPDATE policies for the anon role.

## 🌐 Supported Languages

The app supports language detection based on browser language and timezone:

| Language | Code | Native Name | Auto-Detect Method |
|----------|------|-------------|-------------------|
| English | `en` | English | Browser default (bundled) |
| Belarusian | `be` | Беларуская | Browser (`be`, `be-BY`, `bel`, `be-tarask`) + Timezone (`Europe/Minsk`) |

### Language Detection

Language is automatically detected based on:
1. **Browser language** - Uses `navigator.language` with fallback
2. **System timezone** - Some languages are also detected by timezone (e.g., Minsk → Belarusian)

Users can manually switch languages using the language toggle. The selected language is stored in `localStorage`.

### Lazy Loading

To optimize performance, translations are lazy-loaded:
- **English** - Bundled with the app (fallback language)
- **Other languages** - Loaded on-demand as JSON files (`/locales/{lang}.json`)

### SEO

The app has a great SEO score (a11y is 96 due to tag color contrasts in the light theme).

![SEO Analysis](docs/SEO.png)

<br>**Find Your Perfect Linux Distribution Today! 🐧**
