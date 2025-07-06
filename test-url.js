https://github.com/Musa-Tur-Farazi/Manetho.gitconst fileId = '683ab4d3002920f5dca2';
const bucketId = '683947d1003cec98d984';
const projectId = '683946c4002d95fa0431';
const endpoint = 'https://cloud.appwrite.io/v1';

const previewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}`;
const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;
const viewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

console.log('Testing different URL formats...\n');

async function testUrl(name, url) {
  console.log(`Testing ${name}:`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(`http://localhost:3000/api/test-image-access?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    console.log(`Result: ${data.accessible ? '✅ Accessible' : '❌ Not accessible'} (${data.status} ${data.statusText})`);
  } catch (error) {
    console.log(`Result: ❌ Error - ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  await testUrl('Preview endpoint', previewUrl);
  await testUrl('Download endpoint', downloadUrl);
  await testUrl('View endpoint', viewUrl);
}

runTests();

const fixedImageUrl = 'https://cloud.appwrite.io/v1/storage/buckets/683947d1003cec98d984/files/683ab4d3002920f5dca2/view?project=683946c4002d95fa0431';

console.log('Testing fixed image URL with /view endpoint...');
console.log('URL:', fixedImageUrl);

fetch(`http://localhost:3000/api/test-image-access?url=${encodeURIComponent(fixedImageUrl)}`)
  .then(response => response.json())
  .then(data => {
    console.log('\nResult:');
    if (data.accessible) {
      console.log('✅ SUCCESS! Image is now accessible');
      console.log(`Status: ${data.status} ${data.statusText}`);
      console.log(`Content-Type: ${data.contentType}`);
      console.log(`Content-Length: ${data.contentLength} bytes`);
    } else {
      console.log('❌ Still not accessible');
      console.log(`Status: ${data.status} ${data.statusText}`);
      console.log(`Error: ${data.error}`);
    }
  })
  .catch(error => {
    console.error('Error testing:', error);
  }); 