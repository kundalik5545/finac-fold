This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

This project requires the following environment variables to be set:

### Required Environment Variables

1. **NEXT_PUBLIC_BASE_URL** - Your application's base URL

   - **Local Development**: `http://localhost:3000`
   - **Production**: Your deployed app URL (e.g., `https://your-app.vercel.app` or `https://yourdomain.com`)
   - This is used by the authentication client to make API requests

2. **DATABASE_URL** - Supabase PostgreSQL connection string (pooled connection for application runtime)
   - Get this from your Supabase project: Settings > Database > Connection string
   - Use the **Connection pooling** mode (port 6543) for better performance
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1`
   - Example: `postgresql://postgres:password@xxxxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1`

3. **SHADOW_DATABASE_URL** - Supabase PostgreSQL direct connection string (required for Prisma migrations)
   - Get this from your Supabase project: Settings > Database > Connection string
   - Use the **Direct connection** mode (port 5432) - **NOT** the pooled connection
   - This is required for `prisma db push` and migrations because Prisma uses prepared statements
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres`
   - Example: `postgresql://postgres:password@xxxxx.supabase.co:5432/postgres`
   - **Important**: Do NOT add `?pgbouncer=true` to this URL

### Optional Environment Variables

- **BETTER_AUTH_URL** - Override URL for auth endpoints (defaults to NEXT_PUBLIC_BASE_URL)

### Setting Up Environment Variables

1. Create a `.env.local` file in the root directory
2. Add the required variables:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   DATABASE_URL=postgresql://postgres:password@xxxxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   SHADOW_DATABASE_URL=postgresql://postgres:password@xxxxx.supabase.co:5432/postgres
   ```
   **Note**: `DATABASE_URL` uses port 6543 (pooled), while `SHADOW_DATABASE_URL` uses port 5432 (direct connection)
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

## Troubleshooting

### "prepared statement 's1' already exists" Error

If you encounter this error when running `prisma db push` or migrations, it means you're using a pooled connection (PgBouncer) which doesn't support prepared statements required by Prisma migrations.

**Solution**: Ensure you have set the `SHADOW_DATABASE_URL` environment variable with a direct connection (port 5432, without `?pgbouncer=true`) as described above. The `prisma.config.ts` file is configured to use `SHADOW_DATABASE_URL` for migrations, while your application uses `DATABASE_URL` (pooled connection) for runtime.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
