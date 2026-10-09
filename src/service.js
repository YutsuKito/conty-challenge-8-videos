import {fail,required} from './http.js';
const PIECES=['script','video','cover','caption'];
export function createService({now=()=>new Date()}={}){
 const campaigns=new Map(),deliveries=new Map();let campaignSeq=0,deliverySeq=0,commentSeq=0;
 const time=()=>now().toISOString();
 const delivery=id=>{const d=deliveries.get(id);if(!d)fail('Entrega não encontrada',404);return d;};
 const output=d=>{const requiredPieces=campaigns.get(d.campaign_id).required_pieces;const missing=requiredPieces.filter(p=>{const versions=d.pieces[p]||[];return !versions.length||!versions.at(-1).approved_at;});return {...structuredClone(d),required_pieces:[...requiredPieces],missing_required:missing,approved:missing.length===0&&!!d.explicit_approval,approval_valid:missing.length===0};};
 function getPiece(d,p){if(!PIECES.includes(p))fail('Peça desconhecida',400);return d.pieces[p]||(d.pieces[p]=[]);}
 return {
 createCampaign({required_pieces}){required(Array.isArray(required_pieces)&&required_pieces.length>0&&required_pieces.every(x=>PIECES.includes(x))&&new Set(required_pieces).size===required_pieces.length,'Peças exigidas inválidas');const id=`cmp_${++campaignSeq}`;const c={id,required_pieces:[...required_pieces]};campaigns.set(id,c);return structuredClone(c);},
 createDelivery({campaign_id}){if(!campaigns.has(campaign_id))fail('Campanha não encontrada',404);const id=`delivery_${++deliverySeq}`;const d={id,campaign_id,pieces:{},explicit_approval:null,approval_history:[]};deliveries.set(id,d);return output(d);},
 addVersion(id,piece,{asset_url,duration_seconds=null}){const d=delivery(id);required(typeof asset_url==='string'&&!!asset_url.trim(),'URL ou arquivo fictício obrigatório');const versions=getPiece(d,piece);
   if(piece==='video')required(typeof duration_seconds==='number'&&Number.isFinite(duration_seconds)&&duration_seconds>0,'Duração positiva obrigatória para vídeo');
   const n=versions.length+1;versions.push({version:n,asset_url,duration_seconds,uploaded_at:time(),approved_at:null,comments:[]});
   if(d.explicit_approval){d.approval_history.push({event:'invalidated',at:time(),piece,version:n});d.explicit_approval=null;}
   return output(d);},
 approvePiece(id,piece){const d=delivery(id);const versions=getPiece(d,piece);if(!versions.length)fail('Peça sem versão',409);versions.at(-1).approved_at=time();return output(d);},
 approveDelivery(id){const d=delivery(id);const state=output(d);if(state.missing_required.length)fail(`Peças obrigatórias pendentes: ${state.missing_required.join(', ')}`,409);d.explicit_approval=time();d.approval_history.push({event:'approved',at:time()});return output(d);},
 comment(id,piece,number,{second,text}){const d=delivery(id);const ver=getPiece(d,piece).find(v=>v.version===Number(number));if(!ver)fail('Versão não encontrada',404);if(piece!=='video')fail('Comentário por segundo é específico de vídeo');required(Number.isFinite(second)&&second>=0&&second<=ver.duration_seconds,'Segundo inválido');required(typeof text==='string'&&!!text.trim(),'Texto obrigatório');ver.comments.push({id:`comment_${++commentSeq}`,second,text:text.trim(),created_at:time()});return output(d);},
 get(id){return output(delivery(id));}
 };
}
