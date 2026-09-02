import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root=normalize(fileURLToPath(new URL("..",import.meta.url)));
const port=Number(process.env.PORT||4173);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".md":"text/markdown; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);let file=normalize(join(root,pathname==="/"?"index.html":pathname.slice(1)));if(!file.startsWith(root))throw new Error("invalid path");if((await stat(file)).isDirectory())file=join(file,"index.html");const data=await readFile(file);res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store","permissions-policy":"tools=(self)"});res.end(data);}catch{res.writeHead(404);res.end("Not found");}});
server.listen(port,"127.0.0.1",()=>console.log(`Tracebound running at http://127.0.0.1:${port}`));
