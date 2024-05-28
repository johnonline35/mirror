export interface SummarizationContext {
  extractedHomePage: string;
  summarizedText?: string;
  error?: Error;
}

export class AgentState {
  private _initialized: boolean = false;
  private _executed: boolean = false;
  private _error: Error | null = null;

  constructor(public context: SummarizationContext) {}

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
