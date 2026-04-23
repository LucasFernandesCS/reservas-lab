const request = require("supertest");
const app = require("../../src/server");
const prisma = require("../../src/config/database");
const jwt = require("jsonwebtoken");

describe("Testes de Integração - Rotas de criação", () => {
  let tokenVIP;
  let usuarioTeste;

  beforeAll(async () => {
    await prisma.reserva.deleteMany();
    await prisma.usuario.deleteMany();

    usuarioTeste = await prisma.usuario.create({
      data: {
        name: "Testador Create",
        email: "create@teste.com",
        password: "hashqualquer",
      },
    });

    tokenVIP = jwt.sign(
      { usuario: "testador", role: "admin" },
      process.env.JWT_SECRET,
    );
  });

  beforeEach(async () => {
    await prisma.reserva.deleteMany();
  });

  afterAll(async () => {
    await prisma.reserva.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  describe("Fluxo de execução principal", () => {
    test("POST /reservas - Dado uma requisição valida, Quando o usuário tentar criar a reserva, Então o sistema deve permitir a criação", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-05-10T10:00:00").toISOString(),
        dataFinal: new Date("2030-05-10T12:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(201);
      expect(tentativaDeCriar.body.message).toBe(
        "Reserva realizada com sucesso!",
      );
      expect(tentativaDeCriar.body.reserva).toHaveProperty("reservaId");
    });
  });

  describe("Regras de Horário e Data", () => {
    test("Dada uma data de início que já passou, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2020-01-01T10:00:00").toISOString(),
        dataFinal: new Date("2020-01-01T12:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A data de início não pode estar no passado",
      );
    });
    test("Dada uma data final anterior a data de início, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-01T12:00:00").toISOString(),
        dataFinal: new Date("2030-01-01T10:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    });
    test("Dado um horário fora do horário comercial, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-01T07:00:00").toISOString(),
        dataFinal: new Date("2030-01-01T09:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um horário final de reserva ser imediatamente após o final do horário comercial, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-01T16:00:00").toISOString(),
        dataFinal: new Date("2030-01-01T18:01:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um dia não útil, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-05T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-05T12:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A reserva não pode ser feita nos finais de semana",
      );
    });
    test("Dado um horário de reserva que ultrapasse o limite de 4 horas de uso, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-01T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-01T15:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A reserva não pode durar mais do que 4 horas",
      );
    });
  });

  describe("Validação de conflitos", () => {
    test("Dado um horário de reserva que já está ocupado, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(reservasExistentes);

      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T10:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T12:30:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A sala já está reservada neste horário",
      );
    });
    test("Dada uma reserva com a data de fim igual a data de inicio, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T10:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T10:30:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(400);
      expect(tentativaDeCriar.body.erro).toBe(
        "A data e hora finais devem ser maiores que a data e hora de início",
      );
    });
  });

  describe("Testes de bordas", () => {
    test("Dada uma reserva que acabe junto com o horário comercial, Quando o usuário tentar criar a reserva, Então o sistema deve permitir a criação", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T17:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T18:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(201);
      expect(tentativaDeCriar.body.message).toBe(
        "Reserva realizada com sucesso!",
      );
    });

    test("Dada uma reserva que inicie imediatamente após o final de outra reserva, Quando o usuário tentar criar a reserva, Então o sistema deve permitir a criação", async () => {
      const reservasExistentes = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T12:00:00").toISOString(),
      };

      await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(reservasExistentes);

      const dadosDaReserva = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T12:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T14:00:00").toISOString(),
      };

      const tentativaDeCriar = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(dadosDaReserva);

      expect(tentativaDeCriar.status).toBe(201);
      expect(tentativaDeCriar.body.message).toBe(
        "Reserva realizada com sucesso!",
      );
    });
  });
});
