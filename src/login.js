async function registerUser() {
    const userInput = document.getElementById('userInput');
    const passInput = document.getElementById('passInput');
    const user = userInput.value;
    const pass = passInput.value;

    const respuesta = await fetch('http://localhost:3000/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user, pass: pass })
    });

    const respuestaServidor = await respuesta.json();
    if(respuestaServidor.success)  {
        alert(respuestaServidor.message);
    }
    else {
        alert(respuestaServidor.error);
    }
}

async function loginUser() {
    const userInput = document.getElementById('userInput');
    const passInput = document.getElementById('passInput');
    const user = userInput.value;
    const pass = passInput.value;

    const respuesta = await fetch('http://localhost:3000/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user, pass: pass })
    });

    const respuestaServidor = await respuesta.json();
    if(respuestaServidor.success)  {
        alert(respuestaServidor.message);
        localStorage.setItem('token', respuestaServidor.token); // Guarda el token
        window.location.href = "/public/index.html";
    }
    else {
        alert(respuestaServidor.error);
    }
}

function handleKeydown(e) {
    if(e.key === "Enter") {
        loginUser();
    }
}

document.addEventListener("keydown", handleKeydown);