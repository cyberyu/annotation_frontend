<template>
  <q-page class="flex">
    <div class="row col-12 self-start">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" />
      </q-breadcrumbs>
    </div>

    <div class="flex row fit justify-center flex-center">
      <q-card style="max-width: 450px">
        <q-card-section>
          <div class="text-h6">{{project.name}}</div>
          <div class="text-capitalize text-grey">
            {{ project.description }}
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-linear-progress size="25px" :value="project.num_of_annotated_docs/project.num_of_docs" color="accent">
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="accent"
                       :label="(project.num_of_annotated_docs/project.num_of_docs * 100).toFixed(2) + '%' + ` (${project.num_of_annotated_docs}/${project.num_of_docs})`" />
            </div>
          </q-linear-progress>

          <q-btn outline v-for="(label,i) in project.labels" :key="i" :style="`color: ${label.color}`" size="sm" class="q-mr-xs q-my-sm">
            {{ label.name }}
          </q-btn>

          <div v-if="project.curators">curators: {{ project.curators.length }}</div>
          <div v-if="project.vmodels">models: {{ project.vmodels.length }}</div>
          <div v-if="project.rules">rules: {{ project.rules.length }}</div>
          <div v-if="project.dicts">dictionaries: {{ project.dicts.length }}</div>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat @click="$router.push({ name: 'annotate', params: { project: project, review: true }})" :disable="project.number_of_docs===0">
            Review
          </q-btn>
          <q-btn flat @click="$router.push({ name: 'annotate', params: { project: project, review: false }})" :disable="project.number_of_docs===0">
            Annotate It
          </q-btn>
        </q-card-actions>
      </q-card>
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
