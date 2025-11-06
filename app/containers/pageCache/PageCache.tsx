import React from "react";
import { DispatchersContextType, DispatchContext } from "../../dispatchProvider";
import { Dispatchers } from "../../services/dispatchers";

export function pageCache<PROPS>(Component: React.ComponentClass<PROPS>) {
  return class extends React.PureComponent<PROPS, {}> {
    public static contextTypes = DispatchersContextType;
    private dispatchers: Dispatchers;

    constructor(props: PROPS, context: DispatchContext) {
      super(props, context);
      this.dispatchers = context.dispatchers;
    }

    public componentWillMount() {
      this.dispatchers.pageCache.refresh();
    }

    public render() {
      return <Component {...this.props} />;
    }
  };
}
