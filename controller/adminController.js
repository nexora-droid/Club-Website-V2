const adminService = require('../services/adminService');
async function login(req, res) {
    const {email, password} = req.body;
    const result = await adminService.login(email, password);
    return res.json(result);
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
    return res.json({
        auth: 'Success',
        result: result.data
    })
};

module.exports = {
    login,
    signup
};