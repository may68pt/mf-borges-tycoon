TESTX/* portrait.js - new character portraits and the stall card look.
   Portraits: 64x64 hand-built pixel art with a transparent background, thick ink linework, 3-tone cel shading with dithering,
   big expressive faces (adventure-game cartoon style). Replaces the old 32x32 drawPortrait.
   Stall card: no box behind the avatar, no white speech box: glowing arcade lettering with a typewriter quote and a tagline. */
(function(){
'use strict';
if(window.__portrait2)return;window.__portrait2=1;
var N=64;
function rgb(h){if(Array.isArray(h))return h;h=String(h||'#888888');if(h.charAt(0)==='#'){if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];var n=parseInt(h.slice(1,7),16);return [n>>16&255,n>>8&255,n&255];}var m=h.match(/\d+/g);return m?[+m[0],+m[1],+m[2]]:[136,136,136];}
function mixc(a,b,k){return [Math.round(a[0]+(b[0]-a[0])*k),Math.round(a[1]+(b[1]-a[1])*k),Math.round(a[2]+(b[2]-a[2])*k)];}
function sh(c,k){return mixc(mixc(c,[0,0,0],k*.34),[52,30,92],k*.5);}      /* shadow: darker and a little purple */
function hl(c,k){return mixc(c,[255,240,196],k);}                          /* light: warm */
var INK=[28,15,34];
function hash(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){var s=seed||1;return function(){s=(s+0x6D2B79F5)|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* shape helpers (return a function that fills the current path on a context) */
function ell(cx,cy,rx,ry,rot){return function(g){g.beginPath();g.ellipse(cx,cy,rx,ry,rot||0,0,6.2832);g.fill();};}
function rc(x,y,w,h){return function(g){g.fillRect(x,y,w,h);};}
function pl(p){return function(g){g.beginPath();g.moveTo(p[0],p[1]);for(var i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill();};}
function pa(f){return function(g){g.beginPath();f(g);g.closePath();g.fill();};}

function Painter(){
  var buf=new Uint8ClampedArray(N*N*4),self={};
  function set(x,y,c,a){x=Math.floor(x);y=Math.floor(y);if(x<0||y<0||x>=N||y>=N)return;var i=(y*N+x)*4;buf[i]=c[0];buf[i+1]=c[1];buf[i+2]=c[2];buf[i+3]=a==null?255:a;}
  function has(x,y){if(x<0||y<0||x>=N||y>=N)return false;return buf[(y*N+x)*4+3]>0;}
  self.set=set;self.has=has;
  self.rect=function(x,y,w,h,c){for(var j=0;j<h;j++)for(var i=0;i<w;i++)set(x+i,y+j,c);};
  self.line=function(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);var dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy,n=0;
    for(;;){set(x0,y0,c);if(x0===x1&&y0===y1||n++>300)break;var e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}};
  self.mask=function(){var c=document.createElement('canvas');c.width=c.height=N;var g=c.getContext('2d',{willReadFrequently:true});g.fillStyle='#000';var m={};
    function run(f){return typeof f==='function'?f:function(q){q.drawImage(f.c,0,0);};}
    m.c=c;
    m.add=function(f){g.globalCompositeOperation='source-over';run(f)(g);return m;};
    m.sub=function(f){g.globalCompositeOperation='destination-out';run(f)(g);return m;};
    m.and=function(f){g.globalCompositeOperation='destination-in';run(f)(g);return m;};
    m.bits=function(){var d=g.getImageData(0,0,N,N).data,a=new Uint8Array(N*N);for(var i=0;i<N*N;i++)a[i]=d[i*4+3]>=128?1:0;return a;};
    return m;};
  /* paint a mask: ink outline, cel shading (light from the top left), optional big cel-shadow and per-pixel override */
  self.part=function(m,col,o){o=o||{};var a=m.bits(),base=rgb(col),L=hl(base,.4),S1=sh(base,.66),S2=sh(base,.3),x,y;
    function inn(x,y){if(x<0||y<0||x>=N||y>=N)return true;return a[y*N+x]===1;}
    if(o.ink!==false){var ic=o.inkc||INK;for(y=0;y<N;y++)for(x=0;x<N;x++)if(!a[y*N+x]&&(inn(x-1,y)||inn(x+1,y)||inn(x,y-1)||inn(x,y+1)))set(x,y,ic);}
    for(y=0;y<N;y++)for(x=0;x<N;x++){if(!a[y*N+x])continue;
      var c=base;
      if(!o.flat){
        if(!inn(x,y+1)||!inn(x+1,y))c=S1;
        else if(!inn(x,y-1)||!inn(x-1,y))c=L;
        else if(o.cel&&((x-o.cel[0])+(y-o.cel[1]))*.7071>o.cel[2]){c=(((x+y)&1)&&((x-o.cel[0])+(y-o.cel[1]))*.7071<o.cel[2]+1.6)?base:S2;}
        else if(!inn(x+2,y)||!inn(x,y+2)||!inn(x+1,y+1))c=((x+y)&1)?S2:base;}
      if(o.fn){var r=o.fn(x,y,c);if(r)c=r;}
      set(x,y,c);}
    return a;};
  self.out=function(){var c=document.createElement('canvas');c.width=c.height=N;var g=c.getContext('2d');g.putImageData(new ImageData(buf,N,N),0,0);return c.toDataURL('image/png');};
  return self;
}

/* ---------- the portrait ---------- */
var IRIS=['#3a6ea5','#4a8a3a','#7a4a22','#2a2a38','#6a4aa5','#2f8a8a'];
function make(d){
  var p=Painter(),R=rng(hash(d.id+'|'+d.cls+'|'+d.skin+'|'+d.hair+'|'+d.hairc+'|'+d.top)),
      V={gap:6.8+R()*1.4,ey:28+Math.floor(R()*2),nose:R(),chin:R(),jaw:R(),tilt:Math.floor(R()*3)-1,lid:Math.floor(R()*3),look:Math.floor(R()*3)-1,iris:IRIS[Math.floor(R()*IRIS.length)],ear:R(),mouth:Math.floor(R()*4)},
      SK=rgb(d.skin||'#e8b890'),HC=rgb(d.hairc||'#3a2a1a'),hs=d.hair||'short',ht=d.hat||'none',top=d.top||'tee',TC=rgb(d.topc||'#888'),T2=rgb(d.top2||'#ccc'),face=d.face||'none',
      lum=HC[0]*.3+HC[1]*.59+HC[2]*.11,HD=lum>150?sh(HC,.8):sh(HC,.5),i,x,y;
  function dk(c,k){return sh(rgb(c),k);}
  /* ----- back layers: long hair, hood, bun, pony ----- */
  if(hs==='long')p.part(p.mask().add(pa(function(g){g.moveTo(10,28);g.quadraticCurveTo(8,6,32,5);g.quadraticCurveTo(56,6,54,28);g.lineTo(56,56);g.lineTo(8,56);})),HC,{cel:[30,24,10]});
  if(hs==='bob')p.part(p.mask().add(pa(function(g){g.moveTo(11,24);g.quadraticCurveTo(9,6,32,5);g.quadraticCurveTo(55,6,53,24);g.lineTo(54,44);g.quadraticCurveTo(32,50,10,44);})),HC,{cel:[30,24,10]});
  if(hs==='bun')p.part(p.mask().add(ell(32,7,6.5,5.5)),HC,{cel:[30,5,3]});
  if(hs==='pony')p.part(p.mask().add(pa(function(g){g.moveTo(48,20);g.quadraticCurveTo(62,22,58,40);g.quadraticCurveTo(55,52,50,48);g.quadraticCurveTo(52,36,46,28);})),HC,{cel:[50,30,4]});
  if(top==='hoodie')p.part(p.mask().add(ell(32,50,19,10)),sh(TC,.25),{});
  /* ----- torso ----- */
  var tm=p.mask().add(pa(function(g){g.moveTo(3,64);g.lineTo(4,57);g.quadraticCurveTo(6,50,18,48.5);g.lineTo(46,48.5);g.quadraticCurveTo(58,50,60,57);g.lineTo(61,64);}));
  if(top==='tank'){p.part(tm,SK,{cel:[34,50,8]});}
  /* neck */
  p.part(p.mask().add(rc(25,36,14,15)),SK,{ink:true,fn:function(x,y,c){return y<46?sh(SK,.62):c;}});
  var bodyMask=top==='tank'?p.mask().add(tm).and(pl([14,40,50,40,50,64,14,64])).sub(ell(32,48,8.5,6.5)):tm;
  var bits=p.part(bodyMask,TC,{cel:[44,56,9],fn:function(x,y,c){
    if(top==='stripes'&&((y-50)%5===0||(y-50)%5===1)&&y>=50)return T2;
    if(top==='hawaii'){var fx=(x+3)%9,fy=(y+2)%8;if((fx===3&&fy>=2&&fy<=4)||(fy===3&&fx>=2&&fx<=4))return T2;if(fx===3&&fy===3)return [255,230,120];}
    return null;}});
  /* sleeves / shoulder accent */
  if(top==='jacket'||top==='sec'||top==='shirt'||top==='tee'||top==='hoodie'){var sm=p.mask().add(tm).and(pl([0,40,15,40,16,64,0,64]));p.part(sm,T2,{cel:[10,58,8],ink:false});var sm2=p.mask().add(tm).and(pl([49,40,64,40,64,64,48,64]));p.part(sm2,T2,{cel:[56,58,8],ink:false});
    p.line(15,50,16,63,INK);p.line(49,50,48,63,INK);}
  /* neck hole / collar */
  if(top==='jacket'||top==='sec'||top==='shirt'){
    p.part(p.mask().add(pl([24,47,40,47,32,62])),top==='shirt'?SK:rgb('#f4f1ea'),{cel:[34,50,4],fn:function(x,y,c){return (top!=='shirt'&&y>51&&(x===32||(x===31&&y>52)))?[200,60,70]:null;}});
    p.part(p.mask().add(pl([21,47,31,60,26,63,14,52])),top==='shirt'?T2:T2,{cel:[24,52,4]});
    p.part(p.mask().add(pl([43,47,33,60,38,63,50,52])),top==='shirt'?T2:T2,{cel:[40,52,4]});
    if(top==='shirt'){p.part(p.mask().add(pl([24,47,31,47,28,52])),T2,{});p.part(p.mask().add(pl([40,47,33,47,36,52])),T2,{});}
  }else if(top==='tank'){
    /* bare shoulders, nothing */
  }else{
    p.part(p.mask().add(ell(32,47.5,8,6.3)).and(rc(0,47,64,17)),SK,{ink:true,fn:function(x,y,c){return y<52?sh(SK,.5):c;}});
    p.part(p.mask().add(pa(function(g){g.ellipse(32,47.6,9.4,7.4,0,0,3.1416);g.ellipse(32,47.6,7.2,5.3,0,3.1416,0,true);})),T2,{ink:false,flat:true});
  }
  if(d.acc==='chain'){for(x=-8;x<=8;x++)p.set(32+x,Math.round(52+(x*x)/9),rgb(d.accc||'#d9a441'));p.part(p.mask().add(ell(32,58.5,2.3,2.8)),d.accc||'#d9a441',{});}
  if(d.acc==='scarf'){p.part(p.mask().add(pa(function(g){g.moveTo(21,46);g.quadraticCurveTo(32,54,43,46);g.lineTo(44,52);g.quadraticCurveTo(32,60,20,52);})),d.accc||'#ff3d9a',{cel:[34,50,3]});p.part(p.mask().add(pl([36,52,43,54,41,62,34,59])),d.accc||'#ff3d9a',{cel:[38,56,3]});}
  /* ----- ears ----- */
  var ey=30+Math.round(V.ear*2);
  p.part(p.mask().add(ell(16.3,ey,3.6,5)),SK,{});p.part(p.mask().add(ell(47.7,ey,3.6,5)),SK,{});
  p.set(16,ey,sh(SK,.7));p.set(16,ey+1,sh(SK,.7));p.set(48,ey,sh(SK,.7));p.set(48,ey+1,sh(SK,.7));
  if(d.pierce){p.set(16,ey+4,[240,220,120]);p.set(15,ey+5,[240,220,120]);p.set(48,ey+4,[240,220,120]);}
  /* ----- head ----- */
  var headM=p.mask().add(ell(32,26,16.2,17.2)).add(ell(32,34.5,13+V.jaw*2.2,11+V.chin*2.6));
  var hb=p.part(headM,SK,{cel:[27,22,13]});
  /* blush / cheek dither */
  for(y=34;y<40;y++)for(x=16;x<48;x++)if(hb[y*N+x]&&(x<23||x>41)&&((x+y)%2===0)&&(y>34)&&p.has(x,y))p.set(x,y,mixc(SK,[240,110,110],.35));
  /* ----- facial hair under the face features ----- */
  var jawLow=p.mask().add(headM).and(pl([0,36,64,36,64,64,0,64])).sub(ell(32,26,12,8));
  if(face==='beard'){p.part(p.mask().add(headM).and(pl([0,33,64,33,64,64,0,64])).sub(ell(32,36,11,6.5)).sub(ell(32,44,6,3)),HC,{cel:[30,36,9],ink:false});
    p.part(p.mask().add(pl([20,33,44,33,42,36,22,36])),HC,{ink:false,flat:true});}
  if(face==='stubble'){for(y=36;y<46;y++)for(x=17;x<47;x++)if(hb[y*N+x]&&p.has(x,y)&&((x*3+y*5)%7===0))p.set(x,y,sh(SK,.9));}
  /* ----- eyes ----- */
  var cxs=[32-V.gap,32+V.gap];
  cxs.forEach(function(cx,si){var cy=V.ey,em=p.mask().add(ell(cx,cy,4.1,4.8));
    p.part(em,'#fbfbf4',{ink:true,fn:function(x,y,c){return null;}});
    var ix=cx+V.look*1.2,iy=cy+.6;
    for(var yy=-4;yy<=4;yy++)for(var xx=-4;xx<=4;xx++){if(xx*xx+yy*yy<=7.6&&p.has(Math.round(ix)+xx,Math.round(iy)+yy)){var xn=Math.round(ix)+xx,yn=Math.round(iy)+yy;if(((xn-cx)*(xn-cx))/16.8+((yn-cy)*(yn-cy))/23<=1)p.set(xn,yn,yy>1?sh(rgb(V.iris),.3):rgb(V.iris));}}
    for(yy=-2;yy<=2;yy++)for(xx=-2;xx<=2;xx++)if(xx*xx+yy*yy<=2.2)p.set(Math.round(ix)+xx,Math.round(iy)+yy,INK);
    p.set(Math.round(ix)-1,Math.round(iy)-1,[255,255,255]);p.set(Math.round(ix),Math.round(iy)-1,[255,255,255]);p.set(Math.round(ix)+1,Math.round(iy)+1,[235,235,255]);
    if(V.lid>0){var lh=V.lid===1?2:3.5,lm=p.mask().add(em).and(rc(cx-6,cy-7,12,lh+1.5));
      var lb=lm.bits();for(var ly=0;ly<N;ly++)for(var lx=0;lx<N;lx++)if(lb[ly*N+lx]){p.set(lx,ly,sh(SK,.2));if(!(ly+1<N&&lb[(ly+1)*N+lx]))p.set(lx,ly,INK);}}
    /* brow */
    var by=cy-9+(si===0?-V.tilt:V.tilt)*0,s2=si===0?1:-1,tl=V.tilt*s2;
    var bc=lum>200?sh(HC,.9):sh(HC,.3);
    p.part(p.mask().add(pl([cx-5.8,by+1.2+tl*.6,cx-1,by-1.4+tl*.9,cx+5.8,by-.4-tl*1.1,cx+5.8,by+2-tl*1.1,cx-1,by+.8+tl*.8,cx-5.8,by+3.2+tl*.6])),bc,{ink:false,flat:true});
  });
  /* ----- nose ----- */
  var nrx=2.6+V.nose*2.6,nry=3+V.nose*2.6,nm=p.mask().add(ell(32,34.2,nrx,nry)),nb=nm.bits();
  p.part(nm,hl(SK,.1),{ink:false});
  for(y=0;y<N;y++)for(x=0;x<N;x++)if(nb[y*N+x]&&(!nb[(y+1)*N+x]||!nb[y*N+x+1])&&y>33)p.set(x,y,sh(SK,.95));
  p.set(Math.round(32-nrx*.45),Math.round(34.2+nry-1.2),INK);p.set(Math.round(32+nrx*.45),Math.round(34.2+nry-1.2),INK);
  p.set(Math.round(32-nrx*.5),Math.round(34.2-nry*.4),hl(SK,.6));
  /* ----- mouth ----- */
  var my=41.5,lip=[196,86,92];
  if(d.big||V.mouth===0){
    var mm=p.mask().add(pa(function(g){g.moveTo(24.5,my-1.5);g.quadraticCurveTo(32,my+9,39.5,my-1.5);}));
    p.part(mm,'#5a1620',{fn:function(x,y,c){if(y<=my+.2)return [250,250,240];if(y>=my+4)return [232,98,122];return null;}});
    for(x=25;x<=39;x++)p.set(x,my-2,INK);
  }else if(V.mouth===1){for(x=-7;x<=7;x++)p.set(32+x,Math.round(my+1.4-(x*x)/17),INK);p.set(25,my-1,INK);p.set(39,my-1,INK);for(x=-3;x<=3;x++)p.set(32+x,Math.round(my+2.4-(x*x)/14),lip);}
  else if(V.mouth===2){for(x=-5;x<=5;x++)p.set(32+x,Math.round(my+.5+(x>0?-(x/5)*2.4:0)),INK);p.set(38,my-2,INK);for(x=-2;x<=3;x++)p.set(32+x,my+1.8,lip);}
  else{for(x=-4;x<=4;x++)p.set(32+x,my,INK);for(x=-3;x<=3;x++)p.set(32+x,my+1,lip);for(x=-2;x<=2;x++)p.set(32+x,my+2,sh(lip,.4));}
  if(face==='mustache'){p.part(p.mask().add(pa(function(g){g.moveTo(32,37.4);g.quadraticCurveTo(25,35.5,20.5,41);g.quadraticCurveTo(27,41.5,32,39.8);g.quadraticCurveTo(37,41.5,43.5,41);g.quadraticCurveTo(39,35.5,32,37.4);})),HC,{cel:[30,38,3]});}
  if(face==='beard'||face==='stubble'){/* keep mouth readable */}
  if(face==='glitter'){var nl=['#ff3d9a','#35e0ff','#7dff4a','#ffd166','#b36bff','#ff9f1c'];for(i=0;i<9;i++)p.set(19+((i*7)%26),33+((i*5)%7),rgb(nl[i%6]));}
  /* ----- front hair ----- */
  var face_o=ell(32,29.5,13.6,10.2);
  function hairCap(r){return p.mask().add(ell(32,21,17.6+(r||0),15.4+(r||0))).and(rc(0,0,64,28)).sub(face_o);}
  if(hs==='bald'){p.set(25,12,[255,255,255]);p.set(26,11,[255,255,255]);p.set(27,11,[255,255,255]);p.set(24,13,hl(SK,.7));
    /* fringe at the sides */
    p.part(p.mask().add(ell(17.5,24,2.4,5)),HC,{ink:false});p.part(p.mask().add(ell(46.5,24,2.4,5)),HC,{ink:false});}
  else if(hs==='halfbald'){p.part(p.mask().add(ell(18.5,22,4.2,10)),HC,{});p.part(p.mask().add(ell(45.5,22,4.2,10)),HC,{});p.part(p.mask().add(ell(32,9.6,9,2.2)),HC,{ink:false,flat:true});p.set(26,13,[255,255,255]);p.set(27,12,[255,255,255]);}
  else if(hs==='curly'){var cm=p.mask();[[32,9,9],[22,12,7.5],[42,12,7.5],[15,19,6.5],[49,19,6.5],[27,6,6.5],[37,6,6.5],[14,27,5],[50,27,5]].forEach(function(c){cm.add(ell(c[0],c[1],c[2],c[2]*.92));});cm.sub(face_o);p.part(cm,HC,{cel:[30,18,8]});for(i=0;i<8;i++)p.set(20+i*3,9+(i%3)*3,hl(HC,.4));}
  else if(hs==='mohawk'){p.part(p.mask().add(pl([27,18,29,2,32,8,35,0,37,8,40,3,38,18])),HC,{cel:[32,10,4]});}
  else if(hs==='buzz'){p.part(hairCap(-1.2),HC,{flat:true,fn:function(x,y,c){return ((x+y)%2)?sh(HC,.25):c;}});}
  else{
    var cap=hairCap(0);
    if(hs==='bob'||hs==='long'){cap.add(pl([14,18,22,18,20,34,13,38]));cap.add(pl([50,18,42,18,44,34,51,38]));}
    p.part(cap,HC,{cel:[30,20,9]});
    /* fringe tufts along the hairline */
    var tf=hs==='long'||hs==='bob'?[[24,20],[29,19],[35,19],[40,20]]:[[22,19],[26,21],[31,19],[36,21],[41,19]];
    tf.forEach(function(t){p.part(p.mask().add(pl([t[0]-3,t[1]-3,t[0]+3,t[1]-3,t[0]+.5,t[1]+2.2])),HC,{ink:false,flat:true});});
    for(i=0;i<6;i++)p.set(22+i*4,11+((i*3)%4),hl(HC,.45));
  }
  if(hs==='long'||hs==='bob')p.part(p.mask().add(pl([6,50,13,34,17,34,15,56,6,60])),HC,{cel:[12,50,5]}),p.part(p.mask().add(pl([58,50,51,34,47,34,49,56,58,60])),HC,{cel:[52,50,5]});
  if(d.streak){p.part(p.mask().add(pl([21,14,25,14,24,34,20,34])),d.streak,{ink:false,flat:true});}
  /* ----- hats ----- */
  var hc=d.hatc||'#888888';
  if(ht==='cap'){p.part(p.mask().add(ell(32,16.5,17.4,12.4)).and(rc(0,0,64,23)),hc,{cel:[30,12,8]});p.part(p.mask().add(ell(30,22.4,20.5,3.2)),sh(rgb(hc),.2),{});p.set(31,11,[255,255,255]);p.set(32,11,[255,255,255]);p.set(31,12,[255,255,255]);}
  else if(ht==='beanie'){p.part(p.mask().add(ell(32,15.5,17.6,13.6)).and(rc(0,0,64,25)),hc,{cel:[30,12,8],fn:function(x,y,c){return (y<18&&x%4===0)?sh(rgb(hc),.25):null;}});p.part(p.mask().add(rc(14,17.6,36,7.4)),hl(rgb(hc),.18),{fn:function(x,y,c){return x%3===0?sh(rgb(hc),.3):null;}});p.part(p.mask().add(ell(32,3.8,4.3,4.3)),hl(rgb(hc),.5),{cel:[31,3,2]});}
  else if(ht==='bandana'){p.part(p.mask().add(pa(function(g){g.moveTo(14,24);g.quadraticCurveTo(32,10,50,24);g.lineTo(49,18);g.quadraticCurveTo(32,3,15,18);})),hc,{cel:[32,14,6],fn:function(x,y,c){return ((x*3+y*5)%9===0)?[255,255,255]:null;}});p.part(p.mask().add(pl([46,17,56,13,54,24,48,22])),hc,{});}
  else if(ht==='chef'){var cm2=p.mask();[[32,7,11,7],[20,11,8,7],[44,11,8,7],[26,3,8,6],[38,3,8,6]].forEach(function(c){cm2.add(ell(c[0],c[1],c[2],c[3]));});cm2.add(rc(18,12,28,8));p.part(cm2,'#f4f6fa',{cel:[34,12,7]});p.part(p.mask().add(rc(17,17,30,5)),'#e3e8f0',{fn:function(x,y,c){return y===19&&x%5===0?sh([230,235,245],.5):null;}});}
  else if(ht==='headphones'){p.part(p.mask().add(pa(function(g){g.ellipse(32,24,18.4,19.4,0,3.1416,6.2832);g.ellipse(32,24,15.6,16.6,0,6.2832,3.1416,true);})),'#16161e',{cel:[32,8,8]});
    p.part(p.mask().add(ell(13.6,31,4,7.6)),d.accc||'#35e0ff',{cel:[13,28,2]});p.part(p.mask().add(ell(50.4,31,4,7.6)),d.accc||'#35e0ff',{cel:[50,28,2]});p.set(12,28,[255,255,255]);p.set(49,28,[255,255,255]);}
  else if(ht==='beret'){p.part(p.mask().add(ell(31,14.4,18.6,7.6,-.12)),hc,{cel:[30,12,6]});p.part(p.mask().add(rc(31,5.6,2,2.4)),sh(rgb(hc),.4),{});p.part(p.mask().add(pa(function(g){g.moveTo(14,19);g.quadraticCurveTo(32,16,50,19);g.lineTo(50,22);g.quadraticCurveTo(32,19,14,22);})),sh(rgb(hc),.3),{ink:false,flat:true});}
  else if(ht==='sunhat'){p.part(p.mask().add(ell(32,18.4,30,6.2,-.04)),hc,{cel:[34,20,3]});p.part(p.mask().add(ell(32,11.6,15.4,10.4)).and(rc(0,0,64,18)),hc,{cel:[30,10,5]});p.part(p.mask().add(rc(17,14,30,3.6)),'#e5442f',{ink:false});p.part(p.mask().add(ell(32,18.4,30,6.2,-.04)).and(rc(0,19,64,8)),sh(rgb(hc),.18),{ink:false,flat:true,fn:function(x,y,c){return ((x+y)%3===0)?sh(rgb(hc),.45):null;}});}
  else if(ht==='bucket'){p.part(p.mask().add(pl([17,23,47,23,45,9,19,9])),hc,{cel:[30,12,6]});p.part(p.mask().add(ell(32,23,22.6,4.2)),sh(rgb(hc),.12),{});}
  /* ----- glasses ----- */
  if(face==='sunglasses'){var gy=V.ey-3.4;
    p.part(p.mask().add(pa(function(g){g.moveTo(17.5,gy);g.lineTo(46.5,gy);g.quadraticCurveTo(45,gy+9,40,gy+9);g.quadraticCurveTo(33.6,gy+9,32.6,gy+3);g.lineTo(31.4,gy+3);g.quadraticCurveTo(30.4,gy+9,24,gy+9);g.quadraticCurveTo(19,gy+9,17.5,gy);})),'#15151f',{ink:true,fn:function(x,y,c){return null;}});
    for(i=0;i<3;i++){p.set(20+i,gy+2+i,[170,200,255]);p.set(36+i,gy+2+i,[170,200,255]);}p.set(21,gy+5,[110,140,200]);p.set(37,gy+5,[110,140,200]);}
  else if(face==='glasses'){var gy2=V.ey;
    [32-V.gap,32+V.gap].forEach(function(cx){p.part(p.mask().add(ell(cx,gy2,6.1,5.9)).sub(ell(cx,gy2,4.5,4.3)),'#2a2230',{ink:false,flat:true});p.set(cx-3,gy2-3,[255,255,255]);p.set(cx-2,gy2-3,[220,235,255]);});
    p.rect(Math.round(32-V.gap+6),gy2-1,Math.round(V.gap*2-12),2,[42,34,48]);}
  return p.out();
}

var cache={};
function drawPortrait2(d){var k=(d.id||'')+'|'+d.cls+'|'+d.skin+'|'+d.hair+'|'+d.hairc+'|'+d.top+'|'+d.topc+'|'+d.top2+'|'+d.hat+'|'+d.hatc+'|'+d.face+'|'+d.acc+'|'+d.big+'|'+d.pierce+'|'+d.streak;
  if(cache[k])return cache[k];var u;try{u=make(d);}catch(e){console.warn('portrait',e);u=null;}
  if(!u&&typeof window.__oldPortrait==='function')u=window.__oldPortrait(d);
  return cache[k]=u||'';}
window.mfbPortrait=drawPortrait2;
if(typeof window.drawPortrait==='function'&&!window.__oldPortrait)window.__oldPortrait=window.drawPortrait;
window.drawPortrait=drawPortrait2;
/* the game caches portraits by a short key: drop whatever the old art left in there */
try{var AV=(0,eval)('AVC');if(AV)for(var kk in AV)delete AV[kk];}catch(e){}

/* ================= the stall card ================= */
(function(){
  var lk=document.createElement('link');lk.rel='stylesheet';
  lk.href='https://fonts.googleapis.com/css2?family=Bangers&family=Bungee+Inline&family=Luckiest+Guy&family=Lilita+One&family=Patrick+Hand&display=swap';
  document.head.appendChild(lk);
  var css=[
  /* avatars: transparent, no box (small ones keep a soft dark tile so they still read) */
  '.av{image-rendering:auto;background:linear-gradient(#2b2b44,#3a3a5c)}',
  '#spc .cw{position:relative;width:132px!important;height:132px!important;background:none!important;border:0!important;overflow:visible!important;align-items:flex-end}',
  '#spc .cw::after{content:"";position:absolute;left:12%;right:12%;bottom:-3px;height:12px;background:radial-gradient(ellipse at center,rgba(0,0,0,.55),transparent 70%);z-index:0}',
  '#spc .ca{position:relative;z-index:1}',
  '#spc .ca .av{width:128px!important;height:128px!important;border:0!important;background:none!important;image-rendering:pixelated;filter:drop-shadow(0 0 7px color-mix(in srgb,var(--c1,#ff8a3d) 70%,transparent)) drop-shadow(2px 3px 0 rgba(0,0,0,.55))}',
  '#spc .cp{right:-4px!important;top:-2px!important;font-size:26px!important;z-index:2;filter:drop-shadow(0 0 6px var(--c1,#ff8a3d)) drop-shadow(2px 2px 0 #000)}',
  /* title: neon arcade lettering */
  '#spc .ct b.px{font-family:"Bungee Inline","Press Start 2P",Impact,sans-serif!important;font-size:19px!important;letter-spacing:.04em;color:#fff;text-shadow:0 0 3px #fff,0 0 9px var(--c1,#ff8a3d),0 0 22px var(--c1,#ff8a3d),0 0 40px var(--c1,#ff8a3d),3px 3px 0 #14091f;animation:spglow 2.8s ease-in-out infinite alternate}',
  '#spc .ct .m{font-family:"Lilita One","Patrick Hand",sans-serif;letter-spacing:.12em;text-transform:uppercase;font-size:11px;color:#ffe9a8;text-shadow:0 0 8px rgba(255,200,90,.7),1px 1px 0 #14091f;opacity:1}',
  '@keyframes spglow{from{text-shadow:0 0 3px #fff,0 0 8px var(--c1,#ff8a3d),0 0 18px var(--c1,#ff8a3d),0 0 30px var(--c1,#ff8a3d),3px 3px 0 #14091f}to{text-shadow:0 0 4px #fff,0 0 12px var(--c1,#ff8a3d),0 0 28px var(--c1,#ff8a3d),0 0 52px var(--c1,#ff8a3d),3px 3px 0 #14091f}}',
  /* vendor name: adventure-game dialogue colour with a thick ink outline */
  '#spc .cw+div>b{display:block;font-family:"Luckiest Guy","Bangers",Impact,sans-serif!important;font-weight:400;font-size:25px;line-height:1;letter-spacing:.03em;color:color-mix(in srgb,var(--c1,#ff8a3d) 55%,#fff);-webkit-text-stroke:3px #14091f;paint-order:stroke fill;text-shadow:0 0 10px var(--c1,#ff8a3d),0 0 22px var(--c1,#ff8a3d),3px 4px 0 #14091f;transform:rotate(-1.5deg);transform-origin:0 100%;margin-bottom:3px}',
  '#spc .cw+div>.m{display:inline-block;font-family:"Lilita One",sans-serif;font-size:13px;letter-spacing:.06em;color:#ffe9a8;text-shadow:0 0 8px rgba(255,200,90,.75),2px 2px 0 #14091f;opacity:1}',
  '#spc .mood{font-family:"Patrick Hand",sans-serif;font-size:14px!important;color:#b8ffd8;text-shadow:0 0 8px rgba(90,255,170,.6),1px 1px 0 #14091f;opacity:1!important;margin-top:4px!important}',
  /* the message: no box, glowing comic lettering */
  '#spc .bub{position:relative;background:none!important;border:0!important;padding:8px 4px 4px 22px!important;margin:10px 0 4px!important;min-height:52px;color:#fff!important;font-family:"Bangers",Impact,sans-serif!important;font-size:27px!important;letter-spacing:.07em;line-height:1.06!important;-webkit-text-stroke:3px #14091f;paint-order:stroke fill;text-shadow:0 0 10px var(--c1,#ff8a3d),0 0 24px var(--c1,#ff8a3d),0 0 46px var(--c1,#ff8a3d),3px 4px 0 #14091f;animation:qfloat 3.4s ease-in-out infinite alternate}',
  '#spc .bub::before{content:"\\201C"!important;position:absolute!important;left:-2px!important;top:-12px!important;border:0!important;font-family:"Luckiest Guy",serif;font-size:54px;line-height:1;color:var(--c1,#ff8a3d);-webkit-text-stroke:3px #14091f;text-shadow:0 0 14px var(--c1,#ff8a3d)}',
  '@keyframes qfloat{from{transform:translateY(0) rotate(-.6deg)}to{transform:translateY(-3px) rotate(.4deg)}}',
  '#spc .bub i{font-style:normal;display:inline-block;animation:qpop .26s cubic-bezier(.2,1.7,.4,1) both;animation-delay:calc(var(--i)*24ms)}',
  '#spc .bub .w{display:inline-block;white-space:nowrap}',
  '@keyframes qpop{from{opacity:0;transform:translateY(10px) scale(.2) rotate(-12deg)}to{opacity:1;transform:none}}',
  /* the tagline (story) and the sticker chips */
  '#spc .bio{position:relative;font-family:"Patrick Hand","Comic Sans MS",cursive!important;font-size:15px!important;line-height:1.25!important;color:#efe9ff;padding:2px 2px 2px 12px;margin:4px 0 8px!important;text-shadow:0 0 9px rgba(190,160,255,.55),1px 1px 0 #14091f}',
  '#spc .bio::before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:4px;border-radius:3px;background:var(--c1,#ff8a3d);box-shadow:0 0 10px var(--c1,#ff8a3d)}',
  '#spc .chips span{font-family:"Bungee Inline","Lilita One",sans-serif!important;font-size:10px!important;letter-spacing:.06em;color:#fff;padding:3px 8px!important;border:2px solid var(--c1,#ff8a3d)!important;border-radius:4px!important;background:rgba(0,0,0,.25);text-shadow:0 0 6px var(--c1,#ff8a3d);box-shadow:0 0 8px color-mix(in srgb,var(--c1,#ff8a3d) 60%,transparent),inset 0 0 6px color-mix(in srgb,var(--c1,#ff8a3d) 35%,transparent)}',
  '@media (prefers-reduced-motion:reduce){#spc .bub,#spc .ct b.px,#spc .bub i{animation:none!important}}'
  ].join('\n');
  var st=document.createElement('style');st.id='portrait-css';st.textContent=css;document.head.appendChild(st);

  /* typewriter pop-in when the vendor says something new */
  function fx(q){var raw=q.textContent;if(!raw||q.dataset.raw===raw)return;q.dataset.raw=raw;
    var words=raw.split(' '),n=0,h='';
    words.forEach(function(w,wi){h+='<span class="w">';for(var k=0;k<w.length;k++){h+='<i style="--i:'+(n++)+'">'+w.charAt(k).replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</i>';}h+='</span>'+(wi<words.length-1?' ':'');});
    q.innerHTML=h;}
  function scan(){var q=document.getElementById('spq');if(q)fx(q);}
  var host=document.getElementById('spn');
  if(host)new MutationObserver(function(){scan();}).observe(host,{childList:true,subtree:true,characterData:true});
})();
})();
