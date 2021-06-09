<template>
  <q-page class="flex">
    <div class="col-12 self-start">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" />
      </q-breadcrumbs>
    </div>
    <div class="fit row wrap justify-center items-start content-start">
    <div class="justify-center">
      <div class="col-12 justify-center">
        <div style="font-size: 1.5em; font-weight: 500" class="q-py-md">{{project.name}}</div>
        {{ project.description }}
      </div>
      <div class="row justify-center col-12 q-mt-md">
        <q-btn color="primary" @click="$router.push({ name: 'annotate', params: {project: project}})" :disable="project.number_of_docs===0">
          Annotate It
        </q-btn>
      </div>
    </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'projectDetail',
  data () {
    return {
      project: {}
    }
  },
  mounted () {
    const id = this.$route.params.id
    this.fetchProject(id)
  },
  methods: {
    fetchProject (id) {
      this.$axios.get(this.$hostname + `/api/projects/${id}/`).then(response => {
        this.project = response.data
      })
    }
  }
}
</script>

<style scoped>

</style>
