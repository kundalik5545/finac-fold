---
name: Bank Account Redesign
overview: Redesign the bank account functionality with card and table views matching the screenshots, ensuring proper navigation to detail pages with transactions.
todos:
  - id: "1"
    content: Redesign BankAccountCard component to match screenshot with colorful cards, account details, and proper layout
    status: completed
  - id: "2"
    content: Create new BankAccountTable component with proper columns and clickable rows
    status: completed
  - id: "3"
    content: Update BankAccountClient to implement both card and table views with toggle functionality
    status: completed
    dependencies:
      - "1"
      - "2"
  - id: "4"
    content: Enhance BankAccountDetailView to match screenshot with large summary card and income/expense cards
    status: completed
  - id: "5"
    content: Update BankAccountTransactionTable to match screenshot with search, filters, and proper styling
    status: completed
  - id: "6"
    content: Add helper functions for account number masking and copy to clipboard functionality
    status: completed
  - id: "7"
    content: Update main page and detail page to ensure proper data fetching and passing
    status: completed
    dependencies:
      - "1"
      - "2"
      - "3"
      - "4"
      - "5"
  - id: "8"
    content: Test navigation flow from list to detail page and ensure all calculations are correct
    status: completed
    dependencies:
      - "7"
---

# Bank Accoun

t Redesign Plan

## Overview

Redesign the bank account listing page to match the provided screenshots with card and table view toggles, and enhance the detail page to show account summary with transactions.

## Current State Analysis

- Main page (`app/(main)/bank-account/page.tsx`) has basic structure with stats and client component
- `BankAccountClient` component has view toggle but table view is not implemented
- `BankAccountCard` component exists but needs enhancement to match screenshot design
- Detail page (`app/(main)/bank-account/[id]/page.tsx`) exists but needs UI improvements
- Backend API and Prisma models are already in place

## Implementation Plan

### 1. Enhance Main Bank Account Page (`app/(main)/bank-account/page.tsx`)

- Keep existing stats calculation logic
- Ensure proper data fetching for all accounts with calculated balances
- Pass all necessary data to client components

### 2. Redesign BankAccountCard Component (`app/(main)/bank-account/_components/BankAccountCard.tsx`)

- Match screenshot design with:
- Colorful card background (using account color)
- Bank icon and name at top
- Account type and status badges
- "Available Balance" (calculated balance, not starting balance)
- Account holder name (from user session)
- Account number with masked display (XXXX XXXX format)
- Copy icon for account number
- Click handler to navigate to detail page
- Edit/Delete buttons in top right (non-intrusive)
- Add "Add New Account" card when in card view

### 3. Create BankAccountTable Component (`app/(main)/bank-account/_components/BankAccountTable.tsx`)

- New component for table view matching screenshot:
- Columns: Bank Name (with subtitle), Account No., Type, Balance, Status, Actions
- Each row should be clickable to navigate to detail page
- Actions column with dropdown menu (three dots icon)
- Proper formatting for account numbers (masked)
- Status badges with green dot for active accounts
- Responsive design

### 4. Update BankAccountClient Component (`app/(main)/bank-account/_components/BankAccountClient.tsx`)

- Implement proper table view toggle
- Show table component when table view is selected
- Show card grid when card view is selected
- Add "Add New Account" card in card view
- Remove or conditionally show charts (based on screenshot, they may not be needed on main page)
- Ensure both views are fully functional

### 5. Enhance Bank Account Detail View (`app/(main)/bank-account/[id]/_components/BankAccountDetailView.tsx`)

- Redesign to match screenshot:
- Large account summary card with colored background
- Bank icon and name prominently displayed
- Account type and status badges
- Current balance prominently displayed
- Account number with copy functionality
- IFSC code and opened date
- Total Income and Total Expense cards below summary
- Back button in header
- Edit and Delete buttons in header

### 6. Update Bank Account Detail Page (`app/(main)/bank-account/[id]/page.tsx`)

- Ensure proper data fetching:
- Bank account details
- Calculated balance
- Transactions for the account
- Categories and subcategories
- Pass all data to detail view component
- Ensure proper layout matching screenshot

### 7. Enhance Transaction Table (`app/(main)/bank-account/[id]/_components/BankAccountTransactionTable.tsx`)

- Match screenshot design:
- Search bar with placeholder "Search transactions..."
- Filter buttons: All, Credit, Debit, Date Range
- Table columns: Date, Description, Category, Amount, Status
- Category icons in table
- Status badges (COMPLETED in green, PENDING in yellow)
- Proper formatting for amounts (with + for credit, - for debit)
- Color coding for amounts

### 8. Update Action Functions (`action/bank-account.ts`)

- Ensure `calculateBalance` function works correctly
- Verify transaction fetching includes all necessary data
- Add helper function to mask account numbers if needed

### 9. UI/UX Enhancements

- Add copy to clipboard functionality for account numbers
- Ensure proper hover states on cards and table rows
- Add loading states where appropriate
- Ensure responsive design for mobile devices
- Match color schemes and styling from screenshots

## Files to Modify

1. `app/(main)/bank-account/page.tsx` - Main page (minor updates)
2. `app/(main)/bank-account/_components/BankAccountCard.tsx` - Complete redesign
3. `app/(main)/bank-account/_components/BankAccountClient.tsx` - Add table view implementation
4. `app/(main)/bank-account/_components/BankAccountTable.tsx` - New component
5. `app/(main)/bank-account/[id]/_components/BankAccountDetailView.tsx` - Complete redesign
6. `app/(main)/bank-account/[id]/page.tsx` - Minor updates for data passing
7. `app/(main)/bank-account/[id]/_components/BankAccountTransactionTable.tsx` - Enhance to match screenshot

## Key Features to Implement

1. **Card View:**

- Colorful cards with account colors
- Account details (name, type, balance, account number)
- Click to navigate to detail page
- "Add New Account" placeholder card

2. **Table View:**

- Clean table with all account information
- Clickable rows for navigation
- Actions dropdown menu
- Status indicators

3. **Detail Page:**

- Large account summary card
- Income/Expense summary cards
- Transaction table with filters
- Proper navigation back to list

4. **Data Requirements:**

- Calculate current balance for each account
- Fetch transactions for each account
- Mask account numbers for display
- Get user name for account holder display

## Notes

- Keep existing backend API endpoints
- Use existing Prisma models
- Maintain existing authentication and authorization