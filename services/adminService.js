// todo: login, signup
const {createClient} = require('@supabase/supabase-js');
const { response } = require('express');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function signUp(name, email, password) {
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
        emailRedirectTo: 'http://localhost:4000/admin',
        data : {
            display_name: name
        }
    },
    
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
    return {error};
  }
  return {projects};
}

async function newProject(name, tags, img, desc, email) {
    const {data, error} = await supabaseAdmin.from('projects').insert({name: name, tags: tags, image: img, description: desc, email: email}).select();
    console.log(email);
    if (!error) {
        return {success: true, data: data}
    } else {
        return {success: false, error: error}
    }
}

async function getAllEvents() {
    let {data: events, error } = await supabaseAdmin.from('events').select('*');
    if (error) {
        return {error};
    }
    return {events};
}

async function newEvent(name, status, desc, img) {
    const {data, error} = await supabaseAdmin.from('events').insert({name: name, active: status, description: desc, image: img}).select();
    if (!error) {
        return {success: true, data: data}
    } else {
        return {success: false, error: error}
    }
}

async function delProject(name) {
    const {error} = await supabaseAdmin.from('projects').delete().eq('name', name);
    if (error) {
        return {deleted: false, error: error}
    } else {
        return {deleted: true};
    }
}

async function delEvent(name) {
    const {error} = await supabaseAdmin.from('events').delete().eq('name', name);
    if (error) {
        return {deleted: false, error: error}
    } else {
        return {deleted: true};
    }
}

async function editProject(name, tags, image, info, uemail) {
    const {data, error} = await supabaseAdmin.from('members').update({
        name: name,
        image: image,
        tags: tags,
        description: info
    }).eq('email', uemail).select();
    if (error) {
        return {
            error
        }
    }
    if (!data || data.length === 0) {
        return {
            error,
            message: "Couldn't update project"
        }
    }
    return {
        success: true
    }
}

async function getAnnouncements() {
    const {data, error} = await supabaseAdmin.from('announcements').select('*').order('created_at', {ascending: false}).limit(5);
    if (data && !error) {
        return {
            announcements: data,
            success: true
        }
    } 
    return {
        error: error,
        success: false
    }
}

async function newAnnouncement(announcement) {
    const {data, error} = await supabaseAdmin.from('announcements').insert({
        announcement: announcement
    }).select();
    if (data && !error) {
        return {
            success: true,
            data: response.data
        }
    }
    return {
        error: error
    }
}

async function deleteAnnouncement(announcement) {
    const {error} = await supabaseAdmin.from('announcements').delete().eq('announcement', announcement)
    if (!error) {
        return {
            success: true
        }
    }
    return {
        error: error
    }
}

async function getMembers() {
    const {data, error} = await supabaseAdmin.from('members').select('*').order('id', {ascending: true});
    if (!data && error) {
        return {
            error: error,
            success: false
        }
    }
    return {
        data: data,
        success: true
    }
}

async function filterMembers(email) {
    const {data, error} = await supabaseAdmin.from('members').select().eq('email', email);
    if (!data && error) {
        return {
            error: error,
            success: false
        }
    }
    return {
        data: data,
        success: true
    }
}

module.exports = {
  signUp,
  login,
  getAllProjs,
  newProject,
  getAllEvents,
  newEvent,
  delProject,
  delEvent,
  editProject,
  getAnnouncements,
  newAnnouncement,
  deleteAnnouncement,
  getMembers,
  filterMembers
}