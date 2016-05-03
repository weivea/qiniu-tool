<template>
    <a v-for="item in menuList" class="mdl-navigation__link" v-link="item.url">{{item.name}}</a>
</template>
<script>
    export default{
        props:['menuList']
    }
</script>