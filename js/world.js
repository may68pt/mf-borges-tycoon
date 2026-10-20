/* MF Borges Tycoon - world module (split from the single-file game; loads in order, shares global scope) */
// ---------- engine ----------
const c=$('c'),R=new THREE.WebGLRenderer({canvas:c,antialias:false}),sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,250);
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
const VW={tx:13,tz:10.5,hw:8,el:.563,elT:.563,az:Math.PI/4,azT:Math.PI/4,plan:false,follow:true},lim=h=>Math.max(.55,Math.min(70,h));
function upd(){const a=c.clientWidth/c.clientHeight;cam.left=-VW.hw;cam.right=VW.hw;cam.top=VW.hw/a;cam.bottom=-VW.hw/a;
if(VW.plan)cam.position.set(VW.tx,80,VW.tz+.001);else {const D=44.9,hz=D*Math.cos(VW.el);cam.position.set(VW.tx+Math.cos(VW.az)*hz,D*Math.sin(VW.el),VW.tz+Math.sin(VW.az)*hz);}cam.lookAt(VW.tx,0,VW.tz);cam.updateProjectionMatrix();}
function fit(){const w=c.clientWidth;R.setPixelRatio(SET.px?Math.min(1,SET.px/w):Math.min(devicePixelRatio,2));R.setSize(w,c.clientHeight,false);upd();}
addEventListener('resize',fit);
const gc={},mc={},gm=(w,h,d)=>{const k=w+','+h+','+d;return gc[k]||(gc[k]=new THREE.BoxGeometry(w,h,d));},mt=q=>typeof q==='object'?q:(mc[q]||(mc[q]=new THREE.MeshLambertMaterial({color:q})));
let ARC=null;const bx=(g,w,h,d,x,y,z,col,ns)=>{const m=new THREE.Mesh(gm(w,h,d),mt(col));m.position.set(x,y,z);m.castShadow=!ns;m.receiveShadow=true;if(ARC&&g===sc)ARC.push(m);g.add(m);return m;};
const GLS=new THREE.MeshLambertMaterial({color:0x9fc5c8,transparent:true,opacity:.32,depthWrite:false}),RGL=new THREE.MeshLambertMaterial({color:0xbfe3ee,transparent:true,opacity:.1,depthWrite:false}),BM=new THREE.MeshBasicMaterial({color:0x6e6247});
// lights
const hemi=new THREE.HemisphereLight(0xdfeaff,0x7a6a5a,.85),sun=new THREE.DirectionalLight(0xfff4dd,1);sc.add(hemi,sun,sun.target);sun.target.position.set(20,0,10.5);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);{const s=sun.shadow.camera;s.left=-36;s.right=36;s.top=24;s.bottom=-24;s.near=1;s.far=120;}sun.shadow.bias=-.0008;
const PLt=(col,x,y,z,d)=>{const l=new THREE.PointLight(col,0,d);l.position.set(x,y,z);sc.add(l);return l;};
const L1=PLt(0xff2d6f,12,3,6,16),L2=PLt(0x3ad0ff,12.5,3,15,16),LA=PLt(0xffc27a,24.5,2.8,2.5,10),LB=PLt(0xffc27a,24.5,2.8,19.5,10),LC=PLt(0xffc27a,6.5,2.6,10.5,10),LD=PLt(0xffc27a,17.5,2.6,10.5,10);
// pixel-art floor (generated, no image assets)
// ================= terrain: the market sits on a raised granite platform; the land falls away to the square =================
const DROP=1.6;
const Hp=x=>x<0?Math.min(1.4,-.1*x):x<=28.9?0:x<=29?-DROP*(x-28.9)/.1:-DROP-.03*(x-29);
const Hs=x=>x<0?Math.min(1.4,-.1*x):x<=14?0:x<=29?-DROP*(x-14)/15:-DROP-.03*(x-29);
const gb=(x,z)=>(z>=0&&z<=21)?Hp(x):Hs(x);
function gy(x,z){if(z>=0&&z<=21&&x>=28.9&&x<=30.7){if(z>=8.2&&z<=13.1)return 0;if(z>=3&&z<8.2)return -DROP*(1-(z-3)/5.2);if(z>13.1&&z<=18.3)return -DROP*(1-(18.3-z)/5.2);}return gb(x,z);}
function terrG(xs,zs,fy,fu,fv){const P=[],U=[],I=[],nx=xs.length;for(let j=0;j<zs.length;j++)for(let i=0;i<nx;i++){P.push(xs[i],fy(xs[i],zs[j]),zs[j]);U.push(fu(xs[i]),fv(zs[j]));}
for(let j=0;j<zs.length-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=(j+1)*nx+i,c2=j*nx+i+1,d=(j+1)*nx+i+1;I.push(a,b,c2,c2,b,d);}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g;}
function stoneMat(rx,ry){const t=cvx(32,32,q=>{pxl(q,'#a39d90',0,0,32,32);for(let r=0;r<4;r++){const y=r*8,o=(r%2)*8;pxl(q,'#7d786c',0,y,32,1);pxl(q,'#7d786c',o,y,1,8);pxl(q,'#7d786c',(o+16)%32,y,1,8);}for(let i=0;i<60;i++)pxl(q,i%2?'#b3ada0':'#8f897d',Math.floor(Math.random()*32),Math.floor(Math.random()*32),1,1);});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.needsUpdate=true;return new THREE.MeshLambertMaterial({map:t});}
const CS=16,cv=document.createElement('canvas');cv.width=W*CS;cv.height=H*CS;const q2=cv.getContext('2d');
const jit=(hx,d)=>{const n=parseInt(hx.slice(1),16),f=v=>Math.max(0,Math.min(255,v+d));return `rgb(${f(n>>16)},${f((n>>8)&255)},${f(n&255)})`;},rn=n=>Math.floor(Math.random()*n);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=G[y][x],b=KC[t.k],ox=x*CS,oy=y*CS;q2.fillStyle=b;q2.fillRect(ox,oy,CS,CS);
if(t.k!=='wc'&&t.k!=='wcl')for(let i=0;i<14;i++){q2.fillStyle=jit(b,(Math.random()-.5)*26);q2.fillRect(ox+rn(CS),oy+rn(CS),1+rn(2),1);}
if(['main','food','site','out','plz','sq'].includes(t.k)){q2.fillStyle='rgba(0,0,0,.15)';q2.fillRect(ox,oy,CS,1);q2.fillRect(ox,oy,1,CS);}
if(t.k==='wc'||t.k==='wcl'){q2.fillStyle='rgba(0,0,0,.09)';for(let a=0;a<CS;a+=8)for(let e=0;e<CS;e+=8)if((a+e)/8%2===0)q2.fillRect(ox+a,oy+e,8,8);}
if(t.b){q2.fillStyle='rgba(255,255,255,.2)';q2.fillRect(ox+1,oy+1,2,2);}}
{const ex=(x,z)=>{const dx=(x-33.4)/10.9,dz=(z-10.5)/8.6;return dx*dx+dz*dz;};
q2.fillStyle='#b9b3a5';q2.beginPath();for(let a=-Math.PI/2;a<=Math.PI/2+.01;a+=.08)q2.lineTo((33.4+Math.cos(a)*11.15)*CS,(10.5+Math.sin(a)*8.85)*CS);q2.closePath();q2.fill();
q2.fillStyle='#4b7a38';q2.beginPath();for(let a=-Math.PI/2;a<=Math.PI/2+.01;a+=.08)q2.lineTo((33.4+Math.cos(a)*10.7)*CS,(10.5+Math.sin(a)*8.4)*CS);q2.closePath();q2.fill();
for(let i=0;i<2600;i++){const x=33.5+Math.random()*11,z=2+Math.random()*17;if(ex(x,z)<.9){q2.fillStyle=['#5b8a42','#3f6b2f','#6a9a4a','#476f33'][i%4];q2.fillRect(x*CS,z*CS,2,2);}}
const path=(x0,z0,x1,z1,w)=>{q2.strokeStyle='#bdb8ac';q2.lineWidth=w*CS;q2.lineCap='butt';q2.beginPath();q2.moveTo(x0*CS,z0*CS);q2.lineTo(x1*CS,z1*CS);q2.stroke();};
path(33.4,3.4,41.5,10.5,1.5);path(33.4,17.6,41.5,10.5,1.5);path(33.4,10.5,41.5,10.5,1.2);
q2.fillStyle='#bdb8ac';q2.beginPath();q2.arc(41.5*CS,10.5*CS,2.9*CS,0,7);q2.fill();q2.fillStyle='#a8a396';q2.beginPath();q2.arc(41.5*CS,10.5*CS,2.2*CS,0,7);q2.fill();
q2.fillStyle='#c8c3b6';q2.fillRect(32.9*CS,2*CS,.5*CS,17*CS);
q2.fillStyle='#3d3d45';q2.fillRect(31.3*CS,0,1.6*CS,21*CS);q2.fillStyle='#c8c3b6';q2.fillRect(31.2*CS,0,.1*CS,21*CS);q2.fillRect(32.9*CS,0,.12*CS,2*CS);q2.fillRect(32.9*CS,19*CS,.12*CS,2*CS);q2.fillStyle='#d8d8d8';for(let z=.4;z<20.6;z+=1.2)q2.fillRect(32.05*CS,z*CS,.1*CS,.6*CS);for(let z=9.3;z<12;z+=.45)q2.fillRect(31.3*CS,z*CS,1.6*CS,.22*CS);}
const FT_=(s,x,z,sz,col)=>{q2.save();q2.translate(x*CS,z*CS);q2.fillStyle=col;q2.font='bold '+sz+'px Silkscreen,monospace';q2.textAlign='center';q2.fillText(s,0,0);q2.restore();};
FT_('ROOM 1',11,6.2,26,'rgba(255,255,255,.13)');FT_('ROOM 2',12.5,15.4,26,'rgba(255,255,255,.13)');FT_('PRAÇA DO INFANTE D. HENRIQUE',38,1.1,12,'rgba(0,0,0,.2)');
const ft=new THREE.CanvasTexture(cv);ft.magFilter=ft.minFilter=THREE.NearestFilter;ft.generateMipmaps=false;
const fxs=[];for(let x=0;x<=28;x++)fxs.push(x);fxs.push(28.9,29);for(let x=30;x<=W;x++)fxs.push(x);const fzs=[];for(let z=0;z<=H;z++)fzs.push(z);
const fl=new THREE.Mesh(terrG(fxs,fzs,(x,z)=>Hp(x),x=>x/W,z=>1-z/H),new THREE.MeshLambertMaterial({map:ft}));fl.receiveShadow=true;sc.add(fl);
const gr=new THREE.Mesh(new THREE.PlaneGeometry(260,260),mt(0x6f6d73));gr.rotation.x=-Math.PI/2;gr.position.set(W/2,-3.4,H/2);gr.receiveShadow=true;sc.add(gr);
// ---------- architecture (cast-iron hall, glass, granite, gables) ----------
ARC=[];const WALLS=[],RW=[],RED=0xb3261e,STONE=0xa39d90,GOLD=0xc9a24b;let CUT=false;
const coll=(x0,y0,x1,y1)=>WALLS.push(x0===x1?[x0-.15,y0,x0+.15,y1]:[x0,y0-.15,x1,y0+.15]);
function colm(x,z,h){bx(sc,.28,.2,.28,x,.1,z,0x6e6a62);bx(sc,.15,h,.15,x,h/2+.1,z,RED);bx(sc,.3,.14,.3,x,h+.17,z,GOLD);}
function bulb(x,y,z){const m=new THREE.Mesh(gm(.07,.07,.07),BM);m.position.set(x,y,z);sc.add(m);}
function iron(x0,z0,x1,z1){coll(x0,z0,x1,z1);const v=x0===x1,L=v?z1-z0:x1-x0,n=Math.max(1,Math.round(L/2.2)),st=L/n,mx=(x0+x1)/2,mz=(z0+z1)/2;
bx(sc,v?.34:L,.5,v?L:.34,mx,.25,mz,STONE);bx(sc,v?.1:L,1.55,v?L:.1,mx,1.3,mz,GLS,1);bx(sc,v?.24:L,.22,v?L:.24,mx,2.4,mz,RED);
for(let i=0;i<=n;i++)colm(v?x0:x0+i*st,v?z0+i*st:z0,2.15);for(let p=.3;p<L;p+=.6)bulb(v?x0+.2:x0+p,2.2,v?z0+p:z0+.2);}
[[.3,2.1,9.6,2.1],[10.83,2.1,22.45,2.1],[.3,19.15,12.2,19.15],[13.9,19.15,22.45,19.15],[22.45,2.1,22.45,9.36],[22.45,11.96,22.45,19.15],[.3,2.1,.3,19.15]].forEach(w=>iron(...w));
function wlr(x0,z0,x1,z1,h,col){coll(x0,z0,x1,z1);const v=x0===x1,m=bx(sc,v?.3:x1-x0,h,v?z1-z0:.3,(x0+x1)/2,h/2,(z0+z1)/2,col);RW.push({m,h});}
[[4.87,2.4,4.87,3.6],[4.87,8.9,4.87,14],[4.87,17,4.87,17.8],[4.87,18.9,4.87,19.1],[5.06,3.35,9.6,3.35],[10.93,3.35,19.6,3.35],[5.06,9.05,8,9.05],[9.23,9.05,19.6,9.05],[19.45,3.35,19.45,5.79],[19.45,6.6,19.45,9.05],
[5.67,12.15,12.26,12.15],[13.87,12.15,19.84,12.15],[5.67,18.1,12.37,18.1],[13.87,18.1,19.84,18.1],[5.85,12.15,5.85,18.1],[19.65,12.15,19.65,14.57],[19.65,15.43,19.65,18.1]].forEach(w=>wlr(...w,1.5,0x1c1c26));
[[2,14,4.87,14],[2,17,4.87,17],[2,14,2,17],[2,15,4,15],[2,16,4,16],[4,14,4,14.1],[4,14.9,4,15.1],[4,15.9,4,16.1],[4,16.9,4,17]].forEach(w=>wlr(...w,1.1,0xd9d4c7));
// stepped gables on the front (right) facade + granite stairs
// red iron facade: arched louvred windows, triangular gables, central glazed tower, white plastered band
const FX=22.46;
function winMat(kind,w,h){const t=cvx(16,16,q=>{if(kind==='lv'){pxl(q,'#3f6b52',0,0,16,16);for(let y=0;y<16;y+=2)pxl(q,'#2c4d3a',0,y,16,1);}else{pxl(q,'#7fb4c4',0,0,16,16);for(let y=0;y<16;y+=4)pxl(q,'#4f7f90',0,y,16,1);pxl(q,'#b8372c',0,0,1,16);pxl(q,'#b8372c',8,0,1,16);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;if(kind==='lv')t.repeat.set(1/w,1/1.1);else t.repeat.set(2/w,3/h);t.needsUpdate=true;return new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide});}
function archGeo(w,h){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(w,0);sh.lineTo(w,h-w/2);sh.absarc(w/2,h-w/2,w/2,0,Math.PI,false);sh.lineTo(0,0);return new THREE.ShapeGeometry(sh,10);}
function archMesh(w,h,mat,x,y,zc){const m=new THREE.Mesh(archGeo(w,h),mat);m.rotation.y=Math.PI/2;m.position.set(x,y,zc+w/2);sc.add(m);if(ARC)ARC.push(m);return m;}
function gbl(zc,w,y0,h){const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(w,0);sh.lineTo(w/2,h);sh.lineTo(0,0);const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.16,bevelEnabled:false}),mt(RED));m.rotation.y=-Math.PI/2;m.position.set(FX+.14,y0,zc-w/2);m.castShadow=true;sc.add(m);if(ARC)ARC.push(m);return m;}
for(const [zc,w] of [[5.73,7.26],[15.555,7.19]]){bx(sc,.12,.55,w,FX+.04,.78,zc,0xeae5d8);bx(sc,.16,1.1,w,FX+.06,2.95,zc,RED);gbl(zc,w,3.5,1.4);
 for(const dz of [-1.75,1.75])archMesh(1.7,2.3,winMat('lv',1.7,2.3),FX+.16,1.0,zc+dz);archMesh(.9,1.1,winMat('lv',.9,1.1),FX+.16,3.55,zc);}
bx(sc,.2,2.6,3.6,FX+.08,3.7,10.66,RED);gbl(10.66,3.6,5.0,1.0);archMesh(2.4,3.4,winMat('gl',2.4,3.4),FX+.2,1.3,10.66);
bx(sc,.2,1.3,.2,FX+.1,.65,9.4,RED);bx(sc,.2,1.3,.2,FX+.1,.65,11.92,RED);bx(sc,.12,.2,2.7,FX+.1,1.35,10.66,RED);for(let z=9.7;z<11.7;z+=.25)bx(sc,.04,.45,.04,FX+.1,1.1,z,0x2a2a30,1);
const XRM=ARC;ARC=null;
// glazed roof with iron trusses (casts light stripes)
const roof=new THREE.Group();sc.add(roof);for(let x=1.5;x<22.5;x+=3)bx(roof,.12,.12,17.05,x,3.1,10.6,RED);bx(roof,22.2,.12,.12,11.5,3.1,10.6,RED);bx(roof,22.2,.05,17.05,11.5,3.1,10.6,RGL,1);
// three gabled naves (like the real hall): red tiled side naves, higher grey corrugated central nave; fades out when zoomed in so the interior stays playable
const roofTop=new THREE.Group();roof.add(roofTop);const ROOFM=[];
function rmat(c){const m=new THREE.MeshLambertMaterial({color:c,transparent:true,opacity:1,side:THREE.DoubleSide});ROOFM.push(m);return m;}
const RTL=rmat(0xa9472f),RGY=rmat(0x8c8f93),RDK=rmat(0x6e7075),RRD=rmat(0xb3261e);
function prism(pts,x0,x1,mat){const sh=new THREE.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.lineTo(pts[0][0],pts[0][1]);const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:x1-x0,bevelEnabled:false}),mat);m.rotation.y=-Math.PI/2;m.position.set(x1,0,0);roofTop.add(m);return m;}
for(const [za,zb] of [[2.0,8.5],[12.8,19.3]]){const zm=(za+zb)/2;prism([[za,3.4],[zm,4.9],[zb,3.4]],.2,22.5,RTL);
 prism([[zm-1.15,4.38],[zm-.6,5.12],[zm+.6,5.12],[zm+1.15,4.38]],1.2,21.2,RDK);for(let x=1.6;x<21;x+=1.7)bx(roofTop,.07,.06,2.3,x,4.4,zm,0x55575c,1);}
prism([[8.5,3.4],[8.5,4.6],[10.65,6.1],[12.8,4.6],[12.8,3.4]],.2,22.5,RGY);for(let x=.9;x<22;x+=1.5)bx(roofTop,.07,.06,4.9,x,5.3,10.65,0x6a6c70,1);
bx(roofTop,22.3,.14,.14,11.35,6.14,10.65,RRD.color.getHex(),1);
// exterior upper wall band + arched windows on the sides and back (real hall has red iron walls, arched louvres, white plaster base)
for(const z of [2.1,19.15]){bx(sc,22.2,1.1,.3,11.4,2.95,z,RED);bx(sc,22.2,.12,.34,11.4,2.45,z,0xeae5d8);}
bx(sc,.3,1.1,17.2,.3,2.95,10.65,RED);bx(sc,.34,.12,17.2,.3,2.45,10.65,0xeae5d8);
for(let x=1.3;x<22;x+=2.2){const a=archGeo(1.1,1.0),m1=new THREE.Mesh(a,winMat('lv',1.1,1.0)),m2=new THREE.Mesh(a,winMat('lv',1.1,1.0));m1.rotation.y=Math.PI;m1.position.set(x+.55,2.5,1.93);m2.position.set(x-.55,2.5,19.32);sc.add(m1,m2);}
for(let z=3.1;z<19;z+=2.2){const m=new THREE.Mesh(archGeo(1.1,1.0),winMat('lv',1.1,1.0));m.rotation.y=-Math.PI/2;m.position.set(.13,2.5,z-.55);sc.add(m);}
function roofLOD(){const hw=(typeof VW!=='undefined'&&VW.hw)||10,op=Math.max(0,Math.min(1,(hw-12.5)/4.5));ROOFM.forEach(m=>m.opacity=op);roofTop.visible=op>.03;}
// stages with lighting trusses, speakers and bars
const SL=[];function stage(cx,cz,w,d,tx,tz,vz,r){bx(sc,w,.3,d,cx,.15,cz,0x6b4f3a);bx(sc,.12,1.8,.12,tx,.9,tz-vz/2,0x555a66);bx(sc,.12,1.8,.12,tx,.9,tz+vz/2,0x555a66);bx(sc,.12,.12,vz,tx,1.8,tz,0x555a66);
for(let i=0;i<5;i++){const m=new THREE.Mesh(gm(.16,.16,.16),new THREE.MeshBasicMaterial({color:0x333340}));m.position.set(tx,1.68,tz-vz/2+.4+i*(vz-.8)/4);sc.add(m);SL.push({m,r});}
for(const s of [-1,1])bx(sc,.5,.9,.5,cx,.75,cz+s*(d/2-.4),0x15151c);}
stage(3.5,6.5,3,5,4.6,6.5,4.6,1);stage(7.5,15.5,3,3,8.8,15.5,3,2);
[[15,4,19,6],[15,7,19,9],[15,12,19,14],[25,3,27,8],[25,13,27,18]].forEach(([x0,z0,x1,z1])=>{const mx=(x0+x1)/2,mz=(z0+z1)/2,v=x1-x0<z1-z0;bx(sc,v?.5:x1-x0-.3,.7,v?z1-z0-.3:.5,mx,.35,mz,0x5a3a26);bx(sc,v?.6:x1-x0-.3,.06,v?z1-z0-.3:.6,mx,.73,mz,0xd9cdb8);for(let i=0;i<6;i++)bx(sc,.1,.25,.1,v?mx:x0+.5+i*(x1-x0-1)/5,.88,v?z0+.5+i*(z1-z0-1)/5:mz,[0xd64f3a,0x3ab795,0xf2c94c,0x3b82d6][i%4],1);});
bx(sc,3,.5,.8,17,.25,17,0x3a3a46);
// street furniture: umbrellas + lamp posts
for(const z of []){bx(sc,.05,1,.05,24.5,.5,z,0x777777);bx(sc,1.2,.08,1.2,24.5,1.05,z,0xe5593f);bx(sc,.8,.08,.8,24.5,1.13,z,0xf2ead8);bx(sc,.4,.08,.4,24.5,1.21,z,0xe5593f);bx(sc,.5,.45,.5,24.5,.22,z+.7,0x7b6a5a);}
for(const z of [2.5,19.5]){bx(sc,.08,2.2,.08,24.5,1.1,z,0x2a2a2a);const m=new THREE.Mesh(gm(.22,.22,.22),BM);m.position.set(24.5,2.3,z);sc.add(m);}
// floor light pools for events
const pool=(x0,z0,x1,z1)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshBasicMaterial({color:0xff2d6f,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.05,(z0+z1)/2);sc.add(m);return m;};
const P1=pool(5.2,3.5,19,8.9),P2=pool(9.2,12.3,19.4,17.9);
// labels (billboards)
const LABS=[];function lab(t,x,z,y){const k=document.createElement('canvas');k.width=Math.max(64,t.length*10+12);k.height=22;const q=k.getContext('2d');q.fillStyle='rgba(15,15,25,.72)';q.fillRect(0,0,k.width,22);q.fillStyle='#f2ecdf';q.font='bold 13px monospace';q.textAlign='center';q.fillText(t,k.width/2,16);
const tx=new THREE.CanvasTexture(k);tx.magFilter=tx.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:false,transparent:true}));s.scale.set(k.width/34,.65,1);s.position.set(x,y||2.2,z);s.renderOrder=9;sc.add(s);LABS.push(s);}

const hov=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x58d68d,transparent:true,opacity:.55}));hov.rotation.x=-Math.PI/2;hov.position.y=.06;hov.visible=false;sc.add(hov);
