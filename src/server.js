require("dotenv").config();

const express = require("express");
const ReservationRoutes = require("./routes/ReservationRoutes");

const app = express();

app.use(express.json());

app.use("/", ReservationRoutes);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
