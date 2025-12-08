<!-- b3e9bbfb-e6c2-40c9-aa3e-f4e2767d4170 245a5223-c17b-421e-b490-b8bf9c069ef7 -->
# Investment Management Feature Implementation Plan

## Overview

Create a new Investment Management feature following the existing codebase patterns (similar to assets-tracking, goals, bank-account). The feature will support multiple investment types with different price update mechanisms and comprehensive tracking.

## Database Schema

### New Prisma Models

1. **Investment Model** (`prisma/schema.prisma`)

- Fields: id, name, type (InvestmentType enum), symbol/ticker (for stocks/MF), icon, color, currentPrice, investedAmount, currentValue, quantity/units, purchaseDate, userId
- Relations: user, investmentTransactions, investmentPriceHistory
- Indexes: userId, type, userId+type

2. **InvestmentTransaction Model** (for FD, NPS, PF manual updates)

- Fields: id, investmentId, amount, date, transactionType (INVEST/WITHDRAW), notes, userId
- Relations: investment, user
- Indexes: investmentId+date, userId

3. **InvestmentPriceHistory Model** (for tracking price changes over time)

- Fields: id, investmentId, price, date, source (MANUAL/API), userId
- Relations: investment, user
- Indexes: investmentId+date, userId

4. **InvestmentType Enum**

- Values: STOCKS, MUTUAL_FUNDS, GOLD, FIXED_DEPOSIT, NPS, PF

### Update Transaction Model

- Add `investmentId` field (optional) to link investments to main Transaction table

## File Structure

### Backend Files

1. **`action/investments.ts`** - Server actions

- `getInvestments(userId, type?)` - Fetch investments (optionally filtered by type)
- `getInvestment(investmentId, userId)` - Get single investment with transactions
- `createInvestment(data, userId)` - Create new investment
- `updateInvestment(investmentId, data, userId)` - Update investment
- `deleteInvestment(investmentId, userId)` - Delete investment
- `getInvestmentTransactions(investmentId, userId)` - Get transaction history
- `createInvestmentTransaction(investmentId, data, userId)` - Add transaction
- `fetchLatestPrices(investmentIds, userId)` - Fetch prices from Alpha Vantage API
- `getInvestmentStats(userId, type?)` - Calculate aggregated stats

2. **`lib/schema/investments-schema.ts`** - Zod schemas

- `investmentFormSchema` - For creating/editing investments
- `investmentTransactionSchema` - For manual transactions
- `fetchPricesSchema` - For price fetching validation

3. **`lib/types/investments-types.ts`** - TypeScript types

- Investment, InvestmentTransaction, InvestmentPriceHistory types
- InvestmentStats type

4. **`app/api/investments/route.ts`** - Main API routes

- GET - List all investments (with optional type filter)
- POST - Create new investment

5. **`app/api/investments/[id]/route.ts`** - Individual investment routes

- GET - Get investment details
- PATCH - Update investment
- DELETE - Delete investment

6. **`app/api/investments/[id]/transactions/route.ts`** - Transaction routes

- GET - Get investment transactions
- POST - Create investment transaction

7. **`app/api/investments/fetch-prices/route.ts`** - Price fetching route

- POST - Fetch latest prices for stocks/MF/Gold from Alpha Vantage

8. **`lib/utils/investment-utils.ts`** - Utility functions

- `calculateProfitLoss(invested, current)` - Calculate P&L
- `formatInvestmentType(type)` - Format type for display
- `getInvestmentIcon(type)` - Get default icon per type
- `groupInvestmentsByType(investments)` - Group investments by type

### Frontend Files

1. **`app/(main)/investments/page.tsx`** - Main investments page

- Shows grouped investment cards (Stocks, MF, Gold, FD, NPS, PF)
- Each card shows aggregated stats (total invested, current value, profit/loss, transaction count)
- "Add Investment" button

2. **`app/(main)/investments/_components/InvestmentTypeCard.tsx`** - Investment type card component

- Displays logo, title, aggregated stats, badges
- Edit/Delete buttons (for type-level actions if needed)
- Clickable to navigate to detail page

3. **`app/(main)/investments/_components/InvestmentsClient.tsx`** - Client component for main page

- Handles state and interactions
- Renders investment type cards in grid

4. **`app/(main)/investments/[type]/page.tsx`** - Investment type detail page

- Shows list of individual investments of selected type
- Stats cards at top (total invested, current value, profit/loss)
- Donut chart (distribution by investment)
- Bar chart (value over time)
- "Add Investment" button
- "Fetch Latest Prices" button (for Stocks/MF/Gold)

5. **`app/(main)/investments/[type]/_components/InvestmentDetailClient.tsx`** - Client component for type detail

- Manages investment list, charts, filters

6. **`app/(main)/investments/[type]/_components/InvestmentCard.tsx`** - Individual investment card

- Shows investment details, current price, profit/loss
- Edit/Delete buttons
- Clickable to navigate to individual investment page

7. **`app/(main)/investments/[type]/_components/InvestmentDonutChart.tsx`** - Donut chart component

- Shows distribution of investments by value

8. **`app/(main)/investments/[type]/_components/InvestmentBarChart.tsx`** - Bar chart component

- Shows value trends over time

9. **`app/(main)/investments/[id]/page.tsx`** - Individual investment detail page

- Stats cards (invested amount, current value, profit/loss %, profit/loss amount)
- Current price display
- Transaction history table
- Price history chart
- "Add Transaction" button (for FD/NPS/PF)
- "Update Price" button (for Stocks/MF/Gold)

10. **`app/(main)/investments/[id]/_components/InvestmentDetailClient.tsx`** - Client component

- Manages investment details, transactions, charts

11. **`app/(main)/investments/add/page.tsx`** - Add investment page

- Form to create new investment

12. **`app/(main)/investments/add/_components/InvestmentForm.tsx`** - Investment form component

- Form fields based on investment type
- Uses icon-picker and color-picker components
- Validates and submits investment data

13. **`app/(main)/investments/edit/[id]/page.tsx`** - Edit investment page

- Pre-filled form for editing

14. **`app/(main)/investments/edit/[id]/_components/EditInvestmentForm.tsx`** - Edit form component

- Similar to InvestmentForm but pre-populated

## Implementation Details

### Alpha Vantage Integration

- Create utility function in `lib/utils/alpha-vantage.ts` to fetch prices
- Use Alpha Vantage API endpoints:
- Stocks: `TIME_SERIES_DAILY` endpoint
- Mutual Funds: May need alternative API or manual entry
- Gold: Commodity prices endpoint
- Handle API rate limits and errors gracefully
- Store API key in environment variables

### Transaction Integration

- When creating investment or adding transaction, also create entry in main Transaction table
- Set `categoryId` to INVESTMENT category (create if doesn't exist)
- Set `investmentId` to link back to investment

### Price Fetching Flow

1. User clicks "Fetch Latest Prices" button on type detail page
2. Frontend calls `/api/investments/fetch-prices` with investment IDs
3. Backend fetches prices from Alpha Vantage for each investment
4. Updates `currentPrice` and creates `InvestmentPriceHistory` entry
5. Recalculates `currentValue` (price × quantity)
6. Returns updated investments

### Manual Price Updates (FD, NPS, PF)

1. User adds transaction via form
2. Creates `InvestmentTransaction` entry
3. Updates `investedAmount` and `currentValue` based on transaction type
4. Creates entry in main Transaction table

### Charts Implementation

- Use recharts (already in codebase)
- Donut chart: Distribution of investments by current value
- Bar chart: Value over time (from price history or transactions)

## Migration Steps

1. Create Prisma migration for new models
2. Update Transaction model to add investmentId
3. Run migration
4. Create server actions
5. Create API routes
6. Create frontend components
7. Add navigation item (already exists in nav-items.ts)
8. Test price fetching integration
9. Test transaction creation and linking

## Status Code Updates

- Add any new status codes needed to `lib/status-code.ts` if required

## Responsive Design

- Use grid layout for investment cards (responsive columns)
- Make charts responsive using ResponsiveContainer
- Ensure forms work on mobile devices
- Use existing responsive patterns from goals/bank-account features

## Comments and Documentation

- Add comprehensive comments to all functions
- Document API endpoints
- Add JSDoc comments for complex functions

### To-dos

- [x] Create Prisma schema with Investment, InvestmentTransaction, InvestmentPriceHistory models and InvestmentType enum. Update Transaction model to add investmentId field.
- [x] Run Prisma migration to create database tables
- [x] Create TypeScript types in lib/types/investments-types.ts and Zod schemas in lib/schema/investments-schema.ts
- [x] Create server actions in action/investments.ts for CRUD operations, price fetching, and stats calculation
- [x] Create utility functions in lib/utils/alpha-vantage.ts for fetching prices from Alpha Vantage API
- [x] Create API routes: /api/investments/route.ts, /api/investments/[id]/route.ts, /api/investments/[id]/transactions/route.ts, /api/investments/fetch-prices/route.ts
- [x] Create utility functions in lib/utils/investment-utils.ts for calculations and formatting
- [x] Create main investments page at app/(main)/investments/page.tsx with InvestmentTypeCard components showing grouped stats
- [x] Create investment type detail page at app/(main)/investments/[type]/page.tsx with charts and investment list
- [x] Create individual investment detail page at app/(main)/investments/[id]/page.tsx with stats, transactions, and charts
- [x] Create add and edit investment forms at app/(main)/investments/add and app/(main)/investments/edit/[id]
- [x] Create InvestmentDonutChart and InvestmentBarChart components following existing chart patterns
- [x] Integrate investment transactions with main Transaction table - create Transaction entries when investments are created/updated
- [x] Implement Fetch Latest Prices button and functionality for Stocks/MF/Gold investments
- [x] Test responsive design across all investment pages and components