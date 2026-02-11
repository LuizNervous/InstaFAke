// Verifica se está logado
const usuarioString = localStorage.getItem("usuarioLogado");
if (!usuarioString) {
    window.location.href = "index.html";
}
const usuario = JSON.parse(usuarioString);

// Pré-visualização da imagem (Frescura visual, mas fica bonito)
document.getElementById('input-foto').addEventListener('change', function(e) {
    const preview = document.getElementById('preview');
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.style.display = 'block';
});

async function enviarPost() {
    const inputFoto = document.getElementById('input-foto');
    const legenda = document.getElementById('input-legenda').value;

    // Verifica se selecionou foto
    if (inputFoto.files.length === 0) {
        alert("Selecione uma foto!");
        return;
    }

    // 1. Cria o "Envelope" de dados (FormData)
    const formData = new FormData();
    formData.append('imagem', inputFoto.files[0]); // A foto em si
    formData.append('legenda', legenda);           // O texto
    formData.append('usuario_id', usuario.id);     // Quem está postando

    try {
        const resposta = await fetch('http://localhost:3000/api/postar', {
            method: 'POST',
            body: formData // Note que NÃO tem cabeçalho JSON aqui, o navegador resolve sozinho
        });

        if (resposta.ok) {
            alert("Postado com sucesso!");
            window.location.href = "feed.html"; // Volta pro feed para ver a obra de arte
        } else {
            alert("Erro ao postar.");
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro no servidor.");
    }
}