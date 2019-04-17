var curSpeed = 0;
var curIncline = 0;
var curDistance = 0;
var curTime = 0;
var lastTime = 0;
var startTime = 0

var segElements = [];
var curSegment = -1;

var audioElements = [];

var schedule = {}

function pad(i) {
    return i < 10 ? "0"+i : i;
}

function secondsToString(i) {
    var hours = Math.floor(i / 3600);
    var mins = Math.floor((i - hours*60) / 60);
    var secs = Math.floor((i - hours*60 - mins*60));
    if(hours > 0) { return pad(hours)+":"+pad(mins)+":"+pad(secs); }
    else { return pad(mins)+":"+pad(secs); }
}

function updateDistance() {
    if(lastTime == 0) lastTime = curTime;

    var secSince = (curTime.getTime() - lastTime.getTime()) / 1000
    var hrSince = secSince / 60 / 60;
    curDistance += (curSpeed / 10) * hrSince;

    lastTime = curTime;
}

function switchSegment(i) {
    if(curSegment>=0) {
        segElements[curSegment].className = "segment hidden";
    }
    curSegment = i;
    segElements[i].className = "segment selected";
    segElements[i].innerHTML = "<div id='segtime'>00:00</div>"
    segElements[i].innerHTML += "<b>" + segElements[i].getAttribute("data-segname") + "</b><br />";
    segElements[i].innerHTML += "<small>"+
                                segElements[i].getAttribute("data-speed")/10+"mph @ "+
                                segElements[i].getAttribute("data-incline")/10+"% incline"+
                                "</small>";
    curSpeed = segElements[i].getAttribute("data-speed");
    curIncline = segElements[i].getAttribute("data-incline");
    playSprite(i);
}

function updateSegment() {
    if(curSegment<0) switchSegment(0);
    if(curSegment+1 in segElements) {
        var nextStart = segElements[curSegment+1].getAttribute("data-starttime");
        var timeRem = nextStart-timeRunning+1;
        if(timeRem > 0) {
            segElements[curSegment].childNodes[0].innerHTML = secondsToString(timeRem);
        } else {
            switchSegment(curSegment+1);
            updateSegment();
        }
    }
}

function updateApp() {
    curTime = new Date ();
    if(lastTime == 0) startTime = curTime;

    timeRunning = (curTime.getTime() - startTime.getTime()) / 1000;
    document.getElementById("time").innerHTML = secondsToString(timeRunning);

    updateSegment();
    updateDistance();

    document.getElementById("speed").innerHTML = curSpeed/10;
    document.getElementById("incline").innerHTML = curIncline/10;
    document.getElementById("distance").innerHTML = Math.round(curDistance *100) / 100;

}

function playSprite(id) {
    audioElements[id].play();
}

function load() {

    document.getElementById("begin").style.display="none";

    setInterval(updateApp, 100);

    for(var i in schedule) {

        // Generate the segment div for our schedule, and append it
        var element = document.createElement('div');
        element.className = "segment";
        element.innerHTML = "<b>"+secondsToString(i)+"</b>: ";
        element.innerHTML += schedule[i][2] + "<br />"
        element.innerHTML += "<small>"+
                                schedule[i][0]/10+"mph @ "+
                                schedule[i][1]/10+"% incline"+
                            "</small>";
        element.setAttribute("data-starttime", i);
        element.setAttribute("data-speed", schedule[i][0]);
        element.setAttribute("data-incline", schedule[i][1]);
        element.setAttribute("data-segname", schedule[i][2]);
        segElements.push(element);
        document.getElementById("schedule").appendChild(element);

        var pcmData = genTone(schedule[i][0], schedule[i][1]);
        var wave = new RIFFWAVE();
        wave.header.sampleRate = 44100; 
        wave.header.numChannels = 1;
        wave.Make(pcmData);
        var aElement = new Audio(wave.dataURI);
        aElement.load();
        audioElements.push(aElement);
    }

    // Keep the phone from sleeping (hacky)
    // http://stackoverflow.com/q/9709891
    var stayAwake = setInterval(function () {
        location.href = location.href; //try refreshing
        window.setTimeout(window.stop, 0); //stop it soon after
    }, 30000);

}

function pageload() {
    var select = document.getElementById("scheduleselect");
    for(var i in schedules) {
        var option = document.createElement("option");
        option.value = i;
        option.text = i;
        select.add(option);
    }
    schedule = schedules[select.value];

    select.addEventListener("change", function() {
        schedule = schedules[select.value];
    });
    
}





