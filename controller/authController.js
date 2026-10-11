const express = require('express');
const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const authService = require('../services/authService');
const { subscribe } = require('../routes/member');

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
            req.accessToken = accessToken;
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
    req.user = refresh.data.user;
    req.accessToken = refresh.data.session.access_token;
    next();
}

async function signIn(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const request = await authService.login(email, password);
    if (!request.loggedIn) {
        return res.json({
            loggedIn: false,
            error: request.error,
        })
    }
    res.cookie('access_token', request.data.session.access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 3600000
    })
    res.cookie('refresh_token', request.data.session.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    })
    const subsReq = await authService.subscribeDefault(email);
    if (subsReq.success) {
        return res.json({
            loggedIn: true,
            data: request.data,
            subscriptions: subsReq.success
        })
    }
    return res.json({
        loggedIn: true,
        data: request.data,
        subscriptions: false
    })
    
}

async function signUp(req, res) {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const request = await authService.signUp(name, email, password);
        if (!request.loggedIn || request.error) {
            return res.json({
                loggedIn: false,
                error: request.error,
                data: request.data
            })
        }
        res.cookie('access_token', request.data.session.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000
        })
        res.cookie('refresh_token', request.data.session.refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        })
        const subsReq = await authService.subscribeDefault(email);
        if (subsReq.success) {
            return res.json({
                loggedIn: true,
                data: request.data,
                subscriptions: subsReq.success
            })
        }
        return res.json({
            loggedIn: true,
            data: request.data,
            subscriptions: false
        })
    } catch (err) {
        console.error("signup error", err);
        return res.status(500).json({
            loggedIn: false,
            error: err.message
        })
    }
    
}

async function updatePwd(req, res) {
    const currentPwd = req.body.current_password;
    const newPwd = req.body.new_password;
    const email = req.user.email;
    const response = await authService.updatePwd(currentPwd, newPwd, req.user.id, email);
    if (response.success === true || !response.error) {
        return res.json({
            success: true,
            message: response.message
        })
    }
    return res.json({
        success: false,
        message: response.message || response.err_message,
    })
}

async function logout(req, res) {
    const accessToken = req.access_token;
    const userSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    })
    const {error} = await userSupabase.auth.signOut({
        scope: 'local'
    });
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    });

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    });
    if (error) {
        return  res.json({
            error: error,
            message: error.message,
            success: false
        })
    }
    return res.json({
        success: true,
        message: 'Logged Out'
    })
}

module.exports = {
    signIn,
    signUp,
    requireAuth,
    updatePwd,
    logout
}