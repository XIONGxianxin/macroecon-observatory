/** Shared source note and design attribution, including the static fallback. */
import {COPY} from './content.js';
import {esc,external} from './format.js';
export function footerMarkup(){
 const s=COPY.site;
 return `<p>${esc(s.footer)}</p><p class="design-credit">${esc(s.credit)} ${external(s.referenceUrl,s.referenceName)} (${esc(s.identityCredit)} ${external(s.designerUrl,s.designerName)}).</p>`;
}
