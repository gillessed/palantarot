import { createDataTabPlayerArg } from '../DataTab';
import { AllSlamsTabs } from './AllSlamsTab';

interface Props {
    playerId?: string;
}

export const SlamsTab = createDataTabPlayerArg<Props>(AllSlamsTabs, null as any);
