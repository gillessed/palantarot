import React from "react";
import { AuthService, authActions } from "../../services/auth/index";
import { ReduxState } from "../../services/rootReducer";
import { connect } from "react-redux";
import { DispatchersContextType, DispatchContext } from "../../dispatchProvider";
import { Dispatchers } from "../../services/dispatchers";
import { mergeContexts } from "../../App";
import { SagaContextType, SagaRegistration, getSagaContext } from "../../sagaProvider";
import { SagaListener } from "../../services/sagaListener";
import { Palantoaster, TIntent } from "../../components/toaster/Toaster";
import { StaticRoutes } from "../../routes";
import { Button, Intent } from "@blueprintjs/core";
import history from "../../history";

interface Props {
  auth: AuthService;
}

interface State {
  secret: string;
}

export class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private loginListener: SagaListener<{ result: void }> = {
    actionType: authActions.success,
    callback: () => {
      history.push(StaticRoutes.home());
    },
  };
  private failedLoginListener: SagaListener<{ error: Error }> = {
    actionType: authActions.error,
    callback: () => {
      Palantoaster.show({
        message: "Failed to Login. Maybe you don't know the password?",
        intent: TIntent.DANGER,
      });
    },
  };
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.sagas = getSagaContext(context);
    this.dispatchers = context.dispatchers;
    this.state = {
      secret: "",
    };
  }

  public componentWillMount() {
    this.sagas.register(this.loginListener);
    this.sagas.register(this.failedLoginListener);
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.loginListener);
    this.sagas.unregister(this.failedLoginListener);
  }

  public render() {
    return (
      <div className="pt-login">
        <div className="login-container">
          <div className="logo">Palantarot</div>
          <div className="subtitle">If you don't know the password, ask a tarot player.</div>
          <form className="login-form" onSubmit={this.onLoginClicked}>
            <input
              type="password"
              className="bp3-input"
              placeholder="What is the password?"
              value={this.state.secret}
              onChange={this.onSecretChange}
            />
            <Button
              type="submit"
              loading={this.props.auth.loading}
              icon="log-in"
              disabled={this.state.secret.length === 0}
              intent={Intent.PRIMARY}
              text="Login"
            />
          </form>
        </div>
      </div>
    );
  }

  private onSecretChange = (event: { target: { value: string } }) => {
    this.setState({ secret: event.target.value });
  };

  private onLoginClicked = (e: any) => {
    e.preventDefault();
    if (this.state.secret.length > 0 && !this.props.auth.loading) {
      this.dispatchers.auth.request({ secret: this.state.secret });
    }
  };
}

const mapStateToProps = (state: ReduxState): Props => {
  return {
    auth: state.auth,
  };
};

export const LoginContainer = connect(mapStateToProps)(Internal);
