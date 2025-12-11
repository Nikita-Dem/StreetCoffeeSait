// Reviews Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize reviews
    loadReviews();
    
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            applyFilter(filter);
        });
    });
    
    // Photo upload preview
    const photoInput = document.getElementById('reviewPhotos');
    const previewContainer = document.getElementById('previewImages');
    const uploadedImages = [];
    
    photoInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 images
        
        previewContainer.innerHTML = '';
        uploadedImages.length = 0;
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imageData = e.target.result;
                    uploadedImages.push(imageData);
                    
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'preview-image';
                    previewDiv.innerHTML = `
                        <img src="${imageData}" alt="Preview ${index + 1}">
                        <button type="button" class="remove-image" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    previewContainer.appendChild(previewDiv);
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Update file input
        const dataTransfer = new DataTransfer();
        files.forEach(file => dataTransfer.items.add(file));
        photoInput.files = dataTransfer.files;
    });
    
    // Remove image preview
    previewContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-image')) {
            const index = parseInt(e.target.closest('.remove-image').getAttribute('data-index'));
            uploadedImages.splice(index, 1);
            
            // Update preview
            previewContainer.innerHTML = '';
            uploadedImages.forEach((imgData, idx) => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'preview-image';
                previewDiv.innerHTML = `
                    <img src="${imgData}" alt="Preview ${idx + 1}">
                    <button type="button" class="remove-image" data-index="${idx}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                previewContainer.appendChild(previewDiv);
            });
            
            // Update file input
            const dataTransfer = new DataTransfer();
            // We can't reconstruct files from dataURLs, so we'll just clear the input
            photoInput.value = '';
        }
    });
    
    // Form submission
    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(reviewForm);
        const name = formData.get('name').trim();
        const rating = formData.get('rating');
        const text = formData.get('text').trim();
        
        if (!name || !rating || !text) {
            showAlert('Пожалуйста, заполните все обязательные поля!', 'error');
            return;
        }
        
        if (text.length < 10) {
            showAlert('Отзыв должен содержать минимум 10 символов!', 'error');
            return;
        }
        
        const submitBtn = reviewForm.querySelector('.submit-review');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        try {
            // Create new review
            const newReview = {
                id: Date.now(),
                name: name,
                rating: parseInt(rating),
                text: text,
                date: new Date().toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                time: new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                images: uploadedImages,
                verified: false
            };
            
            // Save to localStorage
            saveReviewToLocalStorage(newReview);
            
            // Update reviews display
            loadReviews();
            
            // Reset form
            reviewForm.reset();
            previewContainer.innerHTML = '';
            uploadedImages.length = 0;
            photoInput.value = '';
            
            // Reset star ratings
            document.querySelectorAll('.star-rating input').forEach(input => {
                input.checked = false;
            });
            
            showAlert('Спасибо за ваш отзыв! Он был успешно опубликован.', 'success');
            
        } catch (error) {
            console.error('Error submitting review:', error);
            showAlert('Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте еще раз.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Pagination
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    let currentPage = 1;
    const reviewsPerPage = 6;
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadReviews();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const reviews = getReviewsFromLocalStorage();
        const totalPages = Math.ceil(reviews.length / reviewsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            loadReviews();
            updatePagination();
        }
    });
    
    // Image modal functionality
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');
    const modalPrev = document.querySelector('.modal-nav.prev');
    const modalNext = document.querySelector('.modal-nav.next');
    
    let currentImageIndex = 0;
    let currentImages = [];
    
    closeModal.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });
    
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
    modalPrev.addEventListener('click', () => {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            modalImage.src = currentImages[currentImageIndex];
        }
    });
    
    modalNext.addEventListener('click', () => {
        if (currentImageIndex < currentImages.length - 1) {
            currentImageIndex++;
            modalImage.src = currentImages[currentImageIndex];
        }
    });
});

// Review Management Functions
function getReviewsFromLocalStorage() {
    const reviewsJSON = localStorage.getItem('streetCoffeeReviews');
    if (reviewsJSON) {
        try {
            return JSON.parse(reviewsJSON);
        } catch (error) {
            console.error('Error parsing reviews:', error);
            return [];
        }
    }
    return [];
}

function saveReviewToLocalStorage(review) {
    const reviews = getReviewsFromLocalStorage();
    reviews.unshift(review); // Add new review at the beginning
    localStorage.setItem('streetCoffeeReviews', JSON.stringify(reviews));
}

function loadReviews(filter = 'all') {
    const reviewsContainer = document.getElementById('reviewsContainer');
    const reviews = getReviewsFromLocalStorage();
    
    // Apply filtering
    let filteredReviews = [...reviews];
    
    if (filter === '5') {
        filteredReviews = reviews.filter(r => r.rating === 5);
    } else if (filter === '4') {
        filteredReviews = reviews.filter(r => r.rating === 4);
    } else if (filter === '3') {
        filteredReviews = reviews.filter(r => r.rating === 3);
    } else if (filter === 'latest') {
        filteredReviews.sort((a, b) => b.id - a.id);
    } else if (filter === 'with-photos') {
        filteredReviews = reviews.filter(r => r.images && r.images.length > 0);
    }
    
    // Pagination
    const totalReviews = filteredReviews.length;
    const totalPages = Math.ceil(totalReviews / 6);
    const startIndex = (currentPage - 1) * 6;
    const endIndex = startIndex + 6;
    const pageReviews = filteredReviews.slice(startIndex, endIndex);
    
    if (pageReviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="no-reviews">
                <i class="fas fa-comment-slash"></i>
                <h3>Пока нет отзывов</h3>
                <p>Будьте первым, кто оставит отзыв о нашей кофейне!</p>
            </div>
        `;
        return;
    }
    
    reviewsContainer.innerHTML = '';
    
    pageReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        // Create star rating
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        // Create images HTML if exists
        let imagesHtml = '';
        if (review.images && review.images.length > 0) {
            imagesHtml = '<div class="review-images">';
            review.images.forEach((img, index) => {
                imagesHtml += `
                    <div class="review-image" data-review-id="${review.id}" data-image-index="${index}">
                        <img src="${img}" alt="Фото отзыва">
                    </div>
                `;
            });
            imagesHtml += '</div>';
        }
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="review-info">
                    <h3>${review.name}</h3>
                    <div class="review-rating">${starsHtml}</div>
                    <div class="review-date">${review.date} в ${review.time || ''}</div>
                    ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Проверенный отзыв</span>' : ''}
                </div>
            </div>
            <div class="review-text">${review.text}</div>
            ${imagesHtml}
        `;
        
        reviewsContainer.appendChild(reviewCard);
    });
    
    // Add event listeners to review images
    document.querySelectorAll('.review-image').forEach(img => {
        img.addEventListener('click', function() {
            const reviewId = parseInt(this.getAttribute('data-review-id'));
            const imageIndex = parseInt(this.getAttribute('data-image-index'));
            
            const review = getReviewsFromLocalStorage().find(r => r.id === reviewId);
            if (review && review.images) {
                currentImages = review.images;
                currentImageIndex = imageIndex;
                
                modalImage.src = currentImages[currentImageIndex];
                imageModal.style.display = 'flex';
            }
        });
    });
    
    // Update pagination
    updatePagination();
}

function applyFilter(filter) {
    currentPage = 1; // Reset to first page when filtering
    loadReviews(filter);
}

function updatePagination() {
    const reviews = getReviewsFromLocalStorage();
    const totalReviews = reviews.length;
    const totalPages = Math.ceil(totalReviews / 6);
    
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        if (i === currentPage) pageNumber.classList.add('active');
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            currentPage = i;
            loadReviews();
            updatePagination();
        });
        pageNumbers.appendChild(pageNumber);
    }
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        max-width: 400px;
    `;
    
    alertDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add CSS for modal and alerts
const style = document.createElement('style');
style.textContent = `
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
    }
    
    .modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .modal-content img {
        max-width: 100%;
        max-height: 80vh;
        border-radius: var(--radius);
    }
    
    .close-modal {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.5rem;
        transition: var(--transition);
    }
    
    .modal-nav:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .modal-nav.prev {
        left: -70px;
    }
    
    .modal-nav.next {
        right: -70px;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .verified-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: #4CAF50;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        margin-top: 0.3rem;
    }
    
    .btn-secondary {
        background: white;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        margin-left: 1rem;
    }
    
    .btn-secondary:hover {
        background: var(--primary-color);
        color: white;
    }
`;
document.head.appendChild(style);

// Load initial reviews
let currentPage = 1;
loadReviews();