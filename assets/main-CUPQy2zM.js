import{g as u,s as L}from"./storage-H0y7aWV1.js";import{e as k}from"./employeeService-C2E39r-H.js";import{d as w}from"./departmentService-BoPU2OeI.js";import{p as D}from"./paymentService-D0FnCdzp.js";import{r as M}from"./requestService-1413w6DA.js";const P={async getAll(){const n=u("attendance"),i=u("employees"),s=u("departments");return n.map(a=>{const e=i.find(o=>o.id===a.employee_id),t=e?s.find(o=>o.id===e.department_id):null;return{...a,employees:e?{full_name:e.full_name,emp_code:e.emp_code,position:e.position,departments:t?{name:t.name}:null}:null}})},async recordCheckIn(n,i="Check-in đúng giờ"){const s=new Date().toISOString().split("T")[0],a=new Date,e=`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`,t=a.getHours()>8||a.getHours()===8&&a.getMinutes()>30?"late":"on_time",o={employee_id:n,date:s,check_in:e,check_out:"",status:t,note:i};let l=u("attendance");const r=l.findIndex(c=>c.employee_id===n&&c.date===s);return r>=0?l[r]={...l[r],...o}:l.unshift({id:`att-${Date.now()}`,...o}),L("attendance",l),o},async recordCheckOut(n){const i=new Date().toISOString().split("T")[0],s=new Date,a=`${String(s.getHours()).padStart(2,"0")}:${String(s.getMinutes()).padStart(2,"0")}`;let e=u("attendance");return e=e.map(t=>t.employee_id===n&&t.date===i?{...t,check_out:a}:t),L("attendance",e),!0}};document.addEventListener("DOMContentLoaded",async()=>{await x()});function q(n){return n==null||isNaN(n)?"$0":"$"+Number(n).toLocaleString("en-US")}async function x(){try{const[n,i,s,a,e]=await Promise.all([k.getAll(),w.getAll(),P.getAll(),D.getAll(),M.getAll()]),t=n.length||24,o=i.length||4,l=new Date().toISOString().split("T")[0],r=s.filter(d=>d.date===l),p=(r.length>0?r:s.slice(0,t)).filter(d=>d.status==="on_time"||d.status==="ontime").length,g=t>0?Math.round(p/t*100):92,v=a.reduce((d,T)=>d+(Number(T.amount)||Number(T.net_salary)||0),0),m=a.filter(d=>(d.payment_status||d.status||"").toLowerCase()==="paid"),y=a.filter(d=>(d.payment_status||d.status||"").toLowerCase()==="pending"),A=e.filter(d=>(d.request_status||d.status||"").toLowerCase()==="pending"),f=document.querySelector("#kpi-total-employees"),h=document.querySelector("#kpi-total-departments"),b=document.querySelector("#kpi-attendance-rate"),S=document.querySelector("#kpi-attendance-subtext"),_=document.querySelector("#kpi-total-payroll"),$=document.querySelector("#kpi-payroll-subtext");f&&(f.textContent=t),h&&(h.textContent=o),b&&(b.textContent=`${g}%`),S&&(S.innerHTML=`<strong>${p}</strong> on-time today`),_&&(_.textContent=q(v)),$&&($.innerHTML=`<strong>${m.length}</strong> Paid • ${y.length} Pending`),E(i,n),N(A.length,y.length),C(e,s)}catch(n){console.error("Error loading dashboard metrics:",n)}}function E(n,i){const s=document.querySelector("#dept-bars-container");if(!s)return;if(!n||n.length===0){s.innerHTML='<p class="text-muted" style="color: #64748b; font-size: 0.88rem;">No department data available.</p>';return}const a=i.length||1,e={"dept-1":{dot:"dept-dot-eng",fill:"dept-fill-eng"},"dept-2":{dot:"dept-dot-mkt",fill:"dept-fill-mkt"},"dept-3":{dot:"dept-dot-bus",fill:"dept-fill-bus"},"dept-4":{dot:"dept-dot-hr",fill:"dept-fill-hr"}};s.innerHTML=n.map((t,o)=>{const l=t.id||t.ID_DEPARTMENT,r=t.name||t.NAME||"Department",c=i.filter(v=>{const m=v.ID_DEPARTMENT||v.department_id||"";return m===l||m===r||t.code&&m===t.code}).length,p=Math.round(c/a*100),g=e[l]||{dot:"dept-dot-other",fill:"dept-fill-other"};return`
      <div class="dept-bar-item">
        <div class="dept-bar-meta">
          <div class="dept-name-badge">
            <span class="dept-dot ${g.dot}"></span>
            <span>${r}</span>
          </div>
          <div class="dept-bar-stats">
            <strong>${c}</strong> members (${p}%)
          </div>
        </div>
        <div class="dept-bar-track">
          <div class="dept-bar-fill ${g.fill}" style="width: ${p}%;"></div>
        </div>
      </div>
    `}).join("")}function N(n,i){const s=document.querySelector("#pending-items-container");s&&(s.innerHTML=`
    <a href="requests.html" class="pending-item">
      <div class="pending-item-left">
        <span class="pending-item-icon">📝</span>
        <div>
          <div class="pending-item-label">Pending Requests</div>
          <div class="pending-item-sub">Leave and overtime requests to review</div>
        </div>
      </div>
      <span class="pending-pill orange">${n} pending</span>
    </a>
    <a href="payments.html" class="pending-item">
      <div class="pending-item-left">
        <span class="pending-item-icon">💳</span>
        <div>
          <div class="pending-item-label">Pending Payroll</div>
          <div class="pending-item-sub">Employee payments awaiting settlement</div>
        </div>
      </div>
      <span class="pending-pill yellow">${i} pending</span>
    </a>
  `)}function C(n,i){const s=document.querySelector("#activity-list-container");if(!s)return;const a=[];if((n||[]).slice(0,3).forEach(e=>{const t=e.employee_id||"Employee",o=e.request_type||e.type||"leave",l=o==="leave"?"Leave Request":o==="late_arrival"?"Late Notice":"Business Trip",r=(e.request_status||e.status)==="pending";a.push({icon:"📝",title:`<strong>${t}</strong> submitted ${l}`,time:e.start_date||"Recent",badge:r?'<span class="status-badge status-pending">Pending</span>':'<span class="status-badge status-approved">Approved</span>'})}),(i||[]).slice(0,3).forEach(e=>{const t=e.employees?e.employees.full_name:e.employee_id||"Staff",o=e.status==="late";a.push({icon:"⏱️",title:`<strong>${t}</strong> recorded check-in (${e.check_in||"08:30"})`,time:e.date||"Today",badge:o?'<span class="status-badge status-late">Late</span>':'<span class="status-badge status-ontime">On-time</span>'})}),a.length===0){s.innerHTML='<p class="text-muted" style="color: #64748b; font-size: 0.88rem;">No recent activities recorded.</p>';return}s.innerHTML=a.slice(0,5).map(e=>`
    <div class="activity-item">
      <div class="activity-icon-badge">${e.icon}</div>
      <div class="activity-content">
        <div class="activity-title">${e.title}</div>
        <div class="activity-meta">
          <span>${e.time}</span>
          <span>•</span>
          ${e.badge}
        </div>
      </div>
    </div>
  `).join("")}
