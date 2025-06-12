const token = localStorage.getItem("token");

function decodeToken(token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
}

const userID = decodeToken(token);

async function mostrarMenuUsuario() {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/getUser/${userID}`, {
        method: "GET",
        headers: { "Authorization": token },
    });
    const usuario = await response.json();
    console.log("Usuario obtenido: ", usuario);

    const botonMenuUsuario = document.getElementById('botonMenuUsuario');
    const menuUsuario = document.getElementById('menuUsuario');

    menuUsuario.innerHTML = `
        <p>Hola, ${usuario.user}</p>
        <button id="botonCerrarSesion" onclick="cerrarSesion()">Cerrar sesión</button>
    `;

    if(menuUsuario.style.display === "none" || menuUsuario.style.display === "") {
        menuUsuario.style.display = "block";
    }
    else {
        menuUsuario.style.display = "none";
    }
    document.addEventListener('click', (event) => {
        if(!menuUsuario.contains(event.target) && !botonMenuUsuario.contains(event.target)) {
            menuUsuario.style.display = 'none';
        }
    });
}

function cerrarSesion() {
    window.location.href='/public/login/login.html';
};

async function mostrarFormulario() {
    const formulario = document.createElement('div');
    formulario.classList.add('formularioExteriorCoche');
    formulario.innerHTML = `
        <div class="popupFormulario-contenido">
            <div class="popupFormulario-header">
                <h2>Añadir Coche</h2>
                <button class="boton-cerrar">&times;</button>
            </div>
            <form class="popupFormulario-body" id="formularioCoche" enctype="multipart/form-data">
                <label for="matricula">Matrícula</label><br>
                <input type="text" class="input" name="matricula" id="matricula" placeholder="Matrícula" required><br><br>
        
                <label for="marca">Marca</label><br>
                <input type="text" class="input" name="marca" id="marca" placeholder="Marca" required><br><br>
        
                <label for="modelo">Modelo</label><br>
                <input type="text" class="input" name="modelo" id="modelo" placeholder="Modelo" required><br><br>
        
                <label for="kilometros">Kilometraje</label><br>
                <input type="number" class="input" name="kilometros" id="kilometros" placeholder="Kilometraje"><br><br>
        
                <label for="year">Año</label><br>
                <input type="number" class="input" name="year" id="year" placeholder="Año"><br><br>

                <label for="kmUltimoMantenimiento">Kilómetros del último mantenimiento</label><br>
                <input type="number" class="input" name="kmUltimoMantenimiento" id="kmUltimoMantenimiento" placeholder="Kilómetros del último mantenimiento"><br><br>

                <label for="kmIntervalo">Kilómetros de intervalo de mantenimiento</label><br>
                <input type="number" class="input" name="kmIntervalo" id="kmIntervalo" placeholder="Kilómetros de intervalo de mantenimiento"><br><br>

                <label for="fechaUltimoMantenimiento">Fecha del último mantenimiento</label><br>
                <input type="date" class="input" name="fechaUltimoMantenimiento" id="fechaUltimoMantenimiento" placeholder="Fecha del último mantenimiento"><br><br>

                <label for="fechaIntervalo">Meses de intervalo de mantenimiento</label><br>
                <input type="number" class="input" name="fechaIntervalo" id="fechaIntervalo" placeholder="Meses de intervalo de mantenimiento"><br><br>

                <label for="descripcion">Descripción</label><br>
                <textarea type="text" class="input" name="descripcion" id="descripcion" placeholder="Descripción"></textarea><br><br>
        
                <label for="foto">Foto</label><br>
                <input type="file" class="input" name="foto" id="foto" accept="image/*" placeholder="foto"><br><br>
        
                <button type="submit">Añadir</button>
            </form>
        </div>
    `;
    document.body.appendChild(formulario);

    formulario.querySelector(".boton-cerrar").addEventListener("click", cerrarPopup);

    formulario.addEventListener("click", (e) => {
        const contenido = formulario.querySelector(".popupFormulario-contenido");
        if (!contenido.contains(e.target)) {
            formulario.remove();
        }
    });
    
    function handleKeydown(e) {
        if(e.key === "Escape") {
            cerrarPopup();
        }
    }
    
    document.addEventListener("keydown", handleKeydown);
    
    function cerrarPopup() {
        formulario.remove();
        document.removeEventListener("keydown", handleKeydown);
    }

    document.getElementById('formularioCoche').addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const form = e.target;
        const formData = new FormData(form);
        formData.append('userID', userID);
    
        const response = await fetch('http://localhost:3000/addCar', {
            method: "POST",
            headers: { "Authorization": token },
            body: formData
        });
    
        const datos = await response.json();
        console.log("Respuesta servidor: ", datos);
        if(datos.success) {
            alert("Coche guardado correctamente");
            document.getElementById('formularioCoche').style.display = 'none';
            document.querySelectorAll('.input').forEach(input => input.value = "");
            cargarCoches();
        }
        else {
            alert(datos.error);
        }
    });
}

async function cargarCoches() {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/getCars/${userID}`, {
        method: "GET",
        headers: { "Authorization": token },
    });
    const coches = await response.json();
    console.log("Coches cargados", coches);

    mostrarCoches(coches);
}

function mostrarCoches(coches) {
    const misCoches = document.getElementById('misCoches');
    misCoches.innerHTML = '<h2>Mis Coches</h2>';
    misCoches.style.display = 'block';
    const lista = document.getElementById('listaCoches');
    lista.innerHTML = '';

    coches.forEach((coche) => {
        const km = coche.kilometros;
        const formato = new Intl.NumberFormat('es-ES');
        const kilometros = formato.format(km);

        const kmUM = coche.kmUltimoMantenimiento;
        const kmUltimoMantenimiento = formato.format(kmUM);
        const kmPM = parseInt(kmUM) + parseInt(coche.kmIntervalo);
        const kmProximoMantenimiento = formato.format(kmPM)

        const fechaUltimoMantenimiento = new Date(coche.fechaUltimoMantenimiento);
        const fechaIntervalo = parseInt(coche.fechaIntervalo);
        const fechaProximoMantenimiento = new Date(fechaUltimoMantenimiento);
        fechaProximoMantenimiento.setMonth(fechaProximoMantenimiento.getMonth() + fechaIntervalo);

        const formatoFecha = { year: 'numeric', month: 'long', day: 'numeric' };
        
        const div = document.createElement('div');
        div.innerHTML = `
            <link rel="stylesheet" href="/public/index/index.css">
            <div class="coche">
                <img src="/resources/${coche.foto}" alt="Foto de coche">
                <p><b>Matrícula:</b> ${coche.matricula}</p>
                <p><b>Marca:</b> ${coche.marca}</p>
                <p><b>Modelo:</b> ${coche.modelo}</p>
                <p><b>Kilometros:</b> ${kilometros} km</p>
                <p><b>Año:</b> ${coche.year}</p>
                <p><b>Último mantenimiento:</b><br>${kmUltimoMantenimiento} km<br>${fechaUltimoMantenimiento.toLocaleDateString('es-ES', formatoFecha)}</p>
                <p><b>Próximo mantenimiento:</b><br>${kmProximoMantenimiento} km<br>${fechaProximoMantenimiento.toLocaleDateString('es-ES', formatoFecha)}</p>
                <p><b>Descripción:</b> ${coche.descripcion}</p>
                <div class="botonesCoche">
                    <button id="botonVer" data-id="${coche.id}" onclick="verCoche(this)">👁️</button>
                    <button id="botonEditar" data-id="${coche.id}" onclick="editarCoche(this)">✏️</button>
                    <button id="botonEliminar" data-id="${coche.id}" onclick="eliminarCoche(this)">❌</button>
                </div>
            </div>
        `;
        lista.appendChild(div);
    });
}

async function eliminarCoche(botonEliminar) {
    const token = localStorage.getItem('token');
    const id = botonEliminar.getAttribute('data-id');
    const response = await fetch(`http://localhost:3000/deleteCar/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
    });

    const datos = await response.json();
    console.log("Respuesta servidor: ", datos);
    if(datos.success) {
        alert("Coche eliminado correctamente");
        cargarCoches();
    }
    else {
        alert(datos.error);
    }
}

async function verCoche(botonVer) {
    const token = localStorage.getItem('token');
    const id = botonVer.getAttribute('data-id');
    const response = await fetch(`http://localhost:3000/getCar/${id}`, {
        method: "GET",
        headers: { "Authorization": token }
    });

    const coche = await response.json();
    console.log("Respuesta servidor: ", coche);
    const km = coche.kilometros;
    const formato = new Intl.NumberFormat('es-ES');
    const kilometros = formato.format(km);

    const kmUM = coche.kmUltimoMantenimiento;
    const kmUltimoMantenimiento = formato.format(kmUM);
    const kmPM = parseInt(kmUM) + parseInt(coche.kmIntervalo);
    const kmProximoMantenimiento = formato.format(kmPM)

    const fechaUltimoMantenimiento = new Date(coche.fechaUltimoMantenimiento);
    const fechaIntervalo = parseInt(coche.fechaIntervalo);
    const fechaProximoMantenimiento = new Date(fechaUltimoMantenimiento);
    fechaProximoMantenimiento.setMonth(fechaProximoMantenimiento.getMonth() + fechaIntervalo);

    const formatoFecha = { year: 'numeric', month: 'long', day: 'numeric' };

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <link rel="stylesheet" href="/public/popup/popup.css">
        <div class="popup-contenido">
            <div class="popup-header">
                <div class="titulo">
                    <p>${coche.marca} ${coche.modelo} con matrícula ${coche.matricula}</p>
                </div>
                <button class="boton-cerrar">&times;</button>
            </div>
            <div class="popup-body">
                <img src="/resources/${coche.foto}" alt="Foto de coche">
                <p><b>Kilómetros:</b> ${kilometros} km<br></p>
                <p><b>Año:</b> ${coche.year}</p>
                <p><b>Último mantenimiento:</b><br>${kmUltimoMantenimiento} km<br>${fechaUltimoMantenimiento.toLocaleDateString('es-ES', formatoFecha)}</p>
                <p><b>Próximo mantenimiento:</b><br>${kmProximoMantenimiento} km<br>${fechaProximoMantenimiento.toLocaleDateString('es-ES', formatoFecha)}</p>
                <p><b>Descripción:</b> ${coche.descripcion}</p>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector(".boton-cerrar").addEventListener("click", cerrarPopup);

    popup.addEventListener("click", (e) => {
        const contenido = popup.querySelector(".popup-contenido");
        if (!contenido.contains(e.target)) {
            popup.remove();
        }
    });

    function handleKeydown(e) {
        if(e.key === "Escape") {
            cerrarPopup();
        }
    }

    document.addEventListener("keydown", handleKeydown);

    function cerrarPopup() {
        popup.remove();
        document.removeEventListener("keydown", handleKeydown);
    }
    cargarCoches();
}

async function editarCoche(botonEditar) {
    const popupEditar = document.createElement('div');
    popupEditar.classList.add('popupEditar');
    popupEditar.innerHTML = `
        <link rel="stylesheet" href="/public/popup/popupEditar.css">
        <div class="popup-contenido" id="formularioEditar">
            <div class="popup-header">
                <div class="titulo">
                    <p>Edita los datos del coche</p>
                </div>
                <button class="boton-cerrar">&times;</button>
            </div>
            <form class="popup-body" id="formularioEditarCoche" enctype="multipart/form-data">
                <label for="matricula">Matrícula</label><br>
                <input type="text" class="input" name="matricula" id="matricula" placeholder="Matrícula"><br><br>

                <label for="marca">Marca</label><br>
                <input type="text" class="input" name="marca" id="marca" placeholder="Marca"><br><br>

                <label for="modelo">Modelo</label><br>
                <input type="text" class="input" name="modelo" id="modelo" placeholder="Modelo"><br><br>

                <label for="kilometros">Kilometraje</label><br>
                <input type="number" class="input" name="kilometros" id="kilometros" placeholder="Kilometraje"><br><br>

                <label for="year">Año</label><br>
                <input type="number" class="input" name="year" id="year" placeholder="Año"><br><br>

                <label for="kmUltimoMantenimiento">Kilómetros del último mantenimiento</label><br>
                <input type="number" class="input" name="kmUltimoMantenimiento" id="kmUltimoMantenimiento" placeholder="Kilómetros del último mantenimiento"><br><br>

                <label for="kmIntervalo">Kilómetros de intervalo de mantenimiento</label><br>
                <input type="number" class="input" name="kmIntervalo" id="kmIntervalo" placeholder="Kilómetros de intervalo de mantenimiento"><br><br>

                <label for="fechaUltimoMantenimiento">Fecha del último mantenimiento</label><br>
                <input type="date" class="input" name="fechaUltimoMantenimiento" id="fechaUltimoMantenimiento" placeholder="Fecha del último mantenimiento"><br><br>

                <label for="fechaIntervalo">Meses de intervalo de mantenimiento</label><br>
                <input type="number" class="input" name="fechaIntervalo" id="fechaIntervalo" placeholder="Meses de intervalo de mantenimiento"><br><br>

                <label for="descripcion">Descripción</label><br>
                <textarea type="text" class="input" name="descripcion" id="descripcion" placeholder="Descripción"></textarea><br><br>

                <label for="foto">Foto</label><br>
                <input type="file" class="input" name="foto" id="foto" accept="image/*" placeholder="foto"><br><br>

                <button type="submit">Modificar</button>
            </form>
        </div>
    `;
    document.body.appendChild(popupEditar);

    popupEditar.querySelector(".boton-cerrar").addEventListener("click", cerrarPopup);

    popupEditar.addEventListener("click", (e) => {
        const contenido = popupEditar.querySelector(".popup-contenido");
        if (!contenido.contains(e.target)) {
            popupEditar.remove();
        }
    });

    function handleKeydown(e) {
        if(e.key === "Escape") {
            cerrarPopup();
        }
    }

    document.addEventListener("keydown", handleKeydown);

    function cerrarPopup() {
        popupEditar.remove();
        document.removeEventListener("keydown", handleKeydown);
    }


    document.getElementById('formularioEditarCoche').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const id = botonEditar.getAttribute('data-id');

        const response = await fetch(`http://localhost:3000/modifyCar/${id}`, {
            method: "POST",
            headers: { "Authorization": token },
            body: formData
        });
    
        const datos = await response.json();
        console.log("Respuesta servidor: ", datos);
        if(datos.success) {
            alert("Coche modificado correctamente");
            popupEditar.remove();
            cargarCoches();
        }
        else {
            alert(datos.error);
        }
    });
}

document.addEventListener("DOMContentLoaded", cargarCoches);