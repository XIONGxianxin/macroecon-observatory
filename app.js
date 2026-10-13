/** Data loading, route state, focus and reading-position preservation. */
import {filterRecords,parseRoute,routeHash,sortRecords,availableCohorts,resolvedCohort} from './domain.mjs?v=20261013-1';
import {esc,candidateDetail,seminarDetail,coverageView,groupedResults,missingLegend} from './views.js?v=20261013-1';
import {attachDateControls,validateDateForm} from './date-controls.mjs?v=20261013-1';
import {controls,syncControls} from './controls.js?v=20261013-1';
import {toggleTopic,selectedBroadTopic} from './broad-topics.mjs?v=20261013-1';
import {mountIcons,disposeIcons,syncPanelIcons} from './icon-ui.js?v=20261013-1';
import {fitBrand} from './brand-fit.js?v=20261013-1';
import {COPY,wording} from './content.js?v=20261013-1';
import {brandMarkup,DIRECTIONS} from './identity.mjs?v=20261013-1';
import {menuMarkup,attachSiteMenu} from './site-menu.js?v=20261013-1';
import {transitionPage,cancelPageTransition,unfoldPanel} from './motion.js?v=20261013-1';
import {footerMarkup} from './footer.js?v=20261013-1';
import {attachMissingHints} from './missing-content.js?v=20261013-1';

const main=document.querySelector('main');
let data,pendingFocus,renderedDay,renderedRoute;
const snapshots=new Map();
const localToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const state=(hash=location.hash)=>{
 const s=parseRoute(hash);
 if(['seminars','seminar'].includes(s.view))s.cohort='';
 else if(data)s.cohort=resolvedCohort(s.cohort,data.candidates.candidates);
 return s;
};
const key=hash=>routeHash(state(hash));
const change=patch=>{
 const hash=routeHash({...state(),...patch});
 if(location.hash===hash){restoreFocus(pendingFocus);pendingFocus=null;return;}
 location.hash=hash;
};
function rememberFocus(element=document.activeElement){
 if(!main.contains(element))return null;
 if(element.dataset.focusKey)return {key:element.dataset.focusKey};
 if(element.name)return {name:element.name};
 if(element.dataset.topic)return {topic:element.dataset.topic};
 if(element.matches('.apply'))return {apply:true};
 return null;
}
function restoreFocus(target){
 if(!target)return;
 const element=target.key?[...main.querySelectorAll('[data-focus-key]')].find(e=>e.dataset.focusKey===target.key):target.name?[...main.querySelectorAll('[name]')].find(e=>e.name===target.name):target.topic?[...main.querySelectorAll('#filters [data-topic]')].find(e=>e.dataset.topic===target.topic):main.querySelector('.apply');
 if(element)for(let parent=element.parentElement;parent&&parent!==main;parent=parent.parentElement)if(parent.matches('details[data-ui-key]')&&parent.querySelector(':scope>summary')!==element)parent.open=true;
 element?.focus({preventScroll:true});
}
function snapshot(){
 return {scroll:window.scrollY,focus:rememberFocus(),open:Object.fromEntries([...main.querySelectorAll('details[data-ui-key]')].map(e=>[e.dataset.uiKey,e.dataset.panelOpen===undefined?e.open:e.dataset.panelOpen==='true']))};
}
function restoreDisclosures(saved){
 if(saved)main.querySelectorAll('details[data-ui-key]').forEach(e=>{if(e.dataset.uiKey in saved.open){e.open=saved.open[e.dataset.uiKey];if(e.matches('.control-panel'))e.dataset.panelOpen=String(e.open);}});
 syncPanelIcons(main,false);
}
function shell(){
 document.documentElement.lang=COPY.date.locale;
 document.querySelector('.brand').innerHTML=brandMarkup(COPY.site);
 document.querySelector('.brand').setAttribute('aria-label',COPY.site.name);
 fitBrand(document.querySelector('.brand'));
 document.querySelector('meta[name=description]').content=COPY.site.description;
 document.querySelectorAll('nav a').forEach(a=>{a.textContent=COPY.nav[a.hash.slice(2)];});
 document.querySelector('#site-menu-slot').innerHTML=menuMarkup();
 attachSiteMenu(direction=>{
  if(!Object.hasOwn(DIRECTIONS,direction))return;const saved=snapshot();
  document.documentElement.dataset.direction=direction;try{localStorage.setItem('margin-direction',direction);}catch{}
  const url=new URL(location.href);url.searchParams.set('direction',direction);history.replaceState(null,'',url);
  if(data){cancelPageTransition(main);render();restoreDisclosures(saved);window.scrollTo(0,saved.scroll);}
 });
 document.querySelector('.skip-link').textContent=COPY.site.skip;
 document.querySelector('footer').innerHTML=footerMarkup();
 main.innerHTML=`<p>${esc(COPY.site.loading)}</p>`;
}
function render(preserveTools=false){
 const s=state(),c=COPY.records,seasons=availableCohorts(data.candidates.candidates);
 const keepTools=preserveTools&&main.querySelector('#filters')&&renderedRoute?.view===s.view&&renderedRoute?.cohort===s.cohort;
 renderedDay=localToday();renderedRoute=s;
 document.querySelectorAll('nav a').forEach(a=>{
  const active=a.hash==='#/'+(s.view==='candidate'?'job-market':s.view==='seminar'?'seminars':s.view);
  if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 if(['candidate','seminar'].includes(s.view)){
  const r=(s.view==='candidate'?data.candidates.candidates:data.seminars.events).find(r=>r.id===s.id);
  document.title=(r?(r.name||r.title||COPY.records.unknownTitle):COPY.empty.candidate)+' · '+COPY.site.name;
  disposeIcons(main);main.innerHTML=s.view==='candidate'?candidateDetail(r,s):seminarDetail(r,s);return;
 }
 const records=s.view==='seminars'?data.seminars.events:data.candidates.candidates.filter(r=>r.cohort===s.cohort);
 const filtered=sortRecords(filterRecords(records,s,renderedDay),s.view),label=COPY.nav[s.view];
 const caption=s.view==='seminars'?wording(COPY.pages.seminarsCaption,{term:data.collection.term}):wording(COPY.pages.candidatesCaption,{season:s.cohort.replace('-','–')});
 const coverage=s.view==='seminars'?data.seminars.coverage:(data.candidates.coverage_by_cohort?.[s.cohort]||data.candidates.coverage);
 const unit=s.view==='seminars'?(filtered.length===1?c.seminarSingle:c.seminars):(filtered.length===1?c.candidateSingle:c.candidates);
 document.title=label+' · '+COPY.site.name;
 const resultMarkup=filtered.length?groupedResults(filtered,s.view,s,document.documentElement.dataset.direction):`<div class="empty"><h2>${esc(COPY.empty.title)}</h2><p>${esc(COPY.empty.hint)}</p><a href="${esc(routeHash({...parseRoute(''),view:s.view,period:'all',cohort:s.view==='job-market'?s.cohort:''}))}">${esc(COPY.empty.clear)}</a></div>`;
 const coverageMarkup=coverageView(coverage,data.collection.programs.length,s.view,s.program,data.collection.term,s.cohort);
 if(keepTools){
  syncControls(s,{count:filtered.length,total:records.length,unit});
  main.querySelector('#results').innerHTML=resultMarkup;
  main.querySelector('#missing-legend-slot').innerHTML=missingLegend(filtered,document.documentElement.dataset.direction);
  main.querySelector('#coverage-slot').innerHTML=coverageMarkup;
  return;
 }
 disposeIcons(main);
 main.innerHTML=`<div class="heading"><div><h1>${esc(label)}</h1><p class="intro">${esc(caption)}</p></div></div>
 ${controls(s,records,data.collection,seasons,{count:filtered.length,total:records.length,unit})}
 <div id="missing-legend-slot">${missingLegend(filtered,document.documentElement.dataset.direction)}</div>
 <section aria-label="${esc(label)} results" id="results" tabindex="-1">${resultMarkup}</section><div id="coverage-slot">${coverageMarkup}</div>`;
 mountIcons(main);
 const form=document.querySelector('#filters');
 form.addEventListener('submit',event=>{event.preventDefault();applyForm();});
 form.querySelectorAll('select,input[type=checkbox]').forEach(e=>e.addEventListener('change',applyForm));
 attachDateControls(form,applyForm);
}
function closePanel(panel,focus=false){
 if(!panel||!panel.open)return;panel.dataset.panelOpen="false";
 unfoldPanel(panel.querySelector(".tool-panel"),false,()=>{panel.open=false;});
 syncPanelIcons(main);
 if(focus)panel.querySelector(':scope>summary')?.focus({preventScroll:true});
}
function sizePanel(panel){
 const content=panel.querySelector('.tool-panel');
 content.style.setProperty('--panel-top',Math.max(content.getBoundingClientRect().top,12)+'px');
}
const sizeOpenPanels=()=>main.querySelectorAll('.control-panel[open]').forEach(sizePanel);
window.addEventListener('resize',sizeOpenPanels);
window.addEventListener('scroll',sizeOpenPanels,{passive:true});
main.addEventListener('toggle',event=>{
 const panel=event.target;
 syncPanelIcons(main);
 if(!panel.matches('.control-panel')||!panel.open||panel.dataset.panelOpen==='false')return;
 main.querySelectorAll('.control-panel').forEach(other=>{if(other!==panel)closePanel(other);});
 sizePanel(panel);
 if(panel.matches('.search-panel'))panel.querySelector('input')?.focus({preventScroll:true});
},true);
main.addEventListener('click',event=>{
 const trigger=event.target.closest('.control-panel>summary');
 if(trigger){event.preventDefault();const panel=trigger.parentElement;
  const open=panel.dataset.panelOpen===undefined?panel.open:panel.dataset.panelOpen==='true';
  if(open)closePanel(panel);else{panel.dataset.panelOpen='true';panel.open=true;sizePanel(panel);unfoldPanel(panel.querySelector('.tool-panel'),true);syncPanelIcons(main);}
  return;
 }
 const close=event.target.closest('[data-close-panel]');
 if(close){closePanel(close.closest('.control-panel'),true);return;}
 if(event.target.closest('[data-clear-query]')){pendingFocus={key:'search-trigger'};change({q:''});return;}
 if(event.target.closest('[data-clear-filters]')){
  const s=state();pendingFocus={key:'filter-trigger'};
  if(event.target.closest('.clear-tool'))main.querySelectorAll('.control-panel[open]').forEach(panel=>closePanel(panel));
  change({...parseRoute('#/'+s.view),cohort:s.view==='job-market'?s.cohort:''});
 }
});
document.addEventListener('click',event=>{
 const form=main.querySelector('#filters');
 if(form&&!form.contains(event.target))form.querySelectorAll('.control-panel[open]').forEach(panel=>closePanel(panel));
});
main.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 const panel=event.target.closest('.control-panel[open]');
 if(panel){event.preventDefault();closePanel(panel,true);}
});
function formPatch(){
 const form=document.querySelector('#filters');if(!form)return {};
 const f=new FormData(form);
 return {q:f.get('q')||'',program:f.get('program')||'',cohort:f.get('cohort')||state().cohort,period:f.get('period')||'all',from:f.get('from')||'',to:f.get('to')||'',paperOnly:f.has('paper')};
}
function applyForm(){
 const form=document.querySelector('#filters');
 if(form&&validateDateForm(form)){pendingFocus=rememberFocus();change(formPatch());}
}
main.addEventListener('click',event=>{
 const button=event.target.closest('[data-topic]');if(!button)return;
 const form=document.querySelector('#filters');if(form&&!validateDateForm(form))return;
 const s=state(),r=s.view==='candidate'?data.candidates.candidates.find(r=>r.id===s.id):null,broad=selectedBroadTopic(button.dataset.topic),topic=broad?.label||button.dataset.topic;
 pendingFocus=button.dataset.focusKey?rememberFocus(button):broad?{key:`topic-bar-${broad.key}`}:{topic};
 change({...formPatch(),view:s.view==='candidate'?'job-market':s.view==='seminar'?'seminars':s.view,id:null,cohort:r?.cohort||s.cohort,topics:toggleTopic(s.topics,topic)});
});
// Remember the invoking record so both back navigation and the return link
// restore the reader's position and keyboard focus.
main.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#/candidate/"],a[href^="#/seminar/"]');
 if(link){const saved=snapshot();saved.record=link.closest('[data-record-id]')?.dataset.recordId;snapshots.set(key(location.hash),saved);}
});
document.querySelector('.skip-link').addEventListener('click',event=>{
 event.preventDefault();const target=document.querySelector('#results')||main;
 target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});
});
window.addEventListener('hashchange',async event=>{
 if(!data)return;
 const before=renderedRoute||state(new URL(event.oldURL).hash),after=state(),oldKey=routeHash(before),newKey=key(location.hash);
 const prior=snapshots.get(oldKey),current=snapshot();
 if(prior?.record)current.record=prior.record;
 snapshots.set(oldKey,current);
 const saved=snapshots.get(newKey),samePage=before.view===after.view&&before.id===after.id;
 const detail=view=>['candidate','seminar'].includes(view);
 const backwards=(detail(before.view)&&!detail(after.view))||(before.view==='job-market'&&after.view==='seminars');
 await transitionPage(main,()=>{
 render(samePage);
 if(saved)restoreDisclosures(saved);
 else if(samePage){
  // Keep optional controls open while filtering, but let result groups and
  // abstracts start in their documented default states.
  for(const name of ['search-panel','filter-panel','extra-topics','coverage']){
   const panel=main.querySelector(`[data-ui-key="${name}"]`);
   if(panel&&current.open[name]){panel.open=true;if(panel.matches('.control-panel'))panel.dataset.panelOpen='true';}
  }
 }
 if(pendingFocus)restoreFocus(pendingFocus);
 else if(saved?.record){
  const record=[...main.querySelectorAll('[data-record-id]')].find(e=>e.dataset.recordId===saved.record);
  record?.querySelector('a[href^="#/candidate/"],a[href^="#/seminar/"]')?.focus({preventScroll:true});
 }
 else if(!samePage){const heading=main.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 else restoreFocus(saved?.focus||current.focus);
 window.scrollTo(0,pendingFocus?Math.min(current.scroll,document.querySelector('#results')?.offsetTop||0):(saved?.scroll??(samePage?Math.min(current.scroll,document.querySelector('#results')?.offsetTop||0):0)));
 pendingFocus=null;
 syncPanelIcons(main,false);
 },!samePage,backwards?-1:1);
});
function refreshDay(){
 if(!data||renderedDay===localToday())return;
 const saved=snapshot();cancelPageTransition(main);render();restoreDisclosures(saved);restoreFocus(saved.focus);window.scrollTo(0,saved.scroll);
}
window.addEventListener('focus',refreshDay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
function nextDay(){
 const d=new Date();setTimeout(()=>{refreshDay();nextDay();},new Date(d.getFullYear(),d.getMonth(),d.getDate()+1)-d+100);
}
async function load(){
 const names=['seminars','candidates','collection'];
 data=Object.fromEntries(await Promise.all(names.map(async name=>{
  const r=await fetch(`data/${name}.json`,{cache:'no-store'});if(!r.ok)throw new Error(`${name}: ${r.status}`);
  return [name,await r.json()];
 })));
 render();nextDay();
 try{
  if(navigator.modelContext?.registerTool)navigator.modelContext.registerTool({
   name:'search_economics_index',description:'Search visible economics records by keyword, program, topic and confirmed job-market season. Seminars default to today and upcoming.',
   inputSchema:{type:'object',properties:{query:{type:'string'},program:{type:'string'},topic:{type:'string'},cohort:{type:'string'},section:{type:'string',enum:['seminars','job-market']},period:{type:'string',enum:['upcoming','all','past']}}},
   execute:async({query='',program='',topic='',cohort='',section='seminars',period=section==='seminars'?'upcoming':'all'})=>{
    if(!['seminars','job-market'].includes(section))throw new Error('Choose seminars or job-market.');
    const s={...parseRoute('#/'+section),q:query,program,topics:topic?[topic]:[],view:section,period,cohort:resolvedCohort(cohort,data.candidates.candidates)};
    const rows=section==='seminars'?data.seminars.events:data.candidates.candidates;
    return {content:[{type:'text',text:JSON.stringify(filterRecords(rows,s,localToday()).map(({id,title,name,speaker,program,date,cohort,tags,source_url,paper_url})=>({id,title,name,speaker,program,date,cohort,tags,source_url,paper_url})))}]};
   }
  });
 }catch(error){console.warn('Optional browser tool unavailable',error);}
}
attachMissingHints(main);
shell();load().catch(error=>{
 console.error(error);
 main.innerHTML=`<div class="empty"><h1>${esc(COPY.empty.loadTitle)}</h1><p>${esc(location.protocol==='file:'?COPY.empty.fileHint:COPY.empty.loadHint)}</p><button id="reload-data">${esc(COPY.empty.reload)}</button></div>`;
 document.querySelector('#reload-data').addEventListener('click',()=>location.reload());
});
