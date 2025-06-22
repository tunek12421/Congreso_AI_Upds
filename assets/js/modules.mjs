const files = [
    "header.mjs",
    "about.mjs",
    "hero.mjs",
    "sponsors.mjs",
    "counter.mjs",
];//agregar nombres de modulos

document.addEventListener('DOMContentLoaded',async ()=>{
    Promise.all(
        files.map(nombre => import(`./modules/${nombre}`))
    ).then((mjs)=>{mjs.forEach((i)=>{i.init();});});
});