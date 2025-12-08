<!-- eb392d8c-a88c-4b87-8e8f-74907f3960aa 0ecbf824-b5dd-4137-b45c-5620a8542dde -->
# Transactions Feature Implementation

## Overview

Create a standalone Transactions feature page that allows users to view, filter, add, edit, and delete transactions across all bank accounts with comprehensive filtering, charts, and pagination.

## Current State

- Transaction model exists in Prisma schema with all required fields
- Transaction types and schemas exist in `lib/bank-account-types.ts` and `lib/bank-account-schema.ts`
- Action functions exist: `getTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction` in `action/bank-account.ts`
- API route exists for GET and POST at `/api/bank-account/transactions/route.ts`
- Missing: Transactions feature page, UPDATE/DELETE API routes, enhanced filtering, pagination, and charts

## Implementation Plan

### 1. API Routes

**Create `/app/api/transactions/route.ts`**

- GET: Fetch all transactions with filters (category, subcategory, type, payment method, status, date range)
- POST: Create new transaction (can reuse existing route or create dedicated one)

**Create `/app/api/transactions/[id]/route.ts`**

- GET: Fetch single transaction by ID
- PUT: Update transaction
- DELETE: Delete transaction

### 2. Enhanced Action Functions

**Update `action/bank-account.ts`**

- Enhance `getTransactions` to support:
  - Payment method filter
  - Transaction status filter
  - Monthly/weekly/daily preset filters
  - Pagination (skip, take parameters)
  - Return total count for pagination

### 3. Transaction Types & Schemas

**Verify/Update `lib/bank-account-types.ts`**

- Ensure Transaction type includes relations (category, subCategory, bankAccount)
- Add TransactionWithRelations type if needed

**Verify `lib/bank-account-schema.ts`**

- Transaction schemas already exist

### 4. Main Transactions Page

**Create `/app/(main)/transactions/page.tsx`**

- Server component that fetches initial transactions
- Displays TransactionClient component
- Shows stats (total income, total expense, net balance)

### 5. Transaction Components

**Create `/app/(main)/transactions/_components/TransactionClient.tsx`**

- Client component managing view state
- Toggle between table view (default)
- Manages filter state and pagination
- Renders filters, charts, and table

**Create `/app/(main)/transactions/_components/TransactionFilters.tsx`**

- Comprehensive filter UI with:
  - Category and Subcategory dropdowns
  - Transaction type (CREDIT/DEBIT)
  - Payment method (CASH, UPI, CARD, ONLINE, OTHER)
  - Transaction status (PENDING, COMPLETED, FAILED)
  - Date presets: Daily, Weekly, Monthly, Custom date range
  - Bank account filter (optional)
- Apply and Clear buttons
- Filters update charts and table dynamically

**Create `/app/(main)/transactions/_components/TransactionTable.tsx`**

- Table view with columns:
  - Date
  - Description
  - Category/Subcategory (with icons/colors)
  - Amount (color-coded: green for credit, red for debit)
  - Payment Method
  - Status (badge)
  - Bank Account (if applicable)
  - Actions (Edit, Delete)
- Pagination controls (Previous, Next, page info)
- Optimized query loading (load more on next page)
- Responsive design

**Create `/app/(main)/transactions/_components/TransactionDonutChart.tsx`**

- Donut chart showing Income vs Expense percentage
- Uses recharts PieChart component
- Follows pattern from `GoalsDonutChart.tsx`
- Updates based on active filters

**Create `/app/(main)/transactions/_components/TransactionBarChart.tsx`**

- Bar chart showing transaction amounts over time
- X-axis changes based on filter:
  - Daily: Show by day
  - Weekly: Show by week
  - Monthly: Show by month
  - Custom range: Show by day or week based on range
- Separate bars for Income (CREDIT) and Expense (DEBIT)
- Follows pattern from `GoalsBarChart.tsx` and `BankAccountBarChart.tsx`
- Updates based on active filters

**Create `/app/(main)/transactions/_components/TransactionStats.tsx`**

- Display cards showing:
  - Total Income
  - Total Expense
  - Net Balance
- Updates based on filtered transactions

### 6. Transaction Forms

**Create `/app/(main)/transactions/add/page.tsx`**

- Add transaction page with form
- Uses TransactionForm component

**Create `/app/(main)/transactions/add/_components/TransactionForm.tsx`**

- Form with fields:
  - Amount (number input)
  - Transaction Type (CREDIT/DEBIT radio or select)
  - Date (date picker)
  - Category (select with icon/color display)
  - Subcategory (select, filtered by category)
  - Payment Method (select)
  - Status (select, default PENDING)
  - Bank Account (optional select)
  - Description (textarea)
  - Currency (select, default INR)
- Uses shadcn form components
- Validation using transactionFormSchema
- Submit creates transaction via API

**Create `/app/(main)/transactions/edit/[id]/page.tsx`**

- Edit transaction page
- Fetches transaction data
- Uses TransactionForm component with pre-filled data

**Create `/app/(main)/transactions/edit/[id]/_components/EditTransactionForm.tsx`**

- Similar to TransactionForm but for editing
- Pre-fills form with existing transaction data
- Submit updates transaction via API

### 7. Utility Functions

**Create helper functions for date filtering**

- Functions to calculate date ranges for daily/weekly/monthly presets
- Helper to group transactions by time period for charts

### 8. Styling & Responsiveness

- Use Tailwind CSS with responsive grid/flex layouts
- Mobile-friendly filter UI (collapsible or stacked)
- Responsive table (scrollable on mobile)
- Charts responsive using ResponsiveContainer from recharts

## File Structure

```
app/(main)/transactions/
├── page.tsx
├── _components/
│   ├── TransactionClient.tsx
│   ├── TransactionFilters.tsx
│   ├── TransactionTable.tsx
│   ├── TransactionDonutChart.tsx
│   ├── TransactionBarChart.tsx
│   └── TransactionStats.tsx
├── add/
│   ├── page.tsx
│   └── _components/
│       └── TransactionForm.tsx
└── edit/
    └── [id]/
        ├── page.tsx
        └── _components/
            └── EditTransactionForm.tsx

app/api/transactions/
├── route.ts
└── [id]/
    └── route.ts
```

## Notes

- Follow existing patterns from bank-account and goals features
- Use shadcn components throughout
- Add comments for peer review
- All API responses include status codes from `lib/status-code.ts`
- Components are modular and reusable
- Use `useFormatCurrency` hook for currency formatting
- Charts update reactively based on filter changes
- Pagination loads more transactions efficiently (cursor-based or offset-based)
- Transaction table shows category/subcategory with icons and colors from existing components

### To-dos

- [ ] Create API routes: /api/transactions/route.ts (GET, POST) and /api/transactions/[id]/route.ts (GET, PUT, DELETE)
- [ ] Enhance getTransactions function in action/bank-account.ts to support payment method, status filters, date presets, and pagination
- [ ] Verify and update Transaction types in lib/bank-account-types.ts to include relations (category, subCategory, bankAccount)
- [ ] Create app/(main)/transactions/page.tsx with TransactionClient and stats
- [ ] Create TransactionClient component managing view state, filters, and pagination
- [ ] Create TransactionFilters component with all filter options (category, subcategory, type, payment method, status, date presets)
- [ ] Create TransactionTable component with pagination and responsive design
- [ ] Create TransactionDonutChart and TransactionBarChart components that update based on filters
- [ ] Create TransactionStats component showing total income, expense, and net balance
- [ ] Create add transaction page and TransactionForm component
- [ ] Create edit transaction page and EditTransactionForm component
- [ ] Create utility functions for date filtering (daily/weekly/monthly presets) and transaction grouping for charts