// * Мобильное меню, бургер и плавная прокрутка

burger: {
	function menusimple() {
		const burger = document.querySelector("[data-burger]"),
			menu = document.querySelector("[data-menu]");
		let activePoint;

		try {
			if (burger) {
				burger.setAttribute("role", "button");
				ariaClosed(burger, "меню");

				burger.onclick = (e) => {
					e.stopPropagation();
					burger.classList.toggle("active");

					if (burger.classList.contains("active")) {
						ariaOpened(burger, "меню");
					} else {
						ariaClosed(burger, "меню");
					}

					if (menu) {
						menu.classList.toggle("active");
						document.body.classList.toggle("lock");
						document.body.style.overflow = document.body.style.overflow != "hidden" ? "hidden" : "";
					}
				};
			} else {
				throw new Error("Элемента с атрибутом data-burger не существует!");
			}

			if (menu) {
				const items = menu.querySelectorAll("[data-menu-item]"),
					itemsLength = items.length;

				if (burger) {
					if (!menu.id) {
						burger.setAttribute("aria-controls", "menu");
						menu.id = "menu";
					} else {
						burger.setAttribute("aria-controls", menu.id);
					}

					if (!menu.classList.length) {
						menu.classList.add(menu.id);
					}
				} else {
					throw new Error("Элемента с атрибутом data-burger не существует!");
				}

				if (itemsLength) {
					menu.onclick = (e) => {
						e.stopPropagation();
						const point = e.target.closest("[data-menu-item]"),
							link = e.target.closest('a[href^="#"]:not(a[href="#"])');

						if (link) {
							e.preventDefault();
							const id = link.getAttribute("href").substring(1),
								scrollBlock = document.getElementById(id);

							if (scrollBlock) {
								scrollBlock.scrollIntoView({behavior: "smooth"});
							}
						}

						if (point) {
							if (point != activePoint) {
								if (activePoint) {
									activePoint.classList.remove("active");
								}

								point.classList.add("active");
								activePoint = point;
							}

							if (menu.classList.contains("active")) {
								burger.click();
							}
						}
					};
				} else {
					console.error("Добавьте элементам меню атрибут data-menu-item!");
				}
			} else {
				console.error("Добавьте блоку с меню атрибут data-menu!");
			}

			const burgerMedia = window.matchMedia("(min-width: 769px)");
			burgerMedia.onchange = burgerMediaChange;
			burgerMediaChange(burgerMedia);

			function burgerMediaChange(e) {
				if (burger.classList.contains("active") && menu.classList.contains("active") && e.matches) {
					burger.click();
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	function ariaOpened(element, string) {
		element.setAttribute("aria-expanded", "true");
		element.setAttribute("aria-label", "Закрыть " + string);
	}

	function ariaClosed(element, string) {
		element.setAttribute("aria-expanded", "false");
		element.setAttribute("aria-label", "Открыть " + string);
	}

	menusimple();
}

// * ===========================================================================//
// * Переключение категорий товаров

products: {
	async function getProducts() {
		try {
			let resp = await fetch("files/products.json");

			if (!resp.ok) {
				throw new Error(`Looks like there was a problem. Status Code: ${resp.status}`);
				return;
			}

			let products = await resp.json();
			localStorage.setItem("products", JSON.stringify(products));
		} catch (err) {
			console.error(err);
		}
	}

	function sortsProducts(arr) {
		const category = localStorage.getItem("category");
		return arr.filter((it) => it.category == category);
	}

	function createTemplate(obj, num) {
		const template = /*html*/ `
	<div class="menu__card card">
		<div class="card__image">
			<img src="images/${obj.category}-${++num}.jpg" alt="${obj.name}">
		</div>
		<div class="card__title">${obj.name}</div>
		<div class="card__text">${obj.description}</div>
		<div class="card__price">${obj.price}</div>
	</div>
	`;

		return template;
	}

	function renderProducts(el) {
		const products = JSON.parse(localStorage.getItem("products")),
			drinks = sortsProducts(products),
			tempProds = isDesktop ? drinks : drinks.slice(0, 4);

		if (!isDesktop) {
			localStorage.setItem("archive", JSON.stringify(drinks.slice(4)));
		}

		tempProds.forEach((it, ind) => {
			el.insertAdjacentHTML("beforeend", createTemplate(it, ind));
		});

		if (!isDesktop) {
			if (drinks.length > 4) {
				refresh.style.display = "";
			} else {
				refresh.style.display = "none";
			}
		}
	}

	function checkCategory() {
		const cards = document.querySelector(".menu__cards");

		getProducts();

		if (cards) {
			cards.innerHTML = "";
			renderProducts(cards);
		}
	}

	function clickDrink(e) {
		e.stopPropagation();
		const target = e.target;

		if (target) {
			const drink = target.closest(".menu__drink");

			if (drink) {
				const category = drink.dataset.category;

				if (drink != currentDrink) {
					if (currentDrink) {
						currentDrink.classList.remove("current");
					}

					drink.classList.add("current");
					currentDrink = drink;

					if (category) {
						localStorage.setItem("category", category);
						checkCategory();
					}
				}
			}
		}
	}

	function mediaChange(e) {
		isDesktop = e.matches;
		checkCategory();
	}

	function addProducts() {
		const archive = JSON.parse(localStorage.getItem("archive")),
			cards = document.querySelector(".menu__cards");

		if (cards) {
			archive.forEach((it, ind) => {
				cards.insertAdjacentHTML("beforeend", createTemplate(it, ind + 4));
			});
		}

		this.style.display = "none";
	}

	const drinks = document.querySelector(".menu__drinks.drinks"),
		refresh = document.querySelector(".menu__refresh");
	let currentDrink, isDesktop;

	localStorage.setItem("category", "coffee");

	const cardsMedia = window.matchMedia("(min-width: 769px)");
	cardsMedia.onchange = mediaChange;
	mediaChange(cardsMedia);

	if (drinks) {
		currentDrink = drinks.querySelector(":scope > .menu__drink.current") || null;
		drinks.addEventListener("click", clickDrink);
	}

	if (refresh) {
		refresh.onclick = addProducts;
	}
}

// * ===========================================================================//
// * Слайдер

slider: {
	const slider = document.querySelector(".favourites-coffee__slider");

	if (slider) {
		const arrowLeft = slider.querySelector(":scope > .favourites-coffee__arrow.favourites-coffee__arrow--left"),
			arrowRight = slider.querySelector(":scope > .favourites-coffee__arrow.favourites-coffee__arrow--right"),
			wrapper = slider.querySelector(":scope > .favourites-coffee__slider-wrapper"),
			line = slider.querySelector(":scope > .favourites-coffee__slider-wrapper > .favourites-coffee__slider-line"),
			navigation = slider.querySelectorAll(":scope > .favourites-coffee__navigation > span"),
			slideWidth = parseInt(getComputedStyle(wrapper).width);
		sliderSize = navigation.length;
		let activePoint,
			activeIndex = 0,
			autoID = 0;

		function slideShift(point) {
			const shift = activeIndex ? `${-1 * slideWidth * activeIndex}px` : "0";

			if (point != activePoint) {
				if (activePoint) {
					activePoint.classList.remove("current");
				}

				point.classList.add("current");
				activePoint = point;
				line.style.setProperty("--shift", shift);
			}
		}

		function sliderClick(e) {
			e.stopPropagation();
			const target = e.target,
				point = target.closest(".favourites-coffee__navigation > span"),
				arrowLeftTarget = target.closest(".favourites-coffee__arrow.favourites-coffee__arrow--left"),
				arrowRightTarget = target.closest(".favourites-coffee__arrow.favourites-coffee__arrow--right");

			clearInterval(autoID);

			if (point) {
				activeIndex = [...navigation].indexOf(point) || 0;
				slideShift(point);
			}

			if (arrowLeftTarget) {
				if (activeIndex - 1 >= 0) {
					--activeIndex;
				} else {
					activeIndex = sliderSize - 1;
				}

				slideShift(navigation[activeIndex]);
			}

			if (arrowRightTarget) {
				if (activeIndex + 1 <= sliderSize - 1) {
					++activeIndex;
				} else {
					activeIndex = 0;
				}

				slideShift(navigation[activeIndex]);
			}

			autoID = setInterval(() => {
				arrowRight.click();
			}, 5500);
		}

		if (!navigation[activeIndex].classList.contains("current")) {
			navigation[activeIndex].classList.add("current");
			activePoint = navigation[activeIndex];
		}

		if (activeIndex) {
			line.style.setProperty("--shift", `${-1 * slideWidth * activeIndex}px`);
		}

		slider.addEventListener("click", sliderClick);

		autoID = setInterval(() => {
			arrowRight.click();
		}, 5500);
	}
}
