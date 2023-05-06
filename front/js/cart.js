// cart.html // Summary: render cart product into web page, allow change quantity and remove product

'use strict';

// Creating a new Cart instance
import Cart from "./classCart.js";
let productsFromCart = new Cart();



// Custom alert for better user experience
import showAlert from "./customAlert.js";

// Fetch product data from the API and store it into cache to prevent unnecessary calls
const fetchData = async () => {
    if (cache) {
        return cache;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/products`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            cache = data; // store data in cache
            return data;
        } else {
            throw new Error('Response was not JSON');
        }
    } catch (error) {
        if (error instanceof TypeError || error instanceof DOMException) {
            // Network or CORS error
            throw new Error('There was a problem fetching the data. Please try again later.');
        } else {
            throw new Error(error.message);
        }
    }
};

// DOM rendering cart product details on the webpage
const renderCartProducts = (data) => {

    // Creating new cart object, retrieving prices and other details by merging cart and API
    const mergedCartAndApi = productsFromCart.cart.map(pCart => {
        const productsInApi = data.find(pAPI => pAPI._id === pCart._id);
        return { ...pCart, ...productsInApi };
    });

    // create a document fragment to render all at once
    const mainFragment = new DocumentFragment();
    const cartItemsContainer = document.getElementById('cart__items');

    // Loop through the array of items & Render HTML | main function
    const itemsFragments = mergedCartAndApi.map(({ _id, imageUrl, altText, name, color, price, quantity }) => {

        // Create section of items
        const cartItemContainer = document.createElement('article');
        cartItemContainer.classList.add("cart__item");

        // Add product properties
        cartItemContainer.dataset.id = _id;
        cartItemContainer.dataset.color = color;

        // Create product image
        const itemImageContainer = document.createElement('div');
        itemImageContainer.classList.add("cart__item__img");
        cartItemContainer.append(itemImageContainer);

        const itemImage = document.createElement('img');
        itemImage.src = imageUrl;
        itemImage.alt = altText;
        itemImageContainer.append(itemImage);

        const itemContentContainer = document.createElement('div');
        itemContentContainer.classList.add("cart__item__content");
        cartItemContainer.append(itemContentContainer);

        const itemContentDescription = document.createElement('div');
        itemContentDescription.classList.add("cart__item__content__description");
        itemContentContainer.append(itemContentDescription);

        // Create product name
        const itemContentHeading = document.createElement('h2');
        itemContentHeading.textContent = name;
        itemContentDescription.append(itemContentHeading);

        // Create product color
        const itemContentColor = document.createElement('p');
        itemContentColor.textContent = color;
        itemContentDescription.append(itemContentColor);

        // Create product price
        const itemContentPrice = document.createElement('p');
        // Create class for updateTotal function purpose
        itemContentPrice.classList.add('getAllPrices');
        itemContentPrice.textContent = `${price} €`;
        itemContentDescription.append(itemContentPrice);

        const itemContentSettingsContainer = document.createElement('div');
        itemContentSettingsContainer.classList.add("cart__item__content__settings");
        itemContentDescription.append(itemContentSettingsContainer);

        const itemQuantityContainer = document.createElement('div');
        itemQuantityContainer.classList.add("cart__item__content__settings__quantity");
        itemContentSettingsContainer.append(itemQuantityContainer);

        // Create product quantity
        const itemQuantityContent = document.createElement('p');
        itemQuantityContent.textContent = "Qté : ";
        itemQuantityContainer.append(itemQuantityContent);

        // Set quantity input properties & aria label for accessibility purpose
        const itemQuantityInput = document.createElement('input');
        itemQuantityInput.classList.add("itemQuantity");
        itemQuantityInput.type = "number";
        itemQuantityInput.setAttribute("aria-label", `Quantité souhaitée pour ${name} ${color}`);
        itemQuantityInput.setAttribute("min", "1");
        itemQuantityInput.setAttribute("max", "100");
        itemQuantityInput.value = quantity;
        itemQuantityContainer.append(itemQuantityInput);

        const deleteItemContainer = document.createElement('div');
        deleteItemContainer.classList.add("cart__item__content__settings__delete");
        itemContentSettingsContainer.append(deleteItemContainer);

        // Create delete item button & aria label
        const deleteItem = document.createElement('p');
        deleteItem.classList.add("deleteItem");
        deleteItem.textContent = "Supprimer";
        deleteItem.setAttribute("aria-label", `Supprimer l'article ${name} ${color}`);
        deleteItemContainer.append(deleteItem);

        return cartItemContainer;
    });

    // Applying all items to the main Fragment
    mainFragment.append(...itemsFragments);
    cartItemsContainer.append(mainFragment);

    // Handle user quantity change
    const newQuantityInput = document.querySelectorAll('.itemQuantity');
    newQuantityInput.forEach((input) => {
        input.addEventListener('change', (event) => {
            // Target section of item to retrieve product properties
            const newQuantityItem = event.target.closest('.cart__item');
            if (!newQuantityItem) {
                // Handle the case where no matching ancestor is found
                return;
            }

            // Retrieve product properties
            const { id: _id, color } = newQuantityItem.dataset;
            const newQuantity = event.target.valueAsNumber;
            if (isNaN(newQuantity) || newQuantity <= 0 || newQuantity >= 100) {
                showAlert('Choisissez une valeur entre 1 et 100');
                return;
            }

            // Target function in class cart, passing product properties
            productsFromCart.classCartNewQuantity({ _id, color, newQuantity });

            // Target total function down below
            updateTotals();
        });
    });

    const removeItemButton = document.querySelectorAll('.deleteItem');
    removeItemButton.forEach((button) => {
        button.addEventListener('click', (event) => {
            // Target section of item to retrieve product properties
            const removeItem = event.target.closest('.cart__item');
            if (!removeItem) {
                // Handle the case where no matching ancestor is found
                return;
            }

            // Retrieve product properties
            const { id: _id, color } = removeItem.dataset;

            // removing item from the DOM
            removeItem.remove();

            // passing item properties over class cart function
            productsFromCart.classCartRemove({ _id, color });

            // Target total & empty function down below
            checkIfEmptyCart();
            updateTotals();
        });
    });
};

// Calcul total of price and quantity and apply values to the DOM
function updateTotals() {
    const items = document.querySelectorAll('.cart__item');
    let totalPrice = 0;
    let totalQuantity = 0;

    // loop through the total of item sections
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Retrieving price and quantity values
        const price = parseInt(item.querySelector('.getAllPrices').textContent);
        const quantity = parseInt(item.querySelector('.itemQuantity').value);

        totalPrice += price * quantity;
        totalQuantity += quantity;
    }

    // Applying values to the DOM
    if (!isNaN(totalPrice) && !isNaN(totalQuantity)) {
        document.getElementById('totalQuantity').textContent = totalQuantity;
        document.getElementById('totalPrice').textContent = `${Math.round(totalPrice)}`;
    }
}

// Display message and remove form if cart is empty
function checkIfEmptyCart() {
    const heading = document.getElementById('cartAndFormContainer').querySelector('h1');
    const form = document.querySelector('form');

    if (productsFromCart.cart.length === 0) {
        const headingContent = document.createElement('p');
        headingContent.textContent = 'est vide.';
        heading.append(headingContent);
        form.style.display = 'none';
    } else {
        form.style.display = 'block';
    }
}

// Call the rendering main function and others after successful fetching & data retrieving
const fetchDataAndRender = async () => {
    try {
        const data = await fetchData();
        renderCartProducts(data);
        updateTotals();
        checkIfEmptyCart();
    } catch (error) {
        console.log('FetchDataAndRender() Error, rendering products details failure:', error.message);
    }
}

// Define cache variable and call main function
let cache = null;
fetchDataAndRender();