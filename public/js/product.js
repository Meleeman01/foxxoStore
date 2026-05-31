
    async function fetchProduct() {
      const response = await fetch(`/api/product/${new URLSearchParams(window.location.search).get("id")}`);
      const product = await response.json();
      const productCard = document.querySelector('.product-container');
      productCard.innerHTML = '';

      productCard.innerHTML = `
        <div class="is-half">
          <img style="cursor:pointer;" onClick="this.parentNode.nextElementSibling.nextElementSibling.showModal()" src="${product.img_url}" />
        </div>
        <div class="flx(column) space-around is-half" style="height:100%; margin-left:1rem; margin-right:1rem;">
          <h5 class="card-title">${product.name}</h5>
          <div>
            <p class="card-text">Price: $${(product.price / 100).toFixed(2)}</p>
            <button class="btn-primary">Buy Now</button>
          </div>
        </div>
        <dialog id="my-dialog">
          <img style="cursor:pointer;" onClick="this.parentNode.close()" src="${product.img_url}" />
        </dialog>
      `;

      productCard.querySelector('button').addEventListener('click', () => {
          //referenced in footer
          addToCart(
              product.id, 
              product.name,
              (product.img_url)? product.img_url : 'https://placecats.com/300/300',
              (product.price / 100).toFixed(2), 
              1,//qty
              "callCheckout"
            );
        });
    }

    

     fetchProduct()

