/* staff.js - who runs the stalls, and Esmeralda's discipline. Every morning each stall is run either by its OWNER or by a hired WORKER.
   Esmeralda is the boss of the market: owners get respect, workers get the hard treatment, because when the owner is absent she is the boss
   of that stall. In the morning everybody has to greet her (the player too, with the "Say good morning" button): whoever skips it is fined.
   During the day workers sometimes slack (phone, nap, smoking, rude to customers): she walks over, tells them off and fines them. Three strikes
   and the worker is BANNED: the stall is shut for a couple of days. At the end of the market Esmeralda walks out and goes home.
   Needs esmeralda.js. Add ?noesm to switch it off. */
(function(){
'use strict';
if(window.mfbStaff||/[?&]noesm/.test(location.search))return;
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var E=window.mfbEsm,ESM=g('ESM'),R=g('R'),stalls=g('stalls'),ST=g('ST');
if(!E||!E.goTo||!S||!ESM||!R||!R.render||!stalls||!ST)return;
function rnd(n){return Math.floor(Math.random()*n);}
function one(a){return a[rnd(a.length)];}
function snd(n){try{g('sfx')(n);}catch(e){}}
function toast(m,i){try{g('toast')(m,i);}catch(e){}}
function bub(txt,mesh,y,kind,life){try{var set=g('SET'),old=set&&set.pop;if(set)set.pop=1;g('bubble')(txt,0,0,y||2.6,kind||'say',mesh,life||3);if(set)set.pop=old;}catch(e){}}

var D=window.mfbStaff={day:0,greeted:true,streak:0,greets:0,skips:0,fines:0,bans:0,scolds:0,leaving:false,gone:false,round:[],recs:new Map(),log:[]};
var P=new Map();      // per stall: the worker who works there (name, strikes, ban days), kept from day to day
var WN=['Rui','Tiago','Bruna','Dinis','Kelly','Nuno','Carlota','Hugo','Beatriz','Ivo','Lara','Pedro','Ines','Marco','Sofia'];
var DEADLINE=645,PLAYER_FINE=function(){return 20+5*(S.lv||1);};

/* ---------- who works where today ---------- */
function eligible(s){var d=ST[s.i];return d&&d[1]!=='lure'&&d[1]!=='amen'&&d[2]!=='wc';}
function ownerName(s){try{var b=g('bioOf')(s);return String(b.who).split(' of ')[0];}catch(e){return 'The owner';}}
function wprof(s){var p=P.get(s);if(!p){p={name:one(WN),rude:Math.random(),strikes:0,ban:0,hist:0};P.set(s,p);}return p;}
function morning(){
  D.day=S.day;D.greeted=false;D.leaving=false;D.gone=false;D.round=[];D.recs=new Map();D.log=[];
  P.forEach(function(p,s){if(p.ban>0){p.ban--;if(p.ban===0){p.strikes=0;p.name=one(WN);p.rude=Math.random();s.__bo=0;s.off=false;toast('The ban is over: a new worker takes over '+ST[s.i][0],'✅');}}});
  var t0=S.t;
  stalls.forEach(function(s){
    if(!eligible(s)||!s.pr)return;
    var p=wprof(s);
    var banned=p.ban>0,role=banned?'worker':(Math.random()<.45?'owner':'worker');
    var rec={s:s,role:role,name:role==='owner'?ownerName(s):p.name,rude:p.rude,banned:banned,done:false,at:t0+12+Math.random()*80};
    D.recs.set(s,rec);if(!banned)D.round.push(rec);
  });
  D.round.sort(function(a,b){return a.at-b.at;});
}
function recOf(s){return D.recs.get(s);}

/* ---------- Esmeralda's tasks: she walks to the stall, then scolds ---------- */
var queue=[],busy=false;
function enqueue(rec,type){if(!rec||rec.banned)return;for(var i=0;i<queue.length;i++)if(queue[i].rec===rec)return;queue.push({rec:rec,type:type});}
function lineFor(type,worker,furious){
  var W={
    greet:['You did NOT say good morning, {n}! In MY market, we say good morning!','{n}! Manners! Bom dia, it is not optional!','Not even a hello, {n}?! That is a strike!'],
    phone:['{n}, put the phone down! Customers are not going to serve themselves!','Instagram?! At WORK, {n}?! Give me that!','{n}, I saw it. Phone. Away. NOW.'],
    nap:['{n}, WAKE UP! This is not a hotel!','Sleeping on the job, {n}?! I will tell the pigeons to wake you!','{n}! Eyes open! Back to work!'],
    smoke:['{n}, no smoking inside! This is a HERITAGE building!','Put that out, {n}, before I put YOU out!','Smoking, {n}?! At the stall?! Fora!'],
    rude:['{n}, you do NOT talk to customers like that! Apologise!','I heard that, {n}! Respect the people who pay your salary!','Rude to a customer?! Not in my market, {n}!'],
    check:['{n}, where is your boss? No boss, no problem: I AM the boss now!','Worker today, {n}? Then listen to me, because I am watching!','{n}, I am covering for your boss. Do not make me regret it!']};
  var O={
    greet:['Sr. {n}, you forgot to greet me... just this once, I forgive.','{n}, good morning would have been nice, querido.','No bom dia, {n}? Cheeky. Do not make it a habit.'],
    phone:['{n}, please, the phone. We are professionals, no?','{n}, I know you are the owner, but the customers are right there.'],
    nap:['{n}, a little rest is fine, but not on the counter, por favor.','{n}, you look tired. Coffee? ...and then work.'],
    smoke:['{n}, I respect you, but not inside the hall, please.','{n}, the heritage inspector would have a heart attack. Outside, please.'],
    rude:['{n}, a bit of patience with the customers, no?','{n}, we are one family here. Be kind.'],
    check:['Good morning, {n}! Everything in order, I see. Bravo!','{n}, a pleasure as always. Keep it up!']};
  var tab=worker?W:O,arr=tab[type]||tab.greet;return one(arr);
}
var REPLY_W=['Yes, dona Esmeralda...','Sorry! Sorry! It will not happen again!','Sim, sim, desculpe!','Ok, ok, ok!'];
var REPLY_O=['You are right, Esmeralda. Desculpa.','Fair enough. Bom dia!','Sim, sim. My bad.'];
var FINE={greet:12,phone:15,nap:15,smoke:20,rude:25,check:0};
var TELL={phone:'📱 ...scrolling...',nap:'😴 zzz...',smoke:'🚬 ...',rude:'😒 "Whatever."'};

function process(){
  if(busy||!queue.length)return;
  var q=queue[0],s=q.rec.s;if(!stalls.has(s.x+','+s.z)||!s.m||!s.m.visible){queue.shift();return;}
  var tgt=s.m.position;
  if(!E.goTo(tgt.x+1.1,tgt.z+.4,function(){discipline(q);busy=false;},14))return;
  queue.shift();busy=true;
}
function discipline(q){
  var rec=q.rec,s=rec.s,worker=rec.role==='worker',type=q.type;
  if(!stalls.has(s.x+','+s.z))return;
  var furious=E.mood==='furious',fine=Math.round((FINE[type]||0)*(worker?1:.6)*(furious?1.25:1)*(1+.04*(S.lv||1)));
  var line=lineFor(type,worker,furious).replace('{n}',rec.name);
  if(furious&&type!=='check')line=line.toUpperCase();
  E.say(line,'say',ESM,3.6);
  if(type==='check'){
    rec.checked=1;
    if(worker&&rec.rude>.6&&Math.random()<.5){/* the worker answers back: that is a strike */ setTimeout(function(){bub('Eu cá não levo ordens de ninguém...',s.m,2.7,'say',2.8);setTimeout(function(){escalate(rec,'rude');},1400);},900);return;}
    bub(one(worker?REPLY_W:REPLY_O),s.m,2.7,'say',2.6);return;
  }
  D.scolds++;snd('bad');
  if(fine>0){S.cash-=fine;D.fines+=fine;try{g('popup')('-€'+fine,s.m.position.x,s.m.position.z,2.4);}catch(e){}}
  setTimeout(function(){bub(one(worker?REPLY_W:REPLY_O),s.m,2.7,'say',2.6);},1100);
  if(worker){var p=wprof(s);p.strikes++;p.hist++;note(rec.name+' ('+ST[s.i][0]+'): '+type+' · strike '+p.strikes+'/3 · -€'+fine);
    if(p.strikes>=3)ban(rec,p);else toast(rec.name+' got strike '+p.strikes+'/3 from Esmeralda (-€'+fine+')','⚠️');
    if(Math.random()<.45)E.setMood('furious');}
  else{note(rec.name+' ('+ST[s.i][0]+'): '+type+' · told off · -€'+fine);toast('Esmeralda told '+rec.name+' off (-€'+fine+')','😤');}
}
function escalate(rec,type){enqueue(rec,type);}
function ban(rec,p){
  var s=rec.s;p.ban=2+Math.min(2,p.hist>4?1:0)+(Math.random()<.4?1:0);D.bans++;s.__bo=1;s.off=true;rec.banned=true;
  setTimeout(function(){E.say('FORA! '+rec.name.toUpperCase()+', you are BANNED from my market! Out! OUT!','say',ESM,4);snd('bad');},1500);
  setTimeout(function(){bub('😳 ...',s.m,2.7,'say',2.6);},2600);
  toast('Esmeralda BANNED '+rec.name+' from '+ST[s.i][0]+'! The stall is shut for '+p.ban+' days.','🚫');
  note('🚫 '+rec.name+' banned from '+ST[s.i][0]+' for '+p.ban+' days');
}
function note(t){D.log.unshift(t);if(D.log.length>8)D.log.pop();}

/* ---------- the morning greeting ---------- */
function stallGreets(rec){
  var s=rec.s;rec.done=true;
  var pOK=rec.role==='owner'?.96:Math.max(.35,.8-.35*rec.rude);
  if(Math.random()<pOK){
    bub(rec.role==='owner'?one(['Bom dia, Esmeralda! All set.','Bom dia, dona Esmeralda!','Good morning! The stall is ready.']):one(['B-bom dia, dona Esmeralda!','Bom dia! Yes boss!','Bom dia, dona Esmeralda... 😬']),s.m,2.7,'love',2.6);
  }else{
    bub(rec.role==='owner'?'(busy, forgot to greet...)':one(['(pretends not to see her)','(headphones on...) 🎧','(yawns) ...']),s.m,2.7,'say',2.6);
    D.skips++;enqueue(rec,'greet');
  }
}
function playerGreets(){
  if(D.greeted||S.ph!=='setup'||!ESM.visible)return false;
  D.greeted=true;D.greets++;D.streak++;snd('coin');
  var pl=g('Pp');try{var set=g('SET'),old=set&&set.pop;if(set)set.pop=1;g('bubble')('Bom dia, Esmeralda!',0,0,2.6,'love',pl,2.6);if(set)set.pop=old;}catch(e){}
  var m=E.mood,R2={sweet:['Bom dia, meu querido! Come, come, you are late but I forgive you! 💕','Bom dia, chefe! You look lindo today!'],lovey:['Bom dia, my heart! ❤ Did you sleep well?','Aww, bom dia, querido! A hug?'],cold:['Hm. Bom dia. Barely on time.','Bom dia. Do not expect a medal.'],furious:['Hmpf. Bom dia. I am NOT in the mood!','Bom dia?! Fine. FINE. Get to work!']};
  setTimeout(function(){E.say(one(R2[m]||R2.sweet),'say',ESM,3.4);},900);
  if(D.streak>0&&D.streak%3===0){var gift=25*Math.min(4,D.streak/3);setTimeout(function(){S.cash+=gift;toast('Esmeralda slips you an envelope: +€'+gift+' for '+D.streak+' good mornings in a row!','💌');snd('coin');},1800);}
  else toast('You greeted Esmeralda. Streak: '+D.streak+' (a gift every 3 days)','👋');
  return true;
}
function playerPenalty(){
  D.greeted=true;D.streak=0;D.skips++;var fine=PLAYER_FINE();S.cash-=fine;D.fines+=fine;snd('bad');
  E.setMood('furious');E.say('NÃO ME CUMPRIMENTAS?! Everybody greets me in the morning, CHEFE TAMBÉM!','say',ESM,4);
  toast('You did not greet Esmeralda: fine -€'+fine,'😡');note('You skipped the morning greeting · -€'+fine);
  try{g('popup')('-€'+fine,ESM.position.x,ESM.position.z,3);}catch(e){}
}

/* ---------- daytime misconduct and checks ---------- */
var mis=18,chk=25;
function dayTick(gt){
  mis-=gt;chk-=gt;
  if(mis<=0){mis=16+Math.random()*26;
    var ws=[];D.recs.forEach(function(r){if(!r.banned&&r.s.st==='open'&&!r.s.off&&r.s.m&&r.s.m.visible)ws.push(r);});
    if(ws.length){var r=one(ws),worker=r.role==='worker',p=worker?(.25+.55*r.rude):.03;
      if(Math.random()<p){var type=one(['phone','nap','smoke','rude']);bub(TELL[type],r.s.m,2.7,'say',3);setTimeout(function(){if(!r.banned)enqueue(r,type);},1800);}}}
  if(chk<=0){chk=28+Math.random()*30;
    var wk=[];D.recs.forEach(function(r){if(!r.banned&&r.role==='worker'&&r.s.st==='open'&&r.s.m&&r.s.m.visible)wk.push(r);});
    if(wk.length&&E.mood!=='lovey')enqueue(one(wk),'check');}
}

/* ---------- the player's greeting button ---------- */
var btn=document.createElement('button');btn.id='esg';btn.type='button';btn.hidden=true;
var st0=document.createElement('style');st0.textContent='#esg{position:fixed;left:50%;bottom:calc(86px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:80;min-height:46px;padding:8px 18px;border-radius:24px;border:3px solid #111;background:#e8478f;color:#fff;font:900 14px inherit;font-family:inherit;box-shadow:0 4px 0 rgba(0,0,0,.4);cursor:pointer;animation:esgb 1s infinite}@keyframes esgb{50%{transform:translateX(-50%) scale(1.06)}}#esg small{display:block;font-size:10px;opacity:.9}';
document.head.appendChild(st0);document.body.appendChild(btn);
btn.onclick=function(e){e.stopPropagation();playerGreets();};
function hhmm(m){m=Math.floor(m);return Math.floor(m/60)+':'+('0'+m%60).slice(-2);}
var DOOR=[22.5,10.6];

/* ---------- the per-frame hook ---------- */
var prev=R.render.bind(R),last=performance.now(),lastBtn='';
R.render=function(sc,cam){
  try{
    var n=performance.now(),dt=Math.min(.1,(n-last)/1000);last=n;
    if(S&&!S.over){
      var ph=S.ph,gt=S.speed?dt*S.speed/2:0;
      if(ph==='setup'&&D.day!==S.day)morning();
      if(ph==='setup'&&S.speed){
        while(D.round.length&&D.round[0].at<=S.t){var r=D.round.shift();if(!r.banned&&r.s.m&&r.s.m.visible)stallGreets(r);}
        if(!D.greeted&&S.t>=DEADLINE)playerPenalty();
      }
      if(ph==='day'&&!D.greeted)playerPenalty();
      if(ph==='day'&&gt>0)dayTick(gt);
      if(ph==='changeover'&&!D.leaving&&S.t>=21*60+15){D.leaving=true;queue.length=0;
        var tries=0;(function go(){if(!E.goTo(DOOR[0],DOOR[1],function(){E.say('Boa noite a todos! Amanhã quero\nTUDO impecável!','say',ESM,4);snd('click');setTimeout(function(){D.gone=true;},2600);},20)&&tries++<20)setTimeout(go,1000);})();}
      if(ph==='night'||ph==='end')D.gone=true;
      if(gt>0&&!D.gone&&ph!=='night')process();
      // a banned worker stays out whatever the player does
      P.forEach(function(p,s){if(p.ban>0&&s.__bo)s.off=true;});
      if(D.gone)ESM.visible=false;
    }
    // greeting button
    var show=S&&!S.over&&S.ph==='setup'&&!D.greeted&&ESM.visible,key=show?hhmm(DEADLINE-S.t):'';
    if(key!==lastBtn){lastBtn=key;btn.hidden=!show;if(show)btn.innerHTML='👋 Say good morning to Esmeralda<small>before '+hhmm(DEADLINE)+' or she fines you</small>';}
  }catch(e){}
  return prev(sc,cam);
};
D.greet=playerGreets;
D.summary=function(){
  var o={owners:[],workers:[],banned:[]};
  D.recs.forEach(function(r){var p=P.get(r.s)||{strikes:0};var row={stall:ST[r.s.i][0],name:r.name,role:r.role,strikes:r.role==='worker'?p.strikes:0,banned:r.banned,days:p.ban||0};(r.banned?o.banned:r.role==='owner'?o.owners:o.workers).push(row);});
  P.forEach(function(p,s){if(p.ban>0&&!D.recs.has(s))o.banned.push({stall:ST[s.i][0],name:p.name,role:'worker',strikes:3,banned:true,days:p.ban});});
  return o;
};
})();
