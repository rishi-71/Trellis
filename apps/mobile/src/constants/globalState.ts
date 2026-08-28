class GlobalState {
  private _token: string | null = null;
  private _ipAddress: string = '127.0.0.1';
  private _userRole: string | null = null;
  private _studentBranch: string = '';
  private _studentYear: number = 1;
  private _studentSemester: number = 1;
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

  get userRole() {
    return this._userRole;
  }

  setUserRole(val: string | null) {
    this._userRole = val;
    this.notify();
  }

  get studentBranch() {
    return this._studentBranch;
  }

  setStudentBranch(val: string) {
    this._studentBranch = val;
    this.notify();
  }

  get studentYear() {
    return this._studentYear;
  }

  setStudentYear(val: number) {
    this._studentYear = val;
    this.notify();
  }

  get studentSemester() {
    return this._studentSemester;
  }

  setStudentSemester(val: number) {
    this._studentSemester = val;
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
