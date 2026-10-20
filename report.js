/* Night report: animated night manager + big icon/stat tiles. Loaded after the game script; replaces showReport. */
(function(){
const css=`
#nr .rp{--g:#2fbf71;--r:#ff5a43}
#nr .rp-bar{position:sticky;top:-18px;z-index:3;display:flex;align-items:center;justify-content:center;height:34px;margin:-6px -4px 4px;touch-action:none;cursor:grab}
#nr .rp-grip{width:44px;height:5px;border-radius:3px;background:rgba(127,127,160,.55)}
body.u2 #nr .rp-x,#nr .rp-x{position:absolute;right:0;top:0;width:36px;min-height:36px;height:36px;margin:0;padding:0;border-radius:50%;border:2px solid rgba(127,127,160,.5);background:rgba(127,127,160,.2);color:inherit;font:900 15px system-ui,sans-serif;display:flex;align-items:center;justify-content:center}
#nr .rp-top{display:flex;gap:10px;align-items:flex-end;margin-bottom:8px}
#nr .mgs{position:relative;width:118px;height:118px;flex:none;border-radius:16px;background:radial-gradient(circle at 50% 40%,#4a3a8a,#1b1b2f 75%);border:2px solid var(--ln);overflow:visible}
#nr .mgs .hd{position:absolute;inset:0;transform-origin:50% 92%}
#nr .mgs .pic{position:absolute;left:15px;top:6px;width:88px;height:106px;image-rendering:pixelated;border:0;border-radius:10px}
#nr .mgs .bl{position:absolute;left:45px;top:46px;width:9px;height:7px;background:#fbe0c8;transform:scaleY(0);transform-origin:50% 0;animation:blink 3.7s infinite;pointer-events:none}
#nr .mgs .bl.r{left:64px;animation-delay:.03s}
.mgs .hd{animation:mbreath 3.2s ease-in-out infinite}
#nr .mgs .pr{position:absolute;inset:0;pointer-events:none}
#nr .mgs .pr>*{position:absolute;line-height:1;transform-origin:50% 50%}
#nr .rp-say{position:relative;flex:1;min-height:60px;background:#fff;color:#1b1b2f;border-radius:14px;padding:12px 14px;font:900 20px/1.2 system-ui,sans-serif;letter-spacing:-.01em;box-shadow:0 3px 0 rgba(0,0,0,.3)}
#nr .rp-say:before{content:"";position:absolute;left:-8px;bottom:14px;border:8px solid transparent;border-right-color:#fff;border-left:0}
#nr .rp-say small{display:block;color:#7a7a90;font-weight:800;font-size:11px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px}
#nr .rp-h{display:flex;align-items:center;gap:8px;margin:6px 0 8px}#nr .rp-h img{height:20px;image-rendering:pixelated}
#nr .rp-h h2{margin:0;font-size:12px;flex:1}
#nr .rp-net{position:relative;overflow:hidden;border-radius:18px;padding:14px 12px;text-align:center;color:#fff;background:linear-gradient(135deg,#1f9d5c,#2fbf71);border:2px solid rgba(255,255,255,.25)}
#nr .rp-net.neg{background:linear-gradient(135deg,#c2271a,#ff5a43)}
#nr .rp-net .ic{font-size:54px;display:block;animation:rpbob 1.6s ease-in-out infinite}
#nr .rp-net .lb{font:700 11px system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;opacity:.9}
#nr .rp-net .nv{font:900 40px/1.05 system-ui,sans-serif;font-variant-numeric:tabular-nums;text-shadow:0 2px 0 rgba(0,0,0,.25)}
#nr .rp-net:after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);animation:rpsh 3.2s ease-in-out infinite}
#nr .rp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
#nr .tl{position:relative;background:rgba(127,127,160,.14);border:2px solid var(--tc);border-radius:16px;padding:10px 8px 8px;text-align:center;opacity:0;transform:translateY(14px) scale(.96);animation:rpin .45s cubic-bezier(.2,.9,.3,1.2) forwards;overflow:hidden}
#nr .tl .ic{display:block;font-size:40px;line-height:1.1}
#nr .tl .nv{display:block;font:900 22px/1.15 system-ui,sans-serif;color:var(--tc);font-variant-numeric:tabular-nums}
#nr .tl .lb{display:block;font:700 10px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.75}
#nr .tl .bar{height:5px;border-radius:3px;background:rgba(127,127,160,.25);margin-top:6px;overflow:hidden}#nr .tl .bar i{display:block;height:100%;width:0;background:var(--tc);border-radius:3px;transition:width .9s ease-out}
#nr .tl.in{--tc:#2fbf71}#nr .tl.out{--tc:#ff5a43}
#nr .tl .ic{animation:var(--an) var(--du,2.4s) ease-in-out infinite;animation-delay:var(--dl,0s)}
#nr .tl.pop .ic{animation:rppop .7s ease-out}
#nr .rp-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
#nr .rp-chips span{background:rgba(127,127,160,.18);border-radius:999px;padding:5px 10px;font:700 12px system-ui,sans-serif;display:inline-flex;gap:4px;align-items:center}
#nr .rp-chips b{font-size:16px;display:inline-block;animation:rpbob 2.2s ease-in-out infinite}
#nr .rp-sec{margin:10px 0 0}#nr .rp-sec h3{margin:0 0 5px;font:900 13px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}
#nr .rp-room{background:rgba(127,127,160,.14);border-radius:14px;padding:8px 10px;margin-bottom:6px;font:600 13px/1.45 system-ui,sans-serif}
#nr .rp-room .sb{display:inline-block;vertical-align:middle;width:90px;height:7px;border-radius:4px;background:rgba(127,127,160,.3);overflow:hidden;margin:0 6px}#nr .rp-room .sb i{display:block;height:100%;border-radius:4px}
#nr .rp-room small{opacity:.75}#nr .rp-room .so{background:#2fbf71;color:#fff;border-radius:6px;padding:0 6px;font-size:10px;margin-left:4px}
#nr .rp-tab{width:100%;border-collapse:collapse;font:600 13px/1.5 system-ui,sans-serif}#nr .rp-tab td:last-child{text-align:right;font-variant-numeric:tabular-nums}
#nr .rp-list div{font:600 13px/1.45 system-ui,sans-serif;padding:3px 0 3px 22px;position:relative}#nr .rp-list div:before{content:attr(data-i);position:absolute;left:0}
#nr .up{color:#2fbf71}#nr .dn{color:#ff5a43}
@keyframes rpin{to{opacity:1;transform:none}}
@keyframes rpbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes rpwob{0%,70%,100%{transform:rotate(0)}76%{transform:rotate(-12deg)}84%{transform:rotate(10deg)}92%{transform:rotate(-6deg)}}
@keyframes rpspin{0%,60%,100%{transform:rotateY(0)}80%{transform:rotateY(360deg)}}
@keyframes rppulse{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes rpflt{0%,100%{transform:translate(0,0)}50%{transform:translate(3px,-4px) rotate(4deg)}}
@keyframes rppop{0%{transform:scale(1)}30%{transform:scale(1.5) rotate(-10deg)}60%{transform:scale(.9) rotate(6deg)}100%{transform:scale(1)}}
@keyframes rpsh{0%,55%{left:-60%}100%{left:130%}}
/* manager moves */
@keyframes mhic{0%,100%{transform:none}10%{transform:translateY(-9px) scaleY(1.05)}22%{transform:translateY(2px) scaleY(.96)}34%{transform:none}}
@keyframes mshake{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg) skewX(3deg)}75%{transform:rotate(4deg) skewX(-3deg)}}
@keyframes mbop{0%,100%{transform:rotate(-6deg) translateY(0)}50%{transform:rotate(6deg) translateY(-4px)}}
@keyframes mtilt{0%,100%{transform:none}40%,70%{transform:rotate(-7deg) translateY(-2px)}}
@keyframes mnod{0%,100%{transform:none}50%{transform:translateY(4px) rotate(2deg)}}
@keyframes msneeze{0%,55%{transform:none}65%{transform:translateY(-6px) scale(1.04)}78%{transform:translateY(5px) scaleY(.92)}100%{transform:none}}
@keyframes mchew{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.95) translateY(2px)}}
.mv-hic .hd{animation:mhic .55s ease-in-out 3}
.mv-hair .hd{animation:mshake .12s linear infinite}
.mv-bop .hd{animation:mbop .5s ease-in-out infinite}
.mv-tilt .hd{animation:mtilt 2.6s ease-in-out}
.mv-nod .hd{animation:mnod 1.2s ease-in-out infinite}
.mv-sneeze .hd{animation:msneeze 1.6s ease-in-out}
.mv-chew .hd{animation:mchew .35s ease-in-out infinite}
@keyframes mbreath{0%,100%{transform:scale(1,1)}50%{transform:scale(1.015,1.025)}}
@keyframes blink{0%,91%,100%{transform:scaleY(0)}94%{transform:scaleY(1)}}
@keyframes mlaugh{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-4px) rotate(-3deg)}75%{transform:translateY(-4px) rotate(3deg)}}
@keyframes mdrop{0%,100%{transform:none}55%{transform:rotate(9deg) translateY(5px)}62%{transform:rotate(-2deg)}70%{transform:none}}
@keyframes mslow{0%,100%{transform:scale(1)}50%{transform:scale(1.04,1.05) translateY(-2px)}}
@keyframes mdance{0%,100%{transform:translate(-5px,0) rotate(-7deg)}25%{transform:translate(0,-6px) rotate(0)}50%{transform:translate(5px,0) rotate(7deg)}75%{transform:translate(0,-6px) rotate(0)}}
.mv-laugh .hd{animation:mlaugh .18s ease-in-out infinite}
.mv-drop .hd{animation:mdrop 3s ease-in-out}
.mv-slow .hd{animation:mslow 2.4s ease-in-out infinite}
.mv-dance .hd{animation:mdance .6s ease-in-out infinite}
/* props */
@keyframes pflash{0%,78%,100%{opacity:0}83%{opacity:.92}}
@keyframes pbird{0%{transform:translate(70px,-40px) rotate(20deg);opacity:0}25%{opacity:1}45%,80%{transform:translate(0,0) rotate(0)}100%{transform:translate(0,-8px);opacity:0}}
@keyframes pdrink{0%{transform:translate(34px,30px) rotate(0)}25%,70%{transform:translate(8px,-12px) rotate(-30deg)}85%,100%{transform:translate(34px,30px) rotate(0)}}
@keyframes ppuff{0%{opacity:0;transform:translate(0,0) scale(.4)}20%{opacity:.9}100%{opacity:0;transform:translate(14px,-46px) scale(1.7)}}
@keyframes pfade{0%{opacity:0;transform:scale(.4)}15%,85%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.6)}}
@keyframes pwind{0%{opacity:0;transform:translateX(0)}30%{opacity:1}100%{opacity:0;transform:translateX(-26px)}}
@keyframes pbuzz{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes pdab{0%{transform:translate(40px,34px) rotate(20deg)}20%,45%{transform:translate(18px,4px) rotate(0)}30%{transform:translate(20px,6px) rotate(-12deg)}60%,100%{transform:translate(40px,34px) rotate(20deg)}}
@keyframes pwig{0%{transform:translateY(-70px) rotate(-25deg);opacity:0}30%{transform:translateY(2px) rotate(4deg);opacity:1}42%{transform:translateY(-3px)}52%,82%{transform:none;opacity:1}100%{transform:translateY(-70px) rotate(35deg);opacity:0}}
@keyframes pglass{0%{transform:translateY(-50px);opacity:0}25%{transform:translateY(3px);opacity:1}35%,90%{transform:none;opacity:1}100%{opacity:0}}
@keyframes pgum{0%{transform:scale(.1)}70%{transform:scale(1.6)}72%{transform:scale(.2)}100%{transform:scale(.1)}}
@keyframes psteam{0%{opacity:0;transform:translateY(0)}30%{opacity:.8}100%{opacity:0;transform:translateY(-26px) scale(1.4)}}
@keyframes pflyc{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx),-70px) rotate(var(--dr))}}
@keyframes pdots{0%,100%{opacity:.2}50%{opacity:1}}
.mgs .pr .t{font:900 15px system-ui,sans-serif;color:#fff;text-shadow:0 0 3px #000,0 2px 0 #000;white-space:nowrap}
.mgs .pr .wig{left:17%;top:2%;width:66%;height:36%;background:var(--wc);border-radius:50% 50% 16% 16%;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18);animation:pwig 3.4s ease-out forwards}
.mgs .pr .wig.afro{left:6%;top:-12%;width:88%;height:52%;border-radius:50%}
.mgs .pr .wig.bob{left:12%;width:76%;height:62%;border-radius:45% 45% 8% 8%;clip-path:polygon(0 0,100% 0,100% 100%,82% 100%,82% 42%,18% 42%,18% 100%,0 100%)}
.mgs .pr .wig.beehive{left:22%;top:-14%;width:56%;height:54%;border-radius:50% 50% 30% 30%}
.mgs .pr .wig.mohawk{left:42%;top:-12%;width:16%;height:44%;border-radius:40% 40% 10% 10%}
.mgs .pr .wig.rainbow{background:linear-gradient(90deg,#ff3d3d,#ffb02e,#f7e13c,#3ed16b,#35b6ff,#9b6bff)}
@media (prefers-reduced-motion:reduce){#nr .mgs .hd,#nr .mgs .bl,#nr .mgs .pr *,#nr .tl .ic,#nr .rp-net .ic,#nr .rp-net:after,#nr .rp-chips b{animation:none!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const P=(s,style,cls)=>`<span class="${cls||''}" style="${style}">${s}</span>`;
const puffs=(x,y,n)=>Array.from({length:n||3},(_,i)=>P('☁️',`left:${x}%;top:${y}%;font-size:${14+i*3}px;opacity:0;animation:ppuff 1.6s ease-out ${i*.5}s infinite`)).join('');
const wigs=['#ff3d9a','#35b6ff','#3ed16b','#9b6bff','#f7a21a','#e8e8ee','#ff5a43','#222'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
// each move: [name, ms, body class, caption, props() -> html]
const MOVES=[
['drink',3200,'mv-tilt',['Saúde! 🍻','Cheers, my friend!','Only a little one...','To the night!'],()=>P(pick(['🍺','🍷','🥂','🍸','🍹','🥃','🧉']),'left:46%;top:56%;font-size:34px;animation:pdrink 3s ease-in-out forwards')],
['smoke',3600,'mv-nod',['Just one. For the nerves.','Do not tell Esmeralda.','Smoke break!'],()=>P('🚬','left:48%;top:60%;font-size:24px;transform:rotate(-20deg);animation:pdab 3.2s ease-in-out infinite')+puffs(54,52,3+Math.floor(Math.random()*3))],
['hiccup',2200,'mv-hic',['…*hic*… sorry!','Hic! Too much vinho.','Hic! Scare me!'],()=>P(pick(['HIC!','HIC!!','hic']),'left:60%;top:2%;animation:pfade 1.9s ease-out forwards;color:#ffd400','t')+P('🫧','left:8%;top:30%;font-size:16px;animation:pfade 1.9s .3s ease-out forwards')],
['hairdryer',3400,'mv-hair',['Hair is life, my friend.','Blow-dry before the doors open.','Volume! More volume!'],()=>P('💨','left:2%;top:22%;font-size:20px;animation:pwind .7s linear infinite')+P('💨','left:-6%;top:40%;font-size:18px;animation:pwind .7s .25s linear infinite')+P('🌬️','left:70%;top:14%;font-size:34px;transform:scaleX(-1);animation:pbuzz .15s linear infinite')+P('✨','left:30%;top:0;font-size:16px;animation:pfade 1.2s .4s infinite')],
['makeup',3600,'mv-tilt',['Ready for the cameras.','A touch of lipstick.','Concealer: my best friend.'],()=>P('🪞','left:62%;top:58%;font-size:28px;animation:pbuzz 1s ease-in-out infinite')+P('💄','left:44%;top:50%;font-size:26px;animation:pdab 2.4s ease-in-out infinite')+P('','left:20%;top:50%;width:16%;height:10%;border-radius:50%;background:rgba(255,80,140,.55);animation:pdots 1s ease-in-out infinite')+P('','left:64%;top:50%;width:16%;height:10%;border-radius:50%;background:rgba(255,80,140,.55);animation:pdots 1s .3s ease-in-out infinite')],
['powder',3000,'mv-nod',['A little powder, a lot of attitude.','Shine control!'],()=>P('🪭','left:60%;top:10%;font-size:28px;animation:pbuzz .5s ease-in-out infinite')+puffs(30,46,2).replace(/☁️/g,'✨')],
['wig',4200,'mv-bop',['New look. Who dis?','Is this wig on straight?','Wig night!','Trust me, it is natural.'],()=>{const k=pick(['','afro','bob','mohawk','rainbow','beehive']);return `<span class="wig ${k}" style="--wc:${pick(wigs)}"></span>`+P('💇','left:70%;top:2%;font-size:22px;animation:pfade 3.6s ease-out forwards')}],
['shades',3600,'mv-bop',['Too bright in here.','Cool? Cool.','Incognito mode.'],()=>P('🕶️','left:26%;top:30%;font-size:44px;animation:pglass 3.4s ease-out forwards')+P('🎵','left:78%;top:10%;font-size:20px;animation:ppuff 1.4s ease-out infinite')+P('🎶','left:2%;top:20%;font-size:18px;animation:ppuff 1.4s .6s ease-out infinite')],
['phone',3400,'mv-nod',['The club is trending!','Three new followers!','Reading the reviews...'],()=>P('📱','left:56%;top:56%;font-size:34px;animation:pbuzz 1.4s ease-in-out infinite')+P(pick(['❤️','🔥','💬']),'left:78%;top:34%;font-size:18px;animation:ppuff 1.2s ease-out infinite')+P('👍','left:84%;top:46%;font-size:16px;animation:ppuff 1.2s .5s ease-out infinite')],
['coffee',3400,'mv-tilt',['Third espresso. Or fifth.','Coffee. Then more coffee.','Bica, por favor.'],()=>P(pick(['☕','🍵','🧋']),'left:46%;top:56%;font-size:32px;animation:pdrink 3.2s ease-in-out forwards')+P('♨️','left:60%;top:30%;font-size:18px;animation:psteam 1.5s ease-out infinite')],
['yawn',3000,'mv-nod',['So... sleepy...','Is it Wednesday yet?','*yaaawn*'],()=>P('💤','left:70%;top:8%;font-size:22px;animation:ppuff 2s ease-out infinite')+P('💤','left:80%;top:18%;font-size:16px;animation:ppuff 2s .8s ease-out infinite')],
['cash',3400,'mv-bop',['Counting every cent.','Money, money, money!','Where did the coins go?'],()=>Array.from({length:5},(_,i)=>P(i%2?'💶':'💵',`left:${20+i*14}%;top:70%;font-size:22px;--dx:${(i-2)*14}px;--dr:${(i-2)*40}deg;animation:pflyc 1.6s ${i*.3}s ease-out infinite`)).join('')],
['sneeze',2400,'mv-sneeze',['Ah... ah... ACHOO!','Saúde! Oh, that was me.'],()=>P('🤧','left:64%;top:6%;font-size:26px;animation:pfade 2.2s forwards')+P('💦','left:48%;top:62%;font-size:20px;animation:ppuff 1s 1s ease-out forwards')],
['eat',3400,'mv-chew',['Dinner, finally.','Bifana break!','Mmm... pastel de nata.'],()=>P(pick(['🌯','🥪','🍔','🌭','🥐','🍕','🥮']),'left:46%;top:56%;font-size:34px;animation:pdrink 3.2s ease-in-out forwards')],
['gum',3400,'mv-nod',['Pop!','Bubble trouble.'],()=>P('🫧','left:44%;top:56%;font-size:26px;animation:pgum 2.2s ease-in-out infinite')],
['mic',3200,'mv-bop',['Check, one, two...','Is this thing on?','Testing, testing!'],()=>P('🎤','left:50%;top:56%;font-size:30px;animation:pbuzz .6s ease-in-out infinite')+P('🔊','left:78%;top:34%;font-size:20px;animation:pdots .8s ease-in-out infinite')],
['party',3400,'mv-bop',['Another one for the books!','Confetti time!'],()=>Array.from({length:6},(_,i)=>P(pick(['🎉','🎊','✨','⭐']),`left:${10+i*14}%;top:70%;font-size:18px;--dx:${(i-3)*12}px;--dr:${(i-3)*50}deg;animation:pflyc 1.5s ${i*.22}s ease-out infinite`)).join('')+P('🥳','left:62%;top:2%;font-size:24px;animation:pbuzz .4s linear infinite')],
['vape',3200,'mv-nod',['It is just steam, officer.','Blueberry cloud!'],()=>P('💨','left:50%;top:52%;font-size:22px;animation:ppuff 1.8s ease-out infinite')+P('💨','left:42%;top:48%;font-size:30px;animation:ppuff 1.8s .8s ease-out infinite')],
['news',3600,'mv-nod',['Boring. Where is the gossip?','Page 3 is about us!','Nothing but football.'],()=>P('📰','left:20%;top:34%;font-size:64px;animation:pbuzz 2s ease-in-out infinite')],
['watch',3000,'mv-tilt',['Is it morning yet?','Time flies, money flies.','Late again, Esmeralda?'],()=>P('⌚','left:52%;top:58%;font-size:28px;animation:pdab 2.6s ease-in-out infinite')+P('⏰','left:74%;top:6%;font-size:22px;animation:pbuzz .12s linear infinite')],
['selfie',3200,'mv-tilt',['Smile! Say Hard Club!','Selfie with the profit.','Good side, bad side...'],()=>P('🤳','left:58%;top:46%;font-size:36px;animation:pbuzz 1.2s ease-in-out infinite')+P('','left:0;top:0;width:100%;height:100%;border-radius:16px;background:#fff;opacity:0;animation:pflash 2.4s infinite')],
['flex',3000,'mv-bop',['This is my gym.','Carrying the whole club.','Look at these arms!'],()=>P('💪','left:0;top:56%;font-size:34px;animation:pbuzz .5s ease-in-out infinite')+P('💪','left:70%;top:56%;font-size:34px;transform:scaleX(-1);animation:pbuzz .5s .2s ease-in-out infinite')],
['kiss',2800,'mv-tilt',['Kisses for the crowd!','Muah!','Beijinho!'],()=>P('😘','left:66%;top:20%;font-size:28px;animation:pfade 2.4s forwards')+P('💋','left:60%;top:40%;font-size:20px;animation:ppuff 1.4s ease-out infinite')+P('❤️','left:80%;top:30%;font-size:16px;animation:ppuff 1.4s .6s ease-out infinite')],
['laugh',2800,'mv-laugh',['Ha ha ha ha!','Oh, that was good!','I cannot breathe!'],()=>P('😂','left:62%;top:4%;font-size:26px;animation:pbuzz .2s linear infinite')+P('💦','left:14%;top:30%;font-size:16px;animation:ppuff 1s ease-out infinite')],
['angry',2800,'mv-hair',['Who touched the thermostat?!','Where is my clipboard?!','NO standing on the speakers!'],()=>P('💢','left:62%;top:6%;font-size:30px;animation:pbuzz .15s linear infinite')+P('💢','left:8%;top:14%;font-size:20px;animation:pbuzz .12s linear infinite')],
['call',3600,'mv-nod',['Alô? Yes, tonight is sold out!','Send more ice. NOW.','The DJ is late? Again?'],()=>P('📞','left:66%;top:34%;font-size:34px;animation:pbuzz .6s ease-in-out infinite')+P('💬','left:78%;top:12%;font-size:18px;animation:ppuff 1.6s ease-out infinite')],
['nap',3600,'mv-drop',['Zzz... I am awake!','Five minutes...','Zzz... bifana... zzz...'],()=>P('💤','left:70%;top:6%;font-size:24px;animation:ppuff 1.8s ease-out infinite')+P('💤','left:82%;top:18%;font-size:16px;animation:ppuff 1.8s .8s ease-out infinite')],
['bird',3400,'mv-slow',['A new fan!','Pombo! Get off my hair!','Even the birds like us.'],()=>P(pick(['🐦','🕊️','🦜']),'left:36%;top:-4%;font-size:30px;animation:pbird 3s ease-out forwards')+P('🎵','left:78%;top:8%;font-size:16px;animation:ppuff 1.4s .8s ease-out infinite')],
['dance',3400,'mv-dance',['Nobody is watching... dance!','Boogie time!','Move it, move it!'],()=>P('🕺','left:70%;top:46%;font-size:30px;animation:pbuzz .5s linear infinite')+P('💃','left:-2%;top:46%;font-size:30px;animation:pbuzz .5s .25s linear infinite')+P('🎶','left:44%;top:0;font-size:20px;animation:ppuff 1.2s ease-out infinite')],
['dj',3400,'mv-bop',['DJ Manager in the house!','Drop the bass!','This one is for you.'],()=>P('🎧','left:12%;top:-10%;font-size:70px;transform:none;animation:pfade 3.2s forwards')+P('🎵','left:80%;top:6%;font-size:18px;animation:ppuff 1.2s ease-out infinite')+P('🎶','left:4%;top:30%;font-size:18px;animation:ppuff 1.2s .5s ease-out infinite')],
['zen',3600,'mv-slow',['Breathe... profit... breathe.','Ommm. Ommm. Invoice.'],()=>P('☮️','left:68%;top:6%;font-size:22px;animation:pbuzz 3s ease-in-out infinite')+P('✨','left:10%;top:20%;font-size:16px;animation:pfade 2s infinite')+P('✨','left:80%;top:40%;font-size:14px;animation:pfade 2s .8s infinite')],
];

function run(root,quote0){
  const pr=root.querySelector('.pr'),say=root.querySelector('.rp-say .tx'),box=root;
  let last=-1,alive=true;
  const next=()=>{
    if(!alive||!document.body.contains(root)||$('nr').style.display==='none'){alive=false;return;}
    let i;do i=Math.floor(Math.random()*MOVES.length);while(i===last);last=i;
    const m=MOVES[i];
    MOVES.forEach(x=>box.classList.remove('mv-'+x[2].slice(3)));
    box.className='mgs '+m[2];
    pr.innerHTML=m[4]();
    if(say)say.textContent=pick(m[3]);
    const pic=box.querySelector('.hd');pic.style.animation='none';void pic.offsetWidth;pic.style.animation='';
    setTimeout(()=>{if(!alive)return;pr.innerHTML='';box.className='mgs';if(say)say.textContent=quote0;setTimeout(next,Math.random()<.3?120:500+Math.random()*1300);},m[1]);
  };
  setTimeout(next,700);
  return ()=>{alive=false;};
}

const fmt=v=>(v<0?'-':'')+'€'+Math.abs(Math.round(v)).toLocaleString('en-GB');
function countUp(el,to,delay,sign){
  const t0=performance.now()+delay,D=900;
  const f=now=>{if(!el.isConnected)return;const p=Math.max(0,Math.min(1,(now-t0)/D)),e=1-Math.pow(1-p,3),v=to*e;
    el.textContent=(sign&&to>0?(sign):'')+fmt(v);if(p<1)requestAnimationFrame(f);};
  requestAnimationFrame(f);
}


function details(r,net){
  const B=S.nb||{cash:S.cash,hyp:S.hyp,cul:S.cul,her:S.her,lv:S.lv,xp:S.xp,fame:{...S.fame}},G=S.ng||[],L=S.nlog||[],U=S.up,T=G.reduce((s,g)=>s+g.att,0);
  const dl=(a,b)=>{const d=Math.round(b-a);return `<b class="${d>0?'up':d<0?'dn':''}">${d>0?'+':''}${d}</b>`;};
  const sb=(v,m,c)=>`<span class="sb"><i style="width:${Math.max(0,Math.min(100,m?100*v/m:0))}%;background:${c}"></i></span>`;
  const good=[],bad=[],tip=[],has=re=>L.some(x=>re.test(x));
  G.forEach(g=>{const f=g.att/g.cap,p=Math.round(f*100),inc=g.tk+g.ck+g.mr;
    if(g.sold)good.push(`Room ${g.r} sold out — ${g.att}/${g.cap}`);else if(f>=.7)good.push(`Room ${g.r} packed at ${p}%`);else if(f<.4)bad.push(`Room ${g.r} only ${p}% full (${g.att}/${g.cap})`);
    if(inc<g.cs)bad.push(`${g.nm} cost ${fmt(g.cs)} but brought in ${fmt(inc)}`);else good.push(`${g.nm} paid off: ${fmt(inc-g.cs)} after costs`);});
  if(!G.length)bad.push('No events booked — a dark night');
  net>0?good.push('Profitable night: '+fmt(net)):bad.push('Lost '+fmt(-net)+' tonight');
  if(S.hyp>B.hyp+1)good.push('Hype up '+Math.round(S.hyp-B.hyp));else if(S.hyp<B.hyp)bad.push('Hype down '+Math.round(B.hyp-S.hyp));
  if(S.lv>B.lv)good.push('Levelled up to LV '+S.lv+'!');
  L.forEach(x=>{if(/turned away|incident|toilet|noise/.test(x))bad.push(x.charAt(0).toUpperCase()+x.slice(1));});
  if(has(/turned away/))tip.push(U.tix<3?'Upgrade the Ticket office: +350 door capacity':'Door is maxed — split the crowd over two rooms');
  if(has(/toilet/))tip.push('Place more Portable WCs — toilet queues cost hype');
  if(has(/incident/)&&U.sec<3)tip.push('Upgrade Security to cut incidents and fines');
  if(has(/noise/)&&U.snd<3)tip.push('A better Sound system means fewer noise complaints');
  if(G.some(g=>g.att/g.cap<.4))tip.push('Low turnout: build hype by day, or book a cheaper act');
  if(G.some(g=>g.sold))tip.push('You sold out — book a bigger act or use the bigger room');
  if(U.cloak===0&&T>150)tip.push('Build a Cloakroom to earn from every guest');
  if(U.bar<3&&T>200)tip.push('More Bar staff = +20% bar sales');
  if(!G.length)tip.push('Book an act in the Night tab before 22:00');
  if(S.her<B.her-1)tip.push('Heritage is slipping — mix in acoustic / cultural nights');
  if(!tip.length)tip.push('Smooth night — push for bigger acts and keep the streak going');
  const li=(a,i)=>a.length?a.map(x=>`<div data-i="${i}">${x}</div>`).join(''):`<div data-i="·">—</div>`;
  const row=(a,b)=>`<tr><td>${a}</td><td>${b}</td></tr>`;
  const rooms=G.length?G.map(g=>{const f=g.att/g.cap;return `<div class="rp-room"><b>Room ${g.r}</b> · ${g.nm}${g.sold?'<span class="so">SOLD OUT</span>':''}<br>👥 ${g.att}/${g.cap}${sb(g.att,g.cap,g.sold?'#2fbf71':f<.4?'#ff5a43':'#f2c94c')}${Math.round(f*100)}%<br><small>🎫 ${fmt(g.tk)} · 🧥 ${fmt(g.ck)} · 👕 ${fmt(g.mr)} · cost -${fmt(g.cs)} → </small><b class="${g.tk+g.ck+g.mr>=g.cs?'up':'dn'}">${fmt(g.tk+g.ck+g.mr-g.cs)}</b></div>`;}).join(''):`<div class="rp-room">No acts tonight.</div>`;
  const fm=Object.keys(GEN).filter(g=>Math.floor(S.fame[g])!==Math.floor(B.fame[g])).map(g=>row(GEN[g].ic+' '+GEN[g].n+' fame',Math.floor(B.fame[g])+' → '+Math.floor(S.fame[g])+' '+dl(B.fame[g],S.fame[g]))).join('');
  return `<div class="rp-sec"><h3>🎶 Rooms</h3>${rooms}<small style="opacity:.75">Total crowd ${T}${T?' · bars '+fmt(r.bar/T)+' per head':''}</small></div>
   <div class="rp-sec"><h3>📈 Progress</h3><table class="rp-tab">${row('💰 Cash',fmt(B.cash)+' → '+fmt(S.cash)+' '+dl(B.cash,S.cash))+row('🔥 Hype',Math.round(B.hyp)+' → '+Math.round(S.hyp)+' '+dl(B.hyp,S.hyp))+row('🎭 Culture',Math.round(B.cul)+' → '+Math.round(S.cul)+' '+dl(B.cul,S.cul))+row('🏛️ Heritage',Math.round(B.her)+' → '+Math.round(S.her)+' '+dl(B.her,S.her))+row('⭐ Level','LV '+S.lv+(S.lv>B.lv?' ⬆️':'')+' · '+Math.floor(S.xp)+'/'+need(S.lv)+' XP')+fm}</table></div>
   <div class="rp-sec rp-list"><h3 class="up">✅ What went well</h3>${li(good,'👍')}</div>
   <div class="rp-sec rp-list"><h3 class="dn">❌ What went wrong</h3>${li(bad,'👎')}</div>
   <div class="rp-sec rp-list"><h3 style="color:#f2c94c">💡 What could be better</h3>${li(tip,'➡️')}</div>`;
}
window.showReport=showReport=function(){
  const r=S.rep,net=r.tix+r.bar+r.cloak+r.merch-r.cost-r.fine;
  S.rs=S.speed||2;S.speed=0;
  const tiles=[
    ['in','🎫','Tickets',r.tix,'rpbob'],['in','🍺','Bars',r.bar,'rpwob'],
    ['in','🧥','Cloakroom',r.cloak,'rpflt'],['in','👕','Merch',r.merch,'rppulse'],
    ['out','🎤','Acts & staff',-r.cost,'rpspin'],['out','⚠️','Incidents',-r.fine,'rpwob']];
  const mx=Math.max(1,...tiles.map(t=>Math.abs(t[3])));
  const fame=Object.keys(GEN).map(g=>`<span><b style="animation-delay:${Math.random()*2}s">${GEN[g].ic}</b>${Math.floor(S.fame[g])}</span>`).join('');
  const quote=net>0?'Fantastic night, my friend! Money, music, mayhem.':'Easy come, easy go, baby... we bleed tonight.';
  $('nr').innerHTML=`<div class="rp"><div class="rp-bar"><span class="rp-grip"></span><button class="rp-x" aria-label="Close report">✕</button></div>
   <div class="rp-top"><div class="mgs"><div class="hd">${av(MGN).replace("class='av'","class='pic'")}<i class="bl"></i><i class="bl r"></i></div><div class="pr"></div></div>
    <div class="rp-say"><small>Night manager</small><span class="tx">${quote}</span></div></div>
   <div class="rp-h"><img src='${LOGO_URL}'><h2 class="px">Night report · ${DN[dow()]}</h2></div>
   <div class="rp-net ${net<0?'neg':''}"><span class="ic">${net>0?'🤑':net<0?'😭':'😐'}</span><div class="lb">Net profit</div><div class="nv" id="rpnet">€0</div></div>
   <div class="rp-grid">${tiles.map((t,i)=>`<div class="tl ${t[0]}" style="animation-delay:${.15+i*.09}s;--an:${t[4]};--du:${2.2+(i%3)*.5}s;--dl:${i*.35}s"><span class="ic">${t[1]}</span><span class="nv" data-v="${t[3]}">€0</span><span class="lb">${t[2]}</span><span class="bar"><i data-w="${Math.round(Math.abs(t[3])/mx*100)}"></i></span></div>`).join('')}</div>
   <div class="rp-chips">${fame}<span><b>🛒</b>${fmt(S.earn)} market</span><span><b>⭐</b>${RNK[rankIdx()]} · ${Math.floor(S.pr)} pts</span></div>
   ${details(r,net)}
   <button id="nrb">Next morning</button></div>`;
  $('nr').style.display='flex';
  const root=$('nr').querySelector('.mgs');
  const stop=run(root,quote);
  countUp($('rpnet'),net,500);
  $('nr').querySelectorAll('.tl .nv').forEach((e,i)=>countUp(e,+e.dataset.v,300+i*90));
  setTimeout(()=>$('nr').querySelectorAll('.tl .bar i').forEach(b=>b.style.width=b.dataset.w+'%'),400);
  const tl=[...$('nr').querySelectorAll('.tl')];
  const pop=setInterval(()=>{if($('nr').style.display==='none'){clearInterval(pop);return;}const t=pick(tl);t.classList.remove('pop');void t.offsetWidth;t.classList.add('pop');},1800);
  let closed=false;const sheet=$('nr').firstElementChild;
  const done=()=>{if(closed)return;closed=true;stop();clearInterval(pop);sheet.style.transform='';sheet.style.transition='';$('nr').style.display='none';S.speed=S.rs;endDay();ui();};
  $('nrb').onclick=done;$('nr').querySelector('.rp-x').onclick=done;
  let y0=null,dy=0,t0=0;
  const start=y=>{y0=y;dy=0;t0=performance.now();sheet.style.transition='none';};
  const move=y=>{if(y0==null)return;dy=Math.max(0,y-y0);sheet.style.transform='translateY('+dy+'px)';};
  const end=()=>{if(y0==null)return;const fast=dy/(performance.now()-t0)>.6;y0=null;sheet.style.transition='transform .22s ease-out';if(dy>110||(fast&&dy>40)){sheet.style.transform='translateY(110%)';setTimeout(done,200);}else sheet.style.transform='';};
  const bar=sheet.querySelector('.rp-bar');
  bar.addEventListener('pointerdown',e=>{if(e.target.closest('.rp-x'))return;bar.setPointerCapture(e.pointerId);start(e.clientY);});
  bar.addEventListener('pointermove',e=>move(e.clientY));bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end);
  sheet.addEventListener('touchstart',e=>{if(e.target.closest('.rp-bar')||sheet.scrollTop>0)return;start(e.touches[0].clientY);},{passive:true});
  sheet.addEventListener('touchmove',e=>{if(y0==null)return;move(e.touches[0].clientY);if(dy>0)e.preventDefault();},{passive:false});
  sheet.addEventListener('touchend',end);sheet.addEventListener('touchcancel',end);
  sfx(net>0?'goal':'bad');
};
})();
