(() => {
 "use strict";
 function calculate(a, k) {
  a = Math.max(0, Math.min(1, Number(a)));
  k = Math.max(1, Math.floor(Number(k)));
  const prefixProbabilities = Array.from({length:k}, (_,i) => Math.pow(a,i+1));
  const accepted = prefixProbabilities.reduce((s,p)=>s+p,0);
  return {accepted, advanced:1+accepted, full:Math.pow(a,k), prefixProbabilities};
 }
 function init() {
  document.querySelectorAll("[data-spec-lab]").forEach(root=>{
   const a=root.querySelector('[data-spec-field="a"]');
   const k=root.querySelector('[data-spec-field="k"]');
   const barRoot=root.querySelector("[data-spec-bars]");
   if(!a||!k||!barRoot) return;
   const value=name=>root.querySelector('[data-spec-value="'+name+'"]');
   const result=name=>root.querySelector('[data-spec-result="'+name+'"]');
   function render(){
    const av=Number(a.value),kv=Number(k.value);
    const d=calculate(av,kv);
    value("a").textContent=av.toFixed(2);
    value("k").textContent=String(kv);
    result("accepted").textContent=d.accepted.toFixed(3);
    result("advanced").textContent=d.advanced.toFixed(3);
    result("full").textContent=(100*d.full).toFixed(1)+"%";
    result("note").textContent="仅在每个候选位置独立且接受概率恒定为 a 的假设下成立；真实 vLLM 的位置相关接受率、验证成本和停止条件可能改变结果。";
    const fragment=document.createDocumentFragment();
    d.prefixProbabilities.forEach((p,i)=>{
     const line=document.createElement("div");
     line.className="spec-lab-bar";
     const label=document.createElement("span");
     label.textContent="前 "+(i+1)+" 个";
     const track=document.createElement("span");
     track.className="spec-lab-track";
     const fill=document.createElement("i");
     fill.style.width=(100*p).toFixed(2)+"%";
     track.appendChild(fill);
     const pct=document.createElement("strong");
     pct.textContent=(100*p).toFixed(1)+"%";
     line.append(label,track,pct);
     fragment.appendChild(line);
    });
    barRoot.replaceChildren(fragment);
   }
   [a,k].forEach(input=>{input.addEventListener("input",render);input.addEventListener("change",render);});
   render();
  });
 }
 window.vllmSpecLab={calculate};
 if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
