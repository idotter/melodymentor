<!-- Behebt das RLS-Problem, indem der fetch-Aufruf korrekt authentifiziert wird -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;
	// Die 'form'-Variable wird nur noch für Fehleranzeige ODER *andere* Actions (Löschen, Bewerten) benötigt
	export let form: ActionData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let currentlyPlayingUrl: string | null = null;
	let audioPlayer: HTMLAudioElement;
	let isUploading = false;

	function playSong(path: string) {
		const {
			data: { publicUrl }
		} = supabase.storage.from('songs').getPublicUrl(path);

		if (audioPlayer && currentlyPlayingUrl === publicUrl) {
			audioPlayer.pause();
			currentlyPlayingUrl = null;
		} else {
			if (audioPlayer) audioPlayer.pause();
			audioPlayer.src = publicUrl;
			audioPlayer.play();
			currentlyPlayingUrl = publicUrl;
		}
	}

	// Manuelle Upload-Funktion
	async function handleUpload(event: SubmitEvent) {
		console.log('handleUpload gestartet'); // **DEBUGGING**

		if (!session) {
			console.error('handleUpload Fehler: Nicht eingeloggt'); // **DEBUGGING**
			form = { error: true, message: 'Du musst eingeloggt sein, um hochzuladen.' };
			return;
		}

		isUploading = true;
		form = undefined;

		const formData = new FormData(event.target as HTMLFormElement);
		const audioFile = formData.get('audioFile') as File;
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;

		if (!title || !artist || !audioFile || !audioFile.size) {
			console.error('handleUpload Fehler: Fehlende Daten'); // **DEBUGGING**
			form = { error: true, message: 'Alle Felder und eine Audio-Datei sind erforderlich.' };
			isUploading = false;
			return;
		}

		const sanitizedFileName = audioFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		const filePath = `${session.user.id}/${data.classData?.id}/${Date.now()}-${sanitizedFileName}`;
		console.log('Dateipfad generiert:', filePath); // **DEBUGGING**

		// 1. Direkter Upload
		console.log('Versuche direkten Upload zu Supabase Storage...'); // **DEBUGGING**
		const { error: uploadError } = await supabase.storage
			.from('songs')
			.upload(filePath, audioFile);

		if (uploadError) {
			console.error('Supabase Storage Upload Error:', uploadError); // **DEBUGGING**
			form = { error: true, message: 'Datei konnte nicht hochgeladen werden: ' + uploadError.message };
			isUploading = false;
			return;
		}
		console.log('Upload zu Storage erfolgreich!'); // **DEBUGGING**

		// 2. Metadaten senden
		const metadataForm = new FormData();
		metadataForm.append('title', title);
		metadataForm.append('artist', artist);
		metadataForm.append('filePath', filePath);
		console.log('Sende Metadaten an Server Action "?/saveSongMetadata"...'); // **DEBUGGING**

		try {
			const response = await fetch('?/saveSongMetadata', {
				method: 'POST',
				body: metadataForm
			});
			console.log('Antwort vom Server erhalten:', response.status, response.statusText); // **DEBUGGING**

			// Verarbeitung der Antwort
			if (!response.ok) {
				let errorMessage = 'Song konnte nicht in der DB gespeichert werden.';
				try {
					const errorResult = await response.json();
					console.error('Server Action Fehler-Antwort:', errorResult); // **DEBUGGING**
					errorMessage = errorResult.message || errorMessage;
				} catch (e) {
					console.error('Fehler beim Parsen der Fehler-Antwort:', e); // **DEBUGGING**
				}
				form = { error: true, message: errorMessage };
				console.log('Versuche, hochgeladene Datei wieder zu löschen...'); // **DEBUGGING**
				await supabase.storage.from('songs').remove([filePath]);
			} else {
				const result = await response.json();
				console.log('Server Action Erfolgs-Antwort:', result); // **DEBUGGING**
				if (result.success) {
					console.log('Alles erfolgreich, lade Daten neu...'); // **DEBUGGING**
					invalidateAll();
					(event.target as HTMLFormElement).reset();
				} else {
					form = { error: true, message: result.message || 'Song konnte nicht in der DB gespeichert werden.' };
					console.log('Versuche, hochgeladene Datei wieder zu löschen...'); // **DEBUGGING**
					await supabase.storage.from('songs').remove([filePath]);
				}
			}
		} catch (fetchError) {
			console.error('Netzwerkfehler beim Senden der Metadaten:', fetchError); // **DEBUGGING**
			form = { error: true, message: 'Netzwerkfehler beim Speichern der Song-Details.' };
			console.log('Versuche, hochgeladene Datei wieder zu löschen...'); // **DEBUGGING**
			await supabase.storage.from('songs').remove([filePath]);
		}

		isUploading = false;
		console.log('handleUpload beendet'); // **DEBUGGING**
	}

	// Dieser Block ist für andere Actions (Löschen, Bewerten)
	$: if (form?.success) {
		console.log("Form success detected (Delete/Rate?), invalidating data..."); // Debugging
		invalidateAll();
		form = undefined;
	}


	onMount(() => {
		({ supabase, session } = data);
	});
</script>

<!-- Der Rest des HTML bleibt unverändert -->
<!-- ... -->

