// MF Borges Tycoon - mobile-first UI layer. Re-homes the existing panels into:
// top HUD, bottom tab bar, bottom sheets, placement bar, closable colour-coded toasts.
// Loaded after the game script (shares its top-level state) and account.js.
(()=>{
'use strict';
const E=id=>document.getElementById(id),B=document.body;
if(!E('dock')||!E('hud')||!E('tabs'))return;
B.classList.add('u2');
window.BMODE=false;
const stage=E('stage'),dock=E('dock'),tabs=E('tabs'),hud=E('hud');
const mk=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const vib=p=>{try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}};
const panelMode=()=>matchMedia('(min-width:860px),(orientation:landscape) and (max-height:540px)').matches;

// ---------- sheet structure ----------
const PN={tb:['Build','🏗'],tq:['Goals','🎯'],tn:['Night shift','🌙'],ta:['Acts & collection','🎸'],tm:['More','☰'],tg:['View & places','🧭'],ts:['Settings','⚙️'],ti:['Venue info','📊']};
const ORIG=['tb','tq','tn','ta','tg','ts'],SUB={tg:1,ts:1,ti:1};
const grab=mk('div','grab','<i></i>'),head=mk('div','sh-head','<button id="shb" aria-label="Back" hidden>‹</button><h2 id="sht"></h2><button id="shx" aria-label="Close">✕</button>'),body=mk('div','sh-body');
dock.insertBefore(grab,dock.firstChild);dock.insertBefore(head,grab.nextSibling);dock.insertBefore(body,head.nextSibling);
for(const id of ['tb','tq','tn','ta','tg','ts'])body.appendChild(E(id));
const tm=mk('div','',''),ti=mk('div','','');tm.id='tm';ti.id='ti';tm.hidden=ti.hidden=true;body.append(tm,ti);
ti.appendChild(E('lims'));E('lims').style.cssText='display:block';
stage.appendChild(E('msgw'));
dock.dataset.s='closed';

// ---------- More menu ----------
function moreRows(){
  const acc=window.mfbAccount;
  const rows=[['tg','🧭','View & places','Camera presets, rooms, top view, minimap','#4aa3ff'],['ti','📊','Venue info','Capacity, storage, queues and limits','#2cc3c3'],['ts','⚙️','Settings','Sound, graphics, crowd and labels','#8d93a8'],['acc','👤',acc?acc.title():'Account & saves',acc?acc.sub():'Guest','#ec5fa3'],['leg','📜','Privacy & terms','How your data is handled','#9b6bff']];
  tm.innerHTML='';
  const logo=mk('div','','');logo.style.cssText='display:flex;justify-content:center;padding:4px 0 12px';const li=E('logoimg');li.style.height='26px';logo.appendChild(li);tm.appendChild(logo);
  for(const [id,ic,t,s,col] of rows){const b=mk('button','mrow','<span class="ic">'+ic+'</span><span><b></b><small></small></span><span class="ch">›</span>');b.style.setProperty('--mc',col);b.querySelector('b').textContent=t;b.querySelector('small').textContent=s;
    b.onclick=()=>{vib(8);if(id==='acc'){if(acc)acc.menu();}else if(id==='leg')window.open('legal.html#privacy','_blank','noopener');else openPane(id);};tm.appendChild(b);}
}

// ---------- pane + sheet control ----------
let cur='tb',sheetState='closed',tabIdx=Object.fromEntries(ORIG.map((k,i)=>[k,i]));
function setSheet(s){
  sheetState=s;dock.style.transition='';dock.style.transform='';dock.dataset.s=s;B.classList.toggle('sheet',s!=='closed');
  dock.setAttribute('aria-hidden',s==='closed'?'true':'false');syncNav();
}
function openPane(id,state){
  cur=id;
  if(id in tabIdx)tabs.children[tabIdx[id]].click();
  for(const k of ORIG)E(k).hidden=k!==id;
  tm.hidden=id!=='tm';ti.hidden=id!=='ti';
  if(id==='tm')moreRows();
  E('sht').textContent=PN[id][0];E('shb').hidden=!SUB[id];dock.dataset.p=SUB[id]?'tm':id;
  body.scrollTop=0;subtitle();
  setSheet(state||(sheetState==='closed'?'half':sheetState));
  if(id==='tb'&&sheetState!=='closed')hideCoach();
}
const grp=id=>SUB[id]?'tm':id;
E('shx').onclick=()=>{vib(8);setSheet('closed');};
E('shb').onclick=()=>openPane('tm');

// bottom nav
const nav=mk('nav','','');nav.id='nav2';nav.setAttribute('aria-label','Main');
for(const id of ['tb','tq','tn','ta','tm']){const b=mk('button','','<span class="ic">'+PN[id][1]+'</span><span>'+(id==='tn'?'Night':id==='ta'?'Acts':PN[id][0])+'</span><i class="dot"></i>');b.dataset.p=id;b.setAttribute('aria-label',PN[id][0]);
  b.onclick=()=>{vib(8);if(sheetState!=='closed'&&grp(cur)===id){setSheet('closed');}else openPane(id);};nav.appendChild(b);}
B.appendChild(nav);
function syncNav(){for(const b of nav.children)b.classList.toggle('on',sheetState!=='closed'&&grp(cur)===b.dataset.p);}

// drag the sheet (phones in portrait)
(()=>{
  let y0=0,t0=0,base=0,dh=0,drag=false,lastY=0,lastT=0,v=0;
  const offs=()=>{dh=dock.offsetHeight;const half=Math.min(innerHeight*.52+ (parseFloat(getComputedStyle(B).getPropertyValue('--nav-h'))||62),dh);return {full:0,half:Math.max(0,dh-half),closed:dh};};
  const down=e=>{if(panelMode()||e.target.closest('button'))return;drag=true;y0=lastY=e.clientY;t0=lastT=performance.now();v=0;const o=offs();base=o[sheetState];dock.style.transition='none';try{e.currentTarget.setPointerCapture(e.pointerId);}catch(x){}};
  const move=e=>{if(!drag)return;const o=offs(),ny=Math.max(0,Math.min(o.closed,base+e.clientY-y0));dock.style.transform='translateY('+ny+'px)';const n=performance.now();v=(e.clientY-lastY)/Math.max(1,n-lastT);lastY=e.clientY;lastT=n;};
  const up=e=>{if(!drag)return;drag=false;const o=offs(),cy=Math.max(0,Math.min(o.closed,base+e.clientY-y0));let s;
    if(v>.6)s=sheetState==='full'?'half':'closed';else if(v<-.6)s='full';else{s='full';let d=Math.abs(cy-o.full);for(const k of ['half','closed']){const dd=Math.abs(cy-o[k]);if(dd<d){d=dd;s=k;}}}
    setSheet(s);};
  for(const h of [grab,head]){h.addEventListener('pointerdown',down);h.addEventListener('pointermove',move);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);}
  grab.addEventListener('click',()=>{if(Math.abs(lastY-y0)<4&&!panelMode())setSheet(sheetState==='half'?'full':'half');});
})();

// ---------- top HUD ----------
const spd=mk('button','px','');spd.id='spd';spd.setAttribute('aria-label','Game speed');hud.appendChild(spd);
spd.onclick=()=>{vib(8);const order=[2,4,1,0],i=order.indexOf(S.speed);const n=order[(i+1)%order.length];E('v'+n).click();};
const SPL={0:'⏸',1:'▶',2:'▶▶',4:'▶▶▶'};
const tick=()=>{const h=hud.getBoundingClientRect();B.style.setProperty('--tick',(h.bottom+6)+'px');};
new ResizeObserver(tick).observe(hud);addEventListener('resize',tick);tick();
// ticker: tap to expand, swipe or tap x to dismiss until the next message
const mw=E('msgw');let lastLog='',hideLog=false;
mw.addEventListener('click',()=>mw.classList.toggle('ex'));
(()=>{let x0=0,dx=0,on=false;
  mw.addEventListener('pointerdown',e=>{on=true;x0=e.clientX;dx=0;});
  mw.addEventListener('pointermove',e=>{if(!on)return;dx=e.clientX-x0;if(Math.abs(dx)>6)mw.style.transform='translateX('+dx+'px)';});
  const end=()=>{if(!on)return;on=false;if(Math.abs(dx)>70){hideLog=true;mw.style.display='none';}mw.style.transform='';};
  mw.addEventListener('pointerup',end);mw.addEventListener('pointercancel',end);})();

// camera controls behind a floating button
const ctl=E('ctl'),cf=mk('button','','🎥');cf.id='camfab';cf.setAttribute('aria-label','Camera');stage.appendChild(cf);
cf.onclick=()=>{vib(8);ctl.classList.toggle('open');cf.classList.toggle('on',ctl.classList.contains('open'));};
// minimap lives in View & places on phones, floating on wide screens
const mm=E('mm');
function placeMM(){if(panelMode()){if(mm.parentNode!==stage)stage.appendChild(mm);}else{const g=E('tg');if(mm.parentNode!==g)g.insertBefore(mm,g.firstChild);}}
matchMedia('(min-width:860px),(orientation:landscape) and (max-height:540px)').addEventListener('change',()=>{placeMM();setSheet(sheetState);});placeMM();

// ---------- toasts: colour-coded, closable, swipe to dismiss ----------
const tw=mk('div','');tw.id='toasts';tw.setAttribute('role','status');tw.setAttribute('aria-live','polite');stage.appendChild(tw);
const KIND=[['t-danger','Alert',/👮|⚠|🚨|❌|🔥|🚔|🚫|💥|☠/],['t-love','Love',/💕|❤|💘|😍|💞|💑|🥰/],['t-gossip','Gossip',/🗣|💬|🤫|📢|👂/],['t-music','Music',/🎸|🎤|🎭|🎶|🎵|🎧|🥁|🎷|🎺|🎻|🪘/],['t-money','Money',/🪙|💰|💶|💵|💸|€|🧾/],['t-build','Build',/🏗|🏪|🔨|🔧|🧱/],['t-level','Level',/⭐|🏆|🏅|🎉|🌟|🥇|✨/],['t-people','People',/👥|🚶|🐕|🐶|🐱|🐾|🧑|👋|🙋/]];
function kindOf(m,i){const s=(i||'')+' '+m;for(const k of KIND)if(k[2].test(s))return k;return ['t-info','Info',null];}
function dismiss(e){if(e._d)return;e._d=1;e.classList.add('out');setTimeout(()=>e.remove(),230);}
window.toast=function(m,i){
  i=i||'💬';const k=kindOf(m,i),e=mk('div','tn '+k[0]);
  e.innerHTML='<span class="ti"></span><span class="tx"><small></small><span class="mm"></span></span><button class="tc" aria-label="Dismiss">✕</button>';
  e.querySelector('.ti').textContent=i;e.querySelector('small').textContent=k[1];e.querySelector('.mm').textContent=m;
  e.querySelector('.tc').onclick=()=>dismiss(e);
  let x0=0,dx=0,on=false,timer=setTimeout(()=>dismiss(e),5200);
  e.addEventListener('pointerdown',ev=>{if(ev.target.closest('.tc'))return;on=true;x0=ev.clientX;dx=0;clearTimeout(timer);e.style.transition='none';});
  e.addEventListener('pointermove',ev=>{if(!on)return;dx=ev.clientX-x0;e.style.transform='translateX('+dx+'px)';e.style.opacity=Math.max(.2,1-Math.abs(dx)/260);});
  const end=()=>{if(!on)return;on=false;e.style.transition='';if(Math.abs(dx)>60){e.style.transform='translateX('+(dx>0?400:-400)+'px)';dismiss(e);}else{e.style.transform='';e.style.opacity='';timer=setTimeout(()=>dismiss(e),3200);}};
  e.addEventListener('pointerup',end);e.addEventListener('pointercancel',end);
  tw.appendChild(e);while(tw.children.length>3)dismiss(tw.firstChild);
};

// ---------- placement mode ----------
const pb=mk('div','','<span class="pi" id="pbi"></span><div class="pt"><b id="pbn"></b><small id="pbc"></small></div><button id="pbr" aria-label="Rotate stall">↻</button><button id="pbx" aria-label="Done placing">✓</button>');pb.id='pbar';stage.appendChild(pb);
function pbUpdate(){if(!window.BMODE)return;const d=ST[S.sel];if(!d)return;E('pbi').textContent=d[12];E('pbn').textContent=d[0];
  const ok=S.cash>=d[6]&&S.lv>=d[10],c=E('pbc');c.className=ok?'':'bad';
  c.textContent=(S.lv<d[10]?'Locked until level '+d[10]:'€'+d[6]+(S.cash<d[6]?' - not enough cash':'')+' · facing '+FACE[(S.brot||0)%4]+' · tap a free tile');}
function enterBM(){window.BMODE=true;B.classList.add('bm');if(!panelMode())setSheet('closed');pbUpdate();}
function exitBM(){window.BMODE=false;B.classList.remove('bm');}
E('pbx').onclick=()=>{vib(8);exitBM();};
E('pbr').onclick=()=>{vib(8);S.brot=((S.brot||0)+1)%4;pbUpdate();};
E('cards').addEventListener('click',e=>{const b=e.target.closest('.card');if(!b)return;const i=+b.id.slice(2),d=ST[i];if(!d)return;
  if(S.lv<d[10]){toast('Unlocks at level '+d[10]+': '+d[0],'🔒');return;}
  vib(8);enterBM();});
// colour-code the catalogue
const CI={food:'🍽',drink:'🍺',craft:'🧶',cloth:'👕',body:'🎨',shop:'🛍',amen:'🚻',lure:'📣'};
for(const [k] of CATS){const b=E('c_'+k);if(b&&!b.dataset.i){b.dataset.i=1;b.textContent=(CI[k]||'')+' '+b.textContent;}}
ST.forEach((d,i)=>{const b=E('k_'+i);if(b)b.dataset.cat=d[1];});

// ---------- hooks into the game ----------
const _openSP=openSP;openSP=function(o){setSheet('closed');return _openSP(o);};
const _ui=ui;
ui=function(){_ui.apply(this,arguments);try{ui2();}catch(e){}};
function subtitle(){const el=head.querySelector('h2'),old=el.querySelector('small');if(old)old.remove();
  let t='';if(cur==='tb')t='Stalls '+nStalls()+'/'+maxS()+' · Level '+S.lv+' · €'+Math.round(S.cash);else if(cur==='tn')t=DN[dow()]+' · '+(S.ph==='night'?'Event running':'Plan tonight');
  if(t){const s=document.createElement('small');s.textContent=t;el.appendChild(s);}}
function ui2(){
  spd.textContent=SPL[S.speed]||'▶▶';spd.classList.toggle('on',S.speed===0);
  if(S.log!==lastLog){lastLog=S.log;if(hideLog){hideLog=false;}mw.style.display='';}
  subtitle();if(window.BMODE)pbUpdate();
  const dn=nav.querySelector('[data-p=tn] .dot');dn.classList.toggle('on',S.ph==='changeover');dn.classList.toggle('pulse',S.ph==='changeover');
  if(S.over&&window.BMODE)exitBM();
}
const _sfx=sfx;sfx=function(n){if(n==='build')vib(18);else if(n==='bad')vib([25,40,25]);else if(n==='goal')vib([12,30,12]);return _sfx.apply(this,arguments);};
// the closing of a night report and game over use the same bottom-sheet style (CSS only)

// first-run coach tip
const co=mk('div','','Tap <b>Build</b> to place your first stall');co.id='coach';B.appendChild(co);
function hideCoach(){co.classList.remove('on');try{localStorage.setItem('mfb_coach','1');}catch(e){}}
let seen=false;try{seen=!!localStorage.getItem('mfb_coach');}catch(e){}
if(!seen)setTimeout(()=>{if(sheetState==='closed')co.classList.add('on');},2500);
nav.addEventListener('click',()=>co.classList.remove('on'));

// keyboard: Esc closes the topmost layer
addEventListener('keydown',e=>{if(e.key==='Escape'){if(window.BMODE)exitBM();else if(sheetState!=='closed')setSheet('closed');}});

openPane('tb','closed');setSheet('closed');moreRows();ui2();
window.mfbUI={openPane,setSheet,enterBM,exitBM};
})();
