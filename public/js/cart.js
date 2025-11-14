// Utility to get and save cart in localStorage
let Toast = new Toastify();
Toast.setOption('delay', 3000);
Toast.setOption('position', 'top-right');
    function getCart() {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      let cartIndicator = document.querySelector('#cartItemCount');
      console.log(cart.length)
      if (cart.length) {
        console.log(document.querySelector('#cartItemCount'))
        cartIndicator.style.cssText = `
  
          padding: 0.15rem .5rem;
          background-color: #ff575c; border-radius: 100%; position: absolute; top:-5px; font-size: 14px;
  font-weight: bold; right:-25px;
        `;
        cartIndicator.innerText = cart.length
      } else {
        cartIndicator.style.cssText = `` 
        cartIndicator.innerText = ''
      };
      return cart;
    }
    function saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Add item
    function addToCart(id, name, img_url, price, qty = 1) {
      const cart = getCart();
      const existing = cart.find(item => item.id === id);
      if (existing) existing.qty += qty;
      else cart.push({ id, name, img_url, price, qty });
      saveCart(cart);
      //alert("Added to cart!"); show a toast or something..
      Toast.success('Added to Cart!',`${name}`);
      if(window.location.pathname === '/cart') showCart()
      if (window.location.pathname !== '/cart') getCart()

    }
    function removeFromCart(id) {
      let cart = getCart();
      const item = cart.find(item => item.id === id);
      if (parseInt(item.qty) > 1) {
        item.qty -= 1;
        console.log(item.qty)
      }
      else cart = cart.filter(item => item.id !== id);
      saveCart(cart);
      showCart();
    }
    // Checkout
    async function checkout() {
      let cart = getCart();
      console.log(JSON.stringify({cart}));
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Checkout failed: " + data.error);
      }
    }

function showCart() {

	if (window.location.pathname !== '/cart') return;
      let div = document.querySelector('.cart');
      let checkoutBtn = document.querySelector('.checkout');

      let html = '';
      let cart = getCart();
      //cart.length is dangerous lol
      console.log(cart.length)
      if (cart.length && cart.length > 0) {
        checkoutBtn.classList.remove('hidden');
        cart.forEach((i)=>{
          console.log(i);
          html += `
            <div class="card" style="margin-bottom:2rem;"> 
              <h5 class="card-title clickable">${i.name}</h5>
              <figure>
                <img height="100" src="${i.img_url}"/>
              </figure>
              <p>Price: $${i.price}</p>
              <span>qty: ${i.qty}</span>
              <div class="flx space-evenly middle">
                
                <svg onClick="removeFromCart(${i.id})" style="fill:#ff575c; cursor:pointer; height:30px;" xmlns="http://www.w3.org/2000/svg" id="mdi-minus-circle" viewBox="0 0 24 24"><path d="M17,13H7V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
                <svg onClick="addToCart(${i.id})" style="fill:#8bc926; cursor:pointer; height:30px" xmlns="http://www.w3.org/2000/svg" id="mdi-plus-circle" viewBox="0 0 24 24"><path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
                
              </div>
            </div>`
        })
      } else {
        checkoutBtn.classList.add('hidden');
        html = `
        <svg style="fill:#6977ff80; height:12rem; margin: 3rem 0;" xmlns="http://www.w3.org/2000/svg" id="mdi-cart-remove" viewBox="0 0 24 24"><path d="M14.1 8.5L12 6.4L9.9 8.5L8.5 7.1L10.6 5L8.5 2.9L9.9 1.5L12 3.6L14.1 1.5L15.5 2.9L13.4 5L15.5 7.1L14.1 8.5M7 18C8.1 18 9 18.9 9 20S8.1 22 7 22 5 21.1 5 20 5.9 18 7 18M17 18C18.1 18 19 18.9 19 20S18.1 22 17 22 15 21.1 15 20 15.9 18 17 18M7.2 14.8C7.2 14.9 7.3 15 7.4 15H19V17H7C5.9 17 5 16.1 5 15C5 14.6 5.1 14.3 5.2 14L6.5 11.6L3 4H1V2H4.3L8.6 11H15.6L19.5 4L21.2 5L17.3 12C17 12.6 16.3 13 15.6 13H8.1L7.2 14.6V14.8Z" /></svg>
        <h2 style="color:#6977ff80; margin-top: 3rem; margin-bottom:12rem;">Nothing here yet. Why not add something to this cart?</h2>
      `;

      }
      div.innerHTML = html;
    getCart()
}//showcartFunc
function handleScroll() {
  let checkoutBtn = document.querySelector('.checkout');

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;

  const scrollPosition = scrollTop + winHeight; // Current bottom position of viewport
  const half = docHeight * .5;
  const twoThirdsDown = docHeight * .88;

  if (scrollPosition >= twoThirdsDown || scrollPosition >= docHeight - 5) {
    checkoutBtn.style.top = "38rem";
  } else if (scrollPosition >= half) {
    checkoutBtn.style.top = "36rem";
  } else {
    checkoutBtn.style.top = "34rem";
  }
}

window.addEventListener("scroll", handleScroll);
if(window.location.pathname === '/cart') showCart()
if (window.location.pathname !== '/cart') getCart()
