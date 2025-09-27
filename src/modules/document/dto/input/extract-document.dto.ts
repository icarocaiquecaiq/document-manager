import { IsInt } from 'class-validator';

export class ExtractDocumentDTO {
    @IsInt()
    clientId: number;
}
