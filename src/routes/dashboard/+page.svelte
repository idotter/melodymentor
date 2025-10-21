<!--
  Dies ist die Hauptseite des Dashboards. Sie wird nur angezeigt,
  wenn der Benutzer erfolgreich eingeloggt ist.
-->
<script lang="ts">
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;
	const { user, classes } = data;
</script>

<div class="min-h-screen bg-gray-50 p-4 sm:p-8">
	<div class="max-w-5xl mx-auto">
		<!-- Header-Sektion -->
		<div class="flex justify-between items-center mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-800">Meine Klassen</h1>
				<p class="mt-1 text-gray-600">
					Willkommen zurück, <span class="font-semibold text-blue-600">{user?.email}</span>!
				</p>
			</div>
			<form method="POST" action="?/logout">
				<button
					type="submit"
					class="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-colors"
				>
					Ausloggen
				</button>
			</form>
		</div>

		<!-- Sektion zum Erstellen einer neuen Klasse -->
		<div class="bg-white p-6 rounded-lg shadow-md mb-8">
			<h2 class="text-xl font-bold mb-4">Neue Klasse erstellen</h2>
			<form method="POST" action="?/createClass" class="flex items-center gap-4">
				<input
					type="text"
					name="className"
					placeholder="Name der neuen Klasse (z.B. M+I Projekt 2025)"
					class="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					required
				/>
				<button
					type="submit"
					class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
				>
					Erstellen
				</button>
			</form>
			{#if form?.error}
				<p class="text-red-500 mt-2">{form.message}</p>
			{/if}
		</div>

		<!-- Liste der existierenden Klassen -->
		<div class="space-y-4">
			<h2 class="text-xl font-bold">Existierende Klassen</h2>
			{#if classes && classes.length > 0}
				{#each classes as cls}
					<a
						href="/klassen/{cls.id}"
						class="block bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-[1.02] transition-transform"
					>
						<div class="flex justify-between items-center">
							<div>
								<h3 class="text-lg font-bold text-gray-900">{cls.name}</h3>
								<p class="text-sm text-gray-500 font-mono mt-1">
									Klassencode: <span class="font-bold text-gray-700">{cls.class_code}</span>
								</p>
							</div>
							<span class="text-blue-500 font-semibold">Zur Hitparade &rarr;</span>
						</div>
					</a>
				{/each}
			{:else}
				<p class="text-gray-500 bg-white p-6 rounded-lg shadow-sm">
					Du hast noch keine Klassen erstellt.
				</p>
			{/if}
		</div>
	</div>
</div>

