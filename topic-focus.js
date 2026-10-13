/** A separate, slightly irregular selection frame; topic strokes keep their own motion. */
const NS='http://www.w3.org/2000/svg';
const outline='M21 3.5C27 3.2 34 3.8 38 3.4C38.4 14 37.6 27 38.2 38C28 38.6 14 37.7 3.8 38.2C3.4 27 4.3 13 3.6 3.8C9 3.2 15 3.6 21 3.5Z';
export function mountTopicFocus(button){
 if(button.querySelector('.topic-focus-frame'))return;
 const frame=document.createElementNS(NS,'svg');
 for(const [key,value] of Object.entries({viewBox:'0 0 42 42',width:42,height:42,'aria-hidden':'true',focusable:'false'}))frame.setAttribute(key,value);
 frame.classList.add('topic-focus-frame');
 for(const name of ['topic-focus-fill','topic-focus-outline']){
  const path=document.createElementNS(NS,'path');path.setAttribute('d',outline);path.setAttribute('pathLength','100');path.classList.add(name);frame.append(path);
 }
 button.prepend(frame);
}
