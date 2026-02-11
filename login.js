// URL do seu servidor
const API_URL = "http://localhost:3000/api";

// 1. Alternar entre tela de Login e Cadastro
function alternarTelas() {
    document.getElementById('login').classList.toggle('sumir');
    document.getElementById('cadastro').classList.toggle('sumir');
}

// 2. Função de FAZER CADASTRO
async function fazerCadastro() {
    const nome = document.getElementById('cadastro-nome').value;
    const email = document.getElementById('cadastro-email').value;
    const senha = document.getElementById('cadastro-senha').value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert("Conta criada! Agora faça login.");
            alternarTelas(); // Volta para o login
        } else {
            alert("Erro: " + dados.erro);
        }
    } catch (error) {
        alert("Erro ao conectar com o servidor.");
    }
}

// 3. Função de FAZER LOGIN
async function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (dados.sucesso) {
            // SALVA O USUÁRIO NO NAVEGADOR (Para saber que está logado)
            localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));
            
            // Manda para o feed
            window.location.href = "feed.html";
        } else {
            alert(dados.erro);
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao tentar entrar.");
    }
}