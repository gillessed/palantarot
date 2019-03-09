import { createDataTabPlayerArg } from '../DataTab';
import { AllBidsTab } from './AllBidsTab';
import { PlayerBidsTab } from './PlayerBidsTab';

interface Props {
    playerId?: string;
}

export const BidsTab = createDataTabPlayerArg<Props>(AllBidsTab, PlayerBidsTab);
