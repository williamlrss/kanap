// product.html // Summary: render related URL ID & API product into webpage, allowing user to select options and add product into cart

'use strict';

// Importing class cart management purpose
import Cart from './classCart.js';

// Custom alert for better user experience
import showAlert from './customAlert.js';

// Get the ID parameter from the URL
const url = new URL(window.location.href);
const id = url.searchParams.get('id');

// Fetch product data from the API and store it into cache to prevent unnecessary calls
const fetchData = async () => {
	if (cache) {
		return cache;
	}

	try {
		const response = await fetch(`http://localhost:3000/api/products/${id}`);

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
		const sectionOfError = document.getElementsByClassName('item');
		sectionOfError[0].textContent = 'Oops! \n \nPetit soucis de notre côté, veuillez réessayer plus tard.';
		sectionOfError[0].style.fontSize = '24px';
		sectionOfError[0].style.whiteSpace = 'pre-line';

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

// DOM rendering product details on the webpage
const renderProductDetails = ({ imageUrl, altTxt, name, price, description, colors }) => {
	// render product image
	const itemImage = document.createElement('img');
	itemImage.src = imageUrl;
	const itemImageSection = document.querySelector('.item__img');
	itemImageSection.append(itemImage);
	itemImage.setAttribute('alt', altTxt);

	// render product name
	const itemHeading = document.createElement('h1');
	itemHeading.textContent = name;
	itemHeading.setAttribute('id', 'title');
	const itemHeadingContainer = document.querySelector('.item__content__titlePrice');
	itemHeadingContainer.append(itemHeading);

	// render product price
	const itemPrice = document.createTextNode(price);
	const itemPriceContainer = document.getElementById('price');
	itemPriceContainer.append(itemPrice);

	// render product description
	const itemDescription = document.createElement('p');
	itemDescription.textContent = description;
	const itemDescriptionContainer = document.querySelector('.item__content__description');
	itemDescriptionContainer.append(itemDescription);

	// render product options
	const itemOptionContainer = document.querySelector('#colors');
	colors.forEach((color) => {
		const itemOptions = document.createElement('option');
		itemOptions.value = color;
		itemOptions.textContent = color;
		itemOptionContainer.append(itemOptions);
	});

	const itemQuantityContainer = document.getElementById('quantity');

	// adding accessibility labels
	itemOptionContainer.setAttribute('aria-label', `Couleurs disponibles pour l'article ${name}, ${colors.join(', ')}`);
	itemQuantityContainer.setAttribute('aria-label', `Quantité souhaitée pour l'article ${name}`);
};

const handleUserInteraction = () => {
	const addToCart = document.getElementById('addToCart');

	addToCart.addEventListener('click', () => {
		const itemId = id;
		const itemColor = document.getElementById('colors').value;
		const itemQuantity = parseInt(document.getElementById('quantity').value);
		const itemName = document.getElementById('title').textContent;

		if (!itemColor || itemColor === '' || typeof itemColor !== 'string' || itemColor.trim().length === 0) {
			showAlert('Veuillez choisir une couleur : parmis les choix de la liste');
			addToCart.setAttribute('aria-label', 'Veuillez choisir une couleur : parmis les choix de la liste');
			return false;
		}

		if (!itemQuantity || itemQuantity === '' || typeof itemQuantity !== 'number' || isNaN(itemQuantity) || itemQuantity <= 0 || itemQuantity >= 100) {
			showAlert('Veuillez selectionner une quantité : nombre compris entre 0 et 100');
			addToCart.setAttribute('aria-label', 'Veuillez selectionner une quantité : nombre compris entre 0 et 100');
			return false;
		}

		// passing product object through the add function in class cart
		const productToAdd = {
			_id: itemId,
			color: itemColor,
			quantity: itemQuantity,
			name: itemName,
		};

		Cart.add(productToAdd);

		// adding successful accessibility label
		addToCart.setAttribute('aria-label', `produit ${itemName} ${itemColor} ajouté au panier`);
	});
};

// Call the rendering function after successful fetching & data retrieving
const fetchDataAndRender = async () => {
	try {
		const data = await fetchData();
		await renderProductDetails(data);
		handleUserInteraction();
	} catch (error) {
		console.log('FetchData() Error, rendering products details failure:', error.message);
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
