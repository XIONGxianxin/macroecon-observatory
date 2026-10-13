/** Defer first layout/paint of distant Card items; keep read cards warm on return. */
export function attachDeferredCards(root){
 const cards=[...root.querySelectorAll('.tile-card')];
 if(!cards.length||typeof IntersectionObserver==='undefined'||!globalThis.CSS?.supports('content-visibility','auto'))return ()=>{};
 let disposed=false;
 const pending=new Set(cards);
 const reveal=card=>{
  if(disposed||!pending.delete(card))return;
  card.removeAttribute('data-deferred');observer.unobserve(card);
 };
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting)reveal(entry.target);
 },{rootMargin:'800px 0px',threshold:0});
 for(const card of cards){card.setAttribute('data-deferred','');observer.observe(card);}
 // Keyboard navigation/native find can make a distant card relevant before scrolling.
 const focus=event=>{const card=event.target.closest?.('.tile-card');if(card)reveal(card);};
 root.addEventListener('focusin',focus);
 return ()=>{disposed=true;observer.disconnect();pending.clear();root.removeEventListener('focusin',focus);};
}
