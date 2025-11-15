import { ApisauceInstance, create } from "apisauce";
import { AdminPasswordKey } from "../../../server/headers";
import { GameSettings } from "../../../server/play/model/GameSettings";
import { StaticRoutes } from "../../../shared/routes";
import { getAdminPassword } from "../../admin";

export class ServerApi {
  private api: ApisauceInstance;
  private navigate: (path: string) => void;

  constructor(baseURL: string, navigate: (path: string) => void) {
    this.api = create({ baseURL });
    this.navigate = navigate;
  }

  public playNewGame = (settings: GameSettings): Promise<string> => {
    return this.wrapPost("/play/new_game", settings);
  };

  // Helpers

  public wrapGet = <RESP>(url: string) => {
    return this.api
      .get<RESP | { error: string }>(url, { headers: this.getHeaders() })
      .then((response: any): RESP => {
        if (response.ok) {
          const data = response.data! as any;
          if (data.error) {
            throw new Error(data.error);
          } else {
            return data;
          }
        } else if (response.status === 403) {
          this.navigate(StaticRoutes.login());
          throw new Error("Unauthorized");
        } else {
          throw new Error(response.problem);
        }
      });
  };

  public wrapPost = <RESP>(url: string, body: any) => {
    return this.api
      .post<RESP | { error: string }>(url, body, {
        headers: { [AdminPasswordKey]: getAdminPassword() },
      })
      .then((response: any): RESP => {
        if (response.ok) {
          const data = response.data! as any;
          if (data.error) {
            throw new Error(data.error);
          } else {
            return data;
          }
        } else if (response.status === 403) {
          this.navigate(StaticRoutes.login());
          throw new Error("Unauthorized");
        } else {
          throw new Error(response.problem);
        }
      });
  };

  private getHeaders() {
    const headers: Record<string, string> = {};
    const adminPassword = getAdminPassword();
    if (adminPassword != null && adminPassword.length > 0) {
      headers[AdminPasswordKey] = adminPassword;
    }
    return headers;
  }
}
