/* action.js - eight action mini-games with pixel-art scenes, particles and animation: steer, catch, dash, sort, toss, whack, fish and wheel.
   36 stalls play one of them. Every round is short (4-9 s). The shift level (window.mfbLevel, set by shift.js) makes them faster and harder.
   Needs art.js. Loaded after games.js and pixel.js. Each game has its own animation loop, so it also runs smoothly on phones. */
(function(){
'use strict';
var M=window.mfbMG,A=window.mfbArt;if(!M||!M.TPL||!A||window.__mga)return;window.__mga=1;
var TPL=M.TPL,SPEC=M.SPEC,TN=M.TN,H=M.H,pick=H.pick,IH=H.itemsHTML,px=A.px,blk=A.blk,Fx=A.Fx;
function snd(n){try{if(typeof sfx==='function')sfx(n);}catch(e){}}
function lv(){return Math.max(1,window.mfbLevel||1);}
function rnd(n){return Math.floor(Math.random()*n);}
function one(a){return a[rnd(a.length)];}
function sel1(h,s){[].forEach.call(h.querySelectorAll('.mg-ib'),function(b){b.classList.toggle('on',+b.dataset.i===s);});}

/* ---------- styles ---------- */
var css=[
'#mg canvas.lg-cv{display:block;width:auto;max-width:100%;max-height:31vh;margin:6px auto 2px;border:3px solid #111;border-radius:10px;background:#1d2340;touch-action:none;image-rendering:pixelated;box-shadow:0 3px 0 rgba(0,0,0,.4)}',
'#mg .lg-msg{text-align:center;font:900 13px/1.2 inherit;color:#ffe27a;min-height:16px;margin:2px 0}',
'#mg .lg-pr{height:8px;background:#000;border:2px solid #000;border-radius:5px;overflow:hidden;margin:4px auto;max-width:440px}#mg .lg-pr u{display:block;height:100%;background:#f2c94c;width:100%}',
/* whack: mounds, critters, mallet */
'#mg .lg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:340px;margin:4px auto;padding:8px;border-radius:12px;background:linear-gradient(#5aa05a,#3d7a3d);border:3px solid #111}',
'#mg .lg-grid.shk{animation:lgshk .3s}@keyframes lgshk{20%{transform:translate(-4px,2px)}40%{transform:translate(4px,-2px)}60%{transform:translate(-3px,0)}80%{transform:translate(3px,1px)}}',
'#mg .lg-hole{position:relative;height:min(64px,8vh);border:0;padding:0;background:transparent;overflow:visible;color:inherit;cursor:pointer}',
'#mg .lg-hole::before{content:"";position:absolute;left:4%;right:4%;bottom:0;height:46%;border-radius:50%;background:radial-gradient(#150d08 50%,#6a4a2a 54%,#8a6238 100%);box-shadow:0 3px 0 rgba(0,0,0,.35)}',
'#mg .lg-hole b{position:absolute;left:0;right:0;bottom:18%;text-align:center;font-size:min(34px,4.4vh);line-height:1;transform:translateY(80%) scale(.6);opacity:0;pointer-events:none;clip-path:inset(0 0 0 0)}',
'#mg .lg-hole.up b{animation:lgpop .22s cubic-bezier(.3,1.6,.5,1) forwards}',
'@keyframes lgpop{from{transform:translateY(80%) scale(.6);opacity:0}to{transform:none;opacity:1}}',
'#mg .lg-hole.hit b{animation:lgsq .18s forwards}@keyframes lgsq{to{transform:translateY(40%) scale(1.3,.4) rotate(8deg);opacity:0}}',
'#mg .lg-hole.bad::after{content:"💥";position:absolute;left:0;right:0;top:-14%;text-align:center;font-size:min(36px,5vh);animation:lgboom .35s forwards}@keyframes lgboom{from{transform:scale(.4)}to{transform:scale(1.4);opacity:0}}',
'#mg .lg-hole.hit::after{content:"POW!";position:absolute;left:-10%;right:-10%;top:-26%;text-align:center;font:900 13px monospace;color:#ffe27a;text-shadow:1px 1px 0 #000,-1px -1px 0 #000;animation:lgpow .4s forwards}@keyframes lgpow{from{transform:scale(.5)}to{transform:translateY(-12px) scale(1.2);opacity:0}}',
'#mg .lg-mal{position:absolute;left:30%;top:-20%;font-size:min(34px,4.6vh);pointer-events:none;transform-origin:90% 90%;animation:lgmal .22s forwards}@keyframes lgmal{from{transform:rotate(-70deg)}60%{transform:rotate(20deg)}to{transform:rotate(20deg);opacity:0}}',
/* sort: belt, bins, stamps */
'#mg .lg-belt{position:relative;display:flex;align-items:center;justify-content:space-between;gap:6px;max-width:420px;margin:6px auto;padding:8px;border-radius:12px;border:3px solid #111;background:repeating-linear-gradient(90deg,#3a3f50 0 14px,#2e3342 14px 28px);animation:lgbelt .5s linear infinite}',
'@keyframes lgbelt{to{background-position:28px 0}}',
'#mg .lg-bin{width:min(64px,15vw);height:min(64px,8vh);border:3px solid #111;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;transition:transform .15s}',
'#mg .lg-bin.no{background:#c0392b;box-shadow:inset 0 -6px 0 rgba(0,0,0,.25)}#mg .lg-bin.yes{background:#2e9e5b;box-shadow:inset 0 -6px 0 rgba(0,0,0,.25)}#mg .lg-bin.bump{transform:scale(1.25) rotate(-6deg)}',
'#mg .lg-card{position:relative;width:min(120px,15vh);height:min(120px,15vh);border:4px solid #111;border-radius:14px;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font-size:min(68px,8vh);transition:transform .15s,opacity .15s;touch-action:none;box-shadow:0 5px 0 rgba(0,0,0,.35),inset 0 0 0 3px #e8e0c8}',
'#mg .lg-stamp{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-14deg) scale(0);font:900 18px monospace;padding:2px 8px;border:3px solid;border-radius:6px;pointer-events:none;background:rgba(255,255,255,.85)}',
'#mg .lg-stamp.on{animation:lgstamp .35s forwards}@keyframes lgstamp{0%{transform:translate(-50%,-50%) rotate(-14deg) scale(2.2);opacity:0}30%{opacity:1;transform:translate(-50%,-50%) rotate(-14deg) scale(1)}100%{transform:translate(-50%,-50%) rotate(-14deg) scale(1);opacity:0}}',
'#mg .lg-q{text-align:center;font-weight:800;font-size:13px;margin-top:6px}#mg .lg-q span{font-size:26px;vertical-align:middle}',
'#mg .lg-r2{display:flex;gap:10px;justify-content:center}#mg .lg-r2 button{flex:1;max-width:170px;height:52px;border-radius:14px;border:3px solid #111;font-size:24px;font-weight:900;color:#fff;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.35)}#mg .lg-r2 button:active{transform:translateY(3px);box-shadow:none}',
'#mg .lg-sp{position:absolute;pointer-events:none;font-size:18px;animation:lgsp .7s forwards}@keyframes lgsp{from{transform:translate(0,0) scale(.6);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(1.2);opacity:0}}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- helpers ---------- */
function frame(h,fn){var last=performance.now(),dead=false,id=0;
  function go(t){if(dead||!h.isConnected)return;var dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(fn(dt)===true){dead=true;return;}id=requestAnimationFrame(go);}
  id=requestAnimationFrame(go);return function(){dead=true;cancelAnimationFrame(id);};}
function cvPos(cv,e){var r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*cv.width,y:(e.clientY-r.top)/r.height*cv.height};}
function verdict(q){return q>.9?'Perfect!':q>.7?'Nice!':q>.5?'Okay':'Sloppy';}
function bar(h){var p=h.querySelector('.lg-pr u');return function(f){if(p)p.style.width=Math.max(0,Math.min(1,f))*100+'%';};}
function shell(h,a,hint,W,Hh){
  h.innerHTML=IH(a.items,hint)+'<canvas class="lg-cv" width="'+W+'" height="'+Hh+'"></canvas><div class="lg-pr"><u></u></div><div class="lg-msg">Pick an item to start</div>';
  var cv=h.querySelector('canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  return {cv:cv,g:g,msg:h.querySelector('.lg-msg'),pr:bar(h)};
}
function finish(a,sh,sel,q,okMin){sh.pr(0);sh.msg.textContent=verdict(q);if(q<(okMin||.35)){a.miss('Missed it!');}else a.add(sel,q);}
function spark(host,x,y,e){var d=document.createElement('i');d.className='lg-sp';d.textContent=e;d.style.left=x+'px';d.style.top=y+'px';d.style.setProperty('--dx',(Math.random()*60-30)+'px');d.style.setProperty('--dy',(-30-Math.random()*30)+'px');host.appendChild(d);setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},760);}

/* ---------- 1. steer: a delivery scooter through the city ---------- */
TPL.steer=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then STEER the scooter: drag left and right, grab the coins',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null,fx=Fx();
  var s={x:160,tx:160,off:0,obs:[],coins:[],hits:0,got:0,t:0,sp:150,nx:0,cn:0,dur:5,fl:0,ex:0};
  function paint(){
    fx.begin(g);
    px(g,0,0,160,100,'#3c4364');
    px(g,0,0,20,100,'#a9a59c');px(g,140,0,20,100,'#a9a59c');px(g,19,0,2,100,'#e6e1c8');px(g,139,0,2,100,'#e6e1c8');
    var o=(s.off/2)%20,y,k;for(y=-20+o;y<100;y+=20){px(g,59,y,2,10,'#e6e1c8');px(g,99,y,2,10,'#e6e1c8');}
    var so=(s.off/2)%60;for(k=-1;k<3;k++){A.tree(g,9,k*60+so+10);A.lamp(g,149,k*60+so+40);}
    if(s.sp>170)for(k=0;k<6;k++)px(g,26+k*21,((s.off*1.4/2)+k*37)%110-8,1,7,'rgba(255,255,255,.2)');
    s.coins.forEach(function(c){A.coin(g,c.x/2,c.y/2,s.t*9+c.x);});
    s.obs.forEach(function(ob){var gx=ob.x/2,gy=ob.y/2+5;if(ob.k==='cone')A.cone(g,gx,gy);else if(ob.k==='cat')A.cat(g,gx,gy,s.t);else A.bin(g,gx,gy);});
    A.scooter(g,s.x/2,88,(s.tx-s.x)/50,s.t,true);
    if(sel>=0)A.emo(g,a.items[sel].e,s.x,146,15);
    if(s.fl>0){g.globalAlpha=Math.min(.5,s.fl*2);g.fillStyle='#f33';g.fillRect(0,0,W,HH);g.globalAlpha=1;}
    px(g,0,0,160,3,'rgba(0,0,0,.45)');px(g,0,0,160*Math.min(1,s.t/s.dur),3,'#43d17a');
    A.txt(g,'🪙 '+s.got,34,18,13,'#ffe27a','#10101c');
    fx.end(g);
  }
  function start(){
    s.hits=0;s.got=0;s.t=0;s.obs=[];s.coins=[];s.nx=.3;s.cn=.5;s.x=s.tx=160;s.dur=4.5+Math.min(2,lv()*.15);s.sp=130+12*lv()+(5-a.gear)*3;s.ex=0;run=true;sh.msg.textContent='Go go go!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;s.off+=s.sp*dt;s.x+=(s.tx-s.x)*Math.min(1,dt*12);s.fl=Math.max(0,s.fl-dt);fx.up(dt);
      s.ex-=dt;if(s.ex<=0){s.ex=.07;fx.burst(s.x+rnd(5)-2,184,1,['#9a9aa8','#c9c9d4'],26,-30);}
      s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.32,.62-.02*lv());s.obs.push({x:50+rnd(220),y:-20,k:one(['cone','cat','bin'])});}
      s.cn-=dt;if(s.cn<=0){s.cn=.55+Math.random()*.5;s.coins.push({x:50+rnd(220),y:-14});}
      var i;for(i=s.obs.length-1;i>=0;i--){var ob=s.obs[i];ob.y+=s.sp*dt;if(ob.y>230)s.obs.splice(i,1);else if(Math.abs(ob.y-168)<22&&Math.abs(ob.x-s.x)<24){s.obs.splice(i,1);s.hits++;s.fl=.3;snd('bad');fx.burst(s.x,160,16,['#ffd166','#e5442f','#fff'],130);fx.shake(.9);fx.text(s.x,130,'OUCH!','#ff6b6b',true);}}
      for(i=s.coins.length-1;i>=0;i--){var c=s.coins[i];c.y+=s.sp*dt;if(c.y>230)s.coins.splice(i,1);else if(Math.abs(c.y-166)<22&&Math.abs(c.x-s.x)<24){s.coins.splice(i,1);s.got++;snd('click');fx.coin(c.x,c.y);fx.text(c.x,c.y-14,'+1','#ffd166');}}
      paint();sh.pr(1-s.t/s.dur);
      if(s.t>=s.dur){run=false;var q=Math.min(1,Math.max(.3,1-.22*s.hits)+.03*s.got);fx.burst(s.x,150,s.hits?4:20,['#ffd166','#43d17a','#fff'],120);finish(a,sh,sel,s.hits>=4?0:q,.35);paint();return true;}
    });
  }
  function mv(e){if(e.pointerType==='mouse'&&!e.buttons&&!run)return;s.tx=Math.max(50,Math.min(270,cvPos(cv,e).x));}
  cv.onpointerdown=function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}mv(e);};cv.onpointermove=mv;
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 2. catch: a market shelf, a basket and falling goods ---------- */
TPL.catch=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then slide the basket to CATCH it. Gold ones count double!',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null,fx=Fx();
  var s={x:160,tx:160,f:[],good:0,bad:0,t:0,nx:0,need:3,dur:7,sq:0,bt:0,combo:0};
  var JAR=['#e5442f','#ffd166','#43d17a','#2f6db5','#e5442f','#ffd166','#8a63c7','#43d17a'];
  function paint(){
    fx.begin(g);
    px(g,0,0,160,100,'#2b2f55');
    for(var r=0;r<2;r++){var yy=22+r*20;px(g,0,yy,160,2,'#7a4c26');for(var j=0;j<10;j++){var c=JAR[(j+r*3)%JAR.length];blk(g,6+j*16,yy-9,8,9,c);px(g,7+j*16,yy-8,2,6,'rgba(255,255,255,.35)');}}
    A.awning(g,0,9,'#e5442f','#f4efe0');
    px(g,0,86,160,14,'#7b5a3a');for(var k=0;k<8;k++)px(g,k*20+((s.t*0)|0),86,1,14,'#6a4c30');px(g,0,86,160,1,'#9a7a54');
    s.f.forEach(function(o){var sw=3+(o.y/200)*6;px(g,o.x/2-sw/2,88,sw,2,'rgba(0,0,0,.35)');});
    s.f.forEach(function(o){if(o.gold){g.globalAlpha=.4+.3*Math.sin(s.t*12);A.disc(g,o.x/2,o.y/2,8,'#ffd166');g.globalAlpha=1;}A.emo(g,o.e,o.x,o.y,o.gold?30:26,o.r);});
    A.basket(g,s.x/2,90,s.sq,s.bt>0);
    px(g,0,0,160,3,'rgba(0,0,0,.45)');px(g,0,0,160*Math.min(1,s.good/s.need),3,'#43d17a');
    if(s.combo>1)A.txt(g,'x'+s.combo,288,20,16,'#ffe27a','#10101c');
    fx.end(g);
  }
  function start(){
    s.good=0;s.bad=0;s.t=0;s.f=[];s.nx=.2;s.sq=0;s.bt=0;s.combo=0;s.need=Math.max(2,3+Math.floor(lv()/4)-(a.gear>=2?1:0));s.dur=7;run=true;sh.msg.textContent='Catch '+s.need+'!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;s.x+=(s.tx-s.x)*Math.min(1,dt*14);s.sq=Math.max(0,s.sq-dt*4);s.bt=Math.max(0,s.bt-dt);fx.up(dt);
      s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.33,.55-.015*lv());var good=Math.random()<.45,oth=a.items.filter(function(it,i){return i!==sel;}),gold=good&&Math.random()<.14;
        s.f.push({x:30+rnd(260),y:-16,good:good,gold:gold,r:Math.random()*6,vr:(Math.random()-.5)*4,e:good?a.items[sel].e:(Math.random()<.35?'💣':oth.length?one(oth).e:'🪨'),v:95+8*lv()});}
      for(var i=s.f.length-1;i>=0;i--){var o=s.f[i];o.y+=o.v*dt;o.r+=o.vr*dt;
        if(o.y>160&&o.y<190&&Math.abs(o.x-s.x)<30){s.f.splice(i,1);
          if(o.good){var n=o.gold?2:1;s.good+=n;s.combo++;s.sq=1;snd('click');fx.burst(o.x,168,o.gold?18:8,o.gold?['#ffd166','#fff3b0']:['#43d17a','#b6ffcb'],90);fx.text(o.x,150,o.gold?'GOLDEN! +2':'+1','#ffe27a',o.gold);if(o.gold)fx.coin(o.x,160);}
          else{s.bad++;s.combo=0;s.bt=.4;snd('bad');fx.burst(o.x,168,12,['#ff6b6b','#ffd166'],110);fx.shake(.6);fx.text(o.x,150,'OOPS','#ff6b6b');}}
        else if(o.y>215)s.f.splice(i,1);}
      paint();sh.pr(1-s.t/s.dur);
      if(s.good>=s.need||s.t>=s.dur){run=false;var q=s.good>=s.need?Math.max(.4,1-.18*s.bad):.3+.4*s.good/s.need-.1*s.bad;if(s.good>=s.need)fx.burst(s.x,160,22,['#ffd166','#43d17a','#fff'],140);finish(a,sh,sel,s.good<2?0:q,.35);paint();return true;}
    });
  }
  function mv(e){s.tx=Math.max(24,Math.min(296,cvPos(cv,e).x));}
  cv.onpointerdown=function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}mv(e);};cv.onpointermove=mv;
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 3. dash: a runner across hills, jump the obstacles, grab the coins ---------- */
TPL.dash=function(h,a){
  var W=320,HH=140,sh=shell(h,a,'Pick an item, then TAP to jump over the obstacles and grab the coins',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null,fx=Fx();
  var s={y:0,vy:0,obs:[],coins:[],hits:0,got:0,t:0,nx:0,off:0,sp:150,fl:0,dur:5,fr:0,ft:0,land:0};
  var GR=58;
  function paint(){
    fx.begin(g);
    A.sky(g,'#2a3b82','#f08a5d',40);A.disc(g,122,24,7,'#ffe9a0');A.disc(g,122,24,5,'#fff6cf');
    var i,x;for(i=0;i<3;i++){var cx=((i*70-s.off*.06/2)%200+200)%200-20;px(g,cx,12+i*5,16,3,'rgba(255,255,255,.45)');px(g,cx+4,10+i*5,9,3,'rgba(255,255,255,.45)');}
    for(x=0;x<160;x+=4){var hh=14+Math.round(6*Math.sin((x+s.off*.12)/13));px(g,x,GR-hh-4,4,hh+6,'#3d5f8f');}
    for(x=0;x<160;x+=4){var h2=7+Math.round(5*Math.sin((x+s.off*.3)/8+2));px(g,x,GR-h2,4,h2+2,'#2f8a55');}
    px(g,0,GR,160,12,'#3a9a5a');px(g,0,GR,160,2,'#6fe08a');px(g,0,GR+8,160,4,'#2c7345');
    for(x=-10+((s.off/2)%20)*-1;x<160;x+=20){px(g,x,GR+4,3,2,'#2c7345');px(g,x+9,GR+7,2,2,'#6fe08a');}
    s.coins.forEach(function(c){A.coin(g,c.x/2,(c.y)/2,s.t*9+c.x);});
    s.obs.forEach(function(o){var gx=o.x/2;if(o.k==='rock')A.rock(g,gx,GR+3);else if(o.k==='cactus')A.cactus(g,gx,GR+3);else A.crate(g,gx,GR+3);});
    px(g,22,GR+2,12-Math.min(8,s.y/6),2,'rgba(0,0,0,.28)');
    A.runner(g,28,GR+3-s.y/2,s.fr,s.y,'#e5442f');
    if(sel>=0)A.emo(g,a.items[sel].e,70,(GR-30-s.y/2)*2,14);
    if(s.fl>0){g.globalAlpha=Math.min(.5,s.fl*2);g.fillStyle='#f33';g.fillRect(0,0,W,HH);g.globalAlpha=1;}
    px(g,0,0,160,3,'rgba(0,0,0,.45)');px(g,0,0,160*Math.min(1,s.t/s.dur),3,'#43d17a');
    A.txt(g,'🪙 '+s.got,34,18,12,'#ffe27a','#10101c');
    fx.end(g);
  }
  function jump(){if(run&&s.y<=0.5){s.vy=330;snd('click');fx.burst(56,114,5,['#c9d6c0','#fff'],40,-20);}}
  function start(){
    s.y=0;s.vy=0;s.obs=[];s.coins=[];s.hits=0;s.got=0;s.t=0;s.nx=.7;s.dur=4.6+Math.min(2,lv()*.12);s.sp=150+11*lv();s.land=0;run=true;sh.msg.textContent='Tap to jump!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;s.off+=s.sp*dt;s.fl=Math.max(0,s.fl-dt);fx.up(dt);s.ft+=dt;if(s.ft>.11){s.ft=0;s.fr++;}
      var was=s.y>0;s.vy-=980*dt;s.y=Math.max(0,s.y+s.vy*dt);if(s.y===0&&s.vy<0){s.vy=0;if(was){fx.burst(56,116,6,['#c9d6c0','#9bd0a8'],60,-10);}}
      s.nx-=dt;if(s.nx<=0){s.nx=.8+Math.random()*.5-Math.min(.25,lv()*.02);var k=one(['rock','cactus','crate']);s.obs.push({x:340,k:k});s.coins.push({x:340,y:116-46});if(Math.random()<.5)s.coins.push({x:372,y:116-40});}
      var i;for(i=s.obs.length-1;i>=0;i--){var o=s.obs[i];o.x-=s.sp*dt;if(o.x<-30)s.obs.splice(i,1);else if(Math.abs(o.x-56)<20&&s.y<20){s.obs.splice(i,1);s.hits++;s.fl=.3;snd('bad');fx.burst(58,100,14,['#ffd166','#e5442f','#fff'],120);fx.shake(.8);fx.text(60,70,'OUCH!','#ff6b6b',true);}}
      for(i=s.coins.length-1;i>=0;i--){var c=s.coins[i];c.x-=s.sp*dt;if(c.x<-20)s.coins.splice(i,1);else if(Math.abs(c.x-56)<16&&Math.abs(c.y-(116-s.y-14))<18){s.coins.splice(i,1);s.got++;snd('click');fx.coin(c.x,c.y);fx.text(c.x,c.y-12,'+1','#ffd166');}}
      paint();sh.pr(1-s.t/s.dur);
      if(s.t>=s.dur){run=false;var q=Math.min(1,Math.max(.35,1-.28*s.hits)+.03*s.got);if(!s.hits)fx.burst(56,90,18,['#ffd166','#43d17a','#fff'],130);finish(a,sh,sel,s.hits>=3?0:q,.35);paint();return true;}
    });
  }
  cv.onpointerdown=function(e){e.preventDefault();jump();};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 4. sort: a quality-control belt with stamps ---------- */
TPL.sort=function(h,a){
  var sel=-1,run=false,stop=null,n=5,i=0,ok=0,cur=null,t=0,dur=8,sx=null,dx=0,streak=0;
  h.innerHTML=IH(a.items,'Pick an item, then check each card: swipe RIGHT if it matches, LEFT if not')+'<div class="lg-q"></div><div class="lg-belt"><div class="lg-bin no">✖</div><div class="lg-card">❔<div class="lg-stamp"></div></div><div class="lg-bin yes">✔</div></div><div class="lg-r2"><button style="background:#c0392b">✖ No</button><button style="background:#2e9e5b">✔ Yes</button></div><div class="lg-pr"><u></u></div><div class="lg-msg">Pick an item to start</div>';
  var belt=h.querySelector('.lg-belt'),card=h.querySelector('.lg-card'),st=h.querySelector('.lg-stamp'),qq=h.querySelector('.lg-q'),msg=h.querySelector('.lg-msg'),pr=bar(h),bn=h.querySelectorAll('.lg-r2 button'),bNo=h.querySelector('.lg-bin.no'),bYes=h.querySelector('.lg-bin.yes');
  function next(){
    if(i>=n){end();return;}
    var oth=a.items.filter(function(it,k){return k!==sel;}),D=['🍄','🪨','🧦','🔩','🦴','🧲','🪵','🍂'];
    var yes=Math.random()<.5;cur={yes:yes,e:yes?a.items[sel].e:(oth.length&&Math.random()<.6?one(oth).e:one(D))};
    card.firstChild.nodeValue=cur.e;card.style.transition='none';card.style.transform='translateX(-120px) rotate(-10deg)';card.style.opacity='0';
    requestAnimationFrame(function(){requestAnimationFrame(function(){card.style.transition='';card.style.transform='none';card.style.opacity='1';});});
  }
  function ans(yes){
    if(!run||!cur)return;var right=(yes===cur.yes);
    if(right){ok++;streak++;snd('click');}else{streak=0;snd('bad');}
    st.textContent=right?'✔ MATCH':'✖ WRONG';st.style.color=right?'#1e8a4a':'#c0392b';st.style.borderColor=st.style.color;st.classList.remove('on');void st.offsetWidth;st.classList.add('on');
    var b=yes?bYes:bNo;b.classList.add('bump');setTimeout(function(){b.classList.remove('bump');},160);
    var r=card.getBoundingClientRect(),br=belt.getBoundingClientRect();for(var k=0;k<4;k++)spark(belt,r.left-br.left+r.width/2+(Math.random()*30-15),r.top-br.top+r.height/2,right?one(['✨','⭐','💫']):one(['💢','❌']));
    card.style.transform='translateX('+(yes?160:-160)+'px) rotate('+(yes?18:-18)+'deg)';card.style.opacity='0';cur=null;i++;msg.textContent=right?(streak>1?'🔥 streak x'+streak:'✔'):'✖';setTimeout(next,170);
  }
  function end(){
    if(!run)return;run=false;if(stop)stop();var q=ok/n;pr(0);msg.textContent=verdict(q);card.firstChild.nodeValue='❔';cur=null;
    if(ok<n-2)a.miss('Mixed up!');else a.add(sel,Math.max(.5,q));
  }
  function start(){i=0;ok=0;t=0;streak=0;n=5+Math.min(3,Math.floor(lv()/3));dur=3+n*1.0-Math.min(1.5,lv()*.08);run=true;qq.innerHTML='Is it <span>'+a.items[sel].e+'</span> ?';msg.textContent='';next();
    if(stop)stop();stop=frame(h,function(dt){if(!run)return true;t+=dt;pr(1-t/dur);if(t>=dur){end();return true;}});}
  bn[0].onpointerdown=function(e){e.preventDefault();ans(false);};bn[1].onpointerdown=function(e){e.preventDefault();ans(true);};
  card.onpointerdown=function(e){e.preventDefault();sx=e.clientX;dx=0;try{card.setPointerCapture(e.pointerId);}catch(x){}};
  card.onpointermove=function(e){if(sx===null||!cur)return;dx=e.clientX-sx;card.style.transition='none';card.style.transform='translateX('+dx+'px) rotate('+dx/12+'deg)';};
  card.onpointerup=card.onpointercancel=function(){if(sx===null)return;var d=dx;sx=null;dx=0;card.style.transition='';if(Math.abs(d)>40)ans(d>0);else card.style.transform='none';};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  return {tick:function(){}};
};

/* ---------- 5. toss: a fairground booth, a wobbling target and the wind ---------- */
TPL.toss=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then PULL BACK and let go. Watch the wind!',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null,fx=Fx();
  var LX=160,LY=176,s={tx:160,td:1,aim:null,shot:null,n:0,qs:[],t:0,sp:70,wind:0,wob:0};
  function paint(){
    fx.begin(g);
    px(g,0,0,160,100,'#3a2f55');for(var y=6;y<100;y+=8)for(var x=((y/8)%2)*8;x<160;x+=16)px(g,x,y,15,7,'#41355f');
    for(var i=0;i<16;i++)px(g,i*10+3,3+(i%2),3,3,((i+Math.floor(s.t*3))%3===0)?'#ffd166':((i+Math.floor(s.t*3))%3===1?'#e5442f':'#43d17a'));
    px(g,0,8,160,2,'#555a6a');px(g,0,10,160,1,'#2a2e3a');
    var bx=s.tx/2;px(g,bx-1,10,1,6,'#9a9aa8');px(g,bx+1,10,1,6,'#9a9aa8');
    A.board(g,bx,28,12,s.wob);
    px(g,0,86,160,14,'#7b5a3a');px(g,0,86,160,2,'#9a7a54');
    px(g,76,76,2,12,'#7a4c26');px(g,84,76,2,12,'#7a4c26');px(g,76,86,10,2,'#7a4c26');px(g,77,72,1,6,'#c88a4a');px(g,84,72,1,6,'#c88a4a');
    if(s.aim){var dx=LX-s.aim.x,dy=LY-s.aim.y,L=Math.min(110,Math.hypot(dx,dy)),an=Math.atan2(dy,dx);
      for(var k=1;k<=6;k++){g.fillStyle='rgba(255,255,255,'+(.8-k*.1)+')';g.fillRect(Math.round(LX+Math.cos(an)*L*k*.85/3*1.1)-2,Math.round(LY+Math.sin(an)*L*k*.85/3*1.1)-2,4,4);}
      g.strokeStyle='#e0b070';g.lineWidth=3;g.beginPath();g.moveTo(154,150);g.lineTo(LX-Math.cos(an)*L*.25,LY-Math.sin(an)*L*.25);g.lineTo(166,150);g.stroke();
      A.emo(g,a.items[sel].e,LX-Math.cos(an)*L*.25,LY-Math.sin(an)*L*.25,26);}
    else if(!s.shot&&sel>=0)A.emo(g,a.items[sel].e,LX,LY-20,26);
    if(s.shot){var p=s.shot.p,ay=-Math.sin(Math.PI*p)*34;px(g,s.shot.x/2-2,s.shot.y/2+4,4,1,'rgba(0,0,0,.25)');A.emo(g,a.items[sel].e,s.shot.x,s.shot.y+ay,26*(1-.4*p),p*9);}
    if(s.wind!==0){var wl=Math.round(Math.abs(s.wind)*5);px(g,118,4,34,9,'rgba(0,0,0,.5)');A.txt(g,(s.wind>0?'':'◀')+' wind '+wl+' '+(s.wind>0?'▶':''),135*2,17,11,'#9be7ff');}
    for(var q=0;q<3;q++){g.globalAlpha=q<3-s.n?1:.3;if(sel>=0)A.emo(g,a.items[sel].e,24+q*26,186,16);}g.globalAlpha=1;
    fx.end(g);
  }
  function fire(){
    var dx=LX-s.aim.x,dy=LY-s.aim.y,L=Math.min(110,Math.hypot(dx,dy));if(L<18||dy<=0){s.aim=null;return;}
    var an=Math.atan2(dy,dx),far=L/110*150+30,ex=LX+Math.cos(an)*far+s.wind*(far/150)*30,ey=LY-Math.abs(Math.sin(an))*far;
    s.shot={x:LX,y:LY,ex:ex,ey:Math.max(34,ey),p:0};s.aim=null;snd('click');
  }
  function start(){
    s.n=0;s.qs=[];s.t=0;s.tx=160;s.td=1;s.sp=70+9*lv();s.aim=null;s.shot=null;s.wob=0;s.wind=lv()>=3?(Math.random()<.5?-1:1)*(.4+Math.random()*.6)*Math.min(1,lv()/6):0;run=true;sh.msg.textContent='Pull back, aim, release';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;fx.up(dt);s.wob=Math.max(0,s.wob-dt*1.2);
      s.tx+=s.td*s.sp*dt;if(s.tx>285){s.tx=285;s.td=-1;}if(s.tx<35){s.tx=35;s.td=1;}
      if(s.shot){s.shot.p=Math.min(1,s.shot.p+dt/.5);s.shot.x=LX+(s.shot.ex-LX)*s.shot.p;s.shot.y=LY+(s.shot.ey-LY)*s.shot.p;
        if(s.shot.p>=1){var d=Math.hypot(s.shot.x-s.tx,s.shot.y-56),q=Math.max(0,1-d/(60+6*a.gear));s.qs.push(q);s.n++;s.wob=1;
          var tx=s.shot.x,ty=s.shot.y;s.shot=null;snd(q>.5?'coin':'bad');
          if(q>.85){fx.burst(tx,ty,22,['#ffd166','#fff','#e5442f'],140);fx.text(tx,ty-16,'BULLSEYE!','#ffe27a',true);fx.coin(tx,ty);}
          else if(q>.5){fx.burst(tx,ty,10,['#ffd166','#fff'],90);fx.text(tx,ty-14,'Close!','#fff');}
          else{fx.burst(tx,ty,8,['#9a9aa8','#c9c9d4'],70);fx.text(tx,ty-14,'Miss','#ff9b9b');}
          sh.msg.textContent=q>.85?'Bullseye!':q>.5?'Close!':'Miss';
          if(s.n>=3){run=false;var avg=s.qs.reduce(function(x,y){return x+y;},0)/3;paint();finish(a,sh,sel,avg<.25?0:Math.max(.4,.35+avg*.65),.4);return true;}}}
      paint();sh.pr(1-s.n/3);
    });
  }
  cv.onpointerdown=function(e){if(!run||s.shot)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}s.aim=cvPos(cv,e);};
  cv.onpointermove=function(e){if(s.aim)s.aim=cvPos(cv,e);};
  cv.onpointerup=cv.onpointercancel=function(){if(s.aim)fire();};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 6. whack: critters pop out of mounds, a mallet swings ---------- */
TPL.whack=function(h,a){
  var sel=-1,run=false,stop=null,N=8,popped=0,good=0,bad=0,hits=0,t=0,nx=0,hole=null,combo=0;
  var hs='';for(var k=0;k<6;k++)hs+='<button class="lg-hole" data-h="'+k+'"><b></b></button>';
  h.innerHTML=IH(a.items,'Pick an item, then TAP only that one when it pops up. Avoid the bombs!')+'<div class="lg-grid">'+hs+'</div><div class="lg-pr"><u></u></div><div class="lg-msg">Pick an item to start</div>';
  var grid=h.querySelector('.lg-grid'),hl=h.querySelectorAll('.lg-hole'),msg=h.querySelector('.lg-msg'),pr=bar(h);
  function hide(k){if(hl[k]){hl[k].classList.remove('up','hit','bad');}}
  function spawn(){
    var k=rnd(6),isGood=Math.random()<.62,oth=a.items.filter(function(it,i){return i!==sel;});
    var e=isGood?a.items[sel].e:(Math.random()<.3?'💣':oth.length?one(oth).e:'🪨');
    hole={k:k,good:isGood,t:Math.max(.55,1.05-.04*lv()),hit:false};hl[k].firstChild.textContent=e;hl[k].classList.remove('hit','bad');void hl[k].offsetWidth;hl[k].classList.add('up');popped++;if(isGood)good++;
  }
  function end(){
    run=false;if(stop)stop();for(var k=0;k<6;k++)hide(k);pr(0);
    var q=good?Math.max(0,hits/good-.25*bad):0;msg.textContent=verdict(q);
    if(hits<2||q<.3)a.miss('Too slow!');else a.add(sel,Math.max(.45,Math.min(1,q+.1)));
  }
  function start(){popped=0;good=0;bad=0;hits=0;t=0;nx=.4;hole=null;combo=0;N=7+Math.min(4,Math.floor(lv()/3));run=true;msg.textContent='Go!';
    if(stop)stop();stop=frame(h,function(dt){if(!run)return true;t+=dt;
      if(hole){hole.t-=dt;if(hole.t<=0){hide(hole.k);hole=null;nx=.25;if(hole===null&&combo)combo=0;}}
      else{nx-=dt;if(popped>=N){end();return true;}if(nx<=0)spawn();}
      pr(1-popped/N);});}
  [].forEach.call(hl,function(b,k){b.onpointerdown=function(e){e.preventDefault();
    var m=document.createElement('i');m.className='lg-mal';m.textContent='🔨';b.appendChild(m);setTimeout(function(){if(m.parentNode)m.parentNode.removeChild(m);},260);
    if(!run||!hole||hole.k!==k||hole.hit)return;hole.hit=true;
    if(hole.good){hits++;combo++;b.classList.remove('up');b.classList.add('hit');snd('click');msg.textContent=combo>1?'🔥 combo x'+combo:'POW!';}
    else{bad++;combo=0;b.classList.remove('up');b.classList.add('bad');snd('bad');grid.classList.remove('shk');void grid.offsetWidth;grid.classList.add('shk');msg.textContent='💥 Bomb!';}
    var kk=k;setTimeout(function(){hide(kk);},380);hole=null;nx=.3;};});
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  return {tick:function(){}};
};

/* ---------- 7. fish: hold to lift the net, keep the fish inside ---------- */
TPL.fish=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then HOLD to lift the net and keep the fish inside it',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null,fx=Fx();
  var s={ny:150,nv:0,fy:90,ty:90,ft:0,fx:200,dir:1,p:.3,t:0,hold:false,zh:44,dur:9,bub:[]};
  function paint(){
    fx.begin(g);
    A.sky(g,'#2a9ad8','#0f2f5c',100);
    for(var r=0;r<3;r++){g.globalAlpha=.07;g.fillStyle='#fff';var rx=(40+r*90+Math.sin(s.t*.6+r)*14);g.beginPath();g.moveTo(rx,0);g.lineTo(rx+30,0);g.lineTo(rx+80,200);g.lineTo(rx+30,200);g.fill();}g.globalAlpha=1;
    px(g,0,92,160,8,'#d9b36a');px(g,0,92,160,2,'#f0d08a');
    for(var w=0;w<6;w++){var wx=w<3?6+w*7:130+(w-3)*8,sw=Math.round(Math.sin(s.t*2+w)*1.5);for(var j=0;j<10;j++)px(g,wx+Math.round(Math.sin(j/3+s.t*2+w)*1.5),91-j*2,2,2,'#2f8a4a');}
    s.bub.forEach(function(b){px(g,b.x/2,b.y/2,1,1,'rgba(255,255,255,.6)');});
    px(g,79,0,1,Math.round((s.ny-s.zh/2)/2),'#e6e1c8');
    var zy=s.ny-s.zh/2,inside=Math.abs(s.fy-s.ny)<s.zh/2;
    g.globalAlpha=inside?.45:.25;g.fillStyle=inside?'#43d17a':'#fff';g.fillRect(122,zy,76,s.zh);g.globalAlpha=1;
    g.strokeStyle=inside?'#7dffb0':'#e6e1c8';g.lineWidth=3;g.strokeRect(122,zy,76,s.zh);
    A.fish(g,s.fx/2,s.fy/2,s.dir,s.t,'#ff8a3d');
    px(g,6,10,6,80,'#000');px(g,7,11+78*(1-s.p),4,78*s.p,s.p>.7?'#ffd166':'#43d17a');A.emo(g,sel>=0?a.items[sel].e:'🐟',20,12,16);
    px(g,0,0,160,3,'rgba(0,0,0,.45)');px(g,0,0,160*Math.min(1,s.t/s.dur),3,'#9be7ff');
    fx.end(g);
  }
  function start(){
    s.ny=150;s.nv=0;s.fy=120;s.ty=100;s.ft=0;s.p=.3;s.t=0;s.zh=Math.max(30,50-1.5*lv()+a.gear*3);s.dur=9;s.bub=[];s.fx=200;run=true;sh.msg.textContent='Hold to lift, release to sink';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;fx.up(dt);
      s.nv+=(s.hold?-620:430)*dt;s.nv*=Math.pow(.2,dt);s.ny+=s.nv*dt;var lo=s.zh/2+4,hi=186-s.zh/2;if(s.ny<lo){s.ny=lo;s.nv=0;}if(s.ny>hi){s.ny=hi;s.nv*=-.3;}
      s.ft-=dt;if(s.ft<=0){s.ft=.5+Math.random()*.8;s.ty=24+Math.random()*150;}
      var dy=s.ty-s.fy,sp=(80+11*lv())*dt;s.fy+=Math.max(-sp,Math.min(sp,dy));s.dir=Math.sin(s.t*.8)>0?1:-1;s.fx=200+Math.sin(s.t*.8)*40;
      if(Math.random()<dt*6)s.bub.push({x:30+Math.random()*260,y:190});for(var i=s.bub.length-1;i>=0;i--){s.bub[i].y-=40*dt;if(s.bub[i].y<4)s.bub.splice(i,1);}
      var inside=Math.abs(s.fy-s.ny)<s.zh/2;s.p+=(inside?.3:-.2)*dt;s.p=Math.min(1,s.p);
      if(inside&&Math.random()<dt*8)fx.burst(s.fx,s.fy,1,['#7dffb0','#fff'],40,-40);
      paint();sh.pr(1-s.t/s.dur);
      if(s.p>=1){run=false;var q=Math.min(1,.55+.45*(1-s.t/s.dur));fx.burst(s.fx,s.fy,26,['#ffd166','#fff','#7dffb0'],150);fx.text(s.fx,s.fy-20,'CAUGHT!','#ffe27a',true);fx.coin(s.fx,s.fy);paint();finish(a,sh,sel,q,.35);return true;}
      if(s.p<=0||s.t>=s.dur){run=false;paint();finish(a,sh,sel,s.p>.5?.4:0,.35);return true;}
    });
  }
  cv.onpointerdown=function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}s.hold=true;};
  cv.onpointerup=cv.onpointercancel=cv.onlostpointercapture=function(){s.hold=false;};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 8. wheel: a prize wheel, tap to brake it on your item ---------- */
TPL.wheel=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then TAP to stop the wheel on it. 3 spins!',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null,fx=Fx();
  var CX=160,CY=112,RR=74,NS=8,SEG=Math.PI*2/NS;
  var s={th:0,w:3,brk:false,segs:[],spin:1,res:0,wait:0,t:0,last:-1,tick:0};
  var COL=['#e5442f','#f4efe0','#2f6db5','#ffd166'];
  function build(){
    var oth=a.items.filter(function(it,i){return i!==sel;}),D=['💣','🪨','🍂'],ix=[0,1,2,3,4,5,6,7],tc=lv()<5?3:2,k;
    for(k=ix.length-1;k>0;k--){var j=rnd(k+1),tmp=ix[k];ix[k]=ix[j];ix[j]=tmp;}
    s.segs=[];for(k=0;k<NS;k++)s.segs.push({e:'',good:false});
    for(k=0;k<tc;k++){s.segs[ix[k]].e=a.items[sel].e;s.segs[ix[k]].good=true;}
    s.segs[ix[tc]].e='💣';
    for(k=tc+1;k<NS;k++)s.segs[ix[k]].e=oth.length?one(oth).e:one(D);
  }
  function idxAt(){var ang=((-Math.PI/2-s.th)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);return Math.floor(ang/SEG)%NS;}
  function paint(){
    fx.begin(g);
    px(g,0,0,160,100,'#2a1f45');for(var i=0;i<16;i++)px(g,i*10,0,5,100,'rgba(255,255,255,.05)');
    px(g,0,0,160,8,'#7a1f3a');for(var q=0;q<16;q++)px(g,q*10,8,10,3,q%2?'#7a1f3a':'#a82a50');
    g.save();g.translate(CX,CY);
    g.fillStyle='#16162a';g.beginPath();g.arc(0,0,RR+9,0,7);g.fill();
    for(var l=0;l<16;l++){var la=l/16*Math.PI*2,on=((l+Math.floor(s.t*(s.brk?4:10)))%2===0);g.fillStyle=on?'#ffe9a0':'#9a7a30';g.fillRect(Math.round(Math.cos(la)*(RR+5))-2,Math.round(Math.sin(la)*(RR+5))-2,5,5);}
    for(var k=0;k<NS;k++){var a0=s.th+k*SEG,a1=a0+SEG;g.fillStyle=COL[k%4];g.beginPath();g.moveTo(0,0);g.arc(0,0,RR,a0,a1);g.closePath();g.fill();g.strokeStyle='#16162a';g.lineWidth=2;g.stroke();
      var m=a0+SEG/2;g.save();g.rotate(m);g.translate(RR*.66,0);g.rotate(Math.PI/2);g.font='24px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(s.segs[k]?s.segs[k].e:'',0,0);g.restore();}
    g.fillStyle='#16162a';g.beginPath();g.arc(0,0,12,0,7);g.fill();g.fillStyle='#ffd166';g.beginPath();g.arc(0,0,8,0,7);g.fill();
    g.restore();
    var fl=s.brk?Math.sin(s.t*40)*.15:0;
    g.save();g.translate(CX,CY-RR-14);g.rotate(fl);g.fillStyle='#16162a';g.beginPath();g.moveTo(-9,-4);g.lineTo(9,-4);g.lineTo(0,20);g.fill();g.fillStyle='#ff4d4d';g.beginPath();g.moveTo(-6,-2);g.lineTo(6,-2);g.lineTo(0,15);g.fill();g.restore();
    for(var z=0;z<3;z++){g.globalAlpha=z<s.spin-1?.3:1;A.txt(g,z<s.spin-1?'✖':'🎟',22+z*20,186,14,'#fff');}g.globalAlpha=1;
    fx.end(g);
  }
  function start(){
    build();s.th=Math.random()*6;s.w=2.6+.16*lv();s.brk=false;s.spin=1;s.res=0;s.wait=0;s.t=0;s.last=idxAt();run=true;sh.msg.textContent='TAP to brake the wheel!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;fx.up(dt);
      if(s.res){s.wait-=dt;if(s.wait<=0){
        if(s.res===1){run=false;var q=Math.max(.5,1.1-.2*s.spin);finish(a,sh,sel,q,.35);return true;}
        if(s.spin>=3){run=false;finish(a,sh,sel,0,.35);return true;}
        s.spin++;s.res=0;s.brk=false;s.w=2.6+.16*lv()+.2*s.spin;sh.msg.textContent='Spin '+s.spin+' of 3: TAP to brake!';}}
      else{
        if(s.brk){s.w=Math.max(0,s.w-(3.2+Math.random()*.4)*dt);}
        s.th+=s.w*dt;var ix=idxAt();if(ix!==s.last){s.last=ix;if(s.brk&&s.w<7)snd('click');}
        if(s.brk&&s.w<=.02){s.w=0;var sg=s.segs[idxAt()];
          if(sg.good){s.res=1;s.wait=.9;fx.burst(CX,CY-RR+10,30,['#ffd166','#fff','#e5442f','#43d17a'],170);fx.text(CX,CY-RR-24,'JACKPOT!','#ffe27a',true);snd('coin');sh.msg.textContent='Got it!';}
          else{s.res=2;s.wait=.8;if(sg.e==='💣'){fx.shake(.9);fx.burst(CX,CY-RR+10,16,['#ff6b6b','#ffd166'],130);}fx.text(CX,CY-RR-24,sg.e==='💣'?'BOOM!':'Not it…','#ff9b9b');snd('bad');sh.msg.textContent=s.spin>=3?'Out of spins':'Try again!';}}}
      paint();sh.pr(1-(s.spin-1)/3);
    });
  }
  cv.onpointerdown=function(e){e.preventDefault();if(run&&!s.brk&&!s.res){s.brk=true;snd('click');}};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  for(var k=0;k<NS;k++)s.segs[k]={e:k%2?'🎡':'⭐',good:false};
  paint();return {tick:function(){}};
};

/* ---------- which stalls play which game ---------- */
var MAP={
  steer:['Surf & skate','Drone & gadget lab','Bike repair post','Vintage supercars'],
  catch:['Fresh juice cart','Lemonade cart','Roasted chestnuts','Olive oil & vinegar','Honey & spice'],
  dash:['Sneaker resale','Sportswear','Security post','Pet shop'],
  sort:['Antiques','Fine art gallery','Rare books & maps','Info kiosk','News agent'],
  toss:['VR arcade','Retro games','Wood toys','3D-print toys','Crêpe cart'],
  whack:['Comics & manga','Pizza slices','Falafel & kebab','Dumpling steamer','Sake & soju'],
  fish:['Oyster bar','Lobster roll shack','Sardine grill','Polvo à lagareiro'],
  wheel:['Absinthe parlour','Celebrity stylist','Luxury handbags','Diamond jeweller']
};
var LBL={steer:'Scooter run',catch:'Catch game',dash:'Dash',sort:'Sorting belt',toss:'Throw range',whack:'Pop-up game',fish:'Fishing',wheel:'Prize wheel'};
var HINT={steer:'Drag left and right to dodge the traffic',catch:'Slide the basket under the right items',dash:'Tap to jump over obstacles',sort:'Swipe right for a match, left if not',toss:'Pull back, aim, let go',whack:'Tap only the right one when it pops up',fish:'Hold to lift the net, keep the fish inside',wheel:'Tap to stop the wheel on your item'};
for(var k in LBL)TN[k]=LBL[k];
var n=0;
for(var m in MAP)MAP[m].forEach(function(nm){var sp=SPEC[nm];if(!sp)return;sp.m=m;sp.tag=HINT[m];sp.hint=HINT[m];n++;});
M.actionGames=n;
})();
