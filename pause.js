/* pause.js - when the game is paused (speed 0) the whole world freezes: walking, idle head turns, band, lights and every animation
   that runs from the frame clock. The camera still follows your finger. Wraps the game's frame() so it gets a clock that stops while paused. */
(function(){
'use strict';
if(window.__pz)return;window.__pz=1;
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var orig=window.frame;if(typeof orig!=='function')return;
var S=g('S'),VW=g('VW'),Pp=g('Pp');if(!S||!VW)return;
var off=0,lastReal=0;
window.frame=function(now){
  var d=lastReal?Math.min(250,now-lastReal):0;lastReal=now;
  if(!S.over&&S.speed===0){
    off+=d;var dt=Math.min(.1,d/1e3);
    try{VW.az+=(VW.azT-VW.az)*Math.min(1,dt*8);VW.el+=(VW.elT-VW.el)*Math.min(1,dt*8);if(VW.follow&&Pp){VW.tx+=(Pp.x-VW.tx)*Math.min(1,dt*6);VW.tz+=(Pp.z-VW.tz)*Math.min(1,dt*6);}}catch(e){}
  }
  return orig(now-off);
};
})();
