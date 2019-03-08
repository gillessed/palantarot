import { TypedAction } from 'redoodle';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';

export const pageCacheAction = TypedAction.define('PAGE CACHE')<boolean>();

export class PageCacheDispatcher {
    constructor(private readonly store: Store<ReduxState>) {}

    public on() {
        this.store.dispatch(pageCacheAction.create(true));
    }

    public invalidate() {
        this.store.dispatch(pageCacheAction.create(false));
    }
}