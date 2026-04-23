const prisma = require("../config/database");

const ReservationModel = {
  criarReserva: async (dados) => {
    return await prisma.reserva.create({ data: dados });
  },

  listarReservas: async () => {
    return await prisma.reserva.findMany({
      where: {
        status: "ATIVA",
      },
      select: {
        reservaId: true,
        salaId: true,
        dataInicio: true,
        dataFinal: true,
        status: true,
        usuarioId: true,
      },
    });
  },

  atualizarReservas: async (id, dados) => {
    return await prisma.reserva.update({
      where: { reservaId: id },
      data: dados,
    });
  },

  deletarReserva: async (id) => {
    const reserva = await prisma.reserva.delete({ where: { reservaId: id } });

    return true;
  },

  cancelarReserva: async (id) => {
    return await prisma.reserva.update({
      where: {
        reservaId: Number(id),
      },
      data: {
        status: "CANCELADA",
      },
    });
  },
};

module.exports = ReservationModel;
