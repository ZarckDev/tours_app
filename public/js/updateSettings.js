
const updateForm = document.querySelector('.form-user-data')

const updateData = async(name, email) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:3000/api/v1/users/updateMe',
            data: {
                name,
                email
            }
        })

        if(res.data.status === 'success'){
            showAlert(res.data.status, 'Infos updated succesfully!')
        }

    } catch(err) {
        showAlert('error', err.response.data.message);
    }
}


if(updateForm){
    updateForm.addEventListener('submit', function (event) {
        event.preventDefault()
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateData(name, email)
    })
}