<!-- 3e913177-cc21-4126-bd0e-492fbc4d70ea 0e1ca6d8-120b-45a0-a4a2-490b9d742027 -->
# Bank Account Feature Implementation

## Overview

Create a comprehensive Bank Account feature that allows users to add, edit, and delete bank accounts, track transactions, and view detailed analytics with charts and filters.

## Database Schema

### Prisma Models

- **BankAccount** (`prisma/schema.prisma`):
- Fields: id, name, accountNumber, bankName, accountType (enum: SAVINGS, SALARY, WALLET, OTHER), ifscCode, branch, startingBalance (Decimal), icon, color, description, userId, createdAt, updatedAt
- Relations: user, transactions
- Indexes: userId, accountNumber

- **BankTransaction** (`prisma/schema.prisma`):
- Fields: id, amount (Decimal), date, type (enum: CREDIT, DEBIT), description, categoryId, subcategoryId, bankAccountId, userId, createdAt, updatedAt
- Relations: bankAccount, category, subcategory, user
- Indexes: bankAccountId, userId, date, type

- **TransactionCategory** (`prisma/schema.prisma`):
- Fields: id, name, icon, color, userId, createdAt, updatedAt
- Relations: user, transactions, subcategories
- Unique: userId + name

- **TransactionSubcategory** (`prisma/schema.prisma`):
- Fields: id, name, icon, color, categoryId, userId, createdAt, updatedAt
- Relations: category, user, transactions
- Unique: userId + categoryId + name

- **Enums**: `AccountType` (SAVINGS, CHECKING, CURRENT, OTHER), `TransactionType` (CREDIT, DEBIT)

## File Structure

### Types & Schemas

- `lib/bank-account-types.ts` - TypeScript types for bank accounts and transactions
- `lib/bank-account-schema.ts` - Zod schemas for validation

### Server Actions

- `action/bank-account.ts` - CRUD operations for bank accounts
- Functions: `getBankAccounts`, `getBankAccount`, `createBankAccount`, `updateBankAccount`, `deleteBankAccount`, `getTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction`, `getCategories`, `createCategory`, `getSubcategories`, `createSubcategory`, `calculateBalance`

### API Routes

- `app/api/bank-account/route.ts` - GET (list), POST (create)
- `app/api/bank-account/[id]/route.ts` - GET (single), PUT (update), DELETE
- `app/api/bank-account/[id]/transactions/route.ts` - GET (list), POST (create)
- `app/api/bank-account/[id]/transactions/[transactionId]/route.ts` - PUT (update), DELETE
- `app/api/bank-account/categories/route.ts` - GET (list), POST (create)
- `app/api/bank-account/subcategories/route.ts` - GET (list), POST (create)

### Pages

- `app/(main)/bank-account/page.tsx` - Main list page with stats
- `app/(main)/bank-account/add/page.tsx` - Add bank account form
- `app/(main)/bank-account/edit/[id]/page.tsx` - Edit bank account form
- `app/(main)/bank-account/[id]/page.tsx` - Detail page with transactions, filters, and charts

### Components

- `app/(main)/bank-account/_components/BankAccountCard.tsx` - Card component for list view
- `app/(main)/bank-account/_components/BankAccountClient.tsx` - Main client component with card/table toggle
- `app/(main)/bank-account/_components/BankAccountStats.tsx` - Stats cards (total accounts, total balance, current month spending)
- `app/(main)/bank-account/_components/BankAccountDonutChart.tsx` - Donut chart for weekly/monthly spending comparison
- `app/(main)/bank-account/_components/BankAccountBarChart.tsx` - Bar chart for weekly/monthly comparison
- `app/(main)/bank-account/[id]/_components/BankAccountDetailView.tsx` - Detail page header with balance, income, expense
- `app/(main)/bank-account/[id]/_components/BankAccountTransactionTable.tsx` - Transaction table with filters
- `app/(main)/bank-account/[id]/_components/BankAccountLineChart.tsx` - Line chart for transaction trends (daily/weekly/monthly/date range)
- `app/(main)/bank-account/[id]/_components/BankAccountCategoryDonutChart.tsx` - Donut chart for income/expense categories
- `app/(main)/bank-account/[id]/_components/TransactionFilters.tsx` - Filter component (date range, credit/debit, categories, subcategories)
- `app/(main)/bank-account/add/_components/BankAccountForm.tsx` - Add form component
- `app/(main)/bank-account/edit/[id]/_components/BankAccountEditForm.tsx` - Edit form component

## Key Features

### Main Page (`/bank-account`)

- Display bank accounts as responsive cards
- Stats section: total accounts, total balance, current month spending analytics
- Donut and bar charts for weekly/monthly spending comparison
- Add button to create new bank account
- Card click navigates to detail page

### Detail Page (`/bank-account/[id]`)

- Back button (using `back-button.tsx`)
- Total balance (calculated from transactions)
- Total income and total expense
- Transaction table with filters:
- Date range picker
- Credit/Debit toggle
- Category dropdown
- Subcategory dropdown
- Line chart for transactions (daily/weekly/monthly/date range selector)
- Donut chart for income/expense categories (using color-picker colors and icon-picker icons)
- Responsive layout

### Forms

- Add/Edit forms use color-picker and icon-picker components
- Form validation using Zod schemas
- API responses use status codes from `lib/status-code.ts`

## Implementation Details

### Balance Calculation

- Balance = startingBalance + sum(credit transactions) - sum(debit transactions)
- Calculated on-the-fly when displaying, not stored in database
- Helper function `calculateBalance` in `action/bank-account.ts`

### Transaction Filtering

- Client-side filtering similar to `TodoClient.tsx` pattern
- Support date range, transaction type, category, subcategory
- Filter state management in `BankAccountTransactionTable`

### Charts

- Use recharts library (already in project)
- Follow patterns from `GoalsDonutChart.tsx`, `GoalsBarChart.tsx`, `AssetsLineChart.tsx`
- Responsive containers
- Currency formatting using `useFormatCurrency` hook

### Responsive Design

- Grid layout for cards (1 col mobile, 2 cols tablet, 3 cols desktop)
- Flex layouts for stats and filters
- Mobile-friendly filter UI

## Migration

- Create Prisma migration after schema updates
- Run `prisma migrate dev` with descriptive name

## Notes

- Follow existing patterns from assets-tracking and goals features
- Use shadcn components throughout
- Add comments for peer review
- All API responses include status codes
- Components are modular and reusable

### To-dos

- [x] Create Prisma schema models: BankAccount, BankTransaction, TransactionCategory, TransactionSubcategory with enums and relations
- [x] Create lib/bank-account-types.ts and lib/bank-account-schema.ts with TypeScript types and Zod validation schemas
- [x] Create action/bank-account.ts with CRUD operations for accounts, transactions, categories, and balance calculation
- [x] Create API routes: /api/bank-account, /api/bank-account/[id], /api/bank-account/[id]/transactions, /api/bank-account/categories, /api/bank-account/subcategories
- [ ] Create app/(main)/bank-account/page.tsx with stats and list view
- [ ] Create BankAccountCard and BankAccountClient components for list view with responsive grid
- [ ] Create BankAccountStats, BankAccountDonutChart, and BankAccountBarChart components for main page analytics
- [ ] Create add and edit pages with forms using color-picker and icon-picker components
- [ ] Create app/(main)/bank-account/[id]/page.tsx with back button, balance display, and transaction section
- [ ] Create BankAccountTransactionTable component with filtering (date range, credit/debit, categories, subcategories)
- [ ] Create BankAccountLineChart and BankAccountCategoryDonutChart components for detail page visualization
- [x] Run Prisma migration to create database tables