# vLLM 推理系统：从原理到生产实践

一套面向大学生、研究生和推理工程初学者的中文视觉化课程。课程从自回归生成与 KV Cache 开始，逐步解释 PagedAttention、Continuous Batching、调度器、V1 Engine Core、多 GPU 并行、推测解码、多模态推理和生产部署。

> 学习目标：不仅知道某个参数或术语是什么，还能沿着一次请求的生命周期解释它为什么存在、如何工作、会带来什么代价，以及如何验证它。

[打开课程地图](index.html) · [课程作者规范](AGENTS.md) · [vLLM Tutorial Skill](skills/vllm-tutorial/SKILL.md)

## 课程设计

本仓库采用受 Olah 渐进式讲解方法启发的内容结构：先提出一个具体问题，再从最小例子逐步展开机制，最后连接到公式、代码、工程取舍和故障边界。所有图解独立绘制，不复制参考文章的图、文案或代码。

每章的基本阅读路径：

1. **先理解问题**：这一章讨论什么，为什么它会影响推理系统。
2. **看见机制**：用专属 SVG 把数据流、内存映射或调度过程拆成步骤。
3. **建立定量直觉**：给出公式、张量形状、单位和一个可复算的小例子。
4. **连接工程实现**：对照官方文档、源码或可运行的最小示例。
5. **理解边界**：说明版本差异、性能权衡、常见误解和适用条件。

技术行为会随 vLLM 版本、模型架构、硬件和后端变化。涉及 CLI 默认值、API、调度策略、模型支持或性能数据时，必须核对官方资料并注明版本范围；没有可核验来源的数字不进入正文。

## 知识分类

| 专题 | 章节 | 学习重点 |
|---|---|---|
| 推理基础与系统认知 | 01–02 | 自回归生成、Prefill / Decode、vLLM 的设计目标 |
| KV Cache 与内存管理 | 03–04、08–09 | PagedAttention、Block Table、KV 生命周期、前缀缓存 |
| 调度、批处理与运行时 | 05、10–13 | Continuous Batching、Scheduler、Chunked Prefill、V1 |
| 安装、模型接入与生成控制 | 06–07、14 | 安装、模型加载、量化、Sampling、Structured Outputs |
| 并行计算与高级推理 | 19–22 | TP / PP / DP / EP、推测解码、多模态 |
| 生产部署、观测与可靠性 | 15–18、24–25 | Docker、Kubernetes、TTFT / ITL、Prometheus、Tracing、安全与排障 |
| 源码阅读与系统实践 | 23、27 | nano-vLLM、RAG 推理服务 |
| 趋势判断与学习路径 | 26、28 | 技术成熟度、知识图谱、后续学习路线 |

专题分类用于帮助读者按兴趣跳读；建议初学者仍按章节编号循序学习。每章的难度、预计用时、前置章节和学习目标维护在 `courses.json`，`courses-data.js` 是由脚本生成的离线目录数据，不要手工编辑。

## 仓库结构

```text
vllm-tutorial/
├── README.md
├── AGENTS.md
├── index.html                    # 分类课程地图，支持 file:// 离线打开
├── 01.html ... 28.html           # 稳定的章节入口
├── courses.json                  # 分类、标签、难度、前置知识和学习目标
├── courses-data.js               # 由 courses.json 生成的离线目录
├── theme.css                     # 旧章节的兼容样式（迁移完成后逐步收敛）
├── assets/
│   ├── css/article.css           # 新版文章统一设计系统
│   ├── js/interactions.js        # 可访问的交互增强（含第 21 章离线实验）
│   └── diagrams/                 # 按章节命名的原创 SVG
├── examples/                     # 第27章最小 RAG 教学代码和非敏感示例文档
├── evidence/                     # 每章关键技术主张的来源记录
├── docs/                         # 扩展阅读与专题技术笔记
├── skills/vllm-tutorial/          # 适配本课程的写作与审校 Skill
├── scripts/
│   └── build_course_data.py
└── tests/
    └── offline-catalog.test.cjs
```

章节仍使用根目录的 `01.html` 至 `28.html`，是为了保持本地双击打开和既有链接稳定。共享 CSS、交互脚本、SVG 和证据记录则集中管理，避免每篇文章重复实现。

## 本地阅读与开发

阅读课程不需要安装 Python、Node.js 或 GPU 环境。直接打开：

```bash
open index.html
```

修改课程元数据后，重新生成并校验离线目录：

```bash
python3 scripts/build_course_data.py
python3 scripts/build_course_data.py --check
node --test tests/offline-catalog.test.cjs
python3 scripts/validate_articles.py
python3 -m unittest discover -s tests -p 'test_rag_demo.py' -v
```

如果需要运行代码示例，请按对应章节说明准备 Python、PyTorch、CUDA、模型权重和 vLLM 版本。HTML 阅读本身不依赖这些运行环境。

## 内容升级进度

仓库采用逐章审校，不以一次性换肤代替内容改造。当前主课程升级已经完成全部 01–28 章的技术核验、原创 SVG、语义 HTML 和证据记录；08 章提供 KV Cache 容量计算器，11 章提供 Chunked Prefill 预算实验，14 章提供 Sampling 分布实验。15–18 章覆盖生产部署、Kubernetes、可观测性与安全；19–23 章覆盖 TP/PP/DP/EP、推测解码、多模态和 nano-vLLM 源码阅读，21 章提供推测接受率交互实验。24–28 章进一步补齐排障流程、Benchmark、技术成熟度、可运行 RAG 示例与知识图谱。静态 CI 通过不等于浏览器跨设备 QA、GPU Benchmark 或 Pages 部署已完成，这些状态会单独记录。

## 权威参考入口

- [vLLM 官方文档](https://docs.vllm.ai/en/latest/)
- [vLLM 官方 GitHub 仓库](https://github.com/vllm-project/vllm)
- [PagedAttention 原始论文（SOSP 2023）](https://arxiv.org/abs/2309.06180)
- [vLLM 架构概览](https://docs.vllm.ai/en/latest/design/arch_overview/)
- [Paged Attention 设计文档](https://docs.vllm.ai/en/latest/design/paged_attention/)
- [Automatic Prefix Caching 设计文档](https://docs.vllm.ai/en/latest/design/prefix_caching/)

## 维护约定

- 先读 [AGENTS.md](AGENTS.md)，再按 [Skill](skills/vllm-tutorial/SKILL.md) 修改。
- 每次聚焦一章或一个清晰专题；避免未经核验的全局替换。
- 关键事实写入 `evidence/NN.json`，区分官方行为、论文结果、推导、教学示例和建议。
- 修改章节标题、分类、前置知识或链接时同步更新 `courses.json` 并重新生成 `courses-data.js`。
- PR 描述应列出实际修改的章节、已执行检查和未执行检查；不虚报浏览器 QA 或 Pages 部署状态。


## Publishing and quality gates

The canonical GitHub Pages release target is:

- `https://1998x-stack.github.io/vllm-tutorial/`

Pull requests run the offline catalog checks, static article validation, and Chromium QA for chapters 01–28 at 1440px, 768px, 390px, and 360px. The browser gate checks page errors, console errors, local asset responses, in-page anchors, diagram visibility, and page-level horizontal overflow. It also exercises the KV Cache calculator (chapter 08), Chunked Prefill budget explorer (chapter 11), and Sampling explorer (chapter 14), and Speculative Decoding acceptance lab (chapter 21), and Benchmark arithmetic lab (chapter 25), including keyboard input.

A push to `master` publishes the static course through GitHub Pages and then verifies the public index, representative chapters, course data, stylesheets, diagrams, and interactive scripts. A successful pull-request check is not a deployment result; the Pages job must also complete.

**PDF is not a release artifact for this repository.** The supported deliverable is the offline-first HTML course with local CSS, JavaScript, and SVG assets. PDF export and PDF visual QA are intentionally out of scope unless a future course requirement adds them.


## 最终课程交付说明

- 28 篇稳定 HTML，原创章节 SVG，28 份 `evidence/NN.json` 审核资料，以及 `courses.json` 与生成目录同步。
- 第 08 / 11 / 14 / 21 / 25 章带纯本地交互实验；本地双击阅读不依赖服务器或 CDN。
- 第 27 章标准库 RAG 教学样例：`python3 examples/rag_demo.py --query "Prefix Cache"`。只执行公开教学数据检索，不假装已调用模型；可选通过 `--serve-url http://127.0.0.1:8000 --model MODEL_ID` 访问明确授权的本地 vLLM。
- 对 RAG 文档 ACL、媒体与工具信任边界、模拟统计与性能真值保持明确区分。教学检索算法不代表生产级向量检索。
- 完整发布以 PR 静态/浏览器门禁、合并后的主分支 Pages Workflow 和公共资源逐项字节校验为准；未开展 GPU Benchmark 不可宣称具体加速结果。
