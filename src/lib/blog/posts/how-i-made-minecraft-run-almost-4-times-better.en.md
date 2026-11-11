---
title: How I made Minecraft run 37% better
date: 2026-11-11
description: OpenGL, Vulkan, and a modded build took Minecraft from 295 to 405 FPS on a Linux laptop with an Nvidia GPU.
---

I use EndeavourOS on a laptop with an Nvidia GPU, and recently I decided to install Minecraft.

## Standard Edition with OpenGL

First, I installed the standard edition through Prism Launcher.

![Prism Launcher](/blog/images/prism-launcher.webp)

By default, it runs on OpenGL using the integrated Intel GPU and gives around 123 FPS at this spot.

![OpenGL on the integrated GPU](/blog/images/opengl-integrated-gpu.webp)

To make it use the dedicated GPU, I changed this setting in Prism Launcher:

![Use discrete GPU setting](/blog/images/dedicated-gpu-setting.webp)

Now, with the Nvidia GPU, it runs at 295 FPS:

![OpenGL on the dedicated GPU](/blog/images/opengl-vanilla.webp)

## Standard Edition with Vulkan

Switching from OpenGL to Vulkan gives a slight performance boost (305 FPS):

![Vulkan vanilla](/blog/images/vulkan-vanilla.webp)

## 'Fabulously Optimized' build with OpenGL

When you create a Minecraft instance in Prism Launcher, you can pick from various ready-made builds. I picked the Fabulously Optimized one, which was first in the list. Running the same world in this instance gives a huge boost in FPS compared to the vanilla version (1.25×, 370 FPS).

![OpenGL modded](/blog/images/modded-opengl.webp)

## 'Fabulously Optimized' build with Vulkan

Switching to Vulkan raises the FPS of the modded instance even further: 405 FPS at the same spot.

![Vulkan modded](/blog/images/modded-vulkan.webp)

## All the results

| Version | OpenGL | Vulkan |
| --- | --- | --- |
| Vanilla | 295 FPS | 305 FPS |
| Modded | 370 FPS | 405 FPS (+37%) |

## Can it be improved even further?

So far, all of this has been with the standard Java Edition. Lately, Horizon — a new launcher written in Rust — has appeared, but in my experience it runs worse than the Java Edition; the only real benefit is almost instant world loading.

## How did I sync the worlds between instances?

You may wonder how I tested the same world at the same spot in two different Minecraft instances. If you right-click a Minecraft instance in Prism Launcher, you can open its folder by choosing 'Folder' in the context menu. Then go to `/minecraft/saves` and copy your world to the same location in the other instance. However, this copies the world only once, so it won't stay in sync between the instances. To keep it in sync, you don't need to copy the save each time you switch instances: just create a symlink to that save in the other instance's `saves` folder. You then keep a single save in one instance, and the other instances use it through the symlink.