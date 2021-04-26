// import { showAlert } from './alerts'

const loginForm = document.querySelector('.form--login')
const signupForm = document.querySelector('.form--register')
const logOutBtn = document.querySelector('.nav__el--logout');
const btnLogIn = document.querySelector('.btn--log-in')
const btnRegister = document.querySelector('.btn--register')

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
