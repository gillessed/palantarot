import { TypedAction } from 'redoodle';
import { actionName } from './actionName';

// Service

export interface ServiceActions<REQUEST, RESULT> {
  request: TypedAction.Definition<string, REQUEST[]>;
  loading: TypedAction.Definition<string, REQUEST[]>;
  success: TypedAction.Definition<string, { arg: REQUEST[], result: Map<REQUEST, RESULT> }>;
  error: TypedAction.Definition<string, { arg: REQUEST[], error: Error }>;
  clear: TypedAction.Definition<string, REQUEST[]>;
  clearAll: TypedAction.Definition<string, void>;
}

export function generateServiceActions<REQUEST, RESULT>(prefix: string): ServiceActions<REQUEST, RESULT> {
  const name = actionName(prefix);
  return {
    request: TypedAction.define(name('request'))<REQUEST[]>(),
    loading: TypedAction.define(name('loading'))<REQUEST[]>(),
    success: TypedAction.define(name('success'))<{ arg: REQUEST[], result: Map<REQUEST, RESULT> }>(),
    error: TypedAction.define(name('error'))<{ arg: REQUEST[], error: Error }>(),
    clear: TypedAction.define(name('clear'))<REQUEST[]>(),
    clearAll: TypedAction.define(name('clearAll'))<void>(),
  };
}

// Properties

export interface PropertyActions<REQUEST, RESULT> {
  request: TypedAction.Definition<string, REQUEST>;
  loading: TypedAction.Definition<string, void>;
  success: TypedAction.Definition<string, { arg: REQUEST, result: RESULT }>;
  error: TypedAction.Definition<string, { error: Error }>;
  clear: TypedAction.Definition<string, void>;
}

export function generatePropertyActions<REQUEST, RESULT>(prefix: string): PropertyActions<REQUEST, RESULT> {
  const name = actionName(prefix);
  return {
    request: TypedAction.define(name('request'))<REQUEST>(),
    loading: TypedAction.define(name('loading'))<void>(),
    success: TypedAction.define(name('success'))<{ arg: REQUEST, result: RESULT }>(),
    error: TypedAction.define(name('error'))<{ error: Error }>(),
    clear: TypedAction.define(name('clear'))<void>(),
  };
}
