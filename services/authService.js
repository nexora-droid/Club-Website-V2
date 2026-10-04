const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function login(email, password) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    if (data.user && !error) {
        return {
            loggedIn: true,
            data: data,
        }
    }
    return {
        loggedIn: false,
        error: error,
        data
    }
}

async function signUp(name, email, password) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: name
            }
        }
    })
    if (data.user && !error) {
        return {loggedIn: true, data}
    }
    return {
        loggedIn: false,
        data,
        error
    }
}

module.exports = {
    login,
    signUp
}