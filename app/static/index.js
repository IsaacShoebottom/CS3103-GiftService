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
        const view = ref(views.browse)
        const editModal = ref(null)
        const loginModal = ref(null)
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
            await axios.post('/auth/login', {
                username: userData.username,
                password: userData.password
            }).then(() => {
                userData.loggedIn = true
            }).catch(error => {
                console.error(error.response)
            })
            userData.password = ''
            loginModal.value.hide()
            await viewProfile()
        }

        async function logout() {
            await axios.post('/auth/logout')
                .then(() => {
                    userData.loggedIn = false
                })
                .catch(error => {
                    console.error(error.response)
                })
            if (view.value === 'profile') {
                presents.value = []
            }
            await viewBrowse()
        }

        async function status() {
            await axios.get('/auth/status')
                .then(response => {
                    userData.username = response.data.username
                    userData.loggedIn = true
                })
                .catch(error => {
                    console.log(error.response)
                    userData.loggedIn = false
                })
        }

        async function add() {
            console.log(addData)
            await axios.post('/presents/' + userData.username, {
                title: addData.title,
                link: addData.link
            }).catch(error => {
                console.error(error.response)
            })
            await search(userData.username)
        }

        async function edit() {
            await axios.put('/presents/' + userData.username, {
                id: editData.id,
                title: editData.title,
                link: editData.link
            }).catch(error => {
                console.error(error.response)
            })
            await search(userData.username)
            editModal.value.hide()
        }

        async function remove(id) {
            await axios.delete('/presents/' + userData.username, {
                data: {
                    id: id
                }
            }).then(() => {
                editData.value = false
            }).catch(error => {
                console.error(error.data)
            })
            search(userData.username)
        }

        async function search(term) {
            await axios.get('/presents/' + term)
                .then(response => {
                    presents.value = response.data.presents
                })
                .catch(error => {
                    console.error(error.response)
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

        async function openEditModal(id, title, link) {
            editData.id = id
            editData.title = title
            editData.link = link
            editModal.value.show()
        }

        async function closeEditModal() {
            editData.id = -1
            editData.title = ''
            editData.link = ''
            editModal.value.hide()
        }

        async function openLoginModal() {
            loginModal.value.show()
        }

        async function closeLoginModal() {
            loginModal.value.hide()
        }

        onMounted(async () => {
            await viewProfile()
            editModal.value = new bootstrap.Modal(document.getElementById('edit-modal'))
            loginModal.value = new bootstrap.Modal(document.getElementById('login-modal'))
        })

        return {
            term,
            presents,
            views,
            view,
            userData,
            editData,
            addData,
            editModal,
            loginModal,
            search,
            logout,
            status,
            add,
            edit,
            remove,
            login,
            viewProfile,
            viewBrowse,
            openEditModal,
            closeEditModal,
            openLoginModal,
            closeLoginModal
        }
    }
}).mount('#app')