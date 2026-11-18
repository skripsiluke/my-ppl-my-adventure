(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY = 'myPplMyAdventure.save.v1';
const state = {name:'Penyuluh Muda',xp:0,coins:0,missionDone:false,pakMissionRewarded:false,farmStage:0,questionIndex:0,quizScore:0,player:{x:145,y:390},keys:{},interact:false};
const screens=['homeScreen','menuScreen','gameScreen'];
function save(){
  localStorage.setItem(KEY, JSON.stringify({
    name:state.name,
    xp:state.xp,
    coins:state.coins,
    missionDone:state.missionDone,
    pakMissionRewarded:state.pakMissionRewarded,
    farmStage:state.farmStage,
    player:state.player
  }));
}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s)Object.assign(state,s);
  }catch(e){}
  // Compatibility: if either old completion flag is true, treat Pak Tani mission as completed.
  if(state.missionDone || state.pakMissionRewarded){
    state.missionDone=true;
    state.pakMissionRewarded=true;
    save();
  }
}
function showScreen(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id));}
function levelName(level){return ['Penyuluh Pertanian Pemula','Penyuluh Pertanian Terampil','Penyuluh Pertanian Mahir','Penyuluh Pertanian Penyelia','Penyuluh Pertanian Ahli Pertama','Penyuluh Pertanian Ahli Muda','Penyuluh Pertanian Ahli Madya','Penyuluh Pertanian Ahli Utama'][Math.min(level-1,7)];}
function updateStats(){ $('xpValue').textContent=state.xp;$('coinValue').textContent=state.coins;$('gameCoins').textContent=state.coins;const level=Math.floor(state.xp/100)+1;$('levelLabel').textContent='LEVEL '+level;$('levelTitle').textContent=levelName(level);$('levelXp').textContent=state.xp%100;$('levelProgress').style.width=(state.xp%100)+'%';$('dailyMissionText').textContent=state.missionDone?'Misi pengenalan desa selesai! Jelajahi mode simulasi dan kuis.':'Temui Pak Tani di persawahan dan dengarkan masalahnya.';$('dailyMissionReward').textContent=state.missionDone?'SELESAI':'+20 XP';}
function reward(xp,coins){state.xp+=xp;state.coins+=coins;updateStats();save();}
load();updateStats();$('playerName').value=state.name==='Penyuluh Muda'?'':state.name;
$('startButton').addEventListener('click',()=>{const n=$('playerName').value.trim();if(n)state.name=n;$('welcomeName').textContent=state.name+'!';showScreen('menuScreen');save();});
$('resetButton').addEventListener('click',()=>{if(confirm('Hapus seluruh progres permainan di perangkat ini?')){localStorage.removeItem(KEY);location.reload();}});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>openMode(b.dataset.mode)));
$('backButton').addEventListener('click',()=>{stopWorld();showScreen('menuScreen');});
function openMode(mode){stopWorld();showScreen('gameScreen');['adventurePanel','farmPanel','quizPanel'].forEach(id=>$(id).classList.add('hidden'));if(mode==='adventure'){$('gameEyebrow').textContent='MODE ADVENTURE';$('gameTitle').textContent='Desa Sukamaju';$('adventurePanel').classList.remove('hidden');startWorld();}if(mode==='farm'){$('gameEyebrow').textContent='MODE FARM SIMULATOR';$('gameTitle').textContent='Kebun Belajar';$('farmPanel').classList.remove('hidden');updateFarm();}if(mode==='quiz'){$('gameEyebrow').textContent='MODE QUIZ CHALLENGE';$('gameTitle').textContent='Uji Pengetahuanmu';$('quizPanel').classList.remove('hidden');state.questionIndex=0;state.quizScore=0;renderQuestion();}}
/* Top-down world: world coordinates are larger than the viewport; camera follows player. */
const canvas=$('worldCanvas'),ctx=canvas.getContext('2d');
const WORLD={w:1800,h:1200};let raf=0,last=0,dialogOpen=false;
const npcs=[
{id:'pak',name:'Pak Tani',x:1160,y:510,emoji:'👨‍🌾',role:'Petani padi',kind:'mission'},
{id:'bu',name:'Bu Rina',x:390,y:330,emoji:'👩‍🌾',role:'Anggota kelompok tani',kind:'info'},
{id:'ketua',name:'Pak Ketua',x:760,y:690,emoji:'🧑‍🌾',role:'Ketua kelompok tani',kind:'info'}
];
const buildings=[
{x:220,y:210,w:150,h:110,name:'Rumah Bu Rina',roof:'#a65f3e',wall:'#f1dfb7',door:'#6b986b'},
{x:600,y:150,w:170,h:125,name:'Balai Kelompok Tani',roof:'#9b5638',wall:'#f4e5bd',door:'#5d8c63'},
{x:1420,y:180,w:150,h:110,name:'Kios Pertanian',roof:'#b36c3e',wall:'#f5e6c7',door:'#638e68'}
];
const obstacles=[...buildings.map(b=>({x:b.x-5,y:b.y-15,w:b.w+10,h:b.h+20})),{x:990,y:720,w:600,h:280}];
function roundedRect(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function drawTree(x,y){ctx.fillStyle='#76513b';ctx.fillRect(x-5,y+10,10,24);ctx.fillStyle='#3f8d4d';ctx.beginPath();ctx.arc(x,y,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#68ad5e';ctx.beginPath();ctx.arc(x-10,y-8,12,0,Math.PI*2);ctx.fill();}
function drawHouse(b){roundedRect(ctx,b.x,b.y,b.w,b.h,8,b.wall);ctx.fillStyle=b.roof;ctx.beginPath();ctx.moveTo(b.x-12,b.y+8);ctx.lineTo(b.x+b.w/2,b.y-48);ctx.lineTo(b.x+b.w+12,b.y+8);ctx.closePath();ctx.fill();ctx.fillStyle=b.door;ctx.fillRect(b.x+b.w/2-13,b.y+b.h-48,26,48);ctx.fillStyle='#fff5d8';ctx.font='bold 15px Nunito';ctx.textAlign='center';ctx.fillText(b.name,b.x+b.w/2,b.y+b.h+22);}
function drawWorld(t=0){
 const camX=Math.max(0,Math.min(WORLD.w-canvas.width,state.player.x-canvas.width/2));
 const camY=Math.max(0,Math.min(WORLD.h-canvas.height,state.player.y-canvas.height/2));
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(-camX,-camY);
 ctx.fillStyle='#b8d99c';ctx.fillRect(0,0,WORLD.w,WORLD.h);
 // grass patches
 ctx.fillStyle='#a6cf88';for(let i=0;i<12;i++){ctx.beginPath();ctx.ellipse(150+i*145,110+(i%3)*310,110,65,0,0,Math.PI*2);ctx.fill();}
 // main village roads
 ctx.strokeStyle='#d9b77b';ctx.lineWidth=78;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,570);ctx.lineTo(520,570);ctx.lineTo(850,570);ctx.lineTo(1100,570);ctx.lineTo(1650,570);ctx.stroke();
 ctx.beginPath();ctx.moveTo(700,80);ctx.lineTo(700,570);ctx.lineTo(700,1020);ctx.stroke();
 // rice fields
 roundedRect(ctx,970,700,650,350,14,'#78b64c');ctx.strokeStyle='#d8e99b';ctx.lineWidth=8;for(let y=735;y<1020;y+=43){ctx.beginPath();ctx.moveTo(995,y);ctx.lineTo(1595,y+6);ctx.stroke();}
 for(let x=1010;x<1580;x+=90){for(let y=760;y<1015;y+=90){ctx.font='27px serif';ctx.fillText('🌱',x,y);}}
 // demonstration plot
 roundedRect(ctx,120,800,430,230,12,'#9cba64');ctx.fillStyle='#e6d9a7';ctx.fillRect(140,820,390,190);ctx.font='bold 19px Nunito';ctx.fillStyle='#405d34';ctx.fillText('LAHAN DEMONSTRASI',160,850);for(let x=170;x<500;x+=65){ctx.font='30px serif';ctx.fillText('🥬',x,930);}
 // irrigation stream
 ctx.strokeStyle='#75c6d7';ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(0,1080);ctx.quadraticCurveTo(420,990,780,1100);ctx.quadraticCurveTo(1150,1190,1800,1060);ctx.stroke();
 buildings.forEach(drawHouse);
 // kios sign and balai sign
 ctx.font='bold 14px Nunito';ctx.textAlign='center';ctx.fillStyle='#174d32';ctx.fillText('BALAI KELOMPOK TANI',685,125);ctx.fillText('TOKO TANI',1495,155);
 // trees
 [[90,160],[450,130],[900,170],[1080,250],[1700,220],[850,850],[650,960],[1750,850],[300,650],[920,1080],[1660,1120]].forEach(p=>drawTree(...p));
 // labels
 ctx.textAlign='left';ctx.font='bold 20px Nunito';ctx.fillStyle='#315c37';ctx.fillText('DESA SUKAMAJU',45,55);ctx.font='bold 16px Nunito';ctx.fillText('AREA PERSAWAHAN',1190,690);ctx.fillText('JALAN DESA',420,530);
 // NPCs
 npcs.forEach(n=>{ctx.font='38px serif';ctx.textAlign='center';ctx.fillText(n.emoji,n.x,n.y+8);ctx.font='bold 14px Nunito';ctx.fillStyle='#23452c';ctx.fillText(n.name,n.x,n.y+27);if(n.kind==='mission'&&!state.missionDone){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(n.x,n.y-32,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d88b1f';ctx.font='bold 19px Nunito';ctx.fillText('!',n.x,n.y-26);}});
 // player shadow and character
 ctx.fillStyle='#31552c55';ctx.beginPath();ctx.ellipse(state.player.x,state.player.y+8,16,7,0,0,Math.PI*2);ctx.fill();ctx.font='38px serif';ctx.textAlign='center';ctx.fillText('🧑‍🌾',state.player.x,state.player.y+5);
 // proximity indicator
 const near=nearestNpc();if(near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<82){ctx.fillStyle='#174d32';ctx.font='bold 15px Nunito';ctx.fillText('Tekan E untuk bicara',state.player.x,state.player.y-34);}
 ctx.restore();
 $('worldLocation').textContent=near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<100?'📍 '+near.name:'📍 Desa Sukamaju';
 $('worldObjective').textContent=state.missionDone?'⭐ Misi pengenalan selesai':'🎯 Temui Pak Tani di persawahan';
}
function nearestNpc(){let best=null,dist=Infinity;for(const n of npcs){const d=Math.hypot(n.x-state.player.x,n.y-state.player.y);if(d<dist){dist=d;best=n;}}return best;}
function blocked(x,y){return obstacles.some(o=>x>o.x-18&&x<o.x+o.w+18&&y>o.y-10&&y<o.y+o.h+10);}
function movePlayer(dx,dy){if(!dx&&!dy)return;const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;const speed=3.4;const nx=Math.max(25,Math.min(WORLD.w-25,state.player.x+dx*speed));const ny=Math.max(55,Math.min(WORLD.h-30,state.player.y+dy*speed));if(!blocked(nx,state.player.y))state.player.x=nx;if(!blocked(state.player.x,ny))state.player.y=ny;}
function loop(ts){const dt=Math.min((ts-last)/16||1,2);last=ts;let dx=(state.keys.ArrowRight||state.keys.d?1:0)-(state.keys.ArrowLeft||state.keys.a?1:0);let dy=(state.keys.ArrowDown||state.keys.s?1:0)-(state.keys.ArrowUp||state.keys.w?1:0);if(dx||dy)movePlayer(dx*dt,dy*dt);drawWorld(ts);raf=requestAnimationFrame(loop);}
function startWorld(){stopWorld();last=0;drawWorld();raf=requestAnimationFrame(loop);}
function stopWorld(){if(raf)cancelAnimationFrame(raf);raf=0;state.keys={};}
function interact(){
  if(dialogOpen)return;
  const n=nearestNpc();
  if(!n||Math.hypot(n.x-state.player.x,n.y-state.player.y)>88){
    $('missionDescription').textContent='Belum ada warga di dekatmu. Dekati petani atau bangunan bertanda.';
    return;
  }
  if(n.id==='pak' && (state.missionDone || state.pakMissionRewarded)){
    $('missionDescription').textContent='Misi Pak Tani sudah selesai. Hadiah 20 XP dan 10 koin sudah diterima.';
    return;
  }
  openNpcDialog(n);
}
function openNpcDialog(n){
  if(n.id==='pak' && (state.missionDone || state.pakMissionRewarded)){
    state.missionDone=true;
    state.pakMissionRewarded=true;
    save();
    $('missionDescription').textContent='Misi Pak Tani sudah selesai. Hadiah 20 XP dan 10 koin sudah diterima.';
    return;
  }
  stopWorld();dialogOpen=true;$('dialog').classList.remove('hidden');$('dialogEmoji').textContent=n.emoji;$('dialogEyebrow').textContent=n.role.toUpperCase();$('dialogChoices').innerHTML='';$('closeDialog').classList.add('hidden');
 if(n.id==='pak'){ $('dialogTitle').textContent='Pak Tani membutuhkan bantuan';$('dialogText').textContent='“Daun padi saya menguning dan ada bercak. Apa langkah pertama yang sebaiknya dilakukan?”';const choices=[['Langsung menyemprot pestisida dosis tinggi',false],['Mengamati gejala dan mengidentifikasi penyebabnya',true],['Membiarkan tanaman sampai panen',false]];choices.forEach(([label,ok])=>addChoice(label,ok,()=>{if(ok&&!state.pakMissionRewarded){
      state.missionDone=true;
      state.pakMissionRewarded=true;
      reward(20,10);
      $('missionStatus').textContent='Selesai ✓';
      $('missionDescription').textContent='Misi selesai! Kamu memperoleh 20 XP dan 10 koin.';
      $('dialogText').textContent='Hebat! Kamu berhasil membantu Pak Tani. Hadiah 20 XP dan 10 koin sudah ditambahkan.';
    }else if(ok){
      $('dialogText').textContent='Misi Pak Tani sudah selesai. Hadiah 20 XP dan 10 koin sebelumnya sudah kamu terima.';
    }else{
      $('dialogText').textContent='Belum tepat. Lakukan pengamatan dan identifikasi sebelum menentukan tindakan pengendalian.';
    }}));}
 else if(n.id==='bu'){$('dialogTitle').textContent='Berbincang dengan Bu Rina';$('dialogText').textContent='“Kami ingin belajar membuat catatan kegiatan kelompok tani. Apa manfaat pencatatan?”';addChoice('Membantu mendokumentasikan kegiatan dan mengevaluasi kemajuan',true,()=>{});addChoice('Tidak perlu mencatat kegiatan',false,()=>{});}
 else{$('dialogTitle').textContent='Ketua Kelompok Tani';$('dialogText').textContent='“Sebelum menyusun kegiatan, sebaiknya kita mengetahui kebutuhan anggota kelompok.” Apa pendekatan yang tepat?';addChoice('Melakukan diskusi dan identifikasi kebutuhan bersama anggota',true,()=>{});addChoice('Menentukan kegiatan tanpa mendengar petani',false,()=>{});}
 $('closeDialog').classList.remove('hidden');}
function addChoice(label,correct,after){const b=document.createElement('button');b.className='answer-option';b.textContent=label;b.addEventListener('click',()=>{document.querySelectorAll('#dialogChoices button').forEach(x=>x.disabled=true);if(correct){b.classList.add('correct');if(!state.missionDone&&$('dialogTitle').textContent!=='Pak Tani membutuhkan bantuan')reward(5,2);$('dialogText').textContent='Tepat! Pendekatan partisipatif membantu penyuluh memahami kebutuhan petani.';}else{b.classList.add('wrong');$('dialogText').textContent='Coba pikirkan kembali prinsip penyuluhan yang partisipatif dan berorientasi pada kebutuhan petani.';}after();});$('dialogChoices').appendChild(b);}
$('closeDialog').addEventListener('click',()=>{$('dialog').classList.add('hidden');dialogOpen=false;startWorld();});
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();state.keys[e.key]=true;if(e.key==='e'||e.key==='E'||e.key===' '){if(!$('dialog').classList.contains('hidden'))return;interact();}});
window.addEventListener('keyup',e=>state.keys[e.key]=false);window.addEventListener('blur',()=>state.keys={});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);state.keys[k]=true;});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>state.keys[k]=false));});
$('interactButton').addEventListener('click',interact);
/* Farm simulator */
function updateFarm(){const stages=['🟫','🌱','🌿','🌾'];$('cropEmoji').textContent=stages[state.farmStage];$('plantButton').disabled=state.farmStage!==0;$('waterButton').disabled=state.farmStage!==1;$('harvestButton').disabled=state.farmStage!==2;$('farmStatus').textContent=['Lahan masih kosong. Mulai dengan menanam benih.','Benih sudah ditanam. Tanaman membutuhkan air.','Tanaman tumbuh subur. Saatnya panen!','Panen berhasil! Kamu memperoleh hasil dari kerja kerasmu.'][state.farmStage];}
$('plantButton').addEventListener('click',()=>{state.farmStage=1;reward(5,0);updateFarm();});$('waterButton').addEventListener('click',()=>{state.farmStage=2;reward(5,0);updateFarm();});$('harvestButton').addEventListener('click',()=>{state.farmStage=3;reward(20,15);updateFarm();setTimeout(()=>{state.farmStage=0;updateFarm();save();},1800);});
/* Quiz */
const questions=[
{q:'Apa tujuan utama penyuluhan pertanian?',a:['Menggantikan seluruh keputusan petani','Meningkatkan pengetahuan, keterampilan, dan sikap petani','Menjual sarana produksi sebanyak-banyaknya','Mewajibkan satu teknologi untuk semua petani'],c:1,why:'Penyuluhan membantu petani meningkatkan kapasitas agar mampu mengambil keputusan secara mandiri.'},
{q:'Apa langkah awal ketika menemukan gejala serangan hama di lahan?',a:['Mengidentifikasi gejala dan organisme penyebab','Mencampur semua pestisida','Menaikkan dosis pupuk','Langsung memusnahkan seluruh tanaman'],c:0,why:'Pengamatan dan identifikasi menjadi dasar menentukan tindakan pengendalian yang tepat.'},
{q:'Apa kepanjangan PHT?',a:['Pengelolaan Hasil Tanaman','Pengamatan Harian Terpadu','Pengendalian Hama Terpadu','Program Hasil Tani'],c:2,why:'PHT adalah Pengendalian Hama Terpadu.'},
{q:'Mengapa petani perlu melakukan pemupukan berimbang?',a:['Agar pupuk digunakan sebanyak mungkin','Agar kebutuhan hara tanaman terpenuhi sesuai kondisi dan rekomendasi','Agar tidak perlu mengairi tanaman','Agar semua jenis tanah mendapat dosis sama'],c:1,why:'Pemupukan berimbang menyesuaikan kebutuhan hara, kondisi tanah, dan rekomendasi.'},
{q:'Dalam penyuluhan, metode demonstrasi bertujuan untuk…',a:['Memperlihatkan praktik atau cara kerja teknologi secara langsung','Menggantikan seluruh diskusi kelompok','Menguji hafalan istilah saja','Membatasi petani untuk bertanya'],c:0,why:'Demonstrasi memberi kesempatan sasaran melihat proses dan praktik penerapan teknologi.'}
];
function renderQuestion(){const q=questions[state.questionIndex];$('questionCount').textContent=`Soal ${state.questionIndex+1} dari ${questions.length}`;$('questionText').textContent=q.q;$('quizFeedback').textContent='';$('nextQuestionButton').classList.add('hidden');$('answerList').innerHTML='';q.a.forEach((a,i)=>{const b=document.createElement('button');b.className='answer-option';b.textContent=String.fromCharCode(65+i)+'. '+a;b.addEventListener('click',()=>{const all=$('answerList').querySelectorAll('button');all.forEach(x=>x.disabled=true);if(i===q.c){b.classList.add('correct');$('quizFeedback').textContent='Benar! '+q.why;state.quizScore++;reward(10,3);}else{b.classList.add('wrong');all[q.c].classList.add('correct');$('quizFeedback').textContent='Belum tepat. '+q.why;}$('nextQuestionButton').classList.remove('hidden');});$('answerList').appendChild(b);});}
$('nextQuestionButton').addEventListener('click',()=>{state.questionIndex++;if(state.questionIndex<questions.length){renderQuestion();}else{$('questionText').textContent=`Kuis selesai! Skor kamu ${state.quizScore} dari ${questions.length}.`;$('answerList').innerHTML='';$('quizFeedback').textContent='Terus belajar dan tingkatkan kemampuan penyuluhanmu!';$('nextQuestionButton').textContent='Ulangi kuis';$('nextQuestionButton').onclick=()=>{state.questionIndex=0;state.quizScore=0;$('nextQuestionButton').textContent='Soal berikutnya →';$('nextQuestionButton').onclick=null;renderQuestion();};}});
})();
