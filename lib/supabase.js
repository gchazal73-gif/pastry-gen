import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/* Sans identifiants, on n'instancie pas. createClient lève « supabaseUrl is
   required » au chargement du module, donc pendant le prérendu de
   /ingredients : le build échoue avant qu'une seule requête soit tentée.
   Une base absente doit donner une bibliothèque vide, pas un déploiement mort.
   Le reste de l'application ne touche pas à Supabase. */
export const supabaseActif = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseActif
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
