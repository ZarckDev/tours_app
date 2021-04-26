// import { showAlert } from './alerts'

const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--register')
const forgotPasswordForm = document.querySelector('.form--password')
const resetPasswordForm = document.querySelector('.form--new-pass')
const logOutBtn = document.querySelector('.nav__el--logout');
const btnLogIn = document.querySelector('.btn--log-in')
const btnRegister = document.querySelector('.btn--register')
const btnForgotPassword = document.querySelector('.btn--password')
const btnNewPassword = document.querySelector('.btn--new-pass')

// example using javascript to submit a form -- Other way is using HTML form
const login = async (email, password) => {

    try {
        const res = await axios({
            method: 'POST',
            // url: 'http://localhost:3000/api/v1/users/login',
            url: '/api/v1/users/login', // api and website on the same server, so relative âth is ok
            data: {
                email,
                password
            }
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, 'Logged in successfully!')
            window.setTimeout(() => { // to let the message showed visible for 1,5s
                // location.assign('/') // redirect to home - assign create new line in Browser History
                location.replace('/') // redirect to home
            }, 1500)
        }

    } catch(err) {
        showAlert('error', err.response.data.message); 
    }
    
}

const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            // url: 'http://localhost:3000/api/v1/users/login',
            url: '/api/v1/users/signup', // api and website on the same server, so relative âth is ok
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, 'Welcome!')
            window.setTimeout(() => { // to let the message showed visible for 1,5s
                // location.assign('/') // redirect to home - assign create new line in Browser History
                location.replace('/') // redirect to home
            }, 1500)
        }

    } catch(err) {
        showAlert('error', err.response.data.message); 
    }
}

const requestPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            // url: 'http://localhost:3000/api/v1/users/login',
            url: '/api/v1/users/forgotPassword', // api and website on the same server, so relative âth is ok
            data: {
                email
            }
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, 'Email has been sent in order to reset your password')
            window.setTimeout(() => { // to let the message showed visible for 1,5s
                // location.assign('/') // redirect to home - assign create new line in Browser History
                location.replace('/') // redirect to home
            }, 1500)
        }

    } catch(err) {
        showAlert('error', err.response.data.message); 
    }
}

const resetPassword = async (password, passwordConfirm, token) => {
    try {
        const res = await axios({
            method: 'PATCH',
            // url: 'http://localhost:3000/api/v1/users/login',
            url: `/api/v1/users/resetPassword/${token}`, // api and website on the same server, so relative âth is ok
            data: {
                password,
                passwordConfirm
            }
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, 'You password has been reset!')
            window.setTimeout(() => { // to let the message showed visible for 1,5s
                // location.assign('/') // redirect to home - assign create new line in Browser History
                location.replace('/me') // redirect to home
            }, 1500)
        }

    } catch(err) {
        showAlert('error', err.response.data.message); 
    }
}

const logout= async () => {
    try {
        const res = await axios({
            method: 'GET',
            // url: 'http://localhost:3000/api/v1/users/logout',
            url: '/api/v1/users/logout', // api and website on the same server, so relative âth is ok
        });
        //reload manually    
        if(res.data.status === 'success'){
            location.replace('/') // redirect to home
            showAlert(res.data.status, 'Logged out successfully!')
        }
    } catch(err){
        showAlert('error', 'Error logging out! Try again')
        // console.log(err.response)
    }
}



if(loginForm){
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault()
        btnLogIn.textContent = "Please wait..."

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await login(email, password);
        btnLogIn.textContent = "Login"
    })
}
if(signupForm){
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault()
        btnRegister.textContent = "Please wait..."

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        await signup(name, email, password, passwordConfirm);
        btnRegister.textContent = "Register"
    })
}

if(logOutBtn) {
    logOutBtn.addEventListener('click', logout)
}


if(forgotPasswordForm){
    forgotPasswordForm.addEventListener('submit', async(event)=> {
        event.preventDefault()
        btnForgotPassword.textContent = "Please wait..."

        const email = document.getElementById('email').value;
        await requestPassword(email);
        btnForgotPassword.textContent = "Submit"
    })
}

if(resetPasswordForm) {
    const tokenNewPassword = document.querySelector('.btn--new-pass').dataset.token
    resetPasswordForm.addEventListener('submit', async(event) => {
        event.preventDefault()
        btnNewPassword.textContent = "Please wait..."

        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        await resetPassword(password, passwordConfirm, tokenNewPassword);
        btnNewPassword.textContent = "Save new password"
    })
}