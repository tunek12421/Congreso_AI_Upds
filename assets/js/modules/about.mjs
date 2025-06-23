import { sleep, cssVariable } from "./common.mjs";
const info={
    title: "Un Evento Transformador",
    desc:[
        `La revolución tecnológica impulsada por la Inteligencia Artificial (IA) está transformando radicalmente la educación, la industria, las finanzas y la forma de interacción con el  conocimiento.`,
        `En este contexto, la Universidad Privada Domingo Savio presenta el 2o Congreso Internacional de Inteligencia Artificial 2025, un espacio que se presenta como un espacio multidisciplinario de encuentro, reflexión y difusión de experiencias, investigaciones y desarrollos vinculados al uso de la IA en distintos sectores.`
    ],
    delay:0.001,
    startDelay:0.5,
}
const about = document.getElementById('about-content');
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                start();
                observer.unobserve(about);
            }
        });
    }, {threshold: 1.0}
);
async function speak(parent, text, name="p", delay=info.delay){
    let node = document.createElement(name);
    parent.appendChild(node);
    node.textContent="";
    for(const i of text.split("")){
        node.textContent+=i;
        await sleep(delay);
    }
}
async function start(){
    about.innerHTML=`<div class="loader ml-2 mt-1"></div>`;
    await sleep(info.startDelay);
    about.innerHTML="";
    await speak(about,info.title,"h3");
    for(let i=0;i<info.desc.length;i++){
        if(i>0) about.appendChild(document.createElement("hr"));
        await speak(about,info.desc[i],"p");
    }
    let logoDiv = document.createElement("div");
    logoDiv.classList.add("about-image");
    about.appendChild(logoDiv);

    console.log(logoDiv);
    let logoImg = new Image();
    logoImg.src = "../../images/other/Congreso-1.jpg";
    logoImg.alt = "Congreso AI UPDS";
    logoImg.style.maxWidth = "100%";
    logoImg.style.height = "auto";
    logoImg.onload = () => {
        console.log(logoDiv, logoImg);
        logoDiv.appendChild(logoImg);
    };
    logoImg.onerror = () => {
        console.log("No se pudo cargar la imagen.");
    };

    const buttonDiv = document.createElement("div");
    buttonDiv.className = "about-button";
    buttonDiv.innerHTML = `
        <button>
            <i class="fa fa-clone" aria-hidden="true"></i>
        </button>
        <button>
            <i class="fa fa-refresh" aria-hidden="true"></i>
        </button>
        <button>
            <i class="fa fa-thumbs-up" aria-hidden="true"></i>
        </button>
        <button>
            <i class="fa fa-thumbs-down" aria-hidden="true"></i>
        </button>
    `;
    about.appendChild(buttonDiv);
    let buttons = buttonDiv.querySelectorAll("button");
    buttons[0].addEventListener("click",async (e)=>{
        let target = e.currentTarget;
        target.setAttribute("disabled","");
        navigator.clipboard.writeText(`${info.title}\n${info.desc}`).then(function() {showToast("Copiado!","success")});
        await sleep(1);
        target.removeAttribute("disabled");
    });
    buttons[1].addEventListener("click",start);
    buttons[2].addEventListener("click",(e)=>{
        e.currentTarget.style.color=cssVariable("white");
        buttons[3].style.color="";
    });
    buttons[3].addEventListener("click",(e)=>{
        e.currentTarget.style.color=cssVariable("white");
        buttons[2].style.color="";
    });
}

async function init(){
    observer.observe(about);
}
export {init};