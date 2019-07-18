import { ExecaSyncReturnValue, ExecaSyncError } from "execa";

/**
 * Class to access status and error objects of executed CLI commands.
 */
export default class CommandResults {
  private _error?: Error;
  private _exitCode: number = 0;

  /**
   * Results of the executed commands. May be used to access `status` and `error`.
   */
  public readonly results: ExecaSyncReturnValue[] = [];

  /**
   * Whether to exit from command.
   */
  public exit: boolean = true;

  /**
   * Add `result` to the command results.
   *
   * @param status is exit status code of cli command. (0: success, other value: error)
   * @param error is `Error` object if execution of cli command fails.
   */
  public add(execaReturns: ExecaSyncReturnValue | ExecaSyncError): void {
    if (execaReturns.exitCode !== 0 || execaReturns.failed || execaReturns instanceof Error) {
      this._exitCode = execaReturns.exitCode;
      /* istanbul ignore else */
      if (execaReturns instanceof Error) {
        this._error = execaReturns;
      }
    }

    this.results.push(execaReturns);
  }

  /**
   * Overall status of the commands. If multiple commands are executed, contains first non-zero exit status code.
   * If all commands are completed without error, this is `0`.
   */
  public get status(): number | null {
    return this._exitCode;
  }

  /**
   * If multiple commands are executed, contains first failed command's error object if any.
   * If all commands are completed without error, this is undefined.
   */
  // public get error(): Error | undefined {
  //   return this._error;
  // }
}
