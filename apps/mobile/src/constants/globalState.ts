class GlobalState {
  private _token: string | null = null;
  private _ipAddress: string = '127.0.0.1';
  private _listeners: (() => void)[] = [];

  get token() {
    return this._token;
  }

  setToken(val: string | null) {
    this._token = val;
    this.notify();
  }

  get ipAddress() {
    return this._ipAddress;
  }

  setIpAddress(val: string) {
    this._ipAddress = val;
    this.notify();
  }

  get backendUrl() {
    return `http://${this._ipAddress}:5000`;
  }

  subscribe(listener: () => void) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this._listeners.forEach(l => l());
  }
}

export const globalState = new GlobalState();
