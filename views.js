/** Record/group templates. Interface text comes exclusively from content.js. */
import {safeUrl,routeHash,parseRoute,groupRecords} from './domain.mjs';
import {COPY,wording,programName,topicName} from './content.js';
import {abstractPrefix,CARD_CONFIG} from './card-content.mjs';
import {DEFAULT_DIRECTION} from './identity.mjs';
import {esc,dateLabel,external} from './format.js';
export {esc,dateLabel,external} from './format.js';
export function tags(r){return `<div class="tags" aria-label="${esc(COPY.filters.topics)}">${(r.tags||[]).map(t=>`<button class="tag" data-topic="${esc(t)}" title="${esc(wording(COPY.filters.filterTopic,{topic:topicName(t)}))}">${esc(topicName(t))}</button>`).join('')}</div>`;}
export function abstractView(r){
 if(!r.abstract)return '';
 const label=r.kind==='candidate'?COPY.records.jmpAbstract:COPY.records.abstract;
 return `<details class="paper-abstract" data-ui-key="abstract-${esc(r.id)}"><summary>${esc(label)}</summary><div class="abstract-content"><p>${esc(r.abstract)}</p>${abstractSourceIcon(r,[r.paper_link_status==='unavailable'?null:r.paper_url,r.homepage_url||r.profile_url,r.kind==='candidate'?r.source_url:eventSource(r)])}</div></details>`;
}
function paperLink(r,label=COPY.records.paper){return r.paper_link_status==='unavailable'?`<span class="meta">${esc(COPY.records.paperUnavailable)}</span>`:external(r.paper_url,label);}
function eventSource(r){return r.event_url&&r.event_url!==r.paper_url&&!/\.pdf(?:[?#]|$)/i.test(r.event_url)?r.event_url:r.source_url;}
function status(r){return r.date_basis==='year_unverified'?`<span class="meta record-note">${esc(COPY.records.yearUnverified)}</span>`:'';}
function detailRow(label,value){return value?`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`:'';}

const seasonLabel=season=>String(season||'').replace('-','–');
function candidateHref(r,state={}){return routeHash({...parseRoute('#/job-market'),...state,view:'candidate',id:r.id,cohort:r.cohort});}
export function seminarCard(r,grouped=false){
 const c=COPY.records,target=r.paper_link_status==='unavailable'?null:safeUrl(r.paper_url),home=safeUrl(r.homepage_url),heading=grouped?'h4':'h2';
 const identity=home?external(home,r.speaker_name||r.speaker)+(r.speaker_name&&r.affiliation?', '+esc(r.affiliation):''):esc(r.speaker||c.unknownSpeaker)+(!home&&r.affiliation&&r.speaker_name===r.speaker?', '+esc(r.affiliation):'');
 return `<article class="record ${grouped?'grouped-record':''}" data-record-id="${esc(r.id)}">${grouped?'':`<div class="record-date"><time datetime="${esc(r.date)}">${dateLabel(r.date)}</time><span class="meta program">${esc(programName(r.program))}</span></div>`}<div>
 <${heading}>${r.title?(target?external(target,r.title):esc(r.title)):`<span class="pending-title">${esc(c.unknownTitle)}</span>`}</${heading}>
 <p class="speaker">${identity}</p>${abstractView(r)}${status(r)}${tags(r)}<div class="record-links">${paperLink(r)}${external(eventSource(r),c.eventSource)}</div>
 <details class="record-details" data-ui-key="event-${esc(r.id)}"><summary>${esc(c.eventDetails)}</summary><div class="details-content"><dl>${detailRow(c.series,r.series)}${detailRow(c.localTime,r.time_local?(r.time_local+(r.timezone?' · '+r.timezone:'')):'')}${detailRow(c.location,r.location)}</dl>
 ${r.date_basis==='year_unverified'?`<p class="meta">${esc(wording(c.inferredYear,{term:r.term}))}</p>`:''}${r.verification_status&&r.verification_status!=='observed'&&r.verification_status!=='archived'?`<p class="meta">${esc(c.retained)}</p>`:''}</div></details></div></article>`;
}
export function candidateCard(r,grouped=false,state={}){
 const c=COPY.records,href=candidateHref(r,state),heading=grouped?'h4':'h2';
 const entry=r.abstract||r.abstract_url?c.abstract:c.candidateDetails;
 return `<article class="record candidate-record ${grouped?'grouped-record':''}" data-record-id="${esc(r.id)}">${grouped?'':`<div class="record-date"><span>${esc(programName(r.program))}</span><span class="meta program">${esc(seasonLabel(r.cohort))}</span></div>`}<div>
 <p class="candidate-name">${external(r.homepage_url||r.profile_url,r.name)||esc(r.name)}</p><${heading}>${esc(r.title||c.unknownJmpTitle)}</${heading}>${r.fields?.length?`<p class="meta candidate-fields">${esc(r.fields.join(' · '))}</p>`:''}${status(r)}${tags(r)}<div class="record-links"><a class="candidate-detail-entry" href="${esc(href)}" data-detail-link>${esc(entry)}</a>${paperLink(r,c.jmpLink)}</div></div></article>`;
}
function personView(r){
 const c=COPY.records,home=safeUrl(r.homepage_url);
 return home?external(home,r.speaker_name||r.speaker)+(r.speaker_name&&r.affiliation?', '+esc(r.affiliation):''):esc(r.speaker||c.unknownSpeaker)+(r.affiliation&&r.speaker_name===r.speaker?', '+esc(r.affiliation):'');
}
function abstractBlock(r){return r.abstract?`<section class="detail-abstract"><h2 class="abstract-label">${esc(COPY.records.abstract)}</h2><p class="reader-text">${esc(r.abstract)}</p></section>`:'';}
function abstractSourceIcon(r,otherUrls){
 const url=safeUrl(r.abstract_source);
 if(!url||otherUrls.some(other=>safeUrl(other)===url))return '';
 const label=COPY.records.abstractSource;
 return `<a class="abstract-source-icon" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}" title="${esc(label)}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/></svg></a>`;
}
function detailActions(r,isCandidate){
 const paper=r.paper_link_status==='unavailable'?null:r.paper_url,home=r.homepage_url||(isCandidate?r.profile_url:null),source=isCandidate?r.source_url:eventSource(r);
 const links=paperLink(r,COPY.records.readPaper)+(r.abstract?'':external(r.abstract_url,COPY.records.abstract))+external(source,isCandidate?COPY.records.officialRoster:COPY.records.eventSource)+abstractSourceIcon(r,[paper,home,source,r.abstract?null:r.abstract_url]);
 return `<div class="detail-actions">${!isCandidate?tags(r):''}<div class="record-links">${links}</div></div>`;
}
function seminarHref(r,state={}){return routeHash({...parseRoute('#/seminars'),...state,view:'seminar',id:r.id,cohort:''});}
function programHeading(program,boxed=false){
 return `<h3 class="program-heading"><span${boxed?' class="boxed-program-name"':''}>${esc(programName(program))}</span></h3>`;
}
export function candidateDetail(r,state={}){
 const c=COPY.records;if(!r)return `<div class="empty"><h1>${esc(COPY.empty.candidate)}</h1><p><a href="#/job-market">${esc(c.back)}</a></p></div>`;
 const back=routeHash({...parseRoute('#/job-market'),...state,view:'job-market',id:null,cohort:r.cohort});
 return `<p class="back-link"><a href="${esc(back)}">${esc(c.back)}</a></p><article class="candidate-detail detail-page" id="results" tabindex="-1"><header class="detail-heading"><h1>${external(r.homepage_url||r.profile_url,r.name)||esc(r.name)}</h1><p class="detail-meta">${esc(programName(r.program))} · ${esc(seasonLabel(r.cohort))}${r.fields?.length?`<span class="detail-fields">${esc(r.fields.join(' · '))}</span>`:''}</p></header><section class="paper-block"><h2 class="paper-title">${esc(r.title||c.unknownJmpTitle)}</h2>${status(r)}${abstractBlock(r)}${detailActions(r,true)}</section>${r.destination_statement?`<dl><dt>${esc(c.destination)}</dt><dd>${esc(r.destination_statement)} ${external(r.destination_source,c.candidateStatement)}</dd></dl>`:''}</article>`;
}
export function seminarDetail(r,state={}){
 const c=COPY.records;if(!r)return `<div class="empty"><h1>${esc(COPY.empty.seminar)}</h1><a href="#/seminars">${esc(COPY.cards.backSeminars)}</a></div>`;
 const back=routeHash({...parseRoute('#/seminars'),...state,view:'seminars',id:null,cohort:''});
 return `<p class="back-link"><a href="${esc(back)}">${esc(COPY.cards.backSeminars)}</a></p><div class="heading seminar-heading"><div><p class="eyebrow">${dateLabel(r.date)} · ${esc(programName(r.program))}</p><h1>${esc(r.title||c.unknownTitle)}</h1></div></div><div class="seminar-detail" id="results" tabindex="-1"><p class="speaker">${personView(r)}</p>${abstractBlock(r)}${detailActions(r,false)}<section class="seminar-facts"><h2>${esc(c.eventDetails)}</h2><dl>${detailRow(c.series,r.series)}${detailRow(c.localTime,r.time_local?(r.time_local+(r.timezone?' · '+r.timezone:'')):'')}${detailRow(c.location,r.location)}</dl>${status(r)}${r.date_basis==='year_unverified'?`<p class="meta">${esc(wording(c.inferredYear,{term:r.term}))}</p>`:''}${r.verification_status&&r.verification_status!=='observed'&&r.verification_status!=='archived'?`<p class="meta">${esc(c.retained)}</p>`:''}</section></div>`;
}
function titleMissing(r){return !r.title?.trim()||/^(?:Job market paper )?Title (?:unavailable|not available|to be announced)$/i.test(r.title.trim());}
export function missingLegend(rows,direction){
 return direction==='b'&&rows.some(r=>titleMissing(r)||!r.abstract?.trim())?`<p class="missing-legend"><span aria-hidden="true"></span>${esc(COPY.cards.missingLegend)}</p>`:'';
}
function textPlaceholder(tag,classes,label,lines){
 return `<${tag} class="${classes} text-placeholder"><button type="button" class="placeholder-trigger" data-missing-toggle aria-label="${esc(label)}" aria-expanded="false"><span class="sr-only">${esc(label)}</span>${Array.from({length:lines},()=>'<span class="placeholder-line" aria-hidden="true"><span></span></span>').join('')}</button><span class="missing-tooltip" aria-hidden="true">${esc(label)}</span></${tag}>`;
}
export function tileCard(r,state={}){
 const c=COPY.records,isCandidate=r.kind==='candidate',href=isCandidate?candidateHref(r,state):seminarHref(r,state);
 const missingTitle=titleMissing(r),hasAbstract=Boolean(r.abstract?.trim());
 const title=missingTitle?(isCandidate?c.unknownJmpTitle:c.unknownTitle):r.title;
 const target=r.paper_link_status==='unavailable'?null:safeUrl(r.paper_url),person=isCandidate?(external(r.homepage_url||r.profile_url,r.name)||esc(r.name)):personView(r);
 const excerpt=limit=>{const p=abstractPrefix(r.abstract,limit);return `<span class="excerpt-copy">${esc(p.text)}</span>${p.truncated?`<a class="excerpt-more" href="${esc(href)}" data-detail-link aria-label="${esc(COPY.cards.readAbstract)}" title="${esc(COPY.cards.readAbstract)}">...</a>`:''}`;};
 const footerTags=r.tags?.length?r.tags:r.fields||[];
 return `<article class="record tile-card ${isCandidate?'candidate-record':''}" data-record-id="${esc(r.id)}"><header class="tile-head"><p class="tile-program">${esc(programName(r.program))}</p>
 ${missingTitle?textPlaceholder('h4','tile-title title-placeholder',title,2):`<h4 class="tile-title" title="${esc(title)}">${target?external(target,r.title):esc(r.title)}</h4>`}
 <p class="tile-person" title="${esc(isCandidate?r.name:r.speaker)}"><span>${esc(isCandidate?COPY.cards.candidate:COPY.cards.speaker)}</span> ${person}</p></header>
 <div class="tile-body">${hasAbstract?`<p class="tile-excerpt"><span class="preview-desktop">${excerpt(CARD_CONFIG.previewWords)}</span><span class="preview-mobile">${excerpt(CARD_CONFIG.mobilePreviewWords)}</span></p>`:textPlaceholder('p','tile-excerpt abstract-placeholder',COPY.cards.abstractUnavailable,3)}
 ${isCandidate&&r.fields?.length?`<p class="tile-fields" title="${esc(r.fields.join(' · '))}">${esc(r.fields.join(' · '))}</p>`:''}${status(r)}
 <div class="tile-links">${isCandidate?`<a href="${esc(href)}" data-detail-link>${esc(c.candidateDetails)}</a>${paperLink(r,c.jmpLink)}${r.abstract?'':external(r.abstract_url,c.abstract)}`:`${paperLink(r)}${external(eventSource(r),c.eventSource)}<a href="${esc(href)}" data-detail-link>${esc(c.eventDetails)}</a>`}</div></div>
 <div class="tile-footer"><div class="tile-tags" aria-label="${esc(COPY.filters.topics)}">${footerTags.map(t=>`<button type="button" data-topic="${esc(t)}" title="${esc(wording(COPY.filters.filterTopic,{topic:topicName(t)}))}">${esc(topicName(t))}</button>`).join('')}</div></div></article>`;
}
export function groupedResults(rows,view,state={},direction=DEFAULT_DIRECTION){
 if(direction==='b'){
  if(view==='job-market'){
   const groups=new Map();for(const r of rows){if(!groups.has(r.program))groups.set(r.program,[]);groups.get(r.program).push(r);}
   return `<section class="season-group card-season"><h2 class="date-heading">${esc(seasonLabel(state.cohort))}</h2>${[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([program,records])=>`<section class="card-program">${programHeading(program,true)}<div class="card-grid">${records.map(r=>tileCard(r,state)).join('')}</div></section>`).join('')}</section>`;
  }
  return groupRecords(rows).map(g=>`<details class="date-group card-date-group" open data-ui-key="date-${esc(g.date)}" data-date-group="${esc(g.date)}"><summary><h2><time datetime="${esc(g.date)}">${dateLabel(g.date)}</time><span class="meta">${g.programs.reduce((n,p)=>n+p.records.length,0)}</span></h2></summary><div class="card-grid">${g.programs.flatMap(p=>p.records).map(r=>tileCard(r,state)).join('')}</div></details>`).join('');
 }
 const render=r=>r.kind==='seminar'?seminarCard(r,true):candidateCard(r,true,state);
 const programs=groups=>groups.map(g=>`<section class="program-group">${programHeading(g.program,view==='job-market')}${g.records.map(render).join('')}</section>`).join('');
 if(view==='job-market'){
  const groups=new Map();for(const r of rows){if(!groups.has(r.program))groups.set(r.program,[]);groups.get(r.program).push(r);}
  return `<section class="season-group"><h2 class="date-heading">${esc(seasonLabel(state.cohort))}</h2>${programs([...groups].sort(([a],[b])=>a.localeCompare(b)).map(([program,records])=>({program,records})))}</section>`;
 }
 return groupRecords(rows).map(g=>`<details class="date-group" open data-ui-key="date-${esc(g.date)}" data-date-group="${esc(g.date)}"><summary><h2><time datetime="${esc(g.date)}">${dateLabel(g.date)}</time><span class="meta">${g.programs.reduce((n,p)=>n+p.records.length,0)}</span></h2></summary>${programs(g.programs)}</details>`).join('');
}
function coverageScope(c,season){
 if(COPY.coverageNotes[c.source_id])return COPY.coverageNotes[c.source_id];
 if(c.source_id==='jmp_columbia')return wording(COPY.coverage.officialSeason,{season:seasonLabel(season)});
 if(c.source_id.startsWith('mit_upcoming_'))return COPY.coverage.adjacent;
 if(c.source_id==='mit_macro')return COPY.coverage.macroUpcoming;
 return c.message||c.scope_note||'';
}
export function coverageView(coverage,count,view,program='',term='',season=''){
 const c=COPY.coverage,rows=coverage.filter(r=>!program||r.program===program);
 return `<details class="coverage" data-ui-key="coverage"><summary>${esc(c.title)}</summary><div class="coverage-content"><p class="meta">${esc(c.missingDefinition)}</p><p class="meta">${esc(wording(view==='job-market'?c.candidateScope:c.seminarScope,{term,season:seasonLabel(season)}))}</p><div class="table-wrap"><table><thead><tr><th>${esc(c.programColumn)}</th><th>${esc(c.statusColumn)}</th><th>${esc(c.coverageColumn)}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${external(r.url,programName(r.program))}</td><td>${esc(COPY.statuses[r.status]||r.status)}</td><td>${esc(coverageScope(r,r.cohort||season))}</td></tr>`).join('')}</tbody></table></div></div></details>`;
}
