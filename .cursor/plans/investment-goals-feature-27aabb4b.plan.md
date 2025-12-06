<!-- 27aabb4b-ce44-4f1b-9c05-80d3982cca4a 8fe9b03a-5fde-4c92-968c-26034c5316ec -->
# Investment Goals Feature Implementation

## Overview

Create a comprehensive Investment Goals feature that allows users to track financial goals, monitor progress, and visualize data through charts. The feature will follow existing patterns from assets-tracking and todo features.

## Database Schema Updates

### Update Goal Model in `prisma/schema.prisma`

- Add `icon: String?` field (for emoji icons)
- Add `color: String?` field (for card background colors)
- Add `currentAmount: Decimal @db.Decimal(65, 4)` field (to track current progress)
- Keep existing fields: `name`, `targetAmount`, `targetDate`, `description`, `isActive`

### Create GoalTransaction Model in `prisma/schema.prisma`

- `id: String @id @default(uuid())`
- `createdAt`, `updatedAt: DateTime`
- `amount: Decimal @db.Decimal(65, 4)` (amount added in this transaction)
- `date: DateTime` (transaction date)
- `notes: String?` (optional notes)
- `goalId: String` (relation to Goal)
- `userId: String` (relation to User)
- Indexes: `[goalId, date]`, `[userId]`
- Map to `goal_transaction` table

### Migration

- Run Prisma migration after schema updates

## Schema and Types

### Create `lib/goals-schema.ts`

- `goalFormSchema`: Zod schema for creating/editing goals
- name, targetAmount, targetDate, description, icon, color, currentAmount
- `updateGoalSchema`: Partial schema for updates
- `goalTransactionSchema`: Schema for goal transactions (amount, date, notes)
- Export TypeScript types: `GoalFormValues`, `GoalTransactionFormValues`

### Create `lib/goals-types.ts`

- `Goal` type (matching Prisma model with number conversions)
- `GoalTransaction` type
- `GoalWithTransactions` type
- Form input types

## Server Actions

### Create `action/goals.ts`

Following the pattern from `action/assets-tracking.ts`:

**Goal Functions:**

- `getGoals(userId)`: Fetch all goals for user, calculate progress percentage
- `getGoal(goalId, userId)`: Fetch single goal with transactions
- `createGoal(data, userId)`: Create goal with initial transaction if currentAmount > 0
- `updateGoal(goalId, data, userId)`: Update goal details
- `deleteGoal(goalId, userId)`: Delete goal (cascade deletes transactions)

**Transaction Functions:**

- `getGoalTransactions(goalId, userId)`: Fetch all transactions for a goal
- `createGoalTransaction(goalId, data, userId)`: Create transaction and update goal's currentAmount
- `updateGoalTransaction(transactionId, data, userId)`: Update transaction and recalculate goal currentAmount
- `deleteGoalTransaction(transactionId, userId)`: Delete transaction and recalculate goal currentAmount

**Progress Calculation:**

- Calculate `progressPercentage = (currentAmount / targetAmount) * 100`
- Ensure currentAmount never exceeds targetAmount (cap at 100%)

## API Routes

### Create `app/api/goals/route.ts`

- `GET`: Fetch all goals for authenticated user
- `POST`: Create new goal (validate with goalFormSchema)

### Create `app/api/goals/[id]/route.ts`

- `GET`: Fetch single goal with transactions
- `PATCH`: Update goal (validate with updateGoalSchema)
- `DELETE`: Delete goal

### Create `app/api/goals/[id]/transactions/route.ts`

- `GET`: Fetch all transactions for a goal
- `POST`: Create new transaction (validate with goalTransactionSchema)

### Create `app/api/goals/[id]/transactions/[transactionId]/route.ts`

- `PATCH`: Update transaction
- `DELETE`: Delete transaction

All routes follow authentication pattern from assets-tracking routes.

## Utility Components

### Create `components/ui/color-picker.tsx`

Reusable color picker component:

- Display 10 premade light color templates (pastel colors)
- Grid layout showing color swatches
- Selected color highlighted with border
- Returns selected color hex value
- Props: `value`, `onChange`, `colors` (optional custom colors)

### Create `components/ui/icon-picker.tsx`

Reusable icon picker component:

- Input field that accepts emoji (Windows emoji picker: Win + .)
- Display selected icon in a preview box
- Instructions text: "Press Win + . to open emoji picker"
- Props: `value`, `onChange`

## Main Pages

### Create `app/(main)/goals/page.tsx`

Server component that:

- Fetches goals using `getGoals` action
- Renders `GoalsClient` component with goals data

### Create `app/(main)/goals/_components/GoalsClient.tsx`

Client component with:

- View toggle (Table/Card) similar to `AssetsTrackingClient`
- State management for view mode
- Renders `GoalsTableView` or `GoalsCardView` based on toggle
- Renders charts below: `GoalsDonutChart`, `GoalsBarChart`, `GoalsAreaChart`
- Responsive layout

### Create `app/(main)/goals/_components/GoalsTableView.tsx`

Table view displaying:

- Columns: Icon, Name, Target Amount, Current Amount, Progress %, Target Date, Status
- Progress bar in progress column
- Clickable rows navigate to goal detail page
- Responsive (hide some columns on mobile)

### Create `app/(main)/goals/_components/GoalsCardView.tsx`

Card grid view displaying:

- Cards with color background (from goal.color)
- Icon display (from goal.icon)
- Goal name, target amount, current amount
- Progress bar with percentage
- Target date
- Clickable cards navigate to detail page
- Responsive grid layout

### Create `app/(main)/goals/_components/GoalCard.tsx`

Individual goal card component:

- Color-coded background based on goal.color
- Icon display
- Progress visualization (circular or linear progress bar)
- Key metrics display
- Click handler for navigation

## Chart Components

### Create `app/(main)/goals/_components/GoalsDonutChart.tsx`

Donut chart showing:

- Goal distribution by target amount or current amount
- Percentage breakdown
- Uses recharts (similar to `AssetsPieChart`)
- Responsive container

### Create `app/(main)/goals/_components/GoalsBarChart.tsx`

Bar chart showing:

- Goals vs progress (current amount / target amount)
- Grouped bars for comparison
- Responsive

### Create `app/(main)/goals/_components/GoalsAreaChart.tsx`

Area chart showing:

- Overall goals progress over time (aggregate of all goals)
- Date-based visualization
- Similar to `AssestsAreacChart` pattern

## Form Pages

### Create `app/(main)/goals/add/page.tsx`

Server component rendering `AddGoalForm`

### Create `app/(main)/goals/add/_components/AddGoalForm.tsx`

Form component:

- Uses react-hook-form with zodResolver
- Fields: name, targetAmount, targetDate, description, icon (icon picker), color (color picker), currentAmount (optional initial amount)
- Submit creates goal via API
- Redirects to goals list on success
- Error handling with toast notifications

### Create `app/(main)/goals/edit/[id]/page.tsx`

Server component that:

- Fetches goal data using `getGoal` action
- Renders `EditGoalForm` with pre-filled data
- Handles not found case

### Create `app/(main)/goals/edit/[id]/_components/EditGoalForm.tsx`

Similar to AddGoalForm but:

- Pre-fills form with existing goal data
- Updates goal via PATCH API
- Includes back button component

## Goal Detail Page

### Create `app/(main)/goals/[id]/page.tsx`

Server component that:

- Fetches goal with transactions using `getGoal` action
- Renders `GoalDetailView` and `GoalTransactionHistory` components
- Includes back button

### Create `app/(main)/goals/[id]/_components/GoalDetailView.tsx`

Displays:

- Goal information card with icon, color, name
- Progress visualization (large progress bar/circle)
- Key metrics: target amount, current amount, remaining amount, target date
- Days remaining calculation
- Status badge (Active/Completed)

### Create `app/(main)/goals/[id]/_components/GoalTransactionHistory.tsx`

Displays:

- Table of all transactions for the goal
- Add transaction button/form
- Edit/delete transaction actions
- Area chart showing currentAmount progression over time (date-based)
- Chart uses transaction dates and cumulative amounts

### Create `app/(main)/goals/[id]/_components/GoalProgressAreaChart.tsx`

Area chart component:

- X-axis: transaction dates
- Y-axis: cumulative current amount
- Shows progress over time for individual goal
- Similar pattern to asset transaction charts

## Navigation

### Update `data/nav-items.ts`

Add goals navigation item to main navigation menu

## Styling and Responsiveness

- All components use Tailwind CSS
- Responsive breakpoints: mobile-first approach
- Charts use ResponsiveContainer from recharts
- Cards use shadcn Card components
- Progress bars use shadcn Progress component or custom styled divs

## Error Handling

- API routes return appropriate HTTP status codes
- Form validation with Zod schemas
- Toast notifications for success/error states
- Loading states for async operations
- Not found handling for invalid IDs

## Testing Checklist

After implementation:

- Test CRUD operations for goals
- Test transaction creation/updates
- Test progress calculation accuracy
- Test view toggle functionality
- Test responsive layouts
- Test chart rendering with various data states
- Test color and icon picker utilities
- Test navigation flows
- Verify error handling

## Files to Create/Modify

**New Files:**

- `lib/goals-schema.ts`
- `lib/goals-types.ts`
- `action/goals.ts`
- `app/api/goals/route.ts`
- `app/api/goals/[id]/route.ts`
- `app/api/goals/[id]/transactions/route.ts`
- `app/api/goals/[id]/transactions/[transactionId]/route.ts`
- `components/ui/color-picker.tsx`
- `components/ui/icon-picker.tsx`
- `app/(main)/goals/page.tsx`
- `app/(main)/goals/_components/GoalsClient.tsx`
- `app/(main)/goals/_components/GoalsTableView.tsx`
- `app/(main)/goals/_components/GoalsCardView.tsx`
- `app/(main)/goals/_components/GoalCard.tsx`
- `app/(main)/goals/_components/GoalsDonutChart.tsx`
- `app/(main)/goals/_components/GoalsBarChart.tsx`
- `app/(main)/goals/_components/GoalsAreaChart.tsx`
- `app/(main)/goals/add/page.tsx`
- `app/(main)/goals/add/_components/AddGoalForm.tsx`
- `app/(main)/goals/edit/[id]/page.tsx`
- `app/(main)/goals/edit/[id]/_components/EditGoalForm.tsx`
- `app/(main)/goals/[id]/page.tsx`
- `app/(main)/goals/[id]/_components/GoalDetailView.tsx`
- `app/(main)/goals/[id]/_components/GoalTransactionHistory.tsx`
- `app/(main)/goals/[id]/_components/GoalProgressAreaChart.tsx`

**Modified Files:**

- `prisma/schema.prisma` (update Goal model, add GoalTransaction model)
- `data/nav-items.ts` (add goals navigation item)