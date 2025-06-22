const fields = [1, 60, 60, 24, 365];
class Countdown {
	constructor(date, target) {
		this.date = date.getTime();
        this.target = target.querySelectorAll("li");
	}
    countDown(){
        let div = 1;
        let time = Math.floor((this.date - Date.now())/1000);
        if(time<0)time=0;
        for(let i = 0; i<fields.length-1; i++){
            this.target[fields.length-2-i].children[0].textContent=(Math.floor(time/div)%fields[i+1]);
            div *= fields[i+1];
        }
    }
	display() {
        console.log("Countdown: ",this.date, date)
		setInterval(()=>{this.countDown()}, 1000);
	}
}


const date = "Jun 30, 2025 12:00:00";
async function init(){
    let countDown = new Countdown(new Date(date), document.getElementById("counter"));
    countDown.display();
}
export {init};