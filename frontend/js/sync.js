'use strict';
/* ============================================================
   OpsDesk · TBO — server sync layer
   Talks to the backend in /backend (same origin, /api/...).

   How it works
   - app.js keeps the whole state in memory as `S` and calls save() after
     every change. save() also calls changed() here.
   - changed() waits 250 ms, compares S with the last state the server is
     known to have, and sends only the difference in ONE request (/api/sync).
   - Every 5 s it asks /api/revision. If somebody else changed something it
     loads the new state and hands it to app.js (adopt).
   - If the server cannot be reached the app keeps working on browser
     localStorage exactly as before; changes made after a connection drop
     are sent when the server comes back.
   ============================================================ */
window.OpsDeskSync=(()=>{
 const API='/api',POLL_MS=5000,PUSH_MS=250,BOOT_TIMEOUT=2500,TIMEOUT=6000;
 const j=JSON.stringify;
 let cb={get:()=>null,adopt:()=>{},status:()=>{}};
 // status: 'local' (no server at page load) | 'online' | 'offline' (lost mid-session) | 'error' (server rejected data)
 let status='local',revision=0,snap=null,timer=null,busy=false,again=false,needPull=false,rejected='';

 function setStatus(s){if(s!==status){status=s;try{cb.status(s)}catch(e){console.error(e)}}}
 const isHttp=e=>typeof e.status==='number';

 async function call(path,opt,timeout){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),timeout||TIMEOUT);
  try{
   const r=await fetch(API+path,Object.assign({headers:{'Content-Type':'application/json'},signal:ctl.signal},opt||{}));
   if(!r.ok){const e=new Error('HTTP '+r.status);e.status=r.status;try{e.detail=await r.text()}catch(x){}throw e}
   return await r.json();
  }finally{clearTimeout(to)}
 }

 const strip=s=>({v:1,users:s.users,tickets:s.tickets,archive:s.archive,backlog:s.backlog,seq:s.seq,retentionDays:s.retentionDays});

 /* What the server is known to hold, as cheap comparable strings. */
 function snapshot(S){
  const t=new Map(),u=new Map();
  S.tickets.forEach(x=>t.set(x.id,{j:j(x),a:false}));
  S.archive.forEach(x=>t.set(x.id,{j:j(x),a:true}));
  S.users.forEach(x=>u.set(x.id,j(x)));
  return {t,u,backlog:j(S.backlog),seq:S.seq,ret:S.retentionDays};
 }
 function diff(){
  const S=cb.get(),cur=snapshot(S),b={tickets_upsert:[],tickets_delete:[],users_upsert:[]};
  S.tickets.forEach(x=>{const o=snap.t.get(x.id);if(!o||o.a||o.j!==cur.t.get(x.id).j)b.tickets_upsert.push({ticket:x,archived:false})});
  S.archive.forEach(x=>{const o=snap.t.get(x.id);if(!o||!o.a||o.j!==cur.t.get(x.id).j)b.tickets_upsert.push({ticket:x,archived:true})});
  snap.t.forEach((_,id)=>{if(!cur.t.has(id))b.tickets_delete.push(id)});
  S.users.forEach(x=>{if(snap.u.get(x.id)!==cur.u.get(x.id))b.users_upsert.push(x)});
  if(cur.backlog!==snap.backlog)b.backlog=S.backlog;
  if(cur.seq!==snap.seq)b.seq=S.seq;
  if(cur.ret!==snap.ret)b.retentionDays=S.retentionDays;
  const n=b.tickets_upsert.length+b.tickets_delete.length+b.users_upsert.length+(b.backlog!==undefined)+(b.seq!==undefined)+(b.retentionDays!==undefined);
  return {batch:b,cur,n};
 }

 /* Page load: use the server's data. A brand-new (empty) server gets this
    browser's demo data once. Returns the state to use, or null to keep the local one. */
 async function bootstrap(local){
  try{
   let s=await call('/state',null,BOOT_TIMEOUT);
   if(!s.initialized){
    try{
     const r=await call('/state/seed',{method:'POST',body:j(strip(local))},BOOT_TIMEOUT);
     revision=r.revision;snap=snapshot(local);setStatus('online');return null;
    }catch(e){if(e.status!==409)throw e;s=await call('/state',null,BOOT_TIMEOUT)} // someone seeded first
   }
   revision=s.revision;const st=strip(s);snap=snapshot(st);setStatus('online');return st;
  }catch(e){
   console.warn('[OpsDesk] server not reachable, running on local browser data',e);
   snap=null;setStatus('local');return null;
  }
 }

 async function flush(){
  if(!snap)return;
  if(busy){again=true;return}
  const d=diff();
  if(!d.n||rejected===j(d.batch))return;
  busy=true;
  try{
   const r=await call('/sync',{method:'POST',body:j(d.batch)});
   const expected=revision+1;revision=r.revision;snap=d.cur;rejected='';
   if(r.revision!==expected)needPull=true; // another client wrote in between: fetch their changes too
   setStatus('online');
  }catch(e){
   if(isHttp(e)&&e.status<500&&e.status!==408&&e.status!==429){
    rejected=j(d.batch);console.error('[OpsDesk] server rejected the changes ('+e.status+')',e.detail);setStatus('error');
   }else setStatus('offline');
  }finally{busy=false}
  if(again){again=false;flush()}else if(needPull)tick();
 }

 function changed(){if(!snap)return;clearTimeout(timer);timer=setTimeout(flush,PUSH_MS)}

 async function tick(){
  if(!snap||busy)return;
  try{
   if(diff().n){await flush();return}
   const r=await call('/revision');
   if(status!=='online')setStatus('online');
   if(r.revision!==revision||needPull){
    const s=await call('/state');
    if(diff().n)return; // user edited while we were fetching: push first, pull on the next tick
    needPull=false;revision=s.revision;const st=strip(s);snap=snapshot(st);cb.adopt(st);
   }
  }catch(e){setStatus(isHttp(e)&&e.status<500?'error':'offline')}
 }

 /* Another browser tab of this app already has this state (and is pushing it). */
 function markSynced(S){if(snap&&status==='online')snap=snapshot(S)}

 async function start(callbacks,local){
  cb=Object.assign(cb,callbacks);
  const st=await bootstrap(local);
  if(snap)setInterval(tick,POLL_MS);
  return st;
 }

 /* Closing the tab inside the 250 ms window: send what is left. */
 addEventListener('pagehide',()=>{
  if(!snap||status!=='online')return;
  const d=diff();
  if(d.n&&navigator.sendBeacon){try{navigator.sendBeacon(API+'/sync',new Blob([j(d.batch)],{type:'application/json'}))}catch(e){}}
 });

 return {start,changed,markSynced,status:()=>status};
})();
