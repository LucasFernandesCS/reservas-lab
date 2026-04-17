const ReservationModel = require("../models/ReservationModel");
const ReservationValidator = require("../validators/ReservationValidators");

const ReservationService = {
  criarReserva: async (dados) => {
    const reservasAtuais = await ReservationModel.listarReservas();

    ReservationValidator.isReservaNoPassado(dados);
    ReservationValidator.isDataFinalAntes(dados);
    ReservationValidator.isHorarioComercial(dados);
    ReservationValidator.isDiaUtil(dados);
    ReservationValidator.isAlemDoTempoLimite(dados);
    ReservationValidator.validarConflito(reservasAtuais, dados);

    const reserva = await ReservationModel.criarReserva(dados);

    return {
      message: "Reserva realizada com sucesso!",
      reserva: reserva,
    };
  },

  listarReservas: async () => {
    const reservas = await ReservationModel.listarReservas();
    return reservas;
  },

  atualizarReservas: async (reservaId, dados) => {
    const reservasAtuais = await ReservationModel.listarReservas();
    const reservaAntiga = await ReservationValidator.validarExistencia(
      reservaId,
      reservasAtuais,
    );

    const reservaParaValidar = {
      ...reservaAntiga,
      ...dados,
    };

    reservaParaValidar.dataInicio = new Date(reservaParaValidar.dataInicio);
    reservaParaValidar.dataFinal = new Date(reservaParaValidar.dataFinal);

    ReservationValidator.isReservaNoPassado(reservaParaValidar);
    ReservationValidator.isDataFinalAntes(reservaParaValidar);
    ReservationValidator.isHorarioComercial(reservaParaValidar);
    ReservationValidator.isDiaUtil(reservaParaValidar);
    ReservationValidator.isAlemDoTempoLimite(reservaParaValidar);
    ReservationValidator.validarConflito(reservasAtuais, reservaParaValidar);

    const reservaAtualizada = await ReservationModel.atualizarReservas(
      reservaId,
      reservaParaValidar,
    );

    return {
      message: "Reserva atualizada com sucesso!",
    };
  },

  cancelarReserva: async (id) => {
    const reservasAtuais = await ReservationModel.listarReservas();

    const reserva = ReservationValidator.validarExistencia(id, reservasAtuais);
    ReservationValidator.validarPrazoCancelamento(reserva);

    await ReservationModel.deletar(id);

    return {
      message: "Reserva cancelada com sucesso!",
    };
  },
};

module.exports = ReservationService;
