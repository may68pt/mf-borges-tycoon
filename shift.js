/* shift.js - progress for the stall mini-games: timed shifts with goals, 3 stars, levels per stall, rare finds with a collection,
   free upgrades at level milestones, and a results screen with clear exit points (next shift / upgrades / leave).
   It only watches the mini-game overlay (#mg) and the Tips counter; the game rules and economy stay as they are. Free play is always possible. */
(function(){
'use strict';
var M=window.mfbMG;if(!M||!M.state||window.__mgs)return;window.__mgs=1;
var MG=M.data,KEY='mfb_shift';
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
function snd(n){try{if(typeof sfx==='function')sfx(n);}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function rnd(n){return Math.floor(Math.random()*n);}

/* ---------- saved progress (its own key, so the old save is untouched) ---------- */
var D={lv:{},rare:{},shifts:0};
try{var _d=JSON.parse(localStorage.getItem(KEY)||'null');if(_d&&typeof _d==='object'){D.lv=_d.lv||{};D.rare=_d.rare||{};D.shifts=+_d.shifts||0;}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){}}
function P(i){var p=D.lv[i];if(!p)p=D.lv[i]={L:1,best:{},done:0};return p;}
M.progress=D;M.shift={get S(){return S;}};

/* ---------- rare finds ---------- */
var RARES={
 food:[['🥇','Golden Recipe'],['🍄','Wild Truffle'],['🧿','Saffron Pearl']],
 drink:[['🏆','Vintage Reserve'],['💎','Ice Diamond'],['🍾','Royal Cuvée']],
 craft:[['🪙','Gold Leaf'],['🔮','Moon Clay'],['🧵','Silk Thread']],
 cloth:[['🧶','Cashmere Skein'],['🪡','Silver Needle'],['👑','Royal Brocade']],
 body:[['💠','Rare Ink'],['🌟','Star Glitter'],['🧴','Elixir']],
 shop:[['🗝️','Hidden Gem'],['📜','Ancient Map'],['🏺','Old Relic']],
 amen:[['🎟️','Golden Ticket'],['🧭','Lucky Compass'],['🛎️','Crystal Bell']]
};
var CATN={food:'Kitchen',drink:'Bar',craft:'Workshop',cloth:'Tailor',body:'Studio',shop:'Shop',amen:'Services'};
function catOf(i){var c=g('ST')[i][1];return RARES[c]?c:'shop';}
function distinct(){var n=0;for(var k in D.rare)if(D.rare[k]>0)n++;return n;}
function rareMult(){return 1+.02*distinct();}
function giveRare(i,why){
  var c=catOf(i),list=RARES[c],k=rnd(list.length);
  // prefer one the player does not have yet
  for(var t=0;t<3;t++){var j=rnd(list.length);if(!D.rare[c+j]){k=j;break;}}
  var id=c+k,first=!D.rare[id];D.rare[id]=(D.rare[id]||0)+1;
  var st=M.state(),u=st?st.u:5,bonus=Math.round(u*30);MG.tips+=bonus;save();snd('coin');
  return {e:list[k][0],n:list[k][1],first:first,bonus:bonus,c:c};
}

/* ---------- styles ---------- */
var css=[
'#mg .sh-hud{flex:none;display:flex;align-items:center;gap:8px;margin:4px 0 0;padding:3px 8px;background:rgba(0,0,0,.35);border:2px solid #4a4a80;border-radius:10px;font-weight:900;font-size:12px}',
'#mg .sh-hud .lv{background:#7b5cff;border-radius:6px;padding:1px 6px}#mg .sh-hud .t{min-width:36px;text-align:center}#mg .sh-hud .st{color:#ffd166;letter-spacing:1px;font-size:15px;white-space:nowrap}',
'#mg .sh-bar{position:relative;flex:1;height:12px;background:#000;border-radius:7px;overflow:hidden;border:2px solid #000}#mg .sh-bar u{display:block;height:100%;background:#43d17a;width:0;transition:width .2s}#mg .sh-bar i{position:absolute;top:0;bottom:0;width:2px;background:#fff8}',
'#mg .sh-ob{flex:none;font-size:11px;font-weight:800;opacity:.9;text-align:center;margin:2px 0}#mg .sh-ob.ok{color:#7dffb0}',
'#mg .sh-ov{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(6,8,18,.82);padding:14px;animation:shfade .2s both}',
'@keyframes shfade{from{opacity:0}to{opacity:1}}@keyframes shpop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.15)}100%{transform:none;opacity:1}}',
'#mg .sh-card{width:100%;max-width:380px;max-height:100%;overflow:auto;background:#1b1d3a;border:4px solid #111;border-radius:16px;box-shadow:0 0 0 3px #7b5cff,0 10px 0 rgba(0,0,0,.4);padding:14px;text-align:center}',
'#mg .sh-card h2{margin:0 0 4px;font-size:18px;font-family:inherit}#mg .sh-card .sub{font-size:12px;opacity:.75;margin-bottom:8px}',
'#mg .sh-row{display:flex;align-items:center;gap:8px;text-align:left;background:rgba(255,255,255,.06);border-radius:10px;padding:6px 8px;margin:5px 0;font-size:13px}#mg .sh-row b{font-size:20px;width:26px;text-align:center}',
'#mg .sh-stars{font-size:38px;color:#ffd166;letter-spacing:6px;margin:4px 0}#mg .sh-stars span{display:inline-block;animation:shpop .5s both}',
'#mg .sh-btn{display:block;width:100%;min-height:46px;margin:7px 0 0;border-radius:12px;border:3px solid #111;font-weight:900;font-size:15px;color:#fff;background:#2e9e5b;cursor:pointer;font-family:inherit}#mg .sh-btn.alt{background:#34406e;font-size:13px;min-height:40px}#mg .sh-btn.gold{background:#d9a441;color:#111}',
'#mg .sh-rare{position:absolute;left:50%;top:26%;transform:translateX(-50%);z-index:40;background:#fff4c2;color:#111;border:4px solid #d9a441;border-radius:14px;padding:8px 14px;text-align:center;font-weight:900;animation:shpop .5s both;box-shadow:0 0 30px #ffd166;pointer-events:none}#mg .sh-rare b{display:block;font-size:40px}',
'#mg .sh-col{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:6px 0}#mg .sh-col div{background:rgba(255,255,255,.07);border-radius:8px;padding:6px 2px;font-size:10px;line-height:1.15}#mg .sh-col div b{display:block;font-size:26px}#mg .sh-col .no{opacity:.35;filter:grayscale(1)}',
'#mg .sh-path{display:flex;align-items:center;justify-content:center;gap:0;margin:6px 0 8px}#mg .sh-path .n{position:relative;width:46px;text-align:center;font-size:10px;opacity:.55}#mg .sh-path .n b{display:flex;align-items:center;justify-content:center;width:34px;height:34px;margin:0 auto 2px;border-radius:50%;background:#2a2d55;border:3px solid #111;font-size:15px}',
'#mg .sh-path .n.cur{opacity:1}#mg .sh-path .n.cur b{background:#7b5cff;box-shadow:0 0 0 3px #ffd166,0 0 14px #7b5cff;animation:shpulse 1.2s infinite}#mg .sh-path .n.done{opacity:.9}#mg .sh-path .n.done b{background:#2e9e5b}',
'#mg .sh-path .n::after{content:"";position:absolute;top:16px;left:calc(50% + 17px);width:12px;height:4px;background:#111}#mg .sh-path .n:last-child::after{display:none}',
'@keyframes shpulse{50%{transform:scale(1.12)}}',
'#mg .sh-rank{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:8px;background:#34406e;font-size:11px}',
'#mg .sh-chest{display:block;width:100%;margin:8px 0 0;padding:10px;border-radius:14px;border:3px solid #111;background:linear-gradient(#5b3a1c,#3c2410);color:#ffe27a;font:900 14px inherit;cursor:pointer;animation:shwob 1.1s infinite}#mg .sh-chest b{display:block;font-size:54px;line-height:1.1;filter:drop-shadow(0 0 10px var(--gl,#ffd166))}',
'#mg .sh-chest.silver{--gl:#cfe3ff;background:linear-gradient(#4a5d7a,#2c3a52)}#mg .sh-chest.gold{--gl:#ffd166;background:linear-gradient(#8a6a14,#5c430a)}#mg .sh-chest.open{animation:shopen .5s forwards}',
'@keyframes shwob{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg) scale(1.03)}}@keyframes shopen{0%{transform:scale(1) rotate(-6deg)}30%{transform:scale(1.2) rotate(6deg)}100%{transform:scale(0);opacity:0;height:0;padding:0;margin:0;border:0}}',
'#mg .sh-loot{animation:shfade .4s both}',
'#mg .sh-conf{position:absolute;top:-10px;font-size:16px;pointer-events:none;z-index:50;animation:shconf 1.6s ease-in forwards}@keyframes shconf{to{transform:translate(var(--dx),115vh) rotate(var(--r));opacity:.9}}',
'#mg .sh-coin{position:absolute;z-index:45;font-size:20px;pointer-events:none;transition:transform .75s cubic-bezier(.5,-.2,.7,1),opacity .75s;will-change:transform}',
'#mg .mg-tips.pulse{animation:shtp .3s}@keyframes shtp{50%{transform:scale(1.25);box-shadow:0 0 14px #ffd166}}',
'#mg .mg-combo[data-l="1"]{font-size:20px;color:#ffb347;text-shadow:0 0 8px #ff7a1a}#mg .mg-combo[data-l="2"]{font-size:26px;color:#ff7a1a;text-shadow:0 0 12px #ff3b00;animation:shpulse .5s infinite}#mg .mg-combo[data-l="3"]{font-size:32px;color:#fff;text-shadow:0 0 14px #ff3b00,0 0 26px #ffd166;animation:shpulse .35s infinite}',
'#mg .mg-c.go .mg-av{animation:shjoy .5s}@keyframes shjoy{30%{transform:translateY(-14px) scale(1.2)}100%{transform:translateY(0)}}',
'#mg .sh-ach{display:flex;align-items:center;gap:8px;text-align:left;font-size:12px;padding:5px 8px;margin:4px 0;border-radius:9px;background:rgba(255,255,255,.06)}#mg .sh-ach.on{background:rgba(255,209,102,.18)}#mg .sh-ach b{font-size:20px;width:26px;text-align:center}#mg .sh-ach.off b{filter:grayscale(1);opacity:.4}',
'#mg .sh-lvtag{display:inline-block;background:#7b5cff;border-radius:8px;padding:1px 8px;font-size:11px;margin-left:6px}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- shift rules ---------- */
var MODS={
  rush:{n:'Rush hour',d:'Customers arrive twice as fast',e:'🏃'},
  gold:{n:'Golden hour',d:'+50% on every Tip',e:'✨'},
  hurry:{n:'Impatient crowd',d:'Short patience, +25% Tips',e:'⏳'},
  calm:{n:'Quiet morning',d:'Patient guests, smaller goal',e:'☕'},
  boss:{n:'Critic night',d:'Big goal, a rare find if you get 3 stars',e:'🧐'}
};
var KEYS=['rush','gold','hurry','calm'];
function modFor(i,L){if(L%5===0)return 'boss';if(L<3)return '';return KEYS[(L*7+i)%4];}
function objFor(L,i){var k=(L+i)%3;if(k===0)return {t:'combo',n:3+Math.floor(L/2),txt:'Reach a x'+(3+Math.floor(L/2))+' combo'};
  if(k===1)return {t:'serve',n:4+Math.floor(L*.8),txt:'Serve '+(4+Math.floor(L*.8))+' customers'};return {t:'happy',n:0,txt:'Nobody leaves angry'};}
var DUR=75;
function targetFor(st,L,mod){var v=Math.ceil(st.u*(5+2.2*L));if(mod==='boss')v=Math.ceil(v*1.35);if(mod==='rush')v=Math.ceil(v*1.15);if(mod==='calm')v=Math.ceil(v*.85);return v;}
var MILE=['Free stall upgrade','Free worker','Better gear','Bigger menu'];
function mileFor(L){return L>=3&&L%2===1?MILE[((L-3)/2)%4]:null;}
function nextMile(L){for(var k=L;k<L+4;k++){var m=mileFor(k);if(m)return {L:k,n:m};}return null;}

/* ---------- the running shift ---------- */
var ov=null,S=null,raf=0,seen=null,lastTips=0,hud=null,obEl=null,lastSS=0;
function $(s,r){return (r||ov).querySelector(s);}
function stars(n,big){var s='';for(var k=0;k<3;k++)s+='<span style="animation-delay:'+(k*.25)+'s">'+(k<n?'★':'☆')+'</span>';return s;}
function mmss(t){t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+('0'+t%60).slice(-2);}
function overlay(html){clear();var d=document.createElement('div');d.className='sh-ov';d.innerHTML='<div class="sh-card">'+html+'</div>';ov.appendChild(d);return d;}
function clear(){if(!ov)return;[].forEach.call(ov.querySelectorAll('.sh-ov'),function(n){n.remove();});}
function wipeCust(st){st.cust.forEach(function(c){if(c.el&&c.el.parentNode)c.el.parentNode.removeChild(c.el);});st.cust.length=0;st.tray=[];st.combo=0;var t=ov.querySelector('.mg-trc');if(t)t.innerHTML='<em>Your tray is empty</em>';}
function hudInit(st){
  if(hud)hud.remove();if(obEl)obEl.remove();
  hud=document.createElement('div');hud.className='sh-hud';hud.innerHTML='<span class="lv">LV '+S.L+'</span><span class="t">'+mmss(DUR)+'</span><div class="sh-bar"><u></u><i style="left:'+(100/1.6)+'%" title="3 stars"></i></div><span class="st">☆☆☆</span>';
  obEl=document.createElement('div');obEl.className='sh-ob';
  var top=ov.querySelector('.mg-top');top.insertAdjacentElement('afterend',hud);hud.insertAdjacentElement('afterend',obEl);
}
function hudUpdate(){
  if(!hud||!S)return;var f=S.earned/(S.target*1.6);
  $('.t',hud).textContent=mmss(S.t);hud.querySelector('.sh-bar u').style.width=Math.min(100,f*100)+'%';
  var n=S.starsNow();hud.querySelector('.st').textContent='★★★'.slice(0,n)+'☆☆☆'.slice(0,3-n);
  hud.querySelector('.sh-bar u').style.background=S.earned>=S.target?'#ffd166':'#43d17a';
  obEl.className='sh-ob'+(S.obDone()?' ok':'');obEl.textContent=(S.obDone()?'✔ ':'⭐ ')+S.ob.txt+'  ·  Goal 💰 '+Math.floor(S.earned)+' / '+S.target;
}
function popRare(r){
  var d=document.createElement('div');d.className='sh-rare';d.innerHTML='<small>✨ RARE FIND ✨</small><b>'+r.e+'</b>'+esc(r.n)+'<br><small>'+(r.first?'New for your collection! ':'')+'+'+r.bonus+' 💰 · +2% Tips forever</small>';
  ov.appendChild(d);setTimeout(function(){d.remove();},3200);
}
function startShift(L){
  var st=M.state();if(!st)return;clear();
  var mod=modFor(st.i,L);
  S={L:L,mod:mod,ob:objFor(L,st.i),target:targetFor(st,L,mod),t:DUR,earned:0,maxCombo:0,served:0,angry:0,running:true,free:false,
     starsNow:function(){var n=0;if(S.earned>=S.target)n=1;if(n>=1&&S.obDone())n=2;if(n>=2&&S.earned>=S.target*1.6)n=3;return n;},
     obDone:function(){var o=S.ob;return o.t==='combo'?S.maxCombo>=o.n:o.t==='serve'?S.served>=o.n:S.angry===0&&S.served>=3;}};
  window.mfbLevel=L;wipeCust(st);st.spawn=.3;st.age=0;lastTips=MG.tips;lastSS=st.ss||0;seen=new WeakSet();hudInit(st);hudUpdate();snd('coin');
  cancelAnimationFrame(raf);var last=performance.now();
  (function tick(ts){raf=requestAnimationFrame(tick);if(!S||!S.running){return;}
    var st=M.state();if(!st){S=null;return;}
    var dt=Math.min(.1,Math.max(0,(ts-last)/1000));last=ts;S.t-=dt;
    // tips earned this frame (bonuses for golden hour / collection)
    var d=MG.tips-lastTips;if(d>0){var mult=rareMult()*(S.mod==='gold'?1.5:1)*(S.mod==='hurry'?1.25:1),extra=d*(mult-1);if(extra>=.5){MG.tips+=extra;}S.earned+=d+extra;}
    lastTips=MG.tips;
    // combo, serves, new rare, patience tuning, angry leavers
    if(st.combo>S.maxCombo)S.maxCombo=st.combo;
    if((st.ss||0)>lastSS){var n=st.ss-lastSS;lastSS=st.ss;S.served+=n;for(var k=0;k<n;k++)if(Math.random()<.025+.004*S.L){var r=giveRare(st.i);popRare(r);}}
    var pf=S.mod==='hurry'?.75:S.mod==='calm'?1.3:1/(1+.045*(S.L-1));pf=Math.max(.5,pf);
    st.cust.forEach(function(c){if(!seen.has(c)){seen.add(c);c.pat*=pf;c.max*=pf;}if(c.pat<=0&&!c.__a){c.__a=1;S.angry++;}});
    if(S.mod==='rush'&&st.spawn>1.6)st.spawn=1.6;
    hudUpdate();
    if(S.t<=0)endShift();
  })(last);
}
function milestone(st,L){
  var m=mileFor(L);if(!m)return null;var r=st.r,o=st.o,out=null;
  try{
    if(m===MILE[0]){var UPS=g('UPS'),k=null;UPS.forEach(function(q){if(k===null&&o.u[q[0]]<3)k=q;});if(k){o.u[k[0]]++;try{g('addBadges')(o);}catch(e){}out='Stall upgrade: '+k[1]+' L'+o.u[k[0]];}}
    else if(m===MILE[1]&&r.w<3){r.w++;out='A new worker joined (now '+r.w+')';var w=ov.querySelector('.mg-wk');if(w){var s='';for(var q=0;q<r.w;q++)s+='<span>'+['🧑‍🍳','👩‍🍳','🧑‍🔧'][q%3]+'</span>';w.innerHTML=s;}}
    else if(m===MILE[2]&&r.g<3){r.g++;out='Better gear L'+r.g;}
    else if(m===MILE[3]&&r.m<2){r.m++;out='Menu upgraded to L'+r.m;}
  }catch(e){}
  if(!out){var b=Math.round(st.u*40);MG.tips+=b;out='Everything is maxed, so +'+b+' Tips instead';}
  return out;
}
/* ranks, achievements, stats */
var RANKS=[['🌱','Rookie'],['🥉','Regular'],['🥈','Pro'],['🥇','Master'],['👑','Legend']];
function rankOf(L){return RANKS[L<3?0:L<5?1:L<8?2:L<12?3:4];}
D.ach=D.ach||{};D.st=D.st||{combo:0,three:0,boss:0};
try{var _e=JSON.parse(localStorage.getItem(KEY)||'null');if(_e){D.ach=_e.ach||D.ach;D.st=_e.st||D.st;}}catch(e){}
function maxL(){var m=1;for(var k in D.lv)m=Math.max(m,D.lv[k].L||1);return m;}
function stallsPlayed(){var n=0;for(var k in D.lv)if(D.lv[k].done>0)n++;return n;}
var ACH=[
 ['first','🎬','First shift','Finish any shift',function(){return D.shifts>=1;}],
 ['three','⭐','Triple star','Get 3 stars on 3 shifts',function(){return D.st.three>=3;}],
 ['combo','🔥','Combo x10','Reach a x10 combo',function(){return D.st.combo>=10;}],
 ['boss','🧐','Boss beaten','Clear a boss shift',function(){return D.st.boss>=1;}],
 ['col','📖','Collector','Find 7 different rare items',function(){return distinct()>=7;}],
 ['l5','🏅','Level 5','Reach level 5 in any stall',function(){return maxL()>=5;}],
 ['vet','🎖','Veteran','Finish 25 shifts',function(){return D.shifts>=25;}],
 ['all','🧭','All-rounder','Finish shifts in 8 different stalls',function(){return stallsPlayed()>=8;}]
];
function checkAch(st){
  var got=[];ACH.forEach(function(a){if(!D.ach[a[0]]&&a[4]()){D.ach[a[0]]=1;var b=Math.round(st.u*15);MG.tips+=b;got.push({e:a[1],n:a[2],b:b});}});
  if(got.length)save();return got;
}
function confetti(n){
  if(!ov)return;var cs=['🎊','✨','⭐','🎉','💫','🪙'];
  for(var k=0;k<n;k++){var c=document.createElement('i');c.className='sh-conf';c.textContent=cs[k%cs.length];c.style.left=(Math.random()*100)+'%';c.style.setProperty('--dx',(Math.random()*80-40)+'px');c.style.setProperty('--r',(Math.random()*720-360)+'deg');c.style.animationDelay=(Math.random()*.5)+'s';ov.appendChild(c);(function(x){setTimeout(function(){if(x.parentNode)x.parentNode.removeChild(x);},2300);})(c);}
}
function endShift(){
  var st=M.state();if(!S||!S.running||!st)return;S.running=false;st.spawn=1e9;
  var n=S.starsNow(),p=P(st.i),L=S.L,pass=n>=1;
  if(hud){hud.remove();hud=null;}if(obEl){obEl.remove();obEl=null;}
  var bonus=pass?Math.round(st.u*(3+2*L)*n):0;if(bonus){MG.tips+=bonus;}
  var rare=null;if(pass&&(Math.random()<.06+.07*n+.01*L||(S.mod==='boss'&&n===3))){rare=giveRare(st.i);}
  var mile=null,ach=[];
  D.st.combo=Math.max(D.st.combo||0,S.maxCombo);
  if(pass){D.shifts++;p.done++;if(n===3)D.st.three++;if(S.mod==='boss')D.st.boss++;if(n>(p.best[L]||0))p.best[L]=n;if(L>=p.L){p.L=L+1;mile=milestone(st,L);}try{g('gainXP')(2+n*2);}catch(e){}ach=checkAch(st);}
  save();try{localStorage.setItem('mfb_mg',JSON.stringify(MG));}catch(e){}
  window.mfbLevel=pass?L+1:L;snd(pass?'coin':'bad');
  var h='<h2>'+(pass?(n===3?'Perfect shift!':'Shift complete!'):'Not quite…')+'</h2><div class="sub">Level '+L+(S.mod?' · '+MODS[S.mod].n:'')+'</div><div class="sh-stars">'+stars(n)+'</div>';
  h+='<div class="sh-row"><b>💰</b><span>Earned <strong>'+Math.floor(S.earned)+'</strong> of goal '+S.target+'</span></div>';
  h+='<div class="sh-row"><b>'+(S.obDone()?'✅':'⭐')+'</b><span>'+esc(S.ob.txt)+(S.obDone()?'':' (missed)')+'</span></div>';
  h+='<div class="sh-row"><b>🎯</b><span>3 stars: earn '+Math.ceil(S.target*1.6)+'+ and the bonus</span></div>';
  var loot='';
  if(bonus)loot+='<div class="sh-row"><b>🎁</b><span>Shift bonus <strong>+'+bonus+'</strong> Tips</span></div>';
  if(rare)loot+='<div class="sh-row"><b>'+rare.e+'</b><span><strong>Rare find: '+esc(rare.n)+'!</strong><br><small>+'+rare.bonus+' Tips and +2% Tips from now on</small></span></div>';
  if(mile)loot+='<div class="sh-row"><b>🏅</b><span><strong>Level '+L+' reward</strong><br>'+esc(mile)+'</span></div>';
  ach.forEach(function(x){loot+='<div class="sh-row"><b>'+x.e+'</b><span><strong>Achievement: '+esc(x.n)+'</strong><br><small>+'+x.b+' Tips</small></span></div>';});
  var rk=rankOf(L+1),rk0=rankOf(L);if(pass&&rk[1]!==rk0[1])loot+='<div class="sh-row"><b>'+rk[0]+'</b><span><strong>New rank: '+rk[1]+'!</strong></span></div>';
  if(pass){
    var tier=n>=3?'gold':n===2?'silver':'wood';
    h+='<button class="sh-chest '+tier+'" data-a="chest"><b>'+(n>=3?'🏆':n===2?'🎁':'🧰')+'</b>Tap to open your '+(n>=3?'golden':n===2?'silver':'wooden')+' chest!</button><div class="sh-loot" hidden>'+loot+'</div>';
  }else h+='<div class="sh-row"><b>💡</b><span>Try upgrades (workers, gear), or practise in free play</span></div>';
  var nm=nextMile(pass?L+1:L);
  if(nm)h+='<div class="sub" style="margin-top:6px">Next reward at level '+nm.L+': '+nm.n+'</div>';
  h+='<button class="sh-btn" data-a="next">'+(pass?'▶ Next shift · Level '+(L+1):'↻ Try again')+'</button><button class="sh-btn alt" data-a="up">⬆️ Upgrades</button><button class="sh-btn alt" data-a="col">📖 Collection & achievements</button><button class="sh-btn alt" data-a="free">🎮 Free play</button><button class="sh-btn alt" data-a="leave">✕ Leave stall</button>';
  var d=overlay(h);wire(d,pass?L+1:L);
  if(n===3)confetti(26);else if(pass)confetti(10);
  var ch=d.querySelector('.sh-chest');
  if(ch)ch.onclick=function(){snd('coin');ch.classList.add('open');setTimeout(function(){ch.remove();var lt=d.querySelector('.sh-loot');if(lt){lt.hidden=false;lt.scrollIntoView&&lt.scrollIntoView({block:'nearest'});}confetti(rare||mile?30:14);if(rare)popRare(rare);},480);};
}
function collection(back){
  var h='<h2>📖 Rare finds</h2><div class="sub">'+distinct()+' of 21 found · each one gives +2% Tips ('+Math.round((rareMult()-1)*100)+'% now)</div>';
  for(var c in RARES){h+='<div class="sub" style="margin:6px 0 0;opacity:.9"><b>'+CATN[c]+'</b></div><div class="sh-col">';RARES[c].forEach(function(r,k){var n=D.rare[c+k]||0;h+='<div class="'+(n?'':'no')+'"><b>'+(n?r[0]:'❔')+'</b>'+(n?esc(r[1])+(n>1?' ×'+n:''):'???')+'</div>';});h+='</div>';}
  h+='<h2 style="margin-top:12px">🏆 Achievements</h2><div class="sub">'+Object.keys(D.ach).length+' of '+ACH.length+' · each pays Tips</div>';
  ACH.forEach(function(a){var on=D.ach[a[0]];h+='<div class="sh-ach '+(on?'on':'off')+'"><b>'+a[1]+'</b><span><strong>'+esc(a[2])+'</strong><br><small>'+esc(a[3])+'</small></span></div>';});
  h+='<button class="sh-btn alt" data-a="back">← Back</button>';
  var d=overlay(h);d.querySelector('[data-a=back]').onclick=back;
}
function wire(d,nextL){
  var st=M.state();
  [].forEach.call(d.querySelectorAll('[data-a]'),function(b){if(b.dataset.a==='chest')return;b.onclick=function(){
    var a=b.dataset.a;snd('click');
    if(a==='next'||a==='start')startShift(nextL);
    else if(a==='free'){clear();S={running:false,free:true};st.spawn=.5;window.mfbLevel=1;}
    else if(a==='up'){clear();var u=ov.querySelector('.mg-ib2.up');if(u)u.click();}
    else if(a==='col')collection(function(){briefing(nextL);});
    else if(a==='leave'){var x=ov.querySelector('.mg-ib2.x');if(x)x.click();}
  };});
}
function pathHTML(st,L){
  var p=P(st.i),h='<div class="sh-path">';
  for(var k=L-1;k<=L+3;k++){
    if(k<1){continue;}
    var cls=k===L?'cur':k<p.L?'done':'',ic;
    if(k<p.L)ic='★'.repeat(Math.max(1,p.best[k]||1));else if(k%5===0)ic='🧐';else if(mileFor(k))ic='🏅';else ic=String(k);
    if(k===L&&k%5===0)ic='🧐';else if(k===L&&mileFor(k))ic='🏅';else if(k===L&&k>=p.L)ic=String(k);
    h+='<div class="n '+cls+'"><b>'+ic+'</b>'+(k%5===0?'boss':'LV '+k)+'</div>';
  }
  return h+'</div>';
}
function briefing(L){
  var st=M.state();if(!st)return;var p=P(st.i),mod=modFor(st.i,L),ob=objFor(L,st.i),tg=targetFor(st,L,mod),nm=nextMile(L),best=p.best[L]||0,rk=rankOf(p.L);
  window.mfbLevel=L;if(S&&S.running)S.running=false;
  var h='<h2>'+esc(st.d[12])+' '+esc(st.d[0])+'</h2><div class="sub">Shift level <span class="sh-lvtag">LV '+L+'</span><span class="sh-rank">'+rk[0]+' '+rk[1]+'</span>'+(best?' · best '+'★★★'.slice(0,best)+'☆☆☆'.slice(0,3-best):'')+'</div>'+pathHTML(st,L);
  h+='<div class="sh-row"><b>⏱</b><span><strong>'+Math.floor(DUR/60)+':'+('0'+DUR%60).slice(-2)+'</strong> shift</span></div>';
  h+='<div class="sh-row"><b>💰</b><span>Goal: earn <strong>'+tg+'</strong> Tips</span></div>';
  h+='<div class="sh-row"><b>⭐</b><span>Bonus: '+esc(ob.txt)+'</span></div>';
  if(mod)h+='<div class="sh-row"><b>'+MODS[mod].e+'</b><span><strong>'+MODS[mod].n+'</strong><br><small>'+MODS[mod].d+'</small></span></div>';
  if(nm)h+='<div class="sh-row"><b>🏅</b><span>Level '+nm.L+' reward: '+nm.n+'</span></div>';
  h+='<div class="sh-row"><b>✨</b><span>Rare finds can drop (collection '+distinct()+'/21)</span></div>';
  h+='<button class="sh-btn" data-a="start">▶ Start shift</button><button class="sh-btn alt" data-a="col">📖 Collection & achievements</button><button class="sh-btn alt" data-a="free">🎮 Free play (no timer)</button><button class="sh-btn alt" data-a="leave">✕ Leave</button>';
  var d=overlay(h);wire(d,L);
}

/* ---------- juice: coins fly to the counter, the Tips counter pulses, combo flames ---------- */
var jRaf=0,jTips=0;
function juice(){
  jRaf=requestAnimationFrame(juice);
  if(!ov){cancelAnimationFrame(jRaf);jRaf=0;return;}
  var st=M.state();if(!st)return;
  var d=MG.tips-jTips;jTips=MG.tips;
  if(d>0.5){
    var tg=ov.querySelector('.mg-tips'),ln=ov.querySelector('.mg-lane'),cs=ln?ln.querySelectorAll('.mg-c.go'):[];
    if(tg&&ln){var tr=tg.getBoundingClientRect(),or=ov.getBoundingClientRect(),from=cs.length?cs[cs.length-1].getBoundingClientRect():ln.getBoundingClientRect(),
      sx=from.left+from.width/2-or.left,sy=from.top+from.height/2-or.top,n=Math.min(7,1+Math.floor(d/Math.max(1,st.u))),k;
      for(k=0;k<n;k++){(function(k){var c=document.createElement('i');c.className='sh-coin';c.textContent='🪙';c.style.left=(sx+(Math.random()*40-20))+'px';c.style.top=(sy+(Math.random()*20-10))+'px';ov.appendChild(c);
        setTimeout(function(){c.style.transform='translate('+(tr.left+tr.width/2-or.left-sx)+'px,'+(tr.top+tr.height/2-or.top-sy)+'px) scale(.6)';c.style.opacity='.2';},40+k*60);
        setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c);},900+k*60);})(k);}
      tg.classList.remove('pulse');void tg.offsetWidth;tg.classList.add('pulse');}
  }
  var cb=ov.querySelector('.mg-combo');if(cb){var c=st.combo||0;cb.dataset.l=c>=10?3:c>=6?2:c>=3?1:0;}
}

/* ---------- attach when a stall mini-game opens ---------- */
function attach(){
  var n=document.getElementById('mg');if(!n||n===ov)return;
  ov=n;S=null;hud=null;obEl=null;cancelAnimationFrame(raf);cancelAnimationFrame(jRaf);jTips=MG.tips;jRaf=requestAnimationFrame(juice);
  var st=M.state();if(!st)return;
  briefing(P(st.i).L);
}
new MutationObserver(function(){var n=document.getElementById('mg');if(n&&n!==ov)attach();else if(!n&&ov){ov=null;S=null;hud=null;obEl=null;cancelAnimationFrame(raf);window.mfbLevel=1;}}).observe(document.body,{childList:true});
attach();
})();
