import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/api/data'){res.writeHead(503);res.end('{}');return;}const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+ '/'.replace('/',process.platform==='win32'?'\\':'/'))){res.writeHead(403);res.end();return;}const body=await readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[extname(file)]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
