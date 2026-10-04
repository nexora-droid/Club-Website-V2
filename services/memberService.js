const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function findMeetings() {
    const today = new Date().toISOString().split('T')[0];
    const {data, error} = await supabase.from('meetings').select('*').gte('date', today).order('date', {ascending: true}).limit(3);
    if (data && !error) {
        return {
            meetings: data,
            success: true
        }
    }
    return {
        error: error,
        success: false
    }
}

module.exports = {
    findMeetings
}