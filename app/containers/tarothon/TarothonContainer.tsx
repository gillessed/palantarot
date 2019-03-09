import * as React from 'react';
import { TarothonData } from '../../../server/model/Tarothon';
import { loadContainer } from '../LoadingContainer';
import { pageCache } from '../pageCache/PageCache';
import { tarothonDataLoader } from '../../services/tarothonData';
import { convertToMomenthon, getDateStrings, Momenthon } from '../../services/tarothonData/transform';
import { integerComparator } from '../../../server/utils';
import { Result } from '../../../server/model/Result';
import { ScoreTable } from '../../components/scoreTable/ScoreTable';
import { Player } from '../../../server/model/Player';
import { playersLoader } from '../../services/players';
import { TarothonTimer } from './TarothonTimer'; 
import { Button, Popover, Menu, MenuItem, PopoverPosition, Dialog, Intent } from '@blueprintjs/core';
import history from '../../history';
import { DynamicRoutes, StaticRoutes } from '../../routes';
import { mergeContexts } from '../../app';
import { SagaContextType, SagaRegistration, getSagaContext } from '../../sagaProvider';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { deleteTarothonActions } from '../../services/deleteTarothon';
import { SagaListener } from '../../services/sagaListener';
import { Palantoaster } from '../../components/toaster/Toaster';
import { Dispatchers } from '../../services/dispatchers';

const tarothonErrorListener: SagaListener<{ error: Error }> = {
  actionType: deleteTarothonActions.error,
  callback: ({ error }) => {
    console.warn(error);
    Palantoaster.show({
      message: 'Server Error: Tarothon was not deleted correctly.',
      intent: Intent.DANGER,
    });
  },
};
const tarothonDeletedListener = {
  actionType: deleteTarothonActions.success,
  callback: () => {
    Palantoaster.show({
      message: 'Tarothon deleted duccesufully',
      intent: Intent.SUCCESS,
    });
    history.push(StaticRoutes.tarothons());
  },
};

interface PropsInternal {
  tarothonData: TarothonData;
  players: Map<string, Player>;
}

interface State {
  isDeleteDialogOpen: boolean;
}

class TarothonContainerInternal extends React.PureComponent<PropsInternal, State> {
  public static contextTypes = mergeContexts(SagaContextType, DispatchersContextType);
  private sagas: SagaRegistration;
  private dispatchers: Dispatchers;

  constructor(props: PropsInternal, context: DispatchContext) {
    super(props, context);
    this.sagas = getSagaContext(context);
    this.dispatchers = context.dispatchers;
    this.state = {
        isDeleteDialogOpen: false,
    };
  }

  public componentWillMount() {
    this.sagas.register(tarothonDeletedListener);
    this.sagas.register(tarothonErrorListener);
  }

  public componentWillUnmount() {
    this.sagas.unregister(tarothonDeletedListener);
    this.sagas.unregister(tarothonErrorListener);
  }

  public render() {
    const momenthon = convertToMomenthon(this.props.tarothonData.properties);
    const dateStrings = getDateStrings(momenthon);
    return (
      <div className='tarothon-container page-container'>
        <div className='title'>
          <h1 className='bp3-heading heading-with-actions'>
            Tarothon
            {this.renderEditMenu()}
          </h1>
          <h6 className='bp3-heading'>{dateStrings.date}</h6>
        </div>
        {momenthon.isWhen === Momenthon.Time.UPCOMING && this.renderUpcomingTarothon(momenthon)}
        {momenthon.isWhen !== Momenthon.Time.UPCOMING && this.renderResults()}
        {this.renderDeleteDialog()}
      </div>
    );
  }

  private renderEditMenu() {
    return (
      <Popover position={PopoverPosition.BOTTOM}>
        <Button className='edit-button' minimal icon='more'/>
        <Menu>
          <MenuItem icon='edit' text='Edit' onClick={this.handleClickEdit}/>
          <MenuItem icon='trash' text='Delete' onClick={this.toggleDeleteDialog}/>
        </Menu>
      </Popover>
    );
  }

  private renderUpcomingTarothon(momenthon: Momenthon) {
    return <TarothonTimer start={momenthon.start} />;
  }

  private renderResults = () => {
    if (this.props.tarothonData.results.length) {
      const results = Array.from(this.props.tarothonData.results).sort(integerComparator((r: Result) => r.points, 'desc'));
      return (
        <div className='results-table-container table-container'>
          <ScoreTable
            results={results}
            players={this.props.players}
          />
        </div>
      );
    } else {
      return (
        <div className='tarothon-error'>
          <h3 className='bp3-heading'>No games have been recorded yet.</h3>
        </div>
      );
    }
  }

  private renderDeleteDialog() {
    return (
      <Dialog
        icon='inbox'
        isOpen={this.state.isDeleteDialogOpen}
        onClose={this.toggleDeleteDialog}
        title='Dialog header'
      >
        <div className='bp3-dialog-body'>
          <p>Are you sure you want to delete this Tarothon?</p>
        </div>
        <div className='bp3-dialog-footer'>
          <div className='bp3-dialog-footer-actions'>
            <Button icon='delete' text='Delete' intent={Intent.DANGER} onClick={this.handleDeleteGame} />
            <Button icon='cross' text='Cancel' onClick={this.toggleDeleteDialog} />
          </div>
        </div>
      </Dialog>
    );
  }

  private toggleDeleteDialog = () => {
    this.setState( { isDeleteDialogOpen: !this.state.isDeleteDialogOpen });
  }
  
  private handleClickEdit = () => {
    history.push(DynamicRoutes.editTarothon(this.props.tarothonData.properties.id));
  }

  private handleDeleteGame = () => {
    this.dispatchers.deleteTarothon.request(this.props.tarothonData.properties.id);
  }
}

export const TarothonsContainerLoader = loadContainer({
  players: playersLoader,
  tarothonData: tarothonDataLoader,
})(TarothonContainerInternal);

const TarothonContainerCached = pageCache(TarothonsContainerLoader);

interface Props {
  match: {
    params: {
      tarothonId: string;
    };
  }
}

export class TarothonContainer extends React.PureComponent<Props, {}> {
  public render() {
    return <TarothonContainerCached tarothonData={this.props.match.params.tarothonId} />; 
  }
}
