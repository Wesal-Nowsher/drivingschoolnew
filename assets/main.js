document.querySelector('.menu-btn')?.addEventListener('click',()=>document.querySelector('nav.main').classList.toggle('open'));
document.querySelectorAll('.tabs').forEach(t=>t.addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;
const scope=t.parentElement;scope.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));
scope.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===b.dataset.tab));}));
document.querySelectorAll('form.enquiry').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();f.innerHTML='<h3>Thank you! 🎉</h3><p>Our team will call you within 2 working hours.</p>';}));
const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();
