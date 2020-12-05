// engine.js
// ========

import { Logger, LogTypes } from "./Logger";

const exec = require("child_process").exec;

export class Engine {
  execScript(scriptName: string): void {
    const myShellScript = exec("./scripts/" + scriptName);
    myShellScript.stdout.on("data", (data: string) => {
      Logger.log(LogTypes.info, `${scriptName} : ${data}`);
    });
    myShellScript.stderr.on("data", (data: string) => {
      Logger.log(LogTypes.error, `${scriptName} : ${data}`);
    });
  }
}
