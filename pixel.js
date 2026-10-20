/* pixel.js - pixel-art mini-games for clothing stalls: a folding table (every fold is animated frame by frame) and a tailor's bench
   (measure, cut, stitch, print). The timing cursor is driven by a CSS animation, so it keeps moving on phones even when scripts are throttled.
   Loaded after mini.js and games.js. */
(function(){
'use strict';
var M=window.mfbMG;if(!M||!M.TPL||window.__mgpx)return;window.__mgpx=1;
var TPL=M.TPL,H=M.H,pick=H.pick,IH=H.itemsHTML;
function snd(n){try{if(typeof sfx==='function')sfx(n);}catch(e){}}
var N=32;                                   // art grid, shown at 5x

/* ---------- colour + drawing helpers ---------- */
function rgb(hex){var n=parseInt(String(hex).replace('#',''),16);return [n>>16&255,n>>8&255,n&255];}
function shade(hex,k){var c=rgb(hex);return 'rgb('+c.map(function(v){return Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));}).join(',')+')';}
function R(g,x,y,w,h,c){if(w<=0||h<=0)return;g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function table(g){
  R(g,0,0,N,N,'#7b5a3a');
  for(var y=0;y<N;y+=6){R(g,0,y,N,1,'#6a4c30');}
  for(var k=0;k<5;k++){R(g,(k*11+3)%N,(k*7+2)%N,3,1,'#8a6a46');}
  R(g,0,0,N,1,'#9a7a54');
}
/* a block with outline and simple shading */
function blk(g,x,y,w,h,c,line){
  if(w<=0||h<=0)return;
  R(g,x-1,y-1,w+2,h+2,line||'#1b1b2f');R(g,x,y,w,h,c);
  if(h>2){R(g,x,y,w,1,shade(c,.28));R(g,x,y+h-1,w,1,shade(c,-.22));}
}
function sparkle(g,x,y,s,c){var a=c||'#fff7b0';R(g,x,y-s,1,2*s+1,a);R(g,x-s,y,2*s+1,1,a);R(g,x,y,1,1,'#fff');}

/* ---------- the shirt on the folding table ---------- */
var FOLDS=[
  {ax:'x',p:13,rects:[[5,9,5,6,1],[10,9,3,18,0]]},       // left side + sleeve
  {ax:'x',p:19,rects:[[22,9,5,6,1],[19,9,3,18,0]]},      // right side + sleeve
  {ax:'y',p:18,rects:[[13,18,6,9,0]]}                    // bottom up
];
function flapRects(f,t,col,wob){
  var c=Math.cos(Math.PI*t),out=[],lin=shade(col,-.18);
  f.rects.forEach(function(r){
    var x=r[0],y=r[1],w=r[2],h=r[3],isS=r[4],col2=c<0?lin:col;
    if(f.ax==='x'){var a=f.p+(x-f.p)*c,b=f.p+(x+w-f.p)*c;out.push([Math.min(a,b),y+(c<0?wob:0),Math.abs(b-a),h,col2,isS]);}
    else{var a2=f.p+(y-f.p)*c,b2=f.p+(y+h-f.p)*c;out.push([x+(c<0?wob:0),Math.min(a2,b2),w,Math.abs(b2-a2),col2,isS]);}
  });
  return out;
}
function drawShirtFold(g,col,done,anim,wob,final,tt){
  table(g);
  R(g,7,27,19,2,'rgba(0,0,0,.25)');                      // soft shadow
  if(final){drawFolded(g,col,final);return;}
  var lin=shade(col,-.18);
  /* what stays flat on the table */
  var x0=10,x1=22,y0=9,y1=27;
  if(done>=1||(anim&&anim.k===0))x0=13;
  if(done>=2||(anim&&anim.k===1))x1=19;
  var y1c=y1;if(done>=3||(anim&&anim.k===2))y1c=18;
  blk(g,x0,y0,x1-x0,y1c-y0,col);
  if(done<1&&!(anim&&anim.k===0))blk(g,5,9,5,6,col);                   // left sleeve
  if(done<2&&!(anim&&anim.k===1))blk(g,22,9,5,6,col);                  // right sleeve
  if(y0===9){R(g,15,9,3,2,'#6a4c30');R(g,15,11,3,1,shade(col,-.3));}
  /* folded flaps resting on top (finished folds) */
  for(var i=0;i<3;i++){
    if(done>i){var rr=flapRects(FOLDS[i],1,col,wob[i]||0);
      rr.forEach(function(r){var xx=r[0],yy=r[1],ww=r[2],hh=r[3];
        if(FOLDS[i].ax==='x'){var lo=Math.max(13,xx),hi=Math.min(19,xx+ww);xx=lo;ww=hi-lo;}
        else{var lo2=Math.max(9,yy),hi2=Math.min(18,yy+hh);yy=lo2;hh=hi2-lo2;}
        if(ww>0&&hh>0)blk(g,xx,yy,ww,hh,r[5]?shade(col,-.28):lin);});}
  }
  /* the flap in the air */
  if(anim){var rr2=flapRects(FOLDS[anim.k],anim.t,col,wob[anim.k]||0);
    var lift=Math.round(Math.sin(Math.PI*anim.t)*2);
    rr2.forEach(function(r){blk(g,r[0],r[1]-lift,r[2],r[3],r[4]);});
    if(anim.t>.85){var fx=FOLDS[anim.k].ax==='x'?FOLDS[anim.k].p:16,fy=FOLDS[anim.k].ax==='y'?FOLDS[anim.k].p:18;sparkle(g,fx,fy,1);}}
  if(done>=1&&done<3){R(g,x0,y0+2,1,y1c-y0-4,shade(col,.2));}
}
/* the finished folded shirt (pops up, gets a print and a tag) */
function drawFolded(g,col,f){
  var s=f.t<.25?f.t/.25:1,pop=f.t<.25?Math.round((1-s)*3):0;
  blk(g,9,13+pop,14,11,col);
  R(g,9,13+pop,14,1,shade(col,.35));
  blk(g,13,11+pop,6,3,shade(col,-.15));R(g,14,12+pop,4,1,shade(col,.3));      // collar
  R(g,13,17+pop,6,1,shade(col,-.25));R(g,13,21+pop,6,1,shade(col,-.25));
  R(g,15,16+pop,2,4,'#fff3b0');R(g,14,17+pop,4,2,'#fff3b0');                  // little star print
  R(g,22,15+pop,3,5,'#f2f2f2');R(g,22,15+pop,3,1,'#bbb');                     // tag
  if(f.t>.2){var k=Math.floor(f.t*8)%3;sparkle(g,8+k*2,10+k,1+(k===1?1:0));sparkle(g,24-k,12+k*2,1);sparkle(g,16,9-k,1);}
}

/* ---------- the tailor's bench: measure, cut, stitch, print ---------- */
function drawCloth(g,col,stage,t,done,final,wob){
  table(g);
  R(g,6,27,21,2,'rgba(0,0,0,.25)');
  var lin=shade(col,-.2);
  if(final){drawTee(g,col,true,final.t);return;}
  if(stage===0){                                  // Measure: chalk line grows round the fabric, ruler on top
    blk(g,5,8,22,18,col);
    for(var i=0;i<=11;i++){R(g,6+i*2,7,1,i%2?1:2,'#e8e0c8');}
    R(g,5,5,22,1,'#d8c89a');
    var per=2*(20+16),len=Math.round(per*t),x=6,y=9,k;
    for(k=0;k<len;k++){var p=k;if(p<20){x=6+p;y=9;}else if(p<36){x=26;y=9+(p-20);}else if(p<56){x=26-(p-36);y=25;}else{x=6;y=25-(p-56);}if(k%2===0)R(g,x,y,1,1,'#fff');}
    var px=6+Math.round(20*t);R(g,px-1,5,3,5,'#e5442f');R(g,px,6,1,3,'#fff');
  }else if(stage===1){                            // Cut: the corners are cut away, scissors travel along the line
    var cutN=Math.round(t*4);
    blk(g,5,8,22,18,col);
    var corners=[[5,8,6,6],[21,8,6,6],[5,20,6,6],[21,20,6,6]];
    for(var q=0;q<4;q++){if(q<cutN||done>=2)R(g,corners[q][0]-1,corners[q][1]-1,corners[q][2]+2,corners[q][3]+2,'#7b5a3a');else{R(g,corners[q][0],corners[q][1],corners[q][2],corners[q][3],col);}}
    if(done>=2){drawTee(g,col,false,0);}
    else{var sx=Math.round(6+t*18),sy=t<.5?14:20;R(g,sx,sy-1,4,1,'#cfd6e6');R(g,sx,sy+1,4,1,'#cfd6e6');R(g,sx-2,sy-2,2,2,'#e5442f');R(g,sx-2,sy+1,2,2,'#e5442f');R(g,sx+4,sy,1,1,'#fff');}
  }else{                                          // Stitch: seam stitches appear, then the print
    drawTee(g,col,false,0);
    var seams=[[8,10,1,15],[23,10,1,15],[11,25,10,1]],n=Math.round(t*30),c2=0;
    seams.forEach(function(sm){for(var s2=0;s2<(sm[2]>1?sm[2]:sm[3]);s2+=2){if(c2<n||stage>2)R(g,sm[0]+(sm[2]>1?s2:0),sm[1]+(sm[3]>1?s2:0),1,1,'#fff3b0');c2+=2;}});
    if(t>.35){var a=Math.min(1,(t-.35)/.5),sx2=16,sy2=17,r=Math.round(4*a);
      R(g,sx2-r,sy2,2*r+1,1,'#fff3b0');R(g,sx2,sy2-r,1,2*r+1,'#fff3b0');if(r>=2){R(g,sx2-1,sy2-1,3,3,'#fff3b0');}}
  }
}
function drawTee(g,col,printed,t){
  blk(g,10,9,12,17,col);blk(g,5,9,5,6,col);blk(g,22,9,5,6,col);
  R(g,10,10,12,1,shade(col,.3));R(g,14,9,4,2,'#6a4c30');R(g,14,11,4,1,shade(col,-.3));
  R(g,5,14,5,1,shade(col,-.25));R(g,22,14,5,1,shade(col,-.25));
  if(printed){
    R(g,15,15,2,6,'#fff3b0');R(g,13,17,6,2,'#fff3b0');R(g,14,16,4,4,'#fff3b0');R(g,15,17,2,2,'#e5442f');
    var k=Math.floor(t*8)%3;sparkle(g,6+k*2,7+k,1);sparkle(g,25-k,8+k,1);sparkle(g,16,6,1+(k===1?1:0));
  }
}

/* ---------- timing UI with a CSS-driven cursor (works the same on phones) ---------- */
var CSS=[
'@keyframes mgping{from{left:0}to{left:100%}}',
'#mg .mg-pxw{display:flex;justify-content:center;align-items:center;gap:10px;margin:2px 0 4px}',
'#mg canvas.mg-px{width:160px;height:160px;image-rendering:pixelated;image-rendering:crisp-edges;border:3px solid #111;border-radius:10px;background:#7b5a3a;box-shadow:0 3px 0 rgba(0,0,0,.4)}',
'#mg .mg-pxs{display:flex;flex-direction:column;gap:8px}#mg .mg-pxs i{display:block;width:16px;height:16px;border:3px solid #111;border-radius:5px;background:#2a2a44}#mg .mg-pxs i.on{background:#ffd166;box-shadow:0 0 8px #ffd166}#mg .mg-pxs i.ok{background:#43d17a}',
'#mg .mg-pxr{font:900 15px/1.1 inherit;color:#ffe27a;min-height:18px;text-align:center}',
'#mg .mg-tc.px{animation-name:mgping;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;left:0}',
'@media (max-height:700px){#mg canvas.mg-px{width:120px;height:120px}}'
].join('\n');
var stl=document.createElement('style');stl.textContent=CSS;document.head.appendChild(stl);

var PRAISE=['Perfect!','Nice!','Okay','Sloppy'];
function PTiming(h,o,cb){
  var steps=o.labels,n=steps.length,k=0,qs=[],dead=false,anim=null,fin=null,wob=[0,0,0],done=0,tz=0,zc=.5,zw=.3,raf=0,last=0;
  h.innerHTML='<div class="mg-pxw"><canvas class="mg-px" width="'+N+'" height="'+N+'"></canvas><div class="mg-pxs">'+steps.map(function(){return '<i></i>';}).join('')+'</div></div>'
    +'<div class="mg-tl"></div><div class="mg-tbar"><i class="mg-tz"></i><b class="mg-tc px"></b></div><div class="mg-pxr"></div><button class="mg-big">'+(o.btn||'TAP!')+'</button>';
  var cv=h.querySelector('canvas'),g=cv.getContext('2d'),z=h.querySelector('.mg-tz'),c=h.querySelector('.mg-tc'),l=h.querySelector('.mg-tl'),bar=h.querySelector('.mg-tbar'),res=h.querySelector('.mg-pxr'),dots=h.querySelectorAll('.mg-pxs i'),btn=h.querySelector('.mg-big');
  g.imageSmoothingEnabled=false;
  function paint(){
    if(o.kind==='fold')drawShirtFold(g,o.col,done,anim,wob,fin,0);
    else drawCloth(g,o.col,anim?anim.k:Math.min(k,n-1),anim?anim.t:0,done,fin,wob);
  }
  function nz(){
    var L=Math.max(1,window.mfbLevel||1);zw=Math.max(.07,.3+.03*o.gear-.04*k-.014*(L-1));zc=zw/2+.06+Math.random()*(1-zw-.12);
    z.style.left=((zc-zw/2)*100)+'%';z.style.width=(zw*100)+'%';
    l.textContent=steps[k]+' ('+(k+1)+'/'+n+')';
    var speed=(1.0+.25*k)*(1+.08*(Math.max(1,window.mfbLevel||1)-1));                              // bar widths per second
    c.style.animationDuration=(1/speed).toFixed(3)+'s';
    c.style.animationPlayState='running';
    for(var i=0;i<dots.length;i++)dots[i].className=i<k?'ok':i===k?'on':'';
    paint();
  }
  function pos(){var b=bar.clientWidth||1,x=parseFloat(getComputedStyle(c).left);if(isNaN(x))x=0;return Math.max(0,Math.min(1,x/b));}
  function tap(){
    if(dead||anim||fin)return;
    var x=pos(),d=Math.abs(x-zc),q=d<=zw/2?1-d/(zw/2)*.4:d<=zw/2+.025?.35:0;
    c.style.animationPlayState='paused';
    qs.push(q);wob[k]=q>.8?0:(Math.random()<.5?-1:1);
    res.textContent=q<=0?'Miss!':q>.9?PRAISE[0]:q>.7?PRAISE[1]:q>.5?PRAISE[2]:PRAISE[3];
    snd(q>.6?'click':'bad');
    anim={k:k,t:0};
  }
  function step(ts){
    if(dead||!h.isConnected){dead=true;return;}
    var dt=Math.min(.1,Math.max(0,(ts-last)/1000||0));last=ts;
    if(anim){anim.t+=dt/.34;if(anim.t>=1){done=k+1;k++;anim=null;if(k>=n){fin={t:0};snd('coin');}else nz();}paint();}
    else if(fin){fin.t+=dt/.9;paint();if(fin.t>=1){dead=true;var a=0;var bad=0;qs.forEach(function(v){a+=v;if(v<=0)bad++;});cb(a/qs.length,bad);return;}}
    raf=requestAnimationFrame(step);
  }
  btn.onpointerdown=function(e){e.preventDefault();tap();};
  cv.onpointerdown=function(e){e.preventDefault();tap();};
  nz();last=performance.now();raf=requestAnimationFrame(step);
  return {tick:function(){},stop:function(){dead=true;cancelAnimationFrame(raf);}};
}

/* ---------- the two games ---------- */
function shirtColour(it,i){return (it&&it.bg)||['#e5593f','#2f6db5','#e0a81f','#43d17a','#8a63c7'][i%5];}
var FOLD_LABELS=['Fold the left side in','Fold the right side in','Fold it up'];

TPL.fold=function(h,a){
  var tm=null;
  function mount(){if(tm&&tm.stop)tm.stop();tm=null;h.innerHTML=IH(a.items,'Pick a garment, then tap in the green for every fold');}
  mount();
  h.onclick=function(e){if(tm)return;var p=pick(e);if(!p)return;var it=a.items[p.id];
    tm=PTiming(h,{kind:'fold',labels:FOLD_LABELS,col:shirtColour(it,p.id),gear:a.gear,btn:'FOLD!'},function(q,bad){tm=null;if(bad)a.miss('Missed the mark!');else a.add(p.id,q);mount();});};
  return {tick:function(){}};
};

var origCraft=TPL.craft;
TPL.craft=function(h,a){
  var s=M.state&&M.state(),cat=null;try{cat=ST[s.i][1];}catch(e){}
  if(cat!=='cloth')return origCraft(h,a);
  var tm=null;
  function mount(){if(tm&&tm.stop)tm.stop();tm=null;h.innerHTML=IH(a.items,'Pick a colour, then tap in the green: measure, cut, stitch and print');}
  mount();
  h.onclick=function(e){if(tm)return;var p=pick(e);if(!p)return;var it=a.items[p.id];
    tm=PTiming(h,{kind:'cloth',labels:['Measure the fabric','Cut it out','Stitch and print'],col:shirtColour(it,p.id),gear:a.gear,btn:'TAP!'},function(q,bad){tm=null;if(bad)a.miss('Missed the mark!');else a.add(p.id,q);mount();});};
  return {tick:function(){}};
};
M.PTiming=PTiming;
})();
