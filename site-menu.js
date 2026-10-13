/** More choices use the same fold motion as the search/filter panels. */
import {COPY} from './content.js?v=20261013-1';
import {esc} from './format.js?v=20261013-1';
import {DIRECTIONS} from './identity.mjs?v=20261013-1';
import {pageEffectOptions,currentPageEffect,setPageEffect,unfoldPanel} from './motion.js?v=20261013-1';
import {controlSlot,mountIcons,setMoreIcon} from './icon-ui.js?v=20261013-1';
function effectOptions(){return pageEffectOptions().map(e=>`<button type="button" role="option" tabindex="-1" data-page-effect="${e.value}" aria-selected="false">${esc(e.label)}</button>`).join('');}
export function menuMarkup(){
 const m=COPY.menu;
 return `<div class="site-more"><button id="more-toggle" class="more-toggle" type="button" aria-label="${esc(m.more)}" title="${esc(m.more)}" aria-expanded="false" aria-controls="more-options">${controlSlot('more')}</button><div id="more-options" class="more-options" hidden role="group" aria-label="${esc(m.more)}"><fieldset><legend>${esc(m.appearance)}</legend>${Object.entries(DIRECTIONS).map(([key,d])=>`<button type="button" class="appearance-choice appearance-${key==='b'?'card':'flow'}" data-change-direction="${key}" aria-pressed="false"><span class="appearance-mark" aria-hidden="true"></span><span class="appearance-name">${esc(d.name)}</span></button>`).join('')}</fieldset><div class="effect-picker"><p id="page-effect-label" class="effect-caption">${esc(m.animation)}</p><button type="button" id="page-effect" class="effect-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="page-effect-options" aria-labelledby="page-effect-label page-effect-value"><span id="page-effect-value"></span><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1"/></svg></button><div id="page-effect-options" class="effect-options" role="listbox" aria-labelledby="page-effect-label" hidden>${effectOptions()}</div></div></div></div>`;
}
export function attachSiteMenu(onDirection){
 const trigger=document.querySelector('#more-toggle'),panel=document.querySelector('#more-options'),effect=panel.querySelector('#page-effect'),options=panel.querySelector('#page-effect-options'),value=panel.querySelector('#page-effect-value');
 mountIcons(trigger.parentElement);
 const choices=()=>[...options.querySelectorAll('[data-page-effect]')];
 const sync=()=>{
  panel.querySelectorAll('[data-change-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.changeDirection===document.documentElement.dataset.direction)));
  const current=currentPageEffect();value.textContent=pageEffectOptions().find(e=>e.value===current)?.label||'';
  choices().forEach(b=>b.setAttribute('aria-selected',String(b.dataset.pageEffect===current)));
 };
 const closeEffects=(focus=false)=>{if(effect.getAttribute('aria-expanded')==='true'){effect.setAttribute('aria-expanded','false');unfoldPanel(options,false,()=>{options.hidden=true;});}if(focus)effect.focus();};
 const openEffects=(focus=false,edge=null)=>{
  effect.setAttribute('aria-expanded','true');options.hidden=false;unfoldPanel(options,true);
  if(focus){const rows=choices();(edge==='first'?rows[0]:edge==='last'?rows.at(-1):rows.find(b=>b.dataset.pageEffect===currentPageEffect()))?.focus();}
 };
 const close=(focus=false)=>{closeEffects();if(trigger.getAttribute('aria-expanded')==='true'){trigger.setAttribute('aria-expanded','false');setMoreIcon(trigger,false);unfoldPanel(panel,false,()=>{panel.hidden=true;});}if(focus)trigger.focus();};
 trigger.addEventListener('click',()=>{if(trigger.getAttribute('aria-expanded')==='true'){close();return;}trigger.setAttribute('aria-expanded','true');setMoreIcon(trigger,true);panel.hidden=false;unfoldPanel(panel,true);});
 panel.addEventListener('click',event=>{
  const choice=event.target.closest('[data-page-effect]');if(choice){setPageEffect(choice.dataset.pageEffect);sync();closeEffects(true);return;}
  const b=event.target.closest('[data-change-direction]');if(b){closeEffects();onDirection(b.dataset.changeDirection);sync();}
 });
 effect.addEventListener('click',()=>{if(effect.getAttribute('aria-expanded')==='true')closeEffects();else openEffects();});
 panel.addEventListener('keydown',event=>{
  if(event.target.closest('.effect-picker')){
   if(event.key==='Escape'&&effect.getAttribute('aria-expanded')==='true'){event.preventDefault();event.stopPropagation();closeEffects(true);return;}
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();const rows=choices(),index=rows.indexOf(document.activeElement);
    if(effect.getAttribute('aria-expanded')!=='true'){openEffects(true,event.key==='Home'?'first':event.key==='End'?'last':null);return;}
    const next=event.key==='Home'?0:event.key==='End'?rows.length-1:index<0?rows.findIndex(b=>b.dataset.pageEffect===currentPageEffect()):(index+(event.key==='ArrowDown'?1:-1)+rows.length)%rows.length;
    rows[next]?.focus();return;
   }
   if(event.key==='Tab')closeEffects();
  }
  if(event.key==='Escape'){event.preventDefault();close(true);}
 });
 document.addEventListener('click',event=>{if(!event.target.closest('.site-more'))close();else if(!event.target.closest('.effect-picker'))closeEffects();});
 trigger.addEventListener('keydown',event=>{if(event.key==='Escape')close(true);});
 window.addEventListener('page-effects-changed',()=>{options.innerHTML=effectOptions();sync();});
 sync();
}
