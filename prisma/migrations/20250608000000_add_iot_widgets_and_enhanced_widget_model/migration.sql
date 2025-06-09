-- CreateEnum
ALTER TYPE "WidgetType" ADD VALUE 'LINE_CHART';
ALTER TYPE "WidgetType" ADD VALUE 'GAUGE';
ALTER TYPE "WidgetType" ADD VALUE 'INDICATOR';
ALTER TYPE "WidgetType" ADD VALUE 'TEXT_DISPLAY';
ALTER TYPE "WidgetType" ADD VALUE 'BAR_CHART';

-- AlterTable
ALTER TABLE "Widget" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Widget" ADD COLUMN     "deviceToken" TEXT;
ALTER TABLE "Widget" ADD COLUMN     "dataField" TEXT;

-- CreateIndex
CREATE INDEX "Widget_deviceToken_idx" ON "Widget"("deviceToken");

-- Update existing widgets to have titles
UPDATE "Widget" SET "title" = 'Widget ' || substr("id", 1, 8) WHERE "title" = '';

-- Remove default from title column
ALTER TABLE "Widget" ALTER COLUMN "title" DROP DEFAULT;