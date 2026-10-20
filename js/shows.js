/* MF Borges Tycoon - shows module (split from the single-file game; loads in order, shares global scope) */
// ---- paths ----
function mkPath(P){let L=0;const c=[0];for(let i=1;i<P.length;i++){L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);c.push(L);}return {P,c,L};}
function atD(pa,d){d=Math.max(0,Math.min(pa.L,d));let i=1;while(i<pa.P.length-1&&pa.c[i]<d)i++;const a=pa.P[i-1],b=pa.P[i],sl=(pa.c[i]-pa.c[i-1])||1,f=(d-pa.c[i-1])/sl;return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,(b[0]-a[0])/sl,(b[1]-a[1])/sl];}
// ---- vehicles ----
const VEH=[];
function mkVeh(kind,len,st,tx,off,stay){const g=new THREE.Group(),bus=kind==='bus',tex=logoTex(st,bus?160:128,bus?44:48,bus),sideM=new THREE.MeshLambertMaterial({map:tex}),plain=new THREE.MeshLambertMaterial({color:new THREE.Color(st.bg)}),hg=bus?1.45:1.5,wd=bus?1.5:1.55;
const box=new THREE.Mesh(gm(len,hg,wd),[plain,plain,mt(0xdedede),mt(0x222222),sideM,sideM]);box.position.set(0,.44+hg/2,0);box.castShadow=box.receiveShadow=true;g.add(box);
const cx=len/2;bx(g,len+.2,.16,wd-.2,0,.34,0,0x2a2a30,1);
if(!bus){bx(g,1.1,1.1,1.45,cx+.6,.99,0,0xd9d9d9);bx(g,.04,.5,1.25,cx+1.16,1.2,0,0x9fc5c8,1);for(const z of [-.5,.5])bx(g,.05,.12,.22,cx+1.16,.7,z,0xffe9a0,1);}
else{bx(g,.04,.6,1.3,cx+.02,1.3,0,0x9fc5c8,1);for(const z of [-.5,.5])bx(g,.05,.12,.22,cx+.02,.62,z,0xffe9a0,1);}
for(const x of (bus?[-len/2+.8,len/2-1.0]:[-len/2+.5,len/2-.6,cx+.6]))for(const z of [-.72,.72])bx(g,.46,.46,.2,x,.23,z,0x111111,1);
g.bl=[];for(const z of [-.6,.6]){const m=new THREE.Mesh(gm(.07,.12,.12),new THREE.MeshBasicMaterial({color:0x553311}));m.position.set(-len/2-.03,.75,z);g.add(m);g.bl.push(m);}
if(!bus){g.ramp=bx(g,1.1,.05,1.5,-.2,.26,1.5,0x8a8f9a,1);g.ramp.rotation.x=.28;g.ramp.visible=false;}
g.visible=false;sc.add(g);
const inP=mkPath([[62,25.6],[tx+12,25.6],[tx+7.6,22.6],[tx,22.6]]),outP=mkPath([[tx,22.6],[tx-3.8,23.4],[tx-6.4,25.6],[-18,25.6]]);
return {g,kind,tx,off,stay:!!stay,inP,outP};}
function vehState(v,h){const a=SHOW.a+v.off,d1=a+.4;if(h<a)return {vis:0};
if(h<d1){const q=atD(v.inP,(h-a)/.4*v.inP.L);return {vis:1,x:q[0],z:q[1],r:Math.atan2(-q[3],q[2]),park:0};}
const l0=SHOW.u1+Math.max(0,v.off);if(v.stay||h<l0)return {vis:1,x:v.tx,z:22.6,r:Math.PI,park:1};
if(h<l0+.5){const q=atD(v.outP,(h-l0)/.5*v.outP.L);return {vis:1,x:q[0],z:q[1],r:Math.atan2(-q[3],q[2]),park:0};}return {vis:0};}
// ---- roadies carrying flight cases ----
const RDS=[];for(let i=0;i<5;i++){const m=genChar('local','rd'+i,{top:'tee',topc:'#15151b',hat:i%2?'cap':'beanie',hatc:'#15151b',acc:'lanyard',bot:'jeans',botc:'#22262e',shoe:'boots'});const c=new THREE.Group();bx(c,.3,.22,.18,0,0,0,0x1d1d24,1);bx(c,.32,.02,.2,0,.12,0,0x9aa0ad,1);for(const sx of [-.15,.15])bx(c,.03,.24,.2,sx,0,0,0x9aa0ad,1);c.position.set(0,.33,.17);m.add(c);m.cs=c;m.visible=false;sc.add(m);RDS.push(m);}
// ---- stage backline that appears during load-in ----
const RIGL={1:[],2:[]};
{const mk=(r,k,w,h,d,x,y,z,c,acc)=>{const m=bx(sc,w,h,d,x,y,z,acc?new THREE.MeshLambertMaterial({color:c}):c);m.visible=false;RIGL[r].push({m,k,acc:acc||0});};
const D=0x1a1a22,Sv=0x8f94a0;
mk(1,'any',.45,.9,.4,2.35,.75,4.9,D);mk(1,'any',.45,.9,.4,2.35,.75,8.1,D);mk(1,'any',.1,.12,.3,2.62,1.24,4.9,0x888,1);mk(1,'any',.1,.12,.3,2.62,1.24,8.1,0x888,1);mk(1,'any',.5,.3,.35,4.7,.45,5.4,D);mk(1,'any',.5,.3,.35,4.7,.45,7.6,D);mk(1,'any',.03,1.2,.03,4.6,.9,6.5,Sv);
mk(1,'band',.5,.5,.5,2.6,.55,6.5,D);mk(1,'band',.06,.36,.36,2.86,.55,6.5,0x888,2);mk(1,'band',.3,.2,.3,2.95,.9,6.2,0xbbbbbb);mk(1,'band',.3,.2,.3,2.95,.9,6.8,0xbbbbbb);mk(1,'band',.5,.03,.5,2.9,1.22,5.85,0xc9a24b);mk(1,'band',.5,.03,.5,2.9,1.22,7.2,0xc9a24b);
mk(1,'dj',.6,.8,1.8,3.1,.7,6.5,D);mk(1,'dj',.08,.06,.5,3.1,1.13,6.1,0x888,2);mk(1,'dj',.08,.06,.5,3.1,1.13,6.9,0x888,1);mk(1,'dj',.5,.9,.4,2.35,.75,5.6,D);
mk(2,'any',.4,.8,.35,6.3,.7,14.4,D);mk(2,'any',.4,.8,.35,6.3,.7,16.6,D);mk(2,'any',.1,.12,.28,6.54,1.12,14.4,0x888,1);mk(2,'any',.1,.12,.28,6.54,1.12,16.6,0x888,1);mk(2,'any',.45,.28,.3,8.7,.42,14.6,D);mk(2,'any',.45,.28,.3,8.7,.42,16.4,D);mk(2,'any',.03,1.2,.03,8.6,.9,15.5,Sv);
mk(2,'band',.45,.45,.45,6.6,.5,15.5,D);mk(2,'band',.06,.32,.32,6.84,.5,15.5,0x888,2);mk(2,'band',.3,.2,.3,6.95,.8,15.2,0xbbbbbb);mk(2,'band',.3,.2,.3,6.95,.8,15.8,0xbbbbbb);mk(2,'band',.45,.03,.45,6.9,1.1,14.9,0xc9a24b);mk(2,'band',.45,.03,.45,6.9,1.1,16.1,0xc9a24b);
mk(2,'dj',.55,.75,1.6,7.4,.67,15.5,D);mk(2,'dj',.08,.06,.45,7.4,1.08,15.1,0x888,2);mk(2,'dj',.08,.06,.45,7.4,1.08,15.9,0x888,1);}
// ---- fans: the line outside the door, tiered by the act ----
const FPATH=[[22.9,10.66],[27.5,10.66],[27.5,11.4],[27.5,14.2],[27.5,14.65],[28.45,14.65],[28.45,14.1],[28.45,11.45],[29.6,11.45],[31.2,13.4],[32.4,18.9],[37.5,18.9],[37.5,16.0],[33.4,16.0],[33.4,13.8],[37.5,13.8]],FP=mkPath(FPATH),FQN=46,FQ=[],FSP=.6;
for(let i=0;i<FQN;i++){const m=genChar('tourist','fq'+i);m.visible=false;m.fq={has:false,ph:Math.random()*9,sp:1.9+Math.random()*.7};const f=new THREE.Group(),c1=new THREE.MeshLambertMaterial({color:0x222222}),c2=new THREE.MeshLambertMaterial({color:0xffffff});
bx(f,.02,1.0,.02,.2,.85,.05,0x6b4a2b,1);const a=new THREE.Mesh(gm(.46,.28,.02),c1),b=new THREE.Mesh(gm(.46,.07,.02),c2);a.position.set(.43,1.25,.05);b.position.set(.43,1.25,.06);f.add(a,b);f.visible=false;m.fg=f;m.fm=[c1,c2];m.add(f);sc.add(m);FQ.push(m);}
const GRD=[0,1,2,3].map(i=>{const m=genChar('security','sg'+i,{face:'sunglasses'});m.position.set([23.6,23.6,25.0,25.0][i],0,[9.75,11.6,9.75,11.6][i]);m.rotation.y=Math.PI/2;m.visible=false;sc.add(m);return m;});
const BARR=[];for(let k=0;k<30;k++)for(const sd of [-1,1]){const m=bx(sc,.9,.5,.05,0,0,0,0x9aa0ad,1);m.visible=false;const q=atD(FP,k*1.2+.6);m.position.set(q[0]-q[3]*.4*sd,gy(q[0],q[1])+.28,q[1]+q[2]*.4*sd);m.rotation.y=Math.atan2(-q[3],q[2]);m.bk=k;m.sd=sd;BARR.push(m);}
const TENTS=[[35.3,5.6],[36.9,6.7],[35.0,3.7]].map(([x,z],i)=>{const g=new THREE.Group(),m1=new THREE.MeshLambertMaterial({color:0xe5593f}),m2=new THREE.MeshLambertMaterial({color:0xf2c94c});for(const s of [-1,1]){const p=new THREE.Mesh(gm(1.15,.04,1.0),i%2?m1:m2);p.position.set(s*.27,.38,0);p.rotation.z=s*.95;p.castShadow=true;g.add(p);}bx(g,.04,.7,1.0,0,.35,.5,0x333333,1);g.position.set(x,gb(x,z),z);g.visible=false;g.userData.ms=[m1,m2];sc.add(g);return g;});
function dressFans(){const ha=SHOW.ha,st=SHOW.st,t=SHOW.t,fr=[.25,.4,.55,.7,.85,1][t],cls=GCLS[ha.g]||'tourist';
FQ.forEach((m,i)=>{const r=hsh('fl'+S.day+i)/4294967296,o={};if(r<fr){o.top='tee';o.topc=st.bg;o.top2=st.fg;o.logo=st;}if(t>=3&&r>.5&&r<.72){o.acc='scarf';o.accc=st.ac;}buildChar(m,mkDNA(cls,'fq'+S.day+'_'+i,o));m.add(m.fg);m.fm[0].color.set(st.bg);m.fm[1].color.set(st.ac);});
TENTS.forEach(g=>{g.userData.ms[0].color.set(st.ac);g.userData.ms[1].color.set(st.fg);});}
function logoOpt(i){const ha=SHOW.on?SHOW.ha:headAct();if(!ha)return;const st=SHOW.on?SHOW.st:bStyle(ha),t=btier(ha),fr=[.2,.35,.5,.65,.8,.95][t];if(hsh('lg'+S.day+'_'+i)/4294967296<fr)return {top:'tee',topc:st.bg,top2:st.fg,logo:st};}
// ---- show lifecycle ----
function endShowVis(){VEH.forEach(v=>sc.remove(v.g));VEH.length=0;RDS.forEach(m=>m.visible=false);FQ.forEach(m=>{m.visible=false;m.fq.has=false;});GRD.forEach(m=>m.visible=false);BARR.forEach(m=>m.visible=false);TENTS.forEach(g=>g.visible=false);for(const r of [1,2])RIGL[r].forEach(o=>o.m.visible=false);SCON=0;}
function startShow(ha){endShowVis();const t=btier(ha),st=bStyle(ha),h=S.t/60;SHOW.on=1;SHOW.ha=ha;SHOW.t=t;SHOW.st=st;SHOW.a=Math.max(14,h+.05);SHOW.d1=SHOW.a+.4;SHOW.u1=Math.max(SHOW.d1+1,Math.min(17.6,SHOW.d1+3.2));SHOW.sc0=Math.max(CLOSE+.25,SHOW.u1+.4);SHOW.sc1=Math.min(21.85,SHOW.sc0+2);SHOW.scS=0;SHOW.scT=0;
SHOW.full=Math.min(FQN,Math.max(3,Math.round([6,12,20,30,40,46][t]*(.75+S.hyp/200))));
const tl=[2.2,2.8,3.6,3.8,4.0,4.2][t];VEH.push(mkVeh('truck',tl,st,13.0,0));if(t>=4)VEH.push(mkVeh('bus',5.0,st,1.0,-.15,1));if(t>=5)VEH.push(mkVeh('truck',3.8,st,19.8,.12));
const trucks=VEH.filter(v=>v.kind==='truck'),nr=[2,2,3,4,5,5][t];
RDS.forEach((m,i)=>{if(i>=nr){m.rd=null;return;}const tx=trucks[i%trucks.length].tx,P=[[tx+.2,21.15]];if(Math.abs(tx-13.05)>.5)P.push([13.05,20.5]);P.push([13.05,19.5],[13.05,18.62],[5.4,18.62],[4.4,18.3],[1.5,18.3],[1.5,16.7]);const pa=mkPath(P);m.rd={pa,s:i*pa.L*.55};});
for(const r of [1,2])RIGL[r].forEach(o=>{if(o.acc)o.m.material.color.set(o.acc===1?st.ac:st.fg);});
dressFans();toast((ha.bn||GEN[ha.g].n)+' ('+(ha.band?BT[ha.bt]:TIERS[ha.t][0])+'): tour truck rolls in at '+fmt(SHOW.a*60),'\u{1F69A}');}
function showClose(){if(!S||(S.ph!=='setup'&&S.ph!=='day'))return;const ha=headAct(),h=S.t/60;if(ha){if(!SHOW.cl)SHOW.cl=h>=18.5?Math.min(20,h+.5):18.5;CLOSE=SHOW.cl;}else{SHOW.cl=0;CLOSE=20;}}
// ---- soundcheck audio ----
function scAudio(d2){if(!AX||!SET.sfx||!SG2)return;SHOW.scT+=d2;if(SHOW.scT<.42)return;SHOW.scT=0;const s=SHOW.scS++,g=SHOW.ha.g,t=AX.currentTime+.02,vol=Math.max(.2,1-Math.hypot(Pp.x-10,Pp.z-10.5)/34);SG2.gain.value=SET.sfx*.5;
const kick=v=>tone(130,t,.14,'sine',.5*v*vol,SG2,45),snare=v=>{noise(t,.1,.2*v*vol,SG2);tone(190,t,.08,'triangle',.2*v*vol,SG2);},hat=()=>noise(t,.03,.07*vol,SG2),ch=(n,d,dest)=>[0,7,12].forEach(k=>tone(mf(n+k),t,d,'sawtooth',.12*vol,dest||SG2));
if(g==='techno'){if(s%2===0)kick(1);else hat();if(s%8===0)tone(mf(48),t,.4,'sawtooth',.25*vol,SG2,mf(62));}
else if(g==='metal'){if(s%2===0)kick(1);if(s%4===1)kick(.7);if(s%4===2)snare(1);if(s%8===0)ch(40,.6,DS);}
else if(g==='rock'){if(s%4===0)kick(1);if(s%4===2)snare(1);hat();if(s%8===0)ch(45,.6,DS);}
else if(g==='indie'){tone(mf(60+[0,4,7,12][s%4]),t,.35,'triangle',.2*vol,SG2);if(s%4===0)kick(.5);}
else{if(s%4===0)kick(1);if(s%4===2)noise(t,.08,.25*vol,SG2);if(s%2===0)tone(mf(36+[0,0,5,7][(s>>2)&3]),t,.3,'square',.15*vol,SG2);}
if(s%16===12){tone(mf(62),t,.1,'square',.18*vol,SG2);tone(mf(60),t+.18,.1,'square',.18*vol,SG2);tone(mf(64),t+.4,.12,'square',.18*vol,SG2);}}
// ---- the show scene: vehicles, roadies, rig, soundcheck, the fan line ----
function showScene(t,d2,dm,h,ph){const st=SHOW.st,T=SHOW.t,unl=h>=SHOW.d1&&h<SHOW.u1&&ph!=='night';
for(const v of VEH){const q=vehState(v,h);v.g.visible=!!q.vis;if(q.vis){v.g.position.set(q.x,gb(q.x,q.z),q.z);v.g.rotation.y=q.r;}if(v.g.ramp)v.g.ramp.visible=!!(q.park&&unl);const bl=q.park&&unl&&Math.sin(t*6)>0;v.g.bl.forEach(b=>b.material.color.setHex(bl?0xff9a1a:0x553311));}
RDS.forEach((m,i)=>{const R=m.rd;if(!R||!unl){m.visible=false;return;}R.s+=(R.s<R.pa.L?4.6:6.2)*d2;if(R.s>=2*R.pa.L)R.s-=2*R.pa.L;const fwd=R.s<R.pa.L,d=fwd?R.s:2*R.pa.L-R.s,q=atD(R.pa,d);m.position.set(q[0],gy(q[0],q[1]),q[1]);m.rotation.y=Math.atan2(fwd?q[2]:-q[2],fwd?q[3]:-q[3]);m.visible=d<R.pa.L-.35;m.cs.visible=fwd;swing(m,Math.sin(t*10+i)*.7);if(fwd)m.al.rotation.x=m.ar.rotation.x=-1.3;});
const p=Math.max(0,Math.min(1,(h-SHOW.d1)/(SHOW.u1-SHOW.d1)));
for(const r of [1,2]){const a=AC[S.act[r]],on=!!(a&&a.g),dj=on&&a.g==='techno',use=RIGL[r].filter(o=>o.k==='any'||(o.k==='dj')===dj);RIGL[r].forEach(o=>{const k=use.indexOf(o);o.m.visible=on&&k>=0&&h>=SHOW.d1&&p*(use.length+1)>k+.5;});}
const sc2=ph==='changeover'&&h>=SHOW.sc0&&h<SHOW.sc1;if(sc2!==!!SCON){SCON=sc2?1:0;if(sc2){perfDress();toast('Soundcheck: '+(SHOW.ha.bn||GEN[SHOW.ha.g].n)+' test the PA','\u{1F3A4}');}}
if(sc2){for(const r of [1,2]){const a=AC[S.act[r]];if(!a||!a.g)continue;const sp=a.g==='metal'?5:a.g==='techno'?3:4;PF[r].forEach((q,i)=>{q.visible=!!q.on;if(!q.visible)return;if(a.g==='techno'){q.al.rotation.x=-1.2+Math.sin(t*sp+i)*.2;q.ar.rotation.x=-1.2+Math.sin(t*sp+1)*.2;}else{q.ar.rotation.x=-1.3+Math.sin(t*sp)*.3;q.al.rotation.x=i===0?-2.2+Math.sin(t*sp)*.3:-1;}q.hd.rotation.x=Math.sin(t*2+i)*.12;});}
SL.forEach((s,i)=>{const a=AC[S.act[s.r]];if(a&&a.g)s.m.material.color.setHSL((t*.25+i*.15)%1,.9,.55);});
const a1=AC[S.act[1]],a2=AC[S.act[2]];L1.intensity=a1&&a1.g?1.1+.5*Math.sin(t*3):0;L2.intensity=a2&&a2.g?1.1+.5*Math.sin(t*3+1):0;P1.material.opacity=a1&&a1.g?.1:0;P2.material.opacity=a2&&a2.g?.1:0;scAudio(d2);}
// fan line
let n=0,adm=0;if(h>=16.5&&(ph==='day'||ph==='changeover'||ph==='night')){n=Math.round(SHOW.full*Math.max(0,Math.min(1,(h-16.5)/5)));if(ph==='night')adm=Math.round(SHOW.full*Math.max(0,Math.min(1,(h-22)/.9)));}
const cheer=(sc2&&T>=2)||(ph==='night'&&adm<SHOW.full&&T>=3);let pres=0;
const fe=T>=5?4:T>=4?6:9;
FQ.forEach((m,i)=>{const F=m.fq;if(i>=n||i<adm){m.visible=false;F.has=false;return;}pres++;const idx=i-adm,q=atD(FP,idx*FSP+.3);if(!F.has){F.has=true;m.position.set(41.5,gy(41.5,21.2),21.2);}
const dx=q[0]-m.position.x,dz=q[1]-m.position.z,d=Math.hypot(dx,dz);let mv=0;if(d>.06){const s2=Math.min(d,F.sp*d2);m.position.x+=dx/d*s2;m.position.z+=dz/d*s2;m.rotation.y=Math.atan2(dx,dz);mv=1;}else m.rotation.y+=(Math.atan2(-q[2],-q[3])-m.rotation.y)*.2;
m.position.y=gy(m.position.x,m.position.z);m.visible=true;
if(mv)swing(m,Math.sin(t*9+i)*.6);else{swing(m,0);m.position.y+=Math.abs(Math.sin(t*(cheer?5:1.4)+F.ph))*(cheer?.12:.015);if(cheer){m.al.rotation.x=m.ar.rotation.x=-2.7+Math.sin(t*6+F.ph)*.4;}m.hd.rotation.x=Math.sin(t*.8+F.ph)*.12;}
m.fg.visible=T>=3&&i%fe===4;if(m.fg.visible){m.fg.rotation.z=Math.sin(t*3+i)*.08;if(!mv)m.ar.rotation.x=-.4;}});
for(const b of BARR){b.visible=T>=2&&(b.sd>0||T>=3)&&b.bk*1.2<(pres*FSP+.6);}
GRD.forEach((m,i)=>{m.visible=pres>0&&T>=3&&(i<2||T>=5);});
TENTS.forEach(g=>g.visible=T>=5&&h>=15.5&&ph!=='night');
SHOW.tip+=d2;if(SHOW.tip>5&&pres>0&&ph!=='night'){SHOW.tip=0;const q=atD(FP,Math.min(FP.L,pres*FSP));pay(Math.round(1+T*2),q[0],q[1],1.6);}}
// ---- info line ----
function showInfo(h){const el=$('showinfo');if(!el)return;let tx;if(!SHOW.on)tx='No headliner booked today. Book an act (Acts tab) and its tour truck, load-in, soundcheck and fan line follow, and the market closes earlier.';
else{const ha=SHOW.ha,pr=FQ.filter(m=>m.visible).length;tx='\u{1F69A} '+(ha.bn||GEN[ha.g].n)+' · '+(ha.band?BT[ha.bt]:TIERS[ha.t][0])+' · truck '+fmt(SHOW.a*60)+', load-in until '+fmt(SHOW.u1*60)+', market closes '+fmt(CLOSE*60)+', soundcheck '+fmt(SHOW.sc0*60)+'-'+fmt(SHOW.sc1*60)+', doors 22:00 · fans in line '+pr+'/'+SHOW.full;}
if(tx!==SHOW.ui){SHOW.ui=tx;el.textContent=tx;}}
// ---- busker shifts: a different street musician in the morning and the afternoon ----
const BKS=[{n:'fado guitarist',q:1,m:'pluck',o:{acc:'guitar',accc:'#d9a441',top:'vest',topc:'#6b4a2b',hat:'cap',hatc:'#222222',hair:'long',hairc:'#5a3825',face:'beard',bot:'jeans',botc:'#3b5b8a'}},
{n:'accordionist',q:1.2,m:'squeeze',prop:'acc',o:{acc:'none',top:'shirt',topc:'#e8e8e8',hat:'beret',hatc:'#7a2a2a',hair:'short',face:'mustache',bot:'trousers',botc:'#2a2a33'}},
{n:'saxophonist',q:1.5,m:'sax',prop:'sax',o:{acc:'none',top:'jacket',topc:'#1d1d2a',top2:'#c9a24b',hat:'none',face:'sunglasses',hair:'buzz',bot:'trousers',botc:'#1d1d2a'}},
{n:'violinist',q:1.3,m:'bow',prop:'vio',o:{acc:'none',top:'dress',topc:'#7a1f3d',hair:'bun',hairc:'#2a1a12',face:'none',bot:'skirt',botc:'#7a1f3d',hat:'none'}},
{n:'bucket drummer',q:1.1,m:'drum',prop:'buc',o:{acc:'none',top:'tank',topc:'#ff8c1a',hat:'bandana',hatc:'#e5593f',hair:'curly',bot:'shorts',botc:'#3b5b8a'}},
{n:'singer-songwriter',q:1.15,m:'sing',o:{acc:'mic',top:'hawaii',topc:'#06d6a0',top2:'#ffd400',hat:'sunhat',hair:'pony',bot:'jeans',botc:'#3b5b8a'}}];
const BSK={k:-1,d:-1,q:1,acc:0,i:0};
const buskKind=sh=>{const a=hsh('bk'+S.day)%6;return sh?(a+1+hsh('bk2'+S.day)%5)%6:a;};
function dressBusk(k){const d=BKS[k];buildChar(DB,mkDNA('local','busk'+k,d.o));BSK.q=d.q;
if(d.prop==='acc'){bx(DB,.26,.2,.14,0,.33,.13,0xb3261e,1);bx(DB,.05,.16,.02,.14,.33,.13,0xffffff,1);bx(DB,.05,.16,.02,-.14,.33,.13,0x111111,1);}
else if(d.prop==='sax'){bx(DB,.05,.3,.05,.06,.3,.13,0xd9a441,1);bx(DB,.13,.05,.05,.11,.15,.13,0xd9a441,1);bx(DB,.06,.06,.06,.17,.12,.13,0xf2c94c,1);}
else if(d.prop==='vio'){bx(DB,.08,.15,.05,-.09,.47,.1,0x8a4b1f,1);}
else if(d.prop==='buc'){for(const [x,z] of [[-.14,.25],[.0,.3],[.14,.25]])bx(DB,.12,.14,.12,x,.07,z,0xc9c9c9,1);}}
function busk(t,d2,h){const sh=h>=15.5?1:0,k=buskKind(sh);if(S.ph!=='night'&&(BSK.k!==k||BSK.d!==S.day)){const first=BSK.d===S.day;BSK.k=k;BSK.d=S.day;dressBusk(k);if(first&&S.ph==='day')toast('Shift change: a '+BKS[k].n+' takes the corner','\u{1F3B7}');}
const day=S.ph==='day'||S.ph==='setup',gap=Math.abs(h-15.5)<.12;DB.visible=day&&!gap&&BSK.k>=0;if(!DB.visible)return;const m=BKS[BSK.k].m;
if(m==='pluck'){DB.ar.rotation.x=-1.1+Math.sin(t*9)*.35;DB.al.rotation.x=-1;}
else if(m==='squeeze'){DB.al.rotation.x=-1.2+Math.sin(t*3)*.4;DB.ar.rotation.x=-1.2-Math.sin(t*3)*.4;}
else if(m==='sax'){DB.al.rotation.x=DB.ar.rotation.x=-1.3;DB.rotation.z=Math.sin(t*2)*.08;DB.hd.rotation.x=Math.sin(t*2)*.2;}
else if(m==='bow'){DB.ar.rotation.x=-1.6+Math.sin(t*5)*.5;DB.al.rotation.x=-1.9;}
else if(m==='drum'){DB.ar.rotation.x=-1.2+Math.abs(Math.sin(t*10))*.6;DB.al.rotation.x=-1.2+Math.abs(Math.sin(t*10+1.5))*.6;}
else{DB.ar.rotation.x=-2+Math.sin(t*2)*.3;DB.al.rotation.x=-.3;DB.hd.rotation.x=Math.sin(t*2.5)*.15;}
if(m!=='sax')DB.rotation.z=0;
if(!AX||!SET.sfx||!SG2||!S.speed)return;BSK.acc+=d2;if(BSK.acc<.34)return;BSK.acc=0;const dist=Math.hypot(Pp.x-24,Pp.z-8.4);if(dist>14)return;const v=.16*(1-dist/14),T=AX.currentTime+.02,i=BSK.i++;SG2.gain.value=SET.sfx*.5;
if(m==='pluck')tone(mf(57+[0,3,7,10,12,10,7,3][i%8]),T,.5,'triangle',v,SG2);
else if(m==='squeeze'){if(i%3===0)tone(mf(45),T,.3,'square',v*.5,SG2);else [0,4,7].forEach(k=>tone(mf(57+k),T,.25,'square',v*.25,SG2));}
else if(m==='sax')tone(mf([62,65,67,69,72,69,67,65][(i*3)%8]),T,.34,'sawtooth',v*.5,SG2,mf(63));
else if(m==='bow')tone(mf([69,72,76,72,69,67][i%6]),T,.5,'sine',v,SG2);
else if(m==='drum'){if(i%2===0){tone(170,T,.08,'square',v*.5,SG2,90);}else noise(T,.05,v*.7,SG2);}
else tone(mf([64,67,69,67,64,62][i%6]),T,.4,'triangle',v,SG2);}
// ---- market animators: two shifts, hired in the Set tab ----
const ANK=[null,
{n:'Living statue',c:40,q:.033,o:{skin:'#d4af37',top:'jacket',topc:'#c9a24b',top2:'#8a6d1d',bot:'trousers',botc:'#b8962f',hat:'none',hair:'short',hairc:'#b8962f',face:'none',acc:'none',shoe:'boots',shoec:'#8a6d1d'}},
{n:'Juggler',c:60,q:.037,o:{top:'stripes',topc:'#c0262d',top2:'#ffffff',bot:'trousers',botc:'#1d3a7a',hat:'bucket',hatc:'#f2c94c',face:'none',acc:'none'}},
{n:'Mascot',c:50,q:.04,o:{skin:'#ffd1e0',top:'hoodie',topc:'#ff9ecb',top2:'#ffffff',bot:'trousers',botc:'#ff9ecb',hat:'beanie',hatc:'#ffb8da',face:'none',hair:'bald',acc:'none',shoe:'sneakers',shoec:'#ffffff'}},
{n:'Magician',c:90,q:.042,o:{top:'jacket',topc:'#1a1a22',top2:'#7a1f3d',bot:'trousers',botc:'#1a1a22',hat:'none',face:'mustache',hair:'short',acc:'none',shoe:'boots',shoec:'#111111'},prop:'mag'},
{n:'Stilt walker',c:110,q:.045,o:{top:'tank',topc:'#6a3fb5',bot:'trousers',botc:'#e5593f',hat:'bucket',hatc:'#35e0ff',face:'glitter',acc:'none'},prop:'stilt'},
{n:'Face painter',c:45,q:.036,o:{top:'apron',topc:'#ffffff',top2:'#35e0ff',bot:'jeans',botc:'#3b5b8a',hat:'bandana',hatc:'#ff3d9a',hair:'pony',acc:'none'},prop:'easel'},
{n:'Bubble artist',c:55,q:.038,o:{top:'hawaii',topc:'#35e0ff',top2:'#ffffff',bot:'shorts',botc:'#ffffff',hat:'sunhat',face:'none',acc:'none'}}];
const ANI=[0,1].map(s=>{const m=genChar('local','an'+s);m.visible=false;m.ak=0;sc.add(m);return m;});
const ANF=[0,1].map(()=>Array.from({length:8},()=>{const f=new THREE.Mesh(gm(.07,.07,.07),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true}));f.visible=false;sc.add(f);return f;}));
const ASP=[16.4,10.65];
function dressAn(s,k){const m=ANI[s],d=ANK[k];buildChar(m,mkDNA('local','an'+s+'k'+k,d.o));m.ak=k;m.scale.setScalar(.85);ANF[s].forEach((f,i)=>{f.visible=false;f.material.color.setHex(k===2?[0xe5593f,0xf2c94c,0x3ab795][i%3]:k===4?0xfff6a0:0xdff6ff);f.material.opacity=k===7?.6:1;});
if(k===3)m.hd.scale.setScalar(1.9);
else if(k===4){bx(m.hd,.2,.2,.2,0,.34,0,0x111111,1);bx(m.hd,.3,.03,.3,0,.24,0,0x111111,1);bx(m,.3,.4,.04,0,.3,-.1,0x4a1f7a,1);bx(m.ar,.02,.3,.02,0,-.3,.04,0xffffff,1);}
else if(k===5){m.scale.set(.85,1.7,.85);for(const x of [-.07,.07])bx(m,.05,.3,.05,x,-.13,0,0x7b5a3a,1);}
else if(k===6){bx(m,.5,.7,.05,0,.4,.45,0xf2ead8,1);for(let i=0;i<4;i++)bx(m,.08,.08,.02,-.15+i*.1,.2,.48,[0xe5593f,0xf2c94c,0x3ab795,0x3b82d6][i],1);}}
function anims(t,d2,dm,h){if(!S.anim){S.anim=[0,0];S.anPaid=[0,0];}if(!S.anPaid)S.anPaid=[0,0];ANA=0;
for(const s of [0,1]){const k=S.anim[s],m=ANI[s],fx=ANF[s];let act=k>0&&S.ph==='day'&&(s===0?h<15.5:h>=15.5);
if(act&&!S.anPaid[s]){if(S.cash>=ANK[k].c){S.cash-=ANK[k].c;S.anPaid[s]=1;toast(ANK[k].n+' entertains the market (-€'+ANK[k].c+')','\u{1F3AA}');sfx('coin');}else{S.anPaid[s]=-1;toast('Not enough cash for the '+ANK[k].n.toLowerCase(),'\u{1F3AA}');}}
if(S.anPaid[s]!==1)act=false;m.visible=act;fx.forEach(f=>{if(!act)f.visible=false;});if(!act)continue;ANA=1;if(S.speed)S.tide=Math.min(120,S.tide+ANK[k].q*dm);
if(m.ak!==k)dressAn(s,k);let x=ASP[0],z=ASP[1]+(s?.55:-.55);if(k===5)x+=Math.sin(t*.35)*2.4;m.position.set(x,gy(x,z),z);m.rotation.y=k===5?(Math.cos(t*.35)>0?Math.PI/2:-Math.PI/2):Math.PI/4;
if(k===1){const st=Math.floor(t/5)%3;m.ar.rotation.x=[0,-2.5,-1.5][st];m.al.rotation.x=[0,-1,-2.4][st];}
else if(k===2){m.ar.rotation.x=-2.6+Math.sin(t*6)*.3;m.al.rotation.x=-2.6-Math.sin(t*6)*.3;fx.forEach((f,i)=>{if(i>2){f.visible=false;return;}const a=t*5+i*2.09;f.visible=true;f.position.set(x+Math.cos(a)*.3,gy(x,z)+1.2+Math.abs(Math.sin(a))*.5,z+Math.sin(a)*.12);});}
else if(k===3){m.ar.rotation.x=-2.2+Math.sin(t*4)*.6;m.al.rotation.x=-.2;m.position.y+=Math.abs(Math.sin(t*4))*.08;m.hd.rotation.z=Math.sin(t*3)*.15;}
else if(k===4){m.ar.rotation.x=-1.4+Math.sin(t*3)*.6;m.al.rotation.x=-.6;fx.forEach((f,i)=>{const on=i<4&&Math.sin(t*3+i*1.7)>.55;f.visible=on;if(on)f.position.set(x+.45+Math.random()*.1,gy(x,z)+1.0+Math.random()*.2,z+.1+Math.random()*.12);});}
else if(k===5){swing(m,Math.sin(t*4)*.5);}
else if(k===6){m.ar.rotation.x=-1.3+Math.sin(t*6)*.3;m.al.rotation.x=-.5;}
else if(k===7){m.ar.rotation.x=-1.8+Math.sin(t*1.5)*.7;m.al.rotation.x=-.3;fx.forEach((f,i)=>{const u=((t*.35+i*.19)%1);f.visible=true;f.position.set(x+.4+Math.sin(i*2+t)*.35+u*.8,gy(x,z)+1.0+u*1.5,z+Math.cos(i*3+t*.6)*.3);f.material.opacity=.7*(1-u);});}}
}
function aniLure(){return ANA?.03:0;}
function buildShowUI(){const P=$('sel');for(const s of [0,1]){const l=document.createElement('span');l.className='px';l.textContent=s?'Animator PM':'Animator AM';const se=document.createElement('select');se.id='an'+s;ANK.forEach((a,i)=>{const o=document.createElement('option');o.value=i;o.textContent=a?a.n+' €'+a.c:'No animator';se.appendChild(o);});
se.onchange=()=>{if(!S)return;if(!S.anim)S.anim=[0,0];if(!S.anPaid)S.anPaid=[0,0];S.anim[s]=+se.value;S.anPaid[s]=0;ui();};P.append(l,se);}
const d=document.createElement('div');d.id='showinfo';d.className='p';d.style.cssText='margin:6px 0;font-size:11px;line-height:1.4';const tn=$('tn');tn.insertBefore(d,tn.firstChild);}
function showAnim(t,dt){roofLOD();if(!S||S.over)return;if(!S.anim){S.anim=[0,0];S.anPaid=[0,0];}
const ts=S.speed?S.speed/2:0,d2=dt*ts,dm=dt*6*(S.speed||0),h=S.t/60,ph=S.ph;
if(SHOW.sref!==S||SHOW.d0!==S.day){SHOW.sref=S;SHOW.d0=S.day;endShowVis();SHOW.on=0;SHOW.cl=0;S.anPaid=[0,0];if(ph==='setup'||ph==='day')CLOSE=20;}
const ha=headAct();
if(ha&&(!SHOW.on||SHOW.ha!==ha)&&(ph==='setup'||ph==='day')&&h<20)startShow(ha);
else if(!ha&&SHOW.on&&(ph==='setup'||ph==='day')){endShowVis();SHOW.on=0;}
if(SHOW.on)showScene(t,d2,dm,h,ph);
busk(t,d2,h);anims(t,d2,dm,h);showInfo(h);petAnim(t,dt,d2);shopPetAnim(t);parkAnim(t,d2);evAnim(t,d2,dm,h);lifeAnim(t,dt,d2);worldAnim(t,dt,d2,h,dm);
for(const s of [0,1]){const e=$('an'+s);if(e&&+e.value!==S.anim[s])e.value=S.anim[s];}}

// ================= life: pets, a pet-friendly market, random street events, richer avatar animation =================
const FURC=[0xc9803a,0x1a1a1a,0xf2ead8,0xd9b98a,0x8a8f9a,0xe5a560,0x6b4a2b];
function quad(o){const g=new THREE.Group();g.legs=[];const P=(p,x,y,z)=>{const q=new THREE.Group();q.position.set(x,y,z);p.add(q);return q;};
const bw=o.bw,bh=o.bh,bl=o.bl,lh=o.lh,c=o.c,c2=o.c2||c,c3=o.c3||c2;g.lh=lh;
bx(g,bw,bh,bl,0,lh+bh/2,0,c,1);if(o.c2&&o.c2!==c)bx(g,bw*.7,bh*.5,bl*.4,0,lh+bh*.25,0,c2,1);
const hd=P(g,0,lh+bh*.85,bl/2);g.head=hd;bx(hd,o.hw,o.hw*.9,o.hw,0,.02,.04,c2,1);bx(hd,o.hw*.55,o.hw*.45,o.sn,0,-.02,o.hw/2+o.sn/2,c3,1);bx(hd,.03,.03,.02,0,-.005,o.hw/2+o.sn,0x111111,1);
for(const s of [-1,1]){bx(hd,o.ew,o.eh,.04,s*(o.hw/2-.01),o.hw*.55+(o.pt?o.eh/2:-.01),.0,o.ec||c,1);bx(hd,.025,.025,.02,s*o.hw*.25,.045,o.hw/2+.045,0x111111,1);}
if(o.pom)bx(hd,o.hw+.02,.07,o.hw+.02,0,.1,.03,c,1);
for(const [x,z] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const q=P(g,x*(bw/2-.025),lh,z*(bl/2-.04));bx(q,.04,lh,.04,0,-lh/2,0,c,1);bx(q,.045,.03,.06,0,-lh+.015,.012,c3,1);g.legs.push(q);}
const tl=P(g,0,lh+bh*.8,-bl/2);g.tail=tl;bx(tl,.03,.03,o.tl,0,.03,-o.tl/2,c,1);if(o.pom)bx(tl,.07,.07,.07,0,.03,-o.tl-.02,c,1);tl.rotation.x=o.tu===undefined?-.5:o.tu;
if(o.col)bx(g,bw+.012,.035,.05,0,lh+bh*.78,bl/2-.03,o.col,1);
g.scale.setScalar(o.sc||1);return g;}
const COLR=[0xe5593f,0x3b82d6,0x6dbf5a,0xf2c94c,0xff6b9a];
function mkPet(kind,seed){const r=rngOf('pet'+kind+seed),pk=a=>a[Math.floor(r()*a.length)],col=pk(COLR);let g;
if(kind==='cat'){const cc=pk([0xe5a560,0x8a8f9a,0x1a1a1a,0xf2ead8]);g=quad({bw:.09,bh:.09,bl:.24,lh:.09,hw:.09,sn:.03,ew:.035,eh:.06,pt:1,c:cc,c2:r()<.4?0xf2ead8:cc,tl:.26,tu:-1.0,col});}
else if(kind==='rabbit'){const cc=pk([0xf2ead8,0x8a8f9a,0xc9a26b]);g=quad({bw:.09,bh:.1,bl:.16,lh:.05,hw:.08,sn:.03,ew:.03,eh:.14,pt:1,c:cc,tl:.04,tu:-.2,c3:0xf2ead8});}
else if(kind==='tortoise'){g=new THREE.Group();g.legs=[];bx(g,.2,.09,.24,0,.1,0,0x4a6a3a,1);bx(g,.14,.06,.17,0,.17,0,0x5b7d46,1);const hd=new THREE.Group();hd.position.set(0,.09,.14);g.add(hd);g.head=hd;bx(hd,.05,.05,.07,0,0,.04,0x9a8a5a,1);
for(const [x,z] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const q=new THREE.Group();q.position.set(x*.09,.06,z*.08);g.add(q);bx(q,.05,.06,.05,0,-.03,0,0x9a8a5a,1);g.legs.push(q);}g.tail=new THREE.Group();g.add(g.tail);g.lh=.06;}
else if(kind==='parrot'){g=new THREE.Group();g.legs=[];bx(g,.06,.1,.05,0,0,0,0xd62d20,1);bx(g,.05,.05,.05,0,.08,.01,0xd62d20,1);bx(g,.025,.03,.03,0,.07,.045,0xf2c94c,1);const tl=new THREE.Group();tl.position.set(0,-.05,-.03);g.add(tl);bx(tl,.03,.02,.14,0,0,-.07,0x2f6db5,1);tl.rotation.x=.5;g.tail=tl;g.wings=[-1,1].map(s=>{const w=new THREE.Group();w.position.set(s*.035,.0,0);g.add(w);bx(w,.07,.02,.06,s*.035,0,0,0x2f6db5,1);return w;});g.lh=0;}
else{const br=Math.floor(r()*6),P2=[{bw:.14,bh:.15,bl:.32,lh:.13,hw:.12,sn:.08,ew:.04,eh:.09,c:pk([0xd9b98a,0x1a1a1a,0x6b4a2b]),tl:.16,sc:1.2},{bw:.1,bh:.1,bl:.5,lh:.06,hw:.1,sn:.1,ew:.04,eh:.09,c:0x8a4a2a,tl:.12},{bw:.12,bh:.13,bl:.24,lh:.14,hw:.11,sn:.07,ew:.05,eh:.08,c:pk([0xf2ead8,0x1a1a1a,0xe5a560]),tl:.05,pom:1},{bw:.13,bh:.13,bl:.22,lh:.1,hw:.13,sn:.03,ew:.04,eh:.06,c:0xd9b98a,c3:0x3a2a1a,tl:.04,tu:-1.1},{bw:.13,bh:.14,bl:.3,lh:.14,hw:.12,sn:.07,ew:.04,eh:.08,pt:1,c:0x8a8f9a,c2:0xf2ead8,tl:.2,tu:-.2,sc:1.15},{bw:.12,bh:.12,bl:.26,lh:.07,hw:.11,sn:.07,ew:.045,eh:.09,pt:1,c:0xe5a560,c2:0xf2ead8,tl:.03,sc:1}][br];P2.col=col;g=quad(P2);g.br=br;}
g.kind=kind;g.ph=r()*9;return g;}
function gait(g,t,sp){const k=Math.min(1,sp/1.2);if(g.kind==='rabbit')g.position.y+=Math.abs(Math.sin(t*9+g.ph))*.07*k;else if(g.legs.length===4){const f=g.kind==='tortoise'?4:11,w=Math.sin(t*f+g.ph)*.7*k;g.legs[0].rotation.x=g.legs[3].rotation.x=w;g.legs[1].rotation.x=g.legs[2].rotation.x=-w;}
if(g.tail&&g.kind!=='tortoise')g.tail.rotation.y=Math.sin(t*(sp>.3?7:3)+g.ph)*(sp>.3?.6:.4);if(g.head&&g.kind!=='parrot')g.head.rotation.x=Math.sin(t*5+g.ph)*.08*k+(k<.1?Math.sin(t*.7+g.ph)*.15:0);}
function lie(p){p.legs.forEach(q=>q.visible=false);p.position.y=-(p.lh||0)*p.scale.y+.02;p.lying=1;}
function bark(){if(!AX||!SET.sfx||!SG2)return;const t=AX.currentTime+.01;SG2.gain.value=SET.sfx*.5;tone(380,t,.09,'square',.2,SG2,200);tone(330,t+.16,.1,'square',.2,SG2,170);}
// ---- pets walking with pedestrians ----
const PETS=[],PK=['dog','dog','cat','dog','parrot','dog','tortoise','dog','dog','rabbit','dog','dog','dog','cat'];
[1,3,5,8,10,12,14,17,19,22,24,27,29,32].forEach((pi,k)=>{const o=PED[pi];if(!o)return;const kind=PK[k],g=mkPet(kind,'p'+k);g.visible=false;sc.add(g);let l=null;if(kind==='dog'||kind==='cat'){l=new THREE.Mesh(gm(.012,.012,1),new THREE.MeshBasicMaterial({color:k%2?0xe5593f:0x222222}));l.visible=false;sc.add(l);}PETS.push({o,g,l,kind,has:0,sp:0});});
function petAnim(t,dt,d2){for(const P of PETS){const o=P.o,g=P.g;if(!o.visible){g.visible=false;if(P.l)P.l.visible=false;P.has=0;continue;}const ry=o.rotation.y,fx=Math.sin(ry),fz=Math.cos(ry),cs=Math.cos(ry),sn=Math.sin(ry);
if(P.kind==='parrot'){g.visible=true;g.position.set(o.position.x+cs*.15,o.position.y+.58,o.position.z-sn*.15);g.rotation.y=ry;const fl=Math.sin(t*.4+g.ph)>.92;g.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*(fl?Math.sin(t*30)*.9:.15));g.rotation.z=Math.sin(t*2+g.ph)*.05;continue;}
const back=P.kind==='tortoise'?.55:.85,tx=o.position.x-fx*back+cs*.28,tz=o.position.z-fz*back-sn*.28;
if(!P.has){P.has=1;g.position.set(tx,gy(tx,tz),tz);}const dx=tx-g.position.x,dz=tz-g.position.z,d=Math.hypot(dx,dz);let mv=0;
if(d>.05){const sp=P.kind==='tortoise'?1.6:P.kind==='rabbit'?2.4:3.6,st=Math.min(d,(Math.min(sp,d*5)+.15)*d2);g.position.x+=dx/d*st;g.position.z+=dz/d*st;mv=dt>0?st/dt:0;if(st>.002)g.rotation.y=Math.atan2(dx,dz);}
g.position.y=gy(g.position.x,g.position.z);g.visible=true;gait(g,t,mv/(d2>0?1:1));
if(P.l){const hx0=o.position.x+cs*.17+fx*.08,hz0=o.position.z-sn*.17+fz*.08,hy=o.position.y+.38,cy=g.position.y+(g.lh||.1)+.1,L=Math.hypot(g.position.x-hx0,cy-hy,g.position.z-hz0)||.01;P.l.visible=true;P.l.position.set((hx0+g.position.x)/2,(hy+cy)/2,(hz0+g.position.z)/2);P.l.scale.z=L;P.l.lookAt(g.position.x,cy,g.position.z);}}}
// ---- shop pets that nap beside the stalls (the market is pet-friendly) ----
function shopPet(g,i){const k=['dog','cat','dog','dog','rabbit','cat'][hsh('spk'+i)%6],p=mkPet(k,'s'+i);if(k==='rabbit'){p.position.set(.58,0,.5);}else{lie(p);p.position.x+=(hsh('spx'+i)%2?.58:-.58);p.position.z=.52;}p.rotation.y=(hsh('spr'+i)%628)/100;g.add(p);g.userData.pet=p;}
function shopPetAnim(t){for(const s of stalls.values()){const p=s.m.userData.pet;if(!p)continue;if(!s.m.visible||s.st==='walk'||s.st==='away'||s.st==='closed')continue;const d=Math.hypot(Pp.x-s.m.position.x,Pp.z-s.m.position.z),near=d<3;
if(p.kind==='rabbit'){p.head.rotation.x=Math.sin(t*3+p.ph)*.1;p.position.y=near?Math.abs(Math.sin(t*8))*.04:0;}
else{p.children[0].scale.y=1+Math.sin(t*1.8+p.ph)*.05;if(p.tail)p.tail.rotation.y=near?Math.sin(t*14)*.7:Math.sin(t*1.2+p.ph)*.1;if(p.head)p.head.rotation.x=near?Math.sin(t*3)*.12:.12;}}}
// ---- the dog park on the lawns ----
const PARK=[[34.9,4.4,36.6,5.4],[35.0,16.2,36.6,16.4]].map(([ox,oz,dx,dz],i)=>{const o=genChar('local','pk'+i,{top:i?'hoodie':'jacket',topc:i?'#3b82d6':'#c0262d',hat:i?'cap':'none'});const d=mkPet('dog','park'+i);const b=new THREE.Mesh(gm(.07,.07,.07),new THREE.MeshBasicMaterial({color:0xf2c94c}));sc.add(o,d,b);b.visible=false;return {o,d,b,ox,oz,st:0,tm:1+i,bx:ox,bz:oz,tx:ox,tz:oz,u:0,fx:ox,fz:oz};});
function parkAnim(t,d2){const day=S.ph==='day'||S.ph==='setup';for(const P of PARK){P.o.visible=P.d.visible=day;if(!day){P.b.visible=false;continue;}P.o.position.set(P.ox,gb(P.ox,P.oz),P.oz);const dg=P.d;
if(P.st===0){P.tm-=d2;P.o.rotation.y=Math.atan2(P.d.position.x-P.ox,P.d.position.z-P.oz);P.b.visible=false;if(!P.init){P.init=1;dg.position.set(P.ox+1.5,gb(P.ox+1.5,P.oz),P.oz+.5);}
swing(P.o,0);P.o.ar.rotation.x=-.4;if(P.tm<=0){P.st=1;P.u=0;const a=Math.random()*6.28,r=2.5+Math.random()*2.5;P.tx=Math.max(34.3,Math.min(38.7,P.ox+Math.cos(a)*r));P.tz=P.oz+Math.sin(a)*r;P.fx=P.ox;P.fz=P.oz;}gait(dg,t,0);}
else if(P.st===1){P.u+=d2/1.1;P.o.ar.rotation.x=-2.6+Math.min(1,P.u)*.8;const u=Math.min(1,P.u);P.b.visible=true;P.b.position.set(P.fx+(P.tx-P.fx)*u,gb(P.tx,P.tz)+.3+Math.sin(u*Math.PI)*1.6,P.fz+(P.tz-P.fz)*u);if(P.u>=1){P.st=2;P.b.position.y=gb(P.tx,P.tz)+.05;}gait(dg,t,1.2);dg.rotation.y=Math.atan2(P.tx-dg.position.x,P.tz-dg.position.z);dg.position.x+=(P.tx-dg.position.x)*.03;dg.position.z+=(P.tz-dg.position.z)*.03;}
else if(P.st===2){const dx=P.tx-dg.position.x,dz=P.tz-dg.position.z,d=Math.hypot(dx,dz),st=Math.min(d,4.2*d2);if(d>.2){dg.position.x+=dx/d*st;dg.position.z+=dz/d*st;dg.rotation.y=Math.atan2(dx,dz);gait(dg,t,3);}else{P.st=3;P.b.visible=false;}}
else{const dx=P.ox+.4-dg.position.x,dz=P.oz+.4-dg.position.z,d=Math.hypot(dx,dz),st=Math.min(d,3.4*d2);if(d>.3){dg.position.x+=dx/d*st;dg.position.z+=dz/d*st;dg.rotation.y=Math.atan2(dx,dz);gait(dg,t,2.4);P.b.visible=true;P.b.position.set(dg.position.x+Math.sin(dg.rotation.y)*.2,dg.position.y+.2,dg.position.z+Math.cos(dg.rotation.y)*.2);}else{P.st=0;P.tm=2+Math.random()*3;P.b.visible=false;}}
dg.position.y=gb(dg.position.x,dg.position.z);}}
// ---- random street events ----
const EVC=[0,1,2,3,4,5,6,7,8,9].map(i=>{const m=genChar('tourist','ev'+i);m.visible=false;sc.add(m);return m;});
const EVD=[0,1,2,3,4,5,6,7].map(i=>{const m=mkPet('dog','ev'+i);m.visible=false;sc.add(m);return m;});
const EVT={d0:-1,cd:40,cur:null,pDone:0},FL2=mkPath([[22.9,10.66],[27.5,10.66],[27.5,11.4],[27.5,14.2],[27.5,14.65],[28.45,14.65],[28.45,14.1],[28.45,11.45],[29.6,11.45],[31.2,13.4],[32.4,18.9],[44,18.9],[44,3]]);
function evHide(){if(EVT.cur&&EVT.cur.fl)sc.remove(EVT.cur.fl);EVC.forEach(m=>m.visible=false);EVD.forEach(m=>m.visible=false);EVT.cur=null;}
function startParade(){evHide();EVT.cur={k:'parade',u:0,n:7};EVC.slice(0,7).forEach((m,i)=>buildChar(m,mkDNA('tourist','pr'+S.day+'_'+i)));S.tide=Math.min(120,S.tide+8);S.cul=cl(S.cul+.5);toast('Pet parade! Dogs and owners march to the market','\u{1F415}');sfx('goal');bark();}
function startHeist(){const c=[...stalls.values()].filter(s=>s.st==='open'&&ST[s.i][1]==='food'&&Math.hypot(s.m.position.x-13,s.m.position.z-10)<30);if(!c.length)return false;const s=c[Math.floor(Math.random()*c.length)];evHide();const d=EVD[0];d.visible=false;
const P=[[37.5,18.9],[32.4,18.9],[31.2,13.4],[29.6,11.45],[28.45,11.45],[28.45,14.1],[28.45,14.65],[27.5,14.65],[27.5,14.2],[27.5,11.4],[27.5,10.66],[24,10.66]];if(s.m.position.x<22.9){P.push([22.9,10.66],[21.2,10.65]);}P.push([s.m.position.x,s.m.position.z]);EVT.cur={k:'heist',s,pa:mkPath(P),u:0,ph:0,w:0};toast('A cheeky dog is heading for '+ST[s.i][0]+'!','\u{1F436}');bark();return true;}
function startPup(){evHide();const sp=[[33,6],[36,16],[27,12],[24,9.4],[16,10.65],[38,10],[26,7]],q=sp[Math.floor(Math.random()*sp.length)],d=EVD[1];d.visible=true;d.position.set(q[0],gy(q[0],q[1]),q[1]);d.scale.setScalar(.8);EVT.cur={k:'pup',x:q[0],z:q[1],end:S.t+150};toast('A lost puppy is wandering the market. Find it!','\u{1F43E}');}
function startTour(){evHide();EVT.cur={k:'tour',pa:mkPath([[44.5,21.6],[44.5,18.9],[32.4,18.9],[31.2,13.4],[29.6,11.45],[28.45,11.45],[28.45,14.1],[28.45,14.65],[27.5,14.65],[27.5,14.2],[27.5,11.4],[27.5,10.66],[24,10.66],[22.9,10.66],[21.4,10.65]]),u:0};EVC.forEach((m,i)=>buildChar(m,i===0?mkDNA('local','guide'+S.day,{top:'jacket',topc:'#e5593f',hat:'cap',hatc:'#e5593f',acc:'lanyard'}):mkDNA('tourist','tg'+S.day+'_'+i,{acc:i%3===0?'camera':i%3===1?'backpack':'fanny'})));S.tide=Math.min(120,S.tide+6);toast('A tour group is arriving at the market','\u{1F6A9}');}
function startWedding(){evHide();const o=[{top:'dress',topc:'#ffffff',hair:'bun',hat:'none',acc:'none'},{top:'jacket',topc:'#1d1d2a',top2:'#ffffff',hat:'none',acc:'none',bot:'trousers',botc:'#1d1d2a'},{acc:'camera',top:'tee',topc:'#222222'},{top:'dress',topc:'#ff6b9a',acc:'none'},{top:'shirt',topc:'#3b82d6',acc:'none'}];EVC.slice(0,5).forEach((m,i)=>buildChar(m,mkDNA('local','wd'+S.day+'_'+i,o[i])));
const fl=new THREE.Mesh(gm(.12,.12,.12),new THREE.MeshBasicMaterial({color:0xffffff}));fl.visible=false;sc.add(fl);EVT.cur={k:'wed',end:S.t+100,fl};S.cul=cl(S.cul+.8);S.tide=Math.min(120,S.tide+4);toast('Wedding photo shoot at the square: the market is the backdrop','\u{1F492}');}
function evMove(m,pa,d,t,sp){const q=atD(pa,d);m.position.set(q[0],gy(q[0],q[1]),q[1]);m.rotation.y=Math.atan2(q[2],q[3]);swing(m,Math.sin(t*9+sp)*.6);return q;}
function evAnim(t,d2,dm,h){if(EVT.d0!==S.day||EVT.sref!==S){EVT.d0=S.day;EVT.sref=S;evHide();EVT.cd=40+Math.random()*60;EVT.pDone=0;}
const c=EVT.cur;
if(!c){if(S.ph==='day'&&S.speed){EVT.cd-=dm;if(S.ev&&S.ev.pets&&!EVT.pDone&&h>=13.5){EVT.pDone=1;startParade();return;}if(EVT.cd<=0&&h<19){EVT.cd=70+Math.random()*90;const r=Math.random();if(r<.2)startParade();else if(r<.42){if(!startHeist())startPup();}else if(r<.62)startPup();else if(r<.82)startTour();else startWedding();}}return;}
if(S.ph!=='day'&&S.ph!=='setup'){evHide();return;}
if(c.k==='parade'){c.u+=3.2*d2;let alive=0;EVC.slice(0,7).forEach((m,i)=>{const pos=c.u-i*1.9,dg=EVD[i];if(pos<=0||FL2.L-pos<=.5){m.visible=dg.visible=false;return;}alive++;m.visible=dg.visible=true;const q=atD(FL2,FL2.L-pos);m.position.set(q[0],gy(q[0],q[1]),q[1]);m.rotation.y=Math.atan2(-q[2],-q[3]);swing(m,Math.sin(t*9+i)*.6);m.ar.rotation.x=-.5;const bx2=q[0]+Math.cos(m.rotation.y)*.3-q[2]*.8,bz2=q[1]-Math.sin(m.rotation.y)*.3-q[3]*.8;dg.position.set(bx2,gy(bx2,bz2),bz2);dg.rotation.y=m.rotation.y;gait(dg,t,2);});if(!alive&&c.u>FL2.L+14)evHide();}
else if(c.k==='tour'){c.u+=1.8*d2;let alive=0;EVC.forEach((m,i)=>{const d=c.u-i*.85;if(d<=0){m.visible=false;return;}if(d>=c.pa.L){if(m.visible){m.visible=false;pay(4+Math.round(Math.random()*6),22,10.6,1.8);}return;}alive++;m.visible=true;const q=atD(c.pa,d);m.position.set(q[0],gy(q[0],q[1]),q[1]);m.rotation.y=Math.atan2(q[2],q[3]);swing(m,Math.sin(t*8+i)*.55);if(i===0)m.ar.rotation.x=-2.7;else if(m.dna&&m.dna.acc==='camera'&&Math.sin(t*.7+i)>.8)m.ar.rotation.x=m.al.rotation.x=-2;});if(c.u>c.pa.L+EVC.length*.85+1)evHide();}
else if(c.k==='wed'){const X=39.2,Z=13.2,pos=[[0,0,0],[.5,.0,.1],[-2.2,1.5,.9],[-1,-1.2,-.3],[1.5,-1.1,-.4]];EVC.slice(0,5).forEach((m,i)=>{m.visible=true;const x=X+pos[i][0],z=Z+pos[i][1];m.position.set(x,gb(x,z),z);m.rotation.y=i===2?Math.atan2(2.2,-1.5):Math.atan2(pos[2][0]-pos[i][0],pos[2][1]-pos[i][1]);if(i<2){swing(m,0);m.ar.rotation.x=-.6;m.al.rotation.x=-.9;m.position.y+=0;}else if(i===2){m.ar.rotation.x=m.al.rotation.x=-1.7;}else{m.ar.rotation.x=-.5+Math.max(0,Math.sin(t*6+i))*-1.6;}});
const fo=Math.sin(t*1.3)>.96;c.fl.visible=fo;c.fl.position.set(X-2.2+.3,gb(X,Z)+.9,Z+1.5+.3);if(S.t>c.end){c.fl.visible=false;evHide();}}
else if(c.k==='pup'){const d=EVD[1];d.position.y=gy(d.position.x,d.position.z);gait(d,t,0);d.rotation.y=Math.atan2(Pp.x-d.position.x,Pp.z-d.position.z)*.3+Math.sin(t)*.3;d.head.rotation.z=Math.sin(t*2)*.2;if(Math.hypot(Pp.x-c.x,Pp.z-c.z)<1.5){const v=25+Math.round(Math.random()*40);S.cash+=v;S.earn+=v;gainXP(8);S.cul=cl(S.cul+.5);popup('+€'+v,c.x,c.z,1.8);toast('Puppy reunited with its owner: reward €'+v,'\u{1F415}');sfx('goal');bark();d.scale.setScalar(1);evHide();}else if(S.t>c.end){toast('The puppy trotted home on its own','\u{1F43E}');d.scale.setScalar(1);evHide();}}
else if(c.k==='heist'){const d=EVD[0],pa=c.pa;d.visible=true;if(c.ph===0){c.u+=3.4*d2;const q=atD(pa,c.u);d.position.set(q[0],gy(q[0],q[1]),q[1]);d.rotation.y=Math.atan2(q[2],q[3]);gait(d,t,3);if(c.u>=pa.L-.2){c.ph=1;c.w=.8;c.s.busy=1.6;const v=6+Math.round(Math.random()*9);S.cash=Math.max(0,S.cash-v);S.earn-=v;popup('-€'+v,d.position.x,d.position.z,1.6);toast('A dog snatched a sausage from '+ST[c.s.i][0]+' (-€'+v+')','\u{1F32D}');bark();}}
else if(c.ph===1){c.w-=d2;gait(d,t,0);d.position.y+=Math.abs(Math.sin(t*14))*.04;if(c.w<=0)c.ph=2;}
else{c.u-=4.6*d2;const q=atD(pa,Math.max(0,c.u));d.position.set(q[0],gy(q[0],q[1]),q[1]);d.rotation.y=Math.atan2(-q[2],-q[3]);gait(d,t,3.5);if(c.u<=0){d.visible=false;evHide();}}}}
