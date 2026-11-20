# Agent instructions

本仓库是版本敏感的 vLLM 工程知识库。权威流程见 `skills/olah-style-vllm-posts/SKILL.md`。

## 逐篇改造纪律

1. 阅读 README、课程目录、目标 HTML 全文及相关 Markdown。
2. 优先查阅对应 vLLM release 的官方文档、源码和原始论文；记录版本或 commit 与核验日期。
3. 一次改造一篇文章，或在 PR 中明确每个批次的文章范围。
4. 保留有价值的教学内容，但删除没有依据的 benchmark 数字和错误 API / 架构描述。
5. 每篇文章位于 `posts/<category>/<number>-<slug>/`，包含 `index.html`、原创 SVG 和 `evidence.json`。
6. `courses.json` 是目录元数据唯一来源；不要手工编辑生成的 `courses-data.js`。
7. 暂时保留根目录 `NN.html` 作为兼容跳转。
8. 解释源码时固定 commit；moving main URL 不能冒充不可变版本。
9. 性能结论必须包含可复现环境与 workload，否则移除或标记为示意。
10. 运行目录同步、Node / Python 测试、静态文章校验和浏览器 QA。
11. 未检查 CI、合并和 Pages 部署状态前，不得宣称成功。

优先级：技术正确性 > 证据可追溯 > 因果解释 > 图解忠实度 > 可访问性 > 视觉润色。
