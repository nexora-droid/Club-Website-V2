const express = require('express');
const authService = require('../services/authService');

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
    return res.json({
        loggedIn: true,
        data: request.data
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
        return res.json({
            loggedIn: true,
            data: request.data
        })
    } catch (err) {
        console.error("signup error", err);
        return res.status(500).json({
            loggedIn: false,
            error: err.message
        })
    }
    
}

module.exports = {
    signIn,
    signUp
}