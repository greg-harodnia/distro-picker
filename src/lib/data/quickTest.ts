import type { QuickTestData } from '$lib/types/quiz';

export const quickTestData: QuickTestData = {
	test: [
		{
			question: {
				text: 'How would you like to use the distribution?',
				answers: [
					{
						text: 'Just a regular user',
						question: {
							text: 'Which layout do you prefer?',
							answers: [
								{
									text: 'Windows-like',
									result: 'Linux Mint, Kubuntu, or Zorin OS—depending on which design you like more.',
								},
								{
									text: 'MacOS-like',
									result: 'Pop!_OS. If you would like to be able to easily switch between different layouts, go with Zorin OS.',
								},
							],
						},
					},
					{
						text: 'I want my distro to be preconfigured for gaming / I want to use it on a handheld',
						question: {
							text: 'Do you want to be able to edit system files?',
							answers: [
								{
									text: 'Yes',
									result: 'Nobara. With its mutable system, you\'ll be able to tweak system files and install any packages you want. If you\'re comfortable using the terminal, you can also go with CachyOS.',
								},
								{
									text: "I don't care about it",
									result: 'Bazzite. The distribution is available for both PCs and handhelds. You can also go with SteamOS if it supports your handheld (it doesn\'t officially support PCs yet). CachyOS is the third option for those who enjoy using the terminal.',
								},
							],
						},
					},
					{
						text: 'I want to develop on it',
						result: 'Fedora is your ideal choice. It\'s both stable and offers up-to-date software. Plus, you can choose from various desktop environments to suit your preferences. That said, traditional distros with less frequent updates—like Linux Mint, Kubuntu, Zorin OS, or Pop!_OS—are also excellent options.',
					},
					{
						text: 'I\'m a tech enthusiast who wants a distro that\'s as flexible and unbloated as possible. I want full control over my system, and I enjoy tweaking and using the terminal.',
						result: 'Sounds like CachyOS was made for you. Or, if you want something even closer to barebones Arch, EndeavourOS is worth checking out.',
					},
					{
						text: 'I want to recover my old PC with it',
						question: {
							text: 'How old is your computer?',
							answers: [
								{
									text: 'Not extremely old, but it feels sluggish',
									result: 'Mint Xfce',
								},
								{
									text: 'It was produced before 2011',
									result: 'Lubuntu',
								},
								{
									text: 'It is truly ancient (2004 or older)',
									result: 'AntiX',
								},
							],
						},
					},
				],
			},
		},
	],
};
