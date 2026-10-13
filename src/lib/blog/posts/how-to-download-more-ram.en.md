---
title: How to Download More RAM in Linux (2026)
date: 2026-10-13
description: You cannot literally download RAM, but zRAM, zSwap and Meta's new CRAM can squeeze a lot more usable memory out of the hardware you already have.
---

# What Happens When RAM Runs Out

On Windows and many Linux distributions, when your computer runs out of available memory, it starts moving less important memory "pages" to a so-called "paging file" (or "swap" in Linux) on your disk. This keeps the system running instead of hanging, but it also makes it extremely slow, as a disk is much slower than RAM. Constant rewriting to it also causes the disk to wear out faster, especially on systems with a small amount of RAM. When there is no available memory left, the Linux kernel starts killing processes to free it up.

## How to Download More RAM

Thankfully, there are technologies that let you compress your memory data. Some of them, like zRAM, do it directly inside your RAM, without touching the disk (although zRAM can still work alongside swap). Others, like zSwap, compress data as it is written to swap (hence the name). Both help your disk to wear less and your system to run faster, since it will hit memory issues less often. Both zRAM and zSwap can use the same compression algorithm; the difference is not how effectively they compress data, but where and when they do it. zRAM can be used even without a disk swap, because it compresses inside RAM, whereas zSwap requires a swap file or partition. Both compress data only when you run out of RAM; if you have enough RAM, they won't be actively used (and won't harm your system either). The advantage of zRAM is that it can be used completely without swap and does not wear the disk at all (however, if you want to hibernate your system, you will still need swap in parallel). The advantage of zSwap, on the other hand, is that it sits in front of a disk swap area, so the total swap space can be larger than your RAM. Distros like Fedora, Pop!_OS, and some Arch derivatives already use zRAM by default, while others like Linux Mint, TUXEDO OS, and openSUSE use a swap file or partition, so you can enable zSwap manually there (or zRAM if you prefer).

You can see a comparison between zRAM and zSwap [here](https://linuxblog.io/zswap-better-than-zram/#ZRAM_vs_Zswap_Comparison).

## Even Better?

Lately, in the era of expensive RAM, Meta engineers have been developing a new solution called CRAM (Compressed RAM). CRAM is similar to zRAM, but it works at a level closer to the hardware, using hardware-offloaded compression rather than the software compression used by zRAM and zSwap. Read-only data can be served nearly as fast as raw DRAM, while memory writes are much faster than zRAM, zSwap or plain swap. It is not quite free memory, but it is close enough to feel like a real "more RAM download".

More information about CRAM can be found [here](https://www.phoronix.com/news/Linux-CRAM-Compressed-RAM).

Overall, these technologies make the system far more responsive, without requiring you to physically install more memory. 