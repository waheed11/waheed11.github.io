function parse_parameters(params) {
    parser = new DOMParser();
    xmlParams = parser.parseFromString(params, "text/xml");

    var parameters = {};
    parameters.m_feature = xmlParams.getElementById("m_feature").childNodes[0].innerHTML;
    parameters.m_height = xmlParams.getElementById("m_height").childNodes[0].innerHTML;
    parameters.m_width = xmlParams.getElementById("m_width").childNodes[0].innerHTML;
    parameters.m_center_x = xmlParams.getElementById("m_center_x").childNodes[0].innerHTML;
    parameters.m_center_y = xmlParams.getElementById("m_center_y").childNodes[0].innerHTML;
    parameters.m_center_z = xmlParams.getElementById("m_center_z").childNodes[0].innerHTML;
    parameters.m_sky_color = xmlParams.getElementById("m_sky_color").childNodes[0].innerHTML;
    parameters.m_show_cursor = (xmlParams.getElementById("m_show_cursor").innerHTML == "<true/>");
    parameters.m_video_url = xmlParams.getElementById("m_video_url").childNodes[0].innerHTML;
    parameters.m_image_url = xmlParams.getElementById("m_image_url").childNodes[0].innerHTML;
    parameters.m_autoloop = (xmlParams.getElementById("m_autoloop").innerHTML == "<true/>");

    if (parameters.m_height == "")
        parameters.m_height = "5"
    if (parameters.m_width == "")
        parameters.m_width = "10"
    if (parameters.m_center_x == "")
        parameters.m_center_x = "0"
    if (parameters.m_center_y == "")
        parameters.m_center_y = "0"
    if (parameters.m_center_z == "")
        parameters.m_center_z = "0"
    if (parameters.m_sky_color == "")
        parameters.m_sky_color = "0"

    parameters.m_sky_color = "#" + parseInt(parameters.m_sky_color).toString(16);

    return parameters;
}

function iframeRef(frameRef) {
        return frameRef.contentWindow
            ? frameRef.contentWindow.document
            : frameRef.contentDocument
}

function init_scene(params, iframe_id) {
    if (document.getElementsByTagName('a-scene').length != 0) {
        return
    }

    var parameters = parse_parameters(params);
    
    load_assets(parameters);

    // Copy button in widget place and bind enterVR on click
    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i]
                if (node.className == "a-enter-vr") {
                    button = node.cloneNode(true)
                    iframeRef(document.getElementById(iframe_id)).body.appendChild(
                        button
                    );
                    button.addEventListener('click', function() {
                        var scene = parent.document.getElementsByTagName("a-scene")[0];
                        scene.removeAttribute('style');
                        scene.enterVR();
                    });
                    button.setAttribute("style", "height:90%; width:90%;");
                    button.getElementsByClassName("a-enter-vr-button")[0].setAttribute(
                        "style", "height:90%; width:90%;"
                    );
                }
            }
        })
    })

    document.getElementsByTagName("a-scene")[0].addEventListener('enter-vr', function() {
        observer.disconnect()
        document.getElementById(iframe_id).style.display = 'none';
        load_scene(parameters);

    });
    document.getElementsByTagName("a-scene")[0].addEventListener('exit-vr', function() {
        var a_scene = document.getElementsByTagName("a-scene")[0];
        a_scene.style.display = "none";
        var children = a_scene.childNodes;
        if (children != []) {
            for (var i = children.length -1; i>= 0; i--) {
                if (children[i].tagName == "A-ENTITY"
                    || children[i].tagName == "A-SKY"
                    || children[i].tagName == "A-VIDEO") {
                    if (! children[i].hasAttribute('aframe-injected')) {
                        a_scene.removeChild(children[i]);
                    }
                }
            }
        }
        document.getElementById(iframe_id).style.display = '';
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
    })
}

function unload_scene() {
    observer.disconnect();
}

function load_assets(parameters) {
    var a_scene_assets = document.createElement('a-scene');

    AFRAME.registerComponent('cursor-listener', {
        init: function () {
            this.el.addEventListener('click', function (evt) {
                document.getElementById("Forward").click()
            });
        },
        remove: function () {
            this.el.removeEventListener('click');
        }
    });

    if (parameters.m_feature == "slides") {
        html2canvas(
            document.getElementById("main_container"), {
                onrendered: function(canvas) {
                    canvas.id = 'slidecanvas';
                    document.getElementsByTagName("a-assets")[0].appendChild(canvas);
                },
            }
        );
        AFRAME.registerComponent('draw-canvas', {
            schema: {default: ''},

            init: function () {
                console.log("Init");
                observer = new MutationObserver(function(mutations) {
                    console.log("Change");
                    html2canvas(
                        document.getElementById("main_container"), {
                            onrendered: function(canvas) {
                                var dest_canvas = document.getElementById('slidecanvas');
                                var destCtx = dest_canvas.getContext('2d');
                                destCtx.drawImage(canvas, 0, 0);
                            },
                        }
                    );
                })
                observer.observe(document.getElementById("div_Slide"), {
                    childList: true,
                    subtree: true,
                    attributes: false,
                    characterData: true,
                })
                // Force canvas reload by changing a node
                ex_div = document.createElement('div');
                ex_div.style.display = 'none';
                document.getElementById("div_Slide").appendChild(ex_div);
            },

            remove: function () {
                console.log("remove");
                observer.disconnect();
            },
        });

        var a_assets = document.createElement('a-assets');
        a_scene_assets.appendChild(a_assets);

    } else {
        var a_assets = document.createElement('a-assets');
        if (parameters.m_feature == "image") {
            var img = document.createElement('img');
            img.setAttribute("src", parameters.m_image_url);
            img.setAttribute("crossorigin", "anonymous");
            img.id = "widget_img";
            a_assets.appendChild(img);
        }
        if (parameters.m_feature == "video") {
            var video = document.createElement('video');
            video.setAttribute("src", parameters.m_video_url);
            video.id = "widget_video";
            video.setAttribute('loop', parameters.m_autoloop);
            video.setAttribute("crossorigin", "anonymous");
            a_assets.appendChild(video);
            var meta_tag = document.createElement('meta');
            meta_tag.setAttribute("name", "apple-mobile-web-app-capable");
            meta_tag.setAttribute("content", "yes");
            document.getElementsByTagName('head')[0].appendChild(meta_tag);
        }
        a_scene_assets.appendChild(a_assets);
    }
    a_scene_assets.style.display = "none";
    a_scene_assets.setAttribute('cursor-listener', '');

    document.body.appendChild(a_scene_assets);
}

function load_scene(parameters) {
    var a_scene = document.getElementsByTagName("a-scene")[0];
    var a_entity_camera = document.createElement('a-entity');

    if (parameters.m_feature == "slides") {
        var a_iframe_entity = document.createElement('a-entity');
        var geometry = "primitive: plane; width: ".concat(
            parameters.m_width.concat(
                "; height: ".concat(
                    parameters.m_height)))
        a_iframe_entity.setAttribute("geometry", geometry);
        a_iframe_entity.setAttribute("material", "src: #slidecanvas");
        var center = parameters.m_center_x.concat(" ".concat(
            parameters.m_center_y.concat(" ".concat(
                parameters.m_center_z))))
        a_iframe_entity.setAttribute("position", center);
        a_scene.appendChild(a_iframe_entity);
        a_iframe_entity.setAttribute("draw-canvas", "slidecanvas");

        var a_sky = document.createElement('a-sky');
        a_sky.setAttribute('color', parameters.m_sky_color);
        a_scene.appendChild(a_sky);
        a_entity_camera.setAttribute('position', "0 0 4");
    }
    if (parameters.m_feature == "image") {
        var a_sky = document.createElement('a-sky');
        a_sky.setAttribute('src', '#widget_img');
        a_scene.appendChild(a_sky);
        a_entity_camera.setAttribute('position', "0 0 0");
    }
    if (parameters.m_feature == "video") {
        var a_video = document.createElement('a-videosphere');
        a_video.setAttribute('src', '#widget_video');
        a_scene.appendChild(a_video);
        a_entity_camera.setAttribute('position', "0 0 0");
    }

    if (parameters.m_show_cursor) {
        a_entity_camera.setAttribute('camera', '');
        a_entity_camera.setAttribute('mouse-cursor', '');
    } else {
        var a_camera = document.createElement('a-camera');
        a_entity_camera.appendChild(a_camera);
    }
    a_scene.appendChild(a_entity_camera);


}
