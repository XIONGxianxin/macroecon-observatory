/** Shared safe text/link/date formatting; no DOM effects. */
import {safeUrl} from './domain.mjs?v=20261013-1';
import {COPY} from './content.js?v=20261013-1';
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const dateLabel=s=>s?new Intl.DateTimeFormat(COPY.date.locale,{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(s.slice(0,10)+'T12:00:00Z')):COPY.records.notRecorded;
export function external(url,label){const safe=safeUrl(url);return safe?`<a href="${esc(safe)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';}
