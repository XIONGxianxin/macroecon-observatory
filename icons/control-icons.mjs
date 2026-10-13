const NS='http://www.w3.org/2000/svg';
export const CONTROL_KEYS=Object.freeze(['more','search','filter','clear']);
const smooth=n=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const number=n=>Number(n.toFixed(4));
const accent='var(--ui-icon-accent, #AC624C)';
let nextClip=0;
const curve=values=>`M${values.slice(0,2).map(number).join(' ')} C${values.slice(2).map(number).join(' ')}`;
const mix=(a,b,p)=>a.map((v,i)=>v+(b[i]-v)*p);
const moreClosed=[[4,7.5,11,7.1,20,7.8,28,7.2],[4,16,12,16.4,21,15.7,28,16.2],[4,24.7,12,24.4,20,25.3,28,24.8]];
const moreOpen=[[7,7,12.4,12.1,19,20,25,25],[16,16,16,16,16,16,16,16],[7,25,13,18.8,19,13.3,25,7]];
const lens='M22.8 13.1C23.2 7.2 18.7 3.6 13 4C7.1 3.5 3.6 8 4 13.3C3.5 19.3 8.4 23 13.4 22.6C19 23.1 23.3 18.4 22.8 13.1Z';
const rails='<path d="M4 10C12 9.7 20 10.4 28 10.1M4 22C12 22.4 20 21.7 28 22.1"/>';
const clear=`<path stroke="${accent}" d="M7 7C12.5 12.1 19.5 20.3 25 25"/><path d="M7 25C12.8 19.1 19.4 12.9 25 7"/>`;
function knob(x,y,highlight=false){return `<path${highlight?` stroke="${accent}"`:''} fill="var(--ui-icon-paper, #F7F4EE)" d="M${number(x+2.8)} ${y}C${number(x+3.2)} ${number(y-3.3)} ${number(x-2.8)} ${number(y-3.7)} ${number(x-3)} ${y}C${number(x-3.3)} ${number(y+3.3)} ${number(x+2.5)} ${number(y+3.6)} ${number(x+2.8)} ${y}Z"/>`;}

/** Pure SVG frame, shared by browser motion and exported visual previews. */
export function controlFrame(kind,value,{glint=0,clipId='hand-search-glass'}={}){
  const p=Math.max(0,Math.min(1,value));
  if(kind==='more')return {markup:moreClosed.map((a,i)=>`<path d="${curve(mix(a,moreOpen[i],p))}"${i===0?` stroke="${accent}"`:''}${i===1?` opacity="${number(1-p)}"`:''}/>`).join(''),transform:'',opacity:1};
  if(kind==='search'){
    const shift=-20+40*Math.max(0,Math.min(1,glint));
    const shine=number(Math.sin(Math.PI*Math.max(0,Math.min(1,glint)))*.42);
    const markup=`<defs><clipPath id="${clipId}"><path d="${lens}"/></clipPath></defs><path d="${lens}"/><path stroke="${accent}" d="M20.4 20.4C22.4 22.2 25.4 25.8 28 28"/><path clip-path="url(#${clipId})" stroke="${accent}" stroke-width="2.5" opacity="${shine}" d="M${number(6+shift)} 20 L${number(20+shift)} 6"/>`;
    return {markup,transform:`translate(16 16) scale(${number(1+p*.12)}) translate(-16 -16)`,opacity:1};
  }
  if(kind==='filter')return {markup:rails+knob(9+13*p,10,true)+knob(22-13*p,22),transform:'',opacity:1};
  if(kind==='clear')return {markup:clear,transform:`translate(16 16) rotate(${number(p*70)}) scale(${number(1-p*.65)}) translate(-16 -16)`,opacity:number(1-p)};
  throw new RangeError(`Unknown control icon: ${kind}`);
}
export function controlSVG(kind,{progress=0,size=28,label=kind}={}){
  const f=controlFrame(kind,progress);
  return `<svg xmlns="${NS}" viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" stroke="currentColor" color="#252623" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><title>${label}</title><g transform="${f.transform}" opacity="${f.opacity}">${f.markup}</g></svg>`;
}
export function createControlIcon(kind,{size=28,label=''}={}){
  if(!CONTROL_KEYS.includes(kind))throw new RangeError(`Unknown control icon: ${kind}`);
  const svg=document.createElementNS(NS,'svg');
  const attributes={viewBox:'0 0 32 32',width:size,height:size,fill:'none',stroke:'currentColor','stroke-width':1.35,'stroke-linecap':'round','stroke-linejoin':'round',focusable:'false','data-control-icon':kind,'data-control-motion':'idle'};
  for(const [k,v] of Object.entries(attributes))svg.setAttribute(k,String(v));
  svg.classList.add('control-motion-icon');
  if(label){svg.setAttribute('role','img');svg.setAttribute('aria-label',label);}else svg.setAttribute('aria-hidden','true');
  const group=document.createElementNS(NS,'g');group.setAttribute('data-control-body','');svg.append(group);
  applyFrame(group,kind,0,{clipId:`hand-search-glass-${++nextClip}`});
  return svg;
}
function applyFrame(group,kind,progress,options){
  const f=controlFrame(kind,progress,options);
  const parsed=new DOMParser().parseFromString(`<svg xmlns="${NS}">${f.markup}</svg>`,'image/svg+xml');
  const nodes=[...parsed.documentElement.children];
  // Keep existing nodes while changing paths, avoiding DOM replacement during motion.
  if(group.children.length!==nodes.length)group.replaceChildren(...nodes.map(n=>document.importNode(n,true)));
  else nodes.forEach((n,i)=>{
    const current=group.children[i];
    for(const attr of [...current.attributes])if(!n.hasAttribute(attr.name))current.removeAttribute(attr.name);
    for(const attr of [...n.attributes])current.setAttribute(attr.name,attr.value);
  });
  if(f.transform)group.setAttribute('transform',f.transform);else group.removeAttribute('transform');
  group.setAttribute('opacity',String(f.opacity));
}
const controllers=new WeakMap();
/**
 * No hover/Tilt/Unravel here. Default: let actual panel state drive setExpanded().
 * automatic=true is only for standalone buttons/demos without an existing controller.
 */
export function attachControlMotion(target,{icon=target.querySelector('[data-control-icon]'),automatic=false,initialExpanded=false,initialPresent=true,onExited=()=>{}}={}){
  const kind=icon?.dataset.controlIcon;
  if(!CONTROL_KEYS.includes(kind))throw new TypeError('A createControlIcon() SVG is required.');
  controllers.get(target)?.dispose();
  const body=icon.querySelector('[data-control-body]');
  const clipId=icon.querySelector('clipPath')?.id||`hand-search-glass-${++nextClip}`;
  const paint=(p,glint=0)=>applyFrame(body,kind,p,{clipId,glint});
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const duration=kind==='clear'?180:kind==='more'?220:kind==='search'?260:200;
  let progress=kind==='clear'?(initialPresent?0:1):(initialExpanded?1:0),goal=progress,from=progress,start=0,frame=0,disposed=false;
  paint(progress);
  function finish(){
    progress=goal;paint(progress);icon.dataset.controlMotion='idle';frame=0;
    if(kind==='clear'&&goal===1)onExited();
  }
  function tick(now){
    if(disposed||!icon.isConnected){cancelAnimationFrame(frame);frame=0;progress=goal;icon.dataset.controlMotion='idle';paint(progress);return;}
    const t=Math.min(1,(now-start)/duration);progress=from+(goal-from)*smooth(t);paint(progress,kind==='search'&&goal>from?smooth(t):0);
    if(t===1){finish();return;}frame=requestAnimationFrame(tick);
  }
  function move(next,{animate=true}={}){
    if(disposed)return;
    if(next===goal&&frame)return;
    if(next===goal&&progress===goal)return;
    cancelAnimationFrame(frame);frame=0;goal=next;
    if(!animate||media.matches){finish();return;}
    from=progress;start=performance.now();icon.dataset.controlMotion='morph';frame=requestAnimationFrame(tick);
  }
  const controller={
    setExpanded(open,options){if(kind==='clear')throw new TypeError('Use setPresent() for clear.');move(open?1:0,options);},
    setPresent(present,options){if(kind!=='clear')throw new TypeError('Use setExpanded() for panel icons.');move(present?0:1,options);},
    dismiss(){if(kind!=='clear')throw new TypeError('Only the clear icon can be dismissed.');move(1);},
    get progress(){return progress;},
    get expanded(){return goal===1&&kind!=='clear';},
    get present(){return goal===0&&kind==='clear';},
    dispose(){if(disposed)return;cancelAnimationFrame(frame);frame=0;disposed=true;progress=goal;paint(progress);icon.dataset.controlMotion='idle';target.removeEventListener('click',click);media.removeEventListener('change',preference);if(controllers.get(target)===controller)controllers.delete(target);}
  };
  function click(){if(kind==='clear')controller.dismiss();else controller.setExpanded(goal!==1);}
  function preference(){if(media.matches&&frame){cancelAnimationFrame(frame);finish();}}
  if(automatic)target.addEventListener('click',click);
  media.addEventListener('change',preference);controllers.set(target,controller);
  return controller;
}
