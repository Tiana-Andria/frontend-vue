<template>
  <div>
    <p>{{ firstName }}</p>
    <button @click="changeFirstName">Changer le prénom</button>
  </div>
</template>

<script>
export default {
  name : "TestComponent",

  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    };
  },
  computed: {
    fullName() {
      console.log("Bonjour")
      return this.firstName + ' ' + this.lastName;
    }
  },
  methods: {
    changeFirstName() {

      this.firstName = 'Jane';
    }
  }
};
</script>