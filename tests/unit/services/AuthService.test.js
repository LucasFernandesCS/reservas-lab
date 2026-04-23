const AuthService = require("../../../src/services/AuthService");
const UserModel = require("../../../src/models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../../src/models/UserModel", () => ({
  buscarPorEmail: jest.fn(),
  buscarPorId: jest.fn(),
  atualizarRefreshToken: jest.fn(),
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
    process.env.JWT_SECRET = "secret";
    process.env.JWT_REFRESH_SECRET = "refresh_secret";
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
    test("Dado um e-mail existente e a senha correta, Quando o usuário tentar fazer login, Então o sistema deve gerar e retornar um par de tokens (Access e Refresh)", async () => {
      UserModel.buscarPorEmail.mockResolvedValue({
        id: 1,
        email: "usuario@teste.com",
        password: "hashDoBanco",
        role: "usuario",
      });

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign
        .mockReturnValueOnce("token_access_123")
        .mockReturnValueOnce("token_refresh_456");

      const dadosLogin = {
        email: "usuario@teste.com",
        password: "senhaCorreta",
      };

      const resultado = await AuthService.login(dadosLogin);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "senhaCorreta",
        "hashDoBanco",
      );

      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        { id: 1, email: "usuario@teste.com", role: "usuario" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        { id: 1 },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      expect(UserModel.atualizarRefreshToken).toHaveBeenCalledWith(
        1,
        "token_refresh_456",
      );

      expect(resultado).toEqual({
        accessToken: "token_access_123",
        refreshToken: "token_refresh_456",
      });
    });
  });
});
