---
title: How To Clean Up Your System
date: 2026-09-23
description: Reclaim disk space from the terminal — clean package caches, remove orphaned packages and spot the junk without a heavy GUI cleaner.
---

# How To Clean Up Your System

GUI cleaners like BleachBit and Stacer can do the job, but the terminal does it better — and, for the most part, with tools you already have. A few commands, no extra apps, and you know exactly what gets deleted. (Some of those GUI tools, like Stacer, are also effectively unmaintained these days.)

This guide covers the everyday culprits: package caches, orphaned packages, old Flatpak and Snap revisions, your own leftover configs and caches, and the system directories worth a look.

> **Immutable distros (Bazzite, Aurora, KDE Linux, SteamOS, etc.):** the system image is replaced as a whole on every update, so package caches and orphaned packages don't accumulate like they do on classic distros — the host itself has nothing to clean. Old images are pruned automatically, keeping one or two previous versions just for rollback. The home-directory parts of this guide still apply, though: `~/.cache`, leftover app configs, and any containers (toolbox, distrobox, podman) keep building up files on every system.

## First, see where the space went

Before deleting anything, find what is actually eating your disk. **gdu** (Go Disk Usage) is a fast, terminal-based disk usage analyzer — a little like KDE's Filelight or GNOME's Disk Usage Analyzer, but from the command line.

Install it through your package manager where available (`sudo apt install gdu`, `sudo dnf install gdu`), or grab the latest release from [GitHub](https://github.com/dundee/gdu), then run:

```bash
gdu /
gdu ~
```

The first command gives you the system-wide picture, the second covers your home directory. The usual bulk lives in `~/.cache` and `~/.local/share`, and you can delete files straight from the gdu interface with `d`.

## Clean the package manager cache

Package managers are the biggest source of accumulated junk: every update leaves downloaded packages sitting in a cache. That cache speeds up future updates, so it is fine to keep — but once it has grown big, it is safe to prune.

| Package manager | Used by                                   | Clean the cache                                         |
| --------------- | ----------------------------------------- | ------------------------------------------------------- |
| apt             | Debian, Ubuntu, Linux Mint, Zorin OS, Pop!_OS | `sudo apt clean` (or `sudo apt autoclean` for obsolete only) |
| dnf             | Fedora, RHEL and friends                  | `sudo dnf clean all`                                    |
| pacman          | Arch, EndeavourOS, Manjaro, CachyOS       | `sudo pacman -Sc` (keep current) or `sudo pacman -Scc` (all) |
| zypper          | openSUSE (Leap, Tumbleweed)               | `sudo zypper clean`                                     |

Arch users with an AUR helper (`yay` or `paru`) can clear its build cache as well: `yay -Sc` or `paru -Sc`.

## Remove orphaned packages

"Orphans" are packages that were installed automatically as dependencies but are no longer needed by anything. Removing them is the biggest win after the cache.

| Package manager | Used by                              | Remove orphans                           |
| --------------- | ------------------------------------ | ---------------------------------------- |
| apt             | Debian, Ubuntu, Mint, Zorin OS, Pop!_OS | `sudo apt autoremove --purge`            |
| dnf             | Fedora and friends                   | `sudo dnf autoremove`                    |
| pacman          | Arch and friends                     | `sudo pacman -Rns $(pacman -Qdtq)`       |
| zypper          | openSUSE (Leap, Tumbleweed)          | `zypper packages --unneeded`<br>`sudo zypper rm -u <package>`            |

Three notes: on apt, the `--purge` flag also clears leftover config files of the removed packages; on pacman, `pacman -Qdtq` lists the orphans and the `$(...)` feeds them straight into the removal command; on openSUSE, zypper has no mass autoremove — `zypper packages --unneeded` lists the candidates, and `sudo zypper rm -u <package>` removes a package together with its now-unneeded dependencies.

> If you are unsure about orphans, list them first — `pacman -Qdtq` on Arch, or `apt list --installed` and look for "automatically installed" elsewhere — and read the names before confirming. Nothing is deleted without your approval.

## Flatpak and Snap

Both store old versions of apps and runtimes you may never launch again.

- **Flatpak:** `flatpak uninstall --unused` removes unneeded runtimes, and `flatpak repair` verifies the store before you clear things.
- **Snap:** limit how many old revisions are kept with `sudo snap set system refresh.retain=2`. Disabled old revisions (see `snap list --all`) can then be removed, and `/var/lib/snapd/cache` is safe to empty.

## The universal clean-up (any distro)

Two things apply on every system, regardless of the package manager:

```bash
rm -rf ~/.cache/*
```

That empties your user-level cache — safe, because apps simply rebuild it. Note that running apps may write back, so it is a good idea to close them first.

Then, if you want to be thorough, check `~/.config` and `~/.local/share` for folders belonging to apps you uninstalled long ago — that is where "leftovers" really live.

## System directories worth a look

| Path             | What it holds                              | How to deal with it                                                                                                                                                                                                            |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/var/tmp`       | Temp files that survive reboots            | `sudo find /var/tmp -mindepth 1 -mtime +30 -delete` — sweeps files untouched for a month. Many systemd-based distros auto-clean this for you already, but the manual sweep frees the space right now.                          |
| `/var/log`       | Logs and the systemd journal               | Trim the journal with `sudo journalctl --vacuum-time=14d` (or `--vacuum-size=200M`). Regular `.log` files are rotated by logrotate on their own — no manual deleting needed.