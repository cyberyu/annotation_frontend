<template>
  <q-page class="flex flex-center">
    <div class="row col-12">
      <div class="row justify-center col-12">
        <q-btn color="primary" label="Get Data" class="justify-center" @click="fetchDocs()"/>
      </div>
      <div v-for="(doc,i) in documents" :key="i" class="col-12 q-px-md q-py-md">
        {{doc.text}}
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      documents: []
    }
  },
  mounted () {
  },
  methods: {
    fetchDocs () {
      this.$axios.get(this.$hostname + '/documents/').then(response => {
        console.log('use host', this.$hostname)
        this.documents = response.data.results
      })
    }
  }
}
</script>
