export class BaseWhere {
  [key: string]: any; // Index signature allowing dynamic properties and methods
  
  constructor() {}

  setLikeFilter(attribute: string, value: string | undefined): void {
    if(value && typeof value === 'string') {
      const trimmedValue = value.trim();
      if(trimmedValue) {
        this[attribute] = { $like: `%${trimmedValue}%` };
      }
    }
  }

  setExactStringFilter(attribute: string, value: string | undefined): void {
    if(value && typeof value === 'string') {
      const trimmedValue = value.trim();
      if(trimmedValue) {
        this[attribute] = trimmedValue;
      }
    }
  }
  
  setIdFilter(value: string | undefined): void {
    if(value !== undefined && value !== null && !isNaN(Number(value))) {
      this.id = Number(value);
    }
  }

  setRangeNumberFilter(attribute: string, minValue: any, maxValue: any): void {
    const hasMin = minValue !== undefined && minValue !== null && Number.isFinite(Number(minValue));
    const hasMax = maxValue !== undefined && maxValue !== null && Number.isFinite(Number(maxValue));

    if (hasMin && hasMax && Number(minValue) <= Number(maxValue)) {
      this[attribute] = { $gte: Number(minValue), $lte: Number(maxValue) };
    } else if (hasMin) {
      this[attribute] = { $gte: Number(minValue) };
    } else if (hasMax) {
      this[attribute] = { $lte: Number(maxValue) };
    }
  }

  setForeignKeyFilter(attribute: string, idEntity: string | undefined): void {
    if(idEntity && !isNaN(Number(idEntity))) {
      this[attribute] = { id: Number(idEntity) };
    }
  }

  setDateRangeFilter(attribute: string, startDate: any, endDate: any): void {
    const hasStart = startDate !== undefined && startDate !== null && !isNaN(Date.parse(startDate));
    const hasEnd = endDate !== undefined && endDate !== null && !isNaN(Date.parse(endDate));
    if (hasStart && hasEnd && new Date(startDate) <= new Date(endDate)) {
      this[attribute] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (hasStart) {
      this[attribute] = { $gte: new Date(startDate) };
    } else if (hasEnd) {
      this[attribute] = { $lte: new Date(endDate) };
    }
  }

  // filtrar por el atributo de una entidad relacionada (ej: conductor.nombre)
  setRelatedAttributeLikeFilter(relatedEntityName: string, attribute: string, value: string | undefined): void {
    if(value && typeof value === 'string') {
      const trimmedValue = value.trim();
      if(trimmedValue) {
        this[relatedEntityName] = { [attribute]: { $like: `%${trimmedValue}%` } };
      }
    }
  }

  // filtrar por estados inferidos del viaje
  setInferredStatusFilter(estadoInferido: string | undefined): void {
    if (!estadoInferido || typeof estadoInferido !== 'string') {
      return;
    }

    const now = new Date();

    switch (estadoInferido.trim()) {
      case 'Cancelado/Suspendido':
        this.estado = 'Inactivo';
        break;
      case 'Rechazado':
        this.estado = 'Rechazado';
        break;
      case 'Viaje no aceptado':
        this.estado = 'Pendiente';
        this.fechaIni = { $lt: now };
        break;
      case 'Finalizado':
        this.estado = 'Activo';
        this.fechaFin = { $lt: now };
        break;
      case 'Programado':
        this.estado = 'Activo';
        this.fechaIni = { $gt: now };
        break;
      case 'En curso':
        this.estado = 'Activo';
        this.fechaIni = { $lte: now };
        this.fechaFin = { $gte: now };
        break;
      default:
      
        this.estado = estadoInferido;
        break;
    }
  }


  toObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        obj[key] = this[key];
      }
    }
    return obj;
  }
}