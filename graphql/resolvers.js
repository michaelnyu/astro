const reqLogger = (next, parentResolvers, args, context) => {
  console.log(`Resolver req received: ${JSON.stringify(args)}`);
  next(parentResolvers, args, context);
};

const resolverConfig = (() => {
  middlewares = [];
  afterwares = [];

  return {
    getMiddlewares: () => middlewares,
    getAfterwares: () => afterwares,
    registerMiddlewares: wares => {
      middlewares = wares;
    },
    registerAfterwares: wares => {
      afterwares = wares;
    },
  };
})();

const buildAstroResolverWrapper = ({
  middlewares,
  afterwares,
}) => resolver => async (parentResolvers, args, context) => {
  let resolverWithMiddlewares = resolver;
  for (let i = middlewares.length - 1; i >= 0; --i) {
    resolverWithMiddlewares = middlewares[i].bind(
      null,
      resolverWithMiddlewares,
    );
  }
  const resolverResponse = await resolverWithMiddlewares(
    parentResolvers,
    args,
    context,
  );

  let resWithAfterware = (res, _) => res;
  for (let i = afterwares.length - 1; i >= 0; --i) {
    resWithAfterware = afterwareFunc.bind(null, afterwares[i]);
  }
  return resWithAfterware(resolverResponse);
};

resolverConfig.registerMiddlewares([reqLogger]);
const astroResolverWrapper = buildAstroResolverWrapper({
  middlewares: resolverConfig.getMiddlewares(),
  afterwares: resolverConfig.getAfterwares(),
});

const buildAstroOperationResolvers = operationResolvers =>
  Object.entries(operationResolvers).reduce(
    (accumulator, operationResolver) => {
      const [operationName, resolvers] = operationResolver;
      return {
        ...accumulator,
        [operationName]: Object.entries(resolvers).reduce(
          (accumulator, resolver) => {
            const [resolverName, resolverFunc] = resolver;
            return {
              ...accumulator,
              [resolverName]: astroResolverWrapper(resolverFunc),
            };
          },
          {},
        ),
      };
    },
    {},
  );

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
      const err = await dataSources.messageAPI.create({ text });
      return {
        err,
      };
    },
  },
};

module.exports = buildAstroOperationResolvers(operationResolvers);
