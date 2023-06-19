<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <TestComponent titre="Hello je suis le TestComponent" :annee="annee"/>
  </div>
</template>

<script>
import TestComponent from './components/TestComponent.vue'

export default {
  name: 'App',
  components: {
    TestComponent
  },
  data (){
    return {
      annee : 2013
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
