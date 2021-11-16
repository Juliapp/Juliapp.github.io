<script>
  import {getContext} from 'svelte'
  let setHovered = getContext('setHovered')

  function moseoverhandler(e) {
    // hovered = true;
    setHovered(true)
    // console.log(true);
  }

  function moseouthandler(e) {
    setHovered(false)
    // hovered = false;
    // console.log(false);
  }

</script>

<div class="slogan-container">
  <strong class="braces">
    {"</>"}
  </strong>

  <section class="slogan">
    <h1>Smart code,</h1>
    <h1 class="second-part">
      <strong on:mouseover={moseoverhandler} on:focus on:mouseout={moseouthandler} on:blur>awesome</strong> 
      software</h1>
  </section>

</div>

<style>
  .slogan-container{
    position: relative;
  }

  .braces{
    color: #c4c4c41A;
    position: absolute;
    z-index: 1;
    font-size: 180px;
    top: -30px;
    left: 500px;
    display: flex;
    justify-content: flex-end;
  }

  strong {
    color: #D90479;
  }

  .slogan {
    position: relative;
    color: #c4c4c4;
    font-size: 80px;
    z-index: 5000;
  }

  .second-part {
    margin-left: 50px;
  }
</style>