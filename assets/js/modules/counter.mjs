const fields = [1, 60, 60, 24, 365];
class Countdown {
	constructor(date, target, liveTarget) {
		this.date = date.getTime();
        this.target = target;
        this.counterNodes=target.querySelectorAll("li");
        this.liveTarget = liveTarget;
	}
    countDown(){
        let div = 1;
        let time = Math.floor((this.date - Date.now())/1000);
        if(time<0){
            time=0;
            this.createLive();
            clearInterval(this.ID);
        }
        for(let i = 0; i<fields.length-1; i++){
            this.counterNodes[fields.length-2-i].children[0].textContent=(Math.floor(time/div)%fields[i+1]);
            div *= fields[i+1];
        }
    }
    async createLive(){
        this.liveTarget.classList.add("counter-live");
        this.target.querySelector(".counter-card").classList.add("counter-hide");
        this.liveTarget.innerHTML=
        `<a href="www.facebook.com" target="_blank">
            <i class="fa-brands fa-facebook"></i> Ver transmisión <span class="live-icon"></span>
        </a>`;
    }
	display() {
		this.ID = setInterval(()=>{this.countDown()}, 1000);
	}
}


const date = "Jul 31, 2025 12:00:00";
const counter = document.getElementById("counter");
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                let countDown = new Countdown(new Date(date), counter, document.getElementById("counter-live"));
                countDown.display();
                observer.unobserve(counter);
            }
        });
    }, {threshold: 1.0}
);
async function init(){
    observer.observe(counter);
}
export {init};