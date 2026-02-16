<script lang="ts">
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
	import TagFilter from "$lib/components/TagFilter.svelte";
	import DistroGrid from "$lib/components/DistroGrid.svelte";
	import DistroPanel from "$lib/components/DistroPanel.svelte";
	import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
	import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import { loadTags, loadDistros } from "$lib/utils";
	import {
		tags,
		loading,
		error,
		selectedTags,
		selectedDistro,
		filteredDistros,
		tagActions,
		distroActions,
		dataActions,
	} from "$lib/stores";
	import type { Distro } from "$lib/types";

	let footerExpanded = false;

	async function loadData() {
		dataActions.setLoading(true);
		dataActions.clearError();

		try {
			const [tagsResult, distrosResult] = await Promise.all([
				loadTags(),
				loadDistros(),
			]);

			if (tagsResult.error) {
				dataActions.setError(tagsResult.error);
			} else if (distrosResult.error) {
				dataActions.setError(distrosResult.error);
			} else {
				dataActions.setTags(tagsResult.data || []);
				dataActions.setDistros(distrosResult.data || []);
			}
		} catch (err) {
			dataActions.setError(
				err instanceof Error ? err.message : "Failed to load data",
			);
		} finally {
			dataActions.setLoading(false);
		}
	}

	function toggleTag(tagId: string) {
		tagActions.toggle(tagId);
	}

		function selectDistro(distro: Distro) {
		distroActions.select(distro);
		setTimeout(() => {
			document.getElementById('distribution-details')?.scrollIntoView({ behavior: 'smooth' });
		}, 0);
	}

	function closePanel() {
		distroActions.clear();
	}

	onMount(() => {
		loadData();
	});
</script>

{#if $loading}
	<LoadingSpinner message="Loading distributions..." size="large" />
{:else if $error}
	<ErrorDisplay
		title="Failed to Load Data"
		message={$error}
		retryable
		on:retry={loadData}
	/>
{:else}
	<div class="app">
		<header class="header">
			<h1>Linux Distro Picker</h1>
			<ThemeToggle />
		</header>

		<section class="filters" aria-labelledby="filters-heading">
			<h2 id="filters-heading">Filter by Tags</h2>
			<div class="tag-list" role="group" aria-label="Filter options">
				{#each $tags as tag (tag.id)}
					<TagFilter
						{tag}
						selected={$selectedTags.has(tag.id)}
						on:toggle={() => toggleTag(tag.id)}
					/>
				{/each}
			</div>
		</section>

		<div class="content">
			<section class="distros" id="distribution-details" aria-labelledby="distros-heading">
				<h2 id="distros-heading">
					Recommended Distros ({$filteredDistros.length})
				</h2>
				{#if $filteredDistros.length === 0}
					<div class="no-results" role="status" aria-live="polite">
						<p>No distributions match your selected criteria.</p>
						<p>Try adjusting your filters to see more options.</p>
					</div>
				{:else}
					<DistroGrid
						distros={$filteredDistros}
						selectedDistro={$selectedDistro}
						on:select={(e) => selectDistro(e.detail)}
					/>
				{/if}
			</section>

			{#if $selectedDistro}
				<section class="distros" aria-labelledby="details-heading">
					<h2 id="details-heading">Distribution Details</h2>
					<DistroPanel
						distro={$selectedDistro}
						tags={$tags}
						on:close={closePanel}
					/>
				</section>
			{/if}
		</div>

		<footer>
			<button
				class="toggle-btn"
				on:click={() => (footerExpanded = !footerExpanded)}
			>
				Additional information {footerExpanded ? "▲" : "▼"}
			</button>
			{#if footerExpanded}
				<div transition:slide>
					<p>
						Not all distributions are included, as this app is
						intended for beginners (openSUSE, for example, caters
						more to system administrators, is hard to get Nvidia
						drivers working, and has poor graphics performance,
						while AlmaLinux is a server OS. Arch, EndeavourOS,
						NixOS, Void and Gentoo are geared toward advanced users.
						Solus, on the other hand, is just not too popular and
						may have poorer package support. Nobara, PikaOS and
						Garuda are not listed in favor of Bazzite; Ubuntu in
						favor of Mint, Zorin OS, Kubuntu and Pop!_OS; Peppermint
						OS and PuppyLinux in favor of Linux Lite, Lubuntu and
						AntiX). Some distros, like Feren OS, feature no more
						than just UI customization and different apps
						preinstalled compared to what they are based on, which
						all can be done manually. Other distros, like Qubes
						(security-oriented) or KDE Neon (KDE testing
						environment), serve very niche purposes.<br /><br />
						Feel free to dual boot the distribution you choose with your
						main OS, but do so on separate disks — Windows updates can
						break the Linux installation. Also, never use Windows tools
						to resize partitions on the disk where Linux is installed.<br
						/><br />

						If some apps are missing in your distribution, consider
						the following: 1) First, make sure it's really missing —
						search for it in your distribution's repositories (using
						a software center if installed). Don't forget to check
						Flatpak (on Flathub.org or in your software center) and
						AppImage (on AppImageHub.com) versions as well. Linux
						uses different package formats and doesn't support
						Windows proprietary formats, like .exe, without
						additional software. 2) If the app is truly missing,
						consider using alternatives (e.g., OnlyOffice over
						Microsoft Office, qBittorrent over uTorrent,
						Photopea/GIMP/Krita/Affinity(via Bottles) over
						Photoshop, Darktable over Lightroom, Inkscape over
						Illustrator, DaVinci Resolve over Premiere Pro, etc.).
						There is a lot of great open source software available.
						3) If the app is missing in your distribution but is
						available in others, you can use Distrobox to install it
						in a container running that specific distribution. 4) If
						you still need to use Windows apps that aren't available
						for Linux, try Bottles (which uses Wine under the hood)
						to install and run them natively. For games, Steam is
						recommended. 5) If the Windows app still doesn't run in
						Bottles, try Winboat to run it in a Windows container.
						This works for apps like Photoshop and MS Office, for
						example.<br /><br />
						When installing any distribution, especially on systems with
						limited RAM, don't forget to create a swap file/partition
						(you can create a swap file after the installation, too).
						In traditional distributions, over time cache files, temporary
						files, system logs, and other unnecessary data can accumulate,
						just like in Windows. To clean them, you can use tools like
						BleachBit or Stacer. Additionally, consider creating backups
						(with Timeshift or alternatives) to be able to restore your
						system if something goes wrong. However, this all is unnecessary
						for immutable distros as the entire system image is replaced
						during updates.<br /><br />

						There are 3 (main) types of a Linux distribution:<br
						/><br />
						1. Stable release (traditional). GUI software center, usually
						ext4 filesystem. Desktop versions are usually based on Ubuntu.
						User-friendly. Used on servers, too. <br />
						2. Rolling release. Fresh software, usually btrfs filesystem.
						Good for developers and power users that want to modify their
						system. Requires some terminal experience.<br />
						3. Immutable. The base is rolling release (usually Arch or
						Fedora), but releases are provided in a form of a whole system
						image (using btrfs snapshots or OSTree tool), allowing developers
						to decide the update frequency (I would even suggest them
						to handle 2 types of updates: stable every 6 months and frequent
						optional every month). Very stable, apps are provided as
						Flatpaks. GUI software center, very user-friendly. The new
						era of the Linux desktop, making traditional distros a privilege
						for servers. <br /><br />

						Software that I recommend.<br /><br />

						Browsers: Brave, Helium, Zen.<br />
						Office: OnlyOffice, LibreOffice.<br />
						Nvidia Shadow Play alternative: GPU Screen Recorder.<br
						/>
						Torrent client: qBittorrent.<br />
						Disk analyzer: Filelight (KDE/Qt), Baobab (Gnome/GTK), gdu
						(command-line written in Rust).<br />
						Local AI: LM Studio (I recommend Mistral model).<br />
						Extended software support: Flatpak (Bazaar or your software
						center), Distrobox (DistroShelf).<br />
						Running Windows apps: Bottles, Winboat.<br />
						Ventoy for creating a bootable USB drive with multiple Linux
						distributions.
					</p>
				</div>
			{/if}
		</footer>
	</div>
{/if}

<svelte:head>
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Linux Distribution Picker",
			"description": "Interactive tool to help users find the perfect Linux distribution based on their needs",
			"url": "",
			"applicationCategory": "UtilitiesApplication",
			"operatingSystem": "Any",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			},
			"creator": {
				"@type": "Organization",
				"name": "Linux Distribution Picker"
			}
		}
	</script>
</svelte:head>

<style>
	.app {
		max-width: var(--container-2xl);
		margin: 0 auto;
		padding: var(--space-xl);
		font-family: var(--font-sans);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0 auto var(--space-3xl);
		padding: 0 var(--space-xl);
	}

	.header h1 {
		text-align: center;
		flex: 1;
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
	}

	.filters {
		margin-bottom: var(--space-2xl);
	}

	.filters h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		margin-bottom: var(--space-lg);
		font-weight: var(--font-semibold);
	}

	footer {
		margin-bottom: var(--space-2xl);
	}

	footer .toggle-btn {
		background: none;
		border: none;
		color: var(--color-secondary);
		font-size: var(--text-lg);
		cursor: pointer;
		padding: 0;
		margin-bottom: var(--space-md);
	}

	footer p {
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
		font-weight: var(--font-normal);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
	}

	.content {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-2xl);
		align-items: start;
		margin-bottom: var(--space-3xl);
	}

	.distros h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		margin-bottom: var(--space-lg);
		font-weight: var(--font-semibold);
	}

	@media (max-width: 1024px) {
		.content {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.app {
			padding: var(--space-lg);
		}

		.header {
			flex-direction: column;
			gap: var(--space-lg);
			padding: 0;
		}

		.header h1 {
			font-size: var(--text-3xl);
		}

		.tag-list {
			gap: var(--space-md);
		}
	}
</style>
