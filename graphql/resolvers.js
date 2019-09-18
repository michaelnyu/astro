const { reqLogger, resLogger } = require('./wares');
const { ResolverWithWares } = require('./helpers');

const resolverWithWares = new ResolverWithWares();
resolverWithWares.registerMiddlewares([reqLogger]);
resolverWithWares.registerAfterwares([resLogger]);

// The base graphql resolver object.
const operationResolvers = {
  Query: {
    messages: async (_, __, { dataSources }) => {
      const [messages, err] = await dataSources.messageAPI.getAll({});
      return {
        err,
        messages,
      };
    },
  },
  Mutation: {
    createMessage: async (_, { text }, { dataSources }) => {
      const { id, err } = await dataSources.messageAPI.create({ text });
      return {
        id,
        err,
      };
    },
  },
};

module.exports = resolverWithWares.applyMiddleAndAfterwares(operationResolvers);
