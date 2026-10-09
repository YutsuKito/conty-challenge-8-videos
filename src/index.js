import {http} from './http.js';import {createService} from './service.js';
export function createApp(service=createService()){return http(service,[
 ['POST',/^\/campaigns$/, (s,b)=>s.createCampaign(b)],
 ['POST',/^\/deliveries$/, (s,b)=>s.createDelivery(b)],
 ['GET',/^\/deliveries\/([^/]+)$/, (s,b,id)=>s.get(id)],
 ['POST',/^\/deliveries\/([^/]+)\/pieces\/(script|video|cover|caption)\/versions$/, (s,b,id,p)=>s.addVersion(id,p,b)],
 ['POST',/^\/deliveries\/([^/]+)\/pieces\/(script|video|cover|caption)\/approve$/, (s,b,id,p)=>s.approvePiece(id,p)],
 ['POST',/^\/deliveries\/([^/]+)\/pieces\/(script|video|cover|caption)\/versions\/(\d+)\/comments$/, (s,b,id,p,n)=>s.comment(id,p,n,b)],
 ['POST',/^\/deliveries\/([^/]+)\/approve$/, (s,b,id)=>s.approveDelivery(id)]
]);}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)createApp().listen(3008,()=>console.log('http://localhost:3008'));
