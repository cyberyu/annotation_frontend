<template>
  <q-page class="" style="background-color: #f6f6f6">
    <div class="row self-start items-center" style="margin-top:-8px">
      <q-breadcrumbs class="justify-start">
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" :to="`/project/${project.id}`" />
        <q-breadcrumbs-el>
          <AnnotateTab :project="project" :review="review" :consensus="consensus" :mode="mode" :url="currentURL"/>
        </q-breadcrumbs-el>
        <!--        <q-breadcrumbs-el :label="review? 'Review': consensus? 'Check Consensus': 'Ner Annotate'" icon="navigation" />-->
      </q-breadcrumbs>
    </div>
    <div class="row self-start q-pt-lg">
      <div class="col-3" v-if="!this.review">
        <div class="justify-end  q-pr-md row">
          <q-card class="col-8">
            <q-linear-progress size="25px" :value="progressStats.pct" color="accent">
              <div class="absolute-full flex flex-center">
                <q-badge color="white" text-color="accent"
                         :label="progressStats.label" />
              </div>
            </q-linear-progress>

            <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
              <q-tab name="models" :label="consensus? 'Consensus Models' : 'Models'"/>
              <q-tab v-if="!consensus" name="rules" label="Rules"/>
              <q-tab v-if="!consensus" name="dicts" label="Dictionaries"/>
            </q-tabs>

            <q-separator/>

            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="models" v-if="!consensus">
                <div v-for="(m,i) in vmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="getProcessedIn(tab+m.id)"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="vmodels.length===0">
                  No model defined for this project yet
                </div>
              </q-tab-panel>

<!--              consensus model results-->
              <q-tab-panel name="models" v-else>
                <div v-for="(m,i) in cmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="getProcessedIn(tab+m.id)"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <div v-if="cmodels[m.id] && cmodels[m.id].consensusScore">
                    <span v-if="cmodels[m.id].consensusScore.total">
                      <span class="text-bold text-primary">Accum F1</span>: {{ cmodels[m.id].consensusScore.total.toFixed(1) }}
                    </span>
                    <span v-if="cmodels[m.id].consensusScore.f1" class="q-pl-sm">
                      <span class="text-bold text-positive">F1</span>: {{ cmodels[m.id].consensusScore.f1.toFixed(1) }}
                    </span>
                  </div>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
              </q-tab-panel>

              <q-tab-panel name="rules">
                <div v-for="(m,i) in rules" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="getProcessedIn(tab+m.id)"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="rules.length===0">
                  No rule defined for this project yet
                </div>
              </q-tab-panel>

              <q-tab-panel name="dicts">
                <div v-for="(m,i) in dicts" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="getProcessedIn(tab+m.id)"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="dicts.length===0">
                  No dictionary defined for this project yet
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
      <div v-else class="col-2"></div>

      <div class="col-6 bg-white">
        <div class="row justify-end">
          <div class="col row justify-center">
            <q-btn v-if="!showUnRelBtn" size="13px" label="Hide unrelevant" class="q-mr-xs" style="width: 150px" no-caps
                   @click="hideUnRelSen();showUnRelBtn=true" color="primary" outline :disable="relevantSentences.length<1">
            </q-btn>
            <q-btn v-if="showUnRelBtn" size="13px" label="Show all" class="q-mr-xs" style="width: 100px" flat no-caps
                   @click="showUnRelSen();showUnRelBtn=false">
            </q-btn>
          </div>
          <div class="self-center" style="width:137px">
            <q-checkbox style="width: 140px; margin-left: 1px;" v-model="relevantAll" dense label="Select all" />
          </div>
        </div>
        <q-separator />
        <q-scroll-area style="height: calc(100vh - 250px); display: flex" class="col" ref="textArea">
          <div v-if="sentences && sentences.length>0" class="select-box q-px-sm" tabindex="0" >
            <div v-show="relevantSenShow[i]" v-for="(sentence,i) in sentences" :key="i" :id="`s-${i}`"
                 :class="getSentenceClass(i)" class="sentence row col-12 q-px-sm" style="border-radius: 10px">
              <div @click="showDetailSenAnnos(i)" class="q-py-sm col" >
                <div class="row col-12">
                  {{ sentence.text }}
                </div>
                <div class="row col-12">
                  <div v-for="(label, cat) in catAnnotations[i].labels" :key="cat"
                       style="border:1px solid lightgrey; border-radius: 5px; font-size:0.8em"
                       class="column justify-start q-mx-xs q-py-xs">
                    <div class=" q-pl-xs text-bold">{{ cat }} </div>
                    <div class="">
                      <q-chip :style="`background-color: ${label.color}`" dense
                              :removable="!review"
                              @remove="removeAnnotation(i, cat)">
                        <q-avatar color="white" text-color="black" v-if="label.m && !review" size="16px">
                          m
                        </q-avatar>
                        <q-avatar color="white" text-color="black" v-if="review" size="16px">
                          <span class="text-bold" style="font-size:1.5em">{{ label.authors.length }}</span>
                        </q-avatar>
                        {{ label.name }}
                      </q-chip>
                    </div>
                    <div v-for="(lbl, li) in label.extra" :key="`e${li}`" class="">
                      <q-chip dense :style="`background-color: ${lbl.color}`">
                        <q-avatar color="white" text-color="black" v-if="review" size="16px">
                          <span class="text-bold" style="font-size:1.5em">{{ lbl.authors.length }}</span>
                        </q-avatar>
                        {{ lbl.name }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </div>
              <!-- right sub-panel for each sentence cat labels -->
              <div class="row justify-between items-center q-pa-xs cat-labels" style="border-left: solid 1px #bbb; width:125px;">
                    <q-checkbox v-model="relevantSentences" :val="i" dense />
                    <div>
                    <q-btn-dropdown label="label" size="sm" color="primary" class="row" menu-anchor="bottom end" :menu-offset="[48, 0]">
                        <q-list dense style="min-width:100px">
                          <q-item v-for="(cat, ci) in categoryNames" :key="`cat-${i}-${ci}`" clickable>
                            <q-item-section>{{cat}}</q-item-section>
                            <q-item-section side>
                              <q-icon name="keyboard_arrow_right" />
                            </q-item-section>
                            <q-menu auto-close anchor="top end" self="top start">
                              <q-list style="min-width:100px" dense>
                                <q-item v-for="(label, li) in category[cat].labels" :key="`label-${li}`" clickable
                                        @click.native="catAnnotations[i].labels[cat]=label;annotate(i)"
                                        class="row items-center">
                                  <q-icon v-if="catAnnotations[i].labels[cat] && catAnnotations[i].labels[cat].name===label.name" name="check" />
                                  <span v-else style="width:1em"></span>
                                  <span class="q-pl-xs"> {{label.name}} </span>
                                </q-item>
                              </q-list>
                            </q-menu>
                          </q-item>
                        </q-list>
                    </q-btn-dropdown>
                    </div>
<!--                    <q-select v-for="(cat, ci) in categoryNames"  :key="`cat-${i}-${ci}`"-->
<!--                      :label="`${cat}`"-->
<!--                      transition-show="scale"-->
<!--                      transition-hide="scale"-->
<!--                      filled dense options-dense-->
<!--                      v-model="catAnnotations[i].labels[cat]" @input="annotate(i)"-->
<!--                      :options="category[cat].labels" option-value="name" option-label="name"-->
<!--                    />-->
              </div>
            </div>
          </div>

        </q-scroll-area>
        <q-separator />
          <q-card-actions class="justify-center">
            <div class="row items-center">
              Go to page <q-input v-model.number="go2page" type="number" dense style="max-width: 5em" class="q-pl-xs" />
              <q-btn color="primary" label="Go" class="float-right q-ml-md"
                     @click="fetchDocs({page: go2page})" />
            </div>
            <q-space />
            <q-btn color="primary" label="Previous" :disable="!prevURL" class="justify-center"
                   @click="goto(prevURL)" style="width: 100px"/>
            <q-btn color="accent" label="Save" class="justify-center q-ml-md" @click="formatAndSaveAnnotations()"
                   :disable="!ableSave"
                   :loading="saving" style="width: 100px">
                   <template v-slot:loading>
                     Saving...
                   </template>
            </q-btn>
            <q-btn color="primary" label="Next" class="justify-center q-ml-md"
                   @click="goto(nextURL)" style="width: 100px"/>
          </q-card-actions>
      </div>
      <div class="col-2 summary q-mb-none">
        <q-card>
          <q-card-actions class="bg-accent annotation-header justify-between" :style="'color: white; font-weight: bold; font-size: 1.2em'">
            <q-btn label="ANNOTATIONS" flat @click="showTab='annotations'" :class="{'bg-purple-5': showTab=='annotations'}">
<!--              <q-badge color="info" floating> {{annotations.length}}</q-badge>-->
            </q-btn>
            <q-btn icon="sort" class="float-right" flat @click="showTab='sort'" :class="{'bg-purple-5': showTab=='sort'}">
              <q-badge color="info" floating v-if="modelResultCache"> {{modelResultCache.length}}</q-badge>
            </q-btn>
            <q-btn v-if="review" icon="group" class="float-right" flat @click="showTab='annotators'" :class="{'bg-purple-5': showTab=='annotators'}">
              <q-badge color="info" floating v-if="annotations4Review"> {{Object.keys(annotations4Review).length}}</q-badge>
            </q-btn>
            <q-btn icon="visibility" class="float-right" flat @click="showTab='conflicts'" :class="{'bg-purple-5': showTab=='conflicts'}">
              <q-badge color="red" floating>{{ Object.keys(conflicts).length }}</q-badge>
            </q-btn>
          </q-card-actions>
          <q-scroll-area style="height: calc(100vh - 180px); display: flex" class="col">
<!--            categorized annotations-->
            <q-list bordered class="bg-white" v-if="curDetailSentence && showTab==='annotations'">
              <q-expansion-item v-for="(label, cat) in catAnnotations[curDetailSentence].labels" :key="cat"
                                expand-separator header-class="header-label" default-opened :label="cat">
                <div>
                  <div class="summary-word">
                    <q-avatar v-if="label.m" color="red" size="12px" text-color="white" @click="removeAnnotation(curDetailSentence)"> m </q-avatar>
                    <span>
                      [ {{sentences[curDetailSentence].start_char}}, {{sentences[curDetailSentence].end_char}} ] -
                      <span class="text-bold">{{label.name}}</span>
                    </span>
                  </div>
                  <div class="column" style="padding-left:3em">
                    <span v-for="(author,i) in label.authors" :key="`author-${i}`">
                      {{author}}
                    </span>
                  </div>
                </div>
                <div v-for="(lbl,i) in label.extra" :key="i">
                  <div class="summary-word">
                    <span>
                      [ {{sentences[curDetailSentence].start_char}}, {{sentences[curDetailSentence].end_char}} ] -
                      <span class="text-bold">{{lbl.name}}</span>
                    </span>
                  </div>
                  <div class="column" style="padding-left:3em">
                    <span v-for="(author,i) in lbl.authors" :key="`author-${i}`">
                      {{author}}
                    </span>
                  </div>
                </div>
              </q-expansion-item>
            </q-list>
<!--            model results review -->
            <q-list class="q-pa-sm" v-if="tokens && modelResultCache && showTab==='sort'">
              <div v-for="(label, i) in modelResultCache" :key="i">
                <q-avatar color="red" size="12px" text-color="white" @click="removeAnnotation(label.si, label.category); removeFromModelCache(label.tpos[0], label)"> m </q-avatar>
                <span @click="scrollTo(getSentence(label.pos))">
                  <span v-if="label.confidence">({{ label.confidence.toFixed(2) }})</span>
                    {{label.pos}} - {{label.category}}: {{label.name}}
                </span>
              </div>
              <div class="flex justify-center">
                <q-btn label="Clear model results" color="primary" @click="modelResultCache=null" class="q-mt-sm"/>
              </div>
            </q-list>
<!--            conflict-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='conflicts'">
              <span v-if="Object.keys(conflicts).length===0" class="text-subtitle2 q-pa-sm"> Cool, there is no conflict</span>
              <q-item v-for="(label, i) in Object.entries(conflicts)" :key="i"
                                :label="`${label[0]} (${label[1].length})`">
                 <div class="">
                  <div v-for="(w, j) in label[1]" :key="j" style="list-style: circle">
                    <span>
                      <q-avatar v-if="w.m" color="red" size="12px" text-color="white" @click="removeAnnotation(w.pos, w)"> m </q-avatar>
                      <q-avatar v-else size="12px"></q-avatar>
                      <span @click="scrollTo(getSentence(w.pos))">{{w.pos}} - {{w.text}} 【{{w.name}}】</span>
                    </span>
                  </div>
                </div>
              </q-item>
            </q-list>
<!--            list of annotators-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='annotators'">
              <q-item v-for="(anns, author, i) in annotations4Review" :key="i" clickable v-ripple class="q-pr-xs"
                      :active="activeAuthors.includes(author)" active-class="bg-blue-3 text-grey-8">
                <q-item-section>
                  <div @click="getAnnotations(author)" class="col-9">{{anns.author}} ({{anns.annotations.length}})</div>
                </q-item-section>
                <q-item-section side>
                  <q-btn-dropdown color="primary" flat size="sm" dense label="" :dropdown-icon="{1: 'check_circle', '-1': 'highlight_off', 2: 'redo'}[anns.status]">
                    <q-list bordered>
                      <q-item :class="{'text-positive': anns.status===1}" dense clickable v-ripple  @click="rejectOrAccept(anns, 1)">
                        <q-item-section avatar>
                          <q-icon :name="anns.status===1? 'check_circle': 'check'" flat size="sm"/>
                        </q-item-section>
                        <q-item-section>
                          Accept
                        </q-item-section>
                      </q-item>
                      <q-item :class="{'text-negative': anns.status===-1}" clickable v-ripple @click="rejectOrAccept(anns, -1)">
                        <q-item-section avatar>
                          <q-icon :name="anns.status===-1? 'highlight_off':'clear'" flat size="sm" />
                        </q-item-section>
                        <q-item-section>
                          Reject
                        </q-item-section>
                      </q-item>
                      <q-item :class="{'text-negative': anns.status===2}" clickable v-ripple @click="rejectOrAccept(anns, 2)">
                        <q-item-section avatar>
                          <q-icon name="redo" flat size="sm" />
                        </q-item-section>
                        <q-item-section>
                          Ask for redo
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
// import { ref } from 'vue'

import { commAnnoMixin } from 'pages/mixin/commAnnoMixin'
import AnnotateTab from 'components/AnnotateTab'

export default {
  name: 'SentenceAnnotate',
  mixins: [commAnnoMixin],
  components: { AnnotateTab },
  data () {
    return {
      mode: 'sentence',
      catAnnotations: [],
      relevantSentences: [],
      relevantAll: false,
      category: null,
      relevantSenShow: [],
      showUnRelBtn: false,
      curDetailSentence: null
    }
  },
  mounted () {
    this.project.labels.filter(a => a.kind === this.mode).forEach(a => {
      this.labels[a.id] = a
      this.labelNames.add(a.name)
    })
  },
  methods: {
    goto (url) {
      if (url) {
        this.fetchDocs({ url })
        this.relevantSentences = []
      } else {
        this.$router.push('/')
      }
    },
    selectStart (i) {},
    selectEnd (i) {},
    select (i) {},
    getSentenceClass (i) {
      if (this.curDetailSentence === i) {
        return 'cur'
      }
      if (this.relevantSentences.includes(i)) {
        return 'highlight'
      }
      return ''
    },
    postConstruct () {
      const senLen = this.sentences.length
      this.relevantSenShow = Array(senLen).fill(true)
      this.category = { }
      Object.values(this.labels).forEach(label => {
        if (label.category) {
          if (!this.category[label.category]) {
            this.category[label.category] = {
              labels: [label],
              names: [label.name]
            }
          } else {
            this.category[label.category].labels.push(label)
            this.category[label.category].names.push(label.name)
          }
        }
      })
      this.prepareCatAnnotations()
    },
    prepareCatAnnotations () {
      this.catAnnotations = Array(this.sentences.length).fill({}).map(a => {
        const tmp = {}
        return { labels: tmp }
      })
      this.annotations.forEach((item, i) => {
        const idx = this.getSentence(item.pos) // which sentence
        this.catAnnotations[idx].pos = item.pos
        this.catAnnotations[idx].tpos = item.tpos
        this.catAnnotations[idx].text = item.text
        if (!this.catAnnotations[idx].labels) {
          this.catAnnotations[idx].labels = { }
        }

        if (this.catAnnotations[idx].labels[item.category]) {
          if (!this.catAnnotations[idx].labels[item.category].extra) {
            this.catAnnotations[idx].labels[item.category].extra = []
          }
          const lbl = { ...this.labels[item.id] }
          lbl.authors = item.authors
          this.catAnnotations[idx].labels[item.category].extra.push(lbl)
        } else {
          this.catAnnotations[idx].labels[item.category] = { ...this.labels[item.id] }
          this.catAnnotations[idx].labels[item.category].authors = item.authors
        }
        if (item.m) {
          this.catAnnotations[idx].labels[item.category].m = item.m
        }
      })
    },
    getSentence (pos) {
      for (let i = 0; i < this.sentences.length; i++) {
        if (this.sentences[i].start_char === pos[0]) {
          return i
        }
      }
    },
    annotate (i) {
      this.$forceUpdate() // if not re-render, change select options of existing labels wont work
    },
    formatAndSaveAnnotations () {
      // convert annotations into save-ready format
      this.annotations = []
      this.catAnnotations.forEach((item, i) => {
        if (Object.keys(item.labels).length > 0) {
          Object.keys(item.labels).forEach(label => {
            const ann = {}
            // keep with ner annotation format
            ann.text = this.sentences[i].text
            ann.pos = [this.sentences[i].start_char, this.sentences[i].end_char]
            ann.tpos = [this.sentences[i].start, this.sentences[i].end]
            ann.name = item.labels[label].name
            ann.category = item.labels[label].category
            ann.id = item.labels[label].id
            ann.m = item.labels[label].m
            this.annotations.push(ann)
          })
        }
      })
      this.saveAnnotations()
      this.saveRelated()
    },
    saveRelated () {
      const data = {
        document: this.document.id,
        annotations: this.relevantSentences,
        kind: 'related'
      }
      let method, url
      if (this.document.relations.id) {
        method = 'patch'
        url = this.$hostname + '/api/annotations/' + this.document.relations.id + '/'
      } else {
        method = 'post'
        url = this.$hostname + '/api/annotations/'
      }

      this.$axios({ method: method, url: url, data: data }).then(response => {
        console.log(response.data)
      })
    },
    executeModel (id) {
      if (this.relevantSentences.length === 0) {
        const msg = 'You must select some sentences before execute model.'
        this.$q.notify({
          message: msg,
          color: 'secondary',
          position: 'center',
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
          ]
        })
        return -1
      }
      this.add2Q(id)
      const data = {
        mtype: this.tab,
        id: id,
        sentences: []
      }
      this.relevantSentences.forEach(v => {
        data.sentences.push({
          text: this.sentences[v].text,
          idx: v
        })
      })
      const url = this.consensus ? '/api/calculate_consensus/' : '/api/model-sentence/'
      this.$axios.post(this.$hostname + url, data).then(response => {
        // every model for each sentence generate one label
        const results = response.data
        // rebuild result for annotation
        const resultsAnnotations = []
        results.forEach((ann, i) => {
          // find sentence id
          const sentence = this.sentences[ann.idx]
          // rebuild annotation structure
          const label = { ...this.lLabels[ann.category][ann.label] }
          label.m = 'm'
          const annotation = {
            id: label.id, // returned label may not included in project labels
            pos: [sentence.start_char, sentence.end_char],
            tpos: [sentence.start, sentence.end],
            name: ann.label,
            text: sentence.text,
            si: ann.idx, // sentence index
            category: ann.category,
            m: 'm' // machine generated
          }
          if (!this.catAnnotations[ann.idx].labels[ann.category]) {
            this.catAnnotations[ann.idx].labels[ann.category] = label
            resultsAnnotations.push(annotation)
          }
        })
        this.removeFromQ(id)

        if (this.modelResultCache) {
          this.modelResultCache = this.modelResultCache.concat(resultsAnnotations)
        } else {
          this.modelResultCache = resultsAnnotations
        }
        this.modelResultCache.sort((a, b) => b.confidence - a.confidence)

        const msg = `Finished running model, and got ${results.length} results`
        this.$q.notify({
          message: msg,
          color: 'secondary',
          position: 'center',
          timeout: 0,
          actions: [
            { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } },
            { label: 'Review', color: 'white', handler: () => { this.showTab = 'sort' } }
          ]
        })
        // todo to finish consensus
        // if (this.consensus) {
        //   this.cmodels[id].consensusScore = {
        //     f1: response.data.f1 * 100,
        //     total: response.data.total * 100
        //   }
        // }
        this.$forceUpdate()
      }).catch(error => {
        console.log(error.response.data.error)
        this.alertServerErr()
        this.removeFromQ(id)
      })
    },
    removeFromQ (id) { // modify for sentence
      const minfo = this.tab + id
      const indx = this.modelQueue.indexOf(minfo)
      this.modelQueue.splice(indx, 1)
      Object.values(this.relevantSentences).forEach(sentIdx => {
        this.processedQ.push(minfo + sentIdx)
      })
    },
    removeAnnotation (i, cat) {
      delete this.catAnnotations[i].labels[cat]
      this.$forceUpdate()
    },
    showDetailSenAnnos (i) {
      if (this.curDetailSentence === i) {
        this.curDetailSentence = null
      } else {
        this.curDetailSentence = i
      }
    },
    hideUnRelSen () {
      this.relevantSenShow = Array(this.sentences.length).fill(false)
      // hide unRelevant sentence
      this.relevantSentences.forEach(v => {
        this.relevantSenShow[v] = true
      })
    },
    showUnRelSen () {
      this.relevantSenShow = Array(this.sentences.length).fill(true)
    },
    scrollTo (sentenceId) {
      const id = `s-${sentenceId}`
      document.getElementById(id).scrollIntoView({ block: 'center' })
    }
  },
  computed: {
    getProcessedIn () {
      return function (tabAndId) {
        for (let i = 0; i < this.relevantSentences.length; i++) {
          const minfo = tabAndId + this.relevantSentences[i]
          if (this.processedQ.indexOf(minfo) >= 0) {
            return true
          }
        }
        return false
      }
    },
    categoryNames () {
      return Object.keys(this.category)
    },
    categorizedAnnotations () {
      const results = {}
      if (this.curDetailSentence === null) {
        return results
      }
      const labels = this.catAnnotations[this.curDetailSentence].labels
      if (Object.keys(labels).length !== 0) {
        Object.keys(labels).filter(k => labels[k] !== null).forEach(k => {
          if (results[k]) {
            results[k].push(labels[k])
          } else {
            results[k] = [labels[k]]
          }
        })
      }
      return results
    },
    lLabels () {
      // convert to format like
      // { 'label name' : { ...properties}}
      const results = {}
      Object.entries(this.labels).forEach(([key, value]) => {
        results[value.category] = results[value.category] || {}
        results[value.category][value.name] = value
      })
      return results
    },
    conflicts () {
      // todo: rewrite the logic of check conflicts
      const d = {}
      this.annotations.forEach(a => {
        const k = `${JSON.stringify(a.pos)}-${a.id}`
        if (d[k]) {
          d[k].push(a)
        } else {
          d[k] = [a]
        }
      })

      const r = {}
      Object.keys(d).forEach(k => {
        if (d[k].length > 1) {
          r[k] = d[k]
        }
      })
      return r
    }
  },
  watch: {
    relevantSentences (v) {
      this.relevantAll = v.length === this.sentences.length
    },
    relevantAll (v) {
      if (v === true) {
        this.relevantSentences = [...Array(this.sentences.length).keys()].map(k => k)
      } else {
        if (this.relevantSentences.length === this.sentences.length) {
          this.relevantSentences = []
        }
      }
    }
  }
}
</script>
<style>
.sentence {
  font-size: 1.3em;
  /*font-family: "Roboto", "Lucida Grande", "DejaVu Sans", "Bitstream Vera Sans", Verdana, Arial, sans-serif;*/
  font-family: "Lato", "Trebuchet MS", Roboto, Helvetica, Arial, sans-serif;
}

.cat-labels label{
  margin-left: 5px;
  min-width: 90px;
}

.B, .I {
  /*text-decoration: underline red;*/
  /*text-decoration-style: wavy;*/
  /*border-bottom: blue solid 2px;*/
}

.B {
  /*margin-left: 3px;*/
}

.label {
  position: relative;
  margin-left: 3px;
}

.selected {
  /*border-bottom: red solid 2px;*/
  background-color: lightgray;
}

.sentence.highlight {
  background-color: lightgray;
}
.sentence.cur {
  background-color: lightskyblue;
}

::selection {
    background: none;
}

.label-window {
  position: fixed;
  margin-top: 1.8em;
  /*position: fixed;*/
  /*margin-top: -1.8em;*/
  display: inline-block;
  font-size: 1.3em;
  z-index: 100;
  visibility: visible;
  overflow-y: auto;
  /*bottom: 0;*/
}

.summary {
  /*border-left: #a6b4cd solid 1px;*/
  padding-left: 1em;
}
.summary-label {
  font-weight: bolder;
}
.summary-word {
  padding-left: 2em;
  margin-block-start: 0px;
}
.annotation-header {
  /*height: 52px;*/
}
.header-label {
  font-weight: bold;
  font-size: 1.2em;
  text-transform: uppercase;
}
.active-label {
  z-index: 99;
  background-color: white;
  padding: 2px;
}
</style>
