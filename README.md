# 📅 Reservas Lab API

[![CI/CD Pipeline](https://github.com/LucasFernandesCS/reservas-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/LucasFernandesCS/reservas-lab/actions/workflows/ci.yml)

Uma API RESTful robusta para gerenciamento e agendamento de salas de reunião, construída com foco em qualidade de software, testes automatizados e regras de negócio estritas.

🔗 **Link da API ao vivo:** [https://api-reservas-lab.onrender.com/reservas](https://api-reservas-lab.onrender.com/reservas)

## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Banco de Dados:** PostgreSQL, Prisma ORM
- **Segurança:** JWT (JSON Web Tokens), Refresh Tokens e BcryptJS
- **Testes e QA:** Jest, Supertest (Unitários e Integração)
- **DevOps:** GitHub Actions (CI para testes em banco de dados real na nuvem)

## 🧠 Principais Regras de Negócio

Esta API não é apenas um simples CRUD. Ela valida de forma estrita:

- **Conflitos de Horário:** Bloqueio automático de sobreposição de reservas na mesma sala.
- **utenticação Obrigatória:** Apenas usuários autenticados podem criar ou visualizar reservas.
- **Autorização (Ownership):** Usuários só podem cancelar ou editar suas próprias reservas.
- **Limite de Tempo:** Cada reserva pode ter no máximo 4 horas de duração.
- **Bloqueio Retroativo:** Não é permitido realizar reservas em datas ou horários passados.
- **Gerenciamento de Sessão:** Implementação de rota para renovação de tokens expirados (/refresh).

## 🛠️ Como rodar o projeto localmente

1. Clone o repositório:

```bash
git clone [https://github.com/LucasFernandesCS/reservas-lab.git](https://github.com/LucasFernandesCS/reservas-lab.git)
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto e adicione a URL do seu banco Postgres:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/db"
JWT_SECRET="sua_chave_acesso"
JWT_REFRESH_SECRET="sua_chave_refresh"
```

4. Sincronize o banco de dados:

```bash
npx prisma generate
npx prisma db push
```

5. Inicie o servidor:

```bash
npm start
```

## 🧪 Rodando os Testes

O projeto conta com uma suíte de testes robusta. Para executá-los:

```bash
# Executa todos os testes unitários e de integração
npm test
```

## 📋 Endpoints Principais

| Método |     Rota      |                       Descrição                        | Requer Auth |
| :----: | :-----------: | :----------------------------------------------------: | :---------: |
|  POST  |   /usuarios   |                Cadastro de novo usuário                |     Não     |
|  POST  |    /login     |            Autenticação e geração de tokens            |     Não     |
|  POST  |   /refresh    |        Gera novo Access Token via Refresh Token        |     Não     |
|  GET   |   /reservas   |                Lista todas as reservas                 |     Não     |
|  POST  |   /reservas   |                Cria um novo agendamento                |     Sim     |
|  PUT   | /reservas/:id | Atualiza os dados do agendamento (Valida proprietário) |     Sim     |
| PATCH  | /reservas/:id |      Cancela um agendamento (Valida proprietário)      |     Sim     |
| DELETE | /reservas/:id |           Exclui uma reserva (Apenas ADMIN)            |     Sim     |

## 📋 Exemplo de Uso (POST /reservas)

Requer cabeçalho `Authorization: Bearer <token>`

```json
{
  "salaId": 1,
  "dataInicio": "2026-04-20T10:30:00.000Z",
  "dataFinal": "2026-04-20T14:30:00.000Z"
}
```

## 🗺️ Próximos Passos (Roadmap)

- [x] Testes de Integração e CI/CD.
- [x] Deploy na nuvem.
- [x] Autenticação e Autorização com JWT.
- [x] Implementação de Refresh Tokens.
- [ ] Frontend interativo.
