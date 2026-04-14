jest.mock("../../../src/models/ReservationModel");
const ReservationModel = require("../../../src/models/ReservationModel");
const ReservationService = require("../../../src/services/ReservationService");

describe("ReservationService - Update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ReservationModel.listarReservas.mockReturnValue([]);
  });

  describe("Regras de Horário e Data", () => {
    test("Deve lançar uma exceção se a data de início for no passado", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2020-01-07T10:30:00"),
        dataFinal: new Date("2020-01-07T12:30:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(1, dadosConflitantes);
      }).toThrow("A data de início não pode estar no passado");
    });
    test("Deve lançar uma exceção se o novo horário horário final da reserva for antes do horário inicial", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:30:00"),
        dataFinal: new Date("2030-01-07T09:30:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(1, dadosConflitantes);
      }).toThrow(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    });
    test("Deve lançar uma exceção se o novo horário reserva for feita fora do horário comercial", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T07:30:00"),
        dataFinal: new Date("2030-01-07T10:30:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(1, dadosConflitantes);
      }).toThrow("A reserva só pode ser feita em horário comercial");
    });
    test("Deve lançar uma exceção se o novo final da reserva for imediatamente após o final do horário comercial", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T14:30:00"),
        dataFinal: new Date("2030-01-07T18:01:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(1, dadosConflitantes);
      }).toThrow("A reserva só pode ser feita em horário comercial");
    });
    test("Deve lançar uma exceção se a nova data de reserva for feita nos finais de semana", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-05T14:30:00"),
        dataFinal: new Date("2030-01-05T18:00:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(1, dadosConflitantes);
      }).toThrow("A reserva não pode ser feita nos finais de semana");
    });
    test("Deve lançar uma exceção se o novo horário de reserva durar mais do que 4 horas", () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:00:00"),
        dataFinal: new Date("2030-01-07T14:01:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(1, dadosConflitantes);
      }).toThrow("A reserva não pode durar mais do que 4 horas");
    });
  });

  describe("Validação de conflitos", () => {
    test("Deve lançar uma exceção se a atualização tentar sobrepor uma reserva", () => {
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
          dataInicio: new Date("2030-01-06T10:30:00"),
          dataFinal: new Date("2030-01-06T12:30:00"),
        },
      ];

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const dadosConflitantes = {
        dataInicio: new Date("2030-01-07T10:30:00"),
        dataFinal: new Date("2030-01-07T12:30:00"),
      };

      expect(() => {
        ReservationService.atualizarReservas(2, dadosConflitantes);
      }).toThrow("A sala já está reservada neste horário");
    });
  });

  describe("Tratamento de Erros e Exceções", () => {
    test("Deve lançar uma exceção se o ID não existir", () => {
      ReservationModel.listarReservas.mockReturnValue([]);

      const idInexistente = 999;
      const dadosParaAtualizar = { usuario: "Novo Nome" };

      expect(() => {
        ReservationService.atualizarReservas(idInexistente, dadosParaAtualizar);
      }).toThrow("Reserva não encontrada");
    });
  });

  describe("Fluxos de Execução Principal", () => {
    test("Deve permitir atualizar os dados de uma reserva", () => {
      const reservasExistentes = [
        {
          reservaId: 1776177447252,
          salaId: 1,
          usuario: "Diego",
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      const idExistente = 1776177447252;
      const dadosParaAtualizar = { usuario: "Novo Nome" };

      ReservationModel.listarReservas.mockReturnValue(reservasExistentes);

      const resultado = ReservationService.atualizarReservas(
        idExistente,
        dadosParaAtualizar,
      );
      expect(resultado.message).toBe("Reserva atualizada com sucesso!");
      expect(ReservationModel.atualizarReservas).toHaveBeenCalledWith(
        0,
        expect.objectContaining({
          reservaId: 1776177447252,
          usuario: "Novo Nome",
          salaId: 1,
        }),
      );
    });
  });
});
