import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "seadox-shared/database.types";


export default function supabase() {
    return new SupabaseClient<Database>(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_API_KEY!
    );
}