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
const fontSelect = document.getElementById('font-select');
const customFontStyle = document.getElementById('custom-font-style');

let currentFont = '';
let slides = [];
let currentSlide = 0;
let savedPresentations = [];
let logoUrl = '';
let bgUrl = '';

// 폰트 로드 함수
function loadFont(fontName) {
    console.log(`Loading font: ${fontName}`);
    const fontUrl = `fonts/${fontName}.ttf`;
    customFontStyle.textContent = `
        @font-face {
            font-family: '${fontName}';
            src: url('${fontUrl}') format('truetype');
        }
        :root {
            --font-custom: '${fontName}';
        }
    `;
    console.log(`Font style added: ${customFontStyle.textContent}`);
    document.body.classList.add('font-custom');
}

// 폰트 선택 이벤트 리스너
fontSelect.addEventListener('change', function(e) {
    currentFont = e.target.value;
    if (currentFont) {
        loadFont(currentFont);
    }
});


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
        background: bgUrl,
        font: currentFont
    });
    localStorage.setItem('savedPresentations', JSON.stringify(savedPresentations));
    updatePresentationList();
}

// Load a saved presentation
function loadPresentation(index) {
    const savedPresentation = savedPresentations[index];
    markdownInput.value = savedPresentation.content;
    logoUrl = savedPresentation.logo || '';
    bgUrl = savedPresentation.background || '';
    currentFont = savedPresentation.font || '';
    updatePreview();
    logo.src = logoUrl;
    logo.style.display = logoUrl ? 'block' : 'none';
    if (bgUrl) {
        presentation.style.backgroundImage = `url(${bgUrl})`;
        presentation.style.backgroundSize = 'cover';
        presentation.style.backgroundPosition = 'center';
    } else {
        presentation.style.backgroundImage = 'none';
    }
    if (currentFont) {
        fontSelect.value = currentFont;
        loadFont(currentFont);
    }
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
    if (bgUrl) {
        presentation.style.backgroundImage = `url(${bgUrl})`;
        presentation.style.backgroundSize = 'cover';
        presentation.style.backgroundPosition = 'center';
    } else {
        presentation.style.backgroundImage = 'none';
    }
    if (currentFont) {
        loadFont(currentFont);
    }
    // 슬라이드 내용의 스타일 조정
    slideContent.style.width = '100%';
    slideContent.style.height = '100%';
    slideContent.style.display = 'flex';
    slideContent.style.flexDirection = 'column';
    slideContent.style.justifyContent = 'center';
    slideContent.style.alignItems = 'center';
    slideContent.style.textAlign = 'center';
    slideContent.style.padding = '2em';
}

// Update current slide
function updateSlide() {
    slideContent.innerHTML = slides[currentSlide];
    slideContent.classList.add('markdown-body');
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
    const pdf = new jspdf.jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720]  // 16:9 비율의 프레젠테이션 크기
    });

    const totalSlides = slides.length;
    
    for (let i = 0; i < totalSlides; i++) {
        const slide = document.createElement('div');
        slide.innerHTML = slides[i];
        slide.className = 'markdown-body';
        Object.assign(slide.style, {
            width: '1280px',
            height: '720px',
            padding: '40px',
            boxSizing: 'border-box',
            backgroundColor: 'black',
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            color: 'white',
            fontFamily: getComputedStyle(document.body).fontFamily
        });

        // 슬라이드 내부 요소들의 스타일 조정
        slide.querySelectorAll('*').forEach(el => {
            if (el.tagName === 'H1') {
                Object.assign(el.style, {
                    fontSize: '2.5em',
                    fontWeight: 'bold',
                    marginBottom: '0.5em',
                    textAlign: 'center',
                    color: 'white'
                });
            } else if (el.tagName === 'P') {
                Object.assign(el.style, {
                    fontSize: '1.2em',
                    marginBottom: '0.5em',
                    textAlign: 'center',
                    color: 'white'
                });
            }
            // 필요에 따라 다른 요소들의 스타일도 여기에 추가할 수 있습니다
        });

        if (logoUrl) {
            const logoImg = document.createElement('img');
            logoImg.src = logoUrl;
            Object.assign(logoImg.style, {
                position: 'absolute',
                top: '20px',
                left: '20px',
                height: '30px'
            });
            slide.appendChild(logoImg);
        }

        if (bgUrl) {
            Object.assign(slide.style, {
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            });
        }

        document.body.appendChild(slide);

        try {
            const canvas = await html2canvas(slide, {
                scale: 1,
                useCORS: true,
                logging: false,
                width: 1280,
                height: 720,
                onclone: (clonedDoc) => {
                    // 클론된 문서의 스타일을 추가로 조정할 수 있습니다.
                    const clonedSlide = clonedDoc.querySelector('.markdown-body');
                    if (clonedSlide) {
                        clonedSlide.style.color = getComputedStyle(document.body).color;
                    }
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);

            if (i < totalSlides - 1) {
                pdf.addPage();
            }

            document.body.removeChild(slide);
        } catch (error) {
            console.error(`Error rendering slide ${i + 1}:`, error);
        }
    }

    pdf.save('presentation.pdf');
}

// Update preview
function updatePreview() {
    preview.innerHTML = marked.parse(markdownInput.value);
    preview.classList.add('markdown-body');
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
updatePreview();
if (currentFont) {
    loadFont(currentFont);
}