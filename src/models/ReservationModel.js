let bancoDeReservas = [];

const ReservationModel = {
  criarReserva: (dados, reservasAtuais = bancoDeReservas) => {
    const novaReserva = {
      ...dados,
      reservaId: Date.now(),
    };

    reservasAtuais.push(novaReserva);

    return novaReserva;
  },

  listarReservas: () => {
    return bancoDeReservas;
  },

  atualizarReservas: (index, dados) => {
    bancoDeReservas[index] = { ...bancoDeReservas[index], ...dados };

    return bancoDeReservas[index];
  },

  deletar: (id) => {
    bancoDeReservas = bancoDeReservas.filter(
      (reserva) => reserva.reservaId !== id,
    );

    return true;
  },
};

module.exports = ReservationModel;
