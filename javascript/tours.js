document.addEventListener("DOMContentLoaded", function () {
    const tourCardsContainer = document.getElementById("tour-cards-container");
    const tourModal = document.getElementById("tourModal");
    const closeModalBtn = document.getElementById("closeModal");
    const modalBody = document.getElementById("modal-body");

    let toursData = [];


    if (tourCardsContainer && typeof toursPackagesData !== 'undefined') {
        toursData = toursPackagesData.tourPackages;
        renderTourCards(toursData);
    }

    function renderTourCards(tours) {
        tourCardsContainer.innerHTML = "";

        tours.forEach(tour => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${tour.image}" alt="${tour.title}" />
                <h3>${tour.title}</h3>
                <p>Duration: ${tour.duration}</p>
                <p>Timing: ${tour.timing}</p>
                <p class="price">₹${tour.price}</p>
                <button class="btn-primary view-details-btn" data-id="${tour.id}">View Details</button>
            `;
            tourCardsContainer.appendChild(card);
        });


        const detailButtons = document.querySelectorAll(".view-details-btn");
        detailButtons.forEach(btn => {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                const tourId = this.getAttribute("data-id");
                openModal(tourId);
            });
        });

        const cards = document.querySelectorAll("#tour-cards-container .card");
        cards.forEach(card => {
            card.addEventListener("click", function () {
                const tourId = this.querySelector(".view-details-btn").getAttribute("data-id");
                openModal(tourId);
            });
            card.style.cursor = "pointer";
        });
    }

    function openModal(tourId) {
        const tour = toursData.find(t => t.id === tourId);
        if (!tour) return;


        modalBody.innerHTML = `
            <div class="modal-header-image">
                <img src="${tour.image}" alt="${tour.title}">
            </div>
            <div class="modal-details">
                <h2>${tour.title}</h2>
                <p class="modal-location"><i class="fas fa-map-marker-alt"></i> ${tour.location}</p>
                <p class="modal-overview">${tour.overview}</p>
                
                <div class="modal-info-grid">
                    <div class="info-item">
                        <strong><i class="fas fa-clock"></i> Duration:</strong> ${tour.duration}
                    </div>
                    <div class="info-item">
                        <strong><i class="fas fa-sun"></i> Timing:</strong> ${tour.timing}
                    </div>
                    <div class="info-item">
                        <strong><i class="fas fa-tag"></i> Price:</strong> <span class="price">₹${tour.price}</span>
                    </div>
                    <div class="info-item">
                        <strong><i class="fas fa-star"></i> Rating:</strong> ${tour.rating} / 5
                    </div>
                </div>

                ${renderSection('Environment', tour.environment)}
                ${renderSection('Climate', tour.climate)}
                ${renderSection('Accommodation', tour.accommodation)}
                ${renderListSection('Amenities', tour.amenities)}
                ${renderListSection('Activities', tour.activities)}
                ${tour.food ? renderSection('Food', tour.food) : ''}
                ${tour.transportation ? renderSection('Transportation', tour.transportation) : ''}
                ${tour.safety ? renderSection('Safety', tour.safety) : ''}
                
                <div class="modal-footer">
                    ${tour.cancellationPolicy ? `<p class="cancel-policy"><strong>Note:</strong> ${tour.cancellationPolicy}</p>` : ''}
                    <button class="btn-primary" style="width:100%; margin-top:15px;">Book Now</button>
                    ${tour.contactSupport ? `<p class="support-text"><i class="fas fa-headset"></i> ${tour.contactSupport}</p>` : ''}
                </div>
            </div>
        `;

        tourModal.style.display = "flex";
        document.body.classList.add("modal-open"); // Prevent scrolling
    }

    function renderSection(title, dataObj) {
        if (!dataObj) return '';
        let html = `<div class="modal-section"><h3>${title}</h3><ul>`;
        for (const [key, value] of Object.entries(dataObj)) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); });
            html += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
        }
        html += `</ul></div>`;
        return html;
    }

    function renderListSection(title, listArr) {
        if (!listArr || listArr.length === 0) return '';
        let html = `<div class="modal-section"><h3>${title}</h3><ul class="bullet-list">`;
        listArr.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `</ul></div>`;
        return html;
    }


    if (closeModalBtn && tourModal) {
        closeModalBtn.addEventListener("click", () => {
            tourModal.style.display = "none";
            document.body.classList.remove("modal-open");
        });

        window.addEventListener("click", (e) => {
            if (e.target === tourModal) {
                tourModal.style.display = "none";
                document.body.classList.remove("modal-open");
            }
        });
    }
});
