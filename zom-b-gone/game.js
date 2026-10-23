const $=id=>document.getElementById(id),R=n=>Math.floor(Math.random()*n),pick=a=>a[R(a.length)];
const MUL=[[2,3],[3,4],[2,5],[4,4],[3,5]],SUB=[[12,5],[15,7],[18,9],[16,8],[14,6]];
const LV=[
{name:'LEVEL 1: RESCUE THE SURVIVOR',h:'SAVE THE HUMAN!',s:'The survivor is trapped. Defeat the right zombies and match the required total to unlock the cell.',lbl:'RESCUE TARGET',gen(){const t=5+R(16);return{t,eq:'Defeat zombies to add up to '+t}},ok:'LEVEL 1 COMPLETE — SURVIVOR RESCUED!'},
{name:'LEVEL 2: CROSS THE RED LIGHT',h:'GET THEM ACROSS!',s:'The signal is locked. Solve the multiplication challenge to activate the crossing and guide the survivor to safety.',lbl:'ENERGY NEEDED',gen(){const[a,b]=pick(MUL);return{t:a*b,eq:`${a} × ${b} = ?  Collect that many energy`}},ok:'LEVEL 2 COMPLETE — CROSSING UNLOCKED!'},
{name:'LEVEL 3: WELCOME HOME',h:'ONE LAST CHECK!',s:'You made it home. Solve the final security challenge to verify the survivor and unlock the front door.',lbl:'ANSWER',gen(){const[a,b]=pick(SUB);return{t:a-b,eq:`${a} − ${b} = ?  Collect the answer`}},ok:'LEVEL 3 COMPLETE'}];
const SCN=[`<div class="bars"></div><div class="sv">🧍</div>`,
`<div class="road"></div><div class="car" style="animation-delay:0s">🚗</div><div class="car" style="animation-delay:-2s">🚌</div><div class="light"></div><div class="sv">🧍</div>`,
`<div class="scan"></div><div class="sv" style="left:10%">🧍</div><div class="house">🏠</div><div class="sv" style="left:55%;font-size:2rem">🤖</div>`];
let S={},T=null,mute=false,ac,done=[],totalMs=0,startAt=0;
function beep(f,d=.1,ty='square'){if(mute)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function overlay(h,p,btns,bad,extra=''){const b=document.querySelector('.box');b.className='box'+(bad?' bad':'');$('oh').textContent=h;$('op').textContent=p;$('os').innerHTML=extra;const ob=$('ob');ob.innerHTML='';btns.forEach(([t,f,alt])=>{const e=document.createElement('button');e.className='btn'+(alt?' alt':'');e.textContent=t;e.onclick=f;ob.appendChild(e)});$('ov').classList.add('on');ob.firstChild.focus()}
function intro(){const l=LV[S.l];$('scene').className='';$('scene').innerHTML=SCN[S.l];$('lvlName').textContent=l.name;$('prog').textContent=`LEVEL ${S.l+1} / 3`;
 overlay(l.h,l.s,[['START',begin]])}
function board(t){const parts=[];let r=t;while(r>0){const p=Math.min(r,1+R(Math.min(9,r)),10);parts.push(p);r-=p}
 const v=Array.from({length:9},()=>1+R(10)),idx=[...Array(9).keys()].sort(()=>Math.random()-.5);parts.slice(0,9).forEach((p,i)=>v[idx[i]]=p);return v}
function begin(){$('ov').classList.remove('on');const l=LV[S.l],c=l.gen();Object.assign(S,{t:c.t,eq:c.eq,sum:0,over:false,time:18,vals:board(c.t)});
 $('scoreLbl').textContent=l.lbl;$('tgt').innerHTML=`TARGET: <em>${c.t}</em>`;$('eq').textContent=c.eq;$('mission').textContent='YOUR MISSION';
 const g=$('grid');g.innerHTML='';S.vals.forEach((v,i)=>{const b=document.createElement('button');b.className='z';b.setAttribute('aria-label','Zombie worth '+v);b.innerHTML=`<img src="assets/z${i+1}.png" alt=""><span class="n">${v}</span>`;b.onclick=()=>hit(i,b);g.appendChild(b)});
 upd();startAt=Date.now();clearInterval(T);T=setInterval(tick,100);}
function upd(){$('score').textContent=String(S.sum).padStart(4,'0');$('pbar').style.width=Math.min(100,S.sum/S.t*100)+'%';
 const s=Math.max(0,S.time);$('time').textContent='00:'+String(Math.ceil(s)).padStart(2,'0');$('tbar').style.width=s/18*100+'%'}
function tick(){S.time-=.1;upd();if(S.time<=0){S.time=0;upd();end(false,'TIME\'S UP!','Time expired before you reached the target.')}}
function hit(i,b){if(S.over)return;b.classList.add('hit');const v=S.vals[i];S.sum+=v;beep(440+v*40);
 const p=document.createElement('span');p.className='pop';p.textContent='+'+v;b.appendChild(p);upd();
 if(S.sum===S.t)end(true);else if(S.sum>S.t){$('game').classList.add('shake');setTimeout(()=>$('game').classList.remove('shake'),300);end(false,'FAIL!','Score exceeded the target.')}}
function end(ok,h,msg){if(S.over)return;S.over=true;clearInterval(T);const el=(Date.now()-startAt);
 document.querySelectorAll('.z').forEach(z=>z.disabled=true);
 if(!ok){beep(120,.5,'sawtooth');return overlay(h,msg,[['TRY AGAIN',begin],['RESTART GAME',restart,1]],true,`Total: <b>${S.sum}</b> &nbsp; Target: <b>${S.t}</b>`)}
 totalMs+=el;done.push(LV[S.l].name);beep(880,.3);$('scene').classList.add('win');
 setTimeout(()=>{if(S.l<2)overlay(LV[S.l].ok,'Survivor moves on to the next scene…',[['CONTINUE',()=>{S.l++;intro()}]]);
 else overlay('HUMAN VERIFIED','“Identity confirmed. Welcome home.”',[['PLAY AGAIN',restart]],false,`✅ Level 1 — Rescue the Survivor<br>✅ Level 2 — Cross the Red Light<br>✅ Level 3 — Welcome Home<br>Challenges passed: <b>3/3</b> &nbsp; Time: <b>${(totalMs/1000).toFixed(1)}s</b><br><small>A playful CAPTCHA experiment — not a secure identity check.</small>`)},1800)}
function restart(){clearInterval(T);S={l:0};totalMs=0;done=[];intro()}
$('mute').onclick=()=>{mute=!mute;$('mute').textContent=mute?'🔇':'🔊'};
addEventListener('mousemove',e=>{const k=$('knife');k.style.left=e.clientX+'px';k.style.top=e.clientY+'px'});
addEventListener('keydown',e=>{if(/^[1-9]$/.test(e.key)&&!S.over&&!$('ov').classList.contains('on')){const z=$('grid').children[+e.key-1];z&&!z.disabled&&z.click()}});
restart();
