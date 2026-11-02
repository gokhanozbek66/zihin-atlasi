/* Data and calendar rules shared by the application and its tests. No network. */
(function (root) {
  'use strict';
  const KEY = 'zihin-atlasi-v2';
  const LEGACY_KEY = 'zihin-atlasi-v1';
  const DEFAULT_TASKS = [
    {id:'biography',title:'Bir hayatın içine gir',detail:'Steve Jobs · Walter Isaacson',minutes:10,icon:'book',color:'',enabled:true},
    {id:'speech',title:'Sesine yeni bir güç kat',detail:'I Have a Dream · dinle ve sesli tekrar et',minutes:5,icon:'mic',color:'purple',enabled:true},
    {id:'vocabulary',title:'Üç yeni kelime, üç yeni kapı',detail:'İngilizce kelimeler öğren, kendi cümleni kur',minutes:5,icon:'letters',color:'peach',enabled:true},
    {id:'article',title:'Bir fikrin peşine düş',detail:'Bilim, kültür veya felsefeden bir makale',minutes:10,icon:'sun',color:'',enabled:true},
    {id:'podcast',title:'Dünyaya kulak ver',detail:'99% Invisible · bir bölümden birkaç dakika',minutes:5,icon:'headphones',color:'blue',enabled:true},
    {id:'literature',title:'Başka bir dünyaya yolculuk',detail:'The Kite Runner · Khaled Hosseini',minutes:10,icon:'globe',color:'purple',enabled:true}
  ];
  const intervals = [1,3,7,14,30];
  const record = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const uid = () => root.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  function dateKey(date = new Date()) {return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
  function parseDate(key) {const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d,12);}
  function validDate(key) {return typeof key==='string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && dateKey(parseDate(key))===key && +key.slice(0,4)>=1900 && +key.slice(0,4)<=2200;}
  function addDays(key,n) {const date=parseDate(key);date.setDate(date.getDate()+n);return dateKey(date);}
  function empty() {return {version:2,checks:{},notes:{},words:[],tasks:DEFAULT_TASKS.map(t=>({...t})),settings:{name:'',installDismissed:false,lastBackup:null},saved:[],focus:{minutes:10,remaining:600,endAt:null,taskId:'biography'}};}
  function migrate(old) {
    if(!record(old)||!record(old.checks)||!record(old.notes)||!Array.isArray(old.words))throw Error('Geçersiz eski yedek.');
    const db=empty();
    for(const [key,value] of Object.entries(old.checks)) {
      const match=/^(\d{1,2})-([0-5])$/.exec(key);if(!match||+match[1]<1||+match[1]>30||typeof value!=='boolean')throw Error('Eski görev kaydı geçersiz.');
      const day='2026-11-'+match[1].padStart(2,'0');db.checks[day]||={};if(value)db.checks[day][DEFAULT_TASKS[+match[2]].id]={done:true,minutes:DEFAULT_TASKS[+match[2]].minutes};
    }
    for(const [key,value] of Object.entries(old.notes)){if(!/^([1-9]|[12]\d|30)$/.test(key)||typeof value!=='string')throw Error('Eski not kaydı geçersiz.');db.notes['2026-11-'+key.padStart(2,'0')]=value;}
    db.words=old.words.map(w=>{if(!record(w))throw Error('Kelime geçersiz.');return {id:uid(),word:w.word,meaning:w.meaning,example:w.example||'',created:'2026-11-01',due:dateKey(),level:0};});
    return validate(db);
  }
  function validate(raw) {
    // Rebuild known properties only; never copy arbitrary imported object keys.
    if(!record(raw)||raw.version!==2||!record(raw.checks)||!record(raw.notes)||!Array.isArray(raw.words)||!Array.isArray(raw.tasks)||!record(raw.settings)||!Array.isArray(raw.saved))throw Error('Yedek biçimi tanınmadı.');
    const db=empty();
    function str(value,max,allowEmpty=true){if(typeof value!=='string'||value.length>max||(!allowEmpty&&!value.trim()))throw Error('Yedekte geçersiz metin var.');return value;}
    if(raw.tasks.length!==DEFAULT_TASKS.length)throw Error('Görev listesi geçersiz.');
    db.tasks=DEFAULT_TASKS.map(base=>{const matches=raw.tasks.filter(t=>record(t)&&t.id===base.id);if(matches.length!==1)throw Error('Görev kimliği geçersiz.');const t=matches[0];if(typeof t.enabled!=='boolean'||!Number.isInteger(t.minutes)||t.minutes<1||t.minutes>120)throw Error('Görev süresi geçersiz.');return {...base,title:str(t.title,100,false),detail:str(t.detail,250),minutes:t.minutes,enabled:t.enabled};});
    if(!db.tasks.some(t=>t.enabled))throw Error('En az bir görev açık kalmalı.');
    for(const [day,checks] of Object.entries(raw.checks)){
      if(!validDate(day)||!record(checks))throw Error('Görev tarihi geçersiz.');db.checks[day]={};
      for(const [id,c] of Object.entries(checks)){if(!DEFAULT_TASKS.some(t=>t.id===id)||!record(c)||typeof c.done!=='boolean'||!Number.isInteger(c.minutes)||c.minutes<1||c.minutes>120)throw Error('Görev kaydı geçersiz.');db.checks[day][id]={done:c.done,minutes:c.minutes};}
    }
    for(const [day,note] of Object.entries(raw.notes)){if(!validDate(day))throw Error('Not tarihi geçersiz.');db.notes[day]=str(note,50000);}
    if(raw.words.length>20000)throw Error('Kelime sayısı sınırı aşıldı.');const ids=new Set();
    db.words=raw.words.map(w=>{if(!record(w)||!validDate(w.created)||!validDate(w.due)||!Number.isInteger(w.level)||w.level<0||w.level>5)throw Error('Kelime kartı geçersiz.');const id=str(w.id,100,false);if(ids.has(id))throw Error('Yinelenen kelime kimliği.');ids.add(id);return {id,word:str(w.word,100,false),meaning:str(w.meaning,500,false),example:str(w.example,2000),created:w.created,due:w.due,level:w.level};});
    db.settings.name=str(raw.settings.name,40);db.settings.installDismissed=raw.settings.installDismissed===true;
    if(raw.settings.lastBackup!==null&&raw.settings.lastBackup!==undefined&&!validDate(raw.settings.lastBackup))throw Error('Yedek tarihi geçersiz.');db.settings.lastBackup=raw.settings.lastBackup||null;
    db.saved=[...new Set(raw.saved.map(id=>str(id,100,false)))];
    const f=raw.focus;
    if(f!==undefined){if(!record(f)||!Number.isInteger(f.minutes)||f.minutes<1||f.minutes>120||!Number.isFinite(f.remaining)||f.remaining<0||f.remaining>7200||(f.endAt!==null&&(!Number.isFinite(f.endAt)||f.endAt<0))||!DEFAULT_TASKS.some(t=>t.id===f.taskId))throw Error('Odak kaydı geçersiz.');db.focus={minutes:f.minutes,remaining:f.remaining,endAt:f.endAt,taskId:f.taskId};}
    return db;
  }
  function importData(raw){if(record(raw)&&raw.version===undefined)return migrate(raw);return validate(raw);}
  function dayStats(db,day){const tasks=db.tasks.filter(t=>t.enabled);const checks=db.checks[day]||{};const done=tasks.filter(t=>checks[t.id]?.done).length;return {done,total:tasks.length,percent:tasks.length?Math.round(done/tasks.length*100):0,complete:tasks.length>0&&done===tasks.length};}
  function activeDay(db,day){return Object.values(db.checks[day]||{}).some(c=>c.done);}
  function streaks(db,today=dateKey()){
    let current=0,cursor=activeDay(db,today)?today:addDays(today,-1);while(activeDay(db,cursor)){current++;cursor=addDays(cursor,-1);}
    let best=0,run=0,previous=null;for(const day of Object.keys(db.checks).filter(d=>d<=today&&activeDay(db,d)).sort()){run=previous&&addDays(previous,1)===day?run+1:1;best=Math.max(best,run);previous=day;}return {current,best};
  }
  function rateWord(w,known,today=dateKey()){if(!known){w.level=0;w.due=today;}else{const index=Math.min(w.level,intervals.length-1);w.due=addDays(today,intervals[index]);w.level=Math.min(5,w.level+1);}return w;}
  const api={KEY,LEGACY_KEY,DEFAULT_TASKS,dateKey,parseDate,validDate,addDays,empty,validate,migrate,importData,dayStats,streaks,activeDay,rateWord,uid};
  root.Atlas=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
