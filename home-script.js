    const relogio = document.querySelector(".relogio");

    function padZero(num) {
        return String(num).padStart(2, "0");
    }

    function mostrarHora() {
        const data = new Date();
        const hora = padZero(data.getHours());
        const minuto = padZero(data.getMinutes());
        const segundo = padZero(data.getSeconds());
        relogio.innerHTML = `${hora}:${minuto}:${segundo}`;
    }

    mostrarHora();
    setInterval(mostrarHora, 1000);

    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    }

    async function carregarRegistros() {
        const matricula = getCookie("matricula");

        if (!matricula) {
            alert("Matrícula não encontrada. Faça login novamente.");
            window.location.href = "/login.html";
            return;
        }

        console.log("Carregando registros para matrícula:", matricula);

        try {
            const response = await fetch(`http://145.223.74.142:48539/mostrar-ponto-matricula?matricula=${matricula}`);
            if (response.ok) {
                const data = await response.json();
                renderizarTabela(data);
            } else {
                console.error("Erro ao buscar registros:", response.status);
                alert("Erro ao carregar registros.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    }

    function renderizarTabela(data) {
        const tabela = document.querySelector(".tabela tbody");
        tabela.innerHTML = "";

        if (!data || data.length === 0) {
            tabela.innerHTML = '<tr><td colspan="4">Nenhum registro encontrado.</td></tr>';
            return;
        }

        data.forEach((registro) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${formatarData(registro.horario_entrada)}</td>
                <td>${formatarHora(registro.horario_entrada)}</td>
                <td>${formatarHora(registro.horario_saida)}</td>
                <td>${calcularHorasTrabalhadas(registro.horario_entrada, registro.horario_saida)}</td>
            `;
            tabela.appendChild(tr);
        });
    }

    function formatarData(dataISO) {
        const date = new Date(dataISO);
        return date.toLocaleDateString("pt-BR");
    }

    function formatarHora(dataISO) {
        if(dataISO == null) return "- : -"
        const date = new Date(dataISO);
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    function calcularHorasTrabalhadas(entradaISO, saidaISO) {
        const entrada = new Date(entradaISO);
        const saida = new Date(saidaISO);
    
        if(saidaISO == null) return "0h 0m"
    
        const diffMs = saida - entrada;
        const horas = Math.floor(diffMs / (1000 * 60 * 60));
        const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        return `${horas}h ${minutos}m`;
    }

    async function registrarNovoHorario() {
        const matricula = getCookie("matricula");
        const nome = getCookie("nome");
        const sobrenome = getCookie("sobrenome");

        if (!matricula) {
            alert("Matrícula não encontrada. Faça login novamente.");
            window.location.href = "/login.html";
            return;
        }

        console.log("Registrando ponto para matrícula:", matricula);

        try {
            const response = await fetch("http://145.223.74.142:48539/bater-ponto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome,
                    sobrenome: sobrenome,
                    matricula: matricula,
                    horario_entrada: null,
                    horario_saida: null
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Ponto registrado com sucesso:", data);
                alert("Ponto registrado com sucesso!");
                carregarRegistros();
            } else {
                console.error("Erro ao registrar ponto:", response.status);
                alert("Erro ao registrar ponto. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro na requisição de registro de ponto:", error);
            alert("Erro ao registrar ponto. Verifique sua conexão.");
        }
    }

    function logout() {
        document.cookie = "matricula=; path=/; max-age=0";
        alert("Você foi deslogado.");
        window.location.href = "/login.html";
    }

    document.addEventListener("DOMContentLoaded", carregarRegistros);
