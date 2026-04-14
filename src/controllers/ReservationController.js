const ReservationService = require("../services/ReservationService");

const ReservationController = {
  criar: (req, res) => {
    try {
      const dadosRecebidos = {
        ...req.body,
        dataInicio: new Date(req.body.dataInicio),
        dataFinal: new Date(req.body.dataFinal),
      };

      const resultado = ReservationService.criarReserva(dadosRecebidos);

      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },

  listar: (req, res) => {
    try {
      const resultado = ReservationService.listarTodas();

      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ erro: error.message });
    }
  },
};

module.exports = ReservationController;
