
'use strict';
/* ============================================================
   OpsDesk · TBO — single-file MVP (HTML + CSS + JS)
   Persistence: localStorage (demo). Production plan: see Architecture page.
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const H=3600000,M=60000,now=()=>Date.now();
const uid=()=>Math.random().toString(36).slice(2,9);
const pad=n=>String(Math.floor(n)).padStart(2,'0');
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- icons (Fluent-style strokes) ---------- */
const ICONS={
dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.8"/><rect x="14" y="3" width="7" height="5" rx="1.8"/><rect x="14" y="12" width="7" height="9" rx="1.8"/><rect x="3" y="16" width="7" height="5" rx="1.8"/>',
inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
tag:'<path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
alert:'<path d="M12 3l9.5 16.5h-19z"/><path d="M12 10v4M12 17.3v.2"/>',
bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0 0 12 3z"/>',
db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
send:'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
plane:'<path d="M2 14l20-9-6 16-4-7z"/><path d="M12 14l10-9"/>',
chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
flag:'<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
spark:'<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
route:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
inboxempty:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 14h5l1.5 2h5l1.5-2h5"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
refresh:'<path d="M20 11a8 8 0 0 0-14.5-4M4 5v4h4M4 13a8 8 0 0 0 14.5 4M20 19v-4h-4"/>',
trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
menu:'<path d="M4 6h16M4 12h10M4 18h16"/>'
};
const ic=(n,s=18)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||''}</svg>`;

/* ---------- domain constants ---------- */
const REGIONS=['North India','South India','Middle East','South-East Asia','Europe'];
const PRI=['Urgent','High','Medium','Low'];
const STAT=['New','Open','Pending','Escalated','Resolved','Closed'];
const INTENTS=[
 {id:'refund',name:'Refund / Cancellation',c:'#C4314B',kw:['refund','cancel','cancellation','money back','credit note','not received','reversal','not credited','penalty']},
 {id:'amendment',name:'Booking Amendment',c:'#0F6CBD',kw:['amend','amendment','date change','modify','change date','name change','reschedule','rebook']},
 {id:'voucher',name:'Voucher / Confirmation',c:'#6B4FBB',kw:['voucher','confirmation','pnr','ticket copy','not generated','e-ticket']},
 {id:'inventory',name:'Inventory & Rates Sync',c:'#038387',kw:['inventory','sync','rates','availability','stock','mismatch','not updating','sold out']},
 {id:'payment',name:'Payment / Credit Limit',c:'#9A6200',kw:['payment','debited','credit limit','wallet','gst','deposit','failed transaction','invoice']},
 {id:'special',name:'Special Request',c:'#C2417D',kw:['special request','wheelchair','meal','early check-in','late check-out','honeymoon','vegetarian','crib','adjacent rooms']},
 {id:'supplier',name:'Supplier Dispute',c:'#5B6B80',kw:['supplier','overbooked','walk-in','no-show','no show','vendor','hotel denied','alternate hotel']},
 {id:'general',name:'General Enquiry',c:'#7587A1',kw:[]}
];
const THEMES=[
 {id:'refund-delay',name:'Refund delay',kw:['refund','money back','not received','not credited','reversal']},
 {id:'inventory-sync',name:'Inventory sync',kw:['inventory','sync','rates','mismatch','not updating']},
 {id:'special-request',name:'Special request',kw:['special request','wheelchair','meal','early check-in','late check-out','vegetarian']},
 {id:'payment-failure',name:'Payment failure',kw:['debited','payment failed','failed transaction']},
 {id:'voucher-error',name:'Voucher error',kw:['voucher','not generated','confirmation']},
 {id:'supplier-delay',name:'Supplier delay',kw:['supplier','not responding','overbooked']},
 {id:'platform-bug',name:'Platform bug',kw:['error 500','bug','crash','not loading','timeout']}
];
const AGENCIES=[
 {id:'a1',name:'Skyline Travels',region:'North India'},
 {id:'a2',name:'Gulf Wings Tours',region:'Middle East'},
 {id:'a3',name:'Coastal Holidays',region:'South India'},
 {id:'a4',name:'Euro Escapes',region:'Europe'},
 {id:'a5',name:'Lion City Voyages',region:'South-East Asia'}
];
const USERS=[
 {id:'u1',name:'Riya Sharma',role:'Agent',regions:['North India','Middle East'],rank:3,shift:[9,24],available:true,color:'#0F6CBD'},
 {id:'u2',name:'Arjun Nair',role:'Agent',regions:['South India','South-East Asia'],rank:2,shift:[8,24],available:true,color:'#038387'},
 {id:'u3',name:'Meera Iyer',role:'Agent',regions:['Europe','Middle East'],rank:3,shift:[10,24],available:true,color:'#6B4FBB'},
 {id:'u4',name:'Sana Khan',role:'Agent',regions:['North India','South India'],rank:1,shift:[9,22],available:true,color:'#C2417D'},
 {id:'e1',name:'Vikram Rao',role:'Escalation Manager',regions:REGIONS,rank:4,shift:[0,24],available:true,color:'#C4314B'},
 {id:'e2',name:'Neha Kapoor',role:'Escalation Manager',regions:REGIONS,rank:4,shift:[0,24],available:true,color:'#9A6200'},
 {id:'e3',name:'Prakash',role:'Escalation Manager',regions:REGIONS,rank:4,shift:[0,24],available:true,color:'#6B4FBB'},
 {id:'e4',name:'Vivek',role:'Escalation Manager',regions:REGIONS,rank:4,shift:[0,24],available:true,color:'#0F6CBD'},
 {id:'l1',name:'Anita Desai',role:'Lead',regions:REGIONS,rank:5,shift:[0,24],available:true,color:'#115EA3'},
 {id:'r1',name:'Skyline Travels',role:'Requester',agencyId:'a1',color:'#2B88D8'},
 {id:'r2',name:'Gulf Wings Tours',role:'Requester',agencyId:'a2',color:'#038387'},
 {id:'r3',name:'Coastal Holidays',role:'Requester',agencyId:'a3',color:'#6B4FBB'}
];
const CONTACTS=[
 {name:'Hotel Atlantis Reservations',email:'res@atlantis.demo',org:'Atlantis',type:'Supplier'},
 {name:'Marriott Channel Desk',email:'channel@marriott.demo',org:'Marriott',type:'Supplier'},
 {name:'Airline Refunds Cell',email:'refunds@airline.demo',org:'Airline',type:'Supplier'},
 {name:'Dubai Desert DMC',email:'ops@desertdmc.demo',org:'Desert DMC',type:'Supplier'},
 {name:'TBO Finance Reconciliation',email:'finance@tbo.demo',org:'TBO',type:'Internal'}
];
const intentOf=id=>INTENTS.find(i=>i.id===id)||INTENTS[7];
const intentName=id=>intentOf(id).name;
const AG=id=>AGENCIES.find(a=>a.id===id)||{name:'Unknown',region:''};
const initials=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();

/* ---------- rules: intent suggestion + themes ---------- */
function suggestIntent(text){
 const s=String(text||'').toLowerCase(); let best=null,tot=0;
 INTENTS.forEach(i=>{let sc=0;i.kw.forEach(k=>{if(s.includes(k))sc+=k.includes(' ')?2:1});tot+=sc;if(sc>0&&(!best||sc>best.sc))best={i,sc}});
 if(!best)return null;
 return {intent:best.i,conf:Math.min(96,Math.round(40+55*best.sc/Math.max(tot,1)+Math.min(best.sc,3)*2))};
}
function autoThemes(text){const s=String(text||'').toLowerCase();return THEMES.filter(t=>t.kw.some(k=>s.includes(k))).map(t=>t.id)}

/* ---------- time helpers ---------- */
function fmtDur(ms){const a=Math.abs(ms),d=Math.floor(a/86400000),h=Math.floor(a%86400000/H),m=Math.floor(a%H/M);return d?d+'d '+h+'h':h?h+'h '+m+'m':m+'m'}
const fmtDate=ts=>ts?new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
const toLocalInput=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())};
const ago=ts=>{const d=now()-ts;return d<M?'just now':fmtDur(d)+' ago'};

/* ---------- state + persistence ---------- */
const KEY='opsdesk.v1.state';
let S=load();
// Keep demo accounts current when an older localStorage snapshot already exists.
[USERS.find(u=>u.id==='e3'),USERS.find(u=>u.id==='e4')].forEach(u=>{
 if(u && !S.users.some(x=>x.id===u.id)) S.users.push(clone(u));
});
try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
function load(){
 try{const r=localStorage.getItem(KEY);if(r){const s=JSON.parse(r);if(s&&s.v===1)return s}}catch(e){}
 const s=seed();try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}return s;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Storage nearly full — export and archive old tickets','err')}}
function tl(t,type,text,by,ts){t.timeline.push({ts:ts||now(),type,text,by:by||'System'})}
const U=id=>S.users.find(u=>u.id===id);
const nameOf=id=>id?(U(id)||{name:'—'}).name:'Unassigned';
const isDone=t=>t.status==='Resolved'||t.status==='Closed';
const loadOf=id=>S.tickets.filter(t=>t.assigneeId===id&&!isDone(t)).length;

function seed(){
 const n=now();let seq=1000;const users=clone(USERS);const tickets=[];
 const gu=id=>users.find(u=>u.id===id);
 const mk=o=>{
  const id='TKT-'+(++seq),created=n-(o.ago||0)*M,ag=AGENCIES.find(a=>a.id===o.ag);
  const desc=o.desc||(o.title+'. Please check on priority and update us.');
  const t={id,title:o.title,description:desc,agencyId:o.ag,tboh:o.tboh||'',priority:o.pri,intent:o.intent,region:ag.region,status:o.status,
   assigneeId:o.as||null,prevAssigneeId:o.prev||null,checkin:o.ci!=null?n+o.ci*H:null,lcd:o.lcd!=null?n+o.lcd*H:null,holiday:!!o.hol,
   themes:o.th||autoThemes(o.title),product:o.prod||'',created,updated:created,routing:o.route?{reason:o.route,ts:created,by:'System'}:null,
   comments:[{id:uid(),ts:created,by:ag.name,type:'external',from:'agency',text:desc}],side:o.side||[],timeline:[],escal:o.escal||[]};
  (o.cm||[]).forEach(c=>t.comments.push({id:uid(),ts:created+c[0]*M,by:c[1],type:c[2],from:'staff',text:c[3]}));
  tl(t,'created','Ticket created by '+ag.name+' · intent classified: '+intentName(o.intent),ag.name,created);
  if(o.as&&!o.prev)tl(t,'assign','Assigned to '+gu(o.as).name+(o.route?' · '+o.route:''),'System',created+2*M);
  (o.tl||[]).forEach(e=>tl(t,e[1],e[2],e[3]||'System',created+e[0]*M));
  t.updated=Math.max.apply(null,t.timeline.map(e=>e.ts));tickets.push(t);return t;
 };
 const D=1440;
 mk({ag:'a1',title:'Refund of ₹48,200 not received for cancelled booking',pri:'High',intent:'refund',status:'Closed',tboh:'TBOH-882145',as:'u1',ago:9*D,route:'Region North India · on shift · senior rank',
  tl:[[40,'status','Status New → Open','Riya Sharma'],[3000,'status','Status Open → Resolved','Riya Sharma'],[4300,'status','Status Resolved → Closed','System']],th:['refund-delay'],
  cm:[[45,'Riya Sharma','external','Refund initiated with supplier. Expected in 5 working days.']]});
 mk({ag:'a1',title:'Refund still pending after 7 working days',pri:'High',intent:'refund',status:'Closed',tboh:'TBOH-882145',as:'u1',ago:5*D,route:'Region North India · on shift · senior rank',
  tl:[[30,'status','Status New → Open','Riya Sharma'],[2500,'status','Status Open → Resolved','Riya Sharma'],[3500,'status','Status Resolved → Closed','System']],th:['refund-delay'],
  cm:[[40,'Riya Sharma','internal','Supplier says credit note was issued but not reconciled by Finance.'],[60,'Riya Sharma','external','Escalated to supplier finance desk. Will confirm shortly.']]});
 mk({ag:'a1',title:'Refund STILL not credited — third follow-up',pri:'High',intent:'refund',status:'Open',tboh:'TBOH-882145',as:'u1',ago:195,route:'Region North India · on shift 09–24 · senior rank for High',
  desc:'This is our third message about the same refund of ₹48,200 for the cancelled booking. Amount still not received, please resolve urgently.',
  tl:[[3,'link','Linked automatically to 2 earlier tickets · Same TBOH, Same agency + intent']],th:['refund-delay']});
 mk({ag:'a2',title:'Hotel voucher not generated — guests land tomorrow',pri:'Urgent',intent:'voucher',status:'Open',tboh:'TBOH-771203',as:'u3',ago:180,ci:20,
  route:'Region Middle East · on shift 10–24 · senior rank for Urgent',desc:'Voucher not generated for 4 guests arriving tomorrow morning. Hotel is asking for voucher at check-in.',
  cm:[[20,'Meera Iyer','internal','Pinged supplier channel desk, waiting on confirmation code.']],th:['voucher-error']});
 mk({ag:'a3',title:'Date change request — check-in in 6 hours',pri:'Urgent',intent:'amendment',status:'Escalated',tboh:'TBOH-660912',as:'e1',prev:'u2',ago:300,ci:6,
  desc:'Group wants to move check-in by one day. Supplier is not responding and guests are already travelling.',
  tl:[[2,'assign','Assigned to Arjun Nair · Region South India · on shift','System'],[240,'alert','Escalated to Vikram Rao (Escalation Manager) — supplier unresponsive, check-in in 6h','Arjun Nair']],
  escal:[{ts:n-60*M,fromId:'u2',toId:'e1',reason:'Supplier unresponsive, check-in in 6h'}],th:['supplier-delay']});
 mk({ag:'a4',title:'Inventory mismatch on Prague hotel block',pri:'Medium',intent:'inventory',status:'New',ago:40,th:['inventory-sync'],
  desc:'Rates and availability shown on TBO do not match our contract for the Prague block. Please check inventory sync.'});
 mk({ag:'a5',title:'Wheelchair access + early check-in request',pri:'High',intent:'special',status:'Open',as:'u2',ago:50,ci:30,route:'Region South-East Asia · on shift · rank ≥2 for High',th:['special-request']});
 mk({ag:'a1',title:'Amount debited but booking not confirmed',pri:'High',intent:'payment',status:'Pending',tboh:'TBOH-882901',as:'u4',ago:360,route:'Region North India · on shift',th:['payment-failure']});
 const sc1={id:'sc1',subject:'Room allocation — Atlantis The Palm',kind:'Supplier',ownerId:'u1',
  recipients:[{name:'Hotel Atlantis Reservations',email:'res@atlantis.demo',org:'Atlantis',type:'Supplier'},{name:'Gulf Wings — Ops Desk',email:'ops@gulfwings.demo',org:'Gulf Wings Tours',type:'Agency'}],
  msgs:[{ts:n-95*M,by:'Meera Iyer',text:'Please confirm 4 sea-view rooms for tomorrow. Original booking overbooked on your side?'},{ts:n-80*M,by:'Hotel Atlantis Reservations',text:'3 rooms confirmed. 4th room waitlisted — can offer a garden-view alternate.'}]};
 mk({ag:'a2',title:'Hotel overbooked — supplier offering alternate',pri:'High',intent:'supplier',status:'Open',tboh:'TBOH-771888',as:'u1',prev:'u3',ago:100,lcd:20,side:[sc1],
  tl:[[2,'assign','Assigned to Meera Iyer · Region Middle East · on shift','System'],[60,'assign','Transferred Meera Iyer → Riya Sharma · Meera moved to Europe peak queue','Anita Desai'],[60,'side','Side-conversation recipients preserved on transfer (2 on "Room allocation — Atlantis The Palm")','System']],
  route:'Manual transfer by Lead',th:['supplier-delay']});
 mk({ag:'a4',title:'Refund before LCD — penalty applies tomorrow',pri:'Urgent',intent:'refund',status:'Escalated',tboh:'TBOH-550321',as:'e2',prev:'u3',ago:220,lcd:10,
  tl:[[2,'assign','Assigned to Meera Iyer · Region Europe · on shift','System'],[180,'alert','Escalated to Neha Kapoor (Escalation Manager) — LCD tomorrow, refund pending approval','Meera Iyer']],
  escal:[{ts:n-40*M,fromId:'u3',toId:'e2',reason:'LCD tomorrow, refund pending approval'}],th:['refund-delay']});
 mk({ag:'a3',title:'GST invoice copy required',pri:'Low',intent:'payment',status:'Resolved',as:'u2',ago:30*60,route:'Region South India',th:[]});
 mk({ag:'a1',title:'Cancellation not reflecting in portal',pri:'Medium',intent:'refund',status:'New',tboh:'TBOH-883310',ago:25,th:['refund-delay']});
 mk({ag:'a5',title:'Hotel rates not updating after supplier sync',pri:'Medium',intent:'inventory',status:'Open',as:'u2',ago:2*D,route:'Region South-East Asia',th:['inventory-sync']});
 mk({ag:'a3',title:'Vegetarian meal request for tour group',pri:'Low',intent:'special',status:'Open',as:'u4',ago:700,ci:90,route:'Region South India',th:['special-request']});
 mk({ag:'a4',title:'Booking page error 500 on amendment',pri:'Medium',intent:'amendment',status:'Open',as:'u3',ago:1500,prod:'BUG-2291',route:'Region Europe',th:['platform-bug']});
 mk({ag:'a2',title:'Refund delay on cancelled Dubai package',pri:'High',intent:'refund',status:'Open',tboh:'TBOH-771950',as:'u1',ago:2200,route:'Region Middle East',th:['refund-delay']});
 mk({ag:'a5',title:'Rates mismatch for Bangkok hotels',pri:'Medium',intent:'inventory',status:'Resolved',as:'u2',ago:3*D,route:'Region South-East Asia',th:['inventory-sync']});
 return {v:1,users,tickets,archive:[],backlog:[],seq,retentionDays:90};
}

/* ---------- engines ---------- */
function sla(t){
 if(isDone(t))return {state:'done',label:'Met',win:0,left:0,pct:1,driver:['Ticket closed']};
 const base={Urgent:2,High:4,Medium:8,Low:24}[t.priority];let w=base;const drv=['Priority '+t.priority+' → '+base+'h base window'];
 [['Check-in',t.checkin],['LCD',t.lcd]].forEach(([n,ts])=>{
  if(!ts)return;const h=(ts-now())/H;let c=null;if(h<=12)c=1;else if(h<=24)c=2;else if(h<=72)c=4;
  if(c!=null&&c<w){w=c;drv.push(n+(h<0?' passed':' in '+fmtDur(ts-now()))+' → tightened to '+c+'h')}
 });
 if(t.holiday){w*=1.5;drv.push('Regional holiday flag → ×1.5')}
 const due=t.created+w*H,left=due-now(),pct=left/(w*H);
 const state=left<0?'breached':pct<=0.25?'risk':'ok';
 return {state,label:state==='breached'?'Breached':state==='risk'?'At risk':'On track',win:w,due,left,pct,driver:drv};
}
const slaRank={breached:0,risk:1,ok:2,done:3};
const byUrgency=(a,b)=>{const sa=sla(a),sb=sla(b);return slaRank[sa.state]-slaRank[sb.state]||PRI.indexOf(a.priority)-PRI.indexOf(b.priority)||a.created-b.created};

function routeTicket(t,by){
 const d=new Date(),hr=d.getHours()+d.getMinutes()/60,pr={Urgent:3,High:2,Medium:1,Low:0}[t.priority];
 const cands=S.users.filter(u=>u.role==='Agent'&&u.available).map(u=>{
  let sc=0;const why=[];
  if(u.regions.includes(t.region)){sc+=40;why.push('region '+t.region)}else why.push('no regional owner');
  if(hr>=u.shift[0]&&hr<u.shift[1]){sc+=20;why.push('on shift '+pad(u.shift[0])+'–'+pad(u.shift[1]))}else why.push('off shift');
  if(pr>=3){if(u.rank>=3){sc+=25;why.push('senior rank for Urgent')}}
  else if(pr===2){if(u.rank>=2){sc+=18;why.push('rank ≥2 for High')}}
  else if(u.rank<=2){sc+=8;why.push('keeps seniors free')}
  const l=loadOf(u.id);sc-=l*4;why.push('load '+l);
  return {u,sc,why};
 }).sort((a,b)=>b.sc-a.sc);
 if(!cands.length){t.routing={reason:'No available agent → stays in Triage',ts:now(),by:by||'System'};tl(t,'route','Routing: no available agent — left in Triage',by);return null}
 const b=cands[0];
 setOwner(t,b.u.id,b.why.join(' · ')+' · score '+Math.round(b.sc)+' of '+cands.length+' candidate(s)',by||'System');
 return b.u;
}
function setOwner(t,uidv,why,by){
 const old=t.assigneeId?U(t.assigneeId):null,nu=uidv?U(uidv):null;
 t.assigneeId=nu?nu.id:null;
 if(nu&&t.status==='New')t.status='Open';
 if(!nu&&t.status==='Open')t.status='New';
 t.routing={reason:why,ts:now(),by};
 const m=!old&&nu?'Assigned to '+nu.name:old&&nu?'Transferred '+old.name+' → '+nu.name:old&&!nu?'Unassigned (was '+old.name+')':'';
 tl(t,'assign',m+' · '+why,by);
 if(old&&nu&&t.side.length){
  t.side.forEach(s=>s.ownerId=nu.id);
  tl(t,'side','Side-conversation recipients preserved on transfer ('+t.side.map(s=>s.recipients.length+' on "'+s.subject+'"').join(', ')+')','System');
 }
 t.updated=now();
}
function escalate(t,emId,reason,by){
 const em=U(emId);t.prevAssigneeId=t.assigneeId;t.assigneeId=emId;t.status='Escalated';
 t.escal.push({ts:now(),fromId:t.prevAssigneeId,toId:emId,reason});
 t.routing={reason:'Escalated to '+em.name+' · '+reason,ts:now(),by};
 tl(t,'alert','Escalated to '+em.name+' (Escalation Manager) — '+reason,by);t.updated=now();
}
const allT=()=>S.tickets.concat(S.archive);
function linksOf(t){
 return allT().filter(o=>o.id!==t.id).map(o=>{
  const r=[];if(t.tboh&&o.tboh===t.tboh)r.push('Same TBOH');
  if(o.agencyId===t.agencyId&&o.intent===t.intent)r.push('Same agency + intent');
  return {t:o,reasons:r};
 }).filter(x=>x.reasons.length).sort((a,b)=>b.t.created-a.t.created);
}

/* ---------- session / permissions ---------- */
let ME=null;
try{const id=sessionStorage.getItem('opsdesk.me');if(id)ME=S.users.find(u=>u.id===id)||null}catch(e){}
const canSee=t=>ME&&(ME.role==='Requester'?t.agencyId===ME.agencyId:true);
const staff=()=>ME&&ME.role!=='Requester';
const scope=()=>S.tickets.filter(canSee);
const find=id=>S.tickets.find(t=>t.id===id)||S.archive.find(t=>t.id===id);

/* ---------- UI state ---------- */
const UI={collapsed:(()=>{try{return localStorage.getItem('opsdesk.col')==='1'}catch(e){return false}})(),view:'dashboard',loading:false,q:'',region:'All',intent:'All',tab:'conv',open:null,modal:null,theme:null,mode:'external',draft:'',anim:false,prefill:null,
 dq:{page:0,size:25,status:'All',region:'All',intent:'All',archived:false},newSide:false};
const NAV=[
 {sec:'Workspace'},
 {id:'dashboard',label:'Dashboard',icon:'dashboard',roles:['Agent','Escalation Manager','Lead','Requester']},
 {id:'triage',label:'Triage',icon:'inbox',roles:['Agent','Lead'],badge:'triage'},
 {id:'myqueue',label:'My Queue',alt:'My Tickets',icon:'user',roles:['Agent','Lead','Requester'],badge:'my'},
 {id:'region',label:'By Region',icon:'globe',roles:['Agent','Lead']},
 {id:'intent',label:'By Intent',icon:'tag',roles:['Agent','Lead']},
 {id:'linked',label:'Linked Cases',icon:'link',roles:['Agent','Escalation Manager','Lead']},
 {id:'escalations',label:'Escalations',icon:'alert',roles:['Escalation Manager','Lead'],badge:'esc'},
 {sec:'Intelligence',not:['Requester','Agent']},
 {id:'insights',label:'Insights',icon:'bulb',roles:['Lead','Escalation Manager']},
 {id:'data',label:'Data & Export',icon:'db',roles:['Lead']},
 {id:'team',label:'Team & Routing',icon:'users',roles:['Lead']},
 {sec:'Project'},
 {id:'guide',label:'Demo Guide',icon:'compass',roles:['Agent','Escalation Manager','Lead','Requester']},
 {id:'arch',label:'Architecture',icon:'layers',roles:['Agent','Escalation Manager','Lead']}
];
const NAVC={dashboard:'#0F6CBD',triage:'#6B4FBB',myqueue:'#038387',region:'#2B88D8',intent:'#C2417D',linked:'#2E9E2E',escalations:'#E0405A',insights:'#F7A600',data:'#115EA3',team:'#8764B8',guide:'#00A4EF',arch:'#498205'};
const TITLES={dashboard:'Dashboard',triage:'Triage · Unassigned',myqueue:'My Queue',region:'Queue by Region',intent:'Queue by Intent',linked:'Linked Cases',escalations:'Escalation Queue',insights:'Insights · Feedback Loop',data:'Data & Export',team:'Team & Routing',guide:'Demo Guide',arch:'Architecture & Cost'};

/* ---------- small UI helpers ---------- */
function toast(m,k){const e=document.createElement('div');e.className='toast '+(k||'');e.textContent=m;$('#toasts').appendChild(e);setTimeout(()=>e.remove(),4200)}
const priPill=p=>`<span class="pill p-${p}">${esc(p)}</span>`;
const statPill=s=>`<span class="pill s-${s}">${esc(s)}</span>`;
function slaPill(t){const s=sla(t);if(s.state==='done')return `<span class="pill sla-done">${ic('check',13)}Met</span>`;
 return `<span class="pill sla-${s.state}">${ic('clock',13)}${s.state==='breached'?'Breached '+fmtDur(-s.left):s.state==='risk'?'At risk · '+fmtDur(s.left):fmtDur(s.left)+' left'}</span>`}
const intentChip=id=>{const i=intentOf(id);return `<span class="chip" style="background:${i.c}18;color:${i.c}"><span class="dot" style="background:${i.c}"></span>${esc(i.name)}</span>`};
function travel(label,ts){if(!ts)return `<span class="sub">${label}: —</span>`;const h=(ts-now())/H;const c=h<24?'r':h<72?'a':'b';
 return `<span class="chip ${c}">${ic(label==='LCD'?'cal':'plane',13)}${label} ${h<0?'passed '+fmtDur(now()-ts)+' ago':'in '+fmtDur(ts-now())}</span>`}
function empty(icon,title,sub,btn){return `<div class="empty">${ic(icon,38)}<b>${esc(title)}</b><div>${esc(sub||'')}</div>${btn||''}</div>`}
const skeleton=()=>`<div class="grid g4">${'<div class="card"><div class="skel" style="width:60%"></div><div class="skel"></div></div>'.repeat(4)}</div><div class="card" style="margin-top:16px"><div class="skel"></div><div class="skel"></div><div class="skel" style="width:80%"></div><div class="skel"></div></div>`;
function applyQ(list){const q=UI.q.trim().toLowerCase();if(!q)return list;return list.filter(t=>(t.id+' '+t.title+' '+AG(t.agencyId).name+' '+t.tboh).toLowerCase().includes(q))}
function ownerCell(t){const u=t.assigneeId?U(t.assigneeId):null;return u?`<div class="row" style="gap:8px"><span class="avatar" style="width:26px;height:26px;font-size:10.5px;background:${u.color}">${initials(u.name)}</span><span>${esc(u.name)}</span></div>`:`<span class="chip a">Unassigned</span>`}
function table(list){
 if(!list.length)return empty('inboxempty','Nothing here','No tickets match this view right now.');
 return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ticket</th><th>Intent</th><th>Priority</th><th>Status</th><th>Region</th><th>Owner</th><th>SLA</th></tr></thead><tbody>${
 list.map(t=>`<tr data-act="open" data-id="${t.id}"><td><div class="tt">${esc(t.title)}</div><div class="sub">${t.id} · ${esc(AG(t.agencyId).name)}${t.tboh?' · '+esc(t.tboh):''}</div></td><td>${intentChip(t.intent)}</td><td>${priPill(t.priority)}</td><td>${statPill(t.status)}</td><td>${esc(t.region)}</td><td>${ownerCell(t)}</td><td>${slaPill(t)}</td></tr>`).join('')}</tbody></table></div>`;
}
const filt=(items,key,cur,all)=>`<div class="row" style="margin-bottom:14px">${['All'].concat(items).map(x=>{const label=x==='All'?'All':(key==='intent'?intentName(x):x);const n=x==='All'?all.length:all.filter(t=>(key==='intent'?t.intent:t.region)===x).length;return `<button class="fchip ${cur===x?'on':''}" data-act="filter" data-k="${key}" data-v="${esc(x)}">${esc(label)}<small>${n}</small></button>`}).join('')}</div>`;

/* ============================== VIEWS ============================== */
function donut(parts){const C=2*Math.PI*42,tot=parts.reduce((a,p)=>a+p.v,0)||1;let off=0;
 return `<svg width="150" height="150" viewBox="0 0 110 110"><circle cx="55" cy="55" r="42" fill="none" stroke="#EEF2F8" stroke-width="14"/>${parts.map(p=>{const len=C*p.v/tot;const el=`<circle cx="55" cy="55" r="42" fill="none" stroke="${p.c}" stroke-width="14" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 55 55)"/>`;off+=len;return el}).join('')}<text x="55" y="52" text-anchor="middle" font-size="20" font-weight="700" fill="#1F2D45">${tot}</text><text x="55" y="67" text-anchor="middle" font-size="9" fill="#7587A1">open</text></svg>`}
const brow=(l,v,max,c)=>`<div class="brow"><span>${esc(l)}</span><div class="bar"><i style="width:${max?Math.round(100*v/max):0}%;background:${c}"></i></div><b>${v}</b></div>`;
function kpi(ico,bg,fg,val,label,act){const K={'#9A6200':'#F7A600','#C4314B':'#E0405A','#107C10':'#2E9E2E'};return `<div class="card kpi" style="--k:${K[fg]||fg};--kb:${bg};${act?'cursor:pointer':''}" ${act?`data-act="nav" data-v="${act}"`:''}><div class="ico">${ic(ico,24)}</div><div><b>${val}</b><small>${label}</small></div></div>`}
const greet=()=>{const h=new Date().getHours();return h<12?'morning':h<17?'afternoon':'evening'};
function hero(open,sl){const c=k=>sl.filter(s=>s.state===k).length;
 return `<div class="hero"><div><span class="chip" style="background:rgba(255,255,255,.22);color:#fff">${ic('spark',13)} OpsDesk Premium</span><h2 title="Personalized for the signed-in demo user">Good ${greet()}, ${esc(ME.name.split(' ')[0])}</h2><p>${open.length} open cases · ${c('breached')} breached · ${c('risk')} at risk. Everything is linked, routed and travel-aware.</p><div class="row"><button class="btn" data-act="newTicket">${ic('plus',16)}New ticket</button>${staff()?`<button class="btn g2" data-act="nav" data-v="triage">${ic('inbox',16)}Open triage</button>`:''}</div></div>
 <div class="hero-3d"><div class="hc c1"><small>Open cases</small><b>${open.length}</b></div><div class="hc c2"><small>SLA at risk</small><b>${c('risk')}</b></div><div class="hc c3"><small>Breached</small><b>${c('breached')}</b></div></div></div>`}

function viewDashboard(){
 const all=scope(),open=all.filter(t=>!isDone(t)),sl=open.map(sla),c=k=>sl.filter(s=>s.state===k).length;
 if(ME.role==='Requester'){
  const mine=all.slice().sort((a,b)=>b.updated-a.updated);
  return hero(open,sl)+`<div class="grid g4">${kpi('inbox','#EBF3FC','#0F6CBD',open.length,'Open tickets')}${kpi('clock','#FFF4DB','#9A6200',all.filter(t=>t.status==='Pending').length,'Awaiting your reply')}${kpi('check','#E7F5E7','#107C10',all.filter(isDone).length,'Resolved / closed')}${kpi('chat','#F1ECFB','#6B4FBB',all.length,'Total tickets')}</div>
  <div class="row" style="margin:22px 0 12px"><h3 style="margin:0">Your recent tickets</h3><span class="sp"></span><button class="btn pri" data-act="newTicket">${ic('plus')}New ticket</button></div>${table(mine.slice(0,10))}`;
 }
 const act=all.flatMap(t=>t.timeline.map(e=>({...e,tid:t.id,title:t.title}))).sort((a,b)=>b.ts-a.ts).slice(0,8);
 const stCount=STAT.map(s=>[s,all.filter(t=>t.status===s).length]);const mx=Math.max(1,...stCount.map(x=>x[1]));
 const stCol={New:'#6B4FBB',Open:'#0F6CBD',Pending:'#C98A00',Escalated:'#C4314B',Resolved:'#107C10',Closed:'#9AA8BD'};
 const rg=REGIONS.map(r=>[r,open.filter(t=>t.region===r).length]);const mr=Math.max(1,...rg.map(x=>x[1]));
 const attn=open.slice().sort(byUrgency).filter(t=>sla(t).state!=='ok').slice(0,6);
 return hero(open,sl)+`<div class="grid g6">
  ${kpi('inbox','#EBF3FC','#0F6CBD',open.length,'Open tickets','triage')}
  ${kpi('inboxempty','#F1ECFB','#6B4FBB',open.filter(t=>!t.assigneeId).length,'Unassigned','triage')}
  ${kpi('clock','#FFF4DB','#9A6200',c('risk'),'SLA at risk')}
  ${kpi('alert','#FDECEF','#C4314B',c('breached'),'SLA breached')}
  ${kpi('flag','#FDECEF','#C4314B',open.filter(t=>t.status==='Escalated').length,'Escalated','escalations')}
  ${kpi('link','#E3F5F5','#038387',new Set(open.filter(t=>t.tboh&&all.filter(o=>o.tboh===t.tboh).length>1).map(t=>t.tboh)).size,'Repeat TBOH cases','linked')}
 </div>
 <div class="grid g21" style="margin-top:16px">
  <div class="card"><h3>${ic('alert')}Needs attention now</h3>${attn.length?table(attn):empty('check','All clear','No ticket is at risk or breached.')}</div>
  <div class="card"><h3>${ic('shield')}SLA health</h3><div class="row" style="justify-content:center;gap:22px">${donut([{v:c('ok'),c:'#107C10'},{v:c('risk'),c:'#E0A100'},{v:c('breached'),c:'#C4314B'}])}<div>
   <div><span class="dot" style="background:#107C10"></span> On track <b>${c('ok')}</b></div><div style="margin:6px 0"><span class="dot" style="background:#E0A100"></span> At risk <b>${c('risk')}</b></div><div><span class="dot" style="background:#C4314B"></span> Breached <b>${c('breached')}</b></div></div></div>
   <p class="sub" style="margin-bottom:0">Windows tighten as check-in / LCD approaches — not a one-size-fits-all clock.</p></div>
 </div>
 <div class="grid g3" style="margin-top:16px">
  <div class="card"><h3>${ic('flag')}By status</h3>${stCount.map(([s,v])=>brow(s,v,mx,stCol[s])).join('')}</div>
  <div class="card"><h3>${ic('globe')}Open by region</h3>${rg.map(([s,v])=>brow(s,v,mr,'#2B88D8')).join('')}</div>
  <div class="card"><h3>${ic('history')}Live activity</h3>${act.map(e=>`<div class="tlr" style="cursor:pointer" data-act="open" data-id="${e.tid}"><div class="ti ${e.type}">${ic(tlIcon(e.type),15)}</div><div><div style="font-size:13px">${esc(e.text.length>90?e.text.slice(0,90)+'…':e.text)}</div><div class="sub">${e.tid} · ${ago(e.ts)}</div></div></div>`).join('')}</div>
 </div>`;
}
const tlIcon=t=>({created:'plus',assign:'user',status:'flag',link:'link',alert:'alert',side:'chat',note:'lock',route:'route'}[t]||'clock');

function viewTriage(){
 const list=applyQ(scope().filter(t=>!t.assigneeId&&!isDone(t))).sort(byUrgency);
 const agents=S.users.filter(u=>u.role==='Agent');
 return `<div class="row" style="margin-bottom:14px"><div class="hint">${ic('route')}Auto-route scores region · time window · rank/priority · availability · load</div><span class="sp"></span><button class="btn pri" data-act="routeAll" ${list.length?'':'disabled'}>${ic('spark')}Auto-route all (${list.length})</button></div>
 ${list.length?`<div class="grid">${list.map(t=>`<div class="card"><div class="row"><div style="flex:1;min-width:240px"><div class="tt" style="cursor:pointer" data-act="open" data-id="${t.id}">${esc(t.title)}</div><div class="sub">${t.id} · ${esc(AG(t.agencyId).name)} · ${esc(t.region)}${t.tboh?' · '+esc(t.tboh):''}</div></div>${intentChip(t.intent)}${priPill(t.priority)}${slaPill(t)}
  <select class="sel" data-chg="assignQuick" data-id="${t.id}"><option value="">Assign manually…</option>${agents.map(u=>`<option value="${u.id}" ${u.available?'':'disabled'}>${esc(u.name)} · ${esc(u.regions.join('/'))}${u.available?'':' (away)'}</option>`).join('')}</select>
  <button class="btn" data-act="route" data-id="${t.id}">${ic('spark',16)}Auto-route</button></div></div>`).join('')}</div>`:empty('check','Triage is empty','Every open ticket has an owner. Create a new ticket to see routing in action.','<button class="btn pri" style="margin-top:12px" data-act="newTicket">'+ic('plus')+'New ticket</button>')}`;
}
function viewMyQueue(){
 const list=applyQ(ME.role==='Requester'?scope():S.tickets.filter(t=>t.assigneeId===ME.id&&!isDone(t))).sort(ME.role==='Requester'?(a,b)=>b.updated-a.updated:byUrgency);
 return `<div class="row" style="margin-bottom:14px"><span class="sub">${list.length} ticket(s)</span><span class="sp"></span><button class="btn pri" data-act="newTicket">${ic('plus')}New ticket</button></div>${table(list)}`;
}
function viewRegion(){const base=S.tickets.filter(t=>!isDone(t));const list=applyQ(base.filter(t=>UI.region==='All'||t.region===UI.region)).sort(byUrgency);return filt(REGIONS,'region',UI.region,base)+table(list)}
function viewIntent(){const base=S.tickets.filter(t=>!isDone(t));const list=applyQ(base.filter(t=>UI.intent==='All'||t.intent===UI.intent)).sort(byUrgency);return filt(INTENTS.map(i=>i.id),'intent',UI.intent,base)+table(list)}
function viewLinked(){
 const groups={};S.tickets.concat(S.archive).forEach(t=>{if(t.tboh)(groups[t.tboh]=groups[t.tboh]||[]).push(t)});
 const g=Object.entries(groups).filter(([k,v])=>v.length>1&&applyQ(v).length).sort((a,b)=>b[1].length-a[1].length);
 const rep={};S.tickets.forEach(t=>{const k=t.agencyId+'|'+t.intent;(rep[k]=rep[k]||[]).push(t)});
 const r=Object.entries(rep).filter(([k,v])=>v.length>1&&v.some(t=>!t.tboh||!g.find(x=>x[0]===t.tboh))).sort((a,b)=>b[1].length-a[1].length);
 return `<div class="hint" style="margin-bottom:16px">${ic('link')}Linkage is first-class: tickets auto-link by TBOH, and by agency + intent — no third-party app.</div>
 <h3 style="margin:0 0 10px">Same TBOH</h3>${g.length?`<div class="grid g2">${g.map(([k,v])=>{const s=v.slice().sort((a,b)=>a.created-b.created);return `<div class="card"><div class="row"><b style="font-size:16px">${esc(k)}</b><span class="chip r">${v.length} contacts</span><span class="sp"></span><span class="sub">${esc(AG(v[0].agencyId).name)}</span></div>
 ${s.map((t,i)=>`<div class="tlr" style="cursor:pointer" data-act="open" data-id="${t.id}"><div class="ti">${i+1}</div><div style="flex:1"><div class="tt" style="font-size:13.5px">${esc(t.title)}</div><div class="sub">${t.id} · ${fmtDate(t.created)}</div></div>${statPill(t.status)}</div>`).join('')}</div>`}).join('')}</div>`:empty('link','No linked TBOH cases','Create two tickets with the same TBOH to see linking.')}
 <h3 style="margin:24px 0 10px">Repeat intent by agency</h3>${r.length?`<div class="grid g2">${r.map(([k,v])=>`<div class="card"><div class="row"><b>${esc(AG(v[0].agencyId).name)}</b>${intentChip(v[0].intent)}<span class="chip">${v.length} tickets</span></div>${v.map(t=>`<div class="tlr" style="cursor:pointer" data-act="open" data-id="${t.id}"><div style="flex:1"><div style="font-size:13.5px;font-weight:600">${esc(t.title)}</div><div class="sub">${t.id} · ${fmtDate(t.created)}</div></div>${statPill(t.status)}</div>`).join('')}</div>`).join('')}</div>`:empty('link','Nothing yet','')}`;
}
function viewEscalations(){
 const list=applyQ(S.tickets.filter(t=>t.status==='Escalated')).sort(byUrgency);
 const mine=list.filter(t=>t.assigneeId===ME.id);
 return `<div class="hint" style="margin-bottom:14px">${ic('alert')}Escalation is a first-class action — it changes owner + queue and is logged on the timeline. ${ME.role==='Escalation Manager'?'<b>'+mine.length+' assigned to you.</b>':''}</div>
 ${list.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ticket</th><th>Escalated to</th><th>Reason</th><th>Check-in</th><th>LCD</th><th>SLA</th></tr></thead><tbody>${list.map(t=>{const e=t.escal[t.escal.length-1]||{};return `<tr data-act="open" data-id="${t.id}"><td><div class="tt">${esc(t.title)}</div><div class="sub">${t.id} · ${esc(AG(t.agencyId).name)} · ${priPill(t.priority)}</div></td><td>${ownerCell(t)}</td><td class="sub" style="max-width:260px">${esc(e.reason||'—')}<div>from ${esc(nameOf(e.fromId))}</div></td><td>${travel('Check-in',t.checkin)}</td><td>${travel('LCD',t.lcd)}</td><td>${slaPill(t)}</td></tr>`}).join('')}</tbody></table></div>`:empty('check','Escalation queue is empty','Escalate a ticket from its detail panel.')}`;
}
function viewInsights(){
 const wk=S.tickets.concat(S.archive).filter(t=>t.created>now()-7*86400000);
 const cnt=THEMES.map(th=>({th,list:wk.filter(t=>t.themes.includes(th.id))})).sort((a,b)=>b.list.length-a.list.length);
 const mx=Math.max(1,cnt[0].list.length);if(!UI.theme)UI.theme=cnt[0].th.id;
 const cur=cnt.find(c=>c.th.id===UI.theme)||cnt[0];
 return `<div class="grid g3" style="margin-bottom:16px">${kpi('bulb','#EBF3FC','#0F6CBD',wk.length,'Tickets this week')}${kpi('tag','#F1ECFB','#6B4FBB',cnt.filter(c=>c.list.length).length,'Active themes')}${kpi('box','#E3F5F5','#038387',S.backlog.length,'Backlog items raised')}</div>
 <div class="grid g2"><div class="card"><h3>${ic('bulb')}Top themes · last 7 days</h3>${cnt.map(c=>`<div class="brow t ${c.th.id===cur.th.id?'on':''}" data-act="theme" data-v="${c.th.id}"><span>${esc(c.th.name)}</span><div class="bar"><i style="width:${Math.round(100*c.list.length/mx)}%;background:linear-gradient(90deg,#0F6CBD,#5B9BE6)"></i></div><b>${c.list.length}</b></div>`).join('')}
 <p class="sub" style="margin-bottom:0">Themes are auto-tagged from conversation text (rules) and editable on each ticket. Click a theme to see samples.</p></div>
 <div class="card"><h3>${ic('spark')}${esc(cur.th.name)} · sample tickets</h3>${cur.list.length?cur.list.slice(0,5).map(t=>`<div class="tlr" style="cursor:pointer" data-act="open" data-id="${t.id}"><div style="flex:1"><div class="tt" style="font-size:13.5px">${esc(t.title)}</div><div class="sub">${t.id} · ${esc(AG(t.agencyId).name)} · ${fmtDate(t.created)}${t.product?' · '+esc(t.product):''}</div></div>${statPill(t.status)}</div>`).join(''):empty('inboxempty','No tickets for this theme','')}
 <form data-form="backlog" class="row" style="margin-top:14px"><input class="inp" name="product" placeholder="Suggested product / bug link (e.g. BUG-2291)" maxlength="40" style="flex:1"><button class="btn pri" ${cur.list.length?'':'disabled'}>${ic('plus',16)}Raise backlog item</button></form></div></div>
 <div class="card" style="margin-top:16px"><h3>${ic('box')}Product backlog from conversations</h3>${S.backlog.length?`<div class="tbl-wrap"><table class="tbl" style="min-width:600px"><thead><tr><th>ID</th><th>Theme</th><th>Link</th><th>Tickets</th><th>Raised</th></tr></thead><tbody>${S.backlog.map(b=>`<tr><td><b>${esc(b.id)}</b></td><td>${esc(b.theme)}</td><td>${esc(b.product||'—')}</td><td>${b.tickets.length}</td><td class="sub">${fmtDate(b.ts)} · ${esc(b.by)}</td></tr>`).join('')}</tbody></table></div>`:empty('box','No backlog items yet','Pick a theme above and raise one.')}</div>`;
}
/* ----- data ----- */
const COLS=['id','title','agency','tboh','priority','intent','status','region','owner','sla_state','check_in','lcd','themes','created_at'];
function rowOf(t){return [t.id,t.title,AG(t.agencyId).name,t.tboh,t.priority,intentName(t.intent),t.status,t.region,nameOf(t.assigneeId),sla(t).state,t.checkin?new Date(t.checkin).toISOString():'',t.lcd?new Date(t.lcd).toISOString():'',t.themes.join('|'),new Date(t.created).toISOString()]}
const csvCell=v=>{let s=String(v==null?'':v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
function queryTickets(){const f=UI.dq;return (f.archived?S.tickets.concat(S.archive):S.tickets).filter(t=>(f.status==='All'||t.status===f.status)&&(f.region==='All'||t.region===f.region)&&(f.intent==='All'||t.intent===f.intent)&&applyQ([t]).length).sort((a,b)=>b.created-a.created)}
function download(parts,name,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(parts,{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function viewData(){
 const f=UI.dq,rows=queryTickets(),pages=Math.max(1,Math.ceil(rows.length/f.size));if(f.page>=pages)f.page=pages-1;
 const sl=rows.slice(f.page*f.size,f.page*f.size+f.size);
 const opt=(arr,cur,fn)=>['All'].concat(arr).map(x=>`<option value="${esc(x)}" ${x===cur?'selected':''}>${esc(fn?fn(x):x)}</option>`).join('');
 return `<div class="grid g4" style="margin-bottom:16px">${kpi('db','#EBF3FC','#0F6CBD',S.tickets.length,'Hot tickets')}${kpi('box','#F1ECFB','#6B4FBB',S.archive.length,'Archived')}${kpi('download','#E7F5E7','#107C10','∞','Export cap (demo)')}${kpi('clock','#FFF4DB','#9A6200',S.retentionDays+'d','Hot retention')}</div>
 <div class="card"><h3>${ic('search')}Query tickets</h3><div class="row" style="margin-bottom:12px">
 <select class="sel" data-chg="dq" data-k="status">${opt(STAT,f.status)}</select><select class="sel" data-chg="dq" data-k="region">${opt(REGIONS,f.region)}</select><select class="sel" data-chg="dq" data-k="intent">${opt(INTENTS.map(i=>i.id),f.intent,intentName)}</select>
 <select class="sel" data-chg="dq" data-k="size">${[25,100,500].map(n=>`<option ${n===f.size?'selected':''}>${n}</option>`).join('')}</select>
 <label class="row" style="gap:6px"><input type="checkbox" data-chg="dq" data-k="archived" ${f.archived?'checked':''}> include archive</label><span class="sp"></span>
 <button class="btn" data-act="exp" data-v="csv">${ic('download',16)}CSV (${rows.length})</button><button class="btn" data-act="exp" data-v="json">${ic('download',16)}JSON</button><button class="btn pri" data-act="exp" data-v="50k">${ic('download',16)}50,000-row extract</button></div>
 ${rows.length?`<div class="tbl-wrap"><table class="tbl"><thead><tr>${['ID','Title','Agency','TBOH','Priority','Status','Region','Owner','SLA'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${sl.map(t=>`<tr data-act="open" data-id="${t.id}"><td><b>${t.id}</b></td><td>${esc(t.title)}</td><td>${esc(AG(t.agencyId).name)}</td><td>${esc(t.tboh||'—')}</td><td>${priPill(t.priority)}</td><td>${statPill(t.status)}</td><td>${esc(t.region)}</td><td>${esc(nameOf(t.assigneeId))}</td><td>${slaPill(t)}</td></tr>`).join('')}</tbody></table></div>
 <div class="row" style="margin-top:12px"><span class="sub">Page ${f.page+1} of ${pages} · ${rows.length} rows</span><span class="sp"></span><button class="btn sm" data-act="page" data-v="-1" ${f.page?'':'disabled'}>Prev</button><button class="btn sm" data-act="page" data-v="1" ${f.page<pages-1?'':'disabled'}>Next</button></div>`:empty('inboxempty','No rows','Adjust filters.')}</div>
 <div class="grid g2" style="margin-top:16px"><div class="card"><h3>${ic('box')}Retention & archival (demo stance)</h3><p class="sub">Closed tickets stay hot ${S.retentionDays} days, then move to a read-only archive that is still queryable and exportable. Finance-relevant records kept 7 years.</p>
 <form data-form="archive" class="row"><input class="inp" name="days" type="number" min="0" max="3650" value="7" style="width:90px"><button class="btn">${ic('box',16)}Archive closed older than N days</button><button type="button" class="btn" data-act="restore">${ic('refresh',16)}Restore all</button></form></div>
 <div class="card"><h3>${ic('layers')}API shape (scales past 3K rows)</h3><pre class="code">GET /api/v1/tickets?status=Open&amp;region=Middle%20East
    &amp;updated_since=2026-11-01T00:00:00Z&amp;limit=1000&amp;cursor=eyJpZCI6...
→ { "data":[…1000 rows], "next_cursor":"eyJpZCI6…" }
GET /api/v1/export?format=csv   → streamed, chunked, resumable</pre><p class="sub" style="margin-bottom:0">Keyset pagination · streamed exports · change-feed (webhooks / SSE) for near-realtime. Details on Architecture page.</p></div></div>`;
}
function viewTeam(){
 const ags=S.users.filter(u=>u.role!=='Requester');
 return `<div class="hint" style="margin-bottom:14px">${ic('route')}Toggle availability and watch auto-routing change (simulated availability + shift windows).</div>
 <div class="tbl-wrap"><table class="tbl" style="min-width:720px"><thead><tr><th>Person</th><th>Role</th><th>Regions</th><th>Rank</th><th>Shift</th><th>Open load</th><th>Available</th></tr></thead><tbody>${ags.map(u=>`<tr><td><div class="row"><span class="avatar" style="background:${u.color}">${initials(u.name)}</span><b>${esc(u.name)}</b></div></td><td>${esc(u.role)}</td><td>${u.regions.length>=5?'All':esc(u.regions.join(', '))}</td><td>${'★'.repeat(Math.min(u.rank,3))}</td><td>${pad(u.shift[0])}:00–${pad(u.shift[1])}:00</td><td>${loadOf(u.id)}</td><td>${u.role==='Agent'?`<label class="row" style="gap:6px"><input type="checkbox" data-chg="avail" data-id="${u.id}" ${u.available?'checked':''}> ${u.available?'Online':'Away'}</label>`:'<span class="chip g">Always</span>'}</td></tr>`).join('')}</tbody></table></div>
 <div class="card" style="margin-top:16px"><h3>${ic('spark')}Routing formula</h3><div class="flow"><span class="node">Region match +40</span><span class="arrow">→</span><span class="node">On shift +20</span><span class="arrow">→</span><span class="node">Rank vs priority +8…25</span><span class="arrow">→</span><span class="node">Load −4 each</span><span class="arrow">→</span><span class="node">Offline agents excluded</span></div><p class="sub">The winning breakdown is stored on every ticket as the "routing reason".</p></div>`;
}
function viewGuide(){
 const j=(k,title,proves,body,btns)=>`<div class="card journey-card journey-${k.toLowerCase()}"><div class="journey-top"><span class="journey-index">${k}</span><span class="journey-label">OPS JOURNEY</span><span class="journey-problem">${proves}</span></div><h3>${title}</h3><p class="sub">${body}</p><div class="row">${btns}</div><span class="journey-watermark" aria-hidden="true">${k}</span></div>`;
 const accts=S.users.map(u=>`<tr><td><b>${esc(u.name)}</b></td><td>${esc(u.role)}</td><td class="sub">${u.role==='Requester'?'Own agency tickets only':u.role==='Agent'?'Org queues':u.role==='Escalation Manager'?'Escalation queue + actions':'All lead views'}</td></tr>`).join('');
 return `<div class="hint" style="margin-bottom:16px">${ic('compass')}Switch user from the top bar. Demo auth: no passwords, no secrets in code — see assumptions below.</div>
 ${staff()?`<div class="grid g2">
 ${j('A','Context & linkage','Problem 1','Agency raises a refund for TBOH-882145 — agent sees 2 prior tickets, intent classified automatically.',`<button class="btn pri" data-act="demo" data-v="A">${ic('plus',16)}Create refund ticket</button><button class="btn" data-act="jump" data-id="TKT-1003">Open TKT-1003</button>`)}
 ${j('B','Routing','Problem 2','Urgent ticket routes by region + priority + availability. Flip an agent Away in Team & Routing first for contrast.',`<button class="btn pri" data-act="demo" data-v="B">${ic('plus',16)}Create urgent ticket</button><button class="btn" data-act="nav" data-v="team">Team & Routing</button>`)}
 ${j('C','Side conversation','Problem 3','Supplier thread with explicit recipients → transfer ticket → recipients stay correct.',`<button class="btn pri" data-act="jump" data-id="TKT-1009" data-tab="side">Open TKT-1009</button>`)}
 ${j('D','SLA & escalate','Problem 4','Near check-in/LCD → SLA at risk → escalate to Escalation Manager → worked from escalation queue.',`<button class="btn pri" data-act="jump" data-id="TKT-1004">Open TKT-1004</button><button class="btn" data-act="nav" data-v="escalations">Escalation queue</button>`)}
 ${j('E','Insights & data','Problems 5 & 6','Lead opens Insights (themes) and exports 50,000 rows with no 3K cap.',`<button class="btn pri" data-act="nav" data-v="insights">Insights</button><button class="btn" data-act="nav" data-v="data">Data & Export</button>`)}
 <div class="card"><h3>${ic('shield')}Demo script · 3–5 min</h3><ol style="margin:0;padding-left:18px;line-height:1.9"><li>Login as <b>Riya</b> → Journey A (linkage + intent)</li><li>Switch to <b>Anita (Lead)</b> → Journey B (routing reason)</li><li>Journey C → transfer TKT-1009, recipients intact</li><li>Journey D → escalate TKT-1004, switch to <b>Vikram</b></li><li>Journey E → Insights + 50k export</li></ol></div></div>`:`<div class="card"><h3>${ic('plane')}Welcome, ${esc(ME.name)}</h3><p>Raise a ticket with your TBOH, track status and reply to the ops team. You only ever see your own agency's tickets.</p><button class="btn pri" data-act="newTicket">${ic('plus')}New ticket</button></div>`}
 <div class="card" style="margin-top:16px"><h3>${ic('users')}Demo accounts</h3><div class="tbl-wrap"><table class="tbl" style="min-width:520px"><thead><tr><th>User</th><th>Role</th><th>Access</th></tr></thead><tbody>${accts}</tbody></table></div></div>
 <div class="row" style="margin-top:16px"><button class="btn red" data-act="reset">${ic('refresh',16)}Reset demo data</button></div>`;
}
function viewArch(){
 const map=[['1','Tickets without context','TBOH/agency/intent auto-linking · intent taxonomy + rule-based suggest · repeat-contact banner · activity timeline'],['2','Routing & ownership','Scored routing: region + time window + rank/priority + availability · audit reason · 5 views'],['3','Side conversations','Explicit recipient lists stored on the thread · survive transfer · internal vs external split'],['4','SLA & escalation','Priority + check-in/LCD proximity (+ holiday flag) · at-risk/breached · first-class escalate to EM'],['5','Feedback loop','Rule-based theme tagging · weekly Insights · backlog item + product/bug link'],['6','Data & archival','Persisted store · unlimited CSV/JSON export (50k demo) · retention & archive · API plan']];
 return `<div class="grid g2"><div class="card"><h3>${ic('check')}Feature checklist → Problems 1–6</h3>${map.map(m=>`<div class="tlr"><div class="ti">${m[0]}</div><div><b>${m[1]}</b><div class="sub">${m[2]}</div></div></div>`).join('')}</div>
 <div class="card"><h3>${ic('layers')}Architecture (demo → production)</h3><div class="flow" style="margin-bottom:14px"><span class="node">Browser SPA</span><span class="arrow">→</span><span class="node">API gateway + RBAC</span><span class="arrow">→</span><span class="node">Case service</span></div><div class="flow" style="margin-bottom:14px"><span class="node">Routing / SLA engine</span><span class="arrow">→</span><span class="node">Postgres (partitioned)</span><span class="arrow">→</span><span class="node">Change feed (CDC)</span></div><div class="flow"><span class="node">Webhooks / SSE</span><span class="arrow">→</span><span class="node">Warehouse (Parquet)</span><span class="arrow">→</span><span class="node">Live dashboards</span></div>
 <p class="sub">Demo = single-file SPA with localStorage persistence and cross-tab live sync (storage events). Engines (intent, routing, SLA) are pure functions, ready to move server-side.</p></div></div>
 <div class="grid g2" style="margin-top:16px"><div class="card"><h3>${ic('db')}Scaling data access</h3><ul style="line-height:1.8;margin:0;padding-left:18px"><li>Keyset (cursor) pagination — no row caps, no offset scans</li><li>Streamed exports (chunked CSV/NDJSON), resumable by cursor</li><li>Change-data-capture → SSE/webhooks for near-realtime sync</li><li>Monthly partitions; hot 90d, cold archive in object storage (Parquet)</li><li>Read replica for reporting so ops traffic is untouched</li></ul></div>
 <div class="card"><h3>${ic('shield')}Security basics</h3><ul style="line-height:1.8;margin:0;padding-left:18px"><li>No secrets in code; demo identities only (single-tenant TBO org)</li><li>All user text escaped on render; server-side validation of fields, TBOH pattern, emails</li><li>Least privilege: requester sees only own agency, no internal notes, no side convos</li><li>CSV export neutralises formula injection</li></ul></div></div>
 <div class="card" style="margin-top:16px"><h3>${ic('clock')}Cost / complexity contrast</h3><div class="tbl-wrap"><table class="tbl" style="min-width:600px"><thead><tr><th></th><th>Today (add-ons + TPS APIs)</th><th>OpsDesk</th></tr></thead><tbody>
 <tr><td><b>Linking by TBOH</b></td><td>Paid third-party app</td><td>Built-in, rule-based</td></tr><tr><td><b>Routing / SLA</b></td><td>Triggers + extra config</td><td>One scoring engine</td></tr><tr><td><b>Insights</b></td><td>Paid AI add-on + human linking</td><td>Rule tagging, optional ML later</td></tr><tr><td><b>Exports / API</b></td><td>~3K cap, tiered API limits</td><td>Cursor + streaming, owned store</td></tr><tr><td><b>Archival</b></td><td>Extra storage cost</td><td>Tiered cold storage</td></tr></tbody></table></div></div>
 <div class="card" style="margin-top:16px"><h3>${ic('compass')}Assumptions</h3><ul style="line-height:1.8;margin:0;padding-left:18px"><li>Demo login instead of a real IdP · agent availability and regional calendars are simulated</li><li>Intent model = weighted keyword rules (explainable, zero cost) · single-tenant TBO org</li><li>LCD = Last Cancellation Date · windows: ≤12h→1h, ≤24h→2h, ≤72h→4h cap</li></ul></div>`;
}
const VIEWS={dashboard:viewDashboard,triage:viewTriage,myqueue:viewMyQueue,region:viewRegion,intent:viewIntent,linked:viewLinked,escalations:viewEscalations,insights:viewInsights,data:viewData,team:viewTeam,guide:viewGuide,arch:viewArch};

/* ============================== DRAWER ============================== */
function drawerHTML(){
 const t=find(UI.open);if(!t||!canSee(t))return '';
 const st=staff(),s=sla(t),links=linksOf(t),ag=AG(t.agencyId);
 const sameT=t.tboh?allT().filter(o=>o.tboh===t.tboh).sort((a,b)=>a.created-b.created):[];
 const pos=sameT.findIndex(o=>o.id===t.id)+1;
 const banner=st&&sameT.length>1?`<div class="banner">${ic('alert',22)}<div><b>Repeat contact · #${pos} on ${esc(t.tboh)}</b><div class="sub" style="color:var(--amber)">${sameT.length-1} other ticket(s) share this TBOH — agent sees full history, no new "isolated" case.</div></div></div>`:'';
 const tabs=st?[['conv','Conversation',t.comments.length],['side','Side conversations',t.side.length],['linked','Linked',links.length],['timeline','Timeline',t.timeline.length]]:[['conv','Conversation',t.comments.filter(c=>c.type==='external').length],['timeline','Status history','']];
 if(!tabs.find(x=>x[0]===UI.tab))UI.tab='conv';
 let body='';
 if(UI.tab==='conv'){
  const cm=t.comments.filter(c=>st||c.type==='external');
  body=cm.map(c=>`<div class="msg ${c.type==='internal'?'internal':c.from==='agency'?'agency':'staff'}"><div class="mh"><b>${esc(c.by)}</b><span>${ago(c.ts)}</span>${c.type==='internal'?`<span class="chip a">${ic('lock',12)}Internal note · hidden from agency</span>`:`<span class="chip b">External</span>`}</div><div>${esc(c.text).replace(/\n/g,'<br>')}</div></div>`).join('');
  body+=`<form data-form="msg" style="margin-top:14px"><div class="row" style="margin-bottom:8px">${st?`<div class="seg"><a data-act="mode" data-v="external" class="${UI.mode==='external'?'on':''}">Reply to agency</a><a data-act="mode" data-v="internal" class="${UI.mode==='internal'?'on amb':''}">Internal note</a></div>`:`<span class="chip b">Reply to TBO Ops</span>`}</div>
  <textarea class="inp" id="msgtext" name="text" maxlength="2000" placeholder="${UI.mode==='internal'&&st?'Internal note — only TBO staff can see this…':'Write a reply…'}">${esc(UI.draft)}</textarea><div class="row" style="margin-top:8px"><span class="sp"></span><button class="btn pri">${ic('send',16)}Send</button></div></form>`;
 }
 if(UI.tab==='side'&&st){
  body=`<div class="hint" style="margin-bottom:14px">${ic('lock',16)}Recipients are stored explicitly on each thread — never bound to the ticket group. Transferring the ticket keeps them intact.</div>`;
  body+=t.side.length?t.side.map(sc=>`<div class="scard"><div class="row"><b style="font-size:15px">${esc(sc.subject)}</b><span class="chip ${sc.kind==='Supplier'?'t':'b'}">${esc(sc.kind)}</span><span class="sp"></span><span class="sub">Owner: ${esc(nameOf(sc.ownerId))}</span></div>
  <div style="margin:10px 0 4px" class="sub">Recipients (${sc.recipients.length}) · explicit list</div><div>${sc.recipients.map((r,i)=>`<span class="rcp"><span class="chip ${r.type==='Supplier'?'t':r.type==='Agency'?'b':''}">${esc(r.type)}</span>${esc(r.name)} &lt;${esc(r.email)}&gt;<button title="Remove" data-act="rmrcp" data-sid="${sc.id}" data-i="${i}">×</button></span>`).join('')}</div>
  <form data-form="addrcp" data-sid="${sc.id}" class="row" style="margin:8px 0"><input class="inp" name="name" placeholder="Name" maxlength="60" style="width:150px"><input class="inp" name="email" placeholder="email@domain" maxlength="80" style="width:190px"><select class="inp" name="type" style="width:110px"><option>Supplier</option><option>Agency</option><option>Internal</option></select><button class="btn sm">${ic('plus',14)}Add</button></form>
  ${sc.msgs.map(m=>`<div class="msg staff" style="max-width:100%;margin:8px 0"><div class="mh"><b>${esc(m.by)}</b><span>${ago(m.ts)}</span><span class="chip g">External · sent to ${sc.recipients.length}</span></div>${esc(m.text)}</div>`).join('')}
  <form data-form="sidemsg" data-sid="${sc.id}" class="row"><input class="inp" name="text" placeholder="Message to all recipients…" maxlength="1000" style="flex:1"><button class="btn pri sm">${ic('send',14)}Send</button></form></div>`).join(''):empty('chat','No side conversations','Start one with suppliers or the agency.');
  body+=UI.newSide?`<form data-form="newside" class="scard"><h3 style="margin:0 0 10px">${ic('chat')}New side conversation</h3><label class="f">Subject</label><input class="inp" name="subject" maxlength="100" placeholder="e.g. Room confirmation"><label class="f" style="margin-top:10px">Recipients</label>${CONTACTS.concat([{name:ag.name+' — Ops Desk',email:'ops@'+ag.name.toLowerCase().replace(/[^a-z]/g,'')+'.demo',org:ag.name,type:'Agency'}]).map((c,i)=>`<label class="row" style="gap:8px;margin:4px 0"><input type="checkbox" name="rc" value="${esc(JSON.stringify(c))}" ${i===0||i===5?'checked':''}> ${esc(c.name)} <span class="sub">&lt;${esc(c.email)}&gt; · ${esc(c.type)}</span></label>`).join('')}<div class="row" style="margin-top:12px"><button class="btn pri">Create thread</button><button type="button" class="btn" data-act="sideToggle">Cancel</button></div></form>`:`<button class="btn" data-act="sideToggle">${ic('plus',16)}New side conversation</button>`;
 }
 if(UI.tab==='linked'&&st){
  body=links.length?links.map(l=>`<div class="tlr" style="cursor:pointer" data-act="open" data-id="${l.t.id}"><div class="ti">${ic('link',15)}</div><div style="flex:1"><div class="tt" style="font-size:14px">${esc(l.t.title)}</div><div class="sub">${l.t.id} · ${fmtDate(l.t.created)} · ${esc(l.t.assigneeId?nameOf(l.t.assigneeId):'Unassigned')}</div><div style="margin-top:4px">${l.reasons.map(r=>`<span class="chip g" style="margin-right:4px">${r}</span>`).join('')}</div></div>${statPill(l.t.status)}</div>`).join(''):empty('link','No linked tickets','This is the first contact for this TBOH / intent.');
 }
 if(UI.tab==='timeline'){
  const ev=t.timeline.filter(e=>st||['created','status'].includes(e.type)).slice().sort((a,b)=>b.ts-a.ts);
  body=ev.map(e=>`<div class="tlr"><div class="ti ${e.type}">${ic(tlIcon(e.type),15)}</div><div><div>${esc(e.text)}</div><div class="sub">${esc(e.by)} · ${fmtDate(e.ts)} (${ago(e.ts)})</div></div></div>`).join('');
 }
 const em=S.users.filter(u=>u.role==='Escalation Manager');
 const side=`<div class="blk"><h4>Status</h4>${st?`<select class="inp" data-chg="status" data-id="${t.id}">${STAT.map(x=>`<option ${x===t.status?'selected':''}>${x}</option>`).join('')}</select>`:statPill(t.status)}</div>
 ${st?`<div class="blk"><h4>Owner</h4><select class="inp" data-chg="assign" data-id="${t.id}"><option value="">— Unassigned —</option>${S.users.filter(u=>u.role==='Agent').map(u=>`<option value="${u.id}" ${u.id===t.assigneeId?'selected':''}>${esc(u.name)} (${esc(u.regions.join('/'))})${u.available?'':' · away'}</option>`).join('')}${t.assigneeId&&U(t.assigneeId).role!=='Agent'?`<option selected value="${t.assigneeId}">${esc(nameOf(t.assigneeId))}</option>`:''}</select>
 <div class="row" style="margin-top:8px"><button class="btn sm" data-act="route" data-id="${t.id}">${ic('spark',14)}Auto-route</button>${t.status==='Escalated'&&t.prevAssigneeId?`<button class="btn sm" data-act="returnAgent" data-id="${t.id}">Return to agent</button>`:''}</div></div>
 <div class="blk"><h4>Routing reason</h4><div class="chip p" style="white-space:normal;display:block;line-height:1.5">${esc(t.routing?t.routing.reason:'Not routed yet')}</div></div>`:''}
 <div class="blk"><h4>SLA · travel-aware</h4><div class="row">${slaPill(t)}</div>${s.state!=='done'?`<div class="bar" style="margin:10px 0"><i style="width:${Math.max(2,Math.min(100,Math.round(100*(1-s.left/(s.win*H)))))}%;background:${s.state==='ok'?'#107C10':s.state==='risk'?'#E0A100':'#C4314B'}"></i></div><div class="sub">Window ${s.win}h · due ${fmtDate(s.due)}</div>${st?s.driver.map(d=>`<div class="sub">• ${esc(d)}</div>`).join(''):''}`:''}</div>
 <div class="blk"><h4>Travel</h4><div class="row">${travel('Check-in',t.checkin)}${travel('LCD',t.lcd)}</div></div>
 <div class="blk"><h4>Context</h4><div class="kv"><span>Agency</span><b>${esc(ag.name)}</b></div><div class="kv"><span>TBOH</span><b>${esc(t.tboh||'—')}</b></div><div class="kv"><span>Region</span><b>${esc(t.region)}</b></div><div class="kv"><span>Priority</span>${priPill(t.priority)}</div><div class="kv"><span>Created</span><span>${fmtDate(t.created)}</span></div>
 <div style="margin-top:6px">${st?`<select class="inp" data-chg="intent" data-id="${t.id}">${INTENTS.map(i=>`<option value="${i.id}" ${i.id===t.intent?'selected':''}>${esc(i.name)}</option>`).join('')}</select>`:intentChip(t.intent)}</div></div>
 ${st?`<div class="blk"><h4>Themes</h4><div>${t.themes.map(x=>`<span class="chip b" style="margin:2px">${esc((THEMES.find(h=>h.id===x)||{name:x}).name)}<button style="border:0;background:transparent;cursor:pointer;color:inherit" data-act="rmtheme" data-id="${t.id}" data-v="${x}">×</button></span>`).join('')||'<span class="sub">None</span>'}</div><select class="inp" style="margin-top:6px" data-chg="theme" data-id="${t.id}"><option value="">+ Add theme…</option>${THEMES.filter(h=>!t.themes.includes(h.id)).map(h=>`<option value="${h.id}">${esc(h.name)}</option>`).join('')}</select>
 <input class="inp" style="margin-top:8px" data-chg="product" data-id="${t.id}" value="${esc(t.product)}" maxlength="40" placeholder="Suggested product/bug link"></div>
 <div class="blk"><button class="btn red" style="width:100%;justify-content:center" data-act="escModal" data-id="${t.id}" ${isDone(t)?'disabled':''}>${ic('alert',16)}Escalate to Escalation Manager</button></div>`:''}`;
 return `<div class="ov" data-act="closeDrawer"></div><div class="drawer ${UI.anim?'anim':''}"><div class="dh"><div style="flex:1;min-width:0"><div class="row"><span class="chip b">${t.id}</span>${statPill(t.status)}${priPill(t.priority)}${intentChip(t.intent)}</div><h2>${esc(t.title)}</h2><div class="sub">${esc(ag.name)} · ${esc(t.region)}${t.tboh?' · '+esc(t.tboh):''}</div></div><button class="btn sm" data-act="closeDrawer" aria-label="Close">${ic('x',16)}</button></div>
 <div class="db"><div class="dmain" id="dmain">${banner}<div class="tabs">${tabs.map(x=>`<div class="tab ${UI.tab===x[0]?'on':''}" data-act="tab" data-v="${x[0]}">${x[1]}${x[2]!==''?` <span class="badge">${x[2]}</span>`:''}</div>`).join('')}</div>${body}</div><div class="dside">${side}</div></div></div>`;
}
function modalHTML(){
 const m=UI.modal;
 if(m.type==='escalate'){const t=find(m.id);if(!t)return '';const em=S.users.filter(u=>u.role==='Escalation Manager').sort((a,b)=>loadOf(a.id)-loadOf(b.id));
  return `<div class="ov" data-act="closeModal" style="z-index:59"></div><div class="modal"><form class="mbox" data-form="escalate" data-id="${t.id}"><h2>${ic('alert',20)} Escalate ${t.id}</h2><p class="sub">Changes owner and queue, sets status to Escalated, and is logged on the timeline.</p>
  <div class="errs" id="ferr" style="display:none"></div><label class="f">Escalation Manager</label><select class="inp" name="em">${em.map(u=>`<option value="${u.id}">${esc(u.name)} · ${loadOf(u.id)} open</option>`).join('')}</select><label class="f" style="margin-top:12px">Reason</label><textarea class="inp" name="reason" maxlength="300" placeholder="Why does this need an Escalation Manager?"></textarea>
  <div class="row" style="margin-top:14px"><span class="sp"></span><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn red">${ic('alert',16)}Escalate</button></div></form></div>`}
 if(m.type==='new'){const p=UI.prefill||{};const rq=ME.role==='Requester';const ag=rq?ME.agencyId:(p.agency||'a1');
  return `<div class="ov" data-act="closeModal" style="z-index:59"></div><div class="modal"><form class="mbox" data-form="newTicket"><h2>${ic('plus',20)} New ticket</h2><p class="sub">Intent is suggested automatically from your text — you can override it.</p><div class="errs" id="ferr" style="display:none"></div>
  <div class="fgrid"><div class="full"><label class="f">Title *</label><input class="inp" name="title" maxlength="120" value="${esc(p.title||'')}" placeholder="Short summary"></div>
  <div class="full"><label class="f">Description *</label><textarea class="inp" name="description" maxlength="2000" placeholder="What happened? Include supplier / dates.">${esc(p.description||'')}</textarea></div>
  <div class="full"><div class="hint" id="sugg">${ic('spark',16)}<span>Type a title/description to see intent suggestion</span></div></div>
  <div><label class="f">Agency</label>${rq?`<input class="inp" value="${esc(AG(ag).name)}" disabled>`:`<select class="inp" name="agency" data-chg="agencyPick">${AGENCIES.map(a=>`<option value="${a.id}" ${a.id===ag?'selected':''}>${esc(a.name)}</option>`).join('')}</select>`}</div>
  <div><label class="f">TBOH reference</label><input class="inp" name="tboh" maxlength="14" value="${esc(p.tboh||'')}" placeholder="TBOH-882145"></div>
  <div><label class="f">Priority</label><select class="inp" name="priority">${PRI.map(x=>`<option ${x===(p.priority||'Medium')?'selected':''}>${x}</option>`).join('')}</select></div>
  <div><label class="f">Region</label><select class="inp" name="region">${REGIONS.map(x=>`<option ${x===(p.region||AG(ag).region)?'selected':''}>${x}</option>`).join('')}</select></div>
  <div><label class="f">Intent</label><select class="inp" name="intent"><option value="auto">✨ Auto-suggest (recommended)</option>${INTENTS.map(i=>`<option value="${i.id}">${esc(i.name)}</option>`).join('')}</select></div><div></div>
  <div><label class="f">Check-in</label><input class="inp" type="datetime-local" name="checkin" value="${p.checkin||''}"></div>
  <div><label class="f">LCD (last cancellation date)</label><input class="inp" type="datetime-local" name="lcd" value="${p.lcd||''}"></div></div>
  <div class="row" style="margin-top:16px"><span class="sp"></span><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn pri">${ic('plane',16)}Create ticket</button></div></form></div>`}
 return '';
}

/* ============================== SHELL / RENDER ============================== */
function loginHTML(){
 const groups=[['Agents',S.users.filter(u=>u.role==='Agent')],['Escalation Managers & Lead',S.users.filter(u=>u.role==='Escalation Manager'||u.role==='Lead')],['Agencies (Requesters)',S.users.filter(u=>u.role==='Requester')]];
 return `<div class="login"><div class="lbox"><div class="lhero"><div class="brand" style="padding:0"><div class="logo"><img src="assets/opsdesk-mark.svg" alt="OpsDesk logo"></div><div><b style="font-size:20px">OpsDesk</b><small style="color:#fff;opacity:.85">for TBO Operations</small></div></div>
 <h1>Context-rich, travel-aware operations cases.</h1><p style="opacity:.92">Linked by agency and TBOH, routed by reality, escalated on purpose.</p><ul style="padding-left:18px"><li>Auto-linked history & intent</li><li>Routing with an audit reason</li><li>Side conversations that survive transfers</li><li>SLA that follows check-in / LCD</li><li>Insights without the AI tax</li></ul></div>
 <div class="lpick"><h2 style="margin:0 0 4px">Sign in (demo)</h2><p class="sub" style="margin:0 0 6px">Pick a persona — demo auth only, no passwords.</p>${groups.map(([g,us])=>`<div class="navsec" style="padding-left:0">${g}</div>${us.map(u=>`<button class="ucard" data-act="login" data-id="${u.id}"><span class="avatar" style="background:${u.color}">${initials(u.name)}</span><span><b>${esc(u.name)}</b><br><small>${esc(u.role)}</small></span></button>`).join('')}`).join('')}</div></div></div>`;
}
function renderApp(){
 const root=$('#app');
 if(!ME){root.innerHTML=loginHTML();return}
 root.innerHTML=`<div class="shell ${UI.collapsed?'collapsed':''}"><aside class="side" id="side"></aside><main class="main"><header class="top"><h1 id="title"></h1><label class="search">${ic('search',16)}<input id="q" placeholder="Search ticket, agency, TBOH…" value="${esc(UI.q)}" maxlength="80" autocomplete="off"></label><span class="live" title="Synced across tabs">${'<i></i>'}Live</span>
 <select class="sel" data-chg="switchUser" title="Switch demo user">${S.users.map(u=>`<option value="${u.id}" ${u.id===ME.id?'selected':''}>${esc(u.name)} · ${esc(u.role)}</option>`).join('')}</select>
 ${staff()?`<button class="btn pri" data-act="newTicket">${ic('plus',16)}New ticket</button>`:''}</header><div class="content" id="view"></div></main></div><div id="drawer"></div><div id="modal"></div>`;
 refresh();
}
function sideHTML(){
 const cnt={triage:scope().filter(t=>!t.assigneeId&&!isDone(t)).length,my:ME.role==='Requester'?scope().filter(t=>!isDone(t)).length:S.tickets.filter(t=>t.assigneeId===ME.id&&!isDone(t)).length,esc:S.tickets.filter(t=>t.status==='Escalated').length};
 let out=`<div class="brand"><div class="logo"><img src="assets/opsdesk-mark.svg" alt="OpsDesk logo"></div><div class="bt"><b>OpsDesk</b><small>for TBO Operations</small></div><button class="colbtn" data-act="collapse" title="Collapse / expand sidebar" aria-label="Toggle sidebar">${ic('menu',18)}</button></div><nav class="nav">`;
 NAV.forEach(n=>{
  if(n.sec){if(!(n.not&&n.not.includes(ME.role)))out+=`<div class="navsec">${n.sec}</div>`;return}
  if(!n.roles.includes(ME.role))return;
  const b=n.badge&&cnt[n.badge]?`<span class="badge ${n.badge==='esc'?'red':''}">${cnt[n.badge]}</span>`:'';
  out+=`<a style="--c:${NAVC[n.id]||'#0F6CBD'}" title="${esc(n.label)}" class="${UI.view===n.id?'on':''}" data-act="nav" data-v="${n.id}"><span class="ico">${ic(n.icon,18)}</span><span class="l">${esc(ME.role==='Requester'&&n.alt?n.alt:n.label)}</span>${b}</a>`;
 });
 out+=`</nav><div class="promo"><b>${ic('spark',16)}OpsDesk Premium</b><p>Travel-aware SLA engine & routing audit are live.</p><span class="chip">● All systems normal</span></div>
 <div class="me"><span class="avatar" style="background:${ME.color}">${initials(ME.name)}</span><div style="flex:1;min-width:0"><b>${esc(ME.name)}</b><small>${esc(ME.role)}</small></div><button class="btn sm" data-act="logout" title="Sign out" aria-label="Sign out">${ic('logout',15)}</button></div>`;
 return out;
}
function refresh(){
 if(!ME||!$('#view'))return;
 const nav=NAV.find(n=>n.id===UI.view);if(!nav||!nav.roles.includes(ME.role))UI.view='dashboard';
 $('#side').innerHTML=sideHTML();$('#title').textContent=ME.role==='Requester'&&UI.view==='myqueue'?'My Tickets':TITLES[UI.view]||'';
 let html;if(UI.loading)html=skeleton();else{try{html=VIEWS[UI.view]()}catch(e){console.error(e);html=`<div class="empty">${ic('alert',38)}<b>Something went wrong</b><div>${esc(e.message)}</div><button class="btn pri" style="margin-top:12px" data-act="retry">Retry</button></div>`}}
 $('#view').innerHTML=html;
 const dm=$('#dmain'),sc=dm?dm.scrollTop:0;
 $('#drawer').innerHTML=UI.open?drawerHTML():'';UI.anim=false;
 const nd=$('#dmain');if(nd&&dm)nd.scrollTop=sc;
 $('#modal').innerHTML=UI.modal?modalHTML():'';
}
function nav(v){UI.view=v;UI.loading=true;UI.open=null;refresh();setTimeout(()=>{UI.loading=false;refresh()},220)}
function commit(){save();refresh()}

/* ============================== ACTIONS ============================== */
function newTicket(fd){
 const g=k=>String(fd.get(k)||'').trim(),errs=[];
 const title=g('title'),desc=g('description'),tboh=g('tboh').toUpperCase();
 const agencyId=ME.role==='Requester'?ME.agencyId:g('agency');
 if(!AGENCIES.find(a=>a.id===agencyId))errs.push('Select a valid agency.');
 if(title.length<5||title.length>120)errs.push('Title must be 5–120 characters.');
 if(desc.length<10||desc.length>2000)errs.push('Description must be 10–2000 characters.');
 if(tboh&&!/^TBOH-\d{5,8}$/.test(tboh))errs.push('TBOH must look like TBOH-882145.');
 const pri=PRI.includes(g('priority'))?g('priority'):'Medium',region=REGIONS.includes(g('region'))?g('region'):AG(agencyId).region;
 const ci=g('checkin')?new Date(g('checkin')).getTime():null,lcd=g('lcd')?new Date(g('lcd')).getTime():null;
 if((ci!==null&&isNaN(ci))||(lcd!==null&&isNaN(lcd)))errs.push('Invalid check-in / LCD date.');
 if(errs.length)return errs;
 let intent=g('intent'),auto=false;
 if(!INTENTS.find(i=>i.id===intent)){const sg=suggestIntent(title+' '+desc);intent=sg?sg.intent.id:'general';auto=true}
 const id='TKT-'+(++S.seq),ts=now(),ag=AG(agencyId);
 const t={id,title,description:desc,agencyId,tboh,priority:pri,intent,region,status:'New',assigneeId:null,prevAssigneeId:null,checkin:ci,lcd,holiday:false,themes:autoThemes(title+' '+desc),product:'',created:ts,updated:ts,routing:null,
  comments:[{id:uid(),ts,by:ag.name,type:'external',from:'agency',text:desc}],side:[],timeline:[],escal:[]};
 tl(t,'created','Ticket created by '+(ME.role==='Requester'?ag.name:ME.name+' on behalf of '+ag.name)+' · intent '+(auto?'auto-classified':'selected')+': '+intentName(intent),ME.name,ts);
 S.tickets.unshift(t);
 const lk=linksOf(t);if(lk.length)tl(t,'link','Linked automatically to '+lk.length+' earlier ticket(s): '+lk.slice(0,4).map(l=>l.t.id+' ('+l.reasons.join(', ')+')').join('; '),'System');
 const a=routeTicket(t,'System');
 UI.modal=null;UI.prefill=null;commit();
 toast(a?t.id+' created → routed to '+a.name:t.id+' created → Triage (no agent available)','ok');
 if(staff()){UI.open=t.id;UI.tab='conv';UI.anim=true;refresh()}
 return null;
}
const ACT={
 nav:a=>nav(a.dataset.v),
 collapse:()=>{UI.collapsed=!UI.collapsed;try{localStorage.setItem('opsdesk.col',UI.collapsed?'1':'0')}catch(e){}const s=$('.shell');if(s)s.classList.toggle('collapsed',UI.collapsed)},
 open:a=>{const t=find(a.dataset.id);if(!t||!canSee(t))return toast('Access denied','err');UI.open=t.id;UI.tab=a.dataset.tab||(UI.open===t.id?UI.tab:'conv');UI.anim=!$('#dmain');UI.draft='';refresh()},
 jump:a=>{const t=find(a.dataset.id);if(!t)return;UI.open=t.id;UI.tab=a.dataset.tab||'conv';UI.anim=true;refresh()},
 closeDrawer:()=>{UI.open=null;refresh()},
 closeModal:()=>{UI.modal=null;refresh()},
 tab:a=>{UI.tab=a.dataset.v;refresh()},
 mode:a=>{const x=$('#msgtext');UI.draft=x?x.value:'';UI.mode=a.dataset.v;refresh()},
 login:a=>{ME=S.users.find(u=>u.id===a.dataset.id);try{sessionStorage.setItem('opsdesk.me',ME.id)}catch(e){}UI.view='dashboard';UI.open=null;UI.q='';renderApp();nav('dashboard')},
 logout:()=>{try{sessionStorage.removeItem('opsdesk.me')}catch(e){}ME=null;UI.open=null;UI.modal=null;renderApp()},
 newTicket:()=>{UI.modal={type:'new'};refresh();updSugg()},
 demo:a=>{const k=a.dataset.v;
  UI.prefill=k==='A'?{agency:'a1',title:'Refund not received yet for cancelled booking',description:'We have been waiting for the refund on our cancelled booking since last week. Please update us on the refund status.',tboh:'TBOH-882145',priority:'High'}
   :{agency:'a2',title:'Guests landing tonight — hotel voucher missing',description:'4 guests land in 4 hours and the hotel voucher has not been generated. Urgent confirmation needed.',tboh:'TBOH-771999',priority:'Urgent',region:'Middle East',checkin:toLocalInput(now()+4*H)};
  UI.modal={type:'new'};refresh();updSugg()},
 route:a=>{const t=find(a.dataset.id);const u=routeTicket(t,ME.name);commit();toast(u?'Routed to '+u.name:'No agent available — stays in Triage',u?'ok':'err')},
 routeAll:()=>{let n=0;S.tickets.filter(t=>!t.assigneeId&&!isDone(t)).forEach(t=>{if(routeTicket(t,ME.name))n++});commit();toast(n+' ticket(s) routed','ok')},
 escModal:a=>{UI.modal={type:'escalate',id:a.dataset.id};refresh()},
 returnAgent:a=>{const t=find(a.dataset.id);const to=t.prevAssigneeId;setOwner(t,to,'Returned from escalation by '+ME.name,ME.name);t.status='Open';tl(t,'status','Status Escalated → Open','System');commit();toast('Returned to '+nameOf(to),'ok')},
 filter:a=>{UI[a.dataset.k]=a.dataset.v;refresh()},
 theme:a=>{UI.theme=a.dataset.v;refresh()},
 rmtheme:a=>{const t=find(a.dataset.id);t.themes=t.themes.filter(x=>x!==a.dataset.v);commit()},
 rmrcp:a=>{const t=find(UI.open),sc=t.side.find(s=>s.id===a.dataset.sid);if(sc.recipients.length<=1)return toast('A thread needs at least one recipient','err');const r=sc.recipients.splice(+a.dataset.i,1)[0];tl(t,'side','Recipient removed from "'+sc.subject+'": '+r.name,ME.name);commit()},
 sideToggle:()=>{UI.newSide=!UI.newSide;refresh()},
 page:a=>{UI.dq.page=Math.max(0,UI.dq.page+ +a.dataset.v);refresh()},
 exp:a=>{
  if(ME.role!=='Lead')return toast('Only Leads can export','err');
  const k=a.dataset.v,t0=performance.now();
  if(k==='csv'){const rows=queryTickets();download([COLS.map(csvCell).join(',')+'\n'+rows.map(t=>rowOf(t).map(csvCell).join(',')).join('\n')],'opsdesk-tickets.csv','text/csv');toast('Exported '+rows.length+' rows (CSV)','ok')}
  else if(k==='json'){const rows=queryTickets();download([JSON.stringify(rows.map(t=>Object.fromEntries(COLS.map((c,i)=>[c,rowOf(t)[i]]))),null,1)],'opsdesk-tickets.json','application/json');toast('Exported '+rows.length+' rows (JSON)','ok')}
  else{const parts=[COLS.map(csvCell).join(',')+'\n'],base=S.tickets.concat(S.archive);const regs=REGIONS,pr=PRI,st=STAT;
   for(let i=0;i<50000;i++){const t=base[i%base.length];const r=rowOf(t);r[0]='SYN-'+(100000+i);r[5]=r[5];r[6]=st[i%st.length];r[7]=regs[i%regs.length];r[4]=pr[i%pr.length];parts.push(r.map(csvCell).join(',')+'\n')}
   download(parts,'opsdesk-50k-extract.csv','text/csv');toast('Exported 50,000 rows in '+Math.round(performance.now()-t0)+' ms — no 3K cap','ok')}
 },
 restore:()=>{S.tickets=S.tickets.concat(S.archive);S.archive=[];commit();toast('Archive restored','ok')},
 reset:()=>{if(!confirm('Reset all demo data?'))return;S=seed();save();UI.open=null;ME=S.users.find(u=>u.id===ME.id);commit();toast('Demo data reset','ok')},
 retry:()=>refresh()
};
const CHG={
 switchUser:e=>{ME=S.users.find(u=>u.id===e.value);try{sessionStorage.setItem('opsdesk.me',ME.id)}catch(x){}UI.open=null;UI.q='';renderApp();nav('dashboard')},
 status:e=>{const t=find(e.dataset.id),n=e.value;if(n==='Closed'&&t.status!=='Resolved'&&t.status!=='Closed'){toast('Resolve the ticket before closing it','err');return refresh()}
  tl(t,'status','Status '+t.status+' → '+n,ME.name);t.status=n;t.updated=now();commit()},
 assign:e=>{const t=find(e.dataset.id);const to=e.value||null;setOwner(t,to,to?'Manual by '+ME.name:'Manually unassigned by '+ME.name,ME.name);commit();toast(to?'Owner set: '+nameOf(to):'Ticket unassigned','ok')},
 assignQuick:e=>{if(!e.value)return;const t=find(e.dataset.id);setOwner(t,e.value,'Manual by '+ME.name+' from Triage',ME.name);commit();toast('Assigned to '+nameOf(e.value),'ok')},
 intent:e=>{const t=find(e.dataset.id);tl(t,'status','Intent '+intentName(t.intent)+' → '+intentName(e.value),ME.name);t.intent=e.value;commit()},
 theme:e=>{if(!e.value)return;const t=find(e.dataset.id);if(!t.themes.includes(e.value))t.themes.push(e.value);commit()},
 product:e=>{const t=find(e.dataset.id);t.product=e.value.trim().slice(0,40);tl(t,'link','Product/bug link set: '+(t.product||'—'),ME.name);commit()},
 avail:e=>{const u=U(e.dataset.id);u.available=e.checked;commit();toast(u.name+' is now '+(u.available?'online':'away'),'ok')},
 dq:e=>{const k=e.dataset.k;UI.dq[k]=k==='size'?+e.value:k==='archived'?e.checked:e.value;UI.dq.page=0;refresh()},
 agencyPick:e=>{const f=e.closest('form');if(f&&f.region)f.region.value=AG(e.value).region}
};
function updSugg(){
 const f=$('form[data-form="newTicket"]'),b=$('#sugg');if(!f||!b)return;
 const sg=suggestIntent(f.title.value+' '+f.description.value);
 b.querySelector('span').innerHTML=sg?`Suggested intent: <b>${esc(sg.intent.name)}</b> · confidence ${sg.conf}% (rule-based)`:'No strong match — will be filed as General Enquiry unless you pick an intent';
}
const FORMS={
 newTicket:f=>{const errs=newTicket(new FormData(f));if(errs){const b=$('#ferr');b.style.display='block';b.innerHTML=errs.map(e=>'<div>• '+esc(e)+'</div>').join('')}},
 escalate:f=>{const fd=new FormData(f),reason=String(fd.get('reason')||'').trim(),em=String(fd.get('em'));
  if(reason.length<5||!S.users.find(u=>u.id===em&&u.role==='Escalation Manager')){const b=$('#ferr');b.style.display='block';b.textContent='Pick a manager and give a reason (min 5 chars).';return}
  const t=find(f.dataset.id);escalate(t,em,reason,ME.name);UI.modal=null;commit();toast('Escalated to '+nameOf(em),'ok')},
 msg:f=>{const text=String(new FormData(f).get('text')||'').trim();if(!text)return toast('Write something first','err');
  const t=find(UI.open),type=staff()?UI.mode:'external';
  t.comments.push({id:uid(),ts:now(),by:ME.name,type,from:staff()?'staff':'agency',text:text.slice(0,2000)});
  tl(t,type==='internal'?'note':'status',type==='internal'?'Internal note added':(staff()?'Reply sent to agency':'Agency replied'),ME.name);
  if(!staff()&&t.status==='Pending'){t.status='Open';tl(t,'status','Status Pending → Open (agency replied)','System')}
  if(staff()&&type==='external'&&t.status==='Open'){t.status='Pending';tl(t,'status','Status Open → Pending (awaiting agency)','System')}
  t.updated=now();UI.draft='';commit()},
 sidemsg:f=>{const text=String(new FormData(f).get('text')||'').trim();if(!text)return;const t=find(UI.open),sc=t.side.find(s=>s.id===f.dataset.sid);
  sc.msgs.push({ts:now(),by:ME.name,text:text.slice(0,1000)});tl(t,'side','Message sent on "'+sc.subject+'" to '+sc.recipients.length+' explicit recipient(s)',ME.name);commit()},
 addrcp:f=>{const fd=new FormData(f),name=String(fd.get('name')||'').trim(),email=String(fd.get('email')||'').trim();
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Enter a name and a valid email','err');
  const t=find(UI.open),sc=t.side.find(s=>s.id===f.dataset.sid);
  if(sc.recipients.some(r=>r.email.toLowerCase()===email.toLowerCase()))return toast('Already a recipient','err');
  sc.recipients.push({name:name.slice(0,60),email:email.slice(0,80),org:'',type:['Supplier','Agency','Internal'].includes(fd.get('type'))?fd.get('type'):'Supplier'});
  tl(t,'side','Recipient added to "'+sc.subject+'": '+name,ME.name);commit()},
 newside:f=>{const fd=new FormData(f),subject=String(fd.get('subject')||'').trim();const rc=fd.getAll('rc').map(x=>{try{return JSON.parse(x)}catch(e){return null}}).filter(Boolean);
  if(subject.length<3||!rc.length)return toast('Add a subject and at least one recipient','err');
  const t=find(UI.open);t.side.push({id:uid(),subject:subject.slice(0,100),kind:rc.some(r=>r.type==='Supplier')?'Supplier':'Agency',ownerId:t.assigneeId,recipients:rc,msgs:[]});
  tl(t,'side','Side conversation started: "'+subject+'" with '+rc.length+' explicit recipient(s)',ME.name);UI.newSide=false;commit()},
 backlog:f=>{const th=THEMES.find(x=>x.id===UI.theme);const wk=allT().filter(t=>t.created>now()-7*86400000&&t.themes.includes(UI.theme));if(!wk.length)return;
  const prod=String(new FormData(f).get('product')||'').trim().slice(0,40);
  S.backlog.unshift({id:'PB-'+(100+S.backlog.length+1),theme:th.name,product:prod,tickets:wk.map(t=>t.id),ts:now(),by:ME.name});commit();toast('Backlog item raised for '+th.name,'ok')},
 archive:f=>{const d=Math.max(0,Math.min(3650,+new FormData(f).get('days')||0)),lim=now()-d*86400000;
  const mv=S.tickets.filter(t=>t.status==='Closed'&&t.updated<lim);S.tickets=S.tickets.filter(t=>!mv.includes(t));S.archive=S.archive.concat(mv);commit();toast(mv.length+' closed ticket(s) archived','ok')}
};

/* ---------- events ---------- */
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;if(a.classList.contains('ov')&&e.target!==a)return;const f=ACT[a.dataset.act];if(f){if(a.tagName==='A')e.preventDefault();f(a,e)}});
document.addEventListener('change',e=>{const el=e.target.closest('[data-chg]');if(el&&CHG[el.dataset.chg])CHG[el.dataset.chg](el)});
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();if(FORMS[f.dataset.form])FORMS[f.dataset.form](f)});
document.addEventListener('input',e=>{
 if(e.target.id==='q'){UI.q=e.target.value;clearTimeout(window.__qt);window.__qt=setTimeout(()=>{$('#view').innerHTML=VIEWS[UI.view]();},180)}
 else if(e.target.closest('form[data-form="newTicket"]'))updSugg();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(UI.modal){UI.modal=null;refresh()}else if(UI.open){UI.open=null;refresh()}}});
/* realtime-ish: cross-tab sync + SLA clock tick (no re-render while typing) */
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{S=JSON.parse(e.newValue);if(ME)ME=S.users.find(u=>u.id===ME.id)||null;typing()||refresh()}catch(x){}}});
const typing=()=>{const a=document.activeElement;return a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&a.id!=='q'};
setInterval(()=>{if(ME&&!UI.modal&&!UI.loading&&!typing())refresh()},30000);
/* 3D tilt + glare on cards (mouse only) */
let tEl=null;
document.addEventListener('mousemove',e=>{
 const c=e.target.closest?e.target.closest('.card,.hero,.lbox,.ucard'):null;
 if(tEl&&tEl!==c){tEl.style.transform='';tEl=null}
 if(!c||matchMedia('(pointer:coarse)').matches)return;
 const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
 const premium=c.classList.contains('journey-card');
 const max=premium?9:(r.width>560?1.6:r.width>300?5:9);
 c.style.setProperty('--gx',(x*100).toFixed(1)+'%');c.style.setProperty('--gy',(y*100).toFixed(1)+'%');
 c.style.transform='perspective(1100px) rotateX('+((.5-y)*max).toFixed(2)+'deg) rotateY('+((x-.5)*max*1.35).toFixed(2)+'deg) translateY('+(premium?-5:0)+'px) translateZ('+(premium?18:0)+'px)';
 tEl=c;
});
document.addEventListener('mouseleave',()=>{if(tEl){tEl.style.transform='';tEl=null}});

/* OpsDesk Night Shift: bundled original Halloween-inspired ambient loop. */
(()=>{
 const makeControl=()=>{
  if(document.querySelector('.ambient-control')) return;
  const box=document.createElement('div'); box.className='ambient-control';
  box.innerHTML='<span class="audio-moon" aria-hidden="true">🌙</span><div class="audio-meta"><b>Night Shift</b><small>Halloween ambient · soft loop</small></div><button type="button" data-audio-toggle aria-pressed="false">▶ Play</button><input aria-label="Music volume" type="range" min="0" max="100" value="12"><audio data-ops-audio src="assets/night-shift-ambient.wav" preload="none" loop></audio>';
  document.body.appendChild(box);
  const btn=box.querySelector('[data-audio-toggle]'), vol=box.querySelector('input'), audio=box.querySelector('audio');
  audio.volume=0.12;
  btn.addEventListener('click',async()=>{
   if(!audio.paused){audio.pause();btn.textContent='▶ Play';btn.setAttribute('aria-pressed','false');return;}
   try{await audio.play();btn.textContent='Ⅱ Pause';btn.setAttribute('aria-pressed','true');}
   catch(err){btn.textContent='▶ Retry';toast('Audio could not start. Check browser sound permissions.','err');}
  });
  audio.addEventListener('pause',()=>{btn.textContent='▶ Play';btn.setAttribute('aria-pressed','false');});
  audio.addEventListener('play',()=>{btn.textContent='Ⅱ Pause';btn.setAttribute('aria-pressed','true');});
  vol.addEventListener('input',()=>{audio.volume=Number(vol.value)/100;});
 };
 if(document.readyState!=='loading')makeControl();
 else document.addEventListener('DOMContentLoaded',makeControl,{once:true});
})();

renderApp();if(ME)nav(UI.view);
