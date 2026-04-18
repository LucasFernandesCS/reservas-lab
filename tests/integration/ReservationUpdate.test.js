const request = require("supertest");
const app = require("../../src/server");
const prisma = require("../../src/config/database");

describe("Testes de Integração - Rotas de atualização", () => {
  beforeEach(async () => {
    await prisma.reserva.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  describe("Regras de Horário e Data", () => {
    test("Dada uma data de início que já passou, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2020-01-07T10:30:00").toISOString(),
        dataFinal: new Date("2020-01-07T12:30:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A data de início não pode estar no passado",
      );
    });
    test("Dada uma data final anterior a data de início, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T09:30:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    });
    test("Dado um horário fora do horário comercial, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        reservaId: 1,
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T07:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T10:30:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um horário final de reserva ser imediatamente após o final do horário comercial, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        reservaId: 1,
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T14:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T18:01:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um dia não útil, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        reservaId: 1,
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-05T14:30:00").toISOString(),
        dataFinal: new Date("2030-01-05T18:00:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A reserva não pode ser feita nos finais de semana",
      );
    });
    test("Dado um horário de reserva que ultrapasse o limite de 4 horas de uso, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        reservaId: 1,
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T14:01:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A reserva não pode durar mais do que 4 horas",
      );
    });

    test("Dada uma reserva com a data de fim igual a data de inicio, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = {
        reservaId: 1,
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-01T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-01T10:00:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A data e hora finais devem ser maiores que a data e hora de início",
      );
    });
  });

  describe("Validação de conflitos", () => {
    test("Dado um horário de reserva que já está ocupado, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservas1 = {
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };
      await request(app).post("/reservas").send(reservas1);

      const reservas2 = {
        salaId: 1,
        usuario: "Beatriz",
        dataInicio: new Date("2030-01-07T12:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T14:30:00").toISOString(),
      };

      const criacaoBeatriz = await request(app)
        .post("/reservas")
        .send(reservas2);
      expect(criacaoBeatriz.status).toBe(201);

      const idBeatriz = criacaoBeatriz.body.reserva.reservaId;

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:30:00").toISOString(),
        dataFinal: new Date("2030-01-07T12:30:00").toISOString(),
      };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idBeatriz}`)
        .send(dadosConflitantes);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe(
        "A sala já está reservada neste horário",
      );
    });
  });

  describe("Tratamento de Erros e Exceções", () => {
    test("Dada uma reserva inexistente, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const idInexistente = 999;
      const dadosParaAtualizar = { usuario: "Novo Nome" };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idInexistente}`)
        .send(dadosParaAtualizar);

      expect(tentativaDeAtualizar.status).toBe(400);
      expect(tentativaDeAtualizar.body.erro).toBe("Reserva não encontrada");
    });
  });

  describe("Fluxos de Execução Principal", () => {
    test("Dada uma reserva existente, Quando o usuário tentar atualizar a reserva, Então o sistema deve permitir a atualização", async () => {
      const reservasExistentes = {
        salaId: 1,
        usuario: "Diego",
        dataInicio: new Date("2030-01-07T10:00:00").toISOString(),
        dataFinal: new Date("2030-01-07T11:00:00").toISOString(),
      };

      const criacao = await request(app)
        .post("/reservas")
        .send(reservasExistentes);
      expect(criacao.status).toBe(201);

      const idRealDaReserva = criacao.body.reserva.reservaId;

      const dadosParaAtualizar = { usuario: "Novo Nome" };

      const tentativaDeAtualizar = await request(app)
        .put(`/reservas/${idRealDaReserva}`)
        .send(dadosParaAtualizar);

      expect(tentativaDeAtualizar.status).toBe(200);
      expect(tentativaDeAtualizar.body.message).toBe(
        "Reserva atualizada com sucesso!",
      );
    });
  });
});
