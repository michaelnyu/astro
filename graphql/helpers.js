class ResolverWithWares {
  constructor() {
    this.middlewares = [];
    this.afterwares = [];
  }

  registerMiddlewares(middlewares) {
    this.middlewares = middlewares;
  }

  registerAfterwares(afterwares) {
    this.afterwares = afterwares;
  }

  applyMiddleAndAfterwaresToResolver(resolver) {
    return async (parentResolvers, args, context) => {
      const middlewares = [...this.middlewares];
      const afterwares = [...this.afterwares];

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
  }

  applyMiddleAndAfterwares(operationResolvers) {
    return Object.entries(operationResolvers).reduce(
      (accumulator, operationResolver) => {
        const [operationName, resolvers] = operationResolver;

        // TODO: apply middleware and afterware to subscriptions
        if (operationName === 'Subscription') {
          return {
            ...accumulator,
            [operationName]: resolvers,
          };
        }
        return {
          ...accumulator,
          [operationName]: Object.entries(resolvers).reduce(
            (accumulator, resolver) => {
              const [resolverName, resolverFunc] = resolver;
              return {
                ...accumulator,
                [resolverName]: this.applyMiddleAndAfterwaresToResolver(
                  resolverFunc,
                ),
              };
            },
            {},
          ),
        };
      },
      {},
    );
  }
}

module.exports = { ResolverWithWares };
