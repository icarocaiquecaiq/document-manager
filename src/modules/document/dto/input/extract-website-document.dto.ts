import { IsUrl } from 'class-validator';
import { ExtractDocumentDTO } from './extract-document.dto';

export class extractWebSiteDataDTO extends ExtractDocumentDTO {
    @IsUrl()
    url: string;
}
