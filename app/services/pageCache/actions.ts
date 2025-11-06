import { TypedAction } from "redoodle";
import { type Store } from "redux";
import { type ReduxState } from "../rootReducer";

export const pageCacheAction = TypedAction.define("pageCache")<void>();

export class PageCacheDispatcher {
  constructor(private readonly store: Store<ReduxState>) {}

  public refresh() {
    this.store.dispatch(pageCacheAction.create(undefined));
  }
}
