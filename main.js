const http = require("http");
const exec = require('child_process').exec;
const secrets = require("./secrets.json");
const crypto = require("crypto");

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8000;
const secret = process.env.SECRET;


class ReturnHandler {
    constructor(res) {
        res.setHeader("Content-Type", "application/json");
        this.res = res;
    }

    end(code, message) {
        this.res.writeHead(code);
        console.log('[' + code + '] ' + message);
        this.res.end(JSON.stringify({ message }));
    }
}

const treatUrl = (url) => {
    const cleanedUrl = url.slice(1, url.length);
    return cleanedUrl.split('/');
}

const execScript = (scriptName) => {
    const myShellScript = exec('./scripts/' + scriptName);
    myShellScript.stdout.on('data', (data) => {
        console.log(scriptName + " : " + data);
    });
    myShellScript.stderr.on('data', (data) => {
        console.error(scriptName + " (error) : " + data);
    });
}

const validateIntegrity = (signature, body) => {
    if (secret === undefined) {
        console.log('error : secret is missing.')
        return false;
    }
    const expectedSignature = "sha1=" +
        crypto.createHmac("sha1", secret)
            .update(JSON.stringify(body))
            .digest("hex");

    if (signature !== expectedSignature) {
        console.log('warning : integrity check fail.')
        return false;
    }
    return true;
}

const checkBranch = (ref, branchName) => {
    const matchGroup = ref.match(/refs\/heads\/(.*)/);
    return matchGroup[1] == branchName;
}

const requestListener = function (req, res) {
    console.log('[' + req.method + '] ' + req.url);
    const returnHandler = new ReturnHandler(res);
    const urlParts = treatUrl(req.url);
    if (req.method === "POST") {
        var requestBody = '';
        req.on('data', function (data) {
            requestBody += data;
            if (requestBody.length > 1e7) {
                returnHandler.end(413, 'warning : request Entity Too Large');
            }
        });
        req.on('end', function () {
            var body = JSON.parse(requestBody);
            treatPostRequest(req.headers, urlParts, body, returnHandler);
        });
    } else if (req.method === "GET") {
        treatGetRequest(urlParts, returnHandler);
    } else {
        returnHandler.end(413, 'warning : request method not supported');
    }

};

const treatPostRequest = (headers, urlParts, body, returnHandler) => {
    switch (urlParts[0]) {
        case "reload":
            const projectInfos = projects.find(p => p.name === urlParts[1]);
            if (projectInfos === undefined) {
                returnHandler.end(404, 'project not found');
            }
            if (validateIntegrity(headers["x-hub-signature"], body) && checkBranch(body.ref, projectInfos.branchName)) {
                execScript(projectInfos.scriptName);
                returnHandler.end(200, projectInfos.name + ' reloaded');
            } else {
                returnHandler.end(500, "unauthorize");
            }
            break;
        default:
            returnHandler.end(404, 'resource not found');
    }
}

const treatGetRequest = (urlParts, returnHandler) => {
    switch (urlParts[0]) {
        case "ping":
            returnHandler.end(200, 'pong');
            break
        default:
            returnHandler.end(404, 'resource not found');
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Zoidberg is running on http://${host}:${port}`);
});

