-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'sparkles',
    "colorFrom" TEXT NOT NULL DEFAULT '#7c3aed',
    "colorTo" TEXT NOT NULL DEFAULT '#2563eb',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "headline" TEXT,
    "developer" TEXT NOT NULL DEFAULT 'LoopingBinary',
    "url" TEXT NOT NULL,
    "manifestUrl" TEXT,
    "iconUrl" TEXT,
    "coverUrl" TEXT,
    "screenshots" TEXT[],
    "accentColor" TEXT NOT NULL DEFAULT '#6d5dfc',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "whatsNew" TEXT NOT NULL DEFAULT '',
    "sizeKb" INTEGER NOT NULL DEFAULT 0,
    "ageRating" TEXT NOT NULL DEFAULT '4+',
    "permissions" TEXT[],
    "tags" TEXT[],
    "offline" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "editorsChoice" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "installs" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "deviceId" TEXT NOT NULL,
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallEvent" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstallEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- CreateIndex
CREATE INDEX "App_published_featured_idx" ON "App"("published", "featured");

-- CreateIndex
CREATE INDEX "App_categoryId_idx" ON "App"("categoryId");

-- CreateIndex
CREATE INDEX "Review_appId_createdAt_idx" ON "Review"("appId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_appId_deviceId_key" ON "Review"("appId", "deviceId");

-- CreateIndex
CREATE INDEX "InstallEvent_appId_createdAt_idx" ON "InstallEvent"("appId", "createdAt");

-- AddForeignKey
ALTER TABLE "App" ADD CONSTRAINT "App_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstallEvent" ADD CONSTRAINT "InstallEvent_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
