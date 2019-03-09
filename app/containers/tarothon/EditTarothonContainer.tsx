import * as React from 'react';
import { TarothonData } from '../../../server/model/Tarothon';
import { loadContainer } from '../LoadingContainer';
import { TarothonFormContainer } from './TarothonFormContainer';
import { tarothonDataLoader } from '../../services/tarothonData';
import { pageCache } from '../pageCache/PageCache';

interface PropsInternal {
  tarothonData: TarothonData;
}

class EditTarothonContainerInternal extends React.PureComponent<PropsInternal> {

  public render() {
    return (
      <TarothonFormContainer
        editTarothon={this.props.tarothonData.properties}
      />
    );
  }
}

const EditTarothonContainerLoader = loadContainer({
  tarothonData: tarothonDataLoader,
})(EditTarothonContainerInternal);

const EditTarothonContainerCache = pageCache(EditTarothonContainerLoader);

interface Props {
  match: {
    params: {
      tarothonId: string;
    };
  }
}

export const EditTarothonContainer = (props: Props) => {
  return <EditTarothonContainerCache tarothonData={props.match.params.tarothonId}/>;
};
