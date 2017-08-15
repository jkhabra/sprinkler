let state = window.state = {
  isBigPictureVisible: false,
  allImages: document.querySelectorAll('.post-image'),
  selectedImages: []
};

// Make image bigger on click
function setUpBigimageViewer() {
  let allImages = document.querySelectorAll('.post-image');

  // add click event on all images to show them in big image viewer

  allImages.forEach(function (image) {
    image.addEventListener('click', (event) => {
      event.stopPropagation();
      let img = event.target;
      let imageSource = new URL(img.src).pathname;

      displayBigImage(imageSource);
    });
  });

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
      window.b  = bigImageIndex;
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

  allButtons.forEach(function (button) {
    button.addEventListener('click', function(event) {

      let btn = event.target;
      publish(btn);
    });
  });
};


// Publish post on Facebook
let publish = (button) => {
  let url = '/publish-photo?id=' + button.dataset.photoId;
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
function setUpSelectImage() {
  let allMarks = document.querySelectorAll('.mark-icon');

  allMarks.forEach(function (markIcon){
    markIcon.addEventListener('click', function(event) {
      let markElement = event.target;
      markImage(markElement);
    });
  });
}

// Mark/Unmark check boxes on images
let markImage = (imageE) => {
  if (imageE.dataset.isMarked === "true") {
    unselectImage(imageE);
  }
  else {
    selectImage(imageE);
  }
};


let setupSelectedImageSidebar = () => {
  timePicker();
  setUpRemoveSidebarItem();
  setupScheduleButton();
  setupCancelButton();
};

// remove image from selected images state
let unselectImage = (imageE) => {
  // Change mark icon on image thumb in main view
  imageE.style.backgroundImage="url('/static/icons/un-mark.png')";
  imageE.dataset.isMarked = false;

  let index = state
      .selectedImages
      .map(o => o.src)
      .indexOf(imageE.parentNode.parentNode.querySelector('.post-image').src);

  state.selectedImages.splice(index, 1);
  document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);

  setupSelectedImageSidebar();
};

// Add image to selected images state
let selectImage = (imageE) => {
  // Change mark icon on image thumb in main view
  imageE.style.backgroundImage="url('/static/icons/mark.png')";
  imageE.dataset.isMarked = true;

  let markId = imageE.dataset.markId;
  let imageSrc = imageE.parentNode.parentNode.querySelector('.post-image').src;
  let title = imageE.parentNode.parentNode.parentNode.querySelector('.post-title').innerText;
  let time = '';

  state.selectedImages.push({title:title, src:imageSrc, id:markId, publishTime:time});
  document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);

  setupSelectedImageSidebar();
};

// Add event listener on cross icon
function setUpRemoveSidebarItem() {
  let allItems = document.querySelectorAll('.remove-schedule');

  allItems.forEach(function (item) {
    item.addEventListener('click', function(event) {
      let removeE = event.target;

      removeSidebarItem(removeE);
    });
  });
}

// remove selected image form side-bar when click on cross icon in sidebar item
let removeSidebarItem = (removeE) => {
  let index = state
      .selectedImages
      .map(o => o.src)
      .indexOf(removeE.parentNode.querySelector('.small-image').src);

  let removedImage = state.selectedImages.splice(index, 1);
  let allImages = document.querySelectorAll('.mark-icon');

  allImages.forEach((unMark) =>{

    if(removedImage[0].id === unMark.dataset.markId) {
      unMark.style.backgroundImage="url('/static/icons/un-mark.png')";
      unMark.dataset.isMarked = false;
      document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
    }
  });
  setupSelectedImageSidebar();
};

// Add cancel button when schedule button is clicked
function setupScheduleButton() {
  let allDoneButtons = document.querySelectorAll('.done');

  allDoneButtons.forEach((doneButton) => {
    doneButton.addEventListener('click', function(event){
      let button = event.target;

      button.style.display='none';
      button.parentNode.querySelector('.cancel-button').style.display='';

      let timeEl = button.parentNode.querySelector('.set-time');
      let imgSrc = button.parentNode.querySelector('.small-image').src;

      state.selectedImages.forEach((image) => {
        if (image.src === imgSrc){
          image.publishTime = timeEl.value;
        }
      });
    });
  });
}

// Add schedule button when cancel button is clicked
function setupCancelButton() {
  let allCancelButtons = document.querySelectorAll('.cancel-button');

  allCancelButtons.forEach((cancelButton) =>{
    cancelButton.addEventListener('click', function(event){
      let button = event.target;

      button.parentNode.querySelector('.set-time').value = '';
      button.style.display='none';
      button.parentNode.querySelector('.schedule').style.display='';

      let imgSrc = button.parentNode.querySelector('.small-image').src;

      state.selectedImages.forEach((image) => {
        if (image.src === imgSrc){
          image.publishTime = '';
        }
      });
    });
  });
}

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
                 <input type="time" name="time" placeholder="Set time" class="set-time" />
                 <div class="side-image">
                 <video mute class="small-image" src='${value.src}'></video>
                 </div>
                 <button class="done cancel-button" style='display:none;'>Cancel</button>
                 <button class="done">schedule</button>
               </div>`;
    } else {
      html += `<div class="post-time">
                 <span class='remove-schedule'></span>
                 <div class='spinner' style='display:none;'></div>
                 <p class="side-title">${value.title}</p>
                 <p class="set">Set time</p>
                 <input type="time" name="time" placeholder="Set time" class="set-time" />
                 <div class="side-image">
                 <img class="small-image" src='${value.src}'>
                 </div>
                 <button class="done cancel-button" style='display:none;'>Cancel</button>
                 <button class="done schedule">schedule</button>
               </div>`;
    }
  }
  return html;
}

// add time picker
function timePicker(){
  const time = flatpickr('.set-time', {
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
setUpSelectImage();
