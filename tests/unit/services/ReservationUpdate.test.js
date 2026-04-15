jest.mock("../../../src/models/ReservationModel");
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      reserva: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };
});
const ReservationModel = require("../../../src/models/ReservationModel");
const ReservationService = require("../../../src/services/ReservationService");

describe("ReservationService - Update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ReservationModel.listarReservas.mockResolvedValue([]);
  });

  describe("Regras de Horário e Data", () => {
    test("Dada uma data de início que já passou, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2020-01-07T10:30:00"),
        dataFinal: new Date("2020-01-07T12:30:00"),
      };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "A data de início não pode estar no passado",
      );
    });
    test("Dada uma data final anterior a data de início, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:30:00"),
        dataFinal: new Date("2030-01-07T09:30:00"),
      };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    });
    test("Dado um horário fora do horário comercial, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T07:30:00"),
        dataFinal: new Date("2030-01-07T10:30:00"),
      };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um horário final de reserva ser imediatamente após o final do horário comercial, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T14:30:00"),
        dataFinal: new Date("2030-01-07T18:01:00"),
      };
      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um dia não útil, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-05T14:30:00"),
        dataFinal: new Date("2030-01-05T18:00:00"),
      };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "A reserva não pode ser feita nos finais de semana",
      );
    });
    test("Dado um horário de reserva que ultrapasse o limite de 4 horas de uso, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:00:00"),
        dataFinal: new Date("2030-01-07T14:01:00"),
      };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "A reserva não pode durar mais do que 4 horas",
      );
    });
  });

  describe("Validação de conflitos", () => {
    test("Dado um horário de reserva que já está ocupado, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
        {
          reservaId: 2,
          salaId: 1,
          usuario: "Beatriz",
          dataInicio: new Date("2030-01-07T10:30:00"),
          dataFinal: new Date("2030-01-07T12:30:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:30:00"),
        dataFinal: new Date("2030-01-07T12:30:00"),
      };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        1,
        dadosConflitantes,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "A sala já está reservada neste horário",
      );
    });
  });

  describe("Tratamento de Erros e Exceções", () => {
    test("Dada uma reserva inexistente, Quando o usuário tentar atualizar a reserva, Então o sistema deve lançar uma exceção", async () => {
      ReservationModel.listarReservas.mockResolvedValue([]);

      const idInexistente = 999;
      const dadosParaAtualizar = { usuario: "Novo Nome" };

      const tentativaDeAtualizar = ReservationService.atualizarReservas(
        idInexistente,
        dadosParaAtualizar,
      );

      await expect(tentativaDeAtualizar).rejects.toThrow(
        "Reserva não encontrada",
      );
    });
  });

  describe("Fluxos de Execução Principal", () => {
    test("Dada uma reserva existente, Quando o usuário tentar atualizar a reserva, Então o sistema deve permitir a atualização", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      const idExistente = 1;
      const dadosParaAtualizar = { usuario: "Novo Nome" };

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const tentativaDeAtualizar = await ReservationService.atualizarReservas(
        idExistente,
        dadosParaAtualizar,
      );
      expect(tentativaDeAtualizar.message).toBe(
        "Reserva atualizada com sucesso!",
      );
    });
  });
});
