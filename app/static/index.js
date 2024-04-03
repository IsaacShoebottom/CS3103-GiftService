const { createApp, ref } = Vue
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

        function login(username, password) {
            axios.post('/auth/login', {
                username: username,
                password: password
            })
                .then(response => {
                    console.log(response.data)
                    term.value = username.value
                    search(username.value)
                    password.value = ''
                    loggedIn.value = true
                })
                .catch(error => {
                    console.error(error)
                })
        }

        function logout() {
            axios.post('/auth/logout')
                .then(response => {
                    console.log(response.data)
                    username.value = ''
                    password.value = ''
                    loggedIn.value = false
                })
                .catch(error => {
                    console.error(error)
                })
        }

        function add(name, link) {
            axios.post('/presents/' + username.value, {
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

        function editModal(id) {
            editMode.value = !editMode.value
            editId.value = id
        }

        function edit(id, name, link) {
            console.log(id, name, link)
            axios.put('/presents/' + username.value, {
                Id: id,
                Title: name,
                Link: link
            })
                .then(response => {
                    console.log(response.data)
                    editMode.value = !editMode.value
                    search(term.value)
                })
                .catch(error => {
                    console.error(error)
                })
        }

        function remove(id) {
            console.log(id)
            axios.delete('/presents/' + username.value, {
                data: {
                    Id: id
                }
            })
                .then(response => {
                    console.log(response.data)
                    search(term.value)
                })
                .catch(error => {
                    console.error(error)
                })
        }

        function search(term) {
            axios.get('/presents/' + term)
                .then(response => {
                    console.log(response.data)
                    presents.value = response.data.presents
                })
                .catch(error => {
                    console.error(error)
                })
        }


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
            editModal,
            search,
            logout,
            add,
            edit,
            remove,
            login,
        }
    }
}).mount('#app')