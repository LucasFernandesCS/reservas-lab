const Authorize = require("../../../src/middlewares/Authorize");
const ReservationModel = require("../../../src/models/ReservationModel");

jest.mock("../../../src/models/ReservationModel");

describe("Middleware Authorize - isOwnerOrAdmin", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: "1" },
      usuarioLogado: { id: 10, role: "usuario" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("Dado que o usuário logado é o DONO da reserva, Quando o middleware processar, Então deve chamar o next()", async () => {
    ReservationModel.listarReservas.mockResolvedValue([
      { reservaId: 1, usuarioId: 10 },
    ]);

    await Authorize.isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Dado que o usuário logado NÃO é o dono e NÃO é admin, Quando o middleware processar, Então deve retornar 403 Forbidden", async () => {
    ReservationModel.listarReservas.mockResolvedValue([
      { reservaId: 1, usuarioId: 99 },
    ]);

    await Authorize.isOwnerOrAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      erro: "Acesso negado. Você não tem permissão para alterar esta reserva.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("Dado que o usuário logado NÃO é o dono mas é ADMIN, Quando o middleware processar, Então deve permitir o acesso chamando next()", async () => {
    req.usuarioLogado = { id: 50, role: "admin" }; // É outro usuário, mas é admin
    ReservationModel.listarReservas.mockResolvedValue([
      { reservaId: 1, usuarioId: 10 },
    ]);

    await Authorize.isOwnerOrAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
