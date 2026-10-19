/* Pixel-art scenes (Day of the Tentacle / Monkey Island inspired), drawn procedurally on a 120x180 canvas.
   MFScenes.apply(tod) renders the five scenes for 'day' or 'night' and publishes them as CSS variables:
   --sc-tb (market) --sc-tq (Ribeira bridge) --sc-tn (club) --sc-ta (stage) --sc-tm (Douro quay) */
(function(){
const W=120,H=180;
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function mk(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g];}
const R=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
const P=(g,c,x,y)=>R(g,c,x,y,1,1);
const BAY=[.12,.62,.87,.37];
let FR=0; // animation frame 0-3: twinkle, shimmer, sway, flicker
let CUR='day',SK={q:5,ss:0};
// the sun follows the clock: 10 steps along an arc from morning to late afternoon, then a 5-stage sunset in the last hour before closing
const SUNSKY=[['#4d8fd0','#e9b27a','#ffd08a','#ffe2a0'],['#5a7fc0','#f09a62','#ffb56a','#ffd08a'],['#5a68b0','#e0705a','#ff9a55','#ffc06a'],['#3f4a98','#b8527a','#f2704f','#ff9a4f'],['#1f2766','#6a3a88','#c04f6a','#ff7a4a']];
function curKey(){try{if(typeof S==='undefined'||!S||(S.ph!=='day'&&S.ph!=='setup'))return{q:5,ss:0};const h=S.t/60,cl=(typeof CLOSE==='number'?CLOSE:20);if(h>=cl-1)return{q:9,ss:Math.max(1,Math.min(5,1+Math.floor((h-(cl-1))*5)))};return{q:Math.max(0,Math.min(9,Math.floor((h-9)/(cl-10)*10))),ss:0};}catch(e){return{q:5,ss:0};}}
const kk=k=>k.ss?'s'+k.ss:'q'+k.q;
function hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}
// vertical gradient with ordered dithering between the stops (the classic adventure-game sky)
function grad(g,stops,y0,y1){if(y0===0&&CUR==='day'&&SK.ss)stops=SUNSKY[SK.ss-1];const n=stops.length-1,col=stops.map(hex);const im=g.createImageData(W,y1-y0);
  for(let y=0;y<y1-y0;y++){const t=y/(y1-y0-1)*n,i=Math.min(n-1,Math.floor(t)),f=t-i;for(let x=0;x<W;x++){const th=BAY[(x&1)+((y&1)<<1)],c=f>th?col[i+1]:col[i],k=(y*W+x)*4;im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=255;}}
  g.putImageData(im,0,y0);}
function stars(g,r,n,ymax){for(let i=0;i<n;i++){const x=r()*W|0,y=r()*ymax|0,b=r();P(g,((i+FR)%4===0)?'#4a5090':(b>.8?'#ffffff':b>.4?'#cfd6ff':'#8a93d6'),x,y);if(b>.93&&(i+FR)%4!==0){P(g,'#9aa6ff',x-1,y);P(g,'#9aa6ff',x+1,y);P(g,'#9aa6ff',x,y-1);P(g,'#9aa6ff',x,y+1);}}}
function disc(g,c,cx,cy,r){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.6)P(g,c,cx+x,cy+y);}
function glow(g,rgb,cx,cy,r,a){for(let k=r;k>0;k-=2){g.fillStyle='rgba('+rgb+','+(a*(1-k/r)+.02)+')';for(let y=-k;y<=k;y++)for(let x=-k;x<=k;x++)if(x*x+y*y<=k*k&&((x+y)&1)==0)g.fillRect(cx+x,cy+y,1,1);}}
function sun(g,tod,x,y){if(tod==='day'){const s=SK.ss,q=SK.q,sx=s?92+s*4:12+(q+.5)*8.4,sy=s?[72,76,81,87,93][s-1]:80-62*Math.sin(Math.PI*(q+.5)/10);
    const gc=s?['255,200,120','255,170,90','255,130,70','255,90,70','255,70,80'][s-1]:'255,230,150',d1=s?['#ffe9a0','#ffd080','#ffb060','#ff8050','#ff5a55'][s-1]:'#fff3b0',d2=s?['#ffd860','#ffb040','#ff9040','#ff6040','#e03a50'][s-1]:'#ffe27a';
    glow(g,gc,sx,sy,s?26+s*2:22,s?.4:.3);disc(g,d1,sx,sy,s?7:6);disc(g,d2,sx,sy,s?5:4);}else{glow(g,'190,205,255',x,y,16,.25);disc(g,'#f4f1dc',x,y,5);P(g,'#cfcdb8',x-2,y-1);P(g,'#cfcdb8',x+1,y+2);P(g,'#cfcdb8',x+2,y-2);}}
function clouds(g,r,tod,n,ymax){const c=tod==='day'?['#ffffff','#dcebf7']:['#2c3566','#1d2550'];for(let i=0;i<n;i++){const x=r()*W|0,y=8+r()*ymax|0,w=10+r()*16|0;R(g,c[0],x,y,w,2);R(g,c[0],x+3,y-1,w-8,1);R(g,c[1],x+1,y+2,w-3,1);}}
const LET={H:['101','101','111','101','101'],A:['010','101','111','101','101'],R:['110','101','110','101','101'],D:['110','101','101','101','110'],C:['011','100','100','100','011'],L:['100','100','100','100','111'],U:['101','101','101','101','111'],B:['110','101','110','101','110']};
function word(g,s,x,y,c,sc){let cx=x;for(const ch of s){const m=LET[ch];if(!m){cx+=3*sc;continue;}for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(m[j][i]==='1')R(g,c,cx+i*sc,y+j*sc,sc,sc);cx+=4*sc;}return cx;}
// a coloured Porto house: walls, tiled roof, windows, shutters, optional blue azulejo
function house(g,r,tod,x,y,w,h,wall,roof,opt){opt=opt||{};const night=tod==='night';
  R(g,wall,x,y,w,h);R(g,'rgba(0,0,0,.18)',x+w-2,y,2,h);
  if(opt.tile){for(let j=0;j<h;j++)for(let i=0;i<w-2;i++)if(((i>>1)+(j>>1))%2===0)P(g,night?'#3a5a8a':'#5f8fd0',x+i,y+j);}
  const rh=Math.max(3,Math.round(w/4));for(let k=0;k<rh;k++)R(g,roof,x-1+k,y-rh+k,w+2-2*k,1);R(g,'rgba(0,0,0,.25)',x-1,y-1,w+2,1);
  const cols=Math.max(1,Math.floor((w-2)/5)),rows=Math.max(1,Math.floor((h-4)/7));
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const wx=x+2+i*5,wy=y+3+j*7,lit=night&&r()>.35;R(g,opt.sh||'#2d6a4f',wx-1,wy,1,4);R(g,opt.sh||'#2d6a4f',wx+2,wy,1,4);R(g,lit?'#ffd36a':(night?'#1a2040':'#9fd0e8'),wx,wy,2,4);if(lit)glow(g,'255,200,90',wx+1,wy+2,4,.12);}
  if(opt.door)R(g,'#3b2a20',x+(w>>1)-1,y+h-5,3,5);}
function cobbles(g,r,tod,y0,base){const a=tod==='day'?['#8c7b6a','#a8957f','#6f5f52']:['#1d1b2a','#2a2740','#14121f'];R(g,base||a[0],0,y0,W,H-y0);
  for(let y=y0;y<H;y+=3){const off=((y-y0)/3|0)%2*3;for(let x=-off;x<W;x+=6){R(g,r()>.5?a[1]:a[2],x+1,y,4,1);}}for(let i=0;i<30;i++)P(g,a[1],r()*W|0,y0+r()*(H-y0)|0);}
function lamp(g,tod,x,y,h){const lit=tod==='night'||(SK.ss>=4);R(g,'#22222c',x,y,1,h);R(g,'#22222c',x-1,y,3,1);R(g,lit?'#ffe9a8':'#cfd3da',x-1,y-3,3,3);if(lit)glow(g,'255,220,140',x,y-2,11,.22+.08*((FR+x)%2));}
function bunting(g,r,x0,x1,y,sag){const cs=['#e5442f','#f2c94c','#2fbf71','#35b6ff','#ec5fa3'];let k=0;for(let x=x0;x<=x1;x++){const t=(x-x0)/(x1-x0),yy=y+Math.round(Math.sin(t*Math.PI)*sag);P(g,'#2a2230',x,yy);if((x-x0)%5===2){const c=cs[k++%cs.length];R(g,c,x-1,yy+1,3,1);R(g,c,x,yy+2,1,2);}}}
function crowd(g,r,y,color,n,hands){for(let i=0;i<n;i++){const x=(i*(W/n)-3+r()*5)|0,hh=4+r()*4|0;R(g,color,x-1,y-hh+3,9,hh+40);R(g,color,x+1,y-hh-1,5,5);if(hands&&r()>.5){const up=4+(r()*5|0)+((FR+i)%2);R(g,color,x-1,y-hh-up,1,up+3);P(g,color,x-2,y-hh-up-1);if(r()>.5){R(g,color,x+7,y-hh-up+1,1,up+2);P(g,color,x+8,y-hh-up);}}}}
function people(g,x,y,c){R(g,c,x,y-6,3,6);R(g,c,x,y-9,3,3);R(g,'#e6b48c',x,y-9,3,2);}

/* ---------- 1 - the market: Mercado Ferreira Borges, iron and glass ---------- */
function market(tod){const r=rng(11),[c,g]=mk(),night=tod==='night';
  grad(g,night?['#070b20','#16205a','#3a3678','#8a5a7a']:['#3d92dc','#79bdf0','#b9e0f7','#fbe7b4'],0,100);
  if(night)stars(g,r,60,60);else clouds(g,r,tod,5,30);sun(g,tod,night?92:22,night?18:20);if(!night)clouds(g,r,tod,3,22);
  // far Porto rooftops
  for(let i=0;i<9;i++){const x=i*14-4,h=10+r()*14|0;R(g,night?'#1b2150':'#7f9fcc',x,92-h,13,h+10);for(let k=0;k<4;k++)P(g,night?'#2a3170':'#9ab4dc',x+2+k*3,92-h+2+(k%2)*3);}
  // the hall
  const wall=night?'#5b5478':'#e0cfa6',sh=night?'#443e62':'#b9a57c',tr=night?'#2c2744':'#876c46';
  R(g,wall,10,56,100,54);R(g,sh,10,56,100,2);R(g,sh,10,108,100,2);
  R(g,wall,40,44,40,14);for(let k=0;k<9;k++)R(g,wall,40+k,35+k*1,40-2*k,1);R(g,sh,40,57,40,1);
  R(g,night?'#2a2744':'#cdb78a',56,42,8,7);R(g,'#f6efd8',57,43,6,5);P(g,'#222',60,45);P(g,'#222',60,44);P(g,'#222',61,45); // clock
  // iron-and-glass dome
  for(let k=0;k<12;k++)R(g,night?'#3d4a86':'#6aa6c8',48+k,28+(11-k),24-2*k,1);R(g,tr,48,38,24,1);for(let i=0;i<6;i++)R(g,tr,50+i*4,29+(i<3?i:5-i)*0+1,1,9);
  if(night)glow(g,'255,210,120',60,34,14,.22);
  // arched windows and columns
  for(let i=0;i<8;i++){const x=16+i*11;R(g,sh,x-1,62,9,44);R(g,night?'#ffd072':'#8cc6e8',x,64,7,42);for(let k=0;k<3;k++)R(g,night?'#ffd072':'#8cc6e8',x+k+1,62-k+1,5-2*k,1);R(g,tr,x+3,64,1,42);R(g,tr,x,76,7,1);R(g,tr,x,90,7,1);if(night)glow(g,'255,200,100',x+3,84,9,.12);}
  R(g,tr,8,110,104,3);
  // square + cobbles
  cobbles(g,r,tod,113);
  for(let i=0;i<5;i++)P(g,'#ffffff',10+r()*100|0,116+r()*8|0);
  // stalls with striped awnings
  const aw=[['#e5442f','#ffffff'],['#f2c94c','#ffffff'],['#2fbf71','#ffffff'],['#35b6ff','#ffffff']];
  aw.forEach((a,i)=>{const x=6+i*28;R(g,'#4a3a2a',x+1,134,1,28);R(g,'#4a3a2a',x+22,134,1,28);R(g,night?'#2c2438':'#a8855b',x+2,148,20,14);
    for(let k=0;k<22;k+=3){R(g,a[0],x+k,128,3,6);R(g,a[1],x+k+1,128,2,6);}for(let k=0;k<22;k+=3)R(g,a[k%6?0:1],x+k,134,3,2);
    for(let k=0;k<6;k++)R(g,['#e5442f','#f2c94c','#2fbf71','#ec5fa3','#35b6ff','#ff9a3c'][(k+i)%6],x+3+k*3,144,2,3);
    people(g,x+10,166,['#2d5f9a','#a33a3a','#4a7c3a','#7a4a9a'][i]);if(night)glow(g,'255,214,130',x+11,134,12,.22);});
  bunting(g,r,0,119,118,5+(FR%2));lamp(g,tod,4,150,28);lamp(g,tod,115,150,28);
  // pigeons
  for(const x of [30,64,92]){R(g,'#8f95a3',x,174+((FR+x)%2),3,2);P(g,'#5d6272',x+3,173+((FR+x)%2));}
  return c;}

/* ---------- 2 - Ribeira: Dom Luis I bridge over the Douro ---------- */
function ribeira(tod){const r=rng(23),[c,g]=mk(),night=tod==='night';
  grad(g,night?['#0a0d2a','#1c2766','#5b3f86','#d06a6a']:['#ff9a62','#ffc27a','#ffe4a8','#bfe3f0'],0,96);
  if(night)stars(g,r,45,50);else clouds(g,r,tod,5,34);sun(g,tod,night?24:84,night?20:70);
  // hillsides
  for(let i=0;i<16;i++){const x=i*8-2,h=14+(i%4)*5+r()*6|0,ws=['#e8c07a','#d9805f','#7fb8a4','#e5d6a8','#c76a5a','#9fb6d9'];house(g,r,tod,x,100-h,8,h+10,ws[(i*3)%6],night?'#5a2a3a':'#b5502f',{sh:i%2?'#2d6a4f':'#2a4a8f',tile:i%5===2});}
  for(let i=0;i<8;i++){const x=70+i*7;house(g,r,tod,x,60+i*3,7,34-i*3,['#e8c07a','#d9805f','#7fb8a4','#e5d6a8'][i%4],night?'#5a2a3a':'#b5502f',{sh:'#2a4a8f'});}
  // Dom Luis I: double deck iron arch
  const ar=night?'#10122a':'#2d3a4f',ax0=2,ax1=118,deck=38,low=74;
  for(let x=ax0;x<=ax1;x++){const t=(x-60)/58,yy=Math.round(low-(1-t*t)*34);R(g,ar,x,yy,1,2);if((x%6)===0&&yy<low-1)R(g,ar,x,yy,1,low-yy);}
  R(g,ar,0,deck,W,2);R(g,ar,0,low,W,2);for(let x=0;x<W;x+=4)R(g,ar,x,deck+2,1,3);
  for(let x=3;x<W;x+=9)if(night&&(x/9+FR)%3!==0){P(g,'#ffd36a',x,deck-1);}
  if(!night){R(g,'#d6402f',44,deck-3,9,3);R(g,'#2d3a4f',46,deck-4,5,1);} // metro tram
  // river
  grad(g,night?['#0d1233','#101a4a','#0a0f30']:['#e8a76a','#5a9bc4','#2f6f9a'],104,H);
  for(let y=106;y<H;y+=3)for(let x=((y*7+FR*3)%13);x<W;x+=11){R(g,night?'#3a4690':'#bfe6f5',x,y,3+((x+y)%3),1);}
  if(!night)for(let y=104;y<140;y+=2)R(g,'rgba(255,230,160,.5)',74+((y*3)%7)-3,y,6-(y-104)/8|0,1);else for(let y=106;y<150;y+=2)R(g,'rgba(255,220,150,.35)',20+((y*5+FR)%5),y,2,1);
  // rabelo boat
  const bx=34,by=132+(FR%2);R(g,'#5b3a24',bx,by+6,34,5);R(g,'#7a4e30',bx+2,by+4,30,3);R(g,'#2a1a12',bx,by+10,34,1);R(g,'#5b3a24',bx+30,by+1,6,4);R(g,'#3b2a1a',bx+14,by-22,1,26);for(let k=0;k<18;k++)R(g,night?'#bdb7a0':'#f2ead2',bx+15,by-22+k,Math.min(14,k*.8+2),1);
  for(let i=0;i<6;i++)R(g,'#7a4a2a',bx+2+i*5,by+1,4,3);
  // quay
  cobbles(g,r,tod,160);R(g,night?'#1a1830':'#6d5f55',0,158,W,3);lamp(g,tod,12,164,18);lamp(g,tod,104,164,18);people(g,60,176,night?'#6a5a9a':'#a33a3a');
  return c;}

/* ---------- 3 - the club: Hard Club entrance ---------- */
function club(tod){const r=rng(37),[c,g]=mk(),night=tod==='night';
  grad(g,night?['#06081c','#12184a','#2a2060','#5a2f6a']:['#4aa0e0','#86c6f0','#bfe3f5','#f9e5b0'],0,70);
  if(night){stars(g,r,50,40);sun(g,tod,100,16);}else{clouds(g,r,tod,5,26);sun(g,tod,20,16);}
  // neighbours
  house(g,r,tod,-4,50,24,110,night?'#6b4a5a':'#d9a98a',night?'#2a1a2a':'#9a4a3a',{sh:'#1d3a6a',tile:true});house(g,r,tod,100,46,24,120,night?'#4a5a7a':'#a8c2d8',night?'#2a1a2a':'#9a4a3a',{sh:'#1d3a6a'});
  // main brick facade with a great arch
  R(g,night?'#3a2a3a':'#a8563f',24,40,76,122);for(let y=40;y<162;y+=3)for(let x=24+((y/3|0)%2)*3;x<100;x+=6)R(g,night?'#2a1c2a':'#8a4531',x,y,5,1);
  R(g,night?'#22182a':'#6d3626',24,40,76,3);R(g,night?'#22182a':'#6d3626',22,38,80,3);
  // sign board
  R(g,'#0b0b14',26,50,72,16);R(g,night?'#1b1b30':'#2a2a3c',27,51,70,14);
  if(night){glow(g,'255,40,90',46,58,22,.18);glow(g,'60,220,255',78,58,22,.18);}
  word(g,'HARD',31,55,night?(FR===2?'#b02a45':'#ff3355'):'#6a3040',2);word(g,'CLUB',63,55,night?(FR===3?'#2a8aa0':'#35e0ff'):'#2f5a6a',2);
  // arch door
  R(g,'#10101a',48,84,28,78);for(let k=0;k<14;k++)R(g,'#10101a',48+k*0,72+k,28,1);R(g,'#10101a',51,74,22,10);R(g,'#10101a',54,71,16,3);
  R(g,night?'#ffb23c':'#3b2a20',52,90,20,72);if(night)glow(g,'255,170,70',62,126,22,.28);for(let k=0;k<7;k++)R(g,'rgba(0,0,0,.35)',52+k*3,90,1,72);
  R(g,'#2a1a14',61,90,2,72);R(g,'#ffd36a',59,128,1,3);R(g,'#ffd36a',64,128,1,3);
  // posters
  [[28,92,'#ec5fa3'],[28,116,'#35b6ff'],[86,96,'#f2c94c'],[86,122,'#9b6bff']].forEach(([x,y,col])=>{R(g,col,x,y,8,12);R(g,'#10101a',x+1,y+2,6,1);R(g,'#10101a',x+1,y+5,4,1);});
  // lamps and the queue
  lamp(g,tod,20,142,20);lamp(g,tod,104,142,20);
  cobbles(g,r,tod,150);
  if(night){const ra=rng(500+FR*7);for(let i=0;i<80;i++){const x=ra()*W|0,y=ra()*H|0;R(g,'rgba(170,190,255,.32)',x,y,1,3);P(g,'rgba(170,190,255,.2)',x-1,y+3);}for(let k=0;k<12;k++)R(g,ra()>.5?'rgba(255,60,120,.32)':'rgba(60,200,255,.32)',20+ra()*80|0,152+k*2,6+ra()*10|0,1);}
  [[44,168,'#2a2a3c'],[38,172,'#7a3a6a'],[32,170,'#3a5a8a'],[88,168,'#8a3a3a'],[94,172,'#2a6a5a'],[100,170,'#5a3a8a']].forEach(([x,y,col])=>people(g,x,y,col));
  R(g,'#10101a',70,158,4,14);R(g,'#10101a',70,154,4,4);R(g,'#e6b48c',71,155,2,2);R(g,'#f2c94c',70,160,4,1); // bouncer
  return c;}

/* ---------- 4 - the stage: lights, truss, crowd ---------- */
function stage(tod){const r=rng(51),[c,g]=mk(),night=tod==='night';
  grad(g,night?['#050510','#0d0a26','#2a1458','#46207a']:['#2a2a3a','#3c3c52','#5a5a70'],0,H);
  // haze dither
  for(let y=0;y<H;y+=2)for(let x=(y>>1)%2;x<W;x+=2)if(r()>.9)P(g,night?'rgba(140,120,220,.3)':'rgba(255,255,255,.12)',x,y);
  // truss
  R(g,'#2b2b3a',0,10,W,3);R(g,'#1c1c28',0,13,W,1);for(let x=0;x<W;x+=4){P(g,'#3a3a4e',x,11);R(g,'#1c1c28',x,14,1,2);}
  // light beams
  const bm=night?[['255,60,140',14],['60,220,255',38],['255,220,80',62],['150,90,255',86],['60,255,160',108]]:[['255,240,200',30],['255,240,200',90]];
  bm.forEach(([rgb,x],i)=>{const tx=(night?x+(i%2?-18:18):x+(i?-10:10))+Math.round(Math.sin((FR+i)*1.57)*8);for(let y=16;y<110;y++){const t=(y-16)/94,w=2+t*(night?16:22),cx=x+(tx-x)*t;for(let k=-w;k<=w;k+=1){g.fillStyle='rgba('+rgb+','+(.22*(1-t*.5))+')';g.fillRect(cx+k,y,1,1);}}
    R(g,'#111118',x-2,15,5,4);R(g,'rgba('+rgb+',1)',x-1,19,3,1);});
  // back wall: speaker stacks and logo screen
  [[6,50],[96,50]].forEach(([x,y])=>{R(g,'#14141c',x,y,18,56);for(let j=0;j<4;j++){disc(g,'#2a2a3a',x+9,y+8+j*13,4);disc(g,'#10101a',x+9,y+8+j*13,2);}});
  R(g,'#0b0b14',32,34,56,34);R(g,night?'#1b1030':'#2a2a3a',33,35,54,32);
  word(g,'HARD',38,44,night?'#ff3355':'#555',3);word(g,'CLUB',38,56,night?'#35e0ff':'#555',2);
  if(night)glow(g,'255,50,130',60,52,30,.12);
  // platform
  R(g,'#1d1b2a',0,106,W,8);R(g,'#2d2a40',0,106,W,2);R(g,'#10101a',0,114,W,3);
  // drum kit
  R(g,'#2a2a3a',30,92,4,14);disc(g,'#c8a24a',32,90,5);disc(g,'#e5442f',54,100,6);disc(g,'#c8a24a',72,92,4);R(g,'#444',32,96,1,10);R(g,night?'#ffe27a':'#aaa',24,86,8,1);
  people(g,52,98,'#10101a');
  // singer at the mic
  R(g,'#10101a',86,84,5,22);R(g,'#10101a',86,78,5,6);R(g,'#10101a',92,80,1,10);R(g,'#10101a',88,76,1,2);R(g,'#10101a',92,84,3,1);R(g,'#10101a',94,80,1,5);
  if(night){P(g,'#ff9ac0',90,80);glow(g,'255,120,170',88,92,18,.2);}
  // lamp rig under truss (day soundcheck: flight cases)
  if(!night){R(g,'#5a4a3a',10,98,14,8);R(g,'#5a4a3a',100,96,12,10);R(g,'#8a7a5a',10,98,14,1);}
  // crowd, three rows
  crowd(g,r,140,night?'#1a1030':'#34344a',17,night);crowd(g,r,154,night?'#0e0a22':'#2e2e42',15,night);crowd(g,r,168,night?'#07050f':'#26263a',13,night);crowd(g,r,H+4,night?'#030308':'#1c1c2a',11,night);
  return c;}

/* ---------- 5 - the Douro quay: Gaia lodges, rabelo boats, barrels ---------- */
function quay(tod){const r=rng(67),[c,g]=mk(),night=tod==='night';
  grad(g,night?['#070a24','#1a2468','#4a3a86','#e08a6a']:['#5aa8e8','#9dd2f2','#ffe0a0','#ffb872'],0,80);
  if(night)stars(g,r,40,40);else clouds(g,r,tod,4,28);sun(g,tod,night?96:30,night?24:66);
  // Vila Nova de Gaia lodges
  for(let i=0;i<7;i++){const x=i*18-6,h=20+(i%3)*8;house(g,r,tod,x,86-h,18,h+14,['#f0e2c0','#e8c07a','#f6efd8','#d9a98a'][i%4],night?'#4a2030':'#b5502f',{sh:'#2a4a8f',door:true});}
  R(g,night?'#d8c9a0':'#fff',0,76,W,0);
  for(let i=0;i<4;i++)R(g,night?'#bdb7a0':'#ffffff',6+i*30,52+(i%2)*8,10,4); // signboards (blank, no brands)
  // river
  grad(g,night?['#0b1032','#121c58','#0a1034']:['#ffb872','#5a9ac4','#2d6a96'],98,H);
  for(let y=100;y<H;y+=3)for(let x=((y*5+FR*2)%11);x<W;x+=9)R(g,night?'#3a4690':'#cfeaf6',x,y,2+((x+y)%4),1);
  if(night)for(let y=100;y<150;y+=2)R(g,'rgba(255,230,160,.4)',92+((y*7)%5)-2,y,3,1);else for(let y=100;y<150;y+=2)R(g,'rgba(255,225,150,.55)',26+((y*3)%5),y,8-(y-100)/8|0,1);
  // two rabelo boats
  [[8,124+(FR%2),1],[64,142+((FR+1)%2),.9]].forEach(([bx,by,s])=>{const L=Math.round(40*s);R(g,'#5b3a24',bx,by+6,L,5);R(g,'#7a4e30',bx+2,by+4,L-4,3);R(g,'#2a1a12',bx,by+10,L,1);R(g,'#5b3a24',bx+L-4,by,6,6);R(g,'#3b2a1a',bx+L/2-4,by-24,1,28);
    for(let k=0;k<20;k++)R(g,night?'#bdb7a0':'#f4ecd4',bx+L/2-3,by-24+k,Math.min(16,k*.8+2),1);for(let i=0;i<5;i++){R(g,'#7a4a2a',bx+3+i*6,by+1,5,4);R(g,'#2a1a12',bx+3+i*6,by+2,5,1);}});
  // quayside with barrels
  cobbles(g,r,tod,164);R(g,night?'#1a1830':'#6d5f55',0,162,W,3);
  for(const x of [8,18,98,108]){R(g,'#8a5a2f',x,168,8,10);R(g,'#2a1a12',x,170,8,1);R(g,'#2a1a12',x,175,8,1);R(g,'#b07a42',x+1,168,2,10);}
  lamp(g,tod,60,170,16);people(g,40,176,night?'#6a5a9a':'#2d5f9a');people(g,48,176,night?'#9a5a6a':'#e5c24a');
  return c;}

const SC={tb:market,tq:ribeira,tn:club,ta:stage,tm:quay};
const cache={};let curTod='day',fr=0,tm=0;
function render(id,tod,f,k){FR=f;CUR=tod;SK=k||curKey();try{const c=SC[id](tod);if(tod==='day'&&SK.ss){const g=c.getContext('2d'),T=[['255,150,60',.06],['255,120,50',.1],['230,80,60',.15],['170,60,110',.2],['60,30,110',.28]][SK.ss-1];g.fillStyle='rgba('+T[0]+','+T[1]+')';g.fillRect(0,0,W,H);}return c;}finally{FR=0;}}
function url(id,tod,f){f=f||0;const sk=tod==='day'?curKey():{q:0,ss:0},k=id+tod+kk(sk)+f;return cache[k]||(cache[k]='url('+render(id,tod,f,sk).toDataURL('image/png')+')');}
function apply(tod){curTod=tod;const root=document.documentElement;for(const id of Object.keys(SC))root.style.setProperty('--sc-'+id,url(id,tod,fr));root.style.setProperty('--sc-nr',url('tn','night',fr));root.dataset.sc=tod;start();}
// gentle animation: only the scene on screen is advanced (twinkling stars, water shimmer, neon flicker, swaying beams)
function tick(){fr=(fr+1)%4;const root=document.documentElement,dock=document.getElementById('dock'),gmp=document.getElementById('gmp'),nr=document.getElementById('nr'),ids=new Set();
  if(dock&&dock.dataset.s&&dock.dataset.s!=='closed'&&SC[dock.dataset.p])ids.add(dock.dataset.p);if(gmp&&gmp.classList.contains('on'))ids.add('tn');
  ids.forEach(id=>root.style.setProperty('--sc-'+id,url(id,curTod,fr)));
  if(nr&&nr.style.display&&nr.style.display!=='none')root.style.setProperty('--sc-nr',url('tn','night',fr));}
function start(){if(tm||(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches))return;tm=setInterval(()=>{if(!document.hidden)tick();},420);}
window.MFScenes={apply,url,draw:(id,tod,f)=>render(id,tod,f||0)};
})();
