<template>
  <q-page class="flex flex-center">
    <div class="">
      <q-card v-for="(proj,i) in projects" :key="i" class="col-12 q-ma-md" style="width: 450px">
        <q-card-section class="text-h6 bg-primary text-white q-py-sm">
          <div> {{proj.name}} </div>
        </q-card-section>
        <q-card-section>
          Total documents: {{ proj.num_of_docs }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat @click="$router.push({name: 'project', params: {id: proj.id}})"> View Detail </q-btn>
        </q-card-actions>
      </q-card>

      <q-card v-if="projects.length===0" class="text-h5">
        You have no assigned projects to curate yet.
      </q-card>
    </div>
  </q-page>

</template>

<script>
export default {
  name: 'projectList',
  data () {
    return {
      projects: []
    }
  },
  mounted () {
    this.$emit('mode', null)
    this.fetchProjects()
  },
  methods: {
    fetchProjects () {
      this.$axios.get('/api/projects/').then(response => {
        this.projects = response.data.results
      })
    }
  }
}
</script>

<style scoped>

</style>
