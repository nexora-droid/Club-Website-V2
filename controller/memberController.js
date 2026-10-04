const { createClient } = require('@supabase/supabase-js');
const memberService = require('../services/memberService')
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;


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

async function getMeetings(req, res) {
    const response = await memberService.findMeetings();
    if (response.error) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true,
        data: response.meetings
    })
}

async function getEvents(req, res) {
    const response = await memberService.findEvents();
    if (response.error) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true,
        data: response.events
    })
}

async function getProjects(req, res) {
    const name = req.query.member;
    const response = await memberService.findProjects(name);
    if (response.error) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true,
        data: response.projects
    })
}

async function getAnnouncements(req, res) {
    const response = await memberService.getAnnouncements();
    if (response.error) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true,
        data: response.announcements
    })
}

module.exports = {
    checkAuth,
    getMeetings,
    getEvents,
    getMeetings,
    getProjects,
    getAnnouncements
}