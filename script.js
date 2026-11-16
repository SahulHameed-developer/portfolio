(function () {
  const root = document.documentElement;
  const getStored = () => { try { return localStorage.getItem('theme'); } catch (e) { return null; } };
  const setStored = (v) => { try { localStorage.setItem('theme', v); } catch (e) {} };

  // Theme
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', getStored() || (prefersDark ? 'dark' : 'light'));
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    setStored(next);
  });

  // Mobile menu
  const links = document.getElementById('navLinks');
  document.getElementById('menuBtn').addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  // Nav border on scroll
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Active nav link
  const sections = [...document.querySelectorAll('main section[id]')];
  const navMap = new Map([...links.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navMap.forEach(a => a.classList.remove('active'));
        const a = navMap.get(e.target.id);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  // Animated counters
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1200, t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));

  // Project filters
  const filters = document.querySelectorAll('.filter');
  const projects = document.querySelectorAll('.project');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    projects.forEach(p => p.classList.toggle('hide', f !== 'all' && !p.dataset.tags.includes(f)));
  }));


  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover)').matches;

  // Scroll progress bar
  const bar = document.getElementById('progress');
  const onProgress = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  window.addEventListener('scroll', onProgress, { passive: true });
  onProgress();

  // Cursor spotlight
  if (canHover && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      root.style.setProperty('--mx', e.clientX + 'px');
      root.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
  }

  // Typed rotating role
  const typedEl = document.getElementById('typed');
  const roles = ['Senior Full Stack Developer', 'Node.js Engineer', 'AI / LLM Integrator', 'Yii2 + Angular Specialist'];
  if (!reduceMotion) {
    let ri = 0, ci = roles[0].length, deleting = true;
    const tick = () => {
      const word = roles[ri];
      ci += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, ci);
      let delay = deleting ? 35 : 70;
      if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 300; }
      else if (!deleting && ci === roles[ri].length) { deleting = true; delay = 2200; }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2500);
  }

  // Code window tabs (auto-rotate until the user clicks one)
  const tabs = [...document.querySelectorAll('.cw-tab')];
  const panes = document.querySelectorAll('.cw-pane');
  const showTab = (name) => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    panes.forEach(p => p.classList.toggle('active', p.dataset.pane === name));
  };
  let autoTab = reduceMotion ? null : setInterval(() => {
    const i = tabs.findIndex(t => t.classList.contains('active'));
    showTab(tabs[(i + 1) % tabs.length].dataset.tab);
  }, 6000);
  tabs.forEach(t => t.addEventListener('click', () => { clearInterval(autoTab); showTab(t.dataset.tab); }));

  // Skill filters
  const skillBtns = document.querySelectorAll('[data-skill]');
  const skillCards = document.querySelectorAll('.skill-card');
  skillBtns.forEach(btn => btn.addEventListener('click', () => {
    skillBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.skill;
    skillCards.forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f));
  }));

  // 3D tilt + glow on cards
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
        card.style.setProperty('--gx', x * 100 + '%');
        card.style.setProperty('--gy', y * 100 + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    // Magnetic buttons
    document.querySelectorAll('.btn').forEach(b => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.25 - 2}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // Toast + copy email
  const toast = document.getElementById('toast');
  let toastT;
  const showToast = (msg) => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('show'), 2000);
  };
  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); showToast('Email copied to clipboard'); }
    catch (e) { showToast(text); }
  };
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.copy)));

  // Interactive terminal
  const out = document.getElementById('termOut');
  const input = document.getElementById('termInput');
  const termBody = document.getElementById('termBody');
  const esc = (s) => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const print = (html, cls) => { const p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; out.appendChild(p); };
  const commands = {
    help: () => `Available commands:
  <span class="hl">about</span>     who I am
  <span class="hl">skills</span>    full tech stack
  <span class="hl">ai</span>        AI &amp; LLM skills
  <span class="hl">node</span>      Node.js skills
  <span class="hl">experience</span> work history
  <span class="hl">projects</span>  selected projects
  <span class="hl">contact</span>   how to reach me
  <span class="hl">resume</span>    download my resume
  <span class="hl">theme</span>     toggle light / dark
  <span class="hl">clear</span>     clear the screen`,
    about: () => `A Mohamed Sahul Hameed — Senior Full Stack Developer, Chennai.
7+ years building web apps with PHP (Yii2, Laravel), Angular and Node.js.
Now bringing AI / LLM features into real products. 2× Best Employee of the Year.`,
    skills: () => `<span class="hl">AI &amp; LLMs</span>  OpenAI API, Claude API, Prompt Engineering, RAG, Vector Search, LangChain
<span class="hl">Node.js</span>     Node.js, Express.js, TypeScript, REST, WebSockets, JWT
<span class="hl">Backend</span>     PHP, Yii2, Laravel, CodeIgniter, WordPress, Microservices
<span class="hl">Frontend</span>    Angular, JavaScript, jQuery, HTML5, CSS3
<span class="hl">Data/Cloud</span>  MySQL, Query Optimization, AWS (basic), Git`,
    ai: () => `<span class="ok">▸</span> Integrating LLM APIs (OpenAI, Claude) into web apps
<span class="ok">▸</span> Prompt engineering &amp; structured outputs
<span class="ok">▸</span> RAG: embeddings + vector search over company data
<span class="ok">▸</span> AI chatbots, smart search and content automation
<span class="ok">▸</span> AI-assisted development workflows`,
    node: () => `<span class="ok">▸</span> REST APIs and microservices with Node.js + Express
<span class="ok">▸</span> TypeScript for safer, maintainable services
<span class="ok">▸</span> Real-time features with WebSockets / Socket.IO
<span class="ok">▸</span> JWT auth, middleware and async job queues`,
    experience: () => `2024 — now   Senior Full Stack Developer · Business Gateways International
2018 — 2024  Web Developer · Sathi Systems Pvt Ltd`,
    projects: () => `Employee Management System  Laravel   −50% load time, +60% engagement
Ticket Store                CodeIgniter  3rd-party APIs, custom admin
Maruishi                    WordPress  custom theme, −30% load time
MBCart                      HTML/CSS/JS  responsive storefront`,
    contact: () => `email   <a href="mailto:mhedsahul@gmail.com">mhedsahul@gmail.com</a>
phone   <a href="tel:+918122331805">+91 81223 31805</a>
github  <a href="https://github.com/SahulHameed-developer" target="_blank" rel="noopener">github.com/SahulHameed-developer</a>`,
    resume: () => { const a = document.createElement('a'); a.href = 'resume.pdf'; a.download = ''; a.click(); return '<span class="ok">Downloading resume.pdf…</span>'; },
    theme: () => { document.getElementById('themeToggle').click(); return `Theme set to <span class="hl">${root.getAttribute('data-theme')}</span>.`; },
    whoami: () => 'a visitor with great taste in developers 🙂',
    sudo: () => '<span class="err">Nice try. Permission denied.</span>',
    hire: () => '<span class="ok">Great choice!</span> Run <span class="hl">contact</span> to get in touch.',
  };
  const history = []; let hIdx = 0;
  const run = (raw) => {
    const cmd = raw.trim().toLowerCase();
    print(`<b>sahul@portfolio:~$</b> ${esc(raw)}`, 'cmd');
    if (cmd) { history.push(raw); hIdx = history.length; }
    if (!cmd) return;
    if (cmd === 'clear') { out.innerHTML = ''; return; }
    const fn = commands[cmd.split(/\s+/)[0]];
    print(fn ? fn() : `<span class="err">command not found: ${esc(cmd)}</span> — type <span class="hl">help</span>`);
    termBody.scrollTop = termBody.scrollHeight;
  };
  print(`Welcome! I'm Sahul's portfolio shell.
Type <span class="hl">help</span> to see what I can do.`, 'muted');
  document.getElementById('termForm').addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hIdx > 0) { input.value = history[--hIdx]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hIdx = Math.min(hIdx + 1, history.length); input.value = history[hIdx] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const m = Object.keys(commands).concat('clear').filter(k => k.startsWith(input.value.trim().toLowerCase()));
      if (m.length === 1) input.value = m[0];
      else if (m.length > 1 && input.value) print(m.join('  '), 'muted');
    }
  });
  document.getElementById('term').addEventListener('click', () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
  document.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => { run(b.dataset.cmd); input.focus({ preventScroll: true }); }));
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      document.getElementById('terminal').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(() => input.focus({ preventScroll: true }), 400);
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
