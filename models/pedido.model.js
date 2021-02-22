const {Schema, model} = require('mongoose');

const PedidoSchema = Schema({
  pedido: {
    type: Array,
    require: true,
  },
  total: {
    type: Number,
    require: true,
  },
  cliente: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: 'Cliente'
  },
  vendedor: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: 'Usuario',
  },
  estado: {
    type: String,
    default: 'PENDIENTE'
  },
  creado: {
    type: String,
    default: Date.now(),
  },
});

module.exports = model('Pedido', PedidoSchema);