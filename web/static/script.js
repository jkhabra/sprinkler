let state = window.state = {
  isBigPictureVisible: false,
  allImages: document.querySelectorAll('.post-image'),
  selectedImages: []
};

// Make image bigger on click
function setUpBigimageViewer() {
  let allImages = document.querySelectorAll('.post-image');

  // add click event on all images to show them in big image viewer
  for (let i = 0; i < allImages.length; i++) {
    let image = allImages[i];

    image.addEventListener('click', function (event) {
      event.stopPropagation();
      let img = event.target;
      let imageSource = new URL(img.src).pathname;

      displayBigImage(imageSource);
    });
  }

  document.body.addEventListener('click', (event) => {
    let target = event.target;
    hideBigImage(target);
  });
}

let displayBigImage = (imageSource) => {
    let bigImageEl = document.querySelector('#big-image');

    bigImageEl.style.display = '';

    if (imageSource.endsWith('.mp4')) {
        bigImageEl.querySelector('.big-video').src = imageSource;
        bigImageEl.querySelector('.big-video').style.display = '';
        bigImageEl.querySelector('img').style.display = 'none';
    } else {
        bigImageEl.querySelector('img').src = imageSource;
        bigImageEl.querySelector('.big-video').style.display = 'none';
        bigImageEl.querySelector('img').style.display = '';
    }
    state.isBigPictureVisible = true;
};

// Make big image's display none when click outside of target image
let hideBigImage = (target) => {
  if (!state.isBigPictureVisible) {
    return;
  }

  let bigImg = document.querySelector('#big-image');

  if (target === bigImg.querySelector('img') ||
      target === bigImg.querySelector('.right') ||
      target === bigImg.querySelector('.left') ||
      target === bigImg.querySelector('.big-video')) {
    return;
  }

  bigImg.style.display = 'none';
  state.isBigPictureVisible = false;
};

// Display next image on click right button
function nextBigImage(){
  let rightSide = document.querySelector('.right');

  rightSide.addEventListener('click', function(event) {
    let right = event.target;
    let currentImage = right.parentNode.querySelector('.b-image').src;
    allImages(currentImage);
  });
}

// Display previous image on click left button
function previousBigImage() {
  let leftSide = document.querySelector('.left');

  leftSide.addEventListener('click', function(event) {
    let left = event.target;
    let currentImage = left.parentNode.querySelector('.b-image').src;
    allImages(currentImage, 'previous');
  });
}

let allImages = (image, nextImage) =>{
  let allImages = document.querySelectorAll('.post-image');

  for(let i = 0; i < allImages.length; i++) {
    if (allImages[i].src === image){
      let bigImageIndex = i;
      if ( typeof(nextImage) ==='undefined') nextImage = allImages[bigImageIndex + 1].src;
      if ( nextImage === 'previous') nextImage = allImages[bigImageIndex - 1].src;

      if (nextImage.endsWith('.mp4')) {
        let mp4 = nextImage;
        window.m = mp4;
        document.querySelector('.big-video').style.display='';
        document.querySelector('.b-image').style.display='none';
        document.querySelector('.big-video').src=mp4;
      }
      else {
        document.querySelector('.b-image').style.display='';
        document.querySelector('.big-video').style.display='none';
      }
      document.querySelector('.b-image').src=nextImage;
    }
  }
};

// Add event listener on publish buttons
function setUpForPublish() {
  let allButtons = document.querySelectorAll('.publish-button');

  for (let i = 0; i < allButtons.length; i++) {
    let button = allButtons[i];

    button.addEventListener('click', function(event) {
      let btn = event.target;

      publish(btn);
    });
  }
};


// Publish post on Facebook
let publish = (button) => {
  let url = '/publish-photo?id=' + btn.dataset.photoId;
  let parent = button.parentNode;

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
  button.classList.add('disabled');
  button.setAttribute('disabled', 'disabled');
};

// Add event listener on mark icon
function setUpMark() {
  let allMarks = document.querySelectorAll('.mark-icon');

  for (let i = 0; i < allMarks.length; i++) {
    let mark = allMarks[i];

    mark.addEventListener('click', function(event) {
      let markElement = event.target;

      markImage(markElement);

    });
  }
}

// Mark/Unmark check boxes on images
let markImage = (imageE) => {
  if (imageE.dataset.isMarked === "true") {
    imageE.style.backgroundImage="url('/static/icons/un-mark.png')";
    imageE.dataset.isMarked = false;
    removeImage(imageE);
  }
  else {
    imageE.style.backgroundImage="url('/static/icons/mark.png')";
    imageE.dataset.isMarked = true;
    addImage(imageE);
  }

  timePicker();
  setUpRemoveSchedule();
  setUpSchedule();
};

// remove image from selected images state
let removeImage = (imageE) => {
  let index = state
      .selectedImages
      .map(o => o.src)
      .indexOf(imageE.parentNode.parentNode.querySelector('.post-image').src);
  let remove = state.selectedImages.splice(index, 1);
  document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);

};

// Add image to selected images state
let addImage = (imageE) => {
  let markId = imageE.dataset.markId;
  let imageSrc = imageE.parentNode.parentNode.querySelector('.post-image').src;
  let title = imageE.parentNode.parentNode.parentNode.querySelector('.post-title').innerText;
  state.selectedImages.push({title:title, src:imageSrc, id:markId});

  document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
};

// Add event listener on cross icon
function setUpRemoveSchedule(){
  let removeAll = document.querySelectorAll('.remove-schedule');

  for (let i = 0; i < removeAll.length; i++) {
    let cancel = removeAll[i];

    cancel.addEventListener('click', function(event) {
      let removeE = event.target;
      removeScheduler(removeE);
    });
  }
}

// remove marked image form side-bar when click on cross
let removeScheduler = (removeE) => {
  let index = state
      .selectedImages
      .map(o => o.src)
      .indexOf(removeE.parentNode.querySelector('.small-image').src);
  let removedImage = state.selectedImages.splice(index, 1);
  let allImages = document.querySelectorAll('.mark-icon');

  for (let i = 0; i < allImages.length; i++) {
    let unMark = allImages[i];
    if(removedImage[0].id === unMark.dataset.markId)
      unMark.style.backgroundImage="url('/static/icons/un-mark.png')";
  }
  document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
  timePicker();
};

// Add cancel button when schedule is clicked
function setUpSchedule() {
  let allSchedule = document.querySelectorAll('.done');

  for (let i = 0; i < allSchedule.length; i++){
    let done = allSchedule[i];

    done.addEventListener('click', function(event){
      let doneElement = event.target;

      setScheduler(doneElement);
    });
  }
}

let setScheduler = (buttonE) => {
  let parent = buttonE.parentNode;
  buttonE.innerHTML = 'Cancel';
};

// function takes url and returns inner html
function makeSelectedImagesHtml (urls) {
  let html = '';
  for (let key in state.selectedImages) {
    let value = state.selectedImages[key];

    if (value.src.endsWith('.mp4')){
      html += `<div class="post-time">
                 <span class='remove-schedule'></span>
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
                 <span class='remove-schedule'></span>
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

setUpForPublish();
setUpBigimageViewer();
nextBigImage();
previousBigImage();
hideBigImage();
setUpMark();
