// Simple Mentralink prototype — single-file app logic
(function(){
  const storageKeys = {posts:'ml_posts_v1', mentors:'ml_mentors_v1', events:'ml_events_v1', groups:'ml_groups_v1'}

  // Utilities
  const $ = (sel, root=document)=> root.querySelector(sel)
  const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel))
  const byId = id => document.getElementById(id)
  const nowId = ()=> Date.now().toString(36)

  

  // Initial sample data if none
  function seed(){
    if(!localStorage.getItem(storageKeys.posts)){
      const sample = [
        {id:nowId(),title:'How to approach DP problems?',body:'Pointers on dynamic programming patterns for contest problems?',tags:['algorithms','dp'],votes:6,created:Date.now()-86400000,replies:[],authorName:'Asha Rao',authorDesignation:'SDE · ML',authorPhoto:''},
        {id:nowId(),title:'Best way to prepare for internships?',body:'What projects or resources helped you get internships?',tags:['career','internships'],votes:4,created:Date.now()-3600000,replies:[],authorName:'Ravi Kumar',authorDesignation:'Student',authorPhoto:''}
      ];
      localStorage.setItem(storageKeys.posts, JSON.stringify(sample))
    }
    if(!localStorage.getItem(storageKeys.mentors)){
      const sample = [
        {id:nowId(),name:'Asha Rao',role:'Software Engineer · ML',contact:'https://linkedin.com/in/asha',photo:''},
        {id:nowId(),name:'Ravi Kumar',role:'SWE Intern',contact:'',photo:''}
      ];
      localStorage.setItem(storageKeys.mentors, JSON.stringify(sample))
    }
    if(!localStorage.getItem(storageKeys.events)){
      const sample = [
        {id:nowId(),title:'Resume clinic + AMA',date:new Date(Date.now()+3*86400000).toISOString(),desc:'Drop resumes and get quick feedback.',organization:'Career Center',organizer:'Priya Singh',topic:'Resumes & Interview Prep',organizerPhoto:''}
      ];
      localStorage.setItem(storageKeys.events, JSON.stringify(sample))
    }
    if(!localStorage.getItem(storageKeys.groups)){
      const sample = [
        {id:nowId(),name:'AI Project Squad',topic:'Machine Learning',members:5}
      ];
      localStorage.setItem(storageKeys.groups, JSON.stringify(sample))
    }
  }

  // Data helpers
  function read(key){ try{return JSON.parse(localStorage.getItem(key)||'[]')}catch(e){return []} }
  function write(key,arr){ localStorage.setItem(key,JSON.stringify(arr)) }

  // Renderers
  function renderFeed(q=''){
    const target = byId('feed'); target.innerHTML=''
    const posts = read(storageKeys.posts).slice().sort((a,b)=>b.votes - a.votes || b.created - a.created)
    posts.filter(p=> (p.title+p.body+(p.tags||[]).join(' ')).toLowerCase().includes(q.toLowerCase())).forEach(p=>{
      const el = document.createElement('div'); el.className='post card'
      // attach post id to container to make event handling robust
      el.dataset.postId = p.id
      // build replies list (include author info when available)
      const repliesHtml = (p.replies||[]).map(r=>{
        const rimg = r.authorPhoto ? `<img class="avatar" src="${r.authorPhoto}" alt="${escapeHtml(r.authorName)}"/>` : ''
        const rmeta = `${escapeHtml(r.authorName||'Anonymous')} ${r.authorDesignation?`• ${escapeHtml(r.authorDesignation)}`:''}`
        return `<div class="reply"><div style="display:flex;gap:8px;align-items:flex-start">${rimg}<div><div class="meta">${rmeta} • ${new Date(r.created).toLocaleString()}</div><div class="body">${escapeHtml(r.text)}</div></div></div></div>`
      }).join('')

      const authorImg = p.authorPhoto ? `<img class="avatar" src="${p.authorPhoto}" alt="${escapeHtml(p.authorName)}"/>` : ''
      const authorMeta = `${escapeHtml(p.authorName||'Anonymous')} ${p.authorDesignation?`• ${escapeHtml(p.authorDesignation)}`:''}`

      el.innerHTML = `<div style="display:flex;gap:10px;align-items:center">${authorImg}<div style="flex:1"><h3 style="margin:0">${escapeHtml(p.title)}</h3><div class="muted small">${authorMeta}</div></div></div>
        <div class="meta small">${new Date(p.created).toLocaleString()} • <span class="muted votes-count">${p.votes} votes</span></div>
        <div class="body">${escapeHtml(p.body)}</div>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        <div class="actions small">
          <button data-action="upvote" data-id="${p.id}">▲ Upvote</button>
          <button data-action="details" data-id="${p.id}">Details</button>
          <button class="reply-toggle" data-action="reply-toggle" data-id="${p.id}">Reply</button>
        </div>
        <div class="reply-wrapper">
          <div class="reply-form hidden" data-id="${p.id}">
            <input class="reply-name" placeholder="Your name" />
            <input class="reply-designation" placeholder="Designation (optional)" />
            <div class="form-row">
              <label class="file-input">
                <input type="file" accept="image/*" capture="user" class="reply-photo-input" />
                Upload photo
              </label>
              <img class="reply-photo-preview preview hidden" alt="reply photo preview" />
            </div>
            <textarea class="reply-input" placeholder="Write your reply..."></textarea>
            <div class="form-row"><button class="primary" data-action="reply-submit" data-id="${p.id}">Post Reply</button></div>
          </div>
          <div class="replies">${repliesHtml}</div>
        </div>`
      target.appendChild(el)
      // Attach a direct upvote handler to avoid delegation ambiguity
      const upBtn = el.querySelector('button[data-action="upvote"]')
      if(upBtn){
        upBtn.addEventListener('click', ev=>{
          ev.stopPropagation()
          // resolve the post id from the closest post container to be robust
          const postEl = upBtn.closest('.post')
          const idToInc = postEl && postEl.dataset.postId
          const posts = read(storageKeys.posts)
          const post = posts.find(x=>x.id===idToInc)
          if(post){
            post.votes = (post.votes||0) + 1
            write(storageKeys.posts, posts)
            // update only the votes display for this post to avoid reordering confusion
            const votesEl = postEl && postEl.querySelector('.votes-count')
            if(votesEl) votesEl.textContent = `${post.votes} votes`
            console.debug('upvote', {resolvedId: idToInc, votes: post.votes})
          } else {
            console.debug('upvote: post not found', {resolvedId: idToInc, closureId: p.id})
          }
        })
      }
    })
  }

  function renderMentors(){
    const list = byId('mentors-list'); list.innerHTML=''
    read(storageKeys.mentors).forEach(m=>{
      const el = document.createElement('div'); el.className='mentor'
      const img = m.photo ? `<img class="avatar" src="${m.photo}" alt="${escapeHtml(m.name)}"/>` : ''
      el.innerHTML = `<div class="mentor-row">${img}<div>
        <h4>${escapeHtml(m.name)}</h4>
        <div class="muted">${escapeHtml(m.role)}</div>
        <div class="small">${m.contact?`<a href="${escapeHtml(m.contact)}" target="_blank">Contact</a>`:'—'}</div>
      </div></div>`
      list.appendChild(el)
    })
  }

  function renderEvents(){
    const list = byId('events-list'); list.innerHTML=''
    read(storageKeys.events).forEach(e=>{
      const el = document.createElement('div'); el.className='event'
      const img = e.organizerPhoto ? `<img class="avatar" src="${e.organizerPhoto}" alt="${escapeHtml(e.organizer)}"/>` : ''
      el.innerHTML = `<div style="display:flex;gap:10px;align-items:flex-start">${img}<div>
        <h4>${escapeHtml(e.title)}</h4>
        <div class="muted">${new Date(e.date).toLocaleString()} • ${escapeHtml(e.organization||'')}</div>
        <div class="small">Organizer: ${escapeHtml(e.organizer||'—')} • Topic: ${escapeHtml(e.topic||'—')}</div>
        <div style="margin-top:6px" class="small">${escapeHtml(e.desc||'')}</div>
      </div></div>`
      list.appendChild(el)
    })
  }

  function renderGroups(){
    const list = byId('groups-list'); list.innerHTML=''
    read(storageKeys.groups).forEach(g=>{
      const el = document.createElement('div'); el.className='group'
      el.innerHTML = `<h4>${escapeHtml(g.name)}</h4><div class="muted">${escapeHtml(g.topic)}</div><div class="small">Members: ${g.members||1}</div>`
      list.appendChild(el)
    })
  }

  // Simple sanitizer
  function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) }

  // Routing & UI
  function showRoute(route){
    $$('.page').forEach(p=>p.classList.add('hidden'))
    const el = byId(route); if(el) el.classList.remove('hidden')
  $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.route===route))
  }

  function bind(){
    // nav
    $$('.nav-btn').forEach(b=> b.addEventListener('click', ()=> showRoute(b.dataset.route) ))

    // search
    byId('search').addEventListener('input', e=> renderFeed(e.target.value))

    // new question toggle
    byId('new-question-toggle').addEventListener('click', ()=> byId('new-question').classList.toggle('hidden'))
    byId('post-question').addEventListener('click', ()=>{
      const t = byId('q-title').value.trim(); const b = byId('q-body').value.trim(); const tags = byId('q-tags').value.split(',').map(s=>s.trim()).filter(Boolean)
      const author = byId('q-author').value.trim(); const authorDesig = byId('q-designation').value.trim(); const authorPhoto = byId('q-photo').dataset.url || ''
      if(!t||!b){ alert('Enter title and description'); return }
      const posts = read(storageKeys.posts)
      posts.push({id:nowId(),title:t,body:b,tags:tags,votes:0,created:Date.now(),replies:[],authorName:author,authorDesignation:authorDesig,authorPhoto})
      write(storageKeys.posts,posts); renderFeed(); byId('q-title').value=''; byId('q-body').value=''; byId('q-tags').value=''; byId('q-author').value=''; byId('q-designation').value=''; byId('q-photo').value=''; byId('q-photo').removeAttribute('data-url'); byId('q-photo-preview').classList.add('hidden'); byId('new-question').classList.add('hidden')
    })

    // ask page submit (duplicate small form)
    byId('ask-post').addEventListener('click', ()=>{
      const t = byId('ask-title').value.trim(); const b = byId('ask-body').value.trim(); const tags = byId('ask-tags').value.split(',').map(s=>s.trim()).filter(Boolean)
      const author = byId('ask-name').value.trim(); const authorDesig = byId('ask-designation').value.trim(); const authorPhoto = byId('ask-photo').dataset.url || ''
      if(!t||!b){ alert('Enter title and description'); return }
      const posts = read(storageKeys.posts); posts.push({id:nowId(),title:t,body:b,tags,created:Date.now(),votes:0,replies:[],authorName:author,authorDesignation:authorDesig,authorPhoto}); write(storageKeys.posts,posts); renderFeed(); showRoute('home')
      byId('ask-title').value=''; byId('ask-body').value=''; byId('ask-tags').value=''; byId('ask-name').value=''; byId('ask-designation').value=''; byId('ask-photo').value=''; byId('ask-photo').removeAttribute('data-url'); byId('ask-photo-preview').classList.add('hidden')
    })

    // mentor form
    byId('add-mentor-toggle').addEventListener('click', ()=> byId('mentor-form').classList.toggle('hidden'))
    // mentor photo handling
    byId('m-photo').addEventListener('change', e=> handleFilePreview(e.target, 'm-photo-preview'))
    byId('m-add').addEventListener('click', ()=>{
      const name=byId('m-name').value.trim(); const role=byId('m-role').value.trim(); const contact=byId('m-contact').value.trim()
      if(!name||!role){ alert('Name and role are required'); return }
      const photo = byId('m-photo').dataset.url || ''
      const mentors = read(storageKeys.mentors); mentors.push({id:nowId(),name,role,contact,photo}); write(storageKeys.mentors,mentors); renderMentors(); byId('m-name').value=''; byId('m-role').value=''; byId('m-contact').value=''; byId('m-photo').value=''; byId('m-photo').removeAttribute('data-url'); byId('m-photo-preview').classList.add('hidden'); byId('mentor-form').classList.add('hidden')
    })

    // events
    byId('add-event-toggle').addEventListener('click', ()=> byId('event-form').classList.toggle('hidden'))
    // organizer photo handling
    byId('e-organizer-photo').addEventListener('change', e=> handleFilePreview(e.target, 'e-org-preview'))
    byId('e-add').addEventListener('click', ()=>{
      const t=byId('e-title').value.trim(); const d=byId('e-date').value; const desc=byId('e-desc').value.trim(); const org=byId('e-org').value.trim(); const organizer=byId('e-organizer').value.trim(); const topic=byId('e-topic').value.trim()
      if(!t||!d){ alert('Title and date required'); return }
      const organizerPhoto = byId('e-organizer-photo').dataset.url || ''
      const events = read(storageKeys.events); events.push({id:nowId(),title:t,date:new Date(d).toISOString(),desc,organization:org,organizer,topic,organizerPhoto}); write(storageKeys.events,events); renderEvents(); byId('e-title').value=''; byId('e-desc').value=''; byId('e-org').value=''; byId('e-organizer').value=''; byId('e-topic').value=''; byId('e-organizer-photo').value=''; byId('e-organizer-photo').removeAttribute('data-url'); byId('e-org-preview').classList.add('hidden'); byId('event-form').classList.add('hidden')
    })

    // helper: file -> data URL preview (works with either preview id or preview element)
    function handleFilePreview(inputEl, previewRef){
      const file = inputEl.files && inputEl.files[0];
      const preview = typeof previewRef === 'string' ? byId(previewRef) : previewRef
      if(!file){ if(preview) preview.classList.add('hidden'); inputEl.removeAttribute('data-url'); return }
      const reader = new FileReader()
      reader.onload = ()=>{
        inputEl.dataset.url = reader.result
        if(preview){ preview.src = reader.result; preview.classList.remove('hidden') }
      }
      reader.readAsDataURL(file)
    }

    // groups
    byId('g-create').addEventListener('click', ()=>{
      const name=byId('g-name').value.trim(), topic=byId('g-topic').value.trim(); if(!name||!topic) return alert('Provide name and topic')
      const groups = read(storageKeys.groups); groups.push({id:nowId(),name,topic,members:1}); write(storageKeys.groups,groups); renderGroups(); byId('g-name').value=''; byId('g-topic').value=''
    })

    

    // feed actions (event delegation)
    // handle clicks and file changes inside feed (event delegation)
    byId('feed').addEventListener('click', e=>{
      const btn = e.target.closest('button');
      if(!btn) return
      const action = btn.dataset.action
      // prefer explicit id on button; fall back to enclosing post container's data-post-id
  const postEl = btn.closest('.post')
  // prefer the post container's id (more reliable) then fall back to button dataset
  const id = (postEl && postEl.dataset.postId) || btn.dataset.id
  // debug: if something goes wrong this will show in console
  console.debug('feed click', {action, resolvedId: id, buttonId: btn.dataset.id, postElId: postEl && postEl.dataset.postId})

      // upvote is handled by per-post click handlers attached during renderFeed

      if(action==='details'){
        const posts = read(storageKeys.posts); const p = posts.find(x=>x.id===id); if(p) alert(`Title: ${p.title}\n\n${p.body}`)
        return
      }

      if(action==='reply-toggle'){
        if(!postEl) return; const form = postEl.querySelector('.reply-form'); if(form) form.classList.toggle('hidden')
        return
      }

      if(action==='reply-submit'){
        const form = btn.closest('.reply-form'); const textarea = form.querySelector('.reply-input'); const text = textarea.value.trim(); if(!text) return alert('Enter a reply')
        const name = form.querySelector('.reply-name').value.trim(); const designation = form.querySelector('.reply-designation').value.trim(); const photo = form.querySelector('.reply-photo-input').dataset.url || ''
        const posts = read(storageKeys.posts); const p = posts.find(x=>x.id===id); if(!p) return
        p.replies = p.replies || []
        p.replies.push({id:nowId(),text,created:Date.now(),authorName:name,authorDesignation:designation,authorPhoto:photo})
        write(storageKeys.posts,posts); renderFeed()
        return
      }
    })

    // delegate change events for file inputs inside feed (reply photos)
    byId('feed').addEventListener('change', e=>{
      const input = e.target; if(!input.matches('input[type="file"]')) return
      // reply photo inputs will have class reply-photo-input; preview next to it with class reply-photo-preview
      if(input.classList.contains('reply-photo-input')){
        const preview = input.closest('.reply-form').querySelector('.reply-photo-preview')
        const file = input.files && input.files[0]
        if(!file){ if(preview) preview.classList.add('hidden'); input.removeAttribute('data-url'); return }
        const reader = new FileReader(); reader.onload = ()=>{ input.dataset.url = reader.result; if(preview){ preview.src = reader.result; preview.classList.remove('hidden') } }; reader.readAsDataURL(file)
      }
    })
    
    
  }

  // boot
  seed(); bind(); renderFeed(); renderMentors(); renderEvents(); renderGroups();

})();
