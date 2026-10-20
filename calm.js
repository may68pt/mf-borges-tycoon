/* calm.js - quieter interface: fewer, smaller, gentler toasts; softer popups; a lighter HUD with an "Everything / Essentials" switch. */
(function(){
'use strict';
if(window.mfbCalm)return;window.mfbCalm=1;
var KEY='mfb_calm';
function lsGet(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function lsSet(v){try{localStorage.setItem(KEY,v);}catch(e){}}

/* ---------- styles ---------- */
var css=[
/* toasts: small single line, no blur, slow fade, tap to dismiss */
'#toasts{gap:4px}',
'#toasts .tn{width:auto;max-width:min(92vw,340px);padding:4px 10px 4px 6px;border-width:1px;border-radius:10px;background:rgba(14,16,30,.86);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none;opacity:.96;transition:opacity .6s ease,transform .3s ease;animation:calmin .35s ease both}',
'#toasts .tn .ti{width:24px;height:24px;border-radius:7px;font-size:13px}',
'#toasts .tn .tx small,#toasts .tn .tc{display:none}',
'#toasts .tn .mm{font:600 11px/1.3 system-ui,sans-serif}',
'#toasts .tn.out{opacity:0;transform:translateY(-4px)}',
'@keyframes calmin{from{opacity:0;transform:translateY(-6px)}to{opacity:.96;transform:none}}',
/* popups and sheets: soft fade, lighter backdrop, calmer edges */
'body.u2 #nr,body.u2 #end,body.u2 #acm{background:rgba(6,8,16,.5);animation:calmfade .25s ease both}',
'body.u2 #nr>div,body.u2 #end>div,body.u2 #acm>div{box-shadow:0 10px 30px rgba(0,0,0,.35);animation:calmup .28s ease both}',
'body.u2 #spn{animation:calmup .22s ease both;box-shadow:0 -6px 24px rgba(0,0,0,.3)}',
'@keyframes calmfade{from{opacity:0}to{opacity:1}}@keyframes calmup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',
'@media (prefers-reduced-motion:reduce){#toasts .tn,body.u2 #nr,body.u2 #nr>div,body.u2 #spn{animation:none}}',
/* essentials mode: hide the secondary HUD readouts and helper text */
'body.calm #hud .bar,body.calm #lims{display:none}',
'body.calm #tg>p.m{display:none}',
'#calmtog{margin-left:4px}',
/* the speed button in the top bar must receive taps on phones */
'body.u2 #spd{pointer-events:auto;cursor:pointer}',
/* night report and stall panel: headline first, details on request */
'body.calm #nr .tl,body.calm #nr .tl *{animation:none!important}',
'body.calm #nr .tl{opacity:1;transform:none}',
'body.calm #spn .bio,body.calm #spn .chips{display:none}'
].join('\n');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---------- toasts: dedupe, rate-limit, important ones go first ---------- */
var base=window.toast,recent={},lastShow=0,queue=[],busy=false;
var KEEP=/LEVEL|Unlocked|Night report|BANKRUPT|Achievement|goal|closing/i;
function show(m,i){
  var r=base.apply(window,[m,i]);
  var tw=document.getElementById('toasts');
  if(tw&&tw.lastChild){var e=tw.lastChild;e.addEventListener('click',function(){e.classList.add('out');setTimeout(function(){e.remove();},400);});
    setTimeout(function(){if(e.parentNode){e.classList.add('out');setTimeout(function(){e.remove();},450);}},3300);}
  while(tw&&tw.children.length>2)tw.firstChild.remove();
  return r;
}
function pump(){
  busy=false;if(!queue.length)return;
  var q=queue.shift();lastShow=Date.now();show(q[0],q[1]);
  if(queue.length){busy=true;setTimeout(pump,1500);}
}
if(typeof base==='function'){
  window.toast=function(m,i){
    var key=(i||'')+String(m),n=Date.now();
    if(recent[key]&&n-recent[key]<10000)return;recent[key]=n;
    if(KEEP.test(String(m))){show(m,i);lastShow=n;return;}
    if(!busy&&n-lastShow>1500){lastShow=n;show(m,i);return;}
    if(queue.length<2)queue.push([m,i]);   // never pile up more than two waiting
    if(!busy){busy=true;setTimeout(pump,Math.max(300,1500-(n-lastShow)));}
  };
}

/* ---------- Essentials / Everything switch ---------- */
function apply(on){document.body.classList.toggle('calm',on);var b=document.getElementById('calmtog');if(b)b.textContent=on?'Info: Essentials':'Info: Everything';}
var on=lsGet()!=='0';           // essentials by default
apply(on);
var nav=document.getElementById('nav');
if(nav){var b=document.createElement('button');b.id='calmtog';b.onclick=function(){on=!on;lsSet(on?'1':'0');apply(on);};nav.appendChild(b);apply(on);}

/* night report: details are always shown (no switch) */
})();
