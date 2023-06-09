function novoElemeto(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}


function barreira(reversa = false){
    this.elemento = novoElemeto('div', 'barreira')

    const borda = novoElemeto('div', 'borda')
    const corpo = novoElemeto('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

/*criação das barreiras*/

function parDeBarreiras(altura, abertura, x){
    this.elemento = novoElemeto('div', 'par-de-barreiras')

    this.superior = new barreira(true)
    this.inferior = new barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new parDeBarreiras(altura, abertura, largura),
        new parDeBarreiras(altura, abertura, largura + espaco),
        new parDeBarreiras(altura, abertura, largura + espaco * 2),
        new parDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    const deslocamento = 3
    this.animar = () =>{
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)
            //quando o elemento sair da área do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouMeio ) notificarPonto()
        })
    }
}



/*passaro*/
function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemeto ('img', 'passaro')
    this.elemento.src = 'img/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true // precionar qualquer tecla
    window.onkeyup = e => voando = false // soltou a tecla

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : - 5)
        const alturaMax = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        }else if (novoY >= alturaMax){
            this.setY(alturaMax)
        }else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}


/*progesso*/
function Progesso(){
    this.elemento = novoElemeto('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }

    this.atualizarPontos(0)
}




/*colisão*/
function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
          && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
          && b.top + b.height >= a.top

          return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                        || estaoSobrepostos(passaro.elemento, inferior)
        }
    })

    return colidiu
}


/*elementos no jogo*/
function FlappyBird(){
    let pontos = 0

    const areaJogo = document.querySelector('[wm-flappy]')
    const altura = areaJogo.clientHeight
    const largura = areaJogo.clientWidth

    const progesso = new Progesso()
    const barreiras = new Barreiras(altura, largura, 200, 400, 
        () => progesso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaJogo.appendChild(progesso.elemento)
    areaJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))
    
    /*start jogo*/
    this.start = () => {
        const temporizador = setInterval(() =>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }

        }, 20)
    }
}

new FlappyBird().start()
