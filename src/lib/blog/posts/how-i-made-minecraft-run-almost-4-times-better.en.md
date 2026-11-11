---
title: How I made Minecraft run almost 4 times better
date: 2026-11-11
description: OpenGL, Vulkan, and a modded build took Minecraft from 92 to 333 FPS on a Linux laptop with an Nvidia GPU.
---

I use EndeavourOS on a laptop with an Nvidia GPU, and recently decided to install Minecraft.

## Standard Edition

First, I installed the standard edition through Prism Launcher.

![Prism Launcher](../images/prism-launcher.png)

By default, it runs on OpenGL and gives around 92 FPS in this location.

![OpenGL](../images/openGL.png)

### Vulkan

Switching from OpenGL to Vulkan gives almost 3× the FPS (260).

![Vulkan](../images/Vulkan.png)

### 'Fabulously Optimized' build

When you create a Minecraft instance in Prism Launcher, you can pick among various ready-made builds. I picked the Fabulously Optimized one, which was the first in the list. Running the same world from this instance gives a huge boost in FPS compared to the vanilla version (1.5×).

![OpenGL modded](../images/moddedOpenGL.png)

### 'Fabulously Optimized' on Vulkan

When switching to Vulkan, the FPS in the modded instance increases as well. Now it's 333 FPS in the same location, which is more than twice the FPS of the modded OpenGL instance and almost four times that of the vanilla OpenGL one.

![Vulkan modded](../images/Vulkan_modded.png)

### Can it be improved even further?

So far, all of this has been on the standard Java Edition. Lately, Horizon — a new launcher written in Rust — has appeared, but in my experience it runs worse than the Java Edition — the only real benefit is almost instant world loading.

### How did I sync the worlds between instances?

You may ask how I was able to test the same world from the same location in two different Minecraft instances. If you right-click on a Minecraft instance in Prism Launcher, you can open its files by choosing 'Folder' in the context menu. Then, you can go to /minecraft/saves and copy your world to the same location in another instance. However, this only copies the world statically, and it won't be synchronised between the instances. To keep it synchronised, you don't even need to copy the save each time you switch to another Minecraft instance. You can simply create a symlink to a particular save in another instance's 'saves' folder. So in reality, you will only have one save in one instance, but other instances will use it through the symlink you added to their saves.