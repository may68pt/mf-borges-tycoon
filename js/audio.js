/* MF Borges Tycoon - audio module (split from the single-file game; loads in order, shares global scope) */
// ---- audio: synthesized chiptune soundtrack + sound fx (no files) ----
let AX=null,MG=null,SG2=null;
function audio(){if(AX)return;try{AX=new (window.AudioContext||window.webkitAudioContext)();const cp=AX.createDynamicsCompressor();cp.connect(AX.destination);MG=AX.createGain();MG.connect(cp);DS=AX.createWaveShaper();DS.curve=dcurve(30);DS.oversample='2x';DS.connect(MG);SG2=AX.createGain();SG2.connect(AX.destination);setInterval(musicTick,60);}catch(e){}}
addEventListener('pointerdown',audio);addEventListener('keydown',audio);
const mf=n=>440*Math.pow(2,(n-69)/12);
function tone(f,t,d,type,v,dest,sl){const o=AX.createOscillator(),g=AX.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.02);}
function noise(t,d,v,dest){const n=Math.floor(AX.sampleRate*d),b=AX.createBuffer(1,n,AX.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;const s=AX.createBufferSource(),g=AX.createGain();s.buffer=b;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(g);g.connect(dest);s.start(t);}
let lastCoin=0;
function sfx(n){if(!AX||!SET.sfx)return;const t=AX.currentTime;SG2.gain.value=SET.sfx*.5;
if(n==='coin'){if(t-lastCoin<.07)return;lastCoin=t;const f=mf(84+Math.floor(Math.random()*3)*2);tone(f,t,.08,'square',.22,SG2);tone(f*1.5,t+.07,.14,'square',.22,SG2);}
else if(n==='build'){tone(120,t,.12,'square',.4,SG2,60);noise(t,.05,.2,SG2);tone(mf(72),t+.1,.1,'triangle',.3,SG2);}
else if(n==='bad')tone(140,t,.2,'sawtooth',.3,SG2,90);
else if(n==='click')tone(660,t,.04,'square',.15,SG2);
else if(n==='level')[72,76,79,84,88].forEach((m,i)=>tone(mf(m),t+i*.09,.2,'square',.3,SG2));
else if(n==='goal')[76,83,88].forEach((m,i)=>tone(mf(m),t+i*.1,.18,'triangle',.4,SG2));
else if(n==='event'){tone(mf(48),t,.9,'triangle',.5,SG2);tone(mf(55),t,.9,'triangle',.4,SG2);noise(t,.3,.15,SG2);}}
let step=0,nextT=0;const DAYC=[[48,52,55],[45,48,52],[41,45,48],[43,47,50]],NIGC=[[45,48,52],[41,45,48],[48,52,55],[43,47,50]],ARP=[0,1,2,1,0,1,2,1,2,1,0,1,2,1,0,1];
function musicTickOld(){if(!AX||!SET.mus||!S)return;MG.gain.value=SET.mus*.35;const night=S.ph==='night',bpm=night?126:S.ph==='changeover'?96:108,sd=60/bpm/4;if(!nextT||nextT<AX.currentTime-.5)nextT=AX.currentTime+.05;
while(nextT<AX.currentTime+.25){const ch=(night?NIGC:DAYC)[Math.floor(step/16)%4],s=step%16,t=nextT,lead=ch[ARP[s]]+(night?24:12)+(s%8===7?12:0);
if(s%2===0||night)tone(mf(lead),t,sd*(night?.9:1.6),night?'sawtooth':'square',night?.09:.1,MG);
if(s%4===0)tone(mf(ch[0]-12),t,sd*3,'triangle',.34,MG);if(night&&s%4===2)tone(mf(ch[0]-12),t,sd*1.5,'triangle',.28,MG);
if(night?s%2===0:s%4===2)noise(t,.03,night?.08:.05,MG);if(night&&s%4===0)tone(90,t,.12,'sine',.5,MG,40);step++;nextT+=sd;}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))sfx('click');});
