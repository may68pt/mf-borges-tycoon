/* MF Borges Tycoon - gigs module (split from the single-file game; loads in order, shares global scope) */
// ---- gigs: night resolution, bars, report ----
function barSet(){const A=[0,AC[S.act[1]],AC[S.act[2]]],m=(1+.2*S.up.bar)*brandM('imperial');S.barRate=[0,S.att[1]*(A[1].bar||0)*m/240/2,S.att[2]*(A[2].bar||0)*m/240,(S.att[1]+S.att[2])*.75*m/240];S.barOn=[0,S.att[1]>0,S.att[2]>0,S.att[1]+S.att[2]>0];}
function night(){const n=[1,2].filter(r=>S.act[r]!=='none').length,wk=dow()===3||dow()===4?1.2:dow()===5?1.1:1,log=[],U=S.up,rep=S.rep,want=[0,0,0];let tot=0;S.att=[0,0,0];
for(const r of [1,2]){const a=AC[S.act[r]];if(!a.cost)continue;want[r]=Math.round(Math.min(CAP[r],(a.base+S.hyp*a.k)*wk*(1+S.fame[a.g]/150)*(1+.06*U.snd)*(1+Math.min(.3,S.tide/120))*fanF(a))*(n>1?.9:1));tot+=want[r];}
const tcap=350+350*U.tix,f=tot>tcap?tcap/tot:1;if(f<1)log.push('door queue: '+(tot-tcap)+' turned away');
for(const r of [1,2]){const a=AC[S.act[r]];if(!a.cost)continue;const att=Math.round(want[r]*f);S.att[r]=att;const tk=Math.round(att*a.price*brandM('voltio')),ck=Math.round(att*[0,.9,1.4,2][U.cloak]),mr=Math.round(att*a.mer*.6*brandM('granito')),cs=a.cost+Math.round(att*.5)+80*U.sec;
rep.tix+=tk;rep.cloak+=ck;rep.merch+=mr;rep.cost+=cs;S.cash+=tk+ck+mr-cs;S.hyp=cl(S.hyp+a.hyp+.5*(U.snd+U.lit));S.cul=cl(S.cul+a.cul);S.her=cl(S.her-a.her);
const sold=att>=CAP[r]*.95;S.fame[a.g]=Math.min(100,S.fame[a.g]+4+2*a.t+(sold?5:0));gainXP(12+8*a.t);S.hist.unshift('D'+S.day+' '+GEN[a.g].ic+att);onGig(r,a,att,sold);
log.push('R'+r+' '+(a.band?a.bn:GEN[a.g].n+' '+TIERS[a.t][0])+': '+att+(sold?' SOLD OUT':''));
if(Math.random()<.12*GEN[a.g].nz/2*(1-.25*U.sec)){const d2=100+Math.round(Math.random()*250);S.cash-=d2;rep.fine+=d2;S.her=cl(S.her-3);S.hyp=cl(S.hyp-2);log.push('incident -€'+d2);}}
S.hist.length=Math.min(S.hist.length,5);
if(!n){S.hyp=cl(S.hyp-3);S.log='Dark night: no events, hype slips.';}else{const cap=300+150*wcn(),T=S.att[1]+S.att[2];if(T>cap){const p=Math.min(3,Math.ceil((T-cap)/300));S.hyp=cl(S.hyp-p);log.push('toilet queues -'+p+' hype');}
if(n>1){S.her=cl(S.her-2);if(Math.random()<.3*(1-.2*U.snd)){S.cash-=250;rep.fine+=250;S.hyp=cl(S.hyp-2);log.push('noise complaint -€250');}}
S.log=log.join(' · ')+'.';S.evt=n;sfx('event');popup('+€'+Math.round(rep.tix),TB[0],TB[1],2.2);if(rep.cloak)popup('+€'+Math.round(rep.cloak),CB[0],CB[1],2.2);}
barSet();}
function showReport(){const r=S.rep,net=r.tix+r.bar+r.cloak+r.merch-r.cost-r.fine,f=Object.keys(GEN).map(g=>GEN[g].ic+Math.floor(S.fame[g])).join(' ');S.rs=S.speed||2;S.speed=0;
$('nr').innerHTML=`<div>${av(MGN)}<img src='${LOGO_URL}' style='height:22px;image-rendering:pixelated;display:block;margin:4px 0'><h2 class='px'>Night report · ${DN[dow()]}</h2><p>🎫 Tickets €${Math.round(r.tix)}<br>🍺 Bars €${Math.round(r.bar)}<br>🧥 Cloakroom €${Math.round(r.cloak)}<br>👕 Merch €${Math.round(r.merch)}<br>🎤 Acts, staff, security -€${Math.round(r.cost)}<br>⚠️ Incidents -€${Math.round(r.fine)}<br><b>Net €${Math.round(net)}</b></p><p class='m'>${net>0?'Fantastic night, my friend! Money, music, mayhem.':'Easy come, easy go, baby... we bleed tonight.'}</p><p class='m'>Fame ${f} · Market sales today €${Math.round(S.earn)} · ⭐ ${RNK[rankIdx()]} (${Math.floor(S.pr)} pts)</p><button id='nrb'>Next morning</button></div>`;
$('nr').style.display='flex';$('nrb').onclick=()=>{$('nr').style.display='none';S.speed=S.rs;endDay();ui();};sfx(net>0?'goal':'bad');}
function buildNight(){const P=$('tn'),f=document.createElement('div');f.id='fame';P.appendChild(f);const u=document.createElement('div');u.id='upg';u.className='cards';P.appendChild(u);
UPG.forEach(([id,n,ic,cost,unl])=>{const b=document.createElement('button');b.className='card';b.id='u_'+id;b.onclick=()=>{const L=S.up[id];if(L>=3)return;if(S.lv<unl[L]){sfx('bad');S.log='Unlocks at level '+unl[L]+'.';ui();return;}if(S.cash<cost[L]){sfx('bad');S.log='Not enough cash.';ui();return;}S.cash-=cost[L];S.up[id]++;sfx('level');toast(n+' is now level '+S.up[id],ic);ui();};u.appendChild(b);});
const h=document.createElement('p');h.id='hist';h.className='m';P.appendChild(h);}
function renderNight(){const P=$('fame');if(!P)return;P.innerHTML=Object.keys(GEN).map(g=>{const f=Math.floor(S.fame[g]),nx=TIERS.find(t=>t[4]>f);return `<div class='p' style='margin-top:4px'>${GEN[g].ic} ${GEN[g].n} fame ${f}<span class='bar' style='width:70px'><u style='width:${f}%'></u></span> ${nx?'next act: '+nx[0]+' at '+nx[4]:'all acts unlocked'}</div>`;}).join('');
for(const r of [1,2])for(const o of $('a'+r).options){const a=AC[o.value];o.disabled=!!a.g&&!canBook(a,r);}
UPG.forEach(([id,n,ic,cost,unl,ds])=>{const L=S.up[id],b=$('u_'+id);b.innerHTML=`${av(UAV[id])}<span>${ic} ${n} Lv${L}/3</span><small>${L>=3?'MAX':'€'+cost[L]+' · needs LV'+unl[L]}<br>${ds}</small>`;b.classList.toggle('lock',L<3&&S.lv<unl[L]);});
$('hist').textContent=S.hist.length?'Recent gigs: '+S.hist.join(' | '):'No gigs yet.';}
// ================= soundtrack: Portuguese folk, fado & samba by day; techno, metal & rock by night =================
let DS=null,trk='';
function dcurve(k){const n=256,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=(3+k)*x*20*Math.PI/180/(Math.PI+k*Math.abs(x));}return c;}
function nz(t,d,v,dest,type,f,q){const n=Math.floor(AX.sampleRate*d),b=AX.createBuffer(1,n,AX.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=AX.createBufferSource(),g=AX.createGain(),fl=AX.createBiquadFilter();fl.type=type||'highpass';fl.frequency.value=f||6000;if(q)fl.Q.value=q;s.buffer=b;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t);}
function kick(t,v,dest,hard){tone(150,t,.14,'sine',v,dest,40);if(hard)nz(t,.02,v*.5,dest,'highpass',3000);}
function snr(t,v,dest){nz(t,.12,v,dest,'highpass',1800);tone(190,t,.07,'triangle',v*.6,dest,120);}
function hh(t,v,dest,open){nz(t,open?.12:.03,v,dest,'highpass',7500);}
function pluck(f,t,d,v,dest,type){tone(f,t,d,type||'triangle',v,dest);tone(f*2.005,t,d*.5,'square',v*.25,dest);}
function acd(f,t,d,v,dest){tone(f,t,d,'square',v,dest);tone(f*1.006,t,d,'square',v*.8,dest);tone(f*.994,t,d,'sawtooth',v*.5,dest);}
function gtr(f,t,d,v){const o=AX.createOscillator(),o2=AX.createOscillator(),g=AX.createGain(),fl=AX.createBiquadFilter();o.type=o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f*1.007;fl.type='lowpass';fl.frequency.value=2600;g.gain.setValueAtTime(v,t);g.gain.setValueAtTime(v,t+d*.8);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(DS);o.start(t);o2.start(t);o.stop(t+d+.02);o2.stop(t+d+.02);}
function acid(f,t,d,v,open){const o=AX.createOscillator(),g=AX.createGain(),fl=AX.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;fl.type='lowpass';fl.Q.value=14;fl.frequency.setValueAtTime(open,t);fl.frequency.exponentialRampToValueAtTime(180,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d*1.1);o.connect(fl);fl.connect(g);g.connect(MG);o.start(t);o.stop(t+d*1.2);}
const TR={
folk:{bpm:130,len:12,f(s,b,t,sd){const ch=[[48,52,55],[41,45,48],[43,47,50],[48,52,55]][b],M=[[76,72,67,72,76,79],[77,74,69,74,77,81],[79,74,71,74,79,76],[76,72,67,72,76,72]][b];
if(s%2===0)acd(mf(M[s/2]),t,sd*1.8,.07,MG);if(s===0||s===6)tone(mf(ch[0]-12+(s===6?7:0)),t,sd*3.5,'triangle',.32,MG);
if(s===3||s===9||s===4||s===10){tone(mf(ch[1]),t,sd*1.2,'square',.05,MG);tone(mf(ch[2]),t,sd*1.2,'square',.05,MG);}
if(s===0||s===6)kick(t,.45,MG);if(s===3||s===9)snr(t,.12,MG);if(s%2===1)hh(t,.03,MG);if(s===0&&b===3)pluck(mf(M[0]+12),t,.4,.08,MG);}},
samba:{bpm:104,len:16,f(s,b,t,sd){const CH=[[50,53,57,60],[43,47,50,53],[48,52,55,59],[45,49,52,55]][b],M=[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0];
if(M[s])acd(mf(CH[(s*3+b)%4]+12),t,sd*1.4,.06,MG);if([0,3,6,8,11,14].includes(s))pluck(mf(CH[(s>>1)%4]+12),t,sd*1.5,.07,MG,'square');
if(s===0||s===6||s===8||s===14)tone(mf(CH[0]-12+(s===6||s===14?7:0)),t,sd*2.5,'triangle',.3,MG);
if(s===4||s===12)tone(80,t,.18,'sine',.5,MG,45);if(s===0||s===8)tone(95,t,.1,'sine',.25,MG,55);
if([0,3,6,8,10,13].includes(s))nz(t,.04,.05,MG,'bandpass',4200,3);nz(t,.025,s%2?.025:.045,MG,'highpass',8000);if(s===2||s===10)tone(mf(88),t,.08,'square',.04,MG);}},
fado:{bpm:68,len:16,f(s,b,t,sd){const CH=[[57,60,64],[50,53,57],[52,56,59],[57,60,64]][b],V=[[[0,69,6],[8,72,3],[12,71,3]],[[0,69,4],[4,65,4],[8,67,4],[12,69,4]],[[0,68,6],[8,71,4],[12,76,4]],[[0,69,16]]][b];
if(s%2===0)pluck(mf(CH[(s>>1)%3]+12),t,sd*3,.08,MG);if(s===0)tone(mf(CH[0]-24),t,sd*8,'triangle',.3,MG);
for(const n of V)if(n[0]===s){tone(mf(n[1]),t,n[2]*sd,'sine',.16,MG);tone(mf(n[1]*1.003),t,n[2]*sd,'triangle',.05,MG);}}},
techno:{bpm:140,len:16,f(s,b,t,sd){const R=[33,33,36,31][b],N=[0,0,12,0,0,7,0,12,0,0,3,0,7,0,12,0];
if(s%4===0)kick(t,.7,MG,1);if(s%4===2)hh(t,.1,MG,1);if(s%2===1)hh(t,.035,MG);if(s===4||s===12)snr(t,.2,MG);
if(s%2===0||s%4===3)acid(mf(R+N[s]+(b===3&&s>11?12:0)),t,sd*1.6,.18,2400+600*(b%2));
if((s===0||s===8)&&b%2===1)for(const k of [0,3,7])tone(mf(R+36+k),t,sd*2,'sawtooth',.04,MG);if(b===3&&s%2===0)nz(t,sd,.03+.01*s/4,MG,'highpass',3000+s*300);}},
metal:{bpm:156,len:16,f(s,b,t,sd,lite){const R=[40,41,40,43][b],hit=lite?(s%2===0):[1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0][s];
if(hit)for(const k of [0,7,12])gtr(mf(R+k+12),t,sd*.9,lite?.05:(s%4===0?.07:.055));
if(!lite){if(s%2===0)kick(t,.5,MG,1);if(s===3||s===11)kick(t,.4,MG,1);if(s%2===0)hh(t,.04,MG);if(b>=2)gtr(mf([76,79,77,75][(s>>2)%4]+12),t,sd*.95,.035);}
else{if(s===0||s===8)kick(t,.5,MG,1);if(s%2===0)hh(t,.05,MG);}
if(s===4||s===12)snr(t,.3,MG);if(s===0&&b%2===0)nz(t,.4,.1,MG,'highpass',5000);}}};
TR.rock={bpm:118,len:16,f:(s,b,t,sd)=>TR.metal.f(s,b,t,sd,1)};
function wantTrack(){if(!S)return 'folk';const h=S.t/60;if(S.ph==='night'){let r=0,best=0;for(const q of [1,2]){const a=AC[S.act[q]];if(a.g&&S.att[q]>best){best=S.att[q];r=q;}}if(!r)return 'fado';const g=AC[S.act[r]].g;return g==='metal'?'metal':g==='techno'?'techno':'rock';}
if(S.gig&&S.ph==='day')return DAYACTS[S.dayAct].trk;if(S.ph==='changeover')return 'fado';if(S.ph==='setup')return 'folk';return (h<15.5)===(S.day%2===1)?'samba':'folk';}
function musicTick(){if(!AX||!SET.mus||!S)return;MG.gain.value=SET.mus*(SCON?.12:.35);const w=wantTrack();if(w!==trk){trk=w;step=0;nextT=0;}const T=TR[trk],sd=60/T.bpm/4;if(!nextT||nextT<AX.currentTime-.5)nextT=AX.currentTime+.05;
while(nextT<AX.currentTime+.25){T.f(step%T.len,Math.floor(step/T.len)%4,nextT,sd);step++;nextT+=sd;}}
// ================= characters: layered traits from a seed (NFT-PFP style) =================
let SEED=SET.seed||'borges',INSPECT=false,VC=0;
const hsh=s=>{let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return h>>>0;};
const rngOf=s=>{let a=hsh(s);return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};};
const pk=(r,a)=>a[Math.floor(r()*a.length)],wp=(r,o)=>{let s=0;for(const k in o)s+=o[k];let x=r()*s;for(const k in o){x-=o[k];if(x<=0)return k;}return Object.keys(o)[0];};
const cvx=(w,h,fn)=>{const k=document.createElement('canvas');k.width=w;k.height=h;fn(k.getContext('2d'));const t=new THREE.CanvasTexture(k);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;};
const pxl=(q,c,x,y,w,h)=>{q.fillStyle=c;q.fillRect(x,y,w||1,h||1);};
const SKIN=['#f6d3b3','#efc08e','#d9a273','#b87a4f','#8d5a3b','#6b3f26','#fbe0c8','#c68a62'],HAIRC=['#1b1410','#3a2416','#6b4423','#a8742c','#d9b05b','#8a2b1c','#b5b5b5','#f0f0f0','#111111','#5a3fa0'],NEON=['#ff3d9a','#35e0ff','#7dff4a','#ffd400','#b36bff','#ff6a00'];
const BRI=['#ff6b6b','#ffd166','#06d6a0','#4cc9f0','#f72585','#ff9f1c','#ffffff','#b8f2e6'],MUT=['#6b7a8f','#8a7f72','#5e6b5a','#a89f91','#3f4a5a','#c9b79c','#7a5c58','#e7e1d6'],ERT=['#8a6a3a','#6b7a4a','#a3623a','#d9b97a','#4a5a4a','#c4a484'],DRK=['#121212','#1b1b22','#2a2a2a','#0d0d14','#3a2a2a'],DEN=['#3b5b8a','#2a3f66','#4a6fa5','#222a3a','#555555'],NEC=['#ff3d9a','#35e0ff','#7dff4a','#ffd400','#b36bff','#ff6a00','#111111'],SHT=['#e8d9b0','#c9a26b','#3b5b8a','#ffffff','#8fbf7a','#ff9f43'];
const STF=(top,t2)=>({top:{[top]:1},bot:{trousers:1},shoe:{sneakers:2,boots:1},hat:{none:3,cap:1},acc:{lanyard:3,headset:2},face:{none:4,stubble:2,beard:1,sunglasses:1},hair:{short:3,long:1,pony:1,buzz:1,bald:.3},tc:['#15151c'],bc:['#15151c','#222222'],hc:HAIRC,t2});
const CLS={
tourist:{top:{hawaii:4,tee:3,tank:2,shirt:2,stripes:1},bot:{shorts:5,cargo:2,jeans:2,skirt:1},shoe:{sneakers:5,sandals:4},hat:{none:3,sunhat:3,cap:2,bucket:1},acc:{camera:4,backpack:4,fanny:2,tote:1,none:1},face:{none:5,sunglasses:3,glasses:1,stubble:1},hair:{short:3,long:2,bun:1,pony:2,bob:1,curly:1,buzz:1,bald:.3},tc:BRI,bc:SHT,hc:HAIRC},
local:{top:{tee:3,shirt:3,jacket:1,stripes:1,dress:2,hoodie:1},bot:{jeans:5,trousers:3,skirt:1},shoe:{sneakers:4,boots:1},hat:{none:7,cap:1},acc:{tote:3,none:5,bag:1},face:{none:5,stubble:2,mustache:1,glasses:2,beard:1},hair:{short:4,long:2,bob:1,pony:1,buzz:1,curly:1,bun:1},tc:MUT,bc:DEN,hc:HAIRC},
hipster:{top:{tee:2,hoodie:3,shirt:2,stripes:2,jacket:1},bot:{jeans:3,trousers:3,cargo:1},shoe:{sneakers:3,boots:3},hat:{beanie:4,none:3,cap:1},acc:{tote:3,none:2,scarf:2},face:{beard:4,glasses:4,none:2,mustache:2},hair:{bun:3,short:2,long:2,curly:1,pony:1},tc:ERT,bc:DEN,hc:HAIRC},
raver:{top:{mesh:3,tank:3,tee:2},bot:{shorts:3,cargo:3,leggings:2},shoe:{sneakers:5},hat:{bucket:3,none:3,headphones:1},acc:{glow:5,none:2,fanny:2},face:{glitter:5,none:2,sunglasses:2},hair:{short:2,bob:2,pony:2,mohawk:1,buzz:2,bun:1},tc:NEC,bc:DRK,hc:HAIRC},
metal:{top:{bandtee:6,vest:3,hoodie:1},bot:{jeans:5,trousers:2},shoe:{boots:6},hat:{none:5,bandana:2,beanie:1},acc:{none:4,spikes:3},face:{beard:4,none:3,stubble:2},hair:{long:7,bald:1,mohawk:1,curly:1},tc:DRK,bc:['#1b1b22','#222a3a','#111111'],hc:['#1b1410','#111111','#3a2416','#b5b5b5','#6b4423']},
rock:{top:{jacket:5,tee:3,bandtee:2},bot:{jeans:6,leggings:1},shoe:{boots:4,sneakers:2},hat:{none:6,cap:1},acc:{none:4,scarf:2},face:{stubble:3,none:3,sunglasses:2,beard:1},hair:{short:3,long:3,mohawk:1,pony:1},tc:['#1b1b22','#5a3a2a','#8a1c1c','#2a2a2a','#444444'],bc:DEN,hc:HAIRC},
vendor:{top:{tee:1},bot:{jeans:4,trousers:3,shorts:1},shoe:{sneakers:3,boots:2},hat:{none:1},acc:{none:3,lanyard:1},face:{none:4,stubble:2,mustache:1,glasses:2,beard:1},hair:{short:3,long:2,bun:2,pony:2,bob:1,curly:1},tc:MUT,bc:DEN,hc:HAIRC},
student:{top:{hoodie:3,tee:3,stripes:1},bot:{jeans:4,shorts:1},shoe:{sneakers:5},hat:{none:4,beanie:1,headphones:2,cap:1},acc:{backpack:7,tote:1},face:{none:5,glasses:2},hair:{short:2,long:2,bun:1,pony:1,curly:1,bob:1},tc:BRI,bc:DEN,hc:HAIRC},
business:{top:{shirt:5,jacket:3},bot:{trousers:6},shoe:{boots:3,sneakers:1},hat:{none:8},acc:{bag:5,none:2},face:{none:4,glasses:2,stubble:1,mustache:1},hair:{short:5,bob:1,bun:1,pony:1},tc:['#1d2a4a','#3a3a44','#ffffff','#8a8f9a'],bc:['#1b1b22','#2a2a35','#3a3a44'],hc:HAIRC},
elder:{top:{shirt:3,jacket:3,dress:2},bot:{trousers:4,skirt:2},shoe:{sneakers:2,boots:2},hat:{none:3,beret:2,sunhat:1},acc:{tote:3,bag:3,scarf:1},face:{glasses:4,mustache:2,none:2},hair:{bald:2,bun:2,short:2,bob:1},tc:MUT,bc:DEN,hc:['#b5b5b5','#f0f0f0','#d8d8d8','#8a8a8a']},
jogger:{top:{tank:3,tee:3,mesh:1},bot:{shorts:5,leggings:2},shoe:{sneakers:8},hat:{cap:2,none:3,headphones:3},acc:{none:5,fanny:2},face:{none:4,sunglasses:2},hair:{short:2,pony:3,bun:1,buzz:1},tc:BRI,bc:DRK,hc:HAIRC},
artist:{top:{shirt:2,stripes:2,hoodie:1,tee:2},bot:{jeans:3,trousers:2,cargo:1},shoe:{boots:2,sneakers:2},hat:{beret:4,none:3,beanie:1},acc:{tote:3,backpack:1,none:2},face:{beard:2,glasses:3,mustache:1,none:2},hair:{curly:2,long:2,bun:2,short:1},tc:['#8a1c1c','#2a2a2a','#5e6b5a','#e7e1d6','#ff9f1c'],bc:DEN,hc:HAIRC},
hippie:{top:{tiedye:6,tank:2},bot:{shorts:3,cargo:2,leggings:1},shoe:{sandals:8},hat:{bandana:5,none:3,bucket:1},acc:{none:4,tote:2},face:{beard:3,none:3,glitter:1,stubble:1},hair:{long:7,curly:2,bun:1},tc:['#ff6b9a','#35e0ff','#7dff4a','#ffd400','#b36bff'],bc:['#8a6a3a','#6b7a4a','#a3623a'],hc:HAIRC},
stoner:{top:{hoodie:5,tee:3,bandtee:2},bot:{jeans:4,cargo:2,shorts:2},shoe:{sneakers:6,sandals:1},hat:{beanie:5,cap:2,none:1},acc:{none:6,fanny:1,backpack:1},face:{sunglasses:3,stubble:3,beard:2,none:1},hair:{long:3,curly:2,short:2,buzz:1},tc:['#3a4a3a','#5e6b5a','#3f4a5a','#111111','#8a6a3a'],bc:DEN,hc:HAIRC},
club:STF('club','#ffffff'),security:STF('sec','#f2e000'),ticket:STF('club','#ffffff'),cloak:STF('club','#ffffff'),bartender:STF('apron','#8a1c1c')};
function mkDNA(cls,id,o){const r=rngOf(SEED+'|'+cls+'|'+id),C=CLS[cls]||CLS.local,d={cls,id:''+id};
d.skin=pk(r,SKIN);d.hair=wp(r,C.hair);d.hairc=(cls==='raver'&&r()<.6)?pk(r,NEON):pk(r,C.hc||HAIRC);d.top=wp(r,C.top);d.topc=pk(r,C.tc);d.top2=C.t2||pk(r,C.tc);d.bot=wp(r,C.bot);d.botc=pk(r,C.bc);d.shoe=wp(r,C.shoe);d.shoec=pk(r,['#ffffff','#222222','#8a5a2b','#e5593f','#3b82d6']);
d.hat=wp(r,C.hat);d.hatc=pk(r,C.tc);d.acc=wp(r,C.acc);d.accc=pk(r,NEON);d.face=wp(r,C.face);d.sl=r()<.6?1:0;d.pierce=r()<(cls==='metal'||cls==='raver'?.3:.08)?1:0;
const x=r();if(x<.006){d.skin='#d4af37';d.rare='Golden';}else if(x<.014){d.skin='#7bc47f';d.rare='Zombie';}else if(x<.02){d.skin='#6a8cff';d.rare='Blue';}return Object.assign(d,o||{});}
function faceTex(d){return cvx(16,16,q=>{const hc=d.hairc,s=d.skin,hs=d.hair;pxl(q,s,0,0,16,16);
if(hs==='halfbald'){pxl(q,hc,0,0,3,9);pxl(q,hc,13,0,3,9);pxl(q,hc,3,0,8,1);pxl(q,hc,3,1,5,1);}if(hs!=='bald'&&hs!=='halfbald'){const hh2=hs==='buzz'?3:(hs==='curly')?5:4;pxl(q,hc,0,0,16,hh2);const lg=hs==='long'?14:hs==='bob'?9:6;if(hs!=='buzz'&&hs!=='mohawk'){pxl(q,hc,0,0,2,lg);pxl(q,hc,14,0,2,lg);pxl(q,hc,2,hh2,4,1);pxl(q,hc,9,hh2,5,1);}if(hs==='mohawk'){pxl(q,s,0,0,5,3);pxl(q,s,11,0,5,3);}}
pxl(q,'#2a1d16',3,5,4,1);pxl(q,'#2a1d16',9,5,4,1);for(const x of [3,10]){pxl(q,'#ffffff',x,7,3,2);pxl(q,'#1a1a1a',x+(x<8?1:0),7,2,2);}
pxl(q,'rgba(0,0,0,.18)',7,9,2,2);
if(d.face==='beard'){pxl(q,hc,2,9,12,7);pxl(q,hc,2,8,2,2);pxl(q,hc,12,8,2,2);}else if(d.face==='stubble')pxl(q,'rgba(0,0,0,.22)',3,10,10,5);else if(d.face==='mustache')pxl(q,hc,5,10,6,1);
pxl(q,'#a33a3a',6,12,4,1);if(d.face==='beard')pxl(q,'#7a2a2a',7,12,2,1);
if(d.face==='glasses'){const f='#222222';pxl(q,f,2,6,5,1);pxl(q,f,2,9,5,1);pxl(q,f,2,6,1,4);pxl(q,f,6,6,1,4);pxl(q,f,9,6,5,1);pxl(q,f,9,9,5,1);pxl(q,f,9,6,1,4);pxl(q,f,13,6,1,4);pxl(q,f,7,7,2,1);}
if(d.face==='sunglasses'){pxl(q,'#111111',2,6,12,3);pxl(q,'#445566',3,6,2,1);pxl(q,'#445566',10,6,2,1);}
if(d.face==='glitter'){for(let i=0;i<7;i++)pxl(q,NEON[(i+d.id.length)%6],2+(i*5)%12,9+(i*3)%4,1,1);pxl(q,NEON[0],4,10,2,1);pxl(q,NEON[1],10,10,2,1);}
if(d.pierce){pxl(q,'#dddddd',7,10,1,1);pxl(q,'#dddddd',2,8,1,1);}});}
function sideTex(d){return cvx(16,16,q=>{pxl(q,d.skin,0,0,16,16);if(d.hair==='halfbald'){pxl(q,d.hairc,0,0,8,9);}else if(d.hair!=='bald'){pxl(q,d.hairc,0,0,16,d.hair==='long'?14:d.hair==='bob'?9:d.hair==='buzz'?3:5);if(d.hair==='mohawk')pxl(q,d.skin,0,0,16,3);}pxl(q,'rgba(0,0,0,.15)',6,7,3,3);});}
function backTex(d){return cvx(16,16,q=>{pxl(q,d.skin,0,0,16,16);if(d.hair==='halfbald')pxl(q,d.hairc,0,4,16,6);else if(d.hair!=='bald'&&d.hair!=='mohawk')pxl(q,d.hairc,0,0,16,d.hair==='long'?16:d.hair==='bob'?10:d.hair==='buzz'?4:9);});}
function torsoTex(d,back){return cvx(16,16,q=>{const t=d.top,c=d.topc,c2=d.top2;pxl(q,c,0,0,16,16);if(t==='tiedye'){tdye(q,c);pxl(q,'rgba(0,0,0,.2)',0,15,16,1);return;}if(d.flag&&!back){flagShirt(q,d.flag);pxl(q,'rgba(0,0,0,.2)',0,15,16,1);return;}if(d.logo){shirtLogo(q,d.logo,back);pxl(q,'rgba(0,0,0,.2)',0,15,16,1);return;}
if(back){if(t==='sec'){pxl(q,c2,0,0,16,3);pxl(q,'#ffffff',3,6,10,1);pxl(q,'#ffffff',3,8,10,1);}else if(t==='club'){pxl(q,'#ffffff',3,5,10,1);pxl(q,'#ffffff',5,7,6,1);pxl(q,'#ffffff',4,9,8,1);}else if(t==='bandtee'){pxl(q,'#dddddd',4,3,8,6);pxl(q,c,6,5,1,2);pxl(q,c,9,5,1,2);pxl(q,'#dddddd',3,11,10,1);}else if(t==='stripes'){for(let y=0;y<16;y+=4)pxl(q,c2,0,y,16,2);}else if(t==='hawaii'){for(let i=0;i<8;i++)pxl(q,i%2?c2:'#ffffff',(i*5)%13+1,(i*7)%13+1,2,2);}return;}
if(t==='stripes'){for(let y=0;y<16;y+=4)pxl(q,c2,0,y,16,2);}
else if(t==='hawaii'){for(let i=0;i<10;i++)pxl(q,i%2?c2:'#ffffff',(i*5)%13+1,(i*7)%13+1,2,2);pxl(q,'#ffffff',7,0,2,5);}
else if(t==='hoodie'){pxl(q,c2,4,9,8,5);pxl(q,'#222222',6,0,1,5);pxl(q,'#222222',9,0,1,5);}
else if(t==='jacket'){pxl(q,'#222222',7,0,2,16);pxl(q,'#aaaaaa',8,3,1,12);pxl(q,c2,0,0,2,16);pxl(q,c2,14,0,2,16);pxl(q,d.skin,5,0,6,2);}
else if(t==='bandtee'){pxl(q,'#dddddd',4,3,8,6);pxl(q,c,6,5,1,2);pxl(q,c,9,5,1,2);pxl(q,c,7,8,2,1);pxl(q,'#dddddd',3,11,10,1);}
else if(t==='mesh'){pxl(q,d.skin,0,0,16,16);for(let y=0;y<16;y+=2)for(let x=y%4;x<16;x+=4)pxl(q,c,x,y,1,1);pxl(q,c,0,13,16,3);}
else if(t==='tank'){pxl(q,d.skin,0,0,4,16);pxl(q,d.skin,12,0,4,16);pxl(q,d.skin,4,0,8,3);}
else if(t==='dress'){pxl(q,d.skin,5,0,6,3);pxl(q,c2,0,10,16,1);}
else if(t==='vest'){pxl(q,c2,5,0,6,16);pxl(q,'#cc3333',1,5,3,3);pxl(q,'#ffcc33',12,8,3,3);pxl(q,'#33ccff',2,11,3,2);}
else if(t==='shirt'){pxl(q,'#ffffff',5,0,6,2);pxl(q,'#dddddd',8,2,1,12);pxl(q,'#dddddd',4,4,1,1);}
else if(t==='apron'){pxl(q,'#e8e8e8',0,0,16,16);pxl(q,c2,3,3,10,13);pxl(q,'#ffffff',6,6,4,3);pxl(q,c2,5,0,1,3);pxl(q,c2,10,0,1,3);}
else if(t==='club'){pxl(q,'#ffffff',3,4,10,1);pxl(q,'#e5593f',3,6,4,2);}
else if(t==='sec'){pxl(q,c2,0,0,3,16);pxl(q,c2,13,0,3,16);pxl(q,'#bbbbbb',3,9,10,1);}
else pxl(q,c2,5,5,6,3);
pxl(q,'rgba(0,0,0,.2)',0,15,16,1);});}
function buildChar(g,d){g.clear();(g.tx||[]).forEach(t=>t.dispose());g.tx=[];g.dna=d;
const TX=t=>{g.tx.push(t);const m=new THREE.MeshLambertMaterial({map:t});g.tx.push(m);return m;},nb=(p,w,h,dd,x,y,z,c)=>bx(p,w,h,dd,x,y,z,c,1),pv=(p,x,y)=>{const q=new THREE.Group();q.position.set(x,y,0);p.add(q);return q;};
const sk=d.skin,hs=d.hair,tp=d.top,sleeveless=['tank','mesh','vest','dress'].includes(tp),longS=['jacket','hoodie','shirt','sec'].includes(tp),slc=tp==='vest'?d.top2:d.topc;
[-.07,.07].forEach((x,i)=>{const p=pv(g,x,.22);if(i)g.lr=p;else g.ll=p;if(d.bot==='skirt'||tp==='dress')nb(p,.09,.2,.09,0,-.1,0,sk);else if(d.bot==='shorts'){nb(p,.105,.1,.105,0,-.05,0,d.botc);nb(p,.08,.1,.08,0,-.15,0,sk);}else nb(p,.1,.2,.1,0,-.1,0,d.botc);
const bt=d.shoe==='boots',sh=bt?.09:.05;nb(p,.11,sh,.14,0,-.22+sh/2,.02,d.shoe==='sandals'?sk:d.shoec);});
if(d.bot==='skirt'||tp==='dress')nb(g,.3,.1,.17,0,.25,0,tp==='dress'?d.topc:d.botc);
const sd=mt(d.topc),tm=new THREE.Mesh(gm(.28,.24,.15),[sd,sd,sd,sd,TX(torsoTex(d,0)),TX(torsoTex(d,1))]);tm.position.set(0,.34,0);g.add(tm);nb(g,.29,.025,.16,0,.225,0,'#2a2a2a');nb(g,.04,.03,.01,0,.225,.085,'#c9a24b');if(tp==='shirt'||tp==='jacket')nb(g,.1,.03,.02,0,.455,.08,'#ffffff');
[-.18,.18].forEach((x,i)=>{const p=pv(g,x,.44);if(i)g.ar=p;else g.al=p;if(sleeveless)nb(p,.07,.2,.07,0,-.1,0,sk);else if(longS){nb(p,.085,.17,.085,0,-.085,0,slc);nb(p,.07,.06,.07,0,-.2,0,sk);}else{nb(p,.09,.08,.09,0,-.04,0,slc);nb(p,.07,.13,.07,0,-.145,0,sk);}});
const hd=pv(g,0,.46);g.hd=hd;const sdT=TX(sideTex(d)),hm=new THREE.Mesh(gm(.22,.22,.22),[sdT,sdT,mt(hs==='bald'||hs==='halfbald'?sk:d.hairc),mt(sk),TX(faceTex(d)),TX(backTex(d))]);hm.position.set(0,.11,0);hd.add(hm);nb(hd,.04,.04,.03,0,.1,.12,sk);nb(hd,.02,.05,.04,-.12,.1,0,sk);nb(hd,.02,.05,.04,.12,.1,0,sk);
const hc=d.hairc,hcc=d.hatc;if(['short','long','bob','bun','pony','curly'].includes(hs))nb(hd,hs==='curly'?.28:.235,hs==='curly'?.16:.05,hs==='curly'?.28:.235,0,hs==='curly'?.17:.215,0,hc);
if(hs==='long')nb(hd,.23,.2,.04,0,.06,-.12,hc);if(hs==='bob')nb(hd,.24,.12,.04,0,.1,-.12,hc);if(hs==='bun')nb(hd,.09,.09,.09,0,.29,-.04,hc);if(hs==='pony')nb(hd,.05,.15,.05,0,.08,-.14,hc);if(hs==='mohawk')nb(hd,.05,.12,.2,0,.27,0,hc);
({cap:()=>{nb(hd,.24,.07,.24,0,.245,0,hcc);nb(hd,.2,.02,.1,0,.225,.16,hcc);},beanie:()=>nb(hd,.25,.1,.25,0,.245,0,hcc),sunhat:()=>{nb(hd,.2,.07,.2,0,.25,0,'#e6c98a');nb(hd,.5,.02,.5,0,.22,0,'#e6c98a');},bucket:()=>{nb(hd,.23,.08,.23,0,.25,0,hcc);nb(hd,.34,.02,.34,0,.215,0,hcc);},headphones:()=>{nb(hd,.26,.03,.04,0,.24,0,'#222222');nb(hd,.05,.09,.08,-.135,.11,0,d.accc);nb(hd,.05,.09,.08,.135,.11,0,d.accc);},bandana:()=>{nb(hd,.24,.05,.24,0,.215,0,hcc);nb(hd,.05,.06,.04,.12,.19,-.12,hcc);},chef:()=>{nb(hd,.2,.16,.2,0,.3,0,'#ffffff');nb(hd,.24,.04,.24,0,.22,0,'#ffffff');},beret:()=>nb(hd,.27,.04,.24,.02,.235,0,'#7a2a2a')}[d.hat]||(()=>{}))();
const ac=d.acc;
if(ac==='backpack')nb(g,.2,.22,.08,0,.35,-.115,'#3a5a7a');
else if(ac==='tote'){nb(g,.1,.13,.04,.2,.2,.04,'#e8dcc0');nb(g,.02,.1,.02,.2,.3,.04,'#e8dcc0');}
else if(ac==='bag')nb(g,.12,.1,.05,-.2,.2,.05,'#6b4a2b');
else if(ac==='camera'){nb(g,.1,.07,.06,0,.32,.1,'#222222');nb(g,.04,.04,.03,0,.32,.14,'#8899aa');}
else if(ac==='fanny'){nb(g,.2,.06,.07,0,.24,.1,'#2a2a2a');nb(g,.04,.04,.02,.05,.24,.14,'#d9a441');}
else if(ac==='lanyard'){nb(g,.025,.15,.012,0,.36,.08,d.accc);nb(g,.06,.04,.015,0,.28,.085,'#ffffff');}
else if(ac==='headset'){nb(hd,.02,.06,.03,-.12,.1,.06,'#111111');nb(hd,.015,.015,.07,-.1,.05,.1,'#111111');nb(g,.025,.15,.012,0,.36,.08,'#dddddd');}
else if(ac==='scarf'){nb(g,.3,.05,.17,0,.45,0,d.accc);nb(g,.05,.12,.03,.08,.38,.09,d.accc);}
else if(ac==='spikes'){for(const p of [g.al,g.ar]){nb(p,.1,.03,.1,0,-.17,0,'#888888');for(const k of [-.04,.04])nb(p,.02,.04,.02,k,-.2,0,'#cccccc');}nb(g,.3,.03,.16,0,.44,0,'#222222');}
else if(ac==='glow'){const m=new THREE.Mesh(gm(.03,.12,.03),new THREE.MeshBasicMaterial({color:d.accc}));g.tx.push(m.material);m.position.set(0,-.2,.05);g.ar.add(m);}
else if(ac==='baguette'){nb(g,.05,.05,.32,.2,.3,.1,'#d9a85a');}
else if(ac==='umbrella'){nb(g,.03,.5,.03,-.2,.25,.06,'#222222');nb(g,.1,.12,.1,-.2,.5,.06,'#222222');}
else if(ac==='coffee'){nb(g.ar,.05,.07,.05,0,-.22,.04,'#ffffff');nb(g.ar,.055,.03,.055,0,-.19,.04,'#3a2a1a');}
else if(ac==='tulip'){nb(g,.02,.16,.02,.2,.28,.07,'#3a8a3a');nb(g,.07,.07,.07,.2,.39,.07,'#e5593f');}
else if(ac==='cowbell'){nb(g,.2,.22,.08,0,.35,-.115,'#b3261e');nb(g,.07,.07,.05,0,.28,.1,'#d9a441');}
else if(ac==='guitar'){nb(g,.22,.26,.06,.02,.3,.12,d.accc);nb(g,.04,.34,.04,.1,.45,.12,'#6b4a2b');}
else if(ac==='chain'){nb(g,.2,.03,.02,0,.42,.09,d.accc);nb(g,.05,.05,.02,0,.37,.09,d.accc);}else if(ac==='mic'){nb(g,.03,.5,.03,0,.25,.3,'#555555');nb(g,.05,.06,.05,0,.52,.3,'#999999');}
else if(ac==='decks'){nb(g,.7,.3,.3,0,.15,.4,'#1a1a22');nb(g,.2,.03,.2,-.2,.31,.4,'#555555');nb(g,.2,.03,.2,.2,.31,.4,'#555555');nb(g,.1,.04,.1,0,.32,.4,d.accc);}
return g;}
function genChar(cls,id,o){const g=new THREE.Group();buildChar(g,mkDNA(cls,id,o));g.scale.setScalar(.85);return g;}
const NIGHTC={techno:'raver',metal:'metal',rock:'rock',indie:'hipster',pop:'tourist'};
function reskin(night){let cs=['tourist','tourist','local','hipster','tourist','local','student','business','elder','jogger','artist','tourist'];if(night){const gs=[1,2].map(r=>AC[S.act[r]].g).filter(Boolean);cs=gs.length?gs.map(g=>NIGHTC[g]):['local'];}
V.forEach((v,i)=>buildChar(v,mkDNA(cs[i%cs.length],(night?'n':'d')+S.day+'_'+i,night?logoOpt(i):(i%4===0?natOpt(i>>2):undefined))));PED.forEach((v,i)=>buildChar(v,mkDNA(cs[(i+1)%cs.length],(night?'pn':'pd')+S.day+'_'+i,night?undefined:(i%3===0?natOpt(i/3|0):undefined))));if(night)perfDress();natFix();}
function perfDress(){for(const r of [1,2]){const a=AC[S.act[r]],g=a.g;if(!g)continue;const sp=g==='techno'?[['raver','dj',{acc:'decks',hat:'headphones',top:'tee'}],null,null]:g==='metal'?[['metal','s',{acc:'mic',hair:'long'}],['metal','g',{acc:'guitar'}],['metal','b',{acc:'guitar'}]]:g==='rock'?[['rock','s',{acc:'mic'}],['rock','g',{acc:'guitar'}],['rock','b',{acc:'guitar'}]]:[['hipster','s',{acc:'mic'}],['hipster','g',{acc:'guitar'}],['hipster','k',{acc:'none'}]];
PF[r].forEach((p,i)=>{const s=sp[i];p.on=!!s;if(s)buildChar(p,mkDNA(s[0],'pf'+r+s[1]+S.day,s[2]));});}}
function dnaText(d){return '#'+(hsh(d.id+d.cls)%100000)+' '+(d.nat?d.nat+' ':'')+d.cls+(d.rare?' ★ '+d.rare:'')+' · '+d.hair+' hair, '+d.top+', '+d.bot+', '+d.shoe+(d.hat!=='none'?', '+d.hat:'')+(d.acc!=='none'?', '+d.acc:'');}
function inspect(e){tile(e);const hits=ray.intersectObjects(V.concat(PF[1],PF[2],PED,FQ,RDS,RM.map(r=>r.m)).filter(v=>v.visible),true);if(!hits.length){toast('Nobody there','🔍');return;}let o=hits[0].object;while(o&&!o.dna)o=o.parent;if(o){if(o.role)roleTap(o);else toast(dnaText(o.dna),'🔍');}}
function buildLab(){roof.visible=false;CUT=true;RW.forEach(w=>{w.m.scale.y=.25;w.m.position.y=w.h*.25/2;});[...$('nav').children].forEach(b=>{if(b.textContent==='Cutaway'||b.textContent==='Roof off')b.classList.add('on');});
const sl=document.createElement('span');sl.className='px';sl.textContent='Day stage 15-18h';const ds=document.createElement('select');ds.id='dayact';for(const k in DAYACTS){const o=document.createElement('option');o.value=k;o.textContent=DAYACTS[k].n+(DAYACTS[k].cost?' €'+DAYACTS[k].cost:'');ds.appendChild(o);}ds.onchange=()=>{S.dayAct=ds.value;};$('sel').append(sl,ds);const b=document.createElement('button');b.textContent='🔍';b.onclick=()=>{INSPECT=!INSPECT;b.classList.toggle('on',INSPECT);};$('ctl').appendChild(b);
const P=$('ts'),w=document.createElement('label');w.className='row';w.innerHTML="<span class='px'>Crowd seed</span>";const i=document.createElement('input');i.value=SEED;i.style.width='110px';const n=document.createElement('button');n.textContent='Reroll crowd';n.onclick=()=>{SEED=i.value||'borges';SET.seed=SEED;saveSet();if(S)reskin(S.ph==='night'?1:0);};const r=document.createElement('button');r.textContent='Random';r.onclick=()=>{i.value=Math.random().toString(36).slice(2,7);n.onclick();};w.append(i,n,r);P.appendChild(w);
const p=document.createElement('p');p.className='m';p.textContent='Everyone is generated from layered traits (skin, hair, face, outfit, hat, accessory) and a seed, like an NFT profile-picture collection. Tap the magnifier, then a person, to read their traits. A few are rare.';P.appendChild(p);}
// ================= richer stall details =================
const SGN={},PAN={},SGP={counter:[-.4,1.25],cart:[-.35,1.2],grill:[-.4,1.25],bar:[-.5,1.3],rack:[-.25,1.25],table:[-.3,1.2],press:[-.3,1.15],chair:[-.42,1.1],kiosk:[-.3,1.2],easel:[-.2,1.1],flowers:[-.42,1.2],news:[-.3,1.25],shelf:[-.42,1.25],printer:[-.35,1.2],case:[-.35,1.15],oven:[-.4,1.25]},FRN={counter:[.95,.4,.2,.39],cart:[.8,.3,.4,.31],bar:[1.05,.5,.25,.41],table:[.95,.35,.18,.41],press:[.95,.3,.15,.41],grill:[.8,.4,.2,.36],shelf:[.95,.4,.2,.38],case:[.9,.34,.18,.37],printer:[.95,.3,.15,.41]};
const lum=h=>{const n=parseInt(h.slice(1),16);return (n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11;};
const SGNAME={'Silver jewellery':'SILVER JEWEL','Steel jewellery':'STEEL JEWEL','Gold jewellery':'GOLD JEWELS','Polvo à lagareiro':'POLVO','Chouriço assado':'CHOURIÇO','Handmade shoes':'SHOEMAKER','Cheese & charcuterie':'CHEESE','Port wine tasting':'PORT WINE','Vintage clothes':'VINTAGE','T-shirt printing':'T-SHIRT PRINT','Portrait artist':'PORTRAITS','Caricature artist':'CARICATURE','Cocktail bar':'COCKTAILS'};
function signMat(i){return SGN[i]||(SGN[i]=new THREE.MeshLambertMaterial({map:cvx(64,16,q=>{const d=ST[i],a=hx(d[3]),b=hx(d[4]);pxl(q,a,0,0,64,16);pxl(q,b,0,0,64,2);pxl(q,b,0,14,64,2);q.fillStyle=lum(a)>150?'#1b1b2f':'#ffffff';q.font='bold 8px monospace';q.textBaseline='middle';q.fillText((SGNAME[d[0]]||d[0]).slice(0,13),3,9);})}));}
function panMat(i){return PAN[i]||(PAN[i]=new THREE.MeshLambertMaterial({map:cvx(16,8,q=>{const d=ST[i],a=hx(d[3]),b=hx(d[4]),c=d[1];if(c==='food'){for(let x=0;x<16;x+=4){pxl(q,a,x,0,2,8);pxl(q,b,x+2,0,2,8);}}else if(c==='drink'){pxl(q,'#6b4a2b',0,0,16,8);for(let x=0;x<16;x+=4)pxl(q,'#4a321c',x,0,1,8);pxl(q,'#999999',0,2,16,1);pxl(q,'#999999',0,6,16,1);}else if(c==='craft'){for(let y=0;y<8;y+=2)for(let x=0;x<16;x+=2)pxl(q,((x+y)/2)%2?a:b,x,y,2,2);}else if(c==='cloth'){pxl(q,a,0,0,16,8);pxl(q,b,0,2,16,1);pxl(q,b,0,5,16,1);}else{pxl(q,'#1d1d26',0,0,16,8);for(let k=0;k<6;k++)pxl(q,[a,b,'#ffd166'][k%3],(k*3)%16,(k*5)%8,2,1);}})}));}
function decor(g,d,k,i){const a1=d[3],a2=d[4],pc=d[5],c=d[1],wd=0x7b6a5a,sp=SGP[k],fr=FRN[k];
if(fr)bx(g,fr[0],fr[1],.02,0,fr[2],fr[3],panMat(i),1);
if(sp){bx(g,.04,sp[1],.04,-.44,sp[1]/2,sp[0],0x5a4630);bx(g,.04,sp[1],.04,.44,sp[1]/2,sp[0],0x5a4630);const dk=mt(0x333333),sm=new THREE.Mesh(gm(.92,.22,.04),[dk,dk,dk,dk,signMat(i),dk]);sm.position.set(0,sp[1]+.02,sp[0]+.02);sm.castShadow=true;g.add(sm);}
if(['counter','cart','grill','bar','table','rack','press','shelf','case','printer','news','flowers'].includes(k)){for(let j=0;j<8;j++)bx(g,.09,.08+(j%2)*.03,.01,-.42+j*.12,1.0-.04*Math.cos((j-3.5)*.4),.38,[a1,a2,pc][j%3],1);}
if(['counter','cart','bar','table'].includes(k)){bx(g,.16,.1,.12,.34,.52,.1,0x333333,1);bx(g,.12,.04,.04,.34,.6,.08,0x66ee88,1);}
if(c==='food'){for(let j=0;j<3;j++)bx(g,.14,.02,.14,.34,.56+j*.025,.26,0xffffff,1);bx(g,.26,.34,.03,-.64,.5,.12,0x24342c);bx(g,.16,.02,.01,-.64,.6,.14,0xf2ead8,1);bx(g,.12,.02,.01,-.64,.52,.14,0xf2ead8,1);bx(g,.25,.2,.25,.58,.1,.35,wd);}
else if(c==='drink'){for(const z of [.3,.6]){bx(g,.22,.28,.22,-.64,.14,z,0x6b4a2b);bx(g,.24,.03,.24,-.64,.1,z,0x999999,1);bx(g,.24,.03,.24,-.64,.2,z,0x999999,1);}bx(g,.26,.34,.03,.64,.5,.12,0x24342c);bx(g,.16,.02,.01,.64,.6,.14,0xf2ead8,1);}
else if(c==='craft'){bx(g,.9,.04,.12,0,.95,-.18,wd);for(let j=0;j<4;j++)bx(g,.12,.1+(j%2)*.04,.1,-.3+j*.2,1.02+(j%2)*.02,-.18,[a1,a2,pc,a2][j],1);bx(g,.2,.14,.2,.62,.07,.35,0xb0824a);}
else if(c==='cloth'){bx(g,.04,.35,.04,-.66,.18,.1,0x444444);bx(g,.16,.3,.1,-.66,.5,.1,a1);bx(g,.1,.1,.1,-.66,.74,.1,0xe8c9a8);bx(g,.2,.03,.14,-.66,.02,.1,0x333333);for(let j=0;j<4;j++)bx(g,.03,.05,.01,-.3+j*.25,.78,-.12,0xffffff,1);}
else if(c==='body'){bx(g,.03,.7,.03,.64,.35,.2,0x333333);bx(g,.1,.1,.1,.64,.75,.2,0xfff2a0,1);bx(g,.3,.4,.03,-.64,.5,0,0xbbddee);bx(g,.34,.44,.02,-.64,.5,-.02,0x5a4630);bx(g,.18,.2,.18,.55,.1,.5,wd);}}
// ================= A4: hub route, day stage gigs, portraits, street team, limits =================
function toMid(x,z,a){const Y=11.5;if(a===1)return [[8.6,8.3],[8.6,9.4],[8.6,Y]];if(a===2)return [[13,13],[13,11.8],[13,Y]];if(z<3.4)return [[x,2.6],[20.8,2.6],[20.8,Y]];if(z>18.1)return [[x,18.6],[20.8,18.6],[20.8,Y]];if(x>19.6)return [[20.8,z],[20.8,Y]];return [[x,Y]];}
function dest(k){if(k==='r1')return [[8.6,11.5],[8.6,9.4],[8.6,8.3]];if(k==='r2')return [[13,11.5],[13,11.8],[13,13]];if(k==='bk')return [[5.4,11.5],[5.4,18.3],[4.4,18.3],[1.5,18.3],[1.5,13.4]];return [[20.8,11.5],[23,10.65],[34,10.65]];}
const DAYACTS={none:{n:'No day-stage gig',foot:0},fado:{n:'Fado trio',cost:120,cul:3,hyp:0,foot:.1,trk:'fado'},samba:{n:'Samba band',cost:180,cul:1,hyp:2,foot:.2,trk:'samba'},folk:{n:'Folk dancers',cost:150,cul:4,hyp:1,foot:.12,trk:'folk'}};
const LP={'Chalk-art board':.035,'Balloon arch':.06,'Fado singer':.10,'Street magician':.11,'Brass band':.13,'LED tunnel':.14,'Dancing robot':.17,'Fireworks launcher':.22,'Celebrity meet & greet':.30,'A-frame sign':.03,'Banner flags':.04,'Flyer promoter':.06,'Street guitarist':.09,'Neon sign':.08,'Pastel mascot':.12};
const nLure=()=>{let n=0;for(const s of stalls.values())if(ST[s.i][1]==='lure')n++;return n;};
function lureNow(){if(!S)return .1;let l=.08;for(const s of stalls.values()){if(s.st!=='open')continue;if(ST[s.i][1]==='lure')l+=(LP[ST[s.i][0]]||0)*(1+.3*s.u.eq);l+=.008*s.u.sg;}if(S.ph==='day'||S.ph==='setup')l+=.06;if(S.gig)l+=.08;l+=aniLure();return Math.min(.85,l);}
function gigTick(dm){S.tide=Math.max(0,S.tide-.03*dm);if(S.ph!=='day'){S.gig=0;return;}const h=S.t/60,a=DAYACTS[S.dayAct];
if(!S.gig&&a.cost&&h>=15&&h<18&&!S.gigDone){S.gigDone=1;if(S.cash>=a.cost){S.cash-=a.cost;S.gig=1;S.cul=cl(S.cul+a.cul);S.hyp=cl(S.hyp+a.hyp);gainXP(10);toast(a.n+' takes the hall stage!','🎶');sfx('goal');dressDay(S.dayAct);}else S.log='Not enough cash for the day-stage act.';}
if(S.gig&&h>=18)S.gig=0;}
function dressDay(a){const sp=a==='fado'?[['local','fs',{top:'dress',topc:'#151515',hair:'bun',acc:'mic'}],['local','fg',{acc:'guitar',top:'shirt',topc:'#222222'}],['local','fb',{acc:'guitar',top:'vest'}]]:a==='samba'?[['tourist','sa',{acc:'mic',top:'tank',topc:'#ffd400'}],['tourist','sb',{top:'tank',topc:'#06d6a0',hair:'curly',acc:'none'}],['tourist','sc',{acc:'guitar',top:'hawaii'}]]:[['local','fo1',{top:'shirt',topc:'#e8e8e8',hat:'beanie',acc:'none'}],['local','fo2',{top:'dress',topc:'#c2552f',hair:'pony',acc:'none'}],['local','fo3',{top:'shirt',topc:'#2f6db5',acc:'guitar'}]];PFD.forEach((p,i)=>{p.on=!!sp[i];if(sp[i])buildChar(p,mkDNA(sp[i][0],sp[i][1]+S.day,sp[i][2]));});}
function renderLims(){const st=[...stalls.values()],pr=st.filter(s=>s.pr).length,u1=SLOTS.r1.filter(q=>q.u).length,u2=SLOTS.r2.filter(q=>q.u).length,u3=SLOTS.bk.filter(q=>q.u).length;
$('lims').innerHTML='🏪 '+nStalls()+'/'+maxS()+' · 📣 '+nLure()+'/'+(2+S.lv)+' · 📦 R1 '+u1+'/24 R2 '+u2+'/20 BK '+u3+'/8 · 🎫 '+(350+350*S.up.tix)+' · 🚻 '+(300+150*wcn())+' · 👥 '+pr+'/'+st.length+' today · 🏟 R1 1000 R2 350 · 🚶 crowd pull '+Math.round(S.tide)+' · ⭐ '+RNK[rankIdx()]+' · 🏅 '+S.gr+' · 🎸 '+nColl()+'/'+BL.length;const d=$('dayact');if(d&&d.value!==S.dayAct)d.value=S.dayAct;}
function roleTap(o){const r=o.role;if(r==='bum'){if(S.cash>=5){S.cash-=5;S.cul=cl(S.cul+.4);sfx('coin');toast('He thanks you: Deus lhe pague!','🪙');}else toast('You have no coins to give.','🪙');}else if(r==='pick')toast('Shifty. Keep an eye on your wallet.','👀');else toast('Officer: Boa tarde. All quiet here.','👮');}
// manager portraits and in-world looks
const MGR_DAY={top:'jacket',topc:'#ff3d9a',top2:'#35e0ff',hat:'headphones',hatc:'#111111',hair:'long',hairc:'#0b0b10',skin:'#e8b890',face:'glitter',acc:'none',accc:'#35e0ff',bot:'cargo',botc:'#1b1b2a',shoe:'sneakers',shoec:'#ffffff',sl:0,pierce:1,streak:'#ff3d9a'},MGR_NIGHT={top:'jacket',topc:'#f4f4ee',top2:'#ffffff',hat:'none',hair:'halfbald',hairc:'#d98a3a',skin:'#fbe0c8',face:'none',acc:'chain',accc:'#e6c200',bot:'trousers',botc:'#f4f4ee',shoe:'sneakers',shoec:'#f4f4ee',sl:0,pierce:0,big:1};
const MGD=mkDNA('manager','pd',MGR_DAY),MGN=mkDNA('manager','pn',MGR_NIGHT);
const UAV={tix:mkDNA('ticket','t0'),cloak:mkDNA('cloak','c0'),bar:mkDNA('bartender','b0',{top:'apron',topc:'#1a1a22',top2:'#8a1c1c'}),snd:mkDNA('club','snd',{acc:'headset'}),lit:mkDNA('club','lit',{hat:'cap'}),sec:mkDNA('security','sec0',{face:'sunglasses'})};
function dressMgr(n){buildChar(PL,n?MGN:MGD);if(n)PL.scale.set(.92,1.5,.92);else PL.scale.setScalar(1.1);}
let MC=null;function setMgr(){const n=S.ph==='night'||S.ph==='end';if(MC!==n){MC=n;$('mgr').innerHTML=av(n?MGN:MGD);}}
const AVC={};
function av(d,key){const k=key||(d.cls+d.id+d.top+d.hair+d.hat);return `<img class='av' src='${AVC[k]||(AVC[k]=drawPortrait(d))}'>`;}
function drawPortrait(d){const c2=document.createElement('canvas');c2.width=c2.height=32;const q=c2.getContext('2d'),sk=d.skin,hc=d.hairc,hs=d.hair;
pxl(q,'#2b2b44',0,0,32,32);pxl(q,'#3a3a5c',0,22,32,10);
if(hs==='long'||hs==='bob'||hs==='bun'||hs==='pony'||hs==='curly')pxl(q,hc,7,4,18,hs==='long'?22:hs==='curly'?16:14);
pxl(q,d.topc,5,23,22,9);pxl(q,d.top2,5,23,3,9);pxl(q,d.top2,24,23,3,9);
if(d.top==='jacket'||d.top==='sec'||d.top==='shirt'){pxl(q,sk,13,23,6,3);pxl(q,d.top2,11,23,2,5);pxl(q,d.top2,19,23,2,5);}
pxl(q,sk,13,20,6,4);pxl(q,sk,9,5,14,16);if(d.acc==='chain'){pxl(q,d.accc,12,25,8,1);pxl(q,d.accc,15,26,2,2);}
if(hs==='halfbald'){pxl(q,hc,8,6,3,9);pxl(q,hc,21,6,3,9);pxl(q,hc,11,5,10,1);pxl(q,hc,11,6,6,1);}
else if(hs!=='bald'){const t=hs==='buzz'?2:(hs==='curly'?5:4);pxl(q,hc,8,4,16,t+1);pxl(q,hc,8,5,2,hs==='long'||hs==='bob'?14:6);pxl(q,hc,22,5,2,hs==='long'||hs==='bob'?14:6);if(hs==='mohawk'){pxl(q,sk,8,4,5,3);pxl(q,sk,19,4,5,3);pxl(q,hc,14,1,4,5);}if(hs==='bun')pxl(q,hc,13,1,6,4);}
if(d.streak)pxl(q,d.streak,10,5,2,13);
pxl(q,'#2a1d16',11,10,4,1);pxl(q,'#2a1d16',17,10,4,1);for(const x of [11,18]){pxl(q,'#ffffff',x,12,3,2);pxl(q,'#1a1a1a',x+(x<16?1:0),12,2,2);}
pxl(q,'rgba(0,0,0,.2)',15,15,2,2);
if(d.face==='beard')pxl(q,hc,9,16,14,6);else if(d.face==='stubble')pxl(q,'rgba(0,0,0,.25)',10,16,12,4);else if(d.face==='mustache')pxl(q,hc,12,16,8,2);
pxl(q,d.big?'#ffffff':'#a33a3a',13,19,6,d.big?2:1);if(d.big)pxl(q,'#a33a3a',13,21,6,1);
if(d.face==='sunglasses'){pxl(q,'#111111',9,11,14,4);pxl(q,'#667788',10,11,3,1);pxl(q,'#667788',18,11,3,1);}
if(d.face==='glasses'){pxl(q,'#222222',10,11,6,1);pxl(q,'#222222',16,11,6,1);pxl(q,'#222222',10,14,6,1);pxl(q,'#222222',16,14,6,1);pxl(q,'#222222',10,11,1,4);pxl(q,'#222222',21,11,1,4);}
if(d.face==='glitter')for(let i=0;i<6;i++)pxl(q,NEON[i%6],10+(i*3)%12,16+(i*2)%4,1,1);
const hcc=d.hatc;({cap:()=>{pxl(q,hcc,8,3,16,4);pxl(q,hcc,6,6,8,1);},beanie:()=>pxl(q,hcc,8,2,16,5),bandana:()=>pxl(q,hcc,8,4,16,3),chef:()=>{pxl(q,'#ffffff',9,0,14,5);pxl(q,'#ffffff',8,4,16,2);},headphones:()=>{pxl(q,'#222222',7,4,18,1);pxl(q,d.accc,6,10,3,6);pxl(q,d.accc,23,10,3,6);},beret:()=>pxl(q,'#7a2a2a',8,3,17,3),sunhat:()=>{pxl(q,'#e6c98a',4,5,24,2);pxl(q,'#e6c98a',9,2,14,4);},bucket:()=>{pxl(q,hcc,8,3,16,4);pxl(q,hcc,6,6,20,1);}}[d.hat]||(()=>{}))();
if(d.pierce){pxl(q,'#dddddd',8,15,1,2);pxl(q,'#dddddd',23,15,1,2);}
return c2.toDataURL();}
let S;const stalls=new Map();
