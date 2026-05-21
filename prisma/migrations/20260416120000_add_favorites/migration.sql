-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walkId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_walkId_fkey" FOREIGN KEY ("walkId") REFERENCES "walks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_walkId_key" ON "favorites"("userId", "walkId");
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");
CREATE INDEX "favorites_walkId_idx" ON "favorites"("walkId");

-- CreateIndex
CREATE INDEX "walks_city_idx" ON "walks"("city");

-- RedefineTable (SQLite: drop JSON favorites column)
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "avatar" TEXT,
    "profileDescription" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "walksCount" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_users" ("id", "email", "passwordHash", "name", "nickname", "avatar", "profileDescription", "city", "createdAt", "followersCount", "walksCount", "rating")
SELECT "id", "email", "passwordHash", "name", "nickname", "avatar", "profileDescription", "city", "createdAt", "followersCount", "walksCount", "rating" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");
PRAGMA foreign_keys=ON;
