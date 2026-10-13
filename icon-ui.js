import {createTopicIcon,attachTopicMotion} from './icons/topic-motion.mjs?v=20261013-4';
import {createControlIcon,attachControlMotion} from './icons/control-icons.mjs?v=20261013-4';
import {isTopicSelected} from './broad-topics.mjs?v=20261013-4';
import {mountTopicFocus} from './topic-focus.js?v=20261013-4';
const controlRuns=new WeakMap(),topicRuns=new WeakMap();
export const controlSlot=name=>`<i data-control-slot="${name}" aria-hidden="true"></i>`;
export function mountIcons(root){
 root.querySelectorAll('[data-control-slot]').forEach(slot=>{const kind=slot.dataset.controlSlot;slot.replaceWith(createControlIcon(kind));});
 root.querySelectorAll('[data-topic-slot]').forEach(slot=>{slot.replaceWith(createTopicIcon(slot.dataset.topicSlot));});
 root.querySelectorAll('[data-control-icon]').forEach(icon=>{
  const target=icon.closest('button,summary');if(!target||controlRuns.has(target))return;
  const run=attachControlMotion(target,{icon,initialPresent:target.dataset.entering!=='true',onExited:()=>{if(target.dataset.exiting==='true'){run.dispose();target.remove();}}});controlRuns.set(target,run);
 });
 root.querySelectorAll('[data-broad-topic]').forEach(button=>{mountTopicFocus(button);if(!topicRuns.has(button))topicRuns.set(button,attachTopicMotion(button));});
 syncPanelIcons(root,false);
}
export function syncPanelIcons(root,animate=true){
 root.querySelectorAll('.control-panel').forEach(panel=>{
  const open=panel.dataset.panelOpen===undefined?panel.open:panel.dataset.panelOpen==='true';
  controlRuns.get(panel.querySelector(':scope>summary'))?.setExpanded(open,{animate});
 });
}
export function setMoreIcon(button,open,animate=true){controlRuns.get(button)?.setExpanded(open,{animate});}
export function syncTopicIcons(root,topics){root.querySelectorAll('[data-topic]').forEach(button=>button.setAttribute('aria-pressed',String(isTopicSelected(topics,button.dataset.topic))));}
export function clearIconPresence(button,present,{entering=false}={}){
 const slot=button.closest('.clear-tool-slot');
 // Commit the zero-width slot before opening it, so the toolbar slides on entry.
 if(entering&&slot)slot.getBoundingClientRect();
 if(slot)slot.dataset.present=String(present);
 delete button.dataset.entering;
 button.disabled=!present;
 if(present){delete button.dataset.exiting;button.removeAttribute('aria-hidden');}
 else{button.dataset.exiting='true';button.setAttribute('aria-hidden','true');}
 controlRuns.get(button)?.setPresent(present);
}
export function disposeIcons(root){root.querySelectorAll('[data-broad-topic]').forEach(b=>{topicRuns.get(b)?.dispose();topicRuns.delete(b);});root.querySelectorAll('[data-control-icon]').forEach(i=>{const b=i.closest('button,summary');controlRuns.get(b)?.dispose();controlRuns.delete(b);});}
