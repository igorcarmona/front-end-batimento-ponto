    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("login-form");

        if (!form) return;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const matricula = document.getElementById("matricula").value.trim();
            const senha = document.getElementById("senha").value.trim();

            if (!matricula || !senha) {
                displayMessage("Por favor, preencha todos os campos.", "error");
                return;
            }

            try {
                const loginResponse = await fetch("http://145.223.74.142:48539/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ matricula, senha })
                });

                if (loginResponse.ok) {
                    const userData = await loginResponse.json();
                    displayMessage("Login bem-sucedido!", "success");

                    salvarDadosNoCookie(userData);

                    const isAdminResponse = await fetch(`http://145.223.74.142:48539/isAdmin?matricula=${matricula}`, {
                        method: "GET"
                    });

                    if (isAdminResponse.ok) {
                        const isAdmin = await isAdminResponse.json(); 
                        const redirectPage = isAdmin ? "home-adm.html" : "home.html";

                        localStorage.setItem("user", JSON.stringify(userData));

                        setTimeout(() => {
                            window.location.href = redirectPage;
                        }, 1000);
                    } else {
                        displayMessage("Erro ao verificar permissão do usuário.", "error");
                    }
                } else {
                    displayMessage("Usuário ou senha inválido. Tente novamente.", "error");
                }
            } catch (error) {
                console.error("Erro ao realizar login:", error);
                displayMessage("Erro de conexão. Tente novamente mais tarde.", "error");
            }
        });

    function salvarDadosNoCookie(userData) {
        const cookieExpireTime = 3600;
        document.cookie = `matricula=${encodeURIComponent(userData.matricula)}; path=/; max-age=${cookieExpireTime}`;
        document.cookie = `nome=${encodeURIComponent(userData.nome)}; path=/; max-age=${cookieExpireTime}`;
        document.cookie = `sobrenome=${encodeURIComponent(userData.sobrenome)}; path=/; max-age=${cookieExpireTime}`;
        console.log("Dados salvos no cookie:", userData);
    }

    function displayMessage(message, type) {
        let messageContainer = document.querySelector(".message");
        if (!messageContainer) {
            messageContainer = document.createElement("div");
            messageContainer.className = "message";
            form.appendChild(messageContainer);
        }
        messageContainer.textContent = message;
        messageContainer.className = `message ${type}`;
    }
});
