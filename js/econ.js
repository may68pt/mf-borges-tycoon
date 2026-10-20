/* MF Borges Tycoon - econ module (split from the single-file game; loads in order, shares global scope) */
// ---- progression ----
const need=l=>100+50*(l-1),lvl=()=>S.lv,maxS=()=>4+2*S.lv+S.bonus,nStalls=()=>{let n=0;for(const s of stalls.values())if(ST[s.i][1]!=='amen'&&ST[s.i][1]!=='lure')n++;return n;};
function toast(m,i){const e=document.createElement('div');e.className='toast px';e.textContent=i+' '+m;e.style.top=(64+document.querySelectorAll('.toast').length*46)+'px';$('stage').appendChild(e);setTimeout(()=>e.remove(),4200);}
function gainXP(x){if(S.over)return;S.xp+=x;while(S.xp>=need(S.lv)&&S.lv<14){S.xp-=need(S.lv);S.lv++;const un=ST.filter(d=>d[10]===S.lv).map(d=>d[12]+d[0]);toast('LEVEL '+S.lv+'! Stall limit '+maxS()+'.'+(un.length?' Unlocked: '+un.slice(0,4).join(', ')+(un.length>4?'...':''):''),'⭐');sfx('level');}}
const GDEF=[['Serve {n} clients today',()=>S.sales,20,40,120],['Earn €{n} today',()=>S.earn,500,50,150],['Have {n} stall types open',()=>new Set([...stalls.values()].map(s=>s.i)).size,4,30,100],['Host an event tonight',()=>S.evt,1,40,150],['Serve {n} drinks at the bars',()=>S.bars,15,40,120],['Open stalls in {n} categories',()=>new Set([...stalls.values()].map(s=>ST[s.i][1])).size,3,40,120]];
function newGoals(){S.bars=0;const ix=[...GDEF.keys()].sort(()=>Math.random()-.5).slice(0,3);S.gl=ix.map(i=>({i,done:0,n:i===3?1:Math.round(GDEF[i][2]*(1+S.lv*.12))}));}
function checkGoals(){for(const g of S.gl){if(g.done)continue;const d=GDEF[g.i];if(d[1]()>=g.n){g.done=1;S.cash+=d[4];gainXP(d[3]);toast('Goal complete: '+d[0].replace('{n}',g.n)+' +€'+d[4],'🎯');sfx('goal');}}}
function renderGoals(){const nx=Math.min(...ST.filter(d=>d[10]>S.lv).map(d=>d[10])),un=ST.filter(d=>d[10]===nx).map(d=>d[12]+d[0]);
$('tq').innerHTML=`${av(MGD)}<p class='m'>Level ${S.lv}: you can run ${maxS()} stalls. ${isFinite(nx)?'Next unlock at level '+nx+': '+un.slice(0,5).join(', '):'Everything unlocked.'} Goals reset each morning.</p>`+S.gl.map(g=>{const d=GDEF[g.i],v=Math.min(g.n,Math.floor(d[1]())),p=Math.round(100*v/g.n);return `<div class='p' style='margin-top:6px'>${g.done?'✅':'🎯'} ${d[0].replace('{n}',g.n)}<br><span class='bar' style='width:100%'><u style='width:${p}%'></u></span> ${v}/${g.n} · +€${d[4]} +${d[3]}xp</div>`;}).join('');}
function permBtn(){const b=document.createElement('button');b.id='perm';b.onclick=()=>{const p=300+150*S.bonus;if(S.cash>=p){S.cash-=p;S.bonus++;sfx('level');S.log='Permit bought: +1 stall slot.';}else{sfx('bad');S.log='Not enough cash for a permit.';}ui();};$('rep').parentNode.appendChild(b);}
function buildSet(){const P=$('ts');const rng=(l,k)=>{const w=document.createElement('label');w.className='row';w.innerHTML=`<span class='px'>${l}</span>`;const i=document.createElement('input');i.type='range';i.min=0;i.max=1;i.step=.05;i.value=SET[k];i.oninput=()=>{SET[k]=+i.value;saveSet();};w.appendChild(i);P.appendChild(w);};
rng('Music','mus');rng('Sound FX','sfx');rng('See-through radius','xr');
const sel=(l,k,o2)=>{const w=document.createElement('label');w.className='row';w.innerHTML=`<span class='px'>${l}</span>`;const s=document.createElement('select');o2.forEach(([v,n])=>{const o=document.createElement('option');o.value=v;o.textContent=n;s.appendChild(o);});s.value=SET[k];s.onchange=()=>{SET[k]=isNaN(+s.value)?s.value:+s.value;saveSet();applySet();};w.appendChild(s);P.appendChild(w);};
sel('Pixel size','px',[[320,'Chunky'],[480,'Normal'],[720,'Fine'],[0,'Smooth']]);sel('Look','look',[['vivid','Vivid'],['natural','Natural'],['retro','Retro'],['neon','Neon']]);
const tg=(l,k)=>{const b=document.createElement('button');b.textContent=l;b.className=SET[k]?'on':'';b.onclick=()=>{SET[k]=SET[k]?0:1;b.classList.toggle('on',!!SET[k]);saveSet();};P.appendChild(b);};
tg('Labels','lab');tg('See-through walls','xray');tg('Stall icons','ico');tg('Coin pop-ups','pop');tg('Light FX','fx');applySet();}
// ---- stalls, icons, workers ----
const SPM={},ICO={},SMK=new THREE.MeshBasicMaterial({color:0xb0b0b0,transparent:true,opacity:.6});
function icoTex(e){return ICO[e]||(ICO[e]=(()=>{const k=document.createElement('canvas');k.width=k.height=32;const q=k.getContext('2d');q.font='24px sans-serif';q.textAlign='center';q.textBaseline='middle';q.fillText(e,16,18);const t=new THREE.CanvasTexture(k);t.magFilter=t.minFilter=THREE.NearestFilter;return t;})());}
const spm=e=>SPM[e]||(SPM[e]=new THREE.SpriteMaterial({map:icoTex(e),depthTest:false,transparent:true}));
function person(sh,pa,ha,sk,hat){const g=new THREE.Group(),L=(x,y,w,h,col)=>{const p=new THREE.Group();p.position.set(x,y,0);bx(p,w,h,w,0,-h/2,0,col);g.add(p);return p;};
g.ll=L(-.07,.22,.1,.22,pa);g.lr=L(.07,.22,.1,.22,pa);bx(g,.26,.24,.14,0,.34,sh);g.al=L(-.17,.44,.08,.2,sh);g.ar=L(.17,.44,.08,.2,sh);bx(g,.2,.2,.2,0,.56,sk);bx(g,.22,.08,.22,0,.68,ha);if(hat)bx(g,.28,.05,.28,0,.72,hat);return g;}
const swing=(g,s)=>{g.ll.rotation.x=s;g.lr.rotation.x=-s;g.al.rotation.x=-s;g.ar.rotation.x=s;};
function mkStall(i){const d=ST[i],k=d[2],a1=d[3],a2=d[4],pc=d[5],g=new THREE.Group(),wd=0x7b6a5a,dk=0x3a3a44;let wx=0,wz=-.15,sm=0;const it=(n,y,z,x0,sp)=>{for(let j=0;j<n;j++)bx(g,.11,.1+((j*5)%3)*.04,.11,x0+j*sp,y,z,j%2?pc:a2,1);};
if(k==='counter'){bx(g,.95,.42,.34,0,.21,.2,wd);bx(g,.97,.05,.38,0,.44,.2,a2);bx(g,.95,.5,.06,0,.5,-.34,a1);bx(g,.95,.05,.2,0,.62,-.3,wd);bx(g,.95,.05,.2,0,.8,-.3,wd);bx(g,.7,.18,.06,0,1.1,-.34,a1);bx(g,.5,.08,.07,0,1.1,-.31,a2);it(5,.52,.2,-.36,.18);it(4,.7,-.3,-.3,.2);wz=-.1;}
else if(k==='cart'){bx(g,.8,.3,.5,0,.4,.05,a1);bx(g,.82,.06,.52,0,.58,.05,a2);for(const [x,z] of [[-.3,.3],[.3,.3],[-.3,-.2],[.3,-.2]])bx(g,.1,.22,.06,x,.14,z,dk);bx(g,.05,.5,.05,-.38,.7,-.3,dk);bx(g,.05,.5,.05,.38,.7,-.3,dk);bx(g,.8,.05,.05,0,.95,-.3,dk);it(4,.67,.1,-.28,.19);wz=-.4;}
else if(k==='grill'){bx(g,.8,.4,.5,0,.2,.1,dk);bx(g,.7,.06,.4,0,.43,.1,0x222222);for(let j=0;j<5;j++)bx(g,.1,.05,.1,-.3+j*.15,.48,.1,j%2?0xff7a2f:0xffb13b,1);bx(g,.14,.9,.14,.32,.85,-.18,0x666666);bx(g,.5,.1,.3,-.45,.35,.5,wd);bx(g,.4,.5,.06,-.3,.55,-.3,a1);it(3,.42,.5,-.55,.15);wz=-.35;sm=1;}
else if(k==='bar'){bx(g,1.05,.5,.36,0,.25,.22,wd);bx(g,1.07,.06,.4,0,.52,.22,a1);for(let j=0;j<3;j++){bx(g,.05,.16,.05,-.3+j*.3,.64,.22,0xc0c0c0,1);bx(g,.09,.04,.09,-.3+j*.3,.74,.22,pc,1);}bx(g,1,.7,.08,0,.6,-.45,dk);for(let j=0;j<7;j++)bx(g,.08,.22+(j%3)*.04,.08,-.4+j*.13,.9,-.41,[a2,pc,a1][j%3],1);bx(g,.2,.2,.2,-.6,.1,.5,wd);bx(g,.2,.2,.2,.6,.1,.5,wd);wz=-.15;}
else if(k==='rack'){bx(g,.05,.9,.05,-.45,.45,-.2,dk);bx(g,.05,.9,.05,.45,.45,-.2,dk);bx(g,.95,.05,.05,0,.88,-.2,dk);for(let j=0;j<7;j++)bx(g,.08,.3+(j%2)*.1,.14,-.38+j*.125,.68-(j%2)*.04,-.2,[a1,a2,pc][j%3],1);bx(g,.5,.3,.4,-.1,.15,.38,wd);bx(g,.45,.1,.35,-.1,.35,.38,a2);bx(g,.4,.1,.3,-.1,.45,.38,pc);wz=.05;wx=.3;}
else if(k==='table'){bx(g,.95,.35,.5,0,.18,.15,wd);bx(g,.97,.05,.52,0,.37,.15,a1);it(6,.46,.15,-.38,.15);bx(g,.3,.4,.1,-.3,.55,-.25,a2);bx(g,.3,.4,.1,.3,.55,-.25,pc);wz=-.35;}
else if(k==='press'){bx(g,.95,.3,.5,0,.15,.15,wd);bx(g,.5,.12,.4,-.15,.36,.15,dk);bx(g,.4,.3,.1,-.15,.55,0,a1);bx(g,.08,.5,.08,.35,.4,0,pc);for(let j=0;j<3;j++)bx(g,.2,.05,.2,.3,.34+j*.06,.3,[a1,a2,pc][j],1);wz=-.35;}
else if(k==='chair'){bx(g,.9,.8,.06,0,.4,-.4,a1);bx(g,.9,.1,.06,0,.85,-.4,a2);bx(g,.3,.1,.4,0,.25,.05,0xeeeeee);bx(g,.3,.35,.08,0,.45,-.18,0xeeeeee);bx(g,.06,.5,.06,.3,.25,0,0x888888);bx(g,.16,.08,.16,.3,.52,0,pc);wx=-.3;wz=.1;}
else if(k==='booth'){bx(g,.8,1.15,.8,0,.58,-.1,a1);bx(g,.6,.8,.05,0,.45,.32,a2);bx(g,.84,.14,.84,0,1.22,-.1,pc);bx(g,.12,.12,.06,.3,.9,.34,0xffffff);wx=-.55;wz=.45;}
else if(k==='easel'){bx(g,.05,.9,.05,-.2,.45,-.1,0x8a6a4a);bx(g,.05,.9,.05,.2,.45,-.1,0x8a6a4a);bx(g,.55,.6,.05,0,.65,0,a1);bx(g,.45,.5,.06,0,.65,.02,pc);bx(g,.22,.22,.22,.1,.2,.5,wd);wx=.1;wz=.5;}
else if(k==='aframe'){const b1=bx(g,.5,.7,.03,0,.35,.14,a1),b2=bx(g,.5,.7,.03,0,.35,-.14,a1);b1.rotation.x=-.22;b2.rotation.x=.22;bx(g,.4,.5,.04,0,.38,.17,a2,1).rotation.x=-.22;for(let j=0;j<3;j++)bx(g,.28,.03,.02,0,.28+j*.1,.19,a1,1);}
else if(k==='flags'){for(const x of [-.9,.9])bx(g,.06,1.7,.06,x,.85,0,0x5a4630);for(let j=0;j<12;j++)bx(g,.1,.16,.02,-.85+j*.155,1.6-.12*Math.sin(j/11*Math.PI),0,[a1,a2,pc][j%3],1);}
else if(k==='promo'){bx(g,.05,.6,.05,.38,.3,.1,0x444444);bx(g,.3,.03,.25,.38,.6,.1,0xffffff);for(let j=0;j<3;j++)bx(g,.26,.012,.2,.38,.62+j*.012,.1,[a1,a2,pc][j],1);wx=-.1;wz=0;}
else if(k==='neon'){bx(g,.06,1.8,.06,0,.9,0,0x333333);bx(g,.9,.45,.06,0,1.85,0,0x1a1a22);const m2=new THREE.Mesh(gm(.8,.12,.07),new THREE.MeshBasicMaterial({color:a1}));m2.position.set(0,1.95,.02);g.add(m2);const m3=new THREE.Mesh(gm(.6,.12,.07),new THREE.MeshBasicMaterial({color:a2}));m3.position.set(0,1.75,.02);g.add(m3);}
else if(k==='busk'){bx(g,.4,.05,.28,0,.03,.45,0x222222);for(let j=0;j<3;j++)bx(g,.06,.02,.06,-.1+j*.1,.07,.45,0xf2c94c,1);wz=0;}
else if(k==='mascot'){bx(g,.55,.6,.4,0,.5,0,a1);bx(g,.5,.5,.45,0,1.05,0,a2);bx(g,.1,.12,.02,-.13,1.12,.24,0x111111,1);bx(g,.1,.12,.02,.13,1.12,.24,0x111111,1);bx(g,.22,.05,.02,0,.95,.24,0xe5593f,1);bx(g,.14,.4,.14,-.35,.5,0,a1);bx(g,.14,.4,.14,.35,.5,0,a1);bx(g,.16,.3,.16,-.14,.15,0,0x333333);bx(g,.16,.3,.16,.14,.15,0,0x333333);}
else if(k==='shelf'){bx(g,.95,1.0,.06,0,.5,-.44,a1);for(const y of [.32,.6,.88])bx(g,.9,.04,.2,0,y,-.33,wd);for(let r=0;r<3;r++)for(let j=0;j<6;j++)bx(g,.09,.1+((j+r)%3)*.04,.09,-.38+j*.15,.38+r*.28+((j+r)%3)*.02,-.33,[a2,pc,a1,0xffffff][(j+r)%4],1);bx(g,.95,.38,.3,0,.19,.24,wd);bx(g,.97,.05,.34,0,.4,.24,a2);bx(g,.1,.1,.1,.3,.46,.22,pc,1);bx(g,.08,.14,.08,-.3,.5,.22,a1,1);wz=-.02;}
else if(k==='case'){bx(g,.95,.36,.44,0,.18,.15,wd);bx(g,.9,.2,.4,0,.46,.15,GLS,1);bx(g,.92,.03,.42,0,.57,.15,a1);for(let j=0;j<7;j++)bx(g,.05,.04,.05,-.36+j*.12,.37+((j%2)*.01),.15+((j%3)-1)*.08,[a1,a2,pc,0xffffff][j%4],1);bx(g,.5,.45,.05,0,.9,-.42,a1);for(let j=0;j<6;j++)bx(g,.05,.05,.02,-.2+j*.08,.92+((j%2)*.14),-.39,[a2,pc][j%2],1);wz=-.28;}
else if(k==='flowers'){bx(g,.95,.08,.5,0,.04,.12,wd);bx(g,.9,.04,.3,0,.3,.05,wd);bx(g,.9,.04,.22,0,.56,-.05,wd);const fc=[a1,a2,pc,0xff6b9a,0xffd166,0xffffff];for(const [y,z,n] of [[.04,.28,6],[.32,.1,6],[.58,-.02,5]])for(let j=0;j<n;j++){const x=-.38+j*(.76/(n-1));bx(g,.12,.13,.12,x,y+.1,z,0x6b4a2b,1);bx(g,.02,.16,.02,x,y+.25,z,0x3a7d44,1);bx(g,.11,.07,.11,x,y+.35,z,fc[(j+Math.floor(y*10))%6],1);}bx(g,.04,1.0,.04,-.46,.5,-.3,wd);bx(g,.04,1.0,.04,.46,.5,-.3,wd);bx(g,1.0,.05,.4,0,1.02,-.15,a1);wz=-.4;}
else if(k==='news'){bx(g,.95,1.0,.06,0,.5,-.45,a1);for(const x of [-.47,.47])bx(g,.06,1.0,.5,x,.5,-.2,a1);bx(g,.95,.4,.2,0,.2,.28,wd);bx(g,.97,.05,.24,0,.42,.28,a2);const mg=bx(g,.9,.4,.04,0,.68,.12,wd);mg.rotation.x=-.25;for(let j=0;j<10;j++)bx(g,.08,.13,.02,-.4+(j%5)*.2,.58+Math.floor(j/5)*.2,.16,[pc,a2,0xffffff,0xe5593f,0x3b82d6][j%5],1);bx(g,1.05,.07,.6,0,1.05,-.15,pc);wz=-.15;}
else if(k==='printer'){bx(g,.95,.35,.5,0,.18,.15,wd);bx(g,.97,.05,.52,0,.37,.15,a1);for(const x of [-.25,.25]){for(const [dx,dz] of [[-.1,-.1],[.1,-.1],[-.1,.1],[.1,.1]])bx(g,.02,.34,.02,x+dx,.55,.12+dz,0x333333,1);bx(g,.24,.02,.24,x,.73,.12,0x333333,1);bx(g,.2,.04,.04,x,.62,.12,a2,1);bx(g,.08,.1,.08,x,.45,.12,pc,1);}for(let j=0;j<6;j++)bx(g,.07,.1+(j%3)*.03,.07,-.4+j*.16,.45,.34,[a1,a2,pc,0xffffff,0x6dbf5a,0xf2c94c][j],1);wz=-.38;}
else if(k==='oven'){bx(g,.55,.5,.5,.3,.25,-.1,0x8a3a1a);bx(g,.45,.3,.4,.3,.65,-.1,0x8a3a1a);bx(g,.3,.2,.3,.3,.9,-.1,0x7a2f12);bx(g,.12,.5,.12,.3,1.2,-.1,0x555555);bx(g,.28,.16,.05,.3,.38,.17,0xff7a2f,1);bx(g,.5,.42,.34,-.22,.21,.22,wd);bx(g,.52,.05,.38,-.22,.44,.22,a2);for(let j=0;j<5;j++)bx(g,.14,.07,.09,-.4+j*.09,.5+(j%2)*.04,.22,[0xd9a066,0xc9803a,0xe8c48a][j%3],1);bx(g,.4,.04,.2,-.3,.7,-.3,wd);for(let j=0;j<3;j++)bx(g,.1,.05,.1,-.4+j*.12,.76,-.3,0xd9a066,1);wx=-.2;wz=-.2;sm=1;}
else if(k==='kiosk'){bx(g,.7,.9,.45,0,.45,-.1,a1);bx(g,.6,.4,.05,0,.7,.15,a2);bx(g,.5,.3,.05,0,.7,.18,pc);bx(g,.8,.08,.5,0,.92,-.1,dk);wz=-.4;}
else{bx(g,.7,1.3,.7,0,.65,0,a1);bx(g,.5,1,.05,0,.55,.37,a2);bx(g,.78,.1,.78,0,1.35,0,pc);bx(g,.16,.16,.06,.2,.8,.4,0xf2c94c);}
const v=['wc','aframe','flags','neon','mascot'].includes(k)?new THREE.Group():genChar('vendor','v'+i+'_'+(VC++),{topc:hx(a1),top2:hx(a2),top:d[1]==='food'||d[1]==='drink'?'apron':d[1]==='cloth'?'shirt':d[1]==='body'?'tank':d[1]==='shop'?'vest':'tee',hat:(k==='grill'||d[1]==='food')?'chef':k==='easel'?'beret':d[1]==='drink'?'bandana':k==='flowers'?'sunhat':k==='news'?'cap':'none',...(k==='busk'?{acc:'guitar',hat:'cap'}:{})});if(k!=='wc')v.position.set(wx,0,wz);g.add(v);g.userData.v=v;g.userData.an=d[11];g.userData.wl=[wx,wz];decor(g,d,k,i);
if(hsh('sp'+i)%100<24&&d[1]!=='amen'&&d[1]!=='lure')shopPet(g,i);
const ic=new THREE.Sprite(spm(d[12]));ic.scale.set(.75,.75,1);ic.position.set(0,1.75,0);ic.renderOrder=8;g.add(ic);g.userData.ic=ic;
for(const ch of g.children){ch.position.multiplyScalar(.85);if(ch!==v)ch.scale.multiplyScalar(.85);}g.userData.wl=[wx*.85,wz*.85];
if(sm)g.userData.sm=[0,1,2].map(()=>{const m=new THREE.Mesh(gm(.12,.12,.12),SMK);g.add(m);return m;});return g;}
// ---- sales, coins, bars ----
let lb=0;const bump=()=>{const n=performance.now();if(n-lb<250)return;lb=n;const e=$('cc');e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');};
function pay(val,x,z,y){S.cash+=val;S.earn+=val;popup('+€'+val,x,z,y);sfx('coin');gainXP(val/60);bump();}
function sales(dm,ph){const vd=new Set();for(const s of stalls.values())vd.add(s.i);const vb=1+Math.min(.3,.03*vd.size);
for(const s of stalls.values()){if(s.st!=='open'||s.off)continue;const g=G[s.z][s.x],d=ST[s.i];let r=d[7]*AF[g.a]*(g.k==='site'?1.4:1)*SMUL[sch(s.i)];
if(ph==='night'){if(g.a===1||g.a===2)continue;r*=NM[d[1]]*Math.min(2,(S.att[1]+S.att[2])/500);}else r*=stallBrand(d[1])*(S.ev.m[d[1]]||1)*S.ev.f*S.foot*(.7+S.cul/100)*vb*(S.gig?1+DAYACTS[S.dayAct].foot:1)*(1+Math.min(.8,S.tide/40));
if(r<=0)continue;const zz=PZ[s.pz];s.acc+=dm/60*3*(ph==='night'?.8:1)*(1+.2*s.u.st)*zz.f;if(s.acc>=1){s.acc-=1;const v=Math.max(1,Math.round(r/3*(.8+Math.random()*.4)*(1+.25*s.u.eq)*zz.v));pay(v,s.m.position.x,s.m.position.z,1.9);s.tot+=v;s.cnt++;s.busy=1.6;S.sales++;}}
if(ph==='day')S.cash+=15*S.foot/60*dm;
if(ph==='night')for(const b of BARS){if(!S.barOn[b.r])continue;b.acc+=S.barRate[b.r]*dm;if(b.acc>=10){const v=Math.round(b.acc);b.acc=0;pay(v,b.x,b.z,1.7);S.rep.bar+=v;b.busy=1.4;S.bars++;}}}
function barSetOld(){const a1=AC[S.act[1]],a2=AC[S.act[2]];S.barRate=[0,S.att[1]*(a1.bar||0)/300/2,S.att[2]*(a2.bar||0)/300,(S.att[1]+S.att[2])*2/300];S.barOn=[0,S.att[1]>0,S.att[2]>0,S.att[1]+S.att[2]>0];}
function animAll(now,dt){const t=now/1000;
for(const s of stalls.values()){const u=s.m.userData,v=u.v;if(s.st==='walk'||s.st==='away'||s.st==='closed'){continue;}s.busy=Math.max(0,s.busy-dt);const b=s.busy>0?1:.3,k=Math.sin(t*6+s.i);let L=-.2,Rr=-.2,by=0;
switch(s.st==='pack'?'fold':u.an){case 'cook':L=-1+.3*k*b;Rr=-1.1-.3*Math.cos(t*6)*b;by=Math.abs(k)*.03*b;break;case 'draw':Rr=-1.3+.5*Math.sin(t*3)*b;break;case 'tattoo':Rr=-1.4+.07*Math.sin(t*45);L=-.3;break;case 'craft':Rr=-.4+1.2*Math.max(0,Math.sin(t*7+s.i))*b;L=-.6;break;case 'fold':L=Rr=-.9+.5*Math.sin(t*3+s.i)*b;break;case 'pour':Rr=-1.1+.6*Math.sin(t*2)*b;L=-.3;break;case 'shake':L=Rr=-1.3+.4*Math.sin(t*14)*b;break;case 'press':L=Rr=-.6-.9*Math.max(0,Math.sin(t*3))*b;break;case 'pose':L=Rr=-2.5+.4*Math.sin(t*8)*b;break;case 'scoop':Rr=-1+.7*Math.sin(t*5)*b;L=-.4;break;case 'slice':Rr=-.6+.9*Math.max(0,Math.sin(t*9))*b;L=-.3;break;case 'flip':Rr=-1.2+Math.sin(t*4)*b;L=-.5;break;default:Rr=-.5-.9*Math.max(0,Math.sin(t*4+s.i))*b;}
if(v.al){v.al.rotation.x=L;v.ar.rotation.x=Rr;v.position.y=by;}
if(u.ic){u.ic.visible=!!SET.ico&&VW.hw<22;u.ic.position.y=1.5+Math.sin(t*2+s.i)*.06+(s.busy>0?.12*Math.sin(s.busy*10):0);}
if(u.sm)u.sm.forEach((m,j)=>{const q=(t*.6+j*.33)%1;m.position.set(.32,1.3+q*.7,-.18);m.scale.setScalar(1-q*.6);});}
venueAnim(t,dt);for(const b of BARS){const on=S.ph==='night'&&S.barOn[b.r];b.w.visible=on;if(on){b.busy=Math.max(0,b.busy-dt);b.w.ar.rotation.x=-1+.6*Math.sin(t*3)*(b.busy>0?1:.2);b.w.al.rotation.x=-.5;}}
for(const p of POP)if(p.l>0){p.l-=dt;p.y+=dt*1.1;p.s.position.set(p.x,p.y,p.z);p.s.material.opacity=Math.min(1,p.l*2.5);if(p.l<=0)p.s.visible=false;}}
// ---- night-life: genres, acts, fame, upgrades ----
const GEN={techno:{n:'Hard techno',ic:'🔊',pr:6,bar:2.5,mer:0,hyp:6,her:4,cul:-1,nz:3,base:200},metal:{n:'Metal',ic:'🤘',pr:5.5,bar:3.5,mer:1.5,hyp:5,her:5,cul:0,nz:4,base:180},rock:{n:'Rock',ic:'🎸',pr:5,bar:2.5,mer:1.2,hyp:4,her:3,cul:1,nz:2,base:170},indie:{n:'Indie live',ic:'🎤',pr:4,bar:2,mer:.8,hyp:3,her:1,cul:2,nz:1,base:110},pop:{n:'Pop & funk',ic:'🕺',pr:6,bar:2,mer:2,hyp:4,her:1,cul:1,nz:1,base:150}};
const TIERS=[['Local',1,1,1,0],['Regional',1.8,1.25,1.5,15],['National',3.2,1.6,2.2,35],['Headliner',5.5,2.1,3,65]];
const AC={none:{n:'No event'}};
for(const g in GEN)TIERS.forEach((t,i)=>{const q=GEN[g],cost=Math.round(100*t[1]*(g==='indie'?1:1.5));AC[g+i]={n:q.ic+' '+q.n+' · '+t[0]+' €'+cost,g,t:i,cost,price:Math.round(q.pr*t[2]*10)/10,bar:q.bar,mer:q.mer,base:q.base*t[3],k:5*t[3],hyp:q.hyp+i,cul:q.cul,her:q.her,u:t[4]};});
const UPG=[['tix','Ticket office','🎫',[250,500,900],[1,3,6],'+350 door capacity per level'],['cloak','Cloakroom','🧥',[200,450,800],[2,4,7],'coat-check income per guest'],['bar','Bar staff','🍺',[300,600,1000],[2,5,8],'+20% bar sales per level'],['snd','Sound system','🔊',[400,800,1500],[3,5,8],'+6% crowd, fewer complaints'],['lit','Light rig','💡',[300,700,1300],[3,6,9],'+hype, brighter shows'],['sec','Security team','🛡️',[250,500,900],[2,4,7],'fewer incidents']];
const SCHN={D:'Daily',W:'Fri-Sun',M:'Tue-Thu',F:'Flexible'},SMUL={D:1,W:1.5,M:1.25,F:1.15},sch=i=>['D','W','D','M','F','D','W'][i%7];
const attends=s=>{if(ST[s.i][1]==='lure')return true;const c=sch(s.i),d=dow();return c==='D'||(c==='W'&&d>=3&&d<=5)||(c==='M'&&d<=2)||(c==='F'&&Math.random()<.65);};
for(let y=3;y<=8;y++)G[y][20].b=G[y][21].b=0;for(let y=12;y<=16;y++)G[y][20].b=G[y][21].b=0;
const gh=(r,t)=>{const a=AC[S.act[r]],g=a&&a.g;if(g==='metal')return .01+.02*Math.sin(t*10);if(g==='rock')return .09+.02*Math.sin(t*2);if(g==='indie')return .6+.15*Math.sin(t*.7);return (t*.15+(r===2?.5:0))%1;};
// ---- the daily dance: pack the market away at night, set it up in the morning ----
const WSP=.25,SLOTS={r1:[],r2:[],bk:[]};
for(let r=0;r<3;r++)for(let q=0;q<8;q++)SLOTS.r1.push({x:6.5+q,z:5.8+r,u:null});for(let r=0;r<4;r++)for(let q=0;q<5;q++)SLOTS.r2.push({x:10+q*1.1,z:13+r*1.3,u:null});for(const z of [9.6,11.8,12.7,13.5])for(const x of [1.6,2.8])SLOTS.bk.push({x,z,u:null});
function mkCrate(i){const g=new THREE.Group();bx(g,.45,.35,.45,0,.18,0,ST[i][3]);bx(g,.47,.06,.47,0,.38,0,ST[i][4]);bx(g,.2,.12,.12,0,.3,.24,ST[i][5],1);return g;}
function toMidOld(x,z,a){if(a===1)return [[8.6,8.3],[8.6,9.4],[8.6,10.4]];if(a===2)return [[13,13],[13,11.8],[13,10.4]];if(z<3.4)return [[x,2.6],[20.8,2.6],[20.8,10.4]];if(z>18.1)return [[x,18.6],[20.8,18.6],[20.8,10.4]];if(x>19.6)return [[20.8,z],[20.8,10.4]];return [[x,10.4]];}
function destOld(k){if(k==='r1')return [[8.6,10.4],[8.6,9.4],[8.6,8.3]];if(k==='r2')return [[13,10.4],[13,11.8],[13,13]];if(k==='bk')return [[5.4,10.4],[4.4,10.7]];return [[20.8,10.4],[23,10.65],[26.6,10.65]];}
function carry(s){const v=s.m.userData.v;if(s.crate){v.add(s.crate);s.crate.position.set(0,.42,.34);s.crate.scale.setScalar(.75);}}
function startWalk(s){const v=s.m.userData.v,u=s.m.userData,tx=s.x+.5,tz=s.z+.5,a=G[s.z][s.x].a;s.m.visible=false;sc.add(v);v.position.set(tx+u.wl[0],0,tz+u.wl[1]);s.crate=mkCrate(s.i);carry(s);
s.wp=[...toMid(tx,tz,a),...dest(s.k)];if(s.slot)s.wp.push([s.slot.x,s.slot.z]);s.st='walk';s.ph=0;}
function comeBack(s){const v=s.m.userData.v,tx=s.x+.5,tz=s.z+.5,a=G[s.z][s.x].a,fm=toMid(tx,tz,a).slice().reverse();fm.push([tx,tz]);let sx=34,sz=10.65,pts;
if(s.slot){const q=s.slot;sx=q.x;sz=q.z;pts=[...dest(s.k).slice().reverse(),...fm];carry(s);q.u=null;s.slot=null;}else{pts=[[23,10.65],[20.8,11.5],...fm];s.crate=mkCrate(s.i);carry(s);}
sc.add(v);v.position.set(sx,0,sz);v.visible=false;s.m.visible=false;s.wp=pts;s.goal='home';s.st='walk';s.ph=0;}
function arrive(s){const v=s.m.userData.v,u=s.m.userData;
if(s.goal==='store'){s.crate.scale.setScalar(1);s.crate.position.set(s.slot.x,0,s.slot.z);sc.add(s.crate);sc.remove(v);s.st='away';}
else if(s.goal==='leave'){if(s.crate&&s.crate.parent)s.crate.parent.remove(s.crate);s.crate=null;sc.remove(v);s.st='away';}
else{if(s.crate&&s.crate.parent)s.crate.parent.remove(s.crate);s.crate=null;sc.remove(v);s.m.add(v);v.position.set(u.wl[0],0,u.wl[1]);v.rotation.y=0;swing(v,0);s.m.visible=true;s.m.scale.setScalar(.01);s.sc=.01;s.st='setup';}}
function walk(s,dm){const v=s.m.userData.v;v.visible=true;const p=s.wp[0];if(!p){arrive(s);return;}const dx=p[0]-v.position.x,dz=p[1]-v.position.z,d=Math.hypot(dx,dz),st=WSP*dm;
if(d<=st){v.position.x=p[0];v.position.z=p[1];s.wp.shift();}else{v.position.x+=dx/d*st;v.position.z+=dz/d*st;v.rotation.y=Math.atan2(dx,dz);}
s.ph+=dm;const sw=Math.sin(s.ph*1.4)*.7;swing(v,sw);v.al.rotation.x=-1.1;v.ar.rotation.x=-1.1;v.position.y=Math.abs(sw)*.05;}
function tickStalls(dm){for(const s of stalls.values()){const u=s.m.userData;if(s.mk)s.mk.visible=!!SET.ico&&s.st==='away'&&!s.pr&&(S.ph==='setup'||S.ph==='day');
if(s.d>0){s.d-=dm;continue;}
if(s.st==='pack'){s.sc=Math.max(.01,s.sc-dm/6);s.m.scale.setScalar(s.sc);if(s.sc<=.011)startWalk(s);}
else if(s.st==='walk')walk(s,dm);
else if(s.st==='setup'){u.v.visible=true;s.m.visible=true;s.sc=Math.min(1,s.sc+dm/8);s.m.scale.setScalar(s.sc<1?s.sc*(1+.25*Math.sin(s.sc*3.14)):1);if(s.sc>=1){s.st='open';s.m.scale.setScalar(1);sfx('click');}}}}
function settle(s){if(s.st==='pack')startWalk(s);if(s.st==='walk'){s.wp=[];arrive(s);}}
function stow(){const ev=[0,S.act[1]!=='none',S.act[2]!=='none'];let i=0;
for(const s of stalls.values()){if(s.st==='setup'){s.st='open';s.sc=1;s.m.scale.setScalar(1);}if(s.st!=='open')continue;const a=G[s.z][s.x].a;if(a===3||a===4||a===9||ST[s.i][1]==='lure'||ST[s.i][2]==='wc')continue;s.d=(i++)*3;
if((a===1||a===2)&&!ev[a]){s.st='closed';s.m.userData.v.visible=false;continue;}
const opts=[];if(!ev[1]&&a!==1)opts.push('r1');if(!ev[2]&&a!==2)opts.push('r2');opts.push('bk');let k='out',slot=null;for(const o of opts){slot=SLOTS[o].find(q=>!q.u);if(slot){k=o;break;}}
if(k==='out')slot=null;else slot.u=s;s.k=k;s.slot=slot;s.goal=k==='out'?'leave':'store';s.st='pack';s.sc=1;}}
function morning(){let on=0,off=0,i=0;for(const s of stalls.values()){settle(s);const pr=ST[s.i][2]==='wc'||attends(s);s.pr=pr;s.d=(i++)*2.5;if(s.st==='setup')continue;
if(pr){on++;if(s.st==='away')comeBack(s);else if(s.st==='closed'){s.st='setup';s.sc=.01;s.m.scale.setScalar(.01);}}else{off++;if(s.st==='open'||s.st==='closed'){s.st='away';s.m.visible=false;}}}
S.log+=' Setup: '+on+' vendors arrive'+(off?', '+off+' are off today':'')+'.';}
function addMark(s){const k=new THREE.Sprite(spm('💤'));k.scale.set(.6,.6,1);k.position.set(s.x+.5,.8+gy(s.x+.5,s.z+.5),s.z+.5);k.renderOrder=8;k.visible=false;sc.add(k);s.mk=k;}
function delStall(o){sc.remove(o.m);if(o.mk)sc.remove(o.mk);const v=o.m.userData.v;if(v&&v.parent===sc)sc.remove(v);if(o.crate&&o.crate.parent)o.crate.parent.remove(o.crate);if(o.slot)o.slot.u=null;}
function shop(){}
