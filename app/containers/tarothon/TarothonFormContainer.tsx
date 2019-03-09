import * as React from 'react';
import { SagaContextType, SagaRegistration, getSagaContext } from '../../sagaProvider';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { mergeContexts } from '../../app';
import { SagaListener } from '../../services/sagaListener';
import { addTarothonActions, AddTarothonService } from '../../services/addTarothon/index';
import { Palantoaster } from '../../components/toaster/Toaster';
import { Intent, IconName } from '@blueprintjs/core';
import history from '../../history';
import { StaticRoutes, DynamicRoutes } from '../../routes';
import { Dispatchers } from '../../services/dispatchers';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { NewTarothon, Tarothon } from '../../../server/model/Tarothon';
import { TarothonForm } from '../../components/tarothon/TarothonForm';

const tarothonErrorListener: SagaListener<{ error: Error }> = {
  actionType: addTarothonActions.error,
  callback: ({ error }) => {
    console.warn(error);
    Palantoaster.show({
      message: 'Server Error: Tarothon was not saved correctly.',
      intent: Intent.DANGER,
    });
  },
};

interface OwnProps {
  editTarothon?: Tarothon;
}

interface StateProps {
  addTarothon: AddTarothonService;
}

type Props = OwnProps & StateProps;

class TarothonFormContainerInternal extends React.PureComponent<Props> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private dispatchers: Dispatchers;
  private tarothonSavedListener: SagaListener<{ result: string }>;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.sagas = getSagaContext(context);
    this.dispatchers = context.dispatchers;
    this.tarothonSavedListener = {
      actionType: addTarothonActions.success,
      callback: ({ result }) => {
        Palantoaster.show({
          message: 'Tarothon Saved Succesufully',
          intent: Intent.SUCCESS,
        });
        history.push(DynamicRoutes.tarothon(result));
      },
    };
  }

  public componentWillMount() {
    this.sagas.register(this.tarothonSavedListener);
    this.sagas.register(tarothonErrorListener);
  }

  public componentWillUnmount() {
    this.sagas.unregister(this.tarothonSavedListener);
    this.sagas.unregister(tarothonErrorListener);
  }

  public render() {
    const title = this.props.editTarothon ? 'Edit Tarothon' : 'Add Tarothon';
    const text = this.props.editTarothon ? 'Save Tarothon' : 'Add Tarothon';
    const icon: IconName = this.props.editTarothon ? 'add' : 'document';
    return (
      <div className='page-container'>
        <div className='title'>
          <h1 className='bp3-heading'>
            {title}
          </h1>
          </div>
        <TarothonForm
          onSubmit={this.onSave}
          submitText={text}
          submitIcon={icon}
          loading={this.props.addTarothon.loading}
          initialState={this.props.editTarothon}
        />
      </div>
    );
  }

  private onSave = (data: NewTarothon) => {
    const request = { ...(this.props.editTarothon || {}), ...data };
    this.dispatchers.addTarothon.request(request);
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
    addTarothon: state.addTarothon,
  };
}

export const TarothonFormContainer = connect<StateProps, {}, OwnProps>(mapStateToProps)(TarothonFormContainerInternal);
