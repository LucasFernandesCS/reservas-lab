const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ erro: "Acesso negado. Token não fornecido." });
  }
  const [, token] = authHeader.split(" ");

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioLogado = decodificado;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};
