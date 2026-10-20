/* action.js - six action mini-games (steer, catch, dash, sort, toss, whack) on top of the existing ones, and 28 stalls switched to them.
   Every round is short (4-8 s). The shift level (window.mfbLevel, set by shift.js) makes them a little faster and harder.
   Loaded after games.js and pixel.js. Each game has its own animation loop, so it also runs smoothly on phones. */
(function(){
'use strict';
var M=window.mfbMG;if(!M||!M.TPL||window.__mga)return;window.__mga=1;
var TPL=M.TPL,SPEC=M.SPEC,TN=M.TN,H=M.H,pick=H.pick,IH=H.itemsHTML;
function snd(n){try{if(typeof sfx==='function')sfx(n);}catch(e){}}
function lv(){return Math.max(1,window.mfbLevel||1);}
function rnd(n){return Math.floor(Math.random()*n);}
function sel1(h,s){[].forEach.call(h.querySelectorAll('.mg-ib'),function(b){b.classList.toggle('on',+b.dataset.i===s);});}

/* ---------- styles ---------- */
var css=[
'#mg canvas.lg-cv{display:block;width:auto;max-width:100%;max-height:31vh;margin:6px auto 2px;border:3px solid #111;border-radius:10px;background:#1d2340;touch-action:none;image-rendering:pixelated;box-shadow:0 3px 0 rgba(0,0,0,.4)}',
'#mg .lg-msg{text-align:center;font:900 13px/1.2 inherit;color:#ffe27a;min-height:16px;margin:2px 0}',
'#mg .lg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:340px;margin:4px auto}',
'#mg .lg-hole{height:min(64px,8vh);border-radius:50%/40%;background:radial-gradient(#0c0a14 55%,#3a2c20 58%);border:3px solid #111;font-size:36px;line-height:58px;text-align:center;padding:0;overflow:hidden;position:relative;color:inherit}',
'#mg .lg-hole b{display:block;transform:translateY(120%);transition:transform .08s}#mg .lg-hole.up b{transform:none}#mg .lg-hole.hit b{transform:scale(1.3) rotate(15deg);filter:brightness(1.5)}#mg .lg-hole.bad{background:#7a1f1f}',
'#mg .lg-card{width:min(130px,15vh);height:min(130px,15vh);margin:6px auto;border:4px solid #111;border-radius:16px;background:#fff;color:#111;display:flex;align-items:center;justify-content:center;font-size:min(72px,8vh);transition:transform .15s,opacity .15s;touch-action:none}',
'#mg .lg-q{text-align:center;font-weight:800;font-size:13px;margin-top:6px}#mg .lg-q span{font-size:26px;vertical-align:middle}',
'#mg .lg-r2{display:flex;gap:10px;justify-content:center}#mg .lg-r2 button{flex:1;max-width:170px;height:56px;border-radius:14px;border:3px solid #111;font-size:26px;font-weight:900;color:#fff;cursor:pointer}',
'#mg .lg-pr{height:8px;background:#000;border:2px solid #000;border-radius:5px;overflow:hidden;margin:4px auto;max-width:440px}#mg .lg-pr u{display:block;height:100%;background:#f2c94c;width:100%}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- round helpers ---------- */
function frame(h,fn){                           // run fn(dt) every animation frame while this panel is on screen; fn returns true to stop
  var last=performance.now(),dead=false,id=0;
  function go(t){if(dead||!h.isConnected)return;var dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(fn(dt)===true){dead=true;return;}id=requestAnimationFrame(go);}
  id=requestAnimationFrame(go);return function(){dead=true;cancelAnimationFrame(id);};
}
function cvPos(cv,e){var r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*cv.width,y:(e.clientY-r.top)/r.height*cv.height};}
function txt(g,s,x,y,sz){g.font=(sz||24)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s,x,y);}
function verdict(q){return q>.9?'Perfect!':q>.7?'Nice!':q>.5?'Okay':'Sloppy';}
function bar(h){var p=h.querySelector('.lg-pr u');return function(f){if(p)p.style.width=Math.max(0,Math.min(1,f))*100+'%';};}
/* common frame for the canvas games */
function shell(h,a,hint,W,Hh){
  h.innerHTML=IH(a.items,hint)+'<canvas class="lg-cv" width="'+W+'" height="'+Hh+'"></canvas><div class="lg-pr"><u></u></div><div class="lg-msg">Pick an item to start</div>';
  var cv=h.querySelector('canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
  return {cv:cv,g:g,msg:h.querySelector('.lg-msg'),pr:bar(h)};
}
function finish(a,sh,sel,q,okMin){
  sh.pr(0);sh.msg.textContent=verdict(q);
  if(q<(okMin||.35)){a.miss('Missed it!');}else a.add(sel,q);
}

/* ---------- 1. steer: ride the scooter through traffic ---------- */
TPL.steer=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then STEER: drag left and right to dodge',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null;
  var s={x:160,tx:160,off:0,obs:[],hits:0,t:0,sp:0,flash:0,nx:0,dur:5};
  function paint(){
    g.fillStyle='#2e3550';g.fillRect(0,0,W,HH);g.fillStyle='#3c4466';g.fillRect(40,0,240,HH);
    g.fillStyle='#e6e1c8';for(var y=-30+s.off%30;y<HH;y+=30){g.fillRect(105,y,5,16);g.fillRect(210,y,5,16);}
    g.fillStyle='#d9a441';g.fillRect(36,0,4,HH);g.fillRect(280,0,4,HH);
    s.obs.forEach(function(o){txt(g,o.e,o.x,o.y,30);});
    if(s.flash>0){g.globalAlpha=.55;g.fillStyle='#f33';g.fillRect(0,0,W,HH);g.globalAlpha=1;}
    txt(g,'🛵',s.x,168,38);if(sel>=0)txt(g,a.items[sel].e,s.x+2,142,18);
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,W,6);g.fillStyle='#43d17a';g.fillRect(0,0,W*Math.min(1,s.t/s.dur),6);
  }
  function start(){
    s.hits=0;s.t=0;s.obs=[];s.nx=.3;s.x=s.tx=160;s.dur=4.5+Math.min(2,lv()*.15);s.sp=130+12*lv()+(5-a.gear)*3;run=true;sh.msg.textContent='Go go go!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;s.off+=s.sp*dt;s.x+=(s.tx-s.x)*Math.min(1,dt*12);s.flash=Math.max(0,s.flash-dt);
      s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.32,.62-.02*lv());s.obs.push({x:60+rnd(200),y:-20,e:['🚧','🐈','🚲','🛢️','🐕'][rnd(5)]});}
      for(var i=s.obs.length-1;i>=0;i--){var o=s.obs[i];o.y+=s.sp*dt;if(o.y>230)s.obs.splice(i,1);else if(Math.abs(o.y-168)<22&&Math.abs(o.x-s.x)<24){s.obs.splice(i,1);s.hits++;s.flash=.25;snd('bad');}}
      paint();sh.pr(1-s.t/s.dur);
      if(s.t>=s.dur){run=false;var q=Math.max(.3,1-.22*s.hits);finish(a,sh,sel,s.hits>=4?0:q,.35);return true;}
    });
  }
  function mv(e){if(e.pointerType==='mouse'&&!e.buttons&&!run)return;s.tx=Math.max(50,Math.min(270,cvPos(cv,e).x));}
  cv.onpointerdown=function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}mv(e);};cv.onpointermove=mv;
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 2. catch: slide the basket under the right items ---------- */
TPL.catch=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then slide the basket to CATCH it. Dodge the rest!',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null;
  var s={x:160,tx:160,f:[],good:0,bad:0,t:0,nx:0,need:3,dur:7};
  function paint(){
    g.fillStyle='#24325a';g.fillRect(0,0,W,HH);g.fillStyle='#2f3f70';for(var k=0;k<5;k++)g.fillRect(k*70,0,2,HH);
    s.f.forEach(function(o){txt(g,o.e,o.x,o.y,28);});
    txt(g,'🧺',s.x,176,40);
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,W,6);g.fillStyle='#43d17a';g.fillRect(0,0,W*Math.min(1,s.good/s.need),6);
  }
  function start(){
    s.good=0;s.bad=0;s.t=0;s.f=[];s.nx=.2;s.need=Math.max(2,3+Math.floor(lv()/4)-(a.gear>=2?1:0));s.dur=7;run=true;sh.msg.textContent='Catch '+s.need+'!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;s.x+=(s.tx-s.x)*Math.min(1,dt*14);
      s.nx-=dt;if(s.nx<=0){s.nx=Math.max(.33,.55-.015*lv());var good=Math.random()<.45,oth=a.items.filter(function(it,i){return i!==sel;});
        s.f.push({x:30+rnd(260),y:-16,good:good,e:good?a.items[sel].e:(Math.random()<.35?'💣':oth.length?oth[rnd(oth.length)].e:'🪨'),v:95+8*lv()});}
      for(var i=s.f.length-1;i>=0;i--){var o=s.f[i];o.y+=o.v*dt;
        if(o.y>160&&o.y<190&&Math.abs(o.x-s.x)<30){s.f.splice(i,1);if(o.good){s.good++;snd('click');}else{s.bad++;snd('bad');}}
        else if(o.y>215)s.f.splice(i,1);}
      paint();sh.pr(1-s.t/s.dur);
      if(s.good>=s.need||s.t>=s.dur){run=false;var q=s.good>=s.need?Math.max(.4,1-.18*s.bad):.3+.4*s.good/s.need-.1*s.bad;finish(a,sh,sel,s.good<2?0:q,.35);return true;}
    });
  }
  function mv(e){s.tx=Math.max(24,Math.min(296,cvPos(cv,e).x));}
  cv.onpointerdown=function(e){e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}mv(e);};cv.onpointermove=mv;
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 3. dash: tap to jump over what is in the way ---------- */
TPL.dash=function(h,a){
  var W=320,HH=140,sh=shell(h,a,'Pick an item, then TAP to jump over the obstacles',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null;
  var s={y:0,vy:0,obs:[],hits:0,t:0,nx:0,off:0,sp:0,flash:0,dur:5,air:false};
  var GY=104;
  function paint(){
    g.fillStyle='#27356b';g.fillRect(0,0,W,HH);g.fillStyle='#3a8f5a';g.fillRect(0,GY+14,W,HH);g.fillStyle='#2c6d44';for(var x=-20+(s.off%20);x<W;x+=20)g.fillRect(x,GY+18,10,3);
    s.obs.forEach(function(o){txt(g,o.e,o.x,GY+4,28);});
    if(s.flash>0){g.globalAlpha=.5;g.fillStyle='#f33';g.fillRect(0,0,W,HH);g.globalAlpha=1;}
    txt(g,'🏃',56,GY-s.y,34);if(sel>=0)txt(g,a.items[sel].e,76,GY-s.y-16,16);
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,0,W,6);g.fillStyle='#43d17a';g.fillRect(0,0,W*Math.min(1,s.t/s.dur),6);
  }
  function jump(){if(run&&s.y<=0.5){s.vy=330;snd('click');}}
  function start(){
    s.y=0;s.vy=0;s.obs=[];s.hits=0;s.t=0;s.nx=.7;s.dur=4.6+Math.min(2,lv()*.12);s.sp=150+11*lv();run=true;sh.msg.textContent='Tap to jump!';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.t+=dt;s.off-=s.sp*dt;s.flash=Math.max(0,s.flash-dt);
      s.vy-=980*dt;s.y=Math.max(0,s.y+s.vy*dt);if(s.y===0&&s.vy<0)s.vy=0;
      s.nx-=dt;if(s.nx<=0){s.nx=.8+Math.random()*.5-Math.min(.25,lv()*.02);s.obs.push({x:340,e:['🪨','🚧','🐕','🌵','🪣'][rnd(5)]});}
      for(var i=s.obs.length-1;i>=0;i--){var o=s.obs[i];o.x-=s.sp*dt;if(o.x<-30)s.obs.splice(i,1);else if(Math.abs(o.x-56)<20&&s.y<20){s.obs.splice(i,1);s.hits++;s.flash=.25;snd('bad');}}
      paint();sh.pr(1-s.t/s.dur);
      if(s.t>=s.dur){run=false;finish(a,sh,sel,s.hits>=3?0:Math.max(.35,1-.28*s.hits),.35);return true;}
    });
  }
  cv.onpointerdown=function(e){e.preventDefault();jump();};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  paint();return {tick:function(){}};
};

/* ---------- 4. sort: swipe right if it matches, left if it does not ---------- */
TPL.sort=function(h,a){
  var sel=-1,run=false,stop=null,n=5,i=0,ok=0,cur=null,t=0,dur=8,sx=null,dx=0;
  h.innerHTML=IH(a.items,'Pick an item, then sort the cards: swipe RIGHT if it matches, LEFT if not')+'<div class="lg-q"></div><div class="lg-card">❔</div><div class="lg-r2"><button style="background:#c0392b">✖ No</button><button style="background:#2e9e5b">✔ Yes</button></div><div class="lg-pr"><u></u></div><div class="lg-msg">Pick an item to start</div>';
  var card=h.querySelector('.lg-card'),qq=h.querySelector('.lg-q'),msg=h.querySelector('.lg-msg'),pr=bar(h),bn=h.querySelectorAll('.lg-r2 button');
  function next(){
    if(i>=n){end();return;}
    var oth=a.items.filter(function(it,k){return k!==sel;}),D=['🍄','🪨','🧦','🔩','🦴','🧲','🪵','🍂'];
    var yes=Math.random()<.5;cur={yes:yes,e:yes?a.items[sel].e:(oth.length&&Math.random()<.6?oth[rnd(oth.length)].e:D[rnd(D.length)])};
    card.textContent=cur.e;card.style.transform='none';card.style.opacity='1';
  }
  function ans(yes){
    if(!run||!cur)return;var right=(yes===cur.yes);if(right){ok++;snd('click');}else snd('bad');
    card.style.transform='translateX('+(yes?160:-160)+'px) rotate('+(yes?18:-18)+'deg)';card.style.opacity='0';cur=null;i++;msg.textContent=right?'✔':'✖';setTimeout(next,130);
  }
  function end(){
    if(!run)return;run=false;if(stop)stop();var q=ok/n;pr(0);msg.textContent=verdict(q);card.textContent='❔';cur=null;
    if(ok<n-2)a.miss('Mixed up!');else a.add(sel,Math.max(.5,q));
  }
  function start(){i=0;ok=0;t=0;n=5+Math.min(3,Math.floor(lv()/3));dur=3+n*1.0-Math.min(1.5,lv()*.08);run=true;qq.innerHTML='Is it <span>'+a.items[sel].e+'</span> ?';msg.textContent='';next();
    if(stop)stop();stop=frame(h,function(dt){if(!run)return true;t+=dt;pr(1-t/dur);if(t>=dur){end();return true;}});}
  bn[0].onpointerdown=function(e){e.preventDefault();ans(false);};bn[1].onpointerdown=function(e){e.preventDefault();ans(true);};
  card.onpointerdown=function(e){e.preventDefault();sx=e.clientX;dx=0;try{card.setPointerCapture(e.pointerId);}catch(x){}};
  card.onpointermove=function(e){if(sx===null||!cur)return;dx=e.clientX-sx;card.style.transform='translateX('+dx+'px) rotate('+dx/12+'deg)';};
  card.onpointerup=card.onpointercancel=function(){if(sx===null)return;var d=dx;sx=null;dx=0;if(Math.abs(d)>40)ans(d>0);else card.style.transform='none';};
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  return {tick:function(){}};
};

/* ---------- 5. toss: pull back, aim and let go ---------- */
TPL.toss=function(h,a){
  var W=320,HH=200,sh=shell(h,a,'Pick an item, then PULL BACK and let go to throw it at the target',W,HH),g=sh.g,cv=sh.cv,sel=-1,run=false,stop=null;
  var LX=160,LY=176,s={tx:160,td:1,aim:null,shot:null,n:0,qs:[],t:0,sp:70,fl:0};
  function paint(){
    g.fillStyle='#233a5a';g.fillRect(0,0,W,HH);g.fillStyle='#2c4a72';g.fillRect(0,60,W,2);
    txt(g,'🎯',s.tx,36,40);
    if(s.aim){var dx=LX-s.aim.x,dy=LY-s.aim.y,L=Math.min(110,Math.hypot(dx,dy)),an=Math.atan2(dy,dx);
      for(var k=1;k<=6;k++){g.fillStyle='rgba(255,255,255,'+(.8-k*.1)+')';g.fillRect(LX+Math.cos(an)*L*k*.85/3*1.1-2,LY+Math.sin(an)*L*k*.85/3*1.1-2,4,4);}
      txt(g,sel>=0?a.items[sel].e:'●',LX-Math.cos(an)*L*.25,LY-Math.sin(an)*L*.25,26);}
    else if(!s.shot)txt(g,sel>=0?a.items[sel].e:'●',LX,LY,26);
    if(s.shot)txt(g,a.items[sel].e,s.shot.x,s.shot.y,26*(1-.35*s.shot.p));
    g.fillStyle='#ffe27a';g.font='bold 13px sans-serif';g.textAlign='left';g.fillText('Throws left: '+(3-s.n),8,196);
  }
  function fire(){
    var dx=LX-s.aim.x,dy=LY-s.aim.y,L=Math.min(110,Math.hypot(dx,dy));if(L<18||dy<=0){s.aim=null;return;}
    var an=Math.atan2(dy,dx),far=L/110*150+30,ex=LX+Math.cos(an)*far*1.0,ey=LY-Math.abs(Math.sin(an))*far*1.0;
    s.shot={x:LX,y:LY,ex:ex,ey:Math.max(30,ey),p:0};s.aim=null;
  }
  function start(){
    s.n=0;s.qs=[];s.t=0;s.tx=160;s.td=1;s.sp=70+9*lv();s.aim=null;s.shot=null;run=true;sh.msg.textContent='Pull back, aim, release';
    if(stop)stop();
    stop=frame(h,function(dt){
      if(!run)return true;s.tx+=s.td*s.sp*dt;if(s.tx>285){s.tx=285;s.td=-1;}if(s.tx<35){s.tx=35;s.td=1;}
      if(s.shot){s.shot.p=Math.min(1,s.shot.p+dt/.5);s.shot.x=LX+(s.shot.ex-LX)*s.shot.p;s.shot.y=LY+(s.shot.ey-LY)*s.shot.p;
        if(s.shot.p>=1){var d=Math.hypot(s.shot.x-s.tx,s.shot.y-36),q=Math.max(0,1-d/(60+6*a.gear));s.qs.push(q);s.n++;s.shot=null;snd(q>.5?'coin':'bad');sh.msg.textContent=q>.85?'Bullseye!':q>.5?'Close!':'Miss';
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

/* ---------- 6. whack: tap the right ones as they pop up ---------- */
TPL.whack=function(h,a){
  var sel=-1,run=false,stop=null,N=8,popped=0,good=0,bad=0,hits=0,t=0,nx=0,hole=null;
  var hs='';for(var k=0;k<6;k++)hs+='<button class="lg-hole" data-h="'+k+'"><b></b></button>';
  h.innerHTML=IH(a.items,'Pick an item, then TAP only that one when it pops up!')+'<div class="lg-grid">'+hs+'</div><div class="lg-pr"><u></u></div><div class="lg-msg">Pick an item to start</div>';
  var hl=h.querySelectorAll('.lg-hole'),msg=h.querySelector('.lg-msg'),pr=bar(h);
  function hide(k){if(hl[k]){hl[k].classList.remove('up','hit','bad');}}
  function spawn(){
    var k=rnd(6),isGood=Math.random()<.62,oth=a.items.filter(function(it,i){return i!==sel;});
    var e=isGood?a.items[sel].e:(Math.random()<.3?'💣':oth.length?oth[rnd(oth.length)].e:'🪨');
    hole={k:k,good:isGood,t:Math.max(.55,1.05-.04*lv()),hit:false};hl[k].firstChild.textContent=e;hl[k].classList.add('up');popped++;if(isGood)good++;
  }
  function end(){
    run=false;if(stop)stop();for(var k=0;k<6;k++)hide(k);pr(0);
    var q=good?Math.max(0,hits/good-.25*bad):0;msg.textContent=verdict(q);
    if(hits<2||q<.3)a.miss('Too slow!');else a.add(sel,Math.max(.45,Math.min(1,q+.1)));
  }
  function start(){popped=0;good=0;bad=0;hits=0;t=0;nx=.4;hole=null;N=7+Math.min(4,Math.floor(lv()/3));run=true;msg.textContent='Go!';
    if(stop)stop();stop=frame(h,function(dt){if(!run)return true;t+=dt;
      if(hole){hole.t-=dt;if(hole.t<=0){hide(hole.k);hole=null;nx=.25;}}
      else{nx-=dt;if(popped>=N){end();return true;}if(nx<=0)spawn();}
      pr(1-popped/N);});}
  [].forEach.call(hl,function(b,k){b.onpointerdown=function(e){e.preventDefault();if(!run||!hole||hole.k!==k||hole.hit)return;hole.hit=true;
    if(hole.good){hits++;b.classList.add('hit');snd('click');}else{bad++;b.classList.add('bad');snd('bad');}
    var kk=k;setTimeout(function(){hide(kk);},160);hole=null;nx=.25;};});
  h.onclick=function(e){var p=pick(e);if(p&&!run){sel=p.id;sel1(h,sel);start();}};
  return {tick:function(){}};
};

/* ---------- which stalls play which game ---------- */
var MAP={
  steer:['Surf & skate','Drone & gadget lab','Bike repair post','Vintage supercars'],
  catch:['Fresh juice cart','Lemonade cart','Roasted chestnuts','Olive oil & vinegar','Honey & spice'],
  dash:['Sneaker resale','Sportswear','Security post','Pet shop'],
  sort:['Antiques','Fine art gallery','Rare books & maps','Info kiosk','News agent'],
  toss:['VR arcade','Retro games','Wood toys','3D-print toys','Crêpe cart'],
  whack:['Comics & manga','Pizza slices','Falafel & kebab','Dumpling steamer','Sake & soju']
};
var LBL={steer:'Scooter run',catch:'Catch game',dash:'Dash',sort:'Sorting desk',toss:'Throw range',whack:'Pop-up game'};
var HINT={steer:'Drag left and right to dodge the traffic',catch:'Slide the basket under the right items',dash:'Tap to jump over obstacles',sort:'Swipe right for a match, left if not',toss:'Pull back, aim, let go',whack:'Tap only the right one when it pops up'};
for(var k in LBL)TN[k]=LBL[k];
var n=0;
for(var m in MAP)MAP[m].forEach(function(nm){var sp=SPEC[nm];if(!sp)return;sp.m=m;sp.tag=HINT[m];sp.hint=HINT[m];n++;});
M.actionGames=n;
})();
