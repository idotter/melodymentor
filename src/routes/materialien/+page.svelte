<!-- Seite für Unterrichtsmaterialien -->
<script lang="ts">
	// Diese Seite benötigt vorerst keine spezifische Logik im Script-Teil.
	// Wir können hier später Daten laden, falls die Materialien dynamisch sein sollen.
</script>

<div class="relative min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-start pt-16 px-4">

	<!-- Optional: Zurück-Link zur Startseite -->
	<div class="absolute top-6 left-6 z-10">
		<a href="/" class="text-pink-600 hover:text-pink-800 font-medium flex items-center gap-1 group">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
			Zurück
		</a>
	</div>

	<div class="text-center mb-12">
		<!-- Optional: Ein passendes Icon -->
		<svg class="mx-auto h-20 w-auto text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
		<h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">Unterrichtsmaterialien</h1>
		<p class="text-lg text-gray-600">Ideen und Ressourcen für den Einsatz von KI-Musik im Unterricht.</p>
	</div>

	<div class="bg-white p-8 rounded-xl shadow-xl max-w-3xl w-full space-y-6">
		<section>
			<h2 class="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">Einführung in KI-Musikgeneratoren</h2>
			<p class="text-gray-700 leading-relaxed">
				KI-Musikgeneratoren wie Suno, Udio oder AIVA ermöglichen es, Musikstücke basierend auf Texteingaben (Prompts) zu erstellen. Dies eröffnet spannende Möglichkeiten für den M+I-Unterricht, um Kreativität, technisches Verständnis und Medienkompetenz zu fördern.
			</p>
			<!-- Weitere Inhalte hier -->
		</section>

		<section>
			<h2 class="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">Unterrichtsideen</h2>
			<ul class="list-disc list-inside text-gray-700 space-y-2">
				<li>**Gedichtvertonung:** Schüler\*innen schreiben ein Gedicht und vertonen es anschliessend mit einer KI im passenden Stil.</li>
				<li>**Soundtrack für eine Geschichte:** Eine Kurzgeschichte wird geschrieben und mit passender Hintergrundmusik unterlegt.</li>
				<li>**Themen-Songs:** Songs zu aktuellen Unterrichtsthemen (z.B. Wasserkreislauf, Französische Revolution) erstellen lassen und analysieren.</li>
				<li>**Genre-Experimente:** Einen einfachen Textprompt in verschiedenen Musikstilen generieren lassen und die Unterschiede besprechen.</li>
				<li>**Prompt-Engineering-Challenge:** Wer erzeugt mit dem besten Prompt das eindrucksvollste Stück Musik zu einem vorgegebenen Thema?</li>
			</ul>
		</section>

		<section>
			<h2 class="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">Empfohlene Tools</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="border p-4 rounded-lg">
					<h3 class="font-semibold mb-1">Suno AI</h3>
					<p class="text-sm text-gray-600">Sehr benutzerfreundlich, gut für Einsteiger, erzeugt oft auch Gesang.</p>
					<a href="https://suno.ai/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline text-sm mt-2 inline-block">Besuchen &rarr;</a>
				</div>
				<div class="border p-4 rounded-lg">
					<h3 class="font-semibold mb-1">Udio</h3>
					<p class="text-sm text-gray-600">Ähnlich wie Suno, ebenfalls mit Gesangsoptionen, hohe Qualität.</p>
					<a href="https://www.udio.com/" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:underline text-sm mt-2 inline-block">Besuchen &rarr;</a>
				</div>
				<!-- Weitere Tools hinzufügen -->
			</div>
		</section>

		<!-- NEUER, HERVORGEHOBENER BLOCK -->
		<section class="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
			<h2 class="text-2xl font-bold text-blue-800 mb-3 flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
				Lernziele & Wichtige Aspekte
			</h2>

			<div class="text-blue-900 leading-relaxed">
				<p class="mb-4">
					Das Erstellen von KI-Songs im Unterricht fördert vielfältige Kompetenzen gemäss Lehrplan 21. Schüler\*innen setzen sich aktiv mit Technologie auseinander (MI.1), produzieren eigene Medieninhalte (MI.2) und reflektieren über deren Wirkung und gesellschaftliche Aspekte wie das Urheberrecht (MI.3). Sie lernen, digitale Werkzeuge kreativ zu nutzen (Anwendungskompetenzen) und entwickeln ein Verständnis für die Funktionsweise von KI (Orientierungswissen). Im Fach Musik können die erstellten Werke analysiert (MU.4 Hören und sich orientieren) und als Basis für weiteres Gestalten (MU.5 Gestalten und Improvisieren) genutzt werden.
				</p>
				<h3 class="font-semibold mb-2 text-lg">Besonders zu beachten:</h3>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
					<div class="bg-white p-3 rounded shadow">
						<strong class="text-blue-700 block mb-1">⚖️ Urheberrecht:</strong> Klären Sie die AGBs der Tools! Wem gehören die Songs? Dürfen sie geteilt/veröffentlicht werden? (MI.3)
					</div>
					<div class="bg-white p-3 rounded shadow">
						<strong class="text-blue-700 block mb-1">🔒 Datenschutz:</strong> Welche Daten werden erfasst? Sind anonyme Nutzungen möglich oder braucht es Accounts? (MI.1, MI.3)
					</div>
					<div class="bg-white p-3 rounded shadow">
						<strong class="text-blue-700 block mb-1">✍️ Prompting:</strong> Das Formulieren präziser Anweisungen (Genre, Stimmung, Instrumente) ist eine Schlüsselkompetenz und erfordert Übung. (Anwendungskompetenzen, Sprache)
					</div>
					<div class="bg-white p-3 rounded shadow">
						<strong class="text-blue-700 block mb-1">💡 Kreativität & Kritik:</strong> Ermutigen Sie zum Experimentieren, aber auch zur kritischen Reflexion über die Ergebnisse und den kreativen Prozess mit KI. (MI.2, MU.5)
					</div>
				</div>
			</div>
		</section>

	</div>

	<!-- Optionaler Footer oder weiterer Abstand -->
	<div class="h-16"></div>

</div>

<style lang="postcss">
	/* Globale Stile aus app.css werden übernommen. */
	/* Hier können bei Bedarf spezifische Stile für diese Seite hinzugefügt werden. */
</style>

