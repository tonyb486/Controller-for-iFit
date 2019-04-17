var pulse = [0,0]

// This function converts a number to the format needed for the tredmill    
function encodeNumber(value) {

    // First, put a "01" market at the beginning
    var ret = "01"; 

    // Next, encode the number as LSB-first binary (backwards)
    if (value != 0) {
        while(value != 1) {
            ret += (value%2).toString();
            value = Math.floor(value/2);
        }
        ret += "1";
    }
    // Then, pad it to 10 bits if necessary
    while (ret.length <= 10) { ret += "0"; }

    // Finally, clip it at 10 bits if necessary
    console.log(ret.substring(0,10));
    return ret.substring(0,10);

}

// This function generates the pulse sounds for a 1 or a 0
function init() {
    // For a 0, it is just 88 samples (~2ms) of silence
    pulse[0] = Array(88);
    var i = 0;
    while(i<88){ pulse[0][i++] = 127; }

    // For a 1, it is 88 samples (~2ms) of a 2000Hz sine wave
    pulse[1] = Array(88);
    var i = 0;
    while(i<88) {
        var sine = Math.sin(2*Math.PI*2000*(i/44100.0))*(255)/2;
        pulse[1][i++] = Math.round(sine)+127;
    }
}



function genTone(inSpeed, inIncline) {
    var data = [];
    init();

    if(inIncline == 0) { inIncline = 245; }
    else if(inIncline > 145) { inIncline = ((145-inIncline)/5)+141; }

    var speed = encodeNumber(inSpeed);
    var incline = encodeNumber(inIncline);
    var checksum = encodeNumber(inSpeed+inIncline);

    for(var i=0;i<1000;i++) data.push(127)

    for(var i=0;i<10;i++) // Speed
        data = data.concat(pulse[speed[i]])
    for(var i=0;i<10;i++) // Incline
        data = data.concat(pulse[incline[i]])
    for(var i=0;i<10;i++) // Checksum
        data = data.concat(pulse[checksum[i]])

    for(var i=0;i<1000;i++) data.push(127)

    // Repeat
    for(var i=0;i<10;i++) // Speed
        data = data.concat(pulse[speed[i]])
    for(var i=0;i<10;i++) // Incline
        data = data.concat(pulse[incline[i]])
    for(var i=0;i<10;i++) // Checksum
        data = data.concat(pulse[checksum[i]])

    for(var i=0;i<1000;i++) data.push(127)

    return data;

}












