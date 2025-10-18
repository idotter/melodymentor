import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/supabaseClient';

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // --- Einfache Validierung ---
        if (!fullName || !email || !password) {
            return fail(400, {
                message: 'Bitte alle Felder ausfüllen.',
                success: false
            });
        }

        if (password.length < 8) {
            return fail(400, {
                message: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
                success: false
            });
        }
        
        // --- Registrierung bei Supabase ---
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Hier speichern wir den vollen Namen in den Metadaten des Benutzers
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            // Wenn der Benutzer bereits existiert, gibt Supabase einen spezifischen Fehler zurück
            if (error.message.includes('User already registered')) {
                 return fail(400, {
                    message: 'Diese E-Mail-Adresse ist bereits registriert.',
                    success: false
                });
            }
            return fail(500, {
                message: `Serverfehler: ${error.message}`,
                success: false
            });
        }

        // --- Erfolgreiche Registrierung ---
        // Nach erfolgreicher Registrierung leiten wir den Benutzer zur Login-Seite weiter.
        // Supabase sendet standardmässig eine Bestätigungs-E-Mail.
        throw redirect(303, '/login?registered=true');
    }
};

