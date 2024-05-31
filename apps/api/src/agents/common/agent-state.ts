export class AgentState<TContext> {
  private _initialized: boolean = false;
  private _executed: boolean = false;
  private _error: Error | null = null;

  constructor(public context: TContext) {}

  get initialized() {
    return this._initialized;
  }

  get executed() {
    return this._executed;
  }

  get error() {
    return this._error;
  }

  setInitialized() {
    this._initialized = true;
  }

  setExecuted() {
    this._executed = true;
  }

  setError(error: Error) {
    this._error = error;
  }
}
