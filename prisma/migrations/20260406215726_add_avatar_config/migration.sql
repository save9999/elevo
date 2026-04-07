-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '🦊',
    "avatarConfig" TEXT NOT NULL DEFAULT '{}',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Child" ("ageGroup", "avatar", "birthDate", "createdAt", "id", "lastActivity", "level", "name", "parentId", "streak", "updatedAt", "xp") SELECT "ageGroup", "avatar", "birthDate", "createdAt", "id", "lastActivity", "level", "name", "parentId", "streak", "updatedAt", "xp" FROM "Child";
DROP TABLE "Child";
ALTER TABLE "new_Child" RENAME TO "Child";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
