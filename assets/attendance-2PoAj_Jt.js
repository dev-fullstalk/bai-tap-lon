import{g as D}from"./storage-H0y7aWV1.js";import{t as v}from"./notifications-CUgc2FxL.js";const q="hr_attendance_records_v2";let o=[],w={},S=[];function N(){const e=D("employees");w={},S=[],e.forEach(a=>{const t=a.ID||a.id||a.emp_code||"",n=a.FULL_NAME||a.full_name||"";t&&(w[t]={name:n,code:t},S.push({id:t,name:n}))})}function k(e){return e?w[e]&&w[e].name||e:"—"}function _(){return[{id:"att-001",employee_id:"NV001",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"08:55 AM",checkOut:"05:32 PM",status:"Present",note:"—"},{id:"att-002",employee_id:"NV002",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"09:15 AM",checkOut:"06:05 PM",status:"Late",note:"Traffic delay"},{id:"att-003",employee_id:"NV004",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"08:48 AM",checkOut:"05:18 PM",status:"Present",note:"—"},{id:"att-004",employee_id:"NV005",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"—",checkOut:"—",status:"Absent",note:"Sick leave (unplanned)"},{id:"att-005",employee_id:"NV008",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"08:30 AM",checkOut:"04:50 PM",status:"Leave",note:"Personal leave"},{id:"att-006",employee_id:"NV003",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"08:02 AM",checkOut:"05:45 PM",status:"Present",note:"—"},{id:"att-007",employee_id:"NV006",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"09:30 AM",checkOut:"06:00 PM",status:"Late",note:"Missed bus"},{id:"att-008",employee_id:"NV009",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"08:10 AM",checkOut:"05:10 PM",status:"Present",note:"—"},{id:"att-009",employee_id:"NV011",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"—",checkOut:"—",status:"Leave",note:"Annual leave"},{id:"att-010",employee_id:"NV015",date:"20 Oct 2026",rawDate:"2026-10-20",checkIn:"08:45 AM",checkOut:"05:30 PM",status:"Present",note:"WFH approved"}]}function C(){const e=localStorage.getItem(q);if(e)try{const a=JSON.parse(e);if(Array.isArray(a)&&a.length>0){o=a;return}}catch{}o=_(),O()}function O(){localStorage.setItem(q,JSON.stringify(o))}function M(e){if(!e)return"EM";const a=e.trim().split(/\s+/);return a.length===1?a[0].slice(0,2).toUpperCase():(a[0][0]+a[a.length-1][0]).toUpperCase()}function P(e){const a=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];if(a.some(t=>e.includes(t)))return e;try{const t=new Date(e);return isNaN(t.getTime())?e:`${t.getDate()} ${a[t.getMonth()]} ${t.getFullYear()}`}catch{return e}}function g(e){if(!e||e==="—")return"—";if(/AM|PM/i.test(e))return e;const[a,t]=e.split(":");if(!a||!t)return e;let n=parseInt(a,10);const c=t.padStart(2,"0"),s=n>=12?"PM":"AM";return n=n%12||12,`${String(n).padStart(2,"0")}:${c} ${s}`}function $(){const e=o.filter(s=>s.status==="Present").length,a=o.filter(s=>s.status==="Absent").length,t=o.filter(s=>s.status==="Late").length,n=o.filter(s=>s.status==="Leave").length,c=(s,i)=>{const l=document.querySelector(s);l&&(l.textContent=i)};c("#kpi-present-count",e),c("#kpi-absent-count",a),c("#kpi-late-count",t),c("#kpi-leave-count",n)}function A(e){const a={present:["att-badge-present","Present"],late:["att-badge-late","Late"],absent:["att-badge-absent","Absent"],leave:["att-badge-leave","Leave"]},t=(e||"").toLowerCase(),[n,c]=a[t]||["att-badge-present",e];return`<span class="att-badge ${n}"><span class="att-badge-dot"></span>${c}</span>`}function E(e){const a=document.querySelector("#att-table-body");if(a){if(e.length===0){a.innerHTML=`
      <tr>
        <td colspan="6">
          <div class="att-empty-state">
            <svg class="att-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <div class="att-empty-title">No attendance records found</div>
            <div class="att-empty-desc">Try adjusting your search or status filter.</div>
          </div>
        </td>
      </tr>`;return}a.innerHTML=e.map(t=>{const n=k(t.employee_id),c=t.employee_id||"—",s=M(n),i=!t.checkIn||t.checkIn==="—"?'<span class="att-empty-val">—</span>':`<span class="att-time-val">${t.checkIn}</span>`,l=!t.checkOut||t.checkOut==="—"?'<span class="att-empty-val">—</span>':`<span class="att-time-val">${t.checkOut}</span>`,r=t.note&&t.note!=="—"?`<span class="att-note-val">${t.note}</span>`:'<span class="att-empty-val">—</span>';return`
      <tr data-id="${t.id}">
        <td>
          <div class="att-emp-cell">
            <div class="att-emp-avatar" aria-hidden="true">${s}</div>
            <div class="att-emp-meta">
              <span class="att-emp-name">${n}</span>
              <span class="att-emp-code">${c}</span>
            </div>
          </div>
        </td>
        <td><span class="att-date-val">${t.date}</span></td>
        <td>${i}</td>
        <td>${l}</td>
        <td>${A(t.status)}</td>
        <td>${r}</td>
      </tr>`}).join("")}}function L(){var n,c;const e=(((n=document.querySelector("#att-search-input"))==null?void 0:n.value)||"").toLowerCase().trim(),a=((c=document.querySelector("#att-status-filter"))==null?void 0:c.value)||"all",t=o.filter(s=>{const i=k(s.employee_id).toLowerCase(),l=(s.employee_id||"").toLowerCase(),r=(s.note||"").toLowerCase(),u=!e||i.includes(e)||l.includes(e)||r.includes(e),m=a==="all"||s.status.toLowerCase()===a.toLowerCase();return u&&m});E(t)}function V(e=""){const a=document.querySelector("#form-employee-select");a&&(a.innerHTML='<option value="">-- Select employee --</option>',S.forEach(t=>{const n=document.createElement("option");n.value=t.id,n.textContent=`${t.name} (${t.id})`,t.id===e&&(n.selected=!0),a.appendChild(n)}))}function T(){var t;const e=document.querySelector("#att-modal"),a=document.querySelector("#att-form");!e||!a||(a.reset(),document.querySelector("#form-record-id").value="",document.querySelector("#form-work-date").value="2026-10-20",document.querySelector("#form-status").value="Present",document.querySelector("#modal-title").textContent="Add Attendance Record",V(""),e.classList.add("active"),e.setAttribute("aria-hidden","false"),(t=document.querySelector("#form-employee-select"))==null||t.focus())}function y(){const e=document.querySelector("#att-modal");e&&(e.classList.remove("active"),e.setAttribute("aria-hidden","true"))}function x(e){const a=o.find(l=>l.id===e);if(!a)return;const t=document.querySelector("#att-view-modal"),n=document.querySelector("#att-view-details");if(!t||!n)return;const c=k(a.employee_id),s=a.employee_id||"—",i=M(c);n.innerHTML=`
    <div class="att-view-header">
      <div class="att-view-avatar">${i}</div>
      <div>
        <h3 style="font-size:1.1rem;font-weight:700;color:#1e293b;margin-bottom:2px;">${c}</h3>
        <span style="font-size:0.85rem;color:#64748b;font-weight:500;">${s}</span>
      </div>
    </div>
    <div class="att-view-grid">
      <div class="att-view-item">
        <span class="att-view-item-label">Work Date</span>
        <span class="att-view-item-value">${a.date}</span>
      </div>
      <div class="att-view-item">
        <span class="att-view-item-label">Status</span>
        <span class="att-view-item-value">${A(a.status)}</span>
      </div>
      <div class="att-view-item">
        <span class="att-view-item-label">Check In</span>
        <span class="att-view-item-value">${a.checkIn||"—"}</span>
      </div>
      <div class="att-view-item">
        <span class="att-view-item-label">Check Out</span>
        <span class="att-view-item-value">${a.checkOut||"—"}</span>
      </div>
      <div class="att-view-item full-width">
        <span class="att-view-item-label">Note</span>
        <span class="att-view-item-value">${a.note||"—"}</span>
      </div>
    </div>`,t.classList.add("active"),t.setAttribute("aria-hidden","false")}function h(){const e=document.querySelector("#att-view-modal");e&&(e.classList.remove("active"),e.setAttribute("aria-hidden","true"))}function F(e){e.preventDefault();const a=document.querySelector("#form-record-id").value,t=document.querySelector("#form-employee-select").value,n=document.querySelector("#form-work-date").value||"2026-10-20",c=document.querySelector("#form-status").value,s=document.querySelector("#form-checkin").value,i=document.querySelector("#form-checkout").value,l=document.querySelector("#form-note").value.trim();if(!t){v.warning("Please select an employee.");return}const r=k(t),u=P(n),m=c==="Absent"||c==="Leave",f=s?g(s):"—",d=i?g(i):"—",p=l||"—";if(a){const b=o.findIndex(I=>I.id===a);b>=0&&(o[b]={...o[b],employee_id:t,rawDate:n,date:u,status:c,checkIn:f,checkOut:d,note:p},v.success(`Updated attendance for ${r}`))}else o.unshift({id:`att-${Date.now()}`,employee_id:t,rawDate:n,date:u,status:c,checkIn:f,checkOut:d,note:p}),v.success(`Added attendance for ${r}`);O(),$(),L(),y()}function R(){var e,a,t,n,c,s,i,l,r,u,m,f;(e=document.querySelector("#att-search-input"))==null||e.addEventListener("input",L),(a=document.querySelector("#att-status-filter"))==null||a.addEventListener("change",L),(t=document.querySelector("#btn-top-date"))==null||t.addEventListener("click",()=>v.info("Date selected: October 20, 2026")),(n=document.querySelector("#btn-top-month"))==null||n.addEventListener("click",()=>v.info("Filter range: This Month")),(c=document.querySelector("#btn-table-date"))==null||c.addEventListener("click",()=>v.info("Showing records for October 20, 2026")),(s=document.querySelector("#btn-open-add-modal"))==null||s.addEventListener("click",T),(i=document.querySelector("#modal-close-btn"))==null||i.addEventListener("click",y),(l=document.querySelector("#modal-cancel-btn"))==null||l.addEventListener("click",y),(r=document.querySelector("#view-modal-close-btn"))==null||r.addEventListener("click",h),(u=document.querySelector("#view-modal-done-btn"))==null||u.addEventListener("click",h),(m=document.querySelector("#att-form"))==null||m.addEventListener("submit",F),(f=document.querySelector("#att-table-body"))==null||f.addEventListener("click",d=>{const p=d.target.closest("tr[data-id]");p&&p.dataset.id&&x(p.dataset.id)}),window.addEventListener("click",d=>{d.target===document.querySelector("#att-modal")&&y(),d.target===document.querySelector("#att-view-modal")&&h()}),window.addEventListener("keydown",d=>{d.key==="Escape"&&(y(),h())})}document.addEventListener("DOMContentLoaded",()=>{N(),C(),$(),E(o),R()});
