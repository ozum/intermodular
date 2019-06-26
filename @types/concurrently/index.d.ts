declare module "concurrently" {
  import { Stream } from "stream";

  export interface ConcurrentlyOptions {
    defaultInputTarget?: string | number;
    inputStream?: Stream;
    killOthers?: string[];
    outputStream?: Stream;
    prefix?: string;
    prefixLength?: number;
    raw?: boolean;
    successCondition?: "first" | "last" | "all";
    restartTries?: number;
    restartDelay?: number;
    timestampFormat?: string;
  }

  export interface ConcurrentlyCommand {
    command: string;
    name?: string;
    prefixColor?: string;
  }

  export default function concurrently(commands: string[] | ConcurrentlyCommand[], options: ConcurrentlyOptions): Promise<void>;
}
