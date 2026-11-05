# 🧠 vLLM 大模型推理引擎 · 从入门到精通

> 📘 28章 实战体系 · 交互式 HTML 课程

> **English TL;DR:** A 28-chapter, all-Chinese hands-on course on **vLLM**, the high-throughput LLM inference engine. From first principles (autoregressive decode, prefill vs decode, KV cache) through vLLM's core innovations — PagedAttention (virtual-memory blocks), Continuous Batching, chunked prefilling, prefix caching, the V1 architecture — to parallelism (TP/PP/DP), speculative decoding, multimodal, production/K8s deployment, observability, and a nano-vLLM source walkthrough. `nano-vLLM` in ch.23 (1,200 lines). HTML-visualized, zero-install.

## 📖 课程简介

本课程从**推理基础**讲到大模型推理引擎 vLLM 的核心机制与生产落地：理解 Prefill vs Decode、KV Cache、显存模型，再到 vLLM 的看家本领——**PagedAttention**（把 KV 缓存按块管理，逼近零碎片）、**Continuous Batching** 与 **Chunked Prefill**（填满 GPU、降延迟）、**Prefix Caching**，深入 V0/V1 两代调度器架构。后半程覆盖张量/流水线/数据并行、推测解码、多模态、K8s 部署、可观测性与排障，并以 23 章的 **nano-vLLM 源码剖析**（约 1200 行）收束原理到工程。

## 🎯 主线横幅

```
推理基础 → vLLM 核心(PA/批处理/调度) → 并行/推测/多模态 → 生产部署 → nano-vLLM 源码
```

## 🚀 快速开始

无需安装任何依赖，直接用浏览器打开 `index.html` 即可在线阅读全部章节：

```bash
open index.html   # macOS；无需启动 HTTP 服务器
# 或在浏览器中直接打开 index.html
```

## 📖 章节目录

| # | 章节 | 核心主题 |
|---|------|----------|
| 01 | LLM推理基础 | 自回归生成、Prefill vs Decode、KV Cache原理、显存估算 |
| 02 | vLLM概述 | 发展历程、核心创新、竞品对比、适用场景 |
| 03 | PagedAttention上篇 | 虚拟内存类比、Block Table、按需分配、Free Block Pool |
| 04 | PagedAttention下篇 | Slot Mapping、Copy-on-Write、Block Size权衡、Flash Attn配合 |
| 05 | Continuous Batching | 静态vs动态批处理、Chunked Prefill、调度粒度、性能对比 |
| 06 | 快速上手 | 安装环境、离线推理、在线API服务、Docker部署 |
| 07 | 模型加载与配置 | 模型来源、量化加载、显存参数、常见踩坑 |
| 08 | KV Cache管理 | 显存估算、Free Block Pool、FP8量化、分层存储 |
| 09 | Prefix Caching | 零开销实现、命中率分析、RAG场景收益、前缀感知路由 |
| 10 | 调度器详解 | FCFS、Priority优先级、Preemption抢占、统一调度器 |
| 11 | Chunked Prefill | 长Prompt处理、吞吐延迟平衡、Chunk Size选择 |
| 12 | V1架构上篇 | 1+N多进程、EngineCore、ZeroMQ总线、故障隔离 |
| 13 | V1架构下篇 | V0 vs V1、兼容性变化、特性成熟度、迁移指南 |
| 14 | Sampling | 采样参数全解、Temperature、结构化输出、Logprobs |
| 15 | 生产级部署 | Docker、显存规划、反向代理、高可用 |
| 16 | Kubernetes部署 | Production Stack、Helm、前缀感知路由、GPU资源 |
| 17 | 可观测性 | 三层监控、Prometheus、Grafana告警、链路追踪 |
| 18 | 安全与访问控制 | API鉴权、Rate Limiting、注入防护、网络安全 |
| 19 | 张量并行 | Megatron-LM、NCCL通信、NVLINK vs PCIe、性能分析 |
| 20 | 流水线与数据并行 | 按层切分、跨节点PP、DP吞吐、MoE并行 |
| 21 | 推测解码 | n-gram、EAGLE、Medusa、Gen-Edge |
| 22 | 多模态推理 | ViT编码器、视觉问答、CUDA Graph加速、LoRA适配 |
| 23 | nano-vLLM源码剖析 | 1200行架构、Engine/Scheduler、ModelRunner、Triton Kernel |
| 24 | 调试与问题排查 | CUDA OOM、NCCL调试、性能退化、错误速查 |
| 25 | 性能基准测试 | 吞吐/延迟测试、压测工具、Benchmark数据、调优Checklist |
| 26 | 未来趋势 | Gen-Edge、Model Runner V2、智能路由、竞品 |
| 27 | 实战项目 | RAG推理服务、端到端搭建、Prefix Cache优化、性能迭代 |
| 28 | 课程总结 | 知识图谱、核心要点、进阶路径、推荐资源 |

## 📂 项目结构

```text
vllm-tutorial/
├── index.html      # 课程主入口
├── 01.html ~ 28.html   # 章节正文
├── courses.json    # 课程元数据
└── theme.css       # 统一主题
```

## 🎯 前置知识与适合人群

- 适合：LLM 推理工程师 / 平台工程师 / 对高效推理好奇的研究者
- 建议具备：Python 基础 + Transformer / KV Cache 基本概念；无需 GPU（纯 HTML 讲解）

## ✨ 课程特色

- **原理 → 源码**：从 PagedAttention 到 nano-vLLM 千行源码逐步拆解
- **两代调度器对比**：V0 vs V1 架构更迭清晰
- **生产向完整覆盖**：部署 / K8s / 可观测 / 安全 / 排障
- **即开即用**：纯静态 HTML，无构建、无服务器

---
*本课程由 `vllm-tutorial/` 项目维护。*

修改 `courses.json` 后请运行 `python3 scripts/build_course_data.py` 更新离线目录，并使用 `python3 scripts/build_course_data.py --check` 检查同步。回归测试：`node --test tests/offline-catalog.test.cjs`（Node.js 18+）。
