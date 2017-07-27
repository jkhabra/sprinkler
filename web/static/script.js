let allButtons = document.querySelectorAll('.publish-button');

for (let i = 0; i < allButtons.length; i++) {
  let button = allButtons[i];

  button.addEventListener('click', function(event) {
    let btn = event.target;
    let url = '/publish-photo?id=' + btn.dataset.photoId;

    fetch(url)
      .then(function(response) {
        return response.json();
      })
      .then(function(res) {
        console.warn(res);

        if (res.status === 'ok') {
          console.log('Your post successfully posted to Facebook');
        } else {
          throw new Error('Failed to publish image');
        }
      })
      .catch(function(error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
      });
  });
}
