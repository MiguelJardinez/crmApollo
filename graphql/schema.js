const {gql} = require('apollo-server');

//SCHEMA
const typeDefs = gql`

  type Token {
    token: String
  }

  type Usuario {
    nombre: String
    apellido: String
    email: String
    creado: String
    id: ID
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    creado: String
  }
  type Cliente {
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    creado: String
    vendedor: ID
  }
  type Pedido {
    id: ID
    pedido: [PedidoGrupo]
    total: Float
    cliente: ID
    vendedor: ID
    fecha: String
    estado: EstadoPedido
  }

  type PedidoGrupo {
    id: ID
    cantidad: Int
  }

  type TopCliente {
    total: Float
    cliente: [Cliente]
  }
  type TopVendedor {
    total: Float
    vendedor: [Usuario]
  }

  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }

  input authUsuarioInput {
    email: String
    password: String
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  enum EstadoPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]!
    total: Float!
    cliente: ID!
    estado: EstadoPedido
  }

  input PedidoProductoInput {
    id: ID!
    cantidad: Int!
  }

  type Query {
    #Usuarios
    obtenerUsuario: Usuario

    #Productos
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    #Clientes
    obTenerClientes: [Cliente]
    obtenerClienteVendedor(id: ID!): Cliente
    obtenerClientesVendedor: [Cliente]

    #Pedidos
    obtenerPedidos: [Pedido]
    obtenerPedido(id: ID!): Pedido
    obtenerPedidoVendedor: [Pedido]
    obtenerPedidoEstado(input: EstadoPedido): [Pedido]

    #Busquedas avanzadas
    mejoresCliente: [TopCliente]
    mejoresVendedores: [TopVendedor]
    buscarProducto(text: String!): [Producto] 
  }

  type Mutation {
    #Usuarios
    nuevoUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: authUsuarioInput): Token

    #Productos
    nuevoProducto(input: ProductoInput): Producto
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    #Clientes
    nuevoCliente(input: ClienteInput): Cliente
    eliminarClienteVendedor(id: ID!): String
    actualizarCliente(id: ID!, input: ClienteInput): String

    #Pedidos
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedidoVendedor(id: ID!): String
  }
`;

module.exports = typeDefs;