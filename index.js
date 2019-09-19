const http = require('http');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

// GraphQL Layer
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
// Data Layer
const Message = require('./message');
// Network Constants
const PORT = 4000;

const dataSources = () => ({
  messageAPI: new Message(),
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
});

const app = express();

apolloServer.applyMiddleware({ app, path: '/' });

const httpServer = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
  console.log(apolloServer.subscriptionServer);
  console.log(
    `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`,
  );
  console.log(
    `🚀 Server ready at ws://localhost:4000${apolloServer.subscriptionsPath}`,
  );
});
