import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	/**
	 * It's convenient to create a Supabase client (`supabase`) on the client side,
	 * so that you can call Supabase from anywhere in your components.
	 */
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			get(key) {
				// This is the crucial part. We only try to read cookies in the browser.
				// On the server, we use the session data passed from `+layout.server.ts`.
				if (!isBrowser()) {
					return JSON.stringify(data.session);
				}

				const cookie = parse(document.cookie);
				return cookie[key];
			}
		}
	});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads from `data.session`, so it won't make
	 * any Supabase call.
	 */
	const {
		data: { session }
	} = await supabase.auth.getSession();

	return { supabase, session, user: session?.user ?? null };
};

