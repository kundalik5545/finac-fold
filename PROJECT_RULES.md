# Project Rules & Conventions

This document defines the project-specific rules and conventions for the finance asset tracking application.

## Table of Contents

- [Project Overview](#project-overview)
- [File Structure & Organization](#file-structure--organization)
- [Naming Conventions](#naming-conventions)
- [TypeScript Rules](#typescript-rules)
- [Component Patterns](#component-patterns)
- [API Routes](#api-routes)
- [Form Validation](#form-validation)
- [Styling Conventions](#styling-conventions)
- [Database & Prisma](#database--prisma)
- [Code Quality](#code-quality)

---

## Project Overview

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS 4
- **Database**: Prisma with PostgreSQL
- **Authentication**: Better Auth
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## File Structure & Organization

### Directory Structure

```
app/
  (auth)/          # Authentication routes
  (main)/          # Main application routes
  (stats)/         # Statistics/dashboard routes
  (upload)/        # Upload routes
  api/             # API routes
  generated/       # Generated Prisma types (auto-generated)

components/
  ui/              # shadcn/ui components
  app-layout/      # Layout components
  custom-componetns/ # Custom application components

lib/               # Utility functions, schemas, types
hooks/             # Custom React hooks
providers/         # React context providers
data/              # Static data files
```

### Component Organization

- **Page Components**: Located in `app/(group)/route/page.tsx`
- **Page-specific Components**: Located in `app/(group)/route/_components/`
- **Shared Components**: Located in `components/custom-componetns/`
- **UI Components**: Located in `components/ui/` (shadcn components)

### File Naming

- **Components**: PascalCase (e.g., `AssetsTable.tsx`, `EditAssetForm.tsx`)
- **Hooks**: camelCase with `use-` prefix (e.g., `use-formatCurrency.ts`, `use-mobile.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`, `form-schema.ts`)
- **Types**: kebab-case (e.g., `ts-types.ts`)
- **API Routes**: `route.ts` (Next.js convention)
- **Page Files**: `page.tsx` (Next.js convention)
- **Layout Files**: `layout.tsx` (Next.js convention)

---

## Naming Conventions

### Variables & Functions

- Use `camelCase` for variables and functions
- Use descriptive names that indicate purpose
- Prefix boolean variables with `is`, `has`, `should` (e.g., `isLoading`, `hasError`)

### Components

- Use `PascalCase` for component names
- Component files should match component name exactly
- Export components as named exports (not default exports)

### Types & Interfaces

- Use `PascalCase` for types and interfaces
- Prefix types with descriptive names (e.g., `AssetType`, `LoadingStates`)
- Define types in `lib/ts-types.ts` for shared types
- Define component-specific types near the component

### Constants

- Use `UPPER_SNAKE_CASE` for constants
- Group related constants in objects or enums

---

## TypeScript Rules

### Type Safety

- **Always use TypeScript strict mode** (enabled in `tsconfig.json`)
- Avoid `any` type - use `unknown` if type is truly unknown
- Use type inference where possible, but be explicit for function parameters and return types
- Use `as const` for literal types when needed

### Type Definitions

- Define shared types in `lib/ts-types.ts`
- Import types from Prisma models: `import { Asset } from "@/app/generated/prisma/models/Asset"`
- Use Zod schemas for runtime validation (see [Form Validation](#form-validation))

### Path Aliases

- Use `@/*` alias for imports from project root
- Common aliases:
  - `@/components` - UI components
  - `@/lib` - Utilities and schemas
  - `@/hooks` - Custom hooks
  - `@/components/ui` - shadcn components

### Example

```typescript
import { Asset } from "@/lib/ts-types";
import { Button } from "@/components/ui/button";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
```

---

## Component Patterns

### Client Components

- Add `"use client"` directive at the top of client components
- Use client components for:
  - Interactive elements (buttons, forms)
  - State management (`useState`, `useEffect`)
  - Browser APIs (localStorage, window)
  - Event handlers

### Server Components

- Default to Server Components (no directive needed)
- Use server components for:
  - Data fetching
  - Direct database access
  - Static content

### Component Structure

```typescript
"use client"; // Only if needed

import { ... } from "...";

// Types (if component-specific)
type ComponentProps = {
  // ...
};

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const router = useRouter();
  const [state, setState] = useState();

  // Helper functions
  const handleAction = () => {
    // ...
  };

  // Render
  return (
    // JSX
  );
}
```

### Props

- Always type component props explicitly
- Use destructuring for props
- Provide default values where appropriate

---

## API Routes

### File Location

- API routes: `app/api/[resource]/route.ts`
- Dynamic routes: `app/api/[resource]/[id]/route.ts`

### Route Handlers

- Export named functions: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Use proper HTTP methods
- Return proper status codes
- Handle errors gracefully

### Example Structure

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addAssetSchema } from "@/lib/form-schema";

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = addAssetSchema.parse(body);
    // Implementation
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "..." }, { status: 400 });
  }
}
```

### Error Handling

- Always wrap API logic in try-catch blocks
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging (server-side only)

---

## Form Validation

### Schema Definition

- Define Zod schemas in `lib/form-schema.ts`
- Use descriptive schema names (e.g., `addAssetSchema`, `updateAssetSchema`)
- Export schemas for reuse

### Form Patterns

- Use React Hook Form with Zod resolver
- Use shadcn Form components
- Validate on submit and on blur
- Show field-level error messages

### Example

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAssetSchema } from "@/lib/form-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const form = useForm({
  resolver: zodResolver(addAssetSchema),
  defaultValues: {
    /* ... */
  },
});
```

---

## Styling Conventions

### Tailwind CSS

- Use Tailwind utility classes for styling
- Follow mobile-first responsive design
- Use dark mode variants: `dark:bg-slate-900`
- Prefer Tailwind classes over custom CSS

### Component Styling

- Use shadcn/ui components as base
- Customize with Tailwind classes
- Use `cn()` utility from `@/lib/utils` for conditional classes

### Color Scheme

- Base color: Slate (as per `components.json`)
- Use CSS variables for theming
- Support dark mode throughout

### Responsive Design

- Use `useIsMobile()` hook for mobile detection
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Test on mobile and desktop views

### Example

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "flex items-center gap-2",
  isMobile && "flex-col",
  "dark:bg-slate-900"
)}>
```

---

## Database & Prisma

### Schema Definition

- Define models in `prisma/schema.prisma`
- Use descriptive model and field names
- Add appropriate indexes and constraints
- Use enums for fixed value sets

### Database Access

- Use Prisma Client from `@/lib/prisma`
- Never import Prisma Client directly - use the singleton instance
- Handle database errors appropriately

### Migrations

- Run migrations: `npx prisma migrate dev`
- Always provide descriptive migration names
- Review migration SQL before applying

### Generated Types

- Use generated Prisma types from `@/app/generated/prisma/models/`
- Don't manually edit generated files
- Regenerate types after schema changes: `npx prisma generate`

---

## Code Quality

### ESLint

- Follow Next.js ESLint configuration
- Run `npm run lint` before committing
- Fix all linting errors

### Code Organization

- Group imports: external → internal → relative
- Separate imports with blank lines
- Order: React → Next.js → UI → Utils → Types

### Comments

- Write self-documenting code
- Add comments for complex logic
- Use JSDoc for public APIs

### Error Handling

- Use try-catch for async operations
- Show user-friendly error messages
- Use toast notifications for user feedback (Sonner)

### Performance

- Use React Server Components where possible
- Lazy load heavy components
- Optimize images with Next.js Image component
- Use proper caching strategies for API routes

---

## Currency & Localization

### Currency Formatting

- Use `useFormatCurrency` hook for currency display
- Default locale: `en-IN` (Indian English)
- Default currency: `INR`
- Format: Indian number system (lakhs, crores)

### Date Formatting

- Use `date-fns` for date manipulation
- Format dates as: `DD MMM YYYY` (e.g., "15 Jan 2024")
- Use Indian date format: `en-IN` locale

### Example

```typescript
const { formatCurrency } = useFormatCurrency("en-IN", "INR");
const formattedValue = formatCurrency(1000000); // ₹10,00,000.00
```

---

## Authentication

### Better Auth

- Use Better Auth for authentication
- Client-side auth: `@/lib/auth-client`
- Server-side auth: `@/lib/auth`
- Protect routes using middleware or server-side checks

### User Context

- Access user session in server components
- Use auth client hooks in client components
- Handle loading and error states

---

## Testing & Development

### Development Workflow

1. Create feature branch
2. Write code following these rules
3. Test locally (`npm run dev`)
4. Run linter (`npm run lint`)
5. Commit with descriptive messages

### Git Conventions

- Use descriptive commit messages
- Commit related changes together
- Don't commit generated files

---

## Additional Notes

- **Icons**: Use Lucide React icons (`lucide-react`)
- **Notifications**: Use Sonner toast for user feedback
- **Forms**: Always validate on both client and server side
- **Loading States**: Show loading indicators for async operations
- **Error States**: Provide clear error messages and recovery options

---

## Questions or Updates

If you need to add or modify rules, update this document and communicate changes to the team.
