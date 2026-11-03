---
title: How Windows Tries to Hinder Linux
date: 2026-11-03
description: Secure Boot keys, updates that break GRUB, locked ARM laptops, missing Office — how Windows makes switching to Linux harder.
---

Linux has no marketing department, no OEM deals, and no seat on the committee that decides what a PC is allowed to boot. Windows has all three. That asymmetry does not have to be a conspiracy to have the same effect: every year there are a handful of small, avoidable obstacles between a person and a working Linux install, and each one costs the Linux side time it does not have.

Some of what follows is clearly deliberate. Some is just what happens when an operating system is written with the assumption that it is the only one on the machine. The end result is the same, so this article treats both the same way.

## Secure Boot makes Microsoft the gatekeeper

Secure Boot is a genuinely good idea. Your PC's firmware keeps a list of trusted signing keys and refuses to run a bootloader that is not signed by one of them, which stops a whole class of malware that hides before the operating system starts.

The problem is who holds the keys. On practically every PC sold, the only key trusted out of the box belongs to Microsoft. A Linux distribution that wants to boot with Secure Boot enabled cannot sign its own bootloader with its own key — the firmware would not accept it. Instead it ships a small signed stub called `shim`, gets that stub signed by Microsoft's UEFI certificate authority, and then `shim` loads the distribution's own bootloader.

Getting there means:

- submitting the project to Microsoft for review,
- paying a one-time fee of around $99,
- and maintaining a signing key and a build process that survives that review.

Ninety-nine dollars is not the barrier. The barrier is that **a competitor decides whether your operating system is allowed to start**. Microsoft can delay a review, reject a submission, or revoke a certificate, and a distribution that falls behind on the process simply stops booting on new machines with Secure Boot enabled. Small distributions and one-person projects frequently cannot take part at all, which quietly narrows the field to whoever can afford the bureaucracy.

The signing certificates also expire every few years. When that happens, every distribution has to go through the submission process again just to keep booting on hardware that was already working. It is a permanent tax paid in someone else's currency.

And Secure Boot does not stop at the bootloader. Every kernel module the distribution did not sign — the NVIDIA driver, VirtualBox, some Wi-Fi drivers — has to be signed with a key you enroll yourself, through a blue "MOK management" screen that appears at boot and looks like a firmware error. Newcomers hit that screen, assume something has broken, and reboot around it. It is a reasonable design that quietly assumes you already know what a machine owner key is.

Yes, on x86 you can usually turn Secure Boot off in the firmware settings. But some laptops bury that option, some hide it behind an administrator password, disabling it weakens a real security feature, and it can complicate sharing a disk with an encrypted Windows install. On ARM machines it often cannot be disabled at all — more on that below.

## Windows breaks the bootloader and assumes it owns the disk

On a dual-boot machine, Windows and Linux share an EFI System Partition, a small FAT32 partition that holds the bootloaders. Windows treats that partition as its own.

The most common failure is quiet: a Windows update repairs or reinstalls its boot entries and rewrites the firmware's boot order, so the machine starts straight into Windows and the Linux entry is gone from the menu. The files are still there. You just cannot reach them without opening a terminal and rebuilding the boot entries, which is exactly the kind of repair a newcomer will not attempt.

Then there is the damage that is not quiet. In August 2024 a routine Windows security update shipped a Secure Boot revocation list that also revoked older Linux bootloaders. Dual-boot machines with an older `shim` stopped booting entirely, with a security violation message instead of a desktop. Microsoft paused the rollout after the reports came in, but the pattern is the point: **a security update for Windows was allowed to decide which other operating systems may boot**, and the Linux side had no say in the timing.

There is a second, less discussed way Windows breaks Linux installs: its partition tools. Windows' Disk Management is not a neutral editor. It assumes the whole disk belongs to Windows, and it will happily rewrite the partition table, reorder entries, or convert a disk to a "dynamic disk" — a Microsoft-only format that Linux cannot read at all. This can happen even when the partition being resized has nothing to do with Linux, because the damage is to the table, not to the files. Anything that refers to a partition by its position on the disk, from a bootloader entry to a mount, then points at the wrong place.

Windows' **Fast Startup** makes all of this worse. It does not really shut down: it hibernates the kernel and leaves the NTFS partition marked as in use. Linux will then mount that partition read-only, or refuse to mount it, and any partition change made while Windows is in that state can be lost or can corrupt the filesystem. A newcomer who "just rebooted into Linux" has no way to know any of this is happening.

**BitLocker** closes the same door from the other side. On many new machines the Windows disk is encrypted by default, with the key sealed into the TPM and the recovery key tied to a Microsoft account. A Linux install on that machine cannot read the disk at all, and a dual-boot user who needs to resize, back up, or repair it is suddenly dealing with recovery keys and a system that treats the disk as foreign. It is a genuinely good security feature that happens to make sharing a machine with anything else a decision you have to make before you turn it on.

## The filesystem relationship only works in one direction

Linux reads and writes NTFS, the filesystem Windows uses. It has done so for years, and the driver now lives in the kernel itself. Linux also reads FAT32 and exFAT, the formats used on memory cards and USB sticks.

Windows cannot read ext4, btrfs, XFS, or ZFS. There is no driver from Microsoft, no plan to add one, and no support in the operating system for opening a Linux partition. The only options are third-party tools of varying quality — some read-only, some slow, some known to corrupt the filesystem if you write to it.

This asymmetry has a real cost. An external drive formatted for Linux is unreadable on a Windows machine. A shared drive has to be exFAT, which has no permissions, no journaling, and no snapshots — so the compromise is always made on the Linux side. And the "just keep both systems and move files around" plan, which is how most people actually live, is the plan Windows makes hardest.

Windows Subsystem for Linux is not the exception it looks like. By default it runs Linux inside a virtual disk file, which has nothing to do with your real Linux partition. `wsl --mount` can attach a physical disk, but it is a command most Windows users have never heard of, and it is still not how the system behaves out of the box.

## There is no Office for Linux

Microsoft 365 ships for Windows, macOS, iOS, Android, and the web. There has never been a Linux desktop version, and Microsoft has never announced one.

For a lot of people that single fact decides the operating system. Documents are not just text: tracked changes, macros, pivot tables, embedded objects, and specific font metrics all drift when a file is opened in something else. LibreOffice and OnlyOffice are good, and for most personal use they are entirely sufficient — but "mostly opens correctly" is not a sentence an office worker can build a job on.

Office on the web exists and runs in a Linux browser, which helps, but it is a reduced version that needs a connection and a subscription.

The same gap shows up elsewhere in the suite: OneDrive has no official Linux client, and the desktop apps that businesses standardize on are written for Windows first and everything else second, if at all. Microsoft does not have to block Linux here. It only has to not ship.

## The hardware is built, tested, and sold for Windows

Almost every consumer PC leaves the factory with Windows installed. That is not a neutral default: manufacturers validate their drivers, firmware, and power management against Windows, because Windows is what is on the machine and what the support line will be asked about. Linux support is whatever the community manages to reverse-engineer afterwards.

The license is part of the price whether you use it or not — the so-called "Microsoft tax" — and refunding an unused copy is not something a buyer can do at the till.

The commercial side has a long record. The United States antitrust case against Microsoft in the 1990s turned up licensing terms that charged manufacturers a fee for every machine they shipped whether or not it had Windows on it, which made shipping a competing system economically pointless. Today the mechanisms are softer — volume licensing, co-marketing funds, certification programs — but the direction is the same: Windows is the default, and shipping something else costs you.

What a user feels is the aftermath:

- **The installer may not see your disk.** Many laptops ship with the storage controller in Intel RST or RAID mode instead of AHCI, and Linux cannot read a disk in that mode. Switching to AHCI fixes it, but the existing Windows install may then refuse to boot until you prepare it first.
- **Fingerprint readers, function keys, and some Wi-Fi and Bluetooth chips** work on Windows on day one and on Linux months or years later, if ever.
- **BIOS and UEFI updates** are often released only as Windows executables, with no Linux flashing tool at all. `fwupd` and the LVFS catalog cover many machines now, but only those whose vendors chose to publish there.
- **Laptop power management** is tuned for Windows, which is one reason sleep and battery life have historically been weaker on Linux.
- **New hardware needs a new kernel.** A laptop released this year may need a kernel released next year, because the vendor never sent a driver upstream.

NVIDIA is the classic example. Its driver was closed source, had no real Wayland support for years, and produced flicker and stutter that AMD and Intel users never saw — the explicit sync fix only landed in 2024. That gap is closing: the open kernel modules are now the default for recent cards, Wayland support is solid, and the remaining performance difference is small. But it took a decade, and it happened because of pressure from users and Valve's work on the Steam Deck, not because the hardware was designed to work with Linux.

## ARM laptops and Pluton lock the door from the inside

The newest and most effective obstacle is at the firmware level, and it is much harder to work around than Secure Boot.

Windows-on-ARM laptops built around Qualcomm's Snapdragon X chips mostly cannot boot Linux at all. They do not expose a standard UEFI interface the way x86 machines do, the boot chain is locked to Windows, the signing keys are not available to anyone else, and Microsoft's requirements for Windows on ARM state that Secure Boot must be enabled and that **the user must not be able to disable it**. There is no switch to flip, no `shim` to sign, and no way in. Community projects have made progress on individual models, but that is not something a normal person can install.

Behind that sits **Pluton**, a security processor Microsoft designed and that now ships inside recent AMD, Intel, and Qualcomm chips. It stores the BitLocker keys and anchors the boot chain, and by design the keys cannot be extracted — not by the owner, not by a repair shop, not by a Linux installer. The operating system talks to it through an interface Microsoft defines. It is sold as a security feature, and in some ways it is one, but it also moves the final decision about what runs on your computer from you to a chip vendor and the company that specifies it.

This is the direction that matters most. Secure Boot on x86 is an obstacle you can step around by turning it off. A locked ARM bootloader is not.

## The bottom line

Not every item on this list is a plot. Some are inertia, some are engineering shortcuts, and some are the natural behaviour of software that assumes it is alone on the disk. But put together they form a structure: Microsoft controls the signing authority that decides what boots, the default operating system on the hardware people buy, the partition tools most people reach for first, and the office suite many jobs require. Linux competes with all of that while also having to reverse-engineer the hardware.

The trend is not entirely one-way. Secure Boot can be disabled on x86, NVIDIA is opening up, ARM support is slowly arriving, and regulators in Europe are paying more attention to bootloader locks than they used to. But none of that is guaranteed, and none of it moves quickly.

If you are planning a switch, a few habits remove most of the pain:

- **Put Linux on its own drive** if you dual boot, so a Windows update cannot touch the bootloader.
- **Back up before touching partitions**, and do partition work from Linux rather than from Windows.
- **If the installer sees no disks**, check the storage mode in the firmware before giving up — it is usually set to RAID, while Linux expects AHCI.
- **Use exFAT for drives you share** between the two systems.
- **Check Linux support for your exact model** before buying a laptop, especially if it is ARM.
- **Keep a fallback** for the one Windows-only app you cannot replace — dual-boot with Windows, a web version, or tools like Bottles, Winboat or winPodX.

The obstacles are real, but they are mostly navigable. Knowing what they are is the first step.
