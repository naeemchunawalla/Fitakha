(()=>{'use strict';
const track=document.getElementById('team-track');if(!track)return;
const cards=Array.from(track.children),dotsHost=document.querySelector('.team-dots'),prev=document.getElementById('team-prev'),next=document.getElementById('team-next'),status=document.querySelector('.team-position');let active=0,frame=0;
const names=cards.map(c=>c.querySelector('h3').textContent);
const dots=cards.map((card,i)=>{card.setAttribute('role','group');card.setAttribute('aria-roledescription','slide');card.setAttribute('aria-label',(i+1)+' of '+cards.length+': '+names[i]);const b=document.createElement('button');b.type='button';b.className='team-dot';b.setAttribute('aria-label','Show '+names[i]);b.setAttribute('aria-controls','team-track');b.onclick=()=>go(i);dotsHost.append(b);return b});
function position(i){return cards[i].getBoundingClientRect().left-track.getBoundingClientRect().left+track.scrollLeft}
function update(){active=cards.reduce((best,c,i)=>Math.abs(position(i)-track.scrollLeft)<Math.abs(position(best)-track.scrollLeft)?i:best,0);dots.forEach((b,i)=>b.setAttribute('aria-current',String(i===active)));prev.disabled=active===0;next.disabled=active===cards.length-1;status.textContent=(active+1)+' / '+cards.length+' · '+names[active];}
function go(i){i=Math.max(0,Math.min(cards.length-1,i));track.scrollTo({left:position(i),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update)},{passive:true});
track.addEventListener('keydown',e=>{if(e.target!==track)return;const targets={ArrowLeft:active-1,ArrowRight:active+1,Home:0,End:cards.length-1};if(e.key in targets){e.preventDefault();go(targets[e.key])}});
prev.onclick=()=>go(active-1);next.onclick=()=>go(active+1);
window.addEventListener('resize',()=>{track.scrollTo({left:position(active),behavior:'instant'});update()});update();
})();
