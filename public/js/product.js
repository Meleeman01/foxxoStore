
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
        <div class="flx(column) space-around is-half" style="height:100%; margin-left:1rem; margin-right:1rem;">
          <h5 class="card-title">${product.name}</h5>
          <div>
            <p class="card-text">Price: $${(product.price / 100).toFixed(2)}</p>
            <button class="btn-primary" onclick="checkout(${product.id})">Buy Now</button>
          </div>
        </div>
      `;
      
    }

    

     fetchProduct()

