/* MF Borges Tycoon - people module (split from the single-file game; loads in order, shares global scope) */
// ---------- people & stalls ----------
const SK=[0xf1c27d,0xe0ac69,0xc68642,0x8d5524,0xffdbac],HR=[0x2b1d14,0x5a3825,0xd9a441,0xb5442b,0x1a1a1a,0xcccccc],SH=[0xe5593f,0x3b82d6,0x3ab795,0xf2c94c,0x8a63c7,0xffffff,0xff8fab,0x2f2f3a,0x6dbf5a,0xff9f43],PA=[0x2a3a5a,0x3a3a3a,0x6b5b45,0x4a6fa5,0x222222],rp=a=>a[Math.floor(Math.random()*a.length)];
function personOld(sh,pa,ha,sk,hat){const g=new THREE.Group();bx(g,.1,.22,.1,-.07,.11,pa);bx(g,.1,.22,.1,.07,.11,pa);bx(g,.26,.24,.14,0,.34,sh);bx(g,.08,.2,.08,-.17,.34,sh);bx(g,.08,.2,.08,.17,.34,sh);bx(g,.2,.2,.2,0,.56,sk);bx(g,.22,.08,.22,0,.68,ha);if(hat)bx(g,.28,.05,.28,0,.72,hat);return g;}
function mkStallOld(i){const d=ST[i],k=d[2],a1=d[3],a2=d[4],pc=d[5],g=new THREE.Group();let v;
if(k==='stall'){bx(g,.9,.4,.4,0,.2,.1,0x7b6a5a);for(let j=0;j<4;j++)bx(g,.225,.06,.75,-.34+j*.225,1,.05,j%2?a2:a1);for(const [x,z] of [[-.42,.38],[.42,.38],[-.42,-.28],[.42,-.28]])bx(g,.05,.9,.05,x,.5,z,0x4a3a2a);
for(let j=0;j<5;j++)bx(g,.12,.1+((j*7)%3)*.05,.12,-.34+j*.17,.45,.12,j%2?pc:a2);v=person(a1,0x2a3a5a,rp(HR),rp(SK),0);v.position.set(0,0,-.2);}
else if(k==='chair'){bx(g,.9,.8,.06,0,.4,-.4,a1);bx(g,.9,.1,.06,0,.85,-.4,a2);bx(g,.3,.1,.4,0,.25,.05,0xeeeeee);bx(g,.3,.35,.08,0,.45,-.18,0xeeeeee);bx(g,.06,.5,.06,.3,.25,0,0x888888);bx(g,.16,.08,.16,.3,.52,0,pc);v=person(a2,0x222222,rp(HR),rp(SK),0);v.position.set(-.3,0,.1);}
else if(k==='booth'){bx(g,.8,1.15,.8,0,.58,0,a1);bx(g,.6,.8,.05,0,.45,.41,a2);bx(g,.84,.14,.84,0,1.22,0,pc);bx(g,.12,.12,.06,.3,.9,.43,0xffffff);v=person(a2,0x333333,rp(HR),rp(SK),0);v.position.set(-.45,0,.45);}
else if(k==='wc'){bx(g,.7,1.3,.7,0,.65,0,a1);bx(g,.5,1,.05,0,.55,.37,a2);bx(g,.78,.1,.78,0,1.35,0,pc);bx(g,.16,.16,.06,.2,.8,.4,0xf2c94c);v=new THREE.Group();}
else{bx(g,.05,.9,.05,-.2,.45,-.1,0x8a6a4a);bx(g,.05,.9,.05,.2,.45,-.1,0x8a6a4a);bx(g,.55,.6,.05,0,.65,0,a1);bx(g,.45,.5,.06,0,.65,.02,pc);bx(g,.22,.22,.22,.1,.2,.5,0x7b6a5a);v=person(a2,0x333333,rp(HR),rp(SK),0x5a3a2a);v.position.set(.1,0,.5);}
g.add(v);g.userData.v=v;return g;}
const V=[];for(let i=0;i<56;i++){const m=genChar('tourist','x'+i);m.visible=false;m.userData={sp:.9+Math.random()*.8,a:-1,tx:0,tz:0};sc.add(m);V.push(m);}
const PL=genChar('manager','p',MGR_DAY),Pp={x:13,z:10.5};PL.scale.setScalar(1.1);sc.add(PL);const mk=bx(sc,.2,.2,.2,0,0,0,0xffd166,1);
const POP=[];for(let i=0;i<40;i++){const k=document.createElement('canvas');k.width=96;k.height=24;const t=new THREE.CanvasTexture(k);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(2.4,.6,1);s.visible=false;s.renderOrder=10;sc.add(s);POP.push({s,k,t,l:0,x:0,y:0,z:0});}
function popup(txt,x,z,y){if(!SET.pop)return;const p=POP.find(q=>q.l<=0);if(!p)return;const q=p.k.getContext('2d');q.clearRect(0,0,96,24);q.fillStyle='#f2c94c';q.strokeStyle='#7a5a0a';q.lineWidth=2;q.beginPath();q.arc(12,12,8,0,7);q.fill();q.stroke();q.fillStyle='#fff3b0';q.fillRect(9,8,3,8);q.font='bold 15px monospace';q.lineWidth=3;q.strokeStyle='#1b1b2f';q.strokeText(txt,26,17);q.fillStyle='#fff';q.fillText(txt,26,17);p.t.needsUpdate=true;p.l=1.1;p.x=x;p.z=z;p.y=y;p.s.visible=true;}
const BARS=[[15,4,19,6,1],[15,7,19,9,1],[15,12,19,14,2],[25,3,27,8,3],[25,13,27,18,3]].map(([x0,z0,x1,z1,r])=>{const b={r,x:(x0+x1)/2,z:(z0+z1)/2,acc:0,busy:0,w:genChar('bartender','b'+x0+'_'+z0)};if(r===3)b.w.position.set(b.x-.55,0,b.z);else b.w.position.set(b.x,0,b.z-.55);b.w.visible=false;sc.add(b.w);return b;});
// ticket office, cloakroom and door queue
const TB=[21.3,7.2],CB=[21.3,13.2];
bx(sc,.5,.5,1.8,TB[0],.25,TB[1],0x5a3a26);bx(sc,.52,.06,1.9,TB[0],.52,TB[1],0xd9cdb8);bx(sc,.1,.55,1.8,TB[0]-.2,.85,TB[1],GLS,1);bx(sc,.5,.5,1.8,CB[0],.25,CB[1],0x3a3a50);bx(sc,.52,.06,1.9,CB[0],.52,CB[1],0xd9cdb8);

const TW=[0,1,2,3].map(i=>{const w=genChar('ticket','t'+i);w.position.set(TB[0]+.55,0,TB[1]-.7+i*.45);w.rotation.y=-Math.PI/2;w.visible=false;sc.add(w);return w;});
const CW=genChar('cloak','c');CW.position.set(CB[0]+.55,0,CB[1]);CW.rotation.y=-Math.PI/2;CW.visible=false;sc.add(CW);
const RK=[];for(let j=0;j<8;j++){const m=bx(sc,.08,.6,.2,CB[0]+.95,.6,CB[1]-.9+j*.25,[0xe5593f,0x222222,0x3b82d6,0x6b5b45][j%4],1);m.visible=false;RK.push(m);}
const QP=[];for(let i=0;i<10;i++){const p=genChar('local','q'+i);p.position.set(TB[0]-.9,0,TB[1]-1.5-i*.3);p.rotation.y=Math.PI/2;p.visible=false;sc.add(p);QP.push(p);}
function venueAnim(t,dt){const nt=S.ph==='night',tot=S.att[1]+S.att[2],busy=nt&&tot>0;TW.forEach((w,i)=>{w.visible=i<=S.up.tix;w.ar.rotation.x=-.6-(busy?.5*Math.max(0,Math.sin(t*5+i)):0);w.al.rotation.x=-.3;});
CW.visible=S.up.cloak>0;if(CW.visible){CW.ar.rotation.x=-.8-(busy?.6*Math.sin(t*4):0);CW.al.rotation.x=-.3;}
const q=busy?Math.min(QP.length,Math.round(tot/120)):0;QP.forEach((p,i)=>{p.visible=i<q;if(i<q)p.position.y=Math.abs(Math.sin(t*3+i))*.03;});for(let i=0;i<RK.length;i++)RK[i].visible=i<2+S.up.cloak*2;perfAnim(t);envAnim(t,dt);polishAnim(t,dt);}
// stage performers, door security and floor crew
const PF=[[],[0,1,2].map(i=>{const p=genChar('metal','pf1'+i);p.position.set([4.2,3.6,3.6][i],.3,[6.5,5.2,7.8][i]);p.rotation.y=Math.PI/2;p.visible=false;p.on=false;sc.add(p);return p;}),[0,1,2].map(i=>{const p=genChar('metal','pf2'+i);p.position.set([8.2,7.4,7.4][i],.3,[15.5,14.4,16.6][i]);p.rotation.y=Math.PI/2;p.visible=false;p.on=false;sc.add(p);return p;})];
const SEC=[[21.9,9.1],[21.9,12.3]].map((q,i)=>{const p=genChar('security','sec'+i);p.position.set(q[0],0,q[1]);p.rotation.y=Math.PI/2;p.visible=false;sc.add(p);return p;});
const FSF=[0,1,2].map(i=>{const p=genChar('club','fs'+i);p.visible=false;sc.add(p);return p;});
function perfAnim(t){const nt=S.ph==='night';for(const r of [1,2]){const on=nt&&S.att[r]>0,g=on?AC[S.act[r]].g:'';PF[r].forEach((p,i)=>{p.visible=on&&p.on;if(!p.visible)return;const sp=g==='metal'?9:g==='techno'?4:6;
if(g==='techno'){p.al.rotation.x=-1.2+Math.sin(t*sp+i)*.3;p.ar.rotation.x=-1.2+Math.sin(t*sp+1)*.3;p.hd.rotation.x=Math.sin(t*4)*.15;}
else{p.ar.rotation.x=-1.3+Math.sin(t*sp)*.5;p.al.rotation.x=i===0?-2.4+Math.sin(t*sp)*.5:-1;p.hd.rotation.x=Math.sin(t*sp*.5+i)*(g==='metal'?.7:.2);}
p.position.y=.3+Math.abs(Math.sin(t*sp*.5+i))*.05;});}
SEC.forEach(p=>{p.visible=nt;p.ar.rotation.x=-.2;});FSF.forEach((p,i)=>{p.visible=nt;if(!nt)return;const x=12+6*Math.sin(t*.25+i*2.1),dx=Math.cos(t*.25+i*2.1);p.position.set(x,0,10.6+(i-1)*.4);p.rotation.y=dx>0?Math.PI/2:-Math.PI/2;swing(p,Math.sin(t*7+i)*.6);});}
// ================= the world outside: streets, square, stairs, houses; hall pillars and day stage; street life =================
const W0=sc.children.length;const RDC=0x3b3b42,SWC=0xaaa59c,HCL=[0xe8d9b0,0xd9b8a0,0xc9d6c0,0xe5c6c6,0xbcd1e0,0xf0e0a0];
const ZS=(a,b)=>{const r=[];for(let z=a;z<b;z++)r.push(z);r.push(b);return r;};const pl2=(x0,z0,x1,z1,c,y)=>{const xs=[];for(let x=x0;x<x1;x++)xs.push(x);xs.push(x1);const m=new THREE.Mesh(terrG(xs,ZS(z0,z1),(x,z)=>y+Hs(x,z),x=>(x-x0)/(x1-x0),z=>1-(z-z0)/(z1-z0)),mt(c));m.receiveShadow=true;m.userData.nofix=1;sc.add(m);};pl2(-16,0,0,21,0x8e8c92,-.01);
pl2(-16,-9,60,-3.2,RDC,-.012);pl2(-16,24.2,60,30,RDC,-.012);pl2(48,0,51.2,21,RDC,-.012);pl2(-16,-3.2,60,0,SWC,-.008);pl2(-16,21,60,24.2,SWC,-.008);pl2(51.2,-3.2,54.4,24.2,SWC,-.008);
for(let x=-14;x<56;x+=2.4){bx(sc,1.2,.02,.14,x,.012,-6.1,0xe8e8e8,1);bx(sc,1.2,.02,.14,x,.012,27.1,0xe8e8e8,1);}
for(let z=-8;z<30;z+=2.4)bx(sc,.14,.02,1.2,48.1,.012,z,0xe8e8e8,1);
for(let j=0;j<8;j++)bx(sc,.3,.02,2.2,45.3+j*.75,.012,10.5,0xf0f0f0,1);
for(let x=-15;x<60;x++){bx(sc,1.04,.1,.15,x+.5,.05,-3.2,0xc9c4ba,1);bx(sc,1.04,.1,.15,x+.5,.05,24.2,0xc9c4ba,1);}
function house(x,z,w,h,d,rot,i){const g=new THREE.Group(),c=HCL[i%HCL.length];bx(g,w,h,d,0,h/2,0,c,1);bx(g,w,1.8,d,0,-.9,0,c,1);const nx=Math.max(2,Math.floor(w/1.4)),ny=Math.floor(h/1.6);for(let a=0;a<nx;a++)for(let b=0;b<ny;b++)bx(g,.6,.8,.05,-w/2+(a+.5)*w/nx,.9+b*1.6,d/2+.02,(a+b)%3?0x35506a:0x2a3f55,1);
bx(g,.8,1.2,.06,-w/2+.7,.6,d/2+.02,0x5a3a26,1);bx(g,w+.3,.35,d+.3,0,h+.17,0,0xc2552f,1);bx(g,w*.7,.35,d*.8,0,h+.5,0,0xb34a28,1);bx(g,w*.4,.3,d*.6,0,h+.8,0,0xa44322,1);g.position.set(x,0,z);g.rotation.y=rot;sc.add(g);}
{let i=0;for(let x=-14;x<58;i++){const w=4+(i*7)%3,h=5+(i*5)%3;house(x+w/2,-11,w,h,4,0,i);x+=w+.15;}i=3;for(let x=-14;x<58;i++){const w=4+(i*5)%3,h=5+(i*3)%3;house(x+w/2,32,w,h,4,Math.PI,i);x+=w+.15;}i=1;for(let z=-6;z<28;i++){const w=4+(i*7)%3,h=5+(i*5)%3;house(57,z+w/2,w,h,4,-Math.PI/2,i);z+=w+.15;}}
const murMat=new THREE.MeshLambertMaterial({map:cvx(64,32,q=>{pxl(q,'#cfe3ee',0,0,64,32);const cs=['#2f6db5','#ffffff','#e5593f','#8fb7d1','#1b1b2f'];for(let i=0;i<16;i++){q.fillStyle=cs[i%5];q.beginPath();q.moveTo(rn(64),rn(32));q.lineTo(rn(64),rn(32));q.lineTo(rn(64),rn(32));q.closePath();q.fill();}})}),pl3=mt(0xd9b8a0);
const mb=new THREE.Mesh(gm(9,8,16),[murMat,pl3,pl3,pl3,pl3,pl3]);mb.position.set(-5.2,4,10.6);sc.add(mb);bx(sc,9,1.8,16,-5.2,-.4,10.6,0xd9b8a0,1);bx(sc,9.4,.5,16.4,-5.2,8.25,10.6,0xc2552f,1);bx(sc,6,.5,12,-5.2,8.75,10.6,0xb34a28,1);
// beer garden along the terrace railing: red market umbrellas over tables and benches, festoon lights strung from the hall front to the railing
for(const z of [1.6,3.3,5.0,15.75,17.3,18.85]){const x=27.85;bx(sc,.05,1.25,.05,x,.62,z,0x6a6a6a);bx(sc,1.3,.05,1.3,x,1.27,z,0xb3261e);bx(sc,.95,.06,.95,x,1.32,z,0xc4372b);bx(sc,.5,.06,.5,x,1.37,z,0xb3261e);bx(sc,.08,.06,.08,x,1.42,z,0xe6c200);
 for(const sd of [-1,1]){bx(sc,1.3,.12,.02,x,1.2,z+sd*.65,0x941d15,1);bx(sc,.02,.12,1.3,x+sd*.65,1.2,z,0x941d15,1);bx(sc,.75,.05,.16,x,.27,z+sd*.45,0x6b4a2b,1);bx(sc,.05,.25,.05,x+.3,.13,z+sd*.45,0x333333,1);bx(sc,.05,.25,.05,x-.3,.13,z+sd*.45,0x333333,1);}
 bx(sc,.75,.05,.55,x,.42,z,0x7a5536);bx(sc,.06,.4,.06,x,.2,z,0x333333,1);bx(sc,.06,.12,.06,x+.15,.5,z-.1,0xd9a441,1);bx(sc,.06,.12,.06,x-.12,.5,z+.12,0xf4f4f4,1);}
{const FLM=new THREE.MeshBasicMaterial({color:0xffd27a});for(const z of [1.2,2.9,4.6,15.4,17.0,18.5,20.0])for(let k=0;k<=12;k++){const f=k/12,m=new THREE.Mesh(gm(.07,.07,.07),FLM);m.position.set(22.7+f*6.05,2.3-(2.3-.98)*f-Math.sin(f*Math.PI)*.35,z);sc.add(m);}}
function tree(x,z,s){bx(sc,.22,1.4*s,.22,x,.7*s,z,0x5a4028);bx(sc,1.5*s,.7*s,1.5*s,x,1.6*s,z,0x3d7a3a);bx(sc,1.1*s,.6*s,1.1*s,x,2.1*s,z,0x4b9144);bx(sc,.6*s,.5*s,.6*s,x,2.55*s,z,0x5aa650);}
function palm(x,z){bx(sc,.2,2.4,.2,x,1.2,z,0x8a6a4a);for(let k=0;k<6;k++){const a=k*Math.PI/3,f=bx(sc,1.2,.05,.2,x+Math.cos(a)*.55,2.5,z+Math.sin(a)*.55,0x3d8a3a,1);f.rotation.y=-a;}}
function bench(x,z,r){const g=new THREE.Group();bx(g,.9,.08,.3,0,.4,0,0x7b5a3a,1);bx(g,.9,.3,.06,0,.6,-.13,0x7b5a3a,1);bx(g,.06,.4,.26,-.4,.2,0,0x333333,1);bx(g,.06,.4,.26,.4,.2,0,0x333333,1);g.position.set(x,0,z);g.rotation.y=r;sc.add(g);}
function lamp(x,z){bx(sc,.08,2.4,.08,x,1.2,z,0x2a2a2a);const m=new THREE.Mesh(gm(.24,.24,.24),BM);m.position.set(x,2.5,z);sc.add(m);}
function bigTree(x,z,s){bx(sc,.35,1.6*s,.35,x,.8*s,z,0x4a3626);const c=[0x24451f,0x2c5224,0x1f3d1c];[[0,2.0,0,2.4,1.4],[.2,2.9,-.1,1.9,1.2],[-.1,3.6,.1,1.2,.9],[.7,1.9,.5,1.3,1.0],[-.7,2.1,-.5,1.4,1.0]].forEach(([dx,y,dz,w,h],i)=>bx(sc,w*s,h*s,w*s,x+dx*s,y*s,z+dz*s,c[i%3]));}
for(const [x,z,s] of [[33.2,2.4,1.25],[44,3.2,1.2],[33.2,18.6,1.35],[34.4,19.6,.9],[44.2,18.4,1]])bigTree(x,z,s);
for(const [x,z] of [[39,5.6],[39,15.4]])tree(x,z,.8);
for(let a=-1.45;a<=1.46;a+=.19){const x=33.4+Math.cos(a)*11.2,z=10.5+Math.sin(a)*8.9;const m=bx(sc,.5,.35,.34,x,.17,z,0xb9b2a4);m.rotation.y=-Math.atan2(Math.cos(a)*8.9,-Math.sin(a)*11.2)+Math.PI/2;bx(sc,.3,.28,.3,x,.45,z,0x3f6b2f,1);}
for(const [x,z,r] of [[35,6.8,.55],[35,14.2,-.55],[39.4,8.2,.6],[39.4,12.8,-.6]])bench(x,z,r);for(const [x,z] of [[34,10.5],[38,7.5],[38,13.5],[44.2,6],[44.2,15]])lamp(x,z);

for(const [x,z,r] of [[33.2,9,Math.PI/2],[33.2,12,Math.PI/2],[40,6.2,0],[40,14.8,Math.PI]])bench(x,z,r);for(const [x,z] of [[32.6,2],[32.6,19],[36.5,8],[36.5,13],[44.2,6],[44.2,15]])lamp(x,z);
{const mx=41.5,mz=10.5,br=0x4a443c,st=0xd6d0c2;bx(sc,3.6,.2,3.6,mx,.1,mz,STONE);bx(sc,3.0,.3,3.0,mx,.35,mz,0xb9b2a4);bx(sc,2.4,.4,2.4,mx,.7,mz,0xc4beb0);bx(sc,1.8,1.5,1.8,mx,1.65,mz,st);bx(sc,2.0,.2,2.0,mx,2.5,mz,0xb9b2a4);bx(sc,1.3,1.4,1.3,mx,3.3,mz,0xdad4c6);bx(sc,1.0,1.1,1.0,mx,4.5,mz,st);bx(sc,1.2,.18,1.2,mx,5.1,mz,0xb9b2a4);bx(sc,.8,.5,.8,mx,5.45,mz,st);bx(sc,.45,.7,.3,mx,6.05,mz,st);bx(sc,.3,.3,.3,mx,6.55,mz,st);bx(sc,.14,.5,.14,mx+.3,6.1,mz+.1,st);
for(const [dx,dz] of [[1.05,0],[-1.05,0],[0,1.05],[0,-1.05]]){bx(sc,.35,.8,.35,mx+dx,1.5,mz+dz,0xc9c3b4);bx(sc,.25,.5,.25,mx+dx*1.15,2.2,mz+dz*1.15,br);}}
// pillars in the main hall + the day stage
for(const x of [10.2,12.6,19.2]){colm(x,9.4,2.4);WALLS.push([x-.15,9.25,x+.15,9.55]);}for(const x of [6.4,8.8,11,15.2,17.6,19.4]){colm(x,11.9,2.4);WALLS.push([x-.15,11.75,x+.15,12.05]);}
bx(sc,6.8,.14,.12,9.5,2.7,9.4,RED,1);bx(sc,13.1,.14,.12,12.9,2.7,11.9,RED,1);
bx(sc,3.4,.3,2,6.9,.15,10.1,0x6b4f3a);bx(sc,3.5,.04,2.1,6.9,.32,10.1,0x2a2a35,1);bx(sc,.05,1.5,2,5.25,1.05,10.1,0x7a1f3d,1);for(const z of [9.15,11.05])bx(sc,.1,2.3,.1,8.4,1.15,z,0x555a66,1);bx(sc,.1,.1,2,8.4,2.3,10.1,0x555a66,1);WALLS.push([5.2,9.1,8.6,11.1]);
const DSL=[0,1,2,3].map(i=>{const m=new THREE.Mesh(gm(.16,.16,.16),new THREE.MeshBasicMaterial({color:0x333340}));m.position.set(8.3,2.2,9.4+i*.45);sc.add(m);return m;});
const PFD=[0,1,2].map(i=>{const p=genChar('local','pd'+i);p.position.set([6.3,7.2,6.3][i],.3,[9.6,10.1,10.6][i]);p.rotation.y=Math.PI/2;p.visible=false;p.on=false;sc.add(p);return p;});
// shift the outside scenery onto the sloping terrain
for(let i=W0;i<sc.children.length;i++){const o=sc.children[i];if(o.userData.nofix)continue;o.position.y+=gb(o.position.x,o.position.z);}
// ---- the granite base: solid, uneven plinth — one storey at the west end (garage doors), two at the east end (police station) — rounded corners, red railings, twin stairs front and east ----
{const CP=0xcfc9bb,GW=stoneMat(1,1),GS=stoneMat(1,1),STP=0xb3ad9f,BX=28.92,RC=.95;GW.side=THREE.DoubleSide;
function vwall(x0,z0,x1,z1,fb,n){const P=[],U=[],I=[],Ln=Math.hypot(x1-x0,z1-z0);for(let i=0;i<=n;i++){const f=i/n,x=x0+(x1-x0)*f,z=z0+(z1-z0)*f,yb=Math.min(0,fb(x,z))-.08;P.push(x,.03,z,x,yb,z);U.push(f*Ln,.03,f*Ln,yb);}
 for(let i=0;i<n;i++){const a=i*2;I.push(a,a+1,a+2,a+2,a+1,a+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();const m=new THREE.Mesh(g,GW);m.receiveShadow=true;sc.add(m);return m;}
vwall(BX,RC,BX,6,(x,z)=>Hs(29.05,z),6);vwall(BX,15,BX,21-RC,(x,z)=>Hs(29.05,z),6);vwall(-.02,-.02,BX-RC,-.02,(x,z)=>Hs(x,-.1),29);vwall(13.5,21.02,BX-RC,21.02,(x,z)=>Hs(x,21.1),16);vwall(-.02,-.02,-.02,21,(x,z)=>Hs(-.1,z),12);
// rounded corners with banded rustication (both front corners)
for(const [cz,ts] of [[RC,Math.PI/2],[21-RC,0]]){const h=dzF(cz)+.7,m=new THREE.Mesh(new THREE.CylinderGeometry(RC,RC,h,14,1,true,ts,Math.PI/2),stoneMat(1.5,h));m.position.set(BX-RC,.03-h/2,cz);sc.add(m);
 for(let y=-.42;y>-h+.5;y-=.42){const r=new THREE.Mesh(new THREE.CylinderGeometry(RC+.015,RC+.015,.04,14,1,true,ts,Math.PI/2),mt(0x6e695e));r.position.set(BX-RC,y,cz);sc.add(r);}}
for(let y=-.42;y>-3.3;y-=.42){const z0=RC,z1=3.8;bx(sc,.03,.04,z1-z0,BX+.015,y,(z0+z1)/2,0x6e695e,1);}
// coping stones along every edge
const cop=(x0,z0,x1,z1)=>{const v=x0===x1;bx(sc,v?.42:x1-x0,.1,v?z1-z0:.42,(x0+x1)/2,.05,(z0+z1)/2,CP,1);};
cop(BX-.12,RC,BX-.12,6);cop(BX-.12,15,BX-.12,21-RC);cop(0,.12,9.6,.12);cop(10.8,.12,BX-RC,.12);cop(14,20.88,BX-RC,20.88);cop(.12,0,.12,14);
// red cast-iron railing with the diamond lattice from the photos (one textured strip per run)
const RT=cvx(24,16,q=>{const c='#b3261e';pxl(q,c,0,0,24,2);pxl(q,c,0,14,24,2);for(let x=0;x<24;x+=12)pxl(q,c,x,0,2,16);for(let i=0;i<4;i++){const cx=i*6+3;for(let t=0;t<4;t++){pxl(q,c,cx+t,3+t);pxl(q,c,cx-t,3+t);pxl(q,c,cx+t,12-t);pxl(q,c,cx-t,12-t);}}pxl(q,'#c9a24b',0,0,24,1);});RT.wrapS=THREE.RepeatWrapping;
const RM2=new THREE.MeshLambertMaterial({map:RT,transparent:true,alphaTest:.45,side:THREE.DoubleSide});
function rail(x0,z0,y0,x1,z1,y1,h){h=h||.5;const Ln=Math.hypot(x1-x0,z1-z0),u=Ln/.75,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y0+.08,z0,x1,y1+.08,z1,x0,y0+.08+h,z0,x1,y1+.08+h,z1],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,u,0,0,1,u,1],2));g.setIndex([0,1,2,2,1,3]);g.computeVertexNormals();const m=new THREE.Mesh(g,RM2);sc.add(m);
 const np=Math.max(1,Math.round(Ln/2));for(let k=0;k<=np;k++){const f=k/np,x=x0+(x1-x0)*f,z=z0+(z1-z0)*f,y=y0+(y1-y0)*f;bx(sc,.07,h+.06,.07,x,y+.08+(h+.06)/2,z,RED,1);bx(sc,.09,.06,.09,x,y+.14+h,z,GOLD,1);}}
const arcR=(cz,a0,a1)=>{const r=RC-.08,cx=BX-RC;let p=null;for(let k=0;k<=4;k++){const a=a0+(a1-a0)*k/4,q=[cx+r*Math.cos(a),cz+r*Math.sin(a)];if(p)rail(p[0],p[1],0,q[0],q[1],0);p=q;}};
rail(BX-.08,RC,0,BX-.08,6,0);rail(BX-.08,15,0,BX-.08,21-RC,0);arcR(RC,0,-Math.PI/2);arcR(21-RC,0,Math.PI/2);
rail(0,.08,0,9.6,.08,0);rail(10.8,.08,0,BX-RC,.08,0);rail(15,20.92,0,BX-RC,20.92,0);rail(.08,0,0,.08,13,0);
// front stairs, cut into the base on the main door's axis: from the square a flight on each side of the tall central arch climbs OUTWARD to a side landing
// (with a door into the base), then a second flight turns back and climbs INWARD to the top landing over the arch, which is part of the terrace balcony
{const mid=-1.25,xi=27.49,xo=28.43,w=.93,ge=Hs(29.05,9.7),gw=Hs(29.05,11.3);
 const fl=(xc,za,zb,ya,yb)=>{const n=Math.max(2,Math.ceil(Math.abs(yb-ya)/.19)),r=(yb-ya)/n,run=(zb-za)/n;for(let i=0;i<n;i++){const top=ya+r*(i+1),zc=za+run*(i+.5),bot=Hs(29.05,zc)-.1;bx(sc,w,top-bot,Math.abs(run)+.005,xc,(top+bot)/2,zc,STP);bx(sc,w,.03,.03,xc,top+.005,zc+run/2,0x8f897d,1);}};
 fl(xo,9.7,6.7,ge,mid);fl(xo,11.3,14.3,gw,mid);fl(xi,6.7,9.7,mid,0);fl(xi,14.3,11.3,mid,0);
 for(const zc of [6.35,14.65]){const bot=Hs(29.05,zc)-.1;bx(sc,1.9,mid-bot,.7,27.96,(mid+bot)/2,zc,STP);}
 // the middle is recessed one block into the base: an open, double-height bay with a tall arched door on its back wall
 {const bot=Hs(29.05,10.5)-.1,FX2=27.97;bx(sc,.95,-.16-bot,1.6,27.485,(-.16+bot)/2,10.5,GS);
  vwall(FX2,9.7,FX2,11.3,(x,z)=>Hs(29.05,z),3);
  const ah=-bot-.5;archMesh(1.36,ah+.14,mt(0xd8d2c4),FX2+.005,bot+.1,10.5);archMesh(1.14,ah,mt(0x22262b),FX2+.015,bot+.1,10.5);
  for(let k=0;k<5;k++)bx(sc,.02,ah-.7,.025,FX2+.025,bot+.1+(ah-.7)/2,10.02+k*.24,0x555a60,1);bx(sc,.025,.05,1.1,FX2+.025,bot+.1+ah*.5,10.5,0x555a60,1);}
 bx(sc,.95,.16,1.6,27.485,-.08,10.5,STP);bx(sc,.99,.06,1.64,27.485,.03,10.5,CP,1);
 vwall(27.0,6,27.0,15,(x,z)=>Hs(29.05,z),9);vwall(27.0,6,BX,6,(x,z)=>Hs(29.05,6),3);vwall(27.0,15,BX,15,(x,z)=>Hs(29.05,15),3);
 {const d1=new THREE.Mesh(archGeo(.7,.95),mt(0x3a3036));d1.position.set(28.05,mid,6.02);sc.add(d1);const d2=new THREE.Mesh(archGeo(.7,.95),mt(0x3a3036));d2.rotation.y=Math.PI;d2.position.set(28.75,mid,14.98);sc.add(d2);}
 rail(28.88,9.7,ge,28.88,6.7,mid,.45);rail(28.88,11.3,gw,28.88,14.3,mid,.45);rail(28.88,6.7,mid,28.88,6.0,mid,.45);rail(28.88,14.3,mid,28.88,15,mid,.45);
 rail(27.95,6.7,mid,27.95,9.7,0,.45);rail(27.95,14.3,mid,27.95,11.3,0,.45);rail(27.96,9.7,0,27.96,11.3,0,.45);
 rail(27.0,6,0,27.0,9.7,0);rail(27.0,11.3,0,27.0,15,0);rail(27.0,6,0,28.9,6,0);rail(27.0,15,0,28.9,15,0);}
// east side twin stairs converging on the east entrance, with an arched door under the landing
const eflight=(xa,xb)=>{const yb=Ye(xa),rise=-yb,n=Math.ceil(rise/.19),r=rise/n,run=(xb-xa)/n;for(let i=0;i<n;i++){const top=yb+r*(i+1),xc=xa+run*(i+.5),bot=Ye(xc)-.1;bx(sc,Math.abs(run),top-bot,.9,xc,(top+bot)/2,-.5,STP);bx(sc,Math.abs(run)+.01,top-bot+.12,.14,xc,(top+bot+.12)/2,-1.01,GS,1);}rail(xa,-1.01,yb+.12,xb,-1.01,.12,.45);};
eflight(4.6,9.6);eflight(15.4,10.8);
{const bot=Ye(10.2)-.1,h=-bot;bx(sc,1.2,h,.95,10.2,-h/2,-.5,GS);rail(9.6,-1.0,0,10.8,-1.0,0,.45);const g=new THREE.Group(),a1=new THREE.Mesh(archGeo(.95,Math.min(1.45,h-.3)),mt(0xd8d2c4)),a2=new THREE.Mesh(archGeo(.8,Math.min(1.35,h-.38)),mt(0x7f8487));a2.position.set(.075,0,.01);g.add(a1,a2);g.rotation.y=Math.PI;g.position.set(10.2+.475,bot+.1,-.99);sc.add(g);}
// police station: two storeys of green-framed windows on the front and round the corner, a door, the blue POLÍCIA sign
const PW=cvx(16,20,q=>{pxl(q,'#cfc9bb',0,0,16,20);pxl(q,'#2f5a45',1,1,14,18);pxl(q,'#8fa9ab',2,2,12,16);pxl(q,'#e9e5da',2,10,12,8);for(const x of [7,8])pxl(q,'#2f5a45',x,2,1,16);for(const y of [7,13])pxl(q,'#2f5a45',2,y,12,1);pxl(q,'#a8a296',0,19,16,1);}),
 PD=cvx(16,26,q=>{pxl(q,'#cfc9bb',0,0,16,26);pxl(q,'#24473a',1,1,14,25);pxl(q,'#8fa9ab',3,3,10,8);pxl(q,'#24473a',7,3,2,8);pxl(q,'#1b362c',3,13,4,11);pxl(q,'#1b362c',9,13,4,11);pxl(q,'#c9a24b',8,17,1,2);}),
 PS=cvx(48,14,q=>{pxl(q,'#1d3a8a',0,0,48,14);q.fillStyle='#ffffff';q.font='bold 8px monospace';q.textAlign='center';q.fillText('POLÍCIA',24,9);for(let x=0;x<48;x+=4){pxl(q,'#ffffff',x,11,2,3);}});
const pane=(tx,w,h,x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:tx}));m.position.set(x,y,z);m.rotation.y=ry;sc.add(m);return m;};
for(const zc of [1.45,2.4,3.35]){const yb=Hs(29.05,zc);if(zc===1.45){pane(PD,.6,1.25,BX+.02,yb+.62,zc,Math.PI/2);bx(sc,.3,.08,.9,BX+.15,yb+.04,zc,CP,1);}else pane(PW,.58,.92,BX+.02,yb+.86,zc,Math.PI/2);pane(PW,.58,.84,BX+.02,yb+2.05,zc,Math.PI/2);bx(sc,.06,.07,.8,BX+.04,yb+1.38,zc,0x8f897d,1);}
pane(PS,.56,.18,BX+.035,Hs(29.05,1.92)+1.54,1.92,Math.PI/2);
for(const xc of [25.2,26.7]){const yb=Hs(xc,-.1);for(const [y,h] of [[.86,.92],[2.05,.84]])if(yb+y+h/2<-.25)pane(PW,.66,h,xc,yb+y,-.04,Math.PI);}
// garage doors on the west part of the front: the floor inside is a step below the street
const GD=cvx(16,22,q=>{pxl(q,'#bdb7aa',0,0,16,22);pxl(q,'#7d878a',1,1,14,21);for(let x=3;x<15;x+=3)pxl(q,'#6a7377',x,1,1,21);pxl(q,'#596164',1,10,14,1);pxl(q,'#2e3234',1,20,14,2);pxl(q,'#c9a24b',11,11,1,1);});
for(const zc of [15.95,17.25,18.55]){const yb=Hs(29.05,zc),h=Math.min(1.5,-yb-.28),m=new THREE.Mesh(archGeo(1.15,h),new THREE.MeshLambertMaterial({map:GD}));GD.repeat.set(1/1.15,1/h);m.rotation.y=Math.PI/2;m.position.set(BX+.02,yb-.08,zc+.575);sc.add(m);bx(sc,.06,.06,1.28,BX+.03,yb+h+.02,zc,0xcfc9bb,1);}
// Hard Club / left-luggage / No Mercado banners on poles (east walkway, north-west corner)
const BN=(t1,t2,bg,fg)=>cvx(20,48,q=>{pxl(q,bg,0,0,20,48);q.fillStyle=fg;q.textAlign='center';q.font='bold 7px monospace';t1.split(' ').forEach((w,i)=>q.fillText(w,10,10+i*8));q.font='5px monospace';q.fillText(t2,10,42);});
const pole=(x,z,ry,tx)=>{const y=gb(x,z);bx(sc,.06,2.7,.06,x,y+1.35,z,0x8a8f96);tx.forEach((t,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.42,1.0),new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}));m.position.set(x+Math.cos(ry)*(k?.26:-.26)*0,y+2.15,z);m.rotation.y=ry;m.translateX(k?.25:-.25);sc.add(m);});};
pole(12.2,.4,0,[BN('HARD CLUB','PORTO','#c42b2b','#1b1b2f'),BN('LEFT LUGGAGE','→','#1d3a6a','#ffffff')]);pole(-.7,20.3,Math.PI/2,[BN('HARD CLUB','PORTO','#c42b2b','#1b1b2f'),BN('NO MER CADO','RESTAURANTE','#e8464a','#ffffff')]);pole(28.4,20.4,Math.PI/2,[BN('NO MER CADO','BAR','#e8464a','#ffffff'),BN('HARD CLUB','PORTO','#c42b2b','#1b1b2f')]);
WALLS.push([28.75,0,29.05,6],[28.75,15,29.05,21],[28.85,6,29.1,9.0],[28.85,12.0,29.1,15],[27.9,9.7,28.02,11.3],[27.9,6.7,28.02,9.7],[27.9,11.3,28.02,14.3],[26.85,6,27.15,9.6],[26.85,11.4,27.15,15],[27.0,5.85,28.9,6.15],[27.0,14.85,28.9,15.15],[0,-.15,9.6,.15],[10.8,-.15,28.9,.15],[-.15,0,.15,13],[15,20.9,28.9,21.2],[4.6,-1.15,9.6,-.95],[10.8,-1.15,15.4,-.95],[9.6,-1.15,10.8,-.95]);}
// traffic
function mkCar(c){const g=new THREE.Group();bx(g,1.2,.3,.6,0,.25,0,c,1);bx(g,.65,.28,.55,-.1,.52,0,c,1);bx(g,.55,.2,.5,-.1,.55,0,0x9fc5c8,1);for(const x of [-.4,.4])for(const z of [-.3,.3])bx(g,.18,.18,.06,x,.12,z,0x111111,1);bx(g,.05,.1,.5,.62,.28,0,0xffe9a0,1);sc.add(g);return g;}
const CARS=[[-5,0,1,3.4],[-7,0,-1,2.8],[25.6,0,-1,3],[27.6,0,1,3.6],[46.2,1,1,2.6],[49.9,1,-1,3.2]].map(([p,ax,dir,sp],i)=>({m:mkCar([0xd64f3a,0x3b82d6,0xf2c94c,0x2f2f3a,0xffffff,0x6dbf5a][i]),p,ax,dir,sp,u:Math.random()*76}));
// pedestrians: they walk the pavements and the square; the lured ones climb the stairs into the market
const LOOP=[[-1.6,-1.6],[44.5,-1.6],[44.5,23.5],[-1.6,23.5]],LL=[46.1,25.1,46.1,25.1],LT=142.4;
function loopPos(u,o){u=((u%LT)+LT)%LT;let i=0;while(u>LL[i]){u-=LL[i];i++;}const a=LOOP[i],b=LOOP[(i+1)%4],f=u/LL[i],dx=(b[0]-a[0])/LL[i],dz=(b[1]-a[1])/LL[i];return [a[0]+(b[0]-a[0])*f-dz*o,a[1]+(b[1]-a[1])*f+dx*o];}
function mvTo(m,tx,tz,sp){const dx=tx-m.position.x,dz=tz-m.position.z,d=Math.hypot(dx,dz);if(d<.12)return 0;const s=Math.min(d,sp);m.position.x+=dx/d*s;m.position.z+=dz/d*s;m.rotation.y=Math.atan2(dx,dz);return d;}
function pedReset(m){const p=m.pd;p.en=Math.random()<lureNow();if(p.en){p.mode='loop';p.dir=1;p.u=LL[0]+7+Math.random()*2;}else{p.mode=Math.random()<.5?'loop':'stroll';p.u=Math.random()*LT;p.dir=Math.random()<.5?1:-1;if(p.mode==='stroll'){p.tx=33+Math.random()*10;p.tz=1+Math.random()*19;m.position.set(p.tx,0,p.tz);}}m.visible=true;}
const PED=[];for(let i=0;i<18;i++){const m=genChar('tourist','pd'+i);sc.add(m);m.pd={mode:'loop',u:Math.random()*LT,dir:Math.random()<.5?1:-1,sp:1+Math.random()*.9,off:(Math.random()-.5)*.9,wp:[],en:false,wait:0,tx:36,tz:10};PED.push(m);pedReset(m);}
// the characters of the market: the beggar, the pickpocket, the police officer and the door busker
const RMD=[['bum',{top:'hoodie',topc:'#4a4a50',top2:'#3a3a40',bot:'trousers',botc:'#3a3a3a',hat:'beanie',hatc:'#6a3030',face:'beard',hair:'long',hairc:'#8a8a8a',acc:'bag',skin:'#c68a62',shoe:'boots',shoec:'#2a2a2a'}],['pick',{top:'stripes',topc:'#111111',top2:'#eeeeee',bot:'jeans',botc:'#222a3a',hat:'cap',hatc:'#111111',face:'sunglasses',hair:'short',hairc:'#111111',acc:'none',skin:'#d9a273'}],['cop',{top:'jacket',topc:'#1d3a7a',top2:'#ffffff',bot:'trousers',botc:'#1d2a4a',hat:'cap',hatc:'#1d3a7a',face:'sunglasses',hair:'short',hairc:'#3a2416',acc:'headset',skin:'#efc08e',shoe:'boots',shoec:'#111111'}]];
const RM=RMD.map(([role,o],i)=>{const m=genChar('local',role,o);m.role=role;m.position.set([34,36,34][i],-1.8,[6,15.5,6.5][i]);sc.add(m);return {m,role,t:0,tx:30,tz:8,dir:1,st:10+i*5,until:0};});
const DB=genChar('local','busk',{top:'vest',topc:'#6b4a2b',top2:'#e8e8e8',hat:'cap',hatc:'#222222',hair:'long',hairc:'#5a3825',face:'beard',acc:'guitar',accc:'#d9a441',skin:'#d9a273',bot:'jeans',botc:'#3b5b8a'});DB.position.set(23.8,0,8.4);DB.rotation.y=Math.PI/2;sc.add(DB);bx(sc,.35,.06,.5,24.5,.03,8.4,0x222222,1);for(let i=0;i<4;i++)bx(sc,.07,.02,.07,24.4+i*.07,.07,8.3+(i%2)*.1,0xf2c94c,1);let bTip=0;
function envAnim(t,dt){const ts=S.speed?S.speed/2:0,d2=dt*ts,day=S.ph==='day'||S.ph==='setup';
for(const c of CARS){c.u+=c.sp*d2*c.dir;if(c.u>76)c.u-=76;if(c.u<0)c.u+=76;if(c.ax===0){c.m.position.set(-14+c.u,gb(-14+c.u,c.p),c.p);c.m.rotation.y=c.dir>0?0:Math.PI;}else{c.m.position.set(c.p,gb(c.p,-9+c.u*.52),-9+c.u*.52);c.m.rotation.y=c.dir>0?-Math.PI/2:Math.PI/2;}}
PED.forEach((m,i)=>{const p=m.pd;if(p.wait>0){p.wait-=d2;m.visible=false;if(p.wait<=0)pedReset(m);return;}let mv=0;
if(p.mode==='enter'){mv=1;if(mvTo(m,p.wp[0][0],p.wp[0][1],p.sp*d2)===0){p.wp.shift();if(!p.wp.length){m.visible=false;p.wait=2+Math.random()*6;S.tide=Math.min(120,S.tide+1);S.entered++;return;}}}
else if(p.mode==='loop'){p.u+=p.dir*p.sp*d2;const q=loopPos(p.u,p.off),n=loopPos(p.u+p.dir*.5,p.off);m.position.set(q[0],gy(q[0],q[1]),q[1]);m.rotation.y=Math.atan2(n[0]-q[0],n[1]-q[1]);mv=1;if(p.en&&p.dir>0&&q[0]>43.5&&q[1]>9&&q[1]<11.5){p.mode='enter';p.wp=[[41,4],[32,8.6],[29.6,9.35],[28.45,9.35],[28.45,6.9],[28.45,6.35],[27.5,6.35],[27.5,6.9],[27.5,9.8],[27.5,10.6],[24,10.65],[21.4,10.65]];}}
else{if(p.pz>0){p.pz-=d2;mv=0;}else if(mvTo(m,p.tx,p.tz,p.sp*.6*d2)===0){p.tx=33+Math.random()*11;p.tz=1+Math.random()*19;if(p.tx>39.5&&p.tx<43.5&&p.tz>8.5&&p.tz<12.5)p.tz=p.tz<10.5?7:14;p.pz=Math.random()<.55?1+Math.random()*3.5:0;p.pose=Math.floor(Math.random()*4);mv=0;}else mv=1;}
m.position.y=gy(m.position.x,m.position.z);swing(m,mv&&ts?Math.sin(t*6+i)*.6:0);});
for(const r of RM){const m=r.m,banned=S.day<r.until;m.visible=!banned&&(r.role==='cop'||day||S.ph==='night'||S.ph==='changeover');if(!m.visible)continue;let mv=0;
if(r.role==='bum'){r.t-=d2;if(r.t<=0){r.tx=31.5+Math.random()*8;r.tz=1+Math.random()*19;r.t=6+Math.random()*8;}mv=mvTo(m,r.tx,r.tz,.5*d2)?1:0;}
else if(r.role==='pick'){if(mvTo(m,r.dir>0?43:33,15.5,1.5*d2)===0)r.dir*=-1;mv=1;r.st-=d2;if(r.st<=0){r.st=18+Math.random()*20;if(day){const v=2+Math.floor(Math.random()*9);popup('-€'+v,m.position.x,m.position.z,1.4);S.hyp=cl(S.hyp-.25);}}
const c=RM[2].m;if(day&&c.visible&&Math.hypot(c.position.x-m.position.x,c.position.z-m.position.z)<4){r.until=S.day+2;toast('Police arrest the pickpocket!','👮');S.cul=cl(S.cul+.3);sfx('goal');}}
else{if(mvTo(m,r.dir>0?43:33,6.5,1.1*d2)===0)r.dir*=-1;mv=1;}
m.position.y=gy(m.position.x,m.position.z);swing(m,mv&&ts?Math.sin(t*6+r.st)*.6:0);if(r.role==='bum'&&!mv)m.ar.rotation.x=-1.2+Math.sin(t*3)*.2;}
DB.visible=day;DB.ar.rotation.x=-1.1+Math.sin(t*9)*.35;DB.al.rotation.x=-1;DB.hd.rotation.x=Math.sin(t*3)*.1;bTip+=d2;if(bTip>7&&S.ph==='day'){bTip=0;pay(Math.round((1+Math.floor(Math.random()*4))*BSK.q),24.4,8.4,1.7);}
PFD.forEach((p,i)=>{p.visible=!!S.gig&&p.on;if(!p.visible)return;const sp=S.dayAct==='samba'?8:S.dayAct==='folk'?6:3;p.ar.rotation.x=-1.2+Math.sin(t*sp+i)*.5;p.al.rotation.x=i===0?-2.2+Math.sin(t*sp)*.4:-.9;p.hd.rotation.x=Math.sin(t*sp*.5+i)*.15;p.position.y=.3+Math.abs(Math.sin(t*sp*.5+i))*(S.dayAct==='samba'?.12:.03);});
DSL.forEach((m,i)=>m.material.color.setHSL(S.gig?(.08+.04*Math.sin(t*2+i)):0,S.gig?.9:0,S.gig?.6:.15));}
