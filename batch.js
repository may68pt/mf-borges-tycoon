/* batch.js - static scenery batcher. Merges scenery meshes that never move into a few big meshes per material and map cell,
   so the town costs a fraction of the draw calls. Anything that moves, hides or changes later is released automatically
   (the original objects are only moved to an unrendered layer, the game keeps full control of them).
   Add ?nobatch to the address to switch it off. */
(function(){
'use strict';
if(window.mfbBatch||/[?&]nobatch/.test(location.search))return;
var B=window.mfbBatch={cells:0,meshes:0,released:0,calls:0};
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var T=window.THREE,sc=g('sc');
if(!T||!sc)return;
var CELL=14,HIDE=1;                    // map cell size; layer used to park the originals (the camera renders layer 0 only)

/* ---------- what is never merged ---------- */
var skip=new Set();
function ex(o){if(o)skip.add(o);}
var RW=g('RW'),XRM=g('XRM'),roof=g('roof'),stalls=g('stalls');
if(RW&&RW.forEach)RW.forEach(function(w){ex(w&&w.m);});
if(XRM&&XRM.forEach)XRM.forEach(ex);
ex(roof);
try{if(stalls&&stalls.forEach)stalls.forEach(function(s){ex(s&&s.m);});}catch(e){}
var ANIMPROP=['ll','lr','al','ar','hd','pd','an','v'];
function plainMat(m){return m&&!Array.isArray(m)&&(m.isMeshLambertMaterial||m.isMeshBasicMaterial)&&!m.map&&!m.transparent&&m.opacity===1&&!m.vertexColors&&!m.alphaMap;}
function plainMesh(o){return o.isMesh&&!o.isSkinnedMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position&&plainMat(o.material)&&!o.userData.noMerge;}
function inSkip(o){for(var p=o;p&&p!==sc;p=p.parent)if(skip.has(p))return true;return false;}
function effVisible(o){for(var p=o;p;p=p.parent)if(!p.visible)return false;return true;}
function plainTree(root){
  var ok=true;
  (function walk(o){
    if(!ok)return;
    if(skip.has(o)){ok=false;return;}
    var isG=o.type==='Group'||o.type==='Object3D';
    if(o.isMesh){if(!plainMesh(o)){ok=false;return;}}
    else if(!isG){ok=false;return;}
    for(var i=0;i<ANIMPROP.length;i++)if(o[ANIMPROP[i]]!==undefined){ok=false;return;}
    if(o.userData&&Object.keys(o.userData).length){ok=false;return;}
    for(var k=0;k<o.children.length;k++)walk(o.children[k]);
  })(root);
  return ok;
}

/* ---------- collect candidates ---------- */
function collect(){
  var roots=[],out=[];
  sc.children.forEach(function(c){
    if(c.userData&&c.userData.__batch)return;
    if(c.isLight||c.isSprite||c.isPoints||c.isLine)return;
    if(c.isMesh){if(plainMesh(c)&&!skip.has(c))roots.push(c);}
    else if((c.type==='Group'||c.type==='Object3D')&&c.children.length&&plainTree(c))roots.push(c);
  });
  roots.forEach(function(r){var l=[];r.traverse(function(o){if(o.isMesh)l.push(o);});out.push({root:r,meshes:l});});
  return out;
}
function snap(list){return list.map(function(o){return Array.prototype.slice.call(o.matrixWorld.elements);});}
function same(a,b){for(var i=0;i<16;i++)if(Math.abs(a[i]-b[i])>1e-4)return false;return true;}

/* ---------- geometry merge (world space, positions + normals) ---------- */
var nm=new T.Matrix3(),v3=new T.Vector3();
function build(srcs,key){
  var nv=0,ni=0,i,k;
  srcs.forEach(function(m){var gp=m.geometry;nv+=gp.attributes.position.count;ni+=gp.index?gp.index.count:gp.attributes.position.count;});
  var pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),idx=new Uint32Array(ni),vo=0,io=0;
  srcs.forEach(function(m){
    m.updateWorldMatrix(true,false);
    var gp=m.geometry,P=gp.attributes.position,N=gp.attributes.normal,n=P.count;
    nm.getNormalMatrix(m.matrixWorld);
    for(i=0;i<n;i++){
      v3.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);pos[(vo+i)*3]=v3.x;pos[(vo+i)*3+1]=v3.y;pos[(vo+i)*3+2]=v3.z;
      if(N){v3.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[(vo+i)*3]=v3.x;nor[(vo+i)*3+1]=v3.y;nor[(vo+i)*3+2]=v3.z;}
    }
    if(gp.index){var ix=gp.index;for(k=0;k<ix.count;k++)idx[io++]=ix.getX(k)+vo;}else for(k=0;k<n;k++)idx[io++]=vo+k;
    vo+=n;
  });
  var geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setIndex(new T.BufferAttribute(idx,1));
  geo.computeBoundingSphere();geo.computeBoundingBox();
  var mesh=new T.Mesh(geo,srcs[0].material);
  mesh.castShadow=srcs[0].castShadow;mesh.receiveShadow=srcs[0].receiveShadow;
  mesh.matrixAutoUpdate=false;mesh.userData.__batch=1;
  return mesh;
}

/* ---------- cells ---------- */
var cells=[],bad=new Set(),rebuilds=0;
function makeCells(items){
  var map={};
  items.forEach(function(it){
    it.meshes.forEach(function(m){
      if(bad.has(m))return;
      m.updateWorldMatrix(true,false);
      var x=m.matrixWorld.elements[12],z=m.matrixWorld.elements[14];
      var key=m.material.uuid+'|'+(m.castShadow?1:0)+(m.receiveShadow?1:0)+'|'+Math.floor(x/CELL)+','+Math.floor(z/CELL);
      (map[key]||(map[key]=[])).push(m);
    });
  });
  Object.keys(map).forEach(function(k){
    var srcs=map[k];if(srcs.length<3)return;     // not worth it
    mountCell(srcs,k);
  });
}
function mountCell(srcs,key){
  var mesh=build(srcs,key);sc.add(mesh);
  var c={mesh:mesh,srcs:srcs,key:key,mx:snap(srcs),live:true};
  srcs.forEach(function(m){m.layers.set(HIDE);});
  cells.push(c);B.cells++;B.meshes+=srcs.length;
}
function release(c,changed){
  if(!c.live)return;c.live=false;
  c.mesh.visible=false;sc.remove(c.mesh);c.mesh.geometry.dispose();
  c.srcs.forEach(function(m){m.layers.set(0);});
  B.cells--;B.meshes-=c.srcs.length;B.released++;
  if(changed&&changed.length)changed.forEach(function(m){bad.add(m);});
  var rest=c.srcs.filter(function(m){return !bad.has(m)&&effVisible(m);});
  if(rest.length>=3&&rebuilds<60){rebuilds++;mountCell(rest,c.key);}
}
function watch(){
  var live=cells.filter(function(c){return c.live;});
  live.forEach(function(c){
    var ch=[],i;
    for(i=0;i<c.srcs.length;i++){var m=c.srcs[i];if(!effVisible(m)||!same(m.matrixWorld.elements,c.mx[i]))ch.push(m);}
    if(ch.length)release(c,ch);
  });
  B.calls=cells.filter(function(c){return c.live;}).length;
}

/* ---------- run: observe a few seconds, then merge what never moved ---------- */
function start(){
  var items=collect();if(!items.length)return;
  var all=[];items.forEach(function(it){it.meshes.forEach(function(m){all.push(m);});});
  all.forEach(function(m){m.updateWorldMatrix(true,false);});
  var A=snap(all),vis=all.map(effVisible),at=new Map();all.forEach(function(m,i){at.set(m,i);});
  setTimeout(function(){
    var keep=items.filter(function(it){
      return it.meshes.every(function(m){var i=at.get(m);return i!==undefined&&same(m.matrixWorld.elements,A[i])&&effVisible(m)===vis[i]&&vis[i];});
    });
    makeCells(keep);
    setInterval(watch,2000);
  },4000);
}
function ready(){return !!(g('S')&&g('stalls')&&g('V'));}
var tries=0,iv=setInterval(function(){if(ready()||++tries>40){clearInterval(iv);setTimeout(start,1500);}},250);
})();
