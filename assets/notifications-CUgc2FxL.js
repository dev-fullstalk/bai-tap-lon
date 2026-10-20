function o({type:t="info",title:e="",message:i="",duration:c=3500}){let n=document.querySelector("#toast-container");n||(n=document.createElement("div"),n.id="toast-container",document.body.appendChild(n));const r={success:"✅",danger:"❌",error:"❌",warning:"⚠️",info:"ℹ️"},a=t==="error"?"danger":t,s=document.createElement("div");s.className=`toast toast-${a}`,s.innerHTML=`
    <div class="toast-icon">${r[a]||"ℹ️"}</div>
    <div class="toast-content">
      ${e?`<div class="toast-title">${e}</div>`:""}
      <div class="toast-message">${i}</div>
    </div>
  `,n.appendChild(s),setTimeout(()=>{s.style.opacity="0",s.style.transform="translateX(100%)",setTimeout(()=>{s.remove()},300)},c)}const d={success:(t,e="Thành công")=>o({type:"success",title:e,message:t}),error:(t,e="Lỗi")=>o({type:"danger",title:e,message:t}),warning:(t,e="Cảnh báo")=>o({type:"warning",title:e,message:t}),info:(t,e="Thông báo")=>o({type:"info",title:e,message:t})};export{d as t};
