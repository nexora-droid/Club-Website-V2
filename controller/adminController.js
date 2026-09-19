const adminService = require('../services/adminService');
async function login(req, res) {
    const {email, password} = req.body;
    const result = await adminService.login(email, password);
    res.json(result);
};

async function signup(req, res) {
    const {email, password} = req.body;
    const result = await adminService.signUp(email, password);
    if (result.data.user.aud === "Authenticated") {
        res.json({
            auth : 'Success'
        })
    }
};

module.exports = {
    login,
    signup
};