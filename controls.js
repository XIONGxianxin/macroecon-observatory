/** Collapsed search/filter tools; one form retains all shareable query values. */
import {COPY,wording,programName,topicName} from './content.js';
import {PRIMARY_TOPICS} from './domain.mjs';
import {esc} from './format.js';
import {dateControl} from './date-controls.mjs';

const option=(value,label,selected)=>`<option value="${esc(value)}" ${value===selected?'selected':''}>${esc(label)}</option>`;
const icons={
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 filter:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5"/><circle cx="15" cy="17" r="2.5"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${icons[name]}</svg>`;
export function filterSummary(state,seasons=[],results=null){
 const f=COPY.filters,seminars=state.view==='seminars';
 const period=state.period==='upcoming'?f.upcoming:state.period==='past'?f.past:f.allDates;
 const context=seminars?period:state.cohort.replace('-','–');
 const count=Number(Boolean(state.program))+state.topics.length+Number(state.paperOnly)+Number(Boolean(state.from))+Number(Boolean(state.to))+
  Number(seminars&&state.period!=='upcoming');
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
 <div class="filter-toolbar"><div class="filter-scope"><p class="filter-state" aria-label="${esc(f.currentScope)}" title="${esc(summary.label)}"><span class="scope-context">${esc(summary.label)}</span>${results?`<span class="scope-count" role="status" aria-live="polite"><span aria-hidden="true"> · </span><strong>${esc(results.count)}</strong> ${esc(results.unit)}${results.count!==results.total?' '+esc(COPY.records.of)+' '+esc(results.total):''}</span>`:''}</p></div><div class="filter-tools">
 <details class="control-panel search-panel" data-ui-key="search-panel">${trigger('search',f.search,Number(Boolean(state.q)))}
 <div class="tool-panel search-content" role="group" aria-label="${esc(f.search)}"><div class="panel-heading"><h2>${esc(f.search)}</h2>${close()}</div>
 <label class="search-field">${esc(f.searchPlaceholder)}<input type="search" name="q" value="${esc(state.q)}" placeholder="${esc(f.searchPlaceholder)}"></label>
 <div class="panel-actions"><button class="apply" data-focus-key="search-apply" type="submit">${esc(f.search)}</button>${state.q?`<button type="button" class="text-action" data-clear-query>${esc(f.clearSearch)}</button>`:''}</div></div></details>
 <details class="control-panel filter-panel" data-ui-key="filter-panel">${trigger('filter',f.filterOptions,summary.count)}
 <div class="tool-panel filter-content" role="group" aria-label="${esc(f.filterOptions)}"><div class="panel-heading"><h2>${esc(f.filterOptions)}</h2>${close()}</div><div class="filter-row">
 <label class="program-field">${esc(f.program)}<select name="program">${option('',f.allPrograms,state.program)}${collection.programs.map(p=>option(p,programName(p),state.program)).join('')}</select></label>
 ${state.view==='seminars'?`<label class="period-field">${esc(f.when)}<select name="period">${option('upcoming',f.upcoming,state.period)}${option('all',wording(f.allTerm,{term:collection.term}),state.period)}${option('past',f.past,state.period)}</select></label>`:''}
 ${state.view==='job-market'?`<label class="period-field">${esc(f.season)}<select name="cohort">${seasons.map((season,i)=>option(season,season.replace('-','–')+(i===0?' · '+f.latest:''),state.cohort)).join('')}</select></label>`:''}</div>
 <fieldset class="topic-filters"><legend>${esc(f.topics)} <span class="meta">${esc(f.topicHint)}</span></legend><div class="tags">${PRIMARY_TOPICS.map(topicButton).join('')}</div>
 <details class="extra-topic-options" data-ui-key="extra-topics"><summary>${esc(f.moreTopics)}</summary><div class="extra-topics tags">${topics.filter(t=>!PRIMARY_TOPICS.includes(t)).map(topicButton).join('')}</div></details></fieldset>
 ${state.view==='seminars'?`<div class="date-range">${dateControl('from',f.from,state.from)}${dateControl('to',f.to,state.to)}</div><p class="filter-hint">${esc(wording(f.dateHint,{term:collection.term}))}</p>`:''}
 <label class="check"><input type="checkbox" name="paper" ${state.paperOnly?'checked':''}>${esc(f.paperOnly)}</label>
 <div class="panel-actions"><button class="apply" data-focus-key="filter-apply" type="submit">${esc(f.apply)}</button><button type="button" class="text-action" data-clear-filters>${esc(f.reset)}</button></div></div></details>
 ${summary.active?`<button class="tool-icon clear-tool" type="button" data-clear-filters title="${esc(f.reset)}" aria-label="${esc(f.reset)}">${icon('close')}</button>`:''}
 </div></div>${state.q?`<p class="search-status">${esc(wording(f.searchingFor,{query:state.q}))}</p>`:''}</form>`;
}
