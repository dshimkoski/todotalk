# TodoTalk - AI Coding Agent Instructions

## Project Overview
TodoTalk is a Next.js 16 application with React 19, using the App Router architecture, TypeScript strict mode, and Tailwind CSS v4. The project is configured with React Compiler (experimental) for optimized rendering.

## Tech Stack & Key Dependencies
- **Framework**: Next.js 16.0.7 (App Router)
- **React**: v19.2.0 (with React Compiler enabled)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Fonts**: Geist Sans & Geist Mono (via `next/font`)
- **TypeScript**: Strict mode with path aliases (`@/*` → `./src/*`)
- **Linting**: ESLint v9 with Next.js config (flat config format)
- **Formatting**: Prettier with plugins for Tailwind, import sorting, and package.json

## Project Structure
```
src/
  app/          # Next.js App Router pages & layouts
  components/   # React components (currently empty - ready for new components)
  hooks/        # Custom React hooks (currently empty)
  lib/          # Utility functions and shared logic (currently empty)
  server/       # Server-side code, actions, API utilities (currently empty)
  styles/       # Global CSS (globals.css with Tailwind v4 @theme)
  types/        # TypeScript type definitions
```

## Architecture Decisions

### React Compiler
- **Enabled in `next.config.ts`** with `reactCompiler: true`
- Automatically optimizes component rendering without manual memoization
- Avoid using `useMemo`, `useCallback`, or `React.memo` unless explicitly needed for non-rendering concerns
- The compiler handles most optimization automatically

### Tailwind CSS v4
- Uses new `@import "tailwindcss"` syntax in `globals.css`
- Custom theme defined inline with `@theme inline` directive
- CSS variables for theming: `--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`
- No separate `tailwind.config.js` file - configuration is in CSS

### TypeScript Configuration
- Strict mode enabled with additional rules:
  - `@typescript-eslint/no-floating-promises: error`
  - `@typescript-eslint/no-misused-promises: error`
  - `@typescript-eslint/consistent-type-imports: warn`
- Always use type imports: `import type { Type } from 'module'`
- Path alias `@/` resolves to `src/`

## Development Workflow

### Commands
```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint with flat config
```

### Code Formatting
Prettier runs automatically with these plugins (in order):
1. `prettier-plugin-organize-imports` - Auto-sorts imports
2. `prettier-plugin-tailwindcss` - Auto-sorts Tailwind classes
3. `prettier-plugin-packagejson` - Formats package.json

Settings: No semicolons, single quotes

## Coding Patterns

### Component Creation
- Place new components in `src/components/`
- Use TypeScript with explicit prop types
- Leverage React Compiler optimizations (avoid manual memoization)
- Example structure:
  ```tsx
  import type { ComponentProps } from 'react'
  
  interface MyComponentProps {
    title: string
  }
  
  export function MyComponent({ title }: MyComponentProps) {
    return <div>{title}</div>
  }
  ```

### Styling Conventions
- Use Tailwind utility classes (v4 syntax)
- Dark mode: Use `dark:` prefix (prefers-color-scheme media query)
- Font variables: `font-sans` (Geist Sans), `font-mono` (Geist Mono)
- Reference `src/app/page.tsx` for responsive layout patterns

### Server vs Client
- Default to Server Components (no 'use client')
- Add `'use client'` only when using hooks, event handlers, or browser APIs
- Put Server Actions in `src/server/` directory when created
- Use type-safe async patterns (ESLint enforces promise handling)

## Empty Directories
The following directories exist but are empty - they're ready for new code:
- `src/components/` - Add React components here
- `src/hooks/` - Add custom hooks here
- `src/lib/` - Add utilities and shared logic here
- `src/server/` - Add Server Actions and API code here

## Important Files
- `src/app/layout.tsx` - Root layout with font configuration and metadata
- `src/styles/globals.css` - Tailwind v4 config with CSS variables and dark mode
- `eslint.config.mjs` - Flat config format with strict TypeScript rules
- `.prettierrc` - Formatter config with plugin chain
