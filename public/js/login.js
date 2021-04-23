// import { showAlert } from './alerts'

const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el); // go trhough the parent to delete the alert
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

const form = document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault()

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password)
})