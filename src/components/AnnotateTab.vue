<template>
  <q-btn-dropdown :label="`${mode.toUpperCase()} ${ review ? 'Review' : consensus ? 'Consensus': ''}`" no-caps
                  :icon="mode==='ner'? 'category' : mode==='sentence' ? 'view_list': 'share'"
                  flat style="width: 150px;" align="between" size="0.9em" text-color="primary">
    <q-list separator >
      <q-item clickable ripple
        @click.native="$router.push(
        { name: 'annotate', params: { project: project, review: review, consensus: consensus, url:url}}).catch(err => {})" >
        <q-item-section avatar>
          <q-icon name="category" />
        </q-item-section>
        <q-item-section>
         NER
        </q-item-section>
      </q-item>
      <q-item clickable ripple @click.native="$router.push({ name: 'sentenceAnnotate',
      params: { project: project, review: review, consensus: consensus, url: url}}).catch(err => {})">
        <q-item-section avatar>
          <q-icon name="view_list" />
        </q-item-section>
        <q-item-section>
          Sentence
        </q-item-section>
      </q-item>
      <q-item clickable ripple
        @click.native="$router.push({
        name: 'relation', params: { project: project, review: review, consensus: consensus, url: url}}).catch(err => {})" >
        <q-item-section avatar>
          <q-icon name="share" />
        </q-item-section>
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
  props: ['mode', 'project', 'review', 'consensus', 'url']
}
</script>
