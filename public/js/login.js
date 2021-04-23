// import { showAlert } from './alerts'

const loginForm = document.querySelector('.form')
const logOutBtn = document.querySelector('.nav__el--logout');


const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el); // go trhough the parent to delete the alert
    // OR el.remove();
}

// type is 'success' or 'error'
const showAlert = (type, msg) => {
    // hide the alert that exists -- in all case
    hideAlert()

    const markup = `<div class='alert alert--${type}'>${msg}</div>`; // class from style.css

    document.querySelector('body').insertAdjacentHTML('afterbegin', markup) // inside of the body but right at the beginning

    // hide the alert after 5s
    window.setTimeout(hideAlert, 5000)
}



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


