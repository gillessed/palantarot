import { createDataTabPlayerArg } from '../DataTab';
import { AllWinPercentagesTab } from './AllWinPercentagesTab';
import { PlayerWinPercentagesTab } from './PlayerWinPercentagesTab';

interface Props {
    playerId?: string;
}

export const WinPercentagesTab = createDataTabPlayerArg<Props>(AllWinPercentagesTab, PlayerWinPercentagesTab);
