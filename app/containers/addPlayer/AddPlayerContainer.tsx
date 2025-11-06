import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { NewPlayer } from "../../../server/model/Player";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import { SpinnerOverlay } from "../../components/spinnerOverlay/SpinnerOverlay";
import { Palantoaster, TIntent } from "../../components/toaster/Toaster";
import history from "../../history";
import { StaticRoutes } from "../../routes";
import { AddPlayerService } from "../../services/addPlayer/index";
import { Dispatchers } from "../../services/dispatchers";
import { getPlayerName } from "../../services/players/playerName";
import { ReduxState } from "../../services/rootReducer";
import { useDispatchers } from "../../dispatchProvider";
import { useAddPlayer } from "../../services/useAddPlayer";
import { isAsyncLoading } from "../../utils/Async";

export const AddPlayerContainer = memo(function AddPlayerContainer() {
  const dispatchers = useDispatchers();

  useEffect(() => {
    dispatchers.players.request();
  }, [dispatchers]);

  // TODO: redirect on success
  const { addPlayer, addedPlayer } = useAddPlayer();

  return (
    <div className="add-player-container page-container">
      <div className="title">
        <h1 className="bp3-heading">Add Player</h1>
      </div>
      {isAsyncLoading(addedPlayer) && <SpinnerOverlay text="Adding Player..." />}
      {!isAsyncLoading(addedPlayer) && <AddPlayerForm onSubmit={addPlayer} />}
    </div>
  );
});
