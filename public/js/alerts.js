

const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el); // go trhough the parent to delete the alert
    // OR el.remove();
}

// type is 'success' or 'error'
const showAlert = (type, msg, time = 5) => {
    // hide the alert that exists -- in all case
    hideAlert()

    const markup = `<div class='alert alert--${type}'>${msg}</div>`; // class from style.css

    document.querySelector('body').insertAdjacentHTML('afterbegin', markup) // inside of the body but right at the beginning

    // hide the alert automatically after 4s
    window.setTimeout(hideAlert, time * 1000)
}


// GENERIC ALERT FUNCTION
const alertMessage = document.querySelector('body').dataset.alertMsg;


if(alertMessage){
    showAlert('success', alertMessage, 12) //12s
}