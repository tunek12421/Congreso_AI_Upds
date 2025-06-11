const video = document.querySelector('.hero-video');
async function init(){
    // Pausar video cuando no está visible (optimización de rendimiento)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) video.play();
            else video.pause();
        });
    });
    observer.observe(video);
}
export {init};