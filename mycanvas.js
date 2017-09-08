(function() { // wrapping our script in an anonymous function to avoid global variables  

    var height = 0; // height of photo determined by aspect ratio of input stream
    var width = 320; // scales the outputted image to a width of 320 pixels

    var streaming = false; // indicates if the camera is currently streaming, currently not

    // The various HTML elements we need to configure or control, set by the startup() function. Each variable will
    // reference various elements after the page is done loading

    var video = null;
    var canvas = null;
    var originalCanvas = document.createElement('canvas');
    var photo = null;
    var startbutton = null;
    var applytext = null;
    var data = null;

    // function startup will run after the page has finished loading. This function will request access to the users webcam, 
    // initialize the output image, and establish our event listeners needed to receive each frame of video, and react when 
    // the button is clicked to capture an image.

    // begin by referencing the major elements we need to access

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        applytext = document.getElementById('applytext');


        // request a video stream using navigator.getUserMedia, without audio. 

        navigator.getMedia = (navigator.getUserMedia || // code to cope with various browsers profiles. (Apparently this method is 'deprecated', but I was unable to get things working with the 'new' MediaDevices.getUserMedia() method. All the information I could find was for this older method :(
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        navigator.getMedia({
                video: true, // requires the stream to have video, otherwise the call will result in an error
                audio: false // specifies that audio is not needed for the stream
            },
            function(stream) {
                if (navigator.mozGetUserMedia) { // checks for firefox support. if detected, tells the video stream to play
                    video.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                }
                video.play(); // returns an object as an input if the above conditions are met, ties the video element to our new stream. ( HTMLMediaElement.play() )
            },
            function(err) { // if above conditions are not met (i.e. no video, user denied access), returns an error in the console.
                console.log("An error occured! " + err);
            }
        );




        video.addEventListener('canplay', function(ev) { // as there will be a delay before the video stream starts to flow, adding canplay event listener to be delivered when the video playback actually begins.
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width); // set the video's height based on the size difference between the input video's actual size, video.videoWidth, and the width at which we're going to render it, width.


                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height); // matches the width and height of our video with the canvas, using Element.setAttribute() on each property
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function(ev) { // add an event handler to capture a still photo via takepicture() function, each time the click event is issued when a user clicks the startbutton
            takepicture();
            ev.preventDefault();
        }, false);

        applytext.addEventListener('click', function(ev) { // add an event handler to capture a still photo via takepicture() function, each time the click event is issued when a user clicks the startbutton
            writememe()
        }, false);

      
        document.getElementById('download').addEventListener('click', function() { //event handler for our download links onclick event. contains id of the canvas and a filename for our image
            downloadCanvas(this, 'myAwesomeMeme.png');
        }, false);

        clearphoto();
    } // close up our startup function, fill the #photo with an indication that none has been captured yet (draws blank canvas, different colour from background canvas)



    function clearphoto() { // clears the photobox and provides a clean canvas. creates a blank image and uses the <img> element to display the most recently captured frame
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png'); // referencing our hidden canvas that we are pulling the image(s) from, to be displayed in the photo box. converts the canvas into a PNG image, and calls photo.settAttribute() to display the 'image' on our photo box
        photo.setAttribute('src', data);
        originalCanvas.getContext('2d').drawImage(canvas, 0, 0, width, height);
    }


    function takepicture() { // function takepicture() captures the currently displayed video frame, converts it into a png file, and displays it in our photo box
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height); // checks if video frame, width, and height are ok, if yes - calls drawimage to draw the current video frame into the (hidden) canvas
            originalCanvas.getContext('2d').drawImage(canvas, 0, 0, width, height);

            data = canvas.toDataURL('image/png'); // converts hidden canvas data into a png file 
            photo.setAttribute('src', data); // sends image file to photo box
        } else {
            clearphoto(); // if this function fails, calls our clearphoto() function to clear the canvas
        }
    }

    function writememe() {
        var context = canvas.getContext('2d');
        // width, height, video prepared beforehand in declaration and startup()
        canvas.width = width;
        canvas.height = height;
		context.drawImage(originalCanvas, 0, 0, width, height); // checks if video frame, width, and height are ok, if yes - calls drawimage to draw the current video frame into the (hidden) canvas

        context.lineWidth = 5; // sets the font style
        context.font = '20pt sans-serif';
        context.strokeStyle = 'black';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.lineJoin = 'round';



        var text = document.getElementById('drawtext').value; // Draw the text
        text = text.toUpperCase();
        x = canvas.width / 2;
        var topPadding = 5;
        var lineHeight = 25; // eyeballed
        y = topPadding + lineHeight;
        var lines = text.split('\n'); // each line needs to be rendered separately, so we create an array because canvas doesn't do this for us
        for (var i = 0; i < lines.length; i++) {
            context.strokeText(lines[i], x, y);
            context.fillText(lines[i], x, y);
            y += lineHeight;
        }

        photo.setAttribute('src', canvas.toDataURL('image/png')); // sends image file to photo box


    }


    function downloadCanvas(link, filename) { // function that allows us to set filename and download, called from onclick handler
        link.href = canvas.toDataURL();
        link.download = filename;
    }


    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener('load', startup, false);
})();