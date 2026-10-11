/** Verbatim prefixes: no generated summary, no normalization of the source. */
export const CARD_CONFIG={previewWords:25,mobilePreviewWords:18,mobileBreakpoint:600};
export function abstractPrefix(value,limit=CARD_CONFIG.previewWords){
 const source=String(value||''),words=[...source.matchAll(/\S+/g)];
 if(words.length<=limit)return {text:source,truncated:false,words:words.length};
 const end=words[limit-1].index+words[limit-1][0].length;
 return {text:source.slice(0,end),truncated:true,words:limit};
}
