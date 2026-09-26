// todo: login, signup
const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function signUp(email, password) {
  const { data: alData , error: alError} = await supabaseAdmin.from('admin_allowlist').select('email').eq('email', email).maybeSingle();
  if (alError) {
    return {
      allowed: 'false',
      error: alError
    }
  }
  if (!alData) {
    return {
      allowed: 'false',
      error: 'User not allowed to make account'
    }
  }
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        emailRedirectTo: 'http://localhost:4000/admin'
    }
  })
  return { 
    allowed: 'True', 
    data, 
    error 
  }
}

async function login(email, password) {
  const {data, error} = await supabase.auth.signInWithPassword({
      email: email, 
      password: password,
      options: {
        emailRedirectTo: 'http://localhost:4000/admin'
      }
    }
  );
  if (!data || error) {
    return {
      loggedIn: false,
      data,
      error
    }
  }
  return {
    loggedIn: true,
    data,
    error
  }
}

async function getAllProjs() {
  let {data: projects, error} =  await supabaseAdmin.from('projects').select('*');
  if (error) {
    return error
  }
  return projects
}
//changed settings for indent size
async function newProject(name, tags, img, desc) {
    const {data, error} = await supabaseAdmin.from('projects').insert({id: 1, name: name, tags: tags, image: img, description: desc}).select();
    if (!error) {
        return {success: true, data: data}
    } else {
        return {success: false, error: error}
    }
}

module.exports = {
  signUp,
  login,
  getAllProjs,
  newProject
}