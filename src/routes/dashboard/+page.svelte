<!--
  Dies ist die Hauptseite des Dashboards. Sie wird nur angezeigt,
  wenn der Benutzer erfolgreich eingeloggt ist.
-->
<script lang="ts">
	import type { PageData } from './$types';

	// Empfange die Benutzerdaten, die vom Layout-Server (`+layout.server.ts`) übergeben wurden.
	export let data: PageData;
	const { user } = data;
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
		<h1 class="text-3xl font-bold text-gray-800">Willkommen im Dashboard!</h1>
		<p class="mt-2 text-gray-600">Du bist erfolgreich angemeldet als:</p>

		<!-- Zeige die E-Mail des angemeldeten Benutzers an -->
		{#if user}
			<p class="mt-1 text-lg font-semibold text-blue-600">{user.email}</p>
		{/if}

		<!-- Logout-Button in einem Formular -->
		<form method="POST" action="?/logout" class="mt-6">
			<button
				type="submit"
				class="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-colors"
			>
				Ausloggen
			</button>
		</form>
	</div>
</div>
