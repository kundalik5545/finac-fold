<!-- 4da3709b-9eb7-4a57-8235-a33be1fc9d6e fb252f54-51db-482a-a817-6f108d057e4c -->
# Todo List Feature Implementation

## 1. Database Schema

Update [`prisma/schema.prisma`](prisma/schema.prisma) to add Todo models with full features:

```prisma
model Todo {
  id          String        @id @default(uuid())
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  title       String
  description String?
  dueDate     DateTime?
  priority    TodoPriority  @default(MEDIUM)
  completed   Boolean       @default(false)
  completedAt DateTime?
  
  categoryId  String?
  category    TodoCategory? @relation(fields: [categoryId], references: [id])
  tags        TodoTag[]
  
  recurringId String?
  recurring   RecurringTodo? @relation(fields: [recurringId], references: [id])
  
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  
  @@index([userId, dueDate])
  @@index([userId, completed])
  @@map("todo")
}

model TodoCategory {
  id        String   @id @default(uuid())
  name      String
  color     String?
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  todos     Todo[]
  
  @@unique([userId, name])
  @@map("todo_category")
}

model TodoTag {
  id     String @id @default(uuid())
  name   String
  userId String
  user   User   @relation(fields: [userId], references: [id])
  todos  Todo[]
  
  @@unique([userId, name])
  @@map("todo_tag")
}

model RecurringTodo {
  id            String              @id @default(uuid())
  frequency     RecurringFrequency
  interval      Int                 @default(1)
  startDate     DateTime
  endDate       DateTime?
  todos         Todo[]
  
  @@map("recurring_todo")
}

enum TodoPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum RecurringFrequency {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}
```

Update User model to include relations: `todos Todo[]`, `todoCategories TodoCategory[]`, `todoTags TodoTag[]`

Run migration: `npx prisma migrate dev --name add_todo_models`

## 2. Types & Schemas

Create [`lib/todo-types.ts`](lib/todo-types.ts) for TypeScript types and [`lib/todo-schema.ts`](lib/todo-schema.ts) for Zod validation schemas following the pattern from `lib/assets-tracking-types.ts` and `lib/assets-tracking-schema.ts`.

## 3. Server Actions

Create [`action/todo.ts`](action/todo.ts) with functions:

- `getTodos(userId, filters?)` - fetch with filtering/sorting
- `getTodoById(id, userId)`
- `createTodo(data, userId)`
- `updateTodo(id, data, userId)`
- `deleteTodo(id, userId)`
- `toggleTodoComplete(id, userId)`
- `getTodosByDateRange(userId, startDate, endDate)` - for calendar views
- `getCategories(userId)`, `createCategory(data, userId)`
- `getTags(userId)`, `createTag(data, userId)`
- `createRecurringTodo(data, userId)` - handle recurring logic

## 4. Main Todo Page Structure

Create route structure under `app/(main)/todo/`:

```
todo/
  ├── page.tsx                    # Main todo page
  ├── _components/
  │   ├── TodoClient.tsx          # Client wrapper with view toggle
  │   ├── TodoTableView.tsx       # Table view component
  │   ├── TodoCalendarView.tsx    # Calendar view component
  │   ├── DailyView.tsx          # Daily calendar view
  │   ├── WeeklyView.tsx         # Weekly calendar view
  │   ├── MonthlyView.tsx        # Monthly calendar view
  │   ├── TodoCard.tsx           # Individual todo card
  │   ├── TodoFilters.tsx        # Filters sidebar/panel
  │   ├── TodoForm.tsx           # Add/Edit todo form
  │   └── RecurringTodoForm.tsx  # Recurring todo form
  ├── add/
  │   └── page.tsx               # Add todo page
  └── edit/
      └── [id]/
          └── page.tsx           # Edit todo page
```

## 5. Core Components Implementation

**TodoClient.tsx**: Main orchestrator component with:

- View mode toggle (Table vs Calendar)
- Calendar mode toggle (Daily/Weekly/Monthly)
- Filters panel toggle
- State management for active filters
- Data fetching using server actions

**TodoTableView.tsx**: Table with columns:

- Checkbox for completion status
- Title (clickable to edit)
- Description
- Due date with formatting
- Priority badge with color coding
- Category badge
- Tags
- Actions (edit, delete)
- Sorting by any column
- Responsive design with mobile cards

**TodoCalendarView.tsx**: Container for calendar views with:

- Mode selector (Daily/Weekly/Monthly)
- Navigation controls (prev/next period, today button)
- Conditional rendering of Daily/Weekly/MonthlyView

**Calendar Views**: Each view component displays todos:

- Color-coded by priority
- Grouped by time slots (daily/weekly) or date (monthly)
- Click to view/edit
- Drag-and-drop to reschedule (optional enhancement)

**TodoFilters.tsx**: Filter panel with:

- Completion status (all/active/completed)
- Priority levels (multi-select)
- Categories (multi-select)
- Tags (multi-select)
- Date range picker
- Clear all filters button

**TodoForm.tsx**: Form with fields:

- Title (required)
- Description (textarea)
- Due date/time (date + time picker)
- Priority (select/radio)
- Category (select + create new)
- Tags (multi-select + create new)
- Recurring option checkbox
- If recurring: show RecurringTodoForm inline

## 6. API Routes (Optional)

If needed for real-time updates or webhooks, create:

- `app/api/todo/route.ts` - GET (list), POST (create)
- `app/api/todo/[id]/route.ts` - GET, PUT, DELETE

Otherwise, use server actions directly from components.

## 7. UI Enhancements

- Priority color coding: 
  - URGENT: red
  - HIGH: orange
  - MEDIUM: yellow
  - LOW: gray
- Completion animations
- Due date indicators (overdue: red, today: orange, upcoming: green)
- Empty states for no todos
- Loading skeletons
- Toast notifications for actions
- Confirmation dialogs for delete
- Keyboard shortcuts (optional)

## 8. Responsive Design

- Mobile: Card-based layout for table view
- Tablet: Condensed table or card grid
- Desktop: Full table with all columns
- Calendar views adapt to screen size
- Touch-friendly controls

## 9. Recurring Todo Logic

Implement cron-like system or scheduled function to:

- Generate next instance of recurring todos
- Check daily for todos that need to be created
- Use `RecurringTodo` model to track pattern
- Create new `Todo` instances based on frequency
- Handle end dates and completion

## Implementation Order

1. Database schema + migration
2. Types and schemas
3. Server actions (core CRUD)
4. Basic todo page with table view
5. Add/Edit forms
6. Filters and sorting
7. Calendar views (Monthly → Weekly → Daily)
8. Categories and tags management
9. Recurring todos
10. Polish and responsiveness

### To-dos

- [ ] Create Prisma schema for Todo models and run migration
- [x] Create TypeScript types and Zod validation schemas
- [x] Implement server actions for CRUD operations
- [x] Create main todo page with table view
- [x] Build add/edit todo forms with validation
- [x] Implement filtering and sorting functionality
- [x] Create monthly calendar view
- [x] Create weekly calendar view
- [x] Create daily calendar view
- [x] Implement categories and tags management
- [x] Build recurring todos functionality
- [x] Add responsive design and UI polish