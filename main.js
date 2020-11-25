const http = require("http");
const exec = require('child_process').exec;
const secrets = require("./secrets.json");

const host = 'localhost';
const port = 8000;

class ReturnHandler {
    
    constructor(res){
        res.setHeader("Content-Type", "application/json");
        this.res = res;
    }

    end(code, message){
        this.res.writeHead(code);
        this.res.end(JSON.stringify({message}));
    }
}

const treatUrl = (url) => {
    const cleanedUrl = url.slice(1, url.length);
    console.log(cleanedUrl);
    return cleanedUrl.split('/');
}

const execScript = (scriptName) => {
    const myShellScript = exec('./projects/'+ scriptName);
    myShellScript.stdout.on('data', (data)=>{
        console.log(data); 
        // do whatever you want here with data
    });
    myShellScript.stderr.on('data', (data)=>{
        console.error(data);
    });
}

const requestListener = function (req, res) {
    const returnHandler = new ReturnHandler(res);
    const urlParts = treatUrl(req.url);
    switch(urlParts[0]){
        case "reload":
            switch(urlParts[1]){
                case 'dice':
                    if(urlParts[2] && urlParts[2] == secrets['dice']){
                        execScript('dice.sh');
                        returnHandler.end(200,'dice reloaded');
                    } else {
                        returnHandler.end(500, "unauthorize");
                    }
                    break;
                default:
                    returnHandler.end(404,'project not found');
            }
            break
        case "ping":
            returnHandler.end(200,'pong');
            break
        default:
            returnHandler.end(404,'Resource not found');
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

