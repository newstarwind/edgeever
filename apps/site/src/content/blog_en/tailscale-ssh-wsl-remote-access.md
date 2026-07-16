---
draft: false
title: "Tailscale + SSH Remote Access to WSL: Complete Setup Guide"
snippet: "Securely SSH into your Windows WSL dev environment from home using Tailscale mesh networking, with both recommended and advanced configurations."
image: {
    src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
    alt: "Server and network connection illustration"
}
publishDate: "2025-07-17 12:00"
category: "Guides"
author: "EdgeEver Team"
tags: [tailscale, ssh, wsl, remote-access, self-hosted]
---

Many developers use WSL (Windows Subsystem for Linux) as their daily development environment, with computers at both home and office. How do you securely and conveniently SSH into the office WSL from home? This guide provides a complete setup walkthrough.

---

## Verify Tailscale Network

On your home computer, run:

```bash
tailscale status
```

You should see output similar to:

```
100.x.x.x   office-pc
100.x.x.x   home-pc
```

Or simply test with Ping:

```bash
ping office-pc
```

If Ping succeeds, Tailscale mesh networking is working.

## Ensure SSH Is Running in WSL

Check the SSH service status in your office WSL terminal:

```bash
sudo service ssh status
```

Expected output:

```
Active: active (running)
```

If it's not running, start it:

```bash
sudo service ssh start
```

## Understanding WSL's Tailscape IP

There are two scenarios:

### Scenario A: Tailscale Installed on Windows (Most Common)

Tailscale only sees the Windows node, not WSL. This is normal and expected.

### Scenario B: Tailscale Also Installed in WSL

In this case, you can directly `ssh user@100.x.x.x` into WSL. However, this is generally unnecessary for most users.

## Recommended Approach: SSH to Windows, Then Enter WSL

This is Microsoft's officially recommended approach and what most developers use.

From your home computer:

```bash
ssh david@office-pc
```

This logs into Windows. Then enter WSL:

```powershell
wsl
```

You're now in your Ubuntu environment.

## Advanced: Configure Direct SSH into WSL

If you want `ssh office` to drop you directly into WSL, configure the Windows OpenSSH server.

Edit the configuration file (with admin privileges):

```
C:\ProgramData\ssh\sshd_config
```

Add this line:

```
ForceCommand wsl.exe
```

Save and restart the OpenSSH service. From now on:

```bash
ssh office
```

takes you directly into Ubuntu — no need to type `wsl` manually.

> Many long-term WSL developers use this configuration to save one extra command on every login.

## Testing & Troubleshooting

Run this test from your home computer:

```bash
ssh <your-wsl-username>@office-pc
```

Example:

```bash
ssh david@office-pc
```

### Interpreting Different Outputs

| Output | Likely Cause | Next Step |
|--------|-------------|-----------|
| `Connection refused` | SSH service not running or not listening | Check Windows OpenSSH service status |
| `Permission denied` | Username, password, or key authentication issue | Verify username and key configuration |
| `Could not resolve hostname` | Tailscale name resolution problem | Check Tailscale status |
| Logged in but landing in Windows | No ForceCommand configured | Type `wsl` manually or configure `ForceCommand` |
| Directly entering Ubuntu | ✅ Setup complete | No further action needed |

---

## Summary

With the Tailscale + SSH + WSL combination, you can securely access a full Linux development environment from home as if you were in the office. We recommend starting with the "SSH → Windows → wsl" route — it's stable and reliable. If you want maximum efficiency, configure `ForceCommand` for one-step access.
