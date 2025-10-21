// Diese Datei ist unser zentraler und einziger Punkt für die Supabase-Verbindung.
// Alle anderen Server-Dateien werden diesen Client importieren.
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Lese die öffentlichen Schlüssel direkt aus Sveltekits statischem Environment.
// Dies ist der korrekte Weg für Variablen, die mit PUBLIC_ beginnen.
const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY;

// Erstelle und exportiere den Supabase-Client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

