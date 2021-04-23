// import { showAlert } from './alerts'

const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout');


// example using javascript to submit a form -- Other way is using HTML form
const login = async (email, password) => {

    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, 'Logged in successfully!')
            window.setTimeout(() => { // to let the message showed visible for 1,5s
                location.assign('/') // redirect to home
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
            url: 'http://localhost:3000/api/v1/users/logout'
        });
        //reload manually    
        if(res.data.status === 'success'){
            location.assign('/') // redirect to home
            showAlert(res.data.status, 'Logged out successfully!')
        }
    } catch(err){
        showAlert('error', 'Error logging out! Try again')
        console.log(err.response)
    }
}



if(loginForm){
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault()
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password)
    })
}

if(logOutBtn) {
    logOutBtn.addEventListener('click', logout)
}
