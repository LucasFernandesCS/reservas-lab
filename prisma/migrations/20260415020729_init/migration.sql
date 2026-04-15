-- CreateTable
CREATE TABLE "Reserva" (
    "reservaId" SERIAL NOT NULL,
    "salaId" INTEGER NOT NULL,
    "usuario" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFinal" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("reservaId")
);
