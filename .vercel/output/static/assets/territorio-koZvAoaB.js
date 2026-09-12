var e=`smioochy-presencia-stub`,t=`smioochy-sesion`;function n(){try{let e=localStorage.getItem(t);return e||(e=crypto.randomUUID&&crypto.randomUUID()||`s`+Math.floor(Date.now()/1e3)+`-`+Math.floor(performance.now()),localStorage.setItem(t,e)),e}catch{return`anon`}}function r(e){document.documentElement.setAttribute(`data-presence-mode`,e);let t=document.querySelector(`.presencia-stub`);e===`stub`?t||(t=document.createElement(`div`),t.className=`presencia-stub`,t.textContent=`presencia.stub`,document.body.appendChild(t)):t&&t.remove()}function i(t){r(`stub`);let i=n(),a=()=>Date.now(),o=()=>{let n={};try{n=JSON.parse(localStorage.getItem(e)||`{}`)}catch{n={}}n[i]={path:t,t:a()};let r=a()-45e3;for(let e of Object.keys(n))(!n[e]||n[e].t<r)&&delete n[e];try{localStorage.setItem(e,JSON.stringify(n))}catch{}return Object.keys(n).filter(e=>n[e].path===t).length};o();let s=null;try{s=new BroadcastChannel(`smioochy-presencia`),s.postMessage({path:t,id:i})}catch{s=null}let c=setInterval(()=>{o();try{s?.postMessage({path:t,id:i})}catch{}},12e3);return()=>{clearInterval(c);try{s?.close()}catch{}}}async function a(e){let t=n(),i=async()=>{let n=await fetch(`/api/presencia`,{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify({sessionKey:t,path:e})});if(!n.ok)throw Error(`presencia`);return n.json()};await i(),r(`api`);let a=setInterval(()=>{i().catch(()=>{})},16e3);return()=>clearInterval(a)}function o(e){let t=typeof window<`u`&&window.SMIOOCHY||{supabaseUrl:``,supabaseAnonKey:``};return t.supabaseUrl&&t.supabaseAnonKey&&r(`live`),a(e).catch(()=>i(e))}var s=`smioochy-huellas`,c=`smioochy-enigma`,l=`smioochy-admin`,u=`smioochy-paso-luis`,d=[`algo mío sigue vibrando en tu buffer…`,`me inhibes…`,`bug emocional`,`archivado como correspondencia perdida…`,`¿Puede la contingencia abrir una bifurcación?`];function f(){try{return!0}catch{return!1}}function p(){try{let e=JSON.parse(localStorage.getItem(s)||`{}`);return Array.isArray(e.cotas)||(e.cotas=[]),e}catch{return{cotas:[]}}}function m(e){try{localStorage.setItem(s,JSON.stringify(e))}catch{}}function h(e){let t=Number(e);if(!t||t<1||t>54)return;let n=p();n.cotas.includes(t)||(n.cotas.push(t),m(n))}function g(e){let t=p();t[e]=1,m(t)}function _(e,t){e&&(e.addEventListener(`click`,e=>{e.type===`click`&&e.preventDefault(),t(e)}),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t(e))}),e.tabIndex<0&&e.tagName!==`A`&&e.tagName!==`BUTTON`&&e.getAttribute(`tabindex`)!==`-1`&&(e.tabIndex=0))}function v(e,t){if(!e)return;let n=0,r=0;e.addEventListener(`dblclick`,e=>{e.preventDefault(),t(e)}),e.addEventListener(`keydown`,e=>{if(e.key===`Enter`){let r=Date.now();r-n<420?(e.preventDefault(),t(e),n=0):n=r}});let i=e=>{(e.pointerType!==`mouse`||e.button===0)&&(r=window.setTimeout(()=>t({type:`hold`}),560))},a=()=>clearTimeout(r);e.addEventListener(`pointerdown`,i),e.addEventListener(`pointerup`,a),e.addEventListener(`pointerleave`,a),e.addEventListener(`pointercancel`,a)}function y(e){e.querySelectorAll(`.ventana .barra`).forEach(e=>{let t=e.closest(`.ventana`);if(!t)return;let n=0,r=0;e.addEventListener(`pointerdown`,i=>{if(i.button&&i.button!==0)return;e.setPointerCapture(i.pointerId);let a=t.getBoundingClientRect();document.documentElement,n=i.clientX-a.left,r=i.clientY-a.top,t.style.left=a.left+window.scrollX+`px`,t.style.top=a.top+window.scrollY+`px`,t.style.right=`auto`,t.style.bottom=`auto`,t.style.zIndex=`12`}),e.addEventListener(`pointermove`,i=>{e.hasPointerCapture?.(i.pointerId)&&(t.style.left=i.clientX-n+window.scrollX+`px`,t.style.top=i.clientY-r+window.scrollY+`px`)})})}function b(e){e&&(location.href=e)}function x(e){fetch(`/api/visitas`,{method:`POST`,headers:{"content-type":`application/json`},body:JSON.stringify({path:e||location.pathname||`/`})}).catch(()=>{})}var S=null;async function C(){if(S)return S;try{S=await(await fetch(`/cotas.json`)).json()}catch{S={}}return S}function w(){return`<svg class="filtros" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
    <filter id="licuado" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </svg>`}function T(){return`<div class="palabra"><a href="/">smioochy</a></div>
    <div class="estado">en proceso</div>`}function E(e){let{title:t,body:n,x:r,y:i,cls:a=``,umbral:o=``,extra:s=``}=e,c=o?` data-umbral="${o}"`:``,l=``;return r===`auto`?l+=`left:auto;right:10px;`:r!=null&&r!==``&&(l+=`left:${typeof r==`number`?r+`px`:r};`),i!=null&&i!==``&&(l+=`top:${typeof i==`number`?i+`px`:i};`),`<div class="ventana ${a}" style="${l}"${c} ${s}>
    <div class="barra">${t}</div>
    <div class="cuerpo">${n}</div>
  </div>`}function D(e){e.innerHTML=`
    ${w()}
    <div class="campo" data-pagina-superficie>
      <div class="mapa-wrap" data-mapa></div>
      ${T()}
    </div>`}function O(){let e=1400,t={1:[250,430],3:[490,268],7:[640,338],8:[724,214],12:[860,372],16:[990,278],21:[404,492],24:[1096,428],31:[572,156],40:[292,568],41:[418,628],48:[168,196],54:[1248,108]},n=[];for(let e=1;e<=54;e++)t[e]?n.push({n:e,x:t[e][0],y:t[e][1],hub:!0}):n.push({n:e,x:0,y:0,hub:!1});let r=Math.PI*(3-Math.sqrt(5)),i=0;for(let t of n){if(t.hub)continue;let n=.18+.74*Math.sqrt((i+.35)/41),a=i*r+.55;t.x=e/2+(e/2-52)*n*Math.cos(a),t.y=360+308*n*Math.sin(a),i+=1}for(let e=0;e<56;e++)for(let e=0;e<n.length;e++){for(let t=e+1;t<n.length;t++){let r=n[t].x-n[e].x,i=n[t].y-n[e].y,a=Math.hypot(r,i)||.01;if(a<54){let o=(54-a)/2,s=r/a,c=i/a;n[e].hub||(n[e].x-=s*o,n[e].y-=c*o),n[t].hub||(n[t].x+=s*o,n[t].y+=c*o)}}n[e].x=Math.min(1348,Math.max(52,n[e].x)),n[e].y=Math.min(668,Math.max(52,n[e].y))}return n}function k(e,t,n){let r=t.x-e.x,i=t.y-e.y,a=Math.hypot(r,i)||1,o=-i/a,s=r/a,c=n%2?1:-1,l=34*c+n%5*9,u=-26*c+n%3*11,d=e.x+r*.32+o*l,f=e.y+i*.32+s*l,p=e.x+r*.68+o*u,m=e.y+i*.68+s*u;return`M${e.x.toFixed(1)} ${e.y.toFixed(1)} C${d.toFixed(1)} ${f.toFixed(1)} ${p.toFixed(1)} ${m.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}`}function A(e,t){let n=O(),r={};n.forEach(e=>{r[e.n]=e});let i=new Set,a=(e,t)=>{if(e===t)return;let n=Math.min(e,t),r=Math.max(e,t);i.add(n+`-`+r)};[[3,7],[7,8],[3,8],[7,31],[3,31],[7,12],[12,16],[16,24],[16,21],[21,7],[1,3],[1,21],[40,41],[40,1],[48,31],[48,3],[54,24],[54,16],[12,24],[8,16],[21,40],[1,48]].forEach(([e,t])=>a(e,t)),n.forEach(e=>{n.filter(t=>t.n!==e.n).sort((t,n)=>Math.hypot(t.x-e.x,t.y-e.y)-Math.hypot(n.x-e.x,n.y-e.y)).slice(0,2).forEach(t=>a(e.n,t.n))});for(let e=0;e<10;e++)a(n[e].n,n[(e*11+17)%54].n);let o=[...i].map((e,t)=>{let[n,i]=e.split(`-`).map(Number);return`<path class="${t%4==0?`hilo largo`:`hilo`}" d="${k(r[n],r[i],t)}" />`}),s=n.map(n=>{let r=e[n.n]||{},i=r.abreEstado===`encendido`&&r.abre,a=t.cotas.includes(n.n)?` visitada`:``,o=i?`ocupada`:`vacio`;return`<a class="num${a}" data-cota="${n.n}" data-estado="${o}" href="/cota/${n.n}/">
        <circle class="hit" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="26"/>
        <circle class="punto" cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${i?3:2}"/>
        <text x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" text-anchor="middle" dy="-9">${n.n}</text>
      </a>`}).join(``);return`<svg class="red" viewBox="0 0 1400 720" role="img" aria-label="">
    <g class="hilos">${o.join(``)}</g>
    <g class="nodos">${s}</g>
  </svg>`}async function j(e){let t=e.querySelector(`[data-mapa]`);t&&(t.innerHTML=A(await C(),p()),t.querySelectorAll(`a[data-cota]`).forEach(e=>{let t=e.getAttribute(`data-cota`);e.addEventListener(`click`,()=>h(t))}),t.scrollWidth>t.clientWidth&&(t.scrollLeft=(t.scrollWidth-t.clientWidth)/2))}function M(e,t){let n=String(e);if(n===`7`){let e=t.minuta?`01.bak`:`recortes.jpg`;return E({title:e,body:`<p>${e}</p>`,cls:`v-cota`,umbral:`abre`})}if(n===`12`){let e=t.antipodas?`sin piel`:`figura`;return E({title:e,body:`<p>${e}</p>`,cls:`v-cota`,umbral:`abre`})}if(n===`16`){let e=t.teatro?`mail.bak`:`you have mail`;return E({title:e,body:`<p>${e}</p>`,cls:`v-cota`,umbral:`abre`})}return n===`24`?E({title:`miochi.html`,body:`<p>miochi.html</p>`,cls:`v-cota ${t.miochis?`pasada`:`opaca`}`,umbral:`abre`}):``}function N(e,t,n){let r=n.estado||`vacio`,i=n.abre||``,a=n.abreEstado||`apagado`,o=a===`apagado`?`tabindex="-1" aria-disabled="true"`:`tabindex="0"`;e.setAttribute(`data-pagina`,`cota`),e.setAttribute(`data-cota`,t),e.setAttribute(`data-strato`,r===`ocupada`?`intervencion`:`vacio`),e.setAttribute(`data-estado`,r),e.setAttribute(`data-abre`,i),e.setAttribute(`data-abre-estado`,a);let s=M(t,p()),c=/data-umbral=/.test(s)?``:`<button type="button" class="umbral-abre" data-abre="${i}" data-abre-estado="${a}" ${o} aria-label=""></button>`;e.innerHTML=`
    <div class="cuarto">
      ${T()}
      <div class="cifra">${t}</div>
      ${s}
      ${c}
      <a class="volver" href="/">↑</a>
    </div>
    <!-- MONTAJE: rellenar cota ${t}; cuando haya destino, data-abre y encender umbral -->
  `,a===`encendido`&&i&&_(e.querySelector(`[data-umbral], .umbral-abre`),()=>b(i))}function P(e){e.innerHTML=`
    <div class="pagina-ventanas">
      ${T()}
      ${E({title:`.ask`,body:`<p><a href="/seminario/sesiones/01-contingencia/">¿Puede la contingencia abrir una bifurcación?</a></p>`,x:48,y:90})}
      ${E({title:`resto`,body:`<p class="hueco"></p><!-- MONTAJE: falta el resto de sesiones -->`,x:320,y:220})}
      <a class="volver" href="/">↑</a>
    </div>`}async function F(e){g(`minuta`);let t;try{t=await(await fetch(`/seminario/sesiones/01-contingencia/minuta.json`)).json()}catch{t={pregunta:`¿Puede la contingencia abrir una bifurcación?`,fragmentos:[]}}let n=(t.fragmentos||[]).filter(e=>e.vertiente!==`deriva`).map(e=>{if(e.hueco)return`<div class="frag" data-strato="vacio" data-estatuto="vacio"><span class="quien">${e.quien||``}</span><!-- ${e.hueco} --></div>`;let t=e.reaparece?` data-reaparece="${e.reaparece}"`:``,n=e.quien?`<span class="quien">${e.quien}</span>`:``;return`<div class="frag" data-strato="${e.strato||``}" data-estatuto="${e.estatuto||``}"${t}>${n}${e.cuerpo}</div>`}).join(``),r=(t.fragmentos||[]).find(e=>e.vertiente===`deriva`);e.innerHTML=`
    <div class="campo">
      ${T()}
      <article class="minuta-cuerpo">
        <p class="pregunta">${t.pregunta}</p>
        ${n}
        <p class="margen"><a href="/antipodas/">¿ke es no tener piel?</a><a class="contam-cota" href="/cota/20/" data-cota="20">20</a></p>
        <div class="ojo incompleto" data-ojo hidden></div>
        <p class="pageviews" data-views></p>
      </article>
      <div class="vertiente" hidden data-vertiente>
        <p>${r?r.cuerpo:``}</p>
      </div>
      <p class="aviso-presencia">esta página percibe presencias, no identidades</p>
      <a class="volver" href="/">↑</a>
    </div>`,e.querySelectorAll(`[data-reaparece]`).forEach(t=>{_(t,()=>L(t.getAttribute(`data-reaparece`),e))});let i=e.querySelector(`[data-ojo]`);R(e,i),_(i,()=>z(e)),location.hash===`#deriva`&&(e.querySelector(`[data-vertiente]`).hidden=!1);let a=()=>{let t=e.querySelector(`[data-vertiente]`);t&&(t.hidden=location.hash!==`#deriva`)};window.addEventListener(`hashchange`,a),e._hash=a,sessionStorage.getItem(l)===`1`&&i&&(i.hidden=!1,i.classList.add(`admin`),_(i,()=>{let e=document.querySelector(`.velo-zonas`);e?e.remove():(e=document.createElement(`div`),e.className=`velo-zonas`,document.body.appendChild(e))}))}function I(){try{return JSON.parse(sessionStorage.getItem(c)||`{"seq":[]}`)}catch{return{seq:[]}}}function L(e,t){let n=I();e===[`1`,`2`,`3`][n.seq.length]&&n.seq.push(e),sessionStorage.setItem(c,JSON.stringify(n)),R(t,t.querySelector(`[data-ojo]`))}function R(e,t){if(!t)return;let n=I();n.seq&&n.seq.length>=3&&(t.hidden=!1)}async function z(e){let t=I();if(!(!t.seq||t.seq.length<3))try{let t=await(await fetch(`/api/visitas?path=%2Fseminario%2Fsesiones%2F01-contingencia%2F`)).json(),n=e.querySelector(`[data-views]`);n&&(n.textContent=String(t.n||0),n.classList.add(`revelado`))}catch{}}function B(e){g(`antipodas`),e.innerHTML=`
    ${w()}
    <div class="antipodas">
      ${T()}
      <div class="cuerpo-licuado"><img src="/xerox/figura.jpg" alt=""></div>
      <button type="button" class="umbral-carteles" data-umbral-carteles>
        <img src="/xerox/activar-carteles.jpg" alt="">
      </button>
      <a class="volver" href="/">↑</a>
    </div>`,v(e.querySelector(`[data-umbral-carteles]`),()=>V(e))}function V(e){if(e.querySelector(`.cartel`))return;let t=[`sabes lo`,`ke es no`,`tener piel?`],n=[[12,18],[48,40],[28,62]];t.forEach((t,r)=>{let i=document.createElement(`div`);i.className=`cartel`,i.textContent=t,i.style.left=n[r][0]+`vw`,i.style.top=n[r][1]+`vh`,i.tabIndex=0,v(i,()=>i.remove()),e.appendChild(i)})}function H(e){g(`teatro`),e.innerHTML=`
    <div class="teatro" data-teatro>
      ${T()}
      <div class="teles"><img src="/xerox/teles.jpg" alt=""></div>
      <details class="correspondencia">
        <summary>correspondencia perdida</summary>
        <p>el archivo salta el 02.</p>
        <!-- MONTAJE: falta el resto de la correspondencia -->
      </details>
      <a class="volver" href="/">↑</a>
    </div>`;let t=e.querySelector(`[data-teatro]`),n=(e,n)=>{let r=document.createElement(`div`);r.className=`msg ventana`+(n?` cota-num`:``);let i=8+performance.now()*13%70,a=10+performance.now()*7%60;r.style.left=i+`vw`,r.style.top=a+`vh`,n?(r.innerHTML=`<a href="/cota/${n}/">${n}</a>`,h(n)):r.innerHTML=`<div class="barra">msg</div><div class="cuerpo">${e}</div>`,t.appendChild(r),y(r)},r=0;n(d[0]);let i=window.setInterval(()=>{r+=1,r===3?n(``,20):n(d[r%d.length]),r>8&&clearInterval(i)},2400),a=e=>{e.target.closest(`.msg, details, .volver, .palabra`)||n(d[Math.floor(performance.now())%d.length])};t.addEventListener(`click`,a),t.addEventListener(`wheel`,()=>{Math.floor(performance.now()/400)%5==0&&n(d[4])},{passive:!0}),e._teatroTick=()=>{clearInterval(i),t.removeEventListener(`click`,a)}}function U(e){e.innerHTML=`
    <div class="pagina-ventanas">
      ${T()}
      ${E({title:`loop`,body:`<p>¿Puede la contingencia abrir una bifurcación?</p>`,x:80,y:140})}
      <a class="volver" href="/">↑</a>
    </div>`}function W(e){g(`miochis`),e.innerHTML=`
    <div class="campo">
      ${T()}
      <div class="dino"><img src="/xerox/dinosaurio.jpg" alt=""></div>
      <a class="volver" href="/">↑</a>
    </div>`}function G(e){e.innerHTML=`
    <div class="pagina-ventanas">
      ${T()}
      ${E({title:`mail`,body:`<p class="hueco"></p><!-- MONTAJE: falta dirección -->`,x:90,y:120})}
      <a class="volver" href="/">↑</a>
    </div>`}function K(e){e.innerHTML=`
    <div class="pagina-ventanas">
      ${T()}
      ${E({title:`en proceso`,body:`<p><a href="/dirigido/hizo-lugar/">·</a></p>`,x:70,y:160})}
      <a class="volver" href="/">↑</a>
    </div>`}function q(e){let t=Number(localStorage.getItem(u)||0),n=Date.now(),r=t&&n-t<216e5;localStorage.setItem(u,String(n));let i=[`Esto hizo lugar. No decidió qué aparecería en él.`,`el dinero abre un cuarto, no una equivalencia`,`pensé que pagar era una forma de escribir`,`también pensé que escribir podía devolver el dinero`,`dejó de parecer verdadera cuando el cuarto estuvo vacío y igual había que ocupar`];e.innerHTML=`
    <div class="campo">
      ${T()}
      <div class="room"><img src="/xerox/room.jpg" alt=""></div>
      <p class="frase" data-frase>${i[0]}</p>
      <div class="mutacion" data-mut></div>
      <div class="tres">
        <button type="button" data-t="dinero">dinero</button>
        <button type="button" data-t="deseo">deseo</button>
        <button type="button" data-t="escritura">escritura</button>
      </div>
      ${r?`<p class="aviso-presencia">·</p>`:``}
      <a class="volver" href="/">↑</a>
    </div>`;let a=0,o=e.querySelector(`[data-frase]`);_(o,()=>{a=(a+1)%i.length,o.textContent=i[a]}),e.querySelectorAll(`.tres [data-t]`).forEach(t=>{_(t,()=>{let n=e.querySelector(`[data-mut]`);n.textContent=t.getAttribute(`data-t`)+` no equivale`})})}function J(e){e.innerHTML=`
    <div class="campo">
      ${T()}
      <div class="ojo-wrap">
        <button type="button" class="ojo" data-ojo-admin aria-label=""></button>
        <p class="todavia">todavía no es obra</p>
      </div>
      <a class="volver" href="/">↑</a>
    </div>`;let t=e.querySelector(`[data-ojo-admin]`);v(t,()=>{sessionStorage.setItem(l,`1`),t.classList.add(`admin`,`pulso`)})}function Y(e){e.innerHTML=`
    <div class="pagina-ventanas">
      ${T()}
      ${E({title:`lectura`,body:`<p><a href="/seminario/sesiones/01-contingencia/">nosotrxs</a></p>
               <p>no es una contraseña.</p>`,x:80,y:120})}
      <a class="volver" href="/">↑</a>
    </div>`}function X(e){if(!e)return()=>{};let t=e.getAttribute(`data-pagina`)||`superficie`;document.documentElement.setAttribute(`data-pagina`,t),document.documentElement.style.background=``;let n=[];return(async()=>{if(t===`superficie`)D(e),await j(e);else if(t===`cota`){let t=e.getAttribute(`data-cota`)||``;if(!t){let e=location.pathname.match(/\/cota\/(\d+)/);t=e?e[1]:``}t=String(parseInt(t,10)||0),h(t);let n=await C();N(e,t,n[t]||{estado:`vacio`,abre:``,abreEstado:`apagado`})}else t===`seminario`?P(e):t===`minuta`?await F(e):t===`antipodas`?B(e):t===`teatro`?H(e):t===`loop`?U(e):t===`miochis`?W(e):t===`contacto`?G(e):t===`dirigido`?K(e):t===`hizo-lugar`?q(e):t===`superya`?J(e):t===`enigma`?Y(e):D(e);y(e),x(location.pathname||`/`);let r=o(location.pathname||`/`);Promise.resolve(r).then(e=>{typeof e==`function`&&n.push(e)})})(),n.push(()=>{e._hash&&window.removeEventListener(`hashchange`,e._hash),e._teatroTick&&e._teatroTick(),document.querySelector(`.velo-zonas`)?.remove()}),()=>{n.forEach(e=>{try{e()}catch{}})}}if(!f()){let e=document.getElementById(`territorio`);e&&e.getAttribute(`data-pagina`)&&X(e)}export{X as boot};