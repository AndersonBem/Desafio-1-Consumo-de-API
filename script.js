async function getDados(tipo) {
    let url = "https://api.nasa.gov/planetary/apod?api_key=0YfKjakkxdg30puN3GRhcJGXv3syAz35i16S9RNR";
    
    if(tipo === 'hoje'){
        //Se for a imagem de hoje, não precisa alterar em nada
    } else if(tipo === 'aleatoria'){
        //Caso seja uma imagem aleatoria, a url precisa desse adicional no final
        url += "&count=1";
    } else if(tipo === 'data') {
        let dataEscolhida = document.getElementById("data-selecionada").value;
        if(!dataEscolhida){
            alert("Escolha uma data");
            return;
        }

        if(dataEscolhida < "1995-06-16") {
            alert("Escolha uma data após 16/06/1995")
            return;
        }
        url += `&date=${dataEscolhida}`;
    }

        
    let response = await fetch(url); 
    let data = await response.json()

    if(Array.isArray(data)){
        data=data[0];
    }
    mostrarImagem(data);

}




//Essa função foi criada para evitar repetição de codigo
async function mostrarImagem(data){

    //Essa condicional serve para informar, caso a api não retorne nada ou tenha algum erro no tipo de midia
    if(!data || !data.media_type){
        document.getElementById("info").innerHTML = `
            <div class="card">
                <p>Erro ao carregar imagem da NASA. Tente novamente.</p>
            </div>
        `;
        return;
    }

    
    
    //Essa variavel foi criada porque a API as vezes retorna links do youtube
    //Data exemplo de video para teste 16/12/2020
    let media;

    if(data.media_type === "image"){
        media = `<img src="${data.hdurl || data.url}">`
    } else {
        let videoUrl = data.url.replace("watch?v=", "embed/")

        media = `<iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>`
    }

    let dataBrasil= new Date(data.date).toLocaleDateString("pt-BR", {timeZone: "UTC"});

    document.getElementById("info").innerHTML = `
        <div class="card">
            <h2 class="titulo">${data.title}</h2>
            ${media}
            <p class="data-publi">Data da publicação: ${dataBrasil}</p>
            <p class="descricao">${data.explanation}</p>
            <p class="copyright">Direitos reservados: ${data.copyright || "Nasa"}</p>
        </div>
    `
}