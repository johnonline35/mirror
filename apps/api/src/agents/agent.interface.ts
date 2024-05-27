export interface IAgent {
  init(context: any): Promise<void>;
  execute(context: any): Promise<void>;
  handleResult(context: any): Promise<void>;
  run(context: any): Promise<void>;
}
