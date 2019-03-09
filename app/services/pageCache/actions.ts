import { TypedAction } from 'redoodle';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';

export const pageCacheAction = TypedAction.define('PAGE CACHE')<void>();

export class PageCacheDispatcher {
    constructor(private readonly store: Store<ReduxState>) {}

    public refresh() {
        this.store.dispatch(pageCacheAction.create(undefined));
    }
}