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

		<section>
			<h2 class="text-2xl font-bold text-gray-800 mb-3 border-b pb-2">Wichtige Hinweise</h2>
			<ul class="list-disc list-inside text-gray-700 space-y-2">
				<li>**Urheberrecht:** Beachten Sie die Nutzungsbedingungen der jeweiligen Tools, insbesondere bei der Weiterverwendung und Veröffentlichung der generierten Songs (AGBs prüfen!).</li>
				<li>**Datenschutz:** Klären Sie ab, welche Daten bei der Nutzung der Tools erfasst werden, insbesondere wenn Schüler\*innen eigene Accounts erstellen sollen.</li>
				<li>**Prompting:** Das Formulieren guter Prompts ist eine Schlüsselkompetenz. Fördern Sie das Experimentieren mit verschiedenen Anweisungen (Genre, Stimmung, Instrumente, Tempo etc.).</li>
			</ul>
		</section>
	</div>

	<!-- Optionaler Footer oder weiterer Abstand -->
	<div class="h-16"></div>

</div>

<style lang="postcss">
	/* Globale Stile aus app.css werden übernommen. */
	/* Hier können bei Bedarf spezifische Stile für diese Seite hinzugefügt werden. */
</style>
