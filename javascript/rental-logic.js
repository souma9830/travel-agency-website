// Logic specific to the Vehicle Rental page
console.log("Rental Logic Loaded");

import {vehicleData} from "../rental-vehicle-data.js"

// console.log(vehicleData);

const luxuryCruisersContainer = document.querySelector("#luxury-cruisers")
const bikeRentalsContainer = document.querySelector("#bike-rentals")

vehicleData.map((item) => {
    if (item.type === "Luxury Cruisers") {
        const htmlString = `
            <img src="${item.srcImg}">
            <h3>${item.name}</h3>
            <p>${item.seats} Seater</p>
            <p>Fare: ₹${item.farePerDay}/day</p>
            <p>Timing: ${item.timing}</p>
            <button class="btn-primary">Book Now</button>
            `;
         const child = document.createElement("div");
         child.classList.add("card");
         child.innerHTML = htmlString;
         luxuryCruisersContainer.appendChild(child);
    }
    else if (item.type === "Bike Rentals") {
        const htmlString = `
            <img src="${item.srcImg}">
            <h3>${item.name}</h3>
            <p>${item.seats} Seater</p>
            <p>Fare: ₹${item.farePerDay}/day</p>
            <p>Timing: ${item.timing}</p>
            <button class="btn-primary">Book Now</button>
            `;
        const child = document.createElement("div");
        child.classList.add("card");
        child.innerHTML = htmlString;
        bikeRentalsContainer.appendChild(child);
    }
    else {
        console.log("Invalid Type")
    }
})