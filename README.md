# vLLM 技术知识库

**从 LLM 推理原理到 vLLM 生产实践：面向大学生、研究生与推理工程初学者的可验证技术教程。**

本仓库将原有 28 章课程整理为按主题组织的文章库。每篇文章独立维护 HTML、原创 SVG 图解与 `evidence.json`；共享的叙事、页面、交互和 QA 规范沉淀在 [Olah-style vLLM Skill](skills/olah-style-vllm-posts/SKILL.md)。

## 阅读入口

- [课程首页](index.html)：支持关键词搜索、模块筛选和分页，离线可用。
- [章节目录](courses.json)：课程元数据的唯一来源。
- [Agent 规则](AGENTS.md)：逐篇阅读、研究、改造和验收约束。

## 七个知识模块

| 模块 | 内容 |
|---|---|
| 基础原理 | LLM 推理基础、vLLM 概述 |
| 核心机制 | PagedAttention、Continuous Batching、KV Cache、Prefix Caching、Scheduler、Chunked Prefill |
| 入门实践 | 安装、模型加载、Sampling 与 Structured Outputs |
| 架构设计 | V1 进程架构、V0 → V1 行为变化 |
| 生产运维 | Docker、Kubernetes、指标、安全、排障、基准测试 |
| 进阶专题 | TP / PP / DP / EP、推测解码、多模态、nano-vLLM 源码 |
| 实战项目 | RAG 推理服务、学习路线 |

## 仓库结构

```text
.
├── index.html                  # 离线课程目录
├── courses.json                # 唯一课程元数据
├── courses-data.js             # 生成的目录投影
├── data/article-manifest.json  # 文章生成与证据元数据
├── posts/<category>/<chapter>/ # 每篇文章、SVG 与 evidence.json
├── skills/olah-style-vllm-posts/
├── assets/css/site.css
├── assets/js/catalog.js
├── docs/
├── scripts/
└── tests/
```

根目录的 `01.html`–`28.html` 保留为兼容入口，自动跳转到新文章地址；后续新文章只在 `posts/` 中维护。

## 本地阅读

无需安装依赖，直接用浏览器打开 `index.html`。目录通过本地 `courses-data.js` 读取元数据，不依赖 `fetch(file://)`、CDN 或远程字体。

## 维护与验收

先阅读 [SKILL.md](skills/olah-style-vllm-posts/SKILL.md) 和 [AGENTS.md](AGENTS.md)。新文章必须包含语义化 HTML、原创 SVG、参考资料和相邻的 `evidence.json`；命令、API、默认值和指标要记录 vLLM release / commit 与核验日期。

```bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
python scripts/build_course_data.py --check
node --test tests/offline-catalog.test.cjs
python -m pytest -q
python skills/olah-style-vllm-posts/scripts/validate.py --all
```

vLLM 的进程架构、参数、默认值、指标、模型支持与多模态能力持续演进。首轮内容于 2026-11-20 对照官方文档与源码校准；生产使用前请核对实际安装版本。没有原始测试环境和结果文件的性能表不作为事实保留。
