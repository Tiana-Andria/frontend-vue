<template>
    <div>
        <input type="checkbox" v-model="isPurchased" />
        <label>{{ item }}</label>

    </div>
</template>

<script>


export default {
    name: 'ListItem',
    props: {
        item: String
    },
    data() {
        return {
            isPurchased: false
        }
    },
    computed : {

    }
}
</script>