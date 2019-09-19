const { PubSub } = require('apollo-server-express');
const { reqLogger, resLogger } = require('./wares');
const { ResolverWithWares } = require('./helpers');

// Create a new pubsub factory
const pubsub = new PubSub();

// Create a new Resolver instance
const resolverWithWares = new ResolverWithWares();
resolverWithWares.registerMiddlewares([reqLogger]);
resolverWithWares.registerAfterwares([resLogger]);

const PUBSUB_EVENTS = {
  MESSAGE_CREATED: 'MESSAGE_CREATED',
};

// The base graphql resolver mapping.
const resolverMap = {
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
    createMessage: async (_, args, { dataSources }) => {
      const { id, err } = await dataSources.messageAPI.create(args);

      // publish an event to the factory
      if (!err) {
        pubsub.publish(PUBSUB_EVENTS.MESSAGE_CREATED, {
          messageCreated: { id, content: { text: args.text } },
        });
      }
      return {
        id,
        err,
      };
    },
  },
  Subscription: {
    messageCreated: {
      // Additional event labels can be passed to asyncIterator creation
      // Subscribe to an event in the factory
      subscribe: () => pubsub.asyncIterator(PUBSUB_EVENTS.MESSAGE_CREATED),
    },
  },
};

module.exports = resolverWithWares.applyMiddleAndAfterwares(resolverMap);
