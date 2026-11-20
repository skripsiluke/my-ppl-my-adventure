(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY = 'myPplMyAdventure.save.v1';
const TUTORIAL_KEY='myPplMyAdventure.tutorial.v1';

const FIRST_LEVEL_XP=150, XP_PER_LEVEL=250;
function xpThreshold(level){return level<=1?0:FIRST_LEVEL_XP+(level-2)*XP_PER_LEVEL;}
function levelFromXP(xp){let level=1;while(xp>=xpThreshold(level+1))level++;return level;}
function levelProgress(xp){const level=levelFromXP(xp);return {level,progress:xp-xpThreshold(level),needed:level===1?FIRST_LEVEL_XP:XP_PER_LEVEL};}
const state = {name:'Penyuluh Muda',avatarIndex:0,xp:0,coins:0,missionDone:false,pakMissionRewarded:false,buMissionDone:false,buMissionRewarded:false,ketuaMissionDone:false,ketuaMissionRewarded:false,farmStage:0,questionIndex:0,quizScore:0,harvestCount:0,correctQuizCount:0,unlockedAchievements:[],achievementRewardsClaimed:[],highestLevelReached:1,missionFlags:{},pmaas:{stages:{},milestones:[],farmers:0,groups:0,xpEarned:0,drumSeederCompleted:false,adopterProgress:{}},player:{x:145,y:390},keys:{},analog:{x:0,y:0},interact:false,catOwned:false,catQuestNpcId:null,catFollower:{x:120,y:410},scene:'village',mineGold:0,mineNodes:[],returnPosition:{x:145,y:390},ranchMissionDone:false,farmPlots:[],farmSeeds:{padi:3,jagung:2,cabai:1},farmProduce:{},farmSelectedPlot:0,farmSelectedCrop:'padi',farmPlayer:{x:450,y:430},farmTarget:null,farmDay:1,farmLastWeather:'Cerah',farmUnlockedPlots:1,farmPesticides:0,farmPesticideStarterGranted:false};
const screens=['homeScreen','menuScreen','gameScreen'];
function save(){
  localStorage.setItem(KEY, JSON.stringify({
    name:state.name,
    avatarIndex:state.avatarIndex||0,
    xp:state.xp,
    coins:state.coins,
    missionDone:state.missionDone,
    pakMissionRewarded:state.pakMissionRewarded,
    buMissionDone:state.buMissionDone,
    buMissionRewarded:state.buMissionRewarded,
    ketuaMissionDone:state.ketuaMissionDone,
    ketuaMissionRewarded:state.ketuaMissionRewarded,
    farmStage:state.farmStage,
    harvestCount:state.harvestCount,
    correctQuizCount:state.correctQuizCount,
    unlockedAchievements:state.unlockedAchievements,
    achievementRewardsClaimed:state.achievementRewardsClaimed,
    highestLevelReached:state.highestLevelReached,
    missionFlags:state.missionFlags,
    pmaas:state.pmaas,
    player:state.player,
    catOwned:!!state.catOwned,
    catQuestNpcId:state.catQuestNpcId,
    catFollower:state.catFollower,
    scene:state.scene||'village',mineGold:Number(state.mineGold)||0,mineNodes:Array.isArray(state.mineNodes)?state.mineNodes:[],returnPosition:state.returnPosition||{x:145,y:390},ranchMissionDone:!!state.ranchMissionDone,
    farmPlots:state.farmPlots,farmSeeds:state.farmSeeds,farmProduce:state.farmProduce,farmSelectedPlot:state.farmSelectedPlot,farmSelectedCrop:state.farmSelectedCrop,farmPlayer:state.farmPlayer,farmDay:state.farmDay,farmLastWeather:state.farmLastWeather,farmUnlockedPlots:state.farmUnlockedPlots,farmPesticides:state.farmPesticides,farmPesticideStarterGranted:state.farmPesticideStarterGranted
  }));
}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s){Object.assign(state,s);if(!Object.prototype.hasOwnProperty.call(s,'highestLevelReached'))state.highestLevelReached=levelFromXP(Number(s.xp)||0);}
  }catch(e){}
  // Compatibility: if either old completion flag is true, treat Pak Tani mission as completed.
  if(state.missionDone || state.pakMissionRewarded){
    state.missionDone=true;
    state.pakMissionRewarded=true;
  }
  // Ensure new mission flags exist for saves created by older game versions.
  state.buMissionDone=!!state.buMissionDone || !!state.buMissionRewarded;
  state.buMissionRewarded=state.buMissionDone;
  state.ketuaMissionDone=!!state.ketuaMissionDone || !!state.ketuaMissionRewarded;
  state.ketuaMissionRewarded=state.ketuaMissionDone;
  state.harvestCount=Number(state.harvestCount)||0;
  state.correctQuizCount=Number(state.correctQuizCount)||0;
  state.unlockedAchievements=Array.isArray(state.unlockedAchievements)?state.unlockedAchievements:[];
  state.achievementRewardsClaimed=Array.isArray(state.achievementRewardsClaimed)?state.achievementRewardsClaimed:[];
  state.highestLevelReached=Math.max(1,Math.min(Number(state.highestLevelReached)||levelFromXP(state.xp),levelFromXP(state.xp)));
  state.missionFlags=state.missionFlags&&typeof state.missionFlags==='object'?state.missionFlags:{};
  state.pmaas=state.pmaas&&typeof state.pmaas==='object'?state.pmaas:{stages:{},milestones:[],farmers:0,groups:0,xpEarned:0,drumSeederCompleted:false,adopterProgress:{}};
  state.pmaas.stages=state.pmaas.stages&&typeof state.pmaas.stages==='object'?state.pmaas.stages:{};
  state.pmaas.milestones=Array.isArray(state.pmaas.milestones)?state.pmaas.milestones:[];
  state.pmaas.farmers=Number(state.pmaas.farmers)||0;state.pmaas.groups=Number(state.pmaas.groups)||0;state.pmaas.xpEarned=Number(state.pmaas.xpEarned)||0;state.pmaas.drumSeederCompleted=!!state.pmaas.drumSeederCompleted;state.pmaas.adopterProgress=state.pmaas.adopterProgress&&typeof state.pmaas.adopterProgress==='object'?state.pmaas.adopterProgress:{};
  state.catOwned=!!state.catOwned; state.catFollower=state.catFollower&&typeof state.catFollower==='object'?state.catFollower:{x:state.player.x-24,y:state.player.y+18};
  state.scene='village';state.mineGold=Number(state.mineGold)||0;state.mineNodes=Array.isArray(state.mineNodes)?state.mineNodes:[];state.returnPosition=state.returnPosition||{x:state.player.x,y:state.player.y};state.ranchMissionDone=!!state.ranchMissionDone;
  state.farmPlots=Array.isArray(state.farmPlots)?state.farmPlots:Array.from({length:6},()=>({crop:null,stage:0,watered:false,fertilized:false,plantedAt:0}));
  while(state.farmPlots.length<6)state.farmPlots.push({crop:null,stage:0,watered:false,fertilized:false,plantedAt:0});
  state.farmSeeds=state.farmSeeds&&typeof state.farmSeeds==='object'?state.farmSeeds:{padi:3,jagung:2,cabai:1};state.farmPesticides=Math.max(0,Number(state.farmPesticides)||0);if(!state.farmPesticideStarterGranted){state.farmPesticides+=2;state.farmPesticideStarterGranted=true;}
  state.farmProduce=state.farmProduce&&typeof state.farmProduce==='object'?state.farmProduce:{};
  state.farmPlayer=state.farmPlayer&&typeof state.farmPlayer==='object'?state.farmPlayer:{x:450,y:430};
  state.farmDay=Number(state.farmDay)||1;state.farmLastWeather=state.farmLastWeather||'Cerah';
  state.farmUnlockedPlots=Math.max(1,Math.min(6,Number(state.farmUnlockedPlots)||1));
  // Keep any previously planted legacy plot accessible.
  state.farmPlots.forEach((p,i)=>{if(p&&p.crop)state.farmUnlockedPlots=Math.max(state.farmUnlockedPlots,i+1);});
  save();
}
function showScreen(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id));}
function levelName(level){return ['Penyuluh Pertanian Pemula','Penyuluh Pertanian Terampil','Penyuluh Pertanian Mahir','Penyuluh Pertanian Penyelia','Penyuluh Pertanian Ahli Pertama','Penyuluh Pertanian Ahli Muda','Penyuluh Pertanian Ahli Madya','Penyuluh Pertanian Ahli Utama'][Math.min(level-1,7)];}
const extraMissions=[
 {id:'sari',name:'Bu Sari',x:190,y:500,emoji:'👩‍🌾',role:'Anggota kelompok tani',title:'Misi Bu Sari: Benih Berkualitas',question:'“Saya akan memilih benih untuk musim tanam. Apa yang perlu diperhatikan?”',choices:[['Memilih benih bermutu, sehat, dan sesuai varietas',true],['Memilih benih hanya karena warnanya menarik',false],['Menggunakan benih yang sudah rusak',false]],explain:'Benih bermutu dan sesuai varietas membantu memperoleh pertumbuhan yang baik.',xp:14,coins:5},
 {id:'dedi',name:'Pak Dedi',x:900,y:350,emoji:'👨‍🌾',role:'Petani hortikultura',title:'Misi Pak Dedi: Pemupukan Berimbang',question:'“Bagaimana menentukan pemupukan yang tepat?”',choices:[['Mengikuti kebutuhan tanaman dan rekomendasi pemupukan',true],['Memberi pupuk sebanyak-banyaknya',false],['Menggunakan dosis yang sama untuk semua lahan',false]],explain:'Pemupukan perlu mempertimbangkan kebutuhan tanaman, kondisi lahan, dan rekomendasi.',xp:16,coins:5},
 {id:'penyuluh',name:'Ibu Maya',x:850,y:900,emoji:'👩‍🌾',role:'Penyuluh pertanian',title:'Misi Ibu Maya: Komunikasi Penyuluhan',question:'“Saat menyampaikan materi, bagaimana memastikan petani memahami?”',choices:[['Mengajak diskusi dan memberi kesempatan bertanya',true],['Membaca materi secepat mungkin',false],['Tidak perlu mengecek pemahaman',false]],explain:'Komunikasi dua arah membantu memastikan materi dipahami dan sesuai kebutuhan.',xp:18,coins:6},
 {id:'kios',name:'Pak Hasan',x:1600,y:370,emoji:'🧑‍🌾',role:'Pemilik kios tani',title:'Misi Pak Hasan: Penggunaan Pestisida',question:'“Petani bertanya cara menggunakan pestisida dengan aman. Apa saranmu?”',choices:[['Membaca label dan mengikuti dosis serta petunjuk keselamatan',true],['Mencampur semua produk agar lebih kuat',false],['Mengabaikan alat pelindung diri',false]],explain:'Pestisida harus digunakan sesuai label, dosis, dan ketentuan keselamatan.',xp:16,coins:5},
 {id:'ujang',name:'Pak Ujang',x:560,y:900,emoji:'👨‍🌾',role:'Petani sayuran',title:'Misi Pak Ujang: Konservasi Tanah',question:'“Bagaimana membantu menjaga tanah di lahan miring?”',choices:[['Menerapkan konservasi seperti terasering sesuai kondisi lahan',true],['Membiarkan aliran air mengikis tanah',false],['Membakar seluruh penutup tanah',false]],explain:'Konservasi tanah membantu mengurangi erosi dan menjaga kesuburan lahan.',xp:15,coins:5},
 {id:'yati',name:'Bu Yati',x:1550,y:650,emoji:'👩‍🌾',role:'Pengurus kelompok wanita tani',title:'Misi Bu Yati: Pangan Keluarga',question:'“Apa langkah sederhana mendukung pangan keluarga?”',choices:[['Memanfaatkan pekarangan untuk tanaman pangan bergizi',true],['Membiarkan pekarangan tidak terawat',false],['Menanam tanpa memperhatikan kebutuhan keluarga',false]],explain:'Pekarangan dapat dimanfaatkan untuk mendukung ketersediaan pangan keluarga.',xp:14,coins:5},
 {id:'irigasi',name:'Pak Rahmat',x:300,y:1050,emoji:'👨‍🌾',role:'Petani pengelola air',title:'Misi Pak Rahmat: Pengelolaan Air',question:'“Apa prinsip penggunaan air irigasi yang baik?”',choices:[['Mengatur air sesuai fase pertumbuhan dan kebutuhan tanaman',true],['Menggenangi lahan terus-menerus tanpa pengamatan',false],['Membiarkan saluran bocor',false]],explain:'Pengairan perlu disesuaikan dengan kebutuhan tanaman dan kondisi lahan.',xp:15,coins:5},
 {id:'kompos',name:'Bu Nani',x:1200,y:1080,emoji:'👩‍🌾',role:'Pengolah pupuk organik',title:'Misi Bu Nani: Pupuk Organik',question:'“Bahan organik rumah tangga dan sisa tanaman dapat dimanfaatkan menjadi apa?”',choices:[['Kompos setelah melalui proses pengomposan',true],['Pestisida kimia',false],['Benih unggul secara langsung',false]],explain:'Bahan organik dapat diolah menjadi kompos untuk memperbaiki kualitas tanah.',xp:15,coins:5}
];
const missionInfo=[
 {id:'pak',done:()=>state.missionDone,text:'Temui Pak Tani dan amati gejala pada tanaman padi.',reward:'+20 XP'},
 {id:'bu',done:()=>state.buMissionDone,text:'Bantu Bu Rina memahami pencatatan kelompok tani.',reward:'+25 XP'},
 {id:'ketua',done:()=>state.ketuaMissionDone,text:'Bantu Pak Ketua mengidentifikasi kebutuhan anggota.',reward:'+30 XP'},
 ...extraMissions.map(m=>({id:m.id,done:()=>!!state.missionFlags[m.id],text:'Temui '+m.name+': '+m.title.replace(/^Misi [^:]+: /,''),reward:'+'+m.xp+' XP'})),{id:'peternak',done:()=>!!state.ranchMissionDone,text:'Bantu Pak Asep merawat ternak',reward:'+30 XP'}
];
function missionDone(id){const m=missionInfo.find(x=>x.id===id);return m?m.done():false;}
function missionTotal(){return missionInfo.filter(m=>m.done()).length;}
function nextMission(){return missionInfo.find(m=>!m.done())||null;}
function updateStats(){const count=missionTotal();$('missionStatus').textContent=count+'/'+missionInfo.length+' Misi selesai';$('missionStatus').classList.toggle('completed',count===missionInfo.length);$('xpValue').textContent=state.xp;$('coinValue').textContent=state.coins;$('gameCoins').textContent=state.coins;const lp=levelProgress(state.xp),level=lp.level,progress=lp.progress;$('levelLabel').textContent='LEVEL '+level;$('levelTitle').textContent=levelName(level);$('levelXp').textContent=progress;$('levelXpNeeded').textContent=lp.needed;$('levelProgress').style.width=(progress/lp.needed*100)+'%';updatePMAASLock();const next=nextMission();$('dailyMissionText').textContent=next?next.text:'Semua misi Adventure selesai! Jelajahi desa, simulasi, dan kuis.';$('dailyMissionReward').textContent=next?next.reward:'SEMUA SELESAI';$('missionDescription').textContent=next?next.text:'Semua misi Adventure selesai. Terima kasih telah membantu Desa Sukamaju!';updateProfile();renderPMAAS();}

const pmaasTargets=[
 {id:'farmer1',name:'Pak Asep',type:'farmer',label:'Petani padi',topic:'Tabela dan tanam rapat dalam baris'},
 {id:'farmer2',name:'Bu Enah',type:'farmer',label:'Petani padi',topic:'Pemilihan benih unggul sesuai kondisi lahan'},
 {id:'farmer3',name:'Pak Jajang',type:'farmer',label:'Petani padi',topic:'Pemupukan berimbang dan kebutuhan tanaman'},
 {id:'farmer4',name:'Bu Imas',type:'farmer',label:'Petani padi',topic:'Pengelolaan air dan drainase'},
 {id:'farmer5',name:'Pak Rudi',type:'farmer',label:'Petani padi',topic:'Pengendalian gulma dan OPT terpadu'},
 {id:'farmer6',name:'Bu Euis',type:'farmer',label:'Petani padi',topic:'Penggunaan alat tanam tepat guna'},
 {id:'farmer7',name:'Pak Maman',type:'farmer',label:'Petani padi',topic:'Pengamatan pertumbuhan dan pemupukan'},
 {id:'farmer8',name:'Bu Tati',type:'farmer',label:'Petani padi',topic:'Panen tepat waktu dan evaluasi hasil'},
 {id:'group1',name:'Poktan Tani Makmur',type:'group',label:'Kelompok tani',topic:'Sosialisasi dan rencana demplot PM-AAS'},
 {id:'group2',name:'Poktan Mekar Jaya',type:'group',label:'Kelompok tani',topic:'Kesepakatan pola tanam dan kebutuhan sarana'},
 {id:'group3',name:'Poktan Sumber Rejeki',type:'group',label:'Kelompok tani',topic:'Demonstrasi Tabela dan pendampingan budidaya'},
 {id:'group4',name:'Poktan Harapan Baru',type:'group',label:'Kelompok tani',topic:'Penerapan dan evaluasi budidaya PM-AAS'}
];
const pmaasMilestoneList=[
 {id:'m3',at:3,xp:40,label:'3 adopter'},
 {id:'m6',at:6,xp:70,label:'6 adopter'},
 {id:'m9',at:9,xp:100,label:'9 adopter'},
 {id:'m12',at:12,xp:150,label:'12 adopter'}
];
function pmaasAdoptionCount(){return state.pmaas.farmers+state.pmaas.groups;}
const pmaasCurriculum=[
 {title:'1. Persiapan Lahan',icon:'🚜',tasks:[
  {title:'Kembalikan jerami dan genangi lahan',desc:'Sebarkan/kembalikan jerami ke sawah, lalu genangi lahan sebelum pengolahan tanah.',action:'Lahan dan jerami disiapkan'},
  {title:'Olah tanah dengan traktor atau rotari',desc:'Lakukan pengolahan tanah agar jerami tercampur dan tanah siap ditata.',action:'Pengolahan tanah selesai'},
  {title:'Perbaiki pematang, inlet, dan outlet',desc:'Periksa pematang serta saluran masuk dan keluar air agar air dan pupuk tidak mudah hilang.',action:'Pematang dan saluran diperbaiki'},
  {title:'Rapikan kondisi menjelang tanam',desc:'Buat lahan lembab tanpa genangan, bersihkan gulma, buat parit keliling. Herbisida pratumbuh 3–5 hari sebelum tanam hanya bila diperlukan dan sesuai label.',action:'Lahan siap untuk tanam'}
 ]},
 {title:'2. Pemilihan Benih dan Tanam Tabela',icon:'🌱',tasks:[
  {title:'Pilih varietas unggul bermutu',desc:'Pilih benih yang sesuai kondisi setempat, dengan batang kokoh, malai lebat, dan tahan rebah.',action:'Varietas dan benih dipilih'},
  {title:'Rendam dan peram benih',desc:'Lakukan perendaman dan pemeraman benih selama sekitar 12 jam sesuai petunjuk teknis benih.',action:'Benih siap ditanam'},
  {title:'Siapkan drum seeder / direct seeder',desc:'Periksa alat tanam benih langsung. Pastikan komponen terpasang dan alat berfungsi baik.',action:'Alat Tabela siap'},
  {title:'Lakukan tanam Tabela jajar legowo',desc:'Gunakan drum seeder atau direct seeder untuk menanam benih langsung dengan pola jajar legowo.',action:'Penanaman Tabela selesai'}
 ]},
 {title:'3. Pemeliharaan Tanaman: Air dan Pemupukan',icon:'💧',tasks:[
  {title:'Pasang dan baca pipa pemantau AWD',desc:'Gunakan pipa pemantau untuk melihat kondisi air dan menentukan waktu pengairan.',action:'Pemantauan AWD dilakukan'},
  {title:'Atur siklus basah-kering dan pemupukan',desc:'Awali dengan kondisi macak-macak, lanjutkan wetting-drying bergantian sesuai fase tanaman, dan lakukan pengeringan akhir menjelang panen. Pemupukan mengikuti uji tanah atau rekomendasi spesifik; drone dapat digunakan pada lahan luas.',action:'Air dan pemupukan dikelola'}
 ]},
 {title:'4. Pengendalian Gulma dan OPT',icon:'🔎',tasks:[
  {title:'Lakukan pengendalian gulma',desc:'Pilih pengendalian mekanis atau herbisida purnatumbuh pada periode awal pertumbuhan sesuai kebutuhan dan label produk.',action:'Gulma dikendalikan'},
  {title:'Amati dan kendalikan OPT terpadu',desc:'Pantau tanaman secara berkala, kenali organisme pengganggu tumbuhan, dan lakukan pengendalian terpadu sesuai kondisi lapangan.',action:'Pengamatan dan pengendalian OPT dilakukan'}
 ]},
 {title:'5. Panen dan Pascapanen',icon:'🌾',tasks:[
  {title:'Keringkan sawah menjelang panen',desc:'Atur pengeringan lahan agar kondisi sawah mendukung operasional mesin panen.',action:'Lahan siap untuk panen'},
  {title:'Panen mekanis dan evaluasi hasil',desc:'Panen menggunakan combine harvester ketika sekitar 85–90% bulir telah matang. Lanjutkan dengan evaluasi hasil dan penanganan pascapanen.',action:'Panen dan evaluasi selesai'}
 ]}
];
const pmaasTaskCount=pmaasCurriculum.reduce((n,s)=>n+s.tasks.length,0);
function pmaasProgress(p,id){
 if(!p.adopterProgress||typeof p.adopterProgress!=='object')p.adopterProgress={};
 if(p.adopterProgress[id]==null){
  const legacy=Number(p.stages[id])||0;
  p.adopterProgress[id]=legacy>=3?pmaasTaskCount:0;
 }
 return Math.max(0,Math.min(pmaasTaskCount,Number(p.adopterProgress[id])||0));
}
function updatePMAASLock(){
 const unlocked=levelFromXP(state.xp)>=2;
 const card=$('pmaasEventCard'),open=$('pmaasOpen'),lock=$('pmaasLockNotice');
 if(card)card.classList.toggle('pmaas-locked',!unlocked);
 if(open){open.disabled=!unlocked;open.textContent=unlocked?'Buka Event PM-AAS →':'🔒 Terbuka pada Level 2';}
 if(lock)lock.classList.toggle('hidden',unlocked);
 const panel=$('pmaasPanel');if(panel&&!unlocked)panel.classList.add('hidden');
}
function renderPMAAS(){
 const p=state.pmaas;if(!$('pmaasTargets'))return;
 const count=pmaasAdoptionCount();
 $('pmaasCount').textContent=count+'/12';$('pmaasXp').textContent=p.xpEarned;
 $('pmaasProgress').style.width=(count/12*100)+'%';
 $('pmaasFarmers').textContent=p.farmers;$('pmaasGroups').textContent=p.groups;$('pmaasTotal').textContent=count+'/12';
 $('pmaasMilestones').innerHTML=pmaasMilestoneList.map(m=>{const done=p.milestones.includes(m.id);return `<div class="pmaas-milestone ${done?'done':''}"><b>${done?'✓ ':''}${m.at}</b><small>${m.label}<br>+${m.xp} XP</small></div>`;}).join('');
 $('pmaasTargets').innerHTML=pmaasTargets.map(t=>{
  const progress=pmaasProgress(p,t.id),adopted=progress>=pmaasTaskCount;
  const stageIndex=pmaasCurriculum.findIndex(s=>{let before=0;for(const x of pmaasCurriculum){if(x===s)return progress<before+x.tasks.length;before+=x.tasks.length;}return false;});
  const currentStage=stageIndex<0?4:stageIndex;
  const doneCount=pmaasCurriculum.slice(0,currentStage).reduce((n,s)=>n+s.tasks.length,0);
  const taskIndex=progress-doneCount;
  const stage=pmaasCurriculum[currentStage];
  const task=adopted?null:stage.tasks[taskIndex];
  const detail=t.type==='group'?'Kelompok tani • bonus adopsi lebih besar':'Petani perorangan';
  const pct=Math.round(progress/pmaasTaskCount*100);
  const activeTask=task?`<div class="adopter-current"><b>${stage.icon} ${stage.title}</b><h5>${task.title}</h5><p>${task.desc}</p><button data-adopter-step="${t.id}" ${adopted?'disabled':''}>Selesaikan langkah ini</button></div>`:'';
  return `<article class="pmaas-target"><b>${t.type==='group'?'👥':'🧑‍🌾'} ${t.name}</b><small>${detail}<br>Fokus: ${t.topic}</small><div class="adopter-progress"><span style="width:${pct}%"></span></div><div class="pmaas-stage">${adopted?'Seluruh tahapan PM-AAS selesai ✓':`Tahap ${currentStage+1}/5 • ${progress}/${pmaasTaskCount} langkah`}</div>${activeTask}<small class="adopter-percent">${pct}% selesai</small></article>`;
 }).join('');
}
function advancePMAASTarget(id){
 const t=pmaasTargets.find(x=>x.id===id);if(!t)return;
 const p=state.pmaas,progress=pmaasProgress(p,id);if(progress>=pmaasTaskCount)return;
 const next=progress+1;p.adopterProgress[id]=next;
 const stageIndex=pmaasCurriculum.findIndex((s,i)=>{const before=pmaasCurriculum.slice(0,i).reduce((n,x)=>n+x.tasks.length,0);return next===before+s.tasks.length;});
 const taskXP=2;
 p.xpEarned+=taskXP;reward(taskXP,0);
 if(stageIndex>=0){
  const phaseXP=[8,12,15,15,20][stageIndex];
  p.xpEarned+=phaseXP;reward(phaseXP,Math.max(1,Math.round(phaseXP/5)));
  $('missionDescription').textContent=t.name+' menyelesaikan '+pmaasCurriculum[stageIndex].title+'.';
 }
 if(next===pmaasTaskCount){
  if(t.type==='group')p.groups++;else p.farmers++;
  const adoptionXP=t.type==='group'?90:25,coins=t.type==='group'?12:5;
  p.xpEarned+=adoptionXP;reward(adoptionXP,coins);
  const total=pmaasAdoptionCount();
  pmaasMilestoneList.forEach(milestone=>{if(total>=milestone.at&&!p.milestones.includes(milestone.id)){p.milestones.push(milestone.id);p.xpEarned+=milestone.xp;reward(milestone.xp,Math.round(milestone.xp/10));}});
  $('missionDescription').textContent=t.name+' menuntaskan lima tahapan PM-AAS. Adopsi berhasil dicatat!';
 }
 renderPMAAS();save();
}

/* Mini-game PM-AAS: merakit drum seeder */
const drumParts=[
 {id:'wheels',name:'Roda (2 buah)',image:'wheels.png',hint:'Roda dipasang pada kedua ujung poros agar alat dapat bergerak stabil.'},
 {id:'drums',name:'Drum penjatah benih (3 buah)',image:'drums.png',hint:'Drum penjatah benih menyalurkan benih ke alur tanam secara teratur.'},
 {id:'axle',name:'Poros',image:'axle.png',hint:'Poros menjadi sumbu tempat roda dan drum terpasang.'},
 {id:'frame',name:'Rangka utama',image:'frame.png',hint:'Rangka utama menopang dan menyatukan bagian-bagian alat.'},
 {id:'handle',name:'Pegangan (handle)',image:'handle.png',hint:'Pegangan digunakan operator untuk mengarahkan dan mendorong alat.'}
];
const drumSlots=[
 {id:'frame',label:'Pasang rangka utama',desc:'Struktur penyangga alat'},
 {id:'drums',label:'Pasang drum benih',desc:'Tabung penjatah benih pada poros'},
 {id:'handle',label:'Pasang pegangan',desc:'Bagian kendali operator'},
 {id:'wheels',label:'Pasang roda',desc:'Sepasang roda pada kedua ujung poros'},
 {id:'axle',label:'Pasang poros',desc:'Sumbu melintang alat'}
];
let drumSelected=null,drumPlaced={},drumAttempts=0;
function renderDrumSeeder(){
 const done=!!state.pmaas.drumSeederCompleted;
 if(done&&Object.keys(drumPlaced).length===0)drumSlots.forEach(slot=>drumPlaced[slot.id]=slot.id);
 $('drumSeederStatus').textContent=done?'Misi selesai! Drum seeder berhasil dirakit dan diperiksa.':`Pilih komponen, lalu pilih tempat pemasangannya. Komponen benar: ${Object.keys(drumPlaced).length}/5.`;
 const preview=$('drumMachinePreview');
 if(preview){preview.classList.toggle('has-handle',!!drumPlaced.handle);preview.classList.toggle('has-frame',!!drumPlaced.frame);preview.classList.toggle('has-axle',!!drumPlaced.axle);preview.classList.toggle('has-drums',!!drumPlaced.drums);preview.classList.toggle('has-wheels',!!drumPlaced.wheels);}

 $('drumSeederParts').innerHTML=drumParts.map(p=>{
  const used=Object.values(drumPlaced).includes(p.id);
  return `<button type="button" class="drum-part ${used?'used':''} ${drumSelected===p.id?'selected':''}" data-drum-part="${p.id}" draggable="${!used&&!done}" ${used||done?'disabled':''}><img src="assets/images/drum-seeder/${p.image}" alt="${p.name}"><b>${p.name}</b><small>${used?'Sudah dipasang':'Pilih atau seret gambar'}</small></button>`;
 }).join('');
 $('drumSeederSlots').innerHTML=drumSlots.map((s,i)=>{
  const partId=drumPlaced[s.id];const part=drumParts.find(p=>p.id===partId);
  return `<button type="button" class="drum-slot ${part?'filled':''}" data-drum-slot="${s.id}" ${done?'disabled':''}><span class="slot-number">${i+1}</span>${part?`<img src="assets/images/drum-seeder/${part.image}" alt="${part.name}">`:''}<b>${part?part.name:s.label}</b><small>${part?'Terpasang ✓':s.desc}</small></button>`;
 }).join('');
 $('drumSeederCheck').disabled=done||Object.keys(drumPlaced).length!==5;
 $('drumSeederCheck').textContent=done?'✓ Misi selesai':'Periksa hasil rakitan';
}
function selectDrumPart(id){
 if(state.pmaas.drumSeederCompleted||Object.values(drumPlaced).includes(id))return;
 drumSelected=id;renderDrumSeeder();
 const p=drumParts.find(x=>x.id===id);
 $('drumSeederFeedback').textContent=p?p.hint:'';
}
function placeDrumPart(slotId,partId){
 if(state.pmaas.drumSeederCompleted)return;
 const id=partId||drumSelected;if(!id)return;
 if(Object.values(drumPlaced).includes(id))return;
 if(drumPlaced[slotId]){ $('drumSeederFeedback').textContent='Tempat ini sudah terisi. Pilih tempat yang masih kosong.';return;}
 drumAttempts++;
 if(id!==slotId){
  $('drumSeederFeedback').textContent='Belum cocok. Perhatikan fungsi komponen dan coba tempat lain.';
  $('drumSeederFeedback').className='drum-feedback wrong';
  return;
 }
 drumPlaced[slotId]=id;drumSelected=null;
 $('drumSeederFeedback').textContent='Tepat! '+drumParts.find(p=>p.id===id).hint;
 $('drumSeederFeedback').className='drum-feedback';
 renderDrumSeeder();
}
$('drumSeederParts').addEventListener('click',e=>{const b=e.target.closest('[data-drum-part]');if(b)selectDrumPart(b.dataset.drumPart);});
$('drumSeederSlots').addEventListener('click',e=>{const b=e.target.closest('[data-drum-slot]');if(b)placeDrumPart(b.dataset.drumSlot);});
$('drumSeederParts').addEventListener('dragstart',e=>{const b=e.target.closest('[data-drum-part]');if(!b)return;e.dataTransfer.setData('text/plain',b.dataset.drumPart);});
$('drumSeederSlots').addEventListener('dragover',e=>{if(e.target.closest('[data-drum-slot]'))e.preventDefault();});
$('drumSeederSlots').addEventListener('drop',e=>{const b=e.target.closest('[data-drum-slot]');if(!b)return;e.preventDefault();placeDrumPart(b.dataset.drumSlot,e.dataTransfer.getData('text/plain'));});
$('drumSeederCheck').addEventListener('click',()=>{
 if(state.pmaas.drumSeederCompleted||Object.keys(drumPlaced).length!==5)return;
 state.pmaas.drumSeederCompleted=true;
 state.pmaas.xpEarned+=20;reward(20,5);
 if(drumAttempts<=5){state.pmaas.xpEarned+=10;reward(10,0);$('drumSeederFeedback').textContent='Sempurna! Semua komponen tepat pada percobaan pertama. Bonus +10 XP!';
 }else{$('drumSeederFeedback').textContent='Bagus! Alat berhasil dirakit. Kamu memperoleh 20 XP dan 5 koin.';}
 $('drumSeederFeedback').className='drum-feedback success';
 renderDrumSeeder();save();
});

$('pmaasOpen').addEventListener('click',()=>{if(levelFromXP(state.xp)<2)return;$('pmaasPanel').classList.remove('hidden');renderPMAAS();renderDrumSeeder();$('pmaasPanel').scrollIntoView({behavior:'smooth',block:'start'});});
$('pmaasClose').addEventListener('click',()=>$('pmaasPanel').classList.add('hidden'));
$('pmaasTargets').addEventListener('click',e=>{const b=e.target.closest('[data-pmaas-id]');if(b)advancePMAASTarget(b.dataset.pmaasId);const step=e.target.closest('[data-adopter-step]');if(step)advancePMAASTarget(step.dataset.adopterStep);});

const achievementList=[
 {id:'missions',icon:'🌾',name:'Sahabat Petani',desc:'Selesaikan 3 misi Adventure',check:()=>missionTotal()>=3},
 {id:'explorer',icon:'🧭',name:'Penjelajah Desa',desc:'Selesaikan 6 misi Adventure',check:()=>missionTotal()>=6},
 {id:'mastermission',icon:'🏅',name:'Pahlawan Sukamaju',desc:'Selesaikan seluruh 11 misi Adventure',check:()=>missionTotal()>=missionInfo.length},
 {id:'level5',icon:'⭐',name:'Penyuluh Berprestasi',desc:'Capai Level 5 (1.000 XP)',check:()=>state.xp>=1000},
 {id:'harvest10',icon:'🧺',name:'Petani Produktif',desc:'Panen tanaman 10 kali',check:()=>state.harvestCount>=10},
 {id:'quiz10',icon:'🧠',name:'Ahli Pertanian',desc:'Jawab 10 soal kuis dengan benar',check:()=>state.correctQuizCount>=10}
];
function playSound(kind='success'){
 try{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
  const ac=playSound.ctx||(playSound.ctx=new AudioCtx());if(ac.state==='suspended')ac.resume();
  const notes=kind==='level'?[523.25,659.25,783.99,1046.5]:kind==='badge'?[659.25,880,1046.5]:[587.33,783.99];
  notes.forEach((freq,i)=>{const osc=ac.createOscillator(),gain=ac.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,ac.currentTime+i*.11);gain.gain.exponentialRampToValueAtTime(.12,ac.currentTime+i*.11+.025);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+i*.11+.18);osc.connect(gain);gain.connect(ac.destination);osc.start(ac.currentTime+i*.11);osc.stop(ac.currentTime+i*.11+.2);});
 }catch(e){}
}
function updateProfile(){
 const level=levelFromXP(state.xp);
 if($('profileName'))$('profileName').textContent=state.name;
 if($('profileRank'))$('profileRank').textContent=levelName(level)+' • Level '+level;
 if($('profileXp'))$('profileXp').textContent=state.xp;
 if($('profileCoins'))$('profileCoins').textContent=state.coins;
 if($('profileBadges'))$('profileBadges').textContent=(state.unlockedAchievements||[]).length+'/'+achievementList.length;
 const avatarPath='assets/images/avatars/petani-'+String((Number(state.avatarIndex)||0)+1).padStart(2,'0')+'.webp';
 if($('avatarButtonImage'))$('avatarButtonImage').src=avatarPath;
 if($('profileAvatarImage'))$('profileAvatarImage').src=avatarPath;
}
function checkAchievements(){
 let newly=[];
 achievementList.forEach(a=>{if(a.check()&&!state.unlockedAchievements.includes(a.id)){state.unlockedAchievements.push(a.id);newly.push(a);}});
 newly.forEach(a=>{
  if(!state.achievementRewardsClaimed.includes(a.id)){state.achievementRewardsClaimed.push(a.id);state.coins+=20;}
 });
 if(newly.length){showAchievementToast(newly[0]);playSound('badge');updateStats();save();}
 renderAchievements();
}
function showAchievementToast(a){
 let toast=$('achievementToast');if(!toast)return;
 toast.textContent='🏆 Lencana terbuka: '+a.name+' • Bonus +20 koin';toast.classList.add('show');
 if(showAchievementToast.timer)clearTimeout(showAchievementToast.timer);
 showAchievementToast.timer=setTimeout(()=>toast.classList.remove('show'),3800);
}
function renderAchievements(){
 const grid=$('achievementGrid');if(!grid)return;
 const unlocked=state.unlockedAchievements||[];
 $('achievementCount').textContent=unlocked.length+' / '+achievementList.length+' terbuka';
 grid.innerHTML=achievementList.map(a=>{const yes=unlocked.includes(a.id);return `<article class="achievement-item ${yes?'unlocked':'locked'}"><div class="achievement-icon">${yes?a.icon:'🔒'}</div><div><b>${a.name}</b><p>${a.desc}</p><small>${yes?'Terbuka ✓ • Bonus +20 koin':'Belum terbuka'}</small></div></article>`;}).join('');
}
$('achievementToggle').addEventListener('click',()=>{const panel=$('achievementPanel');panel.classList.toggle('hidden');renderAchievements();});
$('avatarProfileButton').addEventListener('click',()=>toggleProfile());
$('changeAvatarButton').addEventListener('click',()=>{
 const chooser=$('avatarChooser');
 chooser.classList.toggle('hidden');
 if(!chooser.classList.contains('hidden'))renderAvatarChooser();
});
function renderAvatarChooser(){
 const chooser=$('avatarChooser');if(!chooser)return;
 chooser.innerHTML=Array.from({length:10},(_,i)=>`<button type="button" class="avatar-choice ${Number(state.avatarIndex||0)===i?'selected':''}" data-avatar-index="${i}" aria-label="Pilih avatar petani ${i+1}" aria-pressed="${Number(state.avatarIndex||0)===i}"><img src="assets/images/avatars/petani-${String(i+1).padStart(2,'0')}.webp" alt="Petani ${i+1}"></button>`).join('');
 chooser.querySelectorAll('[data-avatar-index]').forEach(btn=>btn.addEventListener('click',()=>{
  state.avatarIndex=Number(btn.dataset.avatarIndex);updateProfile();save();renderAvatarChooser();
 }));
}
function toggleProfile(){const panel=$('profilePanel');panel.classList.toggle('hidden');$('avatarProfileButton').setAttribute('aria-expanded',String(!panel.classList.contains('hidden')));if(!panel.classList.contains('hidden'))updateProfile();}
$('closeLevelUp').addEventListener('click',()=>$('levelUpOverlay').classList.add('hidden'));
function showLevelUp(level,bonus){
 $('levelUpTitle').textContent='LEVEL '+level+'!';$('levelUpRank').textContent=levelName(level);$('levelUpBonus').textContent='Bonus kenaikan level: +'+bonus+' koin';
 $('levelUpOverlay').classList.remove('hidden');playSound('level');
}
function reward(xp,coins){
 const oldLevel=levelFromXP(state.xp);
 state.xp+=xp;state.coins+=coins;
 const newLevel=levelFromXP(state.xp);let levelBonus=0;
 while(state.highestLevelReached<newLevel){state.highestLevelReached++;state.coins+=25;levelBonus+=25;}
 updateStats();checkAchievements();save();
 if(newLevel>oldLevel)showLevelUp(newLevel,levelBonus);
 else playSound('success');
}

/* Background music and persistent audio settings */
const SETTINGS_KEY='myPplMyAdventure.settings.v1';
const bgm=$('bgmAudio');
const audioSettings={bgmEnabled:true,bgmVolume:0.7,mobileControl:'arrows'};
let gameStarted=false;
function saveAudioSettings(){
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(audioSettings));}catch(e){}
}
function updateAudioSettingsUI(){
  if($('bgmToggle'))$('bgmToggle').checked=audioSettings.bgmEnabled;
  if($('bgmVolume'))$('bgmVolume').value=Math.round(audioSettings.bgmVolume*100);
  if($('bgmVolumeValue'))$('bgmVolumeValue').textContent=Math.round(audioSettings.bgmVolume*100)+'%';
  if($('bgmStatus'))$('bgmStatus').textContent=audioSettings.bgmEnabled?'🎵 BGM aktif':'🔇 BGM nonaktif';
}
function applyMobileControl(){
  const analog=audioSettings.mobileControl==='analog';
  const dpad=$('arrowControls'),stick=$('joystickControl'),status=$('mobileControlStatus'),select=$('mobileControlSelect');
  if(dpad)dpad.classList.toggle('hidden',analog);
  if(stick)stick.classList.toggle('hidden',!analog);
  if(select)select.value=audioSettings.mobileControl;
  if(status)status.textContent=analog?'Kontrol aktif: Analog (Joystick)':'Kontrol aktif: Arah Panah';
  state.analog={x:0,y:0};
  const knob=$('joystickKnob');if(knob)knob.style.transform='translate(0px, 0px)';
}
function applyBgmSettings(){
  if(!bgm)return;
  bgm.volume=audioSettings.bgmVolume;
  bgm.muted=!audioSettings.bgmEnabled || audioSettings.bgmVolume===0;
  if(!audioSettings.bgmEnabled || audioSettings.bgmVolume===0){
    bgm.pause();
  }else if(gameStarted){
    const result=bgm.play();
    if(result&&typeof result.catch==='function')result.catch(()=>{});
  }
  updateAudioSettingsUI();
}
function loadAudioSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');
    if(saved){
      if(typeof saved.bgmEnabled==='boolean')audioSettings.bgmEnabled=saved.bgmEnabled;
      if(Number.isFinite(Number(saved.bgmVolume)))audioSettings.bgmVolume=Math.max(0,Math.min(1,Number(saved.bgmVolume)));
      if(saved.mobileControl==='analog'||saved.mobileControl==='arrows')audioSettings.mobileControl=saved.mobileControl;
    }
  }catch(e){}
  applyBgmSettings();
}
function startBgm(){
  gameStarted=true;
  if(!bgm||!audioSettings.bgmEnabled||audioSettings.bgmVolume===0)return;
  bgm.volume=audioSettings.bgmVolume;
  bgm.muted=false;
  const result=bgm.play();
  if(result&&typeof result.catch==='function')result.catch(()=>{});
}
$('settingsToggle').addEventListener('click',()=>{
  const panel=$('settingsPanel');
  const opening=panel.classList.contains('hidden');
  panel.classList.toggle('hidden');
  $('settingsToggle').setAttribute('aria-expanded',String(opening));
});
$('bgmToggle').addEventListener('change',e=>{
  audioSettings.bgmEnabled=e.target.checked;
  saveAudioSettings();
  if(audioSettings.bgmEnabled&&gameStarted)startBgm();
  else applyBgmSettings();
});
$('bgmVolume').addEventListener('input',e=>{
  audioSettings.bgmVolume=Math.max(0,Math.min(1,Number(e.target.value)/100));
  saveAudioSettings();
  applyBgmSettings();
});
$('mobileControlSelect').addEventListener('change',e=>{
  audioSettings.mobileControl=e.target.value==='analog'?'analog':'arrows';
  saveAudioSettings();applyMobileControl();
});
$('resetButton').addEventListener('click',()=>{if(confirm('Yakin ingin menghapus seluruh progres permainan? XP, koin, misi, dan pencapaian akan direset.')){localStorage.removeItem(KEY);location.reload();}});

loadAudioSettings();applyMobileControl();
const tutorialSteps=[{icon:'👤',title:'Kenali profilmu',description:'Di foto avatar, kamu bisa melihat profil penyuluh, level, XP, koin, dan lencana. Tekan tombol Ganti Avatar untuk memilih tampilan karakter yang kamu suka.',target:'#avatarProfileButton'},{icon:'🗺️',title:'Menu Adventure',description:'Jelajahi Desa Sukamaju, berjalan menggunakan keyboard atau joystick di HP, temui warga, dan selesaikan berbagai misi penyuluhan untuk mendapatkan XP dan koin.',target:'.adventure-card'},{icon:'🌾',title:'Menu Farm Simulator',description:'Kelola kebunmu dengan menanam benih, menyiram tanaman, merawat pertumbuhan, lalu memanen hasilnya. Setiap aktivitas membantumu memperoleh hadiah.',target:'.farm-card'},{icon:'🧠',title:'Menu Quiz Challenge',description:'Uji pengetahuan tentang pertanian dan penyuluhan melalui lima soal acak. Jawaban benar memberikan XP dan koin. Selamat bermain dan belajar!',target:'.quiz-card'}];let tutorialIndex=0;function renderTutorial(){
 const step=tutorialSteps[tutorialIndex],overlay=$('tutorialOverlay'),card=overlay.querySelector('.tutorial-card');
 $('tutorialStepLabel').textContent='PANDUAN '+(tutorialIndex+1)+' DARI '+tutorialSteps.length;
 $('tutorialIcon').textContent=step.icon;$('tutorialTitle').textContent=step.title;$('tutorialDescription').textContent=step.description;
 document.querySelectorAll('.tutorial-dots i').forEach((dot,i)=>dot.classList.toggle('active',i===tutorialIndex));
 $('tutorialBack').disabled=tutorialIndex===0;$('tutorialNext').textContent=tutorialIndex===tutorialSteps.length-1?'Mulai bermain ✓':'Lanjutkan →';
 overlay.classList.remove('hidden');
 requestAnimationFrame(()=>{
   const target=document.querySelector(step.target);
   const rect=target?target.getBoundingClientRect():{left:innerWidth*.5,top:innerHeight*.5,width:0,height:0,bottom:innerHeight*.5};
   const cx=Math.max(28,Math.min(innerWidth-28,rect.left+rect.width/2));
   const cy=Math.max(40,Math.min(innerHeight-40,rect.top+rect.height/2));
   const rx=Math.min(innerWidth*.42,Math.max(72,rect.width/2+22));
   const ry=Math.min(innerHeight*.28,Math.max(48,rect.height/2+18));
   overlay.style.setProperty('--spot-x',cx+'px');overlay.style.setProperty('--spot-y',cy+'px');
   overlay.style.setProperty('--spot-rx',rx+'px');overlay.style.setProperty('--spot-ry',ry+'px');
   const cr=card.getBoundingClientRect(),margin=12;
   const roomBelow=innerHeight-rect.bottom,roomAbove=rect.top;
   let top;
   if(roomAbove>cr.height+18 && (roomAbove>=roomBelow || roomBelow<cr.height+18)) top=rect.top-cr.height-14;
   else if(roomBelow>cr.height+18) top=rect.bottom+14;
   else top=roomAbove>roomBelow?margin:innerHeight-cr.height-margin;
   top=Math.max(margin,Math.min(innerHeight-cr.height-margin,top));
   let left=cx-cr.width/2;
   left=Math.max(margin,Math.min(innerWidth-cr.width-margin,left));
   card.style.left=left+'px';card.style.top=top+'px';
 });
}
function finishTutorial(){
 $('tutorialOverlay').classList.add('hidden');localStorage.setItem(TUTORIAL_KEY,'completed');
}
function startTutorial(){tutorialIndex=0;renderTutorial();}$('tutorialNext').addEventListener('click',()=>{if(tutorialIndex<tutorialSteps.length-1){tutorialIndex++;renderTutorial();}else finishTutorial();});$('tutorialBack').addEventListener('click',()=>{if(tutorialIndex>0){tutorialIndex--;renderTutorial();}});$('tutorialSkip').addEventListener('click',finishTutorial);
window.addEventListener('resize',()=>{if(!$('tutorialOverlay').classList.contains('hidden'))renderTutorial();});
load();updateStats();checkAchievements();$('playerName').value=state.name==='Penyuluh Muda'?'':state.name;
$('startButton').addEventListener('click',()=>{startBgm();const n=$('playerName').value.trim();if(n)state.name=n;$('welcomeName').textContent=state.name+'!';showScreen('menuScreen');updateProfile();save();if(localStorage.getItem(TUTORIAL_KEY)!=='completed')startTutorial();});

document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>openMode(b.dataset.mode)));
$('backButton').addEventListener('click',()=>{stopWorld();stopFarm();showScreen('menuScreen');});
function openMode(mode){stopWorld();stopFarm();showScreen('gameScreen');['adventurePanel','farmPanel','quizPanel'].forEach(id=>$(id).classList.add('hidden'));if(mode==='adventure'){$('gameEyebrow').textContent='MODE ADVENTURE';$('gameTitle').textContent='Desa Sukamaju';$('adventurePanel').classList.remove('hidden');startWorld();}if(mode==='farm'){$('gameEyebrow').textContent='MODE FARM SIMULATOR';$('gameTitle').textContent='Kebun Belajar';$('farmPanel').classList.remove('hidden');startFarm();}if(mode==='quiz'){$('gameEyebrow').textContent='MODE QUIZ CHALLENGE';$('gameTitle').textContent='Uji Pengetahuanmu';$('quizPanel').classList.remove('hidden');state.questionIndex=0;state.quizScore=0;pickQuizQuestions();renderQuestion();}}
/* Top-down world: world coordinates are larger than the viewport; camera follows player. */
const canvas=$('worldCanvas'),ctx=canvas.getContext('2d');
const WORLD={w:1800,h:1200};let raf=0,last=0,dialogOpen=false;
const npcs=[
{id:'pak',name:'Pak Tani',x:1160,y:510,emoji:'👨‍🌾',role:'Petani padi',kind:'mission'},
{id:'bu',name:'Bu Rina',x:390,y:330,emoji:'👩‍🌾',role:'Anggota kelompok tani',kind:'mission'},
{id:'ketua',name:'Pak Ketua',x:760,y:690,emoji:'🧑‍🌾',role:'Ketua kelompok tani',kind:'mission'},
{id:'peternak',name:'Pak Asep',x:1450,y:420,emoji:'👨‍🌾',role:'Peternak Desa',kind:'mission'},
...extraMissions.map(m=>({...m,kind:'mission'}))
];
if(!state.catQuestNpcId || !npcs.some(n=>n.id===state.catQuestNpcId)){const catQuestCandidates=npcs.filter(n=>n.id!=='peternak');state.catQuestNpcId=catQuestCandidates[Math.floor(Math.random()*catQuestCandidates.length)].id;save();}
const buildings=[
{x:220,y:210,w:150,h:110,name:'Rumah Bu Rina',roof:'#a65f3e',wall:'#f1dfb7',door:'#6b986b'},
{x:600,y:150,w:170,h:125,name:'Balai Kelompok Tani',roof:'#9b5638',wall:'#f4e5bd',door:'#5d8c63'},
{x:1420,y:180,w:150,h:110,name:'Kios Pertanian',roof:'#b36c3e',wall:'#f5e6c7',door:'#638e68'}
];
const obstacles=[...buildings.map(b=>({x:b.x-5,y:b.y-15,w:b.w+10,h:b.h+20})),{x:990,y:720,w:600,h:280},
 // Pagar kandang, kandang ternak, kebun berpagar, dan pepohonan besar
 {x:1330,y:475,w:280,h:165},{x:1350,y:500,w:95,h:85},{x:1500,y:500,w:95,h:85},
 {x:45,y:200,w:120,h:75},{x:445,y:745,w:145,h:88},{x:805,y:345,w:130,h:80},{x:1245,y:335,w:130,h:80},
 {x:1650,y:685,w:130,h:80},{x:590,y:1015,w:130,h:80},{x:320,y:165,w:45,h:45},{x:1490,y:1110,w:45,h:45},
 {x:82,y:142,w:38,h:38},{x:442,y:112,w:38,h:38},{x:892,y:152,w:38,h:38},{x:1072,y:232,w:38,h:38},{x:1692,y:202,w:38,h:38}];
function roundedRect(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function drawTree(x,y){
 // soft shadow, layered canopy and small highlights
 ctx.fillStyle='rgba(40,75,35,.20)';ctx.beginPath();ctx.ellipse(x+5,y+28,25,9,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#76513b';ctx.fillRect(x-5,y+5,11,31);ctx.fillStyle='#5d3f2e';ctx.fillRect(x+1,y+8,4,26);
 [[-11,-2,22,'#347d43'],[8,-9,21,'#438f4b'],[-2,-18,23,'#5aa653'],[-19,-14,15,'#68b45b'],[17,5,14,'#2f7540']].forEach(([ox,oy,r,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+ox,y+oy,r,0,Math.PI*2);ctx.fill();});
 ctx.fillStyle='rgba(220,244,150,.42)';ctx.beginPath();ctx.arc(x-9,y-20,6,0,Math.PI*2);ctx.fill();
}
function drawHouse(b){
 // building shadow and foundation
 ctx.fillStyle='rgba(48,69,42,.20)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,b.y+b.h+9,b.w*.62,13,0,0,Math.PI*2);ctx.fill();
 roundedRect(ctx,b.x-5,b.y-2,b.w+10,b.h+8,7,'#b9a27b');
 roundedRect(ctx,b.x,b.y,b.w,b.h,5,b.wall);
 // roof with layered tiles
 ctx.fillStyle='#71452f';ctx.beginPath();ctx.moveTo(b.x-17,b.y+9);ctx.lineTo(b.x+b.w/2,b.y-53);ctx.lineTo(b.x+b.w+17,b.y+9);ctx.closePath();ctx.fill();
 ctx.fillStyle=b.roof;ctx.beginPath();ctx.moveTo(b.x-13,b.y+6);ctx.lineTo(b.x+b.w/2,b.y-48);ctx.lineTo(b.x+b.w+13,b.y+6);ctx.closePath();ctx.fill();
 ctx.save();ctx.beginPath();ctx.moveTo(b.x-13,b.y+6);ctx.lineTo(b.x+b.w/2,b.y-48);ctx.lineTo(b.x+b.w+13,b.y+6);ctx.closePath();ctx.clip();
 ctx.strokeStyle='rgba(255,226,177,.28)';ctx.lineWidth=3;for(let yy=-28;yy<18;yy+=10){ctx.beginPath();ctx.moveTo(b.x-20,b.y+yy);ctx.lineTo(b.x+b.w+20,b.y+yy);ctx.stroke();}
 ctx.restore();
 // wall trim, windows, door and steps
 ctx.fillStyle='rgba(126,91,57,.18)';ctx.fillRect(b.x+8,b.y+12,b.w-16,5);
 ctx.fillStyle='#b8d8d0';ctx.fillRect(b.x+17,b.y+30,29,27);ctx.fillRect(b.x+b.w-46,b.y+30,29,27);
 ctx.strokeStyle='#fff4d7';ctx.lineWidth=4;ctx.strokeRect(b.x+17,b.y+30,29,27);ctx.strokeRect(b.x+b.w-46,b.y+30,29,27);
 ctx.strokeStyle='#8b795d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x+31,b.y+30);ctx.lineTo(b.x+31,b.y+57);ctx.moveTo(b.x+17,b.y+43);ctx.lineTo(b.x+46,b.y+43);ctx.moveTo(b.x+b.w-32,b.y+30);ctx.lineTo(b.x+b.w-32,b.y+57);ctx.stroke();
 ctx.fillStyle=b.door;ctx.fillRect(b.x+b.w/2-14,b.y+b.h-49,28,49);ctx.fillStyle='#e6c878';ctx.beginPath();ctx.arc(b.x+b.w/2+7,b.y+b.h-25,2.5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#b8a17b';ctx.fillRect(b.x+b.w/2-20,b.y+b.h,40,7);
 ctx.fillStyle='#fff8df';ctx.font='bold 13px Nunito';ctx.textAlign='center';ctx.fillText(b.name,b.x+b.w/2,b.y+b.h+25);
}
function drawFarmer(x,y,palette,phase=0,moving=false,isPlayer=false){
 const gait=phase*.126;
 const bob=moving?Math.abs(Math.sin(gait))*2.4:0;
 const step=moving?Math.sin(gait)*7:0;
 ctx.save();ctx.globalAlpha=1;ctx.lineCap='round';ctx.lineJoin='round';
 // Ground shadow
 ctx.fillStyle='rgba(30,55,30,.30)';ctx.beginPath();ctx.ellipse(x,y+18,18,6,0,0,Math.PI*2);ctx.fill();
 if(isPlayer){
   // Dark green uniform trousers with alternating leg stride
   ctx.fillStyle='#142719';
   ctx.beginPath();
   ctx.moveTo(x-9,y-1-bob);ctx.lineTo(x-2,y-1-bob);ctx.lineTo(x-3-step*.62,y+18);ctx.lineTo(x-5-step*.62,y+20);ctx.lineTo(x-10-step*.62,y+20);ctx.closePath();ctx.fill();
   ctx.beginPath();
   ctx.moveTo(x+2,y-1-bob);ctx.lineTo(x+9,y-1-bob);ctx.lineTo(x+10+step*.62,y+20);ctx.lineTo(x+5+step*.62,y+20);ctx.lineTo(x+3+step*.62,y+18);ctx.closePath();ctx.fill();
   // Black polished shoes
   ctx.fillStyle='#171817';
   ctx.beginPath();ctx.ellipse(x-8-step*.62,y+20,6,3,0,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.ellipse(x+8+step*.62,y+20,6,3,0,0,Math.PI*2);ctx.fill();
   // Arms in short-sleeved olive uniform; swing with gait
   ctx.strokeStyle='#bd795b';ctx.lineWidth=5.5;
   ctx.beginPath();ctx.moveTo(x-9,y-15-bob);ctx.lineTo(x-13-step*.28,y-3);ctx.lineTo(x-12-step*.35,y+1);ctx.moveTo(x+9,y-15-bob);ctx.lineTo(x+13+step*.28,y-3);ctx.lineTo(x+12+step*.35,y+1);ctx.stroke();
   // Shirt body
   roundedRect(ctx,x-10,y-22-bob,20,23,3,'#66715d');
   // Shirt front placket and buttons
   ctx.strokeStyle='#4e5a48';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y-21-bob);ctx.lineTo(x,y-1);ctx.stroke();
   ctx.fillStyle='#d2c7a2';for(let yy=-16;yy<=-4;yy+=5){ctx.beginPath();ctx.arc(x+1.8,y+yy-bob,0.65,0,Math.PI*2);ctx.fill();}
   // Two chest pockets and flaps
   ctx.fillStyle='#596653';ctx.fillRect(x-7,y-14-bob,5,6);ctx.fillRect(x+2,y-14-bob,5,6);
   ctx.strokeStyle='#414c3e';ctx.lineWidth=.8;ctx.strokeRect(x-7,y-14-bob,5,6);ctx.strokeRect(x+2,y-14-bob,5,6);
   ctx.beginPath();ctx.moveTo(x-7,y-13-bob);ctx.lineTo(x-2,y-13-bob);ctx.moveTo(x+2,y-13-bob);ctx.lineTo(x+7,y-13-bob);ctx.stroke();
   // Shoulder epaulettes
   ctx.strokeStyle='#b6a66b';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x-9,y-20-bob);ctx.lineTo(x-5,y-22-bob);ctx.moveTo(x+9,y-20-bob);ctx.lineTo(x+5,y-22-bob);ctx.stroke();
   ctx.fillStyle='#d7c47a';ctx.beginPath();ctx.arc(x-6,y-21-bob,1,0,Math.PI*2);ctx.arc(x+6,y-21-bob,1,0,Math.PI*2);ctx.fill();
   // Sleeve insignia patches
   ctx.fillStyle='#d5c34e';ctx.beginPath();ctx.arc(x-10,y-15-bob,2.1,0,Math.PI*2);ctx.arc(x+10,y-15-bob,2.1,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#356c43';ctx.beginPath();ctx.arc(x-10,y-15-bob,1,0,Math.PI*2);ctx.arc(x+10,y-15-bob,1,0,Math.PI*2);ctx.fill();
   // Black belt with gold buckle
   ctx.fillStyle='#171b16';ctx.fillRect(x-10,y-2-bob,20,3);
   ctx.fillStyle='#c7ad55';ctx.fillRect(x-2,y-2-bob,4,3);
   // Neck, head and short dark hair (no farmer hat)
   roundedRect(ctx,x-3,y-27-bob,6,6,2,'#b9785b');
   ctx.fillStyle='#d99a78';ctx.beginPath();ctx.arc(x,y-34-bob,9,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#292522';ctx.beginPath();ctx.arc(x,y-38-bob,9,Math.PI,Math.PI*2);ctx.lineTo(x+8,y-34-bob);ctx.quadraticCurveTo(x,y-39-bob,x-8,y-34-bob);ctx.closePath();ctx.fill();
   ctx.fillStyle='#292522';ctx.beginPath();ctx.arc(x-3,y-34-bob,1,0,Math.PI*2);ctx.arc(x+3,y-34-bob,1,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#8d5546';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y-31-bob,2.5,.15,Math.PI-.15);ctx.stroke();
 }else{
   // NPC farmer clothes and animated feet
   ctx.strokeStyle=palette.pants;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x-5,y+3-bob);ctx.lineTo(x-6-step*.55,y+16);ctx.moveTo(x+5,y+3-bob);ctx.lineTo(x+6+step*.55,y+16);ctx.stroke();
   ctx.strokeStyle='#49382c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-6-step*.55,y+16);ctx.lineTo(x-10-step*.55,y+17);ctx.moveTo(x+6+step*.55,y+16);ctx.lineTo(x+10+step*.55,y+17);ctx.stroke();
   roundedRect(ctx,x-10,y-18-bob,20,24,6,palette.shirt);ctx.strokeStyle='#e7b58b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x-9,y-13-bob);ctx.lineTo(x-14+step*.2,y-2-bob);ctx.moveTo(x+9,y-13-bob);ctx.lineTo(x+14-step*.2,y-2-bob);ctx.stroke();
   roundedRect(ctx,x-3,y-23-bob,6,7,2,'#d99a70');ctx.fillStyle='#f0bd91';ctx.beginPath();ctx.arc(x,y-29-bob,10,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#33251e';ctx.beginPath();ctx.arc(x-3.5,y-30-bob,1.2,0,Math.PI*2);ctx.arc(x+3.5,y-30-bob,1.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9c5e49';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y-27-bob,3,.15,Math.PI-.15);ctx.stroke();
   ctx.fillStyle=palette.hat;ctx.beginPath();ctx.ellipse(x,y-39-bob,15,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e9c66b';ctx.beginPath();ctx.ellipse(x,y-42-bob,9,5,0,Math.PI,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}


function drawPetCat(x,y,t=0){
 ctx.save();const bob=Math.sin(t/120)*1.2;ctx.fillStyle='rgba(35,45,30,.22)';ctx.beginPath();ctx.ellipse(x,y+10,13,4,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#d18b45';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x+9,y+2+bob);ctx.quadraticCurveTo(x+19,y-7+Math.sin(t/150)*4,x+15,y-13+Math.sin(t/150)*4);ctx.stroke();
 ctx.fillStyle='#e5a65e';ctx.beginPath();ctx.ellipse(x,y+2+bob,11,7,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x-7,y-5+bob,7,0,Math.PI*2);ctx.fill();
 ctx.beginPath();ctx.moveTo(x-12,y-9+bob);ctx.lineTo(x-13,y-17+bob);ctx.lineTo(x-7,y-12+bob);ctx.fill();ctx.beginPath();ctx.moveTo(x-5,y-11+bob);ctx.lineTo(x-1,y-17+bob);ctx.lineTo(x,y-8+bob);ctx.fill();
 ctx.fillStyle='#342a24';ctx.beginPath();ctx.arc(x-9,y-6+bob,1,0,Math.PI*2);ctx.arc(x-4,y-6+bob,1,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4d6a8';ctx.beginPath();ctx.ellipse(x+2,y+4+bob,6,4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawWorld(t=0){
 if(state.scene==='mine'){drawMine(t);return;}if(state.scene==='palm'){drawPalm(t);return;}
 const camX=Math.max(0,Math.min(WORLD.w-canvas.width,state.player.x-canvas.width/2));
 const camY=Math.max(0,Math.min(WORLD.h-canvas.height,state.player.y-canvas.height/2));
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(-camX,-camY);
 // rich grass base with subtle organic texture
 ctx.fillStyle='#a8ce83';ctx.fillRect(0,0,WORLD.w,WORLD.h);
 for(let i=0;i<520;i++){const x=(i*197+43)%WORLD.w,y=(i*131+71)%WORLD.h;ctx.fillStyle=i%3===0?'rgba(235,247,190,.22)':'rgba(65,119,55,.10)';ctx.beginPath();ctx.ellipse(x,y,3+(i%4),1.5,((i%7)-3)*.15,0,Math.PI*2);ctx.fill();}
 // landscaped grassy clearings
 [[150,120,115,65],[470,380,145,85],[900,270,125,75],[1280,430,150,85],[760,900,140,90],[300,690,125,75],[1690,930,110,70]].forEach(([x,y,rx,ry],i)=>{ctx.fillStyle=i%2?'#b5d894':'#9fc879';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();});
 // village road: dark shoulder, compacted earth, pale wheel tracks
 ctx.lineCap='round';ctx.lineJoin='round';
 const road=()=>{ctx.beginPath();ctx.moveTo(0,570);ctx.lineTo(520,570);ctx.lineTo(850,570);ctx.lineTo(1100,570);ctx.lineTo(1800,570);ctx.moveTo(700,80);ctx.lineTo(700,570);ctx.lineTo(700,1200);};
 ctx.strokeStyle='#b18b5d';ctx.lineWidth=94;road();ctx.stroke();ctx.strokeStyle='#d9bd8b';ctx.lineWidth=82;road();ctx.stroke();
 ctx.strokeStyle='rgba(255,244,207,.35)';ctx.lineWidth=3;ctx.setLineDash([18,22]);road();ctx.stroke();ctx.setLineDash([]);
 // roadside stones and grass tufts
 for(let i=0;i<34;i++){let x=(i*83+35)%1770,y=(i%2?520:620);ctx.fillStyle=i%2?'#8b9b72':'#d1c39b';ctx.beginPath();ctx.ellipse(x,y,5,3,.2,0,Math.PI*2);ctx.fill();}
 // irrigation stream with banks and glints
 ctx.strokeStyle='#8baf68';ctx.lineWidth=56;ctx.beginPath();ctx.moveTo(0,1080);ctx.quadraticCurveTo(420,990,780,1100);ctx.quadraticCurveTo(1150,1190,1800,1060);ctx.stroke();
 ctx.strokeStyle='#6bb7c8';ctx.lineWidth=42;ctx.beginPath();ctx.moveTo(0,1080);ctx.quadraticCurveTo(420,990,780,1100);ctx.quadraticCurveTo(1150,1190,1800,1060);ctx.stroke();
 ctx.strokeStyle='rgba(222,250,244,.65)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(80,1070);ctx.quadraticCurveTo(430,1010,760,1092);ctx.quadraticCurveTo(1180,1170,1700,1067);ctx.stroke();
 // paddy bunds, shallow water and rice rows
 roundedRect(ctx,970,700,650,350,18,'#92764c');roundedRect(ctx,982,712,626,326,13,'#6fae68');
 ctx.fillStyle='#83c9c4';roundedRect(ctx,994,724,602,302,9,'#83c9c4');
 for(let y=744;y<1010;y+=38){ctx.strokeStyle='rgba(240,249,196,.62)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1005,y);ctx.lineTo(1585,y+4);ctx.stroke();}
 for(let row=0;row<6;row++){for(let col=0;col<15;col++){const x=1018+col*39+(row%2)*8,y=758+row*43;ctx.strokeStyle='#4c8a43';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x-5,y-3);ctx.moveTo(x,y+8);ctx.lineTo(x+5,y-4);ctx.moveTo(x,y+8);ctx.lineTo(x,y-8);ctx.stroke();ctx.fillStyle='#b5d86c';ctx.beginPath();ctx.arc(x-5,y-3,2,0,Math.PI*2);ctx.arc(x+5,y-4,2,0,Math.PI*2);ctx.fill();}}
 // demonstration plot with beds and vegetable seedlings
 roundedRect(ctx,112,790,446,252,16,'#806344');roundedRect(ctx,123,801,424,230,11,'#c6a36a');
 ctx.fillStyle='#547c3f';ctx.font='bold 18px Nunito';ctx.textAlign='left';ctx.fillText('LAHAN DEMONSTRASI',145,831);
 for(let row=0;row<3;row++){ctx.strokeStyle='#8b6945';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(150,875+row*48);ctx.lineTo(520,875+row*48);ctx.stroke();for(let x=170;x<510;x+=43){ctx.strokeStyle='#4d8d42';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,880+row*48);ctx.lineTo(x-5,866+row*48);ctx.moveTo(x,880+row*48);ctx.lineTo(x+6,866+row*48);ctx.stroke();ctx.fillStyle='#8fc65a';ctx.beginPath();ctx.arc(x,866+row*48,5,0,Math.PI*2);ctx.fill();}}
 // small fences around plots and houses
 ctx.strokeStyle='#e7d4a9';ctx.lineWidth=6;for(let x=105;x<565;x+=42){ctx.beginPath();ctx.moveTo(x,775);ctx.lineTo(x,789);ctx.stroke();}ctx.beginPath();ctx.moveTo(105,782);ctx.lineTo(565,782);ctx.stroke();
 // stepping stones near village paths
 for(let i=0;i<8;i++){ctx.fillStyle='#c9c2a6';ctx.beginPath();ctx.ellipse(800+i*28,615+(i%2)*5,10,6,.15,0,Math.PI*2);ctx.fill();}
 buildings.forEach(drawHouse);
 // signboards and lamp posts
 ctx.fillStyle='#68482e';ctx.fillRect(678,98,5,34);roundedRect(ctx,625,88,112,25,5,'#f2dfad');ctx.fillStyle='#315b39';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('BALAI KELOMPOK TANI',681,105);
 ctx.fillStyle='#68482e';ctx.fillRect(1590,495,5,60);ctx.fillStyle='#f7e4a8';ctx.beginPath();ctx.arc(1592,490,10,0,Math.PI*2);ctx.fill();
 // Peternakan desa: kandang sapi/kambing, pagar, jerami dan tempat pakan.
 roundedRect(ctx,1322,466,296,176,12,'#d8c18d');
 ctx.strokeStyle='#8b6039';ctx.lineWidth=7;ctx.strokeRect(1330,475,280,165);
 for(let fx=1342;fx<1605;fx+=28){ctx.beginPath();ctx.moveTo(fx,475);ctx.lineTo(fx,640);ctx.stroke();}
 ctx.fillStyle='#a85e3c';ctx.fillRect(1350,500,94,82);ctx.fillStyle='#f0d9a7';ctx.fillRect(1358,510,78,64);
 ctx.fillStyle='#8e4f34';ctx.fillRect(1500,500,94,82);ctx.fillStyle='#f0d9a7';ctx.fillRect(1508,510,78,64);
 ctx.fillStyle='#6e472e';ctx.font='bold 14px Nunito';ctx.textAlign='center';ctx.fillText('KANDANG TERNAK',1470,626);
 // Ilustrasi ternak sederhana di dalam kandang.
 [[1385,544,'#f4eee0'],[1537,544,'#f1eee4']].forEach(([ax,ay,col],i)=>{ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(ax,ay,23,15,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(ax+17,ay-9,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#544337';ctx.fillRect(ax-12,ay+10,4,13);ctx.fillRect(ax+8,ay+10,4,13);ctx.fillStyle='#4a392d';ctx.beginPath();ctx.arc(ax+20,ay-11,1.5,0,Math.PI*2);ctx.fill();if(i===0){ctx.strokeStyle='#6b4d35';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ax+13,ay-17);ctx.lineTo(ax+8,ay-25);ctx.moveTo(ax+22,ay-17);ctx.lineTo(ax+28,ay-25);ctx.stroke();}});
 roundedRect(ctx,1620,500,58,36,5,'#b68a4e');ctx.fillStyle='#e4c17b';ctx.fillRect(1625,505,48,25);ctx.font='bold 11px Nunito';ctx.fillStyle='#65472d';ctx.fillText('PAKAN',1649,520);
 // Mulut tambang emas dengan papan petunjuk dan jalur masuk.
 ctx.fillStyle='#705039';ctx.beginPath();ctx.ellipse(300,640,58,38,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#241f1b';ctx.beginPath();ctx.ellipse(300,636,43,27,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#9a7046';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(257,635);ctx.lineTo(257,610);ctx.lineTo(343,610);ctx.lineTo(343,635);ctx.stroke();
 ctx.fillStyle='#f1d38d';ctx.fillRect(252,572,96,24);ctx.fillStyle='#5b3d25';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('TAMBANG EMAS',300,588);
 ctx.fillStyle='#e8c66e';ctx.font='bold 12px Nunito';ctx.fillText('Masuk: E',300,690);
 // decorative shrubs, flower beds and trees
 [[90,160],[450,130],[900,170],[1080,250],[1700,220],[850,850],[650,960],[1750,850],[920,1080],[1660,1120],[500,920],[1320,1110],[1770,390]].forEach(p=>drawTree(...p));
 for(let i=0;i<42;i++){const x=(i*149+60)%1760,y=(i*97+95)%1160;if((x>960&&x<1630&&y>690&&y<1060)||(x>110&&x<570&&y>780&&y<1050))continue;ctx.fillStyle=i%2?'#e9d778':'#f0e9bd';ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();}

 // More village life: crop beds, orchard trees, benches, crates and flower borders.
 [[50,220],[470,760],[820,360],[1260,350],[1660,700],[610,1030],[340,180],[1510,1120]].forEach(([x,y],i)=>{
   roundedRect(ctx,x,y,116,66,9,'#8b6948');roundedRect(ctx,x+5,y+5,106,56,6,i%2?'#a77e4e':'#b58a56');
   for(let row=0;row<2;row++)for(let col=0;col<6;col++){const px=x+15+col*17,py=y+20+row*25;ctx.strokeStyle=i%3===0?'#397a3d':'#4d8d43';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py+8);ctx.lineTo(px-4,py-2);ctx.moveTo(px,py+8);ctx.lineTo(px+5,py-3);ctx.stroke();ctx.fillStyle='#a7d568';ctx.beginPath();ctx.arc(px-4,py-2,2.5,0,Math.PI*2);ctx.arc(px+5,py-3,2.5,0,Math.PI*2);ctx.fill();}
 });
 [[70,900],[610,260],[880,760],[1720,500],[1320,80],[250,1120]].forEach(([x,y],i)=>{drawTree(x,y);ctx.fillStyle='#c7a36a';ctx.fillRect(x-4,y+19,8,18);if(i%2===0){ctx.fillStyle='#e6b94f';[[x-10,y-12],[x+9,y-17],[x+2,y+1]].forEach(([fx,fy])=>{ctx.beginPath();ctx.arc(fx,fy,3,0,Math.PI*2);ctx.fill();});}});
 [[500,460],[840,650],[430,680],[1510,390],[720,990]].forEach(([x,y])=>{ctx.fillStyle='rgba(52,48,35,.2)';ctx.fillRect(x-17,y+10,38,5);ctx.fillStyle='#765033';ctx.fillRect(x-18,y-2,36,7);ctx.fillRect(x-14,y+5,4,10);ctx.fillRect(x+10,y+5,4,10);});
 [[430,470],[875,630],[1650,420],[1750,980],[70,700]].forEach(([x,y])=>{ctx.fillStyle='#9b7045';ctx.fillRect(x-10,y-10,20,20);ctx.strokeStyle='#e0bd83';ctx.lineWidth=2;ctx.strokeRect(x-10,y-10,20,20);ctx.beginPath();ctx.moveTo(x-8,y-8);ctx.lineTo(x+8,y+8);ctx.moveTo(x+8,y-8);ctx.lineTo(x-8,y+8);ctx.stroke();});
 for(let i=0;i<90;i++){const x=(i*173+95)%1760,y=(i*211+140)%1140;if((x>960&&x<1630&&y>690&&y<1060)||(x>110&&x<570&&y>780&&y<1050))continue;ctx.fillStyle=['#e7d16d','#e9a5a0','#f3e6ba','#d7b5e2'][i%4];ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4b8b43';ctx.fillRect(x-1,y+3,2,5);}

 // Gerbang menuju Kebun Sawit di pojok tenggara desa
 ctx.fillStyle='#4d3828';ctx.fillRect(1615,1030,92,12);ctx.fillRect(1625,995,10,52);ctx.fillRect(1687,995,10,52);
 ctx.fillStyle='#315a34';ctx.beginPath();ctx.moveTo(1605,1002);ctx.lineTo(1660,962);ctx.lineTo(1715,1002);ctx.closePath();ctx.fill();
 roundedRect(ctx,1632,1008,58,38,5,'#253c2b');ctx.fillStyle='#f0d7a1';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('KEBUN SAWIT',1660,1022);ctx.font='bold 10px Nunito';ctx.fillText('MASUK',1660,1038);
 // area labels with subtle backing
 ctx.textAlign='left';ctx.font='900 20px Nunito';ctx.fillStyle='rgba(255,255,235,.72)';ctx.fillText('DESA SUKAMAJU',43,54);ctx.fillStyle='#315c37';ctx.fillText('DESA SUKAMAJU',40,51);
 ctx.font='bold 16px Nunito';ctx.fillStyle='#315c37';ctx.fillText('AREA PERSAWAHAN',1190,690);ctx.textAlign='center';ctx.font='900 17px Nunito';ctx.lineWidth=4;ctx.strokeStyle='rgba(95,70,43,.48)';ctx.strokeText('JALAN DESA',900,575);ctx.fillStyle='#fff4d8';ctx.fillText('JALAN DESA',900,575);
 // Karakter NPC digambar solid dengan badan, tangan, kaki, dan pakaian.
 npcs.forEach((n,i)=>{const done=missionDone(n.id);ctx.font='bold 12px Nunito';drawFarmer(n.x,n.y,{shirt:['#3979b9','#bd6686','#3f8a57','#c58a38'][i%4],pants:'#394d43',hat:['#d6a34d','#d8b86d','#6b8e57'][i%3]},i*.8,false);const labelW=Math.max(76,Math.min(132,ctx.measureText(n.name).width+22));roundedRect(ctx,n.x-labelW/2,n.y+28,labelW,23,10,'rgba(255,255,245,.98)');ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillStyle='#23452c';ctx.fillText(n.name,n.x,n.y+44);if(n.kind==='mission'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(n.x,n.y-43,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle=done?'#23834b':'#d88b1f';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=done?'#23834b':'#d88b1f';ctx.font='bold 17px Nunito';ctx.fillText(n.id===state.catQuestNpcId&&!state.catOwned?'🐾':(done?'✓':'!'),n.x,n.y-37);}});
 if(state.catOwned)drawPetCat(state.catFollower.x,state.catFollower.y,t);
 // Pemain: badan penuh, dua kaki dan animasi langkah saat bergerak.
 const moving=!!(state.keys.ArrowRight||state.keys.ArrowLeft||state.keys.ArrowUp||state.keys.ArrowDown||state.keys.w||state.keys.a||state.keys.s||state.keys.d||Math.hypot(state.analog.x,state.analog.y)>.12);
 drawFarmer(state.player.x,state.player.y,{shirt:'#287b49',pants:'#344b3a',hat:'#d8ad4e'},t/105,moving,true);
 const near=nearestNpc();if(Math.hypot(300-state.player.x,640-state.player.y)<90){const mob=window.matchMedia('(max-width: 760px)').matches;const label=mob?'Tap INTERAKSI: Tambang':'Tekan E: Masuk Tambang';ctx.font='bold 12px Nunito';roundedRect(ctx,state.player.x-90,state.player.y-91,180,28,12,'rgba(255,255,245,.98)');ctx.fillStyle='#174d32';ctx.textAlign='center';ctx.fillText(label,state.player.x,state.player.y-73);}else if(Math.hypot(1660-state.player.x,1030-state.player.y)<125){const mob=window.matchMedia('(max-width: 760px)').matches;const label=mob?'Tap INTERAKSI: Kebun Sawit':'Tekan E: Kebun Sawit';ctx.font='bold 12px Nunito';roundedRect(ctx,state.player.x-94,state.player.y-91,188,28,12,'rgba(255,255,245,.98)');ctx.fillStyle='#174d32';ctx.textAlign='center';ctx.fillText(label,state.player.x,state.player.y-73);}else if(near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<88){const mobile=window.matchMedia('(max-width: 760px)').matches;const hint=mobile?'Tap tombol INTERAKSI':'Tekan E untuk bicara';ctx.font='bold 12px Nunito';const bw=Math.max(138,ctx.measureText(hint).width+24),bx=Math.max(8,Math.min(WORLD.w-bw-8,state.player.x-bw/2)),by=state.player.y-91;roundedRect(ctx,bx,by,bw,28,12,'rgba(255,255,245,.98)');ctx.strokeStyle='#d8e6ce';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#174d32';ctx.textAlign='center';ctx.fillText(hint,bx+bw/2,by+18);}
 ctx.restore();
 $('worldLocation').textContent=(near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<100?'📍 '+near.name:'📍 Desa Sukamaju')+(state.catOwned?' • 🐈 Kucing menemani':'');
 const hintEl=$('canvasHint');if(hintEl)hintEl.textContent=window.matchMedia('(max-width: 760px)').matches?'Gunakan tombol arah untuk bergerak • Dekati warga lalu tap INTERAKSI':'Gunakan WASD / tombol panah untuk bergerak • Dekati warga lalu tekan E atau Spasi untuk bicara';
 const next=nextMission();$('worldObjective').textContent=next?'🎯 '+next.text:'⭐ Semua misi desa selesai';
}
function enterPalm(){
 state.returnPosition={x:state.player.x,y:state.player.y};state.scene='palm';
 state.player={x:canvas.width*.5,y:canvas.height-135};save();
}
function palmInteract(){
 const exit={x:canvas.width*.5,y:canvas.height-90};
 if(Math.hypot(state.player.x-exit.x,state.player.y-exit.y)<92){
  state.scene='village';state.player={...state.returnPosition};save();return;
 }
 $('missionDescription').textContent='Hutan sawit terasa sunyi. Cari jalan kembali ke gerbang.';
}
function drawPalm(t=0){
 const w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);ctx.save();
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#101b17');bg.addColorStop(.55,'#1d3023');bg.addColorStop(1,'#263526');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // lantai hutan, kabut dan jalur sempit
 ctx.fillStyle='#263528';ctx.beginPath();ctx.moveTo(w*.39,0);ctx.lineTo(w*.62,0);ctx.lineTo(w*.78,h);ctx.lineTo(w*.2,h);ctx.closePath();ctx.fill();
 for(let i=0;i<22;i++){const x=(i*137+35)%w,y=(i*91+50)%h;ctx.fillStyle='rgba(170,190,160,.035)';ctx.beginPath();ctx.ellipse(x,y,45+(i%5)*12,8+(i%4)*4,0,0,Math.PI*2);ctx.fill();}
 // densely packed oil palms, layered trunks and fronds
 for(let row=0;row<5;row++)for(let col=0;col<8;col++){
  const x=col*(w/7)-22+(row%2)*23,y=row*112-22;
  const scale=.72+row*.12;
  ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(x+8,y+95*scale,35*scale,10*scale,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#493c2b';ctx.fillRect(x-7*scale,y+24*scale,14*scale,78*scale);
  ctx.strokeStyle=row%2?'#244b2d':'#1b4028';ctx.lineWidth=7*scale;ctx.lineCap='round';
  for(let k=0;k<9;k++){const a=(-Math.PI*.95)+(k/8)*Math.PI*.9;ctx.beginPath();ctx.moveTo(x,y+28*scale);ctx.quadraticCurveTo(x+Math.cos(a)*35*scale,y-2*scale,x+Math.cos(a)*76*scale,y+Math.sin(a)*44*scale);ctx.stroke();}
  ctx.fillStyle='#273d27';ctx.beginPath();ctx.arc(x,y+20*scale,18*scale,0,Math.PI*2);ctx.fill();
  if((row+col)%3===0){ctx.fillStyle='#6d3d25';for(let q=0;q<5;q++){ctx.beginPath();ctx.arc(x+(q-2)*5*scale,y+44*scale,4*scale,0,Math.PI*2);ctx.fill();}}
 }
 // dark vignette
 const vg=ctx.createRadialGradient(w/2,h/2,80,w/2,h/2,w*.72);vg.addColorStop(.35,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.62)');ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
 // ghost appears periodically, translucent and drifting
 const cycle=(t%12000),visible=cycle>1800&&cycle<6200;
 if(visible){
  const phase=(cycle-1800)/4400, gx=w*(.25+phase*.5), gy=h*(.34+Math.sin(phase*Math.PI*2)*.055);
  ctx.save();ctx.globalAlpha=.25+.13*Math.sin(t/210);
  ctx.shadowColor='#d9f4ef';ctx.shadowBlur=26;ctx.fillStyle='#dceeea';
  ctx.beginPath();ctx.ellipse(gx,gy,24,34,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(gx-22,gy+17);ctx.quadraticCurveTo(gx-38,gy+49,gx-15,gy+56);ctx.quadraticCurveTo(gx,gy+43,gx+12,gy+58);ctx.quadraticCurveTo(gx+36,gy+38,gx+21,gy+14);ctx.closePath();ctx.fill();
  ctx.globalAlpha=.42;ctx.fillStyle='#526b68';ctx.beginPath();ctx.arc(gx-8,gy-4,3,0,Math.PI*2);ctx.arc(gx+8,gy-4,3,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 // entrance glow and exit sign
 ctx.fillStyle='rgba(225,210,145,.14)';ctx.beginPath();ctx.ellipse(w/2,h-82,80,45,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e6d4a4';ctx.font='bold 13px Nunito';ctx.textAlign='center';ctx.fillText('GERBANG KELUAR',w/2,h-28);
 drawFarmer(state.player.x,state.player.y,{shirt:'#287b49',pants:'#344b3a'},t/105,false,true);
 if(state.catOwned)drawPetCat(state.player.x-28,state.player.y+20,t);
 ctx.restore();
 $('worldLocation').textContent='🌴 Kebun Sawit • Hutan Sunyi';
 $('worldObjective').textContent='🌫️ Jelajahi kebun sawit dan temukan jalan kembali ke gerbang';
 const hint=$('canvasHint');if(hint)hint.textContent=window.matchMedia('(max-width: 760px)').matches?'Gunakan tombol arah untuk bergerak • Dekati gerbang lalu tap INTERAKSI':'Gunakan WASD / tombol panah • Dekati gerbang lalu tekan E / Spasi';
}
function drawMine(t=0){
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();
 const g=ctx.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,'#302a29');g.addColorStop(1,'#17191b');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
 // Terowongan batu dan rel tambang.
 ctx.fillStyle='#51443b';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(canvas.width,0);ctx.lineTo(canvas.width,115);ctx.quadraticCurveTo(canvas.width/2,35,0,115);ctx.closePath();ctx.fill();
 for(let i=0;i<75;i++){const x=(i*137+29)%canvas.width,y=(i*83+37)%(canvas.height-100);ctx.fillStyle=i%2?'rgba(194,169,132,.15)':'rgba(0,0,0,.18)';ctx.beginPath();ctx.arc(x,y,2+(i%5),0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#8d765f';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,canvas.height-75);ctx.lineTo(canvas.width,canvas.height-75);ctx.moveTo(0,canvas.height-52);ctx.lineTo(canvas.width,canvas.height-52);ctx.stroke();
 for(let x=25;x<canvas.width;x+=55){ctx.strokeStyle='#6c5948';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,canvas.height-88);ctx.lineTo(x+18,canvas.height-40);ctx.stroke();}
 // Vena emas di dinding.
 [[100,180],[canvas.width-120,170],[canvas.width/2,125],[canvas.width-210,canvas.height-155],[180,canvas.height-180]].forEach(([x,y],i)=>{ctx.fillStyle='#7c6344';ctx.beginPath();ctx.moveTo(x-34,y+18);ctx.lineTo(x-20,y-20);ctx.lineTo(x+18,y-27);ctx.lineTo(x+38,y+12);ctx.closePath();ctx.fill();ctx.fillStyle='#f2c94c';ctx.beginPath();ctx.moveTo(x-17,y+8);ctx.lineTo(x-6,y-14);ctx.lineTo(x+5,y-4);ctx.lineTo(x+17,y-17);ctx.lineTo(x+23,y+10);ctx.closePath();ctx.fill();});
 const spots=state.mineNodes.length?state.mineNodes:[[canvas.width*.28,canvas.height*.38],[canvas.width*.72,canvas.height*.34],[canvas.width*.5,canvas.height*.68],[canvas.width*.82,canvas.height*.7],[canvas.width*.18,canvas.height*.72]];
 spots.forEach((pt,i)=>{if(pt===null)return;const [x,y]=pt;ctx.fillStyle='#4b3b2e';ctx.beginPath();ctx.arc(x,y,24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4c542';ctx.beginPath();ctx.arc(x-7,y-5,7,0,Math.PI*2);ctx.arc(x+8,y+4,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0a5';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('EMAS',x,y+39);});
 // Gerobak dan pintu keluar.
 ctx.fillStyle='#b98a54';ctx.beginPath();ctx.ellipse(canvas.width*.5,canvas.height-70,58,27,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#17191b';ctx.beginPath();ctx.ellipse(canvas.width*.5,canvas.height-69,43,19,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0c2';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('KELUAR • INTERAKSI',canvas.width*.5,canvas.height-24);
 ctx.fillStyle='#986a3f';ctx.fillRect(18,20,75,46);ctx.fillStyle='#d8b879';ctx.fillRect(25,26,61,30);ctx.fillStyle='#2d2520';ctx.beginPath();ctx.arc(33,70,8,0,Math.PI*2);ctx.arc(78,70,8,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff0c2';ctx.font='bold 15px Nunito';ctx.textAlign='left';ctx.fillText('TAMBANG EMAS BAWAH TANAH',110,43);ctx.font='bold 12px Nunito';ctx.fillText(window.matchMedia('(max-width: 760px)').matches?'Dekati emas lalu tap tombol INTERAKSI':'Dekati emas lalu tekan E / Spasi untuk menambang',110,64);
 const px=state.player.x,py=state.player.y;drawFarmer(px,py,{shirt:'#287b49',pants:'#344b3a'},t/105,false,true);
 if(state.catOwned)drawPetCat(px-28,py+20,t);
 let nearestGold=null,nearestGoldDist=Infinity;spots.forEach(pt=>{if(!pt)return;const d=Math.hypot(px-pt[0],py-pt[1]);if(d<nearestGoldDist){nearestGoldDist=d;nearestGold=pt;}});
 if(nearestGold&&nearestGoldDist<90){const mobile=window.matchMedia('(max-width: 760px)').matches,label=mobile?'Tap tombol INTERAKSI untuk menambang':'Tekan E / Spasi untuk menambang';ctx.font='bold 12px Nunito';const bw=Math.max(190,ctx.measureText(label).width+24),bx=Math.max(8,Math.min(canvas.width-bw-8,px-bw/2)),by=py-90;roundedRect(ctx,bx,by,bw,28,12,'rgba(255,250,226,.96)');ctx.fillStyle='#4b3825';ctx.textAlign='center';ctx.fillText(label,bx+bw/2,by+18);}
 ctx.restore();$('worldLocation').textContent='⛏️ Tambang Emas • '+state.mineGold+' bongkah';$('worldObjective').textContent='🎯 Tambang emas lalu kembali ke permukaan untuk menukar menjadi XP';
 const h=$('canvasHint');if(h)h.textContent=window.matchMedia('(max-width: 760px)').matches?'Dekati bongkahan emas lalu tap tombol INTERAKSI. Dekati pintu keluar untuk kembali ke desa.':'Dekati bongkahan emas lalu tekan E / Spasi. Dekati pintu keluar untuk kembali ke desa.';
}
function mineInteract(){
 const exit={x:canvas.width*.5,y:canvas.height-105};
 if(Math.hypot(state.player.x-exit.x,state.player.y-exit.y)<75){
   state.scene='village';state.player={...state.returnPosition};
   if(state.mineGold>0){const mined=state.mineGold,gained=mined*12;state.xp+=gained;state.coins+=mined*2;state.mineGold=0;updateStats();checkAchievements();save();$('missionDescription').textContent='Emas berhasil ditukar! Kamu memperoleh '+gained+' XP dan '+(mined*2)+' koin.';}
   save();return;
 }
 let idx=-1,best=Infinity;state.mineNodes.forEach((pt,i)=>{if(!pt)return;const d=Math.hypot(state.player.x-pt[0],state.player.y-pt[1]);if(d<best){best=d;idx=i;}});
 if(idx>=0&&best<75){state.mineNodes[idx]=null;state.mineGold++;save();$('worldLocation').textContent='⛏️ Emas terkumpul: '+state.mineGold;}
}
function enterMine(){state.returnPosition={x:state.player.x,y:state.player.y};state.scene='mine';state.player={x:canvas.width*.5,y:canvas.height-180};if(!state.mineNodes.length||state.mineNodes.every(x=>x===null))state.mineNodes=[[canvas.width*.28,canvas.height*.38],[canvas.width*.72,canvas.height*.34],[canvas.width*.5,canvas.height*.68],[canvas.width*.82,canvas.height*.7],[canvas.width*.18,canvas.height*.72]];save();}
function nearestNpc(){let best=null,dist=Infinity;for(const n of npcs){const d=Math.hypot(n.x-state.player.x,n.y-state.player.y);if(d<dist){dist=d;best=n;}}return best;}
function blocked(x,y){if(state.scene==='mine'||state.scene==='palm')return false;if(obstacles.some(o=>x>o.x-18&&x<o.x+o.w+18&&y>o.y-10&&y<o.y+o.h+10))return true;const trunks=[[90,160],[450,130],[900,170],[1080,250],[1700,220],[850,850],[650,960],[1750,850],[920,1080],[1660,1120],[500,920],[1320,1110],[1770,390],[610,260],[880,760],[1720,500],[1320,80],[250,1120]];if(trunks.some(([tx,ty])=>Math.hypot(x-tx,y-(ty+18))<22))return true;return npcs.some(n=>Math.hypot(x-n.x,y-n.y)<22);}
function movePlayer(dx,dy){
 if(!dx&&!dy)return;
 const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
 const speed=3.4;
 const maxX=(state.scene==='mine'||state.scene==='palm')?canvas.width-35:WORLD.w-25;
 const maxY=(state.scene==='mine'||state.scene==='palm')?canvas.height-90:WORLD.h-30;
 const startX=state.player.x,startY=state.player.y;
 const startBlocked=blocked(startX,startY);
 const nx=Math.max(25,Math.min(maxX,startX+dx*speed));
 const ny=Math.max(80,Math.min(maxY,startY+dy*speed));
 // If a newly-added fence/building surrounds a previously saved player position,
 // allow movement out of the overlap instead of trapping the player permanently.
 if(startBlocked || !blocked(nx,startY))state.player.x=nx;
 if(startBlocked || !blocked(state.player.x,ny))state.player.y=ny;
}
function loop(ts){const dt=Math.min((ts-last)/16||1,2);last=ts;let dx=(state.keys.ArrowRight||state.keys.d?1:0)-(state.keys.ArrowLeft||state.keys.a?1:0);let dy=(state.keys.ArrowDown||state.keys.s?1:0)-(state.keys.ArrowUp||state.keys.w?1:0);dx+=state.analog.x;dy+=state.analog.y;if(dx||dy)movePlayer(dx*dt,dy*dt);if(state.catOwned&&state.scene==='village'){const len=Math.hypot(dx,dy)||1,tx=state.player.x-(dx/len)*27,ty=state.player.y-(dy/len)*20;state.catFollower.x+=(tx-state.catFollower.x)*.16;state.catFollower.y+=(ty-state.catFollower.y)*.16;}drawWorld(ts);raf=requestAnimationFrame(loop);}
function startWorld(){stopWorld();last=0;drawWorld();raf=requestAnimationFrame(loop);}
function stopWorld(){if(raf)cancelAnimationFrame(raf);raf=0;state.keys={};}
function interact(){
  if(dialogOpen)return;
  if(state.scene==='mine'){mineInteract();return;}
  if(state.scene==='palm'){palmInteract();return;}
  if(Math.hypot(300-state.player.x,640-state.player.y)<90){enterMine();return;}
  if(Math.hypot(1660-state.player.x,1030-state.player.y)<125){enterPalm();return;}
  const n=nearestNpc();
  if(!n||Math.hypot(n.x-state.player.x,n.y-state.player.y)>88){
    $('missionDescription').textContent='Belum ada warga di dekatmu. Dekati salah satu warga desa.';
    return;
  }
  openNpcDialog(n);
}
function openNpcDialog(n){
  stopWorld();dialogOpen=true;$('dialog').classList.remove('hidden');$('dialogEmoji').textContent=n.emoji;$('dialogEyebrow').textContent=n.role.toUpperCase();$('dialogChoices').innerHTML='';$('closeDialog').classList.add('hidden');
 if(n.id==='peternak'&&n.id!==state.catQuestNpcId){
   $('dialogTitle').textContent='Misi Peternakan: Bantu Pak Asep';
   $('dialogText').textContent=state.ranchMissionDone?'Misi peternakan sudah selesai. Terima kasih sudah membantu!':'“Saya perlu memastikan ternak tetap sehat. Apa yang harus dilakukan setiap hari agar ternak terawat?”';
   addChoice('Menyediakan pakan dan air bersih, menjaga kandang, serta mengamati kesehatan ternak',true,()=>{if(!state.ranchMissionDone){state.ranchMissionDone=true;reward(30,15);save();}$('dialogText').textContent='Bagus! Perawatan rutin, pakan dan air bersih, kebersihan kandang, serta pengamatan kesehatan penting bagi ternak. Hadiah 30 XP dan 15 koin telah diterima.';});
   addChoice('Membiarkan kandang kotor dan memberi pakan sesekali',false,()=>{$('dialogText').textContent='Belum tepat. Ternak memerlukan pakan, air bersih, kandang yang terjaga, dan pemantauan kesehatan.';});
 }
 else if(n.id===state.catQuestNpcId){
   $('dialogTitle').textContent=state.catOwned?'Misi Kucing: Persahabatan Baru':'Misi Spesial: Tolong Rawat Anak Kucing';
   $('dialogText').textContent=state.catOwned?'Terima kasih sudah merawat anak kucing itu. Sekarang ia selalu menemanimu menjelajahi Desa Sukamaju.':'“Saya menemukan seekor anak kucing sendirian di dekat kebun. Sepertinya ia lapar dan butuh tempat aman. Maukah kamu merawatnya?”';
   if(state.catOwned){addChoice('Senang sekali punya teman baru!',true,()=>{$('dialogText').textContent='Anak kucingmu mengeong riang dan siap menemanimu berkeliling desa.';});}
   else{
     addChoice('Tentu! Saya akan memberinya makan dan tempat yang aman.',true,()=>{state.catOwned=true;state.catFollower={x:state.player.x-28,y:state.player.y+20};reward(35,20);save();$('dialogText').textContent='Meong! Anak kucing itu kini menjadi teman setiamu. Kamu mendapat 35 XP, 20 koin, dan seekor kucing peliharaan! Ia akan mengikuti ke mana pun kamu berjalan.';});
     addChoice('Saya belum bisa merawat hewan.',false,()=>{$('dialogText').textContent='Tidak apa-apa. Kamu bisa kembali kapan saja untuk menerima anak kucing ini.';});
   }
 }
 else if(n.id==='pak'){
   $('dialogTitle').textContent='Pak Tani membutuhkan bantuan';
   $('dialogText').textContent=state.missionDone?'Misi Pak Tani sudah selesai. Hadiah sebelumnya sudah diterima.':'“Daun padi saya menguning dan ada bercak. Apa langkah pertama yang sebaiknya dilakukan?”';
   const choices=[['Langsung menyemprot pestisida dosis tinggi',false],['Mengamati gejala dan mengidentifikasi penyebabnya',true],['Membiarkan tanaman sampai panen',false]];
   choices.forEach(([label,ok])=>addChoice(label,ok,()=>{if(ok){if(!state.missionDone)completeMission('pak',20,10);$('dialogText').textContent=state.missionDone?'Hebat! Misi Pak Tani selesai. Hadiah 20 XP dan 10 koin telah diterima.':'Misi Pak Tani sudah selesai.';}else{$('dialogText').textContent='Belum tepat. Lakukan pengamatan dan identifikasi sebelum menentukan tindakan pengendalian.';}}));
 }
 else if(n.id==='bu'){
   $('dialogTitle').textContent='Misi Bu Rina: Pencatatan Kelompok Tani';
   $('dialogText').textContent=state.buMissionDone?'Misi Bu Rina sudah selesai. Hadiah sebelumnya sudah diterima.':'“Kami ingin belajar membuat catatan kegiatan kelompok tani. Apa manfaat pencatatan?”';
   addChoice('Membantu mendokumentasikan kegiatan dan mengevaluasi kemajuan',true,()=>{if(!state.buMissionDone)completeMission('bu',25,10);$('dialogText').textContent='Tepat! Pencatatan membantu kelompok mendokumentasikan kegiatan dan mengevaluasi kemajuan. '+(state.buMissionDone?'Hadiah 25 XP dan 10 koin sudah diterima.':'');});
   addChoice('Tidak perlu mencatat kegiatan',false,()=>{$('dialogText').textContent='Belum tepat. Catatan membantu kelompok melihat kegiatan yang sudah dilakukan dan hasil yang dicapai.';});
 }
 else if(n.id==='ketua'){
   $('dialogTitle').textContent='Misi Pak Ketua: Identifikasi Kebutuhan';
   $('dialogText').textContent=state.ketuaMissionDone?'Misi Pak Ketua sudah selesai. Hadiah sebelumnya sudah diterima.':'“Sebelum menyusun kegiatan, sebaiknya kita mengetahui kebutuhan anggota kelompok.” Apa pendekatan yang tepat?';
   addChoice('Melakukan diskusi dan identifikasi kebutuhan bersama anggota',true,()=>{if(!state.ketuaMissionDone)completeMission('ketua',30,15);$('dialogText').textContent='Tepat! Kegiatan penyuluhan perlu disusun berdasarkan kebutuhan anggota kelompok. Hadiah 30 XP dan 15 koin sudah diterima.';});
   addChoice('Menentukan kegiatan tanpa mendengar petani',false,()=>{$('dialogText').textContent='Belum tepat. Kebutuhan petani perlu digali melalui diskusi dan identifikasi bersama.';});
 } else {
   const m=extraMissions.find(x=>x.id===n.id);
   if(m){
     $('dialogTitle').textContent=m.title;
     $('dialogText').textContent=state.missionFlags[m.id]?'Misi ini sudah selesai. Hadiah telah diterima.':m.question;
     m.choices.forEach(([label,ok])=>addChoice(label,ok,()=>{
       if(ok&&!state.missionFlags[m.id])completeMission(m.id,m.xp,m.coins);
       $('dialogText').textContent=ok?'Tepat! '+m.explain+' Hadiah '+m.xp+' XP dan '+m.coins+' koin telah diterima.':'Belum tepat. Coba pikirkan kembali kebutuhan petani dan prinsip budidaya yang baik.';
     }));
   }
 }
 $('closeDialog').classList.remove('hidden');}
function completeMission(id,xp,coins){
  if(id==='pak'){if(state.pakMissionRewarded)return;state.missionDone=true;state.pakMissionRewarded=true;}
  if(id==='bu'){if(state.buMissionRewarded)return;state.buMissionDone=true;state.buMissionRewarded=true;}
  if(id==='ketua'){if(state.ketuaMissionRewarded)return;state.ketuaMissionDone=true;state.ketuaMissionRewarded=true;}
  if(!['pak','bu','ketua'].includes(id)){if(state.missionFlags[id])return;state.missionFlags[id]=true;}
  const oldLevel=levelFromXP(state.xp);
  state.xp+=xp;state.coins+=coins;
  const newLevel=levelFromXP(state.xp);let bonus=0;
  while(state.highestLevelReached<newLevel){state.highestLevelReached++;state.coins+=25;bonus+=25;}
  updateStats();checkAchievements();save();
  if(newLevel>oldLevel)showLevelUp(newLevel,bonus);
  $('missionDescription').textContent='Misi selesai! Kamu memperoleh '+xp+' XP dan '+coins+' koin.';
}
function addChoice(label,correct,after){const b=document.createElement('button');b.className='answer-option';b.textContent=label;b.addEventListener('click',()=>{document.querySelectorAll('#dialogChoices button').forEach(x=>x.disabled=true);if(correct){b.classList.add('correct');$('dialogText').textContent='Tepat!';}else{b.classList.add('wrong');$('dialogText').textContent='Coba pikirkan kembali jawaban yang paling tepat.';}after();});$('dialogChoices').appendChild(b);}
$('closeDialog').addEventListener('click',()=>{$('dialog').classList.add('hidden');dialogOpen=false;startWorld();});
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();state.keys[e.key]=true;if(e.key==='e'||e.key==='E'||e.key===' '){if(!$('dialog').classList.contains('hidden'))return;interact();}});
window.addEventListener('keyup',e=>state.keys[e.key]=false);window.addEventListener('blur',()=>state.keys={});
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);state.keys[k]=true;});['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>state.keys[k]=false));});
const joystick=$('joystickControl'),joystickKnob=$('joystickKnob');
if(joystick&&joystickKnob){
 let stickPointer=null;
 const updateStick=e=>{
  const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const max=Math.max(20,r.width*.34),dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy)||1,scale=Math.min(1,max/len);
  const px=dx*scale,py=dy*scale;
  state.analog={x:px/max,y:py/max};
  joystickKnob.style.transform=`translate(${px}px, ${py}px)`;
 };
 const releaseStick=e=>{
  if(stickPointer!==null&&(!e||e.pointerId===stickPointer)){stickPointer=null;state.analog={x:0,y:0};joystickKnob.style.transform='translate(0px, 0px)';}
 };
 joystick.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;joystick.setPointerCapture?.(e.pointerId);updateStick(e);});
 joystick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer){e.preventDefault();updateStick(e);}});
 ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>joystick.addEventListener(ev,releaseStick));
}

$('interactButton').addEventListener('click',interact);
/* Farm Simulator v0.16.0 — walkable field + management panels */
const farmCanvas=$('farmCanvas'),farmCtx=farmCanvas.getContext('2d');farmCtx.scale(2,2);
const farmCrops={
 padi:{name:'Padi',emoji:'🌾',seedPrice:5,sell:24,xp:12,grow:16000},
 jagung:{name:'Jagung',emoji:'🌽',seedPrice:7,sell:32,xp:15,grow:19000},
 cabai:{name:'Cabai',emoji:'🌶️',seedPrice:9,sell:42,xp:18,grow:23000},
 tomat:{name:'Tomat',emoji:'🍅',seedPrice:8,sell:36,xp:16,grow:21000}
};
const farmPlotCenters=[{x:170,y:280},{x:450,y:280},{x:730,y:280},{x:170,y:390},{x:450,y:390},{x:730,y:390}];
const farmHit={seeds:[],actions:[],buildings:[]};
let farmRaf=0,farmLastFrame=0,farmUiLast=0,farmHeldDir=null,farmHoldTimer=null;
function farmPlotReady(plot){return !!plot.crop&&!plot.pest&&plot.watered&&Date.now()-(plot.plantedAt||0)>=(farmCrops[plot.crop]?.grow||18000)*(plot.fertilized?.65:1);}
function drawFarmWorld(){
 const c=farmCtx;c.clearRect(0,0,900,510);
 const grad=c.createLinearGradient(0,0,900,510);grad.addColorStop(0,'#a8d987');grad.addColorStop(1,'#78b75f');c.fillStyle=grad;c.fillRect(0,0,900,510);
 for(let i=0;i<125;i++){const x=(i*97)%900,y=(i*61)%510;c.fillStyle=i%2?'#8bc56e':'#b4df8d';c.globalAlpha=.65;c.fillRect(x,y,10,3);}c.globalAlpha=1;
 // tidy village paths
 c.fillStyle='#d8bd88';c.fillRect(0,205,900,12);c.fillRect(0,445,900,65);c.fillStyle='#c9ad78';c.fillRect(0,452,900,4);
 c.fillStyle='#eaf5d9';c.fillRect(0,0,900,34);c.fillStyle='#315b35';c.font='bold 15px Nunito, sans-serif';c.textAlign='left';c.fillText('KEBUN BELAJAR',16,18);
 // crop selection icons
 farmHit.seeds=[];let sx=260;Object.entries(farmCrops).forEach(([id,cr],n)=>{const x=sx+n*150,y=17,w=136,h=48,selected=state.farmSelectedCrop===id,stock=state.farmSeeds[id]||0;c.fillStyle=stock<=0?'#d8e3d0':selected?'#fff0a8':'#f4f9e9';roundRect(c,x,y,w,h,12);c.fill();c.strokeStyle=selected?'#397e42':'#d2e5c9';c.lineWidth=selected?3:1;c.stroke();c.textAlign='center';c.font='22px serif';c.fillStyle=stock<=0?'#9aab98':'#315b35';c.fillText(cr.emoji,x+34,y+30);c.font='bold 15px Nunito';c.fillText(String(stock),x+91,y+29);if(selected){c.font='bold 8px Nunito';c.fillText('DIPILIH',x+91,y+41);}farmHit.seeds.push({id,x,y,w,h});});
 // Three distinct, proportionate buildings with readable interaction labels
 farmHit.buildings=[];
 const buildings=[
  {id:'shop',x:48,type:'shop',name:'TOKO BENIH',sub:'Klik untuk buka'},
  {id:'inventory',x:365,type:'warehouse',name:'GUDANG',sub:'Klik untuk buka'},
  {id:'market',x:682,type:'market',name:'PASAR TANI',sub:'Klik untuk buka'}
 ];
 buildings.forEach(b=>{
  const x=b.x,y=104,w=170,h=91;
  // soft shadow and foundation
  c.fillStyle='#315b3540';c.fillRect(x+7,y+86,w,9);
  if(b.type==='shop'){
   // warm wooden kiosk, striped awning and open counter
   c.fillStyle='#80502f';c.fillRect(x+8,y+27,154,58);
   c.fillStyle='#f4d9a8';c.fillRect(x+16,y+36,138,43);
   c.fillStyle='#fff0cf';c.fillRect(x+28,y+43,114,29);
   c.fillStyle='#d96c49';c.fillRect(x+8,y+20,154,17);
   for(let k=0;k<7;k++){c.fillStyle=k%2?'#fff0cf':'#d96c49';c.fillRect(x+8+k*22,y+20,22,17);}
   c.fillStyle='#6d4328';c.fillRect(x+53,y+57,64,28);
   c.fillStyle='#fff8e8';c.fillRect(x+59,y+61,52,7);
   c.fillStyle='#4c8c47';c.fillRect(x+62,y+70,46,5);
   c.fillStyle='#315b35';c.font='bold 11px Nunito';c.textAlign='center';c.fillText('TOKO BENIH',x+85,y+13);
  }else if(b.type==='warehouse'){
   // high-roof timber barn, double doors and vent
   c.fillStyle='#8a6747';c.fillRect(x+9,y+31,152,54);
   c.fillStyle='#b9a17a';c.beginPath();c.moveTo(x+1,y+33);c.lineTo(x+85,y-7);c.lineTo(x+169,y+33);c.closePath();c.fill();
   c.fillStyle='#e6d9b8';c.fillRect(x+19,y+39,132,40);
   c.fillStyle='#805333';c.fillRect(x+54,y+45,62,40);
   c.strokeStyle='#d7b17a';c.lineWidth=3;c.strokeRect(x+54,y+45,62,40);
   c.beginPath();c.moveTo(x+85,y+45);c.lineTo(x+85,y+85);c.stroke();
   c.fillStyle='#5d4934';c.fillRect(x+67,y+9,36,8);
   c.fillStyle='#315b35';c.font='bold 11px Nunito';c.textAlign='center';c.fillText('GUDANG',x+85,y+3);
  }else{
   // market stall with canopy, counter and produce baskets
   c.fillStyle='#815334';c.fillRect(x+8,y+32,154,53);
   c.fillStyle='#f5dfb4';c.fillRect(x+17,y+43,136,35);
   c.fillStyle='#c65f4e';c.fillRect(x+4,y+19,162,18);
   for(let k=0;k<6;k++){c.fillStyle=k%2?'#fff0d0':'#c65f4e';c.fillRect(x+4+k*27,y+19,27,18);}
   c.fillStyle='#80502f';c.fillRect(x+23,y+57,124,28);
   ['🍅','🌽','🌶️'].forEach((e,i)=>{c.font='20px serif';c.fillText(e,x+48+i*38,y+76);});
   c.fillStyle='#315b35';c.font='bold 11px Nunito';c.textAlign='center';c.fillText('PASAR TANI',x+85,y+13);
  }
  // legible click ribbon beneath each facade
  c.fillStyle='#315b35';roundRect(c,x+13,y+94,144,18,7);c.fill();
  c.fillStyle='#fff';c.font='bold 9px Nunito';c.textAlign='center';c.fillText(b.sub,x+85,y+106);
  farmHit.buildings.push({id:b.id,x:x-3,y:y-9,w:176,h:124});
 });
 // field plots
 farmPlotCenters.forEach((p,i)=>{const plot=state.farmPlots[i]||{crop:null,stage:0},locked=i>=state.farmUnlockedPlots;c.fillStyle=state.farmSelectedPlot===i?'#f4d45b':'#8a5935';c.fillRect(p.x-83,p.y-43,166,86);c.fillStyle=locked?'#6c6c55':'#9e7047';c.fillRect(p.x-78,p.y-38,156,76);for(let r=0;r<3;r++){c.fillStyle=locked?'#62624e':'#805432';c.fillRect(p.x-68,p.y-25+r*24,136,4);}c.textAlign='center';if(locked){c.fillStyle='#fff8df';c.font='23px serif';c.fillText('🔒',p.x,p.y-2);c.font='bold 10px Nunito';c.fillText('BUKA '+farmLandPrice(i)+' KOIN',p.x,p.y+26);}else if(plot.crop){const crop=farmCrops[plot.crop],ready=farmPlotReady(plot),icon=ready?crop.emoji:(plot.stage===1?'🌱':'🌿');c.font='25px serif';for(let j=0;j<5;j++)c.fillText(icon,p.x-46+j*23,p.y-2+(j%2)*14);c.font='bold 9px Nunito';c.fillStyle='#fff5d8';c.fillText(plot.pest?'⚠ SERANGAN '+(plot.pestSeverity||1)+'/5':!plot.watered?'BUTUH AIR':ready?'SIAP PANEN':'TUMBUH',p.x,p.y-27);if(plot.pest){c.font='18px serif';c.fillText('🐛',p.x+56,p.y-20);}}else{c.fillStyle='#f5e6c9';c.font='bold 11px Nunito';c.fillText('PETAK '+(i+1),p.x,p.y+5);}if(state.farmSelectedPlot===i){c.strokeStyle='#fff6a5';c.lineWidth=4;c.strokeRect(p.x-86,p.y-46,172,92);}});
 // compact action dock in the play area
 farmHit.actions=[];const actions=[['plant','🌱','TANAM'],['water','💧','SIRAM'],['fertilize','🧪','PUPUK'],['spray','🧴','SEMPROT'],['harvest','🧺','PANEN'],['unlock','🔓','BUKA LAHAN']];
 actions.forEach((a,i)=>{const x=10+i*148,y=462,w=138,h=38;const selected=i===0,pestPlot=state.farmPlots[state.farmSelectedPlot],pestActive=!!pestPlot?.pest&&(pestPlot.pestSeverity||1)>FARM_PEST_THRESHOLD;c.fillStyle=selected?'#17643e':(a[0]==='spray'?(pestActive?'#fff0d5':'#e5eadf'):'#f5f7e9');roundRect(c,x,y,w,h,10);c.fill();c.strokeStyle=i===0?'#d4edc7':'#d6e3c9';c.lineWidth=1;c.stroke();c.textAlign='center';c.fillStyle=selected?'#fff':(a[0]==='spray'&&!pestActive?'#9aa694':'#315b35');c.font='bold 12px Nunito';c.fillText(a[1]+' '+a[2],x+w/2,y+24);farmHit.actions.push({id:a[0],x,y,w,h});});
 // player
 const p=state.farmPlayer||{x:450,y:430};c.fillStyle='#29442b55';c.beginPath();c.ellipse(p.x,p.y+15,16,6,0,0,Math.PI*2);c.fill();c.fillStyle='#244e36';c.fillRect(p.x-9,p.y-7,18,22);c.fillStyle='#f0bd91';c.beginPath();c.arc(p.x,p.y-15,9,0,Math.PI*2);c.fill();c.fillStyle='#d9b45d';c.beginPath();c.arc(p.x,p.y-21,12,Math.PI,Math.PI*2);c.fill();c.fillStyle='#172b1c';c.fillRect(p.x-6,p.y+13,5,8);c.fillRect(p.x+2,p.y+13,5,8);
 
}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const FARM_PEST_THRESHOLD=3;
function farmCheckPests(){
 const now=Date.now();
 state.farmPlots.forEach((plot,i)=>{
  if(!plot||!plot.crop||!plot.watered)return;
  if(plot.pest){
   if((plot.pestSeverity||1)<5&&now-(plot.pestSeverityAt||plot.pestAt||now)>12000){plot.pestSeverity=Math.min(5,(plot.pestSeverity||1)+1);plot.pestSeverityAt=now;save();}
   return;
  }
  if(plot.pestChecked)return;
  const duration=farmCrops[plot.crop].grow*(plot.fertilized?.65:1),elapsed=now-(plot.plantedAt||now),phase=elapsed/duration;
  if(phase>=.22&&phase<=.88){plot.pestChecked=true;if(Math.random()<.34){plot.pest=true;plot.pestType=Math.random()<.5?'hama':'penyakit';plot.pestSeverity=1+Math.floor(Math.random()*5);plot.pestAt=now;plot.pestSeverityAt=now;farmToast('Peringatan tanaman!','Petak '+(i+1)+' terserang '+plot.pestType+'. Intensitas awal '+plot.pestSeverity+'/5. Pantau sebelum menyemprot.','🐛');save();}}
 });
}
let farmPestCheckAt=0;
function farmDrawLoop(t){if(t-farmLastFrame>25){farmLastFrame=t;drawFarmWorld();}if(t-farmUiLast>500){farmUiLast=t;updateFarm();}if(t-farmPestCheckAt>1100){farmPestCheckAt=t;farmCheckPests();}if(state.farmTarget){const p=state.farmPlayer,dx=state.farmTarget.x-p.x,dy=state.farmTarget.y-p.y,d=Math.hypot(dx,dy);if(d>2){const step=Math.min(2.7,d);p.x+=dx/d*step;p.y+=dy/d*step;}else state.farmTarget=null;}farmRaf=requestAnimationFrame(farmDrawLoop);}
function startFarm(){if(farmRaf)cancelAnimationFrame(farmRaf);farmRaf=requestAnimationFrame(farmDrawLoop);updateFarm();}
function stopFarm(){if(farmRaf)cancelAnimationFrame(farmRaf);farmRaf=0;state.farmTarget=null;}
const farmLandPrices=[0,35,55,80,110,150];
function farmLandPrice(i){return farmLandPrices[i]||150;}
let farmToastTimer=0;
function farmToast(title,message,icon='🎉'){
 const box=$('farmToast');$('farmToastTitle').textContent=title;$('farmToastText').textContent=message;$('farmToastIcon').textContent=icon;
 box.classList.remove('hidden');if(farmToastTimer)clearTimeout(farmToastTimer);farmToastTimer=setTimeout(()=>box.classList.add('hidden'),3200);
}
function updateFarm(){
 if(!$('farmPanel'))return;
 $('farmCoins').textContent=state.coins;
 const seedTotal=Object.values(state.farmSeeds||{}).reduce((sum,n)=>sum+(Number(n)||0),0);if($('farmSeedTotal'))$('farmSeedTotal').textContent=seedTotal;if($('farmPesticideTotal'))$('farmPesticideTotal').textContent=Number(state.farmPesticides)||0;
 $('farmSeedStocks').innerHTML='';
 $('farmSeedStocks').querySelectorAll('[data-select-farm-seed]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.selectFarmSeed;if(!(state.farmSeeds[id]>0))return;state.farmSelectedCrop=id;updateFarm();save();farmToast('Benih dipilih',farmCrops[id].name+' dipilih. Tekan tombol Tanam untuk menanam benih ini.','🌱');}));
 $('farmWeather').textContent='Cuaca '+state.farmLastWeather+' • Hari '+state.farmDay;
 const i=state.farmSelectedPlot||0,plot=state.farmPlots[i],locked=i>=state.farmUnlockedPlots,crop=plot?.crop?farmCrops[plot.crop]:null,ready=plot&&farmPlotReady(plot);
 $('farmSelectedLabel').textContent='Petak '+(i+1)+(locked?' • Terkunci':crop?' • '+crop.name:' • Kosong');
 $('farmPlayerStatus').textContent=locked?'Lahan terkunci. Beli lahan ini menggunakan koin hasil penjualan panen.':!plot?.crop?'Lahan siap diolah. Benih terpilih: '+(farmCrops[state.farmSelectedCrop]?.name||'belum dipilih')+'. Tekan Tanam untuk memulai.':plot.pest?'Tanaman terserang '+(plot.pestType||'hama/penyakit')+'. Beli pestisida lalu semprot.':!plot.watered?'Tanaman membutuhkan air.':ready?'Tanaman siap dipanen!':'Tanaman sedang tumbuh. Kembali sebentar lagi.';
 $('farmPlant').disabled=locked||!!plot?.crop||!(state.farmSeeds[state.farmSelectedCrop]>0);
 $('farmPlant').textContent='🌱 Tanam '+(farmCrops[state.farmSelectedCrop]?.name||'Benih');
 $('farmWater').disabled=locked||!plot?.crop||plot.watered;
 $('farmFertilize').disabled=locked||!plot?.crop||plot.fertilized||state.coins<4;
 $('farmHarvest').disabled=locked||!ready;$('farmSpray')&&($('farmSpray').disabled=locked||!plot?.pest);
 $('farmUnlock').disabled=!locked||i!==state.farmUnlockedPlots||state.coins<farmLandPrice(i);
 $('farmUnlock').textContent=locked?'🔓 Buka '+farmLandPrice(i)+' 🪙':'🔓 Lahan terbuka';
 drawFarmWorld();
}
function farmNotify(msg){$('farmPlayerStatus').textContent=msg;farmToast('Informasi',msg,'ℹ️');}
function farmSelectPlot(i){state.farmSelectedPlot=i;const p=farmPlotCenters[i];if(i<state.farmUnlockedPlots)state.farmTarget={x:p.x,y:p.y+68};updateFarm();if(i>=state.farmUnlockedPlots)farmToast('Lahan terkunci','Kumpulkan koin dari penjualan panen untuk membeli lahan ini. Harga '+farmLandPrice(i)+' koin.','🔒');save();}
function farmAct(action){
 const i=state.farmSelectedPlot,plot=state.farmPlots[i];
 if(i>=state.farmUnlockedPlots)return farmNotify('Lahan ini masih terkunci. Beli terlebih dahulu.');
 if(action==='plant'){
   if(plot.crop)return farmNotify('Petak ini sudah ditanami.');if(!(state.farmSeeds[state.farmSelectedCrop]>0))return farmNotify('Benih habis. Kunjungi Toko Benih.');
   state.farmSeeds[state.farmSelectedCrop]--;state.farmPlots[i]={crop:state.farmSelectedCrop,stage:1,watered:false,fertilized:false,plantedAt:Date.now()};reward(2,0);farmNotify('Benih '+farmCrops[state.farmSelectedCrop].name+' berhasil ditanam.');farmToast('Penanaman berhasil','Kamu menanam '+farmCrops[state.farmSelectedCrop].name+'. +2 XP','🌱');
 }else if(action==='water'){
   if(!plot.crop||plot.watered)return;plot.watered=true;plot.plantedAt=Date.now();plot.stage=2;reward(3,0);farmNotify('Tanaman disiram. Tunggu hingga siap panen.');farmToast('Penyiraman berhasil','Tanaman mendapat air. +3 XP','💧');
 }else if(action==='fertilize'){
   if(!plot.crop||plot.fertilized||state.coins<4)return;state.coins-=4;plot.fertilized=true;farmNotify('Pupuk diberikan. Pertumbuhan lebih cepat.');farmToast('Pemupukan berhasil','Biaya 4 koin. Pertumbuhan tanaman lebih cepat.','🧪');
 }else if(action==='spray'){
   if(!plot.pest)return farmNotify('Tidak ada hama atau penyakit pada petak ini.');if((plot.pestSeverity||1)<=FARM_PEST_THRESHOLD)return farmNotify('Intensitas serangan '+(plot.pestSeverity||1)+'/5 belum melebihi ambang batas '+FARM_PEST_THRESHOLD+'/5. Pantau populasi/intensitas terlebih dahulu; penyemprotan belum dianjurkan.');if(!window.confirm('Pengingat PHT: pastikan populasi/intensitas serangan benar-benar MELEBIHI ambang batas (lebih dari '+FARM_PEST_THRESHOLD+'/5). Apakah hasil pengamatan sudah memenuhi ambang batas dan penyemprotan diperlukan?'))return;if(!(state.farmPesticides>0)){farmNotify('Stok pestisida habis. Beli pestisida di Toko Benih.');openFarmDialog('shop');return;}state.farmPesticides--;plot.pest=false;plot.pestType=null;plot.pestChecked=true;reward(4,0);farmToast('Penyemprotan berhasil','Serangan berhasil dikendalikan. Sisa pestisida: '+state.farmPesticides+'. +4 XP','🧴');
 }else if(action==='harvest'){
   if(!farmPlotReady(plot))return farmNotify('Tanaman belum siap dipanen.');
   const crop=farmCrops[plot.crop];state.farmProduce[plot.crop]=(state.farmProduce[plot.crop]||0)+1;state.harvestCount++;reward(crop.xp,0);farmNotify('Panen '+crop.name+' berhasil! Hasil masuk inventaris.');farmToast('Selamat! Panen berhasil','Kamu memperoleh 1 '+crop.name+'. +'+crop.xp+' XP','🏆');
   state.farmPlots[i]={crop:null,stage:0,watered:false,fertilized:false,plantedAt:0};state.farmDay++;
 }
 updateFarm();save();
}
function unlockFarmPlot(){
 const i=state.farmUnlockedPlots,price=farmLandPrice(i);
 if(i>=farmPlotCenters.length)return farmToast('Semua lahan terbuka','Kamu sudah memiliki seluruh petak kebun.','🏡');
 if(state.coins<price)return farmToast('Koin belum cukup','Kamu membutuhkan '+price+' koin untuk membuka lahan berikutnya.','🪙');
 state.coins-=price;state.farmUnlockedPlots++;state.farmSelectedPlot=i;save();updateFarm();
 farmToast('Selamat! Lahan baru terbuka','Petak '+(i+1)+' berhasil dibeli seharga '+price+' koin. Terus kembangkan kebunmu!','🎊');
}
function openFarmDialog(kind){
 const title=$('farmDialogTitle'),body=$('farmDialogBody');let content='';
 if(kind==='shop'){
  title.textContent='🏪 Toko Benih';
  content='<p class="farm-dialog-note">Pilih benih untuk dibeli. Harga menggunakan koin permainan.</p><div class="farm-shop-list">'+Object.entries(farmCrops).map(([id,c])=>'<div class="farm-shop-item"><span>'+c.emoji+' <b>'+c.name+'</b><br>Stok: '+(state.farmSeeds[id]||0)+' benih<br>Harga '+c.seedPrice+' koin • Jual '+c.sell+' koin</span><button data-buy-seed="'+id+'">Beli 1</button></div>').join('')+'</div><div class="farm-shop-item"><span>🧴 <b>Pestisida</b><br>Stok: '+state.farmPesticides+' botol<br>Harga 12 koin • Gunakan hanya jika intensitas serangan melewati ambang batas</span><button data-buy-pesticide>Beli 1</button></div>';
 }else if(kind==='inventory'){
  title.textContent='🎒 Inventaris';content='<h4>Benih</h4><div class="farm-inventory-list">'+Object.entries(farmCrops).map(([id,c])=>'<div class="farm-inventory-item">'+c.emoji+' '+c.name+': <b>'+(state.farmSeeds[id]||0)+'</b></div>').join('')+'</div><h4>Perlengkapan</h4><div class="farm-inventory-list"><div class="farm-inventory-item">🧴 Pestisida: <b>'+(Number(state.farmPesticides)||0)+' botol</b></div></div><h4>Hasil panen</h4><div class="farm-inventory-list">'+Object.entries(farmCrops).map(([id,c])=>'<div class="farm-inventory-item">'+c.emoji+' '+c.name+': <b>'+(state.farmProduce[id]||0)+'</b></div>').join('')+'</div>';
 }else{
  title.textContent='🧺 Pasar Hasil Panen';content='<p class="farm-dialog-note">Jual hasil panen untuk mendapatkan koin.</p><div class="farm-shop-list">'+Object.entries(farmCrops).map(([id,c])=>'<div class="farm-shop-item"><span>'+c.emoji+' <b>'+c.name+'</b><br>Stok: '+(state.farmProduce[id]||0)+' • '+c.sell+' koin/buah</span><button data-sell-crop="'+id+'" '+(!(state.farmProduce[id]>0)?'disabled':'')+'>Jual 1</button></div>').join('')+'</div>';
 }
 body.innerHTML=content;$('farmDialog').classList.remove('hidden');
 body.querySelectorAll('[data-buy-seed]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.buySeed,c=farmCrops[id];if(state.coins<c.seedPrice){farmNotify('Koin belum cukup untuk membeli benih.');return;}state.coins-=c.seedPrice;state.farmSeeds[id]=(state.farmSeeds[id]||0)+1;state.farmSelectedCrop=id;save();updateFarm();farmToast('Pembelian berhasil','1 benih '+c.name+' dibeli. -'+c.seedPrice+' koin. Sisa stok: '+state.farmSeeds[id]+'.','🛍️');openFarmDialog('shop');}));
 body.querySelector('[data-buy-pesticide]')?.addEventListener('click',()=>{if(state.coins<12){farmNotify('Koin belum cukup. Pestisida membutuhkan 12 koin.');return;}state.coins-=12;state.farmPesticides++;save();updateFarm();farmToast('Pestisida dibeli','1 botol pestisida masuk inventaris. -12 koin.','🧴');openFarmDialog('shop');});
 body.querySelectorAll('[data-sell-crop]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.sellCrop;if(!(state.farmProduce[id]>0))return;state.farmProduce[id]--;reward(0,farmCrops[id].sell);save();updateFarm();farmToast('Penjualan berhasil','1 '+farmCrops[id].name+' terjual. +'+farmCrops[id].sell+' koin.','💰');openFarmDialog('market');}));
}
$('farmCanvas').addEventListener('click',e=>{
 const r=farmCanvas.getBoundingClientRect(),x=(e.clientX-r.left)*900/r.width,y=(e.clientY-r.top)*510/r.height;
 const hit=(arr)=>arr.find(a=>x>=a.x&&x<=a.x+a.w&&y>=a.y&&y<=a.y+a.h);
 const seed=hit(farmHit.seeds);if(seed){if(!(state.farmSeeds[seed.id]>0))return farmToast('Stok benih habis','Beli benih di Toko Benih.','🌱');state.farmSelectedCrop=seed.id;updateFarm();save();farmToast('Benih dipilih',farmCrops[seed.id].name+' siap ditanam.','🌱');return;}
 const action=hit(farmHit.actions);if(action){if(action.id==='unlock')unlockFarmPlot();else farmAct(action.id);return;}
 const building=hit(farmHit.buildings);if(building){openFarmDialog(building.id);return;}
 let nearest=-1,dist=Infinity;farmPlotCenters.forEach((p,i)=>{const d=Math.hypot(x-p.x,y-p.y);if(d<dist){dist=d;nearest=i;}});
 if(dist<94)farmSelectPlot(nearest);else if(y>65&&y<450){state.farmTarget={x:Math.max(20,Math.min(880,x)),y:Math.max(215,Math.min(440,y))};}
});
$('farmUnlock').addEventListener('click',unlockFarmPlot);$('farmPlant').addEventListener('click',()=>farmAct('plant'));$('farmWater').addEventListener('click',()=>farmAct('water'));$('farmFertilize').addEventListener('click',()=>farmAct('fertilize'));$('farmHarvest').addEventListener('click',()=>farmAct('harvest'));$('farmSpray')?.addEventListener('click',()=>farmAct('spray'));
$('farmShop').addEventListener('click',()=>openFarmDialog('shop'));$('farmInventory').addEventListener('click',()=>openFarmDialog('inventory'));$('farmMarket').addEventListener('click',()=>openFarmDialog('market'));
$('farmDialogClose').addEventListener('click',()=>$('farmDialog').classList.add('hidden'));
document.querySelectorAll('[data-farm-dir]').forEach(btn=>btn.addEventListener('click',()=>{const d=btn.dataset.farmDir,p=state.farmPlayer,delta={up:[0,-40],down:[0,40],left:[-40,0],right:[40,0]}[d];state.farmTarget={x:Math.max(20,Math.min(880,p.x+delta[0])),y:Math.max(45,Math.min(475,p.y+delta[1]))};}));
document.addEventListener('keydown',e=>{if(!['gameScreen'].some(id=>!$(id).classList.contains('hidden'))||$('farmPanel').classList.contains('hidden')||$('farmDialog')&&!$('farmDialog').classList.contains('hidden'))return;const map={ArrowUp:[0,-45],w:[0,-45],ArrowDown:[0,45],s:[0,45],ArrowLeft:[-45,0],a:[-45,0],ArrowRight:[45,0],d:[45,0]},v=map[e.key];if(v){e.preventDefault();const p=state.farmPlayer;state.farmTarget={x:Math.max(20,Math.min(880,p.x+v[0])),y:Math.max(45,Math.min(475,p.y+v[1]))};}});
/* Quiz */
const questionBank=[
{q:'Apa tujuan utama penyuluhan pertanian?',a:['Menggantikan seluruh keputusan petani','Meningkatkan pengetahuan, keterampilan, dan sikap petani','Menjual sarana produksi sebanyak-banyaknya','Mewajibkan satu teknologi untuk semua petani'],c:1,why:'Penyuluhan membantu petani meningkatkan kapasitas agar mampu mengambil keputusan secara mandiri.'},
{q:'Apa langkah awal ketika menemukan gejala serangan hama di lahan?',a:['Mengidentifikasi gejala dan organisme penyebab','Mencampur semua pestisida','Menaikkan dosis pupuk','Langsung memusnahkan seluruh tanaman'],c:0,why:'Pengamatan dan identifikasi menjadi dasar menentukan tindakan pengendalian yang tepat.'},
{q:'Apa kepanjangan PHT?',a:['Pengelolaan Hasil Tanaman','Pengamatan Harian Terpadu','Pengendalian Hama Terpadu','Program Hasil Tani'],c:2,why:'PHT adalah Pengendalian Hama Terpadu.'},
{q:'Mengapa petani perlu melakukan pemupukan berimbang?',a:['Agar pupuk digunakan sebanyak mungkin','Agar kebutuhan hara tanaman terpenuhi sesuai kondisi dan rekomendasi','Agar tidak perlu mengairi tanaman','Agar semua jenis tanah mendapat dosis sama'],c:1,why:'Pemupukan berimbang menyesuaikan kebutuhan hara, kondisi tanah, dan rekomendasi.'},
{q:'Dalam penyuluhan, metode demonstrasi bertujuan untuk…',a:['Memperlihatkan praktik atau cara kerja teknologi secara langsung','Menggantikan seluruh diskusi kelompok','Menguji hafalan istilah saja','Membatasi petani untuk bertanya'],c:0,why:'Demonstrasi memberi kesempatan sasaran melihat proses dan praktik penerapan teknologi.'},
{q:'Apa yang perlu diperhatikan saat memilih varietas padi untuk Tabela?',a:['Kesesuaian dengan kondisi setempat dan mutu benih','Warna kemasan benih saja','Harga paling mahal tanpa melihat mutu','Varietas yang sama wajib untuk semua lokasi'],c:0,why:'Varietas dipilih berdasarkan kesesuaian lokasi dan karakter yang dibutuhkan, serta benih bermutu.'},
{q:'Berapa lama benih direndam dan diperam dalam tahapan Tabela pada materi PM-AAS ini?',a:['2 jam','6 jam','12 jam','48 jam'],c:2,why:'Materi tahapan PM-AAS yang digunakan dalam game menyebut sekitar 12 jam.'},
{q:'Apa fungsi utama drum seeder?',a:['Memanen gabah','Menyalurkan benih untuk tanam benih langsung','Mengukur pH tanah','Menyemprotkan pestisida'],c:1,why:'Drum seeder membantu menempatkan benih secara langsung dan teratur di lahan.'},
{q:'Apa arti kondisi macak-macak pada pengelolaan air sawah?',a:['Tanah lembab tanpa genangan air tinggi','Sawah selalu tergenang dalam','Tanah sangat kering dan retak','Air mengalir deras sepanjang hari'],c:0,why:'Macak-macak adalah kondisi tanah lembab dengan air permukaan sangat tipis atau tanpa genangan.'},
{q:'Apa tujuan penggunaan pipa pemantau pada metode AWD?',a:['Mengukur tinggi tanaman','Memantau kondisi air tanah untuk membantu pengaturan pengairan','Menentukan varietas benih','Mengukur hasil panen'],c:1,why:'Pipa pemantau membantu melihat kondisi air dan menentukan waktu pengairan.'},
{q:'Pemupukan pada sistem PM-AAS sebaiknya mengacu pada…',a:['Perkiraan tanpa pengamatan','Hasil uji tanah atau rekomendasi spesifik lokasi','Dosis tertinggi yang tersedia','Kebiasaan lahan lain tanpa penyesuaian'],c:1,why:'Pemupukan mengikuti kebutuhan tanaman dan kondisi lahan berdasarkan rekomendasi.'},
{q:'Kapan herbisida pratumbuh dapat diaplikasikan pada tahapan persiapan lahan yang dijelaskan?',a:['30 hari setelah panen','Sekitar 3–5 hari sebelum tanam bila diperlukan','Saat bulir padi matang','Setiap hari setelah penyiraman'],c:1,why:'Materi menyebut aplikasi sekitar 3–5 hari sebelum tanam bila diperlukan dan sesuai petunjuk produk.'},
{q:'Apa tindakan tepat saat menemukan gejala OPT?',a:['Melakukan pemantauan dan identifikasi sebelum menentukan pengendalian','Langsung mencampur beberapa pestisida','Menyemprot tanpa membaca label','Membiarkan tanpa pengamatan'],c:0,why:'Pengendalian terpadu didasarkan pada pemantauan dan identifikasi kondisi di lapangan.'},
{q:'Apa manfaat memperbaiki inlet dan outlet sawah?',a:['Agar air dan pupuk mudah hilang','Membantu mengatur aliran air dan mengurangi kehilangan air','Agar pematang tidak perlu dirawat','Menggantikan fungsi benih'],c:1,why:'Saluran masuk dan keluar yang baik membantu pengelolaan air.'},
{q:'Apa alat yang digunakan untuk panen mekanis pada tahapan PM-AAS?',a:['Drum seeder','Rotari','Combine harvester','Pipa AWD'],c:2,why:'Combine harvester digunakan untuk melakukan panen secara mekanis.'},
{q:'Menurut materi PM-AAS ini, panen dilakukan saat sekitar berapa persen bulir telah matang?',a:['25–30%','50–60%','70–75%','85–90%'],c:3,why:'Materi yang diberikan menyebut panen mekanis saat tingkat kematangan bulir sekitar 85–90%.'},
{q:'Mengapa pematang sawah perlu diperbaiki sebelum tanam?',a:['Agar air dan pupuk tidak mudah hilang','Agar benih tidak perlu direndam','Agar gulma tumbuh lebih cepat','Agar tidak perlu pengaturan air'],c:0,why:'Pematang yang baik membantu menahan air dan mengurangi kehilangan pupuk.'},
{q:'Apa yang dimaksud tanam benih langsung (Tabela)?',a:['Memindahkan bibit dari persemaian','Menanam benih langsung di lahan','Menanam hanya dengan stek','Menanam setelah panen menggunakan combine'],c:1,why:'Tabela menempatkan benih langsung di lahan tanpa tahap pindah tanam bibit.'},
{q:'Bagaimana drone dapat dimanfaatkan dalam budidaya PM-AAS?',a:['Sebagai pengganti semua kegiatan penyuluhan','Membantu pemupukan pada skala lahan luas bila sesuai kebutuhan','Untuk menggantikan varietas benih','Untuk memperbaiki pematang'],c:1,why:'Materi menyebut drone sebagai opsi bantuan pemupukan pada skala lahan luas.'},
{q:'Apa langkah penting menjelang panen mekanis?',a:['Menggenangi sawah setinggi mungkin','Mengeringkan sawah agar mesin lebih mudah beroperasi','Menambah benih','Menutup saluran keluar permanen'],c:1,why:'Pengeringan menjelang panen membantu operasional mesin panen.'},
{q:'Dalam komunikasi penyuluhan, cara yang baik untuk memastikan petani memahami materi adalah…',a:['Mengajak diskusi dan memberi kesempatan bertanya','Membaca materi secepat mungkin','Menghindari pertanyaan','Hanya membagikan selebaran tanpa penjelasan'],c:0,why:'Komunikasi dua arah membantu penyuluh memeriksa pemahaman dan kebutuhan petani.'}
];
let questions=[];
function pickQuizQuestions(){const pool=[...questionBank];for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}questions=pool.slice(0,5);}
function renderQuestion(){const q=questions[state.questionIndex];$('questionCount').textContent=`Soal ${state.questionIndex+1} dari ${questions.length}`;$('questionText').textContent=q.q;$('quizFeedback').textContent='';$('nextQuestionButton').classList.add('hidden');$('answerList').innerHTML='';q.a.forEach((a,i)=>{const b=document.createElement('button');b.className='answer-option';b.textContent=String.fromCharCode(65+i)+'. '+a;b.addEventListener('click',()=>{const all=$('answerList').querySelectorAll('button');all.forEach(x=>x.disabled=true);if(i===q.c){b.classList.add('correct');$('quizFeedback').textContent='Benar! '+q.why;state.quizScore++;state.correctQuizCount++;reward(10,3);}else{b.classList.add('wrong');all[q.c].classList.add('correct');$('quizFeedback').textContent='Belum tepat. '+q.why;}$('nextQuestionButton').classList.remove('hidden');});$('answerList').appendChild(b);});}
$('nextQuestionButton').addEventListener('click',()=>{state.questionIndex++;if(state.questionIndex<questions.length){renderQuestion();}else{$('questionText').textContent=`Kuis selesai! Skor kamu ${state.quizScore} dari ${questions.length}.`;$('answerList').innerHTML='';$('quizFeedback').textContent='Terus belajar dan tingkatkan kemampuan penyuluhanmu!';$('nextQuestionButton').textContent='Ulangi kuis';$('nextQuestionButton').onclick=()=>{state.questionIndex=0;state.quizScore=0;pickQuizQuestions();$('nextQuestionButton').textContent='Soal berikutnya →';$('nextQuestionButton').onclick=null;renderQuestion();};}});
})();
