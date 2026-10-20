/* MF Borges Tycoon - logic module (split from the single-file game; loads in order, shares global scope) */
// ---------- game logic ----------
const cnt=a=>{let n=0;for(const s of stalls.values())if(G[s.z][s.x].a===a)n++;return n;},wcn=()=>{let n=0;for(const s of stalls.values())if(ST[s.i][2]==='wc')n++;return n;};
const cl=v=>Math.max(0,Math.min(100,v)),fmt=m=>String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(Math.floor(m%60)).padStart(2,'0'),hx=n=>'#'+n.toString(16).padStart(6,'0');
const phase=h=>h<11?'setup':h<CLOSE?'day':h<22?'changeover':h<26?'night':'end',dow=()=>(S.day-1)%7,dbl=()=>dow()===3||dow()===4;
function init(){closeSP();for(const s of stalls.values())delStall(s);stalls.clear();for(const q of SLOTS.r1.concat(SLOTS.r2,SLOTS.bk))q.u=null;S={day:1,t:540,cash:1500,cul:10,hyp:10,her:80,act:[0,'none','none'],sel:0,cat:'food',speed:2,ph:'setup',att:[0,0,0],over:false,log:'',pre:'',xp:0,lv:1,bonus:0,earn:0,sales:0,gl:[],bars:0,barOn:[0,0,0,0],barRate:[0,0,0,0],evt:0,fame:{techno:0,metal:0,rock:0,indie:0,pop:0},up:{tix:0,cloak:0,bar:0,snd:0,lit:0,sec:0},rep:{tix:0,bar:0,cloak:0,merch:0,cost:0,fine:0},hist:[],rs:2,tide:0,entered:0,dayAct:'none',gig:0,gigDone:0,pr:0,gr:0,band:{},inv:{},disc:{},brand:{},bheat:{},mi:1,gigs:0,sold:0,sets:0,ag:'bands',agf:'all',ach:{}};newDay();morning();reskin(0);dressMgr(0);}
function newDay(){const r=Math.random();S.ev=EV[r<.35?0:1+Math.floor(Math.random()*(EV.length-1))];S.foot=.9+Math.random()*.2;let m=S.pre+`${DN[dow()]}: ${S.ev.n}. `+(dbl()?'Both rooms can host tonight.':'Only one room can host tonight.');S.pre='';
if(S.ev.ins){if(S.her<55){S.cash-=300;m+=' Inspector fines you €300 (heritage too low).';}else{S.cul=cl(S.cul+2);m+=' Inspection passed: +2 culture.';}}S.log=m;newGoals();S.earn=0;S.sales=0;S.evt=0;S.gigDone=0;S.gig=0;shop();ui();}
function shopOld(){for(const s of stalls.values()){const a=G[s.z][s.x].a;s.m.userData.v.visible=S.ph!=='night'||(a!==1&&a!==2);}}
function build(){const tabs=$('tabs');[['tb','Build'],['tq','Goals'],['tn','Night'],['ta','Acts'],['tg','Go'],['ts','Set']].forEach(([id,n],i)=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{['tb','tq','tn','ta','tg','ts'].forEach(x=>{$(x).hidden=x!==id;});if(id==='ta')renderAgency();[...tabs.children].forEach(y=>y.classList.toggle('on',y===b));};tabs.appendChild(b);if(!i)b.classList.add('on');});
CATS.forEach(([k,n])=>{const b=document.createElement('button');b.id='c_'+k;b.textContent=n;b.onclick=()=>{S.cat=k;ui();};$('cats').appendChild(b);});
ST.forEach((d,i)=>{const b=document.createElement('button');b.className='card';b.id='k_'+i;b.innerHTML=`<span class="sw" style="background:linear-gradient(90deg,${hx(d[3])} 50%,${hx(d[4])} 50%)"></span><span>${d[12]} ${d[0]}</span><small>Lv${d[10]} · ${SCHN[sch(i)]} · €${d[6]}${d[7]?' · €'+d[7]+'/h':(d[1]==='lure'?' · lure +'+Math.round(LP[d[0]]*100)+'%':' · +150 toilet cap.')}${d[8]?' · CUL+'+d[8]:''}${d[9]?' · HYPE+'+d[9]:''}</small>`;b.onclick=()=>{S.sel=i;ui();};$('cards').appendChild(b);});
permBtn();$('rep').onclick=()=>{if(S.cash>=200&&S.ph!=='night'&&S.her<100){S.cash-=200;S.her=cl(S.her+10);S.log='Ironwork repaired.';ui();}};
for(const r of [1,2]){const l=document.createElement('span');l.className='px';l.textContent='Room '+r;const s=document.createElement('select');s.id='a'+r;for(const k in AC){const o=document.createElement('option');o.value=k;o.textContent=AC[k].n;s.appendChild(o);}
s.onchange=()=>{S.act[r]=s.value;if(!dbl()&&s.value!=='none')S.act[3-r]='none';ui();};$('sel').append(l,s);}
for(const v of [0,1,2,4]){const b=document.createElement('button');b.id='v'+v;b.textContent=v?v+'\u00D7':'\u23F8';b.onclick=()=>{S.speed=v;ui();};$('sp').appendChild(b);}
const B=(t,f,p)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>f(b);(p||$('nav')).appendChild(b);};
const go=(x,z,hw)=>{Pp.x=x;Pp.z=z;VW.follow=true;VW.hw=hw;};
B('Follow me',()=>VW.follow=true);B('Room 1',()=>go(12,6,7));B('Room 2',()=>go(12.5,15,7));B('Main hall',()=>go(13,10.5,9));B('Food zone',()=>go(24.5,10.5,8));B('Toilets',()=>go(4.5,15.5,4));
B('Whole map',()=>{const a=c.clientWidth/c.clientHeight;VW.follow=false;Object.assign(VW,{tx:13.5,tz:10.5,hw:lim((VW.plan?24:34)*(a<1?.85/a:1))});});
B('Top view',b=>{VW.plan=!VW.plan;b.classList.toggle('on',VW.plan);});
B('Cutaway',b=>{CUT=!CUT;b.classList.toggle('on',CUT);const s=CUT?.25:1;RW.forEach(w=>{w.m.scale.y=s;w.m.position.y=w.h*s/2;});});
B('Roof off',b=>{roof.visible=!roof.visible;b.classList.toggle('on',!roof.visible);});
B('Shadows off',b=>{const o=!sun.castShadow;sun.castShadow=o;R.shadowMap.enabled=o;b.classList.toggle('on',!o);sc.traverse(m=>{if(m.material&&!Array.isArray(m.material))m.material.needsUpdate=true;});});
function isoReset(){VW.plan=false;[...$('nav').children].forEach(b=>{if(b.textContent==='Top view')b.classList.remove('on');});VW.elT=.563;VW.azT=(Math.round((VW.azT-Math.PI/4)/(Math.PI/2)))*Math.PI/2+Math.PI/4;if(VW.hw>16||VW.hw<5)VW.hw=10;VW.follow=true;}window.isoReset=isoReset;B('Classic angle',isoReset);B('Low angle',()=>VW.elT=.3);B('High angle',()=>VW.elT=1.1);
const ct=$('ctl');B('\u25C7',isoReset,ct);B('\u2B06',()=>VW.elT=Math.min(1.35,VW.elT+.15),ct);B('\u2B07',()=>VW.elT=Math.max(.3,VW.elT-.15),ct);B('+',()=>VW.hw=lim(VW.hw/1.35),ct);B('\u2212',()=>VW.hw=lim(VW.hw*1.35),ct);B('\u27F2',()=>VW.azT-=Math.PI/2,ct);B('\u27F3',()=>VW.azT+=Math.PI/2,ct);buildSet();buildNight();buildLab();buildShowUI();}
function ui(){$('dw').textContent=DN[dow()];$('d').textContent=S.day;$('t').textContent=fmt(S.t);$('ph').textContent=S.ph==='day'?'market':S.ph;$('w').textContent=S.ev.i||'\u2600\uFE0F';
$('cash').textContent=Math.round(S.cash);$('lv').textContent=S.lv;$('bxp').style.width=(100*S.xp/need(S.lv))+'%';$('sl').textContent='stalls '+nStalls()+'/'+maxS();$('perm').textContent='Permit +1 slot €'+(300+150*S.bonus);checkGoals();renderGoals();renderNight();renderLims();setMgr();renderSP();renderAgency();checkAch();for(const [k,v] of [['cul',S.cul],['hyp',S.hyp],['her',S.her]]){$(k).textContent=Math.round(v);$('b'+k).style.width=v+'%';}
$('msg').textContent=S.log+(S.ph==='changeover'?' Clear stalls in rooms with events.':S.ph==='night'?` Guests: R1 ${S.att[1]}, R2 ${S.att[2]}.`:'');
$('nt').textContent=`${DN[dow()]}: ${dbl()?'both rooms can host tonight':'only one room can host tonight'}. At 20:00 vendors pack the hall stalls into a closed room (Room 1 first, then Room 2, then backstage; the rest go home and return next day). Events start at 22:00 and only food-zone and outer stalls trade at night. Toilets hold ${300+150*wcn()} guests (club WCs 300, +150 per portable WC). Stalls: R1 ${cnt(1)}, R2 ${cnt(2)}, Hall ${cnt(0)}, Food ${cnt(3)}, Outer ${cnt(4)}.`;
CATS.forEach(([k])=>$('c_'+k).classList.toggle('on',S.cat===k));ST.forEach((d,i)=>{const b=$('k_'+i);b.hidden=d[1]!==S.cat;b.classList.toggle('on',S.sel===i);b.classList.toggle('lock',S.lv<d[10]);});
for(const v of [0,1,2,4])$('v'+v).classList.toggle('on',S.speed===v);for(const r of [1,2]){$('a'+r).value=S.act[r];$('a'+r).disabled=S.ph==='night';}}
function nightOld(){const mc2=cnt(0),n=[1,2].filter(r=>S.act[r]!=='none').length,wk=dow()===3||dow()===4?1.2:dow()===5?1.1:1,log=[];S.att=[0,0,0];
for(const r of [1,2]){const a=AC[S.act[r]];if(!a.cost)continue;const k=cnt(r)*.07+mc2*.03,att=Math.round(Math.min(CAP[r],(a.base+S.hyp*a.k)*wk)*Math.max(.3,1-k)*(n>1?.9:1));S.att[r]=att;
const rev=att*a.price;S.cash+=rev-a.cost;S.hyp=cl(S.hyp+a.hyp);S.cul=cl(S.cul+a.cul);S.her=cl(S.her-a.her-cnt(r)*.8);log.push(`Room ${r}: ${att} guests, €${Math.round(rev-a.cost)}`);}
if(!n){S.hyp=cl(S.hyp-3);S.log='Dark night: no events, hype slips.';}else{
const T=S.att[1]+S.att[2],cap=300+150*wcn();if(T>cap){const p=Math.min(3,Math.ceil((T-cap)/300));S.hyp=cl(S.hyp-p);log.push(`toilet queues -${p} hype`);}
if(n>1){S.her=cl(S.her-2);if(Math.random()<.3){S.cash-=250;S.hyp=cl(S.hyp-2);log.push('noise complaint -€250');}}S.log=log.join(' · ')+'. Bars are open.';S.evt=n;gainXP(15*n);sfx('event');}barSet();shop();}
function endDay(){dailyEco();let a_=0,b_=0;const cats=new Set();for(const s of stalls.values()){a_+=ST[s.i][8];b_+=ST[s.i][9];if(ST[s.i][1]!=='amen')cats.add(ST[s.i][1]);}
S.cash-=400;S.cul=cl(S.cul+Math.min(4,a_/6)+cats.size*.3);S.hyp=cl(S.hyp+Math.min(3,b_/10)-1);S.act=[0,'none','none'];S.att=[0,0,0];S.rep={tix:0,bar:0,cloak:0,merch:0,cost:0,fine:0};for(const g in S.fame)S.fame[g]=Math.max(0,S.fame[g]-.4);S.day++;
while(S.day<=DAYS&&dow()===6){S.her=cl(S.her+8);S.cash-=200;S.day++;S.pre='Monday: closed for maintenance (+8 heritage). ';}S.t=540;
if(S.her<=0||S.cash<-1000)return fin(false,S.her<=0?'The ironwork gave out and the city closed the hall.':'You ran out of credit.');
if(S.day>DAYS){const ok=S.cul>=30&&S.hyp>=30&&S.her>=50&&S.cash>=0;return fin(ok,ok?'The city renews your concession. Market and club both thrive.':`Review failed. Needed Culture 30+, Hype 30+, Heritage 50+, cash \u2265 0. You had ${Math.round(S.cul)}, ${Math.round(S.hyp)}, ${Math.round(S.her)}, €${Math.round(S.cash)}.`);}newDay();}
function fin(w,m){S.over=true;$('et').textContent=w?'Concession renewed':'Concession lost';$('em').textContent=m;$('end').style.display='flex';}
$('rs').onclick=()=>{$('end').style.display='none';init();};
// ---------- input: tap build, drag/two-finger pan, pinch/wheel zoom, rotate ----------
const ray=new THREE.Raycaster(),pl=new THREE.Plane(new THREE.Vector3(0,1,0),0),pt=new THREE.Vector3();
function tile(e){const r=c.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),cam);
pl.constant=0;if(!ray.ray.intersectPlane(pl,pt))return null;for(let k=0;k<2;k++){pl.constant=-gy(pt.x,pt.z);ray.ray.intersectPlane(pl,pt);}pl.constant=0;const x=Math.floor(pt.x),z=Math.floor(pt.z);return x<0||x>=W||z<0||z>=H?null:[x,z];}
function click(e){if(INSPECT){inspect(e);return;}if(S.over)return;const t=tile(e);if(!t)return;const k=t[0]+','+t[1],o=stalls.get(k),g=G[t[1]][t[0]],d=ST[S.sel];
if(!o&&SP)closeSP();if(!o&&window.BMODE===false)return;
if(o){openSP(o);return;}
else if(S.ph==='night')S.log='No building at night. Tap a stall to manage it.';
else if(S.ph!=='day'&&S.ph!=='setup')S.log='Stalls can only be built in the morning or by day.';
else if(!g.b)S.log='Not buildable: stage, bar, office, door, wall, toilets or backstage.';
else if(d[1]==='lure'&&!(g.a===3||g.a===4||g.a===9)){S.log='Street team items go outside: on the terrace or in the square.';sfx('bad');}
else if(d[1]!=='lure'&&g.a===9){S.log='Market stalls stay on the terrace. Use street team items in the square.';sfx('bad');}
else if(d[1]==='lure'&&nLure()>=2+S.lv){S.log='Street team limit reached ('+(2+S.lv)+'). Level up for more.';sfx('bad');}
else if(S.lv<d[10]){S.log='Locked: reach level '+d[10]+' to build '+d[0]+'.';sfx('bad');}
else if(d[1]!=='amen'&&d[1]!=='lure'&&nStalls()>=maxS()){S.log='Stall limit reached ('+maxS()+'). Level up or buy a permit.';sfx('bad');}
else if(S.cash<d[6]){S.log='Not enough cash.';sfx('bad');}
else{S.cash-=d[6];const m=mkStall(S.sel);m.position.set(t[0]+.5,gy(t[0]+.5,t[1]+.5),t[1]+.5);m.rotation.y=(S.brot||0)*Math.PI/2;sc.add(m);const so={i:S.sel,m,x:t[0],z:t[1],acc:Math.random(),busy:0,u:{eq:0,st:0,sg:0},pz:1,tot:0,cnt:0,off:0,rot:S.brot||0,st:'setup',sc:.01,slot:null,k:null,d:0,pr:1,goal:null,wp:null,ph:0,crate:null};m.scale.setScalar(.01);stalls.set(k,so);addMark(so);S.log=`${d[0]} opens in ${AN[g.a]}.`;sfx('build');gainXP(4);}shop();ui();}
const bas=()=>VW.plan?{rx:1,rz:0,ux:0,uz:-1,f:1}:{rx:Math.sin(VW.az),rz:-Math.cos(VW.az),ux:-Math.cos(VW.az),uz:-Math.sin(VW.az),f:1/Math.sin(VW.el)};
function pan(dx,dy){const b=bas(),s=2*VW.hw/c.clientWidth;VW.tx=Math.max(-14,Math.min(W+14,VW.tx-dx*s*b.rx+dy*s*b.f*b.ux));VW.tz=Math.max(-14,Math.min(H+14,VW.tz-dx*s*b.rz+dy*s*b.f*b.uz));VW.follow=false;}
const ptrs=new Map();let moved=0;const pd=()=>{const a=[...ptrs.values()];return Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])||1;},ce=()=>{const a=[...ptrs.values()];return[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];};
const RB=new Set();c.addEventListener('contextmenu',e=>e.preventDefault());
c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(e.button===2||e.button===1||e.altKey)RB.add(e.pointerId);});
c.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p){const t=tile(e);hov.visible=!!t;if(t){hov.position.set(t[0]+.5,gy(t[0]+.5,t[1]+.5)+.06,t[1]+.5);hov.material.color.set(G[t[1]][t[0]].b?0x58d68d:0xff5a43);}return;}
if(RB.has(e.pointerId)){const dx=e.clientX-p[0],dy=e.clientY-p[1];p[0]=e.clientX;p[1]=e.clientY;VW.az+=dx*.008;VW.azT=VW.az;VW.el=VW.elT=Math.max(.3,Math.min(1.35,VW.el+dy*.006));moved=99;return;}
if(ptrs.size===2){const c0=ce(),d0=pd();p[0]=e.clientX;p[1]=e.clientY;const c1=ce(),d1=pd();pan(c1[0]-c0[0],c1[1]-c0[1]);VW.hw=lim(VW.hw*d0/d1);moved=99;}
else{const dx=e.clientX-p[0],dy=e.clientY-p[1];p[0]=e.clientX;p[1]=e.clientY;moved+=Math.abs(dx)+Math.abs(dy);if(moved>8)pan(dx,dy);}});
c.addEventListener('pointerup',e=>{if(ptrs.size===1&&moved<=8&&!RB.has(e.pointerId))click(e);ptrs.delete(e.pointerId);RB.delete(e.pointerId);});
c.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);RB.delete(e.pointerId);});
c.addEventListener('wheel',e=>{e.preventDefault();VW.hw=lim(VW.hw*Math.exp(e.deltaY*.0015));},{passive:false});
const keys={},jy={x:0,y:0};addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;if(k===' '){S.speed=S.speed?0:2;ui();}if(k==='q')VW.azT-=Math.PI/2;if(k==='['||k===',')VW.azT-=.2;if(k===']'||k==='.')VW.azT+=.2;if(k==='r')VW.elT=Math.min(1.35,VW.elT+.1);if(k==='f')VW.elT=Math.max(.3,VW.elT-.1);if(k==='escape'&&SP)closeSP();if(k==='v'||k==='home'||k==='0')isoReset();if(k==='e')VW.azT+=Math.PI/2;if(k==='+'||k==='=')VW.hw=lim(VW.hw/1.25);if(k==='-')VW.hw=lim(VW.hw*1.25);});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
const joy=$('joy'),kn=$('knob');let jp=null;
joy.addEventListener('pointerdown',e=>{jp=e.pointerId;joy.setPointerCapture(jp);});
joy.addEventListener('pointermove',e=>{if(e.pointerId!==jp)return;const r=joy.getBoundingClientRect();let x=(e.clientX-r.left-52)/40,y=(e.clientY-r.top-52)/40;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}jy.x=x;jy.y=-y;kn.style.transform=`translate(${x*30}px,${y*30}px)`;});
const jend=e=>{if(e.pointerId!==jp)return;jp=null;jy.x=jy.y=0;kn.style.transform='';};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
const hit=(x,z,r,a,b,c2,d)=>{const cx=Math.max(a,Math.min(x,c2)),cz=Math.max(b,Math.min(z,d));return (x-cx)**2+(z-cz)**2<r*r;};
function blocked(x,z){const r=.22;if(x<r||z<r||x>W-r||z>H-r)return true;for(const w of WALLS)if(hit(x,z,r,...w))return true;
for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const tx=Math.floor(x)+dx,tz=Math.floor(z)+dz,g=G[tz]&&G[tz][tx];if(g&&(['stg','kit','blk','wall'].includes(g.k)||stalls.has(tx+','+tz))&&hit(x,z,r,tx,tz,tx+1,tz+1))return true;}return false;}
function move(dt){let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+jy.x,iy=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)+jy.y;const l=Math.hypot(ix,iy);if(l<.1)return;if(l>1){ix/=l;iy/=l;}
const b=bas(),vx=ix*b.rx+iy*b.ux,vz=ix*b.rz+iy*b.uz,sp=4*dt,nx=Pp.x+vx*sp,nz=Pp.z+vz*sp;if(!blocked(nx,Pp.z))Pp.x=nx;if(!blocked(Pp.x,nz))Pp.z=nz;PL.rotation.y=Math.atan2(vx,vz);Pp.mv=1;}
// minimap
const mm=$('mm'),mg=mm.getContext('2d'),m0=document.createElement('canvas');m0.width=192;m0.height=84;{const q=m0.getContext('2d');for(let y=0;y<H;y++)for(let x=0;x<W;x++){q.fillStyle=KC[G[y][x].k];q.fillRect(x*4,y*4,4,4);}}
mm.addEventListener('pointerdown',e=>{const r=mm.getBoundingClientRect();VW.tx=(e.clientX-r.left)/r.width*W;VW.tz=(e.clientY-r.top)/r.height*H;VW.follow=false;});
function drawMM(){mg.drawImage(m0,0,0);for(const s of stalls.values()){mg.fillStyle=hx(ST[s.i][3]);mg.fillRect(s.x*4,s.z*4,4,4);}mg.fillStyle='#fff';mg.fillRect(Pp.x*4-2,Pp.z*4-2,5,5);mg.strokeStyle='#f2c94c';mg.strokeRect(VW.tx*4-VW.hw*1.6,VW.tz*4-VW.hw*1.1,VW.hw*3.2,VW.hw*2.2);}
// visitors
const ok=(x,z,a)=>{const g=G[Math.floor(z)]&&G[Math.floor(z)][Math.floor(x)];return g&&g.a===a&&!['stg','kit','blk'].includes(g.k);};
function tg(v){const u=v.userData;for(let i=0;i<6;i++){const nx=v.position.x+(Math.random()-.5)*6,nz=v.position.z+(Math.random()-.5)*6;if(ok(nx,nz,u.a)){u.tx=nx;u.tz=nz;return;}}u.tx=v.position.x;u.tz=v.position.z;}
function rate(){const vd=new Set();let r=0;for(const s of stalls.values())vd.add(s.i);const vb=1+Math.min(.3,.03*vd.size);
for(const s of stalls.values()){const g=G[s.z][s.x],d=ST[s.i],base=d[7]*AF[g.a]*(g.k==='site'?1.4:1);
if(S.ph==='night'){if(g.a===1||g.a===2)continue;r+=base*NM[d[1]]*Math.min(2,(S.att[1]+S.att[2])/500);}else r+=base*(S.ev.m[d[1]]||1);}
return S.ph==='night'?r:r*S.ev.f*S.foot*(.7+S.cul/100)*vb+15*S.foot;}
