let allButtons = document.querySelectorAll('.publish-button');

for (let i = 0; i < allButtons.length; i++) {
  let button = allButtons[i];

  button.addEventListener('click', function(event) {
    let btn = event.target;
    let url = '/publish-photo?id=' + btn.dataset.photoId;
    let parent = btn.parentNode;
    parent.querySelector('.spinner').style.display='';
    parent.querySelector('.thumb').style.background='black';
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
        else {
          throw new Error('Failed to publish image' || res.status === 'error');
          parent.querySelector('.spinner').style.display='none';
          parent.querySelector('.post-image').classList.add('thumb3');
          parent.querySelector('.error').style.display='';
        }
      })
      .catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
      });
    btn.classList.add('disabled');
    btn.setAttribute('disabled', 'disabled');

  });
}
