var controller;
var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function () {
        controller = new Controller();
        app.overrideBrowserAlert();        

        // Initialize the map view
        var div = document.getElementById("map_canvas");
        map = plugin.google.maps.Map.getMap(div);

        // Wait until the map is ready status.
        map.addEventListener(plugin.google.maps.event.MAP_READY, controller.onMapReady);

        compass();

        loadSettings();
    },

    overrideBrowserAlert: function() {
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.alert = function (message) {
                navigator.notification.alert(
                    message,    // message
                    null,       // callback
                    "MyShops", // title
                    'OK'        // buttonName
                );
            };
        }
    },

};

app.initialize();
