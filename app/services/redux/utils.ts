export function wrapAsBatchCall<ARG, RESULT>(
  baseFunction: (arg: ARG) => Promise<RESULT>
) {
  return (args: ARG[]): Promise<Map<ARG, RESULT>> => {
    return Promise.all(
      args.map(arg =>
        baseFunction(arg)
          .then(result => [arg, result] as [ARG, RESULT])
          .catch(error => {
            const wrapped = new Error(
              `Unable to resolve request ${arg}}:\n ${error.stack}`
            ) as Error & {cause?: Error};
            wrapped.cause = error;
            throw wrapped;
          })
      )
    ).then(results => new Map<ARG, RESULT>(results));
  };
}
