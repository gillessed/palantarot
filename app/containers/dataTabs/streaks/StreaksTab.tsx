import { createDataTabPlayerArg } from '../DataTab';
import { PlayerStreaksTab } from './PlayerStreaksTab';
import { AllStreaksTab } from './AllStreaksTab';
interface Props {
  playerId?: string;
}

export const StreaksTab = createDataTabPlayerArg<Props>(AllStreaksTab, PlayerStreaksTab);
