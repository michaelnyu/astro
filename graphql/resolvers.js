// Middlwares
const reqLogger = (next, parentResolvers, args, context) => {
  console.log(`Resolver req received: ${JSON.stringify(args)}`);
  return next(parentResolvers, args, context);
};

// Afterwares
const resLogger = (next, res) => {
  console.log(`Resolver response: ${JSON.stringify(res)}`);
  return next(res);
};

// Config to store middlewares and afterwares
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

/*
  helper function that applys middlwares and afterwares to a single resolver.
*/
const buildAstroResolverWrapper = ({
  middlewares,
  afterwares,
}) => resolver => async (parentResolvers, args, context) => {
  // chain the middlewares to the resolver
  let resolverWithMiddlewares = resolver;
  for (let i = middlewares.length - 1; i >= 0; --i) {
    resolverWithMiddlewares = middlewares[i].bind(
      null,
      resolverWithMiddlewares,
    );
  }

  // execute the chain of middlewares + the resolver
  const resolverResponse = await resolverWithMiddlewares(
    parentResolvers,
    args,
    context,
  );

  // chain afterwares to an function that simply returns a the result
  let resWithAfterware = res => res;
  for (let i = afterwares.length - 1; i >= 0; --i) {
    resWithAfterware = afterwares[i].bind(null, resWithAfterware);
  }

  return resWithAfterware(resolverResponse);
};

// Register Middlewares & Afterwares
resolverConfig.registerMiddlewares([reqLogger]);
resolverConfig.registerAfterwares([resLogger]);
const astroResolverWrapper = buildAstroResolverWrapper({
  middlewares: resolverConfig.getMiddlewares(),
  afterwares: resolverConfig.getAfterwares(),
});

/*
  Helper function that applys an inputted `resolverWrapper` to every operation in
  a basic graphql resolver object, the `operationResolvers`.
*/
const buildOperationResolvers = (operationResolvers, resolverWrapper) =>
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
              [resolverName]: resolverWrapper(resolverFunc),
            };
          },
          {},
        ),
      };
    },
    {},
  );

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

module.exports = buildOperationResolvers(
  operationResolvers,
  astroResolverWrapper,
);
