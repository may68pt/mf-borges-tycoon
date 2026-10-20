/* esp.js - Esmeralda's own panel. Tap her in the market and a card opens: the market dashboard (cash, level, culture, hype, heritage,
   stalls, sales, footfall, today's event, best and worst stall, days to the concession review) plus her opinion on the state of things.
   Her opinion depends on her mood (sweet, lovey, cold, furious) and on the real numbers, and it is different every time you ask.
   Read-only: it never changes the economy. It pauses the game while open. Add ?noesm to switch it off. */
(function(){
'use strict';
if(window.mfbEsp||/[?&]noesm/.test(location.search))return;
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var T=window.THREE,ESM=g('ESM'),S=g('S'),E=window.mfbEsm;
if(!T||!ESM||!S||!E)return;
var origClick=window.click;if(typeof origClick!=='function')return;
function rnd(n){return Math.floor(Math.random()*n);}
function one(a){return a[rnd(a.length)];}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function snd(n){try{g('sfx')(n);}catch(e){}}

/* ---------- facts about the market ---------- */
function facts(){
  var f={cash:Math.round(S.cash||0),cul:Math.round(S.cul||0),hyp:Math.round(S.hyp||0),her:Math.round(S.her||0),lv:S.lv||1,xp:S.xp||0,day:S.day||1,days:g('DAYS')||30,
    sales:S.sales||0,foot:S.foot||1,tide:Math.round(S.tide||0),ph:S.ph,ev:S.ev||{n:'Clear day',f:1},n:0,max:0,best:null,worst:null,gigs:S.gigs||0,top:null,wk:''};
  try{f.n=g('nStalls')();f.max=g('maxS')();}catch(e){}
  try{var dn=g('DN'),dw=g('dow')();f.wk=dn[dw];}catch(e){}
  try{var ST=g('ST'),stalls=g('stalls');stalls.forEach(function(o){var cat=ST[o.i][1];if(cat==='amen'||cat==='lure'||!o.cnt)return;var t={name:ST[o.i][0],tot:o.tot,cnt:o.cnt};if(!f.best||t.tot>f.best.tot)f.best=t;if(!f.worst||t.tot<f.worst.tot)f.worst=t;});if(f.best===f.worst)f.worst=null;}catch(e){}
  try{var best=0;for(var k in S.fame)if(S.fame[k]>best){best=S.fame[k];f.top=k;}if(best<1)f.top=null;}catch(e){}
  f.left=f.days-f.day;return f;
}
function score(f){var s=Math.min(1,f.cul/40)*.25+Math.min(1,f.hyp/40)*.25+Math.min(1,f.her/60)*.3+(f.cash>=0?Math.min(1,.3+f.cash/4000):0)*.2;return Math.round(Math.max(0,Math.min(1,s))*100);}

/* ---------- opinions: [topic, test, {mood: [lines]}] ({x} placeholders are filled from the facts) ---------- */
var OP=[
 ['cash',function(f){return f.cash<0;},{sweet:['We are in the red, meu querido... but we are in the red TOGETHER. 💕'],lovey:['Negative cash? Sit, sit, I will make you a coffee and we will cry a little. ☕'],cold:['Minus €{cashabs}. I am not angry. I am calculating.'],furious:['MINUS €{cashabs}?! Who pays the lights, the Pope?!']}],
 ['cash',function(f){return f.cash>=0&&f.cash<400;},{sweet:['Only €{cash} in the till, but I believe in miracles and in you!'],lovey:['Our little till is so thin, poor thing. Let us feed it with sales. ❤'],cold:['€{cash}. A tip jar has more ambition.'],furious:['€{cash}?! My handbag has more than that!']}],
 ['cash',function(f){return f.cash>=2500;},{sweet:['€{cash}! I could kiss every coin. I will start with you. 💋'],lovey:['So much money, and still so humble. Come here, a hug. 🤗'],cold:['€{cash}. Spend it before the taxman smells it.'],furious:['€{cash} just sitting there?! Money asleep is money wasted! BUILD something!']}],
 ['cash',function(f){return f.cash>=400&&f.cash<2500;},{sweet:['€{cash} in the till. Not bad at all, chefe!'],lovey:['The till is comfortable, and so am I. Beijinho!'],cold:['€{cash}. Adequate. Do not get excited.'],furious:['€{cash}. Adequate? NO. I want MORE.']}],
 ['culture',function(f){return f.cul<30;},{sweet:['Culture is at {cul}. The city wants 30, but we will charm them, claro.'],lovey:['Culture {cul}... a few more nice acts and she will blossom. 🌸'],cold:['Culture {cul} of the 30 they demand. The inspector will not be charmed.'],furious:['CULTURE {cul}?! This is a MARKET in a historic hall, not a car park!']}],
 ['culture',function(f){return f.cul>=30;},{sweet:['Culture {cul}. The professors would be so proud!'],lovey:['Such cultured guests, such lovely nights. ❤'],cold:['Culture {cul}. Fine. Do not let it slip.'],furious:['Culture {cul}. Do not you DARE let it drop now!']}],
 ['hype',function(f){return f.hyp<30;},{sweet:['Hype {hyp}. Nobody knows us yet! We need more noise, a band, a poster, something!'],lovey:['Our hype is shy at {hyp}. Let us introduce her to the city. 💃'],cold:['Hype {hyp}. They walk past us like we are a bank.'],furious:['HYPE {hyp}?! Even the pigeons ignore us!']}],
 ['hype',function(f){return f.hyp>=30;},{sweet:['Hype {hyp}! Everyone is talking about us, até a minha vizinha!'],lovey:['The whole city is whispering about us. I love it! ✨'],cold:['Hype {hyp}. Attention is cheap. Keep it.'],furious:['Hype {hyp}, good, and still not ENOUGH!']}],
 ['heritage',function(f){return f.her<30;},{sweet:['Heritage {her}. The old iron is tired, querido. Let us be gentle with her.'],lovey:['Our hall is hurting at {her}. Give her a Monday of rest. 🏛'],cold:['Heritage {her}. If the roof falls, I called it first.'],furious:['HERITAGE {her}?! You are wrecking a monument, chefe!']}],
 ['heritage',function(f){return f.her>=50;},{sweet:['Heritage {her}. The hall is glowing! I want to kiss the columns!'],lovey:['The old girl is happy at {her}. So am I. ❤'],cold:['Heritage {her}. Acceptable. The pigeons are behaving.'],furious:['Heritage {her}. Good. Now do not touch ANYTHING.']}],
 ['stalls',function(f){return f.n===0;},{sweet:['No stalls yet? A blank canvas! Choose a lovely corner, meu amor.'],lovey:['An empty market is a market full of dreams. Let us build one. 🌈'],cold:['Zero stalls. Zero income. Even I can do that maths.'],furious:['ZERO STALLS?! What am I even the boss OF?!']}],
 ['stalls',function(f){return f.n>0&&f.n<f.max;},{sweet:['We have {n} stalls and room for {max}. Space is a gift, let us fill it!'],lovey:['{n} stalls, {free} empty places waiting for new friends. 💕'],cold:['{free} free places and you stand there. Interesting strategy.'],furious:['{free} FREE PLACES! Rent is not paying itself, build, BUILD!']}],
 ['stalls',function(f){return f.n>0&&f.n>=f.max;},{sweet:['All {max} places taken, the market is bursting with life!'],lovey:['A full house of stalls! My heart is full too. 💗'],cold:['Full. Now make them earn.'],furious:['Full?! Good. Now make EVERY ONE of them earn!']}],
 ['best',function(f){return !!f.best&&f.best.tot>0;},{sweet:['{best} is our star! €{bestavg} per sale, beijinho to the owner!'],lovey:['Everybody adores {best}. I may have a favourite. Shh. 😘'],cold:['{best} makes money. The others should take notes.'],furious:['Thank God for {best}, the ONLY one who understands work!']}],
 ['worst',function(f){return !!f.worst;},{sweet:['{worst} is a bit shy, no? A smile from you and it will bloom!'],lovey:['Poor {worst}, so quiet. Maybe it just needs a cuddle (and a better spot). 🥺'],cold:['{worst} sold €{worstot}. I could do better with a sign that says Free Hugs.'],furious:['{worst} sold €{worstot}?! A sleeping cat has better sales!']}],
 ['event',function(f){return /Rain/.test(f.ev.n);},{sweet:['Rain today! Cosy! Folks will want a nice snack and a hug.'],lovey:['Raindrops on the iron roof... romantic. And good for the food stalls. 🌧'],cold:['Rain. Footfall at {foot}. Do not blame me, blame the sky.'],furious:['RAIN?! Who invited the rain?! Somebody call the sky and complain!']}],
 ['event',function(f){return /Cruise/.test(f.ev.n);},{sweet:['A cruise ship! Tourists with wallets! Smile, everyone, SMILE!'],lovey:['Little tourists with their little cameras, so sweet. Sell them something! 🛳'],cold:['Cruise ship day. They will buy anything with a rooster on it.'],furious:['TOURISTS! They block the aisles and still do not buy! Tchh!']}],
 ['event',function(f){return /food/i.test(f.ev.n);},{sweet:['Street food festival! The whole place smells divine!'],lovey:['Food everywhere... I might stop for a little taste. 🍽'],cold:['Food festival. Everybody is selling food. Be better.'],furious:['FOOD FESTIVAL and I have not eaten! Out of my way!']}],
 ['event',function(f){return /Fire/.test(f.ev.n);},{sweet:['Fire inspection today! Let us keep everything tidy and look innocent. 😇'],lovey:['The inspector is coming. Hide the extension cords, querido. 🧯'],cold:['Inspection. If anything is wrong, it is not my fault. It never is.'],furious:['FIRE INSPECTION and the cables look like spaghetti! FIX IT!']}],
 ['event',function(f){return /Viral|Dog|Flower/.test(f.ev.n);},{sweet:['{ev} today! A lovely crowd is coming, I can feel it!'],lovey:['{ev}! The universe is being kind to us today. ✨'],cold:['{ev}. Make hay while the sun shines.'],furious:['{ev} and you are standing around?! GO SELL!']}],
 ['review',function(f){return f.left<=5;},{sweet:['Only {left} days till the review! Heart in my throat, but I trust you!'],lovey:['{left} days to the review. Whatever happens, I am proud of you. 🥹'],cold:['{left} days to the review. Culture, hype, heritage. You know the numbers.'],furious:['{left} DAYS TO THE REVIEW AND YOU ARE LOOKING AT THE CEILING?!']}],
 ['review',function(f){return f.left>5;},{sweet:['{left} days until the concession review. Lots of time to shine!'],lovey:['{left} days to go. We will get there together. 💪'],cold:['{left} days. Time is not infinite, whatever you think.'],furious:['{left} days. And I want every one of them COUNTED!']}],
 ['night',function(f){return f.ph==='night';},{sweet:['Tonight the hall belongs to the music! Dance a little, chefe!'],lovey:['Night time... the lights, the sound, the people. Pure magic. 🎶'],cold:['The night shift. Try not to blow the speakers.'],furious:['The band is TOO LOUD! Or not loud enough! Make up your mind!']}],
 ['gigs',function(f){return !!f.top;},{sweet:['Our {top} nights have been wonderful! Book more, I love a mosh pit hug!'],lovey:['The {top} crowd is my favourite family. ❤🎸'],cold:['{top} fans are loyal. Fans are customers. Customers are money.'],furious:['{top}! Again {top}! I hear it in my SLEEP!']}],
 ['level',function(f){return true;},{sweet:['Level {lv}, and you wear it so well, meu chefe!'],lovey:['Level {lv}! Look how far we have come. ❤'],cold:['Level {lv}. A number. What matters is what you do with it.'],furious:['Level {lv}?! The real boss is level ONE HUNDRED, and she is me!']}]
];
var VERD={
 sweet:[[80,'A DREAM! Keep doing exactly this, meu amor! 💕'],[55,'Rather nice, honestly. A few corners to polish.'],[0,'We have work to do, but I love us anyway.']],
 lovey:[[80,'I could cry, it is so beautiful. ❤'],[55,'Good, good. Come here, I will fix your collar.'],[0,'Do not worry, my heart. We will fix it, slowly.']],
 cold:[[80,'Surprisingly competent. I am watching.'],[55,'Mediocre. Which is better than most.'],[0,'Disappointing. Fix it before I do.']],
 furious:[[80,'GOOD! ...Do not let it go to your head!'],[55,'Not terrible. NOT GOOD. Not terrible.'],[0,'A DISASTER! I want it fixed. NOW!']]
};
var WILD={
 sweet:['Did you eat? You look thin, chefe.','A little bird told me you are doing a great job. The little bird is me.','I redecorated the office. Do not ask me where.','I danced with a pastel de nata today. It said yes.'],
 lovey:['I baked something for the whole market. No, not the stalls, the PEOPLE. ❤','Marcelino from the olive stall asked about you. Sweet boy.','I think the pigeons like me. Is that not sweet?','Sometimes I stand in the hall and just breathe it in. 🏛'],
 cold:['I have been keeping a list. Your name is on it.','I do not hate anyone. I merely remember everything.','Nobody asked, but I have opinions about the lighting.','Silence is also an opinion. Mine is long.'],
 furious:['I SAW SOMEONE LEAN ON MY COLUMN! WHO?!','Somebody parked a scooter INSIDE the market!','I am NOT shouting! I am projecting!','I need a coffee, a nap and a lawyer. In that order!']
};
function fill(s,f){
  var free=Math.max(0,f.max-f.n);
  return s.replace(/\{(\w+)\}/g,function(m,k){
    var v={cash:f.cash,cashabs:Math.abs(f.cash),cul:f.cul,hyp:f.hyp,her:f.her,n:f.n,max:f.max,free:free,left:Math.max(0,f.left),lv:f.lv,foot:'x'+f.foot.toFixed(2),ev:f.ev.n,
      best:f.best?f.best.name:'',bestavg:f.best&&f.best.cnt?(f.best.tot/f.best.cnt).toFixed(1):'',worst:f.worst?f.worst.name:'',worstot:f.worst?Math.round(f.worst.tot):'',top:f.top||''}[k];
    return v===undefined?m:v;});
}
function opinions(){
  var f=facts(),m=E.mood||'sweet',sc=score(f),V=VERD[m],verdict=(V.find(function(x){return sc>=x[0];})||V[2])[1];
  // pick the topics that fire; problems first, then a spread of topics
  var hit=OP.filter(function(o){try{return o[1](f);}catch(e){return false;}}),by={};
  hit.forEach(function(o){(by[o[0]]=by[o[0]]||[]).push(o);});
  var topics=Object.keys(by).filter(function(t){return t!=='level';});
  for(var i=topics.length-1;i>0;i--){var j=rnd(i+1),x=topics[i];topics[i]=topics[j];topics[j]=x;}
  var urgent=['cash','culture','hype','heritage','stalls','review'].filter(function(t){return by[t]&&by[t][0][2];});
  var order=topics.sort(function(a,b){return (f.cash<0&&b==='cash'?1:0)-(f.cash<0&&a==='cash'?1:0);}).slice(0,3);
  var lines=order.map(function(t){var o=one(by[t]);return {t:t,s:fill(one(o[2][m]),f)};});
  lines.push({t:'wild',s:fill(one(WILD[m]),f)});
  return {score:sc,verdict:verdict,lines:lines,f:f,mood:m};
}

/* ---------- the panel ---------- */
var css=[
'#esp{position:fixed;inset:0;z-index:9990;display:flex;align-items:flex-end;justify-content:center;background:rgba(8,6,20,.6);animation:espf .2s both}',
'@media(min-width:700px){#esp{align-items:center}}',
'@keyframes espf{from{opacity:0}to{opacity:1}}@keyframes espu{from{transform:translateY(40px)}to{transform:none}}',
'#esp .ec{width:100%;max-width:440px;max-height:92vh;overflow:auto;background:#1b1530;color:#fff;border:4px solid #111;border-radius:18px 18px 0 0;box-shadow:0 0 0 3px var(--ac,#e8478f);padding:14px 14px 18px;animation:espu .25s both;font-family:inherit}',
'@media(min-width:700px){#esp .ec{border-radius:18px}}',
'#esp .eh{display:flex;align-items:center;gap:12px;margin-bottom:8px}#esp .ea{flex:none;width:68px;height:68px;border-radius:50%;background:var(--ac,#e8478f);border:4px solid #111;display:flex;align-items:center;justify-content:center;font-size:38px;box-shadow:0 0 0 3px #fff3,0 0 18px var(--ac);animation:espb 1.6s infinite}',
'#esp.furious .ea{animation:espk .12s infinite}@keyframes espb{50%{transform:translateY(-3px)}}@keyframes espk{50%{transform:translate(2px,-1px) rotate(2deg)}}',
'#esp .en{flex:1}#esp .en b{display:block;font-size:20px}#esp .en span{display:inline-block;margin-top:2px;padding:1px 9px;border-radius:9px;background:var(--ac);font-size:12px;font-weight:900}',
'#esp .ex{flex:none;width:36px;height:36px;border-radius:10px;border:3px solid #111;background:#34406e;color:#fff;font-size:18px;font-weight:900;cursor:pointer}',
'#esp .eq{position:relative;background:#fff;color:#1b1530;border:3px solid #111;border-radius:14px;padding:10px 12px;margin:8px 0 10px;font-weight:800;font-size:14px;line-height:1.3}#esp .eq::before{content:"";position:absolute;top:-11px;left:30px;border:8px solid transparent;border-bottom-color:#111;border-top:0}#esp .eq::after{content:"";position:absolute;top:-7px;left:32px;border:6px solid transparent;border-bottom-color:#fff;border-top:0}',
'#esp .em{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:900;margin:4px 0 8px}#esp .em i{flex:1;height:12px;background:#000;border-radius:7px;overflow:hidden;border:2px solid #000}#esp .em u{display:block;height:100%;background:linear-gradient(90deg,#d6201f,#ffd166,#43d17a)}',
'#esp .eg{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:6px 0 10px}#esp .et{background:rgba(255,255,255,.07);border-radius:11px;padding:7px 9px;font-size:11px;line-height:1.25}#esp .et b{display:block;font-size:17px}#esp .et .b{height:6px;margin-top:4px;background:#000;border-radius:4px;overflow:hidden}#esp .et .b u{display:block;height:100%;background:#43d17a}#esp .et.lo .b u{background:#ff6b6b}#esp .et.lo b{color:#ffb0b0}',
'#esp h3{margin:10px 0 4px;font-size:13px;opacity:.9}#esp .eo{display:flex;gap:9px;align-items:flex-start;background:rgba(255,255,255,.06);border-radius:11px;padding:8px 10px;margin:6px 0;font-size:13px;line-height:1.3;animation:espf .4s both}#esp .eo b{font-size:20px;flex:none}',
'#esp .ebt{display:block;width:100%;min-height:44px;margin:8px 0 0;border-radius:12px;border:3px solid #111;background:var(--ac,#e8478f);color:#fff;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit}#esp .ebt.alt{background:#34406e;min-height:38px;font-size:13px}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

var panel=null,savedSpeed=0,AV={sweet:'🥰',lovey:'😍',cold:'😐',furious:'😡'},COL={sweet:'#e8478f',lovey:'#ff5c8a',cold:'#6a7a90',furious:'#d6201f'},
  MOODN={sweet:'Sweet',lovey:'Lovey-dovey',cold:'Cold as ice',furious:'FURIOUS'},TI={cash:'💰',culture:'🎭',hype:'🔥',heritage:'🏛',stalls:'🧺',best:'🏆',worst:'🥶',event:'📅',review:'⏰',night:'🌙',gigs:'🎸',level:'⭐',wild:'💬'};
var HEAD={sweet:['Oh, chefe! Come, sit, tell me everything. 💕','Meu amor! Look at my market, is it not lindo?'],lovey:['Come here, querido, I was just thinking about you. ❤','Ai, my favourite person in the whole hall!'],cold:['Yes? Make it quick.','I am busy. Talk.'],furious:['WHAT?! Oh, it is you. Fine. LISTEN.','You have a nerve showing your face today!']};
function tile(ic,label,val,frac,goal){var lo=goal!=null&&frac<1;return '<div class="et'+(lo?' lo':'')+'">'+ic+' '+label+'<b>'+val+'</b>'+(frac!=null?'<div class="b"><u style="width:'+Math.round(Math.max(0,Math.min(1,frac))*100)+'%"></u></div>':'')+'</div>';}
function render(newMood){
  var o=opinions(),f=o.f,m=o.mood,need=null;
  try{need=g('need')(f.lv);}catch(e){}
  if(!panel){panel=document.createElement('div');panel.id='esp';document.body.appendChild(panel);}
  panel.className=m;panel.style.setProperty('--ac',COL[m]);
  var h='<div class="ec"><div class="eh"><div class="ea">'+AV[m]+'</div><div class="en"><b>Esmeralda</b><span>'+MOODN[m]+'</span></div><button class="ex" aria-label="Close">✕</button></div>';
  h+='<div class="eq">'+esc(one(HEAD[m]))+'</div>';
  h+='<div class="em">Market mood <i><u style="width:'+o.score+'%"></u></i> '+o.score+'/100</div>';
  h+='<div class="eq" style="margin-top:2px">'+esc(o.verdict)+'</div>';
  h+='<h3>📊 Market dashboard</h3><div class="eg">';
  h+=tile('💰','Cash','€'+f.cash,f.cash>=0?Math.min(1,f.cash/3000):0,f.cash>=0?null:1);
  h+=tile('⭐','Level '+f.lv,(need?f.xp+' / '+need+' XP':'XP '+f.xp),need?f.xp/need:null);
  h+=tile('🎭','Culture (needs 30)',f.cul,f.cul/30,30);
  h+=tile('🔥','Hype (needs 30)',f.hyp,f.hyp/30,30);
  h+=tile('🏛','Heritage (needs 50)',f.her,f.her/50,50);
  h+=tile('📅','Day',f.day+' / '+f.days+(f.wk?' · '+f.wk:''),f.day/f.days);
  h+=tile('🧺','Stalls',f.n+' / '+f.max,f.max?f.n/f.max:0);
  h+=tile('🧾','Sales so far',f.sales,null);
  h+=tile('👣','Footfall','x'+f.foot.toFixed(2),Math.min(1,f.foot/1.3));
  h+=tile('🌊','Crowd tide',f.tide,Math.min(1,f.tide/60));
  h+='</div>';
  h+='<div class="eo"><b>'+(f.ev.i?'📅':'📅')+'</b><span><strong>Today:</strong> '+esc(f.ev.n)+'</span></div>';
  if(f.best)h+='<div class="eo"><b>🏆</b><span><strong>Top stall:</strong> '+esc(f.best.name)+' · €'+Math.round(f.best.tot)+' ('+f.best.cnt+' sales)</span></div>';
  if(f.worst)h+='<div class="eo"><b>🥶</b><span><strong>Quietest stall:</strong> '+esc(f.worst.name)+' · €'+Math.round(f.worst.tot)+'</span></div>';
  h+='<h3>💬 What Esmeralda thinks</h3>';
  o.lines.forEach(function(l,k){h+='<div class="eo" style="animation-delay:'+(k*.12)+'s"><b>'+(TI[l.t]||'💬')+'</b><span>'+esc(l.s)+'</span></div>';});
  h+='<button class="ebt" data-a="again">🎤 Ask her again</button><button class="ebt alt" data-a="close">Back to the market</button></div>';
  panel.innerHTML=h;
  panel.querySelector('[data-a=again]').onclick=function(){snd('click');render();};
  panel.querySelector('[data-a=close]').onclick=panel.querySelector('.ex').onclick=close;
  panel.onclick=function(e){if(e.target===panel)close();};
}
function open(){
  if(panel)return;savedSpeed=S.speed||0;S.speed=0;try{g('ui')();}catch(e){}
  snd('click');render();
  try{var B=g('bubble');var set=g('SET'),old=set&&set.pop;if(set)set.pop=1;B(one(HEAD[E.mood]).replace(/\s*[\u{1F300}-\u{1FAFF}❤]+/gu,''),0,0,3.4,E.mood==='furious'?'say':'love',ESM,2.4);if(set)set.pop=old;}catch(e){}
}
function close(){
  if(!panel)return;panel.remove();panel=null;if(savedSpeed&&!S.over)S.speed=savedSpeed;savedSpeed=0;try{g('ui')();}catch(e){}snd('click');
}

/* ---------- tapping her: wrap the game's tap handler ---------- */
function hit(e){
  try{
    if(!ESM.visible||S.over||g('INSPECT'))return false;
    var cam=g('cam'),cv=g('c');if(!cv||!cv.getBoundingClientRect)cv=document.querySelector('canvas');if(!cam||!cv)return false;
    var r=cv.getBoundingClientRect(),best=1e9;
    [0.5,1.3,2.0].forEach(function(y){var v=new T.Vector3(ESM.position.x,ESM.position.y+y,ESM.position.z).project(cam);
      var sx=r.left+(v.x+1)/2*r.width,sy=r.top+(1-v.y)/2*r.height,d=Math.hypot(e.clientX-sx,e.clientY-sy);if(d<best)best=d;});
    return best<Math.max(30,r.width/22);
  }catch(x){return false;}
}
window.click=function(e){if(!panel&&hit(e)){open();return;}return origClick.apply(this,arguments);};
window.mfbEsp={open:open,close:close,opinions:opinions};
})();
