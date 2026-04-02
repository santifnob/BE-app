# BE-app
This is the backend app from our project

[MODELO DE DOMINIO](https://app.diagrams.net/#G1CbL1amhzWdO4Q_SigsjlzUsf7KscJk_t#%7B"pageId"%3A"KFOGIdaJm5DWyXvSNqt7"%7D)

[FE-app](https://github.com/santifnob/FE-app)

## Reglas de negocio
### Negocio:
- Todos los codigos son (int)
- Todas las entidades tienen una 'Base entity', en la cual guardamos cuando se crea y un listado de cuando se actualiza

### Tipo de carga:
- Esta codificado, tiene 'Nombre' (str) y 'Descripcion' (str)
- 2 tipos de estados, 'Activo' e 'Inactivo'
- Un 'Tipo de carga' tiene un listado de 'Carga'

### Carga:
- Esta codificado, tiene 'Nombre' (str) y 'Precio' (real)
- 2 tipos de estados, 'Activo' e 'Inactivo'
- Cada carga, tiene un unico tipo de carga

### Linea Carga:
- Tiene la cantidad de vagones (int)
- 2 tipos de estados, 'Activo' e 'Inactivo'
- cada linea tiene una unica 'Carga' y un unico 'Viaje'
- (FALTA) Se calcula el subtotal dependiendo de la carga.precio y la cantidad de vagones

### Estado (tren):
- Tiene 'Nombre' (str) y fecha de vigencia (dd/mm/yyyy)
- Tiene un unico 'Tren'
- 2 tipos de estados, 'Activo' e 'Inactivo'
- Se utiliza el nombre "Disponible" para hacer referencia a que el tren esta en condiciones para realizar viajes 

### Tren:
- Esta codificado, tiene 'Modelo' (str) y 'Color' (str)
- Los estados son: 'En reparacion', 'Obsoleto', 'Disponible', 'Sin estado' y 'En viaje' (Inferido)
- El tren tiene un listado de 'Estado' y de 'Viaje'

### Licencia:
- Tiene 'Fecha de hecho' (dd/mm/yyyy) y de 'Vencimiento' (dd/mm/yyyy)
- 2 tipos de estados, 'Activo' e 'Inactivo'
- Cada licencia tiene un unico 'Conductor'

### Conductor:
- Esta codificado, tiene 'Nombre', 'Apellido', 'Email' y 'Contraseña' (str)
- 2 tipos de estados, 'Activo' e 'Inactivo'
- El conductor tiene un listado de 'Licencia' y 'Viaje'

### Recorrido:
- Esta codificado, tiene 'Ciudad inicio', 'Ciudad fin' (str) y 'Cantidad de Kilometros' (int)
- El recorrido puede estar en muchos viajes

### Categoria (observaciones):
- Esta codificado, tiene 'Titulo' y 'Descripcion' (str)
- 2 tipos de estados, 'Activo' e 'Inactivo'

### Observaciones:
- Tiene una unica 'Categoria', 'Observaciones' (str) y 'Fecha' (dd/mm/yyyy)
- 2 tipos de estados, 'Activo' e 'Inactivo'

### Viaje: 
- Esta codificado, tiene 'Fecha de inicio' y 'Fecha fin' (dd/mm/yyyy)
- 4 tipos de estados, 'Activo', 'Inactivo' , 'Rechazado' o 'Pendiente'
- Tiene un conductor, el cual, puede rechazar o aceptar el viaje. Para poder asignar un conductor, tiene que tener una licencia que cubra el rango de fechas del viaje, y no tener un viaje en el mismo rango
- Tiene un tren, el cual tiene que tener el estado 'Disponible' durante ese rango de fecha
- Tiene que tener un 'Recorrido' con el estado 'Activo'
- Tiene un listado de 'Linea Carga'
- De los estados del viaje se infieren los siguiente estados:
	+ Cancelado/Suspendido: Es cuando el viaje tiene un estado 'Inactivo'
	+ Rechazado: El conductor rechazó el viaje
	+ Viaje no aceptado: Estado 'Pendiente' pero la fecha de inicio es anterior a hoy
	+ Finalizado: Estado 'Activo' y fecha fin anterior a hoy
	+ Programado: Estado 'Activo' y fecha inicio posterior a hoy
	+ En curso: Estado 'Activo' y fecha de inicio anterior a hoy y fecha fin posterior a hoy
