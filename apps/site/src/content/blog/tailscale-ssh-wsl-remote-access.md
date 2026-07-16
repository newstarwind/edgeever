---
draft: false
title: "Tailscale + SSH 远程访问 WSL 完整配置指南"
snippet: "通过 Tailscale 组网，从家里电脑安全地 SSH 远程连接办公室 Windows WSL 开发环境，含推荐方案与高级配置。"
image: {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
    alt: "服务器与网络连接示意图"
}
publishDate: "2025-07-17 12:00"
category: "Guides"
author: "EdgeEver Team"
tags: [tailscale, ssh, wsl, remote-access, self-hosted]
---

许多开发者使用 WSL（Windows Subsystem for Linux）作为日常开发环境，家里和办公室各有一台电脑。如何从家里安全、便捷地 SSH 连接到办公室的 WSL？本文提供一套完整的配置指南。

---

## 确认 Tailscale 网络正常

在家里的电脑执行：

```bash
tailscale status
```

应该能看到类似输出：

```
100.x.x.x   office-pc
100.x.x.x   home-pc
```

或者直接用 Ping 测试：

```bash
ping office-pc
```

能 Ping 通则说明 Tailscale 组网正常。

## 确认 WSL 中 SSH 正在运行

在办公室的 WSL 终端中检查 SSH 服务状态：

```bash
sudo service ssh status
```

预期显示：

```
Active: active (running)
```

如果未运行，启动它：

```bash
sudo service ssh start
```

## 确认 WSL 的 Tailscale IP 情况

这里分两种情况：

### 情况 A：Tailscale 装在 Windows（最常见）

此时 Tailscale 只能看到 Windows 节点，看不到 WSL。这是正常现象。

### 情况 B：Tailscale 也装在 WSL

这种情况下，可以直接 `ssh user@100.x.x.x` 进入 WSL。但一般情况下没有必要这样做。

## 推荐方案：SSH 到 Windows，再进入 WSL

这是微软官方推荐的方式，也是大多数开发者采用的做法。

在家里的电脑执行：

```bash
ssh david@office-pc
```

登录的是 Windows，然后进入 WSL：

```powershell
wsl
```

立即进入 Ubuntu 环境。

## 高级方案：配置 SSH 直入 WSL

如果你希望 `ssh office` 直接进入 WSL，可以配置 Windows OpenSSH 服务端。

编辑配置文件（管理员权限）：

```
C:\ProgramData\ssh\sshd_config
```

加入一行：

```
ForceCommand wsl.exe
```

保存后重启 OpenSSH 服务。以后：

```bash
ssh office
```

直接进入 Ubuntu，无需再手动输入 `wsl`。

> 很多长期使用 WSL 的开发者都会采用此配置，省去每次登录多敲一个命令的麻烦。

## 测试与排查建议

在家庭电脑执行测试：

```bash
ssh <你的WSL用户名>@office-pc
```

示例：

```bash
ssh david@office-pc
```

### 不同输出对应的问题

| 输出 | 可能原因 | 解决方向 |
|------|---------|---------|
| `Connection refused` | SSH 服务未启动或未监听 | 检查 Windows OpenSSH 服务状态 |
| `Permission denied` | 用户名、密码或密钥认证问题 | 确认用户名，检查密钥配置 |
| `Could not resolve hostname` | Tailscale 名称解析问题 | 检查 Tailscale 状态 |
| 能登录但进入 Windows | 未配置 ForceCommand | 手动输入 `wsl` 或配置 `ForceCommand` |
| 直接进入 Ubuntu | ✅ 配置已完全成功 | 无需额外操作 |

---

## 总结

通过 Tailscale + SSH + WSL 的组合，你可以像在办公室一样，从家里安全地访问完整的 Linux 开发环境。推荐先走「SSH → Windows → wsl」的路线，稳定可靠；如果追求效率，再配置 `ForceCommand` 实现一步直达。
