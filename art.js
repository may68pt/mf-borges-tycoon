/* art.js - shared pixel-art toolkit for the stall mini-games: drawing helpers on a 160x100 grid (each grid cell = 2 canvas pixels),
   little hand-built sprites (scooter, runner, basket, cone, cat, bin, rock, cactus, crate, tree, lamp, coin, fish, dartboard),
   and a particle / floating text / screen shake engine. Loaded before action.js. */
(function(){
'use strict';
if(window.mfbArt)return;
var A=window.mfbArt={};
function hex(h){var n=parseInt(String(h).replace('#',''),16);return [n>>16&255,n>>8&255,n&255];}
A.shade=function(h,k){var c=hex(h);return 'rgb('+c.map(function(v){return Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));}).join(',')+')';};
/* a rectangle on the 160x100 grid */
var px=A.px=function(g,x,y,w,h,c){if(w<=0||h<=0)return;g.fillStyle=c;g.fillRect(Math.round(x)*2,Math.round(y)*2,Math.max(1,Math.round(w))*2,Math.max(1,Math.round(h))*2);};
var blk=A.blk=function(g,x,y,w,h,c,o){px(g,x-1,y-1,w+2,h+2,o||'#16162a');px(g,x,y,w,h,c);if(h>2)px(g,x,y,w,1,A.shade(c,.3));};
/* a filled disc made of grid rows (chunky, no anti-aliasing) */
A.disc=function(g,cx,cy,r,c){for(var dy=-r;dy<=r;dy++){var hw=Math.floor(Math.sqrt(r*r-dy*dy)+.5);px(g,cx-hw,cy+dy,hw*2+1,1,c);}};
A.txt=function(g,s,x,y,sz,col,out){g.font='bold '+(sz||14)+'px monospace';g.textAlign='center';g.textBaseline='middle';if(out){g.lineWidth=3;g.strokeStyle=out;g.strokeText(s,x,y);}g.fillStyle=col||'#fff';g.fillText(s,x,y);};
A.emo=function(g,s,x,y,sz,rot){g.save();g.translate(x,y);if(rot)g.rotate(rot);g.font=(sz||24)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.fillText(s,0,0);g.restore();};

/* ---------- particles, floating text, shake ---------- */
A.Fx=function(){
  var ps=[],tx=[],f={sh:0};
  f.burst=function(x,y,n,cols,sp,grav){sp=sp||90;for(var i=0;i<n;i++){var a=Math.random()*6.283,v=(.35+Math.random())*sp;ps.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*.35,l:.45+Math.random()*.5,c:cols[i%cols.length],s:2+Math.floor(Math.random()*3),g:grav==null?260:grav});}};
  f.coin=function(x,y){ps.push({x:x,y:y,vx:(Math.random()-.5)*60,vy:-150,l:.8,c:'#ffd166',s:5,g:380});};
  f.text=function(x,y,s,c,big){tx.push({x:x,y:y,s:s,c:c||'#fff',l:1,big:!!big});};
  f.shake=function(a){f.sh=Math.max(f.sh,a);};
  f.up=function(dt){
    for(var i=ps.length-1;i>=0;i--){var p=ps[i];p.l-=dt;if(p.l<=0){ps.splice(i,1);continue;}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
    for(var j=tx.length-1;j>=0;j--){var t=tx[j];t.l-=dt*(t.big?.6:.9);t.y-=dt*(t.big?26:34);if(t.l<=0)tx.splice(j,1);}
    f.sh=Math.max(0,f.sh-dt*1.6);
  };
  f.begin=function(g){g.save();if(f.sh>0.01)g.translate(Math.round((Math.random()-.5)*f.sh*12),Math.round((Math.random()-.5)*f.sh*12));};
  f.end=function(g){
    for(var i=0;i<ps.length;i++){var p=ps[i];g.globalAlpha=Math.max(0,Math.min(1,p.l*2));g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s);}
    g.globalAlpha=1;
    for(var j=0;j<tx.length;j++){var t=tx[j];g.globalAlpha=Math.max(0,Math.min(1,t.l*1.6));var sc=t.big?(t.l>.8?1+(t.l-.8)*2.5:1):1;A.txt(g,t.s,t.x,t.y,Math.round((t.big?20:14)*sc),t.c,'#10101c');}
    g.globalAlpha=1;g.restore();
  };
  f.clear=function(){ps.length=0;tx.length=0;f.sh=0;};
  return f;
};

/* ---------- sprites (x = centre, y = bottom, all on the grid) ---------- */
A.scooter=function(g,x,y,lean,t,cargo){
  lean=Math.max(-1,Math.min(1,lean||0));var lx=Math.round(lean*1.5);
  var tread=Math.floor((t||0)*14)%2;
  px(g,x-2+lx*0,y-12,4,12,'#15151f');px(g,x-1,y-11+tread,2,1,'#3a3a4a');px(g,x-1,y-7+tread,2,1,'#3a3a4a');px(g,x-1,y-3+tread,2,1,'#3a3a4a');    // rear wheel
  blk(g,x-5,y-13,10,6,'#e5442f');px(g,x-4,y-12,8,1,'#ff8a73');px(g,x-6,y-8,1,2,'#ffd166');px(g,x+5,y-8,1,2,'#ffd166');                       // body + lights
  if(cargo)blk(g,x-4+Math.round(lx*.5),y-19,8,6,'#d9a441');                                                                                       // delivery box
  blk(g,x-3+lx,y-24,6,8,'#2f6db5');px(g,x-3+lx,y-24,6,1,'#6fa4e8');                                                                                // jacket
  px(g,x-5+lx,y-23,2,5,'#2f6db5');px(g,x+3+lx,y-23,2,5,'#2f6db5');                                                                                // arms
  blk(g,x-3+lx*2,y-30,6,6,'#ffd166');px(g,x-2+lx*2,y-29,4,1,'#fff3b0');px(g,x-3+lx*2,y-26,6,1,'#c9962a');                                          // helmet
};
A.runner=function(g,x,y,fr,air,col){
  col=col||'#e5442f';var a=air>1,f=fr%2;
  blk(g,x-2,y-18,5,5,'#f0c9a0');px(g,x-2,y-18,5,2,'#3b2a1a');px(g,x+1,y-16,1,1,'#16162a');            // head
  blk(g,x-2,y-13,5,6,col);px(g,x-2,y-9,5,1,A.shade(col,-.3));                                         // shirt
  if(a){px(g,x-3,y-7,3,3,'#2a2f6b');px(g,x+1,y-7,4,2,'#2a2f6b');px(g,x-3,y-4,2,1,'#fff');px(g,x+3,y-5,2,1,'#fff');px(g,x+2,y-12,5,2,'#f0c9a0');px(g,x-5,y-12,3,2,'#f0c9a0');}
  else if(f===0){px(g,x-2,y-7,2,7,'#2a2f6b');px(g,x+1,y-7,2,4,'#2a2f6b');px(g,x+1,y-3,3,1,'#2a2f6b');px(g,x-3,y-1,3,1,'#fff');px(g,x+2,y-2,3,1,'#fff');px(g,x+2,y-11,4,2,'#f0c9a0');px(g,x-4,y-10,3,2,'#f0c9a0');}
  else{px(g,x+1,y-7,2,7,'#2a2f6b');px(g,x-2,y-7,2,4,'#2a2f6b');px(g,x-3,y-3,3,1,'#2a2f6b');px(g,x+1,y-1,3,1,'#fff');px(g,x-4,y-2,3,1,'#fff');px(g,x-4,y-11,4,2,'#f0c9a0');px(g,x+2,y-10,3,2,'#f0c9a0');}
};
A.basket=function(g,x,y,sq,bad){
  sq=sq||0;var w=Math.round(20*(1+sq*.2)),h=Math.round(10*(1-sq*.3));
  px(g,x-8,y-h-6,1,7,'#7a4c26');px(g,x+8,y-h-6,1,7,'#7a4c26');px(g,x-8,y-h-7,17,1,'#7a4c26');                    // handle
  blk(g,x-w/2,y-h,w,h,bad?'#c0392b':'#c88a4a');
  for(var i=0;i<h;i+=2)px(g,x-w/2,y-h+i,w,1,bad?'#8e2b20':'#9a6531');
  for(var j=0;j<w;j+=4)px(g,x-w/2+j,y-h,1,h,bad?'#8e2b20':'#9a6531');
  px(g,x-w/2-1,y-h-1,w+2,2,bad?'#e2685c':'#e0b070');
};
A.cone=function(g,x,y){blk(g,x-4,y-2,8,2,'#2a2a38');px(g,x-3,y-5,6,3,'#ff7a1a');px(g,x-3,y-4,6,1,'#fff');px(g,x-2,y-8,4,3,'#ff7a1a');px(g,x-1,y-10,2,2,'#ff7a1a');};
A.cat=function(g,x,y,t){blk(g,x-4,y-7,8,7,'#8a8a99');px(g,x-4,y-10,2,3,'#8a8a99');px(g,x+2,y-10,2,3,'#8a8a99');blk(g,x-3,y-11,6,4,'#9d9dac');px(g,x-2,y-9,1,1,'#ffd166');px(g,x+1,y-9,1,1,'#ffd166');px(g,x+4+Math.round(Math.sin((t||0)*8)),y-6,2,4,'#8a8a99');};
A.bin=function(g,x,y){blk(g,x-3,y-9,7,9,'#6b7a86');px(g,x-4,y-11,9,2,'#8a99a6');px(g,x-2,y-8,1,6,'#4f5b65');px(g,x+1,y-8,1,6,'#4f5b65');};
A.rock=function(g,x,y){blk(g,x-4,y-5,8,5,'#8c8c96');px(g,x-3,y-7,6,2,'#a2a2ad');px(g,x-1,y-8,3,1,'#b8b8c2');px(g,x+1,y-3,2,2,'#6e6e78');};
A.cactus=function(g,x,y){blk(g,x-1,y-12,3,12,'#3fa65a');blk(g,x-5,y-8,3,2,'#3fa65a');blk(g,x-5,y-11,2,4,'#3fa65a');blk(g,x+3,y-9,3,2,'#3fa65a');blk(g,x+5,y-12,2,4,'#3fa65a');px(g,x,y-11,1,9,'#6fe08a');};
A.crate=function(g,x,y){blk(g,x-5,y-9,10,9,'#b07a3c');px(g,x-5,y-5,10,1,'#7a4c26');px(g,x-1,y-9,1,9,'#7a4c26');px(g,x-4,y-8,1,1,'#e0b070');};
A.tree=function(g,x,y){px(g,x-1,y-3,3,6,'#6a4c30');A.disc(g,x,y-7,6,'#2f8a4a');A.disc(g,x-2,y-9,4,'#43b062');px(g,x+1,y-6,3,2,'#236b39');};
A.lamp=function(g,x,y){px(g,x,y-14,1,14,'#2a2a38');px(g,x-3,y-15,5,2,'#2a2a38');px(g,x-4,y-14,3,2,'#ffe9a0');px(g,x-5,y-13,5,5,'rgba(255,233,160,.25)');};
A.coin=function(g,x,y,spin){var w=Math.max(1,Math.round(Math.abs(Math.cos(spin||0))*5));px(g,x-w/2-1,y-3,w+2,7,'#16162a');px(g,x-w/2,y-2,w,5,'#ffd166');if(w>2){px(g,x-w/2+1,y-1,1,3,'#fff3b0');}};
A.star=function(g,x,y,r,c){c=c||'#ffd166';px(g,x,y-r,1,r*2+1,c);px(g,x-r,y,r*2+1,1,c);if(r>2){px(g,x-1,y-1,3,3,c);}};
A.fish=function(g,x,y,dir,t,col){col=col||'#ff8a3d';var d=dir<0?-1:1,w=Math.round(Math.sin((t||0)*14)*1.5);
  blk(g,x-5,y-3,10,6,col);px(g,x-4,y-2,8,1,A.shade(col,.35));px(g,x-4,y+1,8,1,A.shade(col,-.25));
  px(g,x-d*7+(d<0?-1:0),y-3+w,3,2,col);px(g,x-d*8,y-1,3,3,col);px(g,x-d*7,y+1-w,3,2,col);                       // tail
  px(g,x+d*3,y-2,2,2,'#fff');px(g,x+d*4,y-1,1,1,'#16162a');px(g,x-1,y-4,3,1,A.shade(col,-.3));                   // eye, fin
};
A.board=function(g,x,y,r,wob){var cs=['#16162a','#e5442f','#f4efe0','#2f6db5','#f4efe0','#ffd166'];
  for(var i=0;i<cs.length;i++){var rr=Math.max(1,Math.round(r*(1-i*.17)));A.disc(g,x+(wob?Math.round(Math.sin(wob*30)*wob*2):0),y,rr,cs[i]);}
};
/* a striped shop awning across the top (grid x 0..160) */
A.awning=function(g,y,h,c1,c2){for(var i=0;i<16;i++)px(g,i*10,y,10,h,i%2?c2:c1);for(var j=0;j<16;j++){px(g,j*10,y+h,10,2,j%2?c2:c1);px(g,j*10+2,y+h+2,6,1,j%2?c2:c1);}px(g,0,y,160,1,'rgba(255,255,255,.25)');};
A.sky=function(g,c1,c2,h){var n=8;for(var i=0;i<n;i++){var k=i/(n-1),a=hex(c1),b=hex(c2);px(g,0,i*h/n,160,Math.ceil(h/n)+1,'rgb('+Math.round(a[0]+(b[0]-a[0])*k)+','+Math.round(a[1]+(b[1]-a[1])*k)+','+Math.round(a[2]+(b[2]-a[2])*k)+')');}};
})();
