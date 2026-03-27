async function getDados(tipo) {
    let url = "https://api.nasa.gov/planetary/apod?api_key=0YfKjakkxdg30puN3GRhcJGXv3syAz35i16S9RNR";

    if (tipo === 'hoje') {
        // não altera a URL
    } else if (tipo === 'aleatoria') {
        url += "&count=1";
    } else if (tipo === 'data') {
        let dataEscolhida = document.getElementById("data-selecionada").value;

        if (!dataEscolhida) {
            alert("Escolha uma data");
            return;
        }

        if (dataEscolhida < "1995-06-16") {
            alert("Escolha uma data após 16/06/1995");
            return;
        }

        url += `&date=${dataEscolhida}`;
    }

    if (navigator.vibrate) {
        if (tipo === 'hoje') navigator.vibrate(300);
        if (tipo === 'data') navigator.vibrate([300, 50, 300]);
        if (tipo === 'aleatoria') navigator.vibrate(500);
    }

    try {
        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erro na resposta da API");
        }

        let data = await response.json();

        if (Array.isArray(data)) {
            data = data[0];
        }

        mostrarImagem(data);

    } catch (error) {
        document.getElementById("preview").innerHTML = `
            <div class="preview-card">
                <p>Erro ao carregar imagem da NASA. Verifique sua conexão e tente novamente.</p>
            </div>
        `;
        console.log("Erro:", error);
    }
}

// evita repetição de código
function mostrarImagem(data) {
    if (!data || !data.media_type) {
        document.getElementById("preview").innerHTML = `
            <div class="preview-card">
                <p>Erro ao carregar imagem da NASA. Tente novamente.</p>
            </div>
        `;
        return;
    }

    let media;

    if (data.media_type === "image") {
        media = `<img src="${data.url}" alt="${data.title}">`;
    } else {
        let videoUrl = data.url.replace("watch?v=", "embed/");
        media = `<iframe src="${videoUrl}" frameborder="0" allowfullscreen title="${data.title}"></iframe>`;
    }

    let dataBrasil = new Date(data.date).toLocaleDateString("pt-BR", {
        timeZone: "UTC"
    });

    document.getElementById("preview").innerHTML = `
        <div class="preview-card">
            <h2 class="titulo">${data.title}</h2>
            ${media}
            <p class="data-publi">Data da publicação: ${dataBrasil}</p>
            <a href="#popup-info" class="botao-info">Ver informações</a>
        </div>
    `;

    document.getElementById("popup-conteudo").innerHTML = `
        <h2>${data.title}</h2>
        <p><strong>Data da publicação:</strong> ${dataBrasil}</p>
        <p>${data.explanation}</p>
        <p class="copyright">Direitos reservados: ${data.copyright || "NASA"}</p>
    `;
}


// BOTÃO INSTALAR PWA


let deferredPrompt = null;
const btnInstalar = document.getElementById("btn-instalar");

function appJaInstalado() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

if (appJaInstalado()) {
    btnInstalar.hidden = true;
}

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (!appJaInstalado()) {
        btnInstalar.hidden = false;
    }
});

btnInstalar.addEventListener("click", async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();

        const escolha = await deferredPrompt.userChoice;
        console.log("Resultado da instalação:", escolha.outcome);

        deferredPrompt = null;
        btnInstalar.hidden = true;
    } else {
        alert("A instalação automática não está disponível agora. No navegador, abra o menu e escolha a opção de instalar ou adicionar à tela inicial.");
    }
});

window.addEventListener("appinstalled", () => {
    console.log("App instalado com sucesso");
    btnInstalar.hidden = true;
});