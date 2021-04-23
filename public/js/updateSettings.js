
const updateInfosForm = document.querySelector('.form-user-data')
const updatePasswordForm = document.querySelector('.form-user-settings')
const btnSavePassword = document.querySelector('.btn--save-password')

// type is either 'Password' or 'Infos'
const updateSettings = async(data, type) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: `http://localhost:3000/api/v1/users/${type === 'Password' ? 'updateMyPassword' : 'updateMe'}`,
            data
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, `${type} updated succesfully!`)
        }

    } catch(err) {
        showAlert('error', err.response.data.message);
    }
}


if(updateInfosForm){
    updateInfosForm.addEventListener('submit', (event) => {
        event.preventDefault()
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateSettings({name, email}, 'Infos')
    })
}
if(updatePasswordForm){
    updatePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault()
        btnSavePassword.textContent = "Updating..."

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent, password, passwordConfirm}, 'Password'); // to wait to do other stuff after ! because updateSetting is an async function, so returns a Promise
        btnSavePassword.textContent = "Save password"
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}