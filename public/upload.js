document.getElementById('upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const form = event.target;
    const formData = new FormData();
    const imageFile = document.getElementById('image').files[0];
    formData.append('image', imageFile);
  
    try {
      const response = await fetch((false ? 'http://localhost:3000' : 'https://addpic.ignoux.in') + '/upload', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log('Upload successful:', result);
        alert('Upload successful!');
      } else {
        console.error('Upload failed:', result);
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  });
  