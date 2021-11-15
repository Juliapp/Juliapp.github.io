<script>
    import { 
        Fullpage,
        FullpageSection,
        FullpageSlide
    } from 'svelte-fullpage';

		import Hero from './pages/Hero.svelte'

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

<main>
	<Fullpage {sections} arrows>
    <FullpageSection center>
        <Hero/>
    </FullpageSection>
	</Fullpage>
</main>


<style>
	main {
		width: 100vw;
		height: 100vh;
		background-image: url('./assets/bgnonoise.png');
		/* background-image: url('./assets/bg.png'); */
		background-size: 100%;
	}

	* :global(.svelte-fp-flexbox-center.svelte-l4liqa) {
    justify-content: flex-start;
		padding: 60px;
  }

</style>