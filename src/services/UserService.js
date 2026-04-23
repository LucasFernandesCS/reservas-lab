const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

const UserService = {
  criarUsuario: async ({ name, email, password }) => {
    const usuarioExiste = await UserModel.buscarPorEmail(email);

    if (usuarioExiste) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(password, salt);

    const novoUsuario = await UserModel.criar({
      name,
      email,
      password: senhaCriptografada,
    });

    novoUsuario.password = undefined;

    return novoUsuario;
  },
};

module.exports = UserService;
