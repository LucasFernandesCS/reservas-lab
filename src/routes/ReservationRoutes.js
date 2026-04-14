const express = require("express");
const ReservationController = require("../controllers/ReservationController");

const router = express.Router();

router.post("/reservas", ReservationController.criar);
router.get("/reservas", ReservationController.listar);
router.put("/reservas/:id", ReservationController.atualizar);

module.exports = router;
