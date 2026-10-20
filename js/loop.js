/* MF Borges Tycoon - loop module (split from the single-file game; loads in order, shares global scope) */
// ---------- loop & lighting ----------
const CD=new THREE.Color(0xbcd6ea),CG=new THREE.Color(0xf0a56a),CN=new THREE.Color(0x070913),SG=new THREE.Color(0xff9a55),SM=new THREE.Color(0x6a7fc0),HN=new THREE.Color(0x1b2250),HGN=new THREE.Color(0x0b0c14),BB=new THREE.Color(0xffe0a0),tmp=new THREE.Color(),tint=$('tint'),vig=$('vig');
let last=performance.now(),uT=0,LK=0,GD=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1e3);last=now;const tt=now/1000;
if(!S.over){Pp.mv=0;move(dt);
if(S.speed){const old=S.ph,dm=dt*6*S.speed;S.t+=dm;showClose();const np=phase(S.t/60);gigTick(dm);tickStalls(dm);if(np==='day'||np==='night')sales(dm,np);
if(np!==old){S.ph=np;if(np==='setup'){morning();reskin(0);dressMgr(0);}if(np==='changeover'){S.log=SHOW.on?'Early closing: the band is soundchecking, vendors pack up!':'Closing time: vendors pack up and the dance begins.';stow();}if(np==='night'){night();reskin(1);dressMgr(1);}if(np==='end')showReport();ui();}
uT+=dt;if(uT>.25){uT=0;ui();}}}
VW.az+=(VW.azT-VW.az)*Math.min(1,dt*8);VW.el+=(VW.elT-VW.el)*Math.min(1,dt*8);if(VW.follow){VW.tx+=(Pp.x-VW.tx)*Math.min(1,dt*6);VW.tz+=(Pp.z-VW.tz)*Math.min(1,dt*6);}upd();
Pp.y=gy(Pp.x,Pp.z);PL.position.set(Pp.x,Pp.y,Pp.z);swing(PL,Pp.mv?Math.sin(now/90)*.8:0);mk.position.set(Pp.x,Pp.y+1.3+Math.sin(now/250)*.06,Pp.z);mk.rotation.set(.6,now/400,.6);
const h=S.t/60,k=S.ph==='night'?1:S.ph==='changeover'?Math.min(1,(h-CLOSE)/(22-CLOSE)):0,gd=Math.max(0,Math.min(1,(h-16.5)/3.5))*(1-k),nt=S.ph==='night',fx=.7+.3*Math.sin(now/120);
LK+=(k-LK)*Math.min(1,dt*2.5);GD+=(gd-GD)*Math.min(1,dt*2.5);
tmp.copy(CD).lerp(CG,GD).lerp(CN,LK);R.setClearColor(tmp);
sun.color.setHex(0xfff4dd).lerp(SG,GD).lerp(SM,LK);sun.intensity=1-.78*LK;const a=Math.max(0,Math.min(1,(h-11)/10)),an=Math.PI*(.1+.8*a);
sun.position.set(20+Math.cos(an)*24,12+Math.sin(Math.PI*a)*10,10.5+Math.sin(an)*14);
hemi.color.setHex(0xdfeaff).lerp(HN,LK);hemi.groundColor.setHex(0x7a6a5a).lerp(HGN,LK);hemi.intensity=.85-.62*LK;
LA.intensity=LB.intensity=LC.intensity=LD.intensity=1.3*LK+.35*GD;BM.color.setHex(0x6e6247).lerp(BB,Math.min(1,LK+GD*.4));
tint.style.background=`rgba(${Math.round(255-225*LK)},${Math.round(150-100*LK)},${Math.round(70+80*LK)},${(.13*GD*(1-LK)+.2*LK).toFixed(3)})`;vig.style.opacity=SET.fx?(.5+.5*LK).toFixed(2):0;tint.style.opacity=SET.fx?1:0;
const e1=nt&&S.att[1],e2=nt&&S.att[2];L1.intensity=e1?2.2*fx*(1+.25*S.up.lit):0;L2.intensity=e2?2.2*fx*(1+.25*S.up.lit):0;L1.color.setHSL(gh(1,tt),.9,.55);L2.color.setHSL(gh(2,tt),.9,.55);
P1.material.opacity=e1?.16+.08*Math.sin(tt*6):0;P1.material.color.setHSL(gh(1,tt),1,.5);P2.material.opacity=e2?.16+.08*Math.sin(tt*6):0;P2.material.color.setHSL(gh(2,tt),1,.5);
SL.forEach((s,i)=>{const on=nt&&S.att[s.r];s.m.material.color.setHSL(on?(gh(s.r,tt)+i*(AC[S.act[s.r]].g==='techno'?.18:.02)+1)%1:0,on?.9:0,on?.6:.15);});
LABS.forEach(s=>s.visible=!!SET.lab&&VW.hw<9);
let want=[0,0,0,0,0,0,0,0,0];
if(nt){const e=S.att[1]||S.att[2],a1=Math.min(35,Math.round(S.att[1]/20)),a2=Math.min(35,Math.round(S.att[2]/20)),cr=a1+a2;want=[e?10:0,a1,a2,e?14:0,0,Math.round(cr*.1),Math.round(cr*.05),Math.round(cr*.05),Math.round(cr*.05)];}
else{const tot=Math.min(80,Math.round(8+stalls.size*3*S.foot*(.7+S.cul/100))),w=[1.4+cnt(0),1+cnt(1),1+cnt(2),1.6+cnt(3),.6+cnt(4)],sw=w.reduce((x,y)=>x+y);want=w.map(x=>Math.round(tot*x/sw)).concat([Math.max(1,Math.round(tot*.05)),Math.round(tot*.025),Math.round(tot*.02),Math.round(tot*.025)]);}
const asg=[];for(const ar of [5,6,7,8,0,1,2,3,4])for(let i=0;i<want[ar];i++)asg.push(ar);
V.forEach((v,i)=>{const u=v.userData,ar=asg[i];v.visible=ar!==undefined;if(!v.visible)return;
if(u.a!==ar){u.a=ar;const p=AT[ar][Math.floor(Math.random()*AT[ar].length)];v.position.set(p[0],0,p[1]);u.tx=p[0];u.tz=p[1];}
const dx=u.tx-v.position.x,dz=u.tz-v.position.z,d=Math.hypot(dx,dz),dn=nt&&(ar===1||ar===2);if(d<.15)tg(v);else{const sp=u.sp*dt*(dn?2:1);v.position.x+=dx/d*sp;v.position.z+=dz/d*sp;v.rotation.y=Math.atan2(dx,dz);}
const gn=dn?AC[S.act[ar]].g:'',fs=gn==='metal'?2.2:gn==='rock'?1.4:gn==='indie'?.8:1;v.position.y=Math.abs(Math.sin(now*fs/180+i))*(dn?(gn==='metal'?.2:.12):.04);if(dn&&gn==='metal')v.rotation.y+=Math.sin(now/60+i)*.3;if(v.hd)v.hd.rotation.x=dn&&gn==='metal'?Math.sin(now/80+i)*.7:dn?Math.sin(now/200+i)*.15:0;const sw=dn?0:(d>.15?Math.sin(now/110+i)*.7:0);v.ll.rotation.x=sw;v.lr.rotation.x=-sw;v.al.rotation.x=dn?-2.6+Math.sin(now/130+i)*.5:-sw;v.ar.rotation.x=dn?-2.6-Math.sin(now/130+i)*.5:sw;});
animAll(now,dt);R.render(sc,cam);drawMM();}
const BIO={};`Pastel de nata|Dona Amélia Ferraz|Belém, Lisbon|Learned the custard recipe from a nun who swore her to secrecy. She has kept the secret for 41 years and the cinnamon shaker for 42.|Still warm. Don't tell the Lisbon people I'm in Porto.
Bifana grill|Zé Manel "Bife"|Vendas Novas|Ex-truck driver who found the perfect pork marinade at a petrol station at 3 a.m. and never drove again.|Mustard or no mustard? Wrong answer is no mustard.
Francesinha|Tio Alberto Sousa|Porto|Swears the sauce recipe is in his will. His three daughters have already sued each other twice over it.|Beer in the sauce, soul in the bread.
Petiscos & tapas|Inês & Rúben|Matosinhos|Two sailors' kids who fell in love over a shared plate of pica-pau and never split the bill again.|Share it, or I'm taking it back.
Gelato cart|Giulia Bernardi|Bologna|Fled a very famous Italian gelateria after an argument about pistachio. Now she makes it better, out of spite.|Real pistachio is brown, bella. Stop asking for green.
Sardine grill|Mestre Fernando|Peniche|Fisherman for 30 years until his knees quit. Now the sardines come to him and he is much happier.|Eat with your hands. Cutlery is for the French.
Churros cart|Rosa "Dos Churros"|Madrid|Moved to Portugal for love, stayed for the cheaper sugar. The husband left; the cart didn't.|Chocolate on the side or I won't speak to you.
Smash burgers|Kyle Brooks|Austin, Texas|Left a tech job to flatten beef on a hot plate. Says it's the first honest work he has ever done.|Smash it. Don't pat it. Never pat it.
Sushi bar|Itamar Sato|Nagasaki|Trained 10 years just to wash the rice. Finds Portuguese tuna deeply disrespectful and extremely good.|Silence. The fish is thinking.
Crêpe cart|Mireille Dubois|Brittany|Insists crêpes without salted butter are a crime. Has banned three tourists from the queue for sugar-only requests.|Une crêpe, c'est une promesse.
Cheese & charcuterie|Tomás da Serra|Serra da Estrela|Shepherd's son who talks to cheeses and claims they answer. The sheep, he says, are the real owners.|Smell it first. Then we talk.
Wood-fired pizza|Salvatore "Totò" Greco|Naples|Carried his oven across Europe on a trailer. It has a name, a birthday and a better pension plan than he does.|Ninety seconds. Not eighty. Not one hundred.
Coffee & bica|Cândida Lopes|Porto|Pulls the best bica in town and will pretend not to hear if you ask for a latte with oat milk.|Um café. Pequeno. Curto. Como deve ser.
Fresh juice cart|Marco Aurélio|São Paulo|Brazilian surfer who landed in Porto for a week in 2011. Squeezes oranges as if they owe him money.|Vitamin C, baby. Say it with me.
Port wine tasting|Senhor Duarte Cálem|Vila Nova de Gaia|Seventh-generation cellar master. Considers anything under 20 years "a teenager".|You don't drink port. Port allows you to join it.
Craft beer taps|Hendrik Visser|Rotterdam|Dutch brewer who moved for the sun and now brews only beers that taste like seaweed and regret.|Hoppy? Of course. It's called an IPA, my friend.
Vinho verde|Teresa Pinto|Monção|Winegrower's daughter who thinks a good vinho verde should tickle your nose and ruin your afternoon.|It's green because it's young. Like you.
Cocktail bar|Nuno "Shaker" Barros|Lisbon|Ex-nightclub barman who now stirs drinks to jazz only he can hear. Names each drink after a cat he once owned.|This one is called Bigodes. Trust me.
Whisky tasting|Angus MacRae|Isle of Skye|Retired Highlander who thinks Portugal has better weather and worse manners about ice. Never uses ice.|A drop of water. A drop of respect.
Azulejo ceramics|Mestre Ricardo Faria|Aveiro|Spends a month on each panel. Says rushing a tile is like rushing a funeral.|Blue is the colour of patience.
Cork goods|Dona Fátima Montado|Alentejo|Her family has harvested cork oaks since before the Republic. She carries a purse made of them and a grudge against plastic.|It's a tree. It grows back. Be like the tree.
Candles & soap|Lúcia & Mariana|Braga|Mother and daughter who started with one soap and a bad cold. Their shop now smells better than a cathedral.|Close your eyes. Lavender. Told you.
Leather goods|Joaquim Cabedal|Felgueiras|Third-generation cobbler turned bag maker. Hums fado while he stitches, off-key, with total confidence.|Good leather smells like a promise.
Handmade jewelry|Ana Beatriz|Guimarães|Melts old spoons from her grandmother's drawer into earrings. Every piece has a story and at least one grumpy aunt.|No two the same. No refunds on feelings.
Art prints|Vasco Linhares|Porto|Failed painter, brilliant printer. Prints other people's art so well that they now ask him for advice.|I'm not an artist. I'm an enabler.
Wood carving|Mestre Albano|Barcelos|Carves the same rooster every day and swears each is a different rooster. Cannot be convinced otherwise.|The wood already knows. I'm just removing the extra.
Vinyl records|Rui "Vinil" Matos|Porto|Owns forty thousand records, a cat named Coltrane and a flat that has not seen the floor since 1998.|If it doesn't crackle, it doesn't count.
Pottery wheel|Dona Lurdes da Barra|Barcelos|Hands like tree roots. Sets the wheel to spin and tells the clay a story until it behaves.|Slow down. The clay can feel you rushing.
Glass blowing|Pietro Zanon|Murano, Venice|Italian master who got lost on the way to Lisbon in 1994 and never left. Still cross about the GPS.|Breathe, don't blow. There is a difference.
Vintage clothes|Madalena Rocha|Lisbon|Rescues coats from the 70s and sells them with a character reference and a life story.|This jacket has been to Paris. Behave in it.
Hats & caps|Chico Chapéus|Porto|Believes every head has one correct hat and that most people are walking around with the wrong one.|Try it. No, not that. This one.
Knitwear|Avó Graça|Trás-os-Montes|Knits during the day, gossips at night, and has outlived three shop owners on this very spot.|Wool doesn't lie. Neither do I.
Streetwear|DJ Kaz Okafor|Lagos & Porto|Designs his own drops, then sells out before he can wear them. Has never once been on time.|Limited? Everything's limited. Time included.
T-shirt printing|Bia Estampa|Porto|Prints anything on anything. Once printed a wedding on a tablecloth and the couple cried.|One tee. Any design. Fifteen minutes. Fight me.
Sunglasses|Tiago Óculos|Algarve|Surfer-turned-optician who judges people entirely by their sunglasses and is rarely wrong.|The sun is a bully. Fight back in style.
Sneaker resale|Jamal "Kicks" Pereira|Amadora|Buys sneakers at dawn, sells them at lunch. Has a spreadsheet for his spreadsheet.|Never worn. Okay, worn twice. Gently.
Denim tailor|Costureira Odete|Guimarães|Hems jeans like she's defusing a bomb. Pins in her mouth, opinions on everything else.|Stand still. Your leg is not a toy.
Leather jackets|Rocco Ferrante|Milan|Rock-and-roll tailor who made a jacket for a famous drummer and mentions it every eleven minutes.|This jacket has seen things. Wear it badly.
Portrait artist|Paolina Reis|Porto|Draws everyone as they secretly wish to be seen. Some customers weep. Some ask for refunds.|Don't smile. Let me find the real you.
Henna studio|Samira El-Idrissi|Fez|Pattern is her prayer, hand is her canvas. Talks the whole time, and the henna dries by itself in sheer respect.|Don't touch it. Seriously. Don't touch it.
Face painting|Pipoca the Clown|Setúbal|Retired circus clown who paints children as tigers and mothers as butterflies. Will not answer to his real name.|Close your eyes! Now you're a dragon!
Photo booth|Hugo Flash|Porto|Rebuilt a 1970s booth from three broken ones. The strips come out slightly wrong in a way people love.|Four poses. First one is always the ugly one.
Caricature artist|Gonçalo Traço|Coimbra|Exaggerates the nose, flatters the soul. Has been slapped twice, tipped twice as often.|Hold still. Let me find your best flaw.
Tattoo studio|Dani "Agulha" Santos|Porto|Tattooist with eleven cats and no regrets. Only regrets are other people's, on their arms.|It'll hurt. That's how you know it's real.
Hair braiding|Fatou Diallo|Dakar|Her braids tell the stories of her village. Takes three hours, gives you a story, a snack and a new name.|Sit. Relax. This is going to take a while.
Piercing|Raven Miguel|Porto|Black lipstick, soft heart. Hums lullabies while doing the dangerous part.|Deep breath. Look at the pigeon. Done.
Nail art|Tatiana Kovalenko|Kyiv|Paints tiny masterpieces on tiny canvases. Will not paint anything boring and will tell you so.|I'll do it. But I won't like it.
Tarot reader|Madame Zélia|Sintra|Claims to see the future but never her own tax return. Always correct about love, wrong about lottery.|The cards are never wrong. People are.
Barber|Seu Armindo|Porto|Cut hair at the same chair for 52 years. Knows every secret in the district and has promised to take them all to the grave, eventually.|Short on the sides. And a little bit of conversation?
Portable WC|Eng. Mário Canalizador|Gaia|Engineer who dedicated his life to dignified portable toilets. Proud, thorough, underappreciated.|Clean. Always clean. Don't thank me.
Charging point|Pedro Tomada|Porto|Believes a dead phone is a human rights crisis. Sits among forty cables, calm as a monk.|Twenty minutes. Don't wander far.
Cloakroom|Dona Manuela|Porto|Has never lost a coat in thirty years. Remembers faces better than names and coats better than faces.|Your coat is safe. Your secrets too.
Info kiosk|Sr. Anselmo|Porto|Knows every street, every bus and every grudge in the city. Answers in three languages, all of them annoyed.|Straight, then left. No — the other left.
First-aid post|Enfermeira Clarisse|Porto|Retired nurse who volunteers because she can't stand watching people suffer needlessly. Carries sweets in every pocket.|Where does it hurt? And who did it?
A-frame sign|Chalk the Cat|Porto|A small tabby who sits beside the sign all day. Customers assume she wrote the menu. She hasn't denied it.|Meow. (Follow the arrow.)
Banner flags|Capitão Vento|Cascais|Retired sailmaker who hoists flags in perfect order because the wind deserves courtesy.|Colours up! The wind is listening.
Flyer promoter|Rita Panfleto|Porto|Promoter with twelve thousand flyers and a smile that makes refusing physically painful.|One flyer. Free. Your future thanks you.
Street guitarist|Zé Guitarra|Porto|Plays three songs, perfectly, for six hours. Has a fan club of pigeons and one persistent landlord.|Requests? Sure. Then I'll play what I want.
Neon sign|Neon Nelson|Porto|Bends glass tubes into letters and swears he can taste the colours. Has not slept properly since 2009.|Let there be light. Slightly pink.
Pastel mascot|Pastelito|Mercado Ferreira Borges|A giant pastel de nata costume with a very small man inside. He gets seasick in the heat and tips in custard.|Hug me! Careful of the cream.
Hot dog stand|Big Tony Reis|Newark, NJ|Came to Porto on holiday, fell for a girl, stayed with the mustard. The girl left in 2016; the mustard stayed.|Everything on it? Everything's on it.
Caldo verde|Avó Ermelinda|Minho|Makes soup in a pot bigger than her. Watches every spoonful go to a stranger with grave satisfaction.|Eat. You look thin. Everyone looks thin.
Padaria|Mestre Padeiro Silvino|Alentejo|Wakes at 2 a.m. daily. The dough tells him when it's ready. He has stopped arguing.|Warm bread first. Opinions later.
Chouriço assado|Joaquim "Flambé"|Trás-os-Montes|Sets the sausage on fire in a clay pot, every time, with the same faint look of mischief.|It's not burnt, it's roasted. Big difference.
Arroz doce|Tia Conceição|Beira|Draws a cinnamon pattern on every bowl. No two the same. Never explains what they mean.|Sweet today, sweet tomorrow. That's the rule.
Bacalhau|Capitão Henrique|Aveiro|Retired cod-fishing captain who claims to know 365 recipes, one for each day, and a 366th for leap years.|Soak it two days. Anything less is an insult.
Bolo-rei|Maestro Leopoldo|Lisbon|Hides the fava bean and the prize with a strict ritual. The king's crown always goes to someone who wasn't expecting it.|Whoever finds the bean pays for next year's.
Pizza slices|Lorenzo Fabbri|Rome|Cuts rectangles, not triangles. Considers anyone who disagrees a tourist, and says so, charmingly.|Weigh it. Pay by weight. Be honest about hunger.
Polvo à lagareiro|Chef Anselmo Pires|Póvoa de Varzim|Beats the octopus gently with the respect of a man who once lost an argument with one.|Octopus is humble. Tender. Like me, but with more arms.
Surf & skate|Duarte "Wave"|Ericeira|Sells boards he's tested personally, on bruises he has also tested personally.|Wipeouts build character. Buy a helmet.
Linen basics|Fiona Almeida|Guimarães|Believes linen should wrinkle with dignity. Irons only on request and with visible disapproval.|If it's wrinkled, it's alive.
Kids wear|Tia Susana|Porto|Dresses children as tiny adults and adults as slightly smaller children. Everyone seems happy.|Grow into it! That's the plan.
Sportswear|Rui Maratona|Porto|Ran seventeen marathons and sells the shoes that survived them. Limps proudly.|Run slowly. Arrive eventually. Shoes are non-negotiable.
Swimwear|Carolina Mar|Algarve|Believes any body is beach-ready if the swimsuit is brave enough. Shamelessly confident, frankly right.|Colour. Courage. A little bit of ruffle.
Silk scarves|Madame Leila|Lyon & Porto|Scarf trader who ties them in twelve ways and judges you by the way you choose the thirteenth.|One scarf can change your mood. Or your marriage.
Burel capes|Mestre Adriano|Serra da Estrela|Last weaver of burel in his village. Wears a cape in July, says the sun is bad manners.|Wool of the mountain. Warm as a hug from a bear.
Handmade shoes|Sapateiro Brás|Felgueiras|Measures twice, cuts once, and cries once when you walk away in a perfect pair.|If it hurts, it's the wrong shoe. If it's perfect, it's mine.
Boutique|Madame Constança|Cascais|Dressed duchesses in the eighties and still refuses to sell anything beige. Her taste is law.|Darling. No. Take the red one.
Postcards|Dona Alice|Porto|Collects the stamps, writes the first line for you, and never lets you pick the boring postcard.|Write to someone you miss. Go on.
Flowers|Dona Rosário|Porto|Reads moods from tulips. Never sells you roses unless she's decided you've earned them.|Tell me who it's for. I'll tell you the flower.
Souvenirs|Seu Tavares|Porto|Sells roosters, magnets and dreams. Swears each rooster is handmade; the factory in Shenzhen disagrees.|It's the only authentic one. All others are copies.
News agent|Sr. Afonso Jornal|Porto|Reads every paper before he sells it. Spoils the football results as a matter of principle.|Don't tell me the score. I've not read it yet.
Steel jewellery|Mia Aço|Porto|Believes stainless steel is the poet's metal. Hard, honest, never tarnishes.|Won't rust. Won't lie. Won't leave you.
Plants|Dona Margarida|Sintra|Talks to every plant. The cacti are the most polite; the ferns, a bit dramatic.|Water once. Love often. Don't hover.
Used books|Professor Aurélio|Coimbra|Retired literature teacher who refuses to sell a book without an interview about why you want it.|Why this one? No, really. Why?
Silver jewellery|Dona Inácia|Gondomar|Fourth-generation silversmith with a magnifying glass and a hatred of fake silver. Taps each piece to hear its soul.|Listen. Hear that ring? That's real.
Perfumes|Madame Iris|Grasse & Porto|Tells people their personality by sniffing the air around them. Disturbingly often correct.|You smell like Tuesday. Let me fix it.
3D-print toys|Leo "Plastic" Chen|Shenzhen & Porto|Prints dragons overnight and lets the printer win every argument. Calls it "Gerald".|Gerald made it. I'm just the supervisor.
Pet shop|Dona Violeta|Porto|Has twelve cats at home and a fond dislike of anyone who buys the wrong brand of kibble.|He's not fat. He's fluffy. Respect him.
Conservas|Sr. Gaspar|Matosinhos|Sells tinned fish like jewels. Polishes each tin and will lecture you on the vintage of sardines.|1997 sardines. Don't laugh. They're a revelation.
Honey & spice|Abel Apicultor|Douro|Keeps bees, speaks to bees, fears bees. A complicated relationship, all very sweet.|Taste. Wait. Now tell me about your childhood.
Wood toys|Avô Joaquim|Barcelos|Carves toys without a single screw. Says children should earn their toys by breaking them slowly.|No batteries. Just imagination.
Gadget repair|Dev Patel|Leicester & Porto|Fixes any phone in ten minutes and mends your relationship status for free. Speaks rapidly, always correct.|Have you tried turning off your ex? I mean, the phone.
Old cameras|Fotógrafo Augusto|Porto|Developed photos in a darkroom for fifty years. Sells cameras that "still have a few good shots left in them".|Every camera remembers its last picture. Ask it.
Gold jewellery|Senhor Aurélio de Ouro|Gondomar|Gold dealer with fifteen gold teeth he considers a pension fund. Never smiles for free.|Weigh it. Bite it. Love it. In that order.
Popcorn cart|Seu Zeca|Porto|Pops corn for the cinema down the road that closed in 2004. Nobody told him; he is still catering to the ghosts.|Salt or sweet? Both is also valid.
Candy floss|Tia Marlene|Gaia|Spins sugar into clouds at the pace of a lullaby. Believes every cloud is a tiny wish.|Hold it by the stick. Don't squeeze the dream.
Roasted chestnuts|Sr. Amadeu|Trás-os-Montes|Burns his fingers cheerfully every day since 1987. Calls it a tax on joy.|Careful. Hot. Hotter than that.
Tosta mista|Dona Lena|Porto|Makes the same ham-and-cheese toastie as in 1989. No change, no apology, no queue management.|One tosta. Don't overthink it.
Waffle cart|Ingrid Jansen|Ghent|Belgian who believes every problem can be solved with waffles. Her husband agrees, with caveats.|Sugar, cream, or both? Don't choose wrong.
Prego no pão|Ti Chico|Alentejo|Cuts the steak thin, sizzles it loud and slaps it in bread with a wink.|A prego doesn't wait. A prego is now.
Broa & bolo|Dona Genoveva|Vale do Sousa|Corn bread from her mother's oven, which her mother got from hers. The oven has opinions about the weather.|Cornmeal from the mill. The mill from my uncle.
Frango piri-piri|Moisés Cardoso|Maputo|Mozambican grill master who bottles his own piri-piri and keeps the recipe in a chicken's name.|Hot? No, no. That's mild. Wait for the second bite.
Tripas à moda do Porto|Tia Amália|Porto|Keeper of the tripe tradition — which is what Porto is named for, she'll remind you. Stirs without ever tasting.|Tripeiros, that's us. Eat up.
Pastéis de bacalhau|Fernanda Mar|Nazaré|Fries them in batches of exactly twelve. Thirteenth goes to whoever she likes best that day.|Hot inside. Cold outside. Like my ex.
Falafel & kebab|Omar Haddad|Beirut|Left Lebanon for a Porto girl and a better tahini. Makes falafel crisper than his jokes.|Extra sauce? Of course extra sauce.
Vegan bowls|Luna Pascoal|Porto|Former steak lover turned plant evangelist. Sneaks butter into nothing, and will tell you so.|Eat the rainbow. Don't poke it.
Croissanterie|Pierre-Louis Fabre|Lyon|Folded each croissant 27 times. Cries a little if you ask for ketchup.|Listen. The crunch is the applause.
Taco truck|Mateo Ruiz|Oaxaca|Drove a rusty truck from Mexico City to Lisbon through four languages and two ferry mishaps. Taco quality: heroic.|Lime. Cilantro. Silence. Eat.
Dumpling steamer|Madame Lin|Chengdu|Folds exactly eighteen pleats. Anything less and the dumpling, she says, loses its dignity.|Soup first. Then bite. Don't rush the soup.
Ramen counter|Hiroshi Tanabe|Fukuoka|Simmers the broth for 18 hours and sleeps beside it. His wife believes she is being cheated on by a pot.|Slurp. Loudly. It's a compliment.
Paella pan|Paco Villanueva|Valencia|Rice for paella from his village, pan from his grandmother, rage from the Portuguese who add chorizo.|No chorizo. Don't ask. Don't ever ask.
Oyster bar|Capitain Yvon Le Gall|Cancale|Opens oysters with a knife older than Portugal's constitution. Never nicks a finger. Nicks everyone's egos.|Don't chew. Let the sea speak.
Lobster roll shack|Chad Whitaker|Maine|Moved to Porto after a love of Atlantic and a mistaken GPS. Refuses to call it a sandwich.|It's a roll. It's a lifestyle. It's thirty euros.
Truffle kitchen|Gilberto Tartufo|Alba, Piedmont|Walks a trained pig at dawn to find his ingredients. The pig sleeps in a better room than he does.|Shave it. Gently. Like a secret.
Wagyu grill|Kenji Ogawa|Kobe|Massages each cow with beer, he insists. Cut thinner than a poem, priced like an epic.|Rare. Rarer. It's practically a handshake.
Michelin pop-up|Chef Isabelle Marchand|Paris|Two stars in Lyon, one day in Porto. Plates a tiny masterpiece with tweezers and an unreadable expression.|Silence, please. This is art, not lunch.
Caviar & champagne|Count Dmitri Volkov|St. Petersburg|Claims royal ancestry, produces no evidence, sells exquisite roe regardless. Always wears gloves.|A pearl on a spoon. A bubble on the tongue.
Chef's tasting theatre|Maestro Alessandro Conti|Modena|Turns dinner into theatre in nine acts. People applaud, then ask for dessert.|Act Three: the soup. Don't spoil the ending.
Lemonade cart|Júlia, 11|Porto|Her tiny stand started as a school project and outlived the school year, the school and two teachers.|Fifty cents. Cash only. Don't haggle with me.
Ginjinha shots|Tio Valdemar|Lisbon|Serves ginjinha with or without a cherry; the only choice customers ever need to make.|Com elas ou sem elas?
Sangria jug|Carmen Salcedo|Seville|Insists real sangria has no recipe, only vibes. Her vibes include a full orange and a stern warning.|One glass is a warm-up. Two is a story.
Bubble tea|Ming Xue|Taipei|Shakes tapioca pearls like maracas, dances while doing it, and gets a standing ovation daily.|Pearls first! Always pearls first!
Kombucha tap|Sol Moreira|Ericeira|Keeps a mother SCOBY named Margaret. She is in charge. He is only here to bottle.|Alive! Gut feelings. Literally.
Craft cider|Brendan O'Connell|Cork|Irish farmer with a thousand apples and one terribly strong opinion on Normandy.|It's cider. It's not apple juice. Learn the difference.
Mojito shack|Yusimí Cabrera|Havana|Crushes mint like she's got a grudge. The mojito responds with a warm smile and a headache.|Mint. Rum. Lime. Faith.
Specialty coffee lab|Anouk Verbeek|Amsterdam|Weighs beans to a tenth of a gram. Cannot be trusted with a spoon, only a scale.|Pour over. Don't rush. Don't talk.
Aperol spritz bar|Giorgio Rinaldi|Venice|Believes the spritz must be orange, bubbly and slightly late, like a good Italian summer.|Three, two, one. Slice of orange. Done.
Gin garden|Eleanor Whitcombe|Cotswolds|Grows her botanicals in window boxes and refuses to name them. A spy novel, with tonic.|Juniper. And something else. Guess.
Natural wine|Clément Aubry|Jura|Makes wine from grapes and hope. Cloudy, funky, controversial. Dedicated fans, dedicated enemies.|It's cloudy because it's alive.
Sake & soju|Min-jae & Haruka|Seoul & Kyoto|Married couple with a friendly rivalry. They only agree on who pays the bill.|Cheers! Gan-bei! Geonbae! Whatever. Drink.
Mezcal & tequila|Don Rafael Montes|Oaxaca|Smoky, wise, never in a hurry. His mezcal burns twice: once on the throat, once on the memory.|Sip. Don't shoot. This is not a shot.
Absinthe parlour|Baron Lucien de Marly|Paris|Pours with a sugar cube, a spoon and a flourish. His coat is older than his stories, and his stories are very old.|The green fairy waits. Be gentle.
Vintage port cellar|Visconde Henrique Cálem|Pinhão, Douro|Opens one bottle of 1963 per year, alone, on his birthday. The rest are for you, for a fee and a promise.|Time is an ingredient. I only store it.
Champagne tower|Madame Odette Roussel|Reims|Stacks flutes into a perfect pyramid and has never spilled a drop. Dares you to try.|Don't touch the tower. Touch the glass.
Rare whisky vault|Sir Hamish Dunbar|Edinburgh|Possesses bottles that outlive three monarchs. Takes tastings like a priest takes vows.|One dram. One minute. One hour of silence.
Grand Cru sommelier|Étienne Marchetti|Burgundy|Can identify a vintage, a vineyard and the weather that day by smell. Sniffs your wine and your character.|Don't swirl. Let it breathe. Let me breathe.
Molecular cocktail lab|Dr. Vera Lindqvist|Stockholm|Left physics for cocktails after realising liquid nitrogen is more fun at parties. Her drinks smoke, glow and occasionally levitate.|Safety goggles are not optional. Fun is.
Origami & paper|Mikiko Tanaka|Kyoto|Folds one paper crane per day since 1998 and has quietly refused to count past a thousand.|A single sheet. Infinite possibilities.
Basketry|Tia Rosalina|Minho|Weaves baskets so tight they hold water. Doesn't recommend it, merely observes it.|Reed and patience. That's all there is.
Embroidery|Dona Beatriz|Viana do Castelo|Embroiders love hearts on handkerchiefs, as tradition demands and as the village gossips still approve.|Every stitch is a promise. Don't break it.
Macramé|Sage Nunes|Sintra|Ties knots into everything, including difficult conversations. Hasn't lost a single argument since.|It's all about the knot. Life's just a lot of knots.
Ceramic roosters|Mestre Tinoco|Barcelos|Paints the legendary rooster in four shades of regret and one of hope. It crows at night, he says.|The rooster never lies. Ask the judge.
Hand-painted tiles|Mestre Jorge Colaço Jr.|Porto|Descendant of azulejo masters. Paints saints, ships and the occasional grumpy cat, each in a patient shade of blue.|Fire reveals the colour. Everything else is guessing.
Resin art|Kai Moreau|Lisbon|Pours oceans into coasters and galaxies into tables. Never finishes before a deadline, always before a funeral.|Let it cure. Everything good needs time.
Mosaic studio|Eleni Papadakis|Thessaloniki|Cracks plates on purpose for the art. Her husband stopped asking about the crockery years ago.|Broken things make better pictures.
Bookbinder|Mestre Silvestre|Coimbra|Binds books by hand in leather, thread and silence. Never reads them; says that would be rude.|A book is a house. Build it well.
Filigree silver|Mestra Cândida|Gondomar|Spins silver thread finer than hair into earrings so delicate they hum when the wind blows.|Thin as a thought. Strong as a promise.
Blacksmith|Brás Ferreiro|Minho|Forges knives, hooks and the occasional poem. Hits the anvil to the rhythm of the football commentary.|Hot. Hit. Cool. Repeat. That's life.
Luthier|Maestro Emílio Vidal|Cremona & Porto|Builds guitars from wood he cut himself, in forests he won't name. Each one sounds like a different person.|Tap it. Hear that? The wood is singing.
Watchmaker|Herr Matthias Keller|Schaffhausen|Repairs watches with tweezers and an air of grief. Time, he says, is his only coworker, and the worst.|Please don't wind it. It knows what it's doing.
Bespoke perfumer|Séraphine Moreau|Grasse|Creates a scent for each customer from a ten-minute interview. Cries at your answers; always smells perfect.|Tell me a memory. I'll make it a perfume.
Gold leaf artisan|Maître Bastien|Florence|Applies gold leaf so thin that a breath destroys it. Wears a mask and a perpetual look of concentration.|Don't breathe. Don't blink. It's beautiful.
Master sculptor|Mestre Rodolfo Pina|Carrara & Porto|Carves marble like he's removing the prison from the figure. Has never once been satisfied, or wrong.|The statue is already inside. I'm just rude enough to find it.
Quirky socks|Matilde Meias|Porto|Believes confidence starts at the ankle. Offers a pair mismatched on purpose, and philosophy for free.|Odd socks. Even better people.
Beanies & gloves|Avó Fernanda|Serra da Estrela|Knits for the whole family and the neighbours' families. Her gloves have never once failed a cold wind.|If your hands are cold, your heart will follow.
Raincoats & umbrellas|Sr. Pluvio|Porto|The only businessman in Porto who prays for rain. Greets every cloud by name.|It will rain. I'm never wrong about rain.
Football shirts|Carlos Camisola|Porto|Sells FC Porto, Benfica and Sporting shirts with a strict code: never in the same bag.|Blue and white, or don't speak to me.
Bags & backpacks|Nadia Alves|Casablanca & Porto|Stitched her first backpack to smuggle a cat through customs. Her bags are now roomier than most flats.|Room for everything. Even your doubts.
Band tees|Skully Matos|Porto|Roadie turned reseller. Knows the setlist of every tee he sells and the heartbreak behind each tour.|Don't wear it unless you know the songs.
Kimono & kaftans|Yuki Hamada|Osaka|Folds fabric like a ritual. Speaks only when the silk requires it.|Silk remembers. Treat it kindly.
Bespoke tailor|Mestre Aníbal|Lisbon|Measures you in a glance and fits you in three days. Once fitted a president, never said which.|Stand straight. Don't breathe. Perfect.
Designer outlet|Vanessa Prada|Milan|Sold luxury labels at full price for twelve years. Now sells them at half price with twice the honesty.|Last season. Same sparkle. Half the price.
Cashmere house|Lady Philippa Hargreaves|Edinburgh|Her cashmere comes from goats she personally apologises to. Each sweater costs a small fortune and hugs a large one.|Soft as a promise, rare as a good listener.
Luxury handbags|Signora Donatella|Florence|Stitches bags with bespoke thread, bespoke leather and bespoke opinions. Will not discuss price, only destiny.|It's not a bag. It's a companion.
Haute couture atelier|Monsieur Étienne Delacroix|Paris|Dresses legends. His gowns require two fittings, three assistants and one existential crisis.|Don't sit. Don't breathe. Be exquisite.
Runway flagship|Zara Okonkwo|Lagos & London|Fashion's enfant terrible. Presents collections as performance art and sells them as armour.|Dress as if the world is watching. It's watching.
Temporary tattoos|Bruna Tinta|Porto|Draws flash designs with a pen and unshakable confidence. Offers permanent regrets at temporary prices.|It'll wash off. Maybe. Probably.
Glitter bar|Sparkle Sofia|Porto|Applies glitter with a steady hand and an unsteady sense of when to stop. Everyone leaves shimmering like a disco ball.|More glitter. More. No, more.
Palm reader|Madame Zorica|Belgrade|Reads palms with a magnifying glass and a quiet smile. Always warns of a tall stranger, usually correct.|Your lifeline is long. Your love line is... complicated.
Massage chairs|Wang Lei|Beijing|Kneads knots out of necks and out of stories. Says the shoulders confess before the mouth.|You carry the world on your shoulders. Put it down.
Beard & moustache|Seu Casimiro|Porto|Waxed moustache of impossible curvature. Will trim yours into a work of art or a polite apology.|A beard is a statement. Make it a sentence.
Street mural|Kapa|Porto|Anonymous graffiti legend. Paints walls and canvases with equal disrespect and equal brilliance.|The wall was begging for it.
Body-paint studio|Aiyana Silva|Salvador|Turns people into jungles, galaxies or tigers. Her canvas walks away, dances and cools off in the sea.|Don't scratch. You're a masterpiece.
Hologram booth|Dr. Kiran Rao|Bangalore|Scans you in 3D and sends your hologram to your mother. Mothers love it. Mothers cry.|Stay still. The future is loading.
Master tattoo atelier|Mestre Tigre|Osaka & Porto|Hand-poke tattooist with forty years of ink and zero rush. Appointments need patience and a letter of intent.|You don't choose a tattoo. It chooses you.
Celebrity stylist|Dante Castellano|Los Angeles|Has styled famous heads you wouldn't believe, but won't name them. Hair so perfect it needs its own press agent.|Trust me. I've done worse. And better.
Spa & wellness|Aroha Williams|Auckland|Offers hot stones, warm oil and unnerving silence. People leave glowing and slightly embarrassed to be so relaxed.|Breathe in. Breathe out. Pay at the end.
AR portrait studio|Pixel Priya|Mumbai|Turns your face into a wizard, a king or a dragon in real time. Her booth is half art, half chaos.|Smile. Now be a dragon.
Tea & infusions|Sr. Chá Nuno|Gorreana, Azores|Grows the only tea in Europe, and tells you so on every possible occasion.|Europe's only tea. Remember it. Brag about it.
Coffee beans|Dona Branca|Porto|Roasts beans on the spot, saying the smell is half the sale and the rest is her charm.|Smell it. No, deeper. Now tell me you don't want it.
Cork stationery|Marta Cortiça|Alentejo|Makes notebooks from cork, because paper always felt too serious. Writes love letters on them.|Write something real. Cork forgives.
Maps & prints|Sr. Cartógrafo|Lisbon|Sells maps of places that no longer exist, and a few that never did. Never lost, always lost.|You are here. Or are you?
Comics & manga|Kenzo & Zé|Porto|Two friends who argue over every issue. Their shop's the quietest place with the loudest opinions.|Marvel or DC? Wrong. Manga.
Olive oil & vinegar|Dona Natividade|Trás-os-Montes|Presses her own olives, bottles them in recycled glass and refuses to taste anything from Spain.|Cold-pressed. Hand-picked. Close your eyes.
Chocolate boutique|Chocolatier Anselme|Brussels|Tempers chocolate with a ritual and a pocket thermometer. Considers white chocolate an unfortunate rumour.|Snap. Listen. That's the cocoa talking.
Retro games|Nuno "Pixel" Costa|Porto|Owns every console since the Atari. Plays them on weekends with a stern face and a hint of tears.|Blow on the cartridge. It's tradition.
Antiques|Dona Eulália|Miragaia, Porto|Sells things whose history is half-truth, half-legend and all charm. Never reveals where she finds them.|This chair? A countess sat on it. Probably.
Musical instruments|Maestro Anselmo|Coimbra|Plays everything he sells, badly, with tremendous joy. Every instrument has a name.|Touch it. Don't be shy. It wants to be played.
Drone & gadget lab|Hugo Zero|Lisbon|Builds drones from salvaged phones. They fly beautifully until they remember what they were.|Don't tell my landlord about the swarm.
VR arcade|Mia Neon|Seoul|Operates a bank of headsets and shouts instructions at people fighting invisible dragons.|Remember: the dragon isn't real. The furniture is.
Fine art gallery|Beatriz Valverde|Madrid|Sells canvases to billionaires and the occasional curious schoolchild. Treats both with identical solemnity.|Look at it. Really look. Then pay accordingly.
Rare books & maps|Dr. Aurélio Mendes|Oxford|Sells first editions and forgotten atlases. Handles each page like a sleeping bird.|This was held by a king. Wash your hands.
Diamond jeweller|Isadora Rothschild|Antwerp|Examines your intentions before the stone. If she likes you, she'll let you touch the cheaper ones.|A diamond is forever. So is a bad choice.
Swiss watch boutique|Herr Lukas Brandt|Geneva|Wears four watches at once, each a different time zone. Always punctual, never late, endlessly smug.|Time is money. This is both.
Vintage supercars|Enzo Montecchio|Maranello|Sells models of cars that never lost a race and one that always won the girl. Scale is a weapon, he says.|Pick one. Park it in your heart.
Auction house|Lady Beatrix Ashworth|London|Her gavel has outlasted three marriages and one stock market. Voice like crystal, hands like a safe.|Going once. Going twice. Gone to the gentleman who blinked.
Crown jewels vault|The Duchess Maria Isabel|Lisbon|Claims to guard actual royal jewels. Documents unavailable, jewels dazzling, price unpronounceable.|Touch the glass and I'll call the guards. And the king.
Water fountain|Fountain Fred|Porto|Retired plumber who adopted the fountain. Polishes it every morning and scolds anyone who throws a coin.|Free water. Free advice. Free ticket to hydration.
ATM & exchange|Rodrigo Cambista|Lisbon|Changes money at a rate that seems both fair and mildly insulting. Always smiles when he gives the change.|Euros, dollars, dreams. Fifteen percent.
Shaded seating|Dona Clementina|Porto|Offers tired visitors a chair, a parasol and a stern lecture about resting properly. Nobody leaves before she's done.|Sit. Rest. You look like a ghost.
Bike repair post|Mecânico Gil|Porto|Fixes punctures in 90 seconds and the world's problems in ten minutes. Always has a spare chain and a spare opinion.|Flat tyre? Flat mood? Both fixable.
Security post|Sargento Brás|Porto|Ex-army sergeant who runs the market's security with discipline, a whistle and a surprisingly gentle voice.|Move along. Slowly. Smile. That's an order.
Luxury restrooms|Madame Odile|Paris|Provides scented towels, a violin and a nod of approval. Considers the loo a place of civilisation.|Take your time. The tiles are worth it.
Concierge lounge|Monsieur Fabrice|Geneva|Can find you a sold-out table, a rare vinyl or a missing sock. Prefers not to ask how.|Whatever you need. Whenever you need it. Whoever you are.
Chalk-art board|Tiza the Cat|Porto|A calico who naps on the board. Her owner scribbles the menu around her and calls it "interactive art".|(Purrs, points at the menu with a paw.)
Balloon arch|Palhaço Pippo|Porto|Twists balloons into dogs, swords and, if you ask nicely, tax forms. Greets every child by name.|Pop! Don't worry. I have more.
Fado singer|Maria da Saudade|Alfama|Sings of loss so beautifully that strangers weep and tourists pause mid-selfie. Says saudade is only a word for loving too much.|Silêncio. É Fado.
Street magician|Mago Alvarenga|Lisbon|Pulls pastéis out of ears, coins out of children and rabbits out of nowhere. The rabbit has never been paid.|Pick a card. No, not that one. The other one.
Brass band|Banda Filarmónica de Miragaia|Porto|Twelve elderly gentlemen who play marches like the army's still coming. Perfectly in tune, rarely in step.|One, two, three — and we're off!
LED tunnel|Neo Aurora|Berlin|Lighting designer who treats an archway like a canvas. People walk through, emerge slightly changed.|Walk through. Be someone else.
Dancing robot|Unit B-0RG3S|Porto|A battered robot who breakdances for coins. Has learned three languages and a rude gesture.|Beep. Boop. Tip me.
Fireworks launcher|Pirotécnico Zé Tiro|Braga|Sets off rockets with the calm of a man who has done it a thousand times. Still jumps at the bang.|Plug your ears. Look up. Gasp.
Celebrity meet & greet|Stella Starr|Hollywood|A minor celebrity who is major in her mind. Charges to wave. Everyone pays.|Autographs, selfies, and a very slight smile.`.split('\n').forEach(l=>{const f=l.split('|');BIO[f[0]]=f.slice(1);});

const TRAITS=[['Perfectionist','Is that straight? Check it again.'],['Gossip','Did you hear about the stall next door?'],['Night owl','I do my best work after midnight.'],['Soft-hearted','Take it. Pay me tomorrow.'],['Haggler','Best price, only for you. Today.'],['Superstitious','Touch wood. Don\'t open umbrellas here.'],['Early bird','Up at five. Always. Judge me.'],['Daydreamer','Oh! Sorry. I was in Brazil.'],['Show-off','Watch this. Watch. Watch!'],['Penny-pincher','Every cent counts. Even yours.'],['Dog lover','Is that a dog? Can I pet it?'],['Foodie','What did you eat today? Tell me everything.'],['Romantic','Love is in the air. Or the fryer.'],['Grumpy','Don\'t talk to me before coffee.'],['Joker','Knock knock. No, you say who\'s there.'],['Workaholic','Break? What\'s a break?']];
const VL={cook:['Sizzling!','Hot hot hot!','Order up!'],pour:['Pouring…','Say when!','Fresh!'],draw:['Hold still…','Almost there…','Masterpiece!'],tattoo:['Steady now…','Deep breath.','Nearly done.'],craft:['Tap tap tap…','Just one more touch.','Handmade!'],fold:['Fresh in today!','Try it on!','Fits perfect!'],shake:['Shake shake!','Cold as ice!','Chin chin!'],press:['Pressing…','Hot off the press!','One moment…'],pose:['Look at me!','Smile!','Perfect!'],scoop:['One scoop or two?','Scooping!','Fresh!'],slice:['Slice slice!','Sharp knife!','Careful!'],flip:['Flip it!','And… flip!','Golden!'],serve:['Coming right up!','Thank you!','Next, please!'],none:['…','Over here!','Hello!']};
const STQ={setup:'Setting up… one moment!',pack:'Packing up for the day.',walk:'On my way!',away:'Not today. Back soon.',closed:'Room\'s in use tonight.'};
const hs=str=>{let h=7;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;return h;};
const bioOf=o=>{const d=ST[o.i],b=BIO[d[0]];if(b)return{who:b[0],from:b[1],story:b[2],quote:b[3]};const h=hs(d[0]);return{who:['Zé','Rita','Tó','Mena','Rui','Lena'][h%6]+' of '+d[0],from:'Porto',story:'Has run this stall since the market opened and never missed a day.',quote:'Come closer. Have a look.'};};
const traitsOf=o=>{const h=hs(ST[o.i][0]);const a=h%TRAITS.length;let b=(h>>>4)%TRAITS.length;if(b===a)b=(b+5)%TRAITS.length;return[TRAITS[a],TRAITS[b]];};
function spLine(o){const d=ST[o.i],b=bioOf(o);if(o.off)return'Closed. Back soon!';if(o.st!=='open')return STQ[o.st]||b.quote;if(o.busy>0){const L=VL[d[11]]||VL.serve;return L[Math.floor(Math.random()*L.length)];}const t=traitsOf(o),r=Math.random();return r<.5?b.quote:r<.75?t[0][1]:t[1][1];}
function charCard(o,ar){const d=ST[o.i],b=bioOf(o),v=o.m.userData.v,t=traitsOf(o),vb=['cook','pour','draw','tattoo','craft','fold','shake','press','pose','scoop','slice','flip','serve','none'].includes(d[11])?d[11]:'serve';
return `<div class='p chr' style='--c1:${hx(d[3])};--c2:${hx(d[4])}'><div class='ct'><div style='flex:1'><b class='px'>${d[12]} ${d[0]}</b><br><span class='m'>${CATS.find(q=>q[0]===d[1])[1]} · ${ar}</span></div><button data-a='x'>✕</button></div>
<div class='ct' style='margin-top:6px'><div class='cw an-${vb}' id='spw'><span class='ca'>${v&&v.dna?av(v.dna):`<span class='big'>${d[12]}</span>`}</span><span class='cp'>${d[12]}</span></div><div style='flex:1'><b>${b.who}</b><br><span class='m'>from ${b.from}</span><div class='mood' id='spm'></div></div></div>
<div class='bub' id='spq'>${b.quote}</div><div class='bio'>${b.story}</div><div class='chips'>${t.map(q=>`<span>${q[0]}</span>`).join('')}</div></div>`;}
let spTick=0;
setInterval(()=>{if(!SP||$('spn').hidden)return;const o=SP,q=$('spq'),w=$('spw'),m=$('spm');if(!q||!w)return;spTick++;const idle=o.st!=='open'||o.off||o.busy<=0;w.classList.toggle('an-idle',idle);if(m)m.textContent=o.off?'● closed by you':o.st!=='open'?'● '+(STAT[o.st]||o.st).toLowerCase():o.busy>0?'● busy — customers!':'● waiting for customers';q.textContent=spLine(o);if(spTick%2===0&&o.m.visible&&o.st==='open'&&!o.off){const tx=q.textContent;const wds=tx.split(' ');let l1='',l2='';for(const x of wds){if((l1+' '+x).trim().length<=22&&!l2)l1=(l1+' '+x).trim();else l2=(l2+' '+x).trim();}if(l2.length>22)l2=l2.slice(0,20)+'…';try{bubble(l2?l1+'\n'+l2:l1,o.m.position.x,o.m.position.z,1.9,'say',o.m,3.2);}catch(e){}}},3200);
// ================= stall panel, upgrades, rotation; see-through walls =================
const PZ=[{n:'Cheap',f:1.3,v:.8},{n:'Normal',f:1,v:1},{n:'Premium',f:.75,v:1.3}];
const UPS=[['eq','Equipment','\u{1F527}','+25% income per level',[120,260,480]],['st','Extra staff','\u{1F465}','+20% service speed per level',[100,220,420]],['sg','Signage & lights','\u{1F4A1}','pulls more passers-by',[90,200,380]]];
let SP=null,SPH='';const FACE=['South','East','North','West'],STAT={open:'Open',setup:'Setting up',pack:'Packing up',walk:'On the move',away:'Away today',closed:'Room in use'};
const selM=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.15),new THREE.MeshBasicMaterial({color:0xffe14d,transparent:true,opacity:.4,depthWrite:false}));selM.rotation.x=-Math.PI/2;selM.visible=false;sc.add(selM);
const GEM=new THREE.MeshBasicMaterial({color:0xffd24a}),NEOB=new THREE.MeshBasicMaterial({color:0xff4fa0});
function addBadges(o){if(o.bd)o.m.remove(o.bd);const g=new THREE.Group(),k=ST[o.i][2],z=(SGP[k]||[0,0])[0],u=o.u;let n=0;for(const q of ['eq','st','sg'])for(let j=0;j<u[q];j++){bx(g,.07,.07,.07,-.4+(n++)*.1,1.53,z+.02,GEM,1);}
if(u.sg>0)bx(g,.9,.03,.03,0,1.42,z+.03,NEOB,1);if(u.sg>1){bx(g,.03,.5,.03,.5,1.2,z+.03,NEOB,1);bx(g,.03,.5,.03,-.5,1.2,z+.03,NEOB,1);}if(u.eq>1)bx(g,1,.03,.03,0,.47,z+.5,GEM,1);g.scale.setScalar(.85);o.m.add(g);o.bd=g;}
function openSP(o){SP=o;SPH='';selM.visible=true;selM.position.set(o.x+.5,gy(o.x+.5,o.z+.5)+.07,o.z+.5);$('spn').hidden=false;renderSP();sfx('click');}
function closeSP(){SP=null;SPH='';selM.visible=false;$('spn').hidden=true;$('spn').dataset.k='';}
const upCost=(o,k,L)=>Math.round(UPS.find(q=>q[0]===k)[4][L]*(.6+ST[o.i][6]/150));
function renderSP(){if(!SP)return;if(stalls.get(SP.x+','+SP.z)!==SP){closeSP();return;}const o=SP,d=ST[o.i],g=G[o.z][o.x],u=o.u,zz=PZ[o.pz],ar=g.a>=0&&AN[g.a]?AN[g.a]:'Square';
const est=d[1]==='lure'?'lure +'+Math.round((LP[d[0]]||0)*(1+.3*u.eq)*100)+'%':'€'+Math.round(d[7]*(AF[g.a]||1)*(g.k==='site'?1.4:1)*(1+.25*u.eq)*zz.v*zz.f*(1+.2*u.st))+'/h';
const v=o.m.userData.v,st=o.off?'Closed by you':(STAT[o.st]||o.st);
const sn=$('spn'),sk=o.x+','+o.z+'|'+o.i;if(sn.dataset.k!==sk){sn.innerHTML="<div id='spc'></div><div id='sph'></div>";sn.dataset.k=sk;$('spc').innerHTML=charCard(o,ar);spTick=0;}
let h='';
h+=`<div class='p'><table><tr><td class='m'>Status</td><td>${st}</td></tr><tr><td class='m'>Schedule</td><td>${SCHN[sch(o.i)]}</td></tr><tr><td class='m'>Est. income</td><td>${est}</td></tr><tr><td class='m'>Earned</td><td>€${o.tot}</td></tr><tr><td class='m'>Customers</td><td>${o.cnt}${o.cnt?' (avg €'+(o.tot/o.cnt).toFixed(1)+')':''}</td></tr><tr><td class='m'>Culture / Hype</td><td>+${d[8]} / +${d[9]}</td></tr><tr><td class='m'>Facing</td><td>${FACE[o.rot]}</td></tr></table></div>`;
h+=`<div class='p'><b class='px'>Rotate</b><div class='r2'><button data-a='rl'>⟲ Left</button><button data-a='rr'>Right ⟳</button><button data-a='fc'>\u{1F50D} Focus</button></div></div>`;
h+=`<div class='p'><b class='px'>Pricing</b><div class='r2'>${PZ.map((q,i)=>`<button class='${i===o.pz?'on':''}' data-a='pz' data-k='${i}'>${q.n}</button>`).join('')}</div><span class='m'>cheap = more customers, premium = bigger tickets</span></div>`;
h+=`<div class='p'><b class='px'>Upgrades</b>${UPS.map(([k,n,ic,ds])=>{const L=u[k],gate=[1,3,5][L];return L>=3?`<div class='m'>${ic} ${n} MAX</div>`:`<div><button data-a='up' data-k='${k}'>${ic} ${n} L${L}→${L+1} €${upCost(o,k,L)}</button><br><span class='m'>${ds}${S.lv<gate?' · needs LV'+gate:''}</span></div>`;}).join('')}</div>`;
h+=`<div class='p r2'><button data-a='off'>${o.off?'Reopen stall':'Close stall'}</button><button data-a='rem'>Remove (+€${Math.round(d[6]*.5)})</button></div>`;
if(h!==SPH){SPH=h;$('sph').innerHTML=h;}}
$('spn').onclick=e=>{const b=e.target.closest&&e.target.closest('button');if(!b||!SP)return;const a=b.dataset.a,o=SP;sfx('click');
if(a==='x')closeSP();
else if(a==='rl'||a==='rr'){o.rot=(o.rot+(a==='rr'?1:3))%4;S.brot=o.rot;o.m.rotation.y=o.rot*Math.PI/2;}
else if(a==='fc'){VW.tx=o.x+.5;VW.tz=o.z+.5;VW.hw=Math.min(VW.hw,3);VW.follow=false;}
else if(a==='pz')o.pz=+b.dataset.k;
else if(a==='off')o.off=!o.off;
else if(a==='up'){const k=b.dataset.k,L=o.u[k],c2=upCost(o,k,L);if(L>=3)return;if(S.lv<[1,3,5][L]){S.log='Needs level '+[1,3,5][L]+'.';sfx('bad');}else if(S.cash<c2){S.log='Not enough cash.';sfx('bad');}else{S.cash-=c2;o.u[k]++;addBadges(o);sfx('level');toast(ST[o.i][0]+': '+UPS.find(q=>q[0]===k)[1]+' level '+o.u[k],'⭐');gainXP(6);}}
else if(a==='rem'){if(S.ph==='night'){S.log='Cannot remove stalls at night.';sfx('bad');return;}S.cash+=Math.round(ST[o.i][6]*.5);const key=o.x+','+o.z;delStall(o);stalls.delete(key);closeSP();S.log='Stall removed.';}
SPH='';renderSP();ui();};
