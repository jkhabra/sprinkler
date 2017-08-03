let allButtons = document.querySelectorAll('.publish-button');
let state = window.state = {
  isBigPictureVisible: false,
  allImages: document.querySelectorAll('.post-image'),
  selectedImages: []
};

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

// Make image bigger on click

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

// Display next image on click right button

let rightSide = document.querySelector('.right');
rightSide.addEventListener('click', function(event) {
  let right = event.target;
  let currentImage = right.parentNode.querySelector('.b-image').src;

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

// Display previous image on click left button

let leftSide = document.querySelector('.left');
leftSide.addEventListener('click', function(event) {
  let left = event.target;
  let currentImage = left.parentNode.querySelector('.b-image').src;

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

// Make big image's display none when click outside of target image

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


// Mark/Unmark check boxes on images

let allMarks = document.querySelectorAll('.mark-icon');

for (let i = 0; i < allMarks.length; i++) {
  let mark = allMarks[i];

  mark.addEventListener('click', function(event) {
    let markElement = event.target;

    // START Change selected-image checkbox
    if (markElement.dataset.isMarked === "true") {
      markElement.style.backgroundImage="url('/static/icons/un-mark.png')";
      markElement.dataset.isMarked = false;

      // remove image from selected images state
      let index = state.selectedImages.indexOf(markElement.parentNode.parentNode.querySelector('.post-image').src);
      let remove = state.selectedImages.splice(index, 1);
      document.querySelector('.side-options').innerHTML = makeSelectedImagesHtml(state.selectedImages);
    }
    else {
      markElement.style.backgroundImage="url('/static/icons/mark.png')";
      markElement.dataset.isMarked = true;
      // END Change selected-image checkbox

      // Add image to selected images state
      let selectedImage = markElement.parentNode.parentNode.querySelector('.post-image').src;
      state.selectedImages.push(selectedImage);

      // Update sidebar with new selected images
      document.querySelector('.side-options').innerHTML = makeSelectedImagesHtml(state.selectedImages);
    }
  });
}

// function takes url and returns inner html
function makeSelectedImagesHtml (urls) {
  let html = '';

  for (let i = 0; i < urls.length;  i++) {
    let imageUrl = urls[i];

    if (imageUrl.endsWith('.mp4')){
      html += `<div class="side-image"><video muted class="small-image" src='${imageUrl}'"></video></div>`;
    } else {
      html += `<div class="side-image"><img class="small-image" src='${imageUrl}'></div>`;
    }
  }

  return html;
}
