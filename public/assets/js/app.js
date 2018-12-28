var apihost = "https://api.touristreview.io";
var apiupload = "https://upload.touristreview.io";
var socket = io("https://mvp.touristreview.io");

var avatarInput = $("#avatar-input");
var coverInput = $("#cover-input");
var avatar = $(".profile-photo");
var cover = $(".cover-image");
var $modal = $('#modal-crop');
var image = document.getElementById('imagedrop');
var token = $("#token").val();
var event = "";

avatarInput.change(function (e) {
    event = 'a';
    var files = e.target.files;
    var done = function (url) {
        avatarInput.value = '';
        image.src = url;
        $modal.modal('show');
    };

    if (files && files.length > 0) {
        file = files[0];

        if (URL) {
            done(URL.createObjectURL(file));
        } else if (FileReader) {
            reader = new FileReader();
            reader.onload = function (e) {
                done(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }
});

coverInput.change(function (e) {
    event = 'c';
    var files = e.target.files;
    var done = function (url) {
        avatarInput.value = '';
        image.src = url;
        $modal.modal('show');
    };

    if (files && files.length > 0) {
        file = files[0];

        if (URL) {
            done(URL.createObjectURL(file));
        } else if (FileReader) {
            reader = new FileReader();
            reader.onload = function (e) {
                done(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }
});

$modal.on('shown.bs.modal', function () {
    if (event === 'a') {
        cropper = new Cropper(image, {
            aspectRatio: 1,
            viewMode: 3,
        });
    } else {
        cropper = new Cropper(image, {
            aspectRatio: 103 / 36,
            viewMode: 3,
        });
    }

}).on('hidden.bs.modal', function () {
    cropper.destroy();
    cropper = null;
});

document.getElementById('image-crop').addEventListener('click', function () {
    var initialAvatarURL;
    var canvas;

    $modal.modal('hide');

    if (cropper) {
        if (event === 'a') {
            var url = apiupload + '/uploadAvatar?_csrf=' + token;
            var imageChange = avatar;
            canvas = cropper.getCroppedCanvas({
                width: 500,
                height: 500,
            });
        } else {
            var imageChange = cover;
            var url = apiupload + '/uploadCover?_csrf=' + token;
            canvas = cropper.getCroppedCanvas({
                width: 1030,
                height: 360,
            });
        }

        initialAvatarURL = avatar.src;
        canvas.toBlob(function (blob) {
            var formData = new FormData();


            formData.append('image', blob, 'avatar.jpg');
            $.ajax(url, {
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data['success']) {
                        imageChange.attr('src', canvas.toDataURL());
                    }
                },

                error: function () {
                    imageChange.attr('src', initialAvatarURL);
                },

                complete: function () {

                },
            });
        });
    }
});