# Linux Distribution Picker

A modern Linux distribution picker built with SvelteKit to help users find the perfect Linux distribution for their needs based on gaming, development, user-friendliness, and other criteria.

![Linux Distro Picker](https://img.shields.io/badge/SvelteKit-5.50.1-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

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
├── src/
│   ├── app.css
│   ├── app.html
│   ├── lib/
│   │   ├── components/
│   │   │   ├── DistroGrid.svelte
│   │   │   ├── DistroGridSkeleton.svelte
│   │   │   ├── DistroPanel.svelte
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
│   │   ├── data/
│   │   ├── i18n/
│   │   │   ├── locale.ts
│   │   │   └── translations.ts
│   │   ├── stores/
│   │   ├── supabase.ts
│   │   ├── types/
│   │   ├── utils/
│   │   ├── distros.json
│   │   └── tags.json
│   └── routes/
│       ├── +layout.svelte
│       └── +page.svelte
├── static/
│   └── screenshots/
├── package.json
├── svelte.config.js
├── tsconfig.json
└── README.md
```

## 🗄️ Database Structure (Supabase)

### 'distros' table

| Column | Type | Description |
|--------|------|-------------|
| id | int8 | Primary key |
| name | varchar | Distro identifier (same as 'id' in distros.json) |
| likes | int2 | Number of likes |

## 🌐 Supported Languages

The app supports the following languages for browsers and search engines:
- **English (en)** - Default language
- **Belarusian (be)** - Беларуская

Language detection is based on browser language preferences and system timezone.

<br>**Find Your Perfect Linux Distribution Today! 🐧**
