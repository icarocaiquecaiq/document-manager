Com certeza. Com base no seu arquivo e nas novas solicitações, gerei uma versão aprimorada e mais completa da documentação.

Este novo `README.md` adiciona as seções solicitadas, detalhando a arquitetura de scraping e a lógica de domínios mapeados, além de refinar a clareza e o profissionalismo do conteúdo existente.

---

# API de Processamento de Documentos

Esta é uma API RESTful construída com **NestJS** e **TypeScript** para processar documentos (PDFs e páginas web), extrair dados estruturados e associá-los a clientes em um banco de dados **MySQL**.
O projeto é totalmente containerizado com **Docker** para garantir um ambiente de desenvolvimento e execução consistente.

## Sumário

- [Setup e Execução](https://www.google.com/search?q=%23setup-e-execu%C3%A7%C3%A3o)
- [Exemplos de Uso da API](https://www.google.com/search?q=%23exemplos-de-uso-da-api)
- [Arquitetura e Observações Relevantes](https://www.google.com/search?q=%23arquitetura-e-observa%C3%A7%C3%B5es-relevantes)
    - [Fluxo de Scraping e Abstração](https://www.google.com/search?q=%23fluxo-de-scraping-e-abstra%C3%A7%C3%A3o)
    - [Scraping de URLs com Domínios Mapeados](https://www.google.com/search?q=%23scraping-de-urls-com-dom%C3%ADnios-mapeados)
    - [Considerações Adicionais](https://www.google.com/search?q=%23considera%C3%A7%C3%B5es-adicionais)

---

## Setup e Execução

Este projeto é projetado para ser executado com um único comando. O ambiente é totalmente gerenciado pelo **Docker** e **Docker Compose**.

### Pré-requisitos

- Docker
- Docker Compose
- WSL (para usuários Windows)

### Instruções

1.  **Clonar o Repositório**

    ```bash
    git clone <url-do-seu-repositorio>
    cd <nome-do-repositorio>
    ```

2.  **Iniciar a Aplicação**

    Execute o comando abaixo na raiz do projeto. Ele irá construir a imagem da API, baixar a imagem do MySQL e iniciar os dois contêineres em uma rede dedicada.

    ```bash
    docker-compose up --build
    ```

    Aguarde os logs indicarem que o servidor NestJS foi iniciado com sucesso.

3.  **Verificação**
    - A API estará disponível em: `http://localhost:3000`
    - O banco de dados MySQL estará acessível na porta `3306` da sua máquina.

4.  **Parar a Aplicação**

    Para parar e remover os contêineres, pressione `Ctrl + C` no terminal e execute:

    ```bash
    docker-compose down
    ```

---

## Exemplos de Uso da API

A seguir, exemplos de como interagir com os principais endpoints da API usando **curl**.

Mas antes, teste as rotas: https://web.postman.co/workspace/76767431-edad-4cc0-8278-9a854b10df14/collection/39069875-7c1d7a84-feff-4503-b947-fb21ad46fd8e?action=share&source=copy-link&creator=39069875

### 1\. Listar Todos os Clientes com Contagem de Faturas

Retorna todos os clientes com o número de faturas associadas.

**Requisição:**

```bash
curl --location 'http://localhost:3000/clients/get-all?withDocumentCount=true'
```

**Resposta Esperada:**

```json
[
    {
        "id": 1,
        "name": "Cliente Exemplo",
        "email": "cliente@exemplo.com",
        "_count": {
            "invoices": 5
        }
    }
]
```

---

### 2\. Criar uma Fatura a partir de um PDF

Envia um arquivo PDF para ser processado e associado a um cliente.

**Requisição:**

```bash
curl --location --request POST 'http://localhost:3000/invoices/client/1/pdf' \
--form 'file=@"/caminho/para/sua/fatura.pdf"'
```

**Resposta Esperada:**

```json
{
    "id": 101,
    "title": "fatura-copel",
    "monetaryValue": 278.52,
    "invoiceExpiresDate": "2025-08-15T00:00:00.000Z",
    "invoiceStatus": "PAID",
    "clientId": 1
}
```

---

### 3\. Criar uma Fatura a partir de uma URL

Envia uma URL de um domínio mapeado para ser processada e associada a um cliente.

**Requisição:**

```bash
curl --location --request POST 'http://localhost:3000/invoices/client/1/website' \
--header 'Content-Type: application/json' \
--data '{
  "url": "https://www.mercadolivre.com.br/sua/fatura/url"
}'
```

**Resposta Esperada:**

```json
{
    "id": 102,
    "title": "Xbox Game Pass Ultimate",
    "monetaryValue": 249.99,
    "paidInvoiceDate": "2023-11-08T00:00:00.000Z",
    "invoiceStatus": "PAID",
    "clientId": 1
}
```

---

### 4\. Listar Todas as Faturas de um Cliente Específico

Retorna todas as faturas associadas a um cliente.

**Requisição:**

```bash
curl --location 'http://localhost:3000/invoices/client/1'
```

**Resposta Esperada:**

```json
[
    {
        "id": 101,
        "title": "fatura-copel",
        "clientId": 1
    },
    {
        "id": 102,
        "title": "Xbox Game Pass Ultimate",
        "clientId": 1
    }
]
```

---

## Arquitetura e Observações Relevantes

### Fluxo de Scraping e Abstração

A funcionalidade de extração de dados foi desenhada para ser desacoplada, testável e extensível, seguindo os princípios SOLID. O fluxo é dividido em camadas claras:

1.  **`InvoiceService` (Camada de Negócio):** Orquestra o processo. Ele recebe a requisição do controller, valida o cliente e delega o trabalho de extração para o `ScrapingService`. Sua responsabilidade é a lógica de negócio, como salvar os dados no banco de dados.

2.  **`ScrapingService` (Camada de Execução):** É o especialista em "scraping". Ele não sabe _como_ extrair os dados, mas sabe _quem_ chamar para isso. Para PDFs, ele carrega o conteúdo e chama o `PdfDocumentParser`. Para URLs, ele determina o domínio e pede à `ParserFactory` o parser correto.

3.  **`ParserFactory` (Padrão Factory):** Atua como uma "fábrica" de parsers para web. Contém um mapa que associa domínios (ex: `www.mercadolivre.com.br`) a implementações de parser específicas (ex: `MercadoLivreParser`). Isso permite que o sistema escolha dinamicamente a estratégia de extração correta para cada site.

4.  **`Parsers` (Camada de Extração):** São as classes que contêm a lógica de extração propriamente dita. Cada parser implementa uma interface comum (`IDocumentParser`) e utiliza um padrão de "Motor de Regras" interno, onde cada campo a ser extraído é definido por uma regra declarativa (com Regex para PDFs ou Seletores CSS com Cheerio para web).

### Scraping de URLs com Domínios Mapeados

A API não tenta extrair dados de qualquer URL fornecida. Para garantir robustez e manutenibilidade, foi implementada uma validação de "domínios mapeados":

1.  **Recebimento da URL:** A API recebe uma URL no endpoint `POST /invoices/client/:id/website`.
2.  **Extração do Domínio:** O domínio é extraído da URL (ex: `www.mercadolivre.com.br`).
3.  **Verificação:** O `ScrapingService` consulta a `ParserFactory` para verificar se existe um parser configurado para aquele domínio.
4.  **Decisão:**
    - **Se o domínio é mapeado:** O processo continua. O parser específico para aquele domínio é selecionado e a extração de dados é realizada.
    - **Se o domínio não é mapeado:** O processo é interrompido imediatamente com um erro, informando que o domínio não é suportado. Nenhuma requisição HTTP externa é feita, economizando recursos e evitando falhas imprevisíveis.

Essa abordagem garante que o scraper só execute lógicas de extração que foram previamente escritas e testadas para um layout de site específico.

### Considerações Adicionais

- **Tratamento de Erros:** A aplicação utiliza a camada de exceções do NestJS (`Exceptions Layer`). Os serviços lançam exceções HTTP específicas (`NotFoundException`, `BadRequestException`, etc.), que são automaticamente capturadas pelo framework e formatadas em uma resposta JSON padronizada.

- **Testes Locais de Web Scraping:** Recomenda-se salvar cópias HTML dos sites-alvo e servi-las localmente com `http-server`. Uma configuração de ambiente de teste pode ser usada para redirecionar as chamadas do `axios` para `http://localhost`, garantindo testes rápidos e determinísticos sem depender de serviços externos.
