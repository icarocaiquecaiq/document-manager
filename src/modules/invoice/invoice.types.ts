export interface TExtractInvoice {
    clientId: number;
}

export interface IScrapWebSiteDataInput extends TExtractInvoice {
    url: string;
}

export type TAddress = {
    address: string | null;
    postalCode: string | null;
    neighborhood: string | null;
};

export interface IScrapedData {
    monetaryValue: number | null;
    invoiceExpiresDate: Date | null;
    issuerCnpj: string | null;
    invoiceId: string | null;
    address: string | null;
    postalCode: string | null;
    neighborhood: string | null;
    invoiceStatus: 'PAID' | null;
    invoiceReferenceMonth: Date | null;
    title: string | null;
    paidInvoiceDate: Date | null;
}
