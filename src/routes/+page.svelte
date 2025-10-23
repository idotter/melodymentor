<!-- Zeigt globale Hitparade UND Beitrittsformular für nicht eingeloggte User -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData; // Für Fehlermeldungen des Beitrittsformulars

	// data.user ist hier immer null oder anonym
	// data.topSongs enthält die Liste der Top-Songs
</script>

<div class="relative min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-start pt-16 px-4 overflow-hidden">
	<!-- Angepasstes Schräges Banner oben rechts -->
	<div class="absolute top-0 right-0 w-48 h-48 overflow-hidden z-50 pointer-events-none">
		<!-- KORREKTUR: Rotation geändert von -rotate-45 zu rotate-45 -->
		<a href="/login" class="absolute block w-[200%] transform rotate-45 bg-pink-600 text-white text-center py-2 shadow-lg transition-colors duration-300 ease-in-out whitespace-nowrap pointer-events-auto hover:bg-pink-700" style="top: 50px; right: -50px;"> {/* Position leicht angepasst */}
			<span class="block text-sm font-bold uppercase tracking-wider">BETA</span>
		</a>
	</div>


	<div class="text-center mb-12">
		<!-- Noten-Icon mit Pulsier-Animation -->
		<svg class="mx-auto h-20 w-auto text-pink-500 mb-4 animate-pulse-light" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M9 18V5l12-2v13"/>
			<circle cx="6" cy="18" r="3"/>
			<circle cx="18" cy="16" r="3"/>
		</svg>
		<!-- Titel mit subtiler Animation -->
		<h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 animate-fade-in-up">MelodyMentor Charts</h1>
		<p class="text-lg text-gray-600 animate-fade-in-up animation-delay-200">Die aktuell beliebtesten KI-Songs aus allen Klassen.</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full">
		<!-- Linke Spalte: Globale Top-Songs -->
		<div class="bg-white p-6 rounded-xl shadow-xl animate-fade-in-up animation-delay-400">
			<h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">🏆 Top 10 🏆</h2>
			{#if data.topSongs && data.topSongs.length > 0}
				<ol class="space-y-4">
					{#each data.topSongs as song, i}
						<li class="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-b-0 animate-fade-in-up animation-delay-{600 + i * 100}">
							<div class="text-xl font-bold text-pink-500 w-8 text-right">{i + 1}.</div>
							<div class="flex-grow min-w-0">
								<!-- Link zur spezifischen Klassenseite -->
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
			<!-- Box: Klasse beitreten -->
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

			<!-- Box: Für Lehrpersonen -->
			<div class="bg-white p-8 rounded-xl shadow-xl self-start animate-fade-in-up animation-delay-600 w-full">
				<h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">Für Lehrpersonen</h2>
				<div class="space-y-4">
					<a href="/login" class="block w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg text-lg text-center">
						Login
					</a>
					<a href="/materialien" class="block w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors shadow-lg text-lg text-center">
						Unterrichtsmaterialien
					</a>
				</div>
			</div>
		</div>
	</div>
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

	/* Anpassung für das schräge Banner */
	/* (Der Großteil ist inline via Tailwind, hier ggf. komplexere Styles) */
</style>

