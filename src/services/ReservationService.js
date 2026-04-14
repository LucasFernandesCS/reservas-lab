const ReservationModel = require("../models/ReservationModel");
const ReservationValidator = require("../validators/ReservationValidators");

const ReservationService = {
  criarReserva: (dados) => {
    const reservasAtuais = ReservationModel.listarReservas();

    ReservationValidator.isReservaNoPassado(dados);
    ReservationValidator.isDataFinalAntes(dados);
    ReservationValidator.isHorarioComercial(dados);
    ReservationValidator.isDiaUtil(dados);
    ReservationValidator.isAlemDoTempoLimite(dados);
    ReservationValidator.validarConflito(reservasAtuais, dados);

    const reserva = ReservationModel.criarReserva(dados);

    return {
      message: "Reserva realizada com sucesso!",
    };
  },

  listarReservas: () => {
    const reservas = ReservationModel.listarReservas();
    return reservas;
  },

  atualizarReservas: (reservaId, dados) => {
    const reservasAtuais = ReservationModel.listarReservas();
    const reservaAntiga = ReservationValidator.validarExistencia(
      reservaId,
      reservasAtuais,
    );

    const index = reservasAtuais.findIndex((r) => r.reservaId === reservaId);

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

    const reservaAtualizada = ReservationModel.atualizarReservas(
      index,
      reservaParaValidar,
    );

    return {
      message: "Reserva atualizada com sucesso!",
    };
  },

  cancelarReserva: (id) => {
    const reservasAtuais = ReservationModel.listarReservas();

    const reserva = ReservationValidator.validarExistencia(id, reservasAtuais);
    ReservationValidator.validarPrazoCancelamento(reserva);

    ReservationModel.deletar(id);

    return {
      message: "Reserva cancelada com sucesso!",
    };
  },
};

module.exports = ReservationService;
