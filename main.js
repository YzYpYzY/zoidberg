const http = require("http");
const exec = require('child_process').exec;
const secrets = require("./secrets.json");
const crypto = require("crypto");

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8000;

class ReturnHandler {
    constructor(res) {
        res.setHeader("Content-Type", "application/json");
        this.res = res;
    }

    end(code, message) {
        this.res.writeHead(code);
        this.res.end(JSON.stringify({ message }));
    }
}

const treatUrl = (url) => {
    const cleanedUrl = url.slice(1, url.length);
    console.log(cleanedUrl);
    return cleanedUrl.split('/');
}

const execScript = (scriptName) => {
    const myShellScript = exec('./projects/' + scriptName);
    myShellScript.stdout.on('data', (data) => {
        console.log(data);
    });
    myShellScript.stderr.on('data', (data) => {
        console.error(data);
    });
}

const validateIntegrity = (signature, body, secret) => {
    // calculate the signature
    const expectedSignature = "sha1=" +
        crypto.createHmac("sha1", secret)
            .update(JSON.stringify(body))
            .digest("hex");

    if (signature !== expectedSignature) {
        return false;
    }
    return true;
}

const checkBranch = (ref, branchName) => {
    const matchGroup = ref.match(/refs\/heads\/(.*)/);
    return matchGroup[1] == branchName;
}

const requestListener = function (req, res) {
    const returnHandler = new ReturnHandler(res);
    const urlParts = treatUrl(req.url);
    if (req.method === "POST") {
        var requestBody = '';
        req.on('data', function (data) {
            requestBody += data;
            if (requestBody.length > 1e7) {
                returnHandler.end(413, 'Request Entity Too Large');
            }
        });
        req.on('end', function () {
            var body = JSON.parse(requestBody);
            treatPostRequest(req.headers, urlParts, body, returnHandler);
        });
    } else {
        treatGetRequest(urlParts, returnHandler);
    }

};

const treatPostRequest = (headers, urlParts, body, returnHandler) => {
    switch (urlParts[0]) {
        case "reload":
            switch (urlParts[1]) {
                case 'dice':
                    if (validateIntegrity(headers["x-hub-signature"], body, secrets['dice']) && checkBranch(body.ref, 'master')) {
                        execScript('dice.sh');
                        returnHandler.end(200, 'dice reloaded');
                    } else {
                        returnHandler.end(500, "unauthorize");
                    }
                    break;
                case 'cv':
                    if (validateIntegrity(headers["x-hub-signature"], body, secrets['cv']) && checkBranch(body.ref, 'master')) {
                        execScript('cv.sh');
                        returnHandler.end(200, 'cv reloaded');
                    } else {
                        returnHandler.end(500, "unauthorize");
                    }
                    break;
                default:
                    returnHandler.end(404, 'project not found');
            }
            break
        default:
            returnHandler.end(404, 'Resource not found');
    }
}
const treatGetRequest = (urlParts, returnHandler) => {
    switch (urlParts[0]) {
        case "ping":
            returnHandler.end(200, 'pong');
            break
        default:
            returnHandler.end(404, 'Resource not found');
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

