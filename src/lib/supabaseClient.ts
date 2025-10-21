// Diese Datei ist unser zentraler und einziger Punkt für die Supabase-Verbindung.
// Alle anderen Server-Dateien werden diesen Client importieren.
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// Lese die geheimen Schlüssel aus den Umgebungsvariablen.
// WICHTIG: Verwende '$env/dynamic/private' für serverseitigen Code.
const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

