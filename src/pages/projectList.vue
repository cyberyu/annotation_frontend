<template>
  <q-page class="flex flex-center">
    <div class="row col-12">
      <div v-for="(proj,i) in projects" :key="i" class="col-12 q-pa-sm">
        <router-link :to="{name: 'project', params: {id: proj.id}}"> {{proj.name}} </router-link>
      </div>
    </div>
  </q-page>

</template>

<script>
export default {
  name: 'projectList',
  data () {
    return {
      projects: null
    }
  },
  mounted () {
    this.fetchProjects()
  },
  methods: {
    fetchProjects () {
      this.$axios.get(this.$hostname + '/projects/').then(response => {
        this.projects = response.data.results
      })
    }
  }
}
</script>

<style scoped>

</style>
