const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=new Set(['index.html','styles.css','app.js','core.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png']);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const relative=url.pathname.replace(/^\/zihin-atlasi\//,'/').slice(1)||'index.html';if(!files.has(relative)){res.writeHead(404);res.end('Not found');return;}fs.readFile(path.join(root,relative),(error,data)=>{if(error){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(relative)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/zihin-atlasi/'));
