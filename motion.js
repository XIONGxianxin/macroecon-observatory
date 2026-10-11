/** Shared motion hooks: presentation only; no record or route changes. */
const effects=new Map(),folds=new WeakMap(),turns=new WeakMap();
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const preference='margin-page-effect-v2';
export function registerPageEffect(name,label,run,exit=null){
 if(!/^[a-z][a-z0-9-]*$/.test(name)||typeof run!=='function'||(exit!==null&&typeof exit!=='function'))throw Error('Invalid page effect');
 effects.set(name,{label,run,exit});if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('page-effects-changed'));
}
export const pageEffectOptions=()=>[...effects].map(([value,e])=>({value,label:e.label}));
export function currentPageEffect(){try{let v=localStorage.getItem(preference);return effects.has(v)?v:'emerge';}catch{return 'emerge';}}
export function setPageEffect(value){if(effects.has(value))try{localStorage.setItem(preference,value);}catch{}}
registerPageEffect('emerge','Emerge',
 element=>element.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out',fill:'both'}),
 (element,opacity)=>element.animate([{opacity},{opacity:0}],{duration:110,easing:'ease-in',fill:'both'}));
registerPageEffect('slide','Slide',
 (element,direction)=>element.animate([{opacity:0,transform:`translateX(${18*direction}px)`},{opacity:1,transform:'translateX(0)'}],{duration:250,easing:'cubic-bezier(.22,.7,.2,1)',fill:'both'}),
 (element,opacity,direction)=>element.animate([{opacity,transform:'translateX(0)'},{opacity:0,transform:`translateX(${-18*direction}px)`}],{duration:140,easing:'ease-in',fill:'both'}));
registerPageEffect('none','None',()=>{});
export function cancelPageTransition(element){
 const turn=turns.get(element);if(!turn)return;
 turns.delete(element);turn.animation?.cancel();clearTimeout(turn.gapTimer);turn.releaseGap?.();
 element.inert=false;delete element.dataset.pageTransition;
}
export async function transitionPage(element,swap,enabled=true,direction=1){
 const opacity=getComputedStyle(element).opacity;
 cancelPageTransition(element);
 const choice=currentPageEffect(),effect=effects.get(choice);
 if(!enabled||choice==='none'||reduced()||!element.animate){swap();return;}
 const turn={};turns.set(element,turn);const active=()=>turns.get(element)===turn;
 element.inert=true;
 try{
  let exit;
  if(effect.exit){
   element.dataset.pageTransition='out';exit=turn.animation=effect.exit(element,opacity,direction);
   await exit.finished;if(!active())return;
   element.dataset.pageTransition='blank';
   await new Promise(resolve=>{turn.releaseGap=resolve;turn.gapTimer=setTimeout(resolve,choice==='emerge'?30:0);});
   if(!active())return;
  }
  // Focus restoration runs during the swap, before the new ink appears.
  element.inert=false;swap();
  element.dataset.pageTransition='in';turn.animation=effect.run(element,direction);exit?.cancel();
  if(turn.animation?.finished)await turn.animation.finished;
 }catch(error){
  if(active())throw error;
 }finally{
  if(active())cancelPageTransition(element);
 }
}
export function unfoldPanel(element,open,onClosed=()=>{}){
 const prior=folds.get(element);if(prior?.open===open)return;
 const current=getComputedStyle(element),start={height:element.getBoundingClientRect().height+'px',paddingTop:current.paddingTop,paddingBottom:current.paddingBottom,opacity:current.opacity};
 prior?.animation.cancel();folds.delete(element);
 if(reduced()||!element.animate){element.style.overflow='';if(!open)onClosed();return;}
 const natural=getComputedStyle(element),full={height:element.getBoundingClientRect().height+'px',paddingTop:natural.paddingTop,paddingBottom:natural.paddingBottom,opacity:1};
 const shut={height:'0px',paddingTop:'0px',paddingBottom:'0px',opacity:0};
 element.style.overflow='hidden';
 const animation=element.animate([prior?start:open?shut:full,open?full:shut],{duration:170,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});
 const run={animation,open};folds.set(element,run);
 animation.onfinish=()=>{if(folds.get(element)!==run)return;folds.delete(element);if(!open)onClosed();animation.cancel();element.style.overflow='';};
}
