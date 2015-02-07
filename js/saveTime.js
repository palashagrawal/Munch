function saveresults(){
	var bftime= document.getElementById("breakfast-time");
	localStorage.setItem("bftime", bftime.value);
	var lutime= document.getElementById("lunch-time");
	localStorage.setItem("lutime", lutime.value);
	var ditime= document.getElementById("dinner-time");
	localStorage.setItem("ditime", ditime.value);

	var bfstime = localStorage.getItem("lutime");
	var lustime = localStorage.getItem("bftime");
	var distime = localStorage.getItem("ditime");

	var d = new Date();
	var hr = d.getHours();
	var min = d.getMinutes();
	var secs = d.getSeconds();
	if(hr<10){
		var ctime = "0"+hr+":"+min;
	}	
	else{
		var ctime = hr+":"+min;
	}
	alert(ctime);	
}