const {model, Schema} = require('mongoose');

const ProductoSchema = Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  existencia: {
    type: Number,
    require: true,
    trim: true,
  },
  precio: {
    type: Number,
    require: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now()
  },
});

ProductoSchema.index({nombre: 'text'})

module.exports = model('Producto', ProductoSchema);