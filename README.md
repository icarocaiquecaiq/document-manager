# API de Processamento de Documentos

Esta é uma API RESTful construída com **NestJS** e **TypeScript** para processar documentos (PDFs e páginas web), extrair dados estruturados e associá-los a clientes em um banco de dados **MySQL**.  
O projeto é totalmente containerizado com **Docker** para garantir um ambiente de desenvolvimento e execução consistente.

---

## Sumário

- [Setup e Execução](#setup-e-execução)
- [Exemplos de Uso da API](#exemplos-de-uso-da-api)
- [Arquitetura e Observações Relevantes](#arquitetura-e-observações-relevantes)

---

## Setup e Execução

Este projeto é projetado para ser executado com um único comando. O ambiente é totalmente gerenciado pelo **Docker** e **Docker Compose**.

### Pré-requisitos

- Docker
- Docker Compose
- wsl

### Instruções

#### Certifique que está no root linux

```bash
sudo su -
```

#### Clonar o Repositório

```bash
git clone <url-do-seu-repositorio>
cd <nome-do-repositorio>
```

### Iniciar a Aplicação

Execute o comando abaixo na raiz do projeto. Ele irá construir a imagem da API, baixar a imagem do MySQL e iniciar os dois contêineres em uma rede dedicada.

```bash
docker-compose up --build
```

Aguarde os logs indicarem que o servidor NestJS foi iniciado com sucesso.

### Verificação

A API estará disponível em: http://localhost:3000

O banco de dados MySQL estará acessível na porta 3306 da sua máquina.

### Parar a Aplicação

Para parar e remover os contêineres:

```bash
docker-compose down
```
