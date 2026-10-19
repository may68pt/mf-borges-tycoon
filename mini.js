/* Stall mini-tycoons: every stall with a business gets a little Roblox-tycoon style game.
   Customers queue with orders (items A/B/C); you make the items with a template that fits the stall
   (grill, pour, shake, slice, craft, fold, assemble, draw, memory), earn Tips, and spend Tips on workers, gear,
   menu and the real stall upgrades (equipment / staff / signage). Opened from the stall panel. */
(function(){
'use strict';
if(window.__mg)return;window.__mg=1;

/* ---------- persistent data (separate from the account save) ---------- */
var MGK='mfb_mg',MG={tips:0,t:{}};
try{var _m=JSON.parse(localStorage.getItem(MGK)||'null');if(_m&&typeof _m==='object'){MG.tips=+_m.tips||0;MG.t=_m.t||{};}}catch(e){}
var dirty=false;function sv(){try{localStorage.setItem(MGK,JSON.stringify(MG));}catch(e){}dirty=false;}
setInterval(function(){if(dirty)sv();},5000);
function rec(i){var r=MG.t[i];if(!r)r=MG.t[i]={w:0,g:0,m:0};return r;}

/* ---------- stall -> template / kit ---------- */
var TN={grill:'Grill station',assemble:'Serving counter',pour:'Pour station',shake:'Shaker bar',slice:'Chopping board',craft:'Workbench',fold:'Rack & fold',draw:'Studio',memory:'Reading table'};
function tpl(i){var d=ST[i],n=d[0],v=d[11],c=d[1];if(!(d[7]>0)||c==='lure')return null;
  if(/Tarot|Palm reader/.test(n))return 'memory';
  if(v==='cook'||v==='flip')return 'grill';if(v==='pour')return 'pour';if(v==='shake')return 'shake';if(v==='slice')return 'slice';if(v==='scoop')return 'assemble';
  if(v==='fold')return c==='body'?'craft':'fold';if(v==='serve')return c==='cloth'?'fold':'assemble';
  if(v==='craft'||v==='press')return 'craft';if(v==='draw'||v==='tattoo'||v==='pose')return 'draw';return null;}
var POOL={food:['🥤','🍟','🥗','🍋','🌶️','🧂','🍅','🧅'],drink:['🧊','🍋','🍓','🌿','🍯','🍊','🫐']};
var TINT=[['#e5442f','Red'],['#2f6db5','Blue'],['#e0a81f','Gold']];
var DES=['🌹','🦋','⭐','🐉','🌙','☀️','⚓','🦅','🌸'];
var STEPS={craft:['Shape','Decorate','Finish'],cloth:['Measure','Cut','Stitch'],body:['Prep','Style','Finish'],shop:['Open','Fix','Test'],amen:['Open','Fix','Test']};
function kit(i,t){var d=ST[i],e=d[12],c=d[1];
  if(t==='draw'||t==='memory')return [0,1,2].map(function(k){return {id:k,e:DES[(i+k*3)%DES.length]};});
  if(c==='food'||c==='drink'){var p=POOL[c],a=p[i%p.length],b=p[(i*3+2)%p.length];if(b===a)b=p[(i*3+3)%p.length];return [{id:0,e:e},{id:1,e:a},{id:2,e:b}];}
  return TINT.map(function(x,k){return {id:k,e:e,bg:x[0],n:x[1]};});}
function unit(i){return Math.max(1,Math.round(ST[i][7]/20));}
function hexs(n){var s=(n>>>0).toString(16);while(s.length<6)s='0'+s;return '#'+s;}
var CUS=['🧑','👩','👨','🧓','👵','🧒','💁','🧔','👱','🧑‍🎤','🕺','💃'];
function snd(n){try{if(typeof sfx==='function')sfx(n);}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ---------- styles ---------- */
var css=[
'#mg{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;color:#f5f0e6;font-family:inherit;touch-action:manipulation;user-select:none;-webkit-user-select:none;background:linear-gradient(rgba(10,12,28,.68),rgba(10,12,28,.9)),var(--sc-tb) center top/cover no-repeat,#0f1020;image-rendering:pixelated}',
'#mg *{box-sizing:border-box}',
'#mg .mg-w{width:100%;max-width:560px;height:100%;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + 6px) 8px calc(env(safe-area-inset-bottom,0px) + 8px)}',
'#mg .mg-top{display:flex;align-items:center;gap:6px;flex:none}',
'#mg .mg-ttl{flex:1;min-width:0;font-weight:900;font-size:13px;line-height:1.15;font-family:inherit;text-shadow:2px 2px 0 #000}',
'#mg .mg-ttl small{display:block;font-weight:700;opacity:.75;font-size:10px}',
'#mg .mg-tips{background:#2a2410;border:2px solid #f2c94c;color:#ffe27a;padding:4px 8px;font-weight:900;font-size:13px;border-radius:8px;white-space:nowrap}',
'#mg .mg-ib2{width:40px;height:40px;border-radius:10px;border:2px solid #4a4a80;background:#232346;color:#fff;font-size:18px;padding:0;cursor:pointer}',
'#mg .mg-scene{flex:1 1 auto;min-height:150px;position:relative;margin:6px 0;display:flex;flex-direction:column;justify-content:flex-end}',
'#mg .mg-scene{justify-content:space-between!important}',
'#mg .mg-aw{position:relative;margin:2px auto 0;width:92%;max-width:420px;text-align:center;padding:16px 8px 8px;border:3px solid #000;border-radius:6px 6px 14px 14px;background:repeating-linear-gradient(90deg,var(--ctr,#b5542a) 0 26px,#f5f0e6 26px 52px);box-shadow:0 5px 0 rgba(0,0,0,.45);animation:mgsway 3s ease-in-out infinite alternate}#mg .mg-aw b{display:block;font-size:34px;line-height:1.05;text-shadow:0 3px 0 rgba(0,0,0,.35)}#mg .mg-aw span{display:inline-block;margin-top:2px;background:#111;color:#ffe27a;padding:3px 8px;border-radius:5px;font-size:11px;font-weight:900}',
'@keyframes mgsway{to{transform:translateY(2px)}}',
'#mg .mg-lane{display:flex;gap:6px;justify-content:center;align-items:flex-end;min-height:128px;padding-bottom:4px}',
'#mg .mg-c{position:relative;width:30%;max-width:150px;display:flex;flex-direction:column;align-items:center;animation:mgin .3s}',
'#mg .mg-c.go{animation:mgout .5s forwards}',
'#mg .mg-bub{background:#fff;color:#111;border:3px solid #111;border-radius:12px;padding:2px 6px;display:flex;gap:3px;min-height:34px;align-items:center;justify-content:center;flex-wrap:wrap;box-shadow:3px 3px 0 rgba(0,0,0,.45)}',
'#mg .mg-chip{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:20px;background:var(--bg,#eee);box-shadow:inset 0 0 0 2px rgba(0,0,0,.18)}',
'#mg .mg-av{font-size:46px;line-height:1.1;animation:mgbob 1.1s steps(2) infinite}',
'#mg .mg-pb{display:block;width:80%;height:7px;background:#000;border:2px solid #000;border-radius:5px;overflow:hidden}#mg .mg-pb u{display:block;height:100%;background:#43d17a;width:100%}',
'#mg .mg-c.low .mg-pb u{background:#e5442f}#mg .mg-c.low .mg-av{animation:mgshake .25s infinite}',
'#mg .mg-wk{display:flex;gap:4px;justify-content:center;font-size:24px;min-height:30px;align-items:flex-end}#mg .mg-wk span{animation:mgbob .9s steps(2) infinite}#mg .mg-wk span.hop{animation:mghop .5s}',
'#mg .mg-ct{height:20px;background:var(--ctr,#b5542a);border:3px solid #000;border-radius:6px;box-shadow:0 4px 0 rgba(0,0,0,.5)}',
'#mg .mg-tray{flex:none;display:flex;align-items:center;gap:6px;min-height:42px;margin-bottom:6px}',
'#mg .mg-trc{flex:1;display:flex;gap:4px;align-items:center;background:rgba(0,0,0,.45);border:2px dashed #4a4a80;border-radius:10px;padding:3px 6px;min-height:40px}',
'#mg .mg-trc em{font-style:normal;opacity:.6;font-size:11px}',
'#mg .mg-combo{font-weight:900;color:#ffb347;min-width:52px;text-align:right;font-size:13px}',
'#mg .mg-st{flex:none;background:rgba(27,27,47,.94);border:3px solid #4a4a80;border-radius:14px;padding:8px;min-height:172px;position:relative}',
'#mg .mg-hint{margin:6px 0 0;text-align:center;font-size:11px;opacity:.8}',
'#mg .mg-it{display:flex;gap:8px;justify-content:center}',
'#mg .mg-ib{flex:1;max-width:110px;min-height:76px;border-radius:12px;border:3px solid #111;background:var(--bg,#34345e);color:#fff;font-size:34px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 0 rgba(0,0,0,.55);padding:2px}',
'#mg .mg-ib small{font-size:10px;font-weight:900;text-shadow:1px 1px 0 #000}#mg .mg-ib em{font-style:normal;font-size:9px;letter-spacing:2px;height:10px}',
'#mg .mg-ib:active,#mg .mg-ib.on{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.55);outline:3px solid #f2c94c}',
'#mg .mg-gr{display:flex;gap:6px;justify-content:center;margin-bottom:8px}',
'#mg .mg-sl{flex:1;max-width:96px;height:82px;border-radius:10px;border:3px solid #111;background:#2a2a2a;color:#fff;position:relative;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0}',
'#mg .mg-sl .e{font-size:30px;line-height:1}#mg .mg-sl.raw .e{opacity:.55;filter:saturate(.4)}#mg .mg-sl.ready{outline:3px solid #43d17a;animation:mgpulse .5s infinite alternate}#mg .mg-sl.burnt .e{filter:grayscale(1) brightness(.4)}',
'#mg .mg-sl .pb{position:relative;display:block;width:80%;height:8px;background:#000;border-radius:5px;overflow:hidden}#mg .mg-sl .pb b{position:absolute;top:0;bottom:0;background:rgba(67,209,122,.55)}#mg .mg-sl .pb u{position:absolute;left:0;top:0;bottom:0;background:#ffb347;width:0}',
'#mg .mg-pw{display:flex;gap:10px;align-items:stretch}',
'#mg .mg-gl{position:relative;width:76px;height:136px;border:4px solid #cfe3f5;border-top-width:2px;border-radius:4px 4px 16px 16px;background:rgba(255,255,255,.08);overflow:hidden;flex:none}',
'#mg .mg-gl .gf{position:absolute;left:0;right:0;bottom:0;height:0;background:var(--lq,#d9a441)}#mg .mg-gl .gb{position:absolute;left:0;right:0;border-top:3px solid #43d17a;border-bottom:3px solid #43d17a;background:rgba(67,209,122,.25);z-index:2}',
'#mg .mg-pc{flex:1;display:flex;flex-direction:column;gap:8px;justify-content:center}#mg .mg-pc .mg-it .mg-ib{min-height:56px;font-size:26px}',
'#mg .mg-big{width:100%;min-height:54px;border-radius:12px;border:3px solid #111;background:#e5593f;color:#fff;font-weight:900;font-size:16px;font-family:inherit;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.55);touch-action:none}#mg .mg-big:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.55)}',
'#mg .mg-tm{text-align:center}#mg .mg-tmi{font-size:40px;line-height:1.1;animation:mgbob .6s steps(2) infinite}#mg .mg-tl{font-weight:900;font-size:14px;margin:4px 0}',
'#mg .mg-tbar{position:relative;height:30px;background:#000;border:3px solid #4a4a80;border-radius:8px;margin:6px 0 10px;overflow:hidden}',
'#mg .mg-tz{position:absolute;top:0;bottom:0;background:rgba(67,209,122,.7);border-left:2px solid #9bffbf;border-right:2px solid #9bffbf}#mg .mg-tc{position:absolute;top:-2px;bottom:-2px;width:6px;margin-left:-3px;background:#fff;box-shadow:0 0 6px #fff}',
'#mg .mg-shk{display:flex;gap:6px;justify-content:center;align-items:center;min-height:50px;background:rgba(0,0,0,.4);border-radius:10px;margin-bottom:8px;font-size:26px}',
'#mg .mg-dr{position:relative;height:178px;background:rgba(0,0,0,.35);border:2px dashed #4a4a80;border-radius:10px;overflow:hidden}',
'#mg .mg-dd{position:absolute;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;border:3px solid #111;background:#f2c94c;color:#111;font-weight:900;font-size:17px;font-family:inherit;cursor:pointer;padding:0}#mg .mg-dd.n{animation:mgpulse .4s infinite alternate}#mg .mg-dd.ok{background:#43d17a;opacity:.55}',
'#mg .mg-dt{position:absolute;left:0;right:0;top:0;height:6px;background:#000}#mg .mg-dt u{display:block;height:100%;background:#4aa8ff;width:100%}',
'#mg .mg-fl{position:fixed;z-index:80;pointer-events:none;font-weight:900;font-size:18px;color:#ffe27a;text-shadow:2px 2px 0 #000;animation:mgfl 1.1s forwards;white-space:nowrap}#mg .mg-fl.bad{color:#ff6b6b}',
'#mg .mg-up{position:fixed;top:0;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:560px;z-index:5;background:rgba(16,16,34,.98);padding:calc(env(safe-area-inset-top,0px) + 10px) 10px 14px;overflow:auto;display:none}#mg .mg-up.on{display:block}',
'#mg .mg-up h4{margin:10px 0 4px;font-size:12px;letter-spacing:1px;color:#f2c94c}',
'#mg .mg-ur{display:flex;align-items:center;gap:8px;background:#232346;border:2px solid #3a3a66;border-radius:10px;padding:6px 8px;margin-bottom:5px}#mg .mg-ur>span{flex:1;font-size:12px;line-height:1.25}#mg .mg-ur small{display:block;opacity:.7;font-size:10px}',
'#mg .mg-ur button{min-width:92px;padding:7px 6px;border-radius:9px;border:2px solid #111;background:#f2c94c;color:#1b1b2f;font-weight:900;font-size:11px;cursor:pointer}#mg .mg-ur button:disabled{background:#555;color:#aaa}',
'#mg .mg-hd{display:flex;gap:6px;align-items:center;margin-bottom:6px;font-weight:900}',
'@keyframes mgin{from{transform:translateY(18px) scale(.6);opacity:0}}@keyframes mgout{to{transform:translateY(-30px) scale(.4);opacity:0}}',
'@keyframes mgbob{50%{transform:translateY(-3px)}}@keyframes mgshake{25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}@keyframes mghop{50%{transform:translateY(-14px) scale(1.2)}}',
'@keyframes mgpulse{to{filter:brightness(1.4)}}@keyframes mgfl{to{transform:translateY(-46px);opacity:0}}',
'#spn .mgplay{width:100%;padding:8px 6px;font-size:11px;font-weight:900;background:#f2c94c;color:#1b1b2f;border:2px solid #111;margin:0 0 3px}',
'@media (prefers-reduced-motion:reduce){#mg *{animation:none!important}}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- overlay state ---------- */
var ov=null,st=null;
function $q(s){return ov?ov.querySelector(s):null;}
function eq(a,b){if(a.length!==b.length)return false;var x=a.slice().sort().join(','),y=b.slice().sort().join(',');return x===y;}
function sub(t,o){var c=o.slice();for(var k=0;k<t.length;k++){var ix=c.indexOf(t[k]);if(ix<0)return false;c.splice(ix,1);}return true;}
function chip(it){return '<span class="mg-chip"'+(it.bg?' style="--bg:'+it.bg+'"':'')+'>'+it.e+'</span>';}
function itemById(id){return st.items[id];}

function flash(msg,good,el){if(!ov)return;var r=(el||$q('.mg-tray')||ov).getBoundingClientRect();var f=document.createElement('div');f.className='mg-fl'+(good===false?' bad':'');f.textContent=msg;f.style.left=Math.max(8,r.left+r.width/2-40)+'px';f.style.top=(r.top-6)+'px';ov.appendChild(f);setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f);},1150);}
function topUpdate(){var t=$q('.mg-tips');if(t)t.textContent='💰 '+Math.floor(MG.tips)+' Tips';}
function renderTray(){var c=$q('.mg-trc');if(!c)return;c.innerHTML=st.tray.length?st.tray.map(function(x){return chip(itemById(x.id));}).join(''):'<em>Your tray is empty</em>';var cb=$q('.mg-combo');if(cb)cb.textContent=st.combo>1?'🔥 x'+st.combo:'';}
function renderLane(){var L=$q('.mg-lane');if(!L)return;st.cust.forEach(function(c){if(c.el)return;var d=document.createElement('div');d.className='mg-c';d.innerHTML='<div class="mg-bub">'+c.order.map(function(id){return chip(itemById(id));}).join('')+'</div><div class="mg-av">'+c.av+'</div><i class="mg-pb"><u></u></i>';c.el=d;L.appendChild(d);});}

function tipFor(n,q,pat,combo){var base=st.u*n;var v=base*(0.6+0.4*q)*(1+0.1*st.r.g)*(1+0.1*st.o.u.eq)*(1+Math.min(combo,10)*0.05)*(pat>0.5?1.15:1);return Math.max(1,Math.round(v));}
function removeCust(c,anim){var i=st.cust.indexOf(c);if(i>=0)st.cust.splice(i,1);if(c.el){var e=c.el;if(anim){e.classList.add('go');setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},520);}else if(e.parentNode)e.parentNode.removeChild(e);}}
function serve(c,q,auto){var tip=tipFor(c.order.length,q,c.pat/c.max,auto?0:st.combo);if(auto)tip=Math.max(1,Math.round(tip*0.6));
  MG.tips+=tip;dirty=true;if(!auto){st.combo++;}
  if(c.el)c.el.querySelector('.mg-av').textContent='😊';flash('+'+tip+' 💰',true,c.el);snd('coin');removeCust(c,true);topUpdate();}
function check(){var ids=st.tray.map(function(x){return x.id;});
  if(!st.cust.length){renderTray();return;}
  var cs=st.cust.slice().sort(function(a,b){return a.pat-b.pat;}),m=null;
  for(var k=0;k<cs.length;k++){if(eq(ids,cs[k].order)){m=cs[k];break;}}
  if(m){var q=0;st.tray.forEach(function(x){q+=x.q;});q/=Math.max(1,st.tray.length);st.tray=[];renderTray();serve(m,q,false);return;}
  var any=st.cust.some(function(c){return sub(ids,c.order);});
  if(!any){st.tray=[];st.combo=0;flash('✖ nobody ordered that',false);snd('bad');}
  renderTray();}
var API={
  add:function(id,q){st.tray.push({id:id,q:q});snd('click');check();},
  addMany:function(list){list.forEach(function(x){st.tray.push({id:x.id,q:x.q});});snd('click');check();},
  miss:function(msg){st.combo=0;flash(msg||'Oops!',false);snd('bad');renderTray();},
  flash:function(m,g){flash(m,g,$q('.mg-st'));},
  get items(){return st.items;},get gear(){return st.r.g;}
};

/* ---------- timing helper (used by slice / craft / shake) ---------- */
function Timing(h,labels,gear,cb,head){
  h.innerHTML='<div class="mg-tm">'+(head?'<div class="mg-tmi">'+head+'</div>':'')+'<div class="mg-tl"></div><div class="mg-tbar"><i class="mg-tz"></i><b class="mg-tc"></b></div><button class="mg-big">TAP!</button></div>';
  var z=h.querySelector('.mg-tz'),c=h.querySelector('.mg-tc'),l=h.querySelector('.mg-tl'),btn=h.querySelector('.mg-big');
  var k=0,x=0,dir=1,zc=.5,zw=.3,qs=[],dead=false;
  function nz(){zw=.26+.04*gear;zc=zw/2+.08+Math.random()*(1-zw-.16);z.style.left=((zc-zw/2)*100)+'%';z.style.width=(zw*100)+'%';l.textContent=(labels[k]||'Hit')+' ('+(k+1)+'/'+labels.length+')';}
  function tap(){if(dead)return;var d=Math.abs(x-zc),q=d<=zw/2?1-d/(zw/2)*0.4:0.3;qs.push(q);snd(q>.6?'click':'bad');k++;if(k>=labels.length){dead=true;var a=0;qs.forEach(function(v){a+=v;});cb(a/qs.length);}else nz();}
  btn.onpointerdown=function(e){e.preventDefault();tap();};
  nz();
  return {tick:function(dt){if(dead)return;x+=dir*dt*(1.15+.3*k);if(x>1){x=1;dir=-1;}if(x<0){x=0;dir=1;}c.style.left=(x*100)+'%';}};
}
function itemsHTML(items,hint,pips){return '<div class="mg-it">'+items.map(function(it){return '<button class="mg-ib" data-i="'+it.id+'"'+(it.bg?' style="--bg:'+it.bg+'"':'')+'><span>'+it.e+'</span>'+(it.n?'<small>'+it.n+'</small>':'')+(pips?'<em></em>':'')+'</button>';}).join('')+'</div><p class="mg-hint">'+hint+'</p>';}
function pick(e){var b=e.target.closest?e.target.closest('[data-i]'):null;return b?{id:+b.dataset.i,b:b}:null;}

/* ---------- templates ---------- */
var TPL={};
TPL.assemble=function(h,a){h.innerHTML=itemsHTML(a.items,'Tap items to build the order, it is served automatically');
  h.onclick=function(e){var p=pick(e);if(p)a.add(p.id,1);};return {tick:function(){}};};
TPL.fold=function(h,a){var need=Math.max(1,3-a.gear),cur=-1,taps=0;h.innerHTML=itemsHTML(a.items,'Tap an item '+need+'x to fold it and add it to the tray',true);
  h.onclick=function(e){var p=pick(e);if(!p)return;if(cur!==p.id){cur=p.id;taps=0;[].forEach.call(h.querySelectorAll('em'),function(m){m.textContent='';});}taps++;p.b.querySelector('em').textContent=new Array(taps+1).join('●')+new Array(need-taps+1).join('○');snd('click');if(taps>=need){a.add(p.id,1);cur=-1;taps=0;p.b.querySelector('em').textContent='';}};
  return {tick:function(){}};};
TPL.grill=function(h,a){var n=a.gear>=2?4:3,sl=[],cookT=4.2*(1-.1*a.gear),g0=.55,g1=.85;
  var s='<div class="mg-gr">';for(var k=0;k<n;k++)s+='<button class="mg-sl" data-s="'+k+'"><span class="e">➕</span><i class="pb"><b style="left:'+(g0*100)+'%;width:'+((g1-g0)*100)+'%"></b><u></u></i></button>';
  h.innerHTML=s+'</div>'+itemsHTML(a.items,'Tap food to put it on, then tap it when the bar is in the GREEN');
  [].forEach.call(h.querySelectorAll('.mg-sl'),function(el){sl.push({el:el,id:-1,p:0,e:el.querySelector('.e'),u:el.querySelector('u')});});
  function clear(o){o.id=-1;o.p=0;o.e.textContent='➕';o.el.className='mg-sl';o.u.style.width='0';}
  h.onclick=function(e){var q=e.target.closest('.mg-sl');
    if(q){var o=sl[+q.dataset.s];if(o.id<0)return;if(o.p<g0){a.flash('Too raw!',false);return;}
      if(o.p<=g1){a.add(o.id,1-Math.abs(o.p-.7)/.2*.4);clear(o);}else{clear(o);a.miss('Burnt!');}return;}
    var p=pick(e);if(!p)return;for(var k=0;k<sl.length;k++){if(sl[k].id<0){sl[k].id=p.id;sl[k].p=0;sl[k].e.textContent=a.items[p.id].e;snd('click');return;}}a.flash('Grill is full',false);};
  return {tick:function(dt){sl.forEach(function(o){if(o.id<0)return;o.p+=dt/cookT;o.u.style.width=Math.min(100,o.p*100)+'%';o.el.className='mg-sl '+(o.p<g0?'raw':o.p<=g1?'ready':'burnt');if(o.p>=1.3){clear(o);a.miss('Burnt!');}});}};};
TPL.pour=function(h,a){var sel=0,f=0,on=false,lo=.74-.03*a.gear,hi=.92;
  h.innerHTML='<div class="mg-pw"><div class="mg-gl"><i class="gb" style="bottom:'+(lo*100)+'%;height:'+((hi-lo)*100)+'%"></i><u class="gf"></u></div><div class="mg-pc">'+itemsHTML(a.items,'Hold to pour, release in the green')+'<button class="mg-big hold">HOLD TO POUR</button></div></div>';
  var gf=h.querySelector('.gf'),gl=h.querySelector('.mg-gl'),btn=h.querySelector('.hold'),ibs=h.querySelectorAll('.mg-ib');
  function mark(){[].forEach.call(ibs,function(b){b.classList.toggle('on',+b.dataset.i===sel);});gl.style.setProperty('--lq',a.items[sel].bg||'#d9a441');}mark();
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;mark();snd('click');}};
  function rel(){if(!on)return;on=false;var v=f;f=0;gf.style.height='0';if(v<=.05)return;if(v>.97||v>hi+.04)a.miss('Spilled!');else if(v>=lo)a.add(sel,1-Math.abs(v-(lo+hi)/2)/((hi-lo)/2)*.3);else if(v>.5)a.add(sel,.45);else a.flash('Too little',false);}
  btn.onpointerdown=function(e){e.preventDefault();try{btn.setPointerCapture(e.pointerId);}catch(x){}on=true;};btn.onpointerup=rel;btn.onpointercancel=rel;btn.onlostpointercapture=rel;btn.oncontextmenu=function(e){e.preventDefault();};
  return {tick:function(dt){if(on){f+=dt*.55;if(f>=1)rel();else gf.style.height=(f*100)+'%';}}};};
TPL.shake=function(h,a){var shk=[],tm=null;
  function mount(){tm=null;h.innerHTML='<div class="mg-shk">'+(shk.length?shk.map(function(id){return a.items[id].e;}).join(' '):'<em style="font-size:11px;opacity:.6">Shaker is empty</em>')+'</div>'+itemsHTML(a.items,'Add up to 3 ingredients, then shake!')+'<button class="mg-big go" style="margin-top:8px">SHAKE!</button>';}
  mount();
  h.onclick=function(e){if(tm)return;if(e.target.closest('.go')){if(!shk.length){a.flash('Add something first',false);return;}var list=shk.slice(),host=h;tm=Timing(host,['Shake','Shake','Shake'],a.gear,function(q){a.addMany(list.map(function(id){return {id:id,q:q};}));shk=[];mount();},'🍸');return;}
    var p=pick(e);if(p){if(shk.length>=3){a.flash('Shaker is full',false);return;}shk.push(p.id);snd('click');mount();}};
  return {tick:function(dt){if(tm)tm.tick(dt);}};};
function timed(h,a,labels,hint,verb){var tm=null;
  function mount(){tm=null;h.innerHTML=itemsHTML(a.items,hint);}mount();
  h.onclick=function(e){if(tm)return;var p=pick(e);if(!p)return;var it=a.items[p.id];tm=Timing(h,labels,a.gear,function(q){a.add(p.id,q);mount();},it.e);};
  return {tick:function(dt){if(tm)tm.tick(dt);}};}
TPL.slice=function(h,a){return timed(h,a,['Cut','Cut'],'Pick an item, then tap when the cursor is in the green');};
TPL.craft=function(h,a){var c=ST[st.i][1];return timed(h,a,STEPS[c]||STEPS.craft,'Pick a product to make, tap in the green for each step');};
TPL.draw=function(h,a){var g=null;
  function mount(){g=null;h.innerHTML=itemsHTML(a.items,'Pick a design, then tap the dots in order');}mount();
  h.onclick=function(e){if(g)return;var p=pick(e);if(!p)return;start(p.id);};
  function start(id){var n=4,lim=6+a.gear,pts=[],k;
    for(k=0;k<n;k++){var tries=0,x,y,okp;do{x=12+Math.random()*76;y=18+Math.random()*68;okp=pts.every(function(q){return Math.hypot((q[0]-x)*1.6,(q[1]-y))>26;});tries++;}while(!okp&&tries<40);pts.push([x,y]);}
    var s='<div class="mg-dr"><div class="mg-dt"><u></u></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:90px;opacity:.12">'+a.items[id].e+'</div>';
    pts.forEach(function(q,i){s+='<button class="mg-dd'+(i===0?' n':'')+'" data-d="'+i+'" style="left:'+q[0]+'%;top:'+q[1]+'%">'+(i+1)+'</button>';});
    h.innerHTML=s+'</div><p class="mg-hint">Trace the design: 1, 2, 3 ...</p>';
    g={id:id,next:0,t:0,n:n,lim:lim,bar:h.querySelector('.mg-dt u')};
    h.onclick=function(e){var b=e.target.closest('.mg-dd');if(!b||!g)return;var d=+b.dataset.d;if(d!==g.next)return;b.className='mg-dd ok';snd('click');g.next++;var nx=h.querySelector('[data-d="'+g.next+'"]');if(nx)nx.className='mg-dd n';
      if(g.next>=g.n){var q=1-(g.t/g.lim)*.5,i2=g.id;g=null;h.onclick=null;setTimeout(function(){a.add(i2,q);mount();h.onclick=function(e2){if(g)return;var p=pick(e2);if(p)start(p.id);};},180);}};}
  return {tick:function(dt){if(!g)return;g.t+=dt;g.bar.style.width=Math.max(0,100-g.t/g.lim*100)+'%';if(g.t>=g.lim){g=null;a.miss('Too slow!');mount();h.onclick=function(e){if(g)return;var p=pick(e);if(p)start(p.id);};}}};};
TPL.memory=function(h,a){var ph=0,seq=[],ix=0,t=0,chosen=0;
  function mount(){ph=0;h.innerHTML=itemsHTML(a.items,'Pick a card to read, then repeat the pattern you are shown');}mount();
  h.onclick=function(e){var p=pick(e);if(!p)return;
    if(ph===0){chosen=p.id;seq=[];for(var k=0;k<3;k++)seq.push(Math.floor(Math.random()*3));ph=1;ix=0;t=0;h.innerHTML='<div class="mg-tl" style="text-align:center">Watch the cards...</div>'+itemsHTML(a.items,'');return;}
    if(ph===2){snd('click');if(p.id!==seq[ix]){a.miss('The cards fade...');mount();return;}ix++;if(ix>=seq.length){a.add(chosen,1);mount();}}};
  return {tick:function(dt){if(ph!==1)return;t+=dt;var bs=h.querySelectorAll('.mg-ib');var s=Math.floor(t/.7);[].forEach.call(bs,function(b){b.classList.remove('on');});
      if(s<seq.length){if((t%.7)<.5)bs[seq[s]].classList.add('on');}else{ph=2;ix=0;h.querySelector('.mg-tl').textContent='Now repeat it!';}}};};

/* ---------- main overlay ---------- */
function open(o){if(!o)return;var i=o.i,t=tpl(i);if(!t)return;if(ov)close();
  var d=ST[i],r=rec(i);
  st={o:o,i:i,d:d,t:t,r:r,u:unit(i),items:kit(i,t),cust:[],tray:[],combo:0,spawn:0,wt:0,sp:null,raf:0,last:0,tm:null};
  try{st.sp=S.speed;S.speed=0;}catch(e){}
  ov=document.createElement('div');ov.id='mg';ov.style.setProperty('--ctr',hexs(d[3]));
  ov.innerHTML='<div class="mg-w"><div class="mg-top"><div class="mg-ttl px">'+d[12]+' '+esc(d[0])+'<small>'+TN[t]+' · mini-tycoon</small></div><div class="mg-tips"></div><button class="mg-ib2 up" title="Upgrades">⬆️</button><button class="mg-ib2 x" title="Close">✕</button></div>'
   +'<div class="mg-scene"><div class="mg-aw"><b>'+d[12]+'</b><span class="px">'+esc(d[0])+'</span></div><div class="mg-lane"></div><div class="mg-wk"></div><div class="mg-ct"></div></div>'
   +'<div class="mg-tray"><div class="mg-trc"></div><div class="mg-combo"></div><button class="mg-ib2 tr" title="Clear tray">🗑</button></div>'
   +'<div class="mg-st"><div class="mg-up"></div><div class="mg-host"></div></div></div>';
  document.body.appendChild(ov);
  ov.querySelector('.x').onclick=close;ov.querySelector('.up').onclick=function(){openUp(true);};ov.querySelector('.tr').onclick=function(){st.tray=[];st.combo=0;renderTray();snd('click');};
  st.tm=TPL[t](ov.querySelector('.mg-host'),API);
  topUpdate();renderTray();drawWorkers();spawnC();
  st.last=performance.now();st.raf=requestAnimationFrame(loop);}
function close(){if(!st)return;cancelAnimationFrame(st.raf);try{if(st.sp!=null)S.speed=st.sp;}catch(e){}
  if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);ov=null;st=null;sv();
  try{SPH='';renderSP();ui();}catch(e){}}
function drawWorkers(){var w=$q('.mg-wk');if(!w)return;var s='';for(var k=0;k<st.r.w;k++)s+='<span>'+['🧑‍🍳','👩‍🍳','🧑‍🔧'][k%3]+'</span>';w.innerHTML=s;}
function maxC(){return st.o.u.st>=2?4:3;}
function spawnC(){if(st.cust.length>=maxC())return;var r=st.r,n=1+Math.floor(Math.random()*(r.m>=2?3:2)),avail=r.m>=1?[0,1,2]:[0,1],order=[];
  for(var k=0;k<n;k++)order.push(avail[Math.floor(Math.random()*avail.length)]);
  var max=24+3*st.o.u.st+4*(n-1);st.cust.push({order:order,pat:max,max:max,av:CUS[Math.floor(Math.random()*CUS.length)],el:null});renderLane();}
function loop(ts){if(!st)return;var dt=Math.min(.1,(ts-st.last)/1000||0);st.last=ts;
  st.spawn-=dt;if(st.spawn<=0){spawnC();st.spawn=Math.max(2.5,6.5-.5*st.o.u.sg)+Math.random()*2;}
  for(var k=st.cust.length-1;k>=0;k--){var c=st.cust[k];c.pat-=dt;if(c.el){var u=c.el.querySelector('.mg-pb u');if(u)u.style.width=Math.max(0,c.pat/c.max*100)+'%';c.el.classList.toggle('low',c.pat/c.max<.3);}
    if(c.pat<=0){st.combo=0;if(c.el)c.el.querySelector('.mg-av').textContent='😠';flash('😠 left',false,c.el);removeCust(c,true);renderTray();}}
  if(st.r.w>0&&st.cust.length){st.wt+=dt*st.r.w;if(st.wt>=12){st.wt=0;var cs=st.cust.slice().sort(function(a,b){return a.pat-b.pat;})[0];var wk=$q('.mg-wk span');if(wk){wk.classList.remove('hop');void wk.offsetWidth;wk.classList.add('hop');}serve(cs,.6,true);}}
  if(st.tm)st.tm.tick(dt);
  st.raf=requestAnimationFrame(loop);}

/* ---------- upgrade drawer ---------- */
function stallCost(o,k,L){try{return Math.max(1,Math.ceil(upCost(o,k,L)*.45));}catch(e){return 999;}}
function openUp(show){var p=$q('.mg-up');if(!p)return;if(!show){p.classList.remove('on');return;}p.classList.add('on');
  var r=st.r,u=st.u,o=st.o,s='<div class="mg-hd"><span class="px" style="flex:1">UPGRADES</span><span class="mg-tips">💰 '+Math.floor(MG.tips)+' Tips</span><button class="mg-ib2 cl">✕</button></div>';
  function row(ic,name,desc,cost,on,key,maxed){return '<div class="mg-ur"><span>'+ic+' <b>'+name+'</b><small>'+desc+'</small></span>'+(maxed?'<b>MAX</b>':'<button data-k="'+key+'"'+(on?'':' disabled')+'>'+cost+' 💰</button>')+'</div>';}
  s+='<h4>YOUR STALL (real upgrades)</h4>';
  try{UPS.forEach(function(q){var k=q[0],L=o.u[k],gate=[1,3,5][L],c=stallCost(o,k,L);
    if(L>=3){s+=row(q[2],q[1]+' L3',q[3],0,0,'',true);return;}
    s+=row(q[2],q[1]+' L'+L+' → L'+(L+1),q[3]+(S.lv<gate?' · needs LV'+gate:''),c,MG.tips>=c&&S.lv>=gate,'s'+k,false);});}catch(e){}
  var wc=[30,70,130][r.w],gc=[35,80,150][r.g],mc=[45,110][r.m];
  s+='<h4>WORKERS &amp; GEAR (this stall)</h4>';
  s+=row('🧑‍🍳','Hire worker ('+r.w+'/3)','Serves a customer on their own, and earns Tips while you are away',wc*u,MG.tips>=wc*u,'w',r.w>=3);
  s+=row('⚙️','Better gear L'+r.g,'Faster cooking, wider sweet spots, +10% tips',gc*u,MG.tips>=gc*u,'g',r.g>=3);
  s+=row('📋','Menu L'+r.m,r.m===0?'Unlock the 3rd item':'Unlock combo orders (up to 3 items, bigger tips)',mc*u,MG.tips>=mc*u,'m',r.m>=2);
  p.innerHTML=s;
  p.querySelector('.cl').onclick=function(){openUp(false);};
  [].forEach.call(p.querySelectorAll('button[data-k]'),function(b){b.onclick=function(){buy(b.dataset.k);};});}
function buy(k){var r=st.r,u=st.u,o=st.o,cost=0;
  if(k==='w'){cost=[30,70,130][r.w]*u;}else if(k==='g'){cost=[35,80,150][r.g]*u;}else if(k==='m'){cost=[45,110][r.m]*u;}
  else if(k.charAt(0)==='s'){var kk=k.slice(1),L=o.u[kk];cost=stallCost(o,kk,L);if(S.lv<[1,3,5][L])return;}
  if(MG.tips<cost){flash('Not enough Tips',false,$q('.mg-up'));snd('bad');return;}
  MG.tips-=cost;
  if(k==='w'){r.w++;drawWorkers();}else if(k==='g'){r.g++;st.tm=null;st.tm=TPL[st.t](ov.querySelector('.mg-host'),API);}else if(k==='m'){r.m++;}
  else{var kk2=k.slice(1);o.u[kk2]++;try{addBadges(o);}catch(e){}try{toast(ST[o.i][0]+': '+UPS.find(function(q){return q[0]===kk2;})[1]+' level '+o.u[kk2],'⭐');}catch(e){}try{gainXP(6);}catch(e){}}
  snd('level');sv();topUpdate();openUp(true);}

/* ---------- hooks into the game ---------- */
function inject(){try{if(typeof SP==='undefined'||!SP)return;var h=document.getElementById('sph');if(!h||h.querySelector('.mgplay'))return;if(!tpl(SP.i))return;
  var d=document.createElement('div');d.className='p';d.innerHTML='<button class="mgplay">🎮 Play mini-tycoon · 💰 '+Math.floor(MG.tips)+' Tips</button><span class="m">Serve customers, earn Tips, hire workers, upgrade this stall.</span>';h.insertBefore(d,h.firstChild);}catch(e){}}
var orp=window.renderSP;
if(typeof orp==='function'){window.renderSP=function(){var r=orp.apply(this,arguments);inject();return r;};}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('.mgplay'):null;if(!b)return;e.stopPropagation();e.preventDefault();try{open(SP);}catch(x){}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&st)close();});
var ots=window.tickStalls;
if(typeof ots==='function'){window.tickStalls=function(dm){var r=ots.apply(this,arguments);try{if(!st&&S&&(S.ph==='day'||S.ph==='night')){stalls.forEach(function(s){if(s.st!=='open')return;var q=MG.t[s.i];if(q&&q.w>0){MG.tips+=dm*.012*q.w*unit(s.i);dirty=true;}});}}catch(e){}return r;};}
window.mfbMG={open:open,close:close,tpl:tpl,data:MG,state:function(){return st;}};
})();
