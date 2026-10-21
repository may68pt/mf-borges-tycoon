/* hudicons.js - chunky cartoon pixel-art icons for the header tiles.
   Each icon is a 16x16 fill map. The script adds a dark outline around the shape and shades it automatically: light along the top, dark along the bottom and right.
   Lowercase letters get shaded, uppercase letters are flat details. Tiles ask for an icon with <i data-ic="name">.
   The day tile swaps between sun, sunset and moon with the phase of the day. Loaded after career.js. */
(function(){
'use strict';
if(window.mfbHudIcons)return;
var PAL={y:'#ffcf3a',o:'#ff8a1f',r:'#e8402e',g:'#4cbf56',b:'#3a8dff',v:'#9b5cff',p:'#f4efe4',n:'#c07a3e',s:'#efe2bf',d:'#c9b07a',m:'#ffe58a',t:'#4fd1e8',
  K:'#1a1426',Y:'#fff6c2',W:'#ffffff',G:'#9aa3b5',N:'#8a5226',P:'#6b3d1f',R:'#e8402e',C:'#22b35e',Q:'#ff8fb0',O:'#ff8a1f',B:'#2a2f6a'};
var LINE='#1a1426';
var IC={
star:[
'................',
'.......yy.......',
'.......yy.......',
'......yyyy......',
'......yyyy......',
'.yyyyyyyyyyyyyy.',
'..yyyyyyyyyyyy..',
'...yyyKyyKyyy...',
'....yyKyyKyy....',
'....yQyKKyQy....',
'...yyyyyyyyyy...',
'...yyyy..yyyy...',
'..yyyy....yyyy..',
'..yyy......yyy..',
'..yy........yy..',
'................'],
sun:[
'................',
'.......oo.......',
'..oo...oo...oo..',
'..oo.......oo...',
'......yyyy......',
'.....yyyyyy.....',
'....yyKyyKyy....',
'.oo.yyKyyKyy.oo.',
'.oo.yQyyyyQy.oo.',
'....yyKyyKyy....',
'.....yyKKyy.....',
'......yyyy......',
'..oo.......oo...',
'..oo...oo...oo..',
'.......oo.......',
'................'],
dusk:[
'................',
'................',
'................',
'......oooo......',
'....oooooooo....',
'...ooKooooKoo...',
'...ooKooooKoo...',
'..ooQooooooQoo..',
'..oooKKKKKKooo..',
'................',
'.bbbbbbbbbbbbbb.',
'................',
'...bbbbbbbbbb...',
'................',
'.....bbbbbb.....',
'................'],
moon:[
'................',
'......mmmm......',
'....mmmmm.......',
'...mmmm......W..',
'..mmmm......WWW.',
'..mmmm.......W..',
'.mmmmm..........',
'.mmKmm..........',
'.mmmmm......W...',
'.mmmmmm.........',
'..mmmmmm........',
'..mmmmmmmm......',
'...mmmmmmmmmm...',
'.....mmmmmmmm...',
'.......mmmm.....',
'................'],
cash:[
'................',
'......nnnn......',
'.......nn.......',
'......gggg......',
'.....gggYgg.....',
'....gggYYYgg....',
'...ggggYggggg...',
'...ggggYYYggg...',
'...ggggggYggg...',
'...ggggYYYggg...',
'...gggggYgggg...',
'...gggggggggg...',
'...gggggggggg...',
'....gggggggg....',
'................',
'................'],
review:[
'................',
'......GGGG......',
'....nnGGGGnn....',
'...nnppppppnn...',
'...nppppppppn...',
'...npBBBBpppn...',
'...nppppppppn...',
'...npBBBBBBpn...',
'...nppppppppn...',
'...npBBBpppCn...',
'...nppppppCCn...',
'...npCpppCCpn...',
'...npCCpCCppn...',
'...nppCCCpppn...',
'...nnnnnnnnnn...',
'................'],
culture:[
'................',
'..vvvvv.........',
'.vvvvvvv........',
'.vKvvvKv........',
'.vvvvvvv........',
'.vvKKKvv........',
'.vKvvvKv.yyyyy..',
'..vvvvv.yyyyyyy.',
'...vvv..yKyyyKy.',
'.......yyyyyyyy.',
'.......yKyyyyKy.',
'.......yyKKKKyy.',
'........yyyyyy..',
'.........yyyy...',
'................',
'................'],
hype:[
'................',
'.......r........',
'......rr........',
'......rrr...r...',
'.....rrrr..rr...',
'.....rrrrr.rr...',
'....rrrorrrrrr..',
'....rrooorrrrr..',
'...rrroooorrrr..',
'...rrooyyoorrr..',
'...rrooKyKoorr..',
'...rroyyyyyorr..',
'...rrooyKKyorr..',
'....rrooyyoor...',
'.....rrrrrrr....',
'................'],
heritage:[
'................',
'.......ss.......',
'.....ssssss.....',
'...ssssRRssss...',
'.ssssssssssssss.',
'.dddddddddddddd.',
'..ss.ss..ss.ss..',
'..ss.ss..ss.ss..',
'..ss.ss..ss.ss..',
'..ss.ss..ss.ss..',
'..ss.ss..ss.ss..',
'.dddddddddddddd.',
'.dddddddddddddd.',
'................',
'................',
'................'],
level:[
'................',
'..rrr.....bbb...',
'...rrr...bbb....',
'....rrr.bbb.....',
'.....rrrbbb.....',
'......rrbb......',
'......yyyy......',
'.....yyyyyy.....',
'....yyyOOyyy....',
'....yyOOOOyy....',
'....yyyOOyyy....',
'....yyOyyOyy....',
'.....yyyyyy.....',
'......yyyy......',
'................',
'................'],
stalls:[
'................',
'...rrpprrpprr...',
'..rrpprrpprrpp..',
'.rrpprrpprrpprr.',
'.rrpprrpprrpprr.',
'.rr.pp.rr.pp.rr.',
'..P..........P..',
'..P..gg..oo..P..',
'..P.ggg.yyooo.P.',
'.nnnnnnnnnnnnnn.',
'.NNNNNNNNNNNNNN.',
'.nn..........nn.',
'.nn..........nn.',
'................',
'................',
'................']
};
function hex(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];}
function mix(h,k){var c=hex(h);return 'rgb('+c.map(function(v){return Math.round(k<0?v*(1+k):v+(255-v)*k);}).join(',')+')';}
var cache={};
function draw(name){
  if(cache[name])return cache[name];var m=IC[name];if(!m)return '';
  var N=16,cv=document.createElement('canvas');cv.width=cv.height=N;var g=cv.getContext('2d');
  function at(x,y){if(x<0||y<0||x>=N||y>=N)return '.';var r=m[y]||'';return r.charAt(x)||'.';}
  function on(x,y){return at(x,y)!=='.';}
  for(var y=0;y<N;y++)for(var x=0;x<N;x++){var ch=at(x,y);
    if(ch==='.'){if(on(x-1,y)||on(x+1,y)||on(x,y-1)||on(x,y+1)){g.fillStyle=LINE;g.fillRect(x,y,1,1);}continue;}
    var col=PAL[ch]||'#ff00ff',f=col;
    if(ch>='a'&&ch<='z'){
      if(!on(x,y-1))f=mix(col,.42);
      else if(!on(x,y+1)||!on(x+1,y))f=mix(col,-.26);
      else if(!on(x-1,y)||!on(x,y-2))f=mix(col,.2);
    }
    g.fillStyle=f;g.fillRect(x,y,1,1);}
  return cache[name]=cv.toDataURL();
}
function img(name){return '<img class="pxi" alt="" draggable="false" src="'+draw(name)+'">';}
var css=document.createElement('style');css.textContent=[
'body.u2 #hud>.ht i[data-ic]{font-size:0!important;line-height:0;filter:drop-shadow(0 2px 0 rgba(0,0,0,.55))}',
'body.u2 #hud>.ht i[data-ic] img.pxi{width:32px;height:32px;image-rendering:pixelated;image-rendering:crisp-edges;display:block}',
'body.u2 #hud>.ht{min-height:64px}',
'body.u2 #hud>.ht small{margin-top:2px}',
'body.u2 #hud>.ht:active i[data-ic]{transform:scale(.9)}',
'body.u2 #hud>#hst-t i[data-ic]{animation:cstar 3s ease-in-out infinite}',
'body.u2 #hud>.ht i[data-ic].bump{animation:pxbump .45s cubic-bezier(.3,1.6,.5,1)}@keyframes pxbump{40%{transform:scale(1.3) rotate(-6deg)}}',
'@media (prefers-reduced-motion:reduce){body.u2 #hud>.ht i[data-ic]{animation:none!important}}',
/* no wrap: just icon, tiny label and value, with an outline so they read over the scene */
'body.u2 #hud>.ht,body.u2 #hud>#spd{background:none!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;min-height:0!important;padding:2px 0!important;overflow:visible!important}',
'body.u2 #hud>.ht .bar,body.u2 #hud>.ht .pips{display:none!important}',
'body.u2 #hud>.ht i[data-ic]{filter:drop-shadow(0 2px 0 rgba(0,0,0,.6)) drop-shadow(0 0 3px rgba(0,0,0,.35))}',
'body.u2 #hud>.ht small{color:#fff!important;opacity:.95;text-shadow:-1px -1px 0 #1a1426,1px -1px 0 #1a1426,-1px 1px 0 #1a1426,1px 1px 0 #1a1426,0 2px 0 #1a1426}',
'body.u2 #hud>.ht b.v,body.u2 #hud>#spd{color:#fff;text-shadow:-1.5px -1.5px 0 #1a1426,1.5px -1.5px 0 #1a1426,-1.5px 1.5px 0 #1a1426,1.5px 1.5px 0 #1a1426,0 2.5px 0 #1a1426}',
'body.u2 #hud>.ht small{color:color-mix(in srgb,var(--hc) 45%,#fff)!important}',
'body.u2 #hud>#spd{font-size:22px!important}body.u2 #hud>#spd.on{color:#ffd166}'
].join('\n');document.head.appendChild(css);
function paint(){var l=document.querySelectorAll('#hud i[data-ic]');for(var i=0;i<l.length;i++){var e=l[i],n=e.getAttribute('data-ic');if(e.__ic!==n){e.__ic=n;e.innerHTML=img(n);}}}
/* the day tile follows the clock: sun, then sunset at closing time, then moon */
var last={};
function tick(){
  try{var d=document.getElementById('hdi');if(d&&window.S){var ph=S.ph,n=ph==='night'||ph==='end'?'moon':ph==='changeover'?'dusk':'sun';if(d.getAttribute('data-ic')!==n){d.setAttribute('data-ic',n);}}
    paint();
    /* a little bounce when a stat goes up */
    if(window.S){[['cul',Math.round(S.cul)],['hyp',Math.round(S.hyp)],['her',Math.round(S.her)],['lv',S.lv],['hst',S.star]].forEach(function(p){
      if(last[p[0]]!=null&&p[1]>last[p[0]]){var t=document.getElementById(p[0]);t=t&&t.closest('.ht');var ic=t&&t.querySelector('i[data-ic]');if(ic){ic.classList.remove('bump');void ic.offsetWidth;ic.classList.add('bump');}}
      last[p[0]]=p[1];});}
  }catch(e){}
}
var _ui=window.ui;
if(typeof _ui==='function')window.ui=ui=function(){var r=_ui.apply(this,arguments);tick();return r;};
window.mfbHudIcons={draw:draw,IC:IC};
paint();tick();
})();
