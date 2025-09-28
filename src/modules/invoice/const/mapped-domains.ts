export const mappedDomains = {
    'faturas.mercadolivre.com.br': {
        parser: 'MercadoLivreParser',
    },
    'www.amazon.com.br': {
        parser: 'AmazonParser',
    },
};

export const localTestUrlMap = {
    'www.asaas.com': 'http://127.0.0.1:8080/asaas-invoice.html',
    'www.mercadolivre.com.br': 'http://127.0.0.1:8080/mercado-livre-invoice.html',
};
