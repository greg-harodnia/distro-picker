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
│   │   │   ├── DistroPanel.svelte
│   │   │   ├── ErrorDisplay.svelte
│   │   │   ├── LoadingSpinner.svelte
│   │   │   ├── TagFilter.svelte
│   │   │   ├── ThemeToggle.svelte
│   │   │   ├── OptimizedImage.svelte
│   │   │   └── *Skeleton.svelte
│   │   ├── stores/
│   │   │   ├── index.ts
│   │   │   └── theme.ts
│   │   ├── utils/
│   │   │   ├── data.ts
│   │   │   ├── focusTrap.ts
│   │   │   ├── index.ts
│   │   │   └── validation.ts
│   │   ├── types.ts
│   │   ├── distros.json
│   │   └── tags.json
│   └── routes/
│       ├── +layout.svelte
│       ├── +layout.server.js
│       └── +page.svelte
├── static/
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.js
└── README.md
```

**Find Your Perfect Linux Distribution Today! 🐧**
