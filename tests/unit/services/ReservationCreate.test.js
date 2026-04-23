jest.mock("../../../src/models/ReservationModel");

const ReservationModel = require("../../../src/models/ReservationModel");
const ReservationService = require("../../../src/services/ReservationService");

describe("ReservationService - Create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ReservationModel.listarReservas.mockResolvedValue([]);
  });

  describe("Regras de Horário e Data", () => {
    test("Dada uma data de início que já passou, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2020-01-01T10:00:00"),
        dataFinal: new Date("2020-01-01T12:00:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A data de início não pode estar no passado",
      );
    });
    test("Dada uma data final anterior a data de início, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-01T12:00:00"),
        dataFinal: new Date("2030-01-01T10:00:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    });
    test("Dado um horário fora do horário comercial, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-01T23:20:00"),
        dataFinal: new Date("2030-01-02T00:30:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um horário final de reserva ser imediatamente após o final do horário comercial, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-01T16:00:00"),
        dataFinal: new Date("2030-01-01T18:01:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A reserva só pode ser feita em horário comercial",
      );
    });
    test("Dado um dia não útil, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-05T10:00:00"),
        dataFinal: new Date("2030-01-05T12:00:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A reserva não pode ser feita nos finais de semana",
      );
    });
    test("Dado um horário de reserva que ultrapasse o limite de 4 horas de uso, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-01T10:00:00"),
        dataFinal: new Date("2030-01-01T15:00:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A reserva não pode durar mais do que 4 horas",
      );
    });
    test("Dada uma reserva com a data de fim igual a data de inicio, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-01T10:00:00"),
        dataFinal: new Date("2030-01-01T10:00:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A data e hora finais devem ser maiores que a data e hora de início",
      );
    });
  });

  describe("Validação de conflitos", () => {
    test("Dado um horário de reserva que já está ocupado, Quando o usuário tentar criar a reserva, Então o sistema deve lançar uma exceção", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuarioId: 1,
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T11:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-07T10:30:00"),
        dataFinal: new Date("2030-01-07T12:30:00"),
      };

      const tentativaDeCriar = ReservationService.criarReserva(dadosDaReserva);

      await expect(tentativaDeCriar).rejects.toThrow(
        "A sala já está reservada neste horário",
      );
    });
  });

  describe("Testes de bordas", () => {
    test("Dada uma reserva que acabe junto com o horário comercial, Quando o usuário tentar criar a reserva, Então o sistema deve permitir a criação", async () => {
      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-07T17:00:00"),
        dataFinal: new Date("2030-01-07T18:00:00"),
      };

      const tentativaDeCriar =
        await ReservationService.criarReserva(dadosDaReserva);
      expect(tentativaDeCriar.message).toBe("Reserva realizada com sucesso!");
    });

    test("Dada uma reserva que inicie imediatamente após o final de outra reserva, Quando o usuário tentar criar a reserva, Então o sistema deve permitir a criação", async () => {
      const reservasExistentes = [
        {
          reservaId: 1,
          salaId: 1,
          usuarioId: 1,
          dataInicio: new Date("2030-01-07T10:00:00"),
          dataFinal: new Date("2030-01-07T12:00:00"),
        },
      ];

      ReservationModel.listarReservas.mockResolvedValue(reservasExistentes);

      const dadosDaReserva = {
        salaId: 1,
        usuarioId: 1,
        dataInicio: new Date("2030-01-07T12:00:00"),
        dataFinal: new Date("2030-01-07T14:00:00"),
      };

      const resultado = await ReservationService.criarReserva(dadosDaReserva);
      expect(resultado.message).toBe("Reserva realizada com sucesso!");
    });
  });
});
