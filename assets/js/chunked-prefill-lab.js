(() => {
  "use strict";

  const integer = (field) => {
    const value = Number(field.value);
    return Number.isFinite(value) ? Math.floor(value) : NaN;
  };

  const initChunkLabs = () => {
    document.querySelectorAll("[data-chunk-lab]").forEach((root) => {
      const field = (name) => root.querySelector('[data-chunk-field="' + name + '"]');
      const output = (name) => root.querySelector('[data-chunk-output="' + name + '"]');
      const budgetField = field("budget");
      const decodeField = field("decode");
      const promptField = field("prompt");
      const schedule = output("schedule");
      if (!budgetField || !decodeField || !promptField || !schedule) return;

      const render = () => {
        const budget = integer(budgetField);
        const decodeRequests = integer(decodeField);
        const promptTokens = integer(promptField);
        const valid =
          Number.isInteger(budget) && budget >= 1 && budget <= 100000 &&
          Number.isInteger(decodeRequests) && decodeRequests >= 0 && decodeRequests <= 10000 &&
          Number.isInteger(promptTokens) && promptTokens >= 1 && promptTokens <= 1000000;

        if (!valid) {
          ["decode", "prefill", "steps"].forEach((key) => {
            output(key).textContent = "—";
          });
          output("note").textContent = "请输入有效整数：budget 1–100000，Decode 请求 0–10000，Prompt tokens 1–1000000。";
          schedule.replaceChildren();
          return;
        }

        const scheduledDecode = Math.min(decodeRequests, budget);
        const perStepPrefill = budget - scheduledDecode;
        output("decode").textContent = scheduledDecode + " tokens";
        output("prefill").textContent = perStepPrefill + " tokens";

        if (perStepPrefill <= 0) {
          output("steps").textContent = "无法推进";
          output("note").textContent =
            "Decode 请求已占满本轮 token budget；在这个简化模型中没有剩余空间安排 Prefill。可增加 budget 或减少活跃 Decode 请求。";
          schedule.replaceChildren();
          return;
        }

        const steps = Math.ceil(promptTokens / perStepPrefill);
        output("steps").textContent = String(steps);
        output("note").textContent =
          "教学简化模型：每轮先安排 " + scheduledDecode +
          " 个 Decode tokens，再把剩余 " + perStepPrefill +
          " 个 token budget 用于一条 Prompt。实际 Scheduler 还有 KV、请求数、Spec Decode 与多模态等约束。";

        const fragment = document.createDocumentFragment();
        let remaining = promptTokens;
        const shown = Math.min(steps, 20);
        for (let i = 1; i <= shown; i += 1) {
          const prefill = Math.min(perStepPrefill, remaining);
          remaining -= prefill;
          const item = document.createElement("li");
          item.textContent =
            "Step " + i + "：Decode " + scheduledDecode +
            " + Prefill " + prefill + " = " +
            (scheduledDecode + prefill) + "；Prompt 剩余 " + remaining;
          fragment.appendChild(item);
        }
        if (steps > shown) {
          const item = document.createElement("li");
          item.textContent = "……其余 " + (steps - shown) + " 轮省略。";
          fragment.appendChild(item);
        }
        schedule.replaceChildren(fragment);
      };

      [budgetField, decodeField, promptField].forEach((input) => {
        input.addEventListener("input", render);
        input.addEventListener("change", render);
      });
      render();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChunkLabs, { once: true });
  } else {
    initChunkLabs();
  }
})();