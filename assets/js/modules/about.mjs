import { sleep, cssVariable } from "./common.mjs";
const info={
    title: "Un Evento Transformador",
    desc:[
        [
            {// VERSION 1
                type: "title",
                content: `Un Espacio de Conocimiento y Aplicaciones para Bolivia y Latinoamérica`
            },{
                type: "text",
                content: `El II Congreso Internacional de Inteligencia Artificial es un evento abierto al público que busca acercar el conocimiento y las aplicaciones de la inteligencia artificial a la sociedad boliviana y latinoamericana. Tras una exitosa primera edición que reunió a más de 1.200 asistentes, esta segunda versión se consolida como un espacio único de encuentro entre expertos, estudiantes, profesionales y emprendedores.`
            },{
                type: "hr"
            },{
                type: "text",
                content: `Durante el Congreso se abordarán cuatro ejes temáticos fundamentales: productividad empresarial, trading y finanzas, educación, y desarrollo web. Cada temática será presentada por especialistas nacionales e internacionales que mostrarán cómo la IA está transformando nuestro presente y futuro.`
            },
            /*{
                type: "img",
                content: `assets/images/other/Congreso-1.jpg`
            }*/
        ],[
            {// VERSION 2
                type: "title",
                content: `¡La IA Regresa a Bolivia! Sumérgete en el Futuro con el II Congreso Internacional`
            },{
                type: "text",
                content: `¡La inteligencia artificial vuelve a Bolivia con más fuerza! Tras reunir a más de 1.200 personas en su primera edición, el II Congreso Internacional de Inteligencia Artificial se presenta como un evento imperdible para quienes quieren entender, aprender y aplicar la IA en su vida y profesión.`
            },{
                type: "hr"
            },{
                type: "text",
                content: `En esta segunda versión, profundizaremos en temas clave como productividad empresarial, trading y finanzas inteligentes, nuevas metodologías educativas potenciadas con IA y herramientas de desarrollo web. Un evento donde el conocimiento, la tecnología y la innovación se unen para transformar realidades. ¡No te lo pierdas!`
            },
        ],[
            {// VERSION 3
                type: "title",
                content: `UPDS Presenta el II Congreso de IA: Transformando Realidades a Través de la Innovación`
            },{
                type: "text",
                content: `La Universidad Privada Domingo Savio tiene el honor de presentar la segunda versión del Congreso Internacional de Inteligencia Artificial, un evento que en su primera edición logró convocar a más de 1.200 asistentes de distintas regiones del país y del extranjero.`
            },{
                type: "hr"
            },{
                type: "text",
                content: `Este año, el Congreso se enfocará en cuatro áreas estratégicas: la mejora de la productividad empresarial con IA, el uso de tecnologías inteligentes en finanzas y trading, la transformación de la educación mediante herramientas digitales, y el desarrollo web con capacidades automatizadas. Está pensado para todo público, con espacios accesibles, dinámicos y llenos de aprendizaje.`
            },
        ],[
            {// VERSION 4
                type: "title",
                content: `IA en 2025: Vive la Segunda Edición del Congreso que Revoluciona Empresas, Finanzas y Educación`
            },{
                type: "text",
                content: `En 2024, más de 1.200 personas dijeron sí al futuro y participaron en la primera versión del Congreso Internacional de Inteligencia Artificial. Este 2025, volvemos con la segunda edición, más grande, más interactiva y con temas aún más relevantes para nuestra vida diaria.`
            },{
                type: "hr"
            },{
                type: "text",
                content: `El II Congreso abordará cómo la IA está cambiando el mundo real en cuatro áreas principales: la forma en que producimos y gestionamos empresas, cómo invertimos y tomamos decisiones financieras, cómo enseñamos y aprendemos, y cómo diseñamos y desarrollamos sitios web y aplicaciones. Si alguna vez te preguntaste cómo la inteligencia artificial puede ayudarte, este Congreso es para ti.`
            },
        ]
    ],
    delay:0.001,
    startDelay:0.5,
    changeDelay: 10
}
const about = document.getElementById('about-content');
let actived = false;
const observer = new IntersectionObserver(
    async (entries) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                actived = true;
            }else{
                actived = false;
            }
        });
    }, {threshold: [0, 1.0]}
);

async function aboutLoop(){
    while(true){
        if(actived) await start();
        else await sleep(info.changeDelay);
    }
}
async function speak(parent, text, name="p", delay=info.delay){
    let node = document.createElement(name);
    parent.appendChild(node);
    node.textContent="";
    for(const i of text.split("")){
        node.textContent+=i;
        await sleep(delay);
    }
}
let intervalIndex = 0;
async function start(index=intervalIndex){
    //Mostrar loading
    about.innerHTML=`<div class="loader ml-2 mt-1"></div>`;
    await sleep(info.startDelay);
    //Borrar todo
    about.innerHTML="";
    console.log("Index: ",index);
    let content = info.desc[index];
    for(const item of content){
        let textType="p";
        switch(item.type){
            case "title": textType="h3";
            case "text":
                await speak(about, item.content, textType, info.delay);
                break;
            case "hr":
                about.appendChild(document.createElement("hr"));
                break;
            case "img":
                const logoDiv = document.createElement("div");
                logoDiv.classList.add("about-image");
                about.appendChild(logoDiv);
                let img = new Image();
                img.src = item.content;
                img.alt = info.title;
                img.style.maxWidth = "100%";
                img.style.height = "auto";
                await new Promise((resolve) => {
                    img.onload = () => {
                        logoDiv.appendChild(img);
                        resolve();
                    };
                    img.onerror = () => {
                        console.error("No se pudo cargar la imagen:", item.content);
                        resolve();
                    };
                });
                break;
        }
    }
    //Crear botones
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
        let text = "";
        for(const item of content){
            if(item.type == "title" || item.type == "text"){
                text += item.content + "\n";
            }
        }
        navigator.clipboard.writeText(text).then(function() {showToast("Copiado!","success")});
        await sleep(1);
        target.removeAttribute("disabled");
    });
    let restart = false;
    buttons[1].addEventListener("click",()=>{
        restart = true;
    });
    buttons[2].addEventListener("click",(e)=>{
        e.currentTarget.style.color=cssVariable("white");
        buttons[3].style.color="";
    });
    buttons[3].addEventListener("click",(e)=>{
        e.currentTarget.style.color=cssVariable("white");
        buttons[2].style.color="";
    });
    
    for(let i=0; i < info.changeDelay; i+=0.5){
        if(restart)break;
        await sleep(1);
    }
    intervalIndex = (index + 1)% info.desc.length;
}

async function init(){
    observer.observe(about);
    aboutLoop();
}
export {init};
