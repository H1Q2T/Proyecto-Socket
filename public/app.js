const apiURL = 'http://localhost:3000';

window.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const responseDiv = document.getElementById('response');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileGrid = document.getElementById('file-grid') || document.getElementById('fileList');
    const logoutBtn = document.getElementById('logout');

    let selectedFolderId = 'root';
    let selectedFolderName = 'Principal';

    const folderList = document.getElementById('folderList');
    const currentFolderName = document.getElementById('current-folder-name');
    const createFolderBtn = document.getElementById('create-folder-btn');

    // === REGISTRO ===
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(registerForm).entries());
            try {
                const res = await fetch(`${apiURL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await res.json();
                if (!res.ok) return responseDiv.innerText = result.message;

                const loginRes = await fetch(`${apiURL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: data.username, password: data.password }),
                });

                const loginData = await loginRes.json();
                if (loginRes.ok && loginData.token) {
                    localStorage.setItem('token', loginData.token);
                    window.location.href = 'drive.html';
                } else {
                    responseDiv.innerText = 'Registro ok, error en login automático.';
                }

            } catch (err) {
                console.error(err);
                responseDiv.innerText = 'Error al registrar.';
            }
        });
    }

    // === LOGIN ===
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(loginForm).entries());
            try {
                const res = await fetch(`${apiURL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await res.json();
                if (!res.ok) return responseDiv.innerText = result.message;

                localStorage.setItem('token', result.token);
                window.location.href = 'drive.html';
            } catch (err) {
                console.error(err);
                responseDiv.innerText = 'Error al iniciar sesión.';
            }
        });
    }

    // === CARGA DE ARCHIVOS (filtrados por carpeta)
    async function loadFiles() {
        const token = localStorage.getItem('token');
        try {
            const url = selectedFolderId === 'root'
                ? `${apiURL}/files`
                : `${apiURL}/files?folderId=${selectedFolderId}`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const files = await res.json();
            if (!Array.isArray(files)) throw new Error('Formato inválido');

            fileGrid.innerHTML = '';
            files.forEach(file => {
                const card = document.createElement('div');
                card.className = 'file-card';
                card.innerHTML = `
                    <h3>${file.name}</h3>
                    <div class="actions">
                        <button onclick="downloadFile('${file._id}')">Descargar</button>
                        <button onclick="deleteFile('${file._id}')">Eliminar</button>
                    </div>
                `;
                fileGrid.appendChild(card);
            });

        } catch (err) {
            console.error(err);
            fileGrid.innerHTML = '<p>Error al cargar archivos.</p>';
        }
    }

    // === SUBIDA DE ARCHIVO CON CARPETA
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            if (selectedFolderId !== 'root') {
                formData.append('folderId', selectedFolderId);
            }

            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${apiURL}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                const result = await res.json();
                alert(result.message || 'Archivo subido.');
                loadFiles();
            } catch (err) {
                console.error(err);
                alert('Error al subir archivo.');
            }
        });
    }

    // === CARGA DE CARPETAS DESDE EL SERVIDOR
    async function loadFolders() {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${apiURL}/folders`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const folders = await res.json();

            folderList.innerHTML = '';
            const defaultItem = document.createElement('li');
            defaultItem.className = 'folder active';
            defaultItem.dataset.id = 'root';
            defaultItem.innerText = 'Principal';
            folderList.appendChild(defaultItem);

            folders.forEach(folder => {
                const li = document.createElement('li');
                li.className = 'folder';
                li.dataset.id = folder._id;
                li.innerText = folder.name;
                folderList.appendChild(li);
            });
        } catch (err) {
            console.error('Error al cargar carpetas:', err);
        }
    }

    // === CREAR CARPETA (POST al backend)
    if (createFolderBtn) {
        createFolderBtn.addEventListener('click', async () => {
            const name = prompt('Nombre de la carpeta:');
            if (!name) return;
            const token = localStorage.getItem('token');
            try {
                await fetch(`${apiURL}/folders`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name }),
                });
                await loadFolders();
            } catch (err) {
                alert('Error al crear carpeta.');
            }
        });
    }

    // === SELECCIONAR CARPETA
    if (folderList) {
        folderList.addEventListener('click', (e) => {
            const target = e.target.closest('.folder');
            if (!target) return;

            document.querySelectorAll('.folder').forEach(f => f.classList.remove('active'));
            target.classList.add('active');

            selectedFolderId = target.dataset.id;
            selectedFolderName = target.innerText;
            currentFolderName.textContent = selectedFolderName;
            loadFiles();
        });
    }

    // === LOGOUT ===
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // === TEMA OSCURO/CLARO ===
    const themeToggle = document.getElementById('toggle-theme');
    if (themeToggle) {
        document.body.classList.add('dark-mode');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            document.body.classList.toggle('dark-mode');
        });
    }

    // === CARGA INICIAL ===
    if (window.location.pathname.includes('drive.html')) {
        loadFolders();
        loadFiles();
    }
});

// FUNCIONES GLOBALES
async function deleteFile(id) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiURL}/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await res.json();
        alert(result.message);
        location.reload();
    } catch (err) {
        console.error(err);
        alert('Error al eliminar archivo.');
    }
}

async function downloadFile(id) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${apiURL}/download/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `archivo_${id}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        console.error(err);
        alert('Error al descargar archivo.');
    }
}
