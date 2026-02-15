/**
 * main.js - Ruler Tours Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    renderTours();
});

function renderTours() {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;

    grid.innerHTML = "";

    northBengalTours.forEach(tour => {
        const card = document.createElement('div');
        card.className = "card"; // Uses the CSS file for layout

        // HOOK: These inline styles are meant to be moved to destinations.css by contributors
        card.style.border = "1px solid #ddd";
        card.style.padding = "20px";
        card.style.borderRadius = "12px";
        card.style.backgroundColor = "#fff";

        card.innerHTML = `
            <h3 style="margin-top:0;">${tour.name}</h3>
            <p style="color: #666;">${tour.description}</p>
            <p><strong>Price:</strong> ${tour.price}</p>
            <div class="tags">
                ${tour.tags.map(tag => `<span style="background:#f0f0f0; padding:4px 10px; border-radius:20px; font-size:12px;">${tag}</span>`).join('')}
            </div>
            <a href="package.html?id=${tour.id}" style="margin-top:15px; display:inline-block; font-weight:bold; color:black;">Explore Package →</a>
        `;

        grid.appendChild(card);
    });
}
fetch("html/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-placeholder").innerHTML = data;
    });

/**
 * HOOK: SEARCH/FILTER FUNCTIONALITY
 * Can a contributor write a function that filters 'northBengalTours' 
 * as the user types in a search box?
 */