const UserService = require("../../../src/services/UserService");
const UserModel = require("../../../src/models/UserModel"); // Importamos o Model
const bcrypt = require("bcryptjs");

jest.mock("../../../src/models/UserModel", () => ({
  buscarPorEmail: jest.fn(),
  criar: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe("UserService - Create", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Cenário: Tentativa de cadastro com e-mail já existente", () => {
    test("Dado um e-mail que já existe no sistema, Quando o usuário tentar criar o cadastro, Então o sistema deve lançar uma exceção", async () => {
      UserModel.buscarPorEmail.mockResolvedValue({
        id: 1,
        email: "teste@teste.com",
      });

      const dadosEntrada = {
        name: "João",
        email: "teste@teste.com",
        password: "123",
      };

      const tentativaDeCadastro = UserService.criarUsuario(dadosEntrada);

      await expect(tentativaDeCadastro).rejects.toThrow(
        "Este e-mail já está cadastrado.",
      );

      expect(UserModel.criar).not.toHaveBeenCalled();
    });
  });

  describe("Cenário: Cadastro com dados válidos", () => {
    test("Dado um e-mail inédito e dados válidos, Quando o usuário tentar criar o cadastro, Então o sistema deve permitir a criação e omitir a senha na resposta", async () => {
      UserModel.buscarPorEmail.mockResolvedValue(null);

      bcrypt.genSalt.mockResolvedValue("saltAleatorio");
      bcrypt.hash.mockResolvedValue("senhaCriptografadaXYZ");

      UserModel.criar.mockResolvedValue({
        id: 1,
        name: "Maria",
        email: "maria@teste.com",
        password: "senhaCriptografadaXYZ",
      });

      const dadosEntrada = {
        name: "Maria",
        email: "maria@teste.com",
        password: "senhaSecreta",
      };

      const resultado = await UserService.criarUsuario(dadosEntrada);

      expect(bcrypt.hash).toHaveBeenCalledWith("senhaSecreta", "saltAleatorio");

      expect(UserModel.criar).toHaveBeenCalledWith({
        name: "Maria",
        email: "maria@teste.com",
        password: "senhaCriptografadaXYZ",
      });

      expect(resultado.password).toBeUndefined();
      expect(resultado.id).toBe(1);
    });
  });
});
