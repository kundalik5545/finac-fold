This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

This project requires the following environment variables to be set:

### Required Environment Variables

1. **NEXT_PUBLIC_BASE_URL** - Your application's base URL

   - **Local Development**: `http://localhost:3000`
   - **Production**: Your deployed app URL (e.g., `https://your-app.vercel.app` or `https://yourdomain.com`)
   - This is used by the authentication client to make API requests

2. **DATABASE_URL** - Supabase PostgreSQL connection string
   - Get this from your Supabase project: Settings > Database > Connection string
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres`
   - For connection pooling (recommended): Add `?pgbouncer=true&connection_limit=1` at the end
   - Example: `postgresql://postgres:password@xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`

### Optional Environment Variables

- **BETTER_AUTH_URL** - Override URL for auth endpoints (defaults to NEXT_PUBLIC_BASE_URL)

### Setting Up Environment Variables

1. Create a `.env.local` file in the root directory
2. Add the required variables:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   DATABASE_URL=postgresql://postgres:password@xxxxx.supabase.co:5432/postgres
   ```
3. For production deployments, set these in your hosting platform's environment variables settings:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **Other platforms**: Use their respective environment variable configuration

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
