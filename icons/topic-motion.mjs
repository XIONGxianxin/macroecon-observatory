import {ICON_MODELS} from './icon-models.mjs?v=20261013-4';

const NS='http://www.w3.org/2000/svg';
const controllers=new WeakMap();
const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export const TOPIC_KEYS=Object.freeze(Object.keys(ICON_MODELS));

function svgElement(tag,attributes={}){
  const element=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attributes)) element.setAttribute(key,String(value));
  return element;
}

/** Create one approved hand-drawn icon. Static SVG files remain independent. */
export function createTopicIcon(topic,{size=28,label=''}={}){
  const model=ICON_MODELS[topic];
  if(!model) throw new RangeError(`Unknown topic: ${topic}`);
  const svg=svgElement('svg',{viewBox:'0 0 32 32',width:size,height:size,fill:'none',stroke:'currentColor','stroke-width':1.25,'stroke-linecap':'round','stroke-linejoin':'round',focusable:'false','data-topic-icon':topic,'data-motion':'idle'});
  svg.classList.add('topic-motion-icon');
  if(label){svg.setAttribute('role','img');svg.setAttribute('aria-label',label);}
  else svg.setAttribute('aria-hidden','true');
  const body=svgElement('g',{'data-icon-body':''});
  const original=svgElement('g',{'data-icon-original':''});
  // This markup is the bundled, generated local SVG, never fetched user input.
  const parsed=new DOMParser().parseFromString(`<svg xmlns="${NS}">${model.original}</svg>`,'image/svg+xml');
  for(const child of [...parsed.documentElement.children]){
    const clone=document.importNode(child,true);
    if(clone.hasAttribute('stroke')) clone.setAttribute('stroke','var(--topic-icon-accent, #AC624C)');
    original.append(clone);
  }
  const strokes=svgElement('g',{'data-icon-strokes':'',display:'none'});
  for(const stroke of model.strokes){
    strokes.append(svgElement('polyline',{points:stroke.points,stroke:stroke.accent?'var(--topic-icon-accent, #AC624C)':'currentColor','stroke-dasharray':`${stroke.length} ${stroke.length}`}));
  }
  body.append(original,strokes);svg.append(body);
  return svg;
}

const tiltKeys=[[0,0,0],[.10,-6.5,-.25],[.23,-4.8,.25],[.34,1.3,.2],[.46,-.35,0],[.58,0,0]];
function tiltAt(time){
  for(let i=1;i<tiltKeys.length;i++){
    const [a,angleA,yA]=tiltKeys[i-1], [b,angleB,yB]=tiltKeys[i];
    if(time<=b){const t=smooth((time-a)/(b-a));return [angleA+(angleB-angleA)*t,yA+(yB-yA)*t];}
  }
  return [0,0];
}

/** Hover/brush => Tilt once. Click => Unravel once. Never intercept navigation. */
export function attachTopicMotion(target,{icon=target.querySelector('[data-topic-icon]')}={}){
  if(!icon || !ICON_MODELS[icon.dataset.topicIcon]) throw new TypeError('A createTopicIcon() SVG is required.');
  controllers.get(target)?.dispose();
  const model=ICON_MODELS[icon.dataset.topicIcon];
  const body=icon.querySelector('[data-icon-body]');
  const original=icon.querySelector('[data-icon-original]');
  const layer=icon.querySelector('[data-icon-strokes]');
  const parts=[...layer.children];
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,mode='idle',start=0,angle=0,y=0,settle=[0,0],queued=false,disposed=false;

  function transform(a,dy){angle=a;y=dy;body.setAttribute('transform',`translate(0 ${dy}) rotate(${a} 16 27)`);}
  function restore(){
    original.removeAttribute('display');layer.setAttribute('display','none');body.removeAttribute('transform');angle=0;y=0;
    for(const part of parts){part.removeAttribute('transform');part.removeAttribute('stroke-dashoffset');}
  }
  function stop(){cancelAnimationFrame(frame);frame=0;mode='idle';queued=false;icon.dataset.motion='idle';restore();}
  function tick(now){
    if(disposed||!icon.isConnected){stop();return;}
    const t=(now-start)/1000;
    if(mode==='tilt'){
      transform(...tiltAt(t));
      if(t>=.58){stop();return;}
    }else if(mode==='unravel'){
      const settling=1-smooth(t/.10);transform(settle[0]*settling,settle[1]*settling);
      for(let i=0;i<parts.length;i++){
        const local=t-(i/Math.max(1,parts.length-1))*.09;
        const missing=smooth(local/.24)*(1-smooth((local-.31)/.48));
        parts[i].setAttribute('stroke-dashoffset',String(-model.strokes[i].length*missing));
        parts[i].setAttribute('transform',`translate(${missing*(i%2?1.1:-1.1)} ${missing*(i%3?-.8:.8)})`);
      }
      if(t>=.94){const again=queued;stop();if(again) unravel();return;}
    }else return;
    frame=requestAnimationFrame(tick);
  }
  function tilt(){
    if(disposed||media.matches||mode!=='idle') return;
    mode='tilt';icon.dataset.motion=mode;start=performance.now();frame=requestAnimationFrame(tick);
  }
  function unravel(){
    if(disposed||media.matches) return;
    if(mode==='unravel'){queued=true;return;}
    cancelAnimationFrame(frame);settle=[angle,y];queued=false;
    original.setAttribute('display','none');layer.removeAttribute('display');
    mode='unravel';icon.dataset.motion=mode;start=performance.now();frame=requestAnimationFrame(tick);
  }
  function onEnter(event){if(event.pointerType==='mouse'||event.pointerType==='pen') tilt();}
  function onPreference(){if(media.matches) stop();}
  target.addEventListener('pointerenter',onEnter);
  target.addEventListener('click',unravel);
  media.addEventListener('change',onPreference);
  const controller={
    tilt,unravel,
    dispose(){
      if(disposed)return;
      stop();disposed=true;target.removeEventListener('pointerenter',onEnter);target.removeEventListener('click',unravel);media.removeEventListener('change',onPreference);
      if(controllers.get(target)===controller)controllers.delete(target);
    }
  };
  controllers.set(target,controller);
  return controller;
}
