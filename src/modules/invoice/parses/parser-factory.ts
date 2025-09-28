import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDocumentParser } from './document-parser.interface';
import { MercadoLivreParser } from './mercado-livre-parser';
import { AsaasParser } from './asaas-parser';

@Injectable()
export class ParserFactory {
    private readonly parserMap: Map<string, IDocumentParser>;

    constructor(
        private readonly mercadoLivreParser: MercadoLivreParser,
        private readonly asaasParser: AsaasParser,
    ) {
        this.parserMap = new Map<string, IDocumentParser>();
        this.parserMap.set('www.mercadolivre.com.br', this.mercadoLivreParser);
        this.parserMap.set('www.asaas.com', this.asaasParser);
    }

    public getParserForDomain(domain: string): IDocumentParser {
        const parser = this.parserMap.get(domain);
        if (!parser) {
            throw new InternalServerErrorException(`No parser found for domain: ${domain}`);
        }
        return parser;
    }
}
