const ReservationValidator = {
  isHorarioComercial: (reserva) => {
    const inicio = reserva.dataInicio.getHours();
    const fim = reserva.dataFinal.getHours();
    const minutoFim = reserva.dataFinal.getMinutes();

    if (inicio < 8 || fim > 18 || (fim === 18 && minutoFim > 0)) {
      throw new Error("A reserva só pode ser feita em horário comercial");
    }

    return true;
  },

  isDiaUtil: (reserva) => {
    const diasProibidos = [0, 6];

    if (
      diasProibidos.includes(reserva.dataInicio.getDay()) ||
      diasProibidos.includes(reserva.dataFinal.getDay())
    ) {
      throw new Error("A reserva não pode ser feita nos finais de semana");
    }

    return true;
  },

  isConflitoEncontrado: (reservasAtuais, reserva) => {
    const temConflito = reservasAtuais.some((reservaAntiga) => {
      return (
        reserva.reservaId !== reservaAntiga.reservaId &&
        reserva.salaId === reservaAntiga.salaId &&
        reserva.dataInicio < reservaAntiga.dataFinal &&
        reserva.dataFinal > reservaAntiga.dataInicio
      );
    });

    if (temConflito) {
      throw new Error("A sala já está reservada neste horário");
    }

    return true;
  },

  isReservaNoPassado: (reserva) => {
    if (reserva.dataInicio < new Date()) {
      throw new Error("A data de início não pode estar no passado");
    }

    return true;
  },

  isDataFinalAntes: (reserva) => {
    if (reserva.dataFinal < reserva.dataInicio) {
      throw new Error(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    }

    return true;
  },

  isAlemDoTempoLimite: (reserva) => {
    if ((reserva.dataFinal - reserva.dataInicio) / (1000 * 60 * 60) > 4) {
      throw new Error("A reserva não pode durar mais do que 4 horas");
    }

    return true;
  },
};

module.exports = ReservationValidator;
