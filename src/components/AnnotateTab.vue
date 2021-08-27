<template>
  <div class="flex items-center self-start">
    <div :class="mode==='ner' ? 'text-positive text-bold text-subtitle1':'text-primary'">
      <span v-if="mode==='ner'" class="q-link flex inline items-center relative-position">
        {{review? 'Ner Review': consensus? 'Check Ner Consensus': 'Ner Annotate'}}
      </span>
      <a v-if="mode!=='ner'" href="#"
         @click.prevent="$router.push({ name: 'annotate', params: { project: project, review: review, consensus: consensus}}).catch(err => {})"
         class="q-breadcrumbs__el q-link flex inline items-center relative-position">
        {{review? 'Ner Review': consensus? 'Check Ner Consensus': 'Ner Annotate'}}
      </a>
    </div>
    <div :class="mode==='sentence' ? 'text-positive text-bold text-subtitle1':'text-primary'" class="q-ml-md">
      <span v-if="mode==='sentence'"
            class="q-link flex inline items-center relative-position">{{review? 'Sentence Review': consensus? 'Check Sentence Consensus': 'Sentence Annotate'}}
      </span>
      <a v-if="mode!=='sentence'" href="#" @click.prevent="$router.push({ name: 'sentenceAnnotate', params: { project: project, review: review, consensus: consensus}}).catch(err => {})" class="q-breadcrumbs__el q-link flex inline items-center relative-position">
        {{review? 'Sentence Review': consensus? 'Check Sentence Consensus': 'Sentence Annotate'}}
      </a>
    </div>
    <div :class="mode==='relation' ? 'text-positive text-bold text-subtitle1':'text-primary'" class="q-ml-md">
      <span v-if="mode==='relation'" class="q-link flex inline items-center relative-position">
        {{review? 'Relation Review': consensus? 'Check Relation Consensus': 'Relation Annotate'}}
      </span>
      <a v-if="mode!=='relation'" href="#"
         @click.prevent="$router.push({ name: 'relationAnnotate', params: { project: project, review: review, consensus: consensus}}).catch(err => {})" class="q-breadcrumbs__el q-link flex inline items-center relative-position">
        {{review? 'Relation Review': consensus? 'Check Relation Consensus': 'Relation Annotate'}}
      </a>
    </div>
  </div>
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
