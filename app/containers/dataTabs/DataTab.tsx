import * as React from 'react';

export class StatsTab extends React.PureComponent<{}, {}> {
}

interface PlayerProp {
    playerId?: string;
}

export function createDataTabPlayerArg<T>(
    AllComponent: React.ComponentClass<T>,
    PlayerComponent: React.ComponentClass<T>,
) {
    return (props: PlayerProp & T) => {
        if (props.playerId) {
            return <PlayerComponent {...props}/>;
        } else {
            return <AllComponent {...props}/>;
        }
    }
}
