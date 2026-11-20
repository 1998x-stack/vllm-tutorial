/* Generated from courses.json. */
window.VLLM_COURSES = {
  "title": "vLLM 技术知识库",
  "subtitle": "从 LLM 推理原理到 vLLM 生产实践",
  "description": "以可验证的技术解释、原创 SVG 图解和小型交互实验，逐步理解 vLLM 的核心机制与工程边界。",
  "chapterCount": 28,
  "categories": [
    {
      "id": "fundamentals",
      "title": "基础原理",
      "description": "从生成过程与系统目标开始，建立共同语言。",
      "chapterCount": 2
    },
    {
      "id": "core-mechanisms",
      "title": "核心机制",
      "description": "理解缓存、分页、调度和批处理的工作方式。",
      "chapterCount": 7
    },
    {
      "id": "getting-started",
      "title": "入门实践",
      "description": "把模型加载、服务启动和生成控制跑起来。",
      "chapterCount": 3
    },
    {
      "id": "architecture",
      "title": "架构设计",
      "description": "理解 V1 进程边界、API 变化与迁移。",
      "chapterCount": 2
    },
    {
      "id": "production",
      "title": "生产运维",
      "description": "覆盖部署、安全、监控、排障和基准测试。",
      "chapterCount": 6
    },
    {
      "id": "advanced",
      "title": "进阶专题",
      "description": "深入并行、多模态、推测解码和源码。",
      "chapterCount": 6
    },
    {
      "id": "projects",
      "title": "实战项目",
      "description": "将原理组织成端到端的学习和实践路径。",
      "chapterCount": 2
    }
  ],
  "chapters": [
    {
      "num": "01",
      "title": "LLM 推理基础",
      "category": "fundamentals",
      "categoryLabel": "基础原理",
      "slug": "llm-inference-basics",
      "summary": "从自回归生成、Prefill/Decode 与 KV Cache，建立理解推理引擎的共同语言。",
      "topics": [
        "自回归生成",
        "Prefill 与 Decode",
        "KV Cache",
        "显存估算"
      ],
      "level": "基础",
      "readingTime": 12,
      "file": "posts/fundamentals/01-llm-inference-basics/index.html",
      "legacyFile": "01.html",
      "tags": [
        "自回归生成",
        "Prefill 与 Decode",
        "KV Cache",
        "显存估算"
      ]
    },
    {
      "num": "02",
      "title": "vLLM 概述",
      "category": "fundamentals",
      "categoryLabel": "基础原理",
      "slug": "vllm-overview",
      "summary": "理解 vLLM 要解决的服务问题，以及调度、KV Cache 与在线服务之间的关系。",
      "topics": [
        "项目背景",
        "核心机制",
        "在线服务",
        "适用边界"
      ],
      "level": "基础",
      "readingTime": 10,
      "file": "posts/fundamentals/02-vllm-overview/index.html",
      "legacyFile": "02.html",
      "tags": [
        "项目背景",
        "核心机制",
        "在线服务",
        "适用边界"
      ]
    },
    {
      "num": "03",
      "title": "PagedAttention 上篇：虚拟内存与 Block Table",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "pagedattention-memory-management",
      "summary": "用操作系统分页作类比，理解逻辑 token 如何映射到非连续的物理 KV Cache blocks。",
      "topics": [
        "KV Cache 碎片",
        "分页思想",
        "Block Table",
        "按需分配"
      ],
      "level": "进阶",
      "readingTime": 16,
      "file": "posts/core-mechanisms/03-pagedattention-memory-management/index.html",
      "legacyFile": "03.html",
      "tags": [
        "KV Cache 碎片",
        "分页思想",
        "Block Table",
        "按需分配"
      ]
    },
    {
      "num": "04",
      "title": "PagedAttention 下篇：Slot Mapping 与共享",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "pagedattention-kernel-mechanics",
      "summary": "继续追踪 KV Cache 写入与读取路径，区分 Block Table、slot mapping 和前缀块共享。",
      "topics": [
        "Slot Mapping",
        "KV 写入路径",
        "Prefix Block Sharing",
        "Block Size"
      ],
      "level": "进阶",
      "readingTime": 15,
      "file": "posts/core-mechanisms/04-pagedattention-kernel-mechanics/index.html",
      "legacyFile": "04.html",
      "tags": [
        "Slot Mapping",
        "KV 写入路径",
        "Prefix Block Sharing",
        "Block Size"
      ]
    },
    {
      "num": "05",
      "title": "Continuous Batching：迭代级动态批处理",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "continuous-batching",
      "summary": "理解请求完成后如何释放资源并接纳新请求，以及调度粒度如何影响吞吐与延迟。",
      "topics": [
        "静态批处理",
        "Iteration-level Scheduling",
        "请求生命周期",
        "吞吐与延迟"
      ],
      "level": "进阶",
      "readingTime": 13,
      "file": "posts/core-mechanisms/05-continuous-batching/index.html",
      "legacyFile": "05.html",
      "tags": [
        "静态批处理",
        "Iteration-level Scheduling",
        "请求生命周期",
        "吞吐与延迟"
      ]
    },
    {
      "num": "06",
      "title": "快速上手：安装、离线推理与在线服务",
      "category": "getting-started",
      "categoryLabel": "入门实践",
      "slug": "install-and-serve",
      "summary": "从环境检查到启动 vLLM 服务，建立一条可复现的最小运行路径。",
      "topics": [
        "环境检查",
        "安装",
        "LLM Python API",
        "OpenAI 兼容 API"
      ],
      "level": "基础",
      "readingTime": 14,
      "file": "posts/getting-started/06-install-and-serve/index.html",
      "legacyFile": "06.html",
      "tags": [
        "环境检查",
        "安装",
        "LLM Python API",
        "OpenAI 兼容 API"
      ]
    },
    {
      "num": "07",
      "title": "模型加载与配置",
      "category": "getting-started",
      "categoryLabel": "入门实践",
      "slug": "model-loading-configuration",
      "summary": "理解模型来源、权重格式、显存预算和常见启动参数之间的关系。",
      "topics": [
        "模型来源",
        "显存预算",
        "量化格式",
        "模型下载与认证"
      ],
      "level": "基础",
      "readingTime": 13,
      "file": "posts/getting-started/07-model-loading-configuration/index.html",
      "legacyFile": "07.html",
      "tags": [
        "模型来源",
        "显存预算",
        "量化格式",
        "模型下载与认证"
      ]
    },
    {
      "num": "08",
      "title": "KV Cache 管理与容量估算",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "kv-cache-management",
      "summary": "从模型层数、KV heads、head dimension 和数据类型估算每 token 的缓存开销。",
      "topics": [
        "KV Cache 公式",
        "GQA 与 MQA",
        "Block Pool",
        "KV Cache dtype"
      ],
      "level": "进阶",
      "readingTime": 16,
      "file": "posts/core-mechanisms/08-kv-cache-management/index.html",
      "legacyFile": "08.html",
      "tags": [
        "KV Cache 公式",
        "GQA 与 MQA",
        "Block Pool",
        "KV Cache dtype"
      ]
    },
    {
      "num": "09",
      "title": "Automatic Prefix Caching：自动前缀缓存",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "automatic-prefix-caching",
      "summary": "理解共享前缀如何复用 KV Cache，以及缓存命中受 token 前缀、块边界和路由影响的原因。",
      "topics": [
        "共享前缀",
        "Cache Hit",
        "Hash 与 Block Boundary",
        "适用场景"
      ],
      "level": "进阶",
      "readingTime": 14,
      "file": "posts/core-mechanisms/09-automatic-prefix-caching/index.html",
      "legacyFile": "09.html",
      "tags": [
        "共享前缀",
        "Cache Hit",
        "Hash 与 Block Boundary",
        "适用场景"
      ]
    },
    {
      "num": "10",
      "title": "Scheduler：请求如何进入下一轮计算",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "scheduler",
      "summary": "拆解 waiting、running、finished 请求状态，以及 FCFS、priority 和资源抢占的边界。",
      "topics": [
        "请求状态",
        "FCFS",
        "Priority",
        "Preemption"
      ],
      "level": "进阶",
      "readingTime": 14,
      "file": "posts/core-mechanisms/10-scheduler/index.html",
      "legacyFile": "10.html",
      "tags": [
        "请求状态",
        "FCFS",
        "Priority",
        "Preemption"
      ]
    },
    {
      "num": "11",
      "title": "Chunked Prefill：长 Prompt 的分块调度",
      "category": "core-mechanisms",
      "categoryLabel": "核心机制",
      "slug": "chunked-prefill",
      "summary": "理解长 Prompt 为什么会影响其他请求的 decode，以及 token budget 如何把 prefill 拆成多个调度步骤。",
      "topics": [
        "长 Prompt",
        "Token Budget",
        "Decode Interference",
        "配置权衡"
      ],
      "level": "进阶",
      "readingTime": 13,
      "file": "posts/core-mechanisms/11-chunked-prefill/index.html",
      "legacyFile": "11.html",
      "tags": [
        "长 Prompt",
        "Token Budget",
        "Decode Interference",
        "配置权衡"
      ]
    },
    {
      "num": "12",
      "title": "V1 架构：API Server、Engine Core 与 GPU Workers",
      "category": "architecture",
      "categoryLabel": "架构设计",
      "slug": "vllm-v1-architecture",
      "summary": "以当前官方进程架构为准，梳理 API Server、Engine Core、GPU Worker 和 DP Coordinator 的职责。",
      "topics": [
        "API Server",
        "Engine Core",
        "GPU Worker",
        "DP Coordinator"
      ],
      "level": "进阶",
      "readingTime": 16,
      "file": "posts/architecture/12-vllm-v1-architecture/index.html",
      "legacyFile": "12.html",
      "tags": [
        "API Server",
        "Engine Core",
        "GPU Worker",
        "DP Coordinator"
      ]
    },
    {
      "num": "13",
      "title": "V1 行为变化与迁移检查",
      "category": "architecture",
      "categoryLabel": "架构设计",
      "slug": "vllm-v1-migration",
      "summary": "聚焦 V0 到 V1 的 API 与行为差异，建立升级前必须逐项验证的清单。",
      "topics": [
        "V0 弃用",
        "Sampling 差异",
        "Logprobs",
        "Removed Features"
      ],
      "level": "进阶",
      "readingTime": 12,
      "file": "posts/architecture/13-vllm-v1-migration/index.html",
      "legacyFile": "13.html",
      "tags": [
        "V0 弃用",
        "Sampling 差异",
        "Logprobs",
        "Removed Features"
      ]
    },
    {
      "num": "14",
      "title": "Sampling 与结构化生成控制",
      "category": "getting-started",
      "categoryLabel": "入门实践",
      "slug": "sampling-and-structured-output",
      "summary": "理解 temperature、top-p、停止条件、logprobs 和 Structured Outputs 的实际作用。",
      "topics": [
        "Temperature",
        "Top-p / Top-k",
        "Logprobs",
        "Structured Outputs"
      ],
      "level": "进阶",
      "readingTime": 13,
      "file": "posts/getting-started/14-sampling-and-structured-output/index.html",
      "legacyFile": "14.html",
      "tags": [
        "Temperature",
        "Top-p / Top-k",
        "Logprobs",
        "Structured Outputs"
      ]
    },
    {
      "num": "15",
      "title": "生产级部署：容器、资源与高可用",
      "category": "production",
      "categoryLabel": "生产运维",
      "slug": "production-deployment",
      "summary": "把模型服务放入生产环境时，如何处理镜像版本、资源规划、网络入口与故障恢复。",
      "topics": [
        "Docker",
        "GPU Memory Planning",
        "Reverse Proxy",
        "Health Checks"
      ],
      "level": "进阶",
      "readingTime": 15,
      "file": "posts/production/15-production-deployment/index.html",
      "legacyFile": "15.html",
      "tags": [
        "Docker",
        "GPU Memory Planning",
        "Reverse Proxy",
        "Health Checks"
      ]
    },
    {
      "num": "16",
      "title": "Kubernetes 与 vLLM Production Stack",
      "category": "production",
      "categoryLabel": "生产运维",
      "slug": "kubernetes-production-stack",
      "summary": "认识官方 Production Stack 的 Serving Engine、Router、Helm 部署和可观测组件。",
      "topics": [
        "Helm Chart",
        "Serving Engine",
        "Router",
        "Prometheus / Grafana"
      ],
      "level": "进阶",
      "readingTime": 16,
      "file": "posts/production/16-kubernetes-production-stack/index.html",
      "legacyFile": "16.html",
      "tags": [
        "Helm Chart",
        "Serving Engine",
        "Router",
        "Prometheus / Grafana"
      ]
    },
    {
      "num": "17",
      "title": "可观测性：指标、日志与告警",
      "category": "production",
      "categoryLabel": "生产运维",
      "slug": "observability-metrics",
      "summary": "从服务延迟、请求队列、KV Cache 与 GPU 资源出发，建立可解释的监控体系。",
      "topics": [
        "/metrics",
        "TTFT / TPOT",
        "KV Cache",
        "Alerting"
      ],
      "level": "进阶",
      "readingTime": 14,
      "file": "posts/production/17-observability-metrics/index.html",
      "legacyFile": "17.html",
      "tags": [
        "/metrics",
        "TTFT / TPOT",
        "KV Cache",
        "Alerting"
      ]
    },
    {
      "num": "18",
      "title": "安全与访问控制",
      "category": "production",
      "categoryLabel": "生产运维",
      "slug": "security-access-control",
      "summary": "区分推理引擎、API Gateway 与业务应用的安全职责，避免把模型服务直接暴露给不可信流量。",
      "topics": [
        "API Key",
        "TLS",
        "Rate Limiting",
        "Prompt Injection"
      ],
      "level": "进阶",
      "readingTime": 13,
      "file": "posts/production/18-security-access-control/index.html",
      "legacyFile": "18.html",
      "tags": [
        "API Key",
        "TLS",
        "Rate Limiting",
        "Prompt Injection"
      ]
    },
    {
      "num": "19",
      "title": "张量并行：把单层计算分布到多张 GPU",
      "category": "advanced",
      "categoryLabel": "进阶专题",
      "slug": "tensor-parallelism",
      "summary": "理解 Tensor Parallel 如何切分权重与计算，以及通信拓扑为何决定实际性能。",
      "topics": [
        "Column / Row Parallel",
        "All-Reduce",
        "NCCL",
        "NVLink / PCIe"
      ],
      "level": "高级",
      "readingTime": 16,
      "file": "posts/advanced/19-tensor-parallelism/index.html",
      "legacyFile": "19.html",
      "tags": [
        "Column / Row Parallel",
        "All-Reduce",
        "NCCL",
        "NVLink / PCIe"
      ]
    },
    {
      "num": "20",
      "title": "流水线并行、数据并行与专家并行",
      "category": "advanced",
      "categoryLabel": "进阶专题",
      "slug": "pipeline-data-parallelism",
      "summary": "比较 TP、PP、DP 与 EP 的切分对象、通信方式和适用条件。",
      "topics": [
        "Pipeline Parallel",
        "Data Parallel",
        "Expert Parallel",
        "Hybrid Layout"
      ],
      "level": "高级",
      "readingTime": 16,
      "file": "posts/advanced/20-pipeline-data-parallelism/index.html",
      "legacyFile": "20.html",
      "tags": [
        "Pipeline Parallel",
        "Data Parallel",
        "Expert Parallel",
        "Hybrid Layout"
      ]
    },
    {
      "num": "21",
      "title": "推测解码：用验证换取更少的串行步数",
      "category": "advanced",
      "categoryLabel": "进阶专题",
      "slug": "speculative-decoding",
      "summary": "理解 draft 与 target 的协作机制，以及不同 speculative 方法在不同负载下的权衡。",
      "topics": [
        "Draft / Target",
        "Acceptance Rate",
        "N-gram",
        "EAGLE / MTP"
      ],
      "level": "高级",
      "readingTime": 16,
      "file": "posts/advanced/21-speculative-decoding/index.html",
      "legacyFile": "21.html",
      "tags": [
        "Draft / Target",
        "Acceptance Rate",
        "N-gram",
        "EAGLE / MTP"
      ]
    },
    {
      "num": "22",
      "title": "多模态推理：图像、视频与音频输入",
      "category": "advanced",
      "categoryLabel": "进阶专题",
      "slug": "multimodal-inference",
      "summary": "理解多模态输入如何进入模型的处理链路，以及模型、预处理和资源限制为何必须一起核验。",
      "topics": [
        "Vision Encoder",
        "Multimodal Tokens",
        "Video / Audio",
        "Model Support"
      ],
      "level": "高级",
      "readingTime": 15,
      "file": "posts/advanced/22-multimodal-inference/index.html",
      "legacyFile": "22.html",
      "tags": [
        "Vision Encoder",
        "Multimodal Tokens",
        "Video / Audio",
        "Model Support"
      ]
    },
    {
      "num": "23",
      "title": "nano-vLLM 源码剖析：构建最小推理引擎",
      "category": "advanced",
      "categoryLabel": "进阶专题",
      "slug": "nano-vllm-source-walkthrough",
      "summary": "通过独立的小型实现观察请求状态、调度、KV Cache 和模型执行之间的关系。",
      "topics": [
        "LLM Engine",
        "Scheduler",
        "Block Table",
        "Triton Kernel"
      ],
      "level": "高级",
      "readingTime": 18,
      "file": "posts/advanced/23-nano-vllm-source-walkthrough/index.html",
      "legacyFile": "23.html",
      "tags": [
        "LLM Engine",
        "Scheduler",
        "Block Table",
        "Triton Kernel"
      ]
    },
    {
      "num": "24",
      "title": "调试与问题排查",
      "category": "production",
      "categoryLabel": "生产运维",
      "slug": "debugging-troubleshooting",
      "summary": "按症状建立排查顺序：先确认资源与版本，再定位模型加载、通信、缓存和请求路径。",
      "topics": [
        "CUDA OOM",
        "NCCL",
        "Model Loading",
        "Performance Regression"
      ],
      "level": "进阶",
      "readingTime": 14,
      "file": "posts/production/24-debugging-troubleshooting/index.html",
      "legacyFile": "24.html",
      "tags": [
        "CUDA OOM",
        "NCCL",
        "Model Loading",
        "Performance Regression"
      ]
    },
    {
      "num": "25",
      "title": "性能基准测试：建立可复现的测量",
      "category": "production",
      "categoryLabel": "生产运维",
      "slug": "benchmarking",
      "summary": "用固定模型、硬件、请求分布和指标定义建立基线，避免把不同负载下的数字直接比较。",
      "topics": [
        "Throughput",
        "TTFT / TPOT",
        "vllm bench",
        "GuideLLM"
      ],
      "level": "进阶",
      "readingTime": 16,
      "file": "posts/production/25-benchmarking/index.html",
      "legacyFile": "25.html",
      "tags": [
        "Throughput",
        "TTFT / TPOT",
        "vllm bench",
        "GuideLLM"
      ]
    },
    {
      "num": "26",
      "title": "技术趋势与持续跟进方法",
      "category": "advanced",
      "categoryLabel": "进阶专题",
      "slug": "roadmap-and-trends",
      "summary": "把论文、RFC、发布说明和代码变化分层阅读，区分已经发布的能力与仍在讨论的方向。",
      "topics": [
        "Release Notes",
        "RFC",
        "Research Papers",
        "Feature Maturity"
      ],
      "level": "进阶",
      "readingTime": 10,
      "file": "posts/advanced/26-roadmap-and-trends/index.html",
      "legacyFile": "26.html",
      "tags": [
        "Release Notes",
        "RFC",
        "Research Papers",
        "Feature Maturity"
      ]
    },
    {
      "num": "27",
      "title": "实战项目：搭建带缓存意识的 RAG 推理服务",
      "category": "projects",
      "categoryLabel": "实战项目",
      "slug": "rag-inference-service",
      "summary": "串联检索、Prompt 构造、vLLM 服务与引用返回，并正确安排可复用的静态前缀。",
      "topics": [
        "Embedding",
        "Vector Search",
        "Prompt Layout",
        "Prefix Cache"
      ],
      "level": "高级",
      "readingTime": 20,
      "file": "posts/projects/27-rag-inference-service/index.html",
      "legacyFile": "27.html",
      "tags": [
        "Embedding",
        "Vector Search",
        "Prompt Layout",
        "Prefix Cache"
      ]
    },
    {
      "num": "28",
      "title": "课程总结与进阶学习路线",
      "category": "projects",
      "categoryLabel": "实战项目",
      "slug": "learning-roadmap",
      "summary": "把核心机制串成知识图谱，并给出从原理、源码到生产验证的后续学习顺序。",
      "topics": [
        "知识图谱",
        "核心概念",
        "源码路线",
        "进阶资源"
      ],
      "level": "基础",
      "readingTime": 9,
      "file": "posts/projects/28-learning-roadmap/index.html",
      "legacyFile": "28.html",
      "tags": [
        "知识图谱",
        "核心概念",
        "源码路线",
        "进阶资源"
      ]
    }
  ]
};
