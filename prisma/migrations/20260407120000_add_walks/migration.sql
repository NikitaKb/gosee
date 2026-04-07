-- CreateTable
CREATE TABLE "walks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT,
    "theme" TEXT,
    "pace" TEXT,
    "travelModeId" TEXT NOT NULL,
    "timeStart" TEXT,
    "timeEnd" TEXT,
    "distanceKm" REAL NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "waypoints" JSONB NOT NULL,
    "path" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "walks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "walks_userId_createdAt_idx" ON "walks"("userId", "createdAt");
