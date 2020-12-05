// github-integration.js
// ========

import { Logger, LogTypes } from "./Logger";
import crypto from "crypto";
const secret = process.env.SECRET;

export class GitHubIntegration {
  validateRequestIntegrity(signature: string, body: string): boolean {
    if (secret === undefined) {
      Logger.log(LogTypes.error, "secret is missing");
      return false;
    }
    const expectedSignature =
      "sha1=" +
      crypto
        .createHmac("sha1", secret)
        .update(JSON.stringify(body))
        .digest("hex");

    if (signature !== expectedSignature) {
      Logger.log(LogTypes.warning, "integrity check fail");
      return false;
    }
    return true;
  }

  checkBranch(ref: string, branchName: string): boolean {
    const matchGroup = ref.match(/refs\/heads\/(.*)/);
    return matchGroup[1] == branchName;
  }
}
