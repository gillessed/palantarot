declare module 'apisauce' {
  import {AxiosInstance, AxiosRequestConfig} from 'axios';

  export type PROBLEM_CODE =
    | 'CLIENT_ERROR'
    | 'SERVER_ERROR'
    | 'TIMEOUT_ERROR'
    | 'CONNECTION_ERROR'
    | 'NETWORK_ERROR'
    | 'CANCEL_ERROR';

  interface ApiErrorResponse<T> {
    ok: false;
    problem: PROBLEM_CODE;

    data?: T;
    status?: number;
    headers?: {};
    config?: AxiosRequestConfig;
    duration?: number;
  }
  interface ApiOkResponse<T> {
    ok: true;
    problem: null;

    data?: T;
    status?: number;
    headers?: {};
    config?: AxiosRequestConfig;
    duration?: number;
  }
  export type ApiResponse<T> = ApiErrorResponse<T> | ApiOkResponse<T>;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  export interface ApisauceInstance {
    headers: any;
    addMonitor: (tron: any) => void;
    setHeader: (key: string, value: string) => AxiosInstance;
    getBaseURL: () => string;
    setBaseURL: (baseUrl: string) => AxiosInstance;
    get: <T>(
      url: string,
      params?: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    head: <T>(
      url: string,
      params?: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    delete: <T>(
      url: string,
      params?: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    link: <T>(
      url: string,
      params?: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    unlink: <T>(
      url: string,
      params?: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    post: <T>(
      url: string,
      data: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    put: <T>(
      url: string,
      data: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
    patch: <T>(
      url: string,
      data: {},
      axiosConfig?: AxiosRequestConfig
    ) => Promise<ApiResponse<T>>;
  }

  export function create(args: AxiosRequestConfig): ApisauceInstance;
}
