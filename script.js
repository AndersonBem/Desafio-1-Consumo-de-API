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

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function appJaInstalado() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

// Coordenadas do centro da NASA informadas por você
const nasaLat = 38.883;
const nasaLon = -77.0163;

// fórmula de Haversine para calcular distância em km
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const raioTerra = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return raioTerra * c;
}

function mostrarDistanciaNASA(distancia) {
    const preview = document.getElementById("preview");

    preview.innerHTML = `
        <div class="preview-card">
            <h2 class="titulo">Localização do usuário</h2>
            <p class="data-publi">Distância até o centro da NASA:</p>
            <p style="font-size: 1.2rem; margin-top: 10px;">
                <strong>${distancia.toFixed(2)} km</strong>
            </p>
        </div>
    `;
}

function usarLocalizacao() {
    if (!navigator.geolocation) {
        alert("Geolocalização não é suportada neste dispositivo.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {
            const latUsuario = posicao.coords.latitude;
            const lonUsuario = posicao.coords.longitude;

            const distancia = calcularDistanciaKm(
                latUsuario,
                lonUsuario,
                nasaLat,
                nasaLon
            );

            mostrarDistanciaNASA(distancia);
        },
        () => {
            alert("Não foi possível obter sua localização.");
        }
    );
}

// comportamento do botão
if (isIOS) {
    btnInstalar.hidden = false;
    btnInstalar.textContent = "Usar localização";
} else if (appJaInstalado()) {
    btnInstalar.hidden = true;
}

window.addEventListener("beforeinstallprompt", (e) => {
    if (isIOS) return;

    e.preventDefault();
    deferredPrompt = e;

    if (!appJaInstalado()) {
        btnInstalar.hidden = false;
        btnInstalar.textContent = "Instalar aplicativo";
    }
});

btnInstalar.addEventListener("click", async () => {
    if (isIOS) {
        usarLocalizacao();
        return;
    }

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