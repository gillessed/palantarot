import { createDataTabPlayerArg } from '../DataTab';
import { PlayerDeltasTab } from './PlayerDeltasTab';
import { AllDeltasTab } from './AllDeltasTab';

interface Props {
    playerId?: string;
}

export const DeltasTab = createDataTabPlayerArg<Props>(AllDeltasTab, PlayerDeltasTab);
