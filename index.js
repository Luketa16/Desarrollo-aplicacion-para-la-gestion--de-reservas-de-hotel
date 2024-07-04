const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();


//middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en servidor ${PORT}`)
})

// Establecemos concexióna la base de datos
const { Sequelize, DataTypes } = require('sequelize');
const { executionAsyncResource } = require('async_hooks');
const { Server } = require('http');
const { prependListener } = require('process');
const { setServers } = require('dns');

const sequelize = new Sequelize('examen', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql'
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
    } catch (error) {
        console.log('Error al conectar a la base de datos', error);
    }
})();


const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING
        
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    telefono: {
        type: DataTypes.STRING
    }

});

const Habitacion = sequelize.define('habitacion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    numero: {
        type: DataTypes.STRING
    },
    tipo: {
        type: DataTypes.STRING,
    },
    precio: {
        type: DataTypes.DECIMAL
    },
    estado: {
        type: DataTypes.STRING,
        values: ['disponible', 'ocupado']
    }
});

const Reserva = sequelize.define('Reserva', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    clienteId: {
        foreignKey: true,
        references: {
            model: Cliente, // Referencia al modelo Cliente
            key: 'id'
        },
        type: DataTypes.INTEGER
    },
    habitacionId: {
        foreignKey: true,
        references: {
            model: Habitacion, // Referencia al modelo Habitacion
            key: 'id'
        },
        type: DataTypes.INTEGER
    },
    fechaEntrada: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fechaSalida: {
        type: DataTypes.DATE
    },
    estado: {
        type: DataTypes.STRING,
        values:['confirmada', 'cancelada']
    }
});

// Establecer relaciones entre los modelos
Cliente.hasMany(Reserva, { foreignKey: 'clienteId' }); // Un cliente puede tener muchas reservas
Reserva.belongsTo(Cliente, { foreignKey: 'clienteId' }); // Cada reserva pertenece a un cliente

Habitacion.hasMany(Reserva, { foreignKey: 'habitacionId' }); // Una habitación puede tener muchas reservas
Reserva.belongsTo(Habitacion, { foreignKey: 'habitacionId' }); // Cada reserva pertenece a una habitación


(async () => { 
    try {
        await sequelize.sync();
        console.log('Modelo sincronizado correctamente con la base de datos');
    } catch (error) { 
        console.error('Error al sincronizar el modelo:', error);
    }
})();


Cliente.hasMany(Reserva, { foreignKey: 'clienteId' });

// Creamos un nuevo Cliente
app.post('/clientes', async (req, res) => {
    try {
      const { nombre, email, telefono } = req.body;
      const nuevoCliente = await Cliente.create({ nombre, email, telefono });
      res.status(201).json(nuevoCliente);
    } catch (error) {// Utilizamos catch para manejar errores
      console.error('Error al crear el cliente:', error);
      res.status(500).json({ error: 'Error al crear el cliente' });
    }
});
  
// Obtenemos a todos los clientes
app.get('/clientes', async (req, res) => {
    try {
      const clientes = await Cliente.findAll();
      res.json(clientes);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener los clientes' });
    }
});
  
// Obtenemos cliente por ID
app.get('/clientes/:id', async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (cliente) {
        res.json(cliente);
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener el cliente:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener el cliente' });
    }
});
  
// Actualizamos cliente por su ID
app.put('/clientes/:id', async (req, res) => {
    try {
      const { nombre, email, telefono } = req.body;
      const cliente = await Cliente.findByPk(req.params.id);
      if (cliente) {
        await cliente.update({ nombre, email, telefono });
        res.json(cliente);
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
      res.status(500).json({ error: 'Ocurrió un error al actualizar el cliente' });
    }
});
  
// Eliminamos cliente por ID
app.delete('/clientes/:id', async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (cliente) {
        await cliente.destroy();
        res.json({ message: 'Cliente eliminado con éxito' });
      } else {
        res.status(404).json({ error: 'Cliente no encontrado' });
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      res.status(500).json({ error: 'Ocurrió un error al eliminar el cliente' });
    }
});








// Creamos una nueva habitación
app.post('/habitaciones', async (req, res) => {
    try {
      const { numero, tipo, precio, estado } = req.body;
      const nuevaHabitacion = await Habitacion.create({ numero, tipo, precio, estado });
      res.status(201).json(nuevaHabitacion);
    } catch (error) {
      console.error('Error al crear la habitación:', error);
      res.status(500).json({ error: 'Error al crear la habitación' });
    }
});
  
// Obtenemos todas las habitaciones
app.get('/habitaciones', async (req, res) => {
    try {
      const habitaciones = await Habitacion.findAll();
      res.json(habitaciones);
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
      res.status(500).json({ error: 'Error al obtener las habitaciones' });
    }
});
  
// Obtenemos habitación por ID
app.get('/habitaciones/:id', async (req, res) => {
    try {
      const habitacion = await Habitacion.findByPk(req.params.id);
      if (habitacion) {
        res.json(habitacion);
      } else {
        res.status(404).json({ error: 'Habitación no encontrada' });
      }
    } catch (error) {
      console.error('Error al obtener la habitación:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener la habitación' });
    }
});
  
// Actualizamos habitación por ID
app.put('/habitaciones/:id', async (req, res) => {
    try {
      const { numero, tipo, precio, estado } = req.body;
      const habitacion = await Habitacion.findByPk(req.params.id);
      if (habitacion) {
        await habitacion.update({ numero, tipo, precio, estado });
        res.json(habitacion);
      } else {
        res.status(404).json({ error: 'Habitación no encontrada' });
      }
    } catch (error) {
      console.error('Error al actualizar la habitación:', error);
      res.status(500).json({ error: 'Ocurrió un error al actualizar la habitación' });
    }
});
  
// Eliminamos habitación por ID
app.delete('/habitaciones/:id', async (req, res) => {
    try {
      const habitacion = await Habitacion.findByPk(req.params.id);
      if (habitacion) {
        await habitacion.destroy();
        res.json({ message: 'Habitación eliminada con éxito' });
      } else {
        res.status(404).json({ error: 'Habitación no encontrada' });
      }
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      res.status(500).json({ error: 'Error al eliminar la habitación' });
    }
});









// POST /reservas: Crear una nueva reserva
app.post('/reservas', async (req, res) => {
    try {
      const { clienteId, habitacionId, fechaEntrada, fechaSalida, estado } = req.body;
      const nuevaReserva = await Reserva.create({ clienteId, habitacionId, fechaEntrada, fechaSalida, estado });
      res.status(201).json(nuevaReserva);
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      res.status(500).json({ error: 'Error al crear la reserva' });
    }
});
  
// Obtener todas las reservas
app.get('/reservas', async (req, res) => {
    try {
      const reservas = await Reserva.findAll();
      res.json(reservas);
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener las reservas' });
    }
});
  
// Obtenemos reservas por ID
app.get('/reservas/:id', async (req, res) => {
    try {
      const reserva = await Reserva.findByPk(req.params.id);
      if (reserva) {
        res.json(reserva);
      } else {
        res.status(404).json({ error: 'Reserva no encontrada' });
      }
    } catch (error) {
      console.error('Error al obtener la reserva:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener la reserva' });
    }
});
  
// Actualizamos reserva por ID
app.put('/reservas/:id', async (req, res) => {
    try {
      const { clienteId, habitacionId, fechaEntrada, fechaSalida, estado } = req.body;
      const reserva = await Reserva.findByPk(req.params.id);
      if (reserva) {
        await reserva.update({ clienteId, habitacionId, fechaEntrada, fechaSalida, estado });
        res.json(reserva);
      } else {
        res.status(404).json({ error: 'Reserva no encontrada' });
      }
    } catch (error) {
      console.error('Error al actualizar la reserva:', error);
      res.status(500).json({ error: 'Ocurrió un error al actualizar la reserva' });
    }
});
  

// Eliminamos reserva por ID
app.delete('/reservas/:id', async (req, res) => {
    try {
      const reserva = await Reserva.findByPk(req.params.id);
      if (reserva) {
        await reserva.destroy();
        res.json({ message: 'Reserva eliminada con éxito' });
      } else {
        res.status(404).json({ error: 'Reserva no encontrada' });
      }
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      res.status(500).json({ error: 'Ocurrió un error al eliminar la reserva' });
    }
});








// Obtenemos todas las habitaciónes disponibles
app.get('/habitaciones/disponibles', async (req, res) => {
    try {
      const habitacionesDisponibles = await Habitacion.findAll({ where: { estado: 'disponible' } });
      res.json(habitacionesDisponibles);
    } catch (error) {
      console.error('Error al obtener las habitaciones disponibles:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener las habitaciones disponibles' });
    }
});


// Obtener todas la reservas de un cliente en específico
app.get('/reservas/cliente/:clienteId', async (req, res) => {
    try {
      const { clienteId } = req.params;
      const reservasCliente = await Reserva.findAll({ where: { clienteId } });
      res.json(reservasCliente);
    } catch (error) {
      console.error('Error al obtener las reservas del cliente:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener las reservas del cliente' });
    }
});


// Obtenemos todas las reservas entre dos fechas dadas
app.get('/reservas/entre-fechas', async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
  
      // Verificar que ambos parámetros de fecha estén presentes
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Debe proporcionar fechaInicio y fechaFin' });
      }
  
      // Convertir las fechas a objetos Date para la comparación
      const reservasEntreFechas = await Reserva.findAll({
        where: {
          fechaEntrada: { [Op.gte]: new Date(fechaInicio) },
          fechaSalida: { [Op.lte]: new Date(fechaFin) }
        }
      });
  
      res.json(reservasEntreFechas);
    } catch (error) {
      console.error('Error al obtener las reservas entre fechas:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener las reservas entre fechas' });
    }
  });

























