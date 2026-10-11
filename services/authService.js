const {createClient} = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function login(email, password) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    if (data.user && !error) {
        const uuid = data.user.id;
        const {error: error2} = await supabaseAdmin.from('members').update({
            user_id: uuid
        }).eq('email', email);
        if (error2) {
            return {
                loggedIn: true,
                data: data,
                error: 'Failed to set UUID'
            }
        }
        return {
            loggedIn: true,
            data: data,
        }
    }
    return {
        loggedIn: false,
        error: error,
        data
    }
}

async function signUp(name, email, password) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: name
            }
        }
    })
    if (data.user && !error) {
        const uuid = data.user.id;
        const {error: error2} = await supabaseAdmin.from('members').update({
            user_id: uuid
        }).eq('email', email);
        if (error2) {
            return {
                loggedIn: true,
                data: data,
                error: 'Failed to set UUID'
            }
        }
        return {loggedIn: true, data}
    }
    return {
        loggedIn: false,
        data,
        error
    }
}

async function updatePwd(currentPwd, newPwd, uuid, email) {
    // const userSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    //     global: {
    //         headers: {
    //             Authorization: `Bearer ${accessToken}`
    //         }
    //     }
    // })
    // Step 1: Checking Current PWD
    const {data: loginData, error: loginError} = await supabase.auth.signInWithPassword({
        email: email,
        password: currentPwd
    })
    if (loginError|| !loginData.user) {
        console.log('LOGIN ERROR: ', loginError?.message)
        return {
            message: 'The current password provided is incorrect',
            error: loginError,
            err_message: loginError?.message === "Invalid login credentials" ? "The current password provided is not correct" : "Couldn't verify current password",
            success: false
        }
    }
    console.log("Password verification, step 1, passed!");
    const {error} = await supabaseAdmin.auth.admin.updateUserById(
        uuid,
        { password: newPwd }
    )
    if (error && error.message.includes("current password")) {
        console.log(error)
        return {
            message: 'The current password provided is incorrect',
            error: error,
            err_message: error.message
        }
    }
    if (error) {
        console.log("Password update error: ", error.message)
        return {
            error: error,
            err_message: error.message
        }
    }
    return {
        success: true,
        message: 'Updated password!'
    }
}

module.exports = {
    login,
    signUp,
    updatePwd
}