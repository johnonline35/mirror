export class AgentState<TContext> {
  private _initialized: boolean = false;
  private _executed: boolean = false;
  private _error: Error | null = null;

  constructor(public context: TContext) {}

  get initialized(): boolean {
    return this._initialized;
  }

  get executed(): boolean {
    return this._executed;
  }

  get error(): Error | null {
    return this._error;
  }

  setInitialized(): void {
    this._initialized = true;
  }

  setExecuted(): void {
    this._executed = true;
  }

  setContext(context: TContext): void {
    this.context = context;
  }

  setError(error: Error): void {
    this._error = error;
  }

  clearError(): void {
    this._error = null;
  }

  resetState(): void {
    this._initialized = false;
    this._executed = false;
    this._error = null;
  }
}
