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
async function init(){
    window.addEventListener('scroll',updateHeader);
    updateHeader();
}
export {init};