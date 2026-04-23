const request = require("supertest");
const app = require("../../src/server");
const prisma = require("../../src/config/database");
const jwt = require("jsonwebtoken");

describe("Testes de Integração - Segurança e Autorização", () => {
  let tokenUsuarioA, tokenUsuarioB;
  let reservaA;

  beforeAll(async () => {
    await prisma.reserva.deleteMany();
    await prisma.usuario.deleteMany();

    const userA = await prisma.usuario.create({
      data: { name: "User A", email: "a@teste.com", password: "hash-seguro" },
    });

    const userB = await prisma.usuario.create({
      data: { name: "User B", email: "b@teste.com", password: "hash-seguro" },
    });

    tokenUsuarioA = jwt.sign(
      { id: userA.id, email: userA.email, role: "usuario" },
      process.env.JWT_SECRET,
    );
    tokenUsuarioB = jwt.sign(
      { id: userB.id, email: userB.email, role: "usuario" },
      process.env.JWT_SECRET,
    );

    const res = await request(app)
      .post("/reservas")
      .set("Authorization", `Bearer ${tokenUsuarioA}`)
      .send({
        salaId: 1,
        dataInicio: new Date("2030-12-12T14:00:00").toISOString(),
        dataFinal: new Date("2030-12-12T15:00:00").toISOString(),
      });

    reservaA = res.body.reserva;
  });

  test("Dado um Usuário B tentando cancelar a reserva do Usuário A, Quando a requisição for feita, Então o sistema deve retornar 403 Forbidden", async () => {
    const res = await request(app)
      .patch(`/reservas/${reservaA.reservaId}`)
      .set("Authorization", `Bearer ${tokenUsuarioB}`);

    expect(res.status).toBe(403);
    expect(res.body.erro).toContain("Você não tem permissão");
  });

  test("Dado um Usuário A tentando cancelar sua própria reserva, Quando a requisição for feita, Então o sistema deve permitir com 200 OK", async () => {
    const res = await request(app)
      .patch(`/reservas/${reservaA.reservaId}`)
      .set("Authorization", `Bearer ${tokenUsuarioA}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reserva cancelada com sucesso!");
  });
});
