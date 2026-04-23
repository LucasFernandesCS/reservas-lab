const express = require("express");
const ReservationController = require("../controllers/ReservationController");
const UserController = require("../controllers/UserController");
const AuthController = require("../controllers/AuthController");
const Authorize = require("../middlewares/Authorize");
const authMiddleware = require("../middlewares/Auth");

const router = express.Router();

router.post("/usuarios", UserController.criar);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/reservas", authMiddleware, ReservationController.criar);
router.get("/reservas", ReservationController.listar);
router.put(
  "/reservas/:id",
  authMiddleware,
  Authorize.isOwnerOrAdmin,
  ReservationController.atualizar,
);
router.patch(
  "/reservas/:id",
  authMiddleware,
  Authorize.isOwnerOrAdmin,
  ReservationController.cancelar,
);
router.delete(
  "/reservas/:id",
  authMiddleware,
  Authorize.isAdmin,
  ReservationController.deletar,
);

module.exports = router;
