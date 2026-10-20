/* MF Borges Tycoon - life module (split from the single-file game; loads in order, shares global scope) */
// ---- richer avatar animation: workers, manager, pedestrians, crowd, staff ----
const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
function lifeAnim(t,dt,d2){const night=S.ph==='night',beat=Math.abs(Math.sin(t*6.6));
for(const s of stalls.values()){if(s.st!=='open'&&s.st!=='pack')continue;const u=s.m.userData,v=u.v;if(!v||!v.hd||!v.al||!s.m.visible)continue;const dx=Pp.x-s.m.position.x,dz=Pp.z-s.m.position.z,d=Math.hypot(dx,dz);
let yaw=Math.sin(t*.6+s.i*1.7)*.5;if(d<5)yaw=Math.max(-1.1,Math.min(1.1,wrapA(Math.atan2(dx,dz)-s.m.rotation.y)));v.hd.rotation.y+=(yaw-v.hd.rotation.y)*.12;
if(s.busy>0){v.hd.rotation.x=Math.sin(t*10)*.14;v.position.y+=Math.abs(Math.sin(s.busy*10))*.015;}else v.hd.rotation.x=Math.sin(t*1.1+s.i)*.05;
if(u.an==='none'||s.busy<=0){const gr=d<2.8&&Math.floor(t/6+s.i)%3===0;if(gr){v.ar.rotation.x=-2.8+Math.sin(t*9)*.35;}}
if(night&&s.st==='open'){v.rotation.z=Math.sin(t*3.3+s.i)*.05;v.hd.rotation.x=beat*.16;}else v.rotation.z=0;
const u2=(t+s.i*3.1)%30;if(u2<1.6&&s.busy<=0){v.al.rotation.x=v.ar.rotation.x=-2.9+Math.sin(u2*3)*.1;v.hd.rotation.x=-.3;}
}
// the night manager
if(PL.hd){const mv=Pp.mv;if(mv){PL.hd.rotation.x=Math.sin(t*14)*.04;PL.hd.rotation.y*=.8;PL.position.y+=Math.abs(Math.sin(t*11))*.04;}
else{const nt=S.ph==='night';if(nt){PL.hd.rotation.x=Math.sin(t*6.6)*.12;PL.hd.rotation.y=Math.sin(t*1.1)*.3;PL.ar.rotation.x=-1.4+Math.sin(t*6.6)*.35;PL.al.rotation.x=-.5+Math.sin(t*6.6+1.5)*.15;PL.rotation.z=Math.sin(t*3.3)*.05;PL.position.y+=beat*.05;}
else{PL.rotation.z=0;PL.hd.rotation.y=Math.sin(t*.5)*.6;PL.hd.rotation.x=Math.sin(t*.8)*.05;const u3=t%14;if(u3<2.2){PL.al.rotation.x=-1.6;PL.hd.rotation.x=.3;}else if(u3>7&&u3<10){PL.ar.rotation.x=-1.25;PL.al.rotation.x=-1.1;PL.hd.rotation.x=.35;}else{PL.al.rotation.x=Math.sin(t*1.5)*.05;PL.ar.rotation.x=-Math.sin(t*1.5)*.05;}}}}
// pedestrians: look around, take photos, point, chat
PED.forEach((m,i)=>{if(!m.visible||!m.hd)return;const p=m.pd;if(p.mode==='stroll'&&p.pz>0){const k=(p.pose||0)%4,w=t+i;swing(m,0);if(k===0){m.ar.rotation.x=m.al.rotation.x=-2.2;m.hd.rotation.x=-.1;m.hd.rotation.y=Math.sin(w*.8)*.4;}else if(k===1){m.ar.rotation.x=-1.6;m.hd.rotation.y=Math.sin(w)*.5;}else if(k===2){m.ar.rotation.x=m.al.rotation.x=-1.1;m.hd.rotation.x=.4;}else{m.ar.rotation.x=-2.5+Math.sin(w*6)*.4;m.hd.rotation.y=Math.sin(w*2)*.3;}}else m.hd.rotation.y=Math.sin(t*.9+i)*.35;});
// police officer, beggar, pickpocket
for(const r of RM){const m=r.m;if(!m.visible||!m.hd)continue;if(r.role==='cop'){const u4=(t+3)%16;if(u4<3){m.ar.rotation.x=-2.5;m.hd.rotation.y=.3;}else m.hd.rotation.y=Math.sin(t*.7)*.6;}else if(r.role==='pick'){m.hd.rotation.y=Math.sin(t*2.2)*.7;}else m.hd.rotation.y=Math.sin(t*.5)*.3;}
// the crowd: look around, some film the stage with their phones
V.forEach((v,i)=>{if(!v.visible||!v.hd)return;const rm=night&&(v.userData.a===1||v.userData.a===2);if(rm&&i%9===0){v.ar.rotation.x=-2.3+Math.sin(t*2+i)*.05;v.al.rotation.x=-.4;v.hd.rotation.x=-.1;}else if(!rm)v.hd.rotation.y=Math.sin(t*.8+i)*.4;});
for(const b of BARS){if(b.w.visible&&b.w.hd){b.w.hd.rotation.y=Math.sin(t*.7+b.x)*.4;b.w.hd.rotation.x=beat*.1;}}}

// ================= world 2: nationalities, gossip & love, police station, car park, phone box, hippies & picnics =================
const NAT=[
{k:'fr',n:'French',hi:['Bonjour!','Oh là là!','Magnifique!'],o:{top:'stripes',topc:'#f2f2f2',top2:'#1d2a5a',hat:'beret',hatc:'#7a2a2a',face:'mustache',acc:'baguette',bot:'trousers',botc:'#222a3a',shoe:'boots'}},
{k:'us',n:'American',hi:['Hey y\'all!','Awesome!','So cool!'],o:{top:'tee',flag:'us',hat:'cap',hatc:'#1d3a8a',face:'sunglasses',acc:'coffee',bot:'shorts',botc:'#c9b79c',shoe:'sneakers'}},
{k:'it',n:'Italian',hi:['Ciao bella!','Mamma mia!','Bellissimo!'],o:{top:'shirt',topc:'#f2f2f2',face:'sunglasses',acc:'chain',accc:'#d9a441',hair:'short',hairc:'#1b1410',bot:'trousers',botc:'#1d2a4a',shoe:'boots'}},
{k:'ca',n:'Canadian',hi:['Sorry, eh?','Beauty, eh!','Thanks, bud!'],o:{top:'tee',flag:'ca',hat:'beanie',hatc:'#c42b2b',face:'beard',acc:'backpack',bot:'jeans',shoe:'boots'}},
{k:'uk',n:'British',hi:['Cheers!','Lovely!','Pint, mate?'],o:{top:'tee',flag:'uk',hat:'none',face:'stubble',acc:'umbrella',bot:'jeans',shoe:'sneakers'}},
{k:'nl',n:'Dutch',hi:['Hoi hoi!','Gezellig!','Doei!'],o:{top:'tee',topc:'#ff7a00',hat:'none',hair:'short',hairc:'#d9b05b',face:'none',acc:'tulip',bot:'jeans',shoe:'sneakers'}},
{k:'ch',n:'Swiss',hi:['Grüezi!','Merci vilmal!','Ä guets!'],o:{top:'tee',flag:'ch',hat:'cap',hatc:'#c42b2b',face:'none',acc:'cowbell',bot:'cargo',botc:'#6b7a4a',shoe:'boots'}}];
function natOpt(i){const n=NAT[i%NAT.length];return Object.assign({nat:n.n,natk:n.k},n.o);}
function natFix(){[...PED,...V].forEach(v=>{const nl=v.dna&&v.dna.natk==='nl';v.scale.set(.85,.85*(nl?1.12:1),.85);});}
function flagShirt(q,f){const R='#d22b2b',B='#1d3a8a',Wh='#f4f4f4';
if(f==='us'){for(let y=0;y<16;y+=2)pxl(q,y%4?Wh:R,0,y,16,2);pxl(q,B,0,0,7,8);for(let i=0;i<6;i++)pxl(q,Wh,1+(i%3)*2,1+Math.floor(i/3)*3,1,1);}
else if(f==='uk'){pxl(q,B,0,0,16,16);pxl(q,Wh,6,0,4,16);pxl(q,Wh,0,6,16,4);pxl(q,R,7,0,2,16);pxl(q,R,0,7,16,2);}
else if(f==='ch'){pxl(q,R,0,0,16,16);pxl(q,Wh,7,3,2,10);pxl(q,Wh,3,7,10,2);}
else if(f==='ca'){pxl(q,R,0,0,4,16);pxl(q,Wh,4,0,8,16);pxl(q,R,12,0,4,16);pxl(q,R,7,5,2,6);pxl(q,R,6,7,4,2);}}
function tdye(q,c){const P=[c,'#35e0ff','#ffd400','#ff3d9a','#7dff4a','#b36bff'];for(let y=0;y<16;y++)for(let x=0;x<16;x++){const r=Math.hypot(x-7.5,y-7.5),a=Math.atan2(y-7.5,x-7.5);pxl(q,P[((Math.floor(r*.8+a*1.4)%6)+6)%6],x,y,1,1);}}

// ---- speech bubbles & hearts ----
const BUB=[];for(let i=0;i<8;i++){const k=document.createElement('canvas');k.width=150;k.height=44;const t=new THREE.CanvasTexture(k);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(3.4,1,1);s.visible=false;s.renderOrder=11;sc.add(s);BUB.push({s,k,t,l:0,f:null,x:0,y:0,z:0});}
function bubble(txt,x,z,y,kind,f,life){if(!SET.pop)return;const b=BUB.find(q=>q.l<=0)||BUB[0];const q=b.k.getContext('2d');q.clearRect(0,0,150,44);const col=kind==='love'?'#ffd1e3':kind==='gos'?'#fff3b0':'#ffffff';q.fillStyle='#1b1b2f';q.fillRect(1,1,148,36);q.fillStyle=col;q.fillRect(3,3,144,32);q.fillStyle='#1b1b2f';q.fillRect(70,37,8,5);q.fillStyle=col;q.fillRect(72,36,4,4);q.font='bold 11px monospace';q.textAlign='center';q.fillStyle='#1b1b2f';const L=String(txt).split('\n');if(L.length>1){q.fillText(L[0],75,17);q.fillText(L[1],75,30);}else q.fillText(L[0],75,24);b.t.needsUpdate=true;b.l=life||3.4;b.f=f||null;b.x=x;b.z=z;b.y=y||2.3;b.s.visible=true;b.s.material.opacity=1;}
const HRT=[];{const k=document.createElement('canvas');k.width=9;k.height=8;const q=k.getContext('2d');const px=[[1,0],[2,0],[6,0],[7,0],[0,1],[1,1],[2,1],[3,1],[5,1],[6,1],[7,1],[8,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[2,4],[3,4],[4,4],[5,4],[6,4],[3,5],[4,5],[5,5],[4,6]];q.fillStyle='#ff3d7f';px.forEach(([x,y])=>q.fillRect(x,y,1,1));q.fillStyle='#ffd1e3';q.fillRect(2,1,1,1);const t=new THREE.CanvasTexture(k);t.magFilter=t.minFilter=THREE.NearestFilter;for(let i=0;i<16;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(.42,.37,1);s.visible=false;s.renderOrder=11;sc.add(s);HRT.push({s,l:0});}}
function heart(x,y,z){const h=HRT.find(q=>q.l<=0);if(!h)return;h.l=1.8;h.s.position.set(x+(Math.random()-.5)*.3,y,z+(Math.random()-.5)*.3);h.s.visible=true;h.s.material.opacity=1;}

// ---- police station (lower level, south-east corner under the platform), car park entry/exit, road, phone box ----
const yg=(x,z)=>gb(x,z);
const POL={};{const x0=23.6,x1=29.6,z0=-1.8,z1=-.35,yb=Hs(26.5),cx=(x0+x1)/2;
bx(sc,x1-x0,1.2,z1-z0,cx,yb-.4,(z0+z1)/2,0x8e8a80);bx(sc,x1-x0,1.8,z1-z0,cx,yb+.8,(z0+z1)/2,0xe9e6dc);bx(sc,x1-x0+.2,.12,z1-z0+.2,cx,yb+1.75,(z0+z1)/2,0x6e6a62);
bx(sc,x1-x0,.4,.08,cx,yb+1.45,z0-.03,0x1d3a8a,1);bx(sc,.9,1.15,.06,cx,yb+.78,z0-.03,0x1d2a5a,1);bx(sc,.7,.9,.07,cx,yb+.8,z0-.05,0x7fb4c4,1);
for(const dx of [-2.1,-1.3,1.3,2.1])bx(sc,.55,.6,.06,cx+dx,yb+1.0,z0-.03,0x7fb4c4,1);
for(const dx of [-2.9,2.9]){const m=new THREE.Mesh(gm(.3,.2,.3),new THREE.MeshBasicMaterial({color:0x3a6cff}));m.position.set(cx+dx,yb+1.95,(z0+z1)/2);sc.add(m);POL[dx<0?'l1':'l2']=m;}
bx(sc,1.2,.12,.5,cx,yb+.2,z0-.3,0xb9b2a4,1);
const sg=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.38),new THREE.MeshBasicMaterial({map:cvx(64,10,q=>{pxl(q,'#1d3a8a',0,0,64,10);q.fillStyle='#ffffff';q.font='bold 8px monospace';q.textAlign='center';q.fillText('POLÍCIA',32,8);})}));sg.position.set(cx,yb+1.46,z0-.09);sg.rotation.y=Math.PI;sc.add(sg);
const cop=genChar('local','cop2',{top:'jacket',topc:'#1d3a7a',top2:'#ffffff',bot:'trousers',botc:'#1d2a4a',hat:'cap',hatc:'#1d3a7a',face:'sunglasses',hair:'short',hairc:'#3a2416',acc:'headset',shoe:'boots',shoec:'#111111',skin:'#efc08e'});cop.position.set(cx-1.6,yg(cx,-2.3),-2.2);cop.rotation.y=Math.PI;sc.add(cop);POL.cop=cop;
const pc=mkCar(0xf4f4f4);pc.position.set(31.2,Hs(31.2),-3.05);sc.add(pc);bx(pc,1.22,.08,.62,0,.33,0,0x1d3a8a,1);const lb1=new THREE.Mesh(gm(.12,.08,.2),new THREE.MeshBasicMaterial({color:0xff2020})),lb2=new THREE.Mesh(gm(.12,.08,.2),new THREE.MeshBasicMaterial({color:0x2060ff}));lb1.position.set(-.1,.75,-.12);lb2.position.set(-.1,.75,.12);pc.add(lb1,lb2);POL.b1=lb1;POL.b2=lb2;POL.car=pc;}

// Esmeralda, the day manager: black hair, super stylish, very bossy
const ESM=genChar('manager','esmeralda',{top:'jacket',topc:'#b3122e',top2:'#111111',bot:'trousers',botc:'#111111',hat:'none',hair:'long',hairc:'#050507',skin:'#e6b48c',face:'none',acc:'bag',accc:'#111111',shoe:'boots',shoec:'#111111',sl:1});ESM.scale.setScalar(1.05);ESM.position.set(22.5,0,10.6);ESM.visible=false;sc.add(ESM);
const EM={tx:22.5,tz:10.6,w:0,say:0,ph:'',list:null,pose:0};
// car park (underground): exit at the north end of the road beside the square, entrance at the south-west bottom of the square
function portal(zc,label,col){const yb=Hs(32.1),g=new THREE.Group();bx(g,1.9,.04,2.1,0,.03,0,0x16161b,1);bx(g,.22,.8,2.2,-1.0,.4,0,0xb9b2a4);bx(g,.22,.8,2.2,1.0,.4,0,0xb9b2a4);bx(g,2.2,.25,.5,0,.85,-.9,0xa39d90);
for(let i=0;i<5;i++)bx(g,.38,.03,.2,-.8+i*.4,.06,1.0,i%2?0xf2c94c:0x222222,1);bx(g,.06,1.5,.06,1.15,.75,1.05,0x555555);
const sg=new THREE.Mesh(new THREE.PlaneGeometry(.9,.55),new THREE.MeshBasicMaterial({map:cvx(32,20,q=>{pxl(q,col,0,0,32,20);pxl(q,'#ffffff',1,1,30,18);pxl(q,col,2,2,28,16);q.fillStyle='#ffffff';q.font='bold 9px monospace';q.textAlign='center';q.fillText('P',16,10);q.font='bold 5px monospace';q.fillText(label,16,17);})}));sg.position.set(1.15,1.45,1.05);g.add(sg);g.position.set(32.1,yb,zc);g.rotation.y=0;sc.add(g);return g;}
portal(.2,'SAÍDA','#1f8f4a');portal(20.9,'ENTRADA','#c42b2b');
const PKC={i:{m:mkCar(0x3b82d6),z:-9,on:0,cd:6},o:{m:mkCar(0xd64f3a),z:1,on:0,cd:14}};PKC.i.m.visible=PKC.o.m.visible=false;
CARS.push({m:mkCar(0x6dbf5a),p:32.4,ax:1,dir:1,sp:2.2,u:40},{m:mkCar(0xf2c94c),p:31.55,ax:1,dir:-1,sp:2.0,u:20});
// police car: now and then at night it leaves the station on an emergency, sirens wailing, and comes back later
const PE={st:0,cd:25,z:-3.05};
function sirenWail(){if(!AX||!SET.sfx)return;try{const t=AX.currentTime,o=AX.createOscillator(),g=AX.createGain(),v=.05*SET.sfx;o.type='square';o.connect(g);g.connect(AX.destination);g.gain.setValueAtTime(v,t);for(let i=0;i<6;i++)o.frequency.setValueAtTime(i%2?740:560,t+i*.38);g.gain.setValueAtTime(v,t+2.1);g.gain.linearRampToValueAtTime(0,t+2.5);o.start(t);o.stop(t+2.6);}catch(e){}}
function policeRun(rt){const c=POL.car;if(!c)return;const base=Hs(32.1),py=Hs(31.2);
if(S.ph==='setup'&&PE.st){PE.st=0;PE.cd=40;c.position.set(31.2,py,-3.05);c.rotation.y=0;c.visible=true;return;}
if(PE.st===0){if(S.ph==='night'&&rt>0){PE.cd-=rt;if(PE.cd<=0){PE.st=1;PE.z=-3.05;sirenWail();toast('Sirens! The police car races off on an emergency.','🚨');}}return;}
if(PE.st===1){PE.z+=rt*5.5;const k=Math.max(0,Math.min(1,(PE.z+3.05)/3.2));c.position.set(31.2+1.2*k,py+(base-py)*k-(PE.z>20.5?Math.min(1.6,(PE.z-20.5)*1.15):0),PE.z);c.rotation.y=-Math.PI/2;if(PE.z>22.2){PE.st=2;PE.cd=20+Math.random()*25;c.visible=false;}return;}
if(PE.st===2){PE.cd-=rt;if(PE.cd<=0){PE.st=3;PE.z=1.3;c.visible=true;}return;}
PE.z-=rt*3.5;const k=Math.max(0,Math.min(1,(-PE.z)/3.05));c.position.set(31.55-.35*k,(PE.z>0?base-Math.max(0,Math.min(1.6,(PE.z+.6)*1.15)):base+(py-base)*k),PE.z);c.rotation.y=Math.PI/2;
if(PE.z<=-3.05){PE.st=0;PE.cd=45+Math.random()*60;c.position.set(31.2,py,-3.05);c.rotation.y=0;}}
function parkAnim2(rt){const base=Hs(32.1),I=PKC.i,O=PKC.o;
if(!I.on){I.cd-=rt;if(I.cd<=0&&S.ph!=='setup'){I.on=1;I.z=-8;I.cd=14+Math.random()*16;I.m.visible=true;}}else{I.z+=rt*3;I.m.position.set(32.4,base+(I.z>20.5?-Math.min(1.6,(I.z-20.5)*1.15):0),I.z);I.m.rotation.y=-Math.PI/2;if(I.z>22.2){I.on=0;I.m.visible=false;}}
if(!O.on){O.cd-=rt;if(O.cd<=0&&S.ph!=='setup'){O.on=1;O.z=1.3;O.cd=16+Math.random()*18;O.m.visible=true;}}else{O.z-=rt*2.4;O.m.position.set(31.55,base-Math.max(0,Math.min(1.6,(O.z+.6)*1.15)),O.z);O.m.rotation.y=Math.PI/2;if(O.z<-8){O.on=0;O.m.visible=false;}}}
// old phone box in the south-east corner of the square
const PHB={g:new THREE.Group(),st:0,t:0,cd:200,until:0};{const g=PHB.g,r=0xb3261e;bx(g,.7,.12,.7,0,.06,0,0x6e6a62);for(const [x,z] of [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]])bx(g,.07,1.7,.07,x,.9,z,r);bx(g,.74,.1,.74,0,1.78,0,r);bx(g,.5,.08,.5,0,1.88,0,r);bx(g,.56,1.3,.03,0,1.0,-.32,0x9fc5c8,1);bx(g,.03,1.3,.56,-.32,1.0,0,0x9fc5c8,1);bx(g,.03,1.3,.56,.32,1.0,0,0x9fc5c8,1);bx(g,.56,.18,.06,0,1.62,.33,0xfff2c0,1);bx(g,.08,.3,.05,.2,.9,-.28,0x333333,1);g.position.set(43.6,gb(43.6,20.1),20.1);g.rotation.y=.4;sc.add(g);}
const CALLER=genChar('local','caller',{top:'jacket',topc:'#8a1c1c',hat:'none',acc:'none',face:'stubble'});CALLER.visible=false;sc.add(CALLER);

// ---- the garden crowd: picnic groups, hippies on the grass, stoners under the trees ----
const GFK=[];
function seat(m,x,z,cx,cz,role,g){m.position.set(x,gb(x,z)-.11,z);m.rotation.y=Math.atan2(cx-x,cz-z);m.visible=false;sc.add(m);GFK.push({m,x,z,role,g,i:GFK.length,y0:m.position.y});}
const BLK=cvx(8,8,q=>{pxl(q,'#d64f3a',0,0,8,8);for(let y=0;y<8;y+=2)for(let x=(y%4?0:1);x<8;x+=2)pxl(q,'#f4f0e4',x,y,1,1);});BLK.wrapS=BLK.wrapT=THREE.RepeatWrapping;
function blanket(x,z,rot,tx){const g=new THREE.Group(),b=new THREE.Mesh(gm(1.9,.04,1.5),new THREE.MeshLambertMaterial({map:tx}));b.position.y=.03;g.add(b);bx(g,.3,.2,.22,.1,.15,0,0x8a5a2b,1);bx(g,.1,.3,.1,-.3,.18,.1,0x2f7a3a,1);bx(g,.1,.3,.1,-.15,.18,-.2,0xe5c24a,1);bx(g,.22,.05,.22,.5,.07,.3,0xf2e6c4,1);g.position.set(x,gb(x,z),z);g.rotation.y=rot;g.visible=false;sc.add(g);return g;}
const PICN=[[37.6,4.2],[37.6,16.8]].map(([x,z],k)=>({g:blanket(x,z,k*.7,BLK),x,z}));
PICN.forEach((p,k)=>{[[-1.25,.1],[1.25,-.1],[.1,1.1]].forEach(([dx,dz],j)=>seat(genChar([ 'tourist','hipster','elder','local','artist','student'][(k*3+j)%6],'pic'+k+j),p.x+dx,p.z+dz,p.x,p.z,'pic',k));});
const HIPC=[41.2,5.4];[[-1,.2],[.9,.5],[.3,-1],[.2,1]].forEach(([dx,dz],j)=>seat(genChar('hippie','hip'+j,j===0?{acc:'guitar',accc:'#d9a441'}:undefined),HIPC[0]+dx,HIPC[1]+dz,HIPC[0],HIPC[1],'hip',0));
const STOC=[40.8,16.0];[[-.7,.2],[.8,-.1],[0,.9]].forEach(([dx,dz],j)=>seat(genChar('stoner','sto'+j),STOC[0]+dx,STOC[1]+dz,STOC[0],STOC[1],'sto',0));
const SMKG=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(gm(.12,.12,.12),new THREE.MeshBasicMaterial({color:0xcfd2d6,transparent:true,opacity:0}));m.visible=false;sc.add(m);SMKG.push({m,l:0});}
function gpuff(x,y,z){const p=SMKG.find(q=>q.l<=0);if(!p)return;p.l=2;p.m.position.set(x,y,z);p.m.visible=true;}

// ---- gossip, love and the daily rhythm of the world ----
const WD={cd:30,g:null,lv:[],loveCd:45,cpl:[],cplCd:35,d0:-1,sref:null,gt:3,gb:6,bt:5};
const stNm=s=>ST[s.i][0].slice(0,14);
function inLove(s){return WD.lv.some(l=>l.a===s||l.b===s);}
function loveStart(a,b){if(WD.lv.length>=3||inLove(a)||inLove(b))return;WD.lv.push({a,b,life:200+Math.random()*320,tk:0,pay:0});S.tide=Math.min(120,S.tide+3);toast(stNm(a)+' & '+stNm(b)+': love is in the air!','\u{1F498}');bubble('I think I\'m in\nlove… ♥',a.m.position.x,a.m.position.z,2.4,'love',a.m);bubble('Me too! ♥',b.m.position.x,b.m.position.z,2.4,'love',b.m,3);}
function gossipStart(){const L=[...stalls.values()].filter(s=>s.st==='open'&&s.m.visible&&s.m.userData.v&&s.m.userData.v.hd);if(L.length<2)return;const a=L[Math.floor(Math.random()*L.length)];let b=null,bd=1e9;for(const s of L){if(s===a)continue;const d=Math.hypot(s.m.position.x-a.m.position.x,s.m.position.z-a.m.position.z);if(d<bd){bd=d;b=s;}}if(!b||bd>9)return;
const A=stNm(a),B=stNm(b),k=Math.floor(Math.random()*7);let t1,t2,fx;
if(k===0&&!inLove(a)&&!inLove(b)){t1='Psst… have you seen\nhow '+B+' looks?';t2='Yes! Those eyes… ♥';fx=()=>{if(Math.random()<.75)loveStart(a,b);};}
else if(k===1){t1=A+' is selling\nlike crazy today!';t2='Best in the market!';fx=()=>{const v=40+Math.round(Math.random()*60);pay(v,a.m.position.x,a.m.position.z,2);S.tide=Math.min(120,S.tide+4);toast('Good word of mouth for '+A,'\u{1F4AC}');};}
else if(k===2){t1='Heard '+A+' uses\nfrozen stock…';t2='Shh! Don\'t tell!';fx=()=>{S.tide=Math.max(0,S.tide-4);toast('Bad rumour about '+A+'…','\u{1F92B}');};}
else if(k===3){t1='The night manager\nnever sleeps!';t2='Or pays on time…';fx=()=>{S.her=cl(S.her+.2);};}
else if(k===4&&S.act&&AC[S.act[1]]&&AC[S.act[1]].n&&S.act[1]!=='none'&&S.act[1]!==0){t1='Tonight at the club:\n'+String(AC[S.act[1]].n).slice(0,18);t2='Hear it\'ll be loud!';fx=()=>{S.hyp=cl(S.hyp+.8);toast('Gossip is building hype for tonight','\u{1F4E3}');};}
else if(k===5){t1='Pickpockets by the\nstairs again!';t2='Watch your pockets!';fx=()=>{};}
else{t1='Did you see the dog\nsteal that sausage?';t2='Hahaha! Cheeky!';fx=()=>{S.cul=cl(S.cul+.1);};}
WD.g={a,b,t:0,t1,t2,fx,s:0};}
function endCouples(){for(const c of WD.cpl){if(c.a)c.a.cpl=null;if(c.b)c.b.cpl=null;}WD.cpl=[];}
function coupleStart(){const L=PED.filter(m=>m.visible&&!m.cpl&&m.pd&&m.pd.mode==='loop'&&m.pd.wait<=0&&!m.pd.en);if(L.length<2)return;const a=L[Math.floor(Math.random()*L.length)];let b=null,bd=1e9;for(const m of L){if(m===a)continue;const d=Math.hypot(m.position.x-a.position.x,m.position.z-a.position.z);if(d<bd){bd=d;b=m;}}if(!b||bd>9)return;
b.pd.dir=a.pd.dir;b.pd.sp=a.pd.sp;b.pd.u=a.pd.u-a.pd.dir*.8;b.pd.off=Math.max(-.45,Math.min(.45,a.pd.off+.5));a.cpl=b;b.cpl=a;WD.cpl.push({a,b,t:0,life:120+Math.random()*200,ht:0});S.tide=Math.min(120,S.tide+2);bubble('Hi… ♥',a.position.x,a.position.z,2.1,'love',a,2.6);bubble('Hi! ♥',b.position.x,b.position.z,2.1,'love',b,2.6);if(Math.random()<.5)toast('Two strangers fell in love on the street','\u{1F495}');}
function worldAnim(t,dt,d2,h,dm){if(!S||S.over)return;const rt=S.speed?dt:0,day=S.ph==='day';
if(WD.sref!==S||WD.d0!==S.day){WD.sref=S;WD.d0=S.day;WD.cd=25+Math.random()*30;WD.g=null;WD.lv=[];endCouples();WD.loveCd=40+Math.random()*40;WD.cplCd=25+Math.random()*30;PHB.st=0;PHB.cd=120+Math.random()*180;}
// bubbles + hearts
for(const b of BUB){if(b.l>0){b.l-=dt;if(b.f)b.s.position.set(b.f.position.x,b.f.position.y+b.y,b.f.position.z);else b.s.position.set(b.x,b.y+gb(b.x,b.z),b.z);b.s.material.opacity=Math.min(1,b.l*2);if(b.l<=0)b.s.visible=false;}}
for(const q of HRT){if(q.l>0){q.l-=dt;q.s.position.y+=dt*.7;q.s.material.opacity=Math.min(1,q.l);if(q.l<=0)q.s.visible=false;}}
// police: flashing lights, officer on watch
const fl=Math.floor(t*4)%2;POL.b1.material.color.setHex(fl?0xff2020:0x330808);POL.b2.material.color.setHex(fl?0x082033:0x2060ff);const lp=Math.floor(t*2)%2;POL.l1.material.color.setHex(lp?0x3a6cff:0x1a2f77);POL.l2.material.color.setHex(lp?0x1a2f77:0x3a6cff);
{const c=POL.cop;c.visible=true;c.hd.rotation.y=Math.sin(t*.5)*.8;c.ar.rotation.x=Math.floor(t/7)%3===0?-1.9+Math.sin(t*3)*.1:-.2;}
parkAnim2(rt);policeRun(rt);
{const m=ESM,dayE=S.ph==='setup'||S.ph==='day'||S.ph==='changeover';m.visible=dayE;if(dayE){const dd=(S.speed?S.speed/2:0)*rt;
if(EM.ph!==S.ph){EM.ph=S.ph;EM.w=0;EM.say=1;EM.pose=S.ph==='setup'?1:S.ph==='changeover'?2:0;
bubble(S.ph==='setup'?'Bom dia! Montem\nas bancas, JÁ!':S.ph==='changeover'?'FECHOU! Arrumem\ntudo e limpem!':'Esmeralda manda\nneste mercado!',0,0,2.6,'say',m,3.2);}
EM.w-=dd;if(EM.w<=0){EM.w=3+Math.random()*4;const L=[...stalls.values()].filter(q=>q.m.visible);const r=Math.random();
if(r<.25){const b=RM[Math.random()<.5?0:1].m;if(b.visible){EM.tx=b.position.x-1.2;EM.tz=b.position.z;if(Math.random()<.8)bubble(['Ei! Circula daqui!\nRegras são regras!','Você aí! Sem\nbarulho aqui!','Não se encosta\nnas bancas!'][Math.floor(Math.random()*3)],0,0,2.6,'say',m,3);}}
else if(L.length){const q=L[Math.floor(Math.random()*L.length)];EM.tx=q.m.position.x+1.1;EM.tz=q.m.position.z+.4;if(Math.random()<.6)bubble(S.ph==='setup'?['Mais rápido!\nAbre essa banca!','Quem montou isto?\nEstá torto!'][Math.floor(Math.random()*2)]:S.ph==='changeover'?['Fecha a banca!\nTudo limpo!','Quero o lixo\nfora, já!'][Math.floor(Math.random()*2)]:['Sorri aos clientes!\nPreços à vista!','Banca suja?\nEu vi isso!','Sem fumar aqui\ndentro!','Cães ao colo,\nnão ao chão!'][Math.floor(Math.random()*4)],0,0,2.6,'say',m,3);}
else{EM.tx=22.5;EM.tz=10.6;}}
const dd2=mvTo(m,EM.tx,EM.tz,1.1*dd);m.position.y=gy(m.position.x,m.position.z);const mv=dd2&&dd>0;swing(m,mv?Math.sin(t*7)*.7:0);
if(!mv&&m.hd){m.hd.rotation.y=Math.sin(t*1.3)*.5;const sh=Math.floor(t/5)%3===0;m.ar.rotation.x=sh?-2.6+Math.sin(t*14)*.35:-.9;m.al.rotation.x=sh?-.2:-1.1;}}}

// phone box
{const g=PHB.g;if(PHB.st===0){PHB.cd-=dm;g.rotation.z=0;if(day&&PHB.cd<=0&&h>=10&&h<18.5){PHB.st=1;PHB.t=0;bubble('☎ Brrring!\nBrrring!',43.6,20.1,2.6,'say');}}
else if(PHB.st===1){PHB.t+=rt;g.rotation.z=Math.sin(t*40)*.04;if(Math.floor(PHB.t*1.5)>Math.floor((PHB.t-rt)*1.5))sfx('coin');if(PHB.t>2.5){PHB.st=2;PHB.t=0;g.rotation.z=0;CALLER.visible=true;CALLER.position.set(39,gb(39,18.6),18.6);}}
else if(PHB.st===2){const d=mvTo(CALLER,43.6,19.2,rt*1.6);CALLER.al.rotation.x=CALLER.ar.rotation.x=0;if(d<.2||d===0){PHB.st=3;PHB.t=0;CALLER.rotation.y=Math.atan2(43.6-CALLER.position.x,20.1-CALLER.position.z);}}
else if(PHB.st===3){PHB.t+=rt;CALLER.ar.rotation.x=-2.5;CALLER.hd.rotation.x=Math.sin(t*6)*.1;if(PHB.t>7){const r=Math.random();if(r<.4){const v=60+Math.round(Math.random()*120);pay(v,43.6,19.6,2);bubble('A supplier tip-off!\n+€'+v,43.6,20.1,2.6,'gos');}else if(r<.7){S.hyp=cl(S.hyp+1.5);toast('A booker called the phone box: hype +','\u{260E}');}else{bubble('Wrong number…\nagain!',43.6,20.1,2.6,'say');}PHB.st=4;PHB.t=0;}}
else if(PHB.st===4){const d=mvTo(CALLER,38,21,rt*1.6);CALLER.ar.rotation.x=0;PHB.t+=rt;if(d<.3||PHB.t>9){CALLER.visible=false;PHB.st=0;PHB.cd=240+Math.random()*240;}}
if(!day&&PHB.st){CALLER.visible=false;PHB.st=0;g.rotation.z=0;}}
// national greetings
if(day&&S.speed){WD.gt-=dt;if(WD.gt<=0){WD.gt=4+Math.random()*5;const L=PED.filter(m=>m.visible&&m.dna&&m.dna.natk&&Math.hypot(m.position.x-Pp.x,m.position.z-Pp.z)<10);if(L.length){const m=L[Math.floor(Math.random()*L.length)],n=NAT.find(q=>q.k===m.dna.natk);bubble(n.hi[Math.floor(Math.random()*n.hi.length)],m.position.x,m.position.z,2.0,'say',m,2.4);}}}
// stall gossip
if(day&&S.speed){WD.cd-=dm;if(WD.cd<=0&&!WD.g){WD.cd=22+Math.random()*40;gossipStart();}}
if(WD.g){const g=WD.g;g.t+=rt;const va=g.a.m.userData.v,vb=g.b.m.userData.v;if(!va||!vb||!va.hd||!vb.hd||!g.a.m.visible||!g.b.m.visible){WD.g=null;}else{const ya=wrapA(Math.atan2(g.b.m.position.x-g.a.m.position.x,g.b.m.position.z-g.a.m.position.z)-g.a.m.rotation.y),yb2=wrapA(Math.atan2(g.a.m.position.x-g.b.m.position.x,g.a.m.position.z-g.b.m.position.z)-g.b.m.rotation.y);va.hd.rotation.y=Math.max(-1.2,Math.min(1.2,ya));vb.hd.rotation.y=Math.max(-1.2,Math.min(1.2,yb2));
const ta=g.t<3.6?1:0;(ta?va:vb).hd.rotation.x=Math.sin(t*9)*.15;(ta?va:vb).ar.rotation.x=-.9+Math.sin(t*8)*.4;
if(g.s===0){g.s=1;bubble(g.t1,g.a.m.position.x,g.a.m.position.z,2.4,'gos',g.a.m,3.4);}if(g.s===1&&g.t>3.6){g.s=2;bubble(g.t2,g.b.m.position.x,g.b.m.position.z,2.4,'gos',g.b.m,3);}if(g.s===2&&g.t>7){g.fx();WD.g=null;}}}
// stall love
if(day&&S.speed){WD.loveCd-=dm;if(WD.loveCd<=0){WD.loveCd=60+Math.random()*80;const L=[...stalls.values()].filter(s=>s.st==='open'&&s.m.visible&&!inLove(s)&&s.m.userData.v&&s.m.userData.v.hd);if(L.length>=2){const a=L[Math.floor(Math.random()*L.length)];let b=null,bd=1e9;for(const s of L){if(s===a)continue;const d=Math.hypot(s.m.position.x-a.m.position.x,s.m.position.z-a.m.position.z);if(d<bd){bd=d;b=s;}}if(b&&bd<5.5)loveStart(a,b);}}}
for(let i=WD.lv.length-1;i>=0;i--){const l=WD.lv[i],va=l.a.m.userData.v,vb=l.b.m.userData.v;if(l.a.st!=='open'||l.b.st!=='open'||!va||!vb||!va.hd||!vb.hd){WD.lv.splice(i,1);continue;}l.life-=dm;l.tk+=rt;l.pay+=dm;
if(day){const ya=wrapA(Math.atan2(l.b.m.position.x-l.a.m.position.x,l.b.m.position.z-l.a.m.position.z)-l.a.m.rotation.y),yb2=wrapA(Math.atan2(l.a.m.position.x-l.b.m.position.x,l.a.m.position.z-l.b.m.position.z)-l.b.m.rotation.y);if(Math.sin(t*.5+i*2)>-.2){va.hd.rotation.y=Math.max(-1.2,Math.min(1.2,ya));vb.hd.rotation.y=Math.max(-1.2,Math.min(1.2,yb2));}va.position.y+=Math.abs(Math.sin(t*3))*.01;}
if(l.tk>2.2){l.tk=0;for(const s of [l.a,l.b])heart(s.m.position.x,2.1,s.m.position.z);}
if(l.pay>=25&&day){l.pay=0;const v=5+Math.round(Math.random()*8);pay(v,l.a.m.position.x,l.a.m.position.z,2.4);}
if(l.life<=0){WD.lv.splice(i,1);const r=Math.random();if(r<.35){toast(stNm(l.a)+' & '+stNm(l.b)+' broke up! Awkward…','\u{1F494}');S.tide=Math.max(0,S.tide-3);bubble('It\'s over…\n💔',l.a.m.position.x,l.a.m.position.z,2.4,'say',l.a.m);}else if(r<.7){toast(stNm(l.a)+' & '+stNm(l.b)+' got engaged! +€100','\u{1F48D}');S.cash+=100;S.earn+=100;S.cul=cl(S.cul+.5);sfx('goal');for(let k=0;k<4;k++)heart(l.a.m.position.x+(k-1.5)*.4,2.2,l.a.m.position.z);}else toast(stNm(l.a)+' & '+stNm(l.b)+' are still going strong','\u{2764}');}}
// street couples
if(day&&S.speed){WD.cplCd-=dm;if(WD.cplCd<=0){WD.cplCd=40+Math.random()*60;if(WD.cpl.length<2)coupleStart();}}
for(let i=WD.cpl.length-1;i>=0;i--){const c=WD.cpl[i];c.life-=dm;c.ht+=rt;const ok=c.a.visible&&c.b.visible&&c.a.pd.mode==='loop'&&c.b.pd.mode==='loop'&&c.a.pd.wait<=0&&c.b.pd.wait<=0&&c.life>0&&day;if(!ok){c.a.cpl=null;c.b.cpl=null;WD.cpl.splice(i,1);continue;}c.b.pd.u=c.a.pd.u-c.a.pd.dir*.75;c.b.pd.dir=c.a.pd.dir;
c.a.ar.rotation.x=-.55;c.b.al.rotation.x=-.55;c.a.hd.rotation.y=.35;c.b.hd.rotation.y=-.35;if(c.ht>2.4){c.ht=0;heart((c.a.position.x+c.b.position.x)/2,2.0+gb(c.a.position.x,c.a.position.z),(c.a.position.z+c.b.position.z)/2);}}
// garden: picnics, hippies, stoners
{const pv=day&&h>=11.5&&h<17.5,hv=day&&h>=13&&h<19.5,sv=day&&h>=15&&h<20.5;PICN.forEach(p=>p.g.visible=pv);
for(const q of GFK){const m=q.m,vis=q.role==='pic'?pv:q.role==='hip'?hv:sv;m.visible=vis;if(!vis)continue;m.ll.rotation.x=m.lr.rotation.x=-1.45;m.position.y=q.y0;const i=q.i;
if(q.role==='pic'){const ph=((t*.45+i*1.3)%4);m.ar.rotation.x=ph<1?-2.0*Math.sin(Math.PI*ph):-.5;m.al.rotation.x=-.5;m.hd.rotation.x=ph<1?.15:Math.sin(t*1.2+i)*.1;m.hd.rotation.y=Math.sin(t*.7+i)*.4;}
else if(q.role==='hip'){m.rotation.z=Math.sin(t*1.4+i)*.07;if(m.dna&&m.dna.acc==='guitar'){m.ar.rotation.x=-1.0+Math.sin(t*8)*.3;m.al.rotation.x=-1.3;m.hd.rotation.x=Math.sin(t*2)*.12;}else{const cl2=Math.floor(t/5+i)%3===0;m.ar.rotation.x=cl2?-1.3+Math.sin(t*9)*.3:-.4;m.al.rotation.x=cl2?-1.3-Math.sin(t*9)*.3:-.4;m.hd.rotation.y=Math.sin(t*.9+i)*.5;}}
else{m.rotation.z=Math.sin(t*.8+i)*.08;m.hd.rotation.x=.3+Math.sin(t*.6+i)*.18;const sm=Math.floor(t/4+i)%3===0;m.ar.rotation.x=sm?-2.1:-.4;if(sm&&Math.random()<.04)gpuff(m.position.x,m.position.y+.62,m.position.z);}}
WD.bt-=dt;if(WD.bt<=0&&S.speed){WD.bt=5+Math.random()*7;const L=GFK.filter(q=>q.m.visible);if(L.length){const q=L[Math.floor(Math.random()*L.length)];const P=q.role==='pic'?['Pastel de nata!','Lovely day!','More wine?','Cheers! 🍷']:q.role==='hip'?['Peace, man ✌','Far out…','Love & music!','Free hugs!']:['So hungry…','Whoa… dude','Is that a dog?','Munchies! 🍕'];const s=P[Math.floor(Math.random()*P.length)];bubble(s,q.m.position.x,q.m.position.z,1.7,'say',q.m,2.6);if(s.startsWith('Munchies')){const v=8+Math.round(Math.random()*10);pay(v,q.m.position.x,q.m.position.z,1.6);}}}
for(const p of SMKG){if(p.l>0){p.l-=dt;p.m.position.y+=dt*.35;const k=p.l/2;p.m.material.opacity=k*.5;p.m.scale.setScalar(1+(1-k)*1.6);if(p.l<=0)p.m.visible=false;}}}
}
// ================= polish: neon sign, bunting, pigeons, dust motes =================
const NEO=(()=>{const t=cvx(128,24,q=>{drawLogo(q,128,24);q.strokeStyle='#35e0ff';q.lineWidth=1;q.strokeRect(1.5,1.5,125,21);});const m=new THREE.MeshBasicMaterial({map:t}),o=new THREE.Mesh(new THREE.PlaneGeometry(4.2,.8),m);o.position.set(22.62,3.55,10.65);o.rotation.y=Math.PI/2;sc.add(o);return {o,m};})();
const BUNT=[];for(let i=0;i<30;i++){const z=2.5+i*(17/29),f=bx(sc,.02,.22,.18,24.5,2.15-Math.sin(i/29*Math.PI)*.35,z,[0xe5593f,0xf2c94c,0x3ab795,0x3b82d6,0xff8fab][i%5],1);BUNT.push({f,y:f.position.y});}
const PG=[];for(let i=0;i<9;i++){const g=new THREE.Group();bx(g,.16,.1,.22,0,.12,0,i%3?0x8a8f9a:0x6a6f7a,1);bx(g,.08,.08,.08,0,.2,.12,0x5a6070,1);bx(g,.03,.02,.04,0,.19,.17,0xe0a040,1);bx(g,.02,.06,.02,-.04,.04,0,0xc07060,1);bx(g,.02,.06,.02,.04,.04,0,0xc07060,1);
g.wl=bx(g,.04,.03,.2,-.1,.14,0,0x777c88,1);g.wr=bx(g,.04,.03,.2,.1,.14,0,0x777c88,1);const hx0=30+Math.random()*9,hz0=3+Math.random()*15;g.position.set(hx0,0,hz0);g.h=[hx0,hz0];g.s=0;g.tm=Math.random()*3;sc.add(g);PG.push(g);}
const DUST=[];for(let i=0;i<46;i++){const m=new THREE.Mesh(gm(.04,.04,.04),new THREE.MeshBasicMaterial({color:0xfff4cc,transparent:true,opacity:.5}));m.position.set(4+Math.random()*18,.4+Math.random()*2.2,3+Math.random()*16);m.sd=Math.random()*9;sc.add(m);DUST.push(m);}
function polishAnim(t,dt){if(!S)return;xray();showAnim(t,dt);if(SP){selM.material.opacity=.3+.2*Math.sin(t*5);}const nt=S.ph==='night'||S.ph==='changeover'&&S.t/60>=21;
const fl=nt?(Math.sin(t*23)>-.92?1:.35):0;NEO.o.visible=true;NEO.m.color.setScalar(nt?.8+.2*fl:.28);
BUNT.forEach((b,i)=>{b.f.rotation.x=Math.sin(t*3+i*.7)*.35;b.f.position.y=b.y+Math.sin(t*2.2+i)*.015;});
const day=S.ph==='day'||S.ph==='setup';
PG.forEach((g,i)=>{const d=Math.hypot(Pp.x-g.position.x,Pp.z-g.position.z);g.tm-=dt;
if(g.s===0){g.children[1].position.y=.2-Math.max(0,Math.sin(t*8+i*2))*.06*(Math.sin(t*.7+i)>0?1:0);g.wl.rotation.z=g.wr.rotation.z=0;g.fy=0;if(d<2.6||(g.tm<0&&Math.random()<.002)){g.s=1;g.tm=2.2;g.v=[Math.cos(i*2.4)*3.5,Math.sin(i*2.4)*3.5];g.rotation.y=Math.atan2(g.v[0],g.v[1]);}else if(g.tm<0){g.tm=1+Math.random()*2;g.rotation.y+=(Math.random()-.5)*1.5;}}
else if(g.s===1){g.position.x+=g.v[0]*dt;g.position.z+=g.v[1]*dt;g.fy=Math.min(2.2,(g.fy||0)+dt*2.6);g.wl.rotation.z=Math.sin(t*40)*.9;g.wr.rotation.z=-Math.sin(t*40)*.9;if(g.tm<0){g.s=2;g.tm=3;}}
else{const dx=g.h[0]-g.position.x,dz=g.h[1]-g.position.z,dd=Math.hypot(dx,dz);g.fy=Math.max(0,(g.fy||0)-dt*1.4);g.wl.rotation.z=Math.sin(t*34)*.7*(g.fy>.05?1:0);g.wr.rotation.z=-g.wl.rotation.z;if(dd>.2){g.position.x+=dx/dd*3*dt;g.position.z+=dz/dd*3*dt;g.rotation.y=Math.atan2(dx,dz);}else if(g.fy<=.02){g.s=0;g.tm=2;}}g.position.y=gb(g.position.x,g.position.z)+(g.fy||0);});
DUST.forEach((m,i)=>{m.visible=day&&VW.hw<20;if(!m.visible)return;m.position.y+=Math.sin(t*.6+m.sd)*dt*.08;m.position.x+=Math.cos(t*.3+m.sd)*dt*.1;m.material.opacity=.25+.25*Math.sin(t*1.7+m.sd);});}
build();fit();init();requestAnimationFrame(frame);

