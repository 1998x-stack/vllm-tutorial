(() => {
  "use strict";
  function calculate(values) {
    const successes = Number(values.success);
    const failures = Number(values.failure);
    const seconds = Number(values.seconds);
    const tokens = Number(values.tokens);
    if (![successes, failures, seconds, tokens].every(Number.isFinite) ||
        successes < 0 || failures < 0 || tokens < 0 || seconds <= 0 ||
        !Number.isInteger(successes) || !Number.isInteger(failures) ||
        !Number.isInteger(tokens)) return {valid:false, message:"请输入非负整数请求数和 Token 数，以及大于零的秒数。"};
    const total = successes + failures;
    return {
      valid:true,
      rps:successes/seconds,
      tps:tokens/seconds,
      failureRate:total===0?0:failures/total,
      noRequests:total===0
    };
  }
  function setup(root) {
    const fields=["success","failure","seconds","tokens"];
    const inputs=Object.fromEntries(fields.map(name=>[name,root.querySelector('[data-bench-field="'+name+'"]')]));
    if(fields.some(name=>!inputs[name])) return;
    const display=(name,value)=>{
      const el=root.querySelector('[data-bench-output="'+name+'"]');
      if(el)el.textContent=value;
    };
    function render(){
      const vals=Object.fromEntries(fields.map(name=>[name,inputs[name].value]));
      const result=calculate(vals);
      if(!result.valid){
        for(const name of ["rps","tps","error"]) display(name,"—");
        display("note",result.message);
        return;
      }
      display("rps",result.rps.toFixed(2)+" req/s");
      display("tps",result.tps.toFixed(1)+" tok/s");
      display("error",result.noRequests?"—":(result.failureRate*100).toFixed(1)+"%");
      display("note",result.noRequests?"零请求：失败比例不可定义。":"仅按输入的成功请求与实际 token 计数复算；没有测量 P99 / 成本 / 模型质量。");
    }
    fields.forEach(name=>{inputs[name].addEventListener("input",render);inputs[name].addEventListener("change",render);});
    render();
  }
  window.vllmBenchmarkLab={calculate};
  function init(){document.querySelectorAll("[data-bench-lab]").forEach(setup);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
