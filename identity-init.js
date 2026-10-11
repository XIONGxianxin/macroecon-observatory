/* URL overrides personal choice; new visitors receive the production B direction. */
(()=>{let value=new URLSearchParams(location.search).get('direction')?.toLowerCase();
 if(!['b','c'].includes(value)){try{value=localStorage.getItem('margin-direction');}catch{}}
 document.documentElement.dataset.direction=['b','c'].includes(value)?value:'b';

})();
