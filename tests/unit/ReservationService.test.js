jest.mock("../../src/models/ReservationModel");
const ReservationModel = require("../../src/models/ReservationModel");
const ReservationService = require("../../src/services/ReservationService");

beforeEach(() => {
  jest.clearAllMocks();
  ReservationModel.listarReservas.mockReturnValue([]);
});

test("Deve lançar uma exceção se a data de início for no passado", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2020-01-01T10:00:00"),
    dataFinal: new Date("2020-01-01T12:00:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva);
  }).toThrow("A data de início não pode estar no passado");
});

test("Deve lançar uma exceção se o horário final da reserva for antes do horário inicial", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-01T12:00:00"),
    dataFinal: new Date("2030-01-01T10:00:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva);
  }).toThrow(
    "O horário final da reserva não pode vir antes do horário inicial",
  );
});

test("Deve lançar uma exceção se a reserva for feita fora do horário comercial", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-01T07:00:00"),
    dataFinal: new Date("2030-01-01T09:00:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva);
  }).toThrow("A reserva só pode ser feita em horário comercial");
});

test("Deve lançar uma exceção se o final da reserva for imediatamente após o final do horário comercial", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-01T16:00:00"),
    dataFinal: new Date("2030-01-01T18:01:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva);
  }).toThrow("A reserva só pode ser feita em horário comercial");
});

test("Deve permitir uma reserva que termina exatamente às 18:00", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-07T17:00:00"),
    dataFinal: new Date("2030-01-07T18:00:00"),
  };
  const resultado = ReservationService.criarReserva(dadosDaReserva);
  expect(resultado.message).toBe("Reserva realizada com sucesso!");
});

test("Deve lançar uma exceção se a reserva for feita nos finais de semana", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-05T10:00:00"),
    dataFinal: new Date("2030-01-05T12:00:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva);
  }).toThrow("A reserva não pode ser feita nos finais de semana");
});

test("Deve lançar uma exceção se a reserva de sala durar mais do que 4 horas", () => {
  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-01T10:00:00"),
    dataFinal: new Date("2030-01-01T15:00:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva);
  }).toThrow("A reserva não pode durar mais do que 4 horas");
});

test("Deve lançar uma exceção se houver sobreposição de reservas", () => {
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

  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-07T10:30:00"),
    dataFinal: new Date("2030-01-07T12:30:00"),
  };

  expect(() => {
    ReservationService.criarReserva(dadosDaReserva, reservasExistentes);
  }).toThrow("A sala já está reservada neste horário");
});

test("Deve permitir uma reserva se ela for imediatamente após outra reserva", () => {
  const reservasExistentes = [
    {
      reservaId: 1,
      salaId: 1,
      usuario: "Diego",
      dataInicio: new Date("2030-01-07T10:00:00"),
      dataFinal: new Date("2030-01-07T12:00:00"),
    },
  ];

  const dadosDaReserva = {
    salaId: 1,
    usuario: "Beatriz",
    dataInicio: new Date("2030-01-07T12:00:00"),
    dataFinal: new Date("2030-01-07T14:00:00"),
  };

  const resultado = ReservationService.criarReserva(
    dadosDaReserva,
    reservasExistentes,
  );
  expect(resultado.message).toBe("Reserva realizada com sucesso!");
});
