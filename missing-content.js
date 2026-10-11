/** Delegated missing-field hints: hover/focus in CSS, tap/click and Escape here. */
export function attachMissingHints(root){
 const close=except=>root.querySelectorAll('[data-missing-toggle][aria-expanded="true"]').forEach(button=>{if(button!==except)button.setAttribute('aria-expanded','false');});
 root.addEventListener('click',event=>{
  const button=event.target.closest('[data-missing-toggle]');if(!button)return;
  const open=button.getAttribute('aria-expanded')==='true';close(button);button.setAttribute('aria-expanded',String(!open));
 });
 document.addEventListener('click',event=>{if(!event.target.closest('.text-placeholder'))close();});
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&event.target.matches('[data-missing-toggle]')){close();event.target.blur();}});
 root.addEventListener('focusout',event=>{if(event.target.matches('[data-missing-toggle]'))event.target.setAttribute('aria-expanded','false');});
}
