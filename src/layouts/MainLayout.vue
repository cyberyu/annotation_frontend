<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="home" aria-label="Menu" @click="$router.push('/')" />

        <q-toolbar-title> <router-link to="/" class="main-link">Vanguard NLP Annotation</router-link> </q-toolbar-title>
        <q-btn-dropdown color="primary" label="Welcome, User">
          <div class="q-px-md q-py-sm"><a :href="$hostname+'/admin/'" target="_blank">admin</a> </div>
          <div class="q-px-md q-py-sm" @click="logout()">logout</div>
          <div class="q-px-md q-py-sm"> Profile</div>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <login v-if="!isLoggedIn"></login>

<!--    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1" >-->
<!--      <q-list>-->
<!--        <q-item-label header class="text-grey-8" > Essential Links </q-item-label>-->
<!--        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />-->
<!--      </q-list>-->
<!--    </q-drawer>-->

    <q-page-container v-if="isLoggedIn">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// import EssentialLink from 'components/EssentialLink.vue'
import Login from 'pages/login'

export default {
  name: 'MainLayout',
  components: { Login },
  data () {
    return {
      leftDrawerOpen: false
    }
  },
  mounted () {
  },
  methods: {
    logout () {
      this.$store.dispatch('auth/logout')
    }
  },
  computed: {
    isLoggedIn () {
      return this.$store.getters['auth/authenticated']
    }
  }
}
</script>

<style>
.main-link {
  text-decoration: none;
  color: white;
}
</style>
