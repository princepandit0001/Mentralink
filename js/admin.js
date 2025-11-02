// Admin page script for Mentralink (client-side prototype)
(function(){
  const storageKeys = {posts:'ml_posts_v1', mentors:'ml_mentors_v1', events:'ml_events_v1', groups:'ml_groups_v1'}
  const adminCreds = {user:'admin', pass:'admin123'}

  const $ = (sel, root=document) => root.querySelector(sel)
  const byId = id => document.getElementById(id)

  function read(key){ try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return []} }
  function write(key,arr){ localStorage.setItem(key,JSON.stringify(arr)) }

  function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

  function setAdmin(){ sessionStorage.setItem('ml_admin_auth','1') }
  function clearAdmin(){ sessionStorage.removeItem('ml_admin_auth') }
  function isAdmin(){ return sessionStorage.getItem('ml_admin_auth') === '1' }

  function renderLists(){
    // posts
    const lp = byId('list-posts'); lp.innerHTML = ''
    read(storageKeys.posts).forEach(p=>{
      const item = document.createElement('div'); item.className='admin-item'
      item.innerHTML = `<div><strong>${escapeHtml(p.title)}</strong><div class="meta">${escapeHtml(p.authorName||'Anonymous')} • ${new Date(p.created).toLocaleString()}</div></div><div class="admin-controls"><button data-id="${p.id}" data-action="del-post">Delete</button></div>`
      lp.appendChild(item)
    })

    // mentors
    const lm = byId('list-mentors'); lm.innerHTML = ''
    read(storageKeys.mentors).forEach(m=>{
      const item = document.createElement('div'); item.className='admin-item'
      item.innerHTML = `<div>${escapeHtml(m.name)} <div class="meta">${escapeHtml(m.role)}</div></div><div class="admin-controls"><button data-id="${m.id}" data-action="del-mentor">Delete</button></div>`
      lm.appendChild(item)
    })

    // events
    const le = byId('list-events'); le.innerHTML = ''
    read(storageKeys.events).forEach(ev=>{
      const item = document.createElement('div'); item.className='admin-item'
      item.innerHTML = `<div>${escapeHtml(ev.title)} <div class="meta">${escapeHtml(ev.organization||'')} • ${new Date(ev.date).toLocaleString()}</div></div><div class="admin-controls"><button data-id="${ev.id}" data-action="del-event">Delete</button></div>`
      le.appendChild(item)
    })

    // groups
    const lg = byId('list-groups'); lg.innerHTML = ''
    read(storageKeys.groups).forEach(g=>{
      const item = document.createElement('div'); item.className='admin-item'
      item.innerHTML = `<div>${escapeHtml(g.name)} <div class="meta">${escapeHtml(g.topic)}</div></div><div class="admin-controls"><button data-id="${g.id}" data-action="del-group">Delete</button></div>`
      lg.appendChild(item)
    })
  }

  function bind(){
    const loginBtn = byId('login-btn'); const logoutBtn = byId('logout-btn'); const clearBtn = byId('clear-storage')
    if(loginBtn) loginBtn.addEventListener('click', ()=>{
      const u = byId('login-user').value.trim(); const p = byId('login-pass').value
      if(u === adminCreds.user && p === adminCreds.pass){ setAdmin(); renderUI(); alert('Admin logged in') }
      else alert('Invalid credentials')
    })
    if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ clearAdmin(); renderUI(); alert('Logged out') })
    if(clearBtn) clearBtn.addEventListener('click', ()=>{
      if(!confirm('Clear all local data? This cannot be undone.')) return
      localStorage.clear(); alert('Local data cleared'); renderUI()
    })

    // delegated clicks in admin panel lists
    document.addEventListener('click', e=>{
      const btn = e.target.closest('button[data-action]')
      if(!btn) return
      const action = btn.dataset.action; const id = btn.dataset.id
      if(!isAdmin()) return alert('Admin login required')
      if(action === 'del-post'){
        if(!confirm('Delete this post?')) return
        const posts = read(storageKeys.posts).filter(x=>x.id!==id); write(storageKeys.posts, posts); renderLists(); alert('Post deleted')
      }
      if(action === 'del-mentor'){
        if(!confirm('Delete this mentor?')) return
        const mentors = read(storageKeys.mentors).filter(x=>x.id!==id); write(storageKeys.mentors, mentors); renderLists(); alert('Mentor deleted')
      }
      if(action === 'del-event'){
        if(!confirm('Delete this event?')) return
        const events = read(storageKeys.events).filter(x=>x.id!==id); write(storageKeys.events, events); renderLists(); alert('Event deleted')
      }
      if(action === 'del-group'){
        if(!confirm('Delete this group?')) return
        const groups = read(storageKeys.groups).filter(x=>x.id!==id); write(storageKeys.groups, groups); renderLists(); alert('Group deleted')
      }
    })
  }

  function renderUI(){
    const panel = byId('admin-panel'); const login = byId('admin-login')
    if(!panel || !login) return
    if(isAdmin()){ login.classList.add('hidden'); panel.classList.remove('hidden'); byId('logout-btn').classList.remove('hidden') } else { login.classList.remove('hidden'); panel.classList.add('hidden'); byId('logout-btn').classList.add('hidden') }
    renderLists()
  }

  document.addEventListener('DOMContentLoaded', ()=>{ bind(); renderUI() })

})();
