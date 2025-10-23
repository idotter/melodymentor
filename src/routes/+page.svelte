<!-- Zeigt globale Hitparade UND Beitrittsformular für nicht eingeloggte User -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData; // Für Fehlermeldungen des Beitrittsformulars

	// data.user ist hier immer null oder anonym
	// data.topSongs enthält die Liste der Top-Songs
</script>

<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-start pt-16 px-4">
	<div class="text-center mb-12">
		<svg class="mx-auto h-20 w-auto text-pink-500 mb-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
		<h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">MelodyMentor Charts</h1>
		<p class="text-lg text-gray-600">Die aktuell beliebtesten KI-Songs aus allen Klassen.</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full">
		<!-- Linke Spalte: Globale Top-Songs -->
		<div class="bg-white p-6 rounded-xl shadow-xl">
			<h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">🏆 Top 10 🏆</h2>
			{#if data.topSongs && data.topSongs.length > 0}
				<ol class="space-y-4">
					{#each data.topSongs as song, i}
						<li class="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-b-0">
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
				<p class="text-center text-gray-500 py-8">Noch keine bewerteten Songs vorhanden.</p>
			{/if}
		</div>

		<!-- Rechte Spalte: Klasse beitreten -->
		<div class="bg-white p-8 rounded-xl shadow-xl self-start">
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
				{#if form?.error}
					<p class="text-red-500 text-sm mt-2 text-center">{form.message}</p>
				{/if}
			</form>
		</div>
	</div>
	<!-- Optional: Link für Lehrer zum Login -->
	<div class="mt-12 text-center">
		<a href="/login" class="text-sm text-gray-600 hover:text-pink-600">Login für Lehrpersonen</a>
	</div>
</div>

