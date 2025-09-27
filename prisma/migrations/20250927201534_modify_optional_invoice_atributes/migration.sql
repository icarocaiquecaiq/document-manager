-- DropIndex
DROP INDEX `Invoice_invoiceId_key` ON `Invoice`;

-- AlterTable
ALTER TABLE `Invoice` MODIFY `monetaryValue` DECIMAL(65, 30) NULL,
    MODIFY `invoiceExpiresDate` DATETIME(3) NULL,
    MODIFY `invoiceReferenceMonth` DATETIME(3) NULL,
    MODIFY `issuerCnpj` VARCHAR(191) NULL,
    MODIFY `invoiceId` VARCHAR(191) NULL,
    MODIFY `postalCode` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `neighborhood` VARCHAR(191) NULL;
