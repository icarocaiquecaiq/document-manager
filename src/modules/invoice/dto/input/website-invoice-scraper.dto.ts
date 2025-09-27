import { IsUrl } from 'class-validator';

export class WebsiteInvoiceScraperDTO {
    @IsUrl()
    url: string;
}
