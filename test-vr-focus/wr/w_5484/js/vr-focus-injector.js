var VRFocusWDGT = {
    onLoad: function()
    {
        if ( ! this.captivate ){
            return;
        }

        this.movieProps = this.captivate.CPMovieHandle.getMovieProps();
        if ( ! this.movieProps ){
            return;
        }

        this.widgetParams = this.captivate.CPMovieHandle.widgetParams();
   
        this.varHandle = this.movieProps.variablesHandle;

        this.eventDisp = this.movieProps.eventDispatcher;
       
        // example of listening to Captivate event 
        //this.eventDisp.addEventListener(this.eventDisp.SLIDE_ENTER_EVENT,function(e){
                // do something on slide enter
        //});
        this.eventDisp.addEventListener(this.eventDisp.SLIDE_EXIT_EVENT, function(e) {
            console.log("Exit");
        });

        var wdgt_params = this.widgetParams;
        var iframe_id = window.frameElement.id
        inject_scripts_parent(function () {
            parent.init_scene(wdgt_params, iframe_id);
        });
    },
    onUnload: function()
    {
        parent.unload_scene(iframe_id);
        document.body.innerHTML = '';
    }
}

var VRFocus = function ()
{
    return VRFocusWDGT;
}

function inject_scripts_parent(callback) {
    var script2_child = document.querySelector('script[src*="html2canvas.min.js"]');
    var script2_parent = parent.document.createElement('script');
    script2_parent.setAttribute('type', 'text/javascript');
    script2_parent.setAttribute('src', script2_child.src);
    script2_parent.setAttribute('async', false);
    script2_parent.setAttribute('defer', false);
    parent.document.getElementsByTagName('head')[0].appendChild(script2_parent);

    var script4_child = document.querySelector('script[src*="mouse-cursor"]');
    var script4_parent = parent.document.createElement('script');
    script4_parent.setAttribute('type', 'text/javascript');
    script4_parent.setAttribute('src', script4_child.src);
    script4_parent.setAttribute('async', false);
    script4_parent.setAttribute('defer', false);
    parent.document.getElementsByTagName('head')[0].appendChild(script4_parent);

    var script1_child = document.querySelector('script[src*="aframe.min.js"]');
    var script1_parent = parent.document.createElement('script');
    script1_parent.setAttribute('type', 'text/javascript');
    script1_parent.setAttribute('src', script1_child.src);
    script1_parent.setAttribute('async', false);
    script1_parent.setAttribute('defer', false);
    script1_parent.onload = function() {

        var script3_child = document.querySelector('script[src*="vr-focus-content"]');
        var script3_parent = parent.document.createElement('script');
        script3_parent.setAttribute('type', 'text/javascript');
        script3_parent.setAttribute('src', script3_child.src);
        script3_parent.setAttribute('async', false);
        script3_parent.setAttribute('defer', false);
        script3_parent.onload = function() {
            if(typeof callback == 'function')
                callback();
        }
        parent.document.getElementsByTagName('head')[0].appendChild(script3_parent);
    }
    parent.document.getElementsByTagName('head')[0].appendChild(script1_parent);
}
