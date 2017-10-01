let state = window.state = INITIAL_STATE || {
  isBigPictureVisible: false,
  allImages: document.querySelectorAll('.post-image'),
  selectedImages: [],
  count: document.querySelector('.noti-list').getElementsByTagName('li').length
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
  hideSideMessage();
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
  hideSideMessage();
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
  hideSideMessage();
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
let removeSidebarItem = (removeL) => {
  let index = state
      .selectedImages
      .map(o => o.src)
      .indexOf(removeL.parentNode.querySelector('.small-image').src);
  let removedImage = state.selectedImages.splice(index, 1);

  unMarkImage(removedImage);
  hideSideMessage();
  scheduleToDb(removeL);
};


// remove mark icon and add un-mark icon when click on cross icon in sidebar item
let unMarkImage = (removedImage) => {
  let allMarkIcons = document.querySelectorAll('.mark-icon');

  allMarkIcons.forEach((unMark) =>{
    if (removedImage[0].id === unMark.dataset.markId)
    {
      unMark.style.backgroundImage="url('/static/icons/un-mark.png')";
      unMark.dataset.isMarked = false;
      hideSideMessage();
    }
  });
};

// Add cancel button when schedule button is clicked
function setupScheduleButton() {
  let allDoneButtons = document.querySelectorAll('.done');

  allDoneButtons.forEach((doneButton) => {
    doneButton.addEventListener('click', function(event){
      let button = event.target;
      let timeEl = button.parentNode.querySelector('.set-time');
      let imgSrc = button.parentNode.querySelector('.small-image').src;
      let postId = imgSrc.split('/')[5].split('.')[0];
      let parent = button.parentNode;
      document.querySelector('.remove-box').style.display='none';

      if (timeEl.value === ''){
        button.parentNode.querySelector('.set-time').style.border='2px solid #e23b3b';
        button.parentNode.querySelector('.set-time').classList.add('pccolor');
      }
      else {
        button.style.display='none';
        parent.querySelector('.cancel-button').style.display='';
        parent.querySelector('.set-time').style.display='none';
        parent.querySelector('.show-time').style.display='';
        parent.querySelector('.show-time').value = timeEl.value;

        document.querySelector('.success-box').style.display='';

        let scheduleUrl = `/schedule-post?post_id=${postId}&publish_time=${timeEl.value}`;
        scheduleToDb(button, scheduleUrl);

        state.selectedImages.forEach((image) => {
          if (image.src === imgSrc){
            image.publishTime = timeEl.value;
          }
        });
      }
    });
  });
}


// Add schedule button when cancel button is clicked
function setupCancelButton() {
  let allCancelButtons = document.querySelectorAll('.cancel-button');

  allCancelButtons.forEach((cancelButton) =>{
    cancelButton.addEventListener('click', function(event){
      let button = event.target;
      button.style.display='none';
      button.parentNode.querySelector('.schedule').style.display='';
      button.parentNode.querySelector('.show-time').style.display='none';
      button.parentNode.querySelector('.set-time').style.display='';
      button.parentNode.querySelector('.set-time').value = '';

      document.querySelector('.success-box').style.display='none';
      document.querySelector('.remove-box').style.display='';
      document.querySelector('.set-time').classList.remove('pccolor');
      document.querySelector('.set-time').style.border='';
      let imgSrc = button.parentNode.querySelector('.small-image').src;

      scheduleToDb(button);

      state.selectedImages.forEach((image) => {
        if (image.src === imgSrc){
          image.publishTime = '';
        }
      });
    });
  });
}


let scheduleToDb = (button, scheduleUrl) => {
  let imgSrc = button.parentNode.querySelector('.small-image').src;
  let postId = imgSrc.split('/')[5].split('.')[0];
  if (typeof(scheduleUrl) === 'undefined') scheduleUrl =  scheduleUrl = `/cancel-schedule-post?post_id=${postId}`;

  fetch(scheduleUrl)
    .then(function(response) {
      return response.json();
      // showNotification('Yay it worked', {type: 'successs'});
    }).then(function(res) {
      console.log(res);
    })
    .catch(function (error) {
      console.log('There has been a problem with your fetch operation: ' + error.message);
      // showNotification('It failed :(', {type: 'error'});
    });
};


// function takes url and returns inner html
function makeSelectedImagesHtml (urls) {
  let html = '';
  for (let key in urls) {
    let value = urls[key];

    let source = `<img class='small-image' src=${value.src}>`;
    if( value.src.endsWith('mp4'))source = `<video mute class='small-image' src='${value.src}'></video>`;

    if (value.publishTime !== ''){
      html += `<div class="post-time">
                 <span class='remove-schedule'></span>
                <p class="side-title">${value.title}</p>
                 <p class="set">Set time</p>
                 <input type='text' name='text' class='show-time' value=${value.publishTime} disabled>
                 <input type="time" name="time" placeholder="Set time" class="set-time" style=display:none;'>
                 <div class="side-image">
                 ${source}
                 </div>
                 <button class="done cancel-button">Cancel</button>
                 <button class="done schedule" style='display:none;'>Schedule</button>
               </div>`;
    }
    else{
    html += `<div class="post-time">
                 <span class='remove-schedule'></span>
                 <p class="side-title">${value.title}</p>
                 <p class="set">Set time</p>
                 <input type='text' name='text' class='show-time' style='display:none;' disabled>
                 <input type="time" name="time" placeholder="Set time" class="set-time">
                 <div class="side-image">
                 ${source}
                 </div>
                 <button class="done cancel-button" style='display:none;'>Cancel</button>
                 <button class="done schedule">Schedule</button>
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

// select images that stored in database
let preScheduledPosts = () => {
  let allMarkIcons = document.querySelectorAll('.mark-icon');

  allMarkIcons.forEach(function(markItem) {
    state.selectedImages.forEach(function(item) {
      if(markItem.dataset.markId == item.id){
        markItem.dataset.isMarked=true;
        markItem.style.backgroundImage="url('/static/icons/mark.png')";
      }
    });
  });
};

// hide sidebar message if no image is selected otherwise create selected images in sidebar
let hideSideMessage = () =>{
  if (state.selectedImages.length > 0) {
    document.querySelector('.marked-header').style.display='none';
    preScheduledPosts();
  }
  else{
    document.querySelector('.marked-header').style.display='';
  }
  document.querySelector('.marked-images').innerHTML = makeSelectedImagesHtml(state.selectedImages);
  setupSelectedImageSidebar();
};

// show notifications when click on bell icon
let showNotifications = () => {
  let bellIcon = document.querySelector('.noti');
  const notificationCenter = document.querySelector('.noti-container');

  bellIcon.addEventListener('click', function(event){
    //let target = event.target;
    document.querySelector('.noti-container').style.display='';
    document.querySelector('.count').style.display='none';
    user_id = document.querySelector('.noti-item').dataset.notificationId;
    removeCount(parseInt(user_id));
  });

  hideDiv([
    bellIcon,
    notificationCenter
  ], '.noti-container');
};

let counter = () => {
  //let status = document.querySelector('.noti-text2').dataset.countStatus;
  let count = 0;
  let status = document.querySelectorAll('.noti-text2');

  status.forEach(function(i){
    if (i.dataset.countStatus === 'new'){
      count +=1;
      document.querySelector('.count').innerHTML = count;
      document.querySelector('.count').style.display='';
    }

  });
};

// remove count notifications box when click on bell icon
let removeCount = (userId) => {
  let notificationUrl = `/remove-notification-count?user_id=${userId}`;

  fetch(notificationUrl)
    .then(function(response){
      return response;
    })
    .catch(function(error){
      console.log('There hab been problem with your fetch operation: '+ error.message);
    });
};


let countNotifications = () => {
  if (state.count > 0) {
    document.querySelector('.no-noti').style.display='none';
    counter();
  }
  else{
    document.querySelector('.show-noti').style.display='none';
    document.querySelector('.no-noti').style.display='';
  }
};


let showCategories = () => {
  let cat = document.querySelector('.category');

  cat.addEventListener('click', function(event){
    //let target = event.target;
    document.querySelector('.cat').style.display='';
  });
  hideDiv(cat, '.cat');
};


const and = (arr) => {
  for (i of arr) {
    if (!i) { return false;}
  }

  return true;
};

// hide div when click outside
let hideDiv = (div1, div2) => {
  document.body.addEventListener('click', (event) => {
    let target = event.target;

    if (Array.isArray(div1)) {
      const boolArray = div1.map(div => !event.path.includes(div));
      const shallHide = and(boolArray);

      if (shallHide) {
        document.querySelector(div2).style.display='none';
      }

      return;
    }

    if (target !== div1) {
      document.querySelector(div2).style.display='none';
    }
  });
};

let removeNotification = () => {
  let notifications = document.querySelectorAll('.remove-noti');
  notifications.forEach((notification) =>{
    notification.addEventListener('click', function(event){
      let crossIcon = event.target;
      let notificationId = crossIcon.parentElement.parentElement.dataset.notificationId;
      crossIcon.parentElement.parentElement.remove();
      state.count -= 1;
      sendNotificationId(parseInt(notificationId));
      countNotifications();
    });
  });
};

// send notification id
let sendNotificationId = (notificationId) => {
  let notificationUrl = `/remove-notification?noti_id=${notificationId}`;

  fetch(notificationUrl)
    .then(function(response){
      return response;
    })
    .catch(function(error){
      console.log('There hab been problem with your fetch operation: '+ error.message);
    });
};

// show sidebar when click on menu icon mode
let setupMobileSidebar = () => {
  let sideBar = document.querySelector('.show');
  sideBar.addEventListener('click', function(event){
    console.log('Show sidebar', event.target);
    sideBar.style.display='none';
    document.querySelector('.side-options').style.visibility='visible';
    document.querySelector('.side-menu').style.display='';
    document.querySelector('.side-bar-background').style.display='';
    document.querySelector('.side-border').style.display='';
    document.querySelector('.side-options').style['box-shadow']='0 18px 26px 3px rgba(0, 0, 0, 0.48)';
    document.querySelector('.side-options').style['transition-duration']= '200ms';
  });

  document
    .getElementById('toggle-mobile-sidebar')
    .addEventListener('click', function(event) {
      console.warn('Hide sidebar', event.target);
      let target = event.target;
      if (target !== sideBar) {
        sideBar.style.display='';
        document.querySelector('.side-options').style.visibility='hidden';
        document.querySelector('.side-menu').style.display='none';
        document.querySelector('.side-bar-background').style.display='none';
        document.querySelector('.side-border').style.display='none';
      }
    });
};

showCategories();
setupMobileSidebar();
removeNotification();
countNotifications();
showNotifications();
hideSideMessage();
setUpForPublish();
setUpBigimageViewer();
nextBigImage();
previousBigImage();
hideBigImage();
setUpSelectImage();
