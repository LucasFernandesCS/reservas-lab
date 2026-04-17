# 📅 Reservas Lab API

[![CI/CD Pipeline](https://github.com/LucasFernandesCS/reservas-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/LucasFernandesCS/reservas-lab/actions/workflows/ci.yml)

Uma API RESTful robusta para gerenciamento e agendamento de salas de reunião, construída com foco em qualidade de software, testes automatizados e regras de negócio estritas.

🔗 **Link da API ao vivo:** [https://api-reservas-lab.onrender.com/reservas](https://api-reservas-lab.onrender.com/reservas)

## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Banco de Dados:** PostgreSQL, Prisma ORM
- **Testes e QA:** Jest, Supertest (Testes Unitários e de Integração)
- **DevOps:** GitHub Actions (CI para testes em banco de dados real na nuvem)

## 🧠 Principais Regras de Negócio

Esta API não é apenas um simples CRUD. Ela valida de forma estrita:

- Conflitos de horário (sobreposição de reservas na mesma sala).
- Restrições de horário comercial e dias úteis.
- Bloqueio de agendamentos no passado.
- Limite máximo de tempo por agendamento (4 horas).
- Antecedência mínima para cancelamentos (24 horas).

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
DATABASE_URL="postgresql://usuario:senha@localhost:5432/reservas_db?schema=public"
```

4. Sincronize o banco de dados:

```bash
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

## 📋 Exemplo de Uso (POST /reservas)

```json
{
  "salaId": 1,
  "usuario": "Lucas Fernandes",
  "dataInicio": "2026-04-20T10:30:00",
  "dataFinal": "2026-04-20T14:30:00"
}
```

## 🗺️ Próximos Passos (Roadmap)

- [x] Testes de Integração e CI/CD.
- [x] Deploy na nuvem.
- [ ] Autenticação e Autorização com JWT.
- [ ] Frontend interativo.
