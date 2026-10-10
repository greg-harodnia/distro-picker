---
title: The Current Problems of Linux
date: 2026-10-10
description: The rough edges that still make Linux feel unfinished to ordinary users.
---

# The Current Problems of Linux

Linux has come a long way. Application support is good enough now: browsers, office suites, chat apps, creative tools, games through Proton — the things people actually do, they can do on Linux. The days of "there isn't an app for that" are mostly over.

The problems that remain are not about apps. They are about plumbing. And plumbing is exactly what a normal user never sees — until it breaks and makes the whole system look buggy.

## Flatpak permissions feel broken

Flatpak is how most modern desktops install apps today, and its sandbox is genuinely a good idea. The trouble is the permission model around it.

Every Flatpak app gets a fixed set of permissions chosen by whoever packaged it, and there is **no Android-style prompt** when the app actually needs something. On Android, an app asks for the camera, you tap *Allow once*, *Allow while using*, or *Deny*. On Linux there is no such flow. Permissions are baked in at packaging time, and if you want to change them you either:

- open a terminal and run `flatpak override`, or
- install a separate app called **Flatseal**, which is really just a GUI on top of those same low-level toggles.

Neither is something a casual user should be expected to know about. Flatseal drops you in front of a matrix of filesystem, socket, device, and environment switches — terminology that means nothing to someone who just clicked **Install** in the software center. The end user should not even know what a Flatpak is, they just use a GUI app which is installed from a GUI store.

Two more things make it worse:

- **There is no "allow only this once".** Even when you do change a permission, you grant it permanently and have to remember to revoke it later. Android solved this years ago; Flatpak has not.
- **A missing permission silently breaks features.** If a package forgets to declare access to a folder, a USB device, or some hardware, the app's feature simply doesn't work — often without a clear error. The user has no idea a permission is even involved.

And that last point is the real damage. **The end user doesn't know what Flatpak is.** They opened a store, clicked a button, and expected an app. When a feature quietly does nothing — no prompt, no explanation, no obvious fix — they don't blame the sandbox. They blame Linux.

## NVIDIA is still a second-class citizen

If you want the smoothest Linux experience, an AMD or Intel GPU is the easier choice. NVIDIA works, but it lags behind in ways users feel.

The proprietary driver is **closed source** and has to be rebuilt against each kernel version (usually via DKMS), so a routine kernel update can leave you with a black screen until it is sorted out. Wayland support took years to mature and still has rough spots on some setups — flicker, missing features, or the odd crash. Power management on laptops is weaker too, which hurts battery life and feeds directly into the next problem.

Gaming deserves its own line. Games on Linux run through translation layers like Proton, DXVK, and VKD3D, and the combination of that translation plus driver overhead leaves NVIDIA **roughly 10–15% behind the same game on Windows**. That gap has closed a lot and is sometimes smaller, but it is still there, and a Windows-to-Linux switcher notices it. NVIDIA's newer open kernel modules help, but they only support Turing and later cards and are not fully feature-complete — so lots of people are still on the closed driver.

## Sleep and hibernation rarely work properly

This one is embarrassing precisely because it is basic. Closing the lid should sleep, and waking up should just work. On many Linux machines it doesn't.

**Suspend (sleep).** The way a computer sleeps is defined by firmware-level ACPI states. The old **S3 "suspend-to-RAM"** is being replaced on modern laptops by **S0ix "modern standby"**, which the machine's firmware and the OS have to cooperate on. Linux's support for these newer states is less mature, the kernel often can't force firmware to reach the deepest low-power state, and any single driver that doesn't handle resume correctly — GPU, Wi-Fi, NVMe — can leave you with a black screen or a frozen system on wake. Firmware is usually tested against Windows first, so Linux gets the leftovers.

**Hibernation (suspend-to-disk).** This is even less reliable, and the reason is more mundane: hibernation needs a **swap area at least as large as your RAM**, and the kernel has to be told where to resume from (the `resume=` parameter, or a computed `resume_offset=` when you hibernate to a swap file). Many distributions simply **don't set this up by default** — Fedora disables hibernation, and plenty of installs create only a small swap, if any. Add a large amount of RAM (32–64 GB), an encrypted disk, or Secure Boot, and the setup gets fiddlier still.

So hibernation is technically "supported", but in practice most users never get it configured out of the box — and even suspend, the simple case, fails often enough that people just disable sleep and accept the power drain.

## Installing apps on immutable systems is still a hassle

Immutable distributions — Fedora Silverblue and Kinoite, Bazzite, Aurora, openSUSE Aeon and Kalpa, SteamOS, and others — are a great idea. The system is a read-only image that gets replaced as a whole on every update, which makes them very hard to break and easy to roll back. That reliability is exactly why they are recommended to beginners.

The catch is that you can't just install a normal package on them. The usual `sudo apt install` or `sudo dnf install` no longer applies, so the options become:

- **Flatpak** — GUI apps only, and sandboxed with all the permission problems above.
- **rpm-ostree layering** — adds a package on top of the image, but requires a reboot, is meant as a last resort, and can create conflicts on future updates.
- **Distrobox or Toolbox** — a container that shares your home folder, where you create and enter a small "distro inside your distro" and install packages in there.

That last one is the common answer for anything that isn't a Flatpak app, and for a casual user it is a dead end. It means opening a terminal, creating the container, entering it, and installing software inside a second operating system that isn't really part of the host. The apps live in a separate world, aren't sandboxed, and may not even show up in your normal application menu unless you export them. None of this is how a home user expects to install a program.

## The bottom line

App availability is no longer the reason to avoid Linux — that problem is largely solved. What still holds Linux back for ordinary people is everything around the apps: a permission model with no runtime prompts, weaker NVIDIA support and a measurable gaming penalty, suspend and hibernation that can't be trusted, and an install story on immutable systems that sends casual users into a terminal.

None of these are unsolvable, and each has workarounds. But a normal user shouldn't need workarounds. That is the standard Linux still has to reach.
