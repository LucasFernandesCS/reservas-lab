const UserService = require("../services/UserService");

const UserController = {
  criar: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const novoUsuario = await UserService.criarUsuario({
        name,
        email,
        password,
      });

      return res.status(201).json({
        message: "Usuário criado com sucesso!",
        usuario: novoUsuario,
      });
    } catch (error) {
      if (error.message === "Este e-mail já está cadastrado.") {
        return res.status(400).json({ erro: error.message });
      }

      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  },
};

module.exports = UserController;
