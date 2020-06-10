import { Spinner } from '@blueprintjs/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { SpinnerOverlay } from '../components/spinnerOverlay/SpinnerOverlay';
import { DispatchContext, DispatchersContextType } from '../dispatchProvider';
import { Dispatchers } from '../services/dispatchers';
import { DefaultArgToKey, Loader, Loaders } from '../services/loader';
import { Loadable } from '../services/redux/loadable';
import { refreshSelector } from '../services/refresh/RefreshTypes';
import { ReduxState } from '../services/rootReducer';

export interface LoaderOptions {
  hideSpinnerOnReload?: boolean;
}

interface OtherProps {
  dispatchers?: Dispatchers;
  loading?: boolean;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function loadContainer<T extends Loaders<ReduxState>>(loaders: T, options?: LoaderOptions) {
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
    type INNER_PROPS = OWN_PROPS & LOADABLES & PROP_HOLDER & { refreshCounter: number };

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
        for (const key of refreshArgs) {
          loaders[key].load(this.dispatchers, nextArgs[key]);
        }
        if (nextProps.refreshCounter !== this.props.refreshCounter) {
          setTimeout(() => this.reloadAll(), 0);
        }
      }

      public reloadAll = () => {
        for (const key of Object.keys(this.props.args)) {
          loaders[key].load(this.dispatchers, this.props.args[key], true);
        }
      }

      public render() {
        const showSpinner = options?.hideSpinnerOnReload !== true;
        const ownProps = { ...this.props } as any;
        let errors: any[] = [];
        let hasLoading = false;
        let undefinedKeys: string[] = [];
        for (const loaderId in loaders) {
          delete ownProps[loaderId];
          if (this.props[loaderId].error) {
            errors.push(this.props[loaderId].error);
          } else if (!this.props[loaderId] || this.props[loaderId].value === undefined) {
            undefinedKeys.push(loaderId);
          } else {
            ownProps[loaderId] = this.props[loaderId].value;
            if (this.props[loaderId].loading) {
              hasLoading = true;
            }
          }
        }
        if (errors.length > 0) {
          return errors.map((error, index) => {
            return (<p key={index}>{error.message}</p>);
          });
        } else if (undefinedKeys.length) {
          return (
            <div style={{ position: 'relative', minHeight: 200 }}>
              <SpinnerOverlay size={Spinner.SIZE_LARGE} />
            </div>
          );
        } else {
          if (hasLoading) {
            return (
              <div style={{ position: 'relative' }}>
                {showSpinner && <SpinnerOverlay size={Spinner.SIZE_LARGE} />}
                <Component {...ownProps} dispatchers={this.dispatchers} loading={hasLoading} />
              </div>
            );
          } else {
            return (
              <Component {...ownProps} dispatchers={this.dispatchers} loading={hasLoading} />
            );
          }
        }
      }
    }
    const mapStateToProps = (state: ReduxState, ownProps: OWN_PROPS & ARGS) => {
      const mappedState: any = {};
      const args: any = {};
      for (const loaderId in loaders) {
        const argToKey = loaders[loaderId].argToKey ?? DefaultArgToKey;
        const arg = ownProps[loaderId];
        const key = argToKey(arg);
        mappedState[loaderId] = loaders[loaderId].get(state, key);
        args[loaderId] = arg;
      }
      mappedState.args = args;
      mappedState.refreshCounter = refreshSelector(state);
      return mappedState;
    }
    return connect<LOADABLES & PROP_HOLDER, {}, PROPS & OWN_PROPS>(mapStateToProps)(raw);
  }
}
