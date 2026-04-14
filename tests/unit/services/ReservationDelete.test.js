jest.mock("../../../src/models/ReservationModel");
const ReservationModel = require("../../../src/models/ReservationModel");
const ReservationService = require("../../../src/services/ReservationService");

describe("ReservationService - Delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ReservationModel.listarReservas.mockReturnValue([]);
  });

  describe("Tratamento de Erros e Exceções", () => {
    test("Deve lançar uma exceção ao tentar deletar um ID inexistente", () => {
      ReservationModel.listarReservas.mockReturnValue([]);

      const idInexistente = 999;

      expect(() => {
        ReservationService.cancelarReserva(idInexistente);
      }).toThrow("Reserva não encontrada");
    });

    test("Deve lançar uma exceção caso o usuário tente cancelar a reserva com menos de 24 horas", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2026-04-15T10:00:00"),
          dataFinal: new Date("2026-04-15T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      expect(() => {
        ReservationService.cancelarReserva(1);
      }).toThrow(
        "Só é permitido cancelar com pelo menos 24 horas de antecedência",
      );
    });
  });
  describe("Fluxo de execução principal", () => {
    test("Deve permitir cancelar uma reserva ao passar um ID válido", () => {
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

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const resultado = ReservationService.cancelarReserva(idParaDeletar);

      expect(resultado.message).toBe("Reserva cancelada com sucesso!");
      expect(ReservationModel.deletar).toHaveBeenCalledWith(idParaDeletar);
    });
  });
});
