/** Real letter advances + spacing: no stretched glyphs or per-device guesses. */
export function fitBrand(brand){
 const primary=brand.querySelector('.brand-primary'),secondary=brand.querySelector('.brand-secondary');
 const text=secondary.textContent;secondary.textContent='';secondary.setAttribute('aria-label',text);
 for(const char of Array.from(text)){const span=document.createElement('span');span.textContent=char;span.setAttribute('aria-hidden','true');secondary.append(span);}
 let frame=0;
 const measure=()=>{
  frame=0;const target=primary.getBoundingClientRect().width;
  const letters=[...secondary.children],natural=letters.reduce((sum,e)=>sum+e.getBoundingClientRect().width,0);
  secondary.style.columnGap=Math.max(0,(target-natural)/Math.max(1,letters.length-1))+'px';
 };
 const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
 const observer=new ResizeObserver(schedule);observer.observe(primary);
 document.fonts.ready.then(schedule);document.fonts.addEventListener('loadingdone',schedule);window.addEventListener('resize',schedule);
 schedule();
 return ()=>{observer.disconnect();cancelAnimationFrame(frame);document.fonts.removeEventListener('loadingdone',schedule);window.removeEventListener('resize',schedule);};
}
