import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { orm } from '../../src/shared/db/orm.js';
import jwt from 'jsonwebtoken';
import { Tren } from '../../src/tren/tren.entity.js';
import { Conductor } from '../../src/conductor/conductor.entity.js';
import { Recorrido } from '../../src/recorrido/recorrido.entity.js';

describe('POST /api/viaje', () => {
  let adminToken: string;
  let trenId: number;
  let conductorId: number;
  let recorridoId: number;

  beforeAll(async () => {
    await orm.connect(); // Asegurarse que el orm esta conectado

    adminToken = jwt.sign(
      { userId: 0, role: 'admin' }, 
      process.env.JWT_SECRET || 'llaveTemporal', 
      { expiresIn: '1h' }
    );
  });

  beforeEach(async () => {
    orm.schema.clearDatabase();
    
    const em = orm.em.fork()

    // se crean las instancias necesarias para crear el viaje 

    const tren = em.create(Tren, {
      color: 'Rojo',
      modelo: 'General Electric',
    });

    const conductor = em.create(Conductor, {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'password123',
      estado: 'Activo',      
    });

    const recorrido = em.create(Recorrido, {
      ciudadSalida: 'Rosario',
      ciudadLlegada: 'Retiro',
      totalKm: 300,
      estado: 'Activo',
    });

    await em.flush();

    trenId = tren.id || 1;
    conductorId = conductor.id || 1;
    recorridoId = recorrido.id || 1;
  });

  afterAll(async () => {
    try {
    if (await orm.isConnected()) {
      await orm.close(true);
    }
  } catch (error) {
    console.error("Error cerrando el ORM:", error);
  }
  });

  it('debería crear un nuevo viaje exitosamente', async () => {
    const nuevoViaje = {
      fechaIni: '2026-05-10T10:00:00',
      fechaFin: '2026-05-10T18:00:00',
      estado: 'Activo',
      idTren: trenId, 
      idRecorrido: recorridoId,
      idConductor: conductorId
    };

    const response = await request(app)
      .post('/api/viaje')
      .set('Cookie', [`token=${adminToken}`]) 
      .send(nuevoViaje);

    
    expect(response.status).toBe(201); 
    expect(response.body).toHaveProperty('message');
    
    // Verificación extra para ver si realmente se guard en la db
    const viajeEnDb = await orm.em.fork().findOne('Viaje', { tren: 1 });
    expect(viajeEnDb).not.toBeNull();
  });

  it('debería fallar si el tren ya está ocupado (Validación de solapamiento)', async () => {
    
    
    const viajeOcupado = {
      fechaIni: '2026-05-10T10:00:00',
      fechaFin: '2026-05-10T18:00:00',
      estado: 'Activo',
      idTren: trenId, 
      idRecorrido: recorridoId,
      idConductor: conductorId
    };

    // Primer envío (Ok)
    await request(app).post('/api/viaje').set('Cookie', [`token=${adminToken}`]).send(viajeOcupado);

    // Segundo envío (Debería fallar)
    const response = await request(app)
      .post('/api/viaje')
      .set('Cookie', [`token=${adminToken}`])
      .send(viajeOcupado);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('El tren ya tiene un viaje programado entre esas fechas');
  });
});