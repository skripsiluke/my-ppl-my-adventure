(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY = 'myPplMyAdventure.save.v1';
const TUTORIAL_KEY='myPplMyAdventure.tutorial.v1';
let mineMonster=null,mineNextMonsterAt=0,mineLastFrame=0,mineHitCooldown=0,mineToastTimer=0,mineRespawnQueue=[];
let mineCommonSpawnCount=0,mineBoss=null,mineBossWarningAt=0,mineBossNextAt=0,minePickaxeOwned=false,minePickaxeHitAt=0,mineTreasureChest=null;

const FIRST_LEVEL_XP=150, XP_PER_LEVEL=250;
function xpThreshold(level){return level<=1?0:FIRST_LEVEL_XP+(level-2)*XP_PER_LEVEL;}
function levelFromXP(xp){let level=1;while(xp>=xpThreshold(level+1))level++;return level;}
function levelProgress(xp){const level=levelFromXP(xp);return {level,progress:xp-xpThreshold(level),needed:level===1?FIRST_LEVEL_XP:XP_PER_LEVEL};}
const state = {name:'Penyuluh Muda',avatarIndex:0,xp:0,coins:0,missionDone:false,pakMissionRewarded:false,buMissionDone:false,buMissionRewarded:false,ketuaMissionDone:false,ketuaMissionRewarded:false,farmStage:0,questionIndex:0,quizScore:0,harvestCount:0,correctQuizCount:0,unlockedAchievements:[],achievementRewardsClaimed:[],highestLevelReached:1,missionFlags:{},pmaas:{stages:{},milestones:[],farmers:0,groups:0,xpEarned:0,drumSeederCompleted:false,adopterProgress:{}},player:{x:145,y:390},keys:{},analog:{x:0,y:0},interact:false,catOwned:false,catHintShown:false,catQuestNpcId:null,catFollower:{x:120,y:410},scene:'village',mineGold:0,mineNodes:[],returnPosition:{x:145,y:390},ranchMissionDone:false,palmGhostCaught:0,farmPlots:[],farmSeeds:{padi:3,jagung:2,cabai:1},farmProduce:{},farmSelectedPlot:0,farmSelectedCrop:'padi',farmPlayer:{x:450,y:430},farmTarget:null,farmDay:1,farmLastWeather:'Cerah',farmUnlockedPlots:1,farmPesticides:0,farmPesticideStarterGranted:false,bppCoffeeStep:0,bppCoffeeDone:false};
const screens=['homeScreen','menuScreen','gameScreen'];
function applyMineXpPenalty(amount){
  // XP utama adalah state.xp. Jika runtime tiba-tiba membaca 0 padahal
  // save terakhir masih memiliki XP positif, pulihkan baseline save dahulu.
  const current=Number(state.xp);
  if(!Number.isFinite(current)||current<0)state.xp=0;
  if(Number(state.xp)===0){
    try{
      const persisted=JSON.parse(localStorage.getItem(KEY)||'null');
      const savedXp=Number(persisted&&persisted.xp);
      if(Number.isFinite(savedXp)&&savedXp>0)state.xp=savedXp;
    }catch(e){}
  }
  state.xp=Math.max(0,Number(state.xp||0)-amount);
  // Simpan nilai XP yang sudah dikurangi sebelum memperbarui elemen UI.
  save();
  updateStats();
  const hud=document.querySelector('.game-heading .game-coin');
  if(hud)hud.textContent='⭐ '+state.xp+' XP';
  return state.xp;
}
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
    catHintShown:!!state.catHintShown,
    catQuestNpcId:state.catQuestNpcId,
    catFollower:state.catFollower,
    scene:state.scene||'village',mineGold:Number(state.mineGold)||0,mineNodes:Array.isArray(state.mineNodes)?state.mineNodes:[],returnPosition:state.returnPosition||{x:145,y:390},ranchMissionDone:!!state.ranchMissionDone,palmGhostCaught:Number(state.palmGhostCaught)||0,
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
  state.catHintShown=!!state.catHintShown;
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
  state.bppCoffeeStep=Math.max(0,Math.min(3,Number(state.bppCoffeeStep)||0));state.bppCoffeeDone=!!state.bppCoffeeDone;
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
 {id:'mastermission',icon:'🏅',name:'Pahlawan Sukamaju',desc:`Selesaikan seluruh ${missionInfo.length} misi Adventure`,check:()=>missionTotal()>=missionInfo.length},
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
function showMineBossVictory(){
 let overlay=document.getElementById('mineBossVictoryOverlay');
 if(!overlay){
  overlay=document.createElement('div');
  overlay.id='mineBossVictoryOverlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.style.cssText='position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(8,18,12,.78);backdrop-filter:blur(5px);';
  overlay.innerHTML='<div style="position:relative;overflow:hidden;width:min(520px,96vw);padding:28px 22px 24px;border:4px solid #ffe18a;border-radius:26px;background:linear-gradient(145deg,#245b36,#10291d);box-shadow:0 0 0 5px rgba(255,213,91,.22),0 20px 70px rgba(0,0,0,.65);color:#fff;text-align:center;font-family:Nunito,Arial,sans-serif;animation:mineVictoryPop .55s cubic-bezier(.2,1.5,.4,1) both"><div style="font-size:42px;line-height:1.2">🏆 ✨ 🏆</div><div style="color:#ffe18a;font-weight:900;letter-spacing:2px;font-size:14px;margin:8px 0">SELAMAT!</div><h2 style="font-size:clamp(23px,5vw,34px);line-height:1.12;margin:8px 0 12px;color:#fff;text-shadow:0 3px 0 #8c4e16">BOSS KELABANG KALAH!</h2><p style="font-size:16px;margin:0 0 18px">Kamu berhasil menaklukkan penjaga tambang emas!</p><div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin:18px 0"><div style="background:#17472b;border:2px solid #9de3a8;border-radius:15px;padding:13px 20px;min-width:125px"><div style="font-size:29px;font-weight:900;color:#ffe18a">+100</div><b>⭐ XP</b></div><div style="background:#17472b;border:2px solid #f4cf72;border-radius:15px;padding:13px 20px;min-width:125px"><div style="font-size:29px;font-weight:900;color:#ffe18a">+50</div><b>🪙 KOIN</b></div></div><p style="font-size:14px;color:#ffedbd;margin:0 0 18px">Peti harta karun menantimu di dalam tambang!</p><button id="mineBossVictoryContinue" type="button" style="border:0;border-radius:999px;padding:13px 30px;background:linear-gradient(#ffe88a,#e9a92d);color:#3b2608;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 #9a6417">LANJUTKAN PETUALANGAN</button></div>';
  document.body.appendChild(overlay);
  const style=document.createElement('style');style.textContent='@keyframes mineVictoryPop{0%{transform:scale(.55) translateY(30px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}';document.head.appendChild(style);
  overlay.querySelector('#mineBossVictoryContinue').addEventListener('click',()=>{overlay.style.display='none';});
 }
 overlay.style.display='flex';
 playSound('level');
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
{id:'bu',name:'Bu Rina',x:390,y:365,emoji:'👩‍🌾',role:'Anggota kelompok tani',kind:'mission'},
{id:'ketua',name:'Pak Ketua',x:760,y:690,emoji:'🧑‍🌾',role:'Ketua kelompok tani',kind:'mission'},
{id:'peternak',name:'Pak Asep',x:1385,y:485,emoji:'👨‍🌾',role:'Peternak Desa',kind:'mission'},
...extraMissions.map(m=>({...m,kind:'mission'})),
{id:'catcaretaker',name:'Penjaga Anak Kucing',x:930,y:600,emoji:'🐱',role:'Misi spesial • Adopsi kucing',kind:'special'}
];
// Misi adopsi kucing memiliki NPC dan lokasi tersendiri, tidak lagi menempel
// pada NPC misi reguler. catQuestNpcId lama dipertahankan hanya untuk kompatibilitas save.
if(state.catQuestNpcId!=='catcaretaker'){state.catQuestNpcId='catcaretaker';save();}
const buildings=[
{x:180,y:235,w:150,h:110,name:'Rumah Bu Rina',roof:'#a65f3e',wall:'#f1dfb7',door:'#6b986b'},
{x:830,y:170,w:170,h:125,name:'Balai Kelompok Tani',roof:'#9b5638',wall:'#f4e5bd',door:'#5d8c63'},
{x:1420,y:180,w:150,h:110,name:'Kios Pertanian',roof:'#b36c3e',wall:'#f5e6c7',door:'#638e68'},
{x:1450,y:420,w:190,h:105,name:'Koperasi Desa Merah Putih Sukamaju',type:'kopdes',roof:'#b9c4c8',wall:'#f0f1ed',door:'#a8322c'},
{x:1030,y:95,w:220,h:145,name:'BPP Kecamatan Sukasenang',type:'bpp',roof:'#4d8051',wall:'#e8efcf',door:'#477e50'}
];
const obstacles=[...buildings.map(b=>({x:b.x-5,y:b.y-15,w:b.w+10,h:b.h+20})),{x:990,y:720,w:600,h:280},
 // Pagar kandang, kandang ternak, kebun berpagar, dan pepohonan besar
 {x:1223,y:619,w:154,h:92},{x:1235,y:635,w:48,h:40},{x:1368,y:630,w:34,h:28},
 {x:45,y:200,w:120,h:75},{x:445,y:745,w:145,h:88},
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
 if(b.type==='kopdes'){
   // Koperasi Desa Merah Putih: long white facade, silver sheet roof and red rolling doors
   ctx.fillStyle='rgba(48,69,42,.22)';ctx.beginPath();ctx.ellipse(b.x+b.w/2,b.y+b.h+10,b.w*.62,13,0,0,Math.PI*2);ctx.fill();
   roundedRect(ctx,b.x-5,b.y+8,b.w+10,b.h-2,4,'#a9aaa4');
   ctx.fillStyle='#f1f2ee';ctx.fillRect(b.x,b.y+8,b.w,b.h-12);
   // broad corrugated metal canopy
   ctx.fillStyle='#87979c';ctx.beginPath();ctx.moveTo(b.x-13,b.y+9);ctx.lineTo(b.x+b.w/2,b.y-27);ctx.lineTo(b.x+b.w+13,b.y+9);ctx.closePath();ctx.fill();
   ctx.fillStyle='#c5d0d3';ctx.beginPath();ctx.moveTo(b.x-9,b.y+7);ctx.lineTo(b.x+b.w/2,b.y-23);ctx.lineTo(b.x+b.w+9,b.y+7);ctx.closePath();ctx.fill();
   ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1.4;for(let k=0;k<18;k++){const xx=b.x-5+k*(b.w+10)/17;ctx.beginPath();ctx.moveTo(xx,b.y+7);ctx.lineTo(b.x+b.w/2+(xx-(b.x+b.w/2))*.15,b.y-21);ctx.stroke();}
   // three red shutter bays and one wider loading bay
   const doorY=b.y+35,doorH=72,doorW=36;
   for(let k=0;k<3;k++){const dx=b.x+8+k*43;ctx.fillStyle='#a52e2b';ctx.fillRect(dx,doorY,doorW,doorH);ctx.strokeStyle='#7f2523';ctx.lineWidth=1;ctx.strokeRect(dx,doorY,doorW,doorH);ctx.strokeStyle='rgba(255,205,190,.32)';for(let yy=doorY+7;yy<doorY+doorH;yy+=7){ctx.beginPath();ctx.moveTo(dx+2,yy);ctx.lineTo(dx+doorW-2,yy);ctx.stroke();}}
   ctx.fillStyle='#d7d9d5';ctx.fillRect(b.x+142,doorY-4,60,76);ctx.fillStyle='#3b2928';ctx.fillRect(b.x+150,doorY+3,44,69);
   // sign panel
   ctx.fillStyle='#e5e8e5';ctx.fillRect(b.x+112,b.y+14,86,20);ctx.fillStyle='#a52e2b';ctx.font='bold 7px Nunito';ctx.textAlign='center';ctx.fillText('KOPERASI DESA',b.x+155,b.y+23);ctx.font='bold 7px Nunito';ctx.fillText('MERAH PUTIH',b.x+155,b.y+31);
   ctx.fillStyle='#fff';ctx.font='bold 8px Nunito';ctx.textAlign='center';ctx.fillText('SUKAMAJU',b.x+b.w/2,b.y+b.h+23);
   return;
 }
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
 if(state.scene==='mine'){drawMine(t);return;}if(state.scene==='palm'){drawPalm(t);return;}if(state.scene==='bpp'){drawBpp(t);updateBppBackButton();return;}if(state.scene==='pc'){drawBppPc(t);updateBppBackButton();return;}if(state.scene==='coffee'){drawBppCoffee(t);updateBppBackButton();return;}
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
 // Jalan setapak menuju pintu BPP, tersambung dengan jalan desa.
 ctx.save();ctx.lineCap='round';ctx.strokeStyle='#b18b5d';ctx.lineWidth=54;ctx.beginPath();ctx.moveTo(1140,258);ctx.quadraticCurveTo(1125,390,1140,525);ctx.stroke();
 ctx.strokeStyle='#d9bd8b';ctx.lineWidth=44;ctx.beginPath();ctx.moveTo(1140,258);ctx.quadraticCurveTo(1125,390,1140,525);ctx.stroke();ctx.restore();
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
 roundedRect(ctx,112,650,446,252,16,'#806344');roundedRect(ctx,123,661,424,230,11,'#c6a36a');
 ctx.fillStyle='#547c3f';ctx.font='bold 18px Nunito';ctx.textAlign='left';ctx.fillText('LAHAN DEMONSTRASI',145,691);
 for(let row=0;row<3;row++){ctx.strokeStyle='#8b6945';ctx.lineWidth=17;ctx.beginPath();ctx.moveTo(150,735+row*48);ctx.lineTo(520,735+row*48);ctx.stroke();for(let x=170;x<510;x+=43){ctx.strokeStyle='#4d8d42';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,740+row*48);ctx.lineTo(x-5,726+row*48);ctx.moveTo(x,740+row*48);ctx.lineTo(x+6,726+row*48);ctx.stroke();ctx.fillStyle='#8fc65a';ctx.beginPath();ctx.arc(x,726+row*48,5,0,Math.PI*2);ctx.fill();}}
 // small fences around plots and houses
 ctx.strokeStyle='#e7d4a9';ctx.lineWidth=6;for(let x=105;x<565;x+=42){ctx.beginPath();ctx.moveTo(x,635);ctx.lineTo(x,649);ctx.stroke();}ctx.beginPath();ctx.moveTo(105,642);ctx.lineTo(565,642);ctx.stroke();
 // stepping stones near village paths
 for(let i=0;i<8;i++){ctx.fillStyle='#c9c2a6';ctx.beginPath();ctx.ellipse(800+i*28,615+(i%2)*5,10,6,.15,0,Math.PI*2);ctx.fill();}
 buildings.forEach(drawHouse);
 // Identitas kantor BPP pada fasad depan.
 ctx.fillStyle='#f5f3dc';roundedRect(ctx,1080,112,120,34,5,'#f5f3dc');
 ctx.fillStyle='#245b36';ctx.textAlign='center';ctx.font='bold 11px Nunito';ctx.fillText('BPP KECAMATAN',1140,126);ctx.fillText('SUKASENANG',1140,139);
 ctx.fillStyle='#f8e6a7';roundedRect(ctx,1102,250,76,22,7,'#f8e6a7');ctx.fillStyle='#315b39';ctx.font='bold 10px Nunito';ctx.fillText('MASUK  E',1140,265);

 // signboards and lamp posts
 ctx.fillStyle='#68482e';ctx.fillRect(908,118,5,34);roundedRect(ctx,855,108,112,25,5,'#f2dfad');ctx.fillStyle='#315b39';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('BALAI KELOMPOK TANI',911,125);
 ctx.fillStyle='#68482e';ctx.fillRect(1590,495,5,60);ctx.fillStyle='#f7e4a8';ctx.beginPath();ctx.arc(1592,490,10,0,Math.PI*2);ctx.fill();
 // Peternakan desa: kandang kecil di pojok tenggara persimpangan jalan desa dan jalan setapak BPP.
 // Diletakkan di area kosong, terpisah dari jalur pejalan kaki dan lahan tanaman.
 ctx.save();ctx.translate(1300,665);ctx.scale(.52,.52);ctx.translate(-1190,-375);
 roundedRect(ctx,1042,286,296,176,12,'#d8c18d');
 ctx.strokeStyle='#8b6039';ctx.lineWidth=7;ctx.strokeRect(1050,295,280,165);
 for(let fx=1062;fx<1325;fx+=28){ctx.beginPath();ctx.moveTo(fx,295);ctx.lineTo(fx,460);ctx.stroke();}
 ctx.fillStyle='#a85e3c';ctx.fillRect(1070,320,94,82);ctx.fillStyle='#f0d9a7';ctx.fillRect(1078,330,78,64);
 ctx.fillStyle='#8e4f34';ctx.fillRect(1220,320,94,82);ctx.fillStyle='#f0d9a7';ctx.fillRect(1228,330,78,64);
 ctx.fillStyle='#6e472e';ctx.font='bold 14px Nunito';ctx.textAlign='center';ctx.fillText('KANDANG TERNAK',1190,446);
 // Ilustrasi ternak sederhana di dalam kandang.
 [[1105,364,'#f4eee0'],[1257,364,'#f1eee4']].forEach(([ax,ay,col],i)=>{ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(ax,ay,23,15,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(ax+17,ay-9,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#544337';ctx.fillRect(ax-12,ay+10,4,13);ctx.fillRect(ax+8,ay+10,4,13);ctx.fillStyle='#4a392d';ctx.beginPath();ctx.arc(ax+20,ay-11,1.5,0,Math.PI*2);ctx.fill();if(i===0){ctx.strokeStyle='#6b4d35';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ax+13,ay-17);ctx.lineTo(ax+8,ay-25);ctx.moveTo(ax+22,ay-17);ctx.lineTo(ax+28,ay-25);ctx.stroke();}});
 roundedRect(ctx,1340,320,58,36,5,'#b68a4e');ctx.fillStyle='#e4c17b';ctx.fillRect(1345,325,48,25);ctx.font='bold 11px Nunito';ctx.fillStyle='#65472d';ctx.fillText('PAKAN',1369,340);
 ctx.restore();
 // Mulut tambang emas dengan papan petunjuk dan jalur masuk.
 // Mulut tambang dipindahkan ke area kosong di sisi jalan, jauh dari lahan demonstrasi.
 ctx.fillStyle='#705039';ctx.beginPath();ctx.ellipse(500,450,48,32,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#241f1b';ctx.beginPath();ctx.ellipse(500,446,35,23,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#9a7046';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(465,448);ctx.lineTo(465,428);ctx.lineTo(535,428);ctx.lineTo(535,448);ctx.stroke();
 ctx.fillStyle='#f1d38d';ctx.fillRect(452,386,96,24);ctx.fillStyle='#5b3d25';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('TAMBANG EMAS',500,402);
 const mineUnlocked=levelProgress(state.xp).level>=2;const mineSign=mineUnlocked?'Masuk: E':'🔒 TERKUNCI • LEVEL 2';ctx.save();ctx.font='bold 12px Nunito';ctx.textAlign='center';const signW=mineUnlocked?82:154;roundedRect(ctx,500-signW/2,482,signW,25,9,mineUnlocked?'rgba(42,91,48,.94)':'rgba(255,246,218,.97)');ctx.fillStyle=mineUnlocked?'#fff4c7':'#422b18';ctx.fillText(mineSign,500,499);ctx.restore();
 // decorative shrubs, flower beds and trees
 [[90,160],[450,130],[900,170],[990,250],[1700,220],[850,850],[650,960],[1750,850],[920,1080],[1660,1120],[500,920],[1320,1110],[1770,390]].forEach(p=>drawTree(...p));
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
 roundedRect(ctx,1632,1008,58,38,5,'#253c2b');ctx.fillStyle='#f0d7a1';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('KEBUN SAWIT',1660,1022);ctx.font='bold 10px Nunito';ctx.fillText(levelProgress(state.xp).level>=5?'MASUK':'🔒 LEVEL 5',1660,1038);
 // area labels with subtle backing
 ctx.textAlign='left';ctx.font='900 20px Nunito';ctx.fillStyle='rgba(255,255,235,.72)';ctx.fillText('DESA SUKAMAJU',43,54);ctx.fillStyle='#315c37';ctx.fillText('DESA SUKAMAJU',40,51);
 ctx.font='bold 16px Nunito';ctx.fillStyle='#315c37';ctx.fillText('AREA PERSAWAHAN',1190,690);ctx.textAlign='center';ctx.font='900 17px Nunito';ctx.lineWidth=4;ctx.strokeStyle='rgba(95,70,43,.48)';ctx.strokeText('JALAN DESA',900,575);ctx.fillStyle='#fff4d8';ctx.fillText('JALAN DESA',900,575);
 // Karakter NPC digambar solid dengan badan, tangan, kaki, dan pakaian.
 npcs.forEach((n,i)=>{const done=missionDone(n.id);ctx.font='bold 12px Nunito';drawFarmer(n.x,n.y,{shirt:['#3979b9','#bd6686','#3f8a57','#c58a38'][i%4],pants:'#394d43',hat:['#d6a34d','#d8b86d','#6b8e57'][i%3]},i*.8,false);const labelW=Math.max(76,Math.min(132,ctx.measureText(n.name).width+22));roundedRect(ctx,n.x-labelW/2,n.y+28,labelW,23,10,'rgba(255,255,245,.98)');ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillStyle='#23452c';ctx.fillText(n.name,n.x,n.y+44);if(n.kind==='mission'||n.kind==='special'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(n.x,n.y-43,14,0,Math.PI*2);ctx.fill();ctx.strokeStyle=done?'#23834b':'#d88b1f';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=done?'#23834b':'#d88b1f';ctx.font='bold 17px Nunito';ctx.fillText(n.kind==='special'?(state.catOwned?'✓':(state.catHintShown?'!':'🐾')):(done?'✓':'!'),n.x,n.y-37);if(n.id==='catcaretaker'&&state.catHintShown&&!state.catOwned){ctx.strokeStyle='rgba(255,211,76,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(n.x,n.y-43,20,0,Math.PI*2);ctx.stroke();}}});
 if(state.catOwned)drawPetCat(state.catFollower.x,state.catFollower.y,t);
 // Pemain: badan penuh, dua kaki dan animasi langkah saat bergerak.
 const moving=!!(state.keys.ArrowRight||state.keys.ArrowLeft||state.keys.ArrowUp||state.keys.ArrowDown||state.keys.w||state.keys.a||state.keys.s||state.keys.d||Math.hypot(state.analog.x,state.analog.y)>.12);
 drawFarmer(state.player.x,state.player.y,{shirt:'#287b49',pants:'#344b3a',hat:'#d8ad4e'},t/105,moving,true);
 const near=nearestNpc();
  if(Math.hypot(1140-state.player.x,260-state.player.y)<105){const mob=window.matchMedia('(max-width: 760px)').matches;const label=mob?'Tap INTERAKSI: Masuk BPP':'Tekan E: Masuk BPP';ctx.save();ctx.font='bold 11px Nunito';ctx.textAlign='center';const labelW=Math.max(154,ctx.measureText(label).width+24);roundedRect(ctx,state.player.x-labelW/2,state.player.y-88,labelW,27,10,'rgba(255,255,245,.98)');ctx.fillStyle='#174d32';ctx.fillText(label,state.player.x,state.player.y-70);ctx.restore();}
  if(Math.hypot(500-state.player.x,450-state.player.y)<90){const mob=window.matchMedia('(max-width: 760px)').matches;const mineUnlocked=levelProgress(state.xp).level>=2;const label=mineUnlocked?(mob?'Tap INTERAKSI: Tambang':'Tekan E: Masuk Tambang'):'🔒 TAMBANG • LEVEL 2';ctx.save();ctx.font='bold 11px Nunito';ctx.textAlign='center';const labelW=Math.min(210,Math.max(154,ctx.measureText(label).width+24));roundedRect(ctx,state.player.x-labelW/2,state.player.y-91,labelW,28,12,'rgba(255,255,245,.98)');ctx.fillStyle='#174d32';ctx.fillText(label,state.player.x,state.player.y-73);ctx.restore();}else if(Math.hypot(1660-state.player.x,1030-state.player.y)<125){const mob=window.matchMedia('(max-width: 760px)').matches;const unlocked=levelProgress(state.xp).level>=5;const label=unlocked?(mob?'Tap INTERAKSI: Kebun Sawit':'Tekan E: Kebun Sawit'):(mob?'Terkunci: Butuh Level 5':'Terkunci: Butuh Level 5');ctx.font='bold 12px Nunito';roundedRect(ctx,state.player.x-94,state.player.y-91,188,28,12,'rgba(255,255,245,.98)');ctx.fillStyle='#174d32';ctx.textAlign='center';ctx.fillText(label,state.player.x,state.player.y-73);}else if(near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<88){const mobile=window.matchMedia('(max-width: 760px)').matches;const hint=mobile?'Tap tombol INTERAKSI':'Tekan E untuk bicara';ctx.font='bold 12px Nunito';const bw=Math.max(138,ctx.measureText(hint).width+24),bx=Math.max(8,Math.min(WORLD.w-bw-8,state.player.x-bw/2)),by=state.player.y-91;roundedRect(ctx,bx,by,bw,28,12,'rgba(255,255,245,.98)');ctx.strokeStyle='#d8e6ce';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#174d32';ctx.textAlign='center';ctx.fillText(hint,bx+bw/2,by+18);}
 ctx.restore();
 $('worldLocation').textContent=(near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<100?'📍 '+near.name:'📍 Desa Sukamaju')+(state.catOwned?' • 🐈 Kucing menemani':'');
 const hintEl=$('canvasHint');if(hintEl)hintEl.textContent=window.matchMedia('(max-width: 760px)').matches?'Gunakan tombol arah untuk bergerak • Dekati warga lalu tap INTERAKSI':'Gunakan WASD / tombol panah untuk bergerak • Dekati warga lalu tekan E atau Spasi untuk bicara';
 const next=nextMission();$('worldObjective').textContent=next?'🎯 '+next.text:'⭐ Semua misi desa selesai';
}
let palmGhost=null,palmNextGhostAt=0,palmGhostToastTimer=0;
const palmGhostTypes=['pocong','kuntilanak','tuyul','genderuwo'];
function showPalmToast(message){
 const el=$('achievementToast');if(!el)return;
 el.textContent=message;el.classList.add('show');
 if(palmGhostToastTimer)clearTimeout(palmGhostToastTimer);
 palmGhostToastTimer=setTimeout(()=>el.classList.remove('show'),4200);
}
function spawnPalmGhost(now){
 const type=palmGhostTypes[Math.floor(Math.random()*palmGhostTypes.length)];
 const side=Math.random()<.5?-1:1;
 palmGhost={type,x:canvas.width*(side<0?.18:.82),y:canvas.height*(.22+Math.random()*.42),phase:Math.random()*Math.PI*2,spawnAt:now};
 showPalmToast('👻 Ada '+type.toUpperCase()+'! Kejar dan dekati hantunya, lalu tekan E / INTERAKSI untuk menangkap dan mendapat 2 koin!');
}
function drawPalmGhost(g,t){
 const bob=Math.sin(t/260+g.phase)*8, sway=Math.sin(t/430+g.phase)*5;
 const x=g.x+sway,y=g.y+bob;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=.72;ctx.shadowColor='#dfffee';ctx.shadowBlur=22;
 if(g.type==='pocong'){
  ctx.fillStyle='#e7e8dc';ctx.beginPath();ctx.moveTo(-15,-25);ctx.quadraticCurveTo(-21,-7,-13,20);ctx.lineTo(-9,32);ctx.lineTo(0,25);ctx.lineTo(9,32);ctx.lineTo(14,18);ctx.quadraticCurveTo(21,-7,14,-25);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c5c8bc';ctx.fillRect(-13,-28,26,7);ctx.fillRect(-11,-2,22,5);ctx.fillRect(-9,13,18,5);
  ctx.fillStyle='#251d20';ctx.beginPath();ctx.ellipse(-5,-13,2.5,4,0,0,Math.PI*2);ctx.ellipse(5,-13,2.5,4,0,0,Math.PI*2);ctx.fill();
 }else if(g.type==='kuntilanak'){
  ctx.fillStyle='#e9e7df';ctx.beginPath();ctx.ellipse(0,-20,14,18,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-14,-6);ctx.quadraticCurveTo(-25,7,-18,35);ctx.quadraticCurveTo(-8,23,0,38);ctx.quadraticCurveTo(10,21,20,35);ctx.quadraticCurveTo(25,8,14,-6);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#292326';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,-5);ctx.lineTo(-4,-2);ctx.moveTo(9,-5);ctx.lineTo(4,-2);ctx.stroke();
  ctx.fillStyle='#7d2732';ctx.beginPath();ctx.ellipse(0,1,4,7,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d8d5ca';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,-12);ctx.quadraticCurveTo(-34,4,-24,28);ctx.moveTo(12,-12);ctx.quadraticCurveTo(34,4,24,28);ctx.stroke();
 }else if(g.type==='tuyul'){
  ctx.fillStyle='#9da98c';ctx.beginPath();ctx.ellipse(0,-13,14,18,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-12,-25);ctx.lineTo(-23,-35);ctx.lineTo(-19,-17);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(12,-25);ctx.lineTo(23,-35);ctx.lineTo(19,-17);ctx.closePath();ctx.fill();
  ctx.fillStyle='#211c1a';ctx.beginPath();ctx.ellipse(-5,-15,3,5,0,0,Math.PI*2);ctx.ellipse(5,-15,3,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#b7b99e';ctx.beginPath();ctx.ellipse(0,12,13,15,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#aeb99b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-8,22);ctx.lineTo(-14,34);ctx.moveTo(8,22);ctx.lineTo(14,34);ctx.stroke();
 }else{
  ctx.fillStyle='#343c35';ctx.beginPath();ctx.ellipse(0,-13,20,27,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-16,-29);ctx.lineTo(-26,-43);ctx.lineTo(-22,-16);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(16,-29);ctx.lineTo(26,-43);ctx.lineTo(22,-16);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f1c66d';ctx.beginPath();ctx.ellipse(-7,-17,4,6,0,0,Math.PI*2);ctx.ellipse(7,-17,4,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#171a17';ctx.beginPath();ctx.ellipse(0,2,8,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3b443b';ctx.beginPath();ctx.ellipse(0,17,22,18,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
 ctx.save();ctx.font='bold 10px Nunito';ctx.textAlign='center';ctx.fillStyle='#f4f2db';ctx.shadowColor='#000';ctx.shadowBlur=5;ctx.fillText(g.type.toUpperCase(),x,y+48);ctx.restore();
}
function enterPalm(){
 if(levelProgress(state.xp).level<5){showPalmToast('🔒 Kebun Sawit masih terkunci! Capai Level 5 — Penyuluh Pertanian Ahli Pertama untuk membukanya.');return;}
 state.returnPosition={x:state.player.x,y:state.player.y};state.scene='palm';
 state.player={x:canvas.width*.5,y:canvas.height-135};palmGhost=null;palmNextGhostAt=performance.now()+1800;save();showPalmToast('MISI KEBUN SAWIT: Kejar dan tangkap hantu yang muncul. Dekati hantu lalu tekan E / INTERAKSI untuk mendapat 2 koin!');
}
function palmInteract(){
 const exit={x:canvas.width*.5,y:canvas.height-90};
 const exitDistance=Math.hypot(state.player.x-exit.x,state.player.y-exit.y);
 const ghostDistance=palmGhost?Math.hypot(state.player.x-palmGhost.x,state.player.y-palmGhost.y):Infinity;
 if(palmGhost&&ghostDistance<118){
  const caught=palmGhost.type;
  palmGhost=null;
  state.palmGhostCaught=(Number(state.palmGhostCaught)||0)+1;
  reward(0,2);
  save();
  showPalmToast('🎉 Berhasil menangkap '+caught+'! +2 koin. Total hantu tertangkap: '+state.palmGhostCaught+'.');
  palmNextGhostAt=performance.now()+4500;
  return;
 }
 if(exitDistance<100){
  state.scene='village';state.player={...state.returnPosition};save();return;
 }
 if(palmGhost){
  showPalmToast('👻 Kejar '+palmGhost.type+'! Dekati sampai muncul petunjuk tangkap, lalu tekan E / INTERAKSI.');
  return;
 }
 showPalmToast('🌫️ Belum ada hantu. Tunggu sebentar, hantu akan muncul.');
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
 // Hantu bergantian muncul dengan bentuk berbeda; setiap kemunculan bisa dikejar.
 if(!palmGhost&&t>=palmNextGhostAt){
  spawnPalmGhost(t);
  palmNextGhostAt=t+9000+Math.random()*5000;
 }
 if(palmGhost){
  // Melayang perlahan menyilang, tidak terus mengikuti pemain.
  palmGhost.x+=Math.sin(t/700+palmGhost.phase)*.65;
  palmGhost.y+=Math.cos(t/900+palmGhost.phase)*.28;
  palmGhost.x=Math.max(55,Math.min(w-55,palmGhost.x));
  palmGhost.y=Math.max(90,Math.min(h-150,palmGhost.y));
  drawPalmGhost(palmGhost,t);
  const ghostDist=Math.hypot(state.player.x-palmGhost.x,state.player.y-palmGhost.y);
  if(ghostDist<112){
   const label=window.matchMedia('(max-width: 760px)').matches?'Dekat! Tap INTERAKSI untuk menangkap':'Dekat! Tekan E / Spasi untuk menangkap';
   ctx.save();ctx.font='bold 12px Nunito';const bw=Math.max(205,ctx.measureText(label).width+24),bx=Math.max(8,Math.min(w-bw-8,state.player.x-bw/2)),by=Math.max(8,state.player.y-102);
   roundedRect(ctx,bx,by,bw,30,12,'rgba(255,248,225,.96)');ctx.fillStyle='#263528';ctx.textAlign='center';ctx.fillText(label,bx+bw/2,by+19);ctx.restore();
  }
 }
 // entrance glow and exit sign
 ctx.fillStyle='rgba(225,210,145,.14)';ctx.beginPath();ctx.ellipse(w/2,h-82,80,45,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e6d4a4';ctx.font='bold 13px Nunito';ctx.textAlign='center';ctx.fillText('GERBANG KELUAR',w/2,h-28);
 drawFarmer(state.player.x,state.player.y,{shirt:'#287b49',pants:'#344b3a'},t/105,false,true);
 if(state.catOwned)drawPetCat(state.player.x-28,state.player.y+20,t);
 ctx.restore();
 $('worldLocation').textContent='🌴 Kebun Sawit • Hutan Sunyi';
 $('worldObjective').textContent='👻 Misi: tangkap hantu untuk +2 koin • Tertangkap: '+(state.palmGhostCaught||0);
 const hint=$('canvasHint');if(hint)hint.textContent=window.matchMedia('(max-width: 760px)').matches?'Gerakkan karakter, kejar hantu, lalu tap INTERAKSI saat dekat untuk +2 koin.':'Gerakkan karakter, kejar hantu, lalu tekan E / Spasi saat dekat untuk +2 koin.';
}
function drawMine(t=0){
 const w=canvas.width,h=canvas.height, mobile=window.matchMedia('(max-width: 760px)').matches;
 const dt=mineLastFrame?Math.min((t-mineLastFrame)/16,2):1;mineLastFrame=t;
 ctx.clearRect(0,0,w,h);ctx.save();
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#42342e');bg.addColorStop(.48,'#292526');bg.addColorStop(1,'#15191c');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Lapisan batu, stalaktit, dan cahaya obor.
 ctx.fillStyle='#594438';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(w,0);ctx.lineTo(w,112);ctx.quadraticCurveTo(w*.5,30,0,112);ctx.closePath();ctx.fill();
 for(let i=0;i<85;i++){const x=(i*137+29)%w,y=(i*83+37)%(h-95);ctx.fillStyle=i%2?'rgba(210,174,128,.13)':'rgba(0,0,0,.2)';ctx.beginPath();ctx.arc(x,y,2+(i%5),0,Math.PI*2);ctx.fill();}
 for(const x of [42,w-42]){ctx.fillStyle='#6d4b32';ctx.fillRect(x-5,92,10,46);ctx.fillStyle='#f6a53a';ctx.beginPath();ctx.moveTo(x,83);ctx.quadraticCurveTo(x+18,102,x,119);ctx.quadraticCurveTo(x-15,103,x,83);ctx.fill();ctx.fillStyle='rgba(255,170,52,.12)';ctx.beginPath();ctx.arc(x,105,48,0,Math.PI*2);ctx.fill();}
 // Rel dan bantalan kayu.
 ctx.strokeStyle='#9b7957';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,h-75);ctx.lineTo(w,h-75);ctx.moveTo(0,h-52);ctx.lineTo(w,h-52);ctx.stroke();
 for(let x=18;x<w;x+=48){ctx.strokeStyle='#76583f';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x,h-87);ctx.lineTo(x+18,h-39);ctx.stroke();}
 // Urat emas di dinding.
 [[100,180],[w-120,170],[w/2,125],[w-210,h-155],[180,h-180]].forEach(([x,y])=>{ctx.fillStyle='#71543c';ctx.beginPath();ctx.moveTo(x-38,y+18);ctx.lineTo(x-20,y-22);ctx.lineTo(x+18,y-29);ctx.lineTo(x+40,y+12);ctx.closePath();ctx.fill();ctx.fillStyle='#f4c542';ctx.beginPath();ctx.moveTo(x-17,y+8);ctx.lineTo(x-6,y-14);ctx.lineTo(x+5,y-4);ctx.lineTo(x+17,y-17);ctx.lineTo(x+23,y+10);ctx.closePath();ctx.fill();});
 // Hiasan peti harta, permata, dan tumpukan koin.
 function chest(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#70401f';ctx.fillRect(-28,-3,56,29);ctx.fillStyle='#a96a2d';ctx.beginPath();ctx.moveTo(-28,-3);ctx.lineTo(-23,-20);ctx.quadraticCurveTo(0,-37,23,-20);ctx.lineTo(28,-3);ctx.closePath();ctx.fill();ctx.strokeStyle='#e5b94f';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#f6d45e';ctx.fillRect(-4,-12,8,19);ctx.fillStyle='#f6e39b';ctx.fillRect(-23,5,46,5);ctx.restore();}
 chest(w*.16,h*.39,.83);chest(w*.82,h*.52,.9);chest(w*.37,h*.22,.58);
 for(const [x,y] of [[w*.1,h*.65],[w*.88,h*.28],[w*.7,h*.19]]){ctx.fillStyle='#41d5ce';ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x+9,y);ctx.lineTo(x,y+13);ctx.lineTo(x-9,y);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x-2,y-8,3,9);}
 // Titik emas yang habis ditambang akan terisi kembali otomatis setelah jeda singkat.
 if(!state.mineNodes.length)state.mineNodes=[[w*.28,h*.38],[w*.72,h*.34],[w*.5,h*.68],[w*.82,h*.7],[w*.18,h*.72]];
 for(let q=mineRespawnQueue.length-1;q>=0;q--){const item=mineRespawnQueue[q];if(t>=item.at){if(state.mineNodes[item.index]===null){let candidate=null;for(let attempt=0;attempt<30;attempt++){const x=75+Math.random()*(w-150),y=145+Math.random()*(h-285);const nearPlayer=Math.hypot(x-state.player.x,y-state.player.y)<115;const nearOther=state.mineNodes.some((pt,i)=>i!==item.index&&pt&&Math.hypot(x-pt[0],y-pt[1])<95);if(!nearPlayer&&!nearOther){candidate=[x,y];break;}}if(!candidate)candidate=[75+Math.random()*(w-150),145+Math.random()*(h-285)];state.mineNodes[item.index]=candidate;save();}mineRespawnQueue.splice(q,1);}}
 // Bongkahan emas yang dapat ditambang: emas batangan dan koin terlihat jelas.
 const spots=state.mineNodes;
 spots.forEach((pt,i)=>{if(pt===null)return;const [x,y]=pt;ctx.fillStyle='#47382e';ctx.beginPath();ctx.ellipse(x,y+8,35,23,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(x-8,y-4);ctx.rotate(-.12);ctx.fillStyle='#d99b20';ctx.beginPath();ctx.moveTo(-17,-7);ctx.lineTo(12,-7);ctx.lineTo(17,5);ctx.lineTo(-12,5);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffe58a';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f7c843';ctx.beginPath();ctx.ellipse(19,10,8,5,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0a5';ctx.stroke();ctx.beginPath();ctx.ellipse(-22,12,7,4,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();ctx.fillStyle='#fff0a5';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('EMAS',x,y+42);});
 // Monster kelabang merah muncul berkala dan memburu pemain.
 if(!mineMonster&&!mineBoss&&mineCommonSpawnCount<5&&t>=mineNextMonsterAt){const edge=Math.floor(Math.random()*4);mineMonster={x:edge===0?28:edge===1?w-28:Math.random()*w,y:edge===2?95:edge===3?h-105:95+Math.random()*(h-210),phase:Math.random()*6.28};mineCommonSpawnCount++;mineNextMonsterAt=t+10500+Math.random()*6500;if(mineCommonSpawnCount===5){mineBossWarningAt=t+4500;const md=$('missionDescription');if(md)md.textContent='⚠️ AWAS! Ada sesuatu bergerak di lorong tambang... Boss Kelabang akan keluar!';}}
 if(!mineBoss&&!mineMonster&&mineCommonSpawnCount>=5&&mineBossWarningAt&&t>=mineBossWarningAt){mineBoss={x:w*.5,y:105,hp:100,maxHp:100,phase:0};mineBossWarningAt=0;const md=$('missionDescription');if(md)md.textContent='🚨 BOSS KELABANG MUNCUL! Cari dan ambil Kapak Tambang di dekat jalur masuk, lalu serang 20 kali!';}
 // Setelah jeda 30 detik, mulai gelombang baru: 5 kelabang biasa lalu boss berikutnya.
 if(!mineBoss&&!mineMonster&&mineCommonSpawnCount>=5&&!mineBossWarningAt&&mineBossNextAt&&t>=mineBossNextAt){mineCommonSpawnCount=0;mineBossNextAt=0;mineNextMonsterAt=t+1200;const md=$('missionDescription');if(md)md.textContent='⚠️ Gelombang baru dimulai! Lima kelabang biasa akan muncul sebelum Boss Kelabang berikutnya.';}
 const px=state.player.x,py=state.player.y;
 if(mineMonster){const dx=px-mineMonster.x,dy=py-mineMonster.y,dist=Math.hypot(dx,dy)||1;mineMonster.x+=dx/dist*1.18*dt;mineMonster.y+=dy/dist*1.18*dt;mineMonster.x=Math.max(25,Math.min(w-25,mineMonster.x));mineMonster.y=Math.max(90,Math.min(h-100,mineMonster.y));
   ctx.save();ctx.translate(mineMonster.x,mineMonster.y);ctx.rotate(Math.atan2(dy,dx));
   for(let i=8;i>=0;i--){const x=-i*10;ctx.fillStyle=i%2?'#a91420':'#d92731';ctx.beginPath();ctx.ellipse(x,Math.sin(t/100+i*.8)*3,8,12-i*.35,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff6b62';ctx.lineWidth=1.5;ctx.stroke();ctx.strokeStyle='#f3a39a';ctx.lineWidth=2;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(x,side*5);ctx.lineTo(x-5,side*14);ctx.stroke();}}
   ctx.fillStyle='#f04438';ctx.beginPath();ctx.arc(5,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe7b0';ctx.beginPath();ctx.arc(8,-4,2.3,0,Math.PI*2);ctx.arc(8,4,2.3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff8b78';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(9,-7);ctx.lineTo(17,-13);ctx.moveTo(9,7);ctx.lineTo(17,13);ctx.stroke();ctx.restore();
   if(dist<27&&t>=mineHitCooldown){
     // Penalti tabrakan tidak boleh mengubah atau mengganti objek input global.
     // Mengosongkan state.keys/analog di dalam loop dapat memutus pointer/joystick
     // yang masih aktif pada perangkat sentuh dan membuat kontrol terasa macet.
     mineMonster=null;mineNextMonsterAt=t+7000;mineHitCooldown=t+1800;
     applyMineXpPenalty(10);
     const push=48;state.player.x=Math.max(35,Math.min(w-35,state.player.x+(dx/dist)*push));state.player.y=Math.max(100,Math.min(h-105,state.player.y+(dy/dist)*push));
     const md=$('missionDescription');if(md)md.textContent='⚠️ Kamu terkena kelabang merah! XP berkurang 10. Kelabang menghilang sementara—kontrol tetap aktif, lanjutkan bergerak!';
   }
 }
 // Boss kelabang merah raksasa dan bar HP.
 if(mineBoss){if(!minePickaxeOwned&&Math.floor(t/3000)!==Math.floor((t-16)/3000)){const md=$('missionDescription');if(md)md.textContent='🚨 Boss Kelabang muncul! Ambil Kapak Tambang di dekat jalur masuk sebelum menyerang.';}const dx=px-mineBoss.x,dy=py-mineBoss.y,dist=Math.hypot(dx,dy)||1;mineBoss.x+=dx/dist*.72*dt;mineBoss.y+=dy/dist*.72*dt;mineBoss.x=Math.max(65,Math.min(w-65,mineBoss.x));mineBoss.y=Math.max(115,Math.min(h-150,mineBoss.y));ctx.save();ctx.translate(mineBoss.x,mineBoss.y);ctx.rotate(Math.atan2(dy,dx));for(let i=9;i>=0;i--){const x=-i*13;ctx.fillStyle=i%2?'#870d1b':'#e32632';ctx.beginPath();ctx.ellipse(x,Math.sin(t/130+i*.6)*4,13,19,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff8174';ctx.lineWidth=2;ctx.stroke();for(const side of [-1,1]){ctx.strokeStyle='#c91d2b';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,side*8);ctx.lineTo(x-8,side*25);ctx.stroke();}}ctx.fillStyle='#f04438';ctx.beginPath();ctx.arc(12,0,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff2a6';ctx.beginPath();ctx.arc(17,-7,4,0,Math.PI*2);ctx.arc(17,7,4,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='rgba(30,10,10,.85)';roundedRect(ctx,w/2-125,78,250,22,8,'rgba(35,12,12,.9)');ctx.fillStyle='#e22c35';roundedRect(ctx,w/2-121,82,242*(mineBoss.hp/mineBoss.maxHp),14,6,'#e22c35');ctx.fillStyle='#fff';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('BOSS KELABANG • '+mineBoss.hp+'/100 HP',w/2,70);if(dist<115){ctx.fillStyle='#fff5cf';ctx.font='bold 12px Nunito';ctx.fillText(mobile?'Dekati lalu tap INTERAKSI untuk memukul':'Dekati lalu tekan E / Spasi untuk memukul',w/2,h-112);}}
 if(mineBoss&&Math.hypot(px-mineBoss.x,py-mineBoss.y)<34&&t>=mineHitCooldown){mineHitCooldown=t+2000;applyMineXpPenalty(20);const md=$('missionDescription');if(md)md.textContent='💥 Boss Kelabang menyentuhmu! XP berkurang 20. Segera menjauh!';}
 // Kapak menjadi objek di dalam gua, dekat jalur awal pemain dan dapat dijangkau.
 const axeX=w*.28,axeY=h-185;
 if(!minePickaxeOwned){
   ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(axeX,axeY+18,29,9,0,0,Math.PI*2);ctx.fill();
   ctx.lineCap='round';ctx.strokeStyle='#8b552b';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(axeX-13,axeY+13);ctx.lineTo(axeX+13,axeY-15);ctx.stroke();
   ctx.strokeStyle='#c8cdd2';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(axeX+7,axeY-20);ctx.lineTo(axeX+22,axeY-7);ctx.lineTo(axeX+12,axeY+1);ctx.stroke();
   ctx.fillStyle='#fff4cf';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('KAPAK TAMBANG',axeX,axeY+36);
   if(Math.hypot(px-axeX,py-axeY)<95){ctx.fillStyle='rgba(255,250,226,.96)';roundedRect(ctx,axeX-76,axeY-58,152,25,10,'rgba(255,250,226,.96)');ctx.fillStyle='#4b3825';ctx.fillText(mobile?'Tap INTERAKSI untuk mengambil':'Tekan E / Spasi untuk mengambil',axeX,axeY-41);}
   ctx.restore();
 }else{
   ctx.fillStyle='#bde8b8';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('⛏️ KAPAK DIMILIKI',axeX,axeY+35);
 }
 // Peti hadiah boss: muncul di lokasi boss dikalahkan dan dapat dibuka pemain.
 if(mineTreasureChest){const c=mineTreasureChest;ctx.save();ctx.shadowColor='rgba(255,205,55,.85)';ctx.shadowBlur=c.opened?8:24;ctx.fillStyle=c.opened?'#8a5a25':'#9b5b20';ctx.fillRect(c.x-27,c.y-2,54,28);ctx.fillStyle=c.opened?'#d79a36':'#c7832e';ctx.beginPath();ctx.moveTo(c.x-27,c.y-2);ctx.lineTo(c.x-23,c.y-22);ctx.quadraticCurveTo(c.x,c.y-39,c.x+23,c.y-22);ctx.lineTo(c.x+27,c.y-2);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffd95b';ctx.lineWidth=4;ctx.stroke();ctx.fillStyle='#ffe36b';ctx.fillRect(c.x-4,c.y-17,8,24);ctx.fillStyle='#fff4b0';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText(c.opened?'PETI TERBUKA':'BUKA PETI • HADIAH BOSS',c.x,c.y+43);if(!c.opened&&Math.hypot(px-c.x,py-c.y)<155){ctx.fillStyle='rgba(255,250,226,.97)';roundedRect(ctx,c.x-90,c.y-67,180,25,10,'rgba(255,250,226,.97)');ctx.fillStyle='#4b3825';ctx.fillText(mobile?'Tap INTERAKSI untuk membuka':'Tekan E / Spasi untuk membuka',c.x,c.y-50);}ctx.restore();}
 // Gerobak dan pintu keluar.
 ctx.fillStyle='#b98a54';ctx.beginPath();ctx.ellipse(w*.5,h-70,58,27,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#17191b';ctx.beginPath();ctx.ellipse(w*.5,h-69,43,19,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0c2';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('KELUAR • INTERAKSI',w*.5,h-24);
 ctx.fillStyle='#986a3f';ctx.fillRect(18,20,75,46);ctx.fillStyle='#d8b879';ctx.fillRect(25,26,61,30);ctx.fillStyle='#2d2520';ctx.beginPath();ctx.arc(33,70,8,0,Math.PI*2);ctx.arc(78,70,8,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff0c2';ctx.font='bold 15px Nunito';ctx.textAlign='left';ctx.fillText('TAMBANG EMAS BAWAH TANAH',110,43);ctx.font='bold 12px Nunito';ctx.fillText(mobile?'Dekati emas lalu tap INTERAKSI':'Dekati emas lalu tekan E / Spasi untuk menambang',110,64);
 drawFarmer(px,py,{shirt:'#287b49',pants:'#344b3a'},t/105,false,true);if(state.catOwned)drawPetCat(px-28,py+20,t);
 let nearestGold=null,nearestGoldDist=Infinity;spots.forEach(pt=>{if(!pt)return;const d=Math.hypot(px-pt[0],py-pt[1]);if(d<nearestGoldDist){nearestGoldDist=d;nearestGold=pt;}});
 if(nearestGold&&nearestGoldDist<90){const label=mobile?'Tap INTERAKSI untuk menambang':'Tekan E / Spasi untuk menambang';ctx.font='bold 12px Nunito';const bw=Math.max(190,ctx.measureText(label).width+24),bx=Math.max(8,Math.min(w-bw-8,px-bw/2)),by=py-90;roundedRect(ctx,bx,by,bw,28,12,'rgba(255,250,226,.96)');ctx.fillStyle='#4b3825';ctx.textAlign='center';ctx.fillText(label,bx+bw/2,by+18);}
 ctx.restore();$('worldLocation').textContent='⛏️ Tambang Emas • '+state.mineGold+' bongkah';const mineHud=document.querySelector('.game-heading .game-coin');if(mineHud)mineHud.textContent='⭐ '+state.xp+' XP';$('worldObjective').textContent='🎯 Tambang emas (batangan & koin), hindari kelabang merah! • Keluar untuk menukar emas';
 const hint=$('canvasHint');if(hint)hint.textContent=mobile?'Tambang emas batangan dan koin. Hindari kelabang merah (XP -10 jika terkena). Tap INTERAKSI saat dekat emas atau pintu keluar.':'Tambang emas batangan dan koin. Hindari kelabang merah (XP -10 jika terkena). Tekan E / Spasi saat dekat emas atau pintu keluar.';
}
function mineInteract(){
 const now=performance.now();
 if(mineTreasureChest&&!mineTreasureChest.opened&&Math.hypot(state.player.x-mineTreasureChest.x,state.player.y-mineTreasureChest.y)<155){mineTreasureChest.opened=true;const md=$('missionDescription');if(md)md.textContent='🎉 SELAMAT! Peti Harta Karun berhasil dibuka. Kamu telah mengalahkan Boss Kelabang dan hadiah +100 XP serta +50 koin sudah masuk. Terima kasih, penambang pemberani!';save();return;}
 const axe={x:canvas.width*.28,y:canvas.height-185};
 if(!minePickaxeOwned&&Math.hypot(state.player.x-axe.x,state.player.y-axe.y)<82){minePickaxeOwned=true;const md=$('missionDescription');if(md)md.textContent='✅ Kapak Tambang berhasil diambil! Simpan untuk melawan Boss Kelabang.';save();return;}
 if(mineBoss&&minePickaxeOwned&&Math.hypot(state.player.x-mineBoss.x,state.player.y-mineBoss.y)<118){if(now-minePickaxeHitAt<500){const md=$('missionDescription');if(md)md.textContent='⏳ Ayunkan kapak kembali setelah jeda singkat!';return;}minePickaxeHitAt=now;mineBoss.hp=Math.max(0,mineBoss.hp-5);const md=$('missionDescription');if(md)md.textContent='⛏️ Pukulan mengenai Boss Kelabang! Sisa HP: '+mineBoss.hp+'/100 ('+((100-mineBoss.hp)/5)+'/20 pukulan).';if(mineBoss.hp<=0){mineBoss=null;mineTreasureChest={x:Math.max(110,Math.min(canvas.width-110,state.player.x+70)),y:Math.max(170,Math.min(canvas.height-190,state.player.y-75)),opened:false};mineBossNextAt=now+30000;mineBossWarningAt=0;state.xp+=100;state.coins+=50;updateStats();checkAchievements();save();if(md)md.textContent='🎉 Boss Kelabang berhasil dikalahkan! +100 XP dan +50 koin. Gelombang berikutnya dimulai setelah 30 detik.';showMineBossVictory();}return;}
 const exit={x:canvas.width*.5,y:canvas.height-105};
 if(Math.hypot(state.player.x-exit.x,state.player.y-exit.y)<75){
   state.scene='village';state.player={...state.returnPosition};const mineHud=document.querySelector('.game-heading .game-coin');if(mineHud)mineHud.textContent='🪙 '+state.coins;
   if(state.mineGold>0){const mined=state.mineGold,coinsGained=mined*2;state.coins+=coinsGained;state.mineGold=0;updateStats();checkAchievements();save();$('missionDescription').textContent='Emas berhasil ditukar! Kamu memperoleh '+coinsGained+' koin. XP hasil tambang sudah ditambahkan langsung.';}
   save();return;
 }
 let idx=-1,best=Infinity;state.mineNodes.forEach((pt,i)=>{if(!pt)return;const d=Math.hypot(state.player.x-pt[0],state.player.y-pt[1]);if(d<best){best=d;idx=i;}});
 if(idx>=0&&best<75){state.mineNodes[idx]=null;mineRespawnQueue=mineRespawnQueue.filter(item=>item.index!==idx);mineRespawnQueue.push({index:idx,at:performance.now()+12000});state.mineGold++;state.xp+=3;updateStats();checkAchievements();save();$('worldLocation').textContent='⛏️ Emas terkumpul: '+state.mineGold+' • +3 XP langsung';const hud=document.querySelector('.game-heading .game-coin');if(hud)hud.textContent='⭐ '+state.xp+' XP';}
}

let bppPcWindow=null,bppPrintStep=0,bppPrintStartedAt=0;
let bppCoffeeDrag=null,bppCoffeeCupX=835;
let bppCoffeeStepRun=0,bppCoffeeAnimUntil=0;
function updateBppBackButton(){
 let btn=document.getElementById('bppSceneBack');
 if(!btn){
  btn=document.createElement('button');btn.id='bppSceneBack';btn.type='button';btn.textContent='← Kembali';
  btn.setAttribute('aria-label','Kembali ke kantor BPP');
  const wrap=canvas.closest('.canvas-wrap');if(wrap)wrap.appendChild(btn);
  btn.addEventListener('click',()=>{
   if(state.scene==='pc'||state.scene==='coffee'){closeBppPortal();state.scene='bpp';state.keys={};state.analog={x:0,y:0};bppPcWindow=null;save();drawWorld();}
  });
 }
 btn.classList.toggle('active',state.scene==='pc'||state.scene==='coffee');
 btn.classList.toggle('coffee-scene',state.scene==='coffee');
}
function enterBppCoffee(){
 state.scene='coffee';bppCoffeeStepRun=0;bppCoffeeAnimUntil=0;bppCoffeeDrag=null;bppCoffeeCupX=835;
 state.keys={};state.analog={x:0,y:0};save();drawWorld();
}
function enterBpp(){
 // Reset drawing surface when entering the office. This clears any stale
 // transform/clip state left by the outdoor map so the interior fills the
 // entire gameplay canvas instead of appearing as a split scene.
 canvas.width=960;canvas.height=600;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 state.returnPosition={x:state.player.x,y:state.player.y};state.scene='bpp';
 state.player={x:canvas.width*.5,y:canvas.height-125};save();
 $('worldLocation').textContent='🏢 BPP Kecamatan Sukasenang';
 $('worldObjective').textContent='Selamat datang di kantor BPP. Kunjungi meja kopi atau meja komputer.';
}
function drawBpp(t=0){
 const w=canvas.width,h=canvas.height;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#b8d99b';ctx.fillRect(0,0,w,h);ctx.save();
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#b8d99b');bg.addColorStop(1,'#79ad70');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Dinding kantor hijau dengan lis dan lantai keramik.
 ctx.fillStyle='#d9e9c6';ctx.fillRect(0,0,w,h*.68);ctx.fillStyle='#5d9a62';ctx.fillRect(0,h*.68,w,h*.32);
 ctx.fillStyle='#3c7548';ctx.fillRect(0,h*.66,w,9);
 for(let x=0;x<w;x+=64){ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,h*.68);ctx.lineTo(x,h);ctx.stroke();}
 // Tikar merah bergaya karpet suporter MU, digambar ulang secara vektor
 // agar motif tajam dan perspektifnya menyatu dengan lantai kantor.
 ctx.save();
 const rugX=w*.355,rugY=h*.685,rugW=w*.30,rugH=h*.285;
 // Bayangan tipis di bawah karpet.
 ctx.fillStyle='rgba(25,45,25,.24)';ctx.beginPath();
 ctx.moveTo(rugX+31,rugY+7);ctx.lineTo(rugX+rugW-31,rugY+7);
 ctx.lineTo(rugX+rugW+8,rugY+rugH+7);ctx.lineTo(rugX-8,rugY+rugH+7);ctx.closePath();ctx.fill();
 // Bentuk karpet trapesium: sisi atas lebih jauh, sisi bawah lebih lebar.
 ctx.beginPath();ctx.moveTo(rugX+30,rugY);ctx.lineTo(rugX+rugW-30,rugY);
 ctx.lineTo(rugX+rugW,rugY+rugH);ctx.lineTo(rugX,rugY+rugH);ctx.closePath();ctx.clip();
 const rugBg=ctx.createLinearGradient(rugX,rugY,rugX+rugW,rugY+rugH);
 rugBg.addColorStop(0,'#8f1720');rugBg.addColorStop(.5,'#c52b32');rugBg.addColorStop(1,'#78131c');
 ctx.fillStyle=rugBg;ctx.fillRect(rugX,rugY,rugW,rugH);
 // Border hitam dan emas.
 ctx.strokeStyle='#171719';ctx.lineWidth=7;ctx.strokeRect(rugX+3,rugY+3,rugW-6,rugH-6);
 ctx.strokeStyle='#e4b64e';ctx.lineWidth=3;ctx.strokeRect(rugX+10,rugY+10,rugW-20,rugH-20);
 // Pola kain berulang dengan garis ornamental dan motif bintang.
 for(let row=0;row<8;row++){
  const yy=rugY+18+row*(rugH-36)/7;
  ctx.strokeStyle=row%2?'rgba(245,205,105,.34)':'rgba(35,12,14,.28)';
  ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rugX+12,yy);ctx.lineTo(rugX+rugW-12,yy);ctx.stroke();
  for(let col=0;col<5;col++){
   const xx=rugX+22+col*(rugW-44)/4;
   ctx.fillStyle='rgba(245,205,105,.78)';ctx.font='bold 9px Georgia';ctx.textAlign='center';
   ctx.fillText('✦',xx,yy+4);
  }
 }
 // Perisai crest generik bernuansa Manchester United, berulang mengikuti motif tikar.
 const crest=(cx,cy,s)=>{
  ctx.save();ctx.translate(cx,cy);ctx.scale(s,s);
  ctx.fillStyle='#e5b84f';ctx.beginPath();ctx.moveTo(-15,-19);ctx.lineTo(15,-19);ctx.lineTo(13,9);ctx.quadraticCurveTo(0,25,-13,9);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#211719';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#b21f2b';ctx.fillRect(-11,-15,22,23);
  ctx.fillStyle='#f5d77b';ctx.font='bold 7px Georgia';ctx.textAlign='center';ctx.fillText('MU',0,0);
  ctx.strokeStyle='#f5d77b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-8,5);ctx.lineTo(8,5);ctx.stroke();
  ctx.fillStyle='#e8c35c';ctx.beginPath();ctx.arc(0,-20,3,0,Math.PI*2);ctx.fill();
  ctx.restore();
 };
 const rows=[{y:.18,s:.55,n:4},{y:.42,s:.72,n:4},{y:.68,s:.88,n:3},{y:.88,s:.72,n:4}];
 rows.forEach((r,ri)=>{
  const yy=rugY+r.y*rugH;
  for(let j=0;j<r.n;j++){
   const xx=rugX+24+(j+.5)*(rugW-48)/r.n;
   crest(xx,yy,r.s);
  }
 });
 // Panel utama dengan tulisan dan lambang tengah.
 ctx.fillStyle='rgba(30,10,13,.55)';ctx.fillRect(rugX+22,rugY+rugH*.34,rugW-44,rugH*.31);
 crest(rugX+rugW/2,rugY+rugH*.48,1.12);
 ctx.fillStyle='#f7d778';ctx.font='bold 10px Georgia';ctx.textAlign='center';
 ctx.fillText('MANCHESTER UNITED',rugX+rugW/2,rugY+rugH*.73);
 ctx.font='bold 8px Georgia';ctx.fillText('RED • GOLD • BLACK',rugX+rugW/2,rugY+rugH*.80);
 // Fringe at the near edge for a woven rug appearance.
 ctx.strokeStyle='#e4b64e';ctx.lineWidth=2;
 for(let k=0;k<17;k++){const xx=rugX+8+k*(rugW-16)/16;ctx.beginPath();ctx.moveTo(xx,rugY+rugH-5);ctx.lineTo(xx-2,rugY+rugH+3);ctx.stroke();}
 ctx.restore();
 // Banner kantor.
 roundedRect(ctx,w*.29,24,w*.42,66,8,'#f6f0d5');ctx.fillStyle='#27613b';ctx.textAlign='center';ctx.font='bold 18px Nunito';ctx.fillText('BPP KECAMATAN SUKASENANG',w*.5,51);ctx.font='12px Nunito';ctx.fillText('BALAI PENYULUHAN PERTANIAN',w*.5,72);
 // Banner daftar kelompok tani.
 roundedRect(ctx,18,105,Math.min(235,w*.32),112,7,'#f3e9c8');ctx.fillStyle='#2d643e';ctx.textAlign='center';ctx.font='bold 13px Nunito';ctx.fillText('DAFTAR KELOMPOK TANI',18+Math.min(235,w*.32)/2,126);
 ctx.font='10px Nunito';ctx.textAlign='left';['1. Tani Makmur','2. Mekar Jaya','3. Suka Tani','4. Harapan Baru'].forEach((s,i)=>ctx.fillText(s,32,149+i*16));
 // Meja kerja dan perangkat komputer.
 roundedRect(ctx,w*.42, h*.34,w*.36,72,8,'#9b663f');ctx.fillStyle='#d6a36a';ctx.fillRect(w*.43,h*.34+8,w*.34,9);
 roundedRect(ctx,w*.54,h*.34-52,74,49,5,'#333f42');ctx.fillStyle='#9bd3c4';roundedRect(ctx,w*.54+5,h*.34-47,64,37,3,'#9bd3c4');ctx.fillStyle='#334b42';ctx.fillRect(w*.57,h*.34-2,25,8);ctx.fillRect(w*.56,h*.34+5,42,4);
 ctx.fillStyle='#302e2a';roundedRect(ctx,w*.65,h*.34-18,27,13,3,'#302e2a');
 // Meja kopi.
 roundedRect(ctx,w*.08,h*.49,w*.27,55,8,'#95613d');ctx.fillStyle='#d4a16a';ctx.fillRect(w*.09,h*.49+8,w*.25,8);
 roundedRect(ctx,w*.15,h*.49-24,45,23,4,'#f4f0df');ctx.fillStyle='#634936';ctx.fillRect(w*.17,h*.49-20,36,4);ctx.fillStyle='#e9e1c8';ctx.beginPath();ctx.arc(w*.23,h*.49-17,8,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.font='bold 13px Nunito';ctx.textAlign='center';
 roundedRect(ctx,w*.215-66,h*.49+62,132,24,7,'#fff8df');ctx.fillStyle='#244c2d';ctx.fillText('MEJA KOPI',w*.215,h*.49+79);
 roundedRect(ctx,w*.60-112,h*.34+79,224,25,7,'#fff8df');ctx.fillStyle='#244c2d';ctx.fillText('MEJA KERJA • KOMPUTER',w*.60,h*.34+96);ctx.restore();
 // Lemari arsip, kursi, pot tanaman.
 roundedRect(ctx,w*.83, h*.25,70,105,5,'#8d603e');for(let y=0;y<3;y++){ctx.strokeStyle='#e2c18b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w*.84,h*.28+y*31);ctx.lineTo(w*.89,h*.28+y*31);ctx.stroke();}
 ctx.fillStyle='#397c47';ctx.beginPath();ctx.arc(w*.92,h*.51,18,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8a603d';ctx.fillRect(w*.91,h*.51,12,27);
 // Pintu keluar.
 roundedRect(ctx,w*.43,h-75,w*.14,50,5,'#f0d8a5');ctx.fillStyle='#356c43';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('PINTU KELUAR',w*.5,h-19);
 drawFarmer(state.player.x,state.player.y,{shirt:'#287b49',pants:'#344b3a'},t/105,false,true);
 const coffee={x:w*.215,y:h*.49+30},pc={x:w*.60,y:h*.34+35},exit={x:w*.5,y:h-48};
 const dCoffee=Math.hypot(state.player.x-coffee.x,state.player.y-coffee.y),dPc=Math.hypot(state.player.x-pc.x,state.player.y-pc.y),dExit=Math.hypot(state.player.x-exit.x,state.player.y-exit.y);
 const label=dCoffee<100?'E / INTERAKSI • BUAT KOPI':dPc<110?'E / INTERAKSI • AKSES KOMPUTER':dExit<100?'E / INTERAKSI • KELUAR BPP':'Jelajahi kantor dan dekati meja';
 roundedRect(ctx,Math.max(8,w/2-145),h-34,290,25,10,'rgba(255,250,225,.94)');ctx.fillStyle='#254d32';ctx.font='bold 11px Nunito';ctx.fillText(label,w/2,h-17);
 ctx.restore();
 $('worldLocation').textContent='🏢 BPP Kecamatan Sukasenang';
 $('worldObjective').textContent='☕ Misi kantor: buat kopi • 💻 Akses SIMLUHTAN, RDKK, dan e-Banper';
 const hint=$('canvasHint');if(hint)hint.textContent='Gerakkan penyuluh. Dekati meja kopi atau meja komputer, lalu tekan E / INTERAKSI. Pintu bawah untuk keluar.';
}
function bppCoffee(){
 enterBppCoffee();
}
function drawBppCoffee(t=0){
 const w=canvas.width,h=canvas.height;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,w,h);
 const wall=ctx.createLinearGradient(0,0,0,h);wall.addColorStop(0,'#dcebd2');wall.addColorStop(.66,'#b5d3a5');wall.addColorStop(1,'#8b6548');ctx.fillStyle=wall;ctx.fillRect(0,0,w,h);
 // First-person counter and backsplash.
 ctx.fillStyle='#e9e2cf';ctx.fillRect(0,300,w,155);
 for(let x=0;x<w;x+=48){ctx.strokeStyle='rgba(120,105,80,.13)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,300);ctx.lineTo(x,455);ctx.stroke();}
 ctx.fillStyle='#795238';ctx.fillRect(0,455,w,145);ctx.fillStyle='#b68150';ctx.fillRect(0,455,w,15);
 // Wall shelf, coffee station sign and kettle.
 roundedRect(ctx,70,42,820,68,10,'#f5f0dc');ctx.fillStyle='#2d6840';ctx.textAlign='center';ctx.font='bold 20px Nunito';ctx.fillText('SUDUT KOPI • BPP KECAMATAN SUKASENANG',480,82);
 roundedRect(ctx,75,145,180,110,8,'#8d603e');ctx.fillStyle='#c99a61';ctx.fillRect(86,158,158,8);
 // Hot water kettle
 ctx.fillStyle='#303c3d';roundedRect(ctx,115,177,68,72,12,'#303c3d');ctx.fillStyle='#c9d7d1';roundedRect(ctx,124,185,50,54,9,'#c9d7d1');ctx.fillStyle='#333';ctx.fillRect(132,172,34,8);
 ctx.fillStyle='#fff';ctx.font='bold 12px Nunito';ctx.fillText('AIR PANAS',149,270);
 // Large wooden worktop
 ctx.fillStyle='#805335';ctx.beginPath();ctx.moveTo(35,320);ctx.lineTo(925,320);ctx.lineTo(960,470);ctx.lineTo(0,470);ctx.closePath();ctx.fill();
 ctx.fillStyle='#bd8956';ctx.beginPath();ctx.moveTo(35,320);ctx.lineTo(925,320);ctx.lineTo(925,339);ctx.lineTo(35,339);ctx.closePath();ctx.fill();
 // ingredient containers and labels
 const jar=(x,y,color,label)=>{roundedRect(ctx,x,y,86,100,9,'#e7e2d0');ctx.fillStyle=color;roundedRect(ctx,x+8,y+25,70,65,6,color);ctx.fillStyle='#f7f0d8';roundedRect(ctx,x+12,y+53,62,25,4,'#f7f0d8');ctx.fillStyle='#493a2b';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText(label,x+43,y+70);ctx.fillStyle='#aaa';ctx.fillRect(x+7,y+17,72,9);};
 jar(95,350,'#4a3022','KOPI');jar(220,350,'#e4c16b','GULA');jar(345,350,'#719b65','TEH');
 // Spoon
 ctx.strokeStyle='#c9cdd0';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(490,378);ctx.lineTo(545,431);ctx.stroke();ctx.fillStyle='#d9dfe0';ctx.beginPath();ctx.ellipse(486,374,14,9,-.6,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff';ctx.font='bold 12px Nunito';ctx.fillText('SENDOK',518,455);
 // Tempat racik khusus: awalnya kosong, cangkir harus dipindahkan dari rak ke sini.
 ctx.fillStyle='rgba(255,245,215,.18)';ctx.beginPath();ctx.ellipse(600,435,68,18,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#f2d9a7';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.ellipse(600,435,68,18,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle='#fff8df';roundedRect(ctx,545,470,110,22,6,'#fff8df');ctx.fillStyle='#4a3425';ctx.font='bold 11px Nunito';ctx.textAlign='center';ctx.fillText('TEMPAT RACIK',600,485);
 // Rak cangkir terpisah di sisi kanan meja.
 roundedRect(ctx,790,325,130,130,10,'#9b704b');ctx.fillStyle='#d4ae7c';ctx.fillRect(800,337,110,8);ctx.fillStyle='#fff8df';ctx.font='bold 11px Nunito';ctx.fillText('RAK CANGKIR',855,472);
 // Cup and saucer, liquid changes as steps progress
 ctx.fillStyle='#e8e1d1';ctx.beginPath();ctx.ellipse(bppCoffeeCupX,435,66,18,0,0,Math.PI*2);ctx.fill();
 roundedRect(ctx,bppCoffeeCupX-49,350,98,83,12,'#f5f2e9');ctx.strokeStyle='#e2d9c7';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(bppCoffeeCupX+50,390,22,25,-.1,-1.3,1.3);ctx.stroke();
 const filled=bppCoffeeStepRun>=3;ctx.fillStyle=filled?'#513426':'#b6b5a7';ctx.beginPath();ctx.ellipse(bppCoffeeCupX,357,42,10,0,0,Math.PI*2);ctx.fill();
 if(bppCoffeeStepRun>=4){ctx.strokeStyle='#c9b9a1';ctx.lineWidth=4;ctx.beginPath();ctx.arc(bppCoffeeCupX,357,24,(t/280)%6.28,(t/280)%6.28+4.7);ctx.stroke();}
 ctx.fillStyle='#fff';ctx.font='bold 12px Nunito';ctx.fillText('CANGKIR',bppCoffeeCupX,470);
 // Asap/uap panas terus bergerak setelah kopi siap dinikmati.
 if(state.bppCoffeeDone||bppCoffeeStepRun>=5){
  const phase=(t||performance.now())/520;
  for(let s=0;s<3;s++){
   const sx=bppCoffeeCupX-18+s*18;
   const sway=Math.sin(phase+s*1.7)*7;
   ctx.save();ctx.globalAlpha=.48+Math.sin(phase+s)*.12;
   ctx.strokeStyle='#fffdf0';ctx.lineWidth=4;ctx.lineCap='round';
   ctx.beginPath();ctx.moveTo(sx,348);
   ctx.bezierCurveTo(sx-10+sway,334,sx+10-sway,322,sx+sway,305-(s%2)*8);
   ctx.stroke();ctx.restore();
  }
 }

 // Objek yang sedang diseret mengikuti pointer/touch pemain.
 if(bppCoffeeDrag){
  const d=bppCoffeeDrag;ctx.save();ctx.globalAlpha=.94;
  if(d.item==='cup'){roundedRect(ctx,d.x-42,d.y-38,84,70,12,'#f5f2e9');ctx.fillStyle='#513426';ctx.beginPath();ctx.ellipse(d.x,d.y-30,34,8,0,0,Math.PI*2);ctx.fill();}
  else if(d.item==='spoon'){ctx.strokeStyle='#d9dfe0';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(d.x-28,d.y-24);ctx.lineTo(d.x+28,d.y+24);ctx.stroke();ctx.fillStyle='#d9dfe0';ctx.beginPath();ctx.ellipse(d.x-30,d.y-26,12,8,-.6,0,Math.PI*2);ctx.fill();}
  else {const colors={coffee:'#4a3022',sugar:'#e4c16b',water:'#c9d7d1'};roundedRect(ctx,d.x-34,d.y-32,68,64,8,'#e7e2d0');roundedRect(ctx,d.x-27,d.y-18,54,46,6,colors[d.item]||'#aaa');ctx.fillStyle='#fff8df';ctx.font='bold 10px Nunito';ctx.textAlign='center';ctx.fillText(d.item==='coffee'?'KOPI':d.item==='sugar'?'GULA':'AIR',d.x,d.y+8);}
  ctx.restore();
 }
 // Animation cues: pouring stream and stirring motion.
 if(bppCoffeeAnimUntil>performance.now()){
  if(bppCoffeeStepRun===4){ctx.strokeStyle='rgba(255,235,170,.9)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(149,250);ctx.quadraticCurveTo(330,285,bppCoffeeCupX,348);ctx.stroke();}
  if(bppCoffeeStepRun===5){ctx.strokeStyle='#d9e0e0';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(520,385);ctx.lineTo(bppCoffeeCupX+Math.sin(t/55)*22,356+Math.cos(t/55)*5);ctx.stroke();}
 }
 // Progress and clear task instruction.
 const tasks=['1. Pindahkan cangkir dari rak ke tempat racik','2. Tambahkan satu sendok kopi','3. Tambahkan gula secukupnya','4. Tuangkan air panas','5. Aduk kopi hingga rata'];
 const completed=bppCoffeeStepRun>=5;
 roundedRect(ctx,35,125,890,48,9,'rgba(255,250,229,.96)');ctx.fillStyle='#315b39';ctx.font='bold 15px Nunito';ctx.textAlign='center';
 ctx.fillText(completed?'☕ Kopi siap disajikan! Terima kasih, Penyuluh.':(tasks[Math.min(bppCoffeeStepRun,4)]+' — GESER peralatan ke cangkir'),480,155);
 ctx.fillStyle='#315b39';ctx.font='bold 11px Nunito';ctx.fillText('GESER: CANGKIR → KOPI → GULA → AIR PANAS → SENDOK  |  ESC / KEMBALI',480,205);
 // First-person hands/forearms at bottom edge.
 ctx.fillStyle='#d5a06e';ctx.beginPath();ctx.moveTo(310,600);ctx.lineTo(360,520);ctx.lineTo(400,520);ctx.lineTo(430,600);ctx.fill();ctx.beginPath();ctx.moveTo(650,600);ctx.lineTo(690,520);ctx.lineTo(730,520);ctx.lineTo(770,600);ctx.fill();
 ctx.restore();
 $('worldLocation').textContent='☕ Sudut Kopi • BPP Kecamatan Sukasenang';
 $('worldObjective').textContent=completed?'⭐ Misi membuat kopi selesai • +5 XP':'☕ '+tasks[Math.min(bppCoffeeStepRun,4)];
 const hint=$('canvasHint');if(hint)hint.textContent='Geser cangkir, kopi, gula, air panas, lalu sendok ke arah cangkir. Seret sendok melintasi cangkir untuk mengaduk. ESC atau tombol Kembali untuk keluar.';
}
function bppCoffeeSource(item){
 const sources={
  cup:{x:855,y:390,r:58},
  coffee:{x:138,y:400,r:55},
  sugar:{x:263,y:400,r:55},
  tea:{x:388,y:400,r:55},
  water:{x:149,y:210,r:55},
  spoon:{x:515,y:405,r:48}
 };
 return sources[item];
}
function bppCoffeeRequiredItem(){
 return ['cup','coffee','sugar','water','spoon'][Math.min(bppCoffeeStepRun,4)];
}
function bppCoffeePointerDown(x,y){
 if(state.scene!=='coffee'||state.bppCoffeeDone)return false;
 const item=bppCoffeeRequiredItem(),s=bppCoffeeSource(item);
 if(Math.hypot(x-s.x,y-s.y)>s.r)return false;
 bppCoffeeDrag={item,x,y,startX:x,startY:y};drawWorld();return true;
}
function bppCoffeePointerMove(x,y){
 if(!bppCoffeeDrag)return false;
 bppCoffeeDrag.x=x;bppCoffeeDrag.y=y;drawWorld();return true;
}
function bppCoffeePointerUp(x,y){
 if(!bppCoffeeDrag)return false;
 const item=bppCoffeeDrag.item;
 bppCoffeeDrag=null;
 const targetX=item==='cup'?600:bppCoffeeCupX;
 const landed=Math.hypot(x-targetX,y-390)<95;
 if(landed){
  if(item==='cup')bppCoffeeCupX=600;
  bppCoffeeStepRun++;bppCoffeeAnimUntil=performance.now()+1400;
  const messages={
   cup:'Cangkir sudah diletakkan di area racik.',
   coffee:'Kopi bubuk berhasil dimasukkan ke cangkir.',
   sugar:'Gula berhasil dituang ke dalam cangkir.',
   water:'Air panas dituangkan ke dalam cangkir. Hati-hati, masih panas!',
   spoon:'Kopi sudah diaduk hingga rata.'
  };
  showPalmToast(messages[item]);
  if(bppCoffeeStepRun>=5){
   state.bppCoffeeDone=true;state.bppCoffeeStep=3;reward(5,0);save();
   $('missionDescription').textContent='☕ Selamat! Kopi sudah siap dan dapat dinikmati. Hadiah +5 XP.';
   showPalmToast('🎉 Selamat! Kopi sudah dapat dinikmati!');
  }
 }else{
  showPalmToast(item==='tea'?'Untuk misi ini gunakan kopi, bukan teh.':'Arahkan peralatan ke area cangkir sampai tepat, lalu lepaskan.');
 }
 drawWorld();return true;
}
function bppComputer(){
 closeBppPortal();state.scene='pc';bppPcWindow=null;bppPrintStep=0;bppPrintStartedAt=0;state.keys={};state.analog={x:0,y:0};save();
 $('worldLocation').textContent='💻 Komputer BPP • Desktop Windows 98';
 $('worldObjective').textContent='Klik ikon SIMLUHTAN, e-RDKK, atau e-Banper. Tekan ESC untuk keluar.';
 drawWorld();
}
function drawBppPc(t=0){
 const w=canvas.width,h=canvas.height;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 ctx.clearRect(0,0,w,h);
 // First-person view: meja, monitor CRT, keyboard dan mouse.
 const wall=ctx.createLinearGradient(0,0,0,h);wall.addColorStop(0,'#dce8d2');wall.addColorStop(1,'#9fbd91');ctx.fillStyle=wall;ctx.fillRect(0,0,w,h);
 ctx.fillStyle='#74513a';ctx.fillRect(0,455,w,145);ctx.fillStyle='#a8794d';ctx.fillRect(0,455,w,14);
 // Monitor CRT case.
 roundedRect(ctx,150,24,660,430,22,'#343b3b');roundedRect(ctx,165,39,630,386,12,'#151b1c');
 // Windows 98 desktop.
 const desk=ctx.createLinearGradient(0,55,0,410);desk.addColorStop(0,'#087e83');desk.addColorStop(1,'#08706f');ctx.fillStyle=desk;ctx.fillRect(176,51,608,360);
 // Desktop icons and labels.
 const icon=(x,y,emoji,label)=>{ctx.font='27px Arial';ctx.textAlign='center';ctx.fillText(emoji,x,y);ctx.font='bold 11px Arial';ctx.fillStyle='#fff';ctx.fillText(label,x,y+28);ctx.fillStyle='#fff';};
 icon(215,92,'🖥️','My Computer');icon(215,164,'📁','Dokumen');icon(215,236,'🌐','Internet');
 icon(295,92,'📋','SIMLUHTAN');icon(295,164,'🌾','e-RDKK');icon(295,236,'📦','e-Banper');
 icon(375,92,'📕','ERDKK.pdf');
 // Desktop wallpaper details and taskbar.
 ctx.fillStyle='#0b4c85';ctx.fillRect(176,378,608,33);ctx.fillStyle='#c0c0c0';ctx.fillRect(181,382,72,25);ctx.fillStyle='#111';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText('Start',217,399);
 ctx.fillStyle='#e5e5e5';ctx.fillRect(260,383,515,23);ctx.fillStyle='#333';ctx.textAlign='left';ctx.font='11px Arial';ctx.fillText('BPP Kecamatan Sukasenang  •  Sistem Informasi Penyuluh',270,398);
 // Explorer windows for My Computer and Documents, rendered inside the CRT screen.
 if(bppPcWindow){
  roundedRect(ctx,250,70,510,285,5,'#c0c0c0');ctx.fillStyle='#082d83';ctx.fillRect(255,75,500,25);
  ctx.fillStyle='#fff';ctx.font='bold 13px Arial';ctx.textAlign='left';ctx.fillText(bppPcWindow==='computer'?'My Computer':bppPcWindow==='documents'?'My Documents':'ERDKK.pdf — Adobe Reader',266,92);
  ctx.fillStyle='#c0c0c0';ctx.fillRect(730,78,18,18);ctx.fillStyle='#111';ctx.textAlign='center';ctx.font='bold 14px Arial';ctx.fillText('X',739,92);
  ctx.fillStyle='#fff';ctx.fillRect(258,104,494,244);ctx.fillStyle='#111';ctx.font='12px Arial';ctx.textAlign='left';
  if(bppPcWindow==='erdkkpdf'){
   ctx.fillStyle='#d7d7d7';ctx.fillRect(258,104,494,31);
   ctx.fillStyle='#333';ctx.font='bold 11px Arial';ctx.fillText('File   Edit   View   Tools   Help',270,124);
   ctx.fillStyle='#fff';ctx.fillRect(350,142,310,195);ctx.strokeStyle='#bbb';ctx.strokeRect(350,142,310,195);
   ctx.fillStyle='#234c36';ctx.textAlign='center';ctx.font='bold 10px Arial';ctx.fillText('RENCANA DEFINITIF KEBUTUHAN KELOMPOK',505,155);
   ctx.font='bold 9px Arial';ctx.fillText('(RDKK) PUPUK BERSUBSIDI',505,167);
   ctx.fillStyle='#444';ctx.font='7px Arial';ctx.fillText('DAFTAR PETANI DESA SUKAMAJU',505,178);
   const rdkkNames=['Pak Tani','Bu Rina','Pak Ketua','Pak Asep','Bu Sari','Pak Dedi','Pak Hasan','Pak Ujang','Bu Yati','Pak Rahmat','Bu Nani'];
   ctx.fillStyle='#e8eee8';ctx.fillRect(360,184,290,12);
   ctx.fillStyle='#243d2d';ctx.font='bold 7px Arial';ctx.textAlign='left';
   ctx.fillText('NO',365,193);ctx.fillText('NAMA PETANI',390,193);ctx.fillText('KELOMPOK',510,193);
   ctx.fillText('STATUS',610,193);
   ctx.font='7px Arial';
   rdkkNames.forEach((nm,idx)=>{
    const yy=204+idx*10.5;
    if(idx%2===0){ctx.fillStyle='#f3f6f1';ctx.fillRect(360,yy-8,290,10.5);}
    ctx.fillStyle='#333';ctx.textAlign='left';
    ctx.fillText(String(idx+1),366,yy);ctx.fillText(nm,390,yy);
    ctx.fillText('Tani Makmur',510,yy);ctx.fillText('Terdaftar',610,yy);
   });
   ctx.strokeStyle='#c5cec5';ctx.lineWidth=.6;
   for(let xx of [383,503,604]){ctx.beginPath();ctx.moveTo(xx,184);ctx.lineTo(xx,321);ctx.stroke();}
   ctx.fillStyle='#555';ctx.font='6px Arial';ctx.textAlign='left';ctx.fillText('Data simulasi untuk gameplay My PPL My Adventure',362,331);
   // Print button inside the PDF viewer.
   roundedRect(ctx,668,110,76,22,4,bppPrintStep>=2?'#b7d7b8':'#d9e1eb');
   ctx.fillStyle='#172b42';ctx.font='bold 10px Arial';ctx.textAlign='center';ctx.fillText('🖨 PRINT',706,125);
   ctx.fillStyle='#333';ctx.font='9px Arial';ctx.textAlign='left';
   ctx.fillText(bppPrintStep===0?'Langkah 2: klik tombol CONNECT pada printer di sebelah kanan monitor.':bppPrintStep===1?'Klik tombol CONNECT pada printer di sebelah kanan monitor.':bppPrintStep===2?'✓ PRINTER TERHUBUNG — klik tombol PRINT.':'Dokumen telah dicetak.',270,337);
  }else if(bppPcWindow==='computer'){
   ctx.fillText('Address: My Computer',270,124);
   [['💾','Local Disk (C:)','Hard Disk'],['💽','CD-ROM (D:)','CD Drive'],['📁','Shared Documents','Folder'],['🖨️','Printers','System Folder']].forEach((a,i)=>{const x=285+(i%2)*220,y=160+Math.floor(i/2)*82;ctx.font='25px Arial';ctx.fillText(a[0],x,y);ctx.font='bold 12px Arial';ctx.fillText(a[1],x+38,y-5);ctx.font='10px Arial';ctx.fillStyle='#555';ctx.fillText(a[2],x+38,y+12);ctx.fillStyle='#111';});
  }else{
   ctx.fillText('Address: C:\\My Documents',270,124);
   [['📄','Laporan Penyuluhan.doc'],['📊','Data Kelompok Tani.xls'],['📁','Materi Penyuluhan'],['📝','Catatan Lapangan.txt']].forEach((a,i)=>{const y=158+i*43;ctx.font='22px Arial';ctx.fillText(a[0],285,y);ctx.font='12px Arial';ctx.fillText(a[1],322,y-4);});
  }
  ctx.fillStyle='#333';ctx.font='10px Arial';ctx.fillText('Double-click an item to open • Klik X untuk menutup jendela',270,339);
 }
 // Monitor bezel, logo and stand.
 ctx.fillStyle='#555e5e';roundedRect(ctx,440,425,80,26,5,'#555e5e');ctx.fillStyle='#3b4141';ctx.fillRect(410,448,140,12);
 ctx.fillStyle='#d8d6c9';ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillText('BPP • WORKSTATION',480,18);
 // Keyboard and mouse from first-person angle.
 ctx.fillStyle='#353a3a';ctx.beginPath();ctx.moveTo(280,490);ctx.lineTo(680,490);ctx.lineTo(740,560);ctx.lineTo(220,560);ctx.closePath();ctx.fill();
 for(let r=0;r<3;r++)for(let c=0;c<14;c++){ctx.fillStyle='#aeb4b0';roundedRect(ctx,244+c*34-r*3,500+r*17,28,12,2,'#aeb4b0');}
 ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(805,526,22,34,.1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#aaa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(805,496);ctx.lineTo(805,520);ctx.stroke();
 // Printer beside the PC, available for the print-document mission.
 ctx.fillStyle='#30383a';roundedRect(ctx,835,365,112,86,8,'#30383a');
 ctx.fillStyle='#d5d8d5';roundedRect(ctx,844,374,94,54,5,'#d5d8d5');
 ctx.fillStyle='#f7f7ef';ctx.fillRect(855,360,72,20);
 ctx.fillStyle='#555';ctx.fillRect(855,402,72,5);
 ctx.fillStyle='#aeb7b4';roundedRect(ctx,851,430,80,14,3,'#aeb7b4');
 ctx.fillStyle='#263b32';ctx.font='bold 10px Nunito';ctx.textAlign='center';ctx.fillText('PRINTER',891,466);
 // Animasi lembar RDKK keluar perlahan dari slot atas printer setelah tombol PRINT ditekan.
 if(bppPrintStep===3&&bppPrintStartedAt){
  const elapsed=Math.max(0,t-bppPrintStartedAt);
  const progress=Math.min(1,elapsed/1250);
  const eased=1-Math.pow(1-progress,3);
  const paperH=108*eased;
  const px=858,py=360-paperH;
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.22)';ctx.shadowBlur=5;ctx.shadowOffsetY=2;
  ctx.fillStyle='#fffdf4';ctx.strokeStyle='#aeb8b2';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(px,360);ctx.lineTo(px,py+5);ctx.quadraticCurveTo(px+32,py,px+64,py+5);ctx.lineTo(px+64,360);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(paperH>22){
   ctx.fillStyle='#39834b';ctx.fillRect(px+9,py+Math.min(13,paperH*.12),46,5);
   ctx.fillStyle='#6ca875';ctx.fillRect(px+9,py+Math.min(23,paperH*.22),46,4);
   ctx.fillStyle='#d7ddd8';
   for(let line=0;line<Math.min(5,Math.floor((paperH-24)/11));line++){
    ctx.fillRect(px+9,py+34+line*11,46-(line%2)*8,2.5);
   }
  }
  ctx.restore();
 }
 // Tombol fisik CONNECT pada panel depan printer.
 roundedRect(ctx,868,397,48,25,5,bppPrintStep>=2?'#9bd49b':'#d9f2c9');
 ctx.strokeStyle='#315b39';ctx.lineWidth=2;roundedRect(ctx,868,397,48,25,5,'rgba(0,0,0,0)'); 
 ctx.fillStyle='#174b2b';ctx.font='bold 9px Arial';ctx.textAlign='center';
 ctx.fillText(bppPrintStep>=2?'✓ READY':'CONNECT',892,413);
 if(bppPcWindow==='erdkkpdf'&&bppPrintStep===0){
  roundedRect(ctx,800,475,150,34,7,'#fff5cb');ctx.fillStyle='#24452c';ctx.font='bold 10px Nunito';ctx.textAlign='center';
  ctx.fillText('KLIK TOMBOL CONNECT',875,489);ctx.fillText('PADA PRINTER',875,502);
 }
 // Click targets and instructions.
 roundedRect(ctx,270,570,420,24,8,'rgba(255,248,220,.96)');ctx.fillStyle='#243c2b';ctx.font='bold 12px Nunito';ctx.textAlign='center';ctx.fillText('BUKA ERDKK.pdf → HUBUNGKAN PRINTER → PRINT • ESC UNTUK KELUAR',480,586);
 $('worldLocation').textContent='💻 Komputer BPP • Desktop Windows 98';
 $('worldObjective').textContent='Buka ERDKK.pdf, klik tombol CONNECT pada printer di sebelah kanan monitor, lalu tekan PRINT.';
 const hint=$('canvasHint');if(hint)hint.textContent='Klik ERDKK.pdf. Pada printer di kanan monitor, tekan tombol CONNECT, lalu klik PRINT pada dokumen.';
}
let bppPortalFrame=null;
function closeBppPortal(){
 const el=document.getElementById('bppPortalWindow');
 if(el)el.remove();
 bppPortalFrame=null;
}
function openBppPortal(url,title){
 closeBppPortal();
 const wrap=canvas.closest('.canvas-wrap');
 if(!wrap)return;
 const win=document.createElement('div');win.id='bppPortalWindow';
 const bar=document.createElement('div');bar.className='bpp-portal-titlebar';
 const name=document.createElement('span');name.textContent=title+' — BPP Workstation';
 const actions=document.createElement('div');actions.className='bpp-portal-actions';
 const external=document.createElement('a');external.href=url;external.target='_blank';external.rel='noopener';external.textContent='Buka tab baru';
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Tutup jendela portal');
 close.addEventListener('click',closeBppPortal);
 actions.append(external,close);bar.append(name,actions);
 const frame=document.createElement('iframe');frame.src=url;frame.title=title;frame.loading='eager';frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.setAttribute('allow','clipboard-read; clipboard-write');
 win.append(bar,frame);wrap.appendChild(win);bppPortalFrame=win;
 $('missionDescription').textContent=title+' dibuka di jendela monitor PC. Tutup jendela dengan tombol × untuk kembali ke desktop.';
}
function openBppPortal(url,title){
 closeBppPortal();
 const wrap=canvas.closest('.canvas-wrap');
 if(!wrap)return;
 const win=document.createElement('div');win.id='bppPortalWindow';
 const bar=document.createElement('div');bar.className='bpp-portal-titlebar';
 const name=document.createElement('span');name.textContent=title+' — BPP Workstation';
 const actions=document.createElement('div');actions.className='bpp-portal-actions';
 const external=document.createElement('a');external.href=url;external.target='_blank';external.rel='noopener';external.textContent='Buka tab baru';
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Tutup jendela portal');
 close.addEventListener('click',()=>{win.remove();bppPortalFrame=null;});
 actions.append(external,close);bar.append(name,actions);
 const frame=document.createElement('iframe');frame.src=url;frame.title=title;frame.loading='eager';frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.setAttribute('allow','clipboard-read; clipboard-write');
 win.append(bar,frame);wrap.appendChild(win);bppPortalFrame=win;
 $('missionDescription').textContent=title+' dibuka di jendela monitor PC. Tutup dengan tombol × untuk kembali ke desktop.';
}
function bppInteract(){
 const w=canvas.width,h=canvas.height;
 const coffee={x:w*.215,y:h*.49+30},pc={x:w*.60,y:h*.34+35},exit={x:w*.5,y:h-48};
 if(Math.hypot(state.player.x-coffee.x,state.player.y-coffee.y)<105){bppCoffee();return;}
 if(Math.hypot(state.player.x-pc.x,state.player.y-pc.y)<115){bppComputer();return;}
 if(Math.hypot(state.player.x-exit.x,state.player.y-exit.y)<125){state.scene='village';state.player={...state.returnPosition};save();return;}
 $('missionDescription').textContent='Dekati meja kopi, meja komputer, atau pintu keluar untuk berinteraksi.';
}

function enterMine(){state.returnPosition={x:state.player.x,y:state.player.y};state.scene='mine';mineMonster=null;mineBoss=null;mineTreasureChest=null;mineBossWarningAt=0;mineCommonSpawnCount=0;minePickaxeOwned=false;minePickaxeHitAt=0;mineLastFrame=0;mineNextMonsterAt=performance.now()+6500;mineHitCooldown=0;mineRespawnQueue=[];state.player={x:canvas.width*.5,y:canvas.height-180};if(!state.mineNodes.length)state.mineNodes=[[canvas.width*.28,canvas.height*.38],[canvas.width*.72,canvas.height*.34],[canvas.width*.5,canvas.height*.68],[canvas.width*.82,canvas.height*.7],[canvas.width*.18,canvas.height*.72]];else state.mineNodes=state.mineNodes.map((pt,i)=>pt||[[canvas.width*.28,canvas.height*.38],[canvas.width*.72,canvas.height*.34],[canvas.width*.5,canvas.height*.68],[canvas.width*.82,canvas.height*.7],[canvas.width*.18,canvas.height*.72]][i%5]);save();const md=$('missionDescription');if(md)md.textContent='⛏️ PERLENGKAPAN TAMBANG: Dekati Kapak Tambang di dekat jalur masuk lalu tekan E / INTERAKSI untuk mengambilnya sebelum melawan Boss Kelabang!';}
function nearestNpc(){let best=null,dist=Infinity;for(const n of npcs){const d=Math.hypot(n.x-state.player.x,n.y-state.player.y);if(d<dist){dist=d;best=n;}}return best;}
function blocked(x,y){if(state.scene==='mine'||state.scene==='palm'||state.scene==='bpp')return false;if(obstacles.some(o=>x>o.x-18&&x<o.x+o.w+18&&y>o.y-10&&y<o.y+o.h+10))return true;const trunks=[[90,160],[450,130],[900,170],[1080,250],[1700,220],[850,850],[650,960],[1750,850],[920,1080],[1660,1120],[500,920],[1320,1110],[1770,390],[610,260],[880,760],[1720,500],[1320,80],[250,1120]];if(trunks.some(([tx,ty])=>Math.hypot(x-tx,y-(ty+18))<22))return true;return npcs.some(n=>Math.hypot(x-n.x,y-n.y)<22);}
function movePlayer(dx,dy){
 if(!dx&&!dy)return;
 const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
 const speed=3.4;
 const maxX=(state.scene==='mine'||state.scene==='palm'||state.scene==='bpp')?canvas.width-35:WORLD.w-25;
 const maxY=state.scene==='bpp'?canvas.height-30:((state.scene==='mine'||state.scene==='palm')?canvas.height-90:WORLD.h-30);
 const startX=state.player.x,startY=state.player.y;
 const startBlocked=blocked(startX,startY);
 const nx=Math.max(25,Math.min(maxX,startX+dx*speed));
 const ny=Math.max(80,Math.min(maxY,startY+dy*speed));
 // If a newly-added fence/building surrounds a previously saved player position,
 // allow movement out of the overlap instead of trapping the player permanently.
 if(startBlocked || !blocked(nx,startY))state.player.x=nx;
 if(startBlocked || !blocked(state.player.x,ny))state.player.y=ny;
}
function loop(ts){
 // Jadwalkan frame berikutnya sebelum memproses dunia. Jika satu frame mengalami
 // error saat animasi/efek tabrakan, loop kontrol tidak ikut berhenti permanen.
 raf=requestAnimationFrame(loop);
 try{
  const dt=Math.min((ts-last)/16||1,2);last=ts;
  let dx=(state.keys.ArrowRight||state.keys.d?1:0)-(state.keys.ArrowLeft||state.keys.a?1:0);
  let dy=(state.keys.ArrowDown||state.keys.s?1:0)-(state.keys.ArrowUp||state.keys.w?1:0);
  dx+=state.analog.x;dy+=state.analog.y;
  if(dx||dy)movePlayer(dx*dt,dy*dt);
  if(state.catOwned&&state.scene==='village'){const len=Math.hypot(dx,dy)||1,tx=state.player.x-(dx/len)*27,ty=state.player.y-(dy/len)*20;state.catFollower.x+=(tx-state.catFollower.x)*.16;state.catFollower.y+=(ty-state.catFollower.y)*.16;}
  drawWorld(ts);
 }catch(err){console.error('Game frame error (loop tetap berjalan):',err);}
}
function startWorld(){stopWorld();last=0;drawWorld();raf=requestAnimationFrame(loop);}
function stopWorld(){if(raf)cancelAnimationFrame(raf);raf=0;state.keys={};}
function interact(){
  if(dialogOpen)return;
  if(state.scene==='mine'){mineInteract();return;}
  if(state.scene==='palm'){palmInteract();return;}if(state.scene==='bpp'){bppInteract();return;}
  if(state.scene==='village'&&Math.hypot(1140-state.player.x,260-state.player.y)<110){enterBpp();return;}
  if(Math.hypot(500-state.player.x,450-state.player.y)<90){if(levelProgress(state.xp).level<2){$('missionDescription').textContent='🔒 Tambang Emas belum bisa dimasuki! Capai Level 2 — Penyuluh Pertanian Terampil terlebih dahulu.';return;}enterMine();return;}
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
 else if(n.id==='catcaretaker'){
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
  const regularMissionsDone=(state.missionDone?1:0)+(state.buMissionDone?1:0)+(state.ketuaMissionDone?1:0)+Object.values(state.missionFlags||{}).filter(Boolean).length+(state.ranchMissionDone?1:0);
  if(regularMissionsDone>=2&&!state.catHintShown&&!state.catOwned){
    state.catHintShown=true;save();
    $('missionDescription').textContent='🐾 Misi spesial terbuka! Temui Penjaga Anak Kucing di desa untuk merawat dan mengadopsi anak kucing.';
  }
}
function addChoice(label,correct,after){const b=document.createElement('button');b.className='answer-option';b.textContent=label;b.addEventListener('click',()=>{document.querySelectorAll('#dialogChoices button').forEach(x=>x.disabled=true);if(correct){b.classList.add('correct');$('dialogText').textContent='Tepat!';}else{b.classList.add('wrong');$('dialogText').textContent='Coba pikirkan kembali jawaban yang paling tepat.';}after();});$('dialogChoices').appendChild(b);}
$('closeDialog').addEventListener('click',()=>{$('dialog').classList.add('hidden');dialogOpen=false;startWorld();});
window.addEventListener('keydown',e=>{if(state.scene==='pc'&&e.key==='Escape'&&document.getElementById('bppPortalWindow')){e.preventDefault();closeBppPortal();return;}if((state.scene==='pc'||state.scene==='coffee')&&e.key==='Escape'){e.preventDefault();closeBppPortal();state.scene='bpp';state.keys={};state.analog={x:0,y:0};bppPcWindow=null;save();drawWorld();return;}if(state.scene==='pc'||state.scene==='coffee')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();state.keys[e.key]=true;if(e.key==='e'||e.key==='E'||e.key===' '){if(!$('dialog').classList.contains('hidden'))return;interact();}});
let bppCoffeePointerId=null;
canvas.addEventListener('pointerdown',e=>{
 if(state.scene!=='coffee')return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
 if(bppCoffeePointerDown(x,y)){bppCoffeePointerId=e.pointerId;canvas.setPointerCapture?.(e.pointerId);e.preventDefault();}
});
canvas.addEventListener('pointermove',e=>{
 if(state.scene!=='coffee'||bppCoffeePointerId!==e.pointerId)return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
 bppCoffeePointerMove(x,y);e.preventDefault();
});
canvas.addEventListener('pointerup',e=>{
 if(state.scene!=='coffee'||bppCoffeePointerId!==e.pointerId)return;
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
 bppCoffeePointerId=null;bppCoffeePointerUp(x,y);e.preventDefault();
});
canvas.addEventListener('pointercancel',e=>{if(bppCoffeePointerId===e.pointerId){bppCoffeePointerId=null;bppCoffeeDrag=null;drawWorld();}});
canvas.addEventListener('click',e=>{
 const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;
 if(state.scene==='coffee')return;
 if(state.scene!=='pc')return;
 if(bppPcWindow){
  if(x>=725&&x<=755&&y>=75&&y<=103){bppPcWindow=null;drawWorld();return;}
  // Printer is a separate object beside the monitor. Allow it to be clicked
  // even while the PDF window is open.
  if(bppPcWindow==='erdkkpdf'&&bppPrintStep===0&&x>=850&&x<=935&&y>=385&&y<=435){
   bppPrintStep=2;
   showPalmToast('🖨️ Printer berhasil terhubung! Sekarang klik tombol PRINT pada dokumen.');
   $('missionDescription').textContent='Printer terhubung. Klik tombol PRINT pada jendela ERDKK.pdf untuk menyelesaikan misi.';
   drawWorld();return;
  }
  if(bppPcWindow==='erdkkpdf'&&x>=660&&x<=750&&y>=105&&y<=135){
   if(bppPrintStep<2){showPalmToast('Hubungkan PC ke printer terlebih dahulu.');return;}
   bppPrintStep=3;bppPrintStartedAt=performance.now();reward(5,0);save();
   $('missionDescription').textContent='🖨️ Berhasil! Dokumen e-RDKK selesai dicetak. Hadiah +5 XP.';
   showPalmToast('🎉 Misi berhasil! Dokumen e-RDKK telah dicetak. +5 XP');
   drawWorld();return;
  }
  return;
 }
 if(x>=350&&x<=400&&y>=65&&y<=125){bppPcWindow='erdkkpdf';bppPrintStep=0;drawWorld();return;}
 if(x>=185&&x<=245&&y>=65&&y<=125){bppPcWindow='computer';drawWorld();return;}
 if(x>=185&&x<=245&&y>=137&&y<=197){bppPcWindow='documents';drawWorld();return;}
 if(x>=260&&x<=330&&y>=65&&y<=125)openBppPortal('https://simluh.pertanian.go.id/','SIMLUHTAN');
 else if(x>=260&&x<=330&&y>=137&&y<=197)openBppPortal('https://erdkk.pertanian.go.id/','e-RDKK');
 else if(x>=260&&x<=330&&y>=209&&y<=269)openBppPortal('https://ebanper.pertanian.go.id/login','e-Banper');
});
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
   // Pasar Tani memakai bentuk fasad Koperasi Merah Putih: atap seng, dinding putih, rolling door merah
   c.fillStyle='#315b3540';c.fillRect(x+7,y+82,w,9);
   c.fillStyle='#aeb7b7';c.fillRect(x+5,y+25,w-10,62);
   c.fillStyle='#f0f1ed';c.fillRect(x+9,y+28,w-18,55);
   // metal roof with corrugated highlights
   c.fillStyle='#849398';c.beginPath();c.moveTo(x,y+28);c.lineTo(x+85,y-5);c.lineTo(x+170,y+28);c.closePath();c.fill();
   c.fillStyle='#c5d0d3';c.beginPath();c.moveTo(x+5,y+26);c.lineTo(x+85,y-1);c.lineTo(x+165,y+26);c.closePath();c.fill();
   c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1;for(let k=0;k<13;k++){const xx=x+7+k*13;c.beginPath();c.moveTo(xx,y+25);c.lineTo(x+85+(xx-x-85)*.13,y);c.stroke();}
   for(let k=0;k<3;k++){const dx=x+14+k*35;c.fillStyle='#ad302c';c.fillRect(dx,y+42,29,40);c.strokeStyle='#7f2523';c.strokeRect(dx,y+42,29,40);c.strokeStyle='rgba(255,210,190,.35)';for(let yy=y+48;yy<y+80;yy+=6){c.beginPath();c.moveTo(dx+2,yy);c.lineTo(dx+27,yy);c.stroke();}}
   c.fillStyle='#d5d9d6';c.fillRect(x+121,y+39,38,44);c.fillStyle='#44302d';c.fillRect(x+126,y+43,28,40);
   c.fillStyle='#a52e2b';c.font='bold 7px Nunito';c.textAlign='center';c.fillText('PASAR TANI',x+139,y+35);
   c.fillStyle='#315b35';c.font='bold 11px Nunito';c.textAlign='center';c.fillText('PASAR TANI',x+85,y+13);
   ['🍅','🌽','🌶️'].forEach((e,i)=>{c.font='12px serif';c.fillText(e,x+32+i*36,y+77);});
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
function refreshFarmWallet(){
 const value=String(Number(state.coins)||0);
 ['farmCoins','gameCoins','coinValue','profileCoins'].forEach(id=>{const el=$(id);if(el)el.textContent=value;});
}
function updateFarm(){
 if(!$('farmPanel'))return;
 refreshFarmWallet();
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
   if(!plot.crop||plot.fertilized||state.coins<4)return;state.coins-=4;plot.fertilized=true;refreshFarmWallet();farmNotify('Pupuk diberikan. Pertumbuhan lebih cepat.');farmToast('Pemupukan berhasil','Biaya 4 koin. Pertumbuhan tanaman lebih cepat.','🧪');
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
 state.coins-=price;state.farmUnlockedPlots++;state.farmSelectedPlot=i;save();refreshFarmWallet();updateFarm();
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
 body.querySelectorAll('[data-buy-seed]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.buySeed,c=farmCrops[id];if(state.coins<c.seedPrice){farmNotify('Koin belum cukup untuk membeli benih.');return;}state.coins-=c.seedPrice;state.farmSeeds[id]=(state.farmSeeds[id]||0)+1;state.farmSelectedCrop=id;save();refreshFarmWallet();updateFarm();farmToast('Pembelian berhasil','1 benih '+c.name+' dibeli. -'+c.seedPrice+' koin. Sisa stok: '+state.farmSeeds[id]+'.','🛍️');openFarmDialog('shop');}));
 body.querySelector('[data-buy-pesticide]')?.addEventListener('click',()=>{if(state.coins<12){farmNotify('Koin belum cukup. Pestisida membutuhkan 12 koin.');return;}state.coins-=12;state.farmPesticides++;save();refreshFarmWallet();updateFarm();farmToast('Pestisida dibeli','1 botol pestisida masuk inventaris. -12 koin.','🧴');openFarmDialog('shop');});
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
