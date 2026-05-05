import { describe, it, expect } from "vitest"
import { Licencia } from "../../src/licencia/licencia.entity.js"

describe("Licencia", () => {
  const licencia = new Licencia()
  licencia.fechaHecho = new Date("2023-01-01T00:00:00")
  licencia.fechaVencimiento = new Date("2025-01-01T00:00:00")
  licencia.estado = "Activo"

  it("Licencia valida", () => {
    const fechaCominenzo = new Date("2024-01-01T10:00:00");
    const fechaFin = new Date("2024-01-01T12:00:00");

    const licenciaValida = licencia.validarLicencia(fechaCominenzo, fechaFin)

    expect(licenciaValida).toBe(true)
  })
  it("Licencia invalida (por fecha)", () => {
    const fechaCominenzo = new Date("2022-01-01T10:00:00");
    const fechaFin = new Date("2024-01-01T12:00:00");

    const licenciaValida = licencia.validarLicencia(fechaCominenzo, fechaFin)

    expect(licenciaValida).toBe(false)
  }) 
})