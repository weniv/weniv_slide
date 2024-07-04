const markdownInput = document.getElementById('markdown-input');
const preview = document.getElementById('preview');
const saveBtn = document.getElementById('save-btn');
const pdfBtn = document.getElementById('pdf-btn');
const presentBtn = document.getElementById('present-btn');
const presentationList = document.getElementById('presentation-list');
const presentation = document.getElementById('presentation');
const slideContent = document.getElementById('slide-content');
const prevSlideBtn = document.getElementById('prev-slide');
const nextSlideBtn = document.getElementById('next-slide');
const exitPresentBtn = document.getElementById('exit-present');
const logoInput = document.getElementById('logo-input');
const logoBtn = document.getElementById('logo-btn');
const bgInput = document.getElementById('bg-input');
const bgBtn = document.getElementById('bg-btn');
const logo = document.getElementById('logo');

let slides = [];
let currentSlide = 0;
let savedPresentations = [];
let logoUrl = '';
let bgUrl = '';

// Load saved presentations from local storage
function loadSavedPresentations() {
    const saved = localStorage.getItem('savedPresentations');
    if (saved) {
        savedPresentations = JSON.parse(saved);
        updatePresentationList();
    }
}

// Update the list of saved presentations
function updatePresentationList() {
    presentationList.innerHTML = '';
    savedPresentations.forEach((pres, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center space-x-2 mt-2';
        li.innerHTML = `
            <span>Presentation ${index + 1}</span>
            <button class="load-btn px-2 py-1 bg-blue-500 text-white rounded text-sm">Load</button>
            <button class="delete-btn px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
        `;
        li.querySelector('.load-btn').addEventListener('click', () => loadPresentation(index));
        li.querySelector('.delete-btn').addEventListener('click', () => deletePresentation(index));
        presentationList.appendChild(li);
    });
}

// Save current presentation
function savePresentation() {
    if (savedPresentations.length >= 10) {
        alert('You can only save up to 10 presentations. Please delete one to save a new one.');
        return;
    }
    savedPresentations.push({
        content: markdownInput.value,
        logo: logoUrl,
        background: bgUrl
    });
    localStorage.setItem('savedPresentations', JSON.stringify(savedPresentations));
    updatePresentationList();
}

// Load a saved presentation
function loadPresentation(index) {
    const presentation = savedPresentations[index];
    markdownInput.value = presentation.content;
    logoUrl = presentation.logo || '';
    bgUrl = presentation.background || '';
    updatePreview();
    logo.src = logoUrl;
    logo.style.display = logoUrl ? 'block' : 'none';
    presentation.style.backgroundImage = bgUrl ? `url(${bgUrl})` : 'none';
    presentation.style.backgroundSize = 'cover';
    presentation.style.backgroundPosition = 'center';
}

// Delete a saved presentation
function deletePresentation(index) {
    savedPresentations.splice(index, 1);
    localStorage.setItem('savedPresentations', JSON.stringify(savedPresentations));
    updatePresentationList();
}

// Parse markdown into slides
function parseSlides() {
    slides = markdownInput.value.split('---').map(slide => marked.parse(slide.trim()));
}

// Show presentation
function showPresentation() {
    parseSlides();
    currentSlide = 0;
    updateSlide();
    presentation.classList.remove('hidden');
    logo.style.display = logoUrl ? 'block' : 'none';
    presentation.style.backgroundImage = bgUrl ? `url(${bgUrl})` : 'none';
    presentation.style.backgroundSize = 'cover';
    presentation.style.backgroundPosition = 'center';
}

// Update current slide
function updateSlide() {
    slideContent.innerHTML = slides[currentSlide];
}

// Navigate to next slide
function nextSlide() {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlide();
    }
}

// Navigate to previous slide
function prevSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlide();
    }
}

// Exit presentation mode
function exitPresentation() {
    presentation.classList.add('hidden');
}

// Download PDF
async function downloadPDF() {
    const pdf = new jspdf.jsPDF();
    for (let i = 0; i < slides.length; i++) {
        const slide = document.createElement('div');
        slide.innerHTML = slides[i];
        if (logoUrl) {
            const logoImg = document.createElement('img');
            logoImg.src = logoUrl;
            logoImg.style.position = 'absolute';
            logoImg.style.top = '10px';
            logoImg.style.left = '10px';
            logoImg.style.height = '30px';
            slide.appendChild(logoImg);
        }
        if (bgUrl) {
            slide.style.backgroundImage = `url(${bgUrl})`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
        }
        document.body.appendChild(slide);
        const canvas = await html2canvas(slide);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        if (i < slides.length - 1) pdf.addPage();
        document.body.removeChild(slide);
    }
    pdf.save('presentation.pdf');
}

// Update preview
function updatePreview() {
    preview.innerHTML = marked.parse(markdownInput.value);
}

// Handle image upload
function handleImageUpload(event, imageType) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            if (imageType === 'logo') {
                logoUrl = imageUrl;
                logo.src = logoUrl;
                logo.style.display = 'block';
            } else if (imageType === 'background') {
                bgUrl = imageUrl;
                presentation.style.backgroundImage = `url(${bgUrl})`;
                presentation.style.backgroundSize = 'cover';
                presentation.style.backgroundPosition = 'center';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Event listeners
saveBtn.addEventListener('click', savePresentation);
pdfBtn.addEventListener('click', downloadPDF);
presentBtn.addEventListener('click', showPresentation);
prevSlideBtn.addEventListener('click', prevSlide);
nextSlideBtn.addEventListener('click', nextSlide);
exitPresentBtn.addEventListener('click', exitPresentation);
markdownInput.addEventListener('input', updatePreview);
logoBtn.addEventListener('click', () => logoInput.click());
logoInput.addEventListener('change', (e) => handleImageUpload(e, 'logo'));
bgBtn.addEventListener('click', () => bgInput.click());
bgInput.addEventListener('change', (e) => handleImageUpload(e, 'background'));

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (presentation.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
    else if (e.key === 'Escape') exitPresentation();
});

// Initial load
loadSavedPresentations();
updatePreview();v