const express = require("express");
const ReservationController = require("../controllers/ReservationController");

const router = express.Router();

router.post("/reservas", ReservationController.criar);
router.get("/reservas", ReservationController.listar);

module.exports = router;
