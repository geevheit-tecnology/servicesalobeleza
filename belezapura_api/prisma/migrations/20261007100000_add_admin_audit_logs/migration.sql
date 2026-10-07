CREATE TABLE "AdminAuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "userId" TEXT,
  "userName" TEXT,
  "resource" TEXT NOT NULL,
  "detail" TEXT NOT NULL,
  "level" TEXT NOT NULL DEFAULT 'info',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX "AdminAuditLog_level_idx" ON "AdminAuditLog"("level");
