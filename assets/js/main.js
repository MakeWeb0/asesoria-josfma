(() => {
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const PLAZOS = [
    { m: 0, d: 20, what: 'Retenciones del cuarto trimestre', code: 'Modelos 111 y 115', who: 'Empresas y autónomos' },
    { m: 0, d: 30, what: 'IVA e IRPF del cuarto trimestre y resumen anual de IVA', code: 'Modelos 303, 130 y 390', who: 'Autónomos y empresas' },
    { m: 0, d: 31, what: 'Resúmenes anuales de retenciones', code: 'Modelos 190 y 180', who: 'Empresas y autónomos' },
    { m: 1, d: 28, what: 'Operaciones con terceros de más de 3.005,06 €', code: 'Modelo 347', who: 'Empresas y autónomos' },
    { m: 3, d: 20, what: 'IVA, IRPF y retenciones del primer trimestre', code: 'Modelos 303, 130, 111 y 115', who: 'Autónomos y empresas' },
    { m: 3, d: 20, what: 'Primer pago fraccionado de Sociedades', code: 'Modelo 202', who: 'Sociedades' },
    { m: 5, d: 30, what: 'Fin de la campaña de la Renta y Patrimonio', code: 'Modelos 100 y 714', who: 'Particulares' },
    { m: 6, d: 20, what: 'IVA, IRPF y retenciones del segundo trimestre', code: 'Modelos 303, 130, 111 y 115', who: 'Autónomos y empresas' },
    { m: 6, d: 25, what: 'Impuesto sobre Sociedades del ejercicio', code: 'Modelo 200', who: 'Sociedades' },
    { m: 9, d: 20, what: 'IVA, IRPF y retenciones del tercer trimestre', code: 'Modelos 303, 130, 111 y 115', who: 'Autónomos y empresas' },
    { m: 9, d: 20, what: 'Segundo pago fraccionado de Sociedades', code: 'Modelo 202', who: 'Sociedades' },
    { m: 11, d: 20, what: 'Tercer pago fraccionado de Sociedades', code: 'Modelo 202', who: 'Sociedades' }
  ];

  const habil = (date) => {
    const d = new Date(date);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d;
  };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  document.querySelectorAll('[data-today]').forEach((t) => {
    t.dateTime = iso(hoy);
    t.textContent = `${hoy.getDate()} de ${MESES[hoy.getMonth()]}`;
  });
  document.querySelectorAll('[data-year]').forEach((t) => { t.textContent = hoy.getFullYear(); });

  const lista = document.querySelector('[data-plazos]');
  if (lista) {
    const proximos = [];
    [hoy.getFullYear(), hoy.getFullYear() + 1].forEach((y) => {
      PLAZOS.forEach((p) => {
        const fecha = habil(new Date(y, p.m, p.d));
        if (fecha >= hoy) proximos.push({ ...p, fecha });
      });
    });
    proximos.sort((a, b) => a.fecha - b.fecha);
    const frag = document.createDocumentFragment();
    proximos.slice(0, 5).forEach((p, i) => {
      const li = document.createElement('li');
      li.className = 'plazo';
      li.style.setProperty('--i', i);
      li.innerHTML = `<time class="plazo__date" datetime="${iso(p.fecha)}"><b>${p.fecha.getDate()}</b><span>${CORTOS[p.fecha.getMonth()]}</span></time><div class="plazo__body"><p class="plazo__what"></p><p class="plazo__code"></p></div><p class="plazo__who"></p>`;
      li.querySelector('.plazo__what').textContent = p.what;
      li.querySelector('.plazo__code').textContent = p.code;
      li.querySelector('.plazo__who').textContent = p.who;
      frag.appendChild(li);
    });
    lista.replaceChildren(frag);
    const primero = proximos[0];
    if (primero) {
      document.querySelectorAll('[data-next-date]').forEach((el) => { el.textContent = `${primero.fecha.getDate()} ${CORTOS[primero.fecha.getMonth()]}`; });
      document.querySelectorAll('[data-next-code]').forEach((el) => { el.textContent = primero.code; });
    }
  }

  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)');
  let menuAbierto = false;

  if (toggle && menu) {
    const label = toggle.querySelector('[data-menu-label]');
    let cierre;
    const set = (open) => {
      menuAbierto = open;
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Cerrar' : 'Menú';
      clearTimeout(cierre);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      } else {
        menu.classList.remove('is-open');
        cierre = setTimeout(() => { menu.hidden = true; }, quieto.matches ? 0 : 320);
      }
    };
    toggle.addEventListener('click', () => set(!menuAbierto));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuAbierto) { set(false); toggle.focus(); } });
    document.addEventListener('click', (e) => { if (menuAbierto && !nav.contains(e.target)) set(false); });
    matchMedia('(min-width: 60.01rem)').addEventListener('change', (e) => { if (e.matches) set(false); });
  }

  if (nav) {
    const hero = document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => nav.classList.toggle('is-docked', !e.isIntersecting), { rootMargin: '-35% 0px 0px 0px' }).observe(hero);
    }

    const zona = nav.querySelector('[data-links]');
    const tinta = nav.querySelector('[data-ink]');
    if (zona && tinta) {
      const links = [...zona.querySelectorAll('a')];
      let actual = null;
      const mover = (a) => {
        if (!a) { tinta.classList.remove('is-on'); return; }
        tinta.style.setProperty('--x', `${a.offsetLeft}px`);
        tinta.style.setProperty('--w', a.offsetWidth / 100);
        tinta.classList.add('is-on');
      };
      links.forEach((a) => {
        a.addEventListener('pointerenter', () => mover(a));
        a.addEventListener('focus', () => mover(a));
      });
      zona.addEventListener('pointerleave', () => mover(actual));
      zona.addEventListener('focusout', () => mover(actual));
      addEventListener('resize', () => mover(actual), { passive: true });

      if ('IntersectionObserver' in window) {
        const secciones = links.map((a) => document.querySelector(a.hash)).filter(Boolean);
        const visibles = new Set();
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? visibles.add(e.target.id) : visibles.delete(e.target.id)));
          const sec = secciones.find((x) => visibles.has(x.id));
          actual = sec ? links.find((a) => a.hash === `#${sec.id}`) : null;
          links.forEach((a) => (a === actual ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
          if (!zona.matches(':hover')) mover(actual);
        }, { rootMargin: '-40% 0px -55% 0px' });
        secciones.forEach((x) => io.observe(x));
      }
    }
  }

  const indice = document.querySelector('[data-stack-index]');
  const hojas = document.querySelectorAll('[data-sheet]');
  if (indice && hojas.length && 'IntersectionObserver' in window) {
    const enlaces = indice.querySelectorAll('a');
    const marcar = (id) => enlaces.forEach((a) => {
      if (a.hash === `#${id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) marcar(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    hojas.forEach((h) => io.observe(h));
  }

  const sw = document.querySelector('[data-switch]');
  if (sw) {
    const tabs = [...sw.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    panels.forEach((p) => { if (p.hasAttribute('data-hide')) p.hidden = true; });
    const select = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        panels[j].classList.toggle('is-shown', on);
      });
      panels[i].querySelectorAll('li').forEach((li, n) => li.style.setProperty('--n', n));
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select((i + k + tabs.length) % tabs.length, true); }
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
  }

  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
    }), { rootMargin: '0px 0px -15% 0px' });
    reveals.forEach((el) => ro.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }
})();
