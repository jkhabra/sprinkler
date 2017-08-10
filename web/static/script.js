let allButtons = document.querySelectorAll('.publish-button');
let state = window.state = {
  isBigPictureVisible: false,
  allImages: document.querySelectorAll('.post-image'),
  selectedImages: []
};

// Publish post on Facebook
function publish() {
  for (let i = 0; i < allButtons.length; i++) {
    let button = allButtons[i];

    button.addEventListener('click', function(event) {
      let btn = event.target;
      let url = '/publish-photo?id=' + btn.dataset.photoId;
      let parent = btn.parentNode;
      parent.querySelector('.spinner').style.display='';
      parent.querySelector('.color').style.background='black';
      parent.querySelector('.post-image').style.opacity='0.5';

      fetch(url)
        .then(function(response) {
          return response.json();
        })
        .then(function(res) {
          console.warn(res);

          if (res.status === 'ok' || res.status === 'success') {
            console.log('Your post successfully posted to Facebook');
            parent.querySelector('.spinner').style.display='none';
            parent.querySelector('.post-image').classList.add('thumb2');
            parent.querySelector('.success').style.display='';
          }
          if (res.status === 'error'){
            parent.querySelector('.spinner').style.display='none';
            parent.querySelector('.post-image').classList.add('thumb3');
            parent.querySelector('.error').style.display='';
          }
          else {
            throw new Error('Failed to publish image');
          }
        })
        .catch(function(error) {
          console.log('There has been a problem with your fetch operation: ' + error.message);
        });
      btn.classList.add('disabled');
      btn.setAttribute('disabled', 'disabled');
    });
  }
}

// Make image bigger on click
function setUpBigimage() {
  let allImages = document.querySelectorAll('.post-image');

  for (let i = 0; i < allImages.length; i++) {
    let image = allImages[i];

    image.addEventListener('click', function(event) {
      event.stopPropagation();
      let img = event.target;
      let img_src = new URL(img.src).pathname;
      window.img = img;
      let parent = img.parentNode;
      let big_image = document.querySelector('#big-image');

      big_image.style.display='';

      if (img_src.endsWith('.mp4')) {
        big_image.querySelector('.big-video').src = img_src;
        big_image.querySelector('.big-video').style.display='';
        big_image.querySelector('img').style.display='none';
      }

      else {
        big_image.querySelector('img').src = img_src;
        big_image.querySelector('.big-video').style.display='none';
        big_image.querySelector('img').style.display='';
      }
      state.isBigPictureVisible = true;
    });
  }
}

// Display next image on click right button
function nextBigImage(){
  let rightSide = document.querySelector('.right');
  rightSide.addEventListener('click', function(event) {
    let right = event.target;
    let currentImage = right.parentNode.querySelector('.b-image').src;
    let allImages = document.querySelectorAll('.post-image');

    for(let i = 0; i < allImages.length; i++) {
      if (allImages[i].src === currentImage){
        let bigImageIndex = i;
        let next = allImages[bigImageIndex + 1].src;
        let imagePath = new URL(next).pathname;

        if (imagePath.endsWith('.mp4')) {
          let mp4 = imagePath;
          window.m = mp4;
          right.parentNode.querySelector('.big-video').style.display='';
          right.parentNode.querySelector('.b-image').style.display='none';
          right.parentNode.querySelector('.big-video').src=mp4;
        }
        else {
          right.parentNode.querySelector('.b-image').style.display='';
          right.parentNode.querySelector('.big-video').style.display='none';
        }
        right.parentNode.querySelector('.b-image').src=imagePath;
      }
    }
  });
}

// Display previous image on click left button
function previousBigImage() {
  let leftSide = document.querySelector('.left');
  leftSide.addEventListener('click', function(event) {
    let left = event.target;
    let currentImage = left.parentNode.querySelector('.b-image').src;
    let allImages = document.querySelectorAll('.post-image');

    for(let i = 0; i < allImages.length; i++) {
      if (allImages[i].src === currentImage){
        let bigImageIndex = i;
        let previors = allImages[bigImageIndex - 1].src;
        let imagePath = new URL(previors).pathname;

        if (imagePath.endsWith('.mp4')) {
          let mp4 = imagePath;
          left.parentNode.querySelector('.big-video').style.display='';
          left.parentNode.querySelector('.b-image').style.display='none';
          left.parentNode.querySelector('.big-video').src=mp4;
        }
        else {
          left.parentNode.querySelector('.b-image').style.display='';
          left.parentNode.querySelector('.big-video').style.display='none';
        }
        left.parentNode.querySelector('.b-image').src=imagePath;
      }
    }
  });
}

// Make big image's display none when click outside of target image
function hideBigImage() {
  document.body.addEventListener('click', function(event) {
    if (!state.isBigPictureVisible) {
      return;
    }

    let target = event.target;
    let bigImg = document.querySelector('#big-image');

    if (target !== bigImg.querySelector('img')){
      bigImg.style.display='none';
      state.isBigPictureVisible = false;
    }
    if (target === bigImg.querySelector('.right') || target === bigImg.querySelector('.left') || target === bigImg.querySelector('.big-video')) {
      bigImg.style.display='';
      state.isBigPictureVisible = true;
    }
  });
}


// Mark/Unmark check boxes on images
function markImage() {
  let allMarks = document.querySelectorAll('.mark-icon');

  for (let i = 0; i < allMarks.length; i++) {
    let mark = allMarks[i];

    mark.addEventListener('click', function(event) {
      let markElement = event.target;
      let markId = markElement.dataset.markId;

      // START Change selected-image checkbox
      if (markElement.dataset.isMarked === "true") {
        markElement.style.backgroundImage="url('/static/icons/un-mark.png')";
        markElement.dataset.isMarked = false;

        // remove image from selected images state
        let index = state.selectedImages.map(function(o) {return o.src;}).indexOf(markElement.parentNode.parentNode.querySelector('.post-image').src);
        let remove = state.selectedImages.splice(index, 1);
        document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
      }
      else {
        markElement.style.backgroundImage="url('/static/icons/mark.png')";
        markElement.dataset.isMarked = true;
        // END Change selected-image checkbox

        // Add image to selected images state
        let imageSrc = markElement.parentNode.parentNode.querySelector('.post-image').src;
        let title = markElement.parentNode.parentNode.parentNode.querySelector('.post-title').innerText;
        state.selectedImages.push({title:title, src:imageSrc, id:markId});

        // Update sidebar with new selected images
        document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
      }

      timePicker();
      removeSchedule();
      setSchedule();
    });
  }
}

// remove marked image form side-bar
function removeSchedule(){
  let allCancel = document.querySelectorAll('.cancel-schedule');

  for (let i = 0; i < allCancel.length; i++) {
    let cancel = allCancel[i];

    cancel.addEventListener('click', function(event) {
      let cancelElement = event.target;

      // remove image from selected images state
      let index = state
          .selectedImages
          .map(o => o.src)
          .indexOf(cancelElement.parentNode.querySelector('.small-image').src);

      state.selectedImages.splice(index, 1);
      document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
      timePicker();
    });
  }
}

// Add cancel button when schedule is clicked
function setSchedule() {
  let allSchedule = document.querySelectorAll('.done');

  for (let i = 0; i < allSchedule.length; i++){
    let done = allSchedule[i];

    done.addEventListener('click', function(event){
      let doneElement = event.target;
      let parent = doneElement.parentNode;
      doneElement.innerHTML = 'Cancel';
    });
  }
}

// function takes url and returns inner html
function makeSelectedImagesHtml (urls) {
  let html = '';
  for (let key in state.selectedImages) {
    let value = state.selectedImages[key];

    if (value.src.endsWith('.mp4')){
      html += `<div class="post-time">
                 <span class='cancel-schedule'></span>
                 <p class="side-title">${value.title}</p>
                 <p class="set">Set time</p>
                 <input type="time" name="time" placeholder="Set time" id="set-time" />
                 <div class="side-image">
                 <video mute class="small-image" src='${value.src}'></video>
                 </div>
                 <a class="done">schedule</a>
               </div>`;
    } else {
      html += `<div class="post-time">
                 <span class='cancel-schedule'></span>
                 <div class='spinner' style='display:none;'></div>
                 <p class="side-title">${value.title}</p>
                 <p class="set">Set time</p>
                 <input type="time" name="time" placeholder="Set time" id="set-time" />
                 <div class="side-image">
                 <img class="small-image" src='${value.src}'>
                 </div>
                 <a class="done">schedule</a>
               </div>`;
    }
  }
  return html;
}

// add time picker
function timePicker(){
  const time = flatpickr('#set-time', {
    enableTime: true,
    noCalendar: true,
    enableSeconds: false,
    time_24hr: false,
    dateFormat: "H:i",
    defaultHour: 12,
    defaultMinute: 0
  });
}

publish();
setUpBigimage();
nextBigImage();
previousBigImage();
hideBigImage();
markImage();
