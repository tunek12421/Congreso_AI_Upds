import { sleep, cssVariable } from "./common.mjs";
const info={
    title: "Un Evento Transformador",
    desc:`Explorando las últimas tendencias en IA, desde ciudades digitales hasta aplicaciones educativas revolucionarias. Lorem ipsum dolor sit amet consectetur, adipisicing elit. Hic architecto facere veritatis, harum excepturi a. Sequi alias nisi velit eum ea tempora, aspernatur consectetur minus soluta? Nihil maiores illo delectus!`,
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
async function speak(node, text, delay=info.delay){
    node.textContent="";
    for(const i of text.split("")){
        node.textContent+=i;
        await sleep(delay);
    }
}
async function start(){
    about.innerHTML=`<div class="loader ml-2 mt-1"></div>`;
    await sleep(info.startDelay);
    about.innerHTML=
    `<h3></h3>
    <p></p>`;
    await speak(about.querySelector("h3"),info.title);
    await speak(about.querySelector("p"),info.desc);
    about.innerHTML=`${about.innerHTML}
    <div class="about-button">
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
    </div>`;
    let buttons = about.querySelectorAll("button");
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