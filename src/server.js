const express = require("express");
const ReservationRoutes = require("./routes/ReservationRoutes");

const app = express();

app.use(express.json());

app.use("/", ReservationRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
