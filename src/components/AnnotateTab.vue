<template>
  <q-btn-dropdown :label="`${mode} ${ review ? 'Review' : consensus ? 'Consensus': ''}`"
                  flat style="width: 150px;" align="between">
    <q-list separator >
      <q-item clickable ripple
        @click.native="$router.push(
        { name: 'annotate', params: { project: project, review: review, consensus: consensus}}).catch(err => {})" >
        <q-item-section>
         Ner
        </q-item-section>
      </q-item>
      <q-item clickable ripple @click.native="$router.push({ name: 'sentenceAnnotate',
      params: { project: project, review: review, consensus: consensus}}).catch(err => {})">
        <q-item-section>
          Sentence
        </q-item-section>
      </q-item>
      <q-item clickable ripple
        @click.native="$router.push({
        name: 'relationAnnotate', params: { project: project, review: review, consensus: consensus}}).catch(err => {})" >
        <q-item-section>
          Relation
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script>
export default {
  name: 'AnnotateTab',
  props: {
    mode: {
      type: String,
      required: true
    },

    project: {
      type: Object
    },

    review: {
      type: Boolean,
      default: false
    },

    consensus: {
      type: Boolean,
      default: false
    }
  }
}
</script>
