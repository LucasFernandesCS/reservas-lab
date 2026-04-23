const prisma = require("../config/database");

const UserModel = {
  buscarPorEmail: async (email) => {
    return await prisma.usuario.findUnique({
      where: { email },
    });
  },

  buscarPorId: async (id) => {
    return await prisma.usuario.findUnique({
      where: { id },
    });
  },

  criar: async (dados) => {
    return await prisma.usuario.create({
      data: dados,
    });
  },

  atualizarRefreshToken: async (id, token) => {
    return await prisma.usuario.update({
      where: { id },
      data: { refreshToken: token },
    });
  },
};

module.exports = UserModel;
