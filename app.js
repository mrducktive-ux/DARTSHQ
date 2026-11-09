const $ = (id) => document.getElementById(id);
const STORE = 'darts-hq-v1';
const defaultState = {
  players: [{id:'p1',name:'Player 1'},{id:'p2',name:'Player 2'}],
  history: [], tournaments: [], game: null, practice: null
};
let state = loadState();
let visit = [];
let entryMode = 'board';

function loadState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch{return structuredClone(defaultState)}}
function save(){localStorage.setItem(STORE,JSON.stringify(state));renderPlayers();renderHistory();renderTournaments();populatePlayerSelects()}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showView(name){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===name))}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));

function populatePlayerSelects(){
  ['playerOne','playerTwo','playerThree','playerFour'].forEach((id,i)=>{
    const el=$(id), old=el.value;el.innerHTML=state.players.map(p=>`<option value="${p.id}">${escapeHTML(p.name)}</option>`).join('');
    if(state.players.some(p=>p.id===old))el.value=old;else if(state.players[i])el.value=state.players[i].id;
  });
}
$('playerCount').addEventListener('change',()=>{const n=+$('playerCount').value;['playerTwoWrap','playerThreeWrap','playerFourWrap'].forEach((id,i)=>$(id).hidden=n<i+2)});
function startMatch(){
  const n=+$('playerCount').value, ids=['playerOne','playerTwo','playerThree','playerFour'].slice(0,n).map(id=>$(id).value);
  if(new Set(ids).size!==ids.length){alert('Choose a different profile for each player.');return}
  const names=ids.map(id=>state.players.find(p=>p.id===id)?.name||'Player');
  state.game={start:+$('startScore').value,rule:$('outRule').value,names,ids,scores:names.map(()=>+$('startScore').value),averages:names.map(()=>0),visits:names.map(()=>[]),turn:0,leg:1,active:true,started:new Date().toISOString()};
  visit=[];$('setupPanel').hidden=true;$('gamePanel').hidden=false;renderGame();save();
}
$('startMatch').addEventListener('click',startMatch);
function renderGame(){
  const g=state.game;if(!g)return;
  $('gameFormat').textContent=`${g.start} · ${g.rule.toUpperCase()} OUT`;$('legLabel').textContent=`LEG ${g.leg}`;
  $('turnName').textContent=`${g.names[g.turn]}'S TURN`;$('dartsLeft').textContent=`${3-visit.length} DARTS`;
  $('scoreCards').innerHTML=g.names.map((name,i)=>`<div class="score-card ${i===g.turn?'current':''}"><div class="player-label">${escapeHTML(name)}</div><strong>${g.scores[i]}</strong><small>3-DART AVG ${average(g.visits[i]).toFixed(1)}</small></div>`).join('');
  $('lastVisit').textContent=g.visits[g.turn].length?g.visits[g.turn][g.visits[g.turn].length-1].score:'—';
  $('matchStatus').textContent='IN PLAY';
  renderVisit();
}
function average(visits){const darts=visits.reduce((a,v)=>a+v.darts,0),points=visits.reduce((a,v)=>a+v.score,0);return darts?points/darts*3:0}
function renderVisit(){
  $('visitCount').textContent=`${visit.length}/3`;$('visitTotal').textContent=visit.reduce((a,d)=>a+d.value,0);
  $('visitDarts').innerHTML=[0,1,2].map(i=>visit[i]?`<div class="dart-chip"><span>${visit[i].label}</span><b>${visit[i].value}</b></div>`:`<div class="empty-dart">DART ${i+1}</div>`).join('');
  $('submitBoard').disabled=visit.length===0;
  $('dartsLeft').textContent=`${3-visit.length} DARTS`;
}
function addDart(label,value,mult=1){if(!state.game?.active||visit.length>=3)return;visit.push({label,value,mult});renderVisit();if(visit.length===3)$('submitBoard').disabled=false}
function polar(cx,cy,r,a){const rad=(a-90)*Math.PI/180;return [cx+r*Math.cos(rad),cy+r*Math.sin(rad)]}
function sectorPath(cx,cy,r1,r2,a1,a2){const p1=polar(cx,cy,r2,a1),p2=polar(cx,cy,r2,a2),p3=polar(cx,cy,r1,a2),p4=polar(cx,cy,r1,a1);return `M${p1} A${r2},${r2} 0 0 1 ${p2} L${p3} A${r1},${r1} 0 0 0 ${p4} Z`}
function drawBoard(){
  const svg=$('dartboard'),nums=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  let out='<circle cx="210" cy="210" r="204" fill="#10151d" stroke="#657080" stroke-width="5"/>';
  nums.forEach((num,i)=>{
    const a=i*18;
    const color=i%2?'#20232a':'#eee7d8';
    const next=i%2?'#eee7d8':'#20232a';
    out+=`<path class="board-segment" data-num="${num}" data-mult="1" d="${sectorPath(210,210,126,174,a-8.8,a+8.8)}" fill="${color}"/>`;
    out+=`<path class="board-segment" data-num="${num}" data-mult="3" d="${sectorPath(210,210,108,126,a-8.8,a+8.8)}" fill="${i%2?'#278a62':'#c83e43'}"/>`;
    out+=`<path class="board-segment" data-num="${num}" data-mult="1" d="${sectorPath(210,210,42,108,a-8.8,a+8.8)}" fill="${next}"/>`;
    out+=`<path class="board-segment" data-num="${num}" data-mult="2" d="${sectorPath(210,210,174,190,a-8.8,a+8.8)}" fill="${i%2?'#c83e43':'#278a62'}"/>`;
    const p=polar(210,210,199,a);out+=`<text class="board-number" x="${p[0]}" y="${p[1]}">${num}</text>`;
  });
  out+='<circle class="board-segment" data-num="25" data-mult="1" cx="210" cy="210" r="22" fill="#278a62"/><circle class="board-segment" data-num="25" data-mult="2" cx="210" cy="210" r="10" fill="#c83e43"/>';
  svg.innerHTML=out;
  svg.querySelectorAll('.board-segment').forEach(el=>el.addEventListener('click',()=>{
    const n=+el.dataset.num,m=+el.dataset.mult;
    const label=n===25?(m===2?'BULL':'25'):(m===3?'T':m===2?'D':'S')+n;
    addDart(label,n*m,m);
  }));
}
$('submitBoard').addEventListener('click',()=>submitVisit(visit.reduce((a,d)=>a+d.value,0),visit.length));
$('clearVisit').addEventListener('click',()=>{visit=[];renderVisit()});
function submitVisit(score,darts=3){
  const g=state.game;if(!g?.active)return;
  const i=g.turn,remaining=g.scores[i]-score;
  const isFinish=remaining===0&&(g.rule==='straight'||visit.some(d=>d.mult===2));
  const bust=remaining<0||(g.rule==='double'&&remaining===1)||(remaining===0&&!isFinish);
  const actual=bust?0:score;
  g.visits[i].push({score:actual,darts:bust?3:darts,date:new Date().toISOString()});
  g.scores[i]=bust?g.scores[i]:remaining;
  if(!bust&&score===180)showCelebration();
  visit=[];
  if(isFinish){finishMatch(i);return}
  g.turn=(g.turn+1)%g.names.length;renderGame();renderVisit();save();
}
$('submitManual').addEventListener('click',()=>{const v=+$('manualScore').value;if(!Number.isInteger(v)||v<0||v>180){alert('Enter a score from 0 to 180.');return}submitVisit(v,3);$('manualScore').value=''});
$('manualScore').addEventListener('keydown',e=>{if(e.key==='Enter')$('submitManual').click()});
document.querySelectorAll('[data-score]').forEach(b=>b.addEventListener('click',()=>{$('manualScore').value=b.dataset.score;$('submitManual').click()}));
document.querySelectorAll('.entry-tab').forEach(b=>b.addEventListener('click',()=>{entryMode=b.dataset.entry;document.querySelectorAll('.entry-tab').forEach(x=>x.classList.toggle('active',x===b));$('boardEntry').hidden=entryMode!=='board';$('manualEntry').hidden=entryMode!=='manual'}));
$('undo').addEventListener('click',()=>{
  const g=state.game;if(!g)return;
  const prev=(g.turn-1+g.names.length)%g.names.length;
  if(g.visits[prev].length){const v=g.visits[prev].pop();g.scores[prev]=Math.min(g.start,g.scores[prev]+v.score);g.turn=prev;visit=[];renderGame();renderVisit();save()}else if(g.visits[g.turn].length){const v=g.visits[g.turn].pop();g.scores[g.turn]=Math.min(g.start,g.scores[g.turn]+v.score);visit=[];renderGame();renderVisit();save()}else alert('Nothing to undo yet.');
});
function finishMatch(winner){
  const g=state.game;g.active=false;
  const match={date:new Date().toISOString(),start:g.start,rule:g.rule,names:g.names,winner:g.names[winner],visits:g.visits.map(v=>v.length)};
  state.history.unshift(match);state.history=state.history.slice(0,100);save();
  $('gamePanel').hidden=true;$('setupPanel').hidden=false;$('matchStatus').textContent='FINISHED';
  alert(`${g.names[winner]} wins! Match saved to history.`);state.game=null;visit=[];save();
}
$('newMatch').addEventListener('click',()=>{if(confirm('End this match and return to setup?')){state.game=null;visit=[];$('gamePanel').hidden=true;$('setupPanel').hidden=false;$('matchStatus').textContent='READY'}});
function showCelebration(){$('celebration').hidden=false}
$('closeCelebration').addEventListener('click',()=>$('celebration').hidden=true);

function renderPlayers(){
  $('playerList').innerHTML=state.players.map(p=>`<div class="list-item"><div><strong>${escapeHTML(p.name)}</strong><small>Player profile · local device</small></div><div><button class="btn ghost small" data-rename="${p.id}">Rename</button>${state.players.length>1?`<button class="btn danger-outline small" data-delete="${p.id}">Delete</button>`:''}</div></div>`).join('')||'<div class="empty-state">No player profiles yet.</div>';
  $('playerList').querySelectorAll('[data-rename]').forEach(b=>b.addEventListener('click',()=>{const p=state.players.find(x=>x.id===b.dataset.rename),name=prompt('New player name',p.name);if(name?.trim()){p.name=name.trim().slice(0,24);save()}}));
  $('playerList').querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Delete this player profile?')){state.players=state.players.filter(x=>x.id!==b.dataset.delete);save()}}));
}
$('playerForm').addEventListener('submit',e=>{e.preventDefault();const name=$('newPlayerName').value.trim();if(!name)return;state.players.push({id:'p'+Date.now(),name});$('newPlayerName').value='';save()});
function renderHistory(){$('historyList').innerHTML=state.history.map(h=>`<div class="list-item"><div><strong>${escapeHTML(h.winner)} won · ${h.start}</strong><small>${new Date(h.date).toLocaleString()} · ${h.rule} out · ${h.names.map(escapeHTML).join(' vs ')}</small></div><div class="right"><small>COMPLETED</small></div></div>`).join('')||'<div class="empty-state">No completed matches yet. Your results will appear here.</div>'}
$('clearHistory').addEventListener('click',()=>{if(confirm('Clear all match history?')){state.history=[];save()}});
$('tournamentForm').addEventListener('submit',e=>{e.preventDefault();state.tournaments.unshift({id:Date.now(),name:$('tournamentName').value.trim(),format:$('tournamentFormat').value,date:new Date().toISOString()});$('tournamentName').value='';save()});
function renderTournaments(){$('tournamentList').innerHTML=state.tournaments.map(t=>`<div class="list-item"><div><strong>${escapeHTML(t.name)}</strong><small>${t.format} · Created ${new Date(t.date).toLocaleDateString()}</small></div><button class="btn danger-outline small" data-tdelete="${t.id}">Delete</button></div>`).join('')||'<div class="empty-state">No tournaments created yet.</div>';$('tournamentList').querySelectorAll('[data-tdelete]').forEach(b=>b.addEventListener('click',()=>{state.tournaments=state.tournaments.filter(t=>String(t.id)!==b.dataset.tdelete);save()}))}

const routes={
  double:{2:['D1'],3:['1','D1'],4:['D2'],5:['1','D2'],6:['D3'],7:['3','D2'],8:['D4'],9:['1','D4'],10:['D5'],11:['3','D4'],12:['D6'],13:['5','D4'],14:['D7'],15:['7','D4'],16:['D8'],17:['1','D8'],18:['D9'],19:['3','D8'],20:['D10'],21:['5','D8'],22:['D11'],23:['7','D8'],24:['D12'],25:['9','D8'],26:['D13'],27:['3','D12'],28:['D14'],29:['5','D12'],30:['D15'],31:['7','D12'],32:['D16'],33:['1','D16'],34:['D17'],35:['3','D16'],36:['D18'],37:['5','D16'],38:['D19'],39:['7','D16'],40:['D20'],41:['9','D16'],42:['10','D16'],43:['3','D20'],44:['12','D16'],45:['13','D16'],46:['6','D20'],47:['15','D16'],48:['16','D16'],49:['9','D20'],50:['10','D20'],51:['T17','D0'],52:['20','D16'],53:['13','D20'],54:['14','D20'],55:['15','D20'],56:['16','D20'],57:['17','D20'],58:['18','D20'],59:['19','D20'],60:['20','D20'],61:['T15','D8'],62:['T10','D16'],63:['T13','D12'],64:['T16','D8'],65:['T19','D4'],66:['T10','D18'],67:['T17','D8'],68:['T20','D4'],69:['T19','D6'],70:['T18','D8'],71:['T13','D16'],72:['T16','D12'],73:['T19','D8'],74:['T14','D16'],75:['T17','D12'],76:['T20','D8'],77:['T19','D10'],78:['T18','D12'],79:['T13','D20'],80:['T20','D10'],81:['T19','D12'],82:['T14','D20'],83:['T17','D16'],84:['T20','D12'],85:['T15','D20'],86:['T18','D16'],87:['T17','D18'],88:['T20','D14'],89:['T19','D16'],90:['T18','D18'],91:['T17','D20'],92:['T20','D16'],93:['T19','D18'],94:['T18','D20'],95:['T19','D19'],96:['T20','D18'],97:['T19','D20'],98:['T20','D19'],99:['T19','D21'],100:['T20','D20'],101:['T17','T20','D5'],102:['T20','T14','D6'],103:['T19','T14','D8'],104:['T18','T18','D7'],105:['T20','T15','D15'],106:['T20','T10','D18'],107:['T19','T10','D20'],108:['T20','T16','D12'],109:['T20','T19','D8'],110:['T20','T18','D13'],111:['T19','T18','D9'],112:['T20','T20','D16'],113:['T20','T19','D10'],114:['T20','T18','D12'],115:['T20','T19','D11'],116:['T20','T20','D8'],117:['T20','T19','D12'],118:['T20','T18','D14'],119:['T19','T20','D11'],120:['T20','20','D20'],121:['T20','T11','D14'],122:['T18','T18','D17'],123:['T19','T16','D9'],124:['T20','T16','D8'],125:['25','T20','D20'],126:['T19','T19','D7'],127:['T20','T17','D8'],128:['T18','T14','D16'],129:['T19','T16','D12'],['130']:['T20','T18','D8'],131:['T20','T13','D16'],132:['T20','T16','D12'],133:['T20','T19','D8'],134:['T20','T14','D16'],135:['T20','T17','D12'],136:['T20','T20','D8'],137:['T20','T19','D10'],138:['T20','T18','D12'],139:['T19','T14','D20'],140:['T20','T20','D10'],141:['T20','T19','D12'],142:['T20','T14','D20'],143:['T20','T17','D16'],144:['T20','T20','D12'],145:['T20','T15','D20'],146:['T20','T18','D16'],147:['T20','T17','D18'],148:['T20','T20','D14'],149:['T20','T19','D16'],150:['T20','T18','D18'],151:['T20','T17','D20'],152:['T20','T20','D16'],153:['T20','T19','D18'],154:['T20','T18','D20'],155:['T20','T19','D19'],156:['T20','T20','D18'],157:['T20','T19','D20'],158:['T20','T20','D19'],160:['T20','T20','D20'],161:['T20','T17','BULL'],164:['T20','T18','BULL'],167:['T20','T19','BULL'],170:['T20','T20','BULL']},
  straight:{}
};
function calcCheckout(n,rule){
  if(n<2||n>170)return [];
  if(rule==='double'){const r=routes.double[n];return r?[r.join(' · ')]:n===159||n===162||n===163||n===165||n===166||n===168||n===169?[]:[]}
  const vals=[];for(let a=0;a<=60;a++)for(let b=0;b<=60;b++)for(let c=0;c<=60;c++){if(a+b+c===n){vals.push([a,b,c].filter(x=>x>0).join(' · '));if(vals.length>=3)return vals}}
  return vals;
}
function updateCheckout(){const n=+$('checkoutScore').value,rule=$('checkoutRule').value,res=calcCheckout(n,rule);$('checkoutResult').innerHTML=n===1?'<h3>Not a finish</h3><p class="muted small-copy">You cannot finish on 1.</p>':res.length?`<h3>${n} checkout</h3>${res.map(r=>`<span class="route">${escapeHTML(r)}</span>`).join('')}`:`<h3>No standard checkout found</h3><p class="muted small-copy">Try setting up your next visit.</p>`}
$('checkoutScore').addEventListener('input',updateCheckout);$('checkoutRule').addEventListener('change',updateCheckout);

function startPractice(type){state.practice={type,target:1,visits:[]};$('practicePanel').hidden=false;$('practiceType').textContent=type==='clock'?'AROUND THE CLOCK':'SCORING PRACTICE';$('practiceTitle').textContent=type==='clock'?'Around the clock':'Scoring practice';$('practiceLabel').textContent=type==='clock'?'NEXT NUMBER':'PRACTICE SESSION';$('practiceTarget').textContent=type==='clock'?'1':'—';$('practiceHint').textContent=type==='clock'?'Hit the target number to move on. Log a visit when you have thrown.':'Log each visit to track your practice average.';$('practiceFeedback').textContent='';}
$('startClock').addEventListener('click',()=>startPractice('clock'));$('startScoring').addEventListener('click',()=>startPractice('scoring'));
$('stopPractice').addEventListener('click',()=>{$('practicePanel').hidden=true;state.practice=null});
$('practiceAdd').addEventListener('click',()=>{if(!state.practice)return;const v=+$('practiceInput').value;if(!Number.isInteger(v)||v<0||v>180){alert('Enter a visit from 0 to 180.');return}const p=state.practice;p.visits.push(v);if(p.type==='clock'&&v>0){p.target++;if(p.target>20){$('practiceFeedback').textContent='Around the clock complete! Great work.';p.target=20}else $('practiceFeedback').textContent=`Visit logged. Next target: ${p.target}.`}else $('practiceFeedback').textContent=`${p.visits.length} visits · average ${ (p.visits.reduce((a,b)=>a+b,0)/p.visits.length).toFixed(1)} points per visit.`;$('practiceTarget').textContent=p.type==='clock'?p.target:'—';$('practiceInput').value=''});
populatePlayerSelects();drawBoard();renderPlayers();renderHistory();renderTournaments();updateCheckout();
