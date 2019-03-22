import { RoleResult } from "./Result";

export interface NewTarothon {
  begin: string;
  end: string;
}

export interface Tarothon extends NewTarothon {
  id: string;
}

export interface TarothonData {
  properties: Tarothon;
  results: RoleResult[];
}
