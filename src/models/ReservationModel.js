const prisma = require("../config/database");

const ReservationModel = {
  criarReserva: async (dados) => {
    return await prisma.reserva.create({ data: dados });
  },

  listarReservas: async () => {
    return await prisma.reserva.findMany();
  },

  atualizarReservas: async (id, dados) => {
    return await prisma.reserva.update({
      where: { reservaId: id },
      data: dados,
    });
  },

  deletar: async (id) => {
    const reserva = await prisma.reserva.delete({ where: { reservaId: id } });

    return true;
  },
};

module.exports = ReservationModel;
