import { describe, it, expect } from "vitest"
import { Viaje } from "../../src/viaje/viaje.entity.js"

// TESTS PARA VALIDAR SOLAPAMIENTO DE VIAJES Y ESTADO DE LOS MISMOS

describe("Viaje", () => {
  const viaje = new Viaje()
  viaje.fechaFin = new Date("2025-01-01T00:00:00")
  viaje.fechaIni = new Date("2023-01-01T00:00:00")
  viaje.estado = "Activo"

  it("Hay solapamiento", () => {
    const fechaCominenzo = new Date("2024-01-01T10:00:00");
    const fechaFin = new Date("2027-01-01T12:00:00");

    const valido = viaje.validarSolapamiento(fechaCominenzo, fechaFin)

    expect(valido).toBe(true)
  })
  it("No hay solapamiento", () => {
    const fechaCominenzo = new Date("2026-01-01T10:00:00");
    const fechaFin = new Date("2026-01-01T12:00:00");

    const valido = viaje.validarSolapamiento(fechaCominenzo, fechaFin)

    expect(valido).toBe(false)
  }) 

  it("Estado Activo", () => {
    const valido = viaje.estaActivo()

    expect(valido).toBe(true)
  }) 

  it("Estado Rechazado", () => {
    viaje.estado = "Rechazado"

    const valido = viaje.estaActivo()

    expect(valido).toBe(false)
  }) 
  
  
})