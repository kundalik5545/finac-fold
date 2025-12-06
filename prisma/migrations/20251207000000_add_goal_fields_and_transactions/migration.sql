-- AlterTable: Add missing columns to goals table if it exists, or create it
DO $$ 
BEGIN
    -- Check if goals table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goals') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'icon') THEN
            ALTER TABLE "goals" ADD COLUMN "icon" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'color') THEN
            ALTER TABLE "goals" ADD COLUMN "color" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'goals' AND column_name = 'currentAmount') THEN
            ALTER TABLE "goals" ADD COLUMN "currentAmount" DECIMAL(65,4) NOT NULL DEFAULT 0;
        END IF;
    ELSE
        -- Create goals table if it doesn't exist
        CREATE TABLE "goals" (
            "id" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "name" TEXT NOT NULL,
            "targetAmount" DECIMAL(65,4) NOT NULL,
            "currentAmount" DECIMAL(65,4) NOT NULL DEFAULT 0,
            "targetDate" TIMESTAMP(3) NOT NULL,
            "description" TEXT,
            "icon" TEXT,
            "color" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "userId" TEXT NOT NULL,

            CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
        );

        -- Create index
        CREATE INDEX "goals_userId_isActive_idx" ON "goals"("userId", "isActive");

        -- Add foreign key
        ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: goal_transaction
CREATE TABLE IF NOT EXISTS "goal_transaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,4) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "goal_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "goal_transaction_goalId_date_idx" ON "goal_transaction"("goalId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "goal_transaction_userId_idx" ON "goal_transaction"("userId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'goal_transaction_goalId_fkey'
    ) THEN
        ALTER TABLE "goal_transaction" ADD CONSTRAINT "goal_transaction_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public' 
        AND constraint_name = 'goal_transaction_userId_fkey'
    ) THEN
        ALTER TABLE "goal_transaction" ADD CONSTRAINT "goal_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

