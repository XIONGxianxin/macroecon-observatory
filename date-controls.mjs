/** English date entry/calendar, independent of browser and OS date locale. */
import {COPY,wording} from './content.js?v=20261013-4';
import {esc} from './format.js?v=20261013-4';
const MONTHS=COPY.date.months;
const DAYS=COPY.date.weekdays;
const pad=n=>String(n).padStart(2,'0');
export function validDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;
}
export function calendarMarkup(year,month,selected=''){
 const start=new Date(Date.UTC(year,month,1)).getUTCDay(),count=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 const cells=Array.from({length:start},()=>'<span class="calendar-empty"></span>');
 for(let day=1;day<=count;day++){
  const value=`${year}-${pad(month+1)}-${pad(day)}`;
  cells.push(`<button type="button" data-date-value="${value}" aria-label="${esc(MONTHS[month])} ${day}, ${year}" ${value===selected?'aria-current="date"':''}>${day}</button>`);
 }
 return `<div class="calendar-heading"><button type="button" data-month-step="-1" aria-label="${esc(COPY.date.previous)}">${esc(COPY.date.previousShort)}</button><strong aria-live="polite">${esc(MONTHS[month])} ${year}</strong><button type="button" data-month-step="1" aria-label="${esc(COPY.date.next)}">${esc(COPY.date.nextShort)}</button></div><div class="calendar-days">${DAYS.map(d=>`<span>${esc(d)}</span>`).join('')}${cells.join('')}</div>`;
}
export function dateControl(name,label,value=''){
 const safe=validDate(value)?value:'';
 return `<div class="date-field"><label for="date-${name}">${esc(label)}</label><div class="date-entry"><input id="date-${name}" type="text" name="${name}" data-date-input placeholder="${esc(COPY.date.placeholder)}" aria-label="${esc(wording(COPY.date.dateLabel,{field:label}))}" inputmode="numeric" autocomplete="off" maxlength="10" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" value="${safe}"><details class="date-picker"><summary aria-label="${esc(wording(COPY.date.choose,{field:label.toLowerCase()}))}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 10h18M8 3v5m8-5v5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></summary><div class="date-popover" role="group" aria-label="${esc(wording(COPY.date.calendar,{field:label}))}"></div></details></div></div>`;
}
export function attachDateControls(form,onChange){
 form.querySelectorAll('.date-field').forEach(field=>{
  const input=field.querySelector('input'),picker=field.querySelector('details'),panel=field.querySelector('.date-popover');
  let cursor;
  const show=()=>{panel.innerHTML=calendarMarkup(cursor.getUTCFullYear(),cursor.getUTCMonth(),input.value);};
  picker.addEventListener('toggle',()=>{
   if(!picker.open)return;
   form.querySelectorAll('.date-picker').forEach(other=>{if(other!==picker)other.open=false;});
   const selected=validDate(input.value),d=selected?new Date(input.value+'T12:00:00Z'):new Date();cursor=new Date(Date.UTC(selected?d.getUTCFullYear():d.getFullYear(),selected?d.getUTCMonth():d.getMonth(),1));show();
   const host=field.closest('.tool-panel'),bounds=host?.getBoundingClientRect(),rect=field.querySelector('.date-entry').getBoundingClientRect(),height=panel.getBoundingClientRect().height;
   const below=(bounds?.bottom||window.innerHeight)-rect.bottom-8,above=rect.top-(bounds?.top||0)-8;
   const upwards=below<height&&above>=height;picker.classList.toggle('above',upwards);
   if(host&&!upwards&&below<height)host.scrollTop+=height-below;
  });
  panel.addEventListener('click',event=>{
   const button=event.target.closest('button');if(!button)return;
   if(button.dataset.monthStep){cursor.setUTCMonth(cursor.getUTCMonth()+Number(button.dataset.monthStep));show();panel.querySelector(`[data-month-step="${button.dataset.monthStep}"]`).focus();return;}
   if(button.dataset.dateValue){input.value=button.dataset.dateValue;input.setCustomValidity('');picker.open=false;input.focus({preventScroll:true});onChange();}
  });
  field.addEventListener('keydown',event=>{if(event.key==='Escape'&&picker.open){event.preventDefault();event.stopPropagation();picker.open=false;input.focus();}});
  input.addEventListener('input',()=>input.setCustomValidity(''));
  input.addEventListener('change',onChange);
 });
}
export function validateDateForm(form){
 const inputs=[...form.querySelectorAll('[data-date-input]')];
 for(const input of inputs)input.setCustomValidity(input.value&&!validDate(input.value)?COPY.date.invalid:'');
 const from=inputs.find(i=>i.name==='from'),to=inputs.find(i=>i.name==='to');
 if(from?.value&&to?.value&&validDate(from.value)&&validDate(to.value)&&from.value>to.value)to.setCustomValidity(COPY.date.rangeError);
 const invalid=inputs.find(input=>!input.validity.valid);
 if(invalid)for(let parent=invalid.parentElement;parent&&parent!==form;parent=parent.parentElement)if(parent.matches('details[data-ui-key]'))parent.open=true;
 return form.reportValidity();
}
