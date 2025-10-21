// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			user: User | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};

