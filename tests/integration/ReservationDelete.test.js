const request = require("supertest");
const app = require("../../src/server");
const prisma = require("../../src/config/database");
const jwt = require("jsonwebtoken");

describe("Testes de Integração - Rotas de cancelamento", () => {
  let tokenVIP;
  let usuarioTeste;

  beforeAll(async () => {
    await prisma.reserva.deleteMany();
    await prisma.usuario.deleteMany();

    usuarioTeste = await prisma.usuario.create({
      data: {
        name: "Testador Delete",
        email: "delete@teste.com",
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

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await prisma.reserva.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.$disconnect();
  });

  describe("Tratamento de Erros e Exceções", () => {
    test("Dada uma reserva inexistente, Quando o usuário tentar cancelar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const tentativaDeCancelar = await request(app)
        .patch("/reservas/9999")
        .set("Authorization", `Bearer ${tokenVIP}`);

      expect(tentativaDeCancelar.status).toBe(400);
      expect(tentativaDeCancelar.body.erro).toBe("Reserva não encontrada");
    });

    test("Dada uma reserva faltando menos de 24 horas para o seu início, Quando o usuário tentar cancelar a reserva, Então o sistema deve lançar uma exceção", async () => {
      jest.useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "clearImmediate",
          "setTimeout",
          "clearTimeout",
        ],
      });

      jest.setSystemTime(new Date("2030-01-07T08:00:00"));

      const reservasExistentes = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T14:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T18:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(reservasExistentes);

      expect(criacao.status).toBe(201);
      const idRealDaReserva = criacao.body.reserva.reservaId;

      const tentativaDeCancelar = await request(app)
        .patch(`/reservas/${idRealDaReserva}`)
        .set("Authorization", `Bearer ${tokenVIP}`);

      expect(tentativaDeCancelar.status).toBe(400);
      expect(tentativaDeCancelar.body.erro).toBe(
        "Só é permitido cancelar com pelo menos 24 horas de antecedência",
      );

      jest.useRealTimers();
    });
  });

  describe("Fluxo de execução principal", () => {
    test("Dada uma reserva existente, Quando o usuário tentar cancelar a reserva, Então o sistema deve permitir o cancelamento", async () => {
      const reservasExistentes = {
        salaId: 1,
        usuarioId: usuarioTeste.id,
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .set("Authorization", `Bearer ${tokenVIP}`)
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const tentativaDeCancelar = await request(app)
        .patch(`/reservas/${idRealDaReserva}`)
        .set("Authorization", `Bearer ${tokenVIP}`);

      expect(tentativaDeCancelar.status).toBe(200);
      expect(tentativaDeCancelar.body.message).toBe(
        "Reserva cancelada com sucesso!",
      );
    });
  });
});
