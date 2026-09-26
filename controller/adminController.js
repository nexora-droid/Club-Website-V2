const { createClient } = require('@supabase/supabase-js');
const adminService = require('../services/adminService');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
async function login(req, res) {
    const {email, password} = req.body;
    const result = await adminService.login(email, password);
    if (!result.loggedIn) {
        return res.json({
            login: 'F',
            result: result.data
        })
    }
    res.cookie('access_token', result.data.session.access_token, {
        httpOnly: true,
        secure: false, // change to true once hosted
        sameSite: 'strict',
        maxAge: 3600000
    })
    res.cookie('refresh_token', result.data.session.refresh_token, {
        httpOnly: true,
        secure: false, // change to true once hosted
        sameSite: 'strict',
    })
    return res.json({
        login: 'S',
        result: result.data
    })
};

async function signup(req, res) {
    const {email, password} = req.body;
    const result = await adminService.signUp(email, password);
    if (!result.allowed) {
        return res.json({
            auth: 'Error',
            result: result.error
        })
    }
    if (result.error) {
        return res.json({
            auth: 'Error',
            result: result.error
        })
    }
    res.cookie('access_token', result.data.session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 3600000
    })
    res.cookie('refresh_token', result.data.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    })
    return res.json({
        auth: 'Success',
        result: result.data
    })
};

async function checkAuth(req, res) {
    console.log('checkauth reached')
    if (!req.cookies) {
        return res.json({
            authenticated: false,
            error: 401,
            message: "Not logged in"
        })
    }
    const refreshToken = req.cookies.refresh_token;
    const accessToken = req.cookies.access_token;
    if (!accessToken && !refreshToken) { 
        return res.json({
            authenticated: false,
            error: 401,
            message: "Not logged in"
        })
    }
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: false
            }
        });
    let data;
    if (accessToken) {
        const result = await supabaseClient.auth.getUser(accessToken);
        data = result.data;
        if (!result.error && data.user) {
            return res.json({
                authenticated: true,
                user: data.user
            })
        }
    }         
    const refresh = await supabaseClient.auth.refreshSession({
        refresh_token: refreshToken
    })
    if (refresh.error || !refresh.data.session) {
        return res.status(401).json({
            authenticated: false
        })
    }
    res.cookie('access_token', refresh.data.session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 3600000
    })
    res.cookie('refresh_token', refresh.data.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    }) 
    data = {
        user: refresh.data.user
    }
    return res.json({
        authenticated: true,
        user: data.user
    })     
}   

async function addProject(req, res) {
    let {name, tags, img, desc} = req.body;
    const request = await adminService.newProject(name, tags, img, desc);
    if (request.success) {
        return {
            added: true,
            data: request.data
        }
    }
    return {
        added: false,
        error: request.error
    }
}

async function getProjects(req, res) {
    const request = await adminService.getAllProjs();
    if (request.error) {
        return res.status(404).json({
            error: request.error,
            status: 404
        });
    }
    return res.json(request.projects);
}

module.exports = {
    login,
    signup,
    checkAuth,
    addProject,
    getProjects
};