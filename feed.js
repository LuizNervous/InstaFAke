// feed.js

// 1. Função principal que carrega os posts
const usuarioLogado = localStorage.getItem("usuarioLogado");

if (!usuarioLogado) {
    // Se não tiver nada salvo, manda pro login
    alert("Você precisa estar logado!");
    window.location.href = "index.html";
}

function UpRelogio(){
    const elemClock=document.getElementById("relogio");
    const realTime=new Date();
    elemClock.textContent=realTime.toLocaleTimeString();
    setTimeout(UpRelogio, 1000);
}
UpRelogio();



async function carregarFeed() {
    console.log("Iniciando busca de posts...");

    try {
        // AQUI É A MÁGICA: O site chama o seu servidor Node.js
        const resposta = await fetch('http://localhost:3000/api/posts');
        
        // Converte a resposta texto para JSON (dados que o JS entende)
        const posts = await resposta.json();
        console.log("Posts recebidos:", posts);

        // Se não tiver posts, avisa
        if (posts.length === 0) {
            alert("Nenhum post encontrado. Você inseriu os dados no banco?");
            return;
        }

        // Chama a função que desenha na tela
        desenharPosts(posts);

    } catch (erro) {
        console.error("Deu ruim ao buscar posts:", erro);
        alert("Erro ao conectar com o servidor! Verifique se o terminal preto está rodando.");
    }
}

// 2. Função que pega os dados e cria o HTML
function desenharPosts(listaDePosts) {
    const container = document.getElementById('lista-posts');
    
    // Limpa o container para não duplicar se chamar de novo
    container.innerHTML = ''; 

    // Para cada post que veio do banco...
    listaDePosts.forEach(post => {
        // Cria o HTML do card
        const cardHTML = `
            <article class="post">
                <div class="post-header">
                    <strong>${post.nome}</strong> </div>
                
                <img src="${post.imagem_url}" alt="Postagem">
                
                <div class="post-footer">
                    <p>
                        <strong>${post.nome}</strong> 
                        ${post.legenda}
                    </p>
                    <small>Curtidas: ${post.curtidas}</small>
                </div>
            </article>
        `;

        // Adiciona esse card novo dentro da lista
        container.innerHTML += cardHTML;
    });
}
document.querySelector(".flex").addEventListener("click",()=>{
    window.location.href="postar.html"
})



// 3. Executa a função assim que o arquivo carrega
carregarFeed();