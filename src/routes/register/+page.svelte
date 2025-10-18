<script lang="ts">
    import type { ActionData } from './$types';

    // Diese Variable nimmt Fehlermeldungen oder Erfolgsnachrichten vom Server entgegen
    export let form: ActionData;
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
    <div class="max-w-md w-full mx-auto">
        <div class="flex items-center justify-center space-x-3 mb-8">
            <svg class="h-12 w-12 text-pink-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <h1 class="text-4xl font-extrabold text-gray-900">Konto erstellen</h1>
        </div>
        
        <div class="bg-white p-8 mt-6 mb-4 rounded-xl shadow-lg">
            <form method="POST" class="space-y-6">
                <div>
                    <label for="fullName" class="text-sm font-bold text-gray-600 block">Vollständiger Name</label>
                    <input id="fullName" name="fullName" type="text" required class="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Martina Muster">
                </div>
                <div>
                    <label for="email" class="text-sm font-bold text-gray-600 block">E-Mail-Adresse</label>
                    <input id="email" name="email" type="email" required autocomplete="email" class="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="martina.muster@schule.ch">
                </div>
                <div>
                    <label for="password" class="text-sm font-bold text-gray-600 block">Passwort</label>
                    <input id="password" name="password" type="password" required minlength="8" class="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Mindestens 8 Zeichen">
                </div>
                
                {#if form?.message}
                    <div class="p-3 rounded-lg text-center font-semibold" 
                         class:bg-red-100={!form.success} 
                         class:text-red-700={!form.success}
                         class:bg-green-100={form.success}
                         class:text-green-700={form.success}>
                        {form.message}
                    </div>
                {/if}

                <div>
                    <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-transform hover:scale-105">
                        Registrieren
                    </button>
                </div>
            </form>

            <div class="text-center mt-6">
                <p class="text-sm text-gray-600">
                    Bereits ein Konto? <a href="/login" class="font-bold text-pink-600 hover:underline">Hier einloggen</a>
                </p>
            </div>
        </div>
    </div>
</div>
