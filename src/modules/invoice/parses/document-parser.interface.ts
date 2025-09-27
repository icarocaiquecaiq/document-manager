import { IScrapedData } from '../invoice.types';

export interface IDocumentParser {
    parse(content: string): Partial<IScrapedData>;
}
