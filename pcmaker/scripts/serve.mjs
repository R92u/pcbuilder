import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if(file===root)file=path.join(root,'index.html');fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);});});
server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
