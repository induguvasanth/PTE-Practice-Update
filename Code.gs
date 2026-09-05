// ===== PTE GENERAL PRACTICE V2 - NEW PROJECT CONFIGURATION =====
const SPREADSHEET_ID = '1E5qa4m0riCfxjJ0BxiewxkTz1XXWB1U6QfSJvdaxLlw';
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1E5qa4m0riCfxjJ0BxiewxkTz1XXWB1U6QfSJvdaxLlw/edit?gid=1358389301#gid=1358389301';
// ==============================================================

/**************************************************************
 * PTE ACADEMIC PRACTICE — PREMIUM MASTER BACKEND
 * One Code.gs for the complete NEW project.
 * Spreadsheet: 1KeC_OX3jEgbIg57Cn7tL_rtuQeRYXwXmEzVonXBj0cM
 **************************************************************/

const CONFIG = {
  SPREADSHEET_ID: '1KeC_OX3jEgbIg57Cn7tL_rtuQeRYXwXmEzVonXBj0cM',
  RESULTS_SHEET: 'Results',
  CACHE_SECONDS: 120
};

const TASKS = {
  personalIntroduction:{sheets:['Personal Introduction','PersonalIntroduction'],label:'Personal Introduction'},
  readAloud:{sheets:['Read Aloud','ReadAloud','Questions'],label:'Read Aloud'},
  repeatSentence:{sheets:['Repeat Sentence','RepeatSentence','Repeat Sentences'],label:'Repeat Sentence'},
  describeImage:{sheets:['Describe Image','DescribeImage'],label:'Describe Image'},
  retellLecture:{sheets:['Retell Lecture','Retell Talk','RetellTalk','Retell'],label:'Retell Lecture'},
  answerShortQuestion:{sheets:['Answer Short Question','Short Answer','ShortAnswer'],label:'Answer Short Question'},
  summarizeGroupDiscussion:{sheets:['Summarize Group Discussion','Group Discussion','Summarize Group'],label:'Summarize Group Discussion'},
  respondSituation:{sheets:['Respond to a Situation','Respond Situation','Respond to Situation'],label:'Respond to a Situation'},
  summarizeWrittenText:{sheets:['Summarize Written Text','SummarizeWrittenText'],label:'Summarize Written Text'},
  essay:{sheets:['Write Essay','Essay','Essay Writing'],label:'Write Essay'},

  readingRWBlanks:{sheets:['Reading - R&W Fill Blanks','R&W Fill in the Blanks','Reading R&W Fill Blanks'],label:'Reading & Writing: Fill in the Blanks'},
  readingMCQMultiple:{sheets:['Reading - MCQ Multiple','Reading MCQ Multiple','Reading MCMA'],label:'Reading MCQ Multiple'},
  reorderParagraph:{sheets:['Reading - Reorder Paragraph','Reorder Paragraph','Reading Reorder'],label:'Reorder Paragraph'},
  readingBlanks:{sheets:['Reading - Fill Blanks','Reading Fill in the Blanks','Reading Drag Drop'],label:'Reading Fill in the Blanks'},
  readingMCQSingle:{sheets:['Reading - MCQ Single','Reading MCQ Single'],label:'Reading MCQ Single'},

  summarizeSpoken:{sheets:['Listening - Summarize Spoken','Summarize Spoken Text','Listening Summarize Spoken'],label:'Summarize Spoken Text'},
  listeningMCQMultiple:{sheets:['Listening - MCQ Multiple','Listening MCQ Multiple'],label:'Listening MCQ Multiple'},
  listeningBlanks:{sheets:['Listening - Fill Blanks','Listening Fill in the Blanks','Listening Blanks'],label:'Listening Fill in the Blanks'},
  highlightSummary:{sheets:['Listening - Highlight Summary','Highlight Correct Summary','Listening Highlight Summary'],label:'Highlight Correct Summary'},
  listeningMCQSingle:{sheets:['Listening - MCQ Single','Listening MCQ Single'],label:'Listening MCQ Single'},
  missingWord:{sheets:['Listening - Missing Word','Select Missing Word','Listening Missing Word'],label:'Select Missing Word'},
  incorrectWords:{sheets:['Listening - Incorrect Words','Highlight Incorrect Words','Listening Incorrect Words'],label:'Highlight Incorrect Words'},
  dictation:{sheets:['Listening - Dictation','Write from Dictation','Dictation'],label:'Write from Dictation'},

  grammar:{sheets:['Grammar','Grammar Questions'],label:'Grammar'},
  vocabulary:{sheets:['Vocabulary','Vocabulary Questions'],label:'Vocabulary'},
  mock:{sheets:['Full Mock Test','Full Mock','Mock Test'],label:'Full Mock Test'}
};

function doGet(e){
  const p=e&&e.parameter?e.parameter:{};
  const action=String(p.action||'dashboard').toLowerCase();
  try{
    let data;
    if(action==='dashboard') data=getDashboard();
    else if(action==='speaking') data=getSpeaking();
    else if(action==='reading') data=getSection(['readingRWBlanks','readingMCQMultiple','reorderParagraph','readingBlanks','readingMCQSingle']);
    else if(action==='listening') data=getSection(['summarizeSpoken','listeningMCQMultiple','listeningBlanks','highlightSummary','listeningMCQSingle','missingWord','incorrectWords','dictation']);
    else if(action==='writing') data=getSection(['summarizeWrittenText','essay']);
    else if(action==='grammar') data=getQuestions('grammar');
    else if(action==='vocabulary') data=getQuestions('vocabulary');
    else if(action==='mock') data=getQuestions('mock');
    else if(action==='progress') data=getProgress();
    else if(action==='diagnose') data=diagnose();
    else if(TASKS[action]) data=getQuestions(action);
    else data={ok:false,error:'Unknown action: '+action};
    return output_(data,p.callback);
  }catch(err){return output_({ok:false,error:String(err&&err.message||err),action:action},p.callback)}
}

function doPost(e){
  try{
    const p=e&&e.parameter?e.parameter:{};
    saveResult_(p);
    return ContentService.createTextOutput(JSON.stringify({ok:true,saved:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

function output_(obj,cb){
  const json=JSON.stringify(obj);
  if(cb){
    const safe=String(cb).replace(/[^\w.$]/g,'');
    return ContentService.createTextOutput(safe+'('+json+')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getDashboard(){
  const p=getProgress().progress;
  return {ok:true,project:'PTE Academic Practice',spreadsheetId:CONFIG.SPREADSHEET_ID,progress:p};
}

function getSpeaking(){
  const keys=['personalIntroduction','readAloud','repeatSentence','describeImage','retellLecture','answerShortQuestion','summarizeGroupDiscussion','respondSituation','summarizeWrittenText','essay'];
  const out={}; keys.forEach(k=>out[k]=getQuestions(k));
  return {ok:true,speaking:out};
}

function getSection(keys){
  const out={}; keys.forEach(k=>out[k]=getQuestions(k));
  return {ok:true,section:out};
}

function getQuestions(key){
  const cfg=TASKS[key];
  if(!cfg) return {ok:false,questions:[],count:0,error:'Task not configured'};
  const found=findSheet_(cfg.sheets);
  if(!found.sheet) return {ok:true,questions:[],count:0,sheetName:'',warning:'Sheet not found',task:key,label:cfg.label};
  const cache=CacheService.getScriptCache();
  const cacheKey='q_'+normalize_(found.sheet.getName());
  const cached=cache.get(cacheKey);
  if(cached){try{return JSON.parse(cached)}catch(e){}}
  const values=found.sheet.getDataRange().getDisplayValues();
  if(!values.length) return {ok:true,questions:[],count:0,sheetName:found.sheet.getName(),task:key,label:cfg.label};
  const headerGuess=isHeaderRow_(values[0]);
  const headers=headerGuess?values[0].map(normalize_):[];
  const rows=headerGuess?values.slice(1):values;
  const questions=[];
  rows.forEach((row,i)=>{
    if(row.every(v=>String(v).trim()==='')) return;
    const q=rowToQuestion_(row,headers,headerGuess,i+(headerGuess?2:1),key);
    if(q.text||q.audioUrl||q.imageUrl||q.question) questions.push(q);
  });
  const result={ok:true,questions:questions,count:questions.length,sheetName:found.sheet.getName(),task:key,label:cfg.label};
  try{cache.put(cacheKey,JSON.stringify(result),CONFIG.CACHE_SECONDS)}catch(e){}
  return result;
}

function isHeaderRow_(row){
  const s=row.map(normalize_);
  const headerWords=['id','question','prompt','text','paragraph','sentence','audio','audiourl','image','imageurl','answer','optiona','optionb','optionc','optiond','type'];
  let hits=0;
  s.forEach(x=>{if(headerWords.indexOf(x)>=0)hits++});
  return hits>0;
}

function rowToQuestion_(row,h,headerMode,rowNum,key){
  const get=(names)=>{
    if(headerMode){
      for(const n of names){const i=h.indexOf(normalize_(n));if(i>=0&&String(row[i]).trim()!=='')return String(row[i]).trim();}
    }else{
      const idxMap={id:0,text:0,question:0,prompt:0,paragraph:0,sentence:0,audioUrl:1,imageUrl:2,answer:3};
      for(const n of names){if(idxMap[n]!==undefined&&idxMap[n]<row.length&&String(row[idxMap[n]]).trim()!=='')return String(row[idxMap[n]]).trim();}
    }
    return '';
  };
  const q={id:get(['id','no','number','question no'])||String(rowNum),text:get(['text','paragraph','sentence','prompt','question','content','topic']),question:get(['question','prompt','text','paragraph']),prompt:get(['prompt','question','text']),audioUrl:get(['audio url','audio','audiourl','audio link','sound url']),imageUrl:get(['image url','image','imageurl','picture url','picture']),answer:get(['answer','correct answer','correct','key','model answer','sample answer']),type:get(['type','task','question type'])||key,row:rowNum,options:[]};
  if(headerMode){
    ['A','B','C','D','E','F'].forEach(l=>{
      const names=['option '+l,'option'+l,'choice '+l,l];
      const v=get(names); if(v)q.options.push(v);
    });
  }else{
    for(let j=4;j<Math.min(row.length,10);j++) if(String(row[j]).trim()!=='') q.options.push(String(row[j]).trim());
  }
  return q;
}

function findSheet_(aliases){
  const ss=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const all=ss.getSheets();
  const norm=all.map(s=>({sheet:s,n:normalize_(s.getName())}));
  for(const a of aliases){const n=normalize_(a);const x=norm.find(v=>v.n===n);if(x)return x;}
  for(const a of aliases){const n=normalize_(a);const x=norm.find(v=>v.n.includes(n)||n.includes(v.n));if(x)return x;}
  return {sheet:null};
}

function saveResult_(p){
  const ss=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sh=ss.getSheetByName(CONFIG.RESULTS_SHEET);
  if(!sh) sh=ss.insertSheet(CONFIG.RESULTS_SHEET);
  if(sh.getLastRow()===0) sh.appendRow(['Timestamp','Task','Question ID','Expected','Response','Practice Score','Content','Fluency','Pronunciation','Accuracy','Duration','Words']);
  sh.appendRow([new Date(),p.task||'',p.questionId||'',p.expectedText||'',p.response||p.spokenText||p.answer||'',num_(p.pteScore),num_(p.content),num_(p.fluency),num_(p.pronunciation),num_(p.accuracy),num_(p.duration),num_(p.words)]);
}

function getProgress(){
  const progress={attempts:0,average:null,best:null,recent:[]};
  const found=findSheet_([CONFIG.RESULTS_SHEET,'Practice Results','Score Results']);
  if(!found.sheet)return {ok:true,progress:progress};
  const v=found.sheet.getDataRange().getDisplayValues();
  if(v.length<2)return {ok:true,progress:progress};
  const h=v[0].map(normalize_);
  const taskI=firstIndex_(h,['task','module']), scoreI=firstIndex_(h,['practicescore','score','overall']), dateI=firstIndex_(h,['timestamp','date']);
  const scores=[]; progress.attempts=v.length-1;
  v.slice(1).forEach(r=>{const s=Number(scoreI>=0?r[scoreI]:'');if(isFinite(s))scores.push(s)});
  if(scores.length){progress.average=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);progress.best=Math.max.apply(null,scores);}
  progress.recent=v.slice(Math.max(1,v.length-6)).reverse().map(r=>({date:dateI>=0?r[dateI]:'',task:taskI>=0?r[taskI]:'',score:scoreI>=0?r[scoreI]:''}));
  return {ok:true,progress:progress};
}

function diagnose(){
  const ss=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const names=ss.getSheets().map(s=>s.getName());
  const matched={};
  Object.keys(TASKS).forEach(k=>matched[k]=findSheet_(TASKS[k].sheets).sheet?findSheet_(TASKS[k].sheets).sheet.getName():null);
  return {ok:true,spreadsheetId:CONFIG.SPREADSHEET_ID,sheets:names,matched:matched};
}
function normalize_(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function firstIndex_(h,n){for(const x of n){const i=h.indexOf(normalize_(x));if(i>=0)return i}return -1}
function num_(v){const n=Number(v);return isFinite(n)?n:''}
