/* esmeralda.js - Esmeralda, the market boss, gets moods. She swings between sweet and furious (a bit bipolar, and the market loves her for it):
   she patrols the market, barks orders or sweet-talks the crowd in speech bubbles, tells off (or compliments) the player, and now and then
   picks a fight with a passer-by, then makes up with a hug. A little name tag and a ring on the floor show her mood and make her easy to find.
   Cosmetic only: it never changes the economy. Add ?noesm to the address to switch it off. */
(function(){
'use strict';
if(window.mfbEsm||/[?&]noesm/.test(location.search))return;
function g(n){try{return (0,eval)(n);}catch(e){return undefined;}}
var T=window.THREE,R=g('R'),ESM=g('ESM'),EM=g('EM'),S=g('S');
if(!T||!R||!R.render||!ESM||!EM||!S)return;
var E=window.mfbEsm={mood:'sweet',state:'roam',fights:0};
function rnd(n){return Math.floor(Math.random()*n);}
function pickOne(a){return a[rnd(a.length)];}

/* ---------- what she says ---------- */
var LINES={
 sweet:['Meus amores,\nvendam bem! 💕','Que mercado\nlindo, meu Deus!','Beijinho a todos!\n💋','Estão todos\nlindíssimos hoje!','Adoro esta gente!\nAdoro!'],
 lovey:['Ai, adoro-vos\na todos! ❤','Querido, vem cá\ndar um abraço!','O melhor mercado\ndo mundo! ✨','Quem quer um\ncafezinho? ☕','Sorri! Estás\nlindo hoje!'],
 cold:['Hum. Vamos\nver isso…','Não me\nirrites hoje.','Eu estou\na ver tudo.','Preços à vista.\nJá disse.','Silêncio.\nEu penso.'],
 furious:['QUEM DEIXOU ISTO\nASSIM?!','ACORDEM! Isto não\né um hotel!','Eu mando aqui!\nEU! 😡','Já para a rua!\nOlha este lixo!','Estão a dormir?!\nMexam-se!','NÃO ACREDITO!\nSempre a mesma!']
};
var TOPLAYER={
 sweet:['Chefe! Que\ntrabalho lindo!','Meu querido\nchefe! 💕','Tu és o melhor!\nBeijinho!'],
 lovey:['Posso dar-te\num abraço?','Sem ti isto não\nera nada! ❤'],
 cold:['Tu. Sim, tu.\nEstou a ver-te.','Hum… ainda\nnão decidi.'],
 furious:['TU! O que fazes\naí parado?!','Chefe?! Isto\né uma vergonha!','Já para o\ntrabalho! JÁ!']
};
var FIGHT_ME=['Ouve lá, seu\npalerma!','Quem pensas\nque és?!','Eu mando\naqui, ouviste?','Sai já\ndaqui!','Aprende a\nrespeitar!'];
var FIGHT_HIM=['Eu? Tu é que\ngritas!','Calma, Esmeralda!\nCalma!','Pareces um galo\nno poleiro!','Vou chamar\no sindicato!','Chiça! Que\ngenialidade!'];
var MAKEUP_ME=['Ai, desculpa\nmeu amor! 💕','Perdoa-me!\nSou assim… ❤','Vem cá, dá cá\num abraço! 🤗'];
var MAKEUP_HIM=['Tás perdoada,\nEsmeralda…','Já passou.\nBeijinho! 💋','Adoro-te\nna mesma! ❤'];
var TAG={sweet:['💕','#e8478f'],lovey:['❤','#ff5c8a'],cold:['😐','#6a7a90'],furious:['😡','#d6201f']};

/* ---------- name tag and floor ring (cosmetic) ---------- */
var tc=document.createElement('canvas');tc.width=160;tc.height=40;
var tex=new T.CanvasTexture(tc);tex.minFilter=T.NearestFilter;tex.magFilter=T.NearestFilter;
var tag=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthTest:false}));tag.scale.set(2.3,.575,1);tag.position.set(0,2.55,0);tag.renderOrder=999;ESM.add(tag);
var ring=new T.Mesh(new T.RingGeometry(.55,.75,24),new T.MeshBasicMaterial({color:0xe8478f,transparent:true,opacity:.55,side:T.DoubleSide,depthWrite:false}));
ring.rotation.x=-Math.PI/2;ring.position.y=.06;ESM.add(ring);
function paintTag(){
  var c=tc.getContext('2d'),m=E.mood,tg=TAG[m];c.clearRect(0,0,160,40);
  c.fillStyle='#1b1b2f';c.fillRect(0,4,160,32);c.fillStyle=tg[1];c.fillRect(3,7,154,26);
  c.fillStyle='#fff';c.font='bold 15px monospace';c.textAlign='center';c.textBaseline='middle';
  c.fillText(tg[0]+' '+(m==='furious'?'ESMERALDA':'Esmeralda'),80,21);tex.needsUpdate=true;
  ring.material.color.set(tg[1]);
}

/* ---------- helpers that reach the game ---------- */
function say(txt,kind,mesh,life){
  try{var set=g('SET'),old=set&&set.pop;if(set)set.pop=1;g('bubble')(txt,0,0,3.4,kind||'say',mesh||ESM,life||3.2);if(set)set.pop=old;big(mesh||ESM);}catch(e){}
}
/* her bubbles are drawn bigger, so they can be read on a phone */
function big(f){var B=g('BUB')||[];for(var i=0;i<B.length;i++){var b=B[i];if(b.l>0&&b.f===f&&!b.__big){b.__big=f;if(!b.__sc)b.__sc=b.s.scale.clone();b.s.scale.copy(b.__sc).multiplyScalar(1.55);}}}
function unbig(){var B=g('BUB')||[];for(var i=0;i<B.length;i++){var b=B[i];if(b.__big&&(b.l<=0||b.f!==b.__big)){b.__big=0;b.s.scale.copy(b.__sc);}}}
function snd(n){try{g('sfx')(n);}catch(e){}}
function peds(){var P=g('PED')||[],o=[];for(var i=0;i<P.length;i++){var m=P[i];if(m&&m.visible&&m.position)o.push(m);}return o;}
function dist(a,b){return Math.hypot(a.position.x-b.position.x,a.position.z-b.position.z);}

/* ---------- the mood machine ---------- */
var mt=18,bark=3,fcd=25,st={k:'roam',t:0,target:null,sx:0,sz:0,line:0,player:false},last=performance.now(),firstFight=true;
function setMood(m){E.mood=m;paintTag();}
function nextMood(){
  var m=E.mood,r=Math.random();
  if(m==='sweet')return r<.45?'furious':r<.7?'lovey':'cold';
  if(m==='lovey')return r<.5?'furious':r<.7?'cold':'sweet';
  if(m==='cold')return r<.5?'furious':r<.8?'sweet':'lovey';
  return r<.5?'lovey':r<.8?'sweet':'furious';      // furious: a sudden switch to sweet is the classic
}
function swing(){
  var from=E.mood,to=nextMood();setMood(to);mt=14+Math.random()*18;
  if(from==='furious'&&(to==='sweet'||to==='lovey'))say(pickOne(['Ai, que é isto?\nEstou ótima! 💕','Desculpem, gente!\nDia complicado… ❤']),'love');
  else if(to==='furious')say(pickOne(['Ai… JÁ CHEGA!!','Estou a ficar\nnervosa…! 😡']),'say');
  paintTag();
}
function startChase(target,isPlayer){st={k:'chase',t:0,target:target,player:!!isPlayer,line:0,sx:0,sz:0};}
function endState(){st={k:'roam',t:0,target:null,player:false,line:0};EM.w=1;}
function fightStart(){
  st.k='fight';st.t=0;st.line=0;st.sx=st.target.position.x;st.sz=st.target.position.z;E.fights++;snd('bad');
  if(firstFight){firstFight=false;try{g('toast')('Esmeralda is having one of her moments…','😅');}catch(e){}}
}
function think(gt,tm){
  // returns nothing; drives EM targets and bubbles
  if(st.k==='roam'){
    mt-=gt;bark-=gt;fcd-=gt;
    if(mt<=0)swing();
    if(bark<=0){
      bark=E.mood==='furious'?2.2+Math.random()*2:3.2+Math.random()*3;
      var L=LINES[E.mood];say(pickOne(L),E.mood==='sweet'||E.mood==='lovey'?'love':'say');
    }
    if(fcd<=0){
      fcd=16+Math.random()*22;var P=peds();
      if(E.mood==='furious'&&P.length&&Math.random()<.7){var c=P.filter(function(m){return dist(m,ESM)<16;});if(c.length){startChase(pickOne(c),false);say(pickOne(['Tu aí! VEM CÁ!','Espera lá, tu!']),'say');return;}}
      var pl=g('Pp');if(pl&&pl.position&&Math.random()<.45&&dist(pl,ESM)<24){startChase(pl,true);return;}
      if((E.mood==='sweet'||E.mood==='lovey')&&P.length&&Math.random()<.5){var c2=P.filter(function(m){return dist(m,ESM)<14;});if(c2.length){startChase(pickOne(c2),false);}}
    }
  }else if(st.k==='chase'){
    st.t+=gt;var tg=st.target;
    if(!tg||(!st.player&&!tg.visible)||st.t>14){endState();return;}
    EM.tx=tg.position.x-.9;EM.tz=tg.position.z+.3;EM.w=5;
    if(dist(tg,ESM)<1.7){
      if(st.player){say(pickOne(TOPLAYER[E.mood]),(E.mood==='sweet'||E.mood==='lovey')?'love':'say');bark=3;fcd=14+Math.random()*16;endState();}
      else if(E.mood==='furious'){fightStart();}
      else{say(pickOne(LINES[E.mood==='cold'?'sweet':E.mood]),'love');say(pickOne(['Obrigado, Esmeralda!\n❤','Que simpática,\nhoje!']),'love',tg,3);bark=3;endState();}
    }
  }else if(st.k==='fight'){
    st.t+=gt;var t2=st.target;EM.w=5;EM.tx=ESM.position.x;EM.tz=ESM.position.z;
    if(t2&&t2.position){t2.position.x=st.sx;t2.position.z=st.sz;t2.rotation.y=Math.atan2(ESM.position.x-t2.position.x,ESM.position.z-t2.position.z);}
    ESM.position.x+=Math.sin(tm*45)*.012;
    var n=Math.floor(st.t/1.5);if(n>st.line&&n<4){st.line=n;if(n%2){say(pickOne(FIGHT_HIM),'say',t2,2.6);}else say(pickOne(FIGHT_ME)+'','say',ESM,2.6);}
    if(st.line===0&&st.t<.1)say(pickOne(FIGHT_ME),'say');
    if(st.t>6.2){st.k='hug';st.t=0;st.line=0;setMood('lovey');mt=12+Math.random()*10;say(pickOne(MAKEUP_ME),'love');snd('coin');}
  }else if(st.k==='hug'){
    st.t+=gt;EM.w=5;var t3=st.target;if(t3&&t3.position){t3.position.x=st.sx;t3.position.z=st.sz;}
    if(st.line===0&&st.t>1.3){st.line=1;say(pickOne(MAKEUP_HIM),'love',t3,2.8);}
    if(st.t>3.6){bark=2;fcd=22+Math.random()*20;endState();}
  }
}

/* ---------- run every frame, just before drawing ---------- */
var prev=R.render.bind(R),mvTo=g('mvTo'),tm=0,pulse=0;
R.render=function(s,c){
  try{
    var n=performance.now(),dt=Math.min(.1,(n-last)/1000);last=n;
    if(ESM.visible&&S&&!S.over){
      var gt=S.speed?dt*S.speed/2:0;tm+=dt;unbig();
      if(gt>0)think(gt,tm);
      // furious: she walks faster
      if(E.mood==='furious'&&gt>0&&typeof mvTo==='function'&&st.k!=='fight'&&st.k!=='hug')mvTo(ESM,EM.tx,EM.tz,.7*gt);
      pulse+=dt*(E.mood==='furious'?9:3);ring.scale.setScalar(1+Math.sin(pulse)*.1);tag.position.y=2.55+(E.mood==='furious'?Math.sin(tm*30)*.04:0);
    }
  }catch(e){}
  return prev(s,c);
};
paintTag();
})();
