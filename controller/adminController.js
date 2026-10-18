const { createClient } = require('@supabase/supabase-js');
const adminService = require('../services/adminService');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const nodemailer = require('nodemailer');
const AI_KEY = process.env.HCAIKEY;
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
    let {name, tags, img, desc, email} = req.body;
    const request = await adminService.newProject(name, tags, img, desc, email);
    if (request.success) {
        await projNotif(name, desc, email);
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

async function getProjByEmail(req, res) {
    const email = req.params.email;
    const response = await adminService.filterProjects(email);
    if (response.error || !response.success) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        data: response.data,
        success: true
    })
}

async function getEvents(req, res) {
    const request = await adminService.getAllEvents();
    if (request.error) {
        return res.status(500).json({
            error: request.error
        })
    }
    return res.json({
        success: true,
        data: request.events
    });
}

async function addEvents(req, res) {
    let {name, status, img, desc, event_id} = req.body;
    const request = await adminService.newEvent(name, status, desc, img, event_id);
    if (request.success) {
        await notifyMembers('e', 'New Event for NOVA Club - Check it out!', request.data.name)
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

async function editEvent(req, res) {
    console.log(req.body);
    const {event_name, event_status, event_img, event_description, event_id} = req.body;
    const request = await adminService.editEvent(event_name, event_status, event_img, event_description, event_id);
    if (request.error) {
        return res.json({
            success: false,
            error: request.error
        })
    }
    return res.json({
        success: true
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

async function msgMember(req, res) {
    const message = req.body.message;
    const email = req.body.email;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.CLUB_EMAIL,
            pass: process.env.CLUB_APP_PASS
        }
    })
    const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_KEY}`
            },
            body: JSON.stringify({
                model: "google/gemini-3.6-flash",
                messages: [
                    {
                        role: "system",
                        content: "Return short 5-7 word response that would suit to be the subject for the email's body that is being provided. Just return the suggested subject directly. Nothing else."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        }
    );
    const data = await response.json();
    const reply = data.choices[0].message.content;
    const mailOptions = {
        from: `Tech Club Team <${process.env.CLUB_EMAIL}>`,
        to: email,
        subject: reply? reply : `New message from admin team`,
        // subject: `New message from admin team`,
        text: message,
        replyTo: process.env.CLUB_EMAIL
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        return res.json({
            success: true
        })
    } catch (err) {
        return res.json({
            error: err
        })
    }
}


async function editProject(req, res) {
    console.log(req.body);
    const {project_name, project_tags, project_img, project_info, project_uemail} = req.body;
    const response = await adminService.editProject(project_name, project_tags, project_img, project_info, project_uemail);
    if (response.error) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true
    })
}

async function getAnnouncements(req, res) {
    const response = await adminService.getAnnouncements();
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

async function newAnnouncement(req, res) {
    const announcement = req.body.announcement;
    const response = await adminService.newAnnouncement(announcement);
    if (response.error) {
        console.log(response.error)
        return res.json({
            success: false,
            error: response.error
        })
    }
    await notifyMembers('a', 'New Announcement for NOVA Club - Check it out!', announcement)
    return res.json({
        success: true,
        data: response.data
    })
}

async function delAnnouncement(req, res) {
    const announcement = req.body.announcement;
    const response = await adminService.deleteAnnouncement(announcement);
    if (response.error) {
        console.log(response.error)
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        success: true
    })
}

async function getMembers(req, res) {
    const response = await adminService.getMembers();
    if (response.error || !response.success) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        data: response.data,
        success: true
    })
}

async function getMemByEmail(req, res) {
    const email = req.params.email;
    const response = await adminService.filterMembers(email);
    if (response.error || !response.success) {
        return res.json({
            success: false,
            error: response.error
        })
    }
    return res.json({
        data: response.data,
        success: true
    })
}

async function getAnnSubscribed() {
    const supabaseClient = createClient(SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
    const {data, error} = await supabaseClient.from('subscriptions').select('*').eq('announcements', true);
    if (!error) {
        return {success: true, data: data}
    }
    return {success: false, error: error}
}

// async function getProjSubscribed() {
//     const supabaseClient = createClient(SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
//     const {data, error} = await supabaseClient.from('subscriptions').select('*').eq('projects', true);
//     if (!error) {
//         return {success: true, data: data}
//     }
//     return {success: false, error: error}
// }

async function getEventSubscribed() {
    const supabaseClient = createClient(SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
    const {data, error} = await supabaseClient.from('subscriptions').select('*').eq('events', true);
    if (!error) {
        return {success: true, data: data}
    }
    return {success: false, error: error}
}

async function notifyMembers(category, subject, body, body2) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.CLUB_EMAIL,
            pass: process.env.CLUB_APP_PASS
        }
    });
    if (category.toLowerCase() === 'a') {
        const response = await getAnnSubscribed();
        if (response.success) {
            for (let i = 0; i < response.data.length; i++) {
                const user = response.data[i];
                const mailOptions = {
                    from: `Tech Club Team <${process.env.CLUB_EMAIL}>`,
                    to: user.email,
                    subject: subject,
                    text: `A new announcement has been published for NOVA Club. Announcement: \n${body} ${body2 ? `\n\n${body2}\n\nRegards, Tech Club Team` : `\n\nRegards, Tech Club Team` }`,
                }
                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log(`Email sent to ${user.email}`)
                } catch (err) {
                    console.log(`Email failed to send to ${user.email}, error: ${err}`);
                }
            }
            return {success: true};
        } else {
            return {error: response.error, success: false}
        }
    } else if (category.toLowerCase() === 'e') {
        const response = await getEventSubscribed();
        if (response.success) {
            for (let i = 0; i < response.data.length; i++) {
                const user = response.data[i];
                const mailOptions = {
                    from: `Tech Club Team <${process.env.CLUB_EMAIL}>`,
                    to: user.email,
                    subject: subject,
                    text: `A new event will occur for NOVA Club. Event: ${body}${body2 ? `\n\n${body2}\n\nRegards, Tech Club Team` : `\n\nRegards, Tech Club Team` }`,
                }
                try {
                    const info = await transporter.sendMail(mailOptions);
                    console.log(`Email sent to ${user.email}`)
                } catch (err) {
                    console.log(`Email failed to send to ${user.email}, error: ${err}`);
                }
            }
            return {success: true}
        } else {
            return {error: response.error, success: false}
        }
    }
    return {error: 'Unkown category', success: false}
}

async function projNotif(project_name, project_desc, email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.CLUB_EMAIL,
            pass: process.env.CLUB_APP_PASS
        }
    });
    const mailOptions = {
        from:`Tech Club Team <${process.env.CLUB_EMAIL}>`,
        to: email,
        subject: `New Project has been added to your account`,
        text: `A new projet has been added to your account, please go view it on the website. \nProject Name${project_name} \nBelow is your Project Description, which may look funky/werid as symbols may be included in the description. \nFor proper viewing check the website please. \n${project_desc} \nRegards - Tech Club Team`,
        html: ''
    }
    try {
        const info = await transporter.sendMail(mailOptions);
        return {reply: info}
    } catch (err) {
        return {error: err}
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
    editEvent,
    requireAuth,
    delProject,
    delEvent,
    sendMsg,
    msgMember,
    editProject,
    getAnnouncements,
    newAnnouncement,
    delAnnouncement,
    getMembers,
    getMemByEmail,
    getProjByEmail
};