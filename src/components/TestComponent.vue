<template>
  <div class="test">
    <input type="checkbox" name="m" id="m" v-model="success">

    <p :class="cls">{{ hello }}</p>
    <input type="password" name="" id="" v-model="lname">{{ message }}

  </div>
</template>
 
<script>

import Vue  from 'vue';

new Vue({
  el: '#app',
  data: {
    items: ['Element 1', 'Element 2', 'Element 3'],
    shoppingCart: [
                { label: 'Pommes', cost: 6 },
                { label: 'Bananes', cost: 2 },
                { label: 'Noix de coco', cost: 8 }
            ]
  }
});

</script>

<style>
.red, .blue{
    background-color:red;
    color : blue;
    width: 40% ;
    height:50px;
    margin-left: 300px;
    padding-top: 20px;
}

.blue{
    background-color:blue;
    color : red;
    width: 40%;
    height:50px;
    margin-left:300px;
    padding-top: 20px;
}
</style>