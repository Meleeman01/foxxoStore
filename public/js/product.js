
    async function fetchProduct() {
      const response = await fetch(`/api/product/${new URLSearchParams(window.location.search).get("id")}`);
      const product = await response.json();
      const productCard = document.querySelector('.product-container');
      console.log(productCard);
      productCard.innerHTML = '';

      productCard.innerHTML = `
        <div class="is-half">
          <img src="${product.img_url}" />
        </div>
        <div class="is-half">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">Price: $${(product.price / 100).toFixed(2)}</p>
          <button class="btn-primary" onclick="checkout(${product.id})">Buy Now</button>
        </div>
      `;
      
    }

    

     fetchProduct()

