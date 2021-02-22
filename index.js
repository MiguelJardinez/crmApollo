const {ApolloServer} = require('apollo-server');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const jwt = require('jsonwebtoken');
const palabra = process.env.PALABRA_SECRETA;

const conectarDB = require('./config/db');

//Conectar con la base de datos
conectarDB();

//Crear servidor
const server = new ApolloServer({
  typeDefs, 
  resolvers,
  context: ({req}) => {
    const token = req.headers['authorization'];
    if (token) {
      try {
        const usuario = jwt.verify(token, palabra);
        return usuario
      } catch (error) {
        console.log(error);
      }
    }
  }
});

//Arrancar el servidor
const createServer = async () => {
  try {
    const {url} = await server.listen();
    console.log(`Servidor listo en el servidor ${url}`)
  } catch (error) {
    console.log('hubo un error en el token', error);
  }
}
createServer();