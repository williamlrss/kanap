// Creating a new Cart instance
import Cart from "./classCart.js";
let productsFromCart = new Cart();

'use strict';
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

    // Rendering items main function
    const itemsFragments = mergedCartAndApi.map(({ _id, imageUrl, altText, name, color, price, quantity }) => {
        const cartItemContainer = document.createElement('article');
        cartItemContainer.classList.add("cart__item");
        cartItemContainer.dataset.id = _id;
        cartItemContainer.dataset.color = color;

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

        const itemContentHeading = document.createElement('h2');
        itemContentHeading.textContent = name;
        itemContentDescription.append(itemContentHeading);

        const itemContentColor = document.createElement('p');
        itemContentColor.textContent = color;
        itemContentDescription.append(itemContentColor);

        const itemContentPrice = document.createElement('p');
        itemContentPrice.classList.add('getAllPrices');
        itemContentPrice.textContent = `${price} €`;
        itemContentDescription.append(itemContentPrice);

        const itemContentSettingsContainer = document.createElement('div');
        itemContentSettingsContainer.classList.add("cart__item__content__settings");
        itemContentDescription.append(itemContentSettingsContainer);

        const itemQuantityContainer = document.createElement('div');
        itemQuantityContainer.classList.add("cart__item__content__settings__quantity");
        itemContentSettingsContainer.append(itemQuantityContainer);

        const itemQuantityContent = document.createElement('p');
        itemQuantityContent.textContent = "Qté : ";
        itemQuantityContainer.append(itemQuantityContent);

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

        const deleteItem = document.createElement('p');
        deleteItem.classList.add("deleteItem");
        deleteItem.textContent = "Supprimer";
        deleteItem.setAttribute("aria-label", `Supprimer l'article ${name} ${color}`);
        deleteItemContainer.append(deleteItem);

        return cartItemContainer;
    });

    mainFragment.append(...itemsFragments);
    cartItemsContainer.append(mainFragment);

    const newQuantityInput = document.querySelectorAll('.itemQuantity');
    newQuantityInput.forEach((input) => {
        input.addEventListener('change', (event) => {
            const newQuantityItem = event.target.closest('.cart__item');
            if (!newQuantityItem) {
                // Handle the case where no matching ancestor is found
                return;
            }
            const { id: _id, color } = newQuantityItem.dataset;
            const newQuantity = event.target.valueAsNumber;
            if (isNaN(newQuantity) || newQuantity <= 0 || newQuantity >= 100) {
                showAlert('Choisissez une valeur entre 1 et 100');
                return;
            }
            productsFromCart.classCartNewQuantity({ _id, color, newQuantity });
            updateTotals();
        });
    });
    // const quantityInputs = document.querySelectorAll('.itemQuantity');

    // const handleQuantityChanges = (event) => {
    //     const newQuantityItem = event.target.closest('.cart__item');
    //     if (!newQuantityItem) {
    //         // Handle the case where no matching ancestor is found
    //         return;
    //     }
    //     const { id: _id, color } = newQuantityItem.dataset;
    //     const newQuantity = event.target.valueAsNumber;
    //     if (isNaN(newQuantity) || newQuantity <= 0 || newQuantity >= 100) {
    //         showAlert('Choisissez une valeur entre 1 et 100');
    //         return;
    //     }
    //     productsFromCart.classCartNewQuantity({ _id, color, newQuantity });
    //     updateTotals();
    // }

    // quantityInputs.forEach((input) => {
    //     input.addEventListener('changes', handleQuantityChanges)
    // });


    const removeItemButton = document.querySelectorAll('.deleteItem');
    removeItemButton.forEach((button) => {
        button.addEventListener('click', (event) => {
            const removeItem = event.target.closest('.cart__item');
            if (!removeItem) {
                // Handle the case where no matching ancestor is found
                return;
            }
            const { id: _id, color } = removeItem.dataset;
            // removing item from the DOM
            removeItem.remove();
            // passing item values over class cart removal
            productsFromCart.classCartRemove({ _id, color });
            checkIfEmptyCart();
            updateTotals();
        });
    });
};

function updateTotals() {
    const items = document.querySelectorAll('.cart__item');
    let totalPrice = 0;
    let totalQuantity = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const price = parseInt(item.querySelector('.getAllPrices').innerHTML);
        const quantity = parseInt(item.querySelector('.itemQuantity').value);

        totalPrice += price * quantity;
        totalQuantity += quantity;
    }

    if (!isNaN(totalPrice) && !isNaN(totalQuantity)) {
        document.getElementById('totalQuantity').textContent = totalQuantity;
        document.getElementById('totalPrice').textContent = `${Math.round(totalPrice)}`;
    }
}

function checkIfEmptyCart() {
    const heading = document.getElementById('cartAndFormContainer').querySelector('h1');
    const form = document.querySelector('form');

    if (productsFromCart.cart.length === 0) {
        const headingContent = document.createElement('p');
        headingContent.textContent = 'est vide.';
        heading.appendChild(headingContent);
        form.style.display = 'none';
    } else {
        form.style.display = 'block';
    }
}

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

let cache = null;
fetchDataAndRender();