const Usuario = require('../models/usuario.model');
const Producto = require('../models/producto.model');
const Cliente = require('../models/clients.model');
const Pedido = require('../models/pedido.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});
const palabra = process.env.PALABRA_SECRETA;

const crearToken = async (usuario, palabra, expiresIn) => {
  const {id, nombre, apellido, email} = usuario;
  return jwt.sign({id, nombre, apellido, email}, palabra, {expiresIn});
}

//RESOLVERS
const resolvers = {
  Query: {
    obtenerUsuario: async (_, {}, ctx) => {
      return ctx;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, {id}) => {
      //Revisar que el producto existe
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    },
    obTenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, data, ctx) => {
      const {id} = ctx;
      try {
        const clienteVendedor = await Cliente.find({vendedor: id});
        return clienteVendedor
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClienteVendedor: async (_, {id}, ctx) => {
      //Revisar si el cliente existe 
      const checkCliente = await Cliente.findById(id);
      if (!checkCliente) {
        throw new Error('El cliente no existe');
      }

      //Revisar si el cliente pertenece al creador
      if (checkCliente.vendedor.toString() !== ctx.id) {
        throw new Error('No tienes las credenciales para eliminar a este usuario');
      }

      //Retornarlo de la base de datos
      try {
        return checkCliente
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidos: async () => {
      try {
        //Obtener todos los pedidos
        const pedidos = await Pedido.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_, {id}) => {
      try {
        const pedido = await Pedido.findById(id);
        //Revisar que el pedido existe
        if (!pedido) {
          throw new Error('El pedido que intentas ver no existe');
        };

        return pedido;
        
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidoVendedor: async (_, {}, ctx) => {
      try {
        const pedido = await Pedido.find({vendedor: ctx.id});
        //Revisar que el pedido existe
        if (!pedido) {
          throw new Error('Este vendedor no tiene pedidos');
        };

        return pedido;
        
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidoEstado: async (_, {input}) => {
      console.log(input);
      try {
        const checkPedido = await Pedido.find({estado: input});
        return checkPedido;
      } catch (error) {
        console.log(error);
      }
    },
    mejoresCliente: async () => {
      try {
        const clientes = await Pedido.aggregate([
          {$match: {estado: "COMPLETADO"}},
          {$group: {
            _id: "$cliente",
            total: {$sum: '$total'}
          }},
          {$lookup: {
            from: 'clientes',
            localField: '_id',
            foreignField: "_id", 
            as: "cliente"
          }},
          {$limit: 10},
          {$sort: {total: -1}}
        ]);
        return clientes
      } catch (error) { 
        console.log(error);
      }
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        {$match: {estado: "COMPLETADO"}},
        {$group: {
          _id: "$vendedor",
          total: {$sum: "$total"},
        }},
        {$lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'vendedor',
        }},
        {$limit: 3},
        {$sort: {total: -1}}
      ]);
      return vendedores
    },
    buscarProducto: async (_, {text}) => {
      const productos = await Producto.find({$text: {$search: text}}).limit(10);
      return productos;
    }
  },

  Mutation: {
    //Creacion de nuevos usuarios
    nuevoUsuario: async (_, {input}) => {
      const {email, password} = input;
      //Revisar si el usuario ya esta registrado
      const checkUser = await Usuario.findOne({email});

      if (checkUser) {
        throw new Error('El usuario ya esta registrado');
      };
      
      //Hashear el password
      const satl = await bcrypt.genSalt(10);
      input.password = await bcrypt.hash(password, satl);

      try {
        //Guardar en la base de datos
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) { 
        console.log(errror);
      }
    },
    autenticarUsuario: async (_, {input}) => {
      const {email, password} = input;

      // revisar si el usuario existe
      const usuaior = await Usuario.findOne({email});
      if (!usuaior) {
        throw new Error('Contraseña o correo incorrectos');
      };

      //Confirmar si la contrase es valida
      const checkPassword = await bcrypt.compare(password, usuaior.password);
      if (!checkPassword) {
        throw new Error('Contraseña o correo incorrectos');
      };

      //Generar el token para el login
      return {
        token: crearToken(usuaior, palabra, '24h'),
      }
    },
    //Creación de productos
    nuevoProducto: async (_, {input}) => {
      try {
        const nuevoProducto = new Producto(input);
        const producto = await nuevoProducto.save();
        return producto
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_, {id, input}) => {
      //Revisar que el producto existe
      let producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      //Editar producto y guardar en base de datos
      producto = await Producto.findOneAndUpdate({_id: id}, input, {new: true});
      return producto
    },
    eliminarProducto: async (_, {id}) => {
      //Revisar que el producto existe
      const producto = await Producto.findById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      };

      try {
        //Eliminar producto de la base de datos
        const producto = await Producto.findOneAndDelete({_id: id});
        return `el producto ${producto.nombre} se ha eliminado`;
      } catch (error) {
        console.log(error);
      }
    },
    //Creacion de nuevos clientes
    nuevoCliente: async (_, {input}, ctx) => {
      const {id} = ctx;
      const {email} = input;
      //Verificar si el cliente ya esta creado
      const checkCliente = await Cliente.findOne({email});
      if (checkCliente) {
        throw new Error('El correo electronico ya esta registrado');
      }

      //Asignar el vendedor
      const nuevoCliente = new Cliente(input);
      nuevoCliente.vendedor = id

      try {
        //Guardarlo en la base de datos
        const cliente = await nuevoCliente.save();
        return cliente
      } catch (error) {
        console.log(error)
      }
    },
    eliminarClienteVendedor: async (_, {id}, ctx) => {
      //Revisar si el usuario existe 
      const checkCliente = await Cliente.findById(id);
      if (!checkCliente) {
        throw new Error('El cliente no existe');
      }

      //Revisar si el usuario pertenece al creador
      if (checkCliente.vendedor.toString() !== ctx.id) {
        throw new Error('No tienes las credenciales para eliminar a este usuario');
      }

      try {
        //Eliminado cliente
        const cliente = await Cliente.findOneAndDelete({_id: id});
        return `El usuario ${cliente.nombre} ha sido eliminado`
        
        
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_, {id, input}, ctx) => {
      //Revisar si el usuario existe 
      const checkCliente = await Cliente.findById(id);
      if (!checkCliente) {
        throw new Error('El cliente no existe');
      }

      //Revisar si el usuario pertenece al creador
      if (checkCliente.vendedor.toString() !== ctx.id) {
        throw new Error('No tienes las credenciales para eliminar a este usuario');
      }

      try {
        //Eliminando el cliente
        const cliente = await Cliente.findByIdAndUpdate({_id: id}, input, {new: true});
        return `El usuario ${checkCliente.nombre} a sido actualizado`;
      } catch (error) {
        console.log('hubo un error');
      }
    },
    nuevoPedido: async (_, {input}, ctx) => {
      const {cliente,} = input;
      //Verificar si el cliente existe
      const checkCliente = await Cliente.findById(cliente);
      if (!checkCliente) {
        throw new Error('El cliente no existe');
      }

      //Verificar si el cliente es del vendedor      
      if (checkCliente.vendedor.toString() !== ctx.id) {
        throw new Error('No puedes crear un pedido para este cliente');
      }

      //Verificar que stock disponible
      for await (const articulo of input.pedido) {
        const {id, cantidad} = articulo;
        const producto = await Producto.findById(id);
        if (articulo.cantidad > producto.existencia) {
          throw new Error(`El articulo: ${producto.nombre} excede la cantidad que tenemos en existencia`);
        } else {
          //Restar cantidad a lo disponible
          producto.existencia = producto.existencia - cantidad;
          await producto.save();
        }
      }

      
      //Crear nuevo pedido
      const nuevoPedido = new Pedido(input); 
      //Asignarle un venededor
      nuevoPedido.vendedor = ctx.id;
      //Guardar en base de datos
      const pedido = await nuevoPedido.save()
      return pedido;
    },
    actualizarPedido: async (_, {id, input}, ctx) => {
      const {cliente} = input;
      //Si el pedido existe
      const checkPedido = await Pedido.findById(id);
      if (!checkPedido) {
        throw new Error('El pedido no exíste');
      };

      //Si el cliente existe
      const checkCliente = await Cliente.findById(cliente);
      if (!checkCliente) {
        throw new Error('El cliente no exíste');
      };

      //Si el cliente y pedido corresponde al vendedor
      if (checkCliente.vendedor.toString() !== ctx.id) {
        throw new Error('No puedes editar el pedido de este cliente');
      }

      //Revissar el stock
      if (input?.pedido) {
        for await (const articulo of input.pedido) {
          const {id, cantidad} = articulo;
          const producto = await Producto.findById(id);
          if (articulo.cantidad > producto.existencia) {
            throw new Error(`El articulo: ${producto.nombre} excede la cantidad que tenemos en existencia`);
          } else {
            //Restar cantidad a lo disponible
            producto.existencia = producto.existencia - cantidad;
            await producto.save();
          }
        }
      }

      try {
        //Guardar el nuevo pedido
        const pedidoActualizado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true});
        return pedidoActualizado
      } catch (error) {
        console.log(error);
      }
    },
    eliminarPedidoVendedor: async (_, {id}, ctx) => {
      //Ver si el pedido existe
      const checkPedido = await Pedido.findById(id);
      if (!checkPedido) {
        throw new Error('El pedido no existe');
      }
      //Ver si el vendedor puede eliminar el pedido
      if (checkPedido.vendedor.toString() !== ctx.id) {
        throw new Error('No puedes eliminar el pedido');
      }
      try {
        //Eliminar el pedido
        const eliminar = await Pedido.findOneAndDelete({_id: id});
        return `El pedido ${eliminar._id} ha sido eliminado`;
      } catch (error) {
        console.log(error);
      }
      
    }
  }
};

module.exports = resolvers;