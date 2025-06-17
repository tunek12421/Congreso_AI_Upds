const logos = document.querySelector('.logo_items');
async function init(){
    let logoList = logos.innerHTML;
    let totalsize=0;
    for(let i=0; i<logos.children.length; i++){
        totalsize += logos.children[i].offsetWidth;
    }
    let repeat = Math.ceil(window.innerWidth / totalsize)*2;
    for(let i=1; i<repeat; i++){
        logos.innerHTML = logos.innerHTML+logoList;
    }
}
export {init};