import"./storage-H0y7aWV1.js";import{d as w}from"./departmentService-BoPU2OeI.js";import{e as j}from"./employeeService-C2E39r-H.js";import{t as C}from"./notifications-CUgc2FxL.js";import{i as L}from"./validation-oYXTDwR3.js";let S=[],D=[],q=[],m=1;const k=8,y={code:`
    <div class="dept-icon-box dept-icon-code">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    </div>
  `,marketing:`
    <div class="dept-icon-box dept-icon-marketing">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 11 18-5v12L3 13v-2z"></path>
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
      </svg>
    </div>
  `,business:`
    <div class="dept-icon-box dept-icon-business">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    </div>
  `,hr:`
    <div class="dept-icon-box dept-icon-hr">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </div>
  `,finance:`
    <div class="dept-icon-box dept-icon-finance">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    </div>
  `,content:`
    <div class="dept-icon-box dept-icon-content">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    </div>
  `,general:`
    <div class="dept-icon-box dept-icon-general">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 21V7l8-4 8 4v14M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-4h4v4M2 21h20"></path>
      </svg>
    </div>
  `};document.addEventListener("DOMContentLoaded",async()=>{await R(),z()});async function R(){try{const[t,e]=await Promise.all([w.getAll(),j.getAll()]);S=t,D=e,q=[...S],F(S),B(D),H(S,D),N()}catch(t){console.error("Error initializing departments page:",t),C.error("Could not load department data")}}function H(t,e){const n=t.length,a=e.length,i=t.filter(E=>E.DIRECT_MANAGER&&E.DIRECT_MANAGER.trim()!=="").length,r=n>0?Math.round(a/n):0,o=document.querySelector("#stat-total-depts"),c=document.querySelector("#stat-total-emp"),s=document.querySelector("#stat-depts-with-mgr"),h=document.querySelector("#stat-avg-emp");o&&(o.textContent=n),c&&(c.textContent=a),s&&(s.textContent=i),h&&(h.textContent=r)}function F(t){const e=document.querySelector("#filter-department-select");if(e){const a=t.map(i=>`<option value="${i.ID_DEPARTMENT||i.id}">${i.NAME||i.name}</option>`).join("");e.innerHTML='<option value="">All Departments</option>'+a}const n=document.querySelector("#filter-manager-select");if(n){const i=[...new Set(t.map(r=>r.DIRECT_MANAGER).filter(Boolean))].map(r=>{const o=D.find(s=>(s.ID||s.id||s.emp_code)===r),c=o?o.FULL_NAME||o.full_name:r;return`<option value="${r}">${c}</option>`}).join("");n.innerHTML='<option value="">All Managers</option>'+i}}function B(t){const e=document.querySelector("#dept-manager");if(!e)return;const n=t.map(a=>{const i=a.ID||a.id||a.emp_code,r=a.FULL_NAME||a.full_name||"Staff";return`<option value="${i}">${i} – ${r}</option>`}).join("");e.innerHTML='<option value="">-- Select Direct Manager --</option>'+n}function _(t){if(!t)return"NV";const e=t.trim().split(/\s+/);return e.length>=2?(e[0][0]+e[e.length-1][0]).toUpperCase():t.slice(0,2).toUpperCase()}function G(t,e){if(t&&y[t])return y[t];const n=e.toLowerCase();return n.includes("engineer")||n.includes("tech")||n.includes("software")?y.code:n.includes("market")?y.marketing:n.includes("business")||n.includes("sale")?y.business:n.includes("hr")||n.includes("human")?y.hr:n.includes("financ")||n.includes("account")?y.finance:n.includes("content")||n.includes("media")?y.content:y.general}function N(){const t=document.querySelector("#departments-table-body");if(!t)return;const e=q.length,n=Math.ceil(e/k)||1;m>n&&(m=n);const a=(m-1)*k,i=Math.min(a+k,e),r=q.slice(a,i);if(e===0){t.innerHTML=`
      <tr>
        <td colspan="7" style="text-align: center; padding: 48px; color: #94a3b8;">
          No departments found matching your criteria.
        </td>
      </tr>
    `,$(0,0,0,1);return}t.innerHTML=r.map(o=>{const c=o.ID_DEPARTMENT||o.id,s=o.NAME||o.name||"Unnamed",h=o.CODE||o.code||"DEPT",E=o.DESCRIPTION||o.description||"No description available.",u=o.DIRECT_MANAGER||o.manager_id,l=o.STATUS||o.status||"Active",v=l==="Active"?"status-active":"status-inactive",M=o.ICON||o.icon,d=D.filter(p=>{const f=p.ID_DEPARTMENT||p.department_id;return f===c||f===s}).length,g=D.find(p=>(p.ID||p.id||p.emp_code)===u);let b='<span style="color: #94a3b8; font-size: 0.88rem;">Unassigned</span>';if(g){const p=g.FULL_NAME||g.full_name,f=g.AVATAR||g.avatar;b=`
        <div class="dept-manager-cell">
          ${f?`<img src="${f}" alt="${p}" class="dept-manager-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
           <div class="dept-manager-fallback" style="display:none;">${_(p)}</div>`:`<div class="dept-manager-fallback">${_(p)}</div>`}
          <span class="dept-manager-name">${p}</span>
        </div>
      `}return G(M,s),`
      <tr class="dept-table-row" data-id="${c}" title="Click to view/edit details" style="cursor: pointer;">
        <td><span class="dept-code-text">${c}</span></td>
        <td><span class="dept-name">${s}</span></td>
        <td><span class="dept-code-text">${h}</span></td>
        <td>
          <div class="dept-desc-text" title="${E}">${E}</div>
        </td>
        <td>${b}</td>
        <td><span class="dept-emp-count">${d}</span></td>
        <td><span class="status-badge ${v}">${l}</span></td>
      </tr>
    `}).join(""),$(e===0?0:a+1,i,e,n),V()}function $(t,e,n,a){const i=document.querySelector("#pagination-info"),r=document.querySelector("#pagination-controls");if(i&&(i.textContent=`Showing ${t} - ${e} of ${n} departments`),!r)return;if(a<=1){r.innerHTML="";return}let o=[];o.push(`
    <button type="button" class="page-btn" data-page="${m-1}" ${m===1?"disabled":""} aria-label="Previous page">
      &lt;
    </button>
  `);for(let c=1;c<=a;c++){const s=c===m;o.push(`
      <button type="button" class="page-btn ${s?"active":""}" data-page="${c}" aria-label="Page ${c}">
        ${c}
      </button>
    `)}o.push(`
    <button type="button" class="page-btn" data-page="${m+1}" ${m===a?"disabled":""} aria-label="Next page">
      &gt;
    </button>
  `),r.innerHTML=o.join(""),r.querySelectorAll(".page-btn:not(:disabled)").forEach(c=>{c.addEventListener("click",()=>{const s=Number(c.getAttribute("data-page"));s&&s!==m&&(m=s,N())})})}function V(){document.querySelectorAll(".dept-table-row").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-id");e&&W(e)})})}function z(){const t=document.querySelector("#search-department"),e=document.querySelector("#filter-department-select"),n=document.querySelector("#filter-manager-select"),a=document.querySelector("#filter-status"),i=()=>{const u=t?t.value.toLowerCase().trim():"",l=e?e.value:"",v=n?n.value:"",M=a?a.value:"";q=S.filter(d=>{const g=(d.NAME||d.name||"").toLowerCase(),b=(d.CODE||d.code||"").toLowerCase(),p=(d.DESCRIPTION||d.description||"").toLowerCase(),f=(d.ID_DEPARTMENT||d.id||"").toLowerCase(),T=d.STATUS||d.status,I=d.DIRECT_MANAGER||d.manager_id||"",A=D.find(x=>(x.ID||x.id||x.emp_code)===I),P=(A?A.FULL_NAME||A.full_name:"").toLowerCase(),O=!u||g.includes(u)||b.includes(u)||p.includes(u)||f.includes(u)||P.includes(u),U=!l||(d.ID_DEPARTMENT||d.id)===l;return O&&U&&(!v||I===v)&&(!M||T===M)}),m=1,N()};t&&t.addEventListener("input",i),e&&e.addEventListener("change",i),n&&n.addEventListener("change",i),a&&a.addEventListener("change",i);const r=document.querySelector("#dept-modal"),o=document.querySelector("#btn-open-add-dept"),c=document.querySelector("#btn-close-dept-modal"),s=document.querySelector("#btn-cancel-dept-modal"),h=document.querySelector("#dept-form");o&&r&&o.addEventListener("click",()=>{h.reset(),document.querySelector("#dept-edit-id").value="";const u=`dept-${S.length+1}`;document.querySelector("#dept-id").value=u,document.querySelector("#dept-id").disabled=!1,document.querySelector("#modal-dept-title").textContent="Add Department";const l=document.querySelector("#modal-dept-subtitle");l&&(l.textContent="Configure department details, manager, and display icon"),document.querySelector("#btn-save-dept").textContent="Save Department",document.querySelector("#dept-status").value="Active",document.querySelector("#dept-icon").value="marketing",r.showModal()});const E=()=>r&&r.close();c&&c.addEventListener("click",E),s&&s.addEventListener("click",E),r&&r.addEventListener("click",u=>{const l=r.getBoundingClientRect();l.top<=u.clientY&&u.clientY<=l.top+l.height&&l.left<=u.clientX&&u.clientX<=l.left+l.width||r.close()}),h&&h.addEventListener("submit",async u=>{u.preventDefault();const l=document.querySelector("#dept-edit-id").value,v=document.querySelector("#dept-id").value.trim(),M=document.querySelector("#dept-name").value.trim(),d=document.querySelector("#dept-code").value.trim(),g=document.querySelector("#dept-manager").value,b=document.querySelector("#dept-status").value,p=document.querySelector("#dept-icon").value,f=document.querySelector("#dept-desc").value.trim();if(L(v)||L(M)){C.error("Please enter department ID and Name (*)");return}const T={ID_DEPARTMENT:v,NAME:M,CODE:d||"DEPT",DESCRIPTION:f,DIRECT_MANAGER:g||"",STATUS:b,ICON:p};try{if(l)await w.update(l,T),C.success("Updated department successfully");else{if(S.some(A=>(A.ID_DEPARTMENT||A.id)===v)){C.error(`Department ID ${v} already exists`);return}await w.create(T),C.success("Added new department successfully")}r.close(),await R()}catch(I){console.error(I),C.error("An error occurred while saving department")}})}function W(t){const e=S.find(i=>(i.ID_DEPARTMENT||i.id)===t);if(!e)return;const n=document.querySelector("#dept-modal");document.querySelector("#dept-edit-id").value=e.ID_DEPARTMENT||e.id,document.querySelector("#dept-id").value=e.ID_DEPARTMENT||e.id,document.querySelector("#dept-id").disabled=!0,document.querySelector("#dept-name").value=e.NAME||e.name||"",document.querySelector("#dept-code").value=e.CODE||e.code||"",document.querySelector("#dept-manager").value=e.DIRECT_MANAGER||e.manager_id||"",document.querySelector("#dept-status").value=e.STATUS||e.status||"Active",document.querySelector("#dept-icon").value=e.ICON||e.icon||"marketing",document.querySelector("#dept-desc").value=e.DESCRIPTION||e.description||"",document.querySelector("#modal-dept-title").textContent="Edit Department";const a=document.querySelector("#modal-dept-subtitle");a&&(a.textContent="Update department information and direct manager"),document.querySelector("#btn-save-dept").textContent="Save Department",n&&n.showModal()}
