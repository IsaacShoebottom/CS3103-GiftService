const { createApp, ref, reactive, onMounted } = Vue
createApp({
    setup() {
        // Enum for views
        const views = Object.freeze({
            profile: 'profile',
            browse: 'browse'
        })
        // Reactive variables
        const term = ref('')
        const presents = ref([])
        const view = ref(views.profile)
        const modal = ref(null)
        // Reactive data
        const editData = reactive({
            id: -1,
            title: '',
            link: '',
        })
        const addData = reactive({
            title: '',
            link: ''
        })
        const userData = reactive({
            username: '',
            password: '',
            loggedIn: false
        })

        async function login() {
            console.log(userData)
            await axios.post('/auth/login', {
                username: userData.username,
                password: userData.password
            }).then(async response => {
                console.log(response.data)
                userData.loggedIn = true
                if (view.value === views.profile) {
                    await search(userData.username)
                }
            }).catch(error => {
                console.error(error)
            })
            console.log(userData)
            console.log(view.value)
            userData.password = ''
        }

        async function logout() {
            await axios.post('/auth/logout')
                .then(response => {
                    console.log(response.data)
                    userData.loggedIn = false
                })
                .catch(error => {
                    console.error(error)
                })
            if (view.value === 'profile') {
                presents.value = []
            }
        }

        async function status() {
            await axios.get('/auth/status')
                .then(response => {
                    console.log("Auth status: ", response.data)
                    userData.username = response.data.username
                    userData.loggedIn = true
                })
                .catch(error => {
                    console.log("Auth status: ", error.response.data)
                    userData.loggedIn = false
                })
        }

        async function add() {
            console.log(addData)
            await axios.post('/presents/' + userData.username, {
                title: addData.title,
                link: addData.link
            })
                .then(response => {
                    console.log(response.data)
                })
                .catch(error => {
                    console.error(error)
                })
            await search(userData.username)
        }

        async function openModal(id) {
            editData.id = id
            modal.value.show()
        }

        async function closeModal() {
            editData.id = -1
            modal.value.hide()
        }

        async function edit() {
            console.log(editData)
            await axios.put('/presents/' + userData.username, {
                id: editData.id,
                title: editData.name,
                link: editData.link
            })
                .then(response => {
                    console.log(response.data)
                })
                .catch(error => {
                    console.error(error)
                })
            await search(userData.username)
            modal.value.hide()
        }

        async function remove(id) {
            console.log(id)
            await axios.delete('/presents/' + userData.username, {
                data: {
                    id: id
                }
            })
                .then(response => {
                    console.log(response.data)
                    editData.value = false

                })
                .catch(error => {
                    console.error(error)
                })
            search(userData.username)
        }

        async function search(term) {
            await axios.get('/presents/' + term)
                .then(response => {
                    console.log(response.data)
                    presents.value = response.data.presents
                })
                .catch(error => {
                    console.error(error)
                })
        }

        async function viewProfile() {
            await status()
            if (userData.loggedIn) {
                await search(userData.username)
                view.value = views.profile
            }
        }

        async function viewBrowse() {
            view.value = views.browse
            presents.value = []
        }

        onMounted(async () => {
            await status()
            if (userData.loggedIn) {
                await search(userData.username)
            }
            modal.value = new bootstrap.Modal(document.getElementById('modal'))
        })

        return {
            term,
            presents,
            views,
            view,
            userData,
            editData,
            addData,
            modal,
            search,
            logout,
            status,
            add,
            edit,
            remove,
            login,
            viewProfile,
            viewBrowse,
            openModal,
            closeModal
        }
    }
}).mount('#app')