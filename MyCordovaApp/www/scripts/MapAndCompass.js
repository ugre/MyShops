var map;
var pastMarker = null;
var clickedStoreLat, clickedStoreLng, clickedStoreTitle;
var currentLat = null, currentLng = null;
var compassID;
var tracking = false;
var watchID;
var aceleroID;

/*function onMapReady() {
    map.setMapTypeId(plugin.google.maps.MapTypeId.HYBRID);

    loadMapWithData(); //ucitaj "prodavnice", ovo moze i iz baze podataka     
}*/

function mapFullScreen() {
    map.showDialog();
}

function mapTrackMe() { //ovo ne moze da se prekine
    var options = {
        maximumAge: 10000,   //bilo 3600000
        timeout: 10000,
        enableHighAccuracy: true,
    }

    if (tracking)
    {
        tracking = false;
        navigator.geolocation.clearWatch(watchID);
        return;
    }

    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);

    function onSuccess(position) {
        /*
        alert('Latitude: ' + position.coords.latitude + '\n' +
            'Longitude: ' + position.coords.longitude + '\n' +
            'Altitude: ' + position.coords.altitude + '\n' +
            'Accuracy: ' + position.coords.accuracy + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
            'Heading: ' + position.coords.heading + '\n' +
            'Speed: ' + position.coords.speed + '\n' +
            'Timestamp: ' + position.timestamp + '\n');
        */
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;

        tracking = true;
        addMarker(currentLat, currentLng);
    };

    function onError(error) {
        //alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }
}

function mapFindMe() {
    var options = {
        enableHighAccuracy: true,
        maximumAge: 1000
    };

    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    function onSuccess(position) {
        
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;

        addMarker(currentLat, currentLng);
    }

    function onError(error) {
        //alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
    }
}

/*function addShop(x, y, title, sniplet) {
    map.addMarker({
        'position': { lat: x, lng: y },
        'title': title,
        'sniplet': sniplet,
        'icon': 'blue'
    }, function (marker) {
       
        marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
            clickedStoreLat = marker.get("position").lat;
            clickedStoreLng = marker.get("position").lng;
            clickedStoreTitle = marker.get("title");

            dialogConfirm("Navigate to store " + marker.get("title"), "Navigation", ["YES", "SEND TO FRIEND", "NO"]);

        });
    });
}*/

function addMarker(x, y) {
    if (pastMarker !== null) {
        pastMarker.setPosition(new plugin.google.maps.LatLng(x, y));
        pastMarker.showInfoWindow();
    }
    else
        map.addMarker({
            'position': { lat: x, lng: y },
            'title': "Me",
            'icon': 'red'
        }, function (marker) {
            //alert(marker.get("position"));
            pastMarker = marker;
            marker.showInfoWindow();            
        });

    map.animateCamera({
        target: { lat: x, lng: y },
        zoom: 17, //17 za finalnu verziju
        tilt: 0,
        bearing: 0,
        duration: 500
    });
}

function dialogConfirm(message, title, buttonLabels) {
    navigator.notification.confirm(message, confirmCallback, title, buttonLabels);

    function confirmCallback(buttonIndex) {
        //ne pokusavaj da refaktorises funkciju dialogConfirm, nikako ne mogu sa return da vratim vrednost odabranog dugmeta pa mora ovde da se bira
        if (buttonIndex == 1) {
            navigateToStore();
        } else if (buttonIndex == 2) {
            pickNumber();
        }
    };
}

function pickNumber(contact) {
    navigator.contacts.pickContact(function (contact) {
        var numberArray = [];
        for (var i = 0; i < contact.phoneNumbers.length; i++) {
            numberArray.push(contact.phoneNumbers[i].value);
        }
        
        navigator.notification.confirm("Send to which number?", confirmCallback, "Send SMS", numberArray); //max 3 dugmeta mogu da se prikazu, nema 4. broja

        function confirmCallback(buttonIndex) {
            var streetView = "http://www.google.com/maps/place/";
            var message = "I am visitting " + clickedStoreTitle + ". I am at " + currentLat + "," + currentLng + "\n " + streetView + clickedStoreLat + "," + clickedStoreLng;
            sendSms(numberArray[buttonIndex - 1], message);
        };

    }, function (err) {
        console.log('Error: ' + err);
    });

    console.log('The following contact has been selected:' + JSON.stringify(contact));
}

function sendSms(number, message) {
    //CONFIGURATION
    var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
            intent: 'INTENT'  // send SMS with the native android SMS messaging
            //intent: '' // send SMS without open any other app
        }
    };

    var success = function () { /*alert('Message sent successfully');*/ }; //ovaj alert poziva i pre nego sto se pojavi sms aplikacija
    var error = function (e) { alert('Message Failed:' + e); };
    sms.send(number, message, options, success, error);
}

function compass() {
    function onSuccess(heading) {
        heading = parseInt(heading.magneticHeading);
        document.getElementById('heading').innerHTML = 'Heading: ' + heading + "°";
        //var compass = document.getElementById('compassArrow')
        angle = -parseInt(heading);
        angle += 90;
        $('#compassArrow').css('transform', 'rotate(' + angle + 'deg)');
    };

    function onError(compassError) {

        if (compassError.code == CompassError.COMPASS_INTERNAL_ERR)
            alert("Compass internal error!");
        else if (compassError.code == 3)
            alert("Compass not supported on this device!");

        //$("#compassArrow").hide();
        navigator.compass.clearWatch(compassID);
    };

    var options = {
        frequency: 100
    }; // Update every 3 seconds

    compassID = navigator.compass.watchHeading(onSuccess, onError, options);
}

function navigateToStore() {
    var distance = gpsDistance(currentLat, currentLng, clickedStoreLat, clickedStoreLng)
    document.getElementById("gpsDistance").innerHTML = clickedStoreTitle + " " + distance + "m";

    if (distance < 10)
    {
        alert("You are hear!");
        navigator.compass.clearWatch(compassID);    //stop compass from updating
    }
    else if (distance < 29)
    {
        aceleroID = navigator.accelerometer.getCurrentAcceleration(deviceMoving, onErrorAccelerometer);
        setTimeout(navigateToStore, 3000);
    }
    else if (distance < 30) {
        alert('You are near article.');
        document.getElementById("gpsDistance").innerHTML = "";        
        document.getElementById('heading').innerHTML = 'Heading: ';
    } else {         
        setTimeout(navigateToStore, 5000);
    }
    mapFindMe();
}

function deviceMoving(acceleration) {
    //ako se uredjaj krece, zvucno obavesti korisnika da je stigao
    if ((acceleration.x + acceleration.y + acceleration.z) > 15) {
        navigator.vibrate(1000);
        navigator.notification.beep(1);
    }

}

function onErrorAccelerometer() {
    alert('onError!');
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

function gpsDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return parseInt(d*1000); //vracaj metre
}

function settingsSave() {
    var obj = new Object();
    
    if ($('#settingsDarkTheme').is(':checked')) {
        obj.theme = "b";
    } else {
        obj.theme = "a";
    }
    
    obj.batterySave = $('#settingsBatterySave').is(':checked');
    obj.notification = $('#settingsNotification').is(':checked');
    
    var jsonString = JSON.stringify(obj);

    localStorage.setItem("theme", obj.theme);
    localStorage.setItem("batterySave", obj.batterySave);
    localStorage.setItem("notification", obj.notification);

    window.plugins.toast.showShortBottom("Settings successfully saved");
}

$("#settingsDarkTheme").change(function () {
    if (this.checked)
        theme = 'b';
    else
        theme = 'a';

    changeTheme(theme);
});

function changeTheme(theme)
{
    $("div[data-role='page']").find('.ui-btn')
                       .removeClass('ui-btn-up-a ui-btn-up-b ui-btn-hover-a ui-btn-hover-b')
                       .addClass('ui-btn-up-' + theme)
                       .attr('data-theme', theme);
    $("div[data-role='page']").find('.ui-header, .ui-footer')
                       .removeClass('ui-bar-a ui-bar-b')
                       .addClass('ui-bar-' + theme)
                       .attr('data-theme', theme);
    $("div[data-role='page']").removeClass('ui-body-a ui-body-b')
                       .addClass('ui-body-' + theme)
                       .attr('data-theme', theme);
}

function settingsExport() {

}

function settingsImport() {

}

function loadSettings() {
    var obj = new Object();

    obj.batterySave = localStorage.getItem("batterySave");
    obj.notification = localStorage.getItem("notification");
    obj.theme = localStorage.getItem("theme");

    if (obj.batterySave !== null && obj.notification !== null && obj.theme !== null) {
        document.getElementById("settingsBatterySave").checked = JSON.parse(obj.batterySave);
        document.getElementById("settingsNotification").checked = JSON.parse(obj.notification);

        if (obj.theme === "b") {
            document.getElementById("settingsDarkTheme").checked = true;
        } else {
            document.getElementById("settingsDarkTheme").checked = false;
        }

        changeTheme(obj.theme);        
    }
    var jsonString = JSON.stringify(obj);
    //alert(jsonString);
}