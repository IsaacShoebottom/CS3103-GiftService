const { createApp, ref, onMounted } = Vue
createApp({
    setup() {
        const term = ref('')
        const username = ref('')
        const password = ref('')
        const addName = ref('')
        const addLink = ref('')
        const presents = ref([])
        const editMode = ref(false)
        const editId = ref(-1)
        const editName = ref('')
        const editLink = ref('')
        const loggedIn = ref(false)
        const view = ref('profile')

        async function login(username, password) {
            await axios.post('/auth/login', {
                username: username,
                password: password
            })
                .then(response => {
                    console.log(response.data)
                    term.value = username.value
                    loggedIn.value = true

                })
                .catch(error => {
                    console.error(error)
                })
                if (view.value === 'profile') {
                    search(term.value)
                }
        }

        async function logout() {
            await axios.post('/auth/logout')
                .then(response => {
                    console.log(response.data)
                    loggedIn.value = false
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
                    console.log(response.data)
                    if (response.data.status === 'success') {
                        term.value = response.data.username
                        loggedIn.value = true
                    } else {
                        loggedIn.value = false
                    }
                })
                .catch(error => {
                    console.error(error)
                })
        }

        async function add(name, link) {
            await axios.post('/presents/' + username.value, {
                Title: name,
                Link: link
            })
                .then(response => {
                    console.log(response.data)
                })
                .catch(error => {
                    console.error(error)
                })
        }

        async function editModal(id, index) {
            editMode.value = true
            editId.value = id
        }

        async function edit(id, name, link) {
            console.log(id, name, link)
            await axios.put('/presents/' + username.value, {
                Id: id,
                Title: name,
                Link: link
            })
                .then(response => {
                    console.log(response.data)
                    editMode.value = false

                })
                .catch(error => {
                    console.error(error)
                })
                search(term.value)
        }

        async function remove(id) {
            console.log(id)
            await axios.delete('/presents/' + username.value, {
                data: {
                    Id: id
                }
            })
                .then(response => {
                    console.log(response.data)
                    editMode.value = false

                })
                .catch(error => {
                    console.error(error)
                })
                search(term.value)
        }

        async function search(term) {
            axios.get('/presents/' + term)
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
            if (loggedIn.value) {
                await search(term.value)
                view.value = 'profile'
            }
        }

        async function viewBrowse() {
            view.value = 'browse'
            term.value = ''
            presents.value = []
        }

        onMounted(async () => {
            await status()
            if (loggedIn.value) {
                search(term.value)
            }
        })

        return {
            term,
            username,
            password,
            addName,
            addLink,
            presents,
            editId,
            editName,
            editLink,
            editMode,
            loggedIn,
            view,
            editModal,
            search,
            logout,
            status,
            add,
            edit,
            remove,
            login,
            viewProfile,
            viewBrowse
        }
    }
}).mount('#app')