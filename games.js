/* Stall mini-games: 15 extra game mechanics on top of the 9 base templates, plus 14 rule twists.
   Every stall with a business gets its own (mechanic + twist) pair, its own items and customers. Loaded after mini.js. */
(function(){
'use strict';
var M=window.mfbMG;if(!M||!M.TPL||window.__mgg)return;window.__mgg=1;
var TPL=M.TPL,SPEC=M.SPEC,TN=M.TN,H=M.H,pick=H.pick,IH=H.itemsHTML;
function R(n){return Math.floor(Math.random()*n);}
function hp(a,d){return (a.spec&&a.spec.hint)||d;}
function selMark(h,sel){[].forEach.call(h.querySelectorAll('.mg-ib'),function(b){b.classList.toggle('on',+b.dataset.i===sel);});}
function slotsHTML(n){var s='<div class="mg-gr">';for(var k=0;k<n;k++)s+='<button class="mg-sl" data-s="'+k+'"><span class="e">➕</span><i class="pb"><b style="left:60%;width:28%"></b><u></u></i></button>';return s+'</div>';}

/* ---------- labels + hints ---------- */
var LBL={stack:'Stacking table',conveyor:'Conveyor belt',oven:'Oven',stir:'Stir pot',swipe:'Slice & swipe',pop:'Popping pans',tower:'Tower builder',haggle:'Haggle duel',polish:'Polishing bench',steady:'Steady hands',trace:'Tracing board',change:'Cash desk',snap:'Photo shoot',rhythm:'Rhythm bench',dial:'Tuning dial'};
for(var lk in LBL)TN[lk]=LBL[lk];
var HINT={grill:'Grill it and take it off in the green',pour:'Hold to pour, release in the green',shake:'Mix up to 3 ingredients, then shake',slice:'Slice with perfect timing',craft:'Hit the timing for every crafting step',fold:'Fold each item before it goes on the tray',draw:'Tap the dots to draw the design in time',memory:'Repeat the pattern the cards show',assemble:'Build the order from the shelf',stack:'Pick an ingredient, DROP it on the centre. Order matters!',conveyor:'Grab the right items as they roll past',oven:'Pick dough, KNEAD it, then take it out golden',stir:'Pick a dish, then stir round and round',swipe:'Swipe through the right items. Avoid the bombs!',pop:'Tap each pan the moment it pops',tower:'Pick a flavour, drop blocks to build a 4-high tower',haggle:'Pick an item. PUSH the price or SELL before they walk',polish:'Pick an item, then rub away all the dirt',steady:'Pick an item, keep the cursor in the green zone',trace:'Pick a design, then trace the line from start to end',change:'Pick an item, then give the exact change',snap:'Pick a backdrop, SNAP when the model is in the frame',rhythm:'Pick an item, hit the notes in the right lane',dial:'Pick an item, set the dial on the target and LOCK'};

/* ---------- 1. stack ---------- */
TPL.stack=function(h,a){var sel=-1,x=.5,dir=1,spd=1.55-.2*a.gear;
  h.innerHTML='<div class="mg-sw"><i class="mg-sz"></i><b class="mg-sm"></b></div>'+IH(a.items,hp(a,HINT.stack))+'<button class="mg-big dp" style="margin-top:6px">DROP!</button>';
  var m=h.querySelector('.mg-sm');
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);}};
  h.querySelector('.dp').onpointerdown=function(e){e.preventDefault();if(sel<0){a.flash('Pick an ingredient',false);return;}a.add(sel,Math.max(.25,1-Math.abs(x-.5)*2.2));};
  return {tick:function(dt){x+=dir*dt*spd;if(x>1){x=1;dir=-1;}if(x<0){x=0;dir=1;}m.style.left=(x*100)+'%';}};};

/* ---------- 2. conveyor ---------- */
TPL.conveyor=function(h,a){var its=[],tt=0,spd=.3-.03*a.gear;
  h.innerHTML='<div class="mg-bt"></div><p class="mg-hint">'+hp(a,HINT.conveyor)+'</p>';var bt=h.querySelector('.mg-bt');
  h.onclick=function(e){var b=e.target.closest('.mg-cv');if(!b)return;for(var k=0;k<its.length;k++){if(its[k].el===b){var o=its.splice(k,1)[0];b.remove();a.add(o.id,1);return;}}};
  return {tick:function(dt){tt-=dt;if(tt<=0){tt=.85+Math.random()*.5;var id=R(a.navail),it=a.items[id],b=document.createElement('button');b.className='mg-cv';b.innerHTML=it.e+(it.n?'<small>'+it.n+'</small>':'');if(it.bg)b.style.background=it.bg;b.style.top=(4+R(3)*40)+'px';bt.appendChild(b);its.push({el:b,id:id,x:-.14});}
    for(var k=its.length-1;k>=0;k--){var o=its[k];o.x+=dt*spd;o.el.style.left=(o.x*100)+'%';if(o.x>1.05){o.el.remove();its.splice(k,1);}}}};};

/* ---------- 3. oven (knead, bake, take out) ---------- */
TPL.oven=function(h,a){var sl=[],kn=null,need=Math.max(2,5-a.gear),bk=5.2*(1-.08*a.gear),g0=.6,g1=.88;
  h.innerHTML=slotsHTML(3)+'<button class="mg-big kn" style="margin-bottom:6px;background:#8a5a2b">KNEAD</button>'+IH(a.items,hp(a,HINT.oven));
  var kb=h.querySelector('.kn');
  [].forEach.call(h.querySelectorAll('.mg-sl'),function(el){sl.push({el:el,id:-1,p:0,e:el.querySelector('.e'),u:el.querySelector('u')});});
  function clear(o){o.id=-1;o.p=0;o.e.textContent='➕';o.el.className='mg-sl';o.u.style.width='0';}
  function place(){for(var k=0;k<sl.length;k++){if(sl[k].id<0){sl[k].id=kn.id;sl[k].p=0;sl[k].e.textContent=a.items[kn.id].e;kn=null;kb.textContent='KNEAD';return true;}}return false;}
  kb.onpointerdown=function(e){e.preventDefault();if(!kn){a.flash('Pick a dough first',false);return;}kn.left--;kb.textContent='KNEAD x'+kn.left;if(kn.left<=0){if(!place()){kn.left=1;kb.textContent='OVEN FULL';a.flash('Oven is full',false);}}};
  h.onclick=function(e){var q=e.target.closest('.mg-sl');
    if(q){var o=sl[+q.dataset.s];if(o.id<0)return;if(o.p<g0){a.flash('Not ready',false);return;}if(o.p<=g1){a.add(o.id,1-Math.abs(o.p-.74)/.16*.4);clear(o);}else{clear(o);a.miss('Burnt!');}return;}
    var p=pick(e);if(p&&!kn){kn={id:p.id,left:need};kb.textContent='KNEAD x'+need;}};
  return {tick:function(dt){sl.forEach(function(o){if(o.id<0)return;o.p+=dt/bk;o.u.style.width=Math.min(100,o.p*100)+'%';o.el.className='mg-sl '+(o.p<g0?'raw':o.p<=g1?'ready':'burnt');if(o.p>=1.25){clear(o);a.miss('Burnt!');}});}};};

/* ---------- 4. stir ---------- */
TPL.stir=function(h,a){var sel=-1,acc=0,last=null,t=0,need=4*Math.PI*(1-.12*a.gear);
  h.innerHTML='<div class="mg-pot"><span class="mg-sp">🥄</span><i class="mg-pr"><u></u></i></div>'+IH(a.items,hp(a,HINT.stir));
  var pot=h.querySelector('.mg-pot'),sp=h.querySelector('.mg-sp'),bar=h.querySelector('.mg-pr u');
  function ang(e){var r=pot.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2));}
  pot.onpointerdown=function(e){e.preventDefault();try{pot.setPointerCapture(e.pointerId);}catch(x){}last=ang(e);};
  pot.onpointermove=function(e){if(last===null||sel<0)return;var n=ang(e),d=n-last;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;acc+=Math.abs(d);last=n;sp.style.transform='rotate('+(n*57.3)+'deg) translateX(34px)';bar.style.width=Math.min(100,acc/need*100)+'%';
    if(acc>=need){var q=Math.max(.5,1-t/12*.5),id=sel;acc=0;t=0;bar.style.width='0';a.add(id,q);}};
  pot.onpointerup=pot.onpointercancel=function(){last=null;};
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);acc=0;t=0;bar.style.width='0';}};
  return {tick:function(dt){if(sel>=0&&acc>0){t+=dt;acc=Math.max(0,acc-dt*.5);bar.style.width=Math.min(100,acc/need*100)+'%';}}};};

/* ---------- 5. swipe ---------- */
TPL.swipe=function(h,a){var its=[],tt=0,down=false;
  h.innerHTML='<div class="mg-swa"></div><p class="mg-hint">'+hp(a,HINT.swipe)+'</p>';var ar=h.querySelector('.mg-swa');
  function cut(el){for(var k=0;k<its.length;k++){var o=its[k];if(o.el===el&&!o.cut){o.cut=true;el.classList.add('cut');if(o.bomb)a.miss('Boom!');else a.add(o.id,1);setTimeout(function(){el.remove();},160);return;}}}
  function hit(e){var el=document.elementFromPoint(e.clientX,e.clientY);if(el&&el.classList&&el.classList.contains('mg-fy'))cut(el);}
  ar.onpointerdown=function(e){down=true;hit(e);};ar.onpointermove=function(e){if(down)hit(e);};ar.onpointerup=ar.onpointerleave=ar.onpointercancel=function(){down=false;};
  return {tick:function(dt){tt-=dt;if(tt<=0){tt=.8-.05*a.gear+Math.random()*.4;var bomb=Math.random()<.16,id=bomb?-1:R(a.navail),it=bomb?{e:'💣'}:a.items[id],b=document.createElement('div');b.className='mg-fy';b.textContent=it.e;var w=ar.clientWidth||300;
      var o={el:b,id:id,bomb:bomb,x:20+Math.random()*(w-80),y:170,vx:(Math.random()<.5?-1:1)*(10+Math.random()*40),vy:-(330+Math.random()*120)};b.style.transform='translate('+o.x+'px,'+o.y+'px)';ar.appendChild(b);its.push(o);}
    for(var k=its.length-1;k>=0;k--){var o2=its[k];o2.vy+=420*dt;o2.x+=o2.vx*dt;o2.y+=o2.vy*dt;o2.el.style.transform='translate('+o2.x+'px,'+o2.y+'px)';if(o2.y>180&&o2.vy>0){o2.el.remove();its.splice(k,1);}}}};};

/* ---------- 6. pop ---------- */
TPL.pop=function(h,a){var cs=[];
  var s='<div class="mg-pg">';for(var k=0;k<6;k++)s+='<button class="mg-pp" data-c="'+k+'">🔥</button>';
  h.innerHTML=s+'</div><p class="mg-hint">'+hp(a,HINT.pop)+'</p>';
  [].forEach.call(h.querySelectorAll('.mg-pp'),function(el){cs.push({el:el,st:0,t:.4+Math.random()*1.6,id:0});});
  h.onclick=function(e){var b=e.target.closest('.mg-pp');if(!b)return;var c=cs[+b.dataset.c];if(c.st===2){a.add(c.id,.6+.4*(c.t/1.3));c.st=0;c.t=.5+Math.random()*1.5;c.el.className='mg-pp';c.el.textContent='🔥';}else if(c.st===1)a.flash('Wait for the pop!',false);};
  return {tick:function(dt){cs.forEach(function(c){c.t-=dt;if(c.t>0)return;
    if(c.st===0){c.st=1;c.id=R(a.navail);c.t=1.5+Math.random()*1.5;c.el.className='mg-pp heat';c.el.textContent=a.items[c.id].e;}
    else if(c.st===1){c.st=2;c.t=1.4-.08*a.gear;c.el.className='mg-pp ready';}
    else if(c.st===2){c.st=3;c.t=1;c.el.className='mg-pp burnt';c.el.textContent='💨';a.miss('Burnt!');}
    else{c.st=0;c.t=.5+Math.random()*1.5;c.el.className='mg-pp';c.el.textContent='🔥';}});}};};

/* ---------- 7. tower ---------- */
TPL.tower=function(h,a){var sel=-1,lv=[],x=0,dir=1,spd=.85,aw=300,sw=70,qs=[],COL=['#e5442f','#2f6db5','#e0a81f','#43d17a','#8a63c7'];
  h.innerHTML='<div class="mg-twr"><div class="mg-twb"></div><i class="mg-tws"></i></div>'+IH(a.items,hp(a,HINT.tower))+'<button class="mg-big dp" style="margin-top:6px">DROP!</button>';
  var ar=h.querySelector('.mg-twr'),bl=h.querySelector('.mg-twb'),sg=h.querySelector('.mg-tws');
  function col(){var it=a.items[sel]||{};return it.bg||COL[(sel<0?0:sel)%COL.length];}
  function reset(){aw=ar.clientWidth||300;sw=Math.min(90,aw*.3);lv=[{l:(aw-sw)/2,w:sw}];qs=[];draw();}
  function draw(){var s='';lv.forEach(function(b,i){s+='<i class="mg-tb" style="left:'+b.l+'px;width:'+b.w+'px;bottom:'+(i*22)+'px;background:'+col()+'">'+(sel>=0?a.items[sel].e:'')+'</i>';});bl.innerHTML=s;var top=lv[lv.length-1];sg.style.width=top.w+'px';sg.style.background=col();sg.style.bottom=(lv.length*22+8)+'px';}
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);reset();}};
  h.querySelector('.dp').onpointerdown=function(e){e.preventDefault();if(sel<0){a.flash('Pick a flavour',false);return;}
    var pv=lv[lv.length-1],l=x*(aw-pv.w),ov=Math.min(pv.l+pv.w,l+pv.w)-Math.max(pv.l,l);
    if(ov<=3){a.miss('Toppled!');reset();return;}qs.push(ov/pv.w);lv.push({l:Math.max(pv.l,l),w:ov});draw();
    if(lv.length>=4){var s=0;qs.forEach(function(v){s+=v;});var q=s/qs.length;a.add(sel,Math.max(.4,q));reset();}};
  setTimeout(function(){if(ar.isConnected)reset();},60);
  return {tick:function(dt){var pv=lv.length?lv[lv.length-1]:{w:sw};x+=dir*dt*(spd+.08*lv.length);if(x>1){x=1;dir=-1;}if(x<0){x=0;dir=1;}sg.style.left=(x*(aw-pv.w))+'px';}};};

/* ---------- 8. haggle (push your luck) ---------- */
TPL.haggle=function(h,a){var sel=-1,s=0,PR=[1,1.3,1.7,2.2,2.9],PB=[.88,.72,.55,.36],FA=['🙂','😏','😐','😠','🤬'];
  h.innerHTML=IH(a.items,hp(a,HINT.haggle))+'<div class="mg-hg"><span class="mg-hf">🙂</span><b class="mg-hpv">-</b><i class="mg-hm"><u></u></i></div><div class="mg-r2"><button class="mg-big ps" style="background:#8a63c7">PUSH PRICE</button><button class="mg-big sl2" style="background:#2fa866">SELL</button></div>';
  var f=h.querySelector('.mg-hf'),pv=h.querySelector('.mg-hpv'),bar=h.querySelector('.mg-hm u'),pb=h.querySelector('.ps');
  function upd(){f.textContent=FA[s];pv.textContent=sel<0?'-':'€'+Math.round(a.base*PR[s]);bar.style.width=(s/4*100)+'%';pb.textContent=s>=4?'MAX PRICE':'PUSH ('+Math.round((PB[s]+.04*a.gear)*100)+'% safe)';}
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;s=0;selMark(h,sel);upd();}};
  pb.onpointerdown=function(e){e.preventDefault();if(sel<0){a.flash('Pick an item',false);return;}if(s>=4){a.flash('Sell now!',true);return;}
    if(Math.random()<PB[s]+.04*a.gear){s++;upd();}else{a.miss('They walked away!');s=0;upd();}};
  h.querySelector('.sl2').onpointerdown=function(e){e.preventDefault();if(sel<0){a.flash('Pick an item',false);return;}var q=Math.min(1,.5+.14*s);s=0;upd();a.add(sel,q);};
  upd();return {tick:function(){}};};

/* ---------- 9. polish ---------- */
TPL.polish=function(h,a){var sel=-1,left=0,t=0,down=false,N=18;
  var s='<div class="mg-pl"><span class="mg-plb"></span>';for(var k=0;k<N;k++)s+='<i class="mg-pc d"></i>';
  h.innerHTML=IH(a.items,hp(a,HINT.polish))+s+'</div>';
  var gr=h.querySelector('.mg-pl'),bk=h.querySelector('.mg-plb');
  function dirty(){left=N;t=0;[].forEach.call(gr.querySelectorAll('.mg-pc'),function(c){c.classList.add('d');});}
  function hit(e){if(sel<0)return;var el=document.elementFromPoint(e.clientX,e.clientY);if(el&&el.classList&&el.classList.contains('d')&&el.classList.contains('mg-pc')){el.classList.remove('d');left--;if(left<=0){var q=Math.max(.5,1-t/10*.5),id=sel;a.add(id,q);dirty();}}}
  gr.onpointerdown=function(e){down=true;hit(e);};gr.onpointermove=function(e){if(down)hit(e);};gr.onpointerup=gr.onpointerleave=gr.onpointercancel=function(){down=false;};
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);bk.textContent=a.items[sel].e;dirty();}};
  return {tick:function(dt){if(sel>=0)t+=dt;}};};

/* ---------- 10. steady ---------- */
TPL.steady=function(h,a){var sel=-1,c=.5,v=0,L=false,Rr=false,ins=0,tt=0,run=false,zw=.3+.04*a.gear;
  h.innerHTML=IH(a.items,hp(a,HINT.steady))+'<div class="mg-tbar"><i class="mg-tz" style="left:'+((.5-zw/2)*100)+'%;width:'+(zw*100)+'%"></i><b class="mg-tc"></b></div><div class="mg-r2"><button class="mg-big bl" style="background:#2f6db5">◀ HOLD</button><button class="mg-big br" style="background:#2f6db5">HOLD ▶</button></div><div class="mg-prg"><u></u></div>';
  var cur=h.querySelector('.mg-tc'),pr=h.querySelector('.mg-prg u');
  function bind(el,f){el.onpointerdown=function(e){e.preventDefault();try{el.setPointerCapture(e.pointerId);}catch(x){}f(true);};el.onpointerup=el.onpointercancel=el.onlostpointercapture=function(){f(false);};el.oncontextmenu=function(e){e.preventDefault();};}
  bind(h.querySelector('.bl'),function(b){L=b;});bind(h.querySelector('.br'),function(b){Rr=b;});
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);c=.5;v=0;ins=0;tt=0;run=true;}};
  return {tick:function(dt){if(!run)return;tt+=dt;v+=(Math.random()-.5)*dt*3;if(L)v-=dt*2.4;if(Rr)v+=dt*2.4;v*=Math.pow(.25,dt);c+=v*dt;if(c<0){c=0;v*=-.4;}if(c>1){c=1;v*=-.4;}
    cur.style.left=(c*100)+'%';if(Math.abs(c-.5)<zw/2)ins+=dt;pr.style.width=Math.min(100,ins/2.5*100)+'%';
    if(ins>=2.5){run=false;pr.style.width='0';a.add(sel,Math.min(1,.5+ins/tt*.6));}else if(tt>10){run=false;pr.style.width='0';a.miss('Lost control!');}}};};

/* ---------- 11. trace ---------- */
TPL.trace=function(h,a){var sel=-1,pts=[],idx=0,dev=0,t=0,run=false,down=false,trail=[];
  h.innerHTML=IH(a.items,hp(a,HINT.trace))+'<svg class="mg-tsv" viewBox="0 0 100 60"><polyline class="mg-tpl" points=""/><polyline class="mg-ttr" points=""/><circle class="mg-tst" r="3" cx="0" cy="0"/></svg>';
  var svg=h.querySelector('.mg-tsv'),pl=h.querySelector('.mg-tpl'),tr=h.querySelector('.mg-ttr'),st0=h.querySelector('.mg-tst');
  function mkPath(){var k=R(3),i,ph=Math.random()*3;pts=[];
    if(k===0){for(i=0;i<9;i++)pts.push([8+i*10.5,30+20*Math.sin(i*.9+ph)]);}
    else if(k===1){for(i=0;i<8;i++)pts.push([8+i*12,i%2?16:44]);}
    else{for(i=0;i<11;i++){var an=i/10*Math.PI*2*1.1;pts.push([50+Math.cos(an+ph)*(14+i*1.8),30+Math.sin(an+ph)*(11+i*1.2)]);}}
    pl.setAttribute('points',pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' '));tr.setAttribute('points','');trail=[];st0.setAttribute('cx',pts[0][0]);st0.setAttribute('cy',pts[0][1]);idx=0;dev=0;t=0;}
  function pos(e){var r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*60];}
  function mv(e){if(!down||!run)return;var p=pos(e);trail.push(p[0].toFixed(1)+','+p[1].toFixed(1));tr.setAttribute('points',trail.join(' '));var tg=pts[idx],d=Math.hypot(p[0]-tg[0],p[1]-tg[1]);
    if(d<10){dev+=d;idx++;st0.setAttribute('cx',idx<pts.length?pts[idx][0]:-9);st0.setAttribute('cy',idx<pts.length?pts[idx][1]:-9);if(idx>=pts.length){run=false;down=false;var q=Math.max(.45,1-dev/(pts.length*10)*.7),id=sel;a.add(id,q);setTimeout(function(){if(sel>=0){mkPath();run=true;}},200);}}}
  svg.onpointerdown=function(e){e.preventDefault();down=true;try{svg.setPointerCapture(e.pointerId);}catch(x){}mv(e);};svg.onpointermove=mv;svg.onpointerup=svg.onpointercancel=function(){down=false;};
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);mkPath();run=true;}};
  return {tick:function(dt){if(!run)return;t+=dt;if(t>9+a.gear){run=false;a.miss('Too slow!');mkPath();run=true;}}};};

/* ---------- 12. change (cash desk) ---------- */
TPL.change=function(h,a){var sel=-1,price=0,need=0,sum=0;
  h.innerHTML=IH(a.items,hp(a,HINT.change))+'<div class="mg-cd">Pick an item</div><div class="mg-r3"><button class="mg-coin" data-c="1">€1</button><button class="mg-coin" data-c="2">€2</button><button class="mg-coin" data-c="5">€5</button></div>';
  var cd=h.querySelector('.mg-cd');
  function upd(){cd.innerHTML='Item €'+price+' · paid €10 → give back <b>€'+need+'</b><br><span>Counted: €'+sum+'</span>';}
  h.onclick=function(e){var c=e.target.closest('.mg-coin');if(c){if(sel<0){a.flash('Pick an item',false);return;}sum+=+c.dataset.c;if(sum===need){var id=sel;sum=0;price=3+R(7);need=10-price;upd();a.add(id,1);}else if(sum>need){a.miss('Wrong change!');sum=0;upd();}else upd();return;}
    var p=pick(e);if(p){sel=p.id;selMark(h,sel);price=3+R(7);need=10-price;sum=0;upd();}};
  return {tick:function(){}};};

/* ---------- 13. snap ---------- */
TPL.snap=function(h,a){var sel=-1,shots=[],x=.5,y=.5,vx=.55,vy=.35,run=false,MOD=['🕺','💃','🦄','🐕','🤸'];
  h.innerHTML=IH(a.items,hp(a,HINT.snap))+'<div class="mg-vf"><span class="mg-vb"></span><i class="mg-xh"></i><b class="mg-sj">'+MOD[R(MOD.length)]+'</b></div><button class="mg-big sn" style="margin-top:6px;background:#e5593f">📸 SNAP</button>';
  var sj=h.querySelector('.mg-sj'),vb=h.querySelector('.mg-vb'),sn=h.querySelector('.sn');
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);vb.textContent=a.items[sel].e;shots=[];run=true;sn.textContent='📸 SNAP (0/3)';}};
  sn.onpointerdown=function(e){e.preventDefault();if(!run){a.flash('Pick a backdrop',false);return;}var d=Math.hypot((x-.5),(y-.5)*.9),q=d<.2?1-d/.2*.5:.25;shots.push(q);sn.textContent='📸 SNAP ('+shots.length+'/3)';
    if(shots.length>=3){var s=0;shots.forEach(function(v){s+=v;});var id=sel;shots=[];sn.textContent='📸 SNAP (0/3)';a.add(id,s/3);}};
  return {tick:function(dt){if(!run)return;var k=.9-.08*a.gear;x+=vx*dt*k;y+=vy*dt*k;if(x<.08||x>.92){vx=-vx;x=Math.max(.08,Math.min(.92,x));vx+=(Math.random()-.5)*.2;}if(y<.12||y>.88){vy=-vy;y=Math.max(.12,Math.min(.88,y));}
    sj.style.left=(x*100)+'%';sj.style.top=(y*100)+'%';}};};

/* ---------- 14. rhythm ---------- */
TPL.rhythm=function(h,a){var sel=-1,notes=[],ni=0,ny=0,run=false,res=[],el=null;
  h.innerHTML=IH(a.items,hp(a,HINT.rhythm))+'<div class="mg-rh"><i class="mg-rl"></i></div><div class="mg-r3"><button class="mg-big" data-l="0" style="background:#e5442f">A</button><button class="mg-big" data-l="1" style="background:#2f6db5">B</button><button class="mg-big" data-l="2" style="background:#e0a81f">C</button></div>';
  var rh=h.querySelector('.mg-rh'),COL=['#e5442f','#2f6db5','#e0a81f'];
  function mk(){if(el)el.remove();el=document.createElement('b');el.className='mg-nt';el.textContent='♪';el.style.left=(notes[ni]*33.3+16.6)+'%';el.style.background=COL[notes[ni]];rh.appendChild(el);ny=0;}
  function nxt(q){res.push(q);ni++;if(ni>=4){run=false;if(el){el.remove();el=null;}var s=0;res.forEach(function(v){s+=v;});a.add(sel,s/4);}else mk();}
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);notes=[R(3),R(3),R(3),R(3)];ni=0;res=[];run=true;mk();return;}};
  [].forEach.call(h.querySelectorAll('[data-l]'),function(b){b.onpointerdown=function(e){e.preventDefault();if(!run){a.flash('Pick an item first',false);return;}if(+b.dataset.l===notes[ni]&&ny>.6&&ny<1.05)nxt(1-Math.abs(ny-.85)/.25*.5);else nxt(.3);};});
  return {tick:function(dt){if(!run||!el)return;ny+=dt/(1.5-.12*a.gear);el.style.top=(ny*88)+'%';if(ny>1.15)nxt(.2);}};};

/* ---------- 15. dial ---------- */
TPL.dial=function(h,a){var sel=-1,round=0,tg=50,qs=[];
  h.innerHTML=IH(a.items,hp(a,HINT.dial))+'<div class="mg-dl"><i class="mg-dtg">✦</i><input type="range" min="0" max="100" value="50" class="mg-rg"></div><button class="mg-big lk" style="margin-top:6px;background:#2fa866">LOCK</button><p class="mg-hint rd">Pick an item to start</p>';
  var rg=h.querySelector('.mg-rg'),tgE=h.querySelector('.mg-dtg'),rd=h.querySelector('.rd');
  function nt(){tg=12+R(76);tgE.style.left=tg+'%';rg.value=50;rd.textContent='Round '+(round+1)+'/3';}
  h.onclick=function(e){var p=pick(e);if(p){sel=p.id;selMark(h,sel);round=0;qs=[];nt();}};
  h.querySelector('.lk').onpointerdown=function(e){e.preventDefault();if(sel<0){a.flash('Pick an item',false);return;}var d=Math.abs(+rg.value-tg),tol=4+2*a.gear,q=d<=tol?1:Math.max(.3,1-(d-tol)/40);qs.push(q);round++;
    if(round>=3){var s=0;qs.forEach(function(v){s+=v;});round=0;qs=[];var id=sel;nt();a.add(id,s/3);}else nt();};
  return {tick:function(){}};};

/* ---------- styles for the new games ---------- */
var css=[
'#mg .mg-it:has(.mg-ib:nth-child(4)) .mg-ib{font-size:26px;min-height:62px}',
'#mg .mg-sw{position:relative;height:26px;background:#000;border:3px solid #4a4a80;border-radius:8px;margin-bottom:8px}#mg .mg-sz{position:absolute;left:40%;width:20%;top:0;bottom:0;background:rgba(67,209,122,.6)}#mg .mg-sm{position:absolute;top:-3px;bottom:-3px;width:10px;margin-left:-5px;background:#fff;border-radius:3px;box-shadow:0 0 6px #fff}',
'#mg .mg-bt{position:relative;height:128px;border:3px solid #111;border-radius:10px;overflow:hidden;background:repeating-linear-gradient(90deg,#3a3a44 0 18px,#2c2c36 18px 36px);animation:mgbelt 1s linear infinite}@keyframes mgbelt{to{background-position:36px 0}}',
'#mg .mg-cv{position:absolute;min-width:54px;height:38px;padding:0 6px;border-radius:10px;border:3px solid #111;background:#f5f0e6;font-size:22px;cursor:pointer;display:flex;align-items:center;gap:3px}#mg .mg-cv small{font-size:9px;font-weight:900;color:#222}',
'#mg .mg-pot{position:relative;width:150px;height:130px;margin:0 auto 8px;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 40%,#6a4a3a,#2a1a14);border:4px solid #111;display:flex;align-items:center;justify-content:center;touch-action:none}#mg .mg-sp{position:absolute;font-size:40px;pointer-events:none;transform:rotate(0deg) translateX(34px)}#mg .mg-pr{position:absolute;bottom:-12px;left:10%;right:10%;height:9px;background:#000;border-radius:5px;overflow:hidden}#mg .mg-pr u{display:block;height:100%;width:0;background:#43d17a}',
'#mg .mg-swa{position:relative;height:160px;border:3px dashed #4a4a80;border-radius:10px;overflow:hidden;touch-action:none;background:rgba(0,0,0,.3)}#mg .mg-fy{position:absolute;left:0;top:0;font-size:38px;line-height:1;pointer-events:auto}#mg .mg-fy.cut{opacity:.2;transform-origin:center;filter:blur(2px)}',
'#mg .mg-pg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}#mg .mg-pp{height:62px;border-radius:12px;border:3px solid #111;background:#2a2a2a;font-size:30px;color:#fff;cursor:pointer}#mg .mg-pp.heat{animation:mgshake .2s infinite;background:#5a3a1a}#mg .mg-pp.ready{background:#2fa866;animation:mgpulse .3s infinite alternate;outline:3px solid #9bffbf}#mg .mg-pp.burnt{background:#444}',
'#mg .mg-twr{position:relative;height:132px;border:3px dashed #4a4a80;border-radius:10px;overflow:hidden;background:rgba(0,0,0,.3);margin-bottom:6px}#mg .mg-twb{position:absolute;inset:0}#mg .mg-tb{position:absolute;height:22px;border:2px solid #111;border-radius:5px;font-style:normal;font-size:15px;line-height:18px;text-align:center;overflow:hidden}#mg .mg-tws{position:absolute;height:22px;border:2px solid #111;border-radius:5px;opacity:.85}',
'#mg .mg-hg{display:flex;align-items:center;gap:10px;margin:8px 0;background:rgba(0,0,0,.4);border-radius:10px;padding:6px 10px}#mg .mg-hf{font-size:34px}#mg .mg-hpv{font-size:22px;color:#ffe27a;min-width:80px}#mg .mg-hm{flex:1;height:12px;background:#000;border-radius:6px;overflow:hidden}#mg .mg-hm u{display:block;height:100%;width:0;background:linear-gradient(90deg,#43d17a,#ffb347,#e5442f)}',
'#mg .mg-r2{display:flex;gap:8px}#mg .mg-r3{display:flex;gap:8px;margin-top:6px}#mg .mg-r3>button{flex:1}',
'#mg .mg-pl{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:0;height:132px;margin-top:8px;border:3px solid #111;border-radius:10px;overflow:hidden;touch-action:none;background:#e8e2d0}#mg .mg-plb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:76px}#mg .mg-pc{position:relative;display:block;background:transparent}#mg .mg-pc.d{background:#5a4a3a}',
'#mg .mg-prg{height:9px;background:#000;border-radius:5px;overflow:hidden;margin-top:6px}#mg .mg-prg u{display:block;height:100%;width:0;background:#43d17a}',
'#mg .mg-tsv{width:100%;height:150px;margin-top:8px;background:rgba(0,0,0,.35);border:2px dashed #4a4a80;border-radius:10px;touch-action:none}#mg .mg-tpl{fill:none;stroke:#ffe27a;stroke-width:1.6;stroke-dasharray:3 2}#mg .mg-ttr{fill:none;stroke:#43d17a;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}#mg .mg-tst{fill:#e5442f;stroke:#fff;stroke-width:.8}',
'#mg .mg-cd{margin:8px 0 0;background:rgba(0,0,0,.4);border-radius:10px;padding:8px;text-align:center;font-size:13px;line-height:1.5}#mg .mg-cd b{color:#ffe27a;font-size:20px}#mg .mg-coin{min-height:56px;border-radius:50%;border:4px solid #8a6a12;background:#f2c94c;color:#1b1b2f;font-weight:900;font-size:18px;cursor:pointer;box-shadow:0 4px 0 rgba(0,0,0,.5)}',
'#mg .mg-vf{position:relative;height:150px;margin-top:8px;border:3px solid #111;border-radius:10px;overflow:hidden;background:linear-gradient(#2a3a5a,#1a2238)}#mg .mg-vb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:84px;opacity:.18}#mg .mg-xh{position:absolute;left:30%;top:22%;width:40%;height:56%;border:3px solid #ffe27a;border-radius:8px;box-shadow:0 0 0 999px rgba(0,0,0,.25)}#mg .mg-sj{position:absolute;font-size:40px;transform:translate(-50%,-50%);left:50%;top:50%}',
'#mg .mg-rh{position:relative;height:130px;margin-top:8px;border:3px solid #111;border-radius:10px;overflow:hidden;background:repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 33.3%,rgba(255,255,255,.12) 33.3% 66.6%,rgba(255,255,255,.06) 66.6% 100%)}#mg .mg-rl{position:absolute;left:0;right:0;top:85%;height:4px;background:#ffe27a}#mg .mg-nt{position:absolute;width:34px;height:34px;margin-left:-17px;border-radius:50%;border:3px solid #111;font-style:normal;color:#fff;text-align:center;line-height:28px;font-size:18px}',
'#mg .mg-dl{position:relative;margin-top:14px;padding:14px 4px 4px;background:rgba(0,0,0,.35);border-radius:10px}#mg .mg-dtg{position:absolute;top:0;font-style:normal;font-size:22px;color:#ffe27a;transform:translateX(-50%);margin-left:0}#mg .mg-rg{width:100%;height:32px;accent-color:#f2c94c}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- per-stall assignment: mechanic + twist, items and customers ---------- */
var A={"Pastel de nata":["oven","rush"],"Francesinha":["stack","picky"],"Smash burgers":["stack","rush"],"Bifana grill":["grill","rush"],"Truffle kitchen":["grill","vip"],"Wagyu grill":["grill","critic"],"Caldo verde":["stir","siesta"],"Sushi bar":["conveyor","rush"],"Chef's tasting theatre":["conveyor","vip"],"Michelin pop-up":["conveyor","critic"],"Postcards":["conveyor","tourist"],"Plants":["swipe","siesta"],"Flowers":["swipe","regulars"],"Gelato cart":["tower","rain"],"Waffle cart":["tower","happy"],"Popcorn cart":["pop","festival"],"Candy floss":["pop","happy"],"Coffee & bica":["pour","rush"],"Cocktail bar":["shake","happy"],"Mojito shack":["shake","rain"],"Whisky tasting":["dial","critic"],"Rare whisky vault":["dial","vip"],"Pottery wheel":["steady","regulars"],"Glass blowing":["steady","critic"],"Watchmaker":["steady","strict"],"Master sculptor":["steady","vip"],"Street mural":["trace","rain"],"Blacksmith":["rhythm","strict"],"Luthier":["rhythm","critic"],"Musical instruments":["rhythm","festival"],"Retro games":["rhythm","lucky"],"Vinyl records":["rhythm","regulars"],"Sneaker resale":["haggle","thief"],"Designer outlet":["haggle","rush"],"Antiques":["haggle","regulars"],"Auction house":["haggle","vip"],"Vintage supercars":["haggle","critic"],"Used books":["polish","siesta"],"Comics & manga":["polish","festival"],"Photo booth":["snap","tourist"],"Hologram booth":["snap","vip"],"Runway flagship":["snap","critic"],"Charging point":["change","tourist"],"Cloakroom":["change","bulk"],"First-aid post":["change","strict"],"ATM & exchange":["change","thief"],"Concierge lounge":["change","vip"],"Tarot reader":["memory","regulars"],"Palm reader":["memory","tourist"],"Master tattoo atelier":["draw","vip"],"Piercing":["draw","strict"],"Hair braiding":["fold","regulars"],"Beard & moustache":["slice","critic"],"Barber":["slice","regulars"],"Spa & wellness":["slice","siesta"],"Padaria":["oven","tourist"],"Broa & bolo":["oven","happy"],"Croissanterie":["oven","strict"],"Wood-fired pizza":["oven","festival"],"Bolo-rei":["oven","rain"],"Pastéis de bacalhau":["oven","bulk"],"Dumpling steamer":["oven","thief"],"Hot dog stand":["stack","bulk"],"Prego no pão":["stack","festival"],"Tosta mista":["stack","rain"],"Lobster roll shack":["stack","happy"],"Taco truck":["stack","siesta"],"Vegan bowls":["stack","vip"],"Boutique":["stack","regulars"],"Kimono & kaftans":["stack","strict"],"Raincoats & umbrellas":["stack","critic"],"Sportswear":["stack","tourist"],"Sardine grill":["grill","regulars"],"Churros cart":["grill","siesta"],"Chouriço assado":["grill","tourist"],"Frango piri-piri":["grill","picky"],"Tripas à moda do Porto":["stir","bulk"],"Polvo à lagareiro":["stir","vip"],"Paella pan":["stir","tourist"],"Ramen counter":["stir","festival"],"Arroz doce":["stir","critic"],"Bacalhau":["stir","picky"],"Sangria jug":["stir","rain"],"Petiscos & tapas":["conveyor","bulk"],"Cheese & charcuterie":["conveyor","siesta"],"Souvenirs":["conveyor","happy"],"Conservas":["conveyor","festival"],"Falafel & kebab":["swipe","festival"],"Pizza slices":["swipe","bulk"],"Oyster bar":["swipe","thief"],"Fresh juice cart":["swipe","strict"],"Lemonade cart":["swipe","critic"],"Crêpe cart":["tower","lucky"],"Champagne tower":["tower","siesta"],"Caviar & champagne":["tower","bulk"],"Chocolate boutique":["tower","tourist"],"Roasted chestnuts":["pop","bulk"],"Honey & spice":["pop","picky"],"Port wine tasting":["pour","vip"],"Craft beer taps":["pour","picky"],"Vinho verde":["pour","tourist"],"Craft cider":["pour","bulk"],"Gin garden":["pour","rain"],"Sake & soju":["pour","critic"],"Mezcal & tequila":["pour","thief"],"Ginjinha shots":["pour","regulars"],"Tea & infusions":["pour","happy"],"Bubble tea":["shake","siesta"],"Molecular cocktail lab":["shake","strict"],"Aperol spritz bar":["shake","vip"],"Coffee beans":["shake","critic"],"Specialty coffee lab":["dial","thief"],"Absinthe parlour":["dial","lucky"],"Vintage port cellar":["dial","rush"],"Grand Cru sommelier":["dial","happy"],"Kombucha tap":["dial","rain"],"Natural wine":["dial","tourist"],"Bespoke perfumer":["dial","regulars"],"Perfumes":["dial","strict"],"Origami & paper":["craft","regulars"],"Basketry":["craft","bulk"],"Embroidery":["craft","thief"],"Macramé":["craft","rush"],"Cork goods":["craft","rain"],"Candles & soap":["craft","critic"],"Leather goods":["craft","happy"],"Wood carving":["craft","festival"],"Bookbinder":["craft","picky"],"Mosaic studio":["craft","strict"],"Filigree silver":["steady","tourist"],"Resin art":["steady","rain"],"Handmade jewelry":["steady","thief"],"Silver jewellery":["steady","happy"],"Gold jewellery":["steady","picky"],"Diamond jeweller":["steady","lucky"],"Azulejo ceramics":["trace","regulars"],"Hand-painted tiles":["trace","thief"],"Ceramic roosters":["trace","bulk"],"Gold leaf artisan":["trace","happy"],"Portrait artist":["trace","lucky"],"Henna studio":["trace","siesta"],"Caricature artist":["trace","rush"],"Temporary tattoos":["trace","strict"],"Gadget repair":["rhythm","tourist"],"Drone & gadget lab":["rhythm","thief"],"3D-print toys":["rhythm","rush"],"Art prints":["haggle","rain"],"Leather jackets":["haggle","festival"],"Luxury handbags":["haggle","lucky"],"Cashmere house":["haggle","tourist"],"Silk scarves":["haggle","happy"],"Handmade shoes":["haggle","siesta"],"Crown jewels vault":["haggle","strict"],"Swiss watch boutique":["haggle","picky"],"Fine art gallery":["haggle","bulk"],"Rare books & maps":["polish","rain"],"Old cameras":["snap","picky"],"Steel jewellery":["polish","happy"],"Maps & prints":["polish","strict"],"Cork stationery":["polish","bulk"],"Wood toys":["polish","lucky"],"Pet shop":["polish","picky"],"Olive oil & vinegar":["polish","rush"],"Sunglasses":["polish","vip"],"AR portrait studio":["snap","siesta"],"VR arcade":["snap","bulk"],"Haute couture atelier":["snap","festival"],"Surf & skate":["snap","rain"],"Celebrity stylist":["snap","lucky"],"Info kiosk":["change","happy"],"Security post":["change","festival"],"News agent":["change","regulars"],"Bike repair post":["change","rush"],"Face painting":["draw","bulk"],"Nail art":["draw","rain"],"Glitter bar":["draw","happy"],"Body-paint studio":["draw","rush"],"Tattoo studio":["draw","picky"],"Massage chairs":["draw","critic"],"Vintage clothes":["fold","thief"],"Hats & caps":["fold","picky"],"Knitwear":["fold","bulk"],"Streetwear":["fold","festival"],"Quirky socks":["fold","happy"],"Beanies & gloves":["fold","strict"],"Football shirts":["fold","lucky"],"Band tees":["fold","rush"],"Linen basics":["fold","vip"],"Kids wear":["fold","tourist"],"Swimwear":["fold","siesta"],"Burel capes":["fold","critic"],"Bags & backpacks":["fold","rain"],"T-shirt printing":["craft","lucky"],"Denim tailor":["craft","vip"],"Bespoke tailor":["craft","siesta"]};
var FOOD=[['🍞','Bread'],['🧀','Cheese'],['🥓','Bacon'],['🍅','Tomato'],['🥬','Lettuce'],['🍳','Egg'],['🧅','Onion'],['🌶️','Chili'],['🥤','Soda'],['🍟','Fries'],['🥗','Salad'],['🍋','Lemon']];
var DRINK=[['🧊','Ice'],['🍋','Lemon'],['🍓','Berry'],['🌿','Mint'],['🍯','Honey'],['🍊','Orange'],['🫐','Blueberry'],['🥛','Milk']];
var DES=[['🌹','Rose'],['🦋','Butterfly'],['⭐','Star'],['🐉','Dragon'],['🌙','Moon'],['☀️','Sun'],['⚓','Anchor'],['🦅','Eagle'],['🌸','Blossom']];
var TINT=[['#e5442f','Red'],['#2f6db5','Blue'],['#e0a81f','Gold'],['#3a3a44','Black'],['#43d17a','Green']];
var CUST={food:['🧑','👩','👨','🧒','👵','🧔'],drink:['🧔','👱','🕺','💃','🧑','👨'],craft:['👵','🧓','🧐','👩','🧑‍🎨'],cloth:['💃','🕺','🧑‍🎤','👩','🧒'],body:['🧑','🧔','👱','💁','🧑‍🎤'],shop:['🤵','👩‍💼','🧑‍💼','🧓','👨'],amen:['🧑‍💼','🧑','👩','👨','🧓']};
var NEED4={stack:1,conveyor:1,swipe:1};
function build(i,m){var d=ST[i],e=d[12],f=d[1],nm=d[0].split(/[ ,&\-]/)[0].slice(0,9),out=[],pool,k,used={};
  var food=(f==='food'||f==='drink'),body=(f==='body'||m==='draw'||m==='trace'||m==='snap'||m==='memory'),want=NEED4[m]?4:3;
  if(food&&m!=='trace'&&m!=='snap'){pool=f==='drink'?DRINK:FOOD;out.push([e,nm]);if(m==='stack'){out=[['🍞','Bun'],[e,nm]];used[0]=1;}
    for(k=0;out.length<want&&k<40;k++){var ix=(i*3+k*5)%pool.length;if(used[ix])continue;used[ix]=1;out.push(pool[ix]);}
    return out.map(function(x,n){return {id:n,e:x[0],n:x[1]};});}
  if(m==='memory'||m==='trace'||m==='snap'||(body&&m==='draw')){for(k=0;out.length<3;k++){var j=(i+k*3)%DES.length;out.push(DES[j]);}return out.map(function(x,n){return {id:n,e:x[0],n:x[1]};});}
  for(k=0;k<want;k++)out.push({id:k,e:e,n:TINT[k][1],bg:TINT[k][0]});return out;}
for(var i=0;i<ST.length;i++){var nm=ST[i][0],ass=A[nm];if(!ass)continue;
  SPEC[nm]={m:ass[0],tw:ass[1],tag:HINT[ass[0]]||'',hint:HINT[ass[0]]||'',cust:CUST[ST[i][1]]||CUST.shop,items:build(i,ass[0])};
  if(!TPL[ass[0]])delete SPEC[nm];}
M.games={count:Object.keys(SPEC).length};
})();
