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

describe("ReservationService - Delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ReservationModel.listarReservas.mockResolvedValue([]);
  });

  describe("Tratamento de Erros e Exceções", () => {
    test("Dada uma reserva inexistente, Quando o usuário tentar cancelar a reserva, Então o sistema deve lançar uma exceção", async () => {
      ReservationModel.listarReservas.mockResolvedValue([]);

      const idInexistente = 999;

      const tentativaDeCancelar =
        ReservationService.cancelarReserva(idInexistente);

      await expect(tentativaDeCancelar).rejects.toThrow(
        "Reserva não encontrada",
      );
    });

    test("Dada uma reserva faltando menos de 24 horas para o seu início, Quando o usuário tentar cancelar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2026-04-15T10:00:00"),
          dataFinal: new Date("2026-04-15T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const tentativaDeCancelar = ReservationService.cancelarReserva(1);

      await expect(tentativaDeCancelar).rejects.toThrow(
        "Só é permitido cancelar com pelo menos 24 horas de antecedência",
      );
    });
  });
  describe("Fluxo de execução principal", () => {
    test("Dada uma reserva existente, Quando o usuário tentar cancelar a reserva, Então o sistema deve permitir o cancelamento", async () => {
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
          usuario: "Diego",
          dataInicio: new Date("2030-01-08T10:00:00"),
          dataFinal: new Date("2030-01-08T11:00:00"),
        },
      ];

      idParaDeletar = 2;

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const tentativaDeCancelar =
        await ReservationService.cancelarReserva(idParaDeletar);

      expect(tentativaDeCancelar.message).toBe(
        "Reserva cancelada com sucesso!",
      );
      expect(ReservationModel.deletar).toHaveBeenCalledWith(idParaDeletar);
    });
  });
});
