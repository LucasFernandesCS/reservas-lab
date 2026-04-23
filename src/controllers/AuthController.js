const AuthService = require("../services/AuthService");

const AuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const tokens = await AuthService.login({ email, password });

      return res.status(200).json({
        mensagem: "Login bem-sucedido!",
        ...tokens,
      });
    } catch (error) {
      if (error.message === "Credenciais inválidas") {
        return res.status(401).json({ erro: error.message });
      }

      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ erro: "Refresh Token é obrigatório." });
      }

      const novosTokens = await AuthService.refresh(refreshToken);

      return res.status(200).json({
        mensagem: "Tokens renovados!",
        ...novosTokens,
      });
    } catch (error) {
      return res.status(401).json({ erro: error.message });
    }
  },
};

module.exports = AuthController;
