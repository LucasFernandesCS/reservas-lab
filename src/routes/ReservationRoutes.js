const express = require("express");
const ReservationController = require("../controllers/ReservationController");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/Auth");

const router = express.Router();

router.post("/login", AuthController.login);
router.post("/reservas", authMiddleware, ReservationController.criar);
router.get("/reservas", ReservationController.listar);
router.put("/reservas/:id", authMiddleware, ReservationController.atualizar);
router.patch("/reservas/:id", authMiddleware, ReservationController.cancelar);
router.delete("/reservas/:id", authMiddleware, ReservationController.deletar);

module.exports = router;
