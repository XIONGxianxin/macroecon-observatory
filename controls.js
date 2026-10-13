/** Collapsed search/filter tools; one form retains all shareable query values. */
import {COPY,wording,programName,topicName} from './content.js?v=20261013-4';
import {PRIMARY_TOPICS} from './domain.mjs?v=20261013-4';
import {esc} from './format.js?v=20261013-4';
import {dateControl} from './date-controls.mjs?v=20261013-4';
import {BROAD_TOPICS,BROAD_SOURCE_LABELS,isTopicSelected} from './broad-topics.mjs?v=20261013-4';
import {controlSlot,mountIcons,clearIconPresence,syncTopicIcons} from './icon-ui.js?v=20261013-4';

const option=(value,label,selected)=>`<option value="${esc(value)}" ${value===selected?'selected':''}>${esc(label)}</option>`;
const icon=name=>controlSlot(name==='close'?'clear':name);
const broadButtons=(state,location='panel')=>BROAD_TOPICS.map(t=>`<button type="button" class="broad-topic-button" data-focus-key="topic-${location}-${t.key}" data-broad-topic="${t.key}" data-topic="${t.label}" aria-pressed="${isTopicSelected(state.topics,t.label)}" title="${t.label==='HA'?'Heterogeneous agents':t.label==='Fin'?'Finance':t.label}"><i data-topic-slot="${t.key}" aria-hidden="true"></i><span class="topic-label">${t.label}</span></button>`).join('');
function scopeMarkup(summary,results){return `<span class="scope-context">${esc(summary.label)}</span>${results?`<span class="scope-count" role="status" aria-live="polite"><span aria-hidden="true"> · </span><strong>${esc(results.count)}</strong> ${esc(results.unit)}${results.count!==results.total?' '+esc(COPY.records.of)+' '+esc(results.total):''}</span>`:''}`;}
function clearMarkup(){return `<button class="tool-icon clear-tool" type="button" data-clear-filters title="${esc(COPY.filters.reset)}" aria-label="${esc(COPY.filters.reset)}">${icon('close')}</button>`;}
export function filterSummary(state,seasons=[],results=null){
 const f=COPY.filters,seminars=state.view==='seminars';
 const period=state.period==='fortnight'?f.fortnight:state.period==='upcoming'?f.upcoming:state.period==='past'?f.past:f.allDates;
 const context=seminars?period:state.cohort.replace('-','–');
 const count=Number(Boolean(state.program))+state.topics.length+Number(state.paperOnly)+Number(Boolean(state.from))+Number(Boolean(state.to))+
  Number(seminars&&state.period!=='fortnight');
 const choices=[state.program?programName(state.program):'',...state.topics.map(topicName),state.from||state.to?[state.from||'…',state.to||'…'].join(' – '):'',state.paperOnly?f.paperOnly:''].filter(Boolean);
 return {count,context,label:[context,...choices].filter(Boolean).join(' · '),active:Boolean(state.q)||count>0};
}
export function controls(state,records,collection,seasons=[],results=null){
 const f=COPY.filters,summary=filterSummary(state,seasons);
 const topics=[...new Set(records.flatMap(r=>[...(r.tags||[]),...(r.fields||[])]))].sort((a,b)=>a.localeCompare(b));
 const topicButton=t=>`<button type="button" class="tag filter-tag" data-topic="${esc(t)}" aria-pressed="${state.topics.includes(t)}">${esc(topicName(t))}</button>`;
 const trigger=(name,label,count)=>`<summary class="tool-icon ${count?'has-selection':''}" data-focus-key="${name}-trigger" title="${esc(label)}" aria-label="${esc(label+(count?' · '+wording(f.selectedCount,{count}):''))}">${icon(name)}${count?`<span class="tool-count" aria-hidden="true">${count}</span>`:''}</summary>`;
 const close=()=>`<button type="button" class="panel-close" data-close-panel title="${esc(f.close)}" aria-label="${esc(f.close)}">${icon('close')}</button>`;
 return `<form class="filters compact-filters" id="filters" role="search" aria-label="${esc(f.filterLabel)}">
 <div class="filter-toolbar"><div class="filter-scope"><p class="filter-state" aria-label="${esc(f.currentScope)}" title="${esc(summary.label)}">${scopeMarkup(summary,results)}</p></div><div class="filter-tools">
 <details class="control-panel search-panel" data-ui-key="search-panel">${trigger('search',f.search,Number(Boolean(state.q)))}
 <div class="tool-panel search-content" role="group" aria-label="${esc(f.search)}"><div class="panel-heading"><h2>${esc(f.search)}</h2>${close()}</div>
 <label class="search-field">${esc(f.searchPlaceholder)}<input type="search" name="q" value="${esc(state.q)}" placeholder="${esc(f.searchPlaceholder)}"></label>
 <div class="panel-actions"><button class="apply" data-focus-key="search-apply" type="submit">${esc(f.search)}</button>${state.q?`<button type="button" class="text-action" data-clear-query>${esc(f.clearSearch)}</button>`:''}</div></div></details>
 <details class="control-panel filter-panel" data-ui-key="filter-panel">${trigger('filter',f.filterOptions,summary.count)}
 <div class="tool-panel filter-content" role="group" aria-label="${esc(f.filterOptions)}"><div class="panel-heading"><h2>${esc(f.filterOptions)}</h2>${close()}</div><div class="filter-row">
 <label class="program-field">${esc(f.program)}<select name="program">${option('',f.allPrograms,state.program)}${collection.programs.map(p=>option(p,programName(p),state.program)).join('')}</select></label>
 ${state.view==='seminars'?`<label class="period-field">${esc(f.when)}<select name="period">${option('fortnight',f.fortnight,state.period)}${option('upcoming',f.upcoming,state.period)}${option('all',wording(f.allTerm,{term:collection.term}),state.period)}${option('past',f.past,state.period)}</select></label>`:''}
 ${state.view==='job-market'?`<label class="period-field">${esc(f.season)}<select name="cohort">${seasons.map((season,i)=>option(season,season.replace('-','–')+(i===0?' · '+f.latest:''),state.cohort)).join('')}</select></label>`:''}</div>
 <fieldset class="topic-filters"><legend>${esc(f.topics)} <span class="meta">${esc(f.topicHint)}</span></legend><div class="broad-topic-options" aria-label="Broad research topics">${broadButtons(state)}</div>
 <details class="extra-topic-options" data-ui-key="extra-topics"><summary>${esc(f.moreTopics)}</summary><div class="extra-topics tags">${topics.filter(t=>!BROAD_SOURCE_LABELS.has(t)||state.topics.includes(t)&&!PRIMARY_TOPICS.includes(t)).map(topicButton).join('')}</div></details></fieldset>
 ${state.view==='seminars'?`<div class="date-range">${dateControl('from',f.from,state.from)}${dateControl('to',f.to,state.to)}</div><p class="filter-hint">${esc(wording(f.dateHint,{term:collection.term}))}</p>`:''}
 <label class="check"><input type="checkbox" name="paper" ${state.paperOnly?'checked':''}>${esc(f.paperOnly)}</label>
 <div class="panel-actions"><button class="apply" data-focus-key="filter-apply" type="submit">${esc(f.apply)}</button><button type="button" class="text-action" data-clear-filters>${esc(f.reset)}</button></div></div></details>
 <span class="clear-tool-slot" data-present="${summary.active}">${summary.active?clearMarkup():''}</span>
 </div></div><div class="broad-topic-bar" role="group" aria-label="Broad research topics">${broadButtons(state,'bar')}</div><p class="search-status" ${state.q?'':'hidden'}>${state.q?esc(wording(f.searchingFor,{query:state.q})):''}</p></form>`;
}

/** Update applied state without replacing inputs, disclosures or animated icon nodes. */
export function syncControls(state,results){
 const form=document.querySelector('#filters');if(!form)return;
 const summary=filterSummary(state);
 const scope=form.querySelector('.filter-state');scope.innerHTML=scopeMarkup(summary,results);scope.title=summary.label;
 for(const name of ['q','program','cohort','period','from','to']){
  const input=form.elements.namedItem(name);if(input)input.value=state[name]||'';
 }
 form.elements.namedItem('paper').checked=state.paperOnly;
 syncTopicIcons(form,state.topics);
 const searchStatus=form.querySelector('.search-status');searchStatus.hidden=!state.q;searchStatus.textContent=state.q?wording(COPY.filters.searchingFor,{query:state.q}):'';
 for(const [name,count] of [['search',Number(Boolean(state.q))],['filter',summary.count]]){
  const trigger=form.querySelector(`.${name}-panel>summary`),label=name==='search'?COPY.filters.search:COPY.filters.filterOptions;
  trigger.classList.toggle('has-selection',Boolean(count));trigger.setAttribute('aria-label',label+(count?' · '+wording(COPY.filters.selectedCount,{count}):''));
  let badge=trigger.querySelector('.tool-count');
  if(count){if(!badge){badge=document.createElement('span');badge.className='tool-count';badge.setAttribute('aria-hidden','true');trigger.append(badge);}badge.textContent=count;}else badge?.remove();
 }
 const slot=form.querySelector('.clear-tool-slot');
 let clear=slot.querySelector('.clear-tool');
 if(summary.active){
  const entering=!clear;
  if(entering){slot.insertAdjacentHTML('beforeend',clearMarkup());clear=slot.querySelector('.clear-tool');clear.dataset.entering='true';mountIcons(clear);}
  clearIconPresence(clear,true,{entering});
 }else if(clear)clearIconPresence(clear,false);
}
