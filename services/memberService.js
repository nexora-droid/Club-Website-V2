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

async function findEvents() {
    const today = new Date().toISOString().split('T')[0];
    const {data, error} = await supabase.from('events').select('*').eq("active", true).lte('start_date', today).order('start_date', {ascending: false}).limit(2);
    if (data && !error) {
        return {
            events: data,
            success: true
        }
    }
    return {
        error: error,
        success: false
    }
}

async function findProjects(name) {
    const today = new Date().toISOString().split('T')[0];
    const {data, error} = await supabase.from('projects').select('*').ilike('member', name).lte('created_at', today).order('created_at', {ascending: false}).limit(2);
    if (data && !error) {
        return {
            projects: data,
            success: true
        }
    }
    return {
        error: error,
        success: false
    }
}

module.exports = {
    findMeetings,
    findEvents,
    findProjects
}