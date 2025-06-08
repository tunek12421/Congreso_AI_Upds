function cssVariable(name){
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
}
async function sleep(time){
    await new Promise(r => setTimeout(r, time*1000));
}
export {cssVariable, sleep};