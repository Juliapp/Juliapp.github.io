<script>
	import {setContext} from 'svelte'
	let hovered = false;
	function setHovered(value){
		hovered = value;
	}
	setContext('setHovered', setHovered)


	import { 
			Fullpage,
			FullpageSection,
			FullpageSlide
	} from 'svelte-fullpage';

	import Hero from './pages/Hero.svelte'
	import Skills from './pages/Skills.svelte';

	import Granim from 'granim'
	import 'granim/dist/granim.min.js'
	import { onMount } from 'svelte';

	onMount(() => {

		var granimInstance = new Granim({
			element: '#bg-image',
			name: 'granim',
			opacity: [0.5, 0.5],
			states : {
				"default-state": {
					gradients: [
						['#834D9B', '#D04ED6'],
						['#1CD8D2', '#93EDC7']
					]
				}
			}
		});
		
	})

		const bgs = [
			'./assets/bgnonoise.png',
			'./assets/bg.png',
		]
		
		let indexBg = 0;


    //Optional, include all titles of your sections, this is also used as number that indicate count of sections
    const sections = [
        'Home',
        'History',
        'Present',
        'Future'
    ];
    
    //Same mechanics as in sections
    const slides = [
        '1982-1993',
        '1993-2006',
        '2006-present'
    ];

</script>
 
<!-- <main class="bg-image" style="background-image: url('{bgs[hovered ? 1 : indexBg]}');"> -->
<!-- <main class="bg-image" id="bg-image" style="--bg-img: url({bgs[hovered ? 1 : indexBg]})">
	<main class="bg-dotted-grid">
		<Fullpage {sections} arrows>
			<FullpageSection center >
					<Hero/>
			</FullpageSection>
			<FullpageSection center>
				<Skills />
		</FullpageSection>
		</Fullpage>
	</main>
</main> -->
<canvas class="bg-image" id="bg-image" style="--bg-img: url({bgs[hovered ? 1 : indexBg]})">
	<main class="bg-dotted-grid">
		<Fullpage {sections} arrows>
			<FullpageSection center >
					<Hero/>
			</FullpageSection>
			<FullpageSection center>
				<Skills />
		</FullpageSection>
		</Fullpage>
	</main>
</canvas>


<style>
	.bg-image {
		width: 100vw;
		height: 100vh;
		background-color: #000;
		/* background-image: var(--bg-img); */
		-webkit-background-size: cover;
 		-moz-background-size: cover;
  	-o-background-size: cover;
  	background-size: cover;
		/* background-image: radial-gradient(circle at 1px 1px, black 1px, transparent 0); */
		object-fit: cover;
		/* background-image: url('./assets/bg.png'); */
		/* background-size: 100%; */
		transition: cubic-bezier(0.075, 0.82, 0.165, 1);
	}

	.bg-dotted-grid {
		width: 100vw;
		height: 100vh;
		background-image: radial-gradient(circle at 1px 1px, #9671BB33 1px, transparent 0);
  	background-size: 40px 40px;
	}
	main::before{
		width: max-content;
		height: max-content;
		background-color: red;
	}

	* :global(.svelte-fp-flexbox-center.svelte-l4liqa) {
    justify-content: flex-start;
		padding: 0 60px;
  }

	#canvas-image {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
	}
</style>


<!-- [14:25, 15/11/2021] Juli: https://stackoverflow.com/questions/57174373/can-i-set-svelte-style-css-attribute-values-using-variables-passed-in-to-a-compo
[14:25, 15/11/2021] Juli: https://svelte.dev/repl/5fab983a191d459da149ef55e7962cf8?version=3.2.1 -->