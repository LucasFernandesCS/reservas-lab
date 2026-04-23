const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthService = {
  login: async ({ email, password }) => {
    const usuario = await UserModel.buscarPorEmail(email);

    if (!usuario) {
      throw new Error("Credenciais inválidas");
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);

    if (!senhaValida) {
      throw new Error("Credenciais inválidas");
    }

    return await AuthService.gerarTokens(usuario);
  },

  gerarTokens: async (usuario) => {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role || "usuario",
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    await UserModel.atualizarRefreshToken(usuario.id, refreshToken);

    return { accessToken, refreshToken };
  },

  refresh: async (tokenEnviado) => {
    try {
      const decodificado = jwt.verify(
        tokenEnviado,
        process.env.JWT_REFRESH_SECRET,
      );

      const usuario = await UserModel.buscarPorId(decodificado.id);

      if (!usuario || usuario.refreshToken !== tokenEnviado) {
        throw new Error("Refresh token inválido");
      }

      return await AuthService.gerarTokens(usuario);
    } catch (err) {
      throw new Error("Refresh token expirado ou inválido");
    }
  },
};

module.exports = AuthService;
