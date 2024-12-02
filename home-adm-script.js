let pontoAtual = null;

function abrirPopupEditar(id, entrada, saida) {
    console.log("Abrindo popup com ID:", id);
    pontoAtual = id;
    const popupEditar = document.querySelector(".popup");

    const entradaFormatada = entrada.replace(" ", "T").slice(0, 16);
    const saidaFormatada = saida.replace(" ", "T").slice(0, 16);

    document.getElementById("editarEntrada").value = entradaFormatada;
    document.getElementById("editarSaida").value = saidaFormatada;

    popupEditar.classList.add("popup-open");
}

function fecharPopup() {
    console.log("Fechando popup...");
    pontoAtual = null;
    const popupEditar = document.querySelector(".popup");
    popupEditar.classList.remove("popup-open");
}

document.addEventListener("DOMContentLoaded", function () {

    const cadastroForm = document.getElementById("cadastroForm");

    cadastroForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = document.getElementById("nome").value;
        const sobrenome = document.getElementById("sobrenome").value;
        const dataNascimento = document.getElementById("dataNascimento").value + "T00:00:00";
        const matricula = document.getElementById("matricula").value;
        const cpf = document.getElementById("cpf").value;
        const cargo = document.getElementById("cargo").value;
        const senha = document.getElementById("senha").value;

        const dadosCadastro = {
            nome: nome,
            sobrenome: sobrenome,
            data_nascimento: dataNascimento,
            matricula: matricula,
            cpf: cpf,
            cargo: cargo,
            senha: senha
        };

        fetch("http://145.223.74.142:48539/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosCadastro)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Erro no cadastro: ${response.status}`);
                }
            })
            .then(data => {
                alert("Usuário cadastrado com sucesso!");
                cadastroForm.reset();
                carregarRegistros();
            })
            .catch(error => {
                console.error("Erro ao cadastrar usuário:", error);
                alert("Erro ao cadastrar o usuário: " + error.message);
            });
    });


    const tabelaResultados = document.getElementById("tabelaResultados");
    const pesquisaInput = document.getElementById("pesquisa");

    const popupEditar = document.createElement("div");
    popupEditar.className = "popup";
    popupEditar.innerHTML = `
        <div class="popup-content">
            <h3>Editar Registro</h3>
            <form id="editarForm">
                <label for="editarEntrada">Entrada:</label>
                <input type="datetime-local" id="editarEntrada" name="entrada" required>
                <label for="editarSaida">Saída:</label>
                <input type="datetime-local" id="editarSaida" name="saida" required>
                <button type="submit">Salvar</button>
                <button type="button" onclick="fecharPopup()">Cancelar</button>
            </form>
        </div>
    `;
    document.body.appendChild(popupEditar);

    document.getElementById("editarForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const entrada = document.getElementById("editarEntrada").value;
        const saida = document.getElementById("editarSaida").value;

        console.log("Enviando dados para edição:", {
            id: pontoAtual,
            horario_entrada: entrada,
            horario_saida: saida,
        });

        fetch(`http://145.223.74.142:48539/editar-ponto`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: pontoAtual,
                horario_entrada: entrada,
                horario_saida: saida
            })
        })
            .then((response) => {
                console.log("Resposta do servidor:", response.status);
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Erro ao atualizar: ${response.status}`);
                }
            })
            .then((data) => {
                console.log("Resposta da API:", data);
                alert("Ponto atualizado com sucesso!");
                fecharPopup();
                carregarRegistros();
            })
            .catch((error) => {
                console.error("Erro ao editar ponto:", error);
                alert("Erro ao atualizar o ponto: " + error.message);
            });
    });

    function deletarRegistro(id) {
        console.log("Tentando deletar registro com ID:", id);
    
        if (!id) {
            console.error("ID inválido para exclusão:", id);
            alert("Erro: ID inválido para exclusão.");
            return;
        }
    
        if (confirm("Tem certeza que deseja deletar este registro?")) {
            fetch(`http://145.223.74.142:48539/deletar-ponto?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            })
                .then((response) => {
                    console.log("Resposta do servidor (DELETE):", response.status);
                    if (response.ok) {
                        alert("Registro deletado com sucesso!");
                        carregarRegistros();
                    } else {
                        throw new Error(`Erro ao deletar: ${response.status}`);
                    }
                })
                .catch((error) => {
                    console.error("Erro ao deletar registro:", error);
                    alert("Erro ao deletar o registro: " + error.message);
                });
        }
    }
    

    function carregarTabela(data) {
        console.log("Renderizando tabela com os dados:", data);
        tabelaResultados.innerHTML = "";

        if (data.length === 0) {
            tabelaResultados.innerHTML =
                '<tr><td colspan="5">Nenhum registro encontrado.</td></tr>';
            return;
        }

        data.forEach((ponto) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${formatarData(ponto.horario_entrada)}</td>
                <td>${formatarHora(ponto.horario_entrada)}</td>
                <td>${formatarHora(ponto.horario_saida)}</td>
                <td>${calcularHorasTrabalhadas(
                    ponto.horario_entrada,
                    ponto.horario_saida
                )}</td>
                <td>
                    <button class="btn-editar" 
                            onclick="abrirPopupEditar(${ponto.id}, '${ponto.horario_entrada}', '${ponto.horario_saida}')">
                        Editar
                    </button>
                    <button class="btn-deletar" 
                            data-id="${ponto.id}" 
                            style="background: red; color: white;">
                        Deletar
                    </button>
                </td>
            `;
            tabelaResultados.appendChild(tr);
        });
    }

    function carregarRegistros() {
        const matricula = pesquisaInput.value.trim();
        console.log("Carregando registros para matrícula:", matricula);

        if (matricula.length > 0) {
            fetch(`http://145.223.74.142:48539/mostrar-ponto-matricula?matricula=${matricula}`)
                .then((response) => {
                    console.log("Resposta do servidor (GET):", response.status);
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error("Erro ao buscar os dados. Verifique a matrícula.");
                    }
                })
                .then((data) => carregarTabela(data))
                .catch((error) => {
                    console.error("Erro ao buscar dados:", error);
                    tabelaResultados.innerHTML =
                        '<tr><td colspan="5">Erro ao buscar os dados. Tente novamente mais tarde.</td></tr>';
                });
        } else {
            tabelaResultados.innerHTML = "";
        }
    }

    pesquisaInput.addEventListener("input", carregarRegistros);

    carregarRegistros();

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
    
        if (!saidaISO) {
            return "Em andamento";
        }
    
        const saida = new Date(saidaISO);
        const diffMs = saida - entrada;
        const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHoras}h ${diffMinutos}m`;
    }

    tabelaResultados.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-deletar")) {
        const id = event.target.getAttribute("data-id");
        deletarRegistro(id);
    }
});
});

function logout() {
    document.cookie = "matricula=; path=/; max-age=0";
    alert("Você foi deslogado.");
    window.location.href = "/login.html";
}
