(() => {
  "use strict";

  const formatBytes = (value) => {
    const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
    let amount = value;
    let index = 0;
    while (amount >= 1024 && index < units.length - 1) {
      amount /= 1024;
      index += 1;
    }
    const rounded = amount.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    return rounded + " " + units[index];
  };

  const initCalculator = () => {
    document.querySelectorAll("[data-kv-calculator]").forEach((root) => {
      const getField = (name) => root.querySelector('[data-kv-field="' + name + '"]');
      const getOutput = (name) => root.querySelector('[data-kv-output="' + name + '"]');
      const names = ["layers", "kvHeads", "headDim", "bytes", "tokens", "concurrency"];
      const fields = names.map(getField);
      if (fields.some((field) => !field)) return;

      const update = () => {
        const values = Object.fromEntries(names.map((name) => {
          const field = getField(name);
          return [name, Number(field.value)];
        }));

        const valid = names.every((name) =>
          Number.isFinite(values[name]) && values[name] > 0
        );
        if (!valid) {
          ["per-token", "per-request", "total"].forEach((name) => {
            getOutput(name).textContent = "—";
          });
          getOutput("note").textContent = "请为每个参数输入大于 0 的数值。";
          return;
        }

        const perToken = 2 * values.layers * values.kvHeads *
          values.headDim * values.bytes;
        const perRequest = perToken * values.tokens;
        const total = perRequest * values.concurrency;

        getOutput("per-token").textContent = formatBytes(perToken);
        getOutput("per-request").textContent = formatBytes(perRequest);
        getOutput("total").textContent = formatBytes(total);
        getOutput("note").textContent =
          "每 token = 2 × " + values.layers + " 层 × " +
          values.kvHeads + " KV heads × " + values.headDim +
          " head_dim × " + values.bytes + " bytes；结果仅为理论 K/V payload。";
      };

      fields.forEach((field) => {
        field.addEventListener("input", update);
        field.addEventListener("change", update);
      });
      update();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCalculator, { once: true });
  } else {
    initCalculator();
  }
})();