var fname = "";
var lname = "";

function record() {
    fname = document.getElementById("fn").value;
    lname = document.getElementById("ln").value;

    console.log(fname + ' ' + lname);
}

function welcome(){
    console.log(isSuccess);

    if (isSuccess) {
        var response = "Thanks for your submission, " + fname + " " + lname + "! ";
        response += "We will note down your item preorder, and deliver it to you after September (or contact you ASAP on email)";
    } else {
        var response = "Sorry, That didn't work. Please try again. Error: " + err;
    }

    // add classes to the fluid container
    document.getElementById("finishcontainer").classList.add("importantbox");

    document.getElementById("finishmessage").innerHTML = response;
}