var fname = "";
var lname = "";
var age = "";

function welcome(){
    fname = document.getElementById("fname").value;
    lname = document.getElementById("lname").value;
    age = document.getElementById("age").value;

    if (age <= 3){
        document.getElementById("mod").innerHTML = "You seem a bit young...";
        age = "";
    }else if (fname != "" && lname != ""){
        document.getElementById("mod").innerHTML = "Hello, " + fname + " " + lname[0] + "!";
    }
}

function submit1(){
    // i dont care about anything else, since its only one selection that matters
    let s2 = document.getElementById("sel2").checked;

    let msg = document.getElementById("msg");

    if (fname == "" || lname == "" || age == ""){
        msg.innerHTML = "Please enter your name first, kind stranger!";
    }else if (s2){
        msg.innerHTML = "Yes, that's right, " + fname + "!";
    } else{
        msg.innerHTML = "No, please try again, " + fname + "!";
    }
}

function submit2(){
    let s1 = document.getElementById("sel12").checked;
    let s2 = document.getElementById("sel22").checked;
    let s3 = document.getElementById("sel32").checked;

    let msg2 = document.getElementById("msg2");

    if (fname == "" || lname == "" || age == ""){
        msg2.innerHTML = "Please enter your name first, kind stranger!";
    } else if (s1 && s2 && s3){
        msg2.innerHTML = "Too many selections! Choose two, please.";
    } else if (s2 && s3){
        msg2.innerHTML = "Yes, that's right, " + fname + "!";
    } else if ((s1 && s2) || (s1 && s3)){
        msg2.innerHTML = "No, please try again, " + fname + "!";
    } else{
        msg2.innerHTML = "Too few selections! Choose two, please.";
    }
}