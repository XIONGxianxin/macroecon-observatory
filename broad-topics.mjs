/** Presentation taxonomy only: existing source tags/fields remain unchanged. */
export const BROAD_TOPICS=[
 {key:'macro',label:'Macro',aliases:['Macro','Macroeconomics','Growth','Monetary','Fiscal','Expectations','General equilibrium','International Macroeconomics','Monetary Economics','Monetary and Fiscal Policy','Macro-Labor']},
 {key:'labor',label:'Labor',aliases:['Labor','Labor Economics','Labor supply','Hiring','Human capital','Macro-Labor']},
 {key:'firm',label:'Firm',aliases:['Firms','Firm heterogeneity','Firm Dynamics','Industrial Organization','Industrial Organisation','Empirical Industrial Organisation','Competition','Competition Policy','Entrepreneurship','Production networks']},
 {key:'ha',label:'HA',aliases:['Household HA','Firm heterogeneity','Heterogeneous agents','Heterogeneous agent models','Household heterogeneity','HANK']},
 {key:'fin',label:'Fin',aliases:['Finance','Household Finance','Empirical Finance','Financial Econometrics','Finanical Econometrics','Portfolios','Insurance','Economics of Risk and Uncertainty']},
 {key:'others',label:'Others',aliases:[]}
];
const norm=s=>String(s??'').trim().toLowerCase().replace(/\s+/g,' ');
const aliasSets=BROAD_TOPICS.map(t=>new Set(t.aliases.map(norm)));
export function sourceTopic(value){return String(value??'').replace(/^(?:primary|secondary)(?:\s+fields?)?\s*:\s*/i,'').trim();}
function known(value){const s=sourceTopic(value);return Boolean(s)&&!/(unverified|unclassified|unknown|not available|not announced|secondary:)/i.test(s)&&! /^(tba|n\/a|none|and\b|primary fields?$|secondary fields?$)/i.test(s);}
export function broadTopicsFor(record){
 const labels=[...(record.tags||[]),...(record.fields||[])].filter(known).map(v=>norm(sourceTopic(v)));
 const keys=BROAD_TOPICS.slice(0,-1).filter((_,i)=>labels.some(v=>aliasSets[i].has(v))).map(t=>t.key);
 if(!keys.length&&labels.length)keys.push('others');
 return keys;
}
export function broadTopic(value){return BROAD_TOPICS.find(t=>t.key===value||t.label===value);}
// Broad UI aliases only. Older granular links (e.g. Household HA) stay granular.
export function selectedBroadTopic(value){return broadTopic(value)||(value==='Firms'?broadTopic('firm'):value==='Finance'?broadTopic('fin'):null);}
export function isTopicSelected(selected,label){return selected.some(v=>(selectedBroadTopic(v)?.label||v)===label);}
export function toggleTopic(selected,label){return isTopicSelected(selected,label)?selected.filter(v=>(selectedBroadTopic(v)?.label||v)!==label):[...selected,label];}
export function matchesTopic(record,value){const broad=broadTopic(value);return broad?broadTopicsFor(record).includes(broad.key):(record.tags?.includes(value)||record.fields?.includes(value));}
export const BROAD_SOURCE_LABELS=new Set(BROAD_TOPICS.flatMap(t=>[t.label,...t.aliases]));
