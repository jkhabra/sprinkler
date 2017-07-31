let allButtons = document.querySelectorAll('.publish-button');
let state = window.state = {
  isBigPictureVisible: false
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

let allImages = document.querySelectorAll('.post-image');

for (let i = 0; i < allImages.length; i++) {
  let image = allImages[i];

  image.addEventListener('click', function(event) {
    event.stopPropagation();
    let img = event.target;
    let img_src = new URL(img.src).pathname;
    let parent = img.parentNode;
    let big_image = document.querySelector('#big-image');

    big_image.style.display='';
    big_image.querySelector('img').src = img_src;

    state.isBigPictureVisible = true;
  });
}

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
});
