---
name: Subscriptions Page Implementation
overview: Design and implement a Subscriptions management page with calendar view, active subscriptions list, and subscription management features matching the provided screenshot design.
todos:
  - id: create-subscription-schema
    content: Add Subscription model to prisma/schema.prisma with frequency enum and update User model
    status: completed
  - id: create-subscription-types
    content: Create lib/subscriptions-types.ts with TypeScript types and helper functions
    status: completed
  - id: create-subscription-actions
    content: Create action/subscriptions.ts with CRUD operations and monthly total calculation
    status: completed
  - id: create-subscriptions-page
    content: Create app/(main)/subscriptions/page.tsx as server component
    status: completed
  - id: create-subscriptions-client
    content: Create SubscriptionsClient.tsx to manage state and layout
    status: completed
  - id: create-subscriptions-calendar
    content: Create SubscriptionsCalendar.tsx with calendar view and monthly total display
    status: completed
  - id: create-active-subscriptions-list
    content: Create ActiveSubscriptionsList.tsx with subscription cards and add button
    status: completed
  - id: create-subscription-card
    content: Create SubscriptionCard.tsx for individual subscription display
    status: completed
  - id: create-add-subscription-page
    content: Create add subscription page with form component
    status: completed
  - id: update-navigation
    content: Add Subscriptions menu item to data/nav-items.ts
    status: completed
---

# Subscriptions Page Implementation

## Analysis Summary

The current codebase has:

- Calendar component available (`components/ui/calendar.tsx`) using react-day-picker
- No Subscription model in the database yet
- Similar page structures in `app/(main)/` for goals, assets, and todos
- Existing action patterns for CRUD operations
- Input and Card components from shadcn/ui

Based on the screenshot, the Subscriptions page needs:

1. **Top Bar**: Search input with magnifying glass icon (placeholder "Search transactions...") and notification icon
2. **Left Panel**: 

- Page title "Subscriptions" with subtitle
- Monthly Total display ($135.96)
- Calendar view showing dates with subscription due dates highlighted

3. **Right Sidebar**:

- "Active Subscriptions" section title with icon
- List of subscription cards (Netflix, Spotify, Adobe, Amazon Prime, Gym)
- Each card shows: colored circular icon with letter, name, frequency, and amount
- "+ Add Subscription" button with dashed border at bottom

## Implementation Plan

### 1. Database Schema

Update `prisma/schema.prisma` to add Subscription model:

```prisma
model Subscription {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  name        String
  amount      Decimal  @db.Decimal(65, 4)
  frequency   SubscriptionFrequency
  startDate   DateTime
  nextDueDate DateTime
  icon        String?  // Single letter or emoji
  color       String?  // Hex color for icon background
  description String?
  isActive    Boolean  @default(true)
  cancelledAt DateTime?
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, isActive])
  @@index([userId, nextDueDate])
  @@map("subscriptions")
}

enum SubscriptionFrequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}
```

Update User model to include: `subscriptions Subscription[]`

### 2. Create Action Functions

Create `action/subscriptions.ts` with:

- `getSubscriptions(userId: string)` - Get all active subscriptions
- `getSubscription(id: string, userId: string)` - Get single subscription
- `createSubscription(data, userId: string)` - Create new subscription
- `updateSubscription(id: string, data, userId: string)` - Update subscription
- `deleteSubscription(id: string, userId: string)` - Soft delete (set isActive=false)
- `calculateMonthlyTotal(subscriptions: Subscription[])` - Calculate total monthly cost

### 3. Create Type Definitions

Create `lib/subscriptions-types.ts`:

- `Subscription` type
- `SubscriptionFrequency` type
- Helper functions for formatting

### 4. Create Subscriptions Page Structure

Create `app/(main)/subscriptions/` directory with:

- `page.tsx` - Main server component
- `_components/` directory for component files

### 5. Create Subscription Components

#### `app/(main)/subscriptions/_components/SubscriptionsClient.tsx`

Main client component that:

- Manages search state
- Combines calendar and sidebar
- Handles subscription selection from calendar
- Responsive layout (stacks on mobile, side-by-side on desktop)

#### `app/(main)/subscriptions/_components/SubscriptionsCalendar.tsx`

Calendar component that:

- Displays calendar using `components/ui/calendar.tsx`
- Highlights dates with subscription due dates
- Shows current/selected date with blue circle
- Displays monthly total above calendar
- Handles date selection

#### `app/(main)/subscriptions/_components/ActiveSubscriptionsList.tsx`

Sidebar component that:

- Lists all active subscriptions
- Each subscription card shows:
- Colored circular icon with letter/emoji
- Subscription name
- Frequency (Monthly, Weekly, etc.)
- Amount formatted as currency
- "+ Add Subscription" button at bottom with dashed border
- Clickable cards to view/edit subscription

#### `app/(main)/subscriptions/_components/SubscriptionCard.tsx`

Individual subscription card component:

- Circular icon with background color
- Name, frequency, and amount display
- Hover effects
- Click handler for navigation

#### `app/(main)/subscriptions/_components/SubscriptionsSearchBar.tsx`

Search bar component:

- Input field with Search icon
- Placeholder: "Search transactions..." (matching screenshot)
- Filter subscriptions by name
- Positioned in top bar area

### 6. Create Add/Edit Subscription Pages

#### `app/(main)/subscriptions/add/page.tsx`

Add subscription form page with:

- Name input
- Amount input
- Frequency selector (Daily, Weekly, Monthly, Yearly)
- Start date picker
- Icon picker (letter or emoji)
- Color picker
- Description textarea

#### `app/(main)/subscriptions/edit/[id]/page.tsx`

Edit subscription page (similar to add page)

### 7. Update Navigation

Update `data/nav-items.ts` to add Subscriptions menu item:

- Title: "Subscriptions"
- URL: "/subscriptions"
- Icon: Calendar or CreditCard from lucide-react

### 8. Styling Details

Match screenshot design:

- White/light background
- Calendar: Grid layout with proper spacing
- Selected date: Blue circular background (`bg-blue-600`)
- Subscription cards: Clean card design with colored icon circles
- Monthly Total: Bold amount, positioned above calendar
- Add button: Dashed border, plus icon
- Responsive: Sidebar stacks below calendar on mobile

### 9. Calendar Integration

- Use existing `Calendar` component from `components/ui/calendar.tsx`
- Customize to show subscription due dates
- Highlight dates with subscriptions
- Show current date with blue circle
- Support month navigation

## File Structure

```javascript
app/(main)/subscriptions/
  ├── page.tsx
  ├── add/
  │   ├── page.tsx
  │   └── _components/
  │       └── AddSubscriptionForm.tsx
  ├── edit/
  │   └── [id]/
  │       ├── page.tsx
  │       └── _components/
  │           └── EditSubscriptionForm.tsx
  └── _components/
      ├── SubscriptionsClient.tsx
      ├── SubscriptionsCalendar.tsx
      ├── ActiveSubscriptionsList.tsx
      ├── SubscriptionCard.tsx
      └── SubscriptionsSearchBar.tsx

action/
  └── subscriptions.ts

lib/
  └── subscriptions-types.ts

prisma/
  └── schema.prisma (updated)
```



## Notes

- The search bar placeholder says "Search transactions..." in the screenshot, but it should search subscriptions - we'll use "Search subscriptions..." for clarity
- Monthly total calculation: Sum all monthly subscriptions + convert weekly/daily/yearly to monthly equivalent
- Calendar will show subscription due dates as highlighted dates
- Icon can be a single letter (like 'N' for Netflix) or an emoji
- Color picker for subscription icon backgrounds