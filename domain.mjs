/** Pure data/query layer. No DOM, hosting provider, or framework dependencies. */
import {BROAD_TOPICS,matchesTopic} from './broad-topics.mjs?v=20261013-1';
export const PRIMARY_TOPICS=BROAD_TOPICS.map(t=>t.label);
export function normalize(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
export function filterRecords(records,state,asOf){
 return records.filter(r=>{
  if(state.program&&r.program!==state.program)return false;
  if(state.q&&!normalize([r.title,r.speaker,r.name,r.program,...(r.tags||[]),...(r.fields||[])].join(' ')).includes(normalize(state.q)))return false;
  if(state.topics.length&&!state.topics.some(t=>matchesTopic(r,t)))return false;
  if(r.kind==='candidate'&&state.cohort&&r.cohort!==state.cohort)return false;
  if(state.paperOnly&&!r.paper_url)return false;
  if(r.kind==='seminar'){
   if(state.period==='upcoming'&&r.date<asOf)return false;
   if(state.period==='past'&&r.date>=asOf)return false;
   if(state.from&&r.date<state.from)return false;
   if(state.to&&r.date>state.to)return false;
  }
  return true;
 });
}
export function parseRoute(hash){
 const [path,query='']=hash.replace(/^#\/?/,'').split('?');const params=new URLSearchParams(query);
 const parts=path.split('/');const view=['seminars','job-market','candidate','seminar'].includes(parts[0])?parts[0]:'seminars';
 return {view,id:['candidate','seminar'].includes(view)?(parts[1]||null):null,q:params.get('q')||'',program:params.get('program')||'',topics:params.getAll('topic'),
  period:['all','upcoming','past'].includes(params.get('period'))?params.get('period'):(['seminars','seminar'].includes(view)&&!params.get('from')&&!params.get('to')?'upcoming':'all'),from:params.get('from')||'',to:params.get('to')||'',paperOnly:params.get('paper')==='1',cohort:params.get('cohort')||''};
}
export function routeHash(state){
 const view=['seminars','job-market','candidate','seminar'].includes(state.view)?state.view:'seminars';
 const p=new URLSearchParams();for(const k of ['q','program','from','to','cohort'])if(state[k]&&!(k==='cohort'&&['seminars','seminar'].includes(view)))p.set(k,state[k]);
 for(const t of state.topics)p.append('topic',t);
 const defaultPeriod=['seminars','seminar'].includes(view)&&!state.from&&!state.to?'upcoming':'all';
 if(state.period!==defaultPeriod)p.set('period',state.period);if(state.paperOnly)p.set('paper','1');
 return '#/'+view+(['candidate','seminar'].includes(view)&&state.id?'/'+state.id:'')+(p.size?'?'+p:'');
}
export function safeUrl(value){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
export function sortRecords(records,view){
 return [...records].sort((a,b)=>view==='job-market'?a.name.localeCompare(b.name):a.date.localeCompare(b.date)||a.program.localeCompare(b.program));
}
export function availableCohorts(rows){return [...new Set(rows.map(r=>r.cohort).filter(v=>/^20\d{2}-20\d{2}$/.test(v||'')&&Number(v.slice(5))-Number(v.slice(0,4))===1))].sort().reverse();}
export function resolvedCohort(requested,rows){const seasons=availableCohorts(rows);return seasons.includes(requested)?requested:seasons[0]||'';}
export function groupRecords(rows){
 const dates=new Map();
 for(const row of rows){
  const date=row.date;
  if(!dates.has(date))dates.set(date,new Map());
  const programs=dates.get(date);if(!programs.has(row.program))programs.set(row.program,[]);programs.get(row.program).push(row);
 }
 return [...dates].map(([date,programs])=>({date,programs:[...programs].sort(([a],[b])=>a.localeCompare(b)).map(([program,records])=>({program,records}))}));
}
