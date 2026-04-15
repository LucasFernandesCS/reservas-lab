const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ReservationModel = {
  criarReserva: async (dados) => {
    const novaReserva = await prisma.reserva.create({ data: dados });
    return novaReserva;
  },

  listarReservas: async () => {
    const reservas = await prisma.reserva.findMany();
    return reservas;
  },

  atualizarReservas: async (id, dados) => {
    const reserva = await prisma.reserva.update({
      where: { reservaId: id },
      data: dados,
    });

    return reserva;
  },

  deletar: async (id) => {
    const reserva = await prisma.reserva.delete({ where: { reservaId: id } });

    return true;
  },
};

module.exports = ReservationModel;
