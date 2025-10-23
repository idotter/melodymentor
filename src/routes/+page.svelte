<!-- Zeigt globale Hitparade UND Beitrittsformular für nicht eingeloggte User -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	// Import confetti library (funktioniert jetzt, da in package.json) - Nicht mehr benötigt für BETA-Label
	// import confetti from 'canvas-confetti';

	export let data: PageData;
	export let form: ActionData; // Für Fehlermeldungen des Beitrittsformulars

	// data.user ist hier immer null oder anonym
	// data.topSongs enthält die Liste der Top-Songs

	// Funktion zum Auslösen des Konfettis - Nicht mehr benötigt
	// function triggerConfetti(event: MouseEvent) { ... }

</script>

<div class="relative min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-start pt-16 px-4 overflow-hidden">
	<!-- Schräges Banner entfernt -->

	<div class="text-center mb-12">
		<!-- Noten-Icon mit Pulsier-Animation -->
		<svg class="mx-auto h-20 w-auto text-pink-500 mb-4 animate-pulse-light" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M9 18V5l12-2v13"/>
			<circle cx="6" cy="18" r="3"/>
			<circle cx="18" cy="16" r="3"/>
		</svg>
		<!-- Titel mit hochgestelltem BETA-Label -->
		<h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 animate-fade-in-up">
			MelodyMentor Charts
			<sup class="ml-1 text-pink-600 text-base align-super font-bold">BETA</sup>
		</h1>
		<p class="text-lg text-gray-600 animate-fade-in-up animation-delay-200">Die aktuell beliebtesten KI-Songs aus allen Klassen.</p>
	</div>

	<!-- Hauptinhalt Container -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full mb-24">
		<!-- Linke Spalte: Globale Top-Songs (unverändert) -->
		<div class="bg-white p-6 rounded-xl shadow-xl animate-fade-in-up animation-delay-400">
			<h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">🏆 Top 10 🏆</h2>
			{#if data.topSongs && data.topSongs.length > 0}
				<ol class="space-y-4">
					{#each data.topSongs as song, i}
						<li class="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-b-0 animate-fade-in-up animation-delay-{600 + i * 100}">
							<div class="text-xl font-bold text-pink-500 w-8 text-right">{i + 1}.</div>
							<div class="flex-grow min-w-0">
								<a href="/klassen/{song.class_id}" class="text-base font-semibold text-gray-800 hover:text-pink-600 truncate block" title="{song.title}">
									{song.title}
								</a>
								<p class="text-sm text-gray-500 truncate" title="{song.artist} (Klasse: {song.class_name})">
									{song.artist} <span class="text-xs italic">- {song.class_name}</span>
								</p>
							</div>
							<div class="flex items-center gap-1 text-yellow-500 font-bold">
								<span>★</span>
								<span>{song.average_rating.toFixed(1)}</span>
							</div>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="text-center text-gray-500 py-8 animate-fade-in-up animation-delay-600">Noch keine bewerteten Songs vorhanden.</p>
			{/if}
		</div>

		<!-- Rechte Spalte: Aktionen -->
		<div class="flex flex-col gap-8">
			<!-- Box: Klasse beitreten (unverändert) -->
			<div class="bg-white p-8 rounded-xl shadow-xl self-start animate-fade-in-up animation-delay-500 w-full">
				<h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Klasse beitreten</h2>
				<p class="text-gray-600 mb-6 text-center">Gib den Code deiner Klasse ein:</p>
				<form method="POST" action="?/joinClass" use:enhance class="space-y-4">
					<div>
						<label for="classCode" class="sr-only">Klassencode</label>
						<input
							type="text"
							name="classCode"
							id="classCode"
							required
							placeholder="ABC-DEF"
							class="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center text-lg font-mono uppercase tracking-widest"
						/>
					</div>
					<button type="submit" class="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors shadow-lg text-lg">
						Los!
					</button>
					{#if form?.error && form?.action === '?/joinClass'}
						<p class="text-red-500 text-sm mt-2 text-center">{form.message}</p>
					{/if}
				</form>
			</div>

			<!-- Box: Für Lehrpersonen (Überarbeitet) -->
			<div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-8 rounded-xl shadow-xl self-start animate-fade-in-up animation-delay-600 w-full">
				<h2 class="text-2xl font-bold text-emerald-800 mb-3 text-center flex items-center justify-center gap-2">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>
					Für Lehrpersonen
				</h2>
				<p class="text-emerald-700 mb-6 text-center text-sm">
					Entdecken Sie Unterrichtsideen wie Gedichtvertonung, Soundtracks für LernFilme und mehr!
				</p>
				<div class="space-y-4">
					<a href="/login" class="block w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg text-lg text-center">
						Login / Dashboard
					</a>
					<a href="/materialien" class="block w-full bg-white text-emerald-800 border border-emerald-300 font-bold py-3 px-4 rounded-lg hover:bg-emerald-50 transition-colors shadow-lg text-lg text-center">
						Alle Unterrichtsmaterialien
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer (unverändert) -->
	<footer class="w-full bg-gradient-to-t from-gray-200 via-gray-100 to-transparent mt-auto py-8 px-4">
		<div class="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
			<div class="mb-4 md:mb-0">
				<p class="text-gray-600 text-sm">&copy; {new Date().getFullYear()} MelodyMentor. Alle Rechte vorbehalten.</p>
			</div>
			<nav class="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-2 text-sm text-gray-700 font-medium">
				<a href="/login" class="hover:text-pink-600">Lehrerlogin</a>
				<a href="/impressum" class="hover:text-pink-600">Impressum</a>
				<a href="/datenschutz" class="hover:text-pink-600">Datenschutz</a>
				<a href="/ueber-uns" class="hover:text-pink-600">Über uns</a>
				<a href="/faq" class="hover:text-pink-600">FAQ</a>
				<a href="/materialien" class="hover:text-pink-600">Materialien</a>
				<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="hover:text-pink-600" aria-label="Instagram">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
				</a>
			</nav>
		</div>
	</footer>

</div>

<style lang="postcss">
	/* Tailwind CSS Custom Keyframes for Animations */
	@keyframes pulse-light {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
	}

	@keyframes fade-in-up {
		0% {
			opacity: 0;
			transform: translateY(20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-pulse-light {
		animation: pulse-light 2s infinite ease-in-out;
	}

	.animate-fade-in-up {
		animation: fade-in-up 0.6s ease-out forwards;
		opacity: 0; /* Stellt sicher, dass das Element vor der Animation unsichtbar ist */
	}

	/* Hilfsklassen für verzögerte Animationen */
	.animation-delay-100 { animation-delay: 0.1s; }
	.animation-delay-200 { animation-delay: 0.2s; }
	.animation-delay-300 { animation-delay: 0.3s; }
	.animation-delay-400 { animation-delay: 0.4s; }
	.animation-delay-500 { animation-delay: 0.5s; }
	.animation-delay-600 { animation-delay: 0.6s; }
	.animation-delay-700 { animation-delay: 0.7s; }
	.animation-delay-800 { animation-delay: 0.8s; }
	.animation-delay-900 { animation-delay: 0.9s; }
	.animation-delay-1000 { animation-delay: 1.0s; }

</style>

