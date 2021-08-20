<template>
  <q-page class="" style="background-color: #f6f6f6">
    <div class="row self-start">
      <q-breadcrumbs class="justify-start">
        <q-breadcrumbs-el label="My Projects" icon="home" to="/" />
        <q-breadcrumbs-el label="Project Summary" icon="widgets" :to="`/project/${project.id}`" />
        <q-breadcrumbs-el :label="review? 'Review': consensus? 'Check Consensus': 'Sentence Annotate'" icon="navigation" />
      </q-breadcrumbs>
    </div>
    <div class="row self-start q-pt-lg">
      <div class="col-3">
        <div class="justify-end  q-pr-md row">
          <q-card class="col-8 ">
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
                <div v-for="(m,i) in project.vmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="project.vmodels.length===0">
                  No model defined for this project yet
                </div>
              </q-tab-panel>

<!--              consensus model results-->
              <q-tab-panel name="models" v-else>
                <div v-for="(m,i) in project.cmodels" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab+m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                         :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
<!--                  <q-circular-progress v-if="cmodels[m.id] && cmodels[m.id].consensusScore.total" show-value font-size="12px" :value="cmodels[m.id].consensusScore.total"-->
<!--                                       size="35px" :thickness="0.22" color="red" track-color="grey-3" class="q-ma-xs">-->
<!--                    {{ cmodels[m.id].consensusScore.total.toFixed(1) }}-->
<!--                  </q-circular-progress>-->
<!--                  <q-circular-progress v-if="cmodels[m.id] && cmodels[m.id].consensusScore.f1" show-value font-size="12px" :value="cmodels[m.id].consensusScore.f1"-->
<!--                                       size="35px" :thickness="0.22" color="teal" track-color="grey-3" class="q-ma-xs">-->
<!--                    {{ cmodels[m.id].consensusScore.f1.toFixed(1) }}-->
<!--                  </q-circular-progress>-->
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
                <div v-for="(m,i) in project.rules" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="project.rules.length===0">
                  No rule defined for this project yet
                </div>
              </q-tab-panel>

              <q-tab-panel name="dicts">
                <div v-for="(m,i) in project.dicts" :key="i" class="q-pa-sm">
                  <q-btn :loading="modelQueue.indexOf(tab + m.id)>=0" :disable="processedQ.indexOf(tab+m.id)>=0"
                    :label="m.name" class="bg-primary" text-color="white" @click="executeModel(m.id)">
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Loading...
                    </template>
                  </q-btn>
                  <q-tooltip content-class="bg-indigo" :delay="1000" :offset="[10, 10]" max-width="250px"> {{ m.note }} </q-tooltip>
                </div>
                <div v-if="project.dicts.length===0">
                  No dictionary defined for this project yet
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>

      </div>

      <div class="col-6 bg-white">
        <q-card-actions class="bg-white">
          <q-btn outline size="13px" color="primary" @click="$router.push({ name: 'annotate', params: { project: project, review: false }})" class="q-mr-xs">phrase</q-btn>
          <q-btn size="13px" color="secondary" @click="$router.push({ name: 'sentenceAnnotate', params: { project: project, review: false }}).catch(err => {})" class="q-mr-xs">sentence</q-btn>
          <q-btn outline size="13px" color="brown-5" @click="$router.push({ name: 'relationAnnotate', params: { project: project, review: false }})" class="q-mr-xs">relation</q-btn>
        </q-card-actions>
        <q-card-actions class="bg-white annotation-header">
          <q-btn v-for="(label,k) in labels" :key="k" outline size="sm" :style="`color: ${label.color}`" class="q-mr-xs" style="margin-left: 0px"> {{ label.name }}</q-btn>
        </q-card-actions>
        <q-separator />
        <q-scroll-area style="height: calc(100vh - 200px); display: flex" class="col" ref="textArea">
          <div v-if="tokens && tokens.length>0" class="select-box q-pa-sm" @keyup="key" tabindex="0"
               @focusout="selected=[]" >
            <div v-for="(token,i) in tokens" :key="i" :id="`t-${i}`" :class="token[0]==='\r\n'? 'row q-my-sm' : 'column inline'">
              <!-- each token display -->
              <span class="q-pt-xs token" :id="selected[0]===i? 'selected' : null"
                    v-on:mousedown="selectStart(i);mousePressed=true"
                    v-on:mouseup="selectEnd(i);mousePressed=false"
                    v-on:mouseover="mousePressed && select(i)"
                    style="position:relative">
<!--                <span style="white-space: pre" :class="getTokenClass(i)" v-if="!puncts[i]">&nbsp;</span>-->
                <span :class="getTokenClass(i)" >{{ token[0] }}</span>
<!--                underline -->
<!--                <span v-if="detailedAnnotations[i] && detailedAnnotations[i].length>0" style="position: relative">-->
                  <div v-for="(label,k) in detailedAnnotations[i]" :key="k" :class="`${getPosOfLabel(i,k,label).order}`"
                    :style="getPosOfLabel(i,k,label).cls">
                  </div>
<!--                </span>-->
              </span>
              <!-- dropdown menu for labels -->
              <q-card v-if="selected[0]===i" class="label-window fixed q-px-md q-py-sm" id="label-window" :style="`top: ${offsetTop}px;`">
                <div v-for="(label,k) in labels" :key="k" class="col-12" :style="`color:${label.color}`">
                  <div v-if="detailedAnnotations[i] && detailedAnnotations[i].map(a=>a[1].id).includes(label.id)"
                       @click="removeAnnotation(i, findAnnotation(i, label.id))">
                    <q-icon name="check_circle"></q-icon>
                    {{ label.name }}
                  </div>
                  <div v-else @click="annotate(label)">
                    <q-icon name="radio_button_unchecked"></q-icon>
                    {{ label.name }}
                  </div>
                </div>
              </q-card>
              <!-- display label under token -->
<!--              <span v-if="detailedAnnotations[i] && detailedAnnotations[i].length>0" style="position: absolute;" :style="`margin-top: ${2.0}em`">-->
<!--                <div v-for="(label,k) in detailedAnnotations[i]" :key="k">-->
<!--                  <div v-if="label[0]==='B'" :style="`width:${getWidth(i,k)}px;height: ${1*(k+1)}px; border-bottom: solid ${getColor(label[1])} 1px; margin-left: ${k*2}px`"></div>-->
<!--                </div>-->
<!--              </span>-->
              <span v-if="detailedAnnotations[i]" @mouseover="activeLabel=`l-${i}`" @mouseleave="activeLabel=null"
                    :class="{'active-label shadow-4': activeLabel===`l-${i}`}" class="label"
                    style="position: absolute;" :style="`margin-top: ${2.2+detailedAnnotations[i].length*0.25+prevTight(i)}em`" :id="`l-${i}`">
                <span v-for="(label,j) in detailedAnnotations[i]" :key="`label${j}`" class="label" :style="`color:${getColor(label[1])}`">
                  <span v-if="label[0]==='B'" :style="`margin-left:${j*2-4}px`">
                    <q-avatar :style="`background-color:${getColor(label[1])}`" text-color="white" size="12px" v-if="label[1].m" @click="removeAnnotation(i, label[1])">
                      m
                    </q-avatar>
                    <q-icon v-else name="check_circle" @click="removeAnnotation(i, label[1])"/> {{ label[1].name }} <br>
                  </span>
                </span>
                <q-menu anchor="top right" self="top left" v-if="review">
                  <q-list bordered separator >
                  <q-item clickable v-for="(label, j) in detailedAnnotations[i]" :key="`label${j}`" dense>
                    <q-item-section v-if="label[1].authors">
                      <span class="text-bold">{{ label[1].name }} ({{ label[1].authors.length }}) - {{ label[1].text }}</span>
                      <div class="q-px-sm">
                        <div v-for="(author, ii) in label[1].authors" :key="`author${ii}`">
                          {{author}}
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                  </q-list>
                </q-menu>
              </span>
              <span v-if="detailedAnnotations[i]" :style="`height: ${detailedAnnotations[i].filter(a=>a[0]=='B').length*18 + detailedAnnotations[i].length*4 }px` "> </span>
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
                   @click="fetchDocs({url:prevURL})" style="width: 100px"/>
            <q-btn color="accent" label="Save" class="justify-center q-ml-md" @click="saveAnnotations()" :loading="saving" style="width: 100px">
                   <template v-slot:loading>
                     Saving...
                   </template>
            </q-btn>
            <q-btn color="primary" label="Next" class="justify-center q-ml-md"
                   @click="nextURL? fetchDocs({url: nextURL}): $router.push('/')" style="width: 100px"/>
          </q-card-actions>
      </div>

      <div class="col-2 summary q-mb-none">
        <q-card>
          <q-card-actions class="bg-accent annotation-header justify-between" :style="'color: white; font-weight: bold; font-size: 1.2em'">
            <q-btn label="ANNOTATIONS" flat @click="showTab='annotations'" :class="{'bg-purple-5': showTab=='annotations'}">
              <q-badge color="info" floating> {{annotations.length}}</q-badge>
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
            <q-list bordered class="bg-white" v-if="tokens && showTab==='annotations'">
              <q-expansion-item v-for="(label, i) in Object.entries(categorizedAnnotations)" :key="i"
                                expand-separator :header-style="`color: ${(lLabels[label[0]]|lLabels[null]).color}`" header-class="header-label"
                                :label="`${label[0]} (${label[1].length})`">
                <div class="summary-word q-pb-sm">
                  <li v-for="(w, j) in label[1].sort((a,b)=>a.pos[0]-b.pos[0])" :key="j" style="list-style: circle">
                    <span>
                      <q-avatar v-if="w.m" color="red" size="12px" text-color="white" @click="removeAnnotation(w.tpos[0], w)"> m </q-avatar>
                      <span @click="scrollTo(w)">{{w.pos}} - {{w.text}}</span>
                    </span>
                  </li>
                </div>
              </q-expansion-item>
            </q-list>
<!--            model results review -->
            <q-list class="q-pa-sm" v-if="tokens && modelResultCache && showTab==='sort'">
              <div v-for="(label, i) in modelResultCache" :key="i">
                <q-avatar color="red" size="12px" text-color="white" @click="removeAnnotation(label.tpos[0], label); removeFromModelCache(label.tpos[0], label)"> m </q-avatar>
                <span @click="scrollTo(label)">
                  <span v-if="label.confidence">({{ label.confidence.toFixed(2) }})</span> {{label.pos}} - {{label.text}}
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
                      <q-avatar v-if="w.m" color="red" size="12px" text-color="white" @click="removeAnnotation(w.tpos[0], w)"> m </q-avatar>
                      <q-avatar v-else size="12px"></q-avatar>
                      <span @click="scrollTo(w)">{{w.pos}} - {{w.text}} 【{{w.name}}】</span>
                    </span>
                  </div>
                </div>
              </q-item>
            </q-list>
<!--            list of annotators-->
            <q-list bordered separator class="bg-white" v-if="tokens && showTab==='annotators'">
              <q-item v-for="(anns, author, i) in annotations4Review" :key="i" clickable v-ripple class="q-pr-xs"
                      :active="activeAuthors.includes(author)" active-class="bg-teal-1 text-grey-8">
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

export default {
  name: 'SentenceAnnotate',
  mixins: [commAnnoMixin],
  data () {
    return {
      sentences: null,
      model: 'sentence'
    }
  },
  mounted () {},
  methods: {
    // fetchLabels () {
    //   const url = this.$hostname + '/api/labels/'
    //   this.$axios.get(url).then(response => {
    //     response.data.forEach(a => {
    //       this.labels[a.id] = a
    //     })
    //     this.doneFetchLabels = true
    //   })
    // },
    selectStart (i) {
      // if the token is already annotated
      // for (let k = 0; k < this.annotations.length; k++) {
      //   const start = this.annotations[k][0]
      //   const end = this.annotations[k][1]
      //   if (i <= end && i >= start) {
      //     this.start = start
      //     this.end = end
      //     this.selected = [...Array(end - start + 1).keys()].map(i => i + start)
      //     return 0
      //   }
      // }
      // if not annotated, then it will be the start
      this.start = this.tokens[i][3][1]
      const min = this.tokens[i][3][1]
      const max = this.tokens[i][3][3]
      this.selected = this.selected = [...Array(max - min + 1).keys()].map(k => k + min)
      // find the sentence contains current token
      // console.log()
      // console.log('..start', new Date())
    },
    selectEnd (i) {
      this.end = this.tokens[i][3][3]
      if (this.end < this.start) {
        this.end = this.tokens[this.start][3][3]
        this.start = this.tokens[i][3][1]
      }
      // console.log('..end', new Date())
    },
    select (i) {
      const min = Math.min(i, this.tokens[i][3][1], this.start)
      const max = Math.max(i, this.tokens[i][3][3], this.start, this.tokens[this.start][3][3])
      this.selected = [...Array(max - min + 1).keys()].map(k => k + min)
      // this.selected.includes(i) ? this.selected.pop() : this.selected.push(i)
      // console.log('..select', new Date())
    },
    fetchDocs (params) {
      this.tokens = []
      this.$q.loading.show({ message: 'Fetching documet from server and set it up for curation. This may take a few seconds.' })

      let url
      if (!params.url) {
        url = `/api/documents/?project=${this.project.id}&review=${this.review}&consensus=${this.consensus}&model=${this.model}`
        if (params.page) {
          url += `&page=${params.page}`
        }
      } else {
        const n = params.url.split('/').length
        url = '/' + params.url.split('/').splice(n - 3, n).join('/')
        // console.log('hostname', this.$hostname)
        // console.log('next url', url)
      }
      this.$axios.get(url).then(response => {
        // console.log('use host', this.$hostname)
        this.documents = response.data.results
        this.nextURL = response.data.next
        this.prevURL = response.data.previous
        this.document = this.documents[0]
        this.annotations = this.document.annotations.id ? this.document.annotations.annotations : []
        if (this.review) {
          this.annotations4Review = this.document.reviews
          this.annotations = this.mergeAnnotations()
        }
        if (this.consensus) {
          this.document.gold.annotations.forEach(ann => {
            ann.id = this.lLabels[ann.name] ? this.lLabels[ann.name].id : null // returned label may not included in project labels
          })
          this.annotations = this.document.gold.annotations
        }
        this.isAnnotated = this.document.annotations.id
        this.tokens = this.document.tokens
        this.sentences = this.document.sentences
        // extend index for token and sentence
        const tokenLen = this.tokens.length
        const sentLen = this.sentences.length
        for (let i = 0; i < sentLen; i++) {
          const curSent = this.sentences[i]
          const nextSent = (i < sentLen - 1) ? this.sentences[i + 1] : null
          for (let j = curSent[1]; j < tokenLen; j++) {
            if (nextSent != null && nextSent[1] === j) {
              curSent[3] = j - 1
              break
            }
            if (nextSent == null) {
              curSent[3] = tokenLen - 1
            }
            this.tokens[j][3] = curSent
          }
        }
        // this.tokens = this.document.text.split(' ')
        // this.tokens = []
        // this.document.text.split('\n').forEach(s => {
        //   this.tokens.push(...s.split(' '))
        //   this.tokens.push('\n')
        // })
        this.getDetailedAnnotations()
        this.highlighted = []
        this.processedQ = []
        this.modelQueue = []
        if (this.consensus) {
          this.project.cmodels.forEach(m => {
            this.cmodels[m.id].consensusScore.f1 = null
          })
        }
        this.$q.loading.hide()
      })
      // const textArea = ref(null)
      this.modelResultCache = null
      this.$refs.textArea.setScrollPosition('vertical', 0)
    }
  }
}
</script>
<style>
.token {
  font-size: 1.3em;
  /*font-family: "Roboto", "Lucida Grande", "DejaVu Sans", "Bitstream Vera Sans", Verdana, Arial, sans-serif;*/
  font-family: "Lato", "Trebuchet MS", Roboto, Helvetica, Arial, sans-serif;
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

.highlight {
  background-color: red;
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
