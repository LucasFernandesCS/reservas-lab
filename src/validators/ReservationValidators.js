const ReservationValidator = {
  isHorarioComercial: (reserva) => {
    const inicio = reserva.dataInicio.getHours();
    const fim = reserva.dataFinal.getHours();
    const minutoFim = reserva.dataFinal.getMinutes();

    if (
      inicio < 8 ||
      inicio >= 18 ||
      fim < 8 ||
      fim > 18 ||
      (fim === 18 && minutoFim > 0)
    ) {
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

  validarConflito: (reservasAtuais, reserva) => {
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
    const diferencaEmMs = reserva.dataFinal - reserva.dataInicio;
    const diferencaEmHoras = diferencaEmMs / (1000 * 60 * 60);
    if (diferencaEmHoras > 4) {
      throw new Error("A reserva não pode durar mais do que 4 horas");
    }

    return true;
  },

  validarExistencia: (reservaId, reservasAtuais) => {
    const reservaEncontrada = reservasAtuais.find(
      (r) => r.reservaId === reservaId,
    );

    if (!reservaEncontrada) {
      throw new Error("Reserva não encontrada");
    }

    return reservaEncontrada;
  },

  validarPrazoCancelamento: (reserva) => {
    const agora = new Date();
    const diferencaEmMs = reserva.dataInicio - agora;
    const diferencaEmHoras = diferencaEmMs / (1000 * 60 * 60);

    if (diferencaEmHoras < 24) {
      throw new Error(
        "Só é permitido cancelar com pelo menos 24 horas de antecedência",
      );
    }

    return true;
  },

  validarDatas: (reserva) => {
    const tempoInicio = new Date(reserva.dataInicio).getTime();
    const tempoFinal = new Date(reserva.dataFinal).getTime();
    if (tempoFinal <= tempoInicio) {
      throw new Error(
        "A data e hora finais devem ser maiores que a data e hora de início",
      );
    }
  },
};

module.exports = ReservationValidator;
