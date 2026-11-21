(() => {
  "use strict";

  const TOKENS = [
    { token: "猫", logit: 3.2 },
    { token: "狗", logit: 2.6 },
    { token: "狐狸", logit: 1.9 },
    { token: "鸟", logit: 1.3 },
    { token: "乌龟", logit: 0.6 },
    { token: "鲸鱼", logit: -0.1 },
  ];

  function calculate(options) {
    const temperature = Number(options.temperature);
    const topK = Math.max(0, Math.floor(Number(options.topK)));
    const topP = Math.min(1, Math.max(0.0001, Number(options.topP)));
    const minP = Math.min(1, Math.max(0, Number(options.minP)));
    const maxIndex = TOKENS.reduce(
      (best, item, index, all) => item.logit > all[best].logit ? index : best,
      0,
    );

    if (temperature <= 0) {
      return {
        greedy: true,
        retainedCount: 1,
        winner: TOKENS[maxIndex].token,
        rows: TOKENS.map((item, index) => ({
          token: item.token,
          probability: index === maxIndex ? 1 : 0,
          retained: index === maxIndex,
        })),
      };
    }

    const scaled = TOKENS.map(item => item.logit / temperature);
    const maxLogit = Math.max(...scaled);
    const exponentials = scaled.map(value => Math.exp(value - maxLogit));
    const total = exponentials.reduce((sum, value) => sum + value, 0);
    const probabilities = exponentials.map(value => value / total);
    let active = TOKENS.map((_, index) => index);

    if (topK > 0 && topK < active.length) {
      active = active
        .slice()
        .sort((a, b) => probabilities[b] - probabilities[a])
        .slice(0, topK);
    }

    if (topP < 1 && active.length > 1) {
      const sorted = active.slice().sort((a, b) => probabilities[b] - probabilities[a]);
      const activeMass = sorted.reduce((sum, index) => sum + probabilities[index], 0);
      let cumulative = 0;
      const nucleus = [];
      for (const index of sorted) {
        nucleus.push(index);
        cumulative += probabilities[index] / activeMass;
        if (cumulative >= topP) break;
      }
      active = nucleus;
    }

    if (minP > 0 && active.length > 1) {
      const threshold = minP * Math.max(...probabilities);
      active = active.filter(index => probabilities[index] >= threshold);
    }

    if (!active.length) active = [maxIndex];
    const retainedMass = active.reduce((sum, index) => sum + probabilities[index], 0);
    const retainedSet = new Set(active);
    const rows = TOKENS.map((item, index) => ({
      token: item.token,
      probability: retainedSet.has(index) ? probabilities[index] / retainedMass : 0,
      retained: retainedSet.has(index),
    }));
    const winner = rows.reduce(
      (best, item) => item.probability > best.probability ? item : best,
      rows[0],
    );

    return {
      greedy: false,
      retainedCount: active.length,
      winner: winner.token,
      rows,
    };
  }

  function init() {
    document.querySelectorAll("[data-sampling-lab]").forEach(root => {
      const field = name => root.querySelector('[data-sampling-field="' + name + '"]');
      const value = name => root.querySelector('[data-sampling-value="' + name + '"]');
      const result = name => root.querySelector('[data-sampling-result="' + name + '"]');
      const bars = root.querySelector("[data-sampling-bars]");
      const temperature = field("temperature");
      const topK = field("topK");
      const topP = field("topP");
      const minP = field("minP");
      if (!temperature || !topK || !topP || !minP || !bars) return;

      const render = () => {
        const t = Number(temperature.value);
        const k = Number(topK.value);
        const p = Number(topP.value);
        const m = Number(minP.value);
        value("temperature").textContent = t.toFixed(2);
        value("topK").textContent = k === 0 ? "0（关闭）" : String(k);
        value("topP").textContent = p.toFixed(2);
        value("minP").textContent = m.toFixed(2);

        const state = calculate({ temperature: t, topK: k, topP: p, minP: m });
        result("count").textContent = state.retainedCount + " / " + TOKENS.length;
        result("winner").textContent = state.winner;
        result("mode").textContent = state.greedy ? "Greedy" : "随机抽样";

        if (state.greedy) {
          result("note").textContent =
            "Temperature=0 时切换到 Greedy：只保留最高 logit。当前 vLLM SamplingParams 会同时关闭 Top-k、Top-p 和 Min-p。";
        } else {
          result("note").textContent =
            "保留 " + state.retainedCount + " 个候选；过滤后概率重新归一化。最高概率候选是“" +
            state.winner + "”，但随机抽样仍可能选中其他保留候选。此顺序是教学简化，不代表每种 vLLM kernel 的内部实现顺序。";
        }

        const fragment = document.createDocumentFragment();
        state.rows.forEach(row => {
          const line = document.createElement("div");
          line.className = "sampling-bar-row" + (row.retained ? "" : " is-filtered");
          const name = document.createElement("span");
          name.className = "sampling-bar-token";
          name.textContent = row.token;
          const track = document.createElement("span");
          track.className = "sampling-bar-track";
          const bar = document.createElement("i");
          bar.style.width = (row.probability * 100).toFixed(2) + "%";
          track.appendChild(bar);
          const pct = document.createElement("strong");
          pct.textContent = row.retained
            ? (row.probability * 100).toFixed(1) + "%"
            : "已过滤";
          line.append(name, track, pct);
          fragment.appendChild(line);
        });
        bars.replaceChildren(fragment);
      };

      [temperature, topK, topP, minP].forEach(input => {
        input.addEventListener("input", render);
        input.addEventListener("change", render);
      });
      render();
    });
  }

  window.vllmSamplingLab = { calculate };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();