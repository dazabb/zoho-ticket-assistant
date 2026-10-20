/* Optional local static-file server. Does not receive or store Gemini API keys. */
'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT=__dirname;
const PORT=Number(process.env.PORT)||3000;
const TYPES={'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.svg':'image/svg+xml','.zip':'application/zip','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
http.createServer((req,res)=>{
  let segments;
  try{const url=new URL(req.url,'http://127.0.0.1');segments=decodeURIComponent(url.pathname).split('/').filter(Boolean);}catch(e){res.writeHead(400);res.end('Bad request');return;}
  const allowed=new Set(['index.html','library','reporting','managed-services','images','MAU-Zoho-Extension-v1.3.zip']);
  if(segments.length===0)segments=['index.html'];
  if(!allowed.has(segments[0])||segments.some(x=>x==='..'||x==='.'||x.startsWith('.'))||(!['library','reporting','managed-services','images'].includes(segments[0])&&segments.length!==1)){
    res.writeHead(404);res.end('Not found');return;
  }
  const filename=path.resolve(ROOT,...segments);
  if(!filename.startsWith(ROOT+path.sep)) {res.writeHead(404);res.end('Not found');return;}
  const ext=path.extname(filename).toLowerCase();
  if(!TYPES[ext]){res.writeHead(404);res.end('Not found');return;}
  fs.readFile(filename,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':TYPES[ext]+(['.html','.js','.css'].includes(ext)?'; charset=utf-8':''), 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(data);
  });
}).listen(PORT,'127.0.0.1',()=>{console.log(`MAU Operation Desk is available at http://127.0.0.1:${PORT}`);console.log('This server only serves static files. Personal Gemini keys go directly from the browser to Google.');});
