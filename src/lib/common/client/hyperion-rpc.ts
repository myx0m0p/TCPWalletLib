const { RpcError } = require('eosjs');

class HyperionRpc {
    public endpoint: string;

    public fetchBuiltin: (input?: Request | string, init?: RequestInit) => Promise<Response>;

    constructor(endpoint: string, args:
        { fetch?: (input?: string | Request, init?: RequestInit) => Promise<Response> } = {}) {
      this.endpoint = endpoint;
      if (args.fetch) {
        this.fetchBuiltin = args.fetch;
      } else {
        this.fetchBuiltin = (global as any).fetch;
      }
    }

    /** Post `body` to `endpoint + path`. Throws detailed error information in `RpcError` when available. */
    public async fetch(path: string, body: any) {
      let response;
      let json;
      try {
        const f = this.fetchBuiltin;
        response = await f(this.endpoint + path, {
          body: JSON.stringify(body),
          method: 'POST',
        });
        json = await response.json();
        if (json.processed && json.processed.except) {
          throw new RpcError(json);
        }
      } catch (error) {
        error.isFetchError = true;
        throw error;
      }
      if (!response.ok) {
        throw new RpcError(json);
      }
      return json;
    }

    public async get(path: string, params: any) {
      let response;
      let json;
      const queryString = Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
      try {
        const f = this.fetchBuiltin;
        response = await f(`${this.endpoint}${path}?${queryString}`, {
          method: 'GET',
        });
        json = await response.json();
        if (json.processed && json.processed.except) {
          throw new RpcError(json);
        }
      } catch (error) {
        error.isFetchError = true;
        throw error;
      }
      if (!response.ok) {
        throw new RpcError(json);
      }
      return json;
    }

    /** Raw call to `/v2/history/get_actions` */
    public async history_get_actions(accountName: string, skip: number = 0, limit: number = 20) {
      return this.get('/v2/history/get_actions', {
        account: accountName,
        skip,
        limit,
      });
    }

    /** Raw call to `/v2/history/get_actions` */
    public async history_get_simple_actions(accountName: string, skip: number = 0, limit: number = 20) {
      return this.get('/v2/history/get_actions', {
        account: accountName,
        simple: true,
        skip,
        limit,
      });
    }
}

export = HyperionRpc;
