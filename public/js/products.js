async function fetchProducts() {
      const response = await fetch('/api/products');
      const products = await response.json();
      const productsContainer = document.getElementById('products');
      productsContainer.innerHTML = '';

      products.forEach( product => {
        const productCard = document.createElement('div');
        productCard.className = 'card clickable';

        productCard.addEventListener('click', (event) => {
          if (event.target.classList.contains('clickable')) {
            console.log('child clicked',event.target);
            window.location = `${window.origin}/product?id=${product.id}`
          }
          event.stopPropagation();
          
        });
        productCard.innerHTML = `
          <h5 class="card-title clickable">${product.name}</h5>
          <figure>
            <img height="100" src="${(product.img_url)? product.img_url : 'https://placecats.com/300/300'}" />
          </figure>
          <p class="card-text clickable">Price: $${(product.price / 100).toFixed(2)}</p>
          <button class="btn-primary">Add to Cart</button>
        `;
        productCard.querySelector('button').addEventListener('click', () => {
          //referenced in footer
          addToCart(product.id, product.name, (product.img_url)? product.img_url : 'https://placecats.com/300/300', (product.price / 100).toFixed(2) );
        });
        productsContainer.appendChild(productCard);
      });
    }
fetchProducts()