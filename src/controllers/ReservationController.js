const ReservationService = require("../services/ReservationService");

const ReservationController = {
  criar: async (req, res) => {
    try {
      const usuarioId = req.usuarioLogado.id;

      const dadosRecebidos = {
        ...req.body,
        usuarioId: usuarioId,
        dataInicio: new Date(req.body.dataInicio),
        dataFinal: new Date(req.body.dataFinal),
      };

      const resultado = await ReservationService.criarReserva(dadosRecebidos);

      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },

  listar: async (req, res) => {
    try {
      const resultado = await ReservationService.listarReservas();

      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },

  atualizar: async (req, res) => {
    try {
      const reservaId = Number(req.params.id);
      const usuarioId = req.usuarioLogado.id;

      const dadosRecebidos = {
        ...req.body,
        usuarioId: usuarioId,
      };

      const resultado = await ReservationService.atualizarReservas(
        reservaId,
        dadosRecebidos,
      );
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },

  cancelar: async (req, res) => {
    try {
      const reservaId = Number(req.params.id);

      const resultado = await ReservationService.cancelarReserva(reservaId);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },

  deletar: async (req, res) => {
    try {
      const reservaId = Number(req.params.id);

      const resultado = await ReservationService.deletarReserva(reservaId);
      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },
};

module.exports = ReservationController;
