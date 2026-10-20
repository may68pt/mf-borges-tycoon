/* pause.js - pause freezes the whole world (walking, idle head turns, band, lights, every animation that runs from the frame clock).
   The camera still follows your finger. The speed button cycles 1x > 2x > 4x > pause, and the keyboard space bar toggles pause.
   S is read live every frame (the game replaces its state object when a save loads). */
(function(){
'use strict';
if(window.__pz)return;window.__pz=1;
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var orig=window.frame;if(typeof orig!=='function')return;
var getS=g('(function(){return S;})'),VW=g('VW'),Pp=g('Pp');if(typeof getS!=='function'||!VW)return;
var off=0,lastReal=0;
window.frame=function(now){
  var d=lastReal?Math.min(250,now-lastReal):0;lastReal=now;
  var S=getS();
  if(S&&!S.over&&S.speed===0){
    off+=d;var dt=Math.min(.1,d/1e3);
    try{VW.az+=(VW.azT-VW.az)*Math.min(1,dt*8);VW.el+=(VW.elT-VW.el)*Math.min(1,dt*8);if(VW.follow&&Pp){VW.tx+=(Pp.x-VW.tx)*Math.min(1,dt*6);VW.tz+=(Pp.z-VW.tz)*Math.min(1,dt*6);}}catch(e){}
  }
  return orig(now-off);
};
/* a clearer speed button: 1x > 2x > 4x > pause > 1x */
function fixBtn(){var b=document.getElementById('spd');if(!b)return false;
  b.onclick=function(){var S=getS(),order=[1,2,4,0],i=order.indexOf(S.speed),n=order[(i+1)%order.length],v=document.getElementById('v'+n);if(v)v.click();else{S.speed=n;}};
  return true;}
if(!fixBtn()){var tries=0,iv=setInterval(function(){if(fixBtn()||++tries>40)clearInterval(iv);},250);}
})();
