import { TypedAction } from 'redoodle';

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
  return {
    request: TypedAction.define(prefix + ' // REQUEST')<REQUEST[]>(),
    loading: TypedAction.define(prefix + ' // LOADING')<REQUEST[]>(),
    success: TypedAction.define(prefix + ' // SUCCESS')<{ arg: REQUEST[], result: Map<REQUEST, RESULT> }>(),
    error: TypedAction.define(prefix + ' // ERROR')<{ arg: REQUEST[], error: Error }>(),
    clear: TypedAction.define(prefix + ' // CLEAR')<REQUEST[]>(),
    clearAll: TypedAction.define(prefix + ' // CLEAR ALL')<void>(),
  };
}

// Properties

export interface PropertyActions<REQUEST, RESULT> {
  request: TypedAction.Definition<string, REQUEST>;
  loading: TypedAction.Definition<string, void>;
  success: TypedAction.Definition<string, { result: RESULT }>;
  error: TypedAction.Definition<string, { error: Error }>;
  clear: TypedAction.Definition<string, void>;
}

export function generatePropertyActions<REQUEST, RESULT>(prefix: string): PropertyActions<REQUEST, RESULT> {
  return {
    request: TypedAction.define(prefix + ' // REQUEST')<REQUEST>(),
    loading: TypedAction.define(prefix + ' // LOADING')<void>(),
    success: TypedAction.define(prefix + ' // SUCCESS')<{ result: RESULT }>(),
    error: TypedAction.define(prefix + ' // ERROR')<{ error: Error }>(),
    clear: TypedAction.define(prefix + ' // CLEAR')<void>(),
  };
}
