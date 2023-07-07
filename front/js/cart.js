// cart.html // Summary: render cart product into web page, allow change quantity and remove product

'use strict';

// Creating a new Cart instance
import Cart from './classCart.js';
let productsFromCart = new Cart();

// Custom alert for better user experience
import showAlert from './customAlert.js';

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
		} else if (error instanceof SyntaxError) {
			// JSON parse error
			throw new Error('There was a problem parsing the data. Please try again later.');
		} else {
			throw new Error(error.message);
		}
	}
};

// DOM rendering cart product details on the webpage
const renderCartProducts = (data) => {
	// Creating new cart object, retrieving prices and other details by merging cart and API
	const mergedCartAndApi = productsFromCart.cart.map((pCart) => {
		const productsInApi = data.find((pAPI) => pAPI._id === pCart._id);
		return { ...pCart, ...productsInApi };
	});

	// create a document fragment to render all at once
	const mainFragment = new DocumentFragment();
	const cartItemsContainer = document.getElementById('cart__items');

	// Loop through the array of items & Render HTML | main function
	const itemsFragments = mergedCartAndApi.map(({ _id, imageUrl, altText, name, color, price, quantity }) => {
		// Create section of items
		const cartItemContainer = document.createElement('article');
		cartItemContainer.classList.add('cart__item');

		// Add product properties
		cartItemContainer.dataset.id = _id;
		cartItemContainer.dataset.name = name;
		cartItemContainer.dataset.color = color;

		// Create product image
		const itemImageContainer = document.createElement('div');
		itemImageContainer.classList.add('cart__item__img');
		cartItemContainer.append(itemImageContainer);

		const itemImage = document.createElement('img');
		itemImage.src = imageUrl;
		itemImage.alt = altText;
		itemImageContainer.append(itemImage);

		// Create settings sections
		const itemContentContainer = document.createElement('div');
		itemContentContainer.classList.add('cart__item__content');
		cartItemContainer.append(itemContentContainer);

		const itemContentDescription = document.createElement('div');
		itemContentDescription.classList.add('cart__item__content__description');
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
		itemContentPrice.classList.add('getAllPrices'); // Create class for updateTotal function purpose
		itemContentPrice.textContent = `${price} €`;
		itemContentDescription.append(itemContentPrice);

		const itemContentSettingsContainer = document.createElement('div');
		itemContentSettingsContainer.classList.add('cart__item__content__settings');
		itemContentDescription.append(itemContentSettingsContainer);

		const itemQuantityContainer = document.createElement('div');
		itemQuantityContainer.classList.add('cart__item__content__settings__quantity');
		itemContentSettingsContainer.append(itemQuantityContainer);

		// Create product quantity
		const itemQuantityContent = document.createElement('p');
		itemQuantityContent.textContent = 'Qté : ';
		itemQuantityContainer.append(itemQuantityContent);

		// Set quantity input properties & aria label for accessibility purpose
		const itemQuantityInput = document.createElement('input');
		itemQuantityInput.classList.add('itemQuantity');
		itemQuantityInput.type = 'number';
		itemQuantityInput.setAttribute('aria-label', `Quantité souhaitée pour ${name} ${color}`);
		itemQuantityInput.setAttribute('min', '1');
		itemQuantityInput.setAttribute('max', '100');
		itemQuantityInput.value = parseInt(quantity);
		itemQuantityContainer.append(itemQuantityInput);

		const deleteItemContainer = document.createElement('div');
		deleteItemContainer.classList.add('cart__item__content__settings__delete');
		itemContentSettingsContainer.append(deleteItemContainer);

		// Create delete item button & aria label
		const deleteItem = document.createElement('p');
		deleteItem.classList.add('deleteItem');
		deleteItem.textContent = 'Supprimer';
		deleteItem.setAttribute('aria-label', `Supprimer l'article ${name} ${color}`);
		deleteItemContainer.append(deleteItem);

		return cartItemContainer;
	});

	// Applying all items to the main Fragment
	mainFragment.append(...itemsFragments);
	cartItemsContainer.append(mainFragment);
};

// Users interactions
const cartItems = document.getElementById('cart__items').children;
const handleUserInteractions = () => {
	// Loop through each product
	for (let i = 0; i < cartItems.length; i++) {
		const cartItem = cartItems[i];

		// Get product properties
		const attributes = cartItem.attributes;
		const _id = attributes.getNamedItem('data-id').value;
		const name = attributes.getNamedItem('data-name').value;
		const color = attributes.getNamedItem('data-color').value;

		// Handle new quantity
		const itemQuantity = cartItem.querySelector('.itemQuantity');
		const initialQuantity = itemQuantity.valueAsNumber; // Store the initial quantity
		itemQuantity.addEventListener('change', () => {
			const newQuantity = itemQuantity.valueAsNumber;

			if (!newQuantity || newQuantity === '' || typeof newQuantity !== 'number' || isNaN(newQuantity) || newQuantity <= 0 || newQuantity >= 100) {
				showAlert('Veuillez selectionner une quantité : nombre compris entre 0 et 100');
				itemQuantity.setAttribute('aria-label', 'Veuillez selectionner une quantité : nombre compris entre 0 et 100');
				itemQuantity.value = initialQuantity; // Reset the quantity
				return;
			}

			itemQuantity.setAttribute('aria-label', '');

			// Call our newQuantity function in class cart, passing product properties
			productsFromCart.classCartNewQuantity({ _id, name, color, newQuantity });

			// Target total function
			updateTotals();
		});

		// Handle delete button
		const itemDeleteButton = cartItem.querySelector('.deleteItem');
		itemDeleteButton.addEventListener('click', () => {
			// removing item from the DOM
			itemDeleteButton.closest('.cart__item').remove();

			// passing item properties over class cart function
			productsFromCart.classCartRemove({ _id, name, color });

			// Target total & empty function down below
			displayMsgIfEmpty();
			updateTotals();
		});
	}
};

// Calcul total of price and quantity and apply values to the DOM
const updateTotals = () => {
	const items = document.querySelectorAll('.cart__item');
	let totalPrice = 0;
	let totalQuantity = 0;

	// loop through the total of item sections
	for (let i = 0; i < items.length; i++) {
		const item = items[i];

		// Retrieving price and quantity values
		const price = parseInt(item.querySelector('.getAllPrices').textContent); // Class added in Render section
		const quantity = parseInt(item.querySelector('.itemQuantity').value);

		totalPrice += price * quantity;
		totalQuantity += quantity;
	}

	// Applying values to the DOM
	if (!isNaN(totalPrice) && !isNaN(totalQuantity)) {
		document.getElementById('totalQuantity').textContent = totalQuantity;
		document.getElementById('totalPrice').textContent = `${Math.round(totalPrice)}`;
	}
};

// Display message and remove form if cart is empty
const displayMsgIfEmpty = () => {
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
};

// Call the rendering main function and others after successful fetching & data retrieving
const fetchDataAndRender = async () => {
	try {
		const data = await fetchData();
		renderCartProducts(data);
		handleUserInteractions();
		updateTotals();
		displayMsgIfEmpty();
	} catch (error) {
		console.log('FetchDataAndRender() Error, rendering products details failure:', error.message);
	}
};

// Define cache variable
const cacheTime = 3600000; // 1 hour
let cache = null;

setInterval(() => {
	cache = null;
}, cacheTime);

// Call main function
fetchDataAndRender();
