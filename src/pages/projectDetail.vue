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

          <div class="flex justify-center">
            <q-btn outline v-for="(label,i) in project.labels" :key="i" :style="`color: ${label.color}`" size="sm" class="q-mr-xs q-my-sm">
              {{ label.name }}
            </q-btn>
          </div>

          <div v-if="project.curators">curators: {{ project.curators.length }}</div>
          <div v-if="project.vmodels">models: {{ project.vmodels.length }}</div>
          <div v-if="project.rules">rules: {{ project.rules.length }}</div>
          <div v-if="project.dicts">dictionaries: {{ project.dicts.length }}</div>
          <div v-if="project.cmodels">consensus model: {{ project.cmodels.length }}</div>

          <div v-if="project.id && canReview" class="flex justify-start q-mt-sm">
            <q-btn label="Upload documents" color="primary" style="font-size: 12px" @click="upload=true"/>
            <q-btn label="Export curation data" color="primary" style="font-size: 12px" class="q-mx-sm"
                   @click="downloadLabel()" :loading="loading"/>
          </div>
          <div v-if="fileInfo">
            <a :href="`cache/${fileInfo.text}`">download texts </a>
            <a :href="`cache/${fileInfo.label}`" class="q-mx-sm">download labels </a>
          </div>
          <q-dialog v-model="upload">
            <q-card>
              <q-card-section>
                <axios-uploader :url="`${$hostname}/api/upload/`"
                                :form-fields="[{name: 'project', value: project.id}, {name: 'user', value: loggedInUser.id}]"
                                style="max-width: 300px" flat bordered method="put" @uploaded="uploaded">
                </axios-uploader>
                <span v-if="numOfUploaded" class="q-pa-sm text-positive">{{ numOfUploaded }} docs uploaded</span>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="OK" color="primary" v-close-popup @click="numOfUploaded=null"/>
              </q-card-actions>
            </q-card>
          </q-dialog>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-if="project.id && canReview && project.cmodels.length>0" flat  :disable="project.number_of_docs===0"
                 @click="$router.push({ name: 'annotate', params: { project: project, consensus: true}});
                 $emit('mode', 'Concensus')">
            Check Consensus
          </q-btn>
          <q-btn v-if="project.id && canReview" flat  :disable="project.number_of_docs===0"
                 @click="$router.push({ name: 'annotate', params: { project: project, review: true }});
                 $emit('mode', 'Review')">
            Review
          </q-btn>
          <q-btn flat  :disable="project.number_of_docs===0"
                 @click="$router.push({ name: 'annotate', params: { project: project, review: false }});
                 $emit('mode', 'Annotate')">
            Annotate It
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import AxiosUploader from 'components/AxiosUploader'

export default {
  name: 'projectDetail',
  components: { AxiosUploader },
  data () {
    return {
      project: {},
      upload: false,
      download: false,
      loading: false,
      fileInfo: null,
      numOfUploaded: null
    }
  },
  mounted () {
    const id = this.$route.params.id
    this.$emit('mode', null)
    this.fetchProject(id)
  },
  methods: {
    fetchProject (id) {
      this.$axios.get(this.$hostname + `/api/projects/${id}/`).then(response => {
        this.project = response.data
      })
    },
    uploadFile (files) {
      return new Promise((resolve) => {
        // simulating a delay of 2 seconds
        setTimeout(() => {
          resolve({
          })
        }, 2000)
      })
    },
    uploaded (info) {
      info.xhr.then((resp) => {
        this.numOfUploaded = resp.data.total
        this.project.num_of_docs += this.numOfUploaded
        this.$forceUpdate()
      })
    },
    downloadLabel () {
      this.loading = true
      this.$axios.get(`/api/projects/${this.project.id}/download/`).then(resp => {
        this.fileInfo = resp.data
        this.loading = false
      })
    }
  },
  computed: {
    canReview () {
      return this.project.admins.includes(this.loggedInUser.id)
    },
    loggedInUser () {
      return this.$store.getters['auth/user']
    }
  }
}
</script>

<style scoped>

</style>
