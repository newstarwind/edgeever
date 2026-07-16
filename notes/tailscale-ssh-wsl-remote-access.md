# Tailscale + SSH 远程访问 WSL 配置指南

> 整理时间：2025-07-17

---

## 目录

1. [确认 Tailscale 网络](#1-确认-tailscale-网络)
2. [确认 WSL 中 SSH 运行状态](#2-确认-wsl-中-ssh-运行状态)
3. [确认 WSL 的 Tailscale IP 情况](#3-确认-wsl-的-tailscale-ip-情况)
4. [推荐方案：SSH → Windows → WSL](#4-推荐方案ssh--windows--wsl)
5. [高级方案：SSH 直入 WSL](#5-高级方案ssh-直入-wsl)
6. [测试与排查](#6-测试与排查)

---

## 1. 确认 Tailscale 网络

在家里的电脑执行以下命令，验证 Tailscale 节点互通：

```bash
tailscale status
```

预期输出示例：

```
100.x.x.x   office-pc
100.x.x.x   home-pc
```

或直接 Ping 测试：

```bash
ping office-pc
```

能 Ping 通则网络正常。

---

## 2. 确认 WSL 中 SSH 运行状态

在办公室的 WSL 中检查 SSH 服务：

```bash
sudo service ssh status
```

预期输出：

```
Active: active (running)
```

如未运行，手动启动：

```bash
sudo service ssh start
```

---

## 3. 确认 WSL 的 Tailscale IP 情况

| 情况 | 说明 | 能否直接 SSH 到 WSL |
|------|------|-------------------|
| **A** — Tailscale 装在 Windows（最常见） | Tailscale 只能看到 Windows 节点，看不到 WSL | ❌ 不可直接 SSH 到 WSL |
| **B** — Tailscale 也装在 WSL | Tailscale 能看到 WSL 独立 IP | ✅ `ssh user@100.x.x.x` 直入 WSL |

> 一般情况下无需在 WSL 内再装 Tailscale，情况 A 已满足需求。

---

## 4. 推荐方案：SSH → Windows → WSL

家里电脑执行：

```bash
ssh david@office-pc
```

登录的是 **Windows**，然后进入 WSL：

```powershell
wsl
```

立即进入 Ubuntu。微软官方推荐此方式。

---

## 5. 高级方案：SSH 直入 WSL

如果希望 `ssh office` 直接进入 WSL，可配置 Windows OpenSSH 强制跳转。

编辑服务端配置文件：

```
C:\ProgramData\ssh\sshd_config
```

加入一行：

```
ForceCommand wsl.exe
```

效果：SSH 登录后自动进入 WSL，无需手动输入 `wsl` 命令。

> 很多长期使用 WSL 的开发者都会采用此配置。

---

## 6. 测试与排查

在家里的电脑执行：

```bash
ssh <你的WSL用户名>@office-pc
```

示例：

```bash
ssh david@office-pc
```

### 不同报错对应的问题

| 输出 | 可能原因 |
|------|---------|
| `Connection refused` | SSH 服务未启动或未监听 |
| `Permission denied` | 用户名、密码或密钥认证问题 |
| `Could not resolve hostname` | Tailscale 名称解析问题 |
| 能登录但进入 Windows | 需要配置 `ForceCommand` 或手动 `wsl` 进入 |
| 直接进入 Ubuntu | ✅ 配置已完全成功 |

根据实际输出判断下一步调整方向。
