const ReservationModel = require("../models/ReservationModel");

const Authorize = {
  isAdmin: (req, res, next) => {
    if (req.usuarioLogado.role !== "admin") {
      return res
        .status(403)
        .json({
          erro: "Acesso negado. Recurso exclusivo para administradores.",
        });
    }
    next();
  },

  isOwnerOrAdmin: async (req, res, next) => {
    const { id } = req.params;
    const usuarioIdLogado = req.usuarioLogado.id;
    const roleLogada = req.usuarioLogado.role;

    try {
      const reservas = await ReservationModel.listarReservas();
      const reserva = reservas.find((r) => r.reservaId === Number(id));

      if (!reserva) {
        return res.status(404).json({ erro: "Reserva não encontrada." });
      }

      if (roleLogada !== "admin" && reserva.usuarioId !== usuarioIdLogado) {
        return res
          .status(403)
          .json({
            erro: "Acesso negado. Você não tem permissão para alterar esta reserva.",
          });
      }

      next();
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao validar permissões." });
    }
  },
};

module.exports = Authorize;
