import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../src/index.js';

test('HTTP: substituir vídeo de entrega aprovada exige nova aprovação e preserva comentários',async t=>{
 const server=createApp();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
 const base=`http://127.0.0.1:${server.address().port}`;
 async function request(path,body={},expected=200,method='POST'){
  const response=await fetch(base+path,{method,headers:{'content-type':'application/json'},...(method==='GET'?{}:{body:JSON.stringify(body)})});
  const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));return data;
 }
 const campaign=await request('/campaigns',{required_pieces:['video','caption']});
 const delivery=await request('/deliveries',{campaign_id:campaign.id});
 const path=`/deliveries/${delivery.id}`;
 await request(`${path}/pieces/video/versions`,{asset_url:'fake:v1',duration_seconds:30});
 await request(`${path}/pieces/video/versions/1/comments`,{second:12,text:'Ajustar corte'});
 await request(`${path}/pieces/caption/versions`,{asset_url:'fake:caption'});
 await request(`${path}/pieces/video/approve`);await request(`${path}/pieces/caption/approve`);
 assert.equal((await request(`${path}/approve`)).approved,true);

 const replaced=await request(`${path}/pieces/video/versions`,{asset_url:'fake:v2',duration_seconds:45});
 assert.equal(replaced.approved,false);assert.equal(replaced.explicit_approval,null);assert.deepEqual(replaced.missing_required,['video']);
 assert.equal(replaced.pieces.video[0].comments[0].text,'Ajustar corte');assert.deepEqual(replaced.pieces.video[1].comments,[]);
 assert.ok(replaced.pieces.caption[0].approved_at);
 const rejected=await request(`${path}/approve`,{},409);assert.match(rejected.error,/video/);
 await request(`${path}/pieces/video/approve`);assert.equal((await request(`${path}/approve`)).approved,true);
 const final=await request(path,{},200,'GET');
 assert.deepEqual(final.approval_history.map(x=>x.event),['approved','invalidated','approved']);
});
