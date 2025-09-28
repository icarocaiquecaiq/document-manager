/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `paidInvoiceDate` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_invoiceId_key` ON `Invoice`(`invoiceId`);
