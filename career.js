/* career.js - the long game.
   Career mode (default): the game no longer ends on day 14. Every 14 days the city assesses the venue and moves its star rating (1-10) up or down.
   The stars change the rules: stall permits, footfall, a daily city grant or levy, press buzz, and which acts you may book. 1 star = concession revoked.
   Week planner: book both rooms up to 7 nights ahead (Night tab); each morning the plan is applied.
   Header: game-style stat tiles (big icon, tiny label, value), a star-rating tile and a review countdown (tap either for your standing).
   Classic 14-day mode stays available in Settings. Loaded after the game script and the other plug-ins. */
(function(){
'use strict';
if(window.mfbCareer)return;
var C=window.mfbCareer={};
var PERIOD=14,DOW=['Tue','Wed','Thu','Fri','Sat','Sun','Mon'];
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];});}
function eu(v){return (v<0?'-':'')+'€'+Math.abs(Math.round(v)).toLocaleString('en-GB');}
function snd(n){try{sfx(n);}catch(e){}}

/* ---------- star tiers ---------- */
var STARS=[null,
 {n:'Revoked',c:'#7a1414',slots:0,foot:1,cash:0,cap:9,hyp:0,cul:0,d:['Concession revoked: game over']},
 {n:'Crisis',c:'#e5442f',slots:-3,foot:.8,cash:-300,cap:1,hyp:0,cul:0,d:['−3 stall permits','Footfall −20%','City levy −€300 a day','Only Local & Regional acts']},
 {n:'Warning',c:'#f08a3c',slots:-1,foot:.92,cash:-100,cap:2,hyp:0,cul:0,d:['−1 stall permit','Footfall −8%','City levy −€100 a day','No Headliners or international names']},
 {n:'Steady',c:'#9aa0b8',slots:0,foot:1,cash:0,cap:9,hyp:0,cul:0,d:['No bonus, no penalty']},
 {n:'Good',c:'#2fbf71',slots:1,foot:1.04,cash:50,cap:9,hyp:0,cul:0,d:['+1 stall permit','Footfall +4%','City grant +€50 a day']},
 {n:'Very good',c:'#2fbf71',slots:1,foot:1.08,cash:100,cap:9,hyp:0,cul:0,d:['+1 stall permit','Footfall +8%','City grant +€100 a day']},
 {n:'Great',c:'#35b6ff',slots:2,foot:1.12,cash:150,cap:9,hyp:.5,cul:0,d:['+2 stall permits','Footfall +12%','City grant +€150 a day','Press buzz: +0.5 hype a day']},
 {n:'Excellent',c:'#35b6ff',slots:2,foot:1.16,cash:220,cap:9,hyp:.5,cul:0,d:['+2 stall permits','Footfall +16%','City grant +€220 a day','Press buzz: +0.5 hype a day']},
 {n:'Outstanding',c:'#b36bff',slots:3,foot:1.2,cash:300,cap:9,hyp:.5,cul:.5,d:['+3 stall permits','Footfall +20%','City grant +€300 a day','Press buzz: +0.5 hype a day','Culture award: +0.5 culture a day']},
 {n:'City landmark',c:'#ffd166',slots:4,foot:1.25,cash:400,cap:9,hyp:1,cul:1,d:['+4 stall permits','Footfall +25%','City grant +€400 a day','Press buzz: +1 hype a day','Culture award: +1 culture a day']}];
function career(){return S&&S.mode!=='classic';}
function tier(){return STARS[career()?Math.max(1,Math.min(10,S.star||5)):4];}
C.tier=tier;C.STARS=STARS;
C.slots=function(){try{return career()?tier().slots:0;}catch(e){return 0;}};
function snapP(){return {d0:S.day,cash0:S.cash,days:0,nights:0,sales:0,earn:0};}
function ensure(){
  if(!S)return;
  if(!S.mode)S.mode=(SET.mode==='classic'?'classic':'career');
  if(!S.star)S.star=5;
  if(!S.sched||typeof S.sched!=='object'||Array.isArray(S.sched))S.sched={};
  if(!Array.isArray(S.asr))S.asr=[];
  if(!S.rp||typeof S.rp!=='object')S.rp=snapP();
}
C.left=function(){ensure();return career()?Math.max(0,S.rp.d0+PERIOD-S.day):Math.max(0,DAYS+1-S.day);};
C.ensure=ensure;

/* ---------- the assessment score ---------- */
function step(v,lims){var p=-2;for(var i=0;i<lims.length;i++)if(v>=lims[i])p++;return p;}
function scoreNow(){
  ensure();var rp=S.rp,days=Math.max(1,rp.days),dc=S.cash-rp.cash0,nr=rp.days?rp.nights/rp.days:0,sd=rp.sales/days;
  var rows=[
    ['🎭','Culture',Math.round(S.cul),step(S.cul,[20,30,50,70])],
    ['🔥','Hype',Math.round(S.hyp),step(S.hyp,[20,30,50,70])],
    ['🏛','Heritage',Math.round(S.her),step(S.her,[30,50,65,80])],
    ['💶','Cash this period',(dc>=0?'+':'')+eu(dc),step(dc,[-1500,0,1500,5000])],
    ['🎤','Nights hosted',rp.nights+' of '+rp.days,rp.days?step(nr,[.2,.4,.65,.85]):0],
    ['🛒','Market sales a day',Math.round(sd),rp.days?step(sd,[10,25,50,90]):0]];
  var sum=0;rows.forEach(function(r){sum+=r[3];});
  var exp=Math.max(0,(S.star||5)-5),total=sum-exp,delta=total<=-6?-2:total<=-2?-1:total<=2?0:total<=6?1:2;
  return {rows:rows,sum:sum,exp:exp,total:total,delta:delta};
}
C.score=scoreNow;

/* ---------- styles ---------- */
var css=[
/* the header: game-style tiles */
'body.u2 #hud{top:calc(var(--sat,0px) + 4px);left:calc(var(--sal,0px) + 6px);right:calc(var(--sar,0px) + 6px);display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;align-items:stretch}',
'body.u2 #hud>.hl,body.u2 #hud>#sp{display:none!important}',
'body.u2 #hud>.ht,body.u2 #hud>#spd{--hc:#8d93a8;position:relative;grid-column:auto!important;grid-row:auto!important;display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:0;min-width:0;min-height:58px;padding:5px 2px 4px;border-radius:13px;border:1.5px solid color-mix(in srgb,var(--hc) 60%,transparent);background:linear-gradient(180deg,color-mix(in srgb,var(--hc) 26%,rgba(14,16,30,.94)),rgba(12,14,26,.9));box-shadow:0 3px 0 rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.1);color:#fff;line-height:1.05;text-align:center;pointer-events:auto;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}',
'body.u2 #hud>.ht i,body.u2 #hud>#spd .si{font-style:normal;font-size:23px;line-height:1;filter:drop-shadow(0 2px 0 rgba(0,0,0,.55))}',
'body.u2 #hud>.ht small,body.u2 #hud>#spd small{display:block;margin-top:3px;font:800 8px/1 system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:color-mix(in srgb,var(--hc) 55%,#fff);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}',
'body.u2 #hud>.ht b.v,body.u2 #hud>#spd b{display:block;margin-top:2px;font:900 13.5px/1.05 system-ui,sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;text-shadow:0 1px 0 rgba(0,0,0,.65)}',
'body.u2 #hud>.ht .bar{display:block!important;width:78%;height:3px;margin:3px auto 0;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden}body.u2 #hud>.ht .bar u{display:block;height:100%;border-radius:2px;background:var(--hc)}',
'body.u2 #hud>.ht.tap{cursor:pointer}body.u2 #hud>.ht.tap:active,body.u2 #hud>#spd:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.45)}',
'body.u2 #hud>.ht .pips{display:flex;gap:1px;margin-top:3px}body.u2 #hud>.ht .pips i{display:block;width:4px;height:4px;border-radius:1px;background:rgba(255,255,255,.18);font-size:0;filter:none}body.u2 #hud>.ht .pips i.on{background:var(--hc);box-shadow:0 0 4px var(--hc)}',
'body.u2 #hud>#hst-t{--hc:#ffd166}body.u2 #hud>#hst-t i{animation:cstar 3s ease-in-out infinite}@keyframes cstar{0%,100%{transform:rotate(0) scale(1)}50%{transform:rotate(-8deg) scale(1.12)}}',
'body.u2 #hud>#hrv-t.soon{animation:csoon 1.1s ease-in-out infinite}@keyframes csoon{50%{box-shadow:0 0 0 2px var(--hc),0 0 14px var(--hc)}}',
'body.u2 #hud>#spd{--hc:#ff5a43;order:5;font-size:20px;font-weight:900;cursor:pointer}body.u2 #hud>#spd.on{--hc:#ffd166}',
'@media (min-width:860px),(orientation:landscape) and (max-height:540px){body.u2 #hud{max-width:560px}body.u2 #hud>.ht,body.u2 #hud>#spd{min-height:62px}}',
'@media (prefers-reduced-motion:reduce){body.u2 #hud *{animation:none!important}}',
/* week planner */
'.wk{display:flex;flex-direction:column;gap:8px;margin:4px 0 12px}',
'.wk-h{display:flex;align-items:center;gap:6px;margin:6px 2px 0;font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase}.wk-h small{font:500 11px system-ui,sans-serif;text-transform:none;letter-spacing:0;color:var(--mut);margin-left:auto}',
'.wk-row{display:grid;grid-template-columns:62px 1fr 1fr;gap:6px;align-items:stretch}',
'.wk-day{display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;background:rgba(var(--ov,10,12,28),.72);border:1px solid rgba(255,255,255,.14);color:#fff;font:800 12px system-ui,sans-serif;padding:4px 2px;text-align:center}.wk-day small{font:700 9px system-ui,sans-serif;opacity:.75;letter-spacing:.05em;text-transform:uppercase}.wk-day.today{border-color:var(--br);box-shadow:0 0 0 2px var(--br)}',
'.wk-c{position:relative;display:flex;align-items:center;gap:6px;min-height:52px;padding:6px 8px;border-radius:12px;border:2px solid var(--gc,#4a4a70);background:linear-gradient(180deg,color-mix(in srgb,var(--gc,#4a4a70) 30%,rgba(10,12,28,.9)),rgba(10,12,28,.94));color:#fff;text-align:left;font:700 12px/1.15 system-ui,sans-serif;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.35);min-width:0}',
'.wk-c .ic{font-size:24px;flex:none}.wk-c span{min-width:0;overflow:hidden}.wk-c b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wk-c small{display:block;font:600 10px system-ui,sans-serif;opacity:.8}',
'.wk-c.empty{border-style:dashed;--gc:#5a5f80;background:rgba(10,12,28,.6);color:rgba(255,255,255,.75)}.wk-c.off{opacity:.35;cursor:default;border-style:dotted}.wk-c.lock{border-color:#e5442f}.wk-c:active{transform:translateY(2px)}',
'.wk-closed{grid-column:2/4;display:flex;align-items:center;justify-content:center;border-radius:12px;border:2px dotted rgba(255,255,255,.2);color:var(--mut);font:700 12px system-ui,sans-serif;min-height:40px}',
'.wk-f{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font:700 12px system-ui,sans-serif}.wk-f .gm-chip{font-size:12px}.wk-f button{min-height:36px;border-radius:10px;font-size:11px;padding:0 10px}',
/* the act picker for a planned night */
'#wkp{position:fixed;inset:0;z-index:72;display:none;align-items:flex-end;justify-content:center;background:rgba(5,6,14,.66)}#wkp.on{display:flex}',
'#wkp>div{width:100%;max-width:560px;max-height:92dvh;display:flex;flex-direction:column;border-radius:20px 20px 0 0;border-top:3px solid var(--br);background:var(--pn);color:var(--ink);padding-bottom:env(safe-area-inset-bottom,0px);animation:sup .3s cubic-bezier(.2,.8,.2,1)}',
'#wkp .ph{flex:none;display:flex;align-items:center;gap:8px;padding:12px 12px 6px}#wkp .ph h3{flex:1;margin:0;font:700 14px Silkscreen,ui-monospace,monospace;text-transform:uppercase;letter-spacing:.05em}#wkp .ph button{width:42px;height:42px;border-radius:12px;font-size:17px;padding:0}',
'#wkp .fl{flex:none;display:flex;gap:6px;overflow-x:auto;padding:4px 12px 8px}#wkp .fl button{flex:none;min-height:38px;border-radius:999px;padding:0 12px;font:700 12px system-ui,sans-serif}#wkp .fl button.on{background:var(--ac);color:#fff;border-color:#fff}',
'#wkp .gr{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 12px 16px;display:grid;grid-template-columns:1fr 1fr;gap:10px}#wkp .gr h4{grid-column:1/-1;margin:6px 0 0;font:700 11px Silkscreen,ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase}',
'@media (min-width:860px),(orientation:landscape) and (max-height:540px){#wkp{align-items:center}#wkp>div{border-radius:18px;border:3px solid var(--br);max-width:620px}#wkp .gr{grid-template-columns:repeat(3,1fr)}}',
/* the assessment and standing sheet */
'#asr{position:fixed;inset:0;z-index:80;display:none;align-items:flex-end;justify-content:center;background:rgba(6,8,16,.66)}#asr.on{display:flex}',
'#asr>div{width:100%;max-width:520px;max-height:94dvh;overflow:auto;border-radius:20px 20px 0 0;border-top:3px solid var(--sc,#ffd166);background:var(--pn,#1b1b2f);color:var(--ink,#fff);padding:16px 16px calc(18px + env(safe-area-inset-bottom,0px));font:14px/1.4 system-ui,sans-serif;animation:sup .3s cubic-bezier(.2,.8,.2,1)}',
'@media (min-width:860px),(orientation:landscape) and (max-height:540px){#asr{align-items:center}#asr>div{border-radius:18px;border:3px solid var(--sc,#ffd166)}}',
'#asr .ah{font:700 12px Silkscreen,ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;opacity:.8}#asr h2{margin:2px 0 6px;font:900 22px/1.15 system-ui,sans-serif}',
'#asr .stars{display:flex;gap:3px;justify-content:center;margin:10px 0 4px;font-size:25px}#asr .stars i{font-style:normal;color:rgba(255,255,255,.18);transition:color .3s,transform .3s}#asr .stars i.on{color:#ffd166;text-shadow:0 0 10px rgba(255,209,102,.7)}#asr .stars i.gain{animation:cgain .6s both}#asr .stars i.lost{animation:clost .6s both;color:#e5442f}',
'@keyframes cgain{0%{transform:scale(.3)}60%{transform:scale(1.5)}100%{transform:none}}@keyframes clost{0%{color:#ffd166}50%{transform:scale(1.3)}100%{color:rgba(255,255,255,.18);transform:none}}',
'#asr .big{text-align:center;font:900 30px/1 system-ui,sans-serif;margin:4px 0}#asr .big small{display:block;font:800 12px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--sc)}',
'#asr .vd{text-align:center;font-weight:700;margin:6px 0 10px}',
'#asr h3{margin:14px 0 6px;font:900 13px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}',
'#asr .rw{display:flex;align-items:center;gap:10px;padding:7px 10px;margin:4px 0;border-radius:12px;background:rgba(127,127,160,.14);font-weight:600}#asr .rw .ri{font-size:20px;width:26px;text-align:center}#asr .rw span{flex:1}#asr .rw em{font-style:normal;color:var(--mut)}',
'#asr .pt{min-width:38px;text-align:center;border-radius:8px;padding:2px 6px;font:900 13px system-ui,sans-serif}#asr .pt.p{background:#2fbf71;color:#08240f}#asr .pt.n{background:#e5442f;color:#fff}#asr .pt.z{background:rgba(127,127,160,.3)}',
'#asr .pk{display:flex;gap:8px;padding:4px 0;font-weight:600}#asr .pk:before{content:"•";color:var(--sc)}',
'#asr .warn{margin:10px 0;padding:10px;border-radius:12px;background:rgba(229,68,47,.18);border:1px solid #e5442f;font-weight:700}',
'#asr button.go{display:block;width:100%;min-height:52px;margin-top:14px;border-radius:12px;background:var(--ac,#ff5a43);color:#fff;border:0;font:900 14px system-ui,sans-serif;cursor:pointer}'
].join('\n');
var stl=el('style');stl.textContent=css;document.head.appendChild(stl);

/* ---------- the star sheet (assessment result or current standing) ---------- */
var asr=el('div');asr.id='asr';document.body.appendChild(asr);
function starRow(from,to){var h='';for(var k=1;k<=10;k++){var on=k<=to,cls=on?'on':'';if(on&&k>from)cls+=' gain';if(!on&&k<=from)cls+=' lost';h+='<i class="'+cls+'" style="animation-delay:'+(.15+Math.abs(k-from)*.12)+'s">★</i>';}return '<div class="stars">'+h+'</div>';}
function rowsHTML(sc){return sc.rows.map(function(r){var p=r[3],cls=p>0?'p':p<0?'n':'z';return '<div class="rw"><b class="ri">'+r[0]+'</b><span>'+r[1]+' <em>'+esc(r[2])+'</em></span><b class="pt '+cls+'">'+(p>0?'+':'')+p+'</b></div>';}).join('')+
  (sc.exp?'<div class="rw"><b class="ri">🧐</b><span>The city expects more from a '+S.star+'★ venue</span><b class="pt n">−'+sc.exp+'</b></div>':'')+
  '<div class="rw" style="background:rgba(127,127,160,.26)"><b class="ri">Σ</b><span><b>Total</b> <em>−6 or less: −2★ · −2: −1★ · +3: +1★ · +7: +2★</em></span><b class="pt '+(sc.total>0?'p':sc.total<0?'n':'z')+'">'+(sc.total>0?'+':'')+sc.total+'</b></div>';}
function perksHTML(t){return t.d.map(function(x){return '<div class="pk">'+esc(x)+'</div>';}).join('');}
function openSheet(html,col,onGo,label){asr.style.setProperty('--sc',col);asr.innerHTML='<div>'+html+'<button class="go">'+(label||'Close')+'</button></div>';asr.classList.add('on');
  asr.querySelector('.go').onclick=function(){asr.classList.remove('on');asr.innerHTML='';if(onGo)onGo();};
  asr.onclick=function(e){if(e.target===asr&&!onGo){asr.classList.remove('on');asr.innerHTML='';}};}
function standing(){
  ensure();if(!career()){openSheet('<div class="ah">Classic mode</div><h2>14-day concession</h2><p>Reach Culture 30+, Hype 30+, Heritage 50+ and cash ≥ 0 by the review on day '+DAYS+'. Switch to Career mode in Settings for the long game with star ratings.</p>','#9aa0b8');return;}
  var t=tier(),sc=scoreNow(),left=C.left();
  var h='<div class="ah">Venue standing · Day '+S.day+'</div><h2>'+esc(t.n)+'</h2>'+starRow(S.star,S.star)+'<div class="big">'+S.star+' / 10<small>'+esc(t.n)+'</small></div>';
  h+='<div class="vd">Next city assessment in <b>'+left+' day'+(left===1?'':'s')+'</b><br>'+(S.rp.days<3?'too early to call':'on track for: <b>'+(sc.delta>0?'+'+sc.delta+'★':sc.delta<0?sc.delta+'★':'no change')+'</b>')+'</div>';
  if(S.star<=2)h+='<div class="warn">⚠️ One more bad assessment at 1★ and the city revokes the concession.</div>';
  h+='<h3>What '+S.star+'★ means now</h3>'+perksHTML(t);
  h+='<h3>This period so far</h3>'+rowsHTML(sc);
  if(S.asr.length){h+='<h3>Past assessments</h3>'+S.asr.slice(0,6).map(function(a){return '<div class="rw"><b class="ri">📋</b><span>Day '+a.day+' <em>'+a.from+'★ → '+a.to+'★</em></span><b class="pt '+(a.to>a.from?'p':a.to<a.from?'n':'z')+'">'+(a.to>a.from?'▲':a.to<a.from?'▼':'=')+'</b></div>';}).join('');}
  openSheet(h,t.c);snd('click');
}
C.standing=standing;
function assess(){
  var sc=scoreNow(),from=S.star,to=Math.max(1,Math.min(10,from+sc.delta)),day=S.day-1;
  S.star=to;S.asr.unshift({day:day,from:from,to:to,total:sc.total});S.asr.length=Math.min(S.asr.length,12);
  var rs=S.speed||2;S.speed=0;var t=STARS[to];
  var vd=sc.delta>=2?'The city is thrilled: up two stars!':sc.delta===1?'Up one star. The city likes what it sees.':sc.delta===0?'Holding steady. Same rating for another 14 days.':sc.delta===-1?'Down one star. The city is not impressed.':'Down two stars. The city is worried.';
  var h='<div class="ah">Bimonthly city assessment · Day '+day+'</div><h2>'+(to>from?'Promoted!':to<from?'Demoted':'Rating confirmed')+'</h2>'+starRow(from,to)+'<div class="big">'+from+'★ → '+to+'★<small>'+esc(t.n)+'</small></div><div class="vd">'+vd+'</div>';
  if(to===1)h+='<div class="warn">The city has revoked the concession. The market and the club close.</div>';else if(to===2)h+='<div class="warn">⚠️ Crisis: one more drop and the concession is gone. Raise culture, hype and heritage, keep the books positive, host nights.</div>';
  h+='<h3>Scorecard</h3>'+rowsHTML(sc);
  if(to>1)h+='<h3>For the next 14 days at '+to+'★</h3>'+perksHTML(t);
  S.rp=snapP();
  openSheet(h,t.c,function(){if(to<=1){fin(false,'Rated 1★ at the day '+day+' assessment: the city revoked the concession after '+(day)+' days.');ui();return;}S.speed=rs;newDay();ui();},to<=1?'See the end':'▶ Next morning');
  try{ui();}catch(e){}
  snd(to>=from?'level':'bad');try{if(navigator.vibrate)navigator.vibrate(to>=from?[20,40,20]:[60,40,60]);}catch(e){}
}
C.assess=assess;

/* ---------- day cycle: career end of day replaces the 14-day ending ---------- */
window.endDay=endDay=function(){
  ensure();
  dailyEco();var a_=0,b_=0,cats=new Set();for(var s of stalls.values()){a_+=ST[s.i][8];b_+=ST[s.i][9];if(ST[s.i][1]!=='amen')cats.add(ST[s.i][1]);}
  S.cash-=400;S.cul=cl(S.cul+Math.min(4,a_/6)+cats.size*.3);S.hyp=cl(S.hyp+Math.min(3,b_/10)-1);
  var rp=S.rp;rp.days++;rp.sales+=S.sales||0;rp.earn+=S.earn||0;if(S.evt)rp.nights++;
  if(career()){var t=tier();if(t.cash){S.cash+=t.cash;S.pre+=(t.cash>0?'City grant +':'City levy −')+eu(Math.abs(t.cash)).replace('-','')+' ('+S.star+'★). ';}if(t.hyp)S.hyp=cl(S.hyp+t.hyp);if(t.cul)S.cul=cl(S.cul+t.cul);}
  S.act=[0,'none','none'];S.att=[0,0,0];S.rep={tix:0,bar:0,cloak:0,merch:0,cost:0,fine:0};for(var g in S.fame)S.fame[g]=Math.max(0,S.fame[g]-.4);S.day++;
  while((career()||S.day<=DAYS)&&dow()===6){S.her=cl(S.her+8);S.cash-=200;S.day++;S.pre+='Monday: closed for maintenance (+8 heritage). ';}S.t=540;
  for(var k in S.sched)if(+k<S.day)delete S.sched[k];
  if(S.her<=0||S.cash<-1000)return fin(false,S.her<=0?'The ironwork gave out and the city closed the hall.':'You ran out of credit.');
  if(!career()){
    if(S.day>DAYS){var ok=S.cul>=30&&S.hyp>=30&&S.her>=50&&S.cash>=0;return fin(ok,ok?'The city renews your concession. Market and club both thrive.':'Review failed. Needed Culture 30+, Hype 30+, Heritage 50+, cash ≥ 0. You had '+Math.round(S.cul)+', '+Math.round(S.hyp)+', '+Math.round(S.her)+', €'+Math.round(S.cash)+'.');}
    newDay();return;}
  if(S.day-rp.d0>=PERIOD){assess();return;}
  newDay();
};

/* ---------- each morning: star effects on footfall, then the planned acts ---------- */
function dblOn(d){var w=(d-1)%7;return w===3||w===4;}
function applySched(){
  var p=S.sched[S.day];if(!p)return;var got=[];
  for(var r=1;r<=2;r++){var v=p[r];if(!v||v==='none')continue;var a=AC[v];if(!a)continue;
    if(!dblOn(S.day)&&S.act[3-r]&&S.act[3-r]!=='none')continue;
    if(!canBook(a,r)){S.log+=' '+(a.bn||GEN[a.g].n)+' could not play tonight (locked).';continue;}
    S.act[r]=v;got.push('R'+r+' '+(a.bn||GEN[a.g].n));}
  if(got.length)S.log+=' Tonight: '+got.join(', ')+'.';
}
var _nd=window.newDay;
window.newDay=newDay=function(){var r=_nd.apply(this,arguments);try{ensure();if(career())S.foot*=tier().foot;applySched();}catch(e){console.warn('career',e);}try{ui();}catch(e){}return r;};

/* ---------- booking limits by star rating ---------- */
var _cb=window.canBook;
function tierOf(a){return a.band?(a.bt||0):(a.t||0);}
function capOK(a){return !career()||tierOf(a)<=tier().cap;}
window.canBook=canBook=function(a,r){if(!_cb.apply(this,arguments))return false;try{return capOK(a);}catch(e){return true;}};
function needStars(a){var t=tierOf(a);return t<=1?2:t<=2?3:4;}

/* ---------- week planner (Night tab) ---------- */
var GC={techno:'#35e0ff',metal:'#e5442f',rock:'#f2994a',indie:'#2fbf71',pop:'#ec5fa3'};
function info(v){var a=AC[v];if(!a||v==='none')return null;var gen=GEN[a.g]||{};
  if(a.bn)return {v:v,a:a,ic:gen.ic||'★',name:a.bn,tier:BT[a.bt],cost:a.cost,col:'#f2c94c',g:a.g,band:1};
  return {v:v,a:a,ic:gen.ic||'♪',name:gen.n||a.g,tier:(TIERS[a.t]||[])[0]||'',cost:a.cost,col:GC[a.g]||'#888',g:a.g};}
function weekDays(){var out=[],d=S.day;if(S.ph==='night'||S.ph==='end')d++;var lim=career()?1e9:DAYS;
  while(out.length<7&&d<=lim){out.push({d:d,w:(d-1)%7});d++;}return out;}
function planOf(d){if(d===S.day)return [0,S.act[1]||'none',S.act[2]||'none'];var p=S.sched[d];return p?[0,p[1]||'none',p[2]||'none']:[0,'none','none'];}
function setPlan(d,r,v){
  if(d===S.day&&S.ph!=='night'&&S.ph!=='end'){var sel=document.getElementById('a'+r);if(sel){sel.value=v;sel.dispatchEvent(new Event('change',{bubbles:true}));}else{S.act[r]=v;if(!dbl()&&v!=='none')S.act[3-r]='none';}}
  else{var p=S.sched[d]||[0,'none','none'];p[r]=v;if(!dblOn(d)&&v!=='none')p[3-r]='none';if(p[1]==='none'&&p[2]==='none')delete S.sched[d];else S.sched[d]=p;}
  try{snd('coin');if(navigator.vibrate)navigator.vibrate(8);}catch(e){}sig='';ui();
}
var wk=null,sig='';
function cell(d,r,v,off){var i=info(v),b=el('button','wk-c'+(i?'':' empty')+(off?' off':''));b.type='button';
  if(i){var lock=!capOK(i.a);if(lock)b.classList.add('lock');b.style.setProperty('--gc',i.col);b.innerHTML='<span class="ic">'+i.ic+'</span><span><b>'+esc(i.name)+'</b><small>'+esc(i.tier)+' · €'+i.cost+(lock?' · 🔒 '+needStars(i.a)+'★':'')+'</small></span>';}
  else b.innerHTML='<span class="ic">+</span><span><b>'+(off?'One room only':'Book R'+r)+'</b><small>'+(r===1?'🏟 1000':'🏟 350')+'</small></span>';
  if(!off)b.onclick=function(){openPick(d,r);};return b;}
function renderWeek(){
  var tn=document.getElementById('tn');if(!tn||!S)return;
  if(!wk){wk=el('section','wk');var gm=tn.querySelector('.gm');if(gm)gm.insertAdjacentElement('afterend',wk);else tn.insertBefore(wk,tn.firstChild);}
  else if(!wk.isConnected||(wk.previousElementSibling&&!wk.previousElementSibling.classList.contains('gm')&&tn.querySelector('.gm'))){var gm2=tn.querySelector('.gm');if(gm2)gm2.insertAdjacentElement('afterend',wk);}
  var ds=weekDays(),plans=ds.map(function(x){return planOf(x.d);});
  var s=[S.day,S.ph,S.star,S.mode,JSON.stringify(plans),Math.floor(S.cash/100)].join('|');if(s===sig)return;sig=s;
  wk.innerHTML='';var tot=0,n=0;
  wk.appendChild(el('div','wk-h','🗓 Week planner <small>book both rooms up to 7 nights ahead</small>'));
  ds.forEach(function(x,k){var row=el('div','wk-row'),p=plans[k],today=x.d===S.day;
    row.appendChild(el('div','wk-day'+(today?' today':''),DOW[x.w]+'<small>'+(today?'tonight':'day '+x.d)+'</small>'));
    if(x.w===6){row.appendChild(el('div','wk-closed','🔧 Closed for maintenance'));}
    else{for(var r=1;r<=2;r++){var v=p[r],off=!dblOn(x.d)&&p[3-r]!=='none'&&(!v||v==='none');row.appendChild(cell(x.d,r,v,off));var i=info(v);if(i){tot+=i.cost;n++;}}}
    wk.appendChild(row);});
  var f=el('div','wk-f');f.innerHTML='<span class="gm-chip">🎟 '+n+' nights booked</span><span class="gm-chip">💸 '+eu(tot)+' in act fees</span><span class="gm-chip">🗓 Thu & Fri: both rooms</span>';
  var clr=el('button','','Clear plan');clr.type='button';clr.onclick=function(){S.sched={};sig='';snd('click');ui();};f.appendChild(clr);wk.appendChild(f);
}
/* act picker */
var pk=el('div');pk.id='wkp';pk.innerHTML='<div><div class="ph"><h3></h3><button aria-label="Close">✕</button></div><div class="fl"></div><div class="gr"></div></div>';document.body.appendChild(pk);
pk.addEventListener('click',function(e){if(e.target===pk)pk.classList.remove('on');});pk.querySelector('.ph button').onclick=function(){pk.classList.remove('on');};
var pD=0,pR=1,pF='all';
function openPick(d,r){pD=d;pR=r;pF='all';renderPick();pk.classList.add('on');pk.querySelector('.gr').scrollTop=0;}
function renderPick(){
  var x=(pD-1)%7;pk.querySelector('h3').textContent=DOW[x]+' · day '+pD+' · Room '+pR;
  var fl=pk.querySelector('.fl');fl.innerHTML='';[['all','🎶 All']].concat(Object.keys(GEN).map(function(g){return [g,GEN[g].ic+' '+GEN[g].n];}),[['band','★ Bands']]).forEach(function(q){var b=el('button',q[0]===pF?'on':'',q[1]);b.type='button';b.onclick=function(){pF=q[0];renderPick();};fl.appendChild(b);});
  var gr=pk.querySelector('.gr');gr.innerHTML='';var cur=planOf(pD)[pR];
  var none=el('button','gm-card'+(cur==='none'?' sel':''),'<span class="ic">✖</span><b>No event</b><small>Room stays dark</small>'+(cur==='none'?'<em>✔ Planned</em>':''));none.style.setProperty('--gc','#8d93a8');none.onclick=function(){setPlan(pD,pR,'none');pk.classList.remove('on');};gr.appendChild(none);
  var all=Object.keys(AC).filter(function(k){return k!=='none';}).map(info).filter(Boolean);
  [['🎶 Genre nights',all.filter(function(i){return !i.band;})],['★ Bands',all.filter(function(i){return i.band;})]].forEach(function(gp){
    var l=gp[1].filter(function(i){return pF==='all'||(pF==='band'?i.band:(i.g===pF&&!i.band));});if(!l.length)return;gr.appendChild(el('h4','',gp[0]));
    l.forEach(function(i){var lock=!canBook(i.a,pR),cap=!capOK(i.a),sel=cur===i.v;
      var b=el('button','gm-card'+(sel?' sel':'')+(lock?' lock':''),'<span class="ic">'+i.ic+'</span><b>'+esc(i.name)+'</b><small>'+esc(i.tier)+' · €'+i.cost+'</small>'+(sel?'<em>✔ Planned</em>':cap?'<em>🔒 needs '+needStars(i.a)+'★</em>':lock?'<em>🔒 Locked</em>':''));
      b.type='button';b.style.setProperty('--gc',i.col);
      b.onclick=function(){if(lock){try{toast(cap?'Your '+S.star+'★ rating does not allow this tier. Needs '+needStars(i.a)+'★.':'Not unlocked yet: build fame and club rank.','🔒');}catch(e){}return;}setPlan(pD,pR,i.v);pk.classList.remove('on');};gr.appendChild(b);});});
}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){pk.classList.remove('on');if(asr.classList.contains('on')&&!asr.querySelector('.go').textContent.match(/Next|See/)){asr.classList.remove('on');}}});

/* ---------- header ---------- */
function $(id){return document.getElementById(id);}
var pipN=-1;
function renderHud(){
  if(!S)return;ensure();var t=tier(),ht=$('hst-t');
  if(ht){ht.style.setProperty('--hc',career()?t.c:'#9aa0b8');$('hst').textContent=career()?S.star+'★':'Classic';$('hstl').textContent=career()?t.n:'14 days';
    if(pipN!==S.star){pipN=S.star;var p='';for(var k=1;k<=10;k++)p+='<i class="'+(career()&&k<=S.star?'on':'')+'"></i>';$('hpips').innerHTML=p;}}
  var lf=C.left(),rv=$('hrv-t');if(rv){$('hrv').textContent=lf+'d';rv.classList.toggle('soon',lf<=2);rv.style.setProperty('--hc',lf<=2?'#ff5a43':'#35b6ff');}
  var sl=$('sl');if(sl)sl.textContent=nStalls()+'/'+maxS();
}
var _ui=window.ui;
window.ui=ui=function(){var r=_ui.apply(this,arguments);try{renderHud();renderWeek();}catch(e){console.warn('career ui',e);}return r;};
['hst-t','hrv-t'].forEach(function(id){var e=$(id);if(e)e.addEventListener('click',standing);});

/* ---------- settings: game mode ---------- */
(function(){var P=$('ts');if(!P)return;var w=el('label','row','<span class="px">Game mode</span>'),s=el('select');
  [['career','Career: endless, star rating every 14 days'],['classic','Classic: 14-day concession']].forEach(function(o){var op=el('option');op.value=o[0];op.textContent=o[1];s.appendChild(op);});
  s.value=SET.mode==='classic'?'classic':'career';s.onchange=function(){SET.mode=s.value;saveSet();try{toast('Game mode applies to your next new game.','🎮');}catch(e){}};w.appendChild(s);P.insertBefore(w,P.firstChild);})();

ensure();try{ui();}catch(e){}
})();
