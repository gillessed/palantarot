import * as React from 'react';
import { Loaders, Loader } from '../services/loader';
import { ReduxState } from '../services/rootReducer';
import { connect } from 'react-redux';
import { Loadable } from '../services/redux/loadable';
import { DispatchersContextType, DispatchContext } from '../dispatchProvider';
import { Dispatchers } from '../services/dispatchers';


interface OtherProps {
  dispatchers?: Dispatchers;
  loading?: boolean;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function loadContainer<T extends Loaders<ReduxState>>(loaders: T) {
  type LOADABLES = {
    [K in keyof T]: T[K] extends Loader<ReduxState, infer ARG, infer RESULT>
    ? Loadable<ARG, RESULT>
    : never;
  };
  type RESULTS = {
    [K in keyof LOADABLES]:
    LOADABLES[K] extends Loadable<any, infer RESULT> ? RESULT :
    never;
  } & OtherProps
  type ARGS = {
    [K in keyof LOADABLES]:
    LOADABLES[K] extends Loadable<void, any> ? undefined :
    LOADABLES[K] extends Loadable<infer ARG, any> ? ARG :
    never;
  }
  type PROP_KEYS = {
    [K in keyof ARGS]: ARGS[K] extends undefined ? never : K;
  }[keyof ARGS];
  type PROPS = Pick<ARGS, PROP_KEYS>;
  type PROP_HOLDER = { args: ARGS };
  return function <COMPONENT_PROPS extends RESULTS & OtherProps>(
    Component: React.ComponentClass<COMPONENT_PROPS>,
  ) {
    type OWN_PROPS = Omit<COMPONENT_PROPS, keyof RESULTS>;
    type INNER_PROPS = OWN_PROPS & LOADABLES & PROP_HOLDER;

    const raw = class extends React.PureComponent<INNER_PROPS, {}> {
      public static contextTypes = DispatchersContextType;
      private dispatchers: Dispatchers;

      constructor(props: INNER_PROPS, context: DispatchContext) {
        super(props, context);
        this.dispatchers = context.dispatchers;
      }

      public componentWillMount() {
        for (const key in loaders) {
          loaders[key].load(this.dispatchers, this.props.args[key]);
        }
      }

      public componentWillReceiveProps(nextProps: INNER_PROPS) {
        const refreshArgs: string[] = [];
        const nextArgs = nextProps.args;
        for (const key of Object.keys(this.props.args)) {
          if (this.props.args[key] !== nextArgs[key]) {
            refreshArgs.push(key);
          }
        }
        for(const key of refreshArgs) {
          loaders[key].load(this.dispatchers, nextArgs[key]);
        }
      }

      public render() {
        const ownProps = { ...this.props } as any;
        let errors: any[] = [];
        let hasLoading = false;
        let undefinedKeys: string[] = [];
        for (const key in loaders) {
          delete ownProps[key];
          if (!this.props[key] || this.props[key].value === undefined) {
            undefinedKeys.push(key);
          } else if (this.props[key].error) {
            errors.push(this.props[key].error);
          } else {
            ownProps[key] = this.props[key].value;
            if (this.props[key].loading) {
              hasLoading = true;
            }
          }
        }
        if (errors.length > 0) {
          return <div>{errors}</div>;
        } else if (undefinedKeys.length) {
          // TODO render overlay spinner without component here
          return <div></div>;
        } else {
          if (hasLoading) {
            // TODO render overlay spinner on top of component if it is loading
            return (
              <>
                <Component {...ownProps} dispatchers={this.dispatchers} loading={hasLoading}/>
              </>
            );
          } else {
            return (
              <Component {...ownProps} dispatchers={this.dispatchers} loading={hasLoading}/>
            );
          }
        }
      }
    }
    const mapStateToProps = (state: ReduxState, ownProps: OWN_PROPS & ARGS) => {
      const mappedState: any = {};
      const args: any = {};
      for (const key in loaders) {
        mappedState[key] = loaders[key].get(state, ownProps[key]);
        args[key] = ownProps[key];
      }
      mappedState.args = args;
      return mappedState;
    }
    return connect<LOADABLES & PROP_HOLDER, {}, PROPS & OWN_PROPS>(mapStateToProps)(raw);
  }
}
