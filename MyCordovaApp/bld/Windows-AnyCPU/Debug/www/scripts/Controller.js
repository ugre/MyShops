var Controller = function() {
    
    var controller = {
        self: null,
        initialize: function() {
            self = this;
            self.bindEvents();
            self.renderMapView();

        },

        bindEvents: function() {
        	$('.tab-button').on('click', this.onTabClick);

        },

        onTabClick: function(e) {
        	e.preventDefault();
            if ($(this).hasClass('active')) {
                return;
            }
        	
            var tab = $(this).data('tab');
            if (tab === '#map-tab') {
                self.renderMapView();
            } else if (tab === '#list-tab') {
                self.renderListView();
            } else
                self.renderSettingsView();
        },

        renderMapView: function() {
            $('.tab-button').removeClass('active');
            $('#map-tab-button').addClass('active');

            /*var $tab = $('#tab-content');
            $tab.empty();*/


            $("#list-tab,#settings-tab").hide();
            $("#map-tab").show('fast', function() {
                
            });

            /*$("#tab-content").load("./views/map-view.html", function(data) {

            }); */
        },

        renderListView: function() {
            $('.tab-button').removeClass('active');
            $('#list-tab-button').addClass('active');

            //var $tab = $('#tab-content');

            $("#map-tab, #settings-tab").hide();
            $("#list-tab").show('fast', function() {
                
            });

            /*$tab.empty();
            $("#tab-content").load("./views/list-view.html", function(data) {

            }); */
        },        

        renderSettingsView: function(){
            $('.tab-button').removeClass('active');
            $('#settings-tab-button').addClass('active');

            $("#map-tab, #list-tab").hide();
            $("#settings-tab").show('fast', function() {
                
            });

            /*var $tab = $('#tab-content');
            $tab.empty();
            $("#tab-content").load("./views/settings-view.html", function(data) {

            }); */
        }
    }
    controller.initialize();
    return controller;
}
