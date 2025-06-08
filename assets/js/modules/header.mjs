import { cssVariable } from "./common.mjs";
const header = document.querySelector('header');
let state = false;
const updateHeader = ()=>{
    if((window.scrollY>10)!=state){
        state=(window.scrollY > 10)
        if (state) {
            header.style.background = cssVariable("primary-blue");
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.0)';
            header.style.boxShadow = 'none';
        }
    }
}
function init(){
    /*const target = document.querySelector('header');
    console.log(`[${cssVariable("primary-blue")}]`); // "#3498db"
    const observer = new IntersectionObserver((entries) => {
        console.log(entries);
        entries.forEach(entry => {
            if (entry.isIntersecting) {
            // Elemento visible (cima de la página)
            target.classList.add('en-cima');
            //efectoAlSubir();
            } else {
            target.classList.remove('en-cima');
            }
        });
    }, {threshold: }); // 10% del elemento visible

    observer.observe(document.body);*/
    // Header scroll effect
    window.addEventListener('scroll',updateHeader);
    updateHeader();
}
export {init};