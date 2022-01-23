<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="home" aria-label="Menu" @click="$router.push('/')" />

        <q-toolbar-title class="row">
          <router-link to="/" class="main-link">MIC</router-link>
          <div class="col text-center">{{ mode }}</div>
        </q-toolbar-title>
        <q-btn-dropdown v-if="isLoggedIn" color="primary" :label="`Welcome ${user.username}`">
          <q-list separator >
            <q-item clickable ripple :href="$hostname+'/admin/'" target="_blank" tag="a">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section>
                Admin
              </q-item-section>
            </q-item>
            <q-item clickable ripple @click="logout()" >
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Logout</q-item-section>
            </q-item>
          </q-list>
<!--          <div class="q-px-md q-py-sm"> My profile</div>-->
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
      <router-view @mode="mode=$event"/>
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
      mode: null,
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
    },
    user () {
      return this.$store.getters['auth/user']
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
