const AuthService = require("../../../src/services/AuthService");
const UserModel = require("../../../src/models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../../src/models/UserModel", () => ({
  buscarPorEmail: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("AuthService - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Cenário: Tentativa de login com e-mail inexistente", () => {
    test("Dado um e-mail que não está cadastrado, Quando o usuário tentar fazer login, Então o sistema deve lançar uma exceção de credenciais inválidas", async () => {
      UserModel.buscarPorEmail.mockResolvedValue(null);

      const dadosLogin = { email: "fantasma@teste.com", password: "123" };

      const tentativaDeLogin = AuthService.login(dadosLogin);

      await expect(tentativaDeLogin).rejects.toThrow("Credenciais inválidas");

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe("Cenário: Tentativa de login com senha incorreta", () => {
    test("Dado um e-mail existente porém com a senha incorreta, Quando o usuário tentar fazer login, Então o sistema deve lançar uma exceção de credenciais inválidas", async () => {
      UserModel.buscarPorEmail.mockResolvedValue({
        id: 1,
        email: "usuario@teste.com",
        password: "hashDoBanco",
      });

      bcrypt.compare.mockResolvedValue(false);

      const dadosLogin = {
        email: "usuario@teste.com",
        password: "senhaErrada",
      };

      const tentativaDeLogin = AuthService.login(dadosLogin);

      await expect(tentativaDeLogin).rejects.toThrow("Credenciais inválidas");
      expect(bcrypt.compare).toHaveBeenCalledWith("senhaErrada", "hashDoBanco");

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe("Cenário: Login com credenciais válidas", () => {
    test("Dado um e-mail existente e a senha correta, Quando o usuário tentar fazer login, Então o sistema deve gerar e retornar um token JWT", async () => {
      UserModel.buscarPorEmail.mockResolvedValue({
        id: 1,
        email: "usuario@teste.com",
        password: "hashDoBanco",
      });

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign.mockReturnValue("token_jwt_super_seguro_123");

      const dadosLogin = {
        email: "usuario@teste.com",
        password: "senhaCorreta",
      };

      const tokenGerado = await AuthService.login(dadosLogin);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "senhaCorreta",
        "hashDoBanco",
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, email: "usuario@teste.com", role: "usuario" },
        process.env.JWT_SECRET,
        { expiresIn: "8h" },
      );

      expect(tokenGerado).toBe("token_jwt_super_seguro_123");
    });
  });
});
