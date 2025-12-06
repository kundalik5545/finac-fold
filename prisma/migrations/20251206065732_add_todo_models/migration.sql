-- CreateEnum
CREATE TYPE "TodoPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "todo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "TodoPriority" NOT NULL DEFAULT 'MEDIUM',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "categoryId" TEXT,
    "recurringId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "todo_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "todo_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_todo" (
    "id" TEXT NOT NULL,
    "frequency" "RecurringFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "recurring_todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TodoToTodoTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TodoToTodoTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "todo_userId_dueDate_idx" ON "todo"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "todo_userId_completed_idx" ON "todo"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "todo_category_userId_name_key" ON "todo_category"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "todo_tag_userId_name_key" ON "todo_tag"("userId", "name");

-- CreateIndex
CREATE INDEX "_TodoToTodoTag_B_index" ON "_TodoToTodoTag"("B");

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "todo_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_recurringId_fkey" FOREIGN KEY ("recurringId") REFERENCES "recurring_todo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_category" ADD CONSTRAINT "todo_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_tag" ADD CONSTRAINT "todo_tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TodoToTodoTag" ADD CONSTRAINT "_TodoToTodoTag_A_fkey" FOREIGN KEY ("A") REFERENCES "todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TodoToTodoTag" ADD CONSTRAINT "_TodoToTodoTag_B_fkey" FOREIGN KEY ("B") REFERENCES "todo_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
