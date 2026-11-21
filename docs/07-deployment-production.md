# vLLM 部署与生产实践（维护索引）

本文件早期版本包含未经当前版本核验的参数建议、性能目标与案例数字。为避免旧配置继续误导读者，旧版内容已由新版课程章节取代；不要从历史副本复制固定的 GPU 利用率、KV Cache 比例、延迟目标、量化压缩率或吞吐提升承诺。

## 当前学习入口

1. [第 15 章：Production Deployment](../15.html) — 容器镜像与模型版本固定、容量预算、Gateway / Router / Replica、流式响应、健康检查、发布和故障恢复。
2. [第 16 章：Kubernetes GPU Serving](../16.html) — Device Plugin、GPU extended resources、Pod 探针、RollingUpdate、PDB 与 vLLM Production Stack。
3. [第 17 章：Observability](../17.html) — TTFT、ITL、TPOT、Queue Time、KV Cache、Prometheus Histogram、PromQL 与 OpenTelemetry。
4. [第 18 章：Security & Multi-tenancy](../18.html) — API Key 覆盖范围、未受保护端点、网络隔离、共享进程缓存风险、cache_salt 与应用授权。

## 生产设计原则

- 固定经过测试的 vLLM 镜像版本与 digest、模型 revision、Tokenizer revision 和运行配置。
- 根据真实模型、GPU、请求长度与并发分布测量权重、运行时与 KV Cache 的显存预算。
- 不将 vLLM API Server 直接暴露到不可信网络；使用 Gateway / Reverse Proxy 实施 TLS、认证、配额与 endpoint allowlist。
- 区分启动、就绪和存活探针；将 Kubernetes Deployment rollout 与 PodDisruptionBudget 分开设计。
- 用 vLLM 当前版本实际暴露的指标建立 Dashboard，不复制历史版本指标名或无依据的 SLO 阈值。
- 对共享进程的多租户场景，明确调度器和缓存共享风险；cache_salt 不是完整隔离边界。

## 权威参考

- [vLLM Docker](https://docs.vllm.ai/en/latest/deployment/docker/)
- [vLLM Production Metrics](https://docs.vllm.ai/en/latest/usage/metrics/)
- [vLLM Security](https://docs.vllm.ai/en/latest/usage/security/)
- [Kubernetes GPU Scheduling](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/)
- [Kubernetes Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
- [vLLM Production Stack](https://docs.vllm.ai/projects/production-stack/en/latest/)
