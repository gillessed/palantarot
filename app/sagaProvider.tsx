import * as React from 'react';
import { Store } from 'redux';
import { SagaListener, resetListeners } from './services/sagaListener';
import { ReduxState } from './services/rootReducer';

interface Props {
  listeners: Set<SagaListener<any>>;
}

export const SagaContextType: React.ValidationMap<any> = {
  sagaListeners: React.PropTypes.object.isRequired,
};

export interface SagaRegistration {
    register(listener: SagaListener<any>): void;
    unregister(listener: SagaListener<any>): void;
}

export interface SagaContext {
  sagaListeners: SagaRegistration;
}

export function getSagaContext(context: any): SagaRegistration {
  return context.sagaListeners as SagaRegistration;
}

export class SagaProvider extends React.Component<Props, void> {
  private listeners: Set<SagaListener<any>>;
  private sagaRegister: SagaRegistration = {
    register: (listener: SagaListener<any>) => {
      this.listeners.add(listener);
      this.store.dispatch(resetListeners(undefined));
    },
    unregister: (listener: SagaListener<any>) => {
      this.listeners.delete(listener);
      this.store.dispatch(resetListeners(undefined));
    },
  };
  private store: Store<ReduxState>;

  constructor(props: Props) {
    super(props);
    this.listeners = props.listeners;
  }

  componentWillMount() {
    this.store = this.context.store;
  }

  render() {
    return React.Children.only(this.props.children);
  }

  getChildContext(): SagaContext {
    return { sagaListeners: this.sagaRegister };
  }

  public static childContextTypes = SagaContextType;
  public static contextTypes = { store: React.PropTypes.object.isRequired };
}