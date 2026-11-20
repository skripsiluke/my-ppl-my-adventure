(() => {
'use strict';
const $ = id => document.getElementById(id);
const KEY = 'myPplMyAdventure.save.v1';
const XP_PER_LEVEL=250;
const state = {name:'Penyuluh Muda',xp:0,coins:0,missionDone:false,pakMissionRewarded:false,buMissionDone:false,buMissionRewarded:false,ketuaMissionDone:false,ketuaMissionRewarded:false,farmStage:0,questionIndex:0,quizScore:0,harvestCount:0,correctQuizCount:0,unlockedAchievements:[],achievementRewardsClaimed:[],highestLevelReached:1,missionFlags:{},pmaas:{stages:{},milestones:[],farmers:0,groups:0,xpEarned:0,drumSeederCompleted:false,adopterProgress:{}},player:{x:145,y:390},keys:{},interact:false};
const screens=['homeScreen','menuScreen','gameScreen'];
function save(){
  localStorage.setItem(KEY, JSON.stringify({
    name:state.name,
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
    player:state.player
  }));
}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s){Object.assign(state,s);if(!Object.prototype.hasOwnProperty.call(s,'highestLevelReached'))state.highestLevelReached=Math.floor((Number(s.xp)||0)/XP_PER_LEVEL)+1;}
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
  state.highestLevelReached=Math.max(1,Math.min(Number(state.highestLevelReached)||Math.floor(state.xp/XP_PER_LEVEL)+1,Math.floor(state.xp/XP_PER_LEVEL)+1));
  state.missionFlags=state.missionFlags&&typeof state.missionFlags==='object'?state.missionFlags:{};
  state.pmaas=state.pmaas&&typeof state.pmaas==='object'?state.pmaas:{stages:{},milestones:[],farmers:0,groups:0,xpEarned:0,drumSeederCompleted:false,adopterProgress:{}};
  state.pmaas.stages=state.pmaas.stages&&typeof state.pmaas.stages==='object'?state.pmaas.stages:{};
  state.pmaas.milestones=Array.isArray(state.pmaas.milestones)?state.pmaas.milestones:[];
  state.pmaas.farmers=Number(state.pmaas.farmers)||0;state.pmaas.groups=Number(state.pmaas.groups)||0;state.pmaas.xpEarned=Number(state.pmaas.xpEarned)||0;state.pmaas.drumSeederCompleted=!!state.pmaas.drumSeederCompleted;state.pmaas.adopterProgress=state.pmaas.adopterProgress&&typeof state.pmaas.adopterProgress==='object'?state.pmaas.adopterProgress:{};
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
 ...extraMissions.map(m=>({id:m.id,done:()=>!!state.missionFlags[m.id],text:'Temui '+m.name+': '+m.title.replace(/^Misi [^:]+: /,''),reward:'+'+m.xp+' XP'}))
];
function missionDone(id){const m=missionInfo.find(x=>x.id===id);return m?m.done():false;}
function missionTotal(){return missionInfo.filter(m=>m.done()).length;}
function nextMission(){return missionInfo.find(m=>!m.done())||null;}
function updateStats(){const count=missionTotal();$('missionStatus').textContent=count+'/'+missionInfo.length+' Misi selesai';$('missionStatus').classList.toggle('completed',count===missionInfo.length);$('xpValue').textContent=state.xp;$('coinValue').textContent=state.coins;$('gameCoins').textContent=state.coins;const level=Math.floor(state.xp/XP_PER_LEVEL)+1;const progress=state.xp%XP_PER_LEVEL;$('levelLabel').textContent='LEVEL '+level;$('levelTitle').textContent=levelName(level);$('levelXp').textContent=progress;$('levelProgress').style.width=(progress/XP_PER_LEVEL*100)+'%';const next=nextMission();$('dailyMissionText').textContent=next?next.text:'Semua misi Adventure selesai! Jelajahi desa, simulasi, dan kuis.';$('dailyMissionReward').textContent=next?next.reward:'SEMUA SELESAI';$('missionDescription').textContent=next?next.text:'Semua misi Adventure selesai. Terima kasih telah membantu Desa Sukamaju!';updateProfile();renderPMAAS();}

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

$('pmaasOpen').addEventListener('click',()=>{$('pmaasPanel').classList.remove('hidden');renderPMAAS();renderDrumSeeder();$('pmaasPanel').scrollIntoView({behavior:'smooth',block:'start'});});
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
 const level=Math.floor(state.xp/XP_PER_LEVEL)+1;
 if($('profileName'))$('profileName').textContent=state.name;
 if($('profileRank'))$('profileRank').textContent=levelName(level)+' • Level '+level;
 if($('profileXp'))$('profileXp').textContent=state.xp;
 if($('profileCoins'))$('profileCoins').textContent=state.coins;
 if($('profileBadges'))$('profileBadges').textContent=(state.unlockedAchievements||[]).length+'/'+achievementList.length;
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
$('profileToggle').addEventListener('click',()=>$('profilePanel').classList.toggle('hidden'));
$('closeLevelUp').addEventListener('click',()=>$('levelUpOverlay').classList.add('hidden'));
function showLevelUp(level,bonus){
 $('levelUpTitle').textContent='LEVEL '+level+'!';$('levelUpRank').textContent=levelName(level);$('levelUpBonus').textContent='Bonus kenaikan level: +'+bonus+' koin';
 $('levelUpOverlay').classList.remove('hidden');playSound('level');
}
function reward(xp,coins){
 const oldLevel=Math.floor(state.xp/XP_PER_LEVEL)+1;
 state.xp+=xp;state.coins+=coins;
 const newLevel=Math.floor(state.xp/XP_PER_LEVEL)+1;let levelBonus=0;
 while(state.highestLevelReached<newLevel){state.highestLevelReached++;state.coins+=25;levelBonus+=25;}
 updateStats();checkAchievements();save();
 if(newLevel>oldLevel)showLevelUp(newLevel,levelBonus);
 else playSound('success');
}

/* Background music and persistent audio settings */
const SETTINGS_KEY='myPplMyAdventure.settings.v1';
const bgm=$('bgmAudio');
const audioSettings={bgmEnabled:true,bgmVolume:0.7};
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

loadAudioSettings();
load();updateStats();checkAchievements();$('playerName').value=state.name==='Penyuluh Muda'?'':state.name;
$('startButton').addEventListener('click',()=>{startBgm();const n=$('playerName').value.trim();if(n)state.name=n;$('welcomeName').textContent=state.name+'!';showScreen('menuScreen');updateProfile();save();});
$('resetButton').addEventListener('click',()=>{if(confirm('Hapus seluruh progres permainan di perangkat ini?')){localStorage.removeItem(KEY);location.reload();}});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>openMode(b.dataset.mode)));
$('backButton').addEventListener('click',()=>{stopWorld();showScreen('menuScreen');});
function openMode(mode){stopWorld();showScreen('gameScreen');['adventurePanel','farmPanel','quizPanel'].forEach(id=>$(id).classList.add('hidden'));if(mode==='adventure'){$('gameEyebrow').textContent='MODE ADVENTURE';$('gameTitle').textContent='Desa Sukamaju';$('adventurePanel').classList.remove('hidden');startWorld();}if(mode==='farm'){$('gameEyebrow').textContent='MODE FARM SIMULATOR';$('gameTitle').textContent='Kebun Belajar';$('farmPanel').classList.remove('hidden');updateFarm();}if(mode==='quiz'){$('gameEyebrow').textContent='MODE QUIZ CHALLENGE';$('gameTitle').textContent='Uji Pengetahuanmu';$('quizPanel').classList.remove('hidden');state.questionIndex=0;state.quizScore=0;renderQuestion();}}
/* Top-down world: world coordinates are larger than the viewport; camera follows player. */
const canvas=$('worldCanvas'),ctx=canvas.getContext('2d');
const WORLD={w:1800,h:1200};let raf=0,last=0,dialogOpen=false;
const npcs=[
{id:'pak',name:'Pak Tani',x:1160,y:510,emoji:'👨‍🌾',role:'Petani padi',kind:'mission'},
{id:'bu',name:'Bu Rina',x:390,y:330,emoji:'👩‍🌾',role:'Anggota kelompok tani',kind:'mission'},
{id:'ketua',name:'Pak Ketua',x:760,y:690,emoji:'🧑‍🌾',role:'Ketua kelompok tani',kind:'mission'},
...extraMissions.map(m=>({...m,kind:'mission'}))
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
 npcs.forEach(n=>{const done=missionDone(n.id);ctx.font='38px serif';ctx.textAlign='center';ctx.fillText(n.emoji,n.x,n.y+8);ctx.font='bold 14px Nunito';ctx.fillStyle='#23452c';ctx.fillText(n.name,n.x,n.y+27);if(n.kind==='mission'){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(n.x,n.y-32,15,0,Math.PI*2);ctx.fill();ctx.fillStyle=done?'#23834b':'#d88b1f';ctx.font='bold 17px Nunito';ctx.fillText(done?'✓':'!',n.x,n.y-26);}});
 // player shadow and character
 ctx.fillStyle='#31552c55';ctx.beginPath();ctx.ellipse(state.player.x,state.player.y+8,16,7,0,0,Math.PI*2);ctx.fill();ctx.font='38px serif';ctx.textAlign='center';ctx.fillText('🧑‍🌾',state.player.x,state.player.y+5);
 // proximity indicator
 const near=nearestNpc();if(near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<82){ctx.fillStyle='#174d32';ctx.font='bold 15px Nunito';ctx.fillText('Tekan E untuk bicara',state.player.x,state.player.y-34);}
 ctx.restore();
 $('worldLocation').textContent=near&&Math.hypot(near.x-state.player.x,near.y-state.player.y)<100?'📍 '+near.name:'📍 Desa Sukamaju';
 const next=nextMission();$('worldObjective').textContent=next?'🎯 '+next.text:'⭐ Semua misi desa selesai';
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
    $('missionDescription').textContent='Belum ada warga di dekatmu. Dekati salah satu warga desa.';
    return;
  }
  openNpcDialog(n);
}
function openNpcDialog(n){
  stopWorld();dialogOpen=true;$('dialog').classList.remove('hidden');$('dialogEmoji').textContent=n.emoji;$('dialogEyebrow').textContent=n.role.toUpperCase();$('dialogChoices').innerHTML='';$('closeDialog').classList.add('hidden');
 if(n.id==='pak'){
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
  const oldLevel=Math.floor(state.xp/XP_PER_LEVEL)+1;
  state.xp+=xp;state.coins+=coins;
  const newLevel=Math.floor(state.xp/XP_PER_LEVEL)+1;let bonus=0;
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
$('interactButton').addEventListener('click',interact);
/* Farm simulator */
function updateFarm(){const stages=['🟫','🌱','🌿','🌾'];$('cropEmoji').textContent=stages[state.farmStage];$('plantButton').disabled=state.farmStage!==0;$('waterButton').disabled=state.farmStage!==1;$('harvestButton').disabled=state.farmStage!==2;$('farmStatus').textContent=['Lahan masih kosong. Mulai dengan menanam benih.','Benih sudah ditanam. Tanaman membutuhkan air.','Tanaman tumbuh subur. Saatnya panen!','Panen berhasil! Kamu memperoleh hasil dari kerja kerasmu.'][state.farmStage];}
$('plantButton').addEventListener('click',()=>{state.farmStage=1;reward(5,0);updateFarm();});$('waterButton').addEventListener('click',()=>{state.farmStage=2;reward(5,0);updateFarm();});$('harvestButton').addEventListener('click',()=>{state.farmStage=3;state.harvestCount++;reward(20,15);updateFarm();setTimeout(()=>{state.farmStage=0;updateFarm();save();},1800);});
/* Quiz */
const questions=[
{q:'Apa tujuan utama penyuluhan pertanian?',a:['Menggantikan seluruh keputusan petani','Meningkatkan pengetahuan, keterampilan, dan sikap petani','Menjual sarana produksi sebanyak-banyaknya','Mewajibkan satu teknologi untuk semua petani'],c:1,why:'Penyuluhan membantu petani meningkatkan kapasitas agar mampu mengambil keputusan secara mandiri.'},
{q:'Apa langkah awal ketika menemukan gejala serangan hama di lahan?',a:['Mengidentifikasi gejala dan organisme penyebab','Mencampur semua pestisida','Menaikkan dosis pupuk','Langsung memusnahkan seluruh tanaman'],c:0,why:'Pengamatan dan identifikasi menjadi dasar menentukan tindakan pengendalian yang tepat.'},
{q:'Apa kepanjangan PHT?',a:['Pengelolaan Hasil Tanaman','Pengamatan Harian Terpadu','Pengendalian Hama Terpadu','Program Hasil Tani'],c:2,why:'PHT adalah Pengendalian Hama Terpadu.'},
{q:'Mengapa petani perlu melakukan pemupukan berimbang?',a:['Agar pupuk digunakan sebanyak mungkin','Agar kebutuhan hara tanaman terpenuhi sesuai kondisi dan rekomendasi','Agar tidak perlu mengairi tanaman','Agar semua jenis tanah mendapat dosis sama'],c:1,why:'Pemupukan berimbang menyesuaikan kebutuhan hara, kondisi tanah, dan rekomendasi.'},
{q:'Dalam penyuluhan, metode demonstrasi bertujuan untuk…',a:['Memperlihatkan praktik atau cara kerja teknologi secara langsung','Menggantikan seluruh diskusi kelompok','Menguji hafalan istilah saja','Membatasi petani untuk bertanya'],c:0,why:'Demonstrasi memberi kesempatan sasaran melihat proses dan praktik penerapan teknologi.'}
];
function renderQuestion(){const q=questions[state.questionIndex];$('questionCount').textContent=`Soal ${state.questionIndex+1} dari ${questions.length}`;$('questionText').textContent=q.q;$('quizFeedback').textContent='';$('nextQuestionButton').classList.add('hidden');$('answerList').innerHTML='';q.a.forEach((a,i)=>{const b=document.createElement('button');b.className='answer-option';b.textContent=String.fromCharCode(65+i)+'. '+a;b.addEventListener('click',()=>{const all=$('answerList').querySelectorAll('button');all.forEach(x=>x.disabled=true);if(i===q.c){b.classList.add('correct');$('quizFeedback').textContent='Benar! '+q.why;state.quizScore++;state.correctQuizCount++;reward(10,3);}else{b.classList.add('wrong');all[q.c].classList.add('correct');$('quizFeedback').textContent='Belum tepat. '+q.why;}$('nextQuestionButton').classList.remove('hidden');});$('answerList').appendChild(b);});}
$('nextQuestionButton').addEventListener('click',()=>{state.questionIndex++;if(state.questionIndex<questions.length){renderQuestion();}else{$('questionText').textContent=`Kuis selesai! Skor kamu ${state.quizScore} dari ${questions.length}.`;$('answerList').innerHTML='';$('quizFeedback').textContent='Terus belajar dan tingkatkan kemampuan penyuluhanmu!';$('nextQuestionButton').textContent='Ulangi kuis';$('nextQuestionButton').onclick=()=>{state.questionIndex=0;state.quizScore=0;$('nextQuestionButton').textContent='Soal berikutnya →';$('nextQuestionButton').onclick=null;renderQuestion();};}});
})();
