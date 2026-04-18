const jwt = require("jsonwebtoken");

module.exports = {
  login: (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === "admin" && senha === "admin123") {
      const token = jwt.sign(
        { usuario: "admin", role: "administrador" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );
      return res.status(200).json({
        mensagem: "Login bem-sucedido!",
        token: token,
      });
    }

    return res.status(401).json({ erro: "Credenciais inválidas" });
  },
};
