import http from "http";
import { Logger, LogTypes } from "./core/Logger";
import { RequestHandler } from "./core/RequestHandler";

const hostname: string = process.env.HOST || "0.0.0.0";

let port = 8000;
if (process.env.PORT) {
  if (typeof process.env.PORT != "number") {
    throw Error("PORT have to be a number.");
  } else {
    port = process.env.PORT;
  }
}

const server = http.createServer((req, res) => {
  Logger.log(LogTypes.info, `[${req.method}] ${req.url}`);
  const returnHandler = new RequestHandler(req, res);
});
server.listen(port, hostname, null, () => {
  Logger.log(LogTypes.info, `Zoidberg is running on http://${host}:${port}`);
});
