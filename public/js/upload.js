document.addEventListener('DOMContentLoaded', function() {
    console.log('Upload script loaded');
    
    const dragArea = document.getElementById('dragArea');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const uploadResult = document.getElementById('uploadResult');
    const fileUrl = document.getElementById('fileUrl');
    const browseBtn = document.getElementById('browseBtn');
    
    console.log('Upload button:', uploadBtn);
    console.log('Upload form:', uploadForm);
    console.log('Browse button:', browseBtn);
    console.log('File input:', fileInput);

    // Drag and drop functionality
    dragArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragArea.classList.add('drag-over');
    });

    dragArea.addEventListener('dragleave', () => {
        dragArea.classList.remove('drag-over');
    });

    dragArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    });

    // Browse button functionality
    browseBtn.addEventListener('click', () => {
        console.log('Browse button clicked');
        fileInput.click();
    });
    
    // Also make the drag area clickable
    dragArea.addEventListener('click', (e) => {
        // Only trigger if not clicking the browse button itself
        if (e.target !== browseBtn) {
            console.log('Drag area clicked');
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
        const file = fileInput.files[0];
        if (file) {
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileInfo.style.display = 'block';
            uploadBtn.disabled = false;
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    uploadForm.addEventListener('submit', async (e) => {
        console.log('Form submitted');
        e.preventDefault();
        
        if (!fileInput.files[0]) {
            alert('Please select a file first');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        const apiKey = document.getElementById('apiKey').value;
        console.log('Starting upload with API key:', apiKey ? 'provided' : 'none');
        
        uploadProgress.style.display = 'block';
        uploadResult.style.display = 'none';
        uploadBtn.disabled = true;
        
        try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.style.width = percentComplete + '%';
                    progressText.textContent = `Uploading... ${Math.round(percentComplete)}%`;
                }
            });
            
            xhr.addEventListener('load', () => {
                uploadProgress.style.display = 'none';
                uploadBtn.disabled = false;
                
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    fileUrl.href = response.url;
                    fileUrl.textContent = response.url;
                    uploadResult.style.display = 'block';
                } else {
                    const error = JSON.parse(xhr.responseText);
                    alert('Upload failed: ' + (error.error || 'Unknown error'));
                }
            });
            
            xhr.addEventListener('error', () => {
                uploadProgress.style.display = 'none';
                uploadBtn.disabled = false;
                alert('Upload failed: Network error');
            });
            
            xhr.open('POST', '/upload');
            if (apiKey) {
                xhr.setRequestHeader('x-api-key', apiKey);
            }
            xhr.send(formData);
            
        } catch (error) {
            uploadProgress.style.display = 'none';
            uploadBtn.disabled = false;
            alert('Upload failed: ' + error.message);
        }
    });

    // Backup button click handler
    uploadBtn.addEventListener('click', function(e) {
        console.log('Upload button clicked');
        if (e.target.form) {
            console.log('Triggering form submit');
            // Let the form submission handler take over
            return;
        }
        // If for some reason the button isn't in a form, trigger manually
        uploadForm.dispatchEvent(new Event('submit'));
    });

    // Copy button functionality
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(fileUrl.href).then(() => {
            alert('URL copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = fileUrl.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('URL copied to clipboard!');
        });
    });
});