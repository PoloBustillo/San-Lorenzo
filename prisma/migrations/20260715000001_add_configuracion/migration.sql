-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clave_key" ON "Configuracion"("clave");

-- CreateTable
CREATE TABLE "UmbralMaterial" (
    "id" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "minBancos" INTEGER,
    "minKg" DOUBLE PRECISION,
    "precioPorKg" DOUBLE PRECISION,

    CONSTRAINT "UmbralMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UmbralMaterial_material_key" ON "UmbralMaterial"("material");
