-- DropIndex
DROP INDEX "messages_teamId_createdAt_idx";

-- DropIndex
DROP INDEX "tasks_assigneeId_idx";

-- DropIndex
DROP INDEX "tasks_teamId_status_idx";

-- CreateIndex
CREATE INDEX "messages_teamId_createdAt_idx" ON "messages"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "messages_authorId_createdAt_idx" ON "messages"("authorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "tasks_teamId_deletedAt_order_idx" ON "tasks"("teamId", "deletedAt", "order");

-- CreateIndex
CREATE INDEX "tasks_teamId_status_deletedAt_idx" ON "tasks"("teamId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_deletedAt_idx" ON "tasks"("assigneeId", "deletedAt");

-- CreateIndex
CREATE INDEX "team_members_userId_idx" ON "team_members"("userId");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");
