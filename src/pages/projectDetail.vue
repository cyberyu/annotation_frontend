<template>
  <q-page class="flex flex-center">
    <div class="row col-12 justify-center">
      <div class="col-12 justify-center">
        <div style="font-size: 1.5em; font-weight: 500" class="q-py-md">{{project.name}}</div>
        {{ project.description }}
      </div>
      <div class="row justify-center col-12 q-mt-md">
        <q-btn color="primary" @click="$router.push({path: 'annotate', query: {id: project.id}})">
          Annotate It
        </q-btn>
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
    const id = this.$route.query.id
    this.fetchProject(id)
  },
  methods: {
    fetchProject (id) {
      this.$axios.get(this.$hostname + `/projects/${id}/`).then(response => {
        this.project = response.data
      })
    }
  }
}
</script>

<style scoped>

</style>
