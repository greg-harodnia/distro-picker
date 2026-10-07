---
title: How to Address NVIDIA Sleep Mode Issues
date: 2026-10-05
description: Having trouble waking your Linux system from sleep with an NVIDIA GPU? Here's a simple workaround.
---

## What causes this issue?

If your system has an NVIDIA graphics card and won't wake up after going to sleep (showing only a black screen), you're not alone. This is a well-known issue on Linux, as NVIDIA's proprietary drivers can have compatibility issues with certain kernel versions, power management features, and display configurations.

## How to fix it

Unfortunately, there isn't a single, universal fix for this problem yet. The long-term solution will require improvements from both NVIDIA and the Linux community.

Until then, the simplest workaround is to avoid system suspend entirely by changing your power settings so that your system only turns off the display instead of going to sleep. This will prevent the black-screen wake issue, though it will consume more power when idle than true sleep mode.

For KDE Plasma, do the following: 

1. Open **Settings → Power Management**.
2. Adjust the actions for when inactive, on battery, or when the lid is closed. Change any "Sleep" / "Suspend" actions to "Turn off screen" (or a similar option).

Most desktop environments (GNOME, XFCE, Cinnamon, etc.) have similar power management settings. Look for "Power" or "Sleep" in your system settings and replace suspend actions with "Turn off display" instead.

This will not fix the sleep mode itself, but it will prevent your computer from showing an endless black screen when you wake it up. Also, note that your computer will not save power when it is not in use, because it will not enter sleep mode.