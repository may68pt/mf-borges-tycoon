// MF Borges Tycoon - player accounts and saved games.
// Guest mode: save lives in this browser (localStorage). Signed-in mode: save lives in the player's
// private cloud row (Supabase Auth with OpenID Connect + Postgres Row Level Security, EU region).
// Loaded after the main game script (shares its top-level state: S, stalls, ST, init, ...).
(()=>{
'use strict';
const CFG=window.MFB_CFG||{},POLICY=CFG.policyVersion||'1',LKEY='mfb_save',CKEY='mfb_consent';
const E=id=>document.getElementById(id);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=(m,i)=>{try{toast(m,i||'💾');}catch(e){}};
let cloudOn=false;
const SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
const loadSDK=()=>new Promise(res=>{if(window.supabase)return res(true);const t=document.createElement('script');t.src=SDK;t.crossOrigin='anonymous';t.onload=()=>res(true);t.onerror=()=>res(false);document.head.appendChild(t);});
let sb=null,user=null,armed=false,suppress=false,lastSig='',lastCloud=0,busy=false,cloudRow=null;

// ---------- snapshot / restore ----------
function snap(){
  const s=JSON.parse(JSON.stringify(S));
  s.ph='setup';s.t=540;s.speed=2;s.over=false;s.att=[0,0,0];s.barOn=[0,0,0,0];s.gig=0;s.evt=0;
  const st=[...stalls.values()].map(o=>({i:o.i,x:o.x,z:o.z,rot:o.rot||0,u:{eq:o.u.eq|0,st:o.u.st|0,sg:o.u.sg|0},tot:+o.tot||0,cnt:+o.cnt||0}));
  return {v:1,savedAt:new Date().toISOString(),day:S.day,cash:Math.round(S.cash),S:s,stalls:st};
}
const sigOf=p=>JSON.stringify({S:p.S,s:p.stalls});
function valid(p){
  if(!p||typeof p!=='object'||p.v!==1||!p.S||typeof p.S!=='object'||!Array.isArray(p.stalls))return false;
  if(!Number.isFinite(p.S.day)||p.S.day<1||p.S.day>(p.S.mode==='classic'?DAYS+1:100000)||!Number.isFinite(p.S.cash)||p.stalls.length>300)return false;
  const seen=new Set();
  for(const r of p.stalls){
    if(!r||!Number.isInteger(r.i)||r.i<0||r.i>=ST.length||!Number.isInteger(r.x)||!Number.isInteger(r.z)||r.x<0||r.z<0||r.x>=W||r.z>=H)return false;
    const k=r.x+','+r.z;if(seen.has(k))return false;seen.add(k);
  }
  return true;
}
function apply(p){
  suppress=true;
  try{
    init();
    const keys=Object.keys(S).concat(['anim','anPaid']);
    for(const k of keys){
      if(!Object.prototype.hasOwnProperty.call(p.S,k))continue;
      const a=p.S[k],b=S[k];
      if(b!==undefined&&typeof a!==typeof b)continue;
      if(typeof a==='function')continue;
      S[k]=a;
    }
    S.ph='setup';S.t=540;S.over=false;S.speed=2;S.log=String(S.log||'').replace(/ Setup: .*$/,'');
    for(const r of p.stalls){
      const m=mkStall(r.i);m.position.set(r.x+.5,gy(r.x+.5,r.z+.5),r.z+.5);m.rotation.y=(r.rot|0)*Math.PI/2;sc.add(m);
      const u=r.u||{};
      const so={i:r.i,m,x:r.x,z:r.z,acc:Math.random(),busy:0,u:{eq:u.eq|0,st:u.st|0,sg:u.sg|0},pz:1,tot:+r.tot||0,cnt:+r.cnt||0,off:0,rot:r.rot|0,st:'setup',sc:.01,slot:null,k:null,d:0,pr:1,goal:null,wp:null,ph:0,crate:null};
      m.scale.setScalar(.01);stalls.set(r.x+','+r.z,so);addMark(so);
    }
    morning();reskin(0);dressMgr(0);ui();
  }finally{suppress=false;}
  lastSig=sigOf(snap());
}

// ---------- local (guest) save ----------
const localGet=()=>{try{const p=JSON.parse(localStorage.getItem(LKEY)||'null');return valid(p)?p:null;}catch(e){return null;}};
const localPut=p=>{try{localStorage.setItem(LKEY,JSON.stringify(p));return true;}catch(e){return false;}};
const localDel=()=>{try{localStorage.removeItem(LKEY);}catch(e){}};
const consent=()=>{try{return JSON.parse(localStorage.getItem(CKEY)||'null');}catch(e){return null;}};

// ---------- cloud save ----------
async function cloudGet(){
  if(!sb||!user)return null;
  const {data,error}=await sb.from('game_saves').select('data,day,updated_at').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  return data&&valid(data.data)?{p:data.data,at:data.updated_at}:null;
}
async function cloudPut(p){
  const c=consent()||{};
  const row={user_id:user.id,data:p,day:p.day,schema_version:1,consent_version:c.v||POLICY,consent_at:c.at||new Date().toISOString()};
  const {error}=await sb.from('game_saves').upsert(row,{onConflict:'user_id'});
  if(error)throw error;
}
async function save(manual){
  if(!armed||suppress||busy||!S||S.over)return;
  const p=snap(),sig=sigOf(p);
  if(!manual&&sig===lastSig)return;
  if(user){
    if(!manual&&Date.now()-lastCloud<15000)return;
    busy=true;
    try{await cloudPut(p);lastCloud=Date.now();lastSig=sig;if(manual)say('Saved to your account','☁️');}
    catch(e){say('Could not save to the cloud - will retry','⚠️');}
    finally{busy=false;refresh();}
  }else{
    if(localPut(p)){lastSig=sig;if(manual)say('Saved on this device','💾');}
    else if(manual)say('This browser blocked saving','⚠️');
    refresh();
  }
}

// ---------- UI ----------
const css=document.createElement('style');
css.textContent=`#acm{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(10,12,20,.82);padding:14px;z-index:40}
#acm>div{background:var(--pn);border:3px solid var(--br);padding:16px;max-width:420px;width:100%;max-height:92%;overflow:auto;font-size:12px;line-height:1.45}
#acm h3{margin:0 0 8px;font-size:14px}#acm .b{display:block;width:100%;margin:6px 0;padding:9px;text-align:left}
#acm .b.pri{background:var(--ac);color:#fff;border-color:var(--ac)}#acm .b[disabled]{opacity:.4}
#acm label.c{display:flex;gap:8px;align-items:flex-start;margin:10px 0;font-size:11px}#acm input[type=email],#acm input[type=text]{width:100%;padding:7px;margin:4px 0;box-sizing:border-box}
#acm .m{opacity:.75;font-size:11px}#acm a{color:var(--ac)}#accb{pointer-events:auto;padding:2px 7px}`;
document.head.appendChild(css);
const M=document.createElement('div');M.id='acm';E('stage').appendChild(M);
let onClose=null;
function open(html,close){M.innerHTML='<div>'+html+'</div>';M.style.display='flex';onClose=close||null;}
function shut(){M.style.display='none';M.innerHTML='';const f=onClose;onClose=null;if(f)f();}
const when=iso=>{try{return new Date(iso).toLocaleString();}catch(e){return iso;}};
const desc=(p,at)=>(p.S.mode==='classic'?'Day '+Math.min(p.S.day,DAYS)+'/'+DAYS:'Day '+p.S.day+' · '+(p.S.star||5)+'★')+' · €'+Math.round(p.S.cash)+' · '+BL.filter(x=>p.S.band&&p.S.band[x.id]&&p.S.band[x.id].plays>0).length+' acts · '+(p.stalls.length)+' stalls<br><span class="m">saved '+esc(when(at||p.savedAt))+'</span>';
const legal='<a href="'+esc(CFG.legalUrl||'legal.html')+'#privacy" target="_blank" rel="noopener">Privacy Policy</a> and <a href="'+esc(CFG.legalUrl||'legal.html')+'#terms" target="_blank" rel="noopener">Terms</a>';

function signInView(){
  const provs=(CFG.providers||[]).map(p=>'<button class="b pri" data-a="oauth" data-p="'+esc(p)+'" disabled>Continue with '+esc(p[0].toUpperCase()+p.slice(1))+'</button>').join('');
  const mail=CFG.magicLink?'<input type="email" id="acem" placeholder="you@example.com" autocomplete="email" maxlength="254"><button class="b" data-a="magic" disabled>Email me a sign-in link</button>':'';
  open('<h3 class="px">Sign in to save your progress</h3><p>One click, no password to remember. We store only your sign-in ID, your email address and your game progress.</p>'
   +'<label class="c"><input type="checkbox" id="accon"><span>I am 16 or older and I accept the '+legal+'.</span></label>'+provs+mail
   +'<button class="b" data-a="back">Back</button>');
  const cb=E('accon');cb.onchange=()=>{M.querySelectorAll('[data-a=oauth],[data-a=magic]').forEach(b=>b.disabled=!cb.checked);};
}
function menuView(){
  if(!cloudOn){open('<h3 class="px">Your game</h3><p>Progress is saved on this device. Cloud accounts are not enabled yet.</p><button class="b pri" data-a="savenow">Save now</button><button class="b" data-a="close">Close</button><p class="m">Saves resume at the start of the current day. '+legal+'.</p>');return;}
  if(user){
    open('<h3 class="px">Your account</h3><p>Signed in as <b>'+esc(user.email||'player')+'</b>. Progress saves automatically every morning and when you leave.</p>'
     +'<button class="b pri" data-a="savenow">Save now</button><button class="b" data-a="export">Download my data</button><button class="b" data-a="out">Sign out</button><button class="b" data-a="del">Delete my account and data</button><button class="b" data-a="close">Close</button><p class="m">'+legal+'.</p>');
  }else{
    open('<h3 class="px">Your game</h3><p>You are playing as a guest: progress is saved on this device only.</p><button class="b pri" data-a="signin">Sign in to save online</button><button class="b" data-a="savenow">Save on this device now</button><button class="b" data-a="close">Close</button><p class="m">'+legal+'.</p>');
  }
}
function delView(){
  open('<h3 class="px">Delete account</h3><p>This permanently deletes your account, your sign-in record and your saved game from our servers. It cannot be undone. Type <b>DELETE</b> to confirm.</p><input type="text" id="acdel" autocomplete="off"><button class="b" data-a="delgo">Delete everything</button><button class="b" data-a="menu">Cancel</button>');
}
async function startView(local,cloud){
  const rows=[];
  if(cloud)rows.push('<button class="b pri" data-a="useCloud">Continue your online game<br>'+desc(cloud.p,cloud.at)+'</button>');
  if(local)rows.push('<button class="b'+(cloud?'':' pri')+'" data-a="useLocal">Continue '+(cloud?'the game on this device':'your saved game')+'<br>'+desc(local)+'</button>');
  rows.push('<button class="b'+(rows.length?'':' pri')+'" data-a="new">Start a new game</button>');
  let head='<h3 class="px">MF Borges Tycoon</h3>';
  if(user)head+='<p class="m">Signed in as '+esc(user.email||'player')+'</p>';
  else if(cloudOn)rows.push('<button class="b" data-a="signin">Sign in to save online</button>');
  open(head+rows.join('')+'<p class="m">'+legal+'.</p>');
}

let ctx={local:null,cloud:null};
async function afterGate(){armed=true;if(S)S.speed=2;ui();}
M.addEventListener('click',async e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  const a=b.dataset.a;
  try{
    if(a==='close'){shut();}
    else if(a==='menu'){menuView();}
    else if(a==='back'){if(!armed)await startView(ctx.local,ctx.cloud);else menuView();}
    else if(a==='signin'){signInView();}
    else if(a==='savenow'){await save(true);}
    else if(a==='new'){onClose=null;shut();init();await afterGate();}
    else if(a==='useLocal'){onClose=null;shut();apply(ctx.local);await afterGate();if(user)save(true);}
    else if(a==='useCloud'){onClose=null;shut();apply(ctx.cloud.p);await afterGate();}
    else if(a==='oauth'||a==='magic'){
      if(!E('accon').checked)return;
      try{localStorage.setItem(CKEY,JSON.stringify({v:POLICY,at:new Date().toISOString()}));}catch(x){}
      if(a==='oauth'){
        const {error}=await sb.auth.signInWithOAuth({provider:b.dataset.p,options:{redirectTo:location.origin+location.pathname}});
        if(error)throw error;
      }else{
        const em=(E('acem').value||'').trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)||em.length>254){say('Enter a valid email','✉️');return;}
        const {error}=await sb.auth.signInWithOtp({email:em,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});
        if(error)throw error;
        open('<h3 class="px">Check your inbox</h3><p>We sent a sign-in link to <b>'+esc(em)+'</b>. Open it on this device to continue.</p><button class="b" data-a="close">OK</button>');
      }
    }
    else if(a==='out'){await save(true);await sb.auth.signOut();location.reload();}
    else if(a==='export'){await exportData();}
    else if(a==='del'){delView();}
    else if(a==='delgo'){
      if((E('acdel').value||'').trim()!=='DELETE'){say('Type DELETE to confirm','⚠️');return;}
      const {error}=await sb.rpc('delete_my_account');if(error)throw error;
      await sb.auth.signOut().catch(()=>{});localDel();try{localStorage.removeItem(CKEY);}catch(x){}
      open('<h3 class="px">Account deleted</h3><p>Your account and saved game were deleted.</p><button class="b" data-a="reload">OK</button>');
    }
    else if(a==='reload'){location.reload();}
  }catch(err){say((err&&err.message)||'Something went wrong','⚠️');}
});
async function exportData(){
  const out={exportedAt:new Date().toISOString(),account:{id:user.id,email:user.email,createdAt:user.created_at,provider:(user.app_metadata||{}).provider},cloudSave:null,deviceSave:localGet()};
  const c=await cloudGet();if(c)out.cloudSave={savedAt:c.at,data:c.p};
  const u=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=u;a.download='mf-borges-tycoon-my-data.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
}

// account entry point used by the More menu (ui.js)
function refresh(){}
window.mfbAccount={menu:()=>{if(M.style.display!=='flex')menuView();},title:()=>user?'Your account':'Account & saves',sub:()=>user?(user.email||'Signed in'):(cloudOn?'Guest - sign in to save online':'Guest - saved on this device')};

// ---------- hooks ----------
const _nd=newDay;
newDay=function(){const r=_nd.apply(this,arguments);if(armed&&!suppress)setTimeout(()=>save(false),0);return r;};
setInterval(()=>save(false),60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save(false);});
window.addEventListener('pagehide',()=>{if(armed&&!user&&!S.over)localPut(snap());else save(false);});

// ---------- start-up ----------
(async()=>{
  if(S)S.speed=0;
  let local=localGet(),cloud=null;
  if(CFG.supabaseUrl&&CFG.supabaseAnonKey){cloudOn=await loadSDK()&&!!(window.supabase&&window.supabase.createClient);if(!cloudOn)say('Account service unavailable - playing as guest','⚠️');}
  if(cloudOn){
    try{
      sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey,{auth:{flowType:'pkce',autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
      const {data}=await sb.auth.getSession();user=data.session?data.session.user:null;
      sb.auth.onAuthStateChange((ev,s)=>{user=s?s.user:null;refresh();});
      if(user)cloud=await cloudGet();
    }catch(e){say('Account service unavailable - playing as guest','⚠️');user=null;}
  }
  refresh();ctx={local,cloud};
  if(local||cloud||cloudOn){await startView(local,cloud);}
  else{armed=true;if(S)S.speed=2;ui();}
  if(!local&&!cloud&&!cloudOn)return;
})();
})();
