/* Programme-style night setup, act picker and time-of-day theme. Runs after ui.js. The original <select>s stay the
   source of truth: every button here sets the select value and fires its change handler. */
(function(){
const $$=id=>document.getElementById(id);
const GC={techno:'#35e0ff',metal:'#e5442f',rock:'#f2994a',indie:'#2fbf71',pop:'#ec5fa3',band:'#f2c94c'};
const ANI=['✖','\u{1F5FF}','\u{1F939}','\u{1F9F8}','\u{1F3A9}','\u{1F574}️','\u{1F3A8}','\u{1FAE7}'];
const DAYI={none:'✖',fado:'\u{1F3BB}',samba:'\u{1F941}',folk:'\u{1F483}'};
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const pick=(sel,v)=>{if(!sel)return;sel.value=v;sel.dispatchEvent(new Event('change',{bubbles:true}));try{if(window.sfx)sfx('coin');if(navigator.vibrate)navigator.vibrate(8);}catch(e){}};
const ok=()=>{try{return !!(S&&AC&&GEN&&TIERS&&BT&&BTC&&DN);}catch(e){return false;}};
const night=()=>ok()&&(S.ph==='night'||S.ph==='end'||S.ph==='changeover');

/* ---------- time of day: theme + scenes ---------- */
let tod='';
function setTod(){if(!ok())return;const t=night()?'night':'day';if(t===tod)return;tod=t;document.body.dataset.tod=t;if(window.MFScenes)MFScenes.apply(t);}

/* ---------- act info ---------- */
function info(v){const a=ok()&&AC[v];if(!a||v==='none')return null;const g=a.g,gen=GEN[g]||{};
  if(a.bn){const bt=a.bt||0;return{v,ic:gen.ic||'★',name:a.bn,tier:BT[bt],tc:BTC[bt],g,col:GC.band,cost:a.cost,band:1,u:a.u||0,sub:gen.n};}
  const t=TIERS[a.t]||[];return{v,ic:gen.ic||'♪',name:gen.n||g,tier:t[0]||'',tc:['#4d9a3a','#2f6db5','#8a63c7','#c9a227'][a.t]||'#888',g,col:GC[g]||'#888',cost:a.cost,u:a.u||0};}

/* ---------- build the programme ---------- */
let root,sig='',picker,pickR=0,pickF='all';
function build(){const tn=$$('tn');if(!tn||root)return;
  root=el('section','gm');
  const top=el('div','gm-top');root.appendChild(top);
  const rooms=el('div','gm-rooms');root.appendChild(rooms);
  const dh=el('div','gm-h','☀️ Day stage <small>15-18h</small>'),dr=el('div','gm-row');
  const ah=el('div','gm-h','\u{1F3AD} Street animators'),al=el('div','gm-lab','Morning'),as0=el('div','gm-scroll'),al2=el('div','gm-lab','Afternoon'),as1=el('div','gm-scroll');
  const nt=el('details','gm-note','<summary>ℹ️ How nights work</summary><div id="gmnt"></div>');
  root.append(dh,dr,ah,al,as0,al2,as1,nt);
  root._=({top,rooms,dr,as0,as1,nt});
  // hist/fame/upgrades headings
  const f=$$('fame'),u=$$('upg');
  tn.insertBefore(root,tn.firstChild);
  if(f)tn.insertBefore(el('div','gm-h','⭐ Genre fame'),f);
  if(u)tn.insertBefore(el('div','gm-h','\u{1F6E0}️ Club upgrades'),u);
  // picker overlay
  picker=el('div');picker.id='gmp';picker.innerHTML='<div><div class="ph"><h3></h3><button aria-label="Close">✕</button></div><div class="fl"></div><div class="gr"></div></div>';
  document.body.appendChild(picker);
  picker.addEventListener('click',e=>{if(e.target===picker)closeP();});
  picker.querySelector('.ph button').onclick=closeP;
}
function closeP(){if(picker)picker.classList.remove('on');}
function openP(r){pickR=r;pickF='all';renderP();picker.classList.add('on');picker.querySelector('.gr').scrollTop=0;}
function filters(){return[['all','\u{1F3B6} All'],['techno',GEN.techno.ic+' Techno'],['metal',GEN.metal.ic+' Metal'],['rock',GEN.rock.ic+' Rock'],['indie',GEN.indie.ic+' Indie'],['pop',GEN.pop.ic+' Pop'],['band','★ Bands']];}
function renderP(){if(!picker)return;const s=$$('a'+pickR);if(!s)return;
  picker.querySelector('h3').textContent='Room '+pickR+' · pick tonight\'s act';
  const fl=picker.querySelector('.fl');fl.innerHTML='';filters().forEach(([k,l])=>{const b=el('button',k===pickF?'on':'',l);b.onclick=()=>{pickF=k;renderP();};fl.appendChild(b);});
  const gr=picker.querySelector('.gr'),keep=gr.scrollTop;gr.innerHTML='';const cur=s.value;
  const none=el('button','gm-card'+(cur==='none'?' sel':''),'<span class="ic">✖</span><b>No event</b><small>Room stays dark</small>'+(cur==='none'?'<em>✔ Booked</em>':''));none.style.setProperty('--gc','#8d93a8');none.onclick=()=>{pick(s,'none');closeP();};gr.appendChild(none);
  const opts=[...s.options].filter(o=>o.value!=='none').map(o=>({o,i:info(o.value)})).filter(x=>x.i);
  const groups=[['\u{1F3B6} Genre nights',opts.filter(x=>!x.i.band)],['★ Bands',opts.filter(x=>x.i.band)]];
  for(const [title,list] of groups){const l=list.filter(x=>pickF==='all'||(pickF==='band'?x.i.band:x.i.g===pickF&&!x.i.band));if(!l.length)continue;if(pickF==='all'||pickF==='band')gr.appendChild(el('h4','',title));
    l.forEach(({o,i})=>{const lock=o.disabled,poor=!lock&&S.cash<i.cost,sel=cur===i.v;
      const b=el('button','gm-card'+(sel?' sel':'')+(lock?' lock':'')+(poor?' poor':''),'<span class="ic">'+i.ic+'</span><b>'+esc(i.name)+'</b><small>'+esc(i.tier)+' · €'+i.cost+'</small>'+(sel?'<em>✔ Booked</em>':lock?'<em>\u{1F512} '+(i.u&&!i.band?i.u+' fame':'Locked')+'</em>':poor?'<em>Short on cash</em>':''));
      b.style.setProperty('--gc',i.col);if(lock)b.setAttribute('aria-disabled','true');
      b.onclick=()=>{if(lock){try{toast(i.band?'This band is not unlocked yet.':'Needs '+i.u+' '+(GEN[i.g]||{}).n+' fame.','\u{1F512}');}catch(e){}return;}pick(s,i.v);closeP();};gr.appendChild(b);});}
  gr.scrollTop=keep;}

function roomCard(r){const s=$$('a'+r),v=s?s.value:'none',i=info(v),shut=window.dbl&&!dbl()&&S.act[3-r]&&S.act[3-r]!=='none';
  const b=el('button','gm-room'+(i?'':' empty')+(shut?' shut':''));b.type='button';
  const cap=r===1?1000:350;
  if(i){b.style.setProperty('--gc',i.col);b.style.setProperty('--tc',i.tc);b.innerHTML='<span class="gr-t">Room '+r+'<small>\u{1F3DF} '+cap+'</small></span><span class="gr-ic">'+i.ic+'</span><span class="gr-n">'+esc(i.name)+'</span><span class="gr-s"><i>'+esc(i.tier)+'</i>€'+i.cost+'</span><span class="gr-cta">Change ▸</span>';}
  else b.innerHTML='<span class="gr-t">Room '+r+'<small>\u{1F3DF} '+cap+'</small></span><span class="gr-ic">➕</span><span class="gr-n">'+(shut?'Closed tonight':'Book an act')+'</span><span class="gr-s">'+(shut?'only one room':'genres · bands')+'</span><span class="gr-cta">Choose ▸</span>';
  b.onclick=()=>openP(r);return b;}

function optRow(sel,map,wrap){wrap.innerHTML='';if(!sel)return;[...sel.options].forEach((o,k)=>{const lock=o.disabled,on=sel.value===o.value,m=map(o,k);
  const b=el('button','gm-opt'+(on?' on':''),'<span class="ic">'+m.ic+'</span>'+esc(m.t)+(m.s?'<small>'+esc(m.s)+'</small>':''));b.type='button';if(lock)b.disabled=true;b.onclick=()=>pick(sel,o.value);wrap.appendChild(b);});}
function txt(o){const m=/^(.*?)\s*(€\d+)?$/.exec(o.text);return{n:(m&&m[1]||o.text).trim(),p:m&&m[2]||''};}

function render(){if(!ok()||!root)return;
  const a1=$$('a1'),a2=$$('a2'),d=$$('dayact'),n0=$$('an0'),n1=$$('an1');
  const s=[S.act&&S.act.join(),d&&d.value,n0&&n0.value,n1&&n1.value,a1&&[...a1.options].filter(o=>o.disabled).length,a2&&[...a2.options].filter(o=>o.disabled).length,tod,S.ph,window.dbl&&dbl()].join('|');
  if(s===sig){if(picker.classList.contains('on'))renderP();return;}sig=s;
  const R=root._;
  R.top.innerHTML='<b>Tonight · '+(ok()&&window.dow?DN[dow()]:'')+'</b><span class="gm-chip">\u{1F6AA} Doors 22:00</span><span class="gm-chip">\u{1F3AB} '+(350+350*(S.up?S.up.tix:0))+'</span><span class="gm-chip">\u{1F6BB} '+(300+150*(window.wcn?wcn():0))+'</span>';
  R.rooms.innerHTML='';R.rooms.append(roomCard(1),roomCard(2));
  optRow(d,(o)=>{const t=txt(o);return{ic:DAYI[o.value]||'\u{1F3B6}',t:t.n.replace(/ (trio|band|dancers)$/i,''),s:t.p};},R.dr);
  const an=(o,k)=>{const t=txt(o);return{ic:ANI[k]||'\u{1F3AD}',t:t.n,s:t.p};};
  optRow(n0,an,R.as0);optRow(n1,an,R.as1);
  const nt=$$('nt');if(nt)R.nt.querySelector('#gmnt').textContent=nt.textContent;
}

/* ---------- hook ---------- */
function init(){if(!ok()||!$$('tn')||!$$('a1')||!window.MFScenes){return false;}build();setTod();render();return true;}
const _ui=window.ui;
window.ui=ui=function(){const r=_ui.apply(this,arguments);try{setTod();render();}catch(e){console.warn('gm',e);}return r;};
let tries=0;const iv=setInterval(()=>{try{if(init()||++tries>80)clearInterval(iv);}catch(e){console.warn('gm init',e);if(++tries>5)clearInterval(iv);}},200);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeP();});
window.mfbGM={open:openP,render:()=>{sig='';render();}};
})();
