const responseLogger = (_, resolverResponse) => {
  console.log(`Resolver returned : ${JSON.stringify(resolverResponse)}`);
};

const middlewares = [];
const postwares = [responseLogger];

const buildAstroResolverWrapper = ({
  middlewares,
  postwares,
}) => resolver => async (parentResolvers, args, context) => {
  middlewares.forEach(middleware => {
    middleware(args);
  });
  const resolverResponse = await resolver(parentResolvers, args, context);
  postwares.forEach(postware => {
    postware(args, resolverResponse);
  });
  return resolverResponse;
};

const astroResolverWrapper = buildAstroResolverWrapper({
  middlewares,
  postwares,
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
