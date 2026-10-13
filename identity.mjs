/** One real dataset and one interaction system; only visual direction changes. */
import {esc} from './format.js?v=20261013-4';
export const DIRECTIONS={
 b:{name:'Card',concept:'Research as discovery',display:'Instrument Serif',body:'Newsreader',ui:'IBM Plex Sans',meta:'IBM Plex Mono',colors:['#F7F4EE','#252623','#334A72','#94513F'],grid:'Bordered cards; verbatim abstract previews.'},
 c:{name:'Flow',concept:'Research as accumulation',display:'Instrument Serif',body:'Source Serif 4',ui:'IBM Plex Sans',meta:'IBM Plex Mono',colors:['#F5F3EC','#202A32','#40586A','#A48759'],grid:'Date / season rail; nested program catalogue.'}
};
export const DEFAULT_DIRECTION='b';
export const directionFromSearch=search=>{const value=new URLSearchParams(search).get('direction')?.toLowerCase();return Object.hasOwn(DIRECTIONS,value)?value:DEFAULT_DIRECTION;};
export const brandMarkup=site=>`<span class="brand-primary">${esc(site.wordmarkPrimary)}</span> <span class="brand-secondary">${esc(site.wordmarkSecondary)}</span>`;
