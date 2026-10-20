/* lite.js - level of detail for the crowd. A person is ~12 little parts (12 draw calls). Far-away people are drawn as ONE merged mesh
   (1 draw call, no walk cycle); the nearest ones keep the full animated body. How many stay full depends on the quality tier.
   Parts with a texture (faces) are left alone, so they stay visible. Add ?nolite to the address to switch it off. */
(function(){
'use strict';
if(window.mfbLite||/[?&]nolite/.test(location.search))return;
var L=window.mfbLite={chars:0,full:0,lite:0};
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var T=window.THREE,R=g('R');
if(!T||!R||!R.render)return;
var HIDE=1;
var matLite=new T.MeshLambertMaterial({vertexColors:true});
var info=new Map();               // char -> {lite,parts,isLite}
var LIMBS=['ll','lr','al','ar','hd'];

function plainPart(o){var m=o.material;return o.isMesh&&m&&!Array.isArray(m)&&m.isMeshLambertMaterial&&!m.map&&!m.transparent&&m.opacity===1&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;}

function bake(ch){
  var rec=info.get(ch);
  // stand the limbs in a neutral pose while baking
  var saved=[];LIMBS.forEach(function(k){var o=ch[k];if(o&&o.rotation){saved.push([o,o.rotation.x,o.rotation.y,o.rotation.z]);o.rotation.set(0,0,0);}});
  var sp=ch.position.clone(),sr=ch.rotation.clone();
  ch.position.set(0,0,0);ch.rotation.set(0,0,0);
  ch.updateMatrixWorld(true);
  var parts=[];ch.traverse(function(o){if(o!==rec.lite&&plainPart(o))parts.push(o);});
  var nv=0,ni=0;parts.forEach(function(m){var a=m.geometry.attributes.position.count;nv+=a;ni+=m.geometry.index?m.geometry.index.count:a;});
  var pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),idx=new Uint16Array(ni);
  var inv=new T.Matrix4().copy(ch.matrixWorld).invert(),mt=new T.Matrix4(),nm=new T.Matrix3(),v=new T.Vector3(),vo=0,io=0,i,k;
  parts.forEach(function(m){
    mt.multiplyMatrices(inv,m.matrixWorld);nm.getNormalMatrix(mt);
    var gp=m.geometry,P=gp.attributes.position,N=gp.attributes.normal,n=P.count,c=m.material.color;
    for(i=0;i<n;i++){
      v.fromBufferAttribute(P,i).applyMatrix4(mt);pos[(vo+i)*3]=v.x;pos[(vo+i)*3+1]=v.y;pos[(vo+i)*3+2]=v.z;
      if(N){v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[(vo+i)*3]=v.x;nor[(vo+i)*3+1]=v.y;nor[(vo+i)*3+2]=v.z;}
      col[(vo+i)*3]=c.r;col[(vo+i)*3+1]=c.g;col[(vo+i)*3+2]=c.b;
    }
    if(gp.index){for(k=0;k<gp.index.count;k++)idx[io++]=gp.index.getX(k)+vo;}else for(k=0;k<n;k++)idx[io++]=vo+k;
    vo+=n;
  });
  var geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(nor,3));geo.setAttribute('color',new T.BufferAttribute(col,3));geo.setIndex(new T.BufferAttribute(idx,1));
  geo.computeBoundingSphere();
  if(rec.lite){rec.lite.geometry.dispose();rec.lite.geometry=geo;}
  else{var mesh=new T.Mesh(geo,matLite);mesh.visible=false;mesh.castShadow=false;ch.add(mesh);rec.lite=mesh;}
  rec.parts=parts;
  saved.forEach(function(s){s[0].rotation.set(s[1],s[2],s[3]);});
  ch.position.copy(sp);ch.rotation.copy(sr);
  ch.updateMatrixWorld(true);
}
function setLite(ch,on){
  var rec=info.get(ch);if(!rec||!rec.lite||rec.on===on)return;
  rec.on=on;rec.lite.visible=on;
  for(var i=0;i<rec.parts.length;i++)rec.parts[i].layers.set(on?HIDE:0);
}
function register(list){
  if(!list||!list.length)return;
  list.forEach(function(ch){
    if(info.has(ch)||!ch.children||ch.children.length<5)return;
    info.set(ch,{lite:null,parts:[],on:false});
    try{bake(ch);L.chars++;}catch(e){info.delete(ch);}
  });
}
function focus(){var w=g('VW');return w?[w.tx,w.tz]:[13,10.5];}
var KEEP=[0,16,999];                          // how many full-detail people per tier (Low, Balanced, High)
function update(){
  var tier=(window.mfbPerf&&window.mfbPerf.tier);if(tier===undefined)tier=1;
  var k=KEEP[tier],f=focus(),arr=[];
  info.forEach(function(rec,ch){
    if(!ch.visible){return;}
    var dx=ch.position.x-f[0],dz=ch.position.z-f[1];
    arr.push([dx*dx+dz*dz-(rec.on?0:6),ch]);       // people already full get a small bonus (no flicker)
  });
  arr.sort(function(a,b){return a[0]-b[0];});
  var full=0,lite=0;
  for(var i=0;i<arr.length;i++){var on=i>=k;setLite(arr[i][1],on);if(on)lite++;else full++;}
  L.full=full;L.lite=lite;
}

/* ---------- hook the renderer ---------- */
var prev=R.render.bind(R),lastBake=0,lastPh=null;
R.render=function(s,c){
  try{
    var n=performance.now();
    if(n-lastBake>2500){                         // pick up new characters / outfit changes
      lastBake=n;register(g('V'));register(g('PED'));
      var ph=g('S')&&g('S').ph;
      if(ph!==lastPh){lastPh=ph;info.forEach(function(rec,ch){try{var on=rec.on;setLite(ch,false);bake(ch);rec.on=false;if(on)setLite(ch,true);}catch(e){}});}
    }
    update();
  }catch(e){}
  return prev(s,c);
};
register(g('V'));register(g('PED'));
})();
