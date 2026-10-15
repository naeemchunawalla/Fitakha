(()=>{
const drawings={
'home':'<path d="M20 48L60 16L100 48M30 42V88H90V42M52 88V64H69V88"/>',
'desk':'<path d="M25 54H105M93 54V92M33 54V92M40 36V50H70V36ZM55 62L63 78H79V92"/><circle cx="52" cy="57" r="7"/>',
'walk':'<circle cx="61" cy="23" r="9"/><path d="M60 33L53 56L76 68L86 89M54 56L40 85M58 38L77 47L93 38M55 40L35 54"/>',
'strength':'<circle cx="60" cy="24" r="9"/><path d="M60 34V65M60 42L34 50L24 35M60 42L86 50L96 35M60 65L44 92M60 65L76 92M15 30H34M86 30H105M15 22V38M34 22V38M86 22V38M105 22V38"/>',
'mobility':'<circle cx="59" cy="23" r="9"/><path d="M59 33V64M59 42L25 22M59 42L93 22M59 64L34 91M59 64L84 91"/>',
'goal':'<circle cx="60" cy="54" r="34"/><circle cx="60" cy="54" r="20"/><circle cx="60" cy="54" r="5"/><path d="M60 54L98 16M85 16H98V29"/>'};
function icon(key){return '<svg viewBox="0 0 120 105" aria-hidden="true"><rect width="120" height="105" rx="18" fill="#edf0e4"/><g stroke="#285d47" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">'+drawings[key]+'</g></svg>'}
const mappings={persona:['walk','desk','home','mobility','strength','walk'],current:['desk','home','strength','walk'],goal:['walk','goal','strength','mobility','goal']};
for(const[id,icons]of Object.entries(mappings)){const select=document.getElementById(id);const group=document.createElement('div');group.className='visual-options';group.setAttribute('role','group');group.setAttribute('aria-label',document.querySelector('label[for="'+id+'"]').textContent);Array.from(select.options).forEach((option,i)=>{const b=document.createElement('button');b.type='button';b.className='visual-option';b.innerHTML=icon(icons[i]);b.append(document.createTextNode(option.textContent));b.onclick=()=>{select.value=option.value;sync()};group.append(b)});function sync(){Array.from(group.children).forEach((b,i)=>b.setAttribute('aria-pressed',String(select.selectedIndex===i)))}select.after(group);select.hidden=true;sync();select.addEventListener('change',sync);if(id==='persona'){const original=window.openQuiz;window.openQuiz=function(p){original(p);sync()}}}
document.querySelectorAll('#start .path').forEach((p,i)=>{p.insertAdjacentHTML('afterbegin',icon(mappings.persona[i]))});
})();
