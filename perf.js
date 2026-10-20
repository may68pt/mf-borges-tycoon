/* perf.js - keeps the game light. Quality tiers (auto-adapting), render throttling, crowd caps, on-demand loading of the mini-games.
   Loaded last. Reads the game's own globals (R, sc, sun, V, PED, drawMM, openSP) and never changes game rules. */
(function(){
'use strict';
if(window.mfbPerf)return;
var P=window.mfbPerf={tier:1,mode:'auto'};
var KEY='mfb_q';
function lsGet(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function lsSet(v){try{localStorage.setItem(KEY,v);}catch(e){}}
function g(name){try{return (0,eval)(name);}catch(e){return undefined;}}   // read a global lexical binding safely

/* ---------- tiers: 0 low, 1 balanced, 2 high ---------- */
var TIERS=[
  {name:'Low',     shadows:false,v:22,ped:6, fps:30,dust:false,mm:400},
  {name:'Balanced',shadows:false,v:44,ped:16,fps:45,dust:true, mm:250},
  {name:'High',    shadows:true, v:80,ped:34,fps:0, dust:true, mm:120}
];
var small=(function(){try{return matchMedia('(pointer:coarse)').matches||(navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4);}catch(e){return false;}})();
var saved=lsGet();
if(saved==='0'||saved==='1'||saved==='2'){P.mode='manual';P.tier=+saved;}else P.tier=small?0:1;

var R_=g('R'),SUN=g('sun'),SC=g('sc');
if(!R_||!R_.render)return;           // game not ready, do nothing

function applyShadows(on){
  try{
    if(SUN){SUN.castShadow=on;if(on&&SUN.shadow){SUN.shadow.mapSize.set(1024,1024);if(SUN.shadow.map){SUN.shadow.map.dispose();SUN.shadow.map=null;}}}
    R_.shadowMap.enabled=on;
    if(SC)SC.traverse(function(m){var mt=m.material;if(mt&&!Array.isArray(mt))mt.needsUpdate=true;});
  }catch(e){}
}
var shadowOn=null;
function setTier(t,manual){
  t=Math.max(0,Math.min(2,t));
  if(manual){P.mode='manual';lsSet(String(t));}
  P.tier=t;var T=TIERS[t];
  if(shadowOn!==T.shadows){shadowOn=T.shadows;applyShadows(T.shadows);}
  btnLabel();
}
P.setTier=setTier;

/* ---------- render wrapper: hidden tab, fps cap, overlays, crowd caps ---------- */
var origRender=R_.render.bind(R_),lastR=0;
function crowdCap(T){
  var V=g('V'),PED=g('PED'),i;
  if(V&&V.length)for(i=T.v;i<V.length;i++)V[i].visible=false;
  if(PED&&PED.length)for(i=T.ped;i<PED.length;i++)PED[i].visible=false;
  if(!T.dust){var D=g('DUST');if(D&&D.forEach)D.forEach(function(m){m.visible=false;});}
}
function covered(){
  var a=document.getElementById('mg'),b=document.getElementById('nr');
  return !!((a&&a.offsetParent!==null&&getComputedStyle(a).display!=='none')||(b&&b.style.display==='flex'));
}
R_.render=function(s,c){
  if(document.hidden)return;
  var n=performance.now(),T=TIERS[P.tier],gap=covered()?110:(T.fps?1000/T.fps-3:0);
  if(gap&&n-lastR<gap)return;
  lastR=n;
  crowdCap(T);
  origRender(s,c);
};

/* ---------- minimap: redraw a few times per second, not every frame ---------- */
var dm=g('drawMM');
if(typeof dm==='function'){var lastMM=0,wrapped=function(){var n=performance.now();if(n-lastMM<TIERS[P.tier].mm)return;lastMM=n;return dm.apply(this,arguments);};window.drawMM=wrapped;}

/* ---------- floating world popups: at most one every 350 ms ---------- */
var pp=window.popup;
if(typeof pp==='function'){var lp=0;window.popup=function(){var n=performance.now();if(n-lp<350)return;lp=n;return pp.apply(this,arguments);};}

/* ---------- adaptive quality: watch real frame times ---------- */
var acc=0,cnt=0,lastT=0,okFor=0,lastDown=0;
function watch(t){
  requestAnimationFrame(watch);
  if(document.hidden){lastT=0;return;}
  if(lastT){var d=t-lastT;if(d<250){acc+=d;cnt++;}}
  lastT=t;
  if(cnt>=90){
    var avg=acc/cnt;acc=0;cnt=0;
    if(P.mode==='auto'){
      if(avg>38&&P.tier>0){setTier(P.tier-1);lastDown=t;okFor=0;}
      else if(avg<20&&P.tier<1&&t-lastDown>90000){okFor++;if(okFor>=4){okFor=0;setTier(P.tier+1);}}
      else okFor=0;
    }
  }
}
requestAnimationFrame(watch);

/* ---------- quality button in the camera panel ---------- */
var btn=null;
function btnLabel(){if(btn)btn.textContent='Quality: '+(P.mode==='auto'?'Auto ('+TIERS[P.tier].name+')':TIERS[P.tier].name);}
function addBtn(){
  var nav=document.getElementById('nav');if(!nav||btn)return;
  btn=document.createElement('button');
  btn.onclick=function(){
    if(P.mode==='auto')setTier(0,true);
    else if(P.tier<2)setTier(P.tier+1,true);
    else{P.mode='auto';lsSet('auto');setTier(small?0:1);}
  };
  nav.appendChild(btn);btnLabel();
}
addBtn();

/* ---------- on-demand loading of the stall mini-games ---------- */
var loading=false,loaded=!!window.mfbMG;
function loadJS(src,cb){var s=document.createElement('script');s.src=src;s.onload=cb;s.onerror=cb;document.head.appendChild(s);}
function ensureMini(cb){
  if(loaded){cb&&cb();return;}
  if(loading)return;loading=true;
  var q=['mini.js?v=2','games.js?v=1','pixel.js?v=1','art.js?v=1','action.js?v=2','shift.js?v=2'];(function nx(){if(!q.length){loaded=true;loading=false;cb&&cb();return;}loadJS(q.shift(),nx);})();
}
P.ensureMini=ensureMini;
var osp=window.openSP;
if(typeof osp==='function'){
  window.openSP=function(o){
    var r=osp.apply(this,arguments);
    if(!loaded&&!loading)ensureMini(function(){try{osp.call(window,o);}catch(e){}});
    return r;
  };
}

setTier(P.tier);
})();
