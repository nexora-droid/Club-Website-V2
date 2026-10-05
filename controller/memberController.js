const { createClient } = require('@supabase/supabase-js');
const memberService = require('../services/memberService');
require('dotenv').config();
const {OpenRouter} = await import("@openrouter/sdk");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const AI_KEY = process.env.HCAIKEY;
const client = new OpenRouter({
  apiKey: AI_KEY,
  serverURL: "https://ai.hackclub.com/proxy/v1",
});
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

async function getAuth(req, res) {
    console.log('checkauth reached')
    if (!req.cookies) {
        return {
            authenticated: false,
            error: 401,
            message: "Not logged in"
        }
    }
    const refreshToken = req.cookies.refresh_token;
    const accessToken = req.cookies.access_token;
    if (!accessToken && !refreshToken) { 
        return {
            authenticated: false,
            error: 401,
            message: "Not logged in"
        }
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
            return {
                authenticated: true,
                user: data.user
            }
        }
    }         
    const refresh = await supabaseClient.auth.refreshSession({
        refresh_token: refreshToken
    })
    if (refresh.error || !refresh.data.session) {
        return {
            authenticated: false
        }
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
    return {
        authenticated: true,
        user: data.user
    }
}

async function requireAuth(req, res, next) {
    const auth = await getAuth(req, res); // your actual auth-checking logic

    if (!auth.authenticated) {
        return res.redirect('/404');
    }

    req.user = auth.user;
    next();
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

async function getUsers(req, res) {
    const response = await memberService.getUsers();
    if (response.error) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true,
        data: response.members
    })
}

async function leaderboard(req, res) {
    const response = await memberService.leaderboard();
    if (response.error) {
        return res.json({
            error: reply.error
        })
    }
    return res.json(response.leaderboard)
}

// async function sendMsg(req, res) {
//     const msg = req.body.message;
//     const response = await client.chat.send({
//     chatRequest: {
//         model: "anthropic/claude-opus-5.5",
//         messages: [
//             {
//                 role: 'system',
//                 content: "You are an extremely friendly assistant to help users with queries about this club website. The Member dashboard can only be accessed after being signed in, and contains info about announcements, upcoming meetings, and the last 2 projects of the logged in user. If the user wants to update a project, or add a new project they should contact an admin or use the support page. Answer other queries based on logical guesses"
//             },
//             {
//                 role: "user",
//                 content: msg
//             }
//         ],
//         stream: false
//         }
//     });
//     if (response.choices[0].message) {
//         console.log(response.choices[0].message);
//         return res.json({
//             answer: response.choices[0].message.content
//         });
//     } else {
//         return res.json({
//             error : "Failed to get a response, try again!"
//         })
//     }
// }

async function sendMsg(req, res) {
    try {
        const msg = req.body.message;

        const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-v4-flash",
                messages: [
                    {
                        role: "system",
                        content: "You are an extremely friendly assistant to help users with queries about this club website. The Member dashboard can only be accessed after being signed in, and contains info about announcements, upcoming meetings, and the last 2 projects of the logged in user. If the user wants to update a project, or add a new project they should contact an admin or use the support page. Answer other queries based on logical guesses."
                    },
                    {
                        role: "user",
                        content: msg
                    }
                ]
            })
        });

        const data = await response.json();

        console.log(data);

        if (!response.ok) {
            return res.status(response.status).json({
                error: data
            });
        }

        return res.json({
            answer: data.choices[0].message.content
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to contact AI"
        });
    }
}

module.exports = {
    checkAuth,
    getMeetings,
    getEvents,
    getMeetings,
    getProjects,
    getAnnouncements,
    getUsers,
    requireAuth,
    leaderboard,
    sendMsg
}