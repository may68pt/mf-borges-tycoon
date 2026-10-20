/* Night manager: goofy 80s look. Strawberry-blond, half bald, big blue googly eyes, big nose,
   huge grin, white jacket over a pink tee. HD head and suit textures for the 3D model plus a
   128px portrait. Loaded after portrait.js; only touches characters with d.hi set (the night manager). */
(function(){
if(typeof MGN==='undefined'||typeof cvx==='undefined')return;
const shd=(h,a)=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,v+a));return '#'+[f(n>>16),f((n>>8)&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('');};
const ell=(q,c,cx,cy,rx,ry)=>{q.fillStyle=c;for(let y=Math.ceil(-ry);y<=ry;y++){const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));q.fillRect(Math.round(cx-w),Math.round(cy+y),w*2+1,1);}};
function tuft(q,hc,x0,y0,w,h,seed){ell(q,shd(hc,-26),x0+w/2,y0+h/2,w/2+1,h/2+1);ell(q,hc,x0+w/2,y0+h/2,w/2,h/2);for(let i=0;i<w*h/7;i++){const a=(i*37+seed)%997;const x=x0+(a%w),y=y0+((a*7)%h);pxl(q,shd(hc,i%3?28:-30),x,y,2,1);}}
function faceHi(d){const s=d.skin,hc=d.hairc;return cvx(64,64,q=>{
 pxl(q,s,0,0,64,64);pxl(q,shd(s,-14),0,0,4,64);pxl(q,shd(s,-14),60,0,4,64);pxl(q,shd(s,-22),0,57,64,7);
 // shiny bald dome + three goofy wisps on top
 pxl(q,shd(s,14),14,0,36,9);pxl(q,shd(s,30),20,1,14,3);pxl(q,'#ffffff',22,1,5,1);
 for(const [x,c] of [[27,1],[31,-1],[35,1]]){pxl(q,hc,x,0,1,4);pxl(q,hc,x+c,3,1,2);pxl(q,shd(hc,30),x+2*c,4,1,1);}
 // big fluffy side tufts
 tuft(q,hc,-3,6,15,30,3);tuft(q,hc,52,6,15,30,11);
 // high arched surprised-happy brows
 const br=shd(hc,-22);for(const [x,f] of [[13,1],[37,-1]])for(let i=0;i<14;i++){const yy=15-Math.round(2.4*Math.sin(Math.PI*i/13));pxl(q,br,x+i,yy,1,3);pxl(q,shd(hc,24),x+i,yy,1,1);}
 // big googly eyes, bright blue, pupils a bit cross-eyed
 for(const [cx,px] of [[20,2],[44,-2]]){ell(q,shd(s,-16),cx,27,8,7.5);ell(q,'#1c1424',cx,27,7,6.5);ell(q,'#ffffff',cx,27,6,5.5);pxl(q,'#dfe4ee',cx-6,30,12,2);
  const ix=cx+px;pxl(q,'#1e5fd0',ix-3,24,7,7);pxl(q,'#ffffff',ix-3,24,1,1);pxl(q,'#ffffff',ix+3,24,1,1);pxl(q,'#ffffff',ix-3,30,1,1);pxl(q,'#ffffff',ix+3,30,1,1);pxl(q,'#3f9bff',ix-2,26,5,4);pxl(q,'#7cc4ff',ix-1,29,3,1);pxl(q,'#0b1020',ix-1,26,3,3);pxl(q,'#ffffff',ix-2,25,2,2);
  pxl(q,shd(s,-22),cx-6,34,12,1);}
 // freckles + rosy cheeks
 pxl(q,'rgba(235,80,90,.30)',5,36,13,8);pxl(q,'rgba(235,80,90,.30)',46,36,13,8);for(let i=0;i<22;i++)pxl(q,'rgba(190,100,50,.55)',(i<11?7:47)+(i*5)%11,35+(i*3)%7,1,1);
 // big bulbous nose
 pxl(q,shd(s,-20),28,20,8,12);pxl(q,shd(s,10),30,20,3,12);ell(q,shd(s,-34),32,37,12,8.5);ell(q,shd(s,-10),32,36,11,7.5);ell(q,'#f39a90',32,35,8,5.5);ell(q,'#f7b4aa',30,33,4,2.5);pxl(q,'#fff0ea',28,31,3,2);
 pxl(q,'#5a2422',24,41,4,2);pxl(q,'#5a2422',36,41,4,2);pxl(q,shd(s,-36),22,45,20,1);
 // huge happy grin with buck teeth
 q.fillStyle='#4a1418';for(let x=12;x<=52;x++){const t=(x-32)/20,top=47-Math.round(3*t*t),bot=49+Math.round(8*(1-t*t));q.fillRect(x,top,1,Math.max(1,bot-top));}
 pxl(q,'#ffffff',18,48,28,2);pxl(q,'#d8d0c8',18,50,28,1);pxl(q,'#ffffff',28,48,8,6);pxl(q,'#c8bcb0',31,48,1,6);pxl(q,'#c8bcb0',28,53,8,1);
 ell(q,'#e0566a',32,55,6,1.5);pxl(q,'#8a2a30',12,44,2,2);pxl(q,'#8a2a30',50,44,2,2);pxl(q,shd(s,-26),9,42,3,2);pxl(q,shd(s,-26),52,42,3,2);pxl(q,shd(s,-20),26,59,12,1);});}
function sideHi(d){const s=d.skin,hc=d.hairc;return cvx(64,64,q=>{pxl(q,s,0,0,64,64);pxl(q,shd(s,-12),0,54,64,10);pxl(q,shd(s,16),12,0,48,8);pxl(q,shd(s,30),20,2,14,2);
 tuft(q,hc,2,8,34,28,5);ell(q,shd(s,-20),40,30,6,9);ell(q,shd(s,4),40,30,4,7);ell(q,'#e8a090',40,31,2,4);
 ell(q,shd(s,-20),62,40,6,6);pxl(q,'#4a1418',54,49,10,3);pxl(q,'#ffffff',58,49,6,1);});}
function backHi(d){const s=d.skin,hc=d.hairc;return cvx(64,64,q=>{pxl(q,s,0,0,64,64);pxl(q,shd(s,18),14,1,36,10);pxl(q,shd(s,32),22,3,12,3);
 tuft(q,hc,-2,14,68,24,7);pxl(q,shd(s,-24),0,54,64,2);pxl(q,shd(s,-12),24,58,16,2);});}
function torsoHi(d,back){const c=d.topc,tee=d.tee||'#ff8fc8',s=d.skin,g=d.accc||'#e6c200';return cvx(64,64,q=>{pxl(q,c,0,0,64,64);for(let y=5;y<64;y+=9)pxl(q,shd(c,-6),0,y,64,1);
 pxl(q,shd(c,-20),0,0,4,64);pxl(q,shd(c,-20),60,0,4,64);pxl(q,shd(c,-30),0,58,64,6);pxl(q,'#ffffff',4,0,56,3);
 if(back){pxl(q,shd(c,-16),31,8,2,50);pxl(q,shd(c,-10),6,4,52,2);return;}
 // pastel tee in a deep V, 80s style
 for(let y=0;y<50;y++){const w=Math.max(0,17-Math.floor(y/2.9));pxl(q,tee,32-w,y,w*2,1);}pxl(q,shd(tee,-30),24,0,16,2);ell(q,s,32,0,7,4);
 for(let x=26;x<=38;x+=4)pxl(q,shd(tee,40),x,22,2,2);pxl(q,'#35e0ff',24,30,16,1);pxl(q,'#ffe066',26,33,12,1);
 // wide lapels
 for(let y=0;y<50;y++){const w=Math.max(0,17-Math.floor(y/2.9));pxl(q,shd(c,-30),32-w-7,y,1,1);pxl(q,shd(c,10),32-w-6,y,5,1);pxl(q,shd(c,-18),32-w-1,y,1,1);pxl(q,shd(c,-30),32+w+6,y,1,1);pxl(q,shd(c,10),32+w+1,y,5,1);pxl(q,shd(c,-18),32+w,y,1,1);}
 // gold chain + medallion
 for(let x=22;x<=42;x++)pxl(q,g,x,4+Math.round((10-Math.abs(x-32))*.9),1,1);ell(q,shd(g,-50),32,16,3,3);ell(q,g,32,16,2.4,2.4);pxl(q,'#fff6a0',31,15,1,1);
 // neon pocket square + buttons
 pxl(q,shd(c,-28),46,30,12,1);pxl(q,'#ff3d9a',48,25,3,5);pxl(q,'#35e0ff',51,26,3,4);pxl(q,'#ffe066',54,27,2,3);for(const y of [52,58])pxl(q,shd(c,-40),31,y,3,2);
 pxl(q,shd(c,-26),6,48,12,1);pxl(q,shd(c,-26),46,48,12,1);});}
function portraitHi(d){const c2=document.createElement('canvas');c2.width=c2.height=128;const q=c2.getContext('2d');q.imageSmoothingEnabled=false;
 const gr=q.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#3a1450');gr.addColorStop(1,'#0e0e1c');q.fillStyle=gr;q.fillRect(0,0,128,128);
 for(let y=70;y<128;y+=6)pxl(q,'rgba(255,61,154,.35)',0,y,128,1);for(let x=4;x<128;x+=12)pxl(q,'rgba(53,224,255,.18)',x,70,1,58);
 q.fillStyle='rgba(255,61,154,.30)';q.beginPath();q.arc(64,52,50,0,7);q.fill();q.fillStyle='#120a22';q.beginPath();q.arc(64,52,44,0,7);q.fill();q.fillStyle='rgba(53,224,255,.16)';q.beginPath();q.arc(64,52,44,0,7);q.fill();
 // shoulder-padded white jacket
 const c=d.topc;pxl(q,shd(c,-40),0,92,128,36);pxl(q,c,2,94,124,34);pxl(q,'#ffffff',4,94,30,3);pxl(q,'#ffffff',94,94,30,3);
 q.drawImage(torsoHi(d,0).image,24,84,80,48);pxl(q,shd(d.skin,-10),54,76,20,12);pxl(q,shd(d.skin,-26),54,84,20,2);
 const sk=d.skin;for(const x of [22,102]){ell(q,shd(sk,-22),x+2,52,6,10);ell(q,shd(sk,4),x+2,52,4,8);ell(q,'#f0a090',x+2,53,2,5);}
 q.drawImage(faceHi(d).image,32,18,64,64);pxl(q,'rgba(0,0,0,.3)',32,81,64,2);
 // tufts poking out past the head for the silhouette
 tuft(q,d.hairc,20,26,15,22,9);tuft(q,d.hairc,93,26,15,22,13);
 return c2.toDataURL();}
{const st=document.createElement('style');st.textContent='#nr .mgs .pic{object-fit:cover;image-rendering:pixelated}#nr .mgs .bl{display:none}';document.head.appendChild(st);}
Object.assign(MGN,{hi:1,hair:'halfbald',hairc:'#f0a848',skin:'#fbe0c8',topc:'#f4f4ee',tee:'#ff8fc8',accc:'#e6c200'});
const wrap=(name,hi)=>{const old=window[name];if(typeof old!=='function')return;window[name]=function(d){return d&&d.hi?hi.apply(null,arguments):old.apply(null,arguments);};};
wrap('faceTex',faceHi);wrap('sideTex',sideHi);wrap('backTex',backHi);wrap('torsoTex',torsoHi);
let pic=null;wrap('drawPortrait',d=>pic||(pic=portraitHi(d)));
try{const AV=(0,eval)('AVC');if(AV)for(const k in AV)if(k.indexOf('manager')===0)delete AV[k];}catch(e){}
try{MC=null;if(typeof setMgr==='function')setMgr();if(typeof S!=='undefined'&&(S.ph==='night'||S.ph==='end')&&typeof dressMgr==='function')dressMgr(1);}catch(e){}
})();
