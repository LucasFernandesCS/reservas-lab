const bancoDeReservas = [];

const ReservationService = {
  criarReserva: (dados, reservasAtuais = bancoDeReservas) => {
    const diasProibidos = [0, 6];

    const temConflito = reservasAtuais.some((reservaAntiga) => {
      return (
        dados.dataInicio < reservaAntiga.dataFinal &&
        dados.dataFinal > reservaAntiga.dataInicio
      );
    });

    if (dados.dataInicio < new Date()) {
      throw new Error("A data de início não pode estar no passado");
    }

    if (dados.dataFinal < dados.dataInicio) {
      throw new Error(
        "O horário final da reserva não pode vir antes do horário inicial",
      );
    }

    if (
      dados.dataInicio.getHours() < 8 ||
      dados.dataFinal.getHours() > 18 ||
      (dados.dataFinal.getHours() === 18 && dados.dataFinal.getMinutes() > 0)
    ) {
      throw new Error("A reserva só pode ser feita em horário comercial");
    }

    if (
      diasProibidos.includes(dados.dataInicio.getDay()) ||
      diasProibidos.includes(dados.dataFinal.getDay())
    ) {
      throw new Error("A reserva não pode ser feita nos finais de semana");
    }

    if ((dados.dataFinal - dados.dataInicio) / (1000 * 60 * 60) > 4) {
      throw new Error("A reserva não pode durar mais do que 4 horas");
    }

    if (temConflito) {
      throw new Error("A sala já está reservada neste horário");
    }

    reservasAtuais.push(dados);

    return {
      message: "Reserva realizada com sucesso!",
      reserva: dados,
    };
  },

  listarTodas: () => {
    return bancoDeReservas;
  },
};

module.exports = ReservationService;
