const { createClient } = require('@supabase/supabase-js');
const adminService = require('../services/adminService');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');
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
    const {name, email, password} = req.body;
    const result = await adminService.signUp(name, email, password);
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

async function requireAuth(req, res, next) {
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
            req.user = data.user;
            return next();
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
    req.user = refresh.data.user
    next();
}

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
    let {name, tags, img, desc, adding} = req.body;
    const request = await adminService.newProject(name, tags, img, desc);
    if (request.success) {
        return res.json({
            added: true,
            data: request.data
        })
    }
    return res.json({
        added: false,
        error: request.error
    })
}

async function delProject(req, res) {
    let name = req.body.name;
    console.log('Request to delete: ', name);
    const request = await adminService.delProject(name);
    console.log('Response', request)
    if (request.deleted === true) {
        return res.json({
            deleted: true
        })
    } else {
        return res.json({
            deleted: false,
            error: request.error
        })
    }
}

async function delEvent(req, res) {
    let name = req.body.name;
    console.log('Request to delete: ', name);
    const request = await adminService.delEvent(name);
    console.log('Response', request)
    if (request.deleted === true) {
        return res.json({
            deleted: true
        })
    } else {
        return res.json({
            deleted: false,
            error: request.error
        })
    }
}

async function getProjects(req, res) {
    const request = await adminService.getAllProjs();
    if (request.error) {
        return res.status(500).json({
            error: request.error,
        });
    }
    return res.json(request.projects);
}

async function getEvents(req, res) {
    const request = await adminService.getAllEvents();
    if (request.error) {
        return res.status(500).json({
            error: request.error
        })
    }
    return res.json(request.events);
}

async function addEvents(req, res) {
    let {name, status, img, desc} = req.body;
    const request = await adminService.newEvent(name, status, desc, img);
    if (request.success) {
        return res.json({
            added: true,
            data: request.data
        })
    }
    return res.json({
        added: false,
        error: request.error
    })
}

async function sendMsg(req, res) {
    console.log(req.body);
    const subject = req.body.subject; 
    const email = req.body.email;
    const message = req.body.message;
    // use slice(15) to get only HEX part of code.
    const ticketId = `CLUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.CLUB_EMAIL,
            pass: process.env.CLUB_APP_PASS
        }
    });
    const mailOptions = {
        from: process.env.CLUB_EMAIL,
        to: process.env.CLUB_EMAIL,
        subject: `Ticket - ${ticketId.slice(14)}`,
        text: `A new ticket has popped up! \nTicket ID: ${ticketId} \nSender: ${email} \nSubject: ${subject} \nTicket Content: \n${message} \n`,
        replyTo: email
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        return res.json({
            reply: info,
        })
    } catch (err) {
        return res.json({
            error: err
        })
    }
}

module.exports = {
    login,
    signup,
    checkAuth,
    addProject,
    getProjects,
    getEvents,
    addEvents,
    requireAuth,
    delProject,
    delEvent,
    sendMsg
};