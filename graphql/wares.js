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

module.exports = { reqLogger, resLogger };
