console.log('hola mundo!');
const noCambia = "Leonidas";

let cambia = "@LeonidasEsteban"

let categoriesList = []; 

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre
}


const getUser = new Promise ( (todoBien, todoMal) => {
	setTimeout( function(){
		todoBien('se acabo el tiempo')
	}, 3000);
});

const getUser2 = new Promise ( (todoBien, todoMal) => {
	setTimeout( function(){
		todoBien('se acabo el tiempo2')
	}, 10000);
});

/*
getUser
	.then( () => console.log('todo bien') )
	.catch( (errorMsg) => console.log(errorMsg) )

Promise.all(
	[
		getUser,
		getUser2
	]
).then( (message) =>
	console.log(message)
).catch( (errorMessage) => {
	console.trace(errorMessage);
});

//solo atiende la primer promesa que se cumpla
Promise.race(
	[
		getUser,
		getUser2
	]
).then( (message) =>
	console.log(message)
).catch( (errorMessage) => {
	console.trace(errorMessage);
});

$.ajax('https://randomuser.me/api/',{
	method: 'GET',
	dataType: 'json',
	success: response => {
		console.log(response);
	},
	error: error => console.trace(error)
})


fetch('https://randomuser.me/api/')
	.then( response =>  response.json() )
	.then ( user => console.log('user', user.results[0].name.first) )
	.catch ( error => console.log('algo fallo', error) );

*/

	const $home = document.getElementById('home');
	
	const $actionContainer = document.querySelector('#action');
	const $dramaContainer = document.getElementById('drama');
	const $animationContainer = document.getElementById('animation');
	
	const $featuringContainer = document.getElementById('featuring');
	const $form = document.getElementById('form');

	const $modal = document.getElementById('modal');
	$modal.style.border = '10px solid red';

	const $overlay = document.getElementById('overlay');
	const $hideModal = document.getElementById('hide-modal');

	$hideModal.addEventListener('click', hideModal);
	
	const $modalTitle = $modal.querySelector('h1');
	const $modalImage = $modal.querySelector('img');
	const $modalDescription = $modal.querySelector('p');

	function videoItemTemplate(id, category, src, title){
		return (
			`<div class="primaryPlaylistItem" data-id="${id}" data-category="${category}">
	         	<div class="primaryPlaylistItem-image">
	            	<img src="${src}">
	          	</div>
	           	<h4 class="primaryPlaylistItem-title">
	            	${title}
	 		   </h4>
			</div>`
		);
	}
	
	function createTemplate(HTMLString){
		let html = document.implementation.createHTMLDocument();
		html.body.innerHTML = HTMLString;
		
		return html.body.children[0];
	}

	function showModal($element){
		$overlay.classList.add('active');
		$modal.style.animation = 'modalIn .8s forwards';

		const { id, category } =  $element.dataset;

		let metaData =  findMovieByIdAndCategory(id, category);

		let list = categoriesList[category];

		const movie = list.find( element => element.id == id )
		
		$modalTitle.textContent = movie.title;
		$modalImage.setAttribute('src',movie.medium_cover_image);
		$modalDescription.textContent = movie.description_full;
	}

	function createEventClick( $element ){
		$element.addEventListener('click', event => {
			showModal($element)
		})
	}

	function hideModal () {
		$modal.style.animation = 'modalOut .8s forwards'
		$overlay.classList.remove('active');
	}
	
	function renderMovieList(list, $container, category){
		console.log(list)
		console.log(category)

		$container.children[0].remove();
		
		list.forEach( item => {
			let { title, medium_cover_image, id} = item;
			let HTMLString = videoItemTemplate(id, category, medium_cover_image, title);
			let $movieElement = createTemplate(HTMLString)
			$container.append($movieElement);

			let $img = $movieElement.querySelector('img');

			$img.addEventListener('load', event => {
				event.srcElement.classList.add('fadeIn');
			})

			createEventClick($movieElement);
		});

		categoriesList[category] = list;
		localStorage.setItem(category, JSON.stringify(list));

		console.log(localStorage.getItem(category));
	}

	function setAttributes($element, attributes){
		for (const attribute in attributes){
			$element.setAttribute(attribute, attributes[attribute])
		}
	}

	const getData = async genre => {
		const response = await fetch(`https://yts.am/api/v2/list_movies.json?genre=${genre}`);
		const { data } = await response.json()
		
		return data.movies;
	};

	const getDataByTerm = async name => {
		const response = await fetch(`https://yts.am/api/v2/list_movies.json?limit=1&query_term=${name}`);
		const data = await response.json()
		return data;
	}

	const findMovieByIdAndCategory = async (id, category) => {
		const response = await fetch(`https://yts.am/api/v2/list_movies.json?limit=1&query_term=${name}`);
		const data = await response.json()
		return data;
	}

	function buildFeaturingTemplate({title, medium_cover_image}){
		let HTMLString = `<div class="featuring">
				<div class="featuring-image">
					<img src="${medium_cover_image}" width="70" height="100" alt="">
				</div>
				<div class="featuring-content">
					<p class="featuring-title">Pelicula encontrada</p>
					<p class="featuring-album">${title}</p>
				</div>
			</div>`;

		return HTMLString;
	}

(async () => {	
	$form.addEventListener('submit', async event => {
		event.preventDefault();
		console.log('submit');
		$home.classList.toggle('search-active');
		const $loader = document.createElement('img');
		setAttributes($loader, {
			src: 'src/images/loader.gif',
			height: 50,
			width: 50
		});
		$featuringContainer.append($loader);

		const formData = new FormData($form);
		const name = formData.get('name');

		try{
			const { 
				data: {
					movies: pelis
				} 
			} = await getDataByTerm(name);

			if ( !pelis)
				throw new Error('Empty results');
			
			var html = buildFeaturingTemplate(pelis[0]);

			$featuringContainer.innerHTML = html;
		}catch( error ){
			console.error(error);
			alert('Any result was found with this parameter');
		}
	});
	
	const previousActionList = localStorage.getItem('action');
	const previousDramaList = localStorage.getItem('drama');
	const previousAnimationList = localStorage.getItem('animation');

	const actionList =  !previousActionList ? await getData('action') : JSON.parse(previousActionList);
	renderMovieList(actionList, $actionContainer, 'action')

	const dramaList = !previousDramaList ? await getData('drama') : JSON.parse(previousDramaList);
	renderMovieList(dramaList, $dramaContainer, 'drama')
	
	const animationList = !previousAnimationList ? await getData('animation') : JSON.parse(previousAnimationList);
	renderMovieList(animationList, $animationContainer, 'animation')
	
	
	/*
	actionList.movies.forEach( item => {
		let { title, medium_cover_image} = item;
		let HTMLString = videoItemTemplate(medium_cover_image, title);
		$actionContainer.append(createTemplate(HTMLString));
	});
	
	animationList.movies.forEach( item => {
		let { title, medium_cover_image} = item;
		let itemHtml = videoItemTemplate(medium_cover_image, title);
		$animationContainer.innerHTML += itemHtml;
	});
	
	dramaList.movies.forEach( item => {
		let { title, medium_cover_image} = item;
		let itemHtml = videoItemTemplate(medium_cover_image, title);
		$dramaContainer.innerHTML += itemHtml;
	});
	
	*/
	
})()



