// server.js
// ========
import http, { IncomingMessage, ServerResponse } from "http";
import { Logger, LogTypes } from "./Logger";

export class RequestHandler {
  urlParts: string[];
  res: any;

  constructor(req: IncomingMessage, res: ServerResponse) {
    res.setHeader("Content-Type", "application/json");
    this.urlParts = this.treatUrl(req.url);
    if (req.method === "POST") {
      let requestBody = "";
      req.on("data", function (data) {
        requestBody += data;
        if (requestBody.length > 1e7) {
          this.end(413, "request entity too large");
        }
      });
      req.on("end", function () {
        this.body = JSON.parse(requestBody);
        this.handlePost();
      });
    } else if (req.method === "GET") {
      this.handleGet();
    } else {
      this.end(413, "request method not supported");
    }
  }

  private handleGet() {
    switch (this.urlParts[0]) {
      case "ping":
        this.end(200, "pong");
        break;
      default:
        this.end(404, "resource not found");
    }
  }

  private handlePost() {
    switch (this.urlParts[0]) {
      case "reload":
        const projectInfos = projects.find((p) => p.name === this.urlParts[1]);
        if (projectInfos === undefined) {
          this.end(404, "project not found");
        }
        if (
          validateIntegrity(headers["x-hub-signature"], tbody) &&
          checkBranch(body.ref, projectInfos.branchName)
        ) {
          execScript(projectInfos.scriptName);
          this.end(200, projectInfos.name + " reloaded");
        } else {
          this.end(500, "unauthorize");
        }
        break;
      default:
        this.end(404, "resource not found");
    }
  }

  private treatUrl(url: string): string[] {
    const cleanedUrl = url.slice(1, url.length);
    return cleanedUrl.split("/");
  }

  private end(code: number, message: string) {
    this.res.writeHead(code);
    Logger.log(LogTypes.info, `[${code}] ${message}`);
    this.res.end(JSON.stringify({ message }));
  }
}
