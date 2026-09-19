// todo: login, signup
const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        emailRedirectTo: 'http://localhost:4000/admin'
    }
  })
  return {data, error}
}

module.exports = {
    signUp
}