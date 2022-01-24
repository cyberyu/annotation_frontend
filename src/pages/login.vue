<template>
  <q-dialog persistent v-model="notLoggedIn" class="column justify-center">
    <q-card style="width: 400px; max-width: 80vw;" class="q-pa-sm">
      <q-toolbar>
        <q-toolbar-title> {{mode==='login'? 'Login': 'Register'}} </q-toolbar-title>
      </q-toolbar>
      <q-form v-if="mode==='login'" @submit="login" class="q-gutter-md">
        <q-input filled v-model="username" label="username"
                 hint="Please check up the username and password provided in our paper submission"
                 lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        <q-input filled v-model="password" label="password" type="password" :error-message="errorMsg" :error="error"
                 lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>

        <div class="column items-center q-mt-xs">
          <q-btn label="Log In" type="submit" color="primary" class="col"/>
          <div class="row q-my-sm hidden">
          No account yet? <span @click="mode='register'" class="register q-pl-xs"> Register</span>
          </div>
        </div>
      </q-form>

      <q-form v-else @submit="register" class="q-gutter-md col-12">
        <q-input filled v-model="username" label="username" hint="Usually your Vanguard username"
                 lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        <q-input filled v-model="password1" label="password" type="password"
                 lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        <q-input filled v-model="password2" label="password confirmation" type="password"
                 lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>

        <div class="column items-center q-mt-xs">
          <q-btn label="Register" type="submit" color="primary" class="col"/>
          <div class="row q-my-sm">
            Already have an account? <span @click="mode='login'" class="register q-pl-xs"> Login </span>
          </div>
        </div>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>

export default {
  name: 'Login',
  data () {
    return {
      username: null,
      password: null,
      password1: null,
      password2: null,
      mode: 'login',
      notLoggedIn: true,
      error: false,
      errorMsg: null
    }
  },
  mounted () {
    this.$store.dispatch('auth/setCSRFToken')
  },
  methods: {
    login () {
      const data = {
        username: this.username,
        password: this.password
      }
      this.$store.dispatch('auth/login', data).then(resp => {
        console.log('...', resp.data.detail)
      }).catch(err => {
        this.error = true
        this.errorMsg = err.response.data.detail
      })
    },
    logout () {
      this.$store.dispatch('auth/logout')
    },
    register () {
      const data = {
        username: this.username,
        password1: this.password1,
        password2: this.password2
      }
      this.$store.dispatch('auth/register', data)
    }
  },
  watch: {
    mode () {
      this.password = null
      this.password1 = null
      this.password2 = null
      this.username = null
    },
    password () {
      this.error = false
    },
    username () {
      this.error = false
    }
  }
}
</script>

<style scoped>
.register {
  color: #0a6aa1;
}

</style>
