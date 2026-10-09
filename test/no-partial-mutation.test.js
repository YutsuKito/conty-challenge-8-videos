import test from 'node:test';import assert from 'node:assert/strict';import {createService} from '../src/service.js';
test('operações inválidas em peça ausente preservam a entrega inteira',()=>{
  const service=createService();const campaign=service.createCampaign({required_pieces:['caption']});const delivery=service.createDelivery({campaign_id:campaign.id});
  const before=service.get(delivery.id);
  assert.throws(()=>service.addVersion(delivery.id,'video',{asset_url:'fake:v',duration_seconds:0}),{status:400});
  assert.deepEqual(service.get(delivery.id),before);
  assert.throws(()=>service.approvePiece(delivery.id,'video'),{status:409});assert.deepEqual(service.get(delivery.id),before);
  assert.throws(()=>service.comment(delivery.id,'video',1,{second:0,text:'x'}),{status:404});assert.deepEqual(service.get(delivery.id),before);
});
