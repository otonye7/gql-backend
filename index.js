const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./resolver/user");
const { MONGODB } = require("./config");


const PORT = process.env.port || 5000;
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req })
})

mongoose.connect(MONGODB, { useNewUrlParser: true })
.then(() => {
    console.log("Server Connected")
    return server.listen({ port: PORT })
})
.catch(err => {
    console.error(err)
})